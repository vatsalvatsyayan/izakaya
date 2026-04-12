// ============================================================================
// Core Types — Single source of truth for the AI Factory Digital Twin
// ============================================================================

// --- Health ---

/** Health status of a layer or metric */
export type HealthStatus = 'healthy' | 'warning' | 'critical';

// --- Layer States ---

export interface PowerLayerState {
  /** Total facility power draw in kW */
  totalFacilityPower: number;
  /** IT equipment power draw in kW */
  itEquipmentPower: number;
  /** Cooling system power draw in kW */
  coolingPower: number;
  /** Overhead power (lighting, networking, misc) in kW, constant 45 */
  overheadPower: number;
  /** Power Usage Effectiveness ratio, 1.0–3.0 */
  pue: number;
  /** Grid carbon intensity in gCO2/kWh */
  gridCarbonIntensity: number;
  /** Fraction of energy from renewable sources, 0–1 */
  renewableEnergyFraction: number;
  levers: {
    /** Facility-wide power cap in kW, 600–1200 */
    powerCap: number;
    /** Whether to prioritize renewable energy windows */
    renewablePriorityMode: boolean;
  };
  health: HealthStatus;
}

export interface CoolingLayerState {
  /** Target air temperature in server room, °C */
  coolingSetpoint: number;
  /** Water consumption rate in liters/hr */
  waterUsageRate: number;
  /** Water Usage Effectiveness in L/kWh */
  wue: number;
  /** Outside ambient temperature in °C */
  ambientTemperature: number;
  /** Coolant supply temperature in °C */
  coolantSupplyTemperature: number;
  levers: {
    /** Cooling setpoint in °C, 16–30 */
    coolingSetpoint: number;
    /** Fan speed override fraction, 0.4–1.0 */
    fanSpeedOverride: number;
    /** Whether water recirculation mode is enabled */
    waterRecirculationMode: boolean;
  };
  health: HealthStatus;
}

export interface GPULayerState {
  /** Average GPU temperature across active fleet in °C */
  averageGpuTemperature: number;
  /** Average GPU utilization rate, 0–1 */
  gpuUtilizationRate: number;
  /** Number of active (non-shutdown, non-failed) GPUs, 0–240 */
  activeGpuCount: number;
  /** Power consumed by idle GPUs in kW */
  gpuIdlePowerWaste: number;
  /** Hardware failure rate in failures/day */
  hardwareFailureRate: number;
  levers: {
    /** Per-GPU power limit in Watts, 200–700 */
    gpuPowerLimit: number;
    /** Per-rack shutdown state, array of 10 booleans */
    gracefulRackShutdown: boolean[];
    /** Temperature at which GPUs throttle in °C, 75–90 */
    thermalThrottleThreshold: number;
  };
  health: HealthStatus;
}

export interface WorkloadLayerState {
  /** Incoming request volume in req/hr */
  requestVolume: number;
  /** Average inference latency in ms */
  averageInferenceLatency: number;
  /** Number of requests waiting in queue */
  queueDepth: number;
  /** Fraction of requests being dropped, 0–1 */
  requestDropRate: number;
  /** Batch processing efficiency, 0–1 */
  batchEfficiency: number;
  levers: {
    /** Maximum allowed request rate in req/hr, 2000–16000 */
    requestRateLimit: number;
    /** Inference batch size, 1–64 */
    batchSize: number;
    /** Premium user priority weight, 0.5–0.9 */
    priorityQueueWeight: number;
  };
  health: HealthStatus;
}

export interface LocationLayerState {
  /** Outside ambient temperature in °C */
  ambientTemperature: number;
  /** Grid carbon intensity in gCO2/kWh */
  gridCarbonIntensity: number;
  /** Fraction of energy from renewable sources, 0–1 */
  renewableEnergyFraction: number;
  /** Water stress index, 0–1 */
  waterStressIndex: number;
  /** Local air quality index, AQI 0–500 */
  localAirQualityIndex: number;
  /** Geographic region, e.g. "Oregon, USA" */
  region: string;
  /** Local community name, e.g. "Umatilla County" */
  communityName: string;
  health: HealthStatus;
}

// --- Derived Metrics ---

export interface DerivedMetrics {
  /** Power Usage Effectiveness ratio */
  pue: number;
  /** Water Usage Effectiveness in L/kWh */
  wue: number;
  /** Carbon Usage Effectiveness in kgCO2/kWh */
  cue: number;
  /** Carbon output rate in kgCO2/hr */
  carbonOutputKgPerHr: number;
  /** GPU idle power waste in kW */
  gpuIdlePowerWasteKw: number;
  /** Cumulative carbon emitted since simulation start in kg */
  totalCarbonEmittedKg: number;
  /** Cumulative water consumed since simulation start in liters */
  totalWaterConsumedLiters: number;
}

// --- Simulation State ---

export interface SimulationState {
  /** Monotonically increasing tick counter */
  tick: number;
  /** ISO 8601 simulated timestamp */
  timestamp: string;
  /** Total simulated seconds since start */
  simulatedTimeSeconds: number;
  /** Current mode: live or what-if simulation */
  mode: 'live' | 'simulation';
  layers: {
    power: PowerLayerState;
    cooling: CoolingLayerState;
    gpu: GPULayerState;
    workload: WorkloadLayerState;
    location: LocationLayerState;
  };
  derivedMetrics: DerivedMetrics;
  /** Active scenario ID or null */
  activeScenario: string | null;
  activeAlerts: Alert[];
  activeRecommendations: Recommendation[];
}

// --- Health & Metrics ---

export interface LayerHealth {
  layerId: string;
  layerName: string;
  health: HealthStatus;
  metrics: Metric[];
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  /** Lower bound of healthy range */
  healthyMin: number;
  /** Upper bound of healthy range */
  healthyMax: number;
  /** Lower bound of warning range */
  warningMin: number;
  /** Upper bound of warning range */
  warningMax: number;
  /** Lower bound of critical range */
  criticalMin: number;
  /** Upper bound of critical range */
  criticalMax: number;
  status: HealthStatus;
  /** Last 60 tick values for sparkline */
  history: number[];
}

// --- Controls ---

export interface Lever {
  id: string;
  name: string;
  layerId: string;
  type: 'slider' | 'toggle' | 'dropdown';
  currentValue: number;
  minValue: number;
  maxValue: number;
  step: number;
  unit: string;
  effectMap: Array<{
    targetMetric: string;
    relationship: 'proportional' | 'inverse' | 'threshold';
    magnitude: number;
    description: string;
  }>;
}

// --- Recommendations ---

export interface Recommendation {
  id: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  layerAffected: string;
  /** Human-readable trigger condition */
  triggerCondition: string;
  title: string;
  body: string;
  suggestedAction: {
    lever: string;
    suggestedValue: number;
    currentValue: number;
  };
  projectedImpact: {
    metricChanges: Array<{
      metric: string;
      currentValue: number;
      projectedValue: number;
      unit: string;
    }>;
    endUserImpact: string;
    communityImpact: string;
  };
  status: 'active' | 'dismissed' | 'acted_on' | 'resolved';
  /** ISO 8601 or null */
  dismissedAt: string | null;
  /** ISO 8601 or null */
  actedOnAt: string | null;
  /** ISO 8601 or null */
  resolvedAt: string | null;
  /** Ethics disclaimer about AI-generated recommendations */
  confidenceNote: string;
}

// --- Alerts ---

export interface Alert {
  id: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  severity: 'warning' | 'critical';
  layerId: string;
  metricId: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  thresholdDirection: 'above' | 'below';
  message: string;
  acknowledged: boolean;
}

// --- Scenarios ---

export interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  affectedLayers: string[];
  triggerType: 'manual' | 'automatic';
  /** Null for manual-only scenarios */
  autoTriggerCondition: string | null;
  totalDurationTicks: number;
  events: ScenarioEvent[];
  recommendationTriggers: Array<{
    tickOffset: number;
    recommendationTemplateId: string;
  }>;
  /** Human-readable resolution description */
  resolution: string;
  endUserImpactSummary: string;
  ethicalDimension: string;
}

export interface ScenarioEvent {
  /** Ticks after scenario activation */
  tickOffset: number;
  layerAffected: string;
  metricAffected: string;
  operation: 'set' | 'add' | 'multiply';
  value: number;
  /** How many ticks this effect persists */
  durationTicks: number;
}

// --- Actions ---

export interface ActionCommit {
  id: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    /** ISO 8601 timestamp of acknowledgment */
    acknowledgedAt: string;
  };
  projectedImpact: {
    metricChanges: Array<{
      metric: string;
      projectedValue: number;
    }>;
  };
}

// --- Change Log ---

export interface ChangeLogEntry {
  id: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Human-readable action description, e.g. "cooling.setpoint: 22 → 25" */
  operatorAction: string;
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    /** ISO 8601 timestamp */
    acknowledgedAt: string;
  };
  outcomeAtCommit: {
    metrics: Record<string, number>;
  };
  /** Null until 5 simulated minutes have elapsed */
  outcomeAfterFiveMinutes: {
    metrics: Record<string, number>;
    projectionAccuracy: 'matched' | 'worse' | 'better';
  } | null;
  endUserImpactActual: EndUserImpact;
}

// --- End User Impact ---

export interface EndUserImpact {
  /** Projected latency change in ms */
  latencyChangeMs: number;
  /** Projected throughput change in req/hr */
  throughputChangeReqHr: number;
  /** Number of requests impacted per hour */
  requestsAffectedPerHour: number;
  affectedSegments: {
    premium: { latencyMs: number; dropRate: number };
    free: { latencyMs: number; dropRate: number };
  };
  /** Human-readable quality of service summary */
  qualityOfServiceDescription: string;
}

// --- Community Burden ---

export interface CommunityBurden {
  communityName: string;
  /** Water stress index, 0–1 */
  waterStressIndex: number;
  waterStressLevel: 'low' | 'moderate' | 'high' | 'critical';
  /** Facility water draw in liters/day */
  facilityWaterDrawLitersPerDay: number;
  /** Facility's share of community industrial water allocation, % */
  communityWaterBudgetPercent: number;
  /** Carbon footprint context, e.g. "equivalent to XX passenger cars per day" */
  carbonFootprintContext: string;
  /** Air quality impact description */
  airQualityImpact: string;
}

// --- WebSocket Types ---

export interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
  /** ISO 8601 timestamp of message creation */
  timestamp?: string;
}

export interface ScenarioProgress {
  scenarioId: string;
  ticksElapsed: number;
  totalTicks: number;
  phase: 'running' | 'complete';
}

export interface ActionConfirmed {
  changeLogEntryId: string;
  success: true;
}

// --- REST Request/Response Types ---

export interface ActivateScenarioRequest {
  mode: 'live' | 'simulation';
}

export interface CommitActionRequest {
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    acknowledged: true;
  };
}

export interface StateResponse {
  state: SimulationState;
}

export interface ScenariosResponse {
  scenarios: ScenarioDefinition[];
}

export interface LogsResponse {
  entries: ChangeLogEntry[];
  total: number;
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
}

export interface CommitActionResponse {
  success: boolean;
  changeLogEntryId: string;
  projectedImpact: {
    metricChanges: Array<{
      metric: string;
      projectedValue: number;
    }>;
  };
}

export interface ActivateScenarioResponse {
  success: boolean;
  scenarioId: string;
  estimatedDurationTicks: number;
}
