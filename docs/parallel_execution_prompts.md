# Parallel Execution Prompts

**Date:** April 12, 2026
**Decision:** Approach A (Three-Phase Safe Parallel)

---

## 1. Decision & Rationale

**Approach A wins.** Here's why:

1. **Shared package is load-bearing.** There are ~20 interfaces, ~13 formula functions, and ~50+ constants (thresholds, lever definitions, drift configs, seed values). Both backend and frontend import heavily from `@izakaya/shared`. Independent implementation would drift — guaranteed.

2. **Formulas are used on both sides.** The backend uses formulas for tick calculations. The frontend uses the *same* formulas for lever preview projections (optimistic updates). If these diverge, the lever preview won't match server behavior. This is a subtle, hard-to-debug integration issue.

3. **Phase 1 is fast (~20 min for an agent).** The shared package is pure types, constants, and math — no I/O, no UI, no setup complexity. It's a small bottleneck.

4. **The frontend has enormous work.** 12+ 3D components, 10+ UI components, particle systems, animations. It won't finish early waiting for shared. Phase 2 parallelism is the real win.

5. **Integration risk under Approach B is high.** If two agents independently implement `computeInferenceLatency()` or `CommunityBurden` type, the integration agent wastes time reconciling. The contract doc is precise but has edge cases (e.g., `CommunityBurden` interface appears in PRD Section 11 but not in the integration contract's type list).

6. **Riskiest integration point:** WebSocket state:update → Zustand store → 3D components. If the state shape is wrong, everything breaks. Having shared types locked down before parallel work eliminates this risk entirely.

---

## 2. Execution Diagram

```
Time ──────────────────────────────────────────────────────────►

Phase 1 (Sequential)         Phase 2 (Parallel)              Phase 3 (Sequential)
~20 min                      ~90 min                          ~30 min
┌─────────────────┐    ┌─────────────────────────────┐    ┌──────────────────────┐
│ AGENT 1: SHARED  │    │ AGENT 2: BACKEND             │    │ AGENT 4: INTEGRATION  │
│                  │    │                              │    │                       │
│ - types.ts       │───►│ - simulation engine          │───►│ - Connect WS → store  │
│ - constants.ts   │    │ - drift, deps, alerts, recs  │    │ - Verify 5 user flows │
│ - formulas.ts    │    │ - scenarios (5)              │    │ - Fix type mismatches │
│ - package.json   │    │ - REST API (7 endpoints)     │    │ - Polish animations   │
│ - tsconfig       │    │ - WebSocket broadcast        │    │ - Update progress.md  │
│ - root configs   │    │ - Entry point                │    │ - Update changelog.md │
│                  │    └─────────────────────────────┘    └──────────────────────┘
│ Effort: ████     │    ┌─────────────────────────────┐
│                  │    │ AGENT 3: FRONTEND             │
│                  │───►│                              │
│                  │    │ - Vite + Tailwind setup       │
│                  │    │ - Zustand store + WS hook     │
│                  │    │ - Layout shell (App.tsx)      │
│                  │    │ - MetricsTopBar + sparklines  │
│                  │    │ - LayerSidebar + expand       │
│                  │    │ - 3D scene (10 racks, 2       │
│                  │    │   towers, 2 PDUs, particles)  │
│                  │    │ - Alert/Rec/Scenario panels   │
│                  │    │ - ActionPanel + levers        │
│                  │    │ - TradeoffModal + Toast       │
│                  │    │ - Simulation mode banner      │
│                  │    │                              │
│                  │    │ Effort: ████████████████████  │
└─────────────────┘    └─────────────────────────────┘

Relative effort: Phase 1 = 15%, Phase 2 Backend = 30%, Phase 2 Frontend = 40%, Phase 3 = 15%
```

---

## 3. Conflict Prevention Rules

### Global Rules
1. **Phase 2 agents MUST NOT modify any file outside their assigned package directory.**
2. **Neither Phase 2 agent touches `packages/shared/`** — it is frozen after Phase 1.
3. **Neither Phase 2 agent touches `package.json` at the repo root** or `tsconfig.base.json`.
4. **Neither Phase 2 agent updates `docs/progress.md` or `docs/changelog.md`** — only the integration agent (Phase 3) does this to avoid merge conflicts.
5. If a Phase 2 agent discovers a missing type or constant in shared, they add a `// TODO(shared): <description>` comment at the usage site and continue. The integration agent resolves these.
6. If a Phase 2 agent needs to add a root-level dependency, they document it in a `TODO-INTEGRATION.md` file inside their own package directory.

### Backend Agent Boundary
- **May create/modify:** Everything under `packages/backend/`
- **May read (not modify):** `packages/shared/src/*`, `docs/*`
- **Must NOT touch:** `packages/frontend/`, `packages/shared/`, root `package.json`, root `tsconfig.base.json`

### Frontend Agent Boundary
- **May create/modify:** Everything under `packages/frontend/`
- **May read (not modify):** `packages/shared/src/*`, `docs/*`
- **Must NOT touch:** `packages/backend/`, `packages/shared/`, root `package.json`, root `tsconfig.base.json`

---

## 4. The Exact Prompts

---

### PHASE 1: Shared Package + Monorepo Scaffolding

**Agent:** 1 of 1
**Estimated time:** 20 minutes

---

```
You are building the shared types package and monorepo scaffolding for the AI Factory Digital Twin project. This is Phase 1 of a 3-phase parallel build. Phase 2 agents (backend + frontend) will depend on everything you produce here. Your work must be complete and correct — any missing type or wrong constant will block two parallel agents.

## Docs to Read First

Read these files completely before writing any code:
- docs/prd.md (especially Sections 4-6, 10-11, 13, 16)
- docs/architecture.md (especially Sections 3-4)
- docs/integration_contract.md (all of it — this defines every type)
- docs/backend_plan.md (Section 2 — shared types and constants)
- CLAUDE.md

## Boundary

You may create or modify:
- packages/shared/ (entire directory)
- package.json (root — workspace config only)
- tsconfig.base.json (root)

You must NOT create or modify anything in packages/backend/ or packages/frontend/.

## Implementation Steps (in order)

### Step 1: Root monorepo scaffolding

Create `package.json` at repo root:
```json
{
  "name": "izakaya",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:backend": "npm run dev --workspace=packages/backend",
    "dev:frontend": "npm run dev --workspace=packages/frontend"
  }
}
```

Create `tsconfig.base.json` at repo root:
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

### Step 2: packages/shared/package.json and tsconfig.json

`packages/shared/package.json`:
```json
{
  "name": "@izakaya/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {}
}
```

`packages/shared/tsconfig.json` extending the base, with `composite: true`.

`packages/shared/src/index.ts` — barrel export: re-exports everything from types.ts, constants.ts, formulas.ts.

### Step 3: packages/shared/src/types.ts

Define EVERY interface from docs/integration_contract.md Section 1. The complete list:
- HealthStatus (type alias)
- SimulationState
- PowerLayerState
- CoolingLayerState
- GPULayerState
- WorkloadLayerState
- LocationLayerState
- DerivedMetrics
- LayerHealth
- Metric
- Lever
- Recommendation
- Alert
- ScenarioDefinition
- ScenarioEvent
- ActionCommit
- ChangeLogEntry
- EndUserImpact
- CommunityBurden

Also define these WebSocket event types:
```typescript
interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
}

interface ScenarioProgress {
  scenarioId: string;
  ticksElapsed: number;
  totalTicks: number;
  phase: string;
}

interface ActionConfirmed {
  changeLogEntryId: string;
  success: true;
}
```

Also define the REST request/response types:
- ActivateScenarioRequest
- CommitActionRequest
- StateResponse
- ScenariosResponse
- LogsResponse
- RecommendationsResponse
- CommitActionResponse

Every field must have a JSDoc comment with its unit and range where applicable.

### Step 4: packages/shared/src/constants.ts

Define all threshold constants, seed values, and configuration. Source: PRD Sections 4-5, docs/integration_contract.md sample values.

Must include:
- TICK_INTERVAL_MS = 2000
- SIMULATED_SECONDS_PER_TICK = 300
- BASE_TIME (ISO string for simulation start)
- Threshold objects per layer (e.g., POWER_THRESHOLDS with healthy/warning/critical ranges for each metric)
- Seed values for every metric (the tick-0 state from PRD Section 16 / integration_contract.md GET /api/state example response)
- Drift configuration per metric (direction, magnitude, noise range — from PRD Section 5)
- Lever definitions with min/max/step/unit for every lever
- Recommendation templates (the 10 templates from PRD Section 6)
- BASE_COOLING_POWER = 120
- BASE_INFERENCE_LATENCY = 45
- GPU_TDP = 700
- TOTAL_GPU_COUNT = 240
- RACKS = 10
- GPUS_PER_RACK = 24
- OVERHEAD_POWER = 45
- CONVERGENCE_FACTOR = 0.85

### Step 5: packages/shared/src/formulas.ts

Implement every pure formula function. Source: PRD Section 5 "Derived Metric Formulas."

Functions to implement:
- computePUE(totalFacilityPower, itEquipmentPower): number
- computeWUE(waterUsageRate, itEquipmentPower): number
- computeCUE(totalFacilityPower, itEquipmentPower, gridCarbonIntensity): number
- computeCarbonOutput(totalFacilityPower, gridCarbonIntensity, timeIntervalHours): number
- computeGpuIdlePowerWaste(gpuUtilization, activeGpuCount): number
- computeInferenceLatency(avgGpuTemp, queueDepth, batchSize): number
- computeCoolingPower(baseCoolingPower, ambientTemp, fanSpeedPercent, waterRecircMode): number
- computeWaterUsageRate(coolingPower, coolingSetpoint, ambientTemp, waterRecircMode): number
- computeITEquipmentPower(activeGpuCount, gpuPowerLimit, gpuUtilization): number
- computeBatchEfficiency(batchSize, gpuUtilization): number
- computeGpuTemperature(coolingSetpoint, gpuPowerLimit, gpuUtilization, ambientTemp): number
- computeRequestDropRate(requestVolume, requestRateLimit, activeGpuCount, gpuUtilization): number
- computeQueueDepth(requestVolume, activeGpuCount, gpuUtilization, batchSize): number
- determineHealthStatus(value, thresholds): HealthStatus — generic threshold evaluator
- computeCommunityBurden(locationState, waterUsageRate): CommunityBurden

Each function must:
1. Match the formula exactly as specified in PRD Section 5
2. Clamp outputs to valid ranges (e.g., PUE >= 1.0, utilization 0-1)
3. Accept the minimum required parameters (not the full state object)

### Step 6: Verify

Run `npx tsc --noEmit -p packages/shared/tsconfig.json` to verify no type errors. If TypeScript is not installed, that's fine — just ensure the code is syntactically correct and all exports are consistent.

## Output Quality Checklist

Before finishing, verify:
- [ ] Every interface from integration_contract.md Section 1 is exported from types.ts
- [ ] Every threshold from PRD Section 4 (all 5 layer tables) is in constants.ts
- [ ] Every formula from PRD Section 5 is in formulas.ts
- [ ] The seed state values in constants.ts match the GET /api/state example in integration_contract.md
- [ ] All lever definitions (min/max/step/unit) match PRD Section 4
- [ ] The barrel index.ts re-exports everything
- [ ] Root package.json has workspaces configured
- [ ] tsconfig.base.json exists with shared compiler options
- [ ] packages/shared/tsconfig.json extends base and has composite: true

Do NOT update docs/progress.md or docs/changelog.md — the integration agent handles that.
```

---

### PHASE 2A: Backend Agent

**Agent:** 1 of 2 (runs in parallel with Frontend Agent)
**Estimated time:** 90 minutes
**Prerequisite:** Phase 1 complete

---

```
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
```

---

### PHASE 2B: Frontend Agent

**Agent:** 2 of 2 (runs in parallel with Backend Agent)
**Estimated time:** 90 minutes
**Prerequisite:** Phase 1 complete

---

```
You are building the complete frontend for the AI Factory Digital Twin: React UI, Zustand store, 3D scene, and all interactive components. This is Phase 2 of a 3-phase parallel build. Another agent is simultaneously building the backend. You will NOT have a running backend — build everything with seed data fallbacks so the UI works standalone.

## Docs to Read First

Read these files completely before writing any code:
- docs/frontend_plan.md (all of it — this is your implementation guide)
- docs/frontend_design.md (all of it — every visual decision is here)
- docs/prd.md (Sections 3, 7-8, 11)
- docs/architecture.md (Sections 2-5)
- docs/integration_contract.md (Section 1 for types, Section 2 for API shapes)
- CLAUDE.md

Also read the shared package that Phase 1 created:
- packages/shared/src/types.ts
- packages/shared/src/constants.ts
- packages/shared/src/formulas.ts

## Boundary

You may create or modify: Everything under `packages/frontend/`
You may read (not modify): `packages/shared/`, `docs/`, `CLAUDE.md`, root config files
You MUST NOT touch: `packages/backend/`, `packages/shared/`, root `package.json`, root `tsconfig.base.json`
You MUST NOT update `docs/progress.md` or `docs/changelog.md`.

If you discover a missing type or constant in @izakaya/shared, add a `// TODO(shared): <description>` comment and define a local workaround in a `packages/frontend/src/utils/localTypes.ts` file (this will be cleaned up during integration).

## Critical Design Constraint

Since the backend doesn't exist yet, you MUST:
1. Create a seed data fallback in the Zustand store — import seed values from @izakaya/shared constants and use them as initial state
2. The WebSocket hook should gracefully handle connection failure (show "Disconnected" status, use seed data)
3. All components must render correctly with just the seed state
4. REST API calls (POST /api/actions, etc.) should be implemented but handle failures gracefully with toasts

## Implementation Steps (in dependency order)

### Step 1: Project Setup

Create `packages/frontend/package.json` with all dependencies from architecture.md Section 2.

Create `packages/frontend/tsconfig.json`:
- extends ../../tsconfig.base.json
- jsx: "react-jsx"
- references to ../shared/tsconfig.json
- paths: "@izakaya/shared": ["../shared/src"]

Create `packages/frontend/vite.config.ts`:
- React plugin
- Dev server proxy: /api → http://localhost:3001, /ws → ws://localhost:3001
- Port 5173

Create `packages/frontend/tailwind.config.ts` with the EXACT color system from docs/frontend_design.md Section 2 (Tailwind Config subsection). Include the font family and font size scale from Section 3.

Create `packages/frontend/postcss.config.js` with tailwindcss and autoprefixer.

Create `packages/frontend/index.html` with root div.

Create `packages/frontend/src/index.css` with:
- Tailwind directives (@tailwind base/components/utilities)
- CSS custom properties from frontend_design.md Section 2
- Base styles: body bg-primary, text-primary, font-sans
- Minimum viewport warning styles from Section 8

### Step 2: Types & Store

Create `packages/frontend/src/types/index.ts` — barrel re-export from @izakaya/shared.

Create `packages/frontend/src/store/useDashboardStore.ts`:
```typescript
interface DashboardStore {
  simulationState: SimulationState | null;
  selectedLayer: string | null;
  mode: 'live' | 'simulation';
  activePanel: 'alerts' | 'scenarios' | 'history';
  pendingLeverChanges: Map<string, number>;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';

  setSimulationState: (state: SimulationState) => void;
  selectLayer: (layerId: string | null) => void;
  setMode: (mode: 'live' | 'simulation') => void;
  setActivePanel: (panel: 'alerts' | 'scenarios' | 'history') => void;
  setPendingLeverChange: (leverId: string, value: number) => void;
  clearPendingLeverChanges: () => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
}
```

Initialize simulationState with seed data from shared constants (construct a full SimulationState from the seed values so the UI renders immediately).

### Step 3: WebSocket Hook

Create `packages/frontend/src/hooks/useSimulationSocket.ts`:
- Connect to ws://localhost:5173/ws (proxied by Vite)
- Exponential backoff reconnect: 1s, 2s, 4s, max 30s
- On 'state:update' → call setSimulationState
- On 'alert:new' → could trigger toast
- On connect → setConnectionStatus('connected')
- On disconnect → setConnectionStatus('disconnected'), use seed data fallback
- On reconnecting → setConnectionStatus('reconnecting')

Create `packages/frontend/src/hooks/useLayerHealth.ts`:
- Derives LayerHealth[] from simulationState.layers
- Uses shared constants for threshold evaluation
- Returns array of { layerId, layerName, health, metrics }

### Step 4: App Layout Shell

Create `packages/frontend/src/App.tsx`:
- CSS Grid layout matching docs/frontend_design.md Section 4 and docs/prd.md Section 8:
  - Left sidebar: 280px
  - Top bar: 64px
  - Right panel: 320px
  - Center: 3D viewport (fills remaining)
  - Bottom-right: Action panel (280px height)
- Mount useSimulationSocket hook
- Minimum viewport warning
- Simulation mode banner (conditional)

Create `packages/frontend/src/main.tsx` — standard React 18 createRoot.

### Step 5: Metrics Top Bar

Create `packages/frontend/src/components/MetricsTopBar.tsx`:
- 6 metric tiles in a 64px horizontal bar
- Metrics: PUE, WUE, CUE, GPU Utilization %, Carbon Output (kgCO2/hr), Request Throughput (req/hr)
- Each tile: value (JetBrains Mono 24px bold), label (Inter 11px uppercase), trend arrow, sparkline
- Sparklines: use Recharts LineChart, 50px wide, 24px tall, last 60 values from metric history
- Store the last 60 values in the Zustand store (append on each state update, keep max 60)
- Follow exact specs from frontend_design.md Section 5a

### Step 6: Layer Sidebar

Create `packages/frontend/src/components/LayerSidebar.tsx`:
- 5 layer cards stacked vertically with 8px gap
- Collapsed: 56px, shows icon (emoji), name, health badge (8px circle), 2 key metrics
- Selected: expands with Framer Motion (300ms), shows all metrics with sparklines
- Left border 3px in health color when selected
- Click selects/deselects layer
- Follow exact specs from frontend_design.md Section 5b

Layer icons and key metrics:
- Power: ⚡ — PUE, Total Power
- Cooling: ❄️ — WUE, Water Usage
- GPU: 🖥️ — GPU Temp, Utilization
- Workload: 📊 — Latency, Request Volume
- Location: 🌍 — Ambient Temp, Water Stress

Create `packages/frontend/src/components/CommunityBurden.tsx`:
- Persistent card at bottom of sidebar
- Shows community name, water stress level, carbon context
- Always visible, not dismissable
- Uses CommunityBurden type from shared

### Step 7: 3D Scene

This is the largest section. Follow docs/frontend_design.md Section 6 and docs/prd.md Section 7 precisely.

Create `packages/frontend/src/three/DataCenterScene.tsx`:
- R3F Canvas with the lighting setup from frontend_design.md Section 6:
  - ambientLight: intensity 0.4, color #B8C4D0
  - directionalLight: intensity 0.8, position [10, 20, 10]
  - hemisphereLight: intensity 0.3, sky #87CEEB, ground #2D2D2D
- No shadows
- devicePixelRatio capped at 2
- Mount all scene children

Create `packages/frontend/src/three/CameraController.tsx`:
- OrbitControls with constraints: polar 20-80°, distance 15-50
- Default position: (25, 20, 25) looking at (0, 0, 0)
- Fly-to-layer animation: 800ms with ease-in-out + 10° orbit
- Camera targets per layer:
  - Power: focus on PDU cabinets
  - Cooling: focus on cooling towers
  - GPU: focus on rack rows
  - Workload: focus on ingress/egress
  - Location: pull back to show full scene + sky dome

Create `packages/frontend/src/three/GroundPlane.tsx`:
- Plane geometry
- Color lerps from green (#22C55E) to brown (#8B6914) based on waterStressIndex
- Material: metalness 0, roughness 1

Create `packages/frontend/src/three/SkyDome.tsx`:
- Hemisphere geometry
- Top color: #0F172A (matches dashboard bg)
- Horizon color: dynamic blend of ambient temp color + grid carbon color
  - Temp: lerp #3B82F6 (20°C) → #F97316 (42°C)
  - Carbon: lerp #3B82F6 (<200) → #78716C (>400)
  - Final = average of both

Create `packages/frontend/src/three/ServerRack.tsx`:
- Box geometry with detail panels
- 10 instances positioned in 2 rows of 5 (per scene layout in PRD Section 7)
- LED strip indicators using emissive material
- Health color emissive glow with pulse animation:
  - Healthy: 2.0s period
  - Warning: 1.5s period
  - Critical: 0.8s period
- Color lerp speed: 0.05 per frame
- Shutdown state: LEDs off, opacity 0.3, 1s transition
- Material: #2A3042, metalness 0.6, roughness 0.4

Create `packages/frontend/src/three/CoolingTower.tsx`:
- Cylinder geometry with fan disc on top
- 2 instances on facility perimeter
- Fan rotation speed = fanSpeedOverride lever value
- Health color on tower body
- Material: #3B4A5C, metalness 0.3, roughness 0.6

Create `packages/frontend/src/three/PDUCabinet.tsx`:
- Box geometry with panel lines
- 2 instances near facility entrance
- Health color reflects PUE health
- Material: #2E3B4E, metalness 0.5, roughness 0.5

Create `packages/frontend/src/three/CRAHUnit.tsx`:
- Flat box above each rack (10 instances)
- Material: #2A3042, metalness 0.4, roughness 0.5
- Dims slightly on cooling changes

Create `packages/frontend/src/three/DataFlow.tsx`:
- Ingress sphere (blue #3B82F6) and egress sphere (purple #8B5CF6)
- InstancedMesh particle system for data flow
- Particle speed inversely proportional to latency
- Particle density proportional to requestVolume / 5 (max 2000)
- Dropped requests: particles turn red (#EF4444) and fade before reaching egress
- Queue visualization: particle cluster near ingress proportional to queueDepth

Create `packages/frontend/src/three/effects/HeatHaze.tsx`:
- InstancedMesh particles rising from rack tops
- Density proportional to GPU temperature (normalized 55-90°C)
- Color: #F97316, opacity 0.3
- Drift upward 0.02 units/frame + random lateral ±0.005

Create `packages/frontend/src/three/effects/WaterParticles.tsx`:
- InstancedMesh particles flowing between cooling towers and racks
- Density proportional to cooling load
- Color: #38BDF8 (normal), #06B6D4 (recirculation mode — looping path)
- Velocity: 0.05-0.3 units/frame

Create `packages/frontend/src/three/effects/ElectricArc.tsx`:
- Line geometry between PDU and racks
- Color: #475569
- Dim/slow when power cap reduced
- Animate with noise for arc effect

### Step 8: Right Panel with Tabs

Create `packages/frontend/src/components/RightPanel.tsx`:
- Tab bar: "Alerts", "Scenarios", "History"
- Tab styling per frontend_design.md Section 5i
- Active tab indicator animates

Create `packages/frontend/src/components/AlertPanel.tsx`:
- Reverse-chronological list of alerts and recommendations
- Alert cards per frontend_design.md Section 5c
- Recommendation cards per Section 5d (with Dismiss and Apply buttons)
- "View Layer" button focuses camera and selects layer

Create `packages/frontend/src/components/ScenarioPanel.tsx`:
- List of scenarios with name, description, affected layer badges, "Simulate" button
- Active scenario shows progress bar
- Simulate button POSTs to /api/scenarios/:id/activate with mode: "simulation"
- Enter/exit simulation mode updates store

Create `packages/frontend/src/components/HistoryPanel.tsx`:
- Reverse-chronological change log entries
- Each entry: timestamp, action description, tradeoff text, outcome indicator
- Expandable detail view (Framer Motion)
- "Download Log" button exports as JSON file
- Fetch from GET /api/logs

### Step 9: Action Panel

Create `packages/frontend/src/components/ActionPanel.tsx`:
- Shows when a layer is selected (selectedLayer !== null)
- Renders the selected layer's levers as sliders/toggles
- Slider styling per frontend_design.md Section 5e
- On slider change: update pendingLeverChanges in store
- Show projected impact using shared formulas (computeInferenceLatency, etc.)
- "Commit Action" button (full width, blue, 40px height)
- Commit triggers the tradeoff modal

### Step 10: Tradeoff Modal

Create `packages/frontend/src/components/TradeoffModal.tsx`:
- EXACT layout from frontend_design.md Section 5f and PRD Section 8
- Blocking modal: backdrop clicks do nothing, no escape key dismiss
- Focus trap (implement with useEffect or use focus-trap-react)
- 4 dynamic sections: Action, Tradeoff, Community Impact, End User Impact
- Generate tradeoff text dynamically based on the lever change and current state
- Generate community impact text from CommunityBurden data
- Generate end-user impact text using shared formulas
- Checkbox (unchecked by default) gates the Confirm button
- Confirm button disabled + visually muted until checkbox checked
- On confirm: POST to /api/actions, show success toast, close modal
- On cancel: clear pending lever changes, close modal
- Animation: fade in + scale 0.95→1.0, 300ms

### Step 11: Toast System

Create `packages/frontend/src/components/Toast.tsx`:
- Fixed position top-right
- Success (green left border) and error (red left border) variants
- Slide in from right, auto-dismiss after 4s
- Stacking with 8px gap
- Styling per frontend_design.md Section 5g

### Step 12: Simulation Mode Banner

Add to App.tsx (or as a separate component):
- Banner per frontend_design.md Section 5h
- Shows when mode === 'simulation'
- Blue background rgba(59, 130, 246, 0.9)
- Pulsing dot animation
- Text: "SIMULATION MODE — changes are hypothetical"
- 3D scene: apply CSS filter (sepia/hue-rotate) on the canvas container for blue tint
- Slide in/out animation

### Step 13: Install and verify

Run `npm install` from packages/frontend/.
Run `npm run dev --workspace=packages/frontend` and verify:
- App renders with seed data (no backend needed)
- Layout shows all panels in correct positions
- Metrics top bar shows 6 tiles with values
- Layer sidebar shows 5 cards, clicking expands them
- 3D scene renders with racks, towers, PDUs, ground, sky
- Health colors display correctly (seed state should be mostly green)
- Clicking a layer card animates camera to that layer
- Right panel tabs switch between alerts/scenarios/history
- Action panel appears when a layer is selected with correct levers
- Sliders work and show projected impact
- Commit button opens tradeoff modal
- Modal checkbox gates the confirm button
- Connection status shows "Disconnected" (no backend running)

## Verification Checklist

Before finishing:
- [ ] `npm run dev` starts without errors
- [ ] Dashboard renders with seed data at localhost:5173
- [ ] All 5 layout panels visible (top bar, sidebar, 3D viewport, right panel, action panel)
- [ ] MetricsTopBar shows 6 metrics with correct values
- [ ] LayerSidebar shows 5 layers with health badges
- [ ] Clicking a layer expands its card and shows camera animation
- [ ] 3D scene has 10 racks, 2 cooling towers, 2 PDUs, ground, sky
- [ ] Health colors (green/amber/red) render correctly on 3D objects
- [ ] At least data flow particles are visible
- [ ] Right panel tabs work (alerts, scenarios, history)
- [ ] ActionPanel shows levers for selected layer
- [ ] TradeoffModal opens on commit, checkbox gates confirm button
- [ ] Toast appears on actions
- [ ] Colors match frontend_design.md exactly

Do NOT update docs/progress.md or docs/changelog.md.
If you find a missing type/constant in @izakaya/shared, add `// TODO(shared): <description>` and work around it locally.
```

---

### PHASE 3: Integration Agent

**Agent:** 1 of 1
**Estimated time:** 30 minutes
**Prerequisite:** Phase 2A and 2B both complete

---

```
You are the integration agent for the AI Factory Digital Twin. Phase 1 built the shared package. Phase 2 ran two parallel agents: one built the backend (packages/backend/), the other built the frontend (packages/frontend/). Your job is to connect them, fix issues, and verify everything works end-to-end.

## Docs to Read First

- docs/prd.md (Section 3 — all 5 user flows, Section 19 — success criteria)
- docs/integration_contract.md (the source of truth for what crosses the network boundary)
- docs/frontend_design.md (for visual verification)
- CLAUDE.md

## Boundary

You may modify ANY file in the repository. You are the only agent with this permission.

## Step 1: Resolve TODO(shared) Comments

Search all files for `// TODO(shared):` comments. For each one:
1. Determine if the needed type/constant/formula is already in @izakaya/shared (the Phase 2 agent may have missed it)
2. If missing, add it to the appropriate shared file
3. Remove the local workaround and use the shared import

## Step 2: Install All Dependencies

```bash
cd /path/to/repo
npm install
```

Verify all three packages resolve their dependencies correctly, especially the `@izakaya/shared` workspace reference.

## Step 3: Start Both Servers

Terminal 1: `npm run dev --workspace=packages/backend`
Terminal 2: `npm run dev --workspace=packages/frontend`

Fix any startup errors. Common issues:
- TypeScript path resolution for @izakaya/shared
- Missing dependencies
- Port conflicts
- Import/export mismatches

## Step 4: Verify WebSocket Connection

1. Open http://localhost:5173 in Chrome
2. Check browser console for WebSocket connection
3. Verify connection status indicator shows "Connected"
4. Verify metrics update every 2 seconds (watch the MetricsTopBar values change)

If WebSocket doesn't connect:
- Check Vite proxy config in vite.config.ts
- Verify backend WebSocket path matches frontend expectations (/ws)
- Check CORS settings

## Step 5: Verify Each User Flow

### Flow 1: Dashboard Loads with Live Twin
- [ ] Page loads in under 3 seconds
- [ ] 3D scene renders all components (10 racks, 2 towers, 2 PDUs, ground, sky)
- [ ] Top bar shows 6 metrics with updating values
- [ ] Sidebar shows 5 layers with health badges
- [ ] Metrics update smoothly every 2 seconds (no jarring jumps)
- [ ] Health colors on 3D objects match the data

### Flow 2: Alert Investigation
- [ ] Wait for metrics to drift into warning range (or manually trigger via scenario)
- [ ] Alert appears in the right panel with correct severity and colored border
- [ ] Clicking "View Layer" (or clicking the 3D component) selects the layer
- [ ] Camera animates to the affected layer's components
- [ ] Sidebar expands to show layer detail with all metrics

### Flow 3: What-If Scenario
- [ ] Navigate to Scenarios tab
- [ ] 5 scenarios listed with descriptions
- [ ] Click "Simulate" on Heatwave
- [ ] POST to /api/scenarios/heatwave-001/activate succeeds
- [ ] Simulation mode banner appears
- [ ] Metrics change over the scenario duration
- [ ] 3D scene reflects changes (sky color, rack colors, particle effects)
- [ ] Recommendations appear during scenario
- [ ] Scenario completes or can be ended manually

### Flow 4: Commit an Action
- [ ] Select the Cooling layer
- [ ] Adjust Cooling Setpoint slider from 22 to 25
- [ ] Projected impact text appears
- [ ] Click "Commit Action"
- [ ] Tradeoff modal appears with dynamic text
- [ ] Confirm button is disabled until checkbox is checked
- [ ] Check the checkbox, click "Confirm & Commit"
- [ ] POST to /api/actions succeeds
- [ ] Success toast appears
- [ ] 3D scene updates (cooling tower fans slow, etc.)
- [ ] Next state:update reflects the lever change

### Flow 5: Change History
- [ ] Navigate to History tab
- [ ] The committed action appears with timestamp, description, tradeoff text
- [ ] Clicking an entry expands to show full detail
- [ ] "Download Log" button downloads a JSON file
- [ ] JSON contains the full ChangeLogEntry with tradeoff acknowledgment

## Step 6: Fix Issues

For each failing check above, diagnose and fix. Common integration issues:

1. **State shape mismatch:** Backend sends a field the frontend doesn't expect, or vice versa. Fix by aligning to the shared types.
2. **WebSocket event format:** Backend sends `{ event, data }` but frontend expects a different envelope. Align to integration_contract.md.
3. **API response format:** Backend returns `{ state }` but frontend expects `state` directly. Match the contract.
4. **Lever value mapping:** Frontend sends lever name/value that backend doesn't recognize. Ensure lever IDs match between frontend ActionPanel and backend actionsController.
5. **3D component doesn't react to state:** Component subscribes to wrong store slice or uses wrong field name.
6. **Tradeoff text generation:** Frontend generates text but backend expects it in the request body, or vice versa.

## Step 7: Polish

- Ensure all health colors transition smoothly in the 3D scene
- Verify sparklines accumulate data over time (60 ticks)
- Check that community burden card always shows in sidebar
- Verify particle effects are visible (data flow, water, heat haze)
- Test at least 3 scenarios work (Heatwave required, Demand Spike required, Water Scarcity required)

## Step 8: Update Documentation

Update `docs/progress.md`:
- Mark all completed items with ✅
- Mark any incomplete items with 🟡 and add a note

Update `docs/changelog.md` with a single entry:
```
## 2026-04-12 — Full Implementation (Parallel Build)

### Phase 1: Shared Package
- Created packages/shared with all types, constants, and formulas
- Set up monorepo workspace configuration

### Phase 2: Backend
- Implemented simulation engine with 2s tick loop
- Built drift model, layer dependencies, alert/recommendation systems
- Defined all 5 scenarios
- Created REST API (7 endpoints) and WebSocket server

### Phase 2: Frontend
- Built React/Three.js dashboard with full layout
- Implemented 3D digital twin with 10 racks, cooling towers, PDUs, particles
- Created Zustand store with WebSocket integration
- Built all UI components: metrics bar, layer sidebar, alert/scenario/history panels
- Implemented ethical tradeoff modal and toast system

### Phase 3: Integration
- Connected frontend to backend WebSocket and REST API
- Verified all 5 user flows
- Fixed [list any issues found]

Files affected: [list major files]
```

## Final Verification

Run through the success criteria from PRD Section 19:
1. [ ] All 5 user flows completable end-to-end
2. [ ] 3D model renders correctly (all components, health colors, particles, camera)
3. [ ] At least 3 scenarios playable (Heatwave, Demand Spike, Water Scarcity)
4. [ ] Change log persists across scenario runs
5. [ ] Tradeoff modal fires on every action with dynamic text
6. [ ] Dashboard loads in under 3 seconds
7. [ ] WebSocket updates arrive within 1 second of tick
```

---

## 5. Integration Checklist

The Phase 3 agent uses this checklist. It maps to PRD Section 19 success criteria and all 5 user flows.

### A. Infrastructure
- [ ] `npm install` succeeds at repo root
- [ ] `npm run dev --workspace=packages/backend` starts without errors on port 3001
- [ ] `npm run dev --workspace=packages/frontend` starts without errors on port 5173
- [ ] @izakaya/shared resolves correctly in both packages
- [ ] No TypeScript compilation errors in any package

### B. WebSocket Connection
- [ ] Frontend connects to backend WebSocket via Vite proxy
- [ ] Connection status shows "Connected"
- [ ] state:update events arrive every ~2 seconds
- [ ] Reconnection works after brief disconnect

### C. Flow 1: Live Dashboard
- [ ] Page load under 3 seconds
- [ ] 3D scene: 10 racks visible
- [ ] 3D scene: 2 cooling towers visible
- [ ] 3D scene: 2 PDU cabinets visible
- [ ] 3D scene: ground plane and sky dome visible
- [ ] 3D scene: at least 1 particle system active
- [ ] Top bar: 6 metric tiles with values
- [ ] Sidebar: 5 layer cards with health badges
- [ ] Metrics update in real-time (values change every 2s)
- [ ] Health colors transition smoothly on 3D objects

### D. Flow 2: Alert Investigation
- [ ] Alerts appear when thresholds are breached
- [ ] Alert cards have colored severity borders
- [ ] Clicking alert/layer focuses camera on 3D components
- [ ] Sidebar expands to show layer detail

### E. Flow 3: What-If Scenario
- [ ] Scenarios tab lists all 5 scenarios
- [ ] Heatwave scenario activates successfully
- [ ] Simulation mode banner appears
- [ ] Metrics change during scenario
- [ ] 3D scene reflects scenario effects
- [ ] Recommendations appear contextually
- [ ] Demand Spike scenario works
- [ ] Water Scarcity scenario works

### F. Flow 4: Action Commit
- [ ] Layer selection shows action panel with correct levers
- [ ] Sliders/toggles adjust lever values
- [ ] Projected impact text displays using shared formulas
- [ ] "Commit Action" opens tradeoff modal
- [ ] Modal has 4 dynamic sections (Action, Tradeoff, Community, End User)
- [ ] Checkbox is unchecked by default
- [ ] Confirm button disabled until checked
- [ ] Confirm POSTs to /api/actions and succeeds
- [ ] Success toast appears
- [ ] 3D scene animates the change
- [ ] Cancel reverts lever to previous value

### G. Flow 5: Change History
- [ ] History tab shows committed actions
- [ ] Entries include timestamp, description, tradeoff text
- [ ] Entries are expandable
- [ ] "Download Log" exports valid JSON
- [ ] JSON includes full ChangeLogEntry with tradeoff acknowledgment

### H. Cross-Cutting
- [ ] Community burden card always visible in sidebar
- [ ] Tradeoff modal cannot be bypassed (no escape, no backdrop click)
- [ ] Change log is append-only (entries persist across interactions)
- [ ] Camera fly-to-layer works on sidebar click and 3D click
- [ ] Sparklines accumulate 60 ticks of history
