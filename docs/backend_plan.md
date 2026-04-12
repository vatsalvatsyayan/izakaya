# Backend Implementation Plan

**Target:** Complete backend for the AI Factory Digital Twin simulation engine, REST API, and WebSocket server.

---

## 1. Implementation Order

Files listed in dependency order — each file only imports from files listed above it (or from external packages).

| # | File Path | Purpose | Imports | Exports | Complexity |
|---|-----------|---------|---------|---------|------------|
| 1 | `packages/shared/src/types.ts` | All TypeScript interfaces, enums, and type aliases from PRD Section 13 | None | All interfaces: `SimulationState`, `PowerLayerState`, `CoolingLayerState`, `GPULayerState`, `WorkloadLayerState`, `LocationLayerState`, `DerivedMetrics`, `HealthStatus`, `LayerHealth`, `Metric`, `Lever`, `Recommendation`, `Alert`, `ScenarioDefinition`, `ScenarioEvent`, `ActionCommit`, `ChangeLogEntry`, `EndUserImpact`, `CommunityBurden` | M |
| 2 | `packages/shared/src/constants.ts` | Threshold values, seed data values, simulation config, lever definitions | `types.ts` | All threshold constants, lever definition objects, drift config, recommendation templates | L |
| 3 | `packages/shared/src/formulas.ts` | Pure functions for all derived and layer-specific metric calculations | `types.ts` | `computePUE`, `computeWUE`, `computeCUE`, `computeCarbonOutput`, `computeGpuIdlePowerWaste`, `computeInferenceLatency`, `computeCoolingPower`, `computeWaterUsageRate`, `computeGpuTemperature`, `computeQueueDepth`, `computeRequestDropRate`, `computeITEquipmentPower`, `computeBatchEfficiency` | L |
| 4 | `packages/shared/package.json` | Package manifest for `@izakaya/shared` | N/A | N/A | S |
| 5 | `packages/shared/tsconfig.json` | TypeScript config extending base | N/A | N/A | S |
| 6 | `packages/backend/src/simulation/seed.ts` | Creates the initial SimulationState at tick 0 from PRD Section 16 | `@izakaya/shared` (types, constants) | `createSeedState(): SimulationState` | M |
| 7 | `packages/backend/src/simulation/drift.ts` | Environmental drift model — per-metric noise and directional drift | `@izakaya/shared` (types, constants) | `applyEnvironmentalDrift(state: SimulationState): void` | M |
| 8 | `packages/backend/src/simulation/dependencies.ts` | Layer interdependency propagation using convergence formula | `@izakaya/shared` (types, formulas) | `propagateLayerDependencies(state: SimulationState): void` | L |
| 9 | `packages/backend/src/simulation/scenarios.ts` | Scenario definitions, event queue processing, activation/deactivation | `@izakaya/shared` (types), `uuid` | `SCENARIO_DEFINITIONS: ScenarioDefinition[]`, `activateScenario(state, scenarioId, mode)`, `applyScenarioEvents(state, activeEffects, scenarioStartTick)`, `deactivateScenario(state, activeEffects)` | L |
| 10 | `packages/backend/src/simulation/alerts.ts` | Threshold evaluation, alert generation, auto-resolution, deduplication | `@izakaya/shared` (types, constants), `uuid` | `evaluateAlerts(state: SimulationState, alertHistory: Alert[], broadcast: BroadcastFn): void` | M |
| 11 | `packages/backend/src/simulation/recommendations.ts` | Trigger condition evaluation, recommendation lifecycle management | `@izakaya/shared` (types, constants), `uuid` | `evaluateRecommendations(state: SimulationState, recHistory: Recommendation[], broadcast: BroadcastFn): void` | L |
| 12 | `packages/backend/src/simulation/engine.ts` | SimulationEngine class: orchestrates tick loop, holds state and auxiliary arrays | `@izakaya/shared` (types, formulas), `seed.ts`, `drift.ts`, `dependencies.ts`, `scenarios.ts`, `alerts.ts`, `recommendations.ts` | `class SimulationEngine` | L |
| 13 | `packages/backend/src/websocket/connectionManager.ts` | WebSocket server setup, client tracking, broadcast, heartbeat | `ws`, `http`, `@izakaya/shared` (types) | `createWebSocketServer(server: http.Server): { broadcast, getClientCount }` | M |
| 14 | `packages/backend/src/api/stateController.ts` | GET /api/state handler | `@izakaya/shared` (types), `express` | `getState(engine): RequestHandler` | S |
| 15 | `packages/backend/src/api/actionsController.ts` | POST /api/actions handler with validation and lever effect calculation | `@izakaya/shared` (types, constants, formulas), `express`, `uuid` | `commitAction(engine): RequestHandler` | L |
| 16 | `packages/backend/src/api/scenariosController.ts` | GET /api/scenarios and POST /api/scenarios/:id/activate | `@izakaya/shared` (types), `express` | `listScenarios(engine): RequestHandler`, `activateScenario(engine): RequestHandler` | M |
| 17 | `packages/backend/src/api/logsController.ts` | GET /api/logs with pagination | `express` | `getLogs(engine): RequestHandler` | S |
| 18 | `packages/backend/src/api/recommendationsController.ts` | GET /api/recommendations and POST /api/recommendations/:id/dismiss | `@izakaya/shared` (types), `express` | `listActive(engine): RequestHandler`, `dismiss(engine): RequestHandler` | S |
| 19 | `packages/backend/src/api/router.ts` | Express router composing all controllers | `express`, all controllers | `createRouter(engine): Router` | S |
| 20 | `packages/backend/src/index.ts` | Entry point: wires Express, WebSocket, SimulationEngine, starts server | `express`, `cors`, `http`, `engine.ts`, `router.ts`, `connectionManager.ts` | None (side-effect: starts server) | M |
| 21 | `packages/backend/package.json` | Package manifest | N/A | N/A | S |
| 22 | `packages/backend/tsconfig.json` | TypeScript config | N/A | N/A | S |
| 23 | `tsconfig.base.json` | Shared compiler options | N/A | N/A | S |
| 24 | `package.json` | Workspace root with npm workspaces config and scripts | N/A | N/A | S |

---

## 2. Phase 1: Shared Types & Constants

### 2.1 `packages/shared/src/types.ts`

Define every interface exactly as specified in PRD Section 13. The complete list:

```
type HealthStatus = 'healthy' | 'warning' | 'critical'

interface SimulationState {
  tick: number
  timestamp: string                      // ISO 8601
  simulatedTimeSeconds: number
  mode: 'live' | 'simulation'
  layers: {
    power: PowerLayerState
    cooling: CoolingLayerState
    gpu: GPULayerState
    workload: WorkloadLayerState
    location: LocationLayerState
  }
  derivedMetrics: DerivedMetrics
  activeScenario: string | null
  activeAlerts: Alert[]
  activeRecommendations: Recommendation[]
}

interface PowerLayerState {
  totalFacilityPower: number             // kW
  itEquipmentPower: number               // kW
  coolingPower: number                   // kW
  overheadPower: number                  // kW (constant 45)
  pue: number
  gridCarbonIntensity: number            // gCO2/kWh
  renewableEnergyFraction: number        // 0–1
  levers: {
    powerCap: number                     // kW, 600–1200, step 50
    renewablePriorityMode: boolean
  }
  health: HealthStatus
}

interface CoolingLayerState {
  coolingSetpoint: number                // °C
  waterUsageRate: number                 // L/hr
  wue: number                            // L/kWh
  ambientTemperature: number             // °C
  coolantSupplyTemperature: number       // °C
  levers: {
    coolingSetpoint: number              // °C, 16–30, step 1
    fanSpeedOverride: number             // 0.4–1.0, step 0.05
    waterRecirculationMode: boolean
  }
  health: HealthStatus
}

interface GPULayerState {
  averageGpuTemperature: number          // °C
  gpuUtilizationRate: number             // 0–1
  activeGpuCount: number                 // 0–240
  gpuIdlePowerWaste: number              // kW
  hardwareFailureRate: number            // failures/day
  levers: {
    gpuPowerLimit: number                // W, 200–700, step 50
    gracefulRackShutdown: boolean[]      // array of 10
    thermalThrottleThreshold: number     // °C, 75–90, step 1
  }
  health: HealthStatus
}

interface WorkloadLayerState {
  requestVolume: number                  // req/hr
  averageInferenceLatency: number        // ms
  queueDepth: number                     // requests
  requestDropRate: number                // 0–1
  batchEfficiency: number                // 0–1
  levers: {
    requestRateLimit: number             // req/hr, 2000–16000, step 500
    batchSize: number                    // 1–64, step 1
    priorityQueueWeight: number          // 0.5–0.9, step 0.1
  }
  health: HealthStatus
}

interface LocationLayerState {
  ambientTemperature: number             // °C
  gridCarbonIntensity: number            // gCO2/kWh
  renewableEnergyFraction: number        // 0–1
  waterStressIndex: number               // 0–1
  localAirQualityIndex: number           // AQI 0–500
  region: string                         // "Oregon, USA"
  communityName: string                  // "Umatilla County"
  health: HealthStatus
}

interface DerivedMetrics {
  pue: number
  wue: number
  cue: number                            // kgCO2/kWh
  carbonOutputKgPerHr: number
  gpuIdlePowerWasteKw: number
  totalCarbonEmittedKg: number           // cumulative
  totalWaterConsumedLiters: number       // cumulative
}

interface LayerHealth {
  layerId: string
  layerName: string
  health: HealthStatus
  metrics: Metric[]
}

interface Metric {
  id: string
  name: string
  value: number
  unit: string
  healthyMin: number
  healthyMax: number
  warningMin: number
  warningMax: number
  criticalMin: number
  criticalMax: number
  status: HealthStatus
  history: number[]                      // last 60 tick values
}

interface Lever {
  id: string
  name: string
  layerId: string
  type: 'slider' | 'toggle' | 'dropdown'
  currentValue: number
  minValue: number
  maxValue: number
  step: number
  unit: string
  effectMap: Array<{
    targetMetric: string
    relationship: 'proportional' | 'inverse' | 'threshold'
    magnitude: number
    description: string
  }>
}

interface Recommendation {
  id: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
  layerAffected: string
  triggerCondition: string
  title: string
  body: string
  suggestedAction: {
    lever: string
    suggestedValue: number
    currentValue: number
  }
  projectedImpact: {
    metricChanges: Array<{
      metric: string
      currentValue: number
      projectedValue: number
      unit: string
    }>
    endUserImpact: string
    communityImpact: string
  }
  status: 'active' | 'dismissed' | 'acted_on' | 'resolved'
  dismissedAt: string | null
  actedOnAt: string | null
  resolvedAt: string | null
  confidenceNote: string
}

interface Alert {
  id: string
  timestamp: string
  severity: 'warning' | 'critical'
  layerId: string
  metricId: string
  metricName: string
  currentValue: number
  threshold: number
  thresholdDirection: 'above' | 'below'
  message: string
  acknowledged: boolean
}

interface ScenarioDefinition {
  id: string
  name: string
  description: string
  affectedLayers: string[]
  triggerType: 'manual' | 'automatic'
  autoTriggerCondition: string | null
  totalDurationTicks: number
  events: ScenarioEvent[]
  recommendationTriggers: Array<{
    tickOffset: number
    recommendationTemplateId: string
  }>
  resolution: string
  endUserImpactSummary: string
  ethicalDimension: string
}

interface ScenarioEvent {
  tickOffset: number
  layerAffected: string
  metricAffected: string
  operation: 'set' | 'add' | 'multiply'
  value: number
  durationTicks: number
}

interface ActionCommit {
  id: string
  timestamp: string
  layerId: string
  leverId: string
  previousValue: number
  newValue: number
  tradeoffAcknowledgment: {
    tradeoffText: string
    communityImpactText: string
    endUserImpactText: string
    acknowledgedAt: string
  }
  projectedImpact: {
    metricChanges: Array<{
      metric: string
      projectedValue: number
    }>
  }
}

interface ChangeLogEntry {
  id: string
  timestamp: string
  operatorAction: string
  layerId: string
  leverId: string
  previousValue: number
  newValue: number
  tradeoffAcknowledgment: {
    tradeoffText: string
    communityImpactText: string
    endUserImpactText: string
    acknowledgedAt: string
  }
  outcomeAtCommit: {
    metrics: Record<string, number>
  }
  outcomeAfterFiveMinutes: {
    metrics: Record<string, number>
    projectionAccuracy: 'matched' | 'worse' | 'better'
  } | null
  endUserImpactActual: EndUserImpact
}

interface EndUserImpact {
  latencyChangeMs: number
  throughputChangeReqHr: number
  requestsAffectedPerHour: number
  affectedSegments: {
    premium: { latencyMs: number; dropRate: number }
    free: { latencyMs: number; dropRate: number }
  }
  qualityOfServiceDescription: string
}

interface CommunityBurden {
  communityName: string
  waterStressIndex: number
  waterStressLevel: 'low' | 'moderate' | 'high' | 'critical'
  facilityWaterDrawLitersPerDay: number
  communityWaterBudgetPercent: number
  carbonFootprintContext: string
  airQualityImpact: string
}
```

Also export a helper type for the broadcast function signature:

```
type BroadcastFn = (event: string, data: unknown) => void
```

And a type for the WebSocket message envelope:

```
interface WSMessage {
  event: string
  data: unknown
}
```

### 2.2 `packages/shared/src/constants.ts`

**Simulation Config:**

```
TICK_RATE_MS = 2000
SIMULATED_SECONDS_PER_TICK = 300          // 5 simulated minutes
BASE_TIME = '2026-04-12T08:00:00Z'
OVERHEAD_POWER_KW = 45
BASE_COOLING_POWER_KW = 120
BASE_WATER_RATE_LPH = 600
BASE_LATENCY_MS = 45
BASE_GPU_TEMP_C = 55
GPU_TDP_W = 700                           // H100 TDP
TOTAL_GPU_COUNT = 240
GPUS_PER_RACK = 24
RACK_COUNT = 10
BASE_REQUEST_CAPACITY_PER_GPU = 40        // req/hr at full power, batch 1
MAX_QUEUE_CAPACITY = 500
CONVERGENCE_FACTOR = 0.85                 // exponential convergence per tick
```

**Threshold Definitions (per layer, per metric):**

Define a `THRESHOLDS` object structured as:

```
THRESHOLDS = {
  power: {
    totalFacilityPower:       { healthyMax: 900,  warningMax: 1100, criticalMin: 1100 },
    itEquipmentPower:         { healthyMax: 750,  warningMax: 900,  criticalMin: 900 },
    pue:                      { healthyMax: 1.3,  warningMax: 1.5,  criticalMin: 1.5 },
    gridCarbonIntensity:      { healthyMax: 200,  warningMax: 400,  criticalMin: 400 },
    renewableEnergyFraction:  { healthyMin: 0.6,  warningMin: 0.4,  criticalMax: 0.4 }  // inverted
  },
  cooling: {
    coolingSetpoint:          { healthyMax: 22,   warningMax: 26,   criticalMin: 26 },
    waterUsageRate:           { healthyMax: 800,  warningMax: 1200, criticalMin: 1200 },
    wue:                      { healthyMax: 1.0,  warningMax: 1.8,  criticalMin: 1.8 },
    ambientTemperature:       { healthyMax: 30,   warningMax: 38,   criticalMin: 38 },
    coolantSupplyTemperature: { healthyMax: 18,   warningMax: 24,   criticalMin: 24 }
  },
  gpu: {
    averageGpuTemperature:    { healthyMax: 72,   warningMax: 83,   criticalMin: 83 },
    gpuUtilizationRate:       { healthyMin: 0.7,  warningMin: 0.5,  criticalMax: 0.5 },  // inverted
    activeGpuCount:           { healthyMin: 240,  warningMin: 200,  criticalMax: 200 },   // inverted
    gpuIdlePowerWaste:        { healthyMax: 30,   warningMax: 60,   criticalMin: 60 },
    hardwareFailureRate:      { healthyMax: 0,    warningMax: 2,    criticalMin: 2 }
  },
  workload: {
    requestVolume:            { healthyMax: 10000, warningMax: 14000, criticalMin: 14000 },
    averageInferenceLatency:  { healthyMax: 100,   warningMax: 200,   criticalMin: 200 },
    queueDepth:               { healthyMax: 50,    warningMax: 200,   criticalMin: 200 },
    requestDropRate:          { healthyMax: 0,     warningMax: 0.01,  criticalMin: 0.01 },
    batchEfficiency:          { healthyMin: 0.8,   warningMin: 0.6,   criticalMax: 0.6 }  // inverted
  },
  location: {
    ambientTemperature:       { healthyMax: 30,   warningMax: 38,   criticalMin: 38 },
    gridCarbonIntensity:      { healthyMax: 200,  warningMax: 400,  criticalMin: 400 },
    renewableEnergyFraction:  { healthyMin: 0.6,  warningMin: 0.4,  criticalMax: 0.4 },  // inverted
    waterStressIndex:         { healthyMax: 0.3,  warningMax: 0.6,  criticalMin: 0.6 },
    localAirQualityIndex:     { healthyMax: 50,   warningMax: 100,  criticalMin: 100 }
  }
}
```

For each threshold entry, also store `direction: 'above' | 'below'` to indicate whether breaching means going above or below. Metrics like `gpuUtilizationRate`, `activeGpuCount`, `renewableEnergyFraction`, `batchEfficiency` use `'below'` (bad when too low); all others use `'above'` (bad when too high).

**Drift Config:**

```
DRIFT_CONFIG = {
  ambientTemperature: {
    dayDrift: +0.1,       // °C/tick during daytime (simulated hours 6–18)
    nightDrift: -0.05,    // °C/tick during nighttime
    noise: 0.3            // ±°C random
  },
  gpuTemperature: {
    loadDrift: +0.02,     // °C/tick under load
    noise: 0.1
  },
  gridCarbonIntensity: {
    type: 'sinusoidal',   // peaks at midday
    amplitude: 50,        // gCO2/kWh
    noise: 10
  },
  requestVolume: {
    businessHoursDrift: +50,    // req/hr/tick
    offPeakDrift: -30,
    noise: 100
  },
  waterStressIndex: {
    drift: 0,
    noise: 0.01
  }
}
```

**Recommendation Templates:**

Define an array of 10 recommendation template objects, one for each trigger from PRD Section 6:

```
RECOMMENDATION_TEMPLATES = [
  {
    id: 'rec-tpl-01',
    condition: 'PUE > 1.3 for 5+ ticks',
    severity: 'warning',
    title: 'Elevated PUE Detected',
    bodyTemplate: 'PUE has remained above 1.3 for the past {duration}...',
    suggestedLever: 'gpuPowerLimit',
    // ... full template per PRD
  },
  // ... all 10 templates
]
```

Each template has: `id`, `conditionFn` name (a string key mapping to a function), `requiredTicks` (how many consecutive ticks the condition must hold), `severity`, `title`, `bodyTemplate`, `suggestedLever`, `suggestedValueFn` name, `layerAffected`.

**Confidence Note (constant string):**

```
CONFIDENCE_NOTE = "This recommendation is generated by a rule-based simulation engine. In a production system, AI-generated recommendations carry model uncertainty and may reflect biases in training data. Always apply human judgment before acting on automated suggestions."
```

**Lever Definitions:**

Define a `LEVER_DEFINITIONS` record mapping `layerId.leverId` to `{ min, max, step, unit, type }` for validation:

```
LEVER_DEFINITIONS = {
  'power.powerCap':                { min: 600, max: 1200, step: 50, unit: 'kW', type: 'slider' },
  'power.renewablePriorityMode':   { min: 0, max: 1, step: 1, unit: '', type: 'toggle' },
  'cooling.coolingSetpoint':       { min: 16, max: 30, step: 1, unit: '°C', type: 'slider' },
  'cooling.fanSpeedOverride':      { min: 0.4, max: 1.0, step: 0.05, unit: '', type: 'slider' },
  'cooling.waterRecirculationMode':{ min: 0, max: 1, step: 1, unit: '', type: 'toggle' },
  'gpu.gpuPowerLimit':             { min: 200, max: 700, step: 50, unit: 'W', type: 'slider' },
  'gpu.thermalThrottleThreshold':  { min: 75, max: 90, step: 1, unit: '°C', type: 'slider' },
  'workload.requestRateLimit':     { min: 2000, max: 16000, step: 500, unit: 'req/hr', type: 'slider' },
  'workload.batchSize':            { min: 1, max: 64, step: 1, unit: '', type: 'slider' },
  'workload.priorityQueueWeight':  { min: 0.5, max: 0.9, step: 0.1, unit: '', type: 'slider' }
}
```

Note: `gpu.gracefulRackShutdown` is a special case (array of 10 booleans) — validate separately as `rackIndex` (0–9) and boolean value.

### 2.3 `packages/shared/src/formulas.ts`

Every function is pure — takes primitive numbers, returns a number. No state object references.

```
computePUE(totalFacilityPower: number, itEquipmentPower: number): number
  // Guard: if itEquipmentPower === 0, return 1.0
  // return totalFacilityPower / itEquipmentPower

computeWUE(waterUsageRate: number, itEquipmentPower: number): number
  // Guard: if itEquipmentPower === 0, return 0
  // return waterUsageRate / itEquipmentPower

computeCUE(totalFacilityPower: number, gridCarbonIntensity: number, itEquipmentPower: number): number
  // Guard: if itEquipmentPower === 0, return 0
  // return (totalFacilityPower * gridCarbonIntensity) / (itEquipmentPower * 1000)

computeCarbonOutput(totalFacilityPower: number, gridCarbonIntensity: number): number
  // return totalFacilityPower * gridCarbonIntensity / 1000
  // Unit: kgCO2/hr

computeGpuIdlePowerWaste(gpuUtilizationRate: number, gpuPowerLimit: number, activeGpuCount: number): number
  // return (1 - gpuUtilizationRate) * gpuPowerLimit * activeGpuCount / 1000
  // Unit: kW

computeITEquipmentPower(activeGpuCount: number, gpuPowerLimit: number, gpuUtilizationRate: number): number
  // return activeGpuCount * gpuPowerLimit * (0.4 + 0.6 * gpuUtilizationRate) / 1000
  // Unit: kW

computeCoolingPower(ambientTemp: number, fanSpeed: number, recircMode: boolean, coolingSetpoint: number): number
  // baseCoolingPower = 120
  // ambientFactor = 1 + Math.max(0, (ambientTemp - 20)) * 0.04
  // fanFactor = fanSpeed  (0.4–1.0)
  // recircPenalty = recircMode ? 1.15 : 1.0
  // setpointFactor = Math.max(0.6, 1 - (coolingSetpoint - 18) * 0.05)
  // return baseCoolingPower * ambientFactor * fanFactor * recircPenalty * setpointFactor

computeWaterUsageRate(ambientTemp: number, coolingSetpoint: number, recircMode: boolean): number
  // baseWaterRate = 600
  // temperatureFactor = 1 + Math.max(0, (ambientTemp - 20)) * 0.035
  // setpointFactor = Math.max(0.3, 1 - (coolingSetpoint - 18) * 0.06)
  // recircSavings = recircMode ? 0.70 : 1.0
  // return baseWaterRate * temperatureFactor * setpointFactor * recircSavings

computeGpuTemperature(utilization: number, coolingSetpoint: number, ambientTemp: number, gpuPowerLimit: number): number
  // baseTemp = 55
  // utilizationHeat = utilization * 25
  // coolingEffect = Math.max(0, (coolingSetpoint - 18)) * 1.2
  // ambientEffect = Math.max(0, (ambientTemp - 25)) * 0.8
  // powerEffect = (gpuPowerLimit - 200) / 500 * 5
  // return baseTemp + utilizationHeat + coolingEffect + ambientEffect + powerEffect

computeInferenceLatency(avgGpuTemp: number, queueDepth: number, batchSize: number): number
  // baseLatency = 45
  // temperaturePenalty = Math.max(0, (avgGpuTemp - 72)) * 2.5
  // queuePenalty = queueDepth * 0.8
  // batchPenalty = (batchSize - 1) * 1.2
  // return baseLatency + temperaturePenalty + queuePenalty + batchPenalty

computeQueueDepth(prevQueueDepth: number, requestVolume: number, requestRateLimit: number, effectiveThroughput: number): number
  // inboundRate = Math.min(requestVolume, requestRateLimit)
  // surplus = Math.max(0, inboundRate - effectiveThroughput)
  // tickIntervalHours = 300 / 3600  (SIMULATED_SECONDS_PER_TICK / 3600)
  // return prevQueueDepth * 0.9 + surplus * tickIntervalHours
  // Clamp to >= 0

computeRequestDropRate(queueDepth: number, requestVolume: number, requestRateLimit: number): number
  // inboundRate = Math.min(requestVolume, requestRateLimit)
  // Guard: if inboundRate === 0, return 0
  // return Math.max(0, (queueDepth - 500)) / inboundRate
  // Clamp to 0–1

computeBatchEfficiency(gpuUtilizationRate: number, batchSize: number): number
  // return Math.min(1.0, gpuUtilizationRate * (batchSize / 64) * 1.2)

computeEffectiveThroughput(activeGpuCount: number, gpuUtilizationRate: number, gpuPowerLimit: number, batchSize: number): number
  // baseCapacity = 40  // req/hr per GPU
  // return activeGpuCount * gpuUtilizationRate * (gpuPowerLimit / 700) * Math.min(batchSize, 64) / 1 * baseCapacity
  // Simplified: activeGpuCount * baseCapacity * gpuUtilizationRate * (gpuPowerLimit / 700) * Math.sqrt(batchSize)
  // Note: Use the PRD formula exactly:
  //   effectiveThroughput = activeGpuCount * gpuUtilizationRate * (700 / gpuPowerLimit) * (64 / batchSize) * baseRequestCapacityPerGpu
  // WAIT — re-read PRD: the formula is as written. Higher gpuPowerLimit = LOWER throughput? That seems backwards.
  // Actually re-reading: the PRD formula on line 1857 says (700 / gpuPowerLimit) * (64 / batchSize). This is intentional:
  //   - Lower power limit → higher ratio → more throughput? That's wrong for real life but it's the PRD formula.
  //   - Actually this represents: at lower power, GPUs run slower, so per-GPU capacity is: baseCapacity * (gpuPowerLimit / 700).
  //   - The PRD formula seems inverted. Let me re-read carefully.
  //
  // PRD says: effectiveThroughput = activeGpuCount * gpuUtilizationRate * (700 / gpuPowerLimit) * (64 / batchSize) * baseRequestCapacityPerGpu
  // This means: higher power limit → LOWER throughput multiplier, which is counter-intuitive.
  // HOWEVER: the PRD is the spec. Implement it exactly as written.
  //
  // return activeGpuCount * gpuUtilizationRate * (700 / gpuPowerLimit) * (64 / batchSize) * 40
```

**IMPORTANT IMPLEMENTATION NOTE:** The `computeEffectiveThroughput` formula from the PRD (line 1857) appears to have inverted ratios. The coding agent MUST implement it exactly as the PRD states: `activeGpuCount * gpuUtilizationRate * (700 / gpuPowerLimit) * (64 / batchSize) * 40`. Do not "fix" it.

### 2.4 Package Configuration

**`packages/shared/package.json`:**
```json
{
  "name": "@izakaya/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

Create `packages/shared/src/index.ts` as a barrel that re-exports everything from `types.ts`, `constants.ts`, and `formulas.ts`.

**`packages/shared/tsconfig.json`:** Extend `../../tsconfig.base.json`, set `compilerOptions.outDir` to `dist`, `rootDir` to `src`, enable `declaration: true`, `composite: true`.

---

## 3. Phase 2: Simulation Engine Core

### 3.1 SimulationEngine Class (`packages/backend/src/simulation/engine.ts`)

```
class SimulationEngine {
  // --- State ---
  private state: SimulationState
  private changeLog: ChangeLogEntry[]
  private alertHistory: Alert[]
  private recommendationHistory: Recommendation[]
  private intervalId: NodeJS.Timeout | null
  private broadcast: BroadcastFn
  private scenarioStartTick: number | null
  private activeEffects: ActiveEffect[]        // tracked scenario effects
  private recommendationTickCounters: Map<string, number>  // template ID → consecutive tick count
  private previousAlertKeys: Set<string>       // for deduplication: "layerId:metricId:severity"
  private pendingOutcomeChecks: PendingOutcomeCheck[]  // for 5-minute-later outcome recording

  // --- Constructor ---
  constructor(broadcast: BroadcastFn) {
    this.state = createSeedState()
    this.changeLog = []
    this.alertHistory = []
    this.recommendationHistory = []
    this.intervalId = null
    this.broadcast = broadcast
    this.scenarioStartTick = null
    this.activeEffects = []
    this.recommendationTickCounters = new Map()
    this.previousAlertKeys = new Set()
    this.pendingOutcomeChecks = []
  }

  // --- Public Methods ---
  start(): void
    // this.intervalId = setInterval(() => this.tick(), TICK_RATE_MS)

  stop(): void
    // clearInterval(this.intervalId)

  getState(): SimulationState
    // return this.state

  getChangeLog(): ChangeLogEntry[]
    // return this.changeLog

  getAlertHistory(): Alert[]
    // return this.alertHistory

  getRecommendationHistory(): Recommendation[]
    // return this.recommendationHistory

  getActiveRecommendations(): Recommendation[]
    // return this.state.activeRecommendations.filter(r => r.status === 'active')

  getScenarioDefinitions(): ScenarioDefinition[]
    // return SCENARIO_DEFINITIONS (imported from scenarios.ts)

  activateScenario(scenarioId: string, mode: 'live' | 'simulation'): result
    // Validate scenario exists, no other scenario active
    // If mode === 'simulation': deep-clone state, set mode to 'simulation'
    // Set state.activeScenario = scenarioId
    // Record scenarioStartTick = state.tick
    // Return { success, scenarioId, estimatedDurationTicks }

  applyLeverChange(layerId: string, leverId: string, newValue: number | boolean): void
    // Navigate to state.layers[layerId].levers[leverId] and set the new value
    // For gracefulRackShutdown, accept { rackIndex: number, value: boolean }

  commitAction(action: CommitActionRequest): CommitActionResponse
    // Described in detail in Phase 8 (Lever Effect Calculation)

  dismissRecommendation(recId: string): boolean
    // Find rec in state.activeRecommendations, set status to 'dismissed', set dismissedAt

  // --- Private: The Tick Method ---
  private tick(): void
```

### 3.2 State Initialization (`seed.ts`)

`createSeedState()` returns the exact JSON from PRD Section 16, typed as `SimulationState`. Hardcode the entire seed state object. Include the seed alert and seed recommendation as specified.

### 3.3 The Tick Method — Internal Ordering

```
private tick(): void {
  // Step 1: Advance time
  state.tick += 1
  state.simulatedTimeSeconds += SIMULATED_SECONDS_PER_TICK  // 300
  state.timestamp = new Date(Date.parse(BASE_TIME) + state.simulatedTimeSeconds * 1000).toISOString()

  // Step 2: Apply drift
  applyEnvironmentalDrift(state)

  // Step 3: Apply scenario events
  IF state.activeScenario !== null:
    tickOffset = state.tick - this.scenarioStartTick
    applyScenarioEvents(state, this.activeEffects, this.scenarioStartTick)
    IF tickOffset > scenarioDefinition.totalDurationTicks:
      deactivateScenario(state, this.activeEffects)
    ELSE:
      broadcast('scenario:progress', {
        scenarioId: state.activeScenario,
        ticksElapsed: tickOffset,
        totalTicks: scenarioDefinition.totalDurationTicks,
        phase: determinePhase(tickOffset, scenarioDefinition)
      })

  // Step 4: Propagate dependencies
  propagateLayerDependencies(state)

  // Step 5: Recalculate derived metrics
  this.recalculateDerivedMetrics()

  // Step 6: Evaluate alerts
  evaluateAlerts(state, this.alertHistory, this.previousAlertKeys, this.broadcast)

  // Step 7: Evaluate recommendations
  evaluateRecommendations(state, this.recommendationHistory, this.recommendationTickCounters, this.broadcast)

  // Step 8: Check pending outcome recordings (5-minute-later snapshots for change log)
  this.checkPendingOutcomes()

  // Step 9: Update cumulative totals
  tickIntervalHours = SIMULATED_SECONDS_PER_TICK / 3600
  state.derivedMetrics.totalCarbonEmittedKg += state.derivedMetrics.carbonOutputKgPerHr * tickIntervalHours
  state.derivedMetrics.totalWaterConsumedLiters += state.layers.cooling.waterUsageRate * tickIntervalHours

  // Step 10: NaN guard — check all derived metrics with Number.isFinite()
  FOR EACH metric in state.derivedMetrics:
    IF !Number.isFinite(metric): clamp to valid range boundary, log warning

  // Step 11: Broadcast
  broadcast('state:update', state)
}
```

### 3.4 `applyEnvironmentalDrift(state)` — `drift.ts`

```
function applyEnvironmentalDrift(state: SimulationState): void {
  // Determine simulated hour of day
  simulatedHour = (state.simulatedTimeSeconds / 3600) % 24
  isDaytime = simulatedHour >= 6 AND simulatedHour < 18

  // --- Location Layer ---
  // Ambient Temperature
  drift = isDaytime ? DRIFT_CONFIG.ambientTemperature.dayDrift : DRIFT_CONFIG.ambientTemperature.nightDrift
  noise = randomInRange(-DRIFT_CONFIG.ambientTemperature.noise, +DRIFT_CONFIG.ambientTemperature.noise)
  state.layers.location.ambientTemperature += drift + noise
  CLAMP state.layers.location.ambientTemperature to [10, 50]

  // Grid Carbon Intensity — sinusoidal
  // Baseline around 180, peaks at midday (hour 12)
  hourAngle = (simulatedHour / 24) * 2 * PI
  sinComponent = Math.sin(hourAngle - PI/2) * DRIFT_CONFIG.gridCarbonIntensity.amplitude
  noise = randomInRange(-10, +10)
  state.layers.location.gridCarbonIntensity = 180 + sinComponent + noise
  CLAMP to [50, 800]

  // Renewable Energy Fraction — inverse of carbon intensity
  state.layers.location.renewableEnergyFraction = Math.max(0, Math.min(1,
    0.65 - (state.layers.location.gridCarbonIntensity - 180) / 500
  ))

  // Water Stress Index — very stable
  noise = randomInRange(-0.01, +0.01)
  state.layers.location.waterStressIndex += noise
  CLAMP to [0, 1]

  // Local Air Quality Index — stable with small noise
  noise = randomInRange(-2, +2)
  state.layers.location.localAirQualityIndex += noise
  CLAMP to [0, 500]

  // --- Sync location values to other layers that mirror them ---
  state.layers.cooling.ambientTemperature = state.layers.location.ambientTemperature
  state.layers.power.gridCarbonIntensity = state.layers.location.gridCarbonIntensity
  state.layers.power.renewableEnergyFraction = state.layers.location.renewableEnergyFraction

  // --- GPU Temperature drift (slight upward under load) ---
  IF state.layers.gpu.gpuUtilizationRate > 0.3:
    drift = DRIFT_CONFIG.gpuTemperature.loadDrift  // +0.02
    noise = randomInRange(-0.1, +0.1)
    state.layers.gpu.averageGpuTemperature += drift + noise

  // --- Request Volume drift (time-of-day) ---
  isBusinessHours = simulatedHour >= 8 AND simulatedHour < 20
  drift = isBusinessHours ? +50 : -30
  noise = randomInRange(-100, +100)
  state.layers.workload.requestVolume += drift + noise
  CLAMP to [1000, 30000]

  // --- GPU degradation: if any rack > 85°C for 10 consecutive ticks, one GPU fails ---
  // Track a counter (engine-level) per rack for consecutive hot ticks
  // If averageGpuTemperature > 85 for 10+ ticks: activeGpuCount -= 1, hardwareFailureRate += 1
}
```

`randomInRange(min, max)` → `min + Math.random() * (max - min)`

### 3.5 `propagateLayerDependencies(state)` — `dependencies.ts`

Uses the convergence formula: `value = target + (current - target) * CONVERGENCE_FACTOR` where `CONVERGENCE_FACTOR = 0.85`.

This means: each tick, the value moves 15% closer to the target. The "target" is the equilibrium computed from the formula functions.

```
function propagateLayerDependencies(state: SimulationState): void {
  const s = state.layers
  const convergence = CONVERGENCE_FACTOR  // 0.85

  // --- Step 1: Location → Cooling ---
  // Ambient temp already synced in drift.ts
  // Compute target coolant supply temperature from ambient and setpoint
  targetCoolantTemp = s.cooling.levers.coolingSetpoint - 6 + Math.max(0, (s.cooling.ambientTemperature - 25)) * 0.5
  s.cooling.coolantSupplyTemperature = targetCoolantTemp + (s.cooling.coolantSupplyTemperature - targetCoolantTemp) * convergence

  // Compute target cooling power
  targetCoolingPower = computeCoolingPower(
    s.cooling.ambientTemperature,
    s.cooling.levers.fanSpeedOverride,
    s.cooling.levers.waterRecirculationMode,
    s.cooling.levers.coolingSetpoint
  )
  s.cooling.coolingPower = targetCoolingPower  // Note: cooling.coolingPower doesn't exist on CoolingLayerState
  // Store on power layer instead:
  s.power.coolingPower = targetCoolingPower + (s.power.coolingPower - targetCoolingPower) * convergence

  // Compute target water usage
  targetWaterUsage = computeWaterUsageRate(
    s.cooling.ambientTemperature,
    s.cooling.levers.coolingSetpoint,
    s.cooling.levers.waterRecirculationMode
  )
  s.cooling.waterUsageRate = targetWaterUsage + (s.cooling.waterUsageRate - targetWaterUsage) * convergence

  // Sync cooling setpoint metric to lever value
  s.cooling.coolingSetpoint = s.cooling.levers.coolingSetpoint

  // --- Step 2: Cooling → GPU ---
  // Determine effective GPU utilization based on thermal throttling
  // If temp > thermalThrottleThreshold, utilization is capped
  targetGpuTemp = computeGpuTemperature(
    s.gpu.gpuUtilizationRate,
    s.cooling.levers.coolingSetpoint,
    s.cooling.ambientTemperature,
    s.gpu.levers.gpuPowerLimit
  )
  s.gpu.averageGpuTemperature = targetGpuTemp + (s.gpu.averageGpuTemperature - targetGpuTemp) * convergence

  // Thermal throttling: if GPU temp > threshold, reduce utilization
  IF s.gpu.averageGpuTemperature > s.gpu.levers.thermalThrottleThreshold:
    throttleFactor = 1 - (s.gpu.averageGpuTemperature - s.gpu.levers.thermalThrottleThreshold) * 0.05
    throttleFactor = CLAMP(throttleFactor, 0.3, 1.0)
    s.gpu.gpuUtilizationRate *= throttleFactor

  // Active GPU count: count racks not shut down × 24, minus failed GPUs
  activeRacks = s.gpu.levers.gracefulRackShutdown.filter(shutdown => !shutdown).length
  maxActiveGpus = activeRacks * GPUS_PER_RACK
  // Subtract any failed GPUs (tracked by hardwareFailureRate accumulation)
  s.gpu.activeGpuCount = Math.min(s.gpu.activeGpuCount, maxActiveGpus)

  // --- Step 3: GPU → Workload ---
  // Compute effective throughput
  effectiveThroughput = computeEffectiveThroughput(
    s.gpu.activeGpuCount,
    s.gpu.gpuUtilizationRate,
    s.gpu.levers.gpuPowerLimit,
    s.workload.levers.batchSize
  )

  // Compute queue depth
  targetQueueDepth = computeQueueDepth(
    s.workload.queueDepth,
    s.workload.requestVolume,
    s.workload.levers.requestRateLimit,
    effectiveThroughput
  )
  s.workload.queueDepth = Math.max(0, targetQueueDepth)

  // Compute utilization based on workload demand
  inboundRate = Math.min(s.workload.requestVolume, s.workload.levers.requestRateLimit)
  targetUtilization = Math.min(1.0, inboundRate / (effectiveThroughput || 1))
  s.gpu.gpuUtilizationRate = targetUtilization + (s.gpu.gpuUtilizationRate - targetUtilization) * convergence

  // Drop rate
  s.workload.requestDropRate = computeRequestDropRate(
    s.workload.queueDepth,
    s.workload.requestVolume,
    s.workload.levers.requestRateLimit
  )

  // Latency
  targetLatency = computeInferenceLatency(
    s.gpu.averageGpuTemperature,
    s.workload.queueDepth,
    s.workload.levers.batchSize
  )
  s.workload.averageInferenceLatency = targetLatency + (s.workload.averageInferenceLatency - targetLatency) * convergence

  // Batch efficiency
  s.workload.batchEfficiency = computeBatchEfficiency(s.gpu.gpuUtilizationRate, s.workload.levers.batchSize)

  // --- Step 4: Workload + GPU → Power ---
  // IT equipment power
  targetITPower = computeITEquipmentPower(
    s.gpu.activeGpuCount,
    s.gpu.levers.gpuPowerLimit,
    s.gpu.gpuUtilizationRate
  )
  s.power.itEquipmentPower = targetITPower + (s.power.itEquipmentPower - targetITPower) * convergence

  // Total facility power (enforce power cap)
  rawTotal = s.power.itEquipmentPower + s.power.coolingPower + s.power.overheadPower
  s.power.totalFacilityPower = Math.min(rawTotal, s.power.levers.powerCap)

  // If power-capped, proportionally reduce IT power
  IF rawTotal > s.power.levers.powerCap:
    excess = rawTotal - s.power.levers.powerCap
    // Reduce IT equipment power to fit under cap
    s.power.itEquipmentPower = Math.max(0, s.power.itEquipmentPower - excess)

  // GPU idle power waste
  s.gpu.gpuIdlePowerWaste = computeGpuIdlePowerWaste(
    s.gpu.gpuUtilizationRate,
    s.gpu.levers.gpuPowerLimit,
    s.gpu.activeGpuCount
  )
}
```

### 3.6 `recalculateDerivedMetrics()` — Inside engine.ts

```
private recalculateDerivedMetrics(): void {
  const s = this.state.layers
  const d = this.state.derivedMetrics

  d.pue = computePUE(s.power.totalFacilityPower, s.power.itEquipmentPower)
  d.wue = computeWUE(s.cooling.waterUsageRate, s.power.itEquipmentPower)
  d.cue = computeCUE(s.power.totalFacilityPower, s.location.gridCarbonIntensity, s.power.itEquipmentPower)
  d.carbonOutputKgPerHr = computeCarbonOutput(s.power.totalFacilityPower, s.location.gridCarbonIntensity)
  d.gpuIdlePowerWasteKw = s.gpu.gpuIdlePowerWaste

  // Also update the power layer's PUE mirror
  s.power.pue = d.pue
  s.cooling.wue = d.wue
}
```

### 3.7 `evaluateAlerts(state, alertHistory, previousAlertKeys, broadcast)` — `alerts.ts`

```
function evaluateAlerts(
  state: SimulationState,
  alertHistory: Alert[],
  previousAlertKeys: Set<string>,
  broadcast: BroadcastFn
): void {

  currentAlertKeys = new Set<string>()

  FOR EACH [layerId, layerThresholds] in THRESHOLDS:
    layer = state.layers[layerId]
    FOR EACH [metricId, thresholds] in layerThresholds:
      value = layer[metricId]
      severity = evaluateThreshold(value, thresholds)  // returns 'healthy' | 'warning' | 'critical'

      IF severity !== 'healthy':
        key = `${layerId}:${metricId}:${severity}`
        currentAlertKeys.add(key)

        // DEDUPLICATION: only create a new alert if this key was NOT in previousAlertKeys
        IF key NOT IN previousAlertKeys:
          alert = {
            id: uuid(),
            timestamp: state.timestamp,
            severity: severity,
            layerId: layerId,
            metricId: metricId,
            metricName: METRIC_NAMES[metricId],
            currentValue: value,
            threshold: severity === 'warning' ? thresholds.warningMax : thresholds.criticalMin,
            thresholdDirection: thresholds.direction,
            message: generateAlertMessage(metricId, value, severity),
            acknowledged: false
          }
          state.activeAlerts.push(alert)
          alertHistory.push(alert)
          broadcast('alert:new', alert)

  // RESOLUTION: remove alerts whose key is no longer in currentAlertKeys
  state.activeAlerts = state.activeAlerts.filter(alert => {
    key = `${alert.layerId}:${alert.metricId}:${alert.severity}`
    return currentAlertKeys.has(key)
  })

  // Update previousAlertKeys for next tick
  previousAlertKeys.clear()
  FOR EACH key in currentAlertKeys: previousAlertKeys.add(key)

  // Update each layer's health to worst-case of its metrics
  FOR EACH [layerId, layerThresholds] in THRESHOLDS:
    worstHealth = 'healthy'
    FOR EACH [metricId, thresholds] in layerThresholds:
      metricHealth = evaluateThreshold(state.layers[layerId][metricId], thresholds)
      IF metricHealth === 'critical': worstHealth = 'critical'
      ELSE IF metricHealth === 'warning' AND worstHealth !== 'critical': worstHealth = 'warning'
    state.layers[layerId].health = worstHealth
}

function evaluateThreshold(value, thresholds): HealthStatus {
  IF thresholds.direction === 'above':
    IF value > thresholds.criticalMin: return 'critical'
    IF value > thresholds.healthyMax: return 'warning'
    return 'healthy'
  ELSE:  // 'below' — bad when low
    IF value < thresholds.criticalMax: return 'critical'
    IF value < thresholds.healthyMin: return 'warning'
    return 'healthy'
}
```

### 3.8 `evaluateRecommendations(state, recHistory, tickCounters, broadcast)` — `recommendations.ts`

```
function evaluateRecommendations(
  state: SimulationState,
  recHistory: Recommendation[],
  tickCounters: Map<string, number>,
  broadcast: BroadcastFn
): void {

  FOR EACH template in RECOMMENDATION_TEMPLATES:
    conditionMet = evaluateCondition(template, state)

    IF conditionMet:
      currentCount = tickCounters.get(template.id) ?? 0
      tickCounters.set(template.id, currentCount + 1)

      IF tickCounters.get(template.id) >= template.requiredTicks:
        // Check deduplication: is there already an active recommendation from this template?
        existing = state.activeRecommendations.find(r =>
          r.triggerCondition === template.condition AND r.status === 'active'
        )
        IF existing: SKIP  // don't re-fire

        // Generate recommendation from template
        rec = {
          id: uuid(),
          timestamp: state.timestamp,
          severity: template.severity,
          layerAffected: template.layerAffected,
          triggerCondition: template.condition,
          title: template.title,
          body: interpolateBody(template.bodyTemplate, state),
          suggestedAction: {
            lever: template.suggestedLever,
            suggestedValue: computeSuggestedValue(template, state),
            currentValue: getCurrentLeverValue(state, template.suggestedLever)
          },
          projectedImpact: computeProjectedImpact(template, state),
          status: 'active',
          dismissedAt: null,
          actedOnAt: null,
          resolvedAt: null,
          confidenceNote: CONFIDENCE_NOTE
        }
        state.activeRecommendations.push(rec)
        recHistory.push(rec)
        broadcast('recommendation:new', rec)

    ELSE:
      // Condition no longer met — reset counter
      tickCounters.set(template.id, 0)

      // Auto-resolve any active recommendations from this template
      FOR EACH rec in state.activeRecommendations:
        IF rec.triggerCondition === template.condition AND rec.status === 'active':
          rec.status = 'resolved'
          rec.resolvedAt = state.timestamp

  // Check if any lever changes match active recommendation's suggestedAction (within 20%)
  FOR EACH rec in state.activeRecommendations:
    IF rec.status === 'active':
      currentLeverValue = getCurrentLeverValue(state, rec.suggestedAction.lever)
      IF currentLeverValue !== rec.suggestedAction.currentValue:
        // Lever was changed
        difference = Math.abs(currentLeverValue - rec.suggestedAction.suggestedValue)
        range = Math.abs(rec.suggestedAction.suggestedValue - rec.suggestedAction.currentValue)
        IF range > 0 AND difference / range <= 0.2:
          rec.status = 'acted_on'
          rec.actedOnAt = state.timestamp
}
```

**Condition evaluation functions** (one per template):

| Template | Condition | Implementation |
|----------|-----------|----------------|
| 1 | PUE > 1.3 for 5+ ticks | `state.derivedMetrics.pue > 1.3` |
| 2 | PUE > 1.5 for 3+ ticks | `state.derivedMetrics.pue > 1.5` |
| 3 | WUE > 1.0 for 5+ ticks | `state.derivedMetrics.wue > 1.0` |
| 4 | WUE > 1.8 for 3+ ticks | `state.derivedMetrics.wue > 1.8` |
| 5 | Avg GPU Temp > 78°C for 5+ ticks | `state.layers.gpu.averageGpuTemperature > 78` |
| 6 | Avg GPU Temp > 83°C for 2+ ticks | `state.layers.gpu.averageGpuTemperature > 83` |
| 7 | GPU Utilization < 50% for 10+ ticks | `state.layers.gpu.gpuUtilizationRate < 0.5` |
| 8 | Request Drop Rate > 0.5% | `state.layers.workload.requestDropRate > 0.005` (immediate, requiredTicks = 1) |
| 9 | Request Drop Rate > 2% | `state.layers.workload.requestDropRate > 0.02` (immediate, requiredTicks = 1) |
| 10 | Grid Carbon Intensity > 400 for 3+ ticks | `state.layers.location.gridCarbonIntensity > 400` |

### 3.9 Scenario Event Processing

When a scenario is active, `applyScenarioEvents` is called each tick.

**ActiveEffect type** (internal to engine, not in shared types):

```
interface ActiveEffect {
  event: ScenarioEvent
  appliedAtTick: number
  expiresAtTick: number
  originalValue: number          // value of the metric before this effect was applied (for 'set' operations)
}
```

```
function applyScenarioEvents(
  state: SimulationState,
  activeEffects: ActiveEffect[],
  scenarioStartTick: number
): void {
  scenario = findScenarioById(state.activeScenario)
  tickOffset = state.tick - scenarioStartTick

  // Step 1: Apply new events that start on this tick
  FOR EACH event in scenario.events:
    IF event.tickOffset === tickOffset:
      layer = state.layers[event.layerAffected]
      currentValue = layer[event.metricAffected]

      effect = {
        event: event,
        appliedAtTick: state.tick,
        expiresAtTick: state.tick + event.durationTicks,
        originalValue: currentValue
      }
      activeEffects.push(effect)

      // Apply the effect
      SWITCH event.operation:
        'set': layer[event.metricAffected] = event.value
        'add': layer[event.metricAffected] += event.value
        'multiply': layer[event.metricAffected] *= event.value

  // Step 2: Remove expired effects
  FOR i = activeEffects.length - 1 DOWN TO 0:
    IF state.tick >= activeEffects[i].expiresAtTick:
      // Effect expired — metric returns to drift behavior naturally via convergence
      // No need to "undo" the effect — the convergence formula in propagateDependencies
      // will naturally move the metric back toward equilibrium
      activeEffects.splice(i, 1)

  // Step 3: Re-apply still-active 'set' effects (they override drift)
  FOR EACH effect in activeEffects:
    IF effect.event.operation === 'set':
      state.layers[effect.event.layerAffected][effect.event.metricAffected] = effect.event.value
}
```

### 3.10 Simulation Mode (What-If Fork)

When `activateScenario` is called with `mode === 'simulation'`:

```
activateScenario(scenarioId, mode):
  IF mode === 'simulation':
    // Deep-clone the live state
    this.liveStateBackup = JSON.parse(JSON.stringify(this.state))
    this.state.mode = 'simulation'
  
  this.state.activeScenario = scenarioId
  this.scenarioStartTick = this.state.tick
  this.activeEffects = []

deactivateScenario():
  IF this.state.mode === 'simulation':
    // Discard fork, restore live state
    this.state = this.liveStateBackup
    this.liveStateBackup = null
  
  this.state.activeScenario = null
  this.scenarioStartTick = null
  this.activeEffects = []
```

---

## 4. Phase 3: Scenario Definitions

All 5 scenarios defined as `ScenarioDefinition` objects in `packages/backend/src/simulation/scenarios.ts`.

### Scenario 1: Heatwave Stress Event

```
{
  id: 'heatwave-001',
  name: 'Heatwave Stress Event',
  description: 'An extreme heatwave drives ambient temperature to 42°C over 20 ticks, overwhelming the cooling system and stressing GPUs.',
  affectedLayers: ['location', 'cooling', 'gpu', 'power'],
  triggerType: 'manual',
  autoTriggerCondition: 'ambientTemperature > 35 for 5 ticks',
  totalDurationTicks: 25,
  events: [
    // Ambient Temperature ramp: set at each phase
    { tickOffset: 0,  layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'set', value: 28, durationTicks: 5 },
    { tickOffset: 5,  layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'set', value: 33, durationTicks: 5 },
    { tickOffset: 10, layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'set', value: 38, durationTicks: 5 },
    { tickOffset: 15, layerAffected: 'location', metricAffected: 'ambientTemperature', operation: 'set', value: 42, durationTicks: 10 },
    // Coolant supply temperature rises
    { tickOffset: 5,  layerAffected: 'cooling', metricAffected: 'coolantSupplyTemperature', operation: 'set', value: 19, durationTicks: 5 },
    { tickOffset: 10, layerAffected: 'cooling', metricAffected: 'coolantSupplyTemperature', operation: 'set', value: 22, durationTicks: 5 },
    { tickOffset: 15, layerAffected: 'cooling', metricAffected: 'coolantSupplyTemperature', operation: 'set', value: 25, durationTicks: 5 },
    { tickOffset: 20, layerAffected: 'cooling', metricAffected: 'coolantSupplyTemperature', operation: 'set', value: 26, durationTicks: 5 },
  ],
  recommendationTriggers: [
    { tickOffset: 5,  recommendationTemplateId: 'rec-tpl-05' },  // GPU Fleet Running Hot
    { tickOffset: 10, recommendationTemplateId: 'rec-tpl-03' },  // Water Efficiency Below Target
    { tickOffset: 10, recommendationTemplateId: 'rec-tpl-01' },  // Elevated PUE
    { tickOffset: 15, recommendationTemplateId: 'rec-tpl-06' },  // Critical GPU Temps
    { tickOffset: 15, recommendationTemplateId: 'rec-tpl-04' },  // Critical Water Usage
  ],
  resolution: 'Lower GPU power limit to 400W, increase fan speed to 90%, reduce request rate limit to 6000 req/hr.',
  endUserImpactSummary: 'At peak: latency 55ms→180ms. With rate limiting, ~2000 req/hr dropped.',
  ethicalDimension: 'Choose between water conservation (community resource during heatwave) and service quality.'
}
```

### Scenario 2: Demand Spike

```
{
  id: 'demand-spike-001',
  name: 'Demand Spike',
  description: 'A viral event causes request volume to triple over 10 ticks.',
  affectedLayers: ['workload', 'gpu', 'power', 'cooling'],
  triggerType: 'manual',
  autoTriggerCondition: 'requestVolume > 12000 for 3 ticks',
  totalDurationTicks: 15,
  events: [
    { tickOffset: 0,  layerAffected: 'workload', metricAffected: 'requestVolume', operation: 'set', value: 8000,  durationTicks: 3 },
    { tickOffset: 3,  layerAffected: 'workload', metricAffected: 'requestVolume', operation: 'set', value: 12000, durationTicks: 3 },
    { tickOffset: 6,  layerAffected: 'workload', metricAffected: 'requestVolume', operation: 'set', value: 18000, durationTicks: 4 },
    { tickOffset: 10, layerAffected: 'workload', metricAffected: 'requestVolume', operation: 'set', value: 24000, durationTicks: 5 },
  ],
  recommendationTriggers: [
    { tickOffset: 3,  recommendationTemplateId: 'rec-tpl-08' },  // Requests Being Dropped
    { tickOffset: 6,  recommendationTemplateId: 'rec-tpl-06' },  // Critical GPU Temps
    { tickOffset: 6,  recommendationTemplateId: 'rec-tpl-09' },  // Significant Service Degradation
    { tickOffset: 8,  recommendationTemplateId: 'rec-tpl-01' },  // Elevated PUE
  ],
  resolution: 'Rate-limit to ~10000 req/hr, batch size 32, priority queue 80/20.',
  endUserImpactSummary: 'At peak: 67% free-tier requests dropped or >5s latency. Premium: 55ms→120ms.',
  ethicalDimension: 'Increasing priority queue weight protects paying customers at expense of free-tier users.'
}
```

### Scenario 3: Grid Carbon Intensity Spike

```
{
  id: 'carbon-spike-001',
  name: 'Grid Carbon Intensity Spike',
  description: 'Grid carbon intensity spikes to 600 gCO2/kWh, tripling carbon footprint.',
  affectedLayers: ['location', 'power'],
  triggerType: 'manual',
  autoTriggerCondition: 'gridCarbonIntensity > 350',
  totalDurationTicks: 20,
  events: [
    { tickOffset: 0,  layerAffected: 'location', metricAffected: 'gridCarbonIntensity', operation: 'set', value: 180, durationTicks: 5 },
    { tickOffset: 5,  layerAffected: 'location', metricAffected: 'gridCarbonIntensity', operation: 'set', value: 350, durationTicks: 5 },
    { tickOffset: 5,  layerAffected: 'location', metricAffected: 'renewableEnergyFraction', operation: 'set', value: 0.35, durationTicks: 5 },
    { tickOffset: 10, layerAffected: 'location', metricAffected: 'gridCarbonIntensity', operation: 'set', value: 500, durationTicks: 5 },
    { tickOffset: 10, layerAffected: 'location', metricAffected: 'renewableEnergyFraction', operation: 'set', value: 0.20, durationTicks: 5 },
    { tickOffset: 15, layerAffected: 'location', metricAffected: 'gridCarbonIntensity', operation: 'set', value: 600, durationTicks: 5 },
    { tickOffset: 15, layerAffected: 'location', metricAffected: 'renewableEnergyFraction', operation: 'set', value: 0.10, durationTicks: 5 },
  ],
  recommendationTriggers: [
    { tickOffset: 5,  recommendationTemplateId: 'rec-tpl-10' },  // High Grid Carbon
    { tickOffset: 10, recommendationTemplateId: 'rec-tpl-02' },  // Critical PUE
  ],
  resolution: 'Enable Renewable Priority Mode, reduce Power Cap to 800kW.',
  endUserImpactSummary: 'Renewable Priority Mode defers 20% of requests by 10–30 min for batch workloads.',
  ethicalDimension: 'Each hour of inaction emits +335 kgCO2, equivalent to driving 1350 km.'
}
```

### Scenario 4: GPU Fleet Degradation

```
{
  id: 'gpu-degradation-001',
  name: 'GPU Fleet Degradation',
  description: 'Firmware bug causes accelerating GPU failures. Active GPUs drop from 240 to below 160.',
  affectedLayers: ['gpu', 'workload', 'power'],
  triggerType: 'manual',
  autoTriggerCondition: 'hardwareFailureRate > 2',
  totalDurationTicks: 25,
  events: [
    { tickOffset: 5,  layerAffected: 'gpu', metricAffected: 'activeGpuCount', operation: 'set', value: 230, durationTicks: 5 },
    { tickOffset: 5,  layerAffected: 'gpu', metricAffected: 'hardwareFailureRate', operation: 'set', value: 2, durationTicks: 5 },
    { tickOffset: 10, layerAffected: 'gpu', metricAffected: 'activeGpuCount', operation: 'set', value: 210, durationTicks: 5 },
    { tickOffset: 10, layerAffected: 'gpu', metricAffected: 'hardwareFailureRate', operation: 'set', value: 3, durationTicks: 5 },
    { tickOffset: 15, layerAffected: 'gpu', metricAffected: 'activeGpuCount', operation: 'set', value: 180, durationTicks: 5 },
    { tickOffset: 15, layerAffected: 'gpu', metricAffected: 'hardwareFailureRate', operation: 'set', value: 5, durationTicks: 5 },
    { tickOffset: 20, layerAffected: 'gpu', metricAffected: 'activeGpuCount', operation: 'set', value: 160, durationTicks: 5 },
    { tickOffset: 20, layerAffected: 'gpu', metricAffected: 'hardwareFailureRate', operation: 'set', value: 5, durationTicks: 5 },
  ],
  recommendationTriggers: [
    { tickOffset: 10, recommendationTemplateId: 'rec-tpl-08' },  // Requests Being Dropped
    { tickOffset: 15, recommendationTemplateId: 'rec-tpl-09' },  // Significant Service Degradation
  ],
  resolution: 'Shut down failing racks, reduce rate limit to 5000 req/hr, batch size 48.',
  endUserImpactSummary: 'At worst: 12% request drop rate. Service degraded for all users.',
  ethicalDimension: 'Maintain high throughput (risk cascading failure) vs proactive reduction (immediate degradation).'
}
```

### Scenario 5: Water Scarcity Alert

```
{
  id: 'water-scarcity-001',
  name: 'Water Scarcity Alert',
  description: 'Regional drought spikes Water Stress Index from 0.3 to 0.8.',
  affectedLayers: ['location', 'cooling', 'gpu'],
  triggerType: 'manual',
  autoTriggerCondition: 'waterStressIndex > 0.5',
  totalDurationTicks: 20,
  events: [
    { tickOffset: 0,  layerAffected: 'location', metricAffected: 'waterStressIndex', operation: 'set', value: 0.3, durationTicks: 5 },
    { tickOffset: 5,  layerAffected: 'location', metricAffected: 'waterStressIndex', operation: 'set', value: 0.5, durationTicks: 5 },
    { tickOffset: 10, layerAffected: 'location', metricAffected: 'waterStressIndex', operation: 'set', value: 0.7, durationTicks: 5 },
    { tickOffset: 15, layerAffected: 'location', metricAffected: 'waterStressIndex', operation: 'set', value: 0.8, durationTicks: 5 },
  ],
  recommendationTriggers: [
    { tickOffset: 5,  recommendationTemplateId: 'rec-tpl-03' },  // Water Efficiency Below Target
    { tickOffset: 10, recommendationTemplateId: 'rec-tpl-04' },  // Critical Water Usage
    { tickOffset: 15, recommendationTemplateId: 'rec-tpl-emergency-water' },  // Emergency Water Conservation (special)
  ],
  resolution: 'Enable Water Recirculation Mode, raise setpoint to 26°C, fan speed 85%.',
  endUserImpactSummary: 'Slightly increased latency (~+15ms). No request drops.',
  ethicalDimension: 'Same water consumption becomes ethically heavier as community has less water.'
}
```

**Emergency Water Conservation** recommendation (template ID `rec-tpl-emergency-water`):
- severity: `'critical'`
- title: `'Emergency Water Conservation'`
- body: `'Community water stress is critical. Consider enabling Water Recirculation Mode and raising cooling setpoint to minimize water draw. Local authorities may impose mandatory restrictions.'`
- suggestedLever: `'waterRecirculationMode'`
- suggestedValue: `1` (true)
- Add this as template #11 in `RECOMMENDATION_TEMPLATES`.

---

## 5. Phase 4: REST API

### 5.1 `GET /api/state`

**File:** `stateController.ts`  
**Function:** `getState`  
**Behavior:**
1. Call `engine.getState()`
2. Return `{ state: simulationState }` with status 200

**Error cases:** None (always returns current state).

### 5.2 `GET /api/scenarios`

**File:** `scenariosController.ts`  
**Function:** `listScenarios`  
**Behavior:**
1. Call `engine.getScenarioDefinitions()`
2. Return `{ scenarios: definitions }` with status 200

### 5.3 `POST /api/scenarios/:id/activate`

**File:** `scenariosController.ts`  
**Function:** `activateScenario`  
**Input validation:**
- `req.params.id` must match a known scenario ID → 404 if not
- `req.body.mode` must be `'live'` or `'simulation'` → 400 if missing/invalid
- No other scenario currently active (`state.activeScenario === null`) → 409 if one is active

**Behavior:**
1. Validate inputs
2. Call `engine.activateScenario(id, mode)`
3. Return `{ success: true, scenarioId: id, estimatedDurationTicks: scenario.totalDurationTicks }` with status 200

**Error responses:**
- `404: { error: "Scenario not found" }`
- `409: { error: "Another scenario is already active" }`
- `400: { error: "Invalid mode. Must be 'live' or 'simulation'" }`

### 5.4 `POST /api/actions`

**File:** `actionsController.ts`  
**Function:** `commitAction`  
**Input validation (in this order):**
1. `req.body.tradeoffAcknowledgment.acknowledged` must be `true` → `400: { error: "Tradeoff acknowledgment required" }`
2. `req.body.layerId` must be one of `['power', 'cooling', 'gpu', 'workload']` → `400: { error: "Invalid layer ID" }`
3. `req.body.leverId` must be a valid lever for that layer (checked against `LEVER_DEFINITIONS`) → `400: { error: "Invalid lever ID for layer" }`
4. `req.body.newValue` must be within `[min, max]` of the lever definition → `400: { error: "Value out of range" }`
5. `state.mode` must not be `'simulation'` → `409: { error: "Cannot commit during active simulation" }`

**Behavior (after validation):**
1. Compute projected impact (see Phase 8 below)
2. Apply the lever change to the simulation state: `engine.applyLeverChange(layerId, leverId, newValue)`
3. Create a `ChangeLogEntry`:
   - `id`: uuid()
   - `timestamp`: current state timestamp
   - `operatorAction`: `"${layerId}.${leverId}: ${previousValue} → ${newValue}"`
   - Copy `layerId`, `leverId`, `previousValue`, `newValue` from request
   - Copy `tradeoffAcknowledgment` from request, adding `acknowledgedAt: new Date().toISOString()`
   - `outcomeAtCommit`: snapshot of all current derived metrics as `Record<string, number>`
   - `outcomeAfterFiveMinutes`: `null` (will be filled in later)
   - `endUserImpactActual`: compute from current state (see below)
4. Append entry to `engine.changeLog`
5. Schedule a pending outcome check for 1 tick later (300 simulated seconds = 1 tick, but PRD says "5 minutes" which is 1 tick)
6. Broadcast `action:confirmed` event: `{ changeLogEntryId: entry.id, success: true }`
7. Return `{ success: true, changeLogEntryId: entry.id, projectedImpact: { metricChanges } }` with status 200

**EndUserImpact calculation for the response:**
```
latencyChangeMs = projectedLatency - currentLatency
throughputChange = projectedThroughput - currentThroughput
requestsAffected = Math.abs(throughputChange)
premiumShare = state.layers.workload.levers.priorityQueueWeight
freeShare = 1 - premiumShare
affectedSegments = {
  premium: {
    latencyMs: currentLatency + latencyChangeMs * (1 - premiumShare),
    dropRate: currentDropRate * (1 - premiumShare)
  },
  free: {
    latencyMs: currentLatency + latencyChangeMs * (1 + freeShare),
    dropRate: currentDropRate * (1 + freeShare)
  }
}
```

### 5.5 `GET /api/logs`

**File:** `logsController.ts`  
**Function:** `getLogs`  
**Behavior:**
1. Read `limit` from query param (default 50, max 200)
2. Read `offset` from query param (default 0)
3. Get `engine.getChangeLog()`
4. Reverse the array (most recent first)
5. Slice `[offset, offset + limit]`
6. Return `{ entries: sliced, total: changeLog.length }` with status 200

### 5.6 `GET /api/recommendations`

**File:** `recommendationsController.ts`  
**Function:** `listActive`  
**Behavior:**
1. Return `{ recommendations: engine.getActiveRecommendations() }` with status 200

### 5.7 `POST /api/recommendations/:id/dismiss`

**File:** `recommendationsController.ts`  
**Function:** `dismiss`  
**Input validation:**
- `req.params.id` must match an active recommendation → 404 if not found

**Behavior:**
1. Call `engine.dismissRecommendation(id)`
2. Return `{ success: true, recommendationId: id }` with status 200

**Error:** `404: { error: "Recommendation not found" }`

### 5.8 `router.ts`

```
function createRouter(engine: SimulationEngine): Router {
  router = express.Router()

  router.get('/state', getState(engine))
  router.get('/scenarios', listScenarios(engine))
  router.post('/scenarios/:id/activate', activateScenario(engine))
  router.post('/actions', commitAction(engine))
  router.get('/logs', getLogs(engine))
  router.get('/recommendations', listActive(engine))
  router.post('/recommendations/:id/dismiss', dismiss(engine))

  return router
}
```

Each controller function is a factory that takes the engine instance and returns an Express `RequestHandler`. This avoids global state.

---

## 6. Phase 5: WebSocket Server

### `packages/backend/src/websocket/connectionManager.ts`

```
function createWebSocketServer(httpServer: http.Server): {
  broadcast: BroadcastFn,
  getClientCount: () => number
} {

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' })
  const clients: Set<WebSocket> = new Set()

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws)

    // Send current state immediately so client doesn't wait for next tick
    // (The engine will be passed via closure or the broadcast function will be set up
    //  to allow the engine to send the initial state. Actually, the engine calls broadcast
    //  which iterates clients. For the initial state, we need engine access.)
    // DESIGN DECISION: The connectionManager does NOT have a reference to the engine.
    // Instead, the engine's broadcast function is what connectionManager returns.
    // For initial state on connect, the index.ts wires it:
    //   on connection → call engine.getState() → send to that single client.

    ws.on('close', () => {
      clients.delete(ws)
    })

    ws.on('error', () => {
      clients.delete(ws)
    })

    ws.on('pong', () => {
      // Client is alive — mark it
      (ws as any).isAlive = true
    })
  })

  // Heartbeat: ping every 30s, terminate if no pong within 10s
  const heartbeatInterval = setInterval(() => {
    for (const ws of clients) {
      if ((ws as any).isAlive === false) {
        ws.terminate()
        clients.delete(ws)
        continue
      }
      (ws as any).isAlive = false
      ws.ping()
    }
  }, 30000)

  wss.on('close', () => {
    clearInterval(heartbeatInterval)
  })

  // Broadcast function
  function broadcast(event: string, data: unknown): void {
    const message = JSON.stringify({ event, data })
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      } else {
        clients.delete(ws)
      }
    }
  }

  return {
    broadcast,
    getClientCount: () => clients.size,
    // Also expose wss for the index.ts to wire initial state on connection:
    onConnection: (handler: (ws: WebSocket) => void) => {
      wss.on('connection', handler)
    }
  }
}
```

**Message format (all messages):**
```json
{
  "event": "state:update" | "alert:new" | "recommendation:new" | "scenario:progress" | "action:confirmed",
  "data": { /* typed payload */ }
}
```

WebSocket is server-push only. The client communicates via REST. No client→server WebSocket messages need to be handled.

---

## 7. Phase 6: Server Entry Point

### `packages/backend/src/index.ts`

```
import express from 'express'
import cors from 'cors'
import http from 'http'
import { createWebSocketServer } from './websocket/connectionManager'
import { SimulationEngine } from './simulation/engine'
import { createRouter } from './api/router'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001

// Step 1: Create Express app with middleware
const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

// Step 2: Create HTTP server (shared between Express and ws)
const server = http.createServer(app)

// Step 3: Create WebSocket server attached to HTTP server
const { broadcast, onConnection } = createWebSocketServer(server)

// Step 4: Create simulation engine with broadcast function
const engine = new SimulationEngine(broadcast)

// Step 5: Wire initial state send on WebSocket connection
onConnection((ws) => {
  const message = JSON.stringify({ event: 'state:update', data: engine.getState() })
  ws.send(message)
})

// Step 6: Mount REST API router
app.use('/api', createRouter(engine))

// Step 7: Error-handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Step 8: Start engine tick loop
engine.start()

// Step 9: Listen
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`)
})

// Step 10: Graceful shutdown
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

function shutdown() {
  console.log('Shutting down...')
  engine.stop()
  server.close(() => {
    console.log('Server closed.')
    process.exit(0)
  })
  // Force exit after 5s if server doesn't close
  setTimeout(() => process.exit(1), 5000)
}
```

### Package Configuration

**`packages/backend/package.json`:**
```json
{
  "name": "@izakaya/backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx --watch src/index.ts",
    "build": "tsup src/index.ts --format esm"
  },
  "dependencies": {
    "@izakaya/shared": "workspace:*",
    "express": "^4.19.2",
    "ws": "^8.18.0",
    "uuid": "^10.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/express": "^4.17.21",
    "@types/ws": "^8.5.12",
    "@types/uuid": "^10.0.0",
    "@types/cors": "^2.8.17",
    "tsx": "^4.16.5",
    "tsup": "^8.2.4"
  }
}
```

**`packages/backend/tsconfig.json`:** Extend `../../tsconfig.base.json`. Set `module: "ESNext"`, `moduleResolution: "bundler"`, add project reference to `../shared`.

**Root `package.json`:**
```json
{
  "name": "izakaya",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=packages/backend & npm run dev --workspace=packages/frontend",
    "build": "npm run build --workspace=packages/shared && npm run build --workspace=packages/backend && npm run build --workspace=packages/frontend"
  }
}
```

**`tsconfig.base.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## 8. Phase 7: Lever Effect Calculation

When `POST /api/actions` is called, the backend must compute `projectedImpact` before applying the lever change. This is a "what would happen" calculation.

### Algorithm

```
function computeProjectedImpact(engine, layerId, leverId, newValue): ProjectedImpact {
  // Step 1: Deep-clone the current state
  forkedState = JSON.parse(JSON.stringify(engine.getState()))

  // Step 2: Apply the lever change on the fork
  forkedState.layers[layerId].levers[leverId] = newValue

  // Step 3: Run one tick of propagation on the fork (NO drift, NO scenario events)
  propagateLayerDependencies(forkedState)
  // Recalculate derived metrics on the fork
  recalculateDerivedMetricsOnState(forkedState)

  // Step 4: Diff the original and forked states
  originalState = engine.getState()
  metricChanges = []

  // Compare key metrics across all layers
  metricsToCompare = [
    { metric: 'totalFacilityPower', layer: 'power' },
    { metric: 'itEquipmentPower', layer: 'power' },
    { metric: 'pue', layer: 'derivedMetrics' },
    { metric: 'waterUsageRate', layer: 'cooling' },
    { metric: 'wue', layer: 'derivedMetrics' },
    { metric: 'averageGpuTemperature', layer: 'gpu' },
    { metric: 'gpuUtilizationRate', layer: 'gpu' },
    { metric: 'averageInferenceLatency', layer: 'workload' },
    { metric: 'queueDepth', layer: 'workload' },
    { metric: 'requestDropRate', layer: 'workload' },
    { metric: 'carbonOutputKgPerHr', layer: 'derivedMetrics' },
    { metric: 'coolingPower', layer: 'power' },
  ]

  FOR EACH { metric, layer } in metricsToCompare:
    originalValue = getMetricValue(originalState, layer, metric)
    projectedValue = getMetricValue(forkedState, layer, metric)
    IF Math.abs(projectedValue - originalValue) > 0.01:  // only include meaningful changes
      metricChanges.push({
        metric: metric,
        projectedValue: round(projectedValue, 2)
      })

  return { metricChanges }
}
```

**Key implementation detail:** `recalculateDerivedMetricsOnState` is a standalone function (not a method on the engine) that takes a state object and updates its `derivedMetrics` in place. It calls the same shared formula functions. This function should live in `engine.ts` or be extracted to a utility.

**Where this is called:** In `actionsController.ts`, before `engine.applyLeverChange()`.

### Pending Outcome Checks

After committing an action, the engine schedules a check for 1 tick later (since 1 tick = 5 simulated minutes):

```
interface PendingOutcomeCheck {
  changeLogEntryId: string
  checkAtTick: number              // state.tick + 1
  projectedMetrics: Record<string, number>  // the projected values from commitAction
}
```

In the tick method, `checkPendingOutcomes()` iterates `pendingOutcomeChecks`:

```
function checkPendingOutcomes(): void {
  FOR i = pendingOutcomeChecks.length - 1 DOWN TO 0:
    check = pendingOutcomeChecks[i]
    IF state.tick >= check.checkAtTick:
      entry = changeLog.find(e => e.id === check.changeLogEntryId)
      IF entry:
        currentMetrics = snapshotDerivedMetrics(state)
        entry.outcomeAfterFiveMinutes = {
          metrics: currentMetrics,
          projectionAccuracy: compareProjectionToActual(check.projectedMetrics, currentMetrics)
        }
      pendingOutcomeChecks.splice(i, 1)
}

function compareProjectionToActual(projected, actual): 'matched' | 'worse' | 'better' {
  // Compare key metrics. If actual PUE, latency, water usage are worse than projected → 'worse'
  // If better → 'better'. If within 10% → 'matched'
  totalDeviation = 0
  count = 0
  FOR EACH key in projected:
    IF key in actual:
      deviation = (actual[key] - projected[key]) / (projected[key] || 1)
      totalDeviation += deviation
      count += 1
  avgDeviation = totalDeviation / (count || 1)
  IF avgDeviation > 0.1: return 'worse'
  IF avgDeviation < -0.1: return 'better'
  return 'matched'
}
```

---

## 9. Testing Strategy

No automated tests for the hackathon. The following behaviors should be manually verified during development:

### Simulation Core
- [ ] Server starts without errors on `npm run dev`
- [ ] `state.tick` increments every 2 seconds (check via `GET /api/state`)
- [ ] `state.timestamp` advances by 5 simulated minutes per tick
- [ ] Metrics drift slightly each tick (ambient temp, request volume)
- [ ] Derived metrics (PUE, WUE, CUE, carbon output) are computed correctly — spot-check against formulas
- [ ] NaN never appears in any metric value

### WebSocket
- [ ] Connecting to `ws://localhost:3001/ws` receives an immediate `state:update`
- [ ] Subsequent `state:update` messages arrive every ~2 seconds
- [ ] Opening a second WebSocket connection works; both receive updates
- [ ] Disconnecting and reconnecting works

### REST Endpoints
- [ ] `GET /api/state` returns valid SimulationState JSON
- [ ] `GET /api/scenarios` returns all 5 scenario definitions
- [ ] `POST /api/scenarios/heatwave-001/activate` with `{ "mode": "simulation" }` returns 200
- [ ] `POST /api/scenarios/nonexistent/activate` returns 404
- [ ] Activating a scenario while one is active returns 409
- [ ] `POST /api/actions` with valid body returns 200 with projectedImpact
- [ ] `POST /api/actions` without `acknowledged: true` returns 400
- [ ] `POST /api/actions` with out-of-range value returns 400
- [ ] `POST /api/actions` during simulation mode returns 409
- [ ] `GET /api/logs` returns change log entries after actions are committed
- [ ] `GET /api/logs?limit=1&offset=0` returns paginated results
- [ ] `GET /api/recommendations` returns active recommendations
- [ ] `POST /api/recommendations/:id/dismiss` changes status to dismissed

### Scenarios
- [ ] Activating Heatwave scenario causes ambient temperature to rise over ~20 ticks
- [ ] Scenario progress events are broadcast via WebSocket
- [ ] Alerts fire as scenario pushes metrics past thresholds
- [ ] Recommendations fire at appropriate scenario tick offsets
- [ ] After scenario ends, state returns to normal drift behavior
- [ ] Simulation mode (`mode: 'simulation'`) preserves live state — exiting restores it

### Alerts
- [ ] Alert fires when a metric crosses a warning threshold
- [ ] Alert fires when a metric crosses a critical threshold
- [ ] Same alert does NOT fire again on the next tick (deduplication)
- [ ] Alert resolves (removed from activeAlerts) when metric returns to healthy
- [ ] Layer health updates to worst-case of its metrics

### Recommendations
- [ ] Recommendation fires after the required number of consecutive ticks
- [ ] Same recommendation does NOT re-fire while an active one exists (deduplication)
- [ ] Recommendation auto-resolves when condition is no longer met
- [ ] Dismissing a recommendation via API changes its status
- [ ] Changing a lever close to the suggested value marks recommendation as `acted_on`

### Lever Effects
- [ ] Changing cooling setpoint affects GPU temperature, water usage, and cooling power over subsequent ticks
- [ ] Shutting down a rack reduces active GPU count by 24
- [ ] Reducing GPU power limit reduces temperatures and IT power
- [ ] Reducing request rate limit reduces queue depth and drop rate
- [ ] Power cap limits total facility power
- [ ] `projectedImpact` in action response shows meaningful metric changes
- [ ] Change log entry's `outcomeAfterFiveMinutes` populates after 1 tick

---

## Appendix: Helper Functions Needed

These small utility functions should be created inline within the files that need them (not in separate files):

1. **`randomInRange(min, max)`** — returns `min + Math.random() * (max - min)`. Used in `drift.ts`.

2. **`clamp(value, min, max)`** — returns `Math.min(max, Math.max(min, value))`. Used throughout.

3. **`snapshotDerivedMetrics(state)`** — returns a `Record<string, number>` of all derived metric values. Used for change log outcome recording.

4. **`generateAlertMessage(metricId, value, severity)`** — returns a human-readable alert message string. A simple switch/map on metricId.

5. **`interpolateBody(template, state)`** — replaces `{placeholder}` tokens in recommendation body templates with actual values from state.

6. **`computeSuggestedValue(template, state)`** — for each recommendation template, computes the appropriate suggested lever value based on current state. Simple arithmetic per template.

7. **`getCurrentLeverValue(state, leverKey)`** — navigates `state.layers[layer].levers[lever]` given a dot-notation key like `"cooling.coolingSetpoint"`.

8. **`getMetricValue(state, layerOrDerived, metricKey)`** — navigates state to get a metric value from either a layer state or derivedMetrics.

9. **`deepClone(obj)`** — `JSON.parse(JSON.stringify(obj))`. Used for state forking.
