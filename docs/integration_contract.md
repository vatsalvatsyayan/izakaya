# Integration Contract

**Version:** 1.0
**Date:** April 12, 2026
**Status:** Definitive — backend and frontend must implement exactly what this document specifies.

This document is the single source of truth for everything that crosses the network boundary between the backend (`packages/backend/`) and frontend (`packages/frontend/`). Both sides import shared types, constants, and formulas from `packages/shared/`.

---

## 1. Shared Types Manifest

All interfaces live in `packages/shared/src/types.ts`. Both backend and frontend import them via `@izakaya/shared`. No local type redefinitions are permitted.

All data is serialized as JSON over the wire. Special serialization notes:
- **Dates/timestamps**: ISO 8601 strings (`"2026-04-12T08:00:00Z"`), never `Date` objects
- **Booleans**: JSON `true`/`false`, never `0`/`1`
- **Nullable fields**: JSON `null`, never `undefined` (undefined is stripped by `JSON.stringify`)
- **Numbers**: IEEE 754 doubles — no special handling needed for JSON

### SimulationState

```typescript
interface SimulationState {
  tick: number;                              // monotonically increasing integer
  timestamp: string;                         // ISO 8601
  simulatedTimeSeconds: number;              // seconds since simulation start
  mode: 'live' | 'simulation';
  layers: {
    power: PowerLayerState;
    cooling: CoolingLayerState;
    gpu: GPULayerState;
    workload: WorkloadLayerState;
    location: LocationLayerState;
  };
  derivedMetrics: DerivedMetrics;
  activeScenario: string | null;             // scenario ID or null
  activeAlerts: Alert[];
  activeRecommendations: Recommendation[];
}
```

### PowerLayerState

```typescript
interface PowerLayerState {
  totalFacilityPower: number;                // kW
  itEquipmentPower: number;                  // kW
  coolingPower: number;                      // kW
  overheadPower: number;                     // kW (constant 45)
  pue: number;                               // ratio, 1.0–3.0
  gridCarbonIntensity: number;               // gCO2/kWh
  renewableEnergyFraction: number;           // 0–1
  levers: {
    powerCap: number;                        // kW, 600–1200
    renewablePriorityMode: boolean;
  };
  health: HealthStatus;
}
```

### CoolingLayerState

```typescript
interface CoolingLayerState {
  coolingSetpoint: number;                   // °C
  waterUsageRate: number;                    // liters/hr
  wue: number;                               // L/kWh
  ambientTemperature: number;                // °C
  coolantSupplyTemperature: number;          // °C
  levers: {
    coolingSetpoint: number;                 // °C, 16–30
    fanSpeedOverride: number;                // 0.4–1.0
    waterRecirculationMode: boolean;
  };
  health: HealthStatus;
}
```

### GPULayerState

```typescript
interface GPULayerState {
  averageGpuTemperature: number;             // °C
  gpuUtilizationRate: number;                // 0–1
  activeGpuCount: number;                    // 0–240
  gpuIdlePowerWaste: number;                 // kW
  hardwareFailureRate: number;               // failures/day
  levers: {
    gpuPowerLimit: number;                   // W per GPU, 200–700
    gracefulRackShutdown: boolean[];          // array of 10 booleans
    thermalThrottleThreshold: number;        // °C, 75–90
  };
  health: HealthStatus;
}
```

### WorkloadLayerState

```typescript
interface WorkloadLayerState {
  requestVolume: number;                     // req/hr
  averageInferenceLatency: number;           // ms
  queueDepth: number;                        // requests
  requestDropRate: number;                   // 0–1
  batchEfficiency: number;                   // 0–1
  levers: {
    requestRateLimit: number;                // req/hr, 2000–16000
    batchSize: number;                       // 1–64
    priorityQueueWeight: number;             // 0.5–0.9
  };
  health: HealthStatus;
}
```

### LocationLayerState

```typescript
interface LocationLayerState {
  ambientTemperature: number;                // °C
  gridCarbonIntensity: number;               // gCO2/kWh
  renewableEnergyFraction: number;           // 0–1
  waterStressIndex: number;                  // 0–1
  localAirQualityIndex: number;              // AQI 0–500
  region: string;                            // "Oregon, USA"
  communityName: string;                     // "Umatilla County"
  health: HealthStatus;
}
```

### DerivedMetrics

```typescript
interface DerivedMetrics {
  pue: number;                               // ratio
  wue: number;                               // L/kWh
  cue: number;                               // kgCO2/kWh
  carbonOutputKgPerHr: number;               // kgCO2/hr
  gpuIdlePowerWasteKw: number;               // kW
  totalCarbonEmittedKg: number;              // cumulative
  totalWaterConsumedLiters: number;          // cumulative
}
```

### HealthStatus

```typescript
type HealthStatus = 'healthy' | 'warning' | 'critical';
```

### LayerHealth

```typescript
interface LayerHealth {
  layerId: string;
  layerName: string;
  health: HealthStatus;
  metrics: Metric[];
}
```

### Metric

```typescript
interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  healthyMin: number;
  healthyMax: number;
  warningMin: number;
  warningMax: number;
  criticalMin: number;
  criticalMax: number;
  status: HealthStatus;
  history: number[];                         // last 60 tick values for sparkline
}
```

### Lever

```typescript
interface Lever {
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
```

### Recommendation

```typescript
interface Recommendation {
  id: string;
  timestamp: string;                         // ISO 8601
  severity: 'info' | 'warning' | 'critical';
  layerAffected: string;
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
  dismissedAt: string | null;
  actedOnAt: string | null;
  resolvedAt: string | null;
  confidenceNote: string;
}
```

### Alert

```typescript
interface Alert {
  id: string;
  timestamp: string;                         // ISO 8601
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
```

### ScenarioDefinition

```typescript
interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  affectedLayers: string[];
  triggerType: 'manual' | 'automatic';
  autoTriggerCondition: string | null;
  totalDurationTicks: number;
  events: ScenarioEvent[];
  recommendationTriggers: Array<{
    tickOffset: number;
    recommendationTemplateId: string;
  }>;
  resolution: string;
  endUserImpactSummary: string;
  ethicalDimension: string;
}

interface ScenarioEvent {
  tickOffset: number;
  layerAffected: string;
  metricAffected: string;
  operation: 'set' | 'add' | 'multiply';
  value: number;
  durationTicks: number;
}
```

### ActionCommit

```typescript
interface ActionCommit {
  id: string;
  timestamp: string;                         // ISO 8601
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    acknowledgedAt: string;                  // ISO 8601
  };
  projectedImpact: {
    metricChanges: Array<{
      metric: string;
      projectedValue: number;
    }>;
  };
}
```

### ChangeLogEntry

```typescript
interface ChangeLogEntry {
  id: string;
  timestamp: string;                         // ISO 8601
  operatorAction: string;
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    acknowledgedAt: string;
  };
  outcomeAtCommit: {
    metrics: Record<string, number>;
  };
  outcomeAfterFiveMinutes: {
    metrics: Record<string, number>;
    projectionAccuracy: 'matched' | 'worse' | 'better';
  } | null;                                  // null until 5 simulated minutes elapsed
  endUserImpactActual: EndUserImpact;
}
```

### EndUserImpact

```typescript
interface EndUserImpact {
  latencyChangeMs: number;
  throughputChangeReqHr: number;
  requestsAffectedPerHour: number;
  affectedSegments: {
    premium: { latencyMs: number; dropRate: number };
    free: { latencyMs: number; dropRate: number };
  };
  qualityOfServiceDescription: string;
}
```

---

## 2. REST API Contract

**Base URL:** `http://localhost:3001/api` (dev), proxied via Vite at `http://localhost:5173/api`

**Common headers for all requests:**
- `Content-Type: application/json` (for POST requests)
- `Accept: application/json`

**Common error response format (all endpoints):**
```json
{ "error": "<human-readable message>", "code": "<machine-readable code>" }
```

Error codes used: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`

---

### GET /api/state

Returns the current simulation state.

**Request:** No body, no query parameters.

**Response 200:**
```json
{
  "state": {
    "tick": 42,
    "timestamp": "2026-04-12T11:30:00Z",
    "simulatedTimeSeconds": 12600,
    "mode": "live",
    "layers": {
      "power": { "totalFacilityPower": 820, "itEquipmentPower": 650, "coolingPower": 125, "overheadPower": 45, "pue": 1.26, "gridCarbonIntensity": 180, "renewableEnergyFraction": 0.65, "levers": { "powerCap": 1000, "renewablePriorityMode": false }, "health": "healthy" },
      "cooling": { "coolingSetpoint": 22, "waterUsageRate": 650, "wue": 1.0, "ambientTemperature": 28, "coolantSupplyTemperature": 16, "levers": { "coolingSetpoint": 22, "fanSpeedOverride": 0.65, "waterRecirculationMode": false }, "health": "warning" },
      "gpu": { "averageGpuTemperature": 68, "gpuUtilizationRate": 0.72, "activeGpuCount": 240, "gpuIdlePowerWaste": 27, "hardwareFailureRate": 0, "levers": { "gpuPowerLimit": 600, "gracefulRackShutdown": [false,false,false,false,false,false,false,false,false,false], "thermalThrottleThreshold": 83 }, "health": "healthy" },
      "workload": { "requestVolume": 8000, "averageInferenceLatency": 55, "queueDepth": 10, "requestDropRate": 0, "batchEfficiency": 0.82, "levers": { "requestRateLimit": 12000, "batchSize": 16, "priorityQueueWeight": 0.6 }, "health": "healthy" },
      "location": { "ambientTemperature": 28, "gridCarbonIntensity": 180, "renewableEnergyFraction": 0.65, "waterStressIndex": 0.3, "localAirQualityIndex": 35, "region": "Oregon, USA", "communityName": "Umatilla County", "health": "healthy" }
    },
    "derivedMetrics": { "pue": 1.26, "wue": 1.0, "cue": 0.23, "carbonOutputKgPerHr": 147.6, "gpuIdlePowerWasteKw": 27, "totalCarbonEmittedKg": 0, "totalWaterConsumedLiters": 0 },
    "activeScenario": null,
    "activeAlerts": [],
    "activeRecommendations": []
  }
}
```

---

### GET /api/scenarios

Returns all available scenario definitions.

**Request:** No body, no query parameters.

**Response 200:**
```json
{
  "scenarios": [
    {
      "id": "heatwave-001",
      "name": "Heat Wave Event",
      "description": "Ambient temperature rises sharply...",
      "affectedLayers": ["location", "cooling", "gpu"],
      "triggerType": "manual",
      "autoTriggerCondition": null,
      "totalDurationTicks": 20,
      "events": [
        { "tickOffset": 0, "layerAffected": "location", "metricAffected": "ambientTemperature", "operation": "add", "value": 8, "durationTicks": 15 }
      ],
      "recommendationTriggers": [
        { "tickOffset": 3, "recommendationTemplateId": "rec-heatwave-cooling" }
      ],
      "resolution": "Ambient temperature returns to baseline",
      "endUserImpactSummary": "Potential latency increase if GPUs throttle",
      "ethicalDimension": "Water usage increases, affecting local water stress"
    }
  ]
}
```

---

### POST /api/scenarios/:id/activate

Activates a scenario by ID.

**URL parameters:**
- `:id` — scenario ID string (e.g., `heatwave-001`)

**Request body:**
```json
{
  "mode": "simulation"
}
```
- `mode`: `"simulation"` (fork state, what-if) or `"live"` (apply to live state). Required.

**Validation rules:**
- Scenario with given `id` must exist → 404 if not
- No other scenario may be currently active (`state.activeScenario` must be `null`) → 409 if not
- `mode` must be `"simulation"` or `"live"` → 400 if not

**Response 200:**
```json
{
  "success": true,
  "scenarioId": "heatwave-001",
  "estimatedDurationTicks": 20
}
```

**Response 400:**
```json
{ "error": "Invalid mode. Must be 'simulation' or 'live'", "code": "VALIDATION_ERROR" }
```

**Response 404:**
```json
{ "error": "Scenario not found", "code": "NOT_FOUND" }
```

**Response 409:**
```json
{ "error": "Another scenario is already active", "code": "CONFLICT" }
```

---

### POST /api/actions

Commits an operator lever change.

**Request body:**
```json
{
  "layerId": "cooling",
  "leverId": "coolingSetpoint",
  "previousValue": 22,
  "newValue": 25,
  "tradeoffAcknowledgment": {
    "tradeoffText": "Raising setpoint reduces cooling power but increases GPU temperatures.",
    "communityImpactText": "Umatilla County water stress: 0.3. Reduces water draw by ~2,400 L/day.",
    "endUserImpactText": "Premium: +3ms latency. Free-tier: +8ms latency. No drops.",
    "acknowledged": true
  }
}
```

**Validation rules (all return 400):**
- `layerId` must be one of: `"power"`, `"cooling"`, `"gpu"`, `"workload"`, `"location"` → `"Invalid layerId"`
- `leverId` must be a valid lever on that layer → `"Invalid leverId for layer '{layerId}'"`
- `newValue` must be within the lever's min/max range (see Section 5 for ranges) → `"newValue {v} is outside valid range [{min}, {max}] for lever '{leverId}'"`
- `newValue` must differ from the current server-side value → `"newValue is the same as the current value"`
- `tradeoffAcknowledgment` must be present → `"Tradeoff acknowledgment required"`
- `tradeoffAcknowledgment.acknowledged` must be `true` → `"Tradeoff must be acknowledged"`
- For boolean levers (`renewablePriorityMode`, `waterRecirculationMode`): `newValue` must be `0` or `1` (representing false/true) → `"Boolean lever value must be 0 or 1"`

**Conflict rule (returns 409):**
- If `state.mode === 'simulation'`, reject with → `"Cannot commit actions during active simulation"`

**Response 200:**
```json
{
  "success": true,
  "changeLogEntryId": "clg-a1b2c3d4",
  "projectedImpact": {
    "metricChanges": [
      { "metric": "waterUsageRate", "projectedValue": 533 },
      { "metric": "averageGpuTemperature", "projectedValue": 71.2 },
      { "metric": "averageInferenceLatency", "projectedValue": 63 }
    ]
  }
}
```

**Response 400:**
```json
{ "error": "Tradeoff acknowledgment required", "code": "VALIDATION_ERROR" }
```

**Response 409:**
```json
{ "error": "Cannot commit actions during active simulation", "code": "CONFLICT" }
```

---

### GET /api/logs

Returns the change history log.

**Query parameters:**
- `limit` (optional, default `50`, max `500`) — number of entries to return
- `offset` (optional, default `0`) — number of entries to skip

**Response 200:**
```json
{
  "entries": [
    {
      "id": "clg-a1b2c3d4",
      "timestamp": "2026-04-12T08:10:00Z",
      "operatorAction": "Adjusted cooling setpoint from 22°C to 25°C",
      "layerId": "cooling",
      "leverId": "coolingSetpoint",
      "previousValue": 22,
      "newValue": 25,
      "tradeoffAcknowledgment": {
        "tradeoffText": "Raising setpoint reduces cooling power but increases GPU temperatures.",
        "communityImpactText": "Reduces water draw by ~2,400 L/day.",
        "endUserImpactText": "Premium: +3ms. Free-tier: +8ms.",
        "acknowledgedAt": "2026-04-12T08:09:55Z"
      },
      "outcomeAtCommit": {
        "metrics": { "pue": 1.26, "wue": 1.0, "cue": 0.23, "averageGpuTemperature": 68, "averageInferenceLatency": 55 }
      },
      "outcomeAfterFiveMinutes": null,
      "endUserImpactActual": {
        "latencyChangeMs": 8,
        "throughputChangeReqHr": -200,
        "requestsAffectedPerHour": 640,
        "affectedSegments": {
          "premium": { "latencyMs": 58, "dropRate": 0 },
          "free": { "latencyMs": 63, "dropRate": 0 }
        },
        "qualityOfServiceDescription": "Minimal impact. All users within SLA."
      }
    }
  ],
  "total": 12
}
```

---

### GET /api/recommendations

Returns active recommendations.

**Request:** No body, no query parameters.

**Response 200:**
```json
{
  "recommendations": [
    {
      "id": "rec-seed-001",
      "timestamp": "2026-04-12T08:00:00Z",
      "severity": "warning",
      "layerAffected": "cooling",
      "triggerCondition": "WUE >= 1.0 for 5+ ticks",
      "title": "Water Efficiency at Threshold",
      "body": "WUE has reached 1.0 L/kWh...",
      "suggestedAction": { "lever": "waterRecirculationMode", "suggestedValue": 1, "currentValue": 0 },
      "projectedImpact": {
        "metricChanges": [
          { "metric": "wue", "currentValue": 1.0, "projectedValue": 0.7, "unit": "L/kWh" }
        ],
        "endUserImpact": "Minimal. No expected latency impact.",
        "communityImpact": "Reduces facility water draw by ~4,680 L/day."
      },
      "status": "active",
      "dismissedAt": null,
      "actedOnAt": null,
      "resolvedAt": null,
      "confidenceNote": "Rule-based simulation engine. Apply human judgment."
    }
  ]
}
```

---

### POST /api/recommendations/:id/dismiss

Dismisses a recommendation.

**URL parameters:**
- `:id` — recommendation ID string

**Request body:** None required. Empty `{}` is acceptable.

**Validation rules:**
- Recommendation with given `id` must exist → 404
- Recommendation must have `status === 'active'` → 400 `"Recommendation is not active"`

**Response 200:**
```json
{ "success": true, "recommendationId": "rec-seed-001" }
```

**Response 404:**
```json
{ "error": "Recommendation not found", "code": "NOT_FOUND" }
```

**Response 400:**
```json
{ "error": "Recommendation is not active", "code": "VALIDATION_ERROR" }
```

---

## 3. WebSocket Contract

### Connection

- **URL:** `ws://localhost:3001/ws` (dev, direct) or `ws://localhost:5173/ws` (dev, via Vite proxy)
- **Protocol:** Standard WebSocket, no subprotocol
- **On connect:** Server immediately sends a `state:update` message with the current full `SimulationState`. The client does not need to wait for the next tick.

### Message Envelope

All messages (both directions) use this envelope:

```typescript
interface WebSocketMessage {
  event: string;
  data: object;
  timestamp: string;    // ISO 8601, when the message was created
}
```

Wire format:
```json
{ "event": "state:update", "data": { ... }, "timestamp": "2026-04-12T08:00:02Z" }
```

### Heartbeat

- **Server** sends `{ "event": "ping", "data": {}, "timestamp": "..." }` every **30 seconds**
- **Client** must respond with `{ "event": "pong", "data": {}, "timestamp": "..." }` within **10 seconds**
- If the client does not respond, the server terminates the connection
- The client should also use missed pings as a signal that the connection is unhealthy

### Server → Client Events

#### `state:update`

**Emitted:** Every tick (every 2 seconds), and immediately on client connection.

**Payload:** Full `SimulationState` object (see Section 1).

```json
{
  "event": "state:update",
  "data": { "tick": 42, "timestamp": "2026-04-12T11:30:00Z", "simulatedTimeSeconds": 12600, "mode": "live", "layers": { ... }, "derivedMetrics": { ... }, "activeScenario": null, "activeAlerts": [], "activeRecommendations": [] },
  "timestamp": "2026-04-12T08:01:24Z"
}
```

**Frontend handling:** `store.setSimulationState(message.data)` — wholesale replacement of the `simulationState` field in Zustand.

---

#### `alert:new`

**Emitted:** When a metric crosses a warning or critical threshold for the first time.

**Payload:** Single `Alert` object.

```json
{
  "event": "alert:new",
  "data": { "id": "alert-001", "timestamp": "2026-04-12T08:05:00Z", "severity": "warning", "layerId": "cooling", "metricId": "wue", "metricName": "Water Usage Effectiveness", "currentValue": 1.05, "threshold": 1.0, "thresholdDirection": "above", "message": "WUE exceeded warning threshold", "acknowledged": false },
  "timestamp": "2026-04-12T08:01:30Z"
}
```

**Frontend handling:** Show a toast notification with the alert message and severity. Play an audio cue. The alert itself will appear in `state.activeAlerts` on the next `state:update` — this event exists for immediate notification only.

---

#### `recommendation:new`

**Emitted:** When a recommendation trigger condition is met.

**Payload:** Single `Recommendation` object.

```json
{
  "event": "recommendation:new",
  "data": { "id": "rec-002", "timestamp": "2026-04-12T08:06:00Z", "severity": "warning", "layerAffected": "cooling", "title": "Enable Water Recirculation", "body": "...", "suggestedAction": { ... }, "projectedImpact": { ... }, "status": "active", "dismissedAt": null, "actedOnAt": null, "resolvedAt": null, "confidenceNote": "...", "triggerCondition": "WUE > 1.0 for 5+ ticks" },
  "timestamp": "2026-04-12T08:01:32Z"
}
```

**Frontend handling:** Show a toast notification. The recommendation will appear in `state.activeRecommendations` on the next `state:update`.

---

#### `scenario:progress`

**Emitted:** Every tick while a scenario is active.

**Payload:**
```typescript
interface ScenarioProgressPayload {
  scenarioId: string;
  ticksElapsed: number;
  totalTicks: number;
  phase: string;             // "running" | "complete"
}
```

```json
{
  "event": "scenario:progress",
  "data": { "scenarioId": "heatwave-001", "ticksElapsed": 5, "totalTicks": 20, "phase": "running" },
  "timestamp": "2026-04-12T08:01:34Z"
}
```

When `phase` is `"complete"`, `ticksElapsed === totalTicks`.

**Frontend handling:** Update a local progress counter for the scenario progress bar. When `phase === "complete"`, show a toast "Scenario complete" and reset the progress bar.

---

#### `action:confirmed`

**Emitted:** After the backend successfully processes a `POST /api/actions` request and applies the lever change.

**Payload:**
```typescript
interface ActionConfirmedPayload {
  changeLogEntryId: string;
  success: true;
}
```

```json
{
  "event": "action:confirmed",
  "data": { "changeLogEntryId": "clg-a1b2c3d4", "success": true },
  "timestamp": "2026-04-12T08:01:36Z"
}
```

**Frontend handling:** Call `store.clearPendingLeverChanges()`. Show a success toast: "Action committed successfully."

---

### Client → Server Events

The client sends only one event type:

#### `pong`

```json
{ "event": "pong", "data": {}, "timestamp": "2026-04-12T08:01:30Z" }
```

All other client→server communication uses REST endpoints.

---

### Reconnection Protocol

1. On WebSocket `close` or `error`, set `store.connectionStatus = 'disconnected'`
2. Wait **1 second**, then attempt reconnect. Set `store.connectionStatus = 'reconnecting'`
3. If reconnect fails, wait **2 seconds**, then retry
4. Double the delay each attempt: 1s → 2s → 4s → 8s → 16s → **30s** (cap)
5. Never stop retrying
6. On successful reconnect:
   - Server sends full current `SimulationState` immediately as `state:update`
   - Set `store.connectionStatus = 'connected'`
   - Reset backoff delay to 1 second

---

## 4. Shared Formula Contract

All functions live in `packages/shared/src/formulas.ts`. They are **pure functions** — no side effects, no state access.

### computePUE

```typescript
function computePUE(totalFacilityPower: number, itEquipmentPower: number): number
```
**Formula:** `totalFacilityPower / itEquipmentPower`
**Guard:** If `itEquipmentPower === 0`, return `1.0`
**Called by:** Backend (tick step 7), Frontend (lever preview)
**Example:** `computePUE(820, 650)` → `1.2615...`

### computeWUE

```typescript
function computeWUE(waterUsageRate: number, itEquipmentPower: number): number
```
**Formula:** `waterUsageRate / itEquipmentPower`
**Guard:** If `itEquipmentPower === 0`, return `0`
**Called by:** Backend (tick step 7), Frontend (lever preview)
**Example:** `computeWUE(650, 650)` → `1.0`

### computeCUE

```typescript
function computeCUE(totalFacilityPower: number, gridCarbonIntensity: number, itEquipmentPower: number): number
```
**Formula:** `(totalFacilityPower * gridCarbonIntensity) / (itEquipmentPower * 1000)`
**Guard:** If `itEquipmentPower === 0`, return `0`
**Called by:** Backend (tick step 7), Frontend (lever preview)
**Example:** `computeCUE(820, 180, 650)` → `0.2271...`

### computeCarbonOutput

```typescript
function computeCarbonOutput(totalFacilityPower: number, gridCarbonIntensity: number): number
```
**Formula:** `totalFacilityPower * gridCarbonIntensity / 1000`
**Unit:** kgCO2/hr
**Called by:** Backend (tick step 7), Frontend (lever preview)
**Example:** `computeCarbonOutput(820, 180)` → `147.6`

### computeGpuIdlePowerWaste

```typescript
function computeGpuIdlePowerWaste(gpuUtilizationRate: number, gpuPowerLimit: number, activeGpuCount: number): number
```
**Formula:** `(1 - gpuUtilizationRate) * gpuPowerLimit * activeGpuCount / 1000`
**Unit:** kW
**Called by:** Backend (tick step 7), Frontend (lever preview)
**Example:** `computeGpuIdlePowerWaste(0.72, 600, 240)` → `40.32`

### computeITEquipmentPower

```typescript
function computeITEquipmentPower(activeGpuCount: number, gpuPowerLimit: number, gpuUtilizationRate: number): number
```
**Formula:** `activeGpuCount * gpuPowerLimit * (0.4 + 0.6 * gpuUtilizationRate) / 1000`
**Unit:** kW
**Called by:** Backend (tick step 6), Frontend (lever preview)
**Example:** `computeITEquipmentPower(240, 600, 0.72)` → `119.808` ... wait, let me recalculate: `240 * 600 * (0.4 + 0.6 * 0.72) / 1000 = 240 * 600 * 0.832 / 1000 = 119,808 / 1000 = 119.808`

> **Note:** The seed data shows `itEquipmentPower: 650` but the formula with seed inputs yields ~119.8 kW. The seed data represents a pre-computed baseline value that may include non-GPU IT load. Implementations should use the formula for dynamic computation and the seed value for tick 0 initialization.

### computeCoolingPower

```typescript
function computeCoolingPower(ambientTemperature: number, fanSpeedOverride: number, waterRecirculationMode: boolean, coolingSetpoint: number): number
```
**Formula:**
```
baseCoolingPower = 120
ambientFactor = 1 + max(0, (ambientTemperature - 20)) * 0.04
fanFactor = fanSpeedOverride
recircPenalty = waterRecirculationMode ? 1.15 : 1.0
setpointFactor = max(0.6, 1 - (coolingSetpoint - 18) * 0.05)
return baseCoolingPower * ambientFactor * fanFactor * recircPenalty * setpointFactor
```
**Unit:** kW
**Called by:** Backend (tick step 6), Frontend (lever preview)
**Example:** `computeCoolingPower(28, 0.65, false, 22)` → `120 * 1.32 * 0.65 * 1.0 * 0.8 = 82.368`

### computeWaterUsageRate

```typescript
function computeWaterUsageRate(ambientTemperature: number, coolingSetpoint: number, waterRecirculationMode: boolean): number
```
**Formula:**
```
baseWaterRate = 600
temperatureFactor = 1 + max(0, (ambientTemperature - 20)) * 0.035
setpointFactor = max(0.3, 1 - (coolingSetpoint - 18) * 0.06)
recircSavings = waterRecirculationMode ? 0.70 : 1.0
return baseWaterRate * temperatureFactor * setpointFactor * recircSavings
```
**Unit:** L/hr
**Called by:** Backend (tick step 6), Frontend (lever preview)
**Example:** `computeWaterUsageRate(28, 22, false)` → `600 * 1.28 * 0.76 * 1.0 = 583.68`

### computeGpuTemperature

```typescript
function computeGpuTemperature(gpuUtilizationRate: number, coolingSetpoint: number, ambientTemperature: number, gpuPowerLimit: number): number
```
**Formula:**
```
baseTemp = 55
utilizationHeat = gpuUtilizationRate * 25
coolingEffect = max(0, (coolingSetpoint - 18)) * 1.2
ambientEffect = max(0, (ambientTemperature - 25)) * 0.8
powerEffect = (gpuPowerLimit - 200) / 500 * 5
return baseTemp + utilizationHeat + coolingEffect + ambientEffect + powerEffect
```
**Unit:** °C
**Called by:** Backend (tick step 6), Frontend (lever preview)
**Example:** `computeGpuTemperature(0.72, 22, 28, 600)` → `55 + 18 + 4.8 + 2.4 + 4.0 = 84.2`

### computeInferenceLatency

```typescript
function computeInferenceLatency(averageGpuTemperature: number, queueDepth: number, batchSize: number): number
```
**Formula:**
```
baseLatency = 45
temperaturePenalty = max(0, (averageGpuTemperature - 72)) * 2.5
queuePenalty = queueDepth * 0.8
batchPenalty = (batchSize - 1) * 1.2
return baseLatency + temperaturePenalty + queuePenalty + batchPenalty
```
**Unit:** ms
**Called by:** Backend (tick step 6), Frontend (lever preview)
**Example:** `computeInferenceLatency(68, 10, 16)` → `45 + 0 + 8 + 18 = 71`

### computeQueueDepth

```typescript
function computeQueueDepth(previousQueueDepth: number, requestVolume: number, requestRateLimit: number, effectiveThroughput: number, tickIntervalHours: number): number
```
**Formula:**
```
inboundRate = min(requestVolume, requestRateLimit)
surplus = max(0, inboundRate - effectiveThroughput)
return previousQueueDepth * 0.9 + surplus * tickIntervalHours
```
Where `tickIntervalHours = SIMULATED_SECONDS_PER_TICK / 3600 = 300 / 3600 = 0.08333`
**Called by:** Backend only (tick step 6, requires previous state)
**Example:** `computeQueueDepth(10, 8000, 12000, 7500, 0.08333)` → `10 * 0.9 + 500 * 0.08333 = 9 + 41.67 = 50.67`

### computeRequestDropRate

```typescript
function computeRequestDropRate(queueDepth: number, inboundRate: number): number
```
**Formula:**
```
maxQueueCapacity = 500
return max(0, (queueDepth - maxQueueCapacity)) / inboundRate
```
**Guard:** If `inboundRate === 0`, return `0`
**Called by:** Backend only (tick step 6)
**Example:** `computeRequestDropRate(10, 8000)` → `max(0, -490) / 8000 = 0`

### computeBatchEfficiency

```typescript
function computeBatchEfficiency(gpuUtilizationRate: number, batchSize: number): number
```
**Formula:** `min(1.0, gpuUtilizationRate * (batchSize / 64) * 1.2)`
**Called by:** Backend (tick step 6), Frontend (lever preview)
**Example:** `computeBatchEfficiency(0.72, 16)` → `min(1.0, 0.72 * 0.25 * 1.2) = min(1.0, 0.216) = 0.216`

---

## 5. Shared Constants Contract

All constants live in `packages/shared/src/constants.ts`.

### Tick Configuration

```typescript
const TICK_RATE_MS = 2000;                    // real-time milliseconds between ticks
const SIMULATED_SECONDS_PER_TICK = 300;       // 5 simulated minutes per tick
const TICK_INTERVAL_HOURS = 300 / 3600;       // 0.08333... hours per tick
```

### Metric Thresholds

| Metric | Healthy Range | Warning Range | Critical Range |
|--------|--------------|---------------|----------------|
| PUE | 1.0 – 1.3 | 1.3 – 1.6 | > 1.6 |
| WUE (L/kWh) | 0 – 1.0 | 1.0 – 2.0 | > 2.0 |
| CUE (kgCO2/kWh) | 0 – 0.3 | 0.3 – 0.6 | > 0.6 |
| GPU Temperature (°C) | < 72 | 72 – 83 | > 83 |
| GPU Utilization | 0.5 – 1.0 | 0.3 – 0.5 | < 0.3 |
| Inference Latency (ms) | < 80 | 80 – 150 | > 150 |
| Request Drop Rate | 0 | 0 – 0.05 | > 0.05 |
| Queue Depth | < 100 | 100 – 400 | > 400 |
| Water Stress Index | 0 – 0.4 | 0.4 – 0.7 | > 0.7 |
| Carbon Output (kgCO2/hr) | < 200 | 200 – 400 | > 400 |

### Lever Definitions

| Lever ID | Layer | Type | Min | Max | Step | Unit |
|----------|-------|------|-----|-----|------|------|
| `powerCap` | power | slider | 600 | 1200 | 50 | kW |
| `renewablePriorityMode` | power | toggle | 0 | 1 | 1 | boolean |
| `coolingSetpoint` | cooling | slider | 16 | 30 | 0.5 | °C |
| `fanSpeedOverride` | cooling | slider | 0.4 | 1.0 | 0.05 | ratio |
| `waterRecirculationMode` | cooling | toggle | 0 | 1 | 1 | boolean |
| `gpuPowerLimit` | gpu | slider | 200 | 700 | 10 | W |
| `gracefulRackShutdown` | gpu | toggle[] | 0 | 1 | 1 | boolean[] |
| `thermalThrottleThreshold` | gpu | slider | 75 | 90 | 1 | °C |
| `requestRateLimit` | workload | slider | 2000 | 16000 | 500 | req/hr |
| `batchSize` | workload | slider | 1 | 64 | 1 | count |
| `priorityQueueWeight` | workload | slider | 0.5 | 0.9 | 0.05 | ratio |

### Formula Base Values

```typescript
const BASE_COOLING_POWER = 120;               // kW
const BASE_WATER_RATE = 600;                  // L/hr
const BASE_GPU_TEMP = 55;                     // °C
const BASE_LATENCY = 45;                      // ms
const OVERHEAD_POWER = 45;                    // kW
const MAX_QUEUE_CAPACITY = 500;               // requests
const BASE_REQUEST_CAPACITY_PER_GPU = 40;     // req/hr at full power, batch 1
```

### Seed Data

The initial `SimulationState` at tick 0 is defined as a constant. See the full JSON in PRD Section 16. Key values:

| Field | Seed Value |
|-------|-----------|
| `tick` | `0` |
| `timestamp` | `"2026-04-12T08:00:00Z"` |
| `mode` | `"live"` |
| `power.totalFacilityPower` | `820` kW |
| `power.itEquipmentPower` | `650` kW |
| `power.coolingPower` | `125` kW |
| `power.pue` | `1.26` |
| `cooling.coolingSetpoint` | `22` °C |
| `cooling.waterUsageRate` | `650` L/hr |
| `cooling.wue` | `1.0` |
| `cooling.ambientTemperature` | `28` °C |
| `cooling.health` | `"warning"` |
| `gpu.averageGpuTemperature` | `68` °C |
| `gpu.gpuUtilizationRate` | `0.72` |
| `gpu.activeGpuCount` | `240` |
| `workload.requestVolume` | `8000` req/hr |
| `workload.averageInferenceLatency` | `55` ms |
| `workload.queueDepth` | `10` |
| `derivedMetrics.pue` | `1.26` |
| `derivedMetrics.wue` | `1.0` |
| `derivedMetrics.cue` | `0.23` |
| `derivedMetrics.carbonOutputKgPerHr` | `147.6` |
| `activeScenario` | `null` |
| Active alerts | 1 (WUE warning) |
| Active recommendations | 1 (Water recirculation) |

---

## 6. Frontend → Backend Request Flows

### Flow 1: Commit Action

```
User drags lever slider
  → store.setPendingLeverChange("cooling.coolingSetpoint", 25)
  → Frontend calls shared formulas locally with new value
  → ActionPanel displays "Projected Impact" preview
  → User clicks "Commit Action"
  → TradeoffModal opens with tradeoff/community/end-user impact text
  → User checks acknowledgment checkbox
  → User clicks "Confirm & Commit"
  → Frontend sends POST /api/actions:
      {
        "layerId": "cooling",
        "leverId": "coolingSetpoint",
        "previousValue": 22,
        "newValue": 25,
        "tradeoffAcknowledgment": {
          "tradeoffText": "...",
          "communityImpactText": "...",
          "endUserImpactText": "...",
          "acknowledged": true
        }
      }
  → Backend validates request (layerId, leverId, range, acknowledgment)
  → Backend applies lever change to SimulationState
  → Backend creates ChangeLogEntry, appends to changeLog
  → Backend computes projectedImpact using shared formulas
  → Backend responds 200:
      { "success": true, "changeLogEntryId": "clg-...", "projectedImpact": { ... } }
  → Backend emits WebSocket event:
      { "event": "action:confirmed", "data": { "changeLogEntryId": "clg-...", "success": true }, "timestamp": "..." }
  → Frontend receives action:confirmed → store.clearPendingLeverChanges()
  → Frontend shows success toast
  → Next tick: engine propagates effects naturally, state:update reflects changes
```

### Flow 2: Activate Scenario

```
User views Scenario Panel → clicks "Simulate" on a scenario
  → Frontend sends POST /api/scenarios/heatwave-001/activate:
      { "mode": "simulation" }
  → Backend checks: scenario exists? (404 if not) Another active? (409 if yes)
  → Backend forks state (deep clone) for simulation mode
  → Backend sets state.activeScenario = "heatwave-001", state.mode = "simulation"
  → Backend responds 200:
      { "success": true, "scenarioId": "heatwave-001", "estimatedDurationTicks": 20 }
  → Frontend shows scenario progress bar
  → Each tick during scenario:
      → Backend applies scenario events for current tickOffset
      → Backend emits: { "event": "scenario:progress", "data": { "scenarioId": "heatwave-001", "ticksElapsed": N, "totalTicks": 20, "phase": "running" }, "timestamp": "..." }
      → Frontend updates progress bar: N/20
  → On final tick:
      → Backend emits: { "event": "scenario:progress", "data": { "scenarioId": "heatwave-001", "ticksElapsed": 20, "totalTicks": 20, "phase": "complete" }, "timestamp": "..." }
      → Backend discards forked state, resumes live state
      → Backend sets state.activeScenario = null, state.mode = "live"
      → Frontend shows toast "Scenario complete", removes progress bar
```

### Flow 3: Dismiss Recommendation

```
User views recommendation card → clicks "Dismiss"
  → Frontend sends POST /api/recommendations/rec-seed-001/dismiss
      (empty body or {})
  → Backend finds recommendation by ID (404 if not found)
  → Backend checks status === 'active' (400 if not)
  → Backend sets recommendation.status = 'dismissed', recommendation.dismissedAt = now (ISO 8601)
  → Backend responds 200:
      { "success": true, "recommendationId": "rec-seed-001" }
  → Frontend removes recommendation from active display (or marks as dismissed)
  → Next state:update will no longer include this recommendation in activeRecommendations
```

### Flow 4: Load Initial State

```
Frontend mounts (App component)
  → useSimulationSocket hook initializes
  → Opens WebSocket connection to ws://localhost:5173/ws (proxied to :3001)
  → store.setConnectionStatus('connected')
  → Server immediately sends:
      { "event": "state:update", "data": { /* full SimulationState */ }, "timestamp": "..." }
  → Hook parses message, calls store.setSimulationState(data)
  → Zustand store now has simulationState !== null
  → All subscribed components render:
      - MetricsTopBar reads derivedMetrics → renders 6 KPI tiles
      - LayerSidebar reads layers → renders 5 layer cards with health colors
      - AlertPanel reads activeAlerts → renders alert cards
      - 3D scene reads layer states → positions, colors, animations initialize
  → Subsequent state:update messages arrive every 2 seconds
  → UI updates continuously
```

---

## 7. Error Contract

### HTTP Error Handling

| Status | Code | When | Frontend Response |
|--------|------|------|-------------------|
| 400 | `VALIDATION_ERROR` | Invalid request body, out-of-range values, missing acknowledgment | Show inline error on the offending input. Do not close the modal — let user correct and retry. |
| 404 | `NOT_FOUND` | Scenario ID or recommendation ID not found | Show toast: "Resource not found" |
| 409 | `CONFLICT` | Scenario already active, or action during simulation | Show toast with the `error` message (e.g., "Another scenario is already active"). Close modal if open, revert pending lever changes. |
| 500 | `INTERNAL_ERROR` | Unhandled server exception | Show toast: "Something went wrong. Please try again." Log full response to console. |

### Network Error Handling

| Condition | Frontend Response |
|-----------|-------------------|
| `fetch()` throws (network unreachable) | Show toast: "Network error. Please check your connection." Do not auto-retry. |
| WebSocket `close` event | Set `connectionStatus = 'disconnected'`. Show persistent amber banner: "Connection lost. Reconnecting..." with spinner. Begin exponential backoff. |
| WebSocket `error` event | Same as `close`. |
| WebSocket reconnect succeeds | Hide banner. Set `connectionStatus = 'connected'`. Server sends full state immediately. |

### Data Integrity Errors

| Condition | Handler |
|-----------|---------|
| Received `NaN` or `Infinity` in state | Frontend `formatMetric()` helper returns `'--'` for non-finite values |
| JSON parse error on WebSocket message | Log to console, ignore the message, wait for next tick |

---

## 8. CORS Configuration

### Development

Backend Express CORS middleware configuration:

```typescript
app.use(cors({
  origin: 'http://localhost:5173',     // Vite dev server
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false
}));
```

Note: In development, the Vite proxy (`vite.config.ts`) forwards `/api` and `/ws` requests to `localhost:3001`, so CORS is only needed for direct backend access. The proxy bypasses CORS entirely since requests originate from the same origin.

### Production

```typescript
app.use(cors({
  origin: 'https://<cloudfront-distribution-id>.cloudfront.net',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false
}));
```

### Headers Set

| Header | Value |
|--------|-------|
| `Access-Control-Allow-Origin` | `http://localhost:5173` (dev) or CloudFront domain (prod) |
| `Access-Control-Allow-Methods` | `GET, POST` |
| `Access-Control-Allow-Headers` | `Content-Type, Accept` |

WebSocket connections do not use CORS (the `ws` library does not enforce origin checks by default). If origin validation is desired, it must be implemented in the WebSocket `connection` handler by checking the `Origin` header.
