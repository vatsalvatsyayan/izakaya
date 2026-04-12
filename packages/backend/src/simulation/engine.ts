import type {
  SimulationState,
  ChangeLogEntry,
  Alert,
  Recommendation,
  CommitActionRequest,
  CommitActionResponse,
  EndUserImpact,
  ScenarioProgress,
} from '@izakaya/shared';
import {
  TICK_INTERVAL_MS,
  SIMULATED_SECONDS_PER_TICK,
  BASE_TIME,
  LEVER_DEFINITIONS,
} from '@izakaya/shared';
import { v4 as uuid } from 'uuid';

import { createSeedState } from './seed';
import { applyEnvironmentalDrift } from './drift';
import { propagateLayerDependencies } from './dependencies';
import { evaluateAlerts } from './alerts';
import { evaluateRecommendations } from './recommendations';
import {
  SCENARIO_DEFINITIONS,
  activateScenario,
  applyScenarioEvents,
  deactivateScenario,
  isScenarioComplete,
} from './scenarios';

export class SimulationEngine {
  private state: SimulationState;
  private changeLog: ChangeLogEntry[] = [];
  private alertHistory: Alert[] = [];
  private recommendationHistory: Recommendation[] = [];
  private savedState: SimulationState | null = null;
  private scenarioStartTick: number | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private broadcastFn: ((event: string, data: unknown) => void) | null = null;
  private pendingOutcomeChecks: Array<{
    entryId: string;
    checkAtTick: number;
    metricsAtCommit: Record<string, number>;
  }> = [];

  constructor() {
    this.state = createSeedState();
  }

  start(broadcastFn: (event: string, data: unknown) => void): void {
    this.broadcastFn = broadcastFn;
    this.intervalId = setInterval(() => this.tick(), TICK_INTERVAL_MS);
    console.log(`Simulation engine started (tick every ${TICK_INTERVAL_MS}ms)`);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick(): void {
    // 1. Increment tick and advance time
    this.state.tick++;
    this.state.simulatedTimeSeconds += SIMULATED_SECONDS_PER_TICK;
    const baseMs = new Date(BASE_TIME).getTime();
    this.state.timestamp = new Date(baseMs + this.state.simulatedTimeSeconds * 1000).toISOString();

    // 2. Apply environmental drift
    applyEnvironmentalDrift(this.state);

    // 3. Apply scenario events if active
    if (this.state.activeScenario && this.scenarioStartTick !== null) {
      applyScenarioEvents(this.state, this.scenarioStartTick);

      // Check if scenario complete
      if (isScenarioComplete(this.state, this.scenarioStartTick)) {
        this.deactivateScenario();
      }
    }

    // 4. Propagate layer dependencies
    propagateLayerDependencies(this.state);

    // 5. Derived metrics are updated inside propagateLayerDependencies

    // 6. Update cumulative derived metrics
    const hoursPerTick = SIMULATED_SECONDS_PER_TICK / 3600;
    this.state.derivedMetrics.totalCarbonEmittedKg +=
      this.state.derivedMetrics.carbonOutputKgPerHr * hoursPerTick;
    this.state.derivedMetrics.totalWaterConsumedLiters +=
      this.state.layers.cooling.waterUsageRate * hoursPerTick;

    // 7. Evaluate alerts
    const broadcast = this.broadcastFn || (() => {});
    evaluateAlerts(this.state, this.alertHistory, broadcast);

    // 8. Evaluate recommendations
    evaluateRecommendations(this.state, this.recommendationHistory, broadcast);

    // 9. Check pending outcome checks
    this.processPendingOutcomeChecks();

    // 10. Broadcast state update
    broadcast('state:update', this.state);

    // 11. Broadcast scenario progress if active
    if (this.state.activeScenario && this.scenarioStartTick !== null) {
      const scenario = SCENARIO_DEFINITIONS.find(s => s.id === this.state.activeScenario);
      if (scenario) {
        const progress: ScenarioProgress = {
          scenarioId: this.state.activeScenario,
          ticksElapsed: this.state.tick - this.scenarioStartTick,
          totalTicks: scenario.totalDurationTicks,
          phase: 'running',
        };
        broadcast('scenario:progress', progress);
      }
    }
  }

  getState(): SimulationState {
    return this.state;
  }

  getChangeLog(): ChangeLogEntry[] {
    return this.changeLog;
  }

  getAlertHistory(): Alert[] {
    return this.alertHistory;
  }

  getRecommendationHistory(): Recommendation[] {
    return this.recommendationHistory;
  }

  commitAction(request: CommitActionRequest): CommitActionResponse {
    // Apply lever change
    this.applyLeverChange(request.layerId, request.leverId, request.newValue);

    // Capture metrics at commit
    const metricsAtCommit = this.captureKeyMetrics();

    // Create change log entry
    const entryId = uuid();
    const entry: ChangeLogEntry = {
      id: entryId,
      timestamp: this.state.timestamp,
      operatorAction: `Adjusted ${request.leverId} from ${request.previousValue} to ${request.newValue}`,
      layerId: request.layerId,
      leverId: request.leverId,
      previousValue: request.previousValue,
      newValue: request.newValue,
      tradeoffAcknowledgment: {
        tradeoffText: request.tradeoffAcknowledgment.tradeoffText,
        communityImpactText: request.tradeoffAcknowledgment.communityImpactText,
        endUserImpactText: request.tradeoffAcknowledgment.endUserImpactText,
        acknowledgedAt: new Date().toISOString(),
      },
      outcomeAtCommit: { metrics: metricsAtCommit },
      outcomeAfterFiveMinutes: null,
      endUserImpactActual: this.computeEndUserImpact(),
    };

    this.changeLog.push(entry);

    // Schedule 5-minute follow-up (5 simulated minutes = 1 tick at 300s/tick)
    this.pendingOutcomeChecks.push({
      entryId,
      checkAtTick: this.state.tick + 1,
      metricsAtCommit,
    });

    // Broadcast
    if (this.broadcastFn) {
      this.broadcastFn('action:confirmed', { changeLogEntryId: entryId, success: true });
    }

    return {
      success: true,
      changeLogEntryId: entryId,
      projectedImpact: {
        metricChanges: this.projectImpact(request),
      },
    };
  }

  activateScenarioById(scenarioId: string, mode: 'live' | 'simulation'): void {
    if (mode === 'simulation') {
      this.savedState = JSON.parse(JSON.stringify(this.state));
    }
    activateScenario(this.state, scenarioId, mode);
    this.scenarioStartTick = this.state.tick;
  }

  deactivateScenario(): void {
    if (this.savedState && this.state.mode === 'simulation') {
      // Restore original state but keep tick/time advancing
      const currentTick = this.state.tick;
      const currentTime = this.state.simulatedTimeSeconds;
      const currentTimestamp = this.state.timestamp;
      this.state = this.savedState;
      this.state.tick = currentTick;
      this.state.simulatedTimeSeconds = currentTime;
      this.state.timestamp = currentTimestamp;
      this.savedState = null;
    }

    // Broadcast scenario complete before deactivating
    if (this.broadcastFn && this.state.activeScenario && this.scenarioStartTick !== null) {
      const scenario = SCENARIO_DEFINITIONS.find(s => s.id === this.state.activeScenario);
      if (scenario) {
        this.broadcastFn('scenario:progress', {
          scenarioId: this.state.activeScenario,
          ticksElapsed: scenario.totalDurationTicks,
          totalTicks: scenario.totalDurationTicks,
          phase: 'complete',
        } as ScenarioProgress);
      }
    }

    deactivateScenario(this.state);
    this.scenarioStartTick = null;
  }

  dismissRecommendation(id: string): boolean {
    const rec = this.state.activeRecommendations.find(r => r.id === id);
    if (!rec) return false;
    if (rec.status !== 'active') return false;
    rec.status = 'dismissed';
    rec.dismissedAt = new Date().toISOString();
    return true;
  }

  private applyLeverChange(layerId: string, leverId: string, newValue: number): void {
    const layer = this.state.layers[layerId as keyof typeof this.state.layers];
    if (!layer || !('levers' in layer)) return;

    const levers = layer.levers as Record<string, unknown>;

    // Handle boolean levers
    if (leverId === 'renewablePriorityMode' || leverId === 'waterRecirculationMode') {
      levers[leverId] = newValue === 1;
    } else if (leverId === 'gracefulRackShutdown') {
      // This is handled as an array — for simplicity, toggle a specific rack
      // The newValue represents a rack index to toggle (0-9)
      const arr = levers[leverId] as boolean[];
      if (Array.isArray(arr) && newValue >= 0 && newValue <= 9) {
        arr[newValue] = !arr[newValue];
      }
    } else {
      levers[leverId] = newValue;
    }
  }

  private captureKeyMetrics(): Record<string, number> {
    return {
      pue: this.state.derivedMetrics.pue,
      wue: this.state.derivedMetrics.wue,
      cue: this.state.derivedMetrics.cue,
      averageGpuTemperature: this.state.layers.gpu.averageGpuTemperature,
      averageInferenceLatency: this.state.layers.workload.averageInferenceLatency,
      totalFacilityPower: this.state.layers.power.totalFacilityPower,
      waterUsageRate: this.state.layers.cooling.waterUsageRate,
      requestDropRate: this.state.layers.workload.requestDropRate,
    };
  }

  private computeEndUserImpact(): EndUserImpact {
    const w = this.state.layers.workload;
    const priorityWeight = w.levers.priorityQueueWeight;
    const premiumLatency = w.averageInferenceLatency * (1 - priorityWeight * 0.3);
    const freeLatency = w.averageInferenceLatency * (1 + priorityWeight * 0.5);

    return {
      latencyChangeMs: 0,
      throughputChangeReqHr: 0,
      requestsAffectedPerHour: Math.round(w.requestVolume * w.requestDropRate),
      affectedSegments: {
        premium: { latencyMs: Math.round(premiumLatency), dropRate: Math.max(0, w.requestDropRate * (1 - priorityWeight)) },
        free: { latencyMs: Math.round(freeLatency), dropRate: w.requestDropRate * (1 + priorityWeight) },
      },
      qualityOfServiceDescription: w.requestDropRate > 0.01
        ? 'Service degraded. Some users experiencing dropped requests.'
        : 'All users within SLA.',
    };
  }

  private projectImpact(request: CommitActionRequest): Array<{ metric: string; projectedValue: number }> {
    const leverDef = LEVER_DEFINITIONS.find(l => l.id === request.leverId);
    if (!leverDef) return [];

    return leverDef.effectMap.map(effect => {
      const currentMetricValue = this.getMetricValue(effect.targetMetric);
      let projected: number;
      const delta = request.newValue - request.previousValue;

      if (effect.relationship === 'proportional') {
        projected = currentMetricValue + delta * effect.magnitude;
      } else if (effect.relationship === 'inverse') {
        projected = currentMetricValue - delta * effect.magnitude;
      } else {
        projected = currentMetricValue;
      }

      return { metric: effect.targetMetric, projectedValue: Math.round(projected * 100) / 100 };
    });
  }

  private getMetricValue(metricId: string): number {
    const s = this.state;
    const lookup: Record<string, number> = {
      totalFacilityPower: s.layers.power.totalFacilityPower,
      itEquipmentPower: s.layers.power.itEquipmentPower,
      coolingPower: s.layers.power.coolingPower,
      pue: s.derivedMetrics.pue,
      waterUsageRate: s.layers.cooling.waterUsageRate,
      averageGpuTemperature: s.layers.gpu.averageGpuTemperature,
      gpuUtilizationRate: s.layers.gpu.gpuUtilizationRate,
      activeGpuCount: s.layers.gpu.activeGpuCount,
      gpuIdlePowerWaste: s.layers.gpu.gpuIdlePowerWaste,
      gpuPowerLimit: s.layers.gpu.levers.gpuPowerLimit,
      averageInferenceLatency: s.layers.workload.averageInferenceLatency,
      requestDropRate: s.layers.workload.requestDropRate,
      queueDepth: s.layers.workload.queueDepth,
      batchEfficiency: s.layers.workload.batchEfficiency,
      carbonOutputKgPerHr: s.derivedMetrics.carbonOutputKgPerHr,
      premiumLatency: s.layers.workload.averageInferenceLatency * 0.8,
      freeLatency: s.layers.workload.averageInferenceLatency * 1.3,
    };
    return lookup[metricId] ?? 0;
  }

  private processPendingOutcomeChecks(): void {
    const due = this.pendingOutcomeChecks.filter(c => this.state.tick >= c.checkAtTick);
    for (const check of due) {
      const entry = this.changeLog.find(e => e.id === check.entryId);
      if (entry && !entry.outcomeAfterFiveMinutes) {
        const currentMetrics = this.captureKeyMetrics();
        let accuracy: 'matched' | 'worse' | 'better' = 'matched';

        // Compare PUE as a representative metric
        const pueBefore = check.metricsAtCommit.pue;
        const pueAfter = currentMetrics.pue;
        if (pueAfter < pueBefore - 0.05) accuracy = 'better';
        else if (pueAfter > pueBefore + 0.05) accuracy = 'worse';

        entry.outcomeAfterFiveMinutes = {
          metrics: currentMetrics,
          projectionAccuracy: accuracy,
        };
      }
    }
    this.pendingOutcomeChecks = this.pendingOutcomeChecks.filter(
      c => this.state.tick < c.checkAtTick,
    );
  }
}
