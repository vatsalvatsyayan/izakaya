import type { SimulationState, Lever, HealthStatus } from './types';

// ============================================================================
// Simulation Timing
// ============================================================================

/** Real-time interval between ticks in ms */
export const TICK_INTERVAL_MS = 2000;

/** Simulated seconds that pass per tick (5 minutes) */
export const SIMULATED_SECONDS_PER_TICK = 300;

/** ISO 8601 simulation start time */
export const BASE_TIME = '2026-04-12T08:00:00Z';

/** Exponential convergence factor for operator action effects */
export const CONVERGENCE_FACTOR = 0.85;

// ============================================================================
// Hardware Constants
// ============================================================================

/** NVIDIA H100 Thermal Design Power in Watts */
export const GPU_TDP = 700;

/** Total GPU count in the facility */
export const TOTAL_GPU_COUNT = 240;

/** Number of server racks */
export const RACKS = 10;

/** GPUs per rack */
export const GPUS_PER_RACK = 24;

/** Overhead power (lighting, networking, misc) in kW */
export const OVERHEAD_POWER = 45;

/** Base cooling power at 20°C ambient, no recirculation, in kW */
export const BASE_COOLING_POWER = 120;

/** Base inference latency at optimal conditions in ms */
export const BASE_INFERENCE_LATENCY = 45;

// ============================================================================
// Threshold Definitions
// ============================================================================

export interface ThresholdRange {
  healthyMin: number;
  healthyMax: number;
  warningMin: number;
  warningMax: number;
  criticalMin: number;
  criticalMax: number;
  /** Whether higher values are worse */
  higherIsWorse: boolean;
}

export const POWER_THRESHOLDS: Record<string, ThresholdRange> = {
  totalFacilityPower: {
    healthyMin: 0, healthyMax: 900,
    warningMin: 900, warningMax: 1100,
    criticalMin: 1100, criticalMax: Infinity,
    higherIsWorse: true,
  },
  itEquipmentPower: {
    healthyMin: 0, healthyMax: 750,
    warningMin: 750, warningMax: 900,
    criticalMin: 900, criticalMax: Infinity,
    higherIsWorse: true,
  },
  pue: {
    healthyMin: 1.0, healthyMax: 1.3,
    warningMin: 1.3, warningMax: 1.5,
    criticalMin: 1.5, criticalMax: Infinity,
    higherIsWorse: true,
  },
  gridCarbonIntensity: {
    healthyMin: 0, healthyMax: 200,
    warningMin: 200, warningMax: 400,
    criticalMin: 400, criticalMax: Infinity,
    higherIsWorse: true,
  },
  renewableEnergyFraction: {
    healthyMin: 0.6, healthyMax: 1.0,
    warningMin: 0.4, warningMax: 0.6,
    criticalMin: 0, criticalMax: 0.4,
    higherIsWorse: false,
  },
};

export const COOLING_THRESHOLDS: Record<string, ThresholdRange> = {
  coolingSetpoint: {
    healthyMin: 18, healthyMax: 22,
    warningMin: 23, warningMax: 26,
    criticalMin: 26, criticalMax: Infinity,
    higherIsWorse: true,
  },
  waterUsageRate: {
    healthyMin: 0, healthyMax: 800,
    warningMin: 800, warningMax: 1200,
    criticalMin: 1200, criticalMax: Infinity,
    higherIsWorse: true,
  },
  wue: {
    healthyMin: 0, healthyMax: 1.0,
    warningMin: 1.0, warningMax: 1.8,
    criticalMin: 1.8, criticalMax: Infinity,
    higherIsWorse: true,
  },
  ambientTemperature: {
    healthyMin: -Infinity, healthyMax: 30,
    warningMin: 30, warningMax: 38,
    criticalMin: 38, criticalMax: Infinity,
    higherIsWorse: true,
  },
  coolantSupplyTemperature: {
    healthyMin: -Infinity, healthyMax: 18,
    warningMin: 18, warningMax: 24,
    criticalMin: 24, criticalMax: Infinity,
    higherIsWorse: true,
  },
};

export const GPU_THRESHOLDS: Record<string, ThresholdRange> = {
  averageGpuTemperature: {
    healthyMin: 0, healthyMax: 72,
    warningMin: 72, warningMax: 83,
    criticalMin: 83, criticalMax: Infinity,
    higherIsWorse: true,
  },
  gpuUtilizationRate: {
    healthyMin: 0.7, healthyMax: 1.0,
    warningMin: 0.5, warningMax: 0.7,
    criticalMin: 0, criticalMax: 0.5,
    higherIsWorse: false,
  },
  activeGpuCount: {
    healthyMin: 240, healthyMax: 240,
    warningMin: 200, warningMax: 239,
    criticalMin: 0, criticalMax: 200,
    higherIsWorse: false,
  },
  gpuIdlePowerWaste: {
    healthyMin: 0, healthyMax: 30,
    warningMin: 30, warningMax: 60,
    criticalMin: 60, criticalMax: Infinity,
    higherIsWorse: true,
  },
  hardwareFailureRate: {
    healthyMin: 0, healthyMax: 0,
    warningMin: 1, warningMax: 2,
    criticalMin: 2, criticalMax: Infinity,
    higherIsWorse: true,
  },
};

export const WORKLOAD_THRESHOLDS: Record<string, ThresholdRange> = {
  requestVolume: {
    healthyMin: 0, healthyMax: 10000,
    warningMin: 10000, warningMax: 14000,
    criticalMin: 14000, criticalMax: Infinity,
    higherIsWorse: true,
  },
  averageInferenceLatency: {
    healthyMin: 0, healthyMax: 100,
    warningMin: 100, warningMax: 200,
    criticalMin: 200, criticalMax: Infinity,
    higherIsWorse: true,
  },
  queueDepth: {
    healthyMin: 0, healthyMax: 50,
    warningMin: 50, warningMax: 200,
    criticalMin: 200, criticalMax: Infinity,
    higherIsWorse: true,
  },
  requestDropRate: {
    healthyMin: 0, healthyMax: 0,
    warningMin: 0.001, warningMax: 0.01,
    criticalMin: 0.01, criticalMax: Infinity,
    higherIsWorse: true,
  },
  batchEfficiency: {
    healthyMin: 0.8, healthyMax: 1.0,
    warningMin: 0.6, warningMax: 0.8,
    criticalMin: 0, criticalMax: 0.6,
    higherIsWorse: false,
  },
};

export const LOCATION_THRESHOLDS: Record<string, ThresholdRange> = {
  ambientTemperature: {
    healthyMin: -Infinity, healthyMax: 30,
    warningMin: 30, warningMax: 38,
    criticalMin: 38, criticalMax: Infinity,
    higherIsWorse: true,
  },
  gridCarbonIntensity: {
    healthyMin: 0, healthyMax: 200,
    warningMin: 200, warningMax: 400,
    criticalMin: 400, criticalMax: Infinity,
    higherIsWorse: true,
  },
  renewableEnergyFraction: {
    healthyMin: 0.6, healthyMax: 1.0,
    warningMin: 0.4, warningMax: 0.6,
    criticalMin: 0, criticalMax: 0.4,
    higherIsWorse: false,
  },
  waterStressIndex: {
    healthyMin: 0, healthyMax: 0.3,
    warningMin: 0.3, warningMax: 0.6,
    criticalMin: 0.6, criticalMax: Infinity,
    higherIsWorse: true,
  },
  localAirQualityIndex: {
    healthyMin: 0, healthyMax: 50,
    warningMin: 50, warningMax: 100,
    criticalMin: 100, criticalMax: Infinity,
    higherIsWorse: true,
  },
};

/** All thresholds indexed by layer */
export const LAYER_THRESHOLDS: Record<string, Record<string, ThresholdRange>> = {
  power: POWER_THRESHOLDS,
  cooling: COOLING_THRESHOLDS,
  gpu: GPU_THRESHOLDS,
  workload: WORKLOAD_THRESHOLDS,
  location: LOCATION_THRESHOLDS,
};

// ============================================================================
// Drift Configuration
// ============================================================================

export interface DriftConfig {
  /** Base drift per tick (positive = increasing) */
  driftMagnitude: number;
  /** Random noise range (±) */
  noiseRange: number;
  /** Optional: whether drift direction depends on time of day */
  timeOfDayDependent?: boolean;
  /** Drift magnitude during nighttime (if time-of-day dependent) */
  nightDriftMagnitude?: number;
}

export const DRIFT_CONFIG: Record<string, DriftConfig> = {
  ambientTemperature: {
    driftMagnitude: 0.1,
    noiseRange: 0.3,
    timeOfDayDependent: true,
    nightDriftMagnitude: -0.05,
  },
  averageGpuTemperature: {
    driftMagnitude: 0.02,
    noiseRange: 0.1,
  },
  gridCarbonIntensity: {
    driftMagnitude: 0, // sinusoidal, handled separately
    noiseRange: 10,
  },
  requestVolume: {
    driftMagnitude: 50,
    noiseRange: 100,
    timeOfDayDependent: true,
    nightDriftMagnitude: -30,
  },
  waterStressIndex: {
    driftMagnitude: 0,
    noiseRange: 0.01,
  },
};

/** Amplitude for sinusoidal grid carbon intensity variation */
export const GRID_CARBON_SINUSOIDAL_AMPLITUDE = 50;

// ============================================================================
// Lever Definitions
// ============================================================================

export const LEVER_DEFINITIONS: Lever[] = [
  // Power levers
  {
    id: 'powerCap',
    name: 'Power Cap',
    layerId: 'power',
    type: 'slider',
    currentValue: 1000,
    minValue: 600,
    maxValue: 1200,
    step: 50,
    unit: 'kW',
    effectMap: [
      { targetMetric: 'totalFacilityPower', relationship: 'proportional', magnitude: 1.0, description: 'Caps total facility power draw' },
      { targetMetric: 'gpuPowerLimit', relationship: 'proportional', magnitude: 0.5, description: 'Throttles GPU power limits proportionally' },
    ],
  },
  {
    id: 'renewablePriorityMode',
    name: 'Renewable Priority Mode',
    layerId: 'power',
    type: 'toggle',
    currentValue: 0,
    minValue: 0,
    maxValue: 1,
    step: 1,
    unit: '',
    effectMap: [
      { targetMetric: 'averageInferenceLatency', relationship: 'proportional', magnitude: 15, description: 'Adds latency during low-renewable windows' },
      { targetMetric: 'carbonOutputKgPerHr', relationship: 'inverse', magnitude: 0.2, description: 'Reduces carbon output by deferring to green windows' },
    ],
  },
  // Cooling levers
  {
    id: 'coolingSetpoint',
    name: 'Cooling Setpoint',
    layerId: 'cooling',
    type: 'slider',
    currentValue: 22,
    minValue: 16,
    maxValue: 30,
    step: 1,
    unit: '°C',
    effectMap: [
      { targetMetric: 'waterUsageRate', relationship: 'inverse', magnitude: 0.08, description: 'Higher setpoint reduces water usage' },
      { targetMetric: 'averageGpuTemperature', relationship: 'proportional', magnitude: 1.2, description: 'Higher setpoint increases GPU temperatures' },
      { targetMetric: 'coolingPower', relationship: 'inverse', magnitude: 0.05, description: 'Higher setpoint reduces cooling power' },
    ],
  },
  {
    id: 'fanSpeedOverride',
    name: 'Fan Speed Override',
    layerId: 'cooling',
    type: 'slider',
    currentValue: 0.65,
    minValue: 0.4,
    maxValue: 1.0,
    step: 0.05,
    unit: '%',
    effectMap: [
      { targetMetric: 'coolingPower', relationship: 'proportional', magnitude: 0.3, description: 'Higher fan speed increases cooling power draw' },
      { targetMetric: 'averageGpuTemperature', relationship: 'inverse', magnitude: 0.5, description: 'Higher fan speed reduces GPU temperatures' },
    ],
  },
  {
    id: 'waterRecirculationMode',
    name: 'Water Recirculation Mode',
    layerId: 'cooling',
    type: 'toggle',
    currentValue: 0,
    minValue: 0,
    maxValue: 1,
    step: 1,
    unit: '',
    effectMap: [
      { targetMetric: 'waterUsageRate', relationship: 'inverse', magnitude: 0.3, description: 'Reduces fresh water intake by 30%' },
      { targetMetric: 'coolingPower', relationship: 'proportional', magnitude: 0.15, description: 'Increases cooling power by 15% due to reduced efficiency' },
    ],
  },
  // GPU levers
  {
    id: 'gpuPowerLimit',
    name: 'GPU Power Limit',
    layerId: 'gpu',
    type: 'slider',
    currentValue: 600,
    minValue: 200,
    maxValue: 700,
    step: 50,
    unit: 'W',
    effectMap: [
      { targetMetric: 'itEquipmentPower', relationship: 'proportional', magnitude: 0.24, description: 'Directly affects IT power draw (240 GPUs)' },
      { targetMetric: 'averageGpuTemperature', relationship: 'proportional', magnitude: 0.02, description: 'Lower power limit reduces GPU temperatures' },
      { targetMetric: 'averageInferenceLatency', relationship: 'inverse', magnitude: 0.1, description: 'Lower power limit may increase latency' },
    ],
  },
  {
    id: 'gracefulRackShutdown',
    name: 'Graceful Rack Shutdown',
    layerId: 'gpu',
    type: 'toggle',
    currentValue: 0,
    minValue: 0,
    maxValue: 1,
    step: 1,
    unit: '',
    effectMap: [
      { targetMetric: 'activeGpuCount', relationship: 'inverse', magnitude: 24, description: 'Each rack shutdown removes 24 GPUs' },
      { targetMetric: 'itEquipmentPower', relationship: 'inverse', magnitude: 16.8, description: 'Reduces IT power per rack' },
    ],
  },
  {
    id: 'thermalThrottleThreshold',
    name: 'Thermal Throttle Threshold',
    layerId: 'gpu',
    type: 'slider',
    currentValue: 83,
    minValue: 75,
    maxValue: 90,
    step: 1,
    unit: '°C',
    effectMap: [
      { targetMetric: 'gpuUtilizationRate', relationship: 'threshold', magnitude: 0.3, description: 'GPUs throttle when temperature exceeds this threshold' },
    ],
  },
  // Workload levers
  {
    id: 'requestRateLimit',
    name: 'Request Rate Limit',
    layerId: 'workload',
    type: 'slider',
    currentValue: 12000,
    minValue: 2000,
    maxValue: 16000,
    step: 500,
    unit: 'req/hr',
    effectMap: [
      { targetMetric: 'requestDropRate', relationship: 'inverse', magnitude: 0.5, description: 'Caps inbound traffic, dropping excess' },
      { targetMetric: 'queueDepth', relationship: 'inverse', magnitude: 0.3, description: 'Reduces queue buildup' },
    ],
  },
  {
    id: 'batchSize',
    name: 'Batch Size',
    layerId: 'workload',
    type: 'slider',
    currentValue: 16,
    minValue: 1,
    maxValue: 64,
    step: 1,
    unit: '',
    effectMap: [
      { targetMetric: 'batchEfficiency', relationship: 'proportional', magnitude: 0.01, description: 'Larger batches improve GPU throughput' },
      { targetMetric: 'averageInferenceLatency', relationship: 'proportional', magnitude: 1.2, description: 'Larger batches increase per-request latency' },
    ],
  },
  {
    id: 'priorityQueueWeight',
    name: 'Priority Queue Weight',
    layerId: 'workload',
    type: 'slider',
    currentValue: 0.6,
    minValue: 0.5,
    maxValue: 0.9,
    step: 0.1,
    unit: '',
    effectMap: [
      { targetMetric: 'premiumLatency', relationship: 'inverse', magnitude: 0.5, description: 'Higher weight reduces premium user latency' },
      { targetMetric: 'freeLatency', relationship: 'proportional', magnitude: 1.5, description: 'Higher weight increases free-tier latency' },
    ],
  },
];

// ============================================================================
// Recommendation Templates
// ============================================================================

export interface RecommendationTemplate {
  id: string;
  condition: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  bodyTemplate: string;
  /** Number of consecutive ticks the condition must hold */
  tickThreshold: number;
}

export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  {
    id: 'rec-pue-warning',
    condition: 'PUE > 1.3',
    severity: 'warning',
    title: 'Elevated PUE Detected',
    bodyTemplate: 'PUE has remained above 1.3 for the past {duration}. Consider reducing GPU power limits by {amount}W to decrease total facility power draw. Projected PUE improvement: {delta}. Note: This will reduce maximum inference throughput by approximately {pct}%.',
    tickThreshold: 5,
  },
  {
    id: 'rec-pue-critical',
    condition: 'PUE > 1.5',
    severity: 'critical',
    title: 'Critical PUE — Immediate Action Recommended',
    bodyTemplate: 'PUE has exceeded 1.5, indicating significant energy waste. Recommend immediately enabling Renewable Priority Mode and reducing Power Cap to {value}kW. Without intervention, carbon output will exceed {amount} kgCO2/hr.',
    tickThreshold: 3,
  },
  {
    id: 'rec-wue-warning',
    condition: 'WUE > 1.0',
    severity: 'warning',
    title: 'Water Efficiency Below Target',
    bodyTemplate: 'WUE has exceeded 1.0 L/kWh. Consider raising the cooling setpoint by {amount}°C or enabling Water Recirculation Mode. Projected water savings: {liters} liters/hr. GPU temperatures may increase by approximately {delta}°C.',
    tickThreshold: 5,
  },
  {
    id: 'rec-wue-critical',
    condition: 'WUE > 1.8',
    severity: 'critical',
    title: 'Critical Water Usage',
    bodyTemplate: 'Water usage is critically high at {value} L/kWh. Immediate intervention required. Recommend enabling Water Recirculation Mode and raising cooling setpoint to {value}°C. The local community water stress index is {wsi} — continued high usage increases community burden.',
    tickThreshold: 3,
  },
  {
    id: 'rec-gpu-temp-warning',
    condition: 'Avg GPU Temp > 78°C',
    severity: 'warning',
    title: 'GPU Fleet Running Hot',
    bodyTemplate: 'Average GPU temperature has exceeded 78°C. Consider lowering the thermal throttle threshold to {value}°C or increasing fan speed to {pct}%. Extended high temperatures increase hardware failure probability by approximately {pct}%.',
    tickThreshold: 5,
  },
  {
    id: 'rec-gpu-temp-critical',
    condition: 'Avg GPU Temp > 83°C',
    severity: 'critical',
    title: 'Critical GPU Temperatures — Throttling Imminent',
    bodyTemplate: 'GPUs are approaching thermal shutdown thresholds. Recommend immediately reducing GPU power limits to {value}W and lowering cooling setpoint to {value}°C. Failure to act may result in hardware damage and service degradation.',
    tickThreshold: 2,
  },
  {
    id: 'rec-gpu-util-low',
    condition: 'GPU Utilization < 50%',
    severity: 'info',
    title: 'Low GPU Utilization — Consolidation Opportunity',
    bodyTemplate: 'GPU utilization has been below 50% for an extended period. Consider gracefully shutting down {count} underutilized racks to reduce idle power waste by approximately {amount}kW. This would save {carbon} kgCO2/hr at current grid carbon intensity.',
    tickThreshold: 10,
  },
  {
    id: 'rec-drop-rate-warning',
    condition: 'Request Drop Rate > 0.5%',
    severity: 'warning',
    title: 'Requests Being Dropped',
    bodyTemplate: 'The request drop rate has exceeded 0.5%. Consider increasing the Request Rate Limit to {value} req/hr or reducing Batch Size to {value} to improve throughput. Approximately {count} end-user requests are being lost per hour.',
    tickThreshold: 1,
  },
  {
    id: 'rec-drop-rate-critical',
    condition: 'Request Drop Rate > 2%',
    severity: 'critical',
    title: 'Significant Service Degradation',
    bodyTemplate: 'More than 2% of requests are being dropped. Immediate action needed: ensure all GPU racks are online, reduce batch size, and verify cooling is maintaining safe GPU temperatures. {count} end users are currently unable to access services.',
    tickThreshold: 1,
  },
  {
    id: 'rec-carbon-warning',
    condition: 'Grid Carbon Intensity > 400',
    severity: 'warning',
    title: 'High Grid Carbon Intensity',
    bodyTemplate: 'Grid carbon intensity has exceeded 400 gCO2/kWh. Consider enabling Renewable Priority Mode and deferring non-critical batch workloads. Current carbon output: {value} kgCO2/hr. Shifting {pct}% of workload to off-peak hours could reduce emissions by {amount} kgCO2.',
    tickThreshold: 3,
  },
];

// ============================================================================
// Seed State (Tick 0)
// ============================================================================

export const SEED_STATE: SimulationState = {
  tick: 0,
  timestamp: '2026-04-12T08:00:00Z',
  simulatedTimeSeconds: 0,
  mode: 'live',
  layers: {
    power: {
      totalFacilityPower: 750,
      itEquipmentPower: 620,
      coolingPower: 85,
      overheadPower: 45,
      pue: 1.21,
      gridCarbonIntensity: 150,
      renewableEnergyFraction: 0.75,
      levers: {
        powerCap: 1000,
        renewablePriorityMode: false,
      },
      health: 'healthy',
    },
    cooling: {
      coolingSetpoint: 22,
      waterUsageRate: 400,
      wue: 0.65,
      ambientTemperature: 24,
      coolantSupplyTemperature: 14,
      levers: {
        coolingSetpoint: 22,
        fanSpeedOverride: 0.65,
        waterRecirculationMode: false,
      },
      health: 'healthy',
    },
    gpu: {
      averageGpuTemperature: 62,
      gpuUtilizationRate: 0.72,
      activeGpuCount: 240,
      gpuIdlePowerWaste: 27,
      hardwareFailureRate: 0,
      levers: {
        gpuPowerLimit: 600,
        gracefulRackShutdown: [false, false, false, false, false, false, false, false, false, false],
        thermalThrottleThreshold: 83,
      },
      health: 'healthy',
    },
    workload: {
      requestVolume: 8000,
      averageInferenceLatency: 50,
      queueDepth: 5,
      requestDropRate: 0,
      batchEfficiency: 0.85,
      levers: {
        requestRateLimit: 12000,
        batchSize: 16,
        priorityQueueWeight: 0.6,
      },
      health: 'healthy',
    },
    location: {
      ambientTemperature: 24,
      gridCarbonIntensity: 150,
      renewableEnergyFraction: 0.75,
      waterStressIndex: 0.12,
      localAirQualityIndex: 25,
      region: 'Oregon, USA',
      communityName: 'Umatilla County',
      health: 'healthy',
    },
  },
  derivedMetrics: {
    pue: 1.21,
    wue: 0.65,
    cue: 0.18,
    carbonOutputKgPerHr: 112.5,
    gpuIdlePowerWasteKw: 27,
    totalCarbonEmittedKg: 0,
    totalWaterConsumedLiters: 0,
  },
  activeScenario: null,
  activeAlerts: [],
  activeRecommendations: [],
};

// ============================================================================
// Confidence Note (standard disclaimer for all recommendations)
// ============================================================================

export const RECOMMENDATION_CONFIDENCE_NOTE =
  'This recommendation is generated by a rule-based simulation engine. In a production system, AI-generated recommendations carry model uncertainty and may reflect biases in training data. Always apply human judgment before acting on automated suggestions.';

// ============================================================================
// WebSocket heartbeat
// ============================================================================

/** Server sends ping every 30 seconds */
export const HEARTBEAT_INTERVAL_MS = 30000;

/** Client must respond within 10 seconds */
export const HEARTBEAT_TIMEOUT_MS = 10000;
