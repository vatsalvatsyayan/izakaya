import type { SimulationState, Recommendation } from '@izakaya/shared';
import { RECOMMENDATION_TEMPLATES, RECOMMENDATION_CONFIDENCE_NOTE } from '@izakaya/shared';
import { v4 as uuid } from 'uuid';

// Track consecutive ticks each condition has been true
const conditionCounters: Record<string, number> = {};

interface ConditionEval {
  templateId: string;
  check: (state: SimulationState) => boolean;
  buildRecommendation: (state: SimulationState) => Partial<Recommendation>;
}

const CONDITIONS: ConditionEval[] = [
  {
    templateId: 'rec-pue-warning',
    check: s => s.derivedMetrics.pue > 1.3,
    buildRecommendation: s => ({
      severity: 'warning',
      layerAffected: 'power',
      triggerCondition: 'PUE > 1.3 for 5+ ticks',
      title: 'Elevated PUE Detected',
      body: `PUE has remained above 1.3 for the past ${conditionCounters['rec-pue-warning']} ticks. Consider reducing GPU power limits by 100W to decrease total facility power draw. Projected PUE improvement: ${(s.derivedMetrics.pue - 1.2).toFixed(2)}. Note: This will reduce maximum inference throughput by approximately 15%.`,
      suggestedAction: { lever: 'gpuPowerLimit', suggestedValue: 500, currentValue: s.layers.gpu.levers.gpuPowerLimit },
      projectedImpact: {
        metricChanges: [
          { metric: 'pue', currentValue: s.derivedMetrics.pue, projectedValue: 1.2, unit: 'ratio' },
          { metric: 'itEquipmentPower', currentValue: s.layers.power.itEquipmentPower, projectedValue: s.layers.power.itEquipmentPower * 0.85, unit: 'kW' },
        ],
        endUserImpact: 'Throughput may decrease by ~15%. Latency may increase by ~10ms.',
        communityImpact: 'Lower power draw reduces carbon emissions and grid strain.',
      },
    }),
  },
  {
    templateId: 'rec-pue-critical',
    check: s => s.derivedMetrics.pue > 1.5,
    buildRecommendation: s => ({
      severity: 'critical',
      layerAffected: 'power',
      triggerCondition: 'PUE > 1.5 for 3+ ticks',
      title: 'Critical PUE — Immediate Action Recommended',
      body: `PUE has exceeded 1.5, indicating significant energy waste. Recommend immediately enabling Renewable Priority Mode and reducing Power Cap to 800kW. Without intervention, carbon output will exceed ${Math.round(s.derivedMetrics.carbonOutputKgPerHr)} kgCO2/hr.`,
      suggestedAction: { lever: 'powerCap', suggestedValue: 800, currentValue: s.layers.power.levers.powerCap },
      projectedImpact: {
        metricChanges: [
          { metric: 'pue', currentValue: s.derivedMetrics.pue, projectedValue: 1.3, unit: 'ratio' },
          { metric: 'carbonOutputKgPerHr', currentValue: s.derivedMetrics.carbonOutputKgPerHr, projectedValue: s.derivedMetrics.carbonOutputKgPerHr * 0.65, unit: 'kgCO2/hr' },
        ],
        endUserImpact: 'Significant throughput reduction. Some requests may be deferred.',
        communityImpact: 'Substantial reduction in carbon emissions.',
      },
    }),
  },
  {
    templateId: 'rec-wue-warning',
    check: s => s.derivedMetrics.wue > 1.0,
    buildRecommendation: s => ({
      severity: 'warning',
      layerAffected: 'cooling',
      triggerCondition: 'WUE > 1.0 for 5+ ticks',
      title: 'Water Efficiency Below Target',
      body: `WUE has exceeded 1.0 L/kWh. Consider raising the cooling setpoint by 3°C or enabling Water Recirculation Mode. Projected water savings: ${Math.round(s.layers.cooling.waterUsageRate * 0.3)} liters/hr. GPU temperatures may increase by approximately 2°C.`,
      suggestedAction: { lever: 'waterRecirculationMode', suggestedValue: 1, currentValue: s.layers.cooling.levers.waterRecirculationMode ? 1 : 0 },
      projectedImpact: {
        metricChanges: [
          { metric: 'wue', currentValue: s.derivedMetrics.wue, projectedValue: s.derivedMetrics.wue * 0.7, unit: 'L/kWh' },
          { metric: 'waterUsageRate', currentValue: s.layers.cooling.waterUsageRate, projectedValue: s.layers.cooling.waterUsageRate * 0.7, unit: 'L/hr' },
          { metric: 'averageGpuTemperature', currentValue: s.layers.gpu.averageGpuTemperature, projectedValue: s.layers.gpu.averageGpuTemperature + 2, unit: '°C' },
        ],
        endUserImpact: 'Minimal. GPU temperature increase of ~2°C is within healthy range.',
        communityImpact: `${s.layers.location.communityName} water stress is ${s.layers.location.waterStressIndex.toFixed(2)}. Enabling recirculation reduces facility water draw.`,
      },
    }),
  },
  {
    templateId: 'rec-wue-critical',
    check: s => s.derivedMetrics.wue > 1.8,
    buildRecommendation: s => ({
      severity: 'critical',
      layerAffected: 'cooling',
      triggerCondition: 'WUE > 1.8 for 3+ ticks',
      title: 'Critical Water Usage',
      body: `Water usage is critically high at ${s.derivedMetrics.wue.toFixed(1)} L/kWh. Immediate intervention required. Recommend enabling Water Recirculation Mode and raising cooling setpoint to 26°C. The local community water stress index is ${s.layers.location.waterStressIndex.toFixed(2)} — continued high usage increases community burden.`,
      suggestedAction: { lever: 'coolingSetpoint', suggestedValue: 26, currentValue: s.layers.cooling.levers.coolingSetpoint },
      projectedImpact: {
        metricChanges: [
          { metric: 'wue', currentValue: s.derivedMetrics.wue, projectedValue: 1.0, unit: 'L/kWh' },
          { metric: 'waterUsageRate', currentValue: s.layers.cooling.waterUsageRate, projectedValue: s.layers.cooling.waterUsageRate * 0.5, unit: 'L/hr' },
        ],
        endUserImpact: 'GPU temperatures will increase, potentially adding 5-10ms latency.',
        communityImpact: `Critical water conservation needed for ${s.layers.location.communityName}.`,
      },
    }),
  },
  {
    templateId: 'rec-gpu-temp-warning',
    check: s => s.layers.gpu.averageGpuTemperature > 78,
    buildRecommendation: s => ({
      severity: 'warning',
      layerAffected: 'gpu',
      triggerCondition: 'Avg GPU Temp > 78°C for 5+ ticks',
      title: 'GPU Fleet Running Hot',
      body: `Average GPU temperature has exceeded 78°C. Consider lowering the thermal throttle threshold to 78°C or increasing fan speed to 85%. Extended high temperatures increase hardware failure probability by approximately 25%.`,
      suggestedAction: { lever: 'fanSpeedOverride', suggestedValue: 0.85, currentValue: s.layers.cooling.levers.fanSpeedOverride },
      projectedImpact: {
        metricChanges: [
          { metric: 'averageGpuTemperature', currentValue: s.layers.gpu.averageGpuTemperature, projectedValue: s.layers.gpu.averageGpuTemperature - 5, unit: '°C' },
          { metric: 'coolingPower', currentValue: s.layers.power.coolingPower, projectedValue: s.layers.power.coolingPower * 1.2, unit: 'kW' },
        ],
        endUserImpact: 'Reduced risk of thermal throttling. Latency stabilized.',
        communityImpact: 'Increased cooling power slightly raises energy consumption.',
      },
    }),
  },
  {
    templateId: 'rec-gpu-temp-critical',
    check: s => s.layers.gpu.averageGpuTemperature > 83,
    buildRecommendation: s => ({
      severity: 'critical',
      layerAffected: 'gpu',
      triggerCondition: 'Avg GPU Temp > 83°C for 2+ ticks',
      title: 'Critical GPU Temperatures — Throttling Imminent',
      body: `GPUs are approaching thermal shutdown thresholds. Recommend immediately reducing GPU power limits to 400W and lowering cooling setpoint to 18°C. Failure to act may result in hardware damage and service degradation.`,
      suggestedAction: { lever: 'gpuPowerLimit', suggestedValue: 400, currentValue: s.layers.gpu.levers.gpuPowerLimit },
      projectedImpact: {
        metricChanges: [
          { metric: 'averageGpuTemperature', currentValue: s.layers.gpu.averageGpuTemperature, projectedValue: 72, unit: '°C' },
          { metric: 'averageInferenceLatency', currentValue: s.layers.workload.averageInferenceLatency, projectedValue: s.layers.workload.averageInferenceLatency * 1.3, unit: 'ms' },
        ],
        endUserImpact: 'Significant latency increase and reduced throughput.',
        communityImpact: 'Lower GPU power reduces overall facility power and emissions.',
      },
    }),
  },
  {
    templateId: 'rec-gpu-util-low',
    check: s => s.layers.gpu.gpuUtilizationRate < 0.5,
    buildRecommendation: s => {
      const racksToShutdown = Math.ceil((1 - s.layers.gpu.gpuUtilizationRate) * 10 * 0.5);
      const powerSaved = racksToShutdown * 24 * s.layers.gpu.levers.gpuPowerLimit * 0.1 / 1000;
      return {
        severity: 'info',
        layerAffected: 'gpu',
        triggerCondition: 'GPU Utilization < 50% for 10+ ticks',
        title: 'Low GPU Utilization — Consolidation Opportunity',
        body: `GPU utilization has been below 50% for an extended period. Consider gracefully shutting down ${racksToShutdown} underutilized racks to reduce idle power waste by approximately ${Math.round(powerSaved)}kW. This would save ${Math.round(powerSaved * s.layers.location.gridCarbonIntensity / 1000)} kgCO2/hr at current grid carbon intensity.`,
        suggestedAction: { lever: 'gracefulRackShutdown', suggestedValue: 1, currentValue: 0 },
        projectedImpact: {
          metricChanges: [
            { metric: 'gpuIdlePowerWaste', currentValue: s.layers.gpu.gpuIdlePowerWaste, projectedValue: s.layers.gpu.gpuIdlePowerWaste * 0.5, unit: 'kW' },
          ],
          endUserImpact: 'No impact if current utilization is maintained with fewer GPUs.',
          communityImpact: `Reduces power consumption and associated carbon emissions.`,
        },
      };
    },
  },
  {
    templateId: 'rec-drop-rate-warning',
    check: s => s.layers.workload.requestDropRate > 0.005,
    buildRecommendation: s => ({
      severity: 'warning',
      layerAffected: 'workload',
      triggerCondition: 'Request Drop Rate > 0.5%',
      title: 'Requests Being Dropped',
      body: `The request drop rate has exceeded 0.5%. Consider increasing the Request Rate Limit to ${Math.min(16000, s.layers.workload.levers.requestRateLimit + 2000)} req/hr or reducing Batch Size to ${Math.max(1, s.layers.workload.levers.batchSize - 8)} to improve throughput. Approximately ${Math.round(s.layers.workload.requestVolume * s.layers.workload.requestDropRate)} end-user requests are being lost per hour.`,
      suggestedAction: { lever: 'requestRateLimit', suggestedValue: Math.min(16000, s.layers.workload.levers.requestRateLimit + 2000), currentValue: s.layers.workload.levers.requestRateLimit },
      projectedImpact: {
        metricChanges: [
          { metric: 'requestDropRate', currentValue: s.layers.workload.requestDropRate, projectedValue: 0, unit: '%' },
        ],
        endUserImpact: `${Math.round(s.layers.workload.requestVolume * s.layers.workload.requestDropRate)} requests/hr currently being lost.`,
        communityImpact: 'No direct community impact.',
      },
    }),
  },
  {
    templateId: 'rec-drop-rate-critical',
    check: s => s.layers.workload.requestDropRate > 0.02,
    buildRecommendation: s => ({
      severity: 'critical',
      layerAffected: 'workload',
      triggerCondition: 'Request Drop Rate > 2%',
      title: 'Significant Service Degradation',
      body: `More than 2% of requests are being dropped. Immediate action needed: ensure all GPU racks are online, reduce batch size, and verify cooling is maintaining safe GPU temperatures. ${Math.round(s.layers.workload.requestVolume * s.layers.workload.requestDropRate)} end users are currently unable to access services.`,
      suggestedAction: { lever: 'batchSize', suggestedValue: Math.max(1, s.layers.workload.levers.batchSize - 8), currentValue: s.layers.workload.levers.batchSize },
      projectedImpact: {
        metricChanges: [
          { metric: 'requestDropRate', currentValue: s.layers.workload.requestDropRate, projectedValue: 0.005, unit: '%' },
        ],
        endUserImpact: 'Critical. Many users unable to access services.',
        communityImpact: 'Service degradation affects community reliance on AI services.',
      },
    }),
  },
  {
    templateId: 'rec-carbon-warning',
    check: s => s.layers.location.gridCarbonIntensity > 400,
    buildRecommendation: s => ({
      severity: 'warning',
      layerAffected: 'power',
      triggerCondition: 'Grid Carbon Intensity > 400 for 3+ ticks',
      title: 'High Grid Carbon Intensity',
      body: `Grid carbon intensity has exceeded 400 gCO2/kWh. Consider enabling Renewable Priority Mode and deferring non-critical batch workloads. Current carbon output: ${Math.round(s.derivedMetrics.carbonOutputKgPerHr)} kgCO2/hr. Shifting 20% of workload to off-peak hours could reduce emissions by ${Math.round(s.derivedMetrics.carbonOutputKgPerHr * 0.2)} kgCO2.`,
      suggestedAction: { lever: 'renewablePriorityMode', suggestedValue: 1, currentValue: s.layers.power.levers.renewablePriorityMode ? 1 : 0 },
      projectedImpact: {
        metricChanges: [
          { metric: 'carbonOutputKgPerHr', currentValue: s.derivedMetrics.carbonOutputKgPerHr, projectedValue: s.derivedMetrics.carbonOutputKgPerHr * 0.8, unit: 'kgCO2/hr' },
        ],
        endUserImpact: 'Batch workloads deferred. Real-time inference unaffected.',
        communityImpact: 'Significant carbon emission reduction benefits the local environment.',
      },
    }),
  },
];

export function evaluateRecommendations(
  state: SimulationState,
  recHistory: Recommendation[],
  broadcast: (event: string, data: unknown) => void,
): void {
  const now = state.timestamp;

  for (const cond of CONDITIONS) {
    const template = RECOMMENDATION_TEMPLATES.find(t => t.id === cond.templateId);
    if (!template) continue;

    const conditionMet = cond.check(state);

    if (conditionMet) {
      conditionCounters[cond.templateId] = (conditionCounters[cond.templateId] || 0) + 1;
    } else {
      conditionCounters[cond.templateId] = 0;
    }

    const tickThreshold = template.tickThreshold;
    const existingIdx = state.activeRecommendations.findIndex(
      r => r.triggerCondition === cond.buildRecommendation(state).triggerCondition && r.status === 'active',
    );
    const existing = existingIdx >= 0 ? state.activeRecommendations[existingIdx] : null;

    if (conditionMet && conditionCounters[cond.templateId] >= tickThreshold && !existing) {
      // Check if already dismissed or acted_on in history
      const partial = cond.buildRecommendation(state);
      const rec: Recommendation = {
        id: uuid(),
        timestamp: now,
        severity: partial.severity || 'info',
        layerAffected: partial.layerAffected || '',
        triggerCondition: partial.triggerCondition || '',
        title: partial.title || '',
        body: partial.body || '',
        suggestedAction: partial.suggestedAction || { lever: '', suggestedValue: 0, currentValue: 0 },
        projectedImpact: partial.projectedImpact || { metricChanges: [], endUserImpact: '', communityImpact: '' },
        status: 'active',
        dismissedAt: null,
        actedOnAt: null,
        resolvedAt: null,
        confidenceNote: RECOMMENDATION_CONFIDENCE_NOTE,
      };
      state.activeRecommendations.push(rec);
      recHistory.push(rec);
      broadcast('recommendation:new', rec);
    } else if (!conditionMet && existing) {
      // Auto-resolve
      existing.status = 'resolved';
      existing.resolvedAt = now;
    }
  }

  // Check for acted_on: if lever was changed to match suggestion within 20%
  for (const rec of state.activeRecommendations) {
    if (rec.status !== 'active') continue;
    const lever = rec.suggestedAction.lever;
    const suggested = rec.suggestedAction.suggestedValue;
    const currentLeverValue = getLeverValue(state, lever);
    if (currentLeverValue !== null && currentLeverValue !== rec.suggestedAction.currentValue) {
      const tolerance = Math.abs(suggested) * 0.2;
      if (Math.abs(currentLeverValue - suggested) <= tolerance) {
        rec.status = 'acted_on';
        rec.actedOnAt = now;
      }
    }
  }
}

function getLeverValue(state: SimulationState, leverId: string): number | null {
  switch (leverId) {
    case 'powerCap': return state.layers.power.levers.powerCap;
    case 'renewablePriorityMode': return state.layers.power.levers.renewablePriorityMode ? 1 : 0;
    case 'coolingSetpoint': return state.layers.cooling.levers.coolingSetpoint;
    case 'fanSpeedOverride': return state.layers.cooling.levers.fanSpeedOverride;
    case 'waterRecirculationMode': return state.layers.cooling.levers.waterRecirculationMode ? 1 : 0;
    case 'gpuPowerLimit': return state.layers.gpu.levers.gpuPowerLimit;
    case 'gracefulRackShutdown': return 0; // complex — skip for now
    case 'thermalThrottleThreshold': return state.layers.gpu.levers.thermalThrottleThreshold;
    case 'requestRateLimit': return state.layers.workload.levers.requestRateLimit;
    case 'batchSize': return state.layers.workload.levers.batchSize;
    case 'priorityQueueWeight': return state.layers.workload.levers.priorityQueueWeight;
    default: return null;
  }
}
