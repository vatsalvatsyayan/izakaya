You are building the complete backend for the AI Factory Digital Twin: simulation engine, REST API, and WebSocket server. This is Phase 2 of a 3-phase parallel build. Another agent is simultaneously building the frontend. You must NOT touch any files outside packages/backend/.

## Docs to Read First

Read these files completely before writing any code:
- docs/prd.md (Sections 4-6, 9-10 are critical)
- docs/architecture.md (Sections 1, 5-6)
- docs/backend_plan.md (all of it — this is your implementation guide)
- docs/integration_contract.md (Section 2 — REST API contract, Section 3 — WebSocket events)
- CLAUDE.md

Also read the shared package that Phase 1 created:
- packages/shared/src/types.ts
- packages/shared/src/constants.ts
- packages/shared/src/formulas.ts

## Boundary

You may create or modify: Everything under `packages/backend/`
You may read (not modify): `packages/shared/`, `docs/`, `CLAUDE.md`, root config files
You MUST NOT touch: `packages/frontend/`, `packages/shared/`, root `package.json`, root `tsconfig.base.json`
You MUST NOT update `docs/progress.md` or `docs/changelog.md`.

If you discover a missing type or constant in @izakaya/shared, add a `// TODO(shared): <description>` comment and define a local workaround. The integration agent will fix it.

## Implementation Steps (in dependency order)

### Step 1: Project Setup

Create `packages/backend/package.json`:
```json
{
  "name": "@izakaya/backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm --dts",
    "start": "node dist/index.js"
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

Create `packages/backend/tsconfig.json` extending `../../tsconfig.base.json` with:
- outDir: "./dist"
- rootDir: "./src"
- references to `../shared/tsconfig.json`
- paths: `"@izakaya/shared": ["../shared/src"]`

### Step 2: Seed State — `packages/backend/src/simulation/seed.ts`

Implement `createSeedState(): SimulationState` using the seed values from `@izakaya/shared` constants. The initial state must match the GET /api/state example response in integration_contract.md exactly:
- tick: 0, mode: 'live', activeScenario: null
- All metrics at their healthy baseline values
- All levers at default positions
- Empty alerts and recommendations arrays
- DerivedMetrics calculated from seed values using shared formulas

### Step 3: Drift Model — `packages/backend/src/simulation/drift.ts`

Implement `applyEnvironmentalDrift(state: SimulationState): void`.

Uses the drift configuration from shared constants. Each metric drifts per PRD Section 5:
- Ambient Temperature: +0.1/tick daytime, -0.05/tick nighttime, noise ±0.3
- GPU Temperature: +0.02/tick under load (proportional to utilization), noise ±0.1
- Grid Carbon Intensity: sinusoidal (peaks midday), amplitude 50, noise ±10
- Request Volume: +50/tick business hours, -30 off-peak, noise ±100
- Water Stress Index: stable, noise ±0.01

Determine day/night from `state.simulatedTimeSeconds` modulo a 24-hour cycle. Business hours = ticks 36-108 in a 144-tick day (6am-6pm at 5min/tick).

Clamp all values to valid ranges after drift.

### Step 4: Layer Dependencies — `packages/backend/src/simulation/dependencies.ts`

Implement `propagateLayerDependencies(state: SimulationState): void`.

Propagation order (from architecture.md):
1. Location → Cooling: ambientTemp affects cooling load
2. Cooling → GPU: coolingSetpoint affects GPU temperatures
3. GPU → Workload: GPU temp/availability affects latency and throughput
4. Workload → GPU → Power: workload affects utilization affects power
5. Power + Cooling → Derived: feeds PUE/WUE/CUE calculations

Use the convergence formula for all transitions: `value_new = value_target + (value_current - value_target) * 0.85`

Use shared formula functions (computeCoolingPower, computeGpuTemperature, computeInferenceLatency, etc.) to calculate target values. Then converge toward those targets.

Also implement GPU degradation: if a rack's average temp exceeds 85°C for 10+ consecutive ticks, one GPU fails (reduce activeGpuCount by 1, increment hardwareFailureRate).

Track per-rack consecutive-hot-tick counts in module-scoped state.

### Step 5: Alerts — `packages/backend/src/simulation/alerts.ts`

Implement `evaluateAlerts(state: SimulationState, alertHistory: Alert[], broadcast: Function): void`.

Check every metric against its threshold (from shared constants). For each threshold breach:
1. Check if an alert already exists for this metric + severity (deduplication)
2. If new, create an Alert object with uuid, timestamp, severity, metric info, message
3. Push to state.activeAlerts and alertHistory
4. Call broadcast('alert:new', alert)

For resolution: if a metric returns to healthy range, remove the alert from state.activeAlerts (keep in history).

### Step 6: Recommendations — `packages/backend/src/simulation/recommendations.ts`

Implement `evaluateRecommendations(state: SimulationState, recHistory: Recommendation[], broadcast: Function): void`.

Implement all 10 recommendation templates from PRD Section 6. Each has:
- A trigger condition (e.g., "PUE > 1.3 for 5+ ticks")
- Template text with interpolation slots
- A suggested action (lever + value)
- Projected impact calculations using shared formulas

Track condition durations in module-scoped counters (how many consecutive ticks each condition has been true).

Recommendation lifecycle:
1. If condition newly met → create recommendation, broadcast
2. If condition no longer met → auto-resolve (set status to 'resolved')
3. Handle dismissed status (set by API)
4. Handle acted_on status (detect lever change matching suggestion within 20% tolerance)

### Step 7: Scenarios — `packages/backend/src/simulation/scenarios.ts`

Implement all 5 scenario definitions from PRD Section 10:
1. Heatwave Stress Event (20 ticks)
2. Demand Spike (10 ticks)
3. Grid Carbon Intensity Spike (15 ticks)
4. GPU Fleet Degradation (20 ticks)
5. Water Scarcity Alert (15 ticks)

Each scenario is a `ScenarioDefinition` with a list of `ScenarioEvent` objects.

Export:
- `SCENARIO_DEFINITIONS: ScenarioDefinition[]`
- `activateScenario(state, scenarioId, mode): void` — sets activeScenario, forks state if simulation mode
- `applyScenarioEvents(state, scenarioStartTick): void` — processes events for current tick offset
- `deactivateScenario(state): void` — clears scenario, restores state if simulation mode

For simulation mode: deep-clone the state before applying scenario effects. Store the original state so it can be restored on deactivation.

### Step 8: Simulation Engine — `packages/backend/src/simulation/engine.ts`

Implement the `SimulationEngine` class that orchestrates the tick loop.

```typescript
class SimulationEngine {
  private state: SimulationState;
  private changeLog: ChangeLogEntry[];
  private alertHistory: Alert[];
  private recommendationHistory: Recommendation[];
  private savedState: SimulationState | null; // for simulation mode
  private scenarioStartTick: number | null;
  private intervalId: NodeJS.Timeout | null;
  private broadcastFn: ((event: string, data: unknown) => void) | null;

  constructor();
  start(broadcastFn: (event: string, data: unknown) => void): void;
  stop(): void;
  tick(): void; // the per-tick orchestration
  getState(): SimulationState;
  getChangeLog(): ChangeLogEntry[];
  getAlertHistory(): Alert[];
  getRecommendationHistory(): Recommendation[];
  commitAction(request: CommitActionRequest): CommitActionResponse;
  activateScenario(scenarioId: string, mode: string): void;
  deactivateScenario(): void;
  dismissRecommendation(id: string): void;
}
```

The `tick()` method calls each phase in order per architecture.md Section 5:
1. Increment tick, advance time
2. applyEnvironmentalDrift
3. applyScenarioEvents (if active)
4. propagateLayerDependencies
5. recalculateDerivedMetrics (using shared formulas)
6. evaluateAlerts
7. evaluateRecommendations
8. Broadcast state:update
9. If scenario active, broadcast scenario:progress
10. Update cumulative derived metrics (totalCarbonEmittedKg, totalWaterConsumedLiters)

The `commitAction()` method:
1. Validate the request
2. Apply the lever change to state
3. Create a ChangeLogEntry with full tradeoff text
4. Schedule a 5-minute follow-up check (after N ticks) to fill outcomeAfterFiveMinutes
5. Broadcast action:confirmed
6. Return the response

### Step 9: WebSocket Manager — `packages/backend/src/websocket/connectionManager.ts`

Implement WebSocket server:
- Attach to the HTTP server on path `/ws`
- Track connected clients
- `broadcast(event, data)` sends `JSON.stringify({ event, data })` to all clients
- Handle client disconnect cleanup
- Optional: heartbeat/ping every 30s

### Step 10: REST API Controllers

Implement each controller per integration_contract.md Section 2:

`packages/backend/src/api/stateController.ts`:
- GET /api/state → returns `{ state: engine.getState() }`

`packages/backend/src/api/actionsController.ts`:
- POST /api/actions → validates request body (layerId, leverId, previousValue, newValue, tradeoffAcknowledgment with acknowledged=true), calls engine.commitAction(), returns response
- Return 400 if acknowledgment missing or acknowledged !== true
- Return 400 if lever value out of range

`packages/backend/src/api/scenariosController.ts`:
- GET /api/scenarios → returns `{ scenarios: SCENARIO_DEFINITIONS }`
- POST /api/scenarios/:id/activate → validates, calls engine.activateScenario(), returns response
- Return 404 if scenario not found, 409 if another scenario active

`packages/backend/src/api/logsController.ts`:
- GET /api/logs → returns `{ entries, total }` with pagination via ?limit=50&offset=0

`packages/backend/src/api/recommendationsController.ts`:
- GET /api/recommendations → returns active recommendations
- POST /api/recommendations/:id/dismiss → calls engine.dismissRecommendation(), returns response

`packages/backend/src/api/router.ts`:
- Creates Express Router, mounts all controllers, exports `createRouter(engine): Router`

### Step 11: Entry Point — `packages/backend/src/index.ts`

Wire everything together:
```typescript
import express from 'express';
import cors from 'cors';
import http from 'http';
import { SimulationEngine } from './simulation/engine';
import { createRouter } from './api/router';
import { createWebSocketServer } from './websocket/connectionManager';

const app = express();
app.use(cors());
app.use(express.json());

const engine = new SimulationEngine();
app.use('/api', createRouter(engine));

const server = http.createServer(app);
const { broadcast } = createWebSocketServer(server);

engine.start(broadcast);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});
```

### Step 12: Install dependencies and verify

Run `npm install` from repo root to bootstrap workspaces.
Run `npm run dev --workspace=packages/backend` and verify:
- Server starts on port 3001
- GET http://localhost:3001/api/state returns valid JSON matching the integration contract
- GET http://localhost:3001/api/scenarios returns 5 scenarios
- WebSocket connects at ws://localhost:3001/ws and receives state:update events every 2s
- POST http://localhost:3001/api/actions with a valid payload returns success

## Verification Checklist

Before finishing:
- [ ] Server starts without errors
- [ ] GET /api/state returns SimulationState matching integration_contract.md
- [ ] GET /api/scenarios returns all 5 scenarios
- [ ] POST /api/scenarios/:id/activate works for heatwave-001
- [ ] POST /api/actions with valid payload creates a change log entry
- [ ] GET /api/logs returns the created entry
- [ ] GET /api/recommendations returns empty array initially (or populated after threshold breach)
- [ ] WebSocket broadcasts state:update every 2 seconds
- [ ] Metrics drift over time (watch 10+ ticks — values should change)
- [ ] Activating heatwave scenario causes visible metric changes over ticks
- [ ] Alerts generate when thresholds are crossed

Do NOT update docs/progress.md or docs/changelog.md.
If you find a missing type/constant in @izakaya/shared, add `// TODO(shared): <description>` and work around it locally.
