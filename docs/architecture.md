# Software Architecture & System Design Document

**Version:** 1.0
**Date:** April 12, 2026
**Source PRD:** docs/prd.md v1.0

---

## 1. System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER CLIENT                               │
│                                                                         │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────────────┐ │
│  │ Zustand Store │◄─┤ useSimulation    │  │ React Three Fiber Canvas  │ │
│  │              │  │ Socket (hook)    │  │  - Scene graph            │ │
│  │ simulationState│ │                  │  │  - useFrame animations    │ │
│  │ selectedLayer │  │ WebSocket client │  │  - Health color lerp      │ │
│  │ mode          │  │ reconnect logic  │  │  - Particle systems       │ │
│  │ activePanel   │  └────────▲─────────┘  └───────────▲───────────────┘ │
│  └──────┬───────┘           │                        │                  │
│         │                   │                 subscribes to store        │
│         ▼                   │                        │                  │
│  ┌──────────────┐           │              ┌─────────┴───────────┐     │
│  │ UI Panels    │           │              │ 3D Components       │     │
│  │ - MetricsBar │           │              │ - ServerRack ×10    │     │
│  │ - LayerSidebar│          │              │ - CoolingTower ×2   │     │
│  │ - AlertPanel │           │              │ - PDU ×2            │     │
│  │ - ActionPanel│           │              │ - DataFlowParticles │     │
│  │ - TradeoffModal│         │              │ - SkyDome, Ground   │     │
│  └──────┬───────┘           │              └─────────────────────┘     │
│         │                   │                                           │
│         │ REST (fetch)      │ WebSocket (ws://)                        │
└─────────┼───────────────────┼───────────────────────────────────────────┘
          │                   │
          ▼                   │
┌─────────────────────────────┼───────────────────────────────────────────┐
│                         NODE.JS BACKEND                                  │
│                                                                         │
│  ┌──────────────┐     ┌────┴───────────┐     ┌───────────────────────┐ │
│  │ Express REST │     │ WebSocket      │     │ Simulation Engine     │ │
│  │ /api/state   │     │ Server (ws)    │     │                       │ │
│  │ /api/actions │     │                │◄────┤ setInterval(2000ms)   │ │
│  │ /api/scenarios│    │ broadcasts to  │     │                       │ │
│  │ /api/logs    │     │ all clients    │     │ 1. applyDrift()       │ │
│  │ /api/recs    │     └────────────────┘     │ 2. applyScenarios()   │ │
│  └──────┬───────┘                            │ 3. propagateDeps()    │ │
│         │                                    │ 4. recalcDerived()    │ │
│         │         ┌────────────────┐         │ 5. evalAlerts()       │ │
│         └────────►│ In-Memory State│◄────────┤ 6. evalRecommendations│ │
│                   │                │         │ 7. broadcast()        │ │
│                   │ SimulationState│         └───────────────────────┘ │
│                   │ changeLog[]    │                                    │
│                   │ alertHistory[] │                                    │
│                   │ recHistory[]   │                                    │
│                   └────────────────┘                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

**Data flow per tick:**
1. `setInterval` fires every 2000ms on the backend
2. The engine mutates `SimulationState` in place: drift → scenarios → dependencies → derived metrics → alerts → recommendations
3. The WebSocket server serializes the full state and broadcasts `{ event: "state:update", data: SimulationState }` to all connected clients
4. The client's `useSimulationSocket` hook receives the message, parses it, and calls `setSimulationState()` on the Zustand store
5. React components subscribed to store slices re-render; React Three Fiber components interpolate toward new target values in `useFrame`

**REST flow (operator action):**
1. Operator adjusts lever → clicks "Commit Action" → fills tradeoff modal → clicks "Confirm & Commit"
2. Frontend POSTs to `/api/actions` with lever change + acknowledgment payload
3. Backend validates, applies lever change to state, creates `ChangeLogEntry`, returns projected impact
4. Backend emits `action:confirmed` via WebSocket
5. Next tick picks up the new lever values and propagates effects naturally

---

## 2. Technology Stack

### Frontend

| Dependency | Version | Purpose |
|---|---|---|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM renderer |
| typescript | ^5.4.5 | Type safety |
| @react-three/fiber | ^8.16.8 | React renderer for Three.js |
| @react-three/drei | ^9.109.2 | R3F helpers (OrbitControls, Float, Text, etc.) |
| three | ^0.167.1 | 3D engine (peer dep of R3F) |
| @types/three | ^0.167.1 | Three.js type definitions |
| zustand | ^4.5.4 | State management |
| tailwindcss | ^3.4.7 | Utility-first CSS |
| recharts | ^2.12.7 | Sparkline charts |
| framer-motion | ^11.3.19 | UI animations |
| autoprefixer | ^10.4.19 | PostCSS plugin for Tailwind |
| postcss | ^8.4.40 | CSS processing |

### Backend

| Dependency | Version | Purpose |
|---|---|---|
| express | ^4.19.2 | HTTP server |
| ws | ^8.18.0 | WebSocket server |
| uuid | ^10.0.0 | ID generation |
| cors | ^2.8.5 | CORS middleware |
| typescript | ^5.4.5 | Type safety |

### Dev / Build

| Tool | Version | Purpose |
|---|---|---|
| vite | ^5.4.0 | Frontend dev server & bundler |
| @vitejs/plugin-react | ^4.3.1 | React Fast Refresh for Vite |
| tsx | ^4.16.5 | Backend dev runner (TypeScript execution with watch) |
| tsup | ^8.2.4 | Backend production build (bundles to JS) |
| @types/express | ^4.17.21 | Express type definitions |
| @types/ws | ^8.5.12 | ws type definitions |
| @types/uuid | ^10.0.0 | uuid type definitions |
| @types/cors | ^2.8.17 | cors type definitions |

### Frontend `package.json` dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@react-three/fiber": "^8.16.8",
    "@react-three/drei": "^9.109.2",
    "three": "^0.167.1",
    "zustand": "^4.5.4",
    "recharts": "^2.12.7",
    "framer-motion": "^11.3.19"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.167.1",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.7",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40"
  }
}
```

### Backend `package.json` dependencies

```json
{
  "dependencies": {
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

---

## 3. Repository Structure

```
/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── simulation/
│   │   │   │   ├── engine.ts            # Tick loop, setInterval, orchestrates all per-tick operations
│   │   │   │   ├── drift.ts             # Environmental drift model (per-metric noise + direction)
│   │   │   │   ├── dependencies.ts      # Layer interdependency propagation (Location→Cooling→GPU→Workload→Power)
│   │   │   │   ├── scenarios.ts         # Scenario definitions, event queue processing, activation/deactivation
│   │   │   │   ├── alerts.ts            # Threshold evaluation, alert generation, auto-resolution
│   │   │   │   ├── recommendations.ts   # Trigger condition evaluation, recommendation lifecycle
│   │   │   │   └── seed.ts              # Initial SimulationState (tick 0) from PRD Section 16
│   │   │   ├── api/
│   │   │   │   ├── router.ts            # Express router — mounts all route handlers
│   │   │   │   ├── stateController.ts   # GET /api/state
│   │   │   │   ├── actionsController.ts # POST /api/actions — validates acknowledgment, applies lever, creates log entry
│   │   │   │   ├── scenariosController.ts # GET /api/scenarios, POST /api/scenarios/:id/activate
│   │   │   │   ├── logsController.ts    # GET /api/logs
│   │   │   │   └── recommendationsController.ts # GET /api/recommendations, POST /api/recommendations/:id/dismiss
│   │   │   ├── websocket/
│   │   │   │   └── connectionManager.ts # ws server setup, client tracking, broadcast(), message envelope formatting
│   │   │   └── index.ts                 # Entry point: creates Express app, attaches ws to HTTP server, starts engine
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── MetricsTopBar.tsx     # Six KPI tiles with sparklines
│   │   │   │   ├── LayerSidebar.tsx      # Five stacked layer cards, expandable detail view
│   │   │   │   ├── AlertPanel.tsx        # Alerts tab — alert cards with severity borders
│   │   │   │   ├── ScenarioPanel.tsx     # Scenarios tab — scenario list with Simulate buttons
│   │   │   │   ├── HistoryPanel.tsx      # History tab — change log entries, JSON download
│   │   │   │   ├── ActionPanel.tsx       # Lever sliders/toggles for selected layer, Commit button
│   │   │   │   ├── RightPanel.tsx        # Tab container wrapping Alert/Scenario/History panels
│   │   │   │   ├── TradeoffModal.tsx     # Ethical acknowledgment modal — non-skippable, checkbox-gated
│   │   │   │   ├── CommunityBurden.tsx   # Persistent community impact card in sidebar
│   │   │   │   └── Toast.tsx             # Success/error toast notifications
│   │   │   ├── three/
│   │   │   │   ├── DataCenterScene.tsx   # Top-level R3F Canvas + scene composition
│   │   │   │   ├── ServerRack.tsx        # Single rack: box geometry, LED indicators, heat haze
│   │   │   │   ├── CoolingTower.tsx      # Tower with spinning fan, water particles
│   │   │   │   ├── PDUCabinet.tsx        # Power distribution unit with arc effects
│   │   │   │   ├── DataFlow.tsx          # Ingress sphere → particle stream → egress sphere
│   │   │   │   ├── SkyDome.tsx           # Hemisphere sky, color-driven by grid carbon + ambient temp
│   │   │   │   ├── GroundPlane.tsx       # Ground with community burden color ring
│   │   │   │   ├── CRAHUnit.tsx          # Flat box above each rack
│   │   │   │   ├── CameraController.tsx  # Fly-to-layer animations, OrbitControls constraints
│   │   │   │   └── effects/
│   │   │   │       ├── HeatHaze.tsx      # Per-rack heat shimmer particle effect
│   │   │   │       ├── WaterParticles.tsx # Cooling tower water flow particles
│   │   │   │       └── ElectricArc.tsx   # PDU-to-rack energy visualization
│   │   │   ├── store/
│   │   │   │   └── useDashboardStore.ts  # Zustand store — simulation state, UI state, derived selectors
│   │   │   ├── hooks/
│   │   │   │   ├── useSimulationSocket.ts # WebSocket connection, reconnect logic, event dispatch
│   │   │   │   └── useLayerHealth.ts      # Derives layer health summaries from simulation state
│   │   │   ├── types/
│   │   │   │   └── index.ts              # Re-exports from @izakaya/shared — no local type definitions
│   │   │   ├── App.tsx                   # Root layout: sidebar + viewport + right panel + top bar
│   │   │   ├── main.tsx                  # ReactDOM.createRoot entry point
│   │   │   └── index.css                 # Tailwind directives + custom CSS vars for health colors
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── shared/
│       ├── src/
│       │   ├── types.ts                  # ALL TypeScript interfaces from PRD Section 13
│       │   ├── constants.ts              # Threshold values, seed data, config (tick rate, base values, noise ranges)
│       │   └── formulas.ts              # Pure functions for derived metrics (PUE, WUE, CUE, carbon, latency, etc.)
│       ├── tsconfig.json
│       └── package.json
├── package.json                          # Workspace root — npm workspaces config, shared scripts
└── tsconfig.base.json                    # Shared TypeScript compiler options extended by each package
```

### Directory justifications

**`packages/shared/`** — Single source of truth for types, constants, and formulas. Both backend and frontend import from this package. The backend uses formulas to compute derived metrics each tick; the frontend uses the same formulas for optimistic lever-change previews. This eliminates formula drift between the two.

**`packages/backend/src/simulation/`** — Isolates the simulation engine from HTTP/WS concerns. Each file handles one phase of the tick loop. This means a backend engineer can work on `drift.ts` without touching `alerts.ts`, and the tick ordering in `engine.ts` is a readable sequence of function calls.

**`packages/backend/src/api/`** — One controller per REST resource. The router composes them. This keeps each controller small (~50–100 lines) and independently readable.

**`packages/backend/src/websocket/`** — Encapsulates ws server lifecycle and broadcast logic. The simulation engine calls `broadcast(event, data)` without knowing about WebSocket internals.

**`packages/frontend/src/three/`** — Separates 3D scene components from 2D UI components. 3D components have fundamentally different concerns (geometry, materials, useFrame, shader effects) and are composed inside a Canvas boundary. Keeping them in their own directory makes it clear which components run inside the R3F reconciler vs. the DOM reconciler.

**`packages/frontend/src/three/effects/`** — Particle systems and visual effects are reusable across 3D components (heat haze appears on multiple racks, water particles on both towers). Isolating them prevents duplication.

**`packages/frontend/src/store/`** — Single Zustand store file. One store is sufficient for this application. No need for multiple store files at this scale.

**`packages/frontend/src/hooks/`** — Custom hooks that encapsulate side effects (WebSocket connection) and derived state logic (layer health computation). Components stay declarative.

**`packages/frontend/src/types/`** — A re-export barrel that imports from `@izakaya/shared`. No types are defined here. This ensures the frontend never drifts from the shared type definitions.

---

## 4. Shared Types Strategy

### What goes in `@izakaya/shared`

Every TypeScript interface defined in PRD Section 13 lives in `packages/shared/src/types.ts`. The complete list:

| Interface | Used By |
|---|---|
| `SimulationState` | Backend (state holder, broadcast payload), Frontend (store shape, all UI rendering) |
| `PowerLayerState` | Backend (mutation in tick), Frontend (layer detail view) |
| `CoolingLayerState` | Backend, Frontend |
| `GPULayerState` | Backend, Frontend |
| `WorkloadLayerState` | Backend, Frontend |
| `LocationLayerState` | Backend, Frontend |
| `DerivedMetrics` | Backend (recalculation), Frontend (top bar display) |
| `HealthStatus` | Backend (threshold evaluation), Frontend (color mapping) |
| `LayerHealth` | Frontend (sidebar rendering) |
| `Metric` | Frontend (sparkline rendering, detail views) |
| `Lever` | Backend (action validation), Frontend (action panel rendering) |
| `Recommendation` | Backend (generation), Frontend (display), Both (lifecycle management) |
| `Alert` | Backend (generation), Frontend (display) |
| `ScenarioDefinition` | Backend (scenario engine), Frontend (scenario panel) |
| `ScenarioEvent` | Backend only — but kept in shared because the type is part of `ScenarioDefinition` |
| `ActionCommit` | Backend (request validation), Frontend (request construction) |
| `ChangeLogEntry` | Backend (log storage), Frontend (history display + JSON export) |
| `EndUserImpact` | Backend (calculation), Frontend (modal display, history display) |
| `CommunityBurden` | Backend (calculation), Frontend (community card + modal) |

### Import mechanism

The shared package is declared as `"@izakaya/shared"` in its `package.json` `name` field. The workspace root `package.json` declares npm workspaces:

```json
{ "workspaces": ["packages/*"] }
```

Both backend and frontend list `"@izakaya/shared": "workspace:*"` in their dependencies. TypeScript project references in each package's `tsconfig.json` point to `../shared/tsconfig.json`, enabling cross-package type resolution without a build step during development.

### Avoiding type drift

1. **No local type redefinitions.** The frontend's `types/index.ts` is a re-export barrel: `export * from '@izakaya/shared'`. No interface is ever re-declared locally.
2. **Formulas in shared.** Because `formulas.ts` lives in shared with the types, the functions' parameter and return types are always consistent with the interfaces.
3. **Constants in shared.** Threshold values (`PUE_WARNING = 1.3`, etc.) are defined once in `constants.ts`. Backend uses them for alert evaluation; frontend uses them for color mapping. No magic numbers in either package.

---

## 5. State Management Architecture

### Backend: In-Memory State

A single mutable `SimulationState` object is held in module scope within `engine.ts`:

```
let state: SimulationState = createSeedState();  // from seed.ts
```

On each tick, the engine mutates this object directly. There is no immutability layer, no event sourcing, no state snapshots. This is a deliberate choice for a single-process hackathon app where simplicity beats correctness guarantees.

**Mutation order per tick:**
1. Increment `state.tick`, advance `state.simulatedTimeSeconds` and `state.timestamp`
2. `applyEnvironmentalDrift(state)` — mutates location layer metrics with noise
3. `applyScenarioEvents(state)` — applies any active scenario's events for the current tick offset
4. `propagateLayerDependencies(state)` — walks the dependency graph: Location → Cooling → GPU → Workload → Power
5. `recalculateDerivedMetrics(state)` — calls shared formula functions, writes results to `state.derivedMetrics`
6. `evaluateAlerts(state)` — checks thresholds, pushes new alerts to `state.activeAlerts`, emits `alert:new` via WebSocket
7. `evaluateRecommendations(state)` — checks trigger conditions, manages recommendation lifecycle, emits `recommendation:new`
8. `broadcast('state:update', state)` — serializes full state to JSON and sends to all connected WebSocket clients

**Auxiliary state arrays** (also in module scope):
- `changeLog: ChangeLogEntry[]` — append-only, served by `GET /api/logs`
- `alertHistory: Alert[]` — append-only, for history display
- `recommendationHistory: Recommendation[]` — all recommendations ever generated

**Serialization:** `JSON.stringify(state)` is called once per tick. The resulting string is sent to all clients. At ~15KB per state payload and 0.5Hz, this is negligible bandwidth.

### Frontend: Zustand Store

```
useDashboardStore
├── simulationState: SimulationState | null    ← replaced wholesale on each WS update
├── selectedLayer: string | null               ← which layer card is selected
├── mode: 'live' | 'simulation'               ← mirrors state.mode
├── activePanel: 'alerts' | 'scenarios' | 'history'
├── pendingLeverChanges: Map<string, number>   ← optimistic preview values
├── connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
│
├── setSimulationState(state)                  ← called by useSimulationSocket on every WS message
├── selectLayer(layerId | null)
├── setActivePanel(panel)
├── setPendingLeverChange(leverId, value)
├── clearPendingLeverChanges()
└── setConnectionStatus(status)
```

**How WebSocket updates merge into the store:**
The `setSimulationState` action performs a wholesale replacement of `simulationState`. No merging, no diffing. The full state arrives every 2 seconds and overwrites the previous value. This is simple and correct because the server is the sole source of truth.

**How UI components subscribe to slices:**
Zustand supports selector-based subscriptions. Components only re-render when their selected slice changes:

- `MetricsTopBar` subscribes to `state.simulationState.derivedMetrics`
- `LayerSidebar` subscribes to `state.simulationState.layers` and `state.selectedLayer`
- `AlertPanel` subscribes to `state.simulationState.activeAlerts`
- `ActionPanel` subscribes to `state.selectedLayer` and the corresponding layer's `levers` object
- 3D components subscribe to the specific layer state they represent (e.g., `ServerRack` subscribes to `state.simulationState.layers.gpu`)

### Optimistic Updates (Lever Preview)

When the operator drags a lever slider, the frontend does NOT send any request. Instead:

1. The slider's `onChange` writes to `pendingLeverChanges` in the store: `{ "cooling.coolingSetpoint": 25 }`
2. The `ActionPanel` component reads `pendingLeverChanges` and overlays the pending value on top of the server-confirmed value
3. The frontend calls the shared `formulas.ts` functions locally, passing the pending lever value to compute projected metric changes. These projections are displayed as "Projected Impact" text next to the lever.
4. 3D components can optionally read `pendingLeverChanges` to preview visual changes (e.g., rack brightness dims when GPU power limit is being reduced)
5. On "Commit Action" → modal → "Confirm & Commit", the frontend POSTs to `/api/actions` and clears `pendingLeverChanges`
6. If the operator cancels, `clearPendingLeverChanges()` reverts the preview

The frontend never modifies `simulationState` directly. Pending changes are a separate overlay, and the next `state:update` from the server reflects the committed change authoritatively.

---

## 6. Communication Architecture

### REST API

**Express server setup (`index.ts`):**
- `express()` instance with middleware applied in order: `cors()`, `express.json()`, error handler
- Router mounted at `/api` prefix
- HTTP server created with `http.createServer(app)` (required to share the port with ws)

**Middleware stack:**
1. `cors({ origin: 'http://localhost:5173' })` — allows the Vite dev server origin. In production, set to the CloudFront domain.
2. `express.json({ limit: '1mb' })` — parses JSON request bodies. 1MB limit is generous for this API; no request body exceeds a few KB.
3. Error-handling middleware (final): catches thrown errors, returns `{ error: string }` with appropriate HTTP status.

**Route → Controller mapping:**

| Method | Path | Controller | Purpose |
|---|---|---|---|
| GET | /api/state | stateController.getState | Returns current `SimulationState` |
| GET | /api/scenarios | scenariosController.listScenarios | Returns all `ScenarioDefinition[]` |
| POST | /api/scenarios/:id/activate | scenariosController.activateScenario | Activates a scenario; returns 404/409 on error |
| POST | /api/actions | actionsController.commitAction | Validates acknowledgment, applies lever change, returns projected impact |
| GET | /api/logs | logsController.getLogs | Returns `ChangeLogEntry[]` with pagination (limit/offset) |
| GET | /api/recommendations | recommendationsController.listActive | Returns recommendations with `status === 'active'` |
| POST | /api/recommendations/:id/dismiss | recommendationsController.dismiss | Sets recommendation status to 'dismissed' |

**Validation rules (actionsController):**
- `tradeoffAcknowledgment.acknowledged` must be `true` → 400 if not
- `layerId` must be a valid layer → 400 if not
- `leverId` must exist on that layer → 400 if not
- `newValue` must be within the lever's min/max range → 400 if not
- No scenario with `mode === 'simulation'` can be active during a live commit → 409 if so

### WebSocket

**Server setup:**
The ws server is attached to the same HTTP server as Express, listening on the `/ws` path:

```
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
```

This means both REST and WebSocket share port 3001.

**Connection lifecycle:**

1. **Connect:** Client opens `ws://localhost:3001/ws`. Server adds the socket to a `Set<WebSocket>` of active clients. Server immediately sends the current `SimulationState` as a `state:update` event so the client doesn't wait up to 2s for the first tick.
2. **Heartbeat:** The server pings each client every 30 seconds. If a client does not respond with a pong within 10 seconds, the server terminates the connection and removes it from the client set. This prevents zombie connections.
3. **Broadcast:** On each tick (and on alert/recommendation events), the server iterates the client set and sends the JSON envelope to each open connection. Clients with `readyState !== OPEN` are removed.
4. **Disconnect:** On `close` or `error`, the server removes the client from the set. No cleanup is needed since there's no per-client state.

**Client reconnection:**
The `useSimulationSocket` hook implements reconnection with exponential backoff:
- Initial delay: 1 second
- Multiplier: 2x each attempt
- Maximum delay: 30 seconds
- Maximum attempts: unlimited (keeps trying forever)
- On reconnect, the hook sets `connectionStatus` to `'reconnecting'`. On successful open, it sets `'connected'`. The UI displays a disconnection banner when status is not `'connected'`.

**Message format (all messages, both directions):**

```json
{
  "event": "state:update",
  "data": { ... }
}
```

The `event` field is one of: `state:update`, `alert:new`, `recommendation:new`, `scenario:progress`, `action:confirmed`.

The `data` field contains the typed payload corresponding to the event.

**Client event processing:**
The hook parses incoming messages, reads the `event` field, and dispatches:

| Event | Handler |
|---|---|
| `state:update` | `store.setSimulationState(data)` — wholesale state replacement |
| `alert:new` | No-op — the alert is already in `state.activeAlerts` from the next `state:update`. The separate event exists to trigger an audio cue and toast notification immediately, without waiting for the next tick. |
| `recommendation:new` | Same as alert:new — triggers a toast immediately. State arrives in the next tick. |
| `scenario:progress` | Updates a local progress counter for the active scenario progress bar. |
| `action:confirmed` | Clears `pendingLeverChanges`, shows success toast. |

---

## 7. Simulation Engine Architecture

### Tick Loop

The engine runs a single `setInterval` at 2000ms. This is the heartbeat of the entire system. The interval callback is synchronous — all operations within a tick complete before the next tick fires. At the scale of this simulation (~50 metrics, 5 layers), a single tick completes in <1ms.

**Tick ordering (critical — must execute in this sequence):**

```
tick() {
  1. state.tick++
  2. state.simulatedTimeSeconds += 300  // 5 simulated minutes
  3. state.timestamp = computeTimestamp(state.simulatedTimeSeconds)

  4. applyEnvironmentalDrift(state)
     // Location layer: ambient temp, grid carbon, renewables, water stress, AQI
     // GPU layer: temperature creep under load
     // Workload layer: request volume follows time-of-day pattern

  5. applyScenarioEvents(state)
     // If activeScenario exists:
     //   - Filter scenario events where tickOffset === (current tick - scenario start tick)
     //   - Apply each event: set, add, or multiply the target metric
     //   - Track active effects; remove expired effects (durationTicks elapsed)
     //   - Emit scenario:progress event

  6. propagateLayerDependencies(state)
     // Order: Location → Cooling → GPU → Workload → Power → Derived
     // Uses convergence formula: value = target + (current - target) * 0.85
     // This creates smooth exponential approach, no instant jumps

  7. recalculateDerivedMetrics(state)
     // Calls shared formulas: PUE, WUE, CUE, carbonOutput, gpuIdlePowerWaste
     // Updates cumulative totals: totalCarbonEmittedKg, totalWaterConsumedLiters

  8. evaluateAlerts(state)
     // For each metric, check against healthy/warning/critical thresholds
     // If newly breached: create Alert, push to activeAlerts, emit alert:new via WS
     // If previously breached but now resolved: remove from activeAlerts
     // Update each layer's health field to worst-case of its metrics

  9. evaluateRecommendations(state)
     // Check each trigger condition (e.g., "PUE > 1.3 for 5+ ticks")
     // Maintain tick counters per condition
     // If newly triggered: create Recommendation from template, emit recommendation:new
     // If condition no longer met: auto-resolve the recommendation
     // If lever was changed matching a recommendation's suggestedAction (within 20%): mark acted_on

  10. broadcast('state:update', state)
}
```

### State Mutation Strategy

The `SimulationState` object is mutated in place. No copies, no immutability, no events. Functions receive the state by reference and modify it directly:

```
function applyEnvironmentalDrift(state: SimulationState): void {
  state.layers.location.ambientTemperature += drift + noise;
  // ...
}
```

This is appropriate because:
- Single process, single thread — no race conditions
- No undo/redo requirement
- No event replay requirement
- Simplest possible implementation for a hackathon

### Scenario Injection

When a scenario is activated (via `POST /api/scenarios/:id/activate`):

1. The engine records `scenarioStartTick = state.tick` and sets `state.activeScenario = scenario.id`
2. On each subsequent tick, `applyScenarioEvents` computes `tickOffset = state.tick - scenarioStartTick`
3. It filters `scenario.events` for entries where `event.tickOffset === tickOffset`
4. For each matching event, it applies the operation to the target metric:
   - `set`: overwrite the metric value
   - `add`: add the event value to the current metric value
   - `multiply`: multiply the current metric value by the event value
5. Active effects are tracked in a list: `{ event, expiresAtTick: state.tick + event.durationTicks }`
6. On each tick, expired effects are removed. When an effect expires, its contribution is simply no longer applied — the metric returns to drift-driven behavior naturally via the convergence formula.
7. When `tickOffset > scenario.totalDurationTicks` (or operator clicks "End Simulation"), the scenario is deactivated: `state.activeScenario = null`, all remaining effects are removed.

**Simulation mode (what-if):** When `mode === 'simulation'`, the engine forks the state by deep-cloning it before applying the scenario. All mutations happen on the forked copy. The forked copy is broadcast instead of the live state. When the simulation ends, the fork is discarded and the live state resumes broadcasting.

### Formula Module

`packages/shared/src/formulas.ts` exports pure functions:

```
computePUE(totalFacilityPower, itEquipmentPower) → number
computeWUE(waterUsageRate, itEquipmentPower) → number
computeCUE(totalFacilityPower, gridCarbonIntensity, itEquipmentPower) → number
computeCarbonOutput(totalFacilityPower, gridCarbonIntensity) → number
computeGpuIdlePowerWaste(gpuUtilizationRate, gpuPowerLimit, activeGpuCount) → number
computeInferenceLatency(avgGpuTemp, queueDepth, batchSize) → number
computeCoolingPower(ambientTemp, fanSpeed, recircMode, coolingSetpoint) → number
computeWaterUsageRate(ambientTemp, coolingSetpoint, recircMode) → number
computeGpuTemperature(utilization, coolingSetpoint, ambientTemp, gpuPowerLimit) → number
computeQueueDepth(prevQueueDepth, requestVolume, requestRateLimit, effectiveThroughput) → number
computeRequestDropRate(queueDepth, inboundRate) → number
computeITEquipmentPower(activeGpuCount, gpuPowerLimit, gpuUtilizationRate) → number
```

These functions take primitive values, not the full state object. This makes them testable in isolation and usable by both backend (tick loop) and frontend (lever preview projections).

---

## 8. 3D Rendering Architecture

### React Three Fiber Scene Graph

```
<Canvas>                                    ← R3F Canvas, fills center viewport
  <CameraController />                      ← OrbitControls + fly-to-layer animation logic
  <ambientLight intensity={0.4} />
  <directionalLight position={[10,20,10]} />
  <SkyDome />                               ← Hemisphere geometry, color from grid carbon + ambient temp
  <GroundPlane />                            ← Plane, color from water stress; community burden ring
  <group position={[0,0,0]}>                ← Facility group, centered
    {/* Row 1: Racks 1-5 */}
    <ServerRack position={[-8,0,-3]} rackIndex={0} />
    <ServerRack position={[-4,0,-3]} rackIndex={1} />
    ...
    {/* Row 2: Racks 6-10 */}
    <ServerRack position={[-8,0,3]} rackIndex={5} />
    ...
    {/* Cooling */}
    <CoolingTower position={[-12,0,-8]} />
    <CoolingTower position={[12,0,-8]} />
    {/* Power */}
    <PDUCabinet position={[-12,0,8]} />
    <PDUCabinet position={[12,0,8]} />
    {/* CRAH units — one above each rack */}
    <CRAHUnit position={[-8,3,-3]} />
    ...
    {/* Data flow */}
    <DataFlow />                            ← Ingress sphere, egress sphere, particle stream
  </group>
  {/* Effects */}
  <HeatHaze />                              ← Per-rack heat shimmer (reads GPU temp from store)
  <WaterParticles />                        ← Tower-to-rack water flow (reads cooling state)
  <ElectricArc />                           ← PDU-to-rack energy arcs (reads power state)
</Canvas>
```

### Simulation State → 3D Props Mapping

| State Value | 3D Prop | Mapping |
|---|---|---|
| Layer `health` ('healthy'/'warning'/'critical') | `MeshStandardMaterial.color` + `emissive` | Color lookup: healthy=#22C55E, warning=#F59E0B, critical=#EF4444. Transition via `THREE.Color.lerp()` in useFrame over 500ms. |
| `gpu.averageGpuTemperature` | Rack body emissive intensity + heat haze particle density | Normalized to 0–1 range over 55–90°C. Haze particle count = floor(normalized * 200) per rack. |
| `gpu.levers.gracefulRackShutdown[i]` | Rack opacity + LED visibility | Shutdown rack: opacity fades to 0.3 over 1s, LEDs turn off sequentially (100ms each). |
| `cooling.levers.fanSpeedOverride` | CoolingTower fan rotation speed | `rotationSpeed = fanSpeedOverride * 2 * Math.PI` radians/sec. Applied in useFrame. |
| `cooling.levers.waterRecirculationMode` | Water particle color + trajectory | Off: blue (#3B82F6), linear path. On: cyan (#06B6D4), loop path. |
| `workload.requestVolume` | DataFlow particle density | `particleCount = min(2000, requestVolume / 5)` |
| `workload.averageInferenceLatency` | DataFlow particle speed | `speed = max(0.1, 1 - (latency / 400))` — higher latency = slower particles |
| `workload.requestDropRate` | DataFlow particle color | Particles randomly turn red (probability = dropRate) and fade out before reaching egress. |
| `location.ambientTemperature` | SkyDome color | Lerp between blue (#3B82F6) at 20°C and intense orange (#F97316) at 42°C. |
| `location.gridCarbonIntensity` | SkyDome secondary color | Lerp between blue (#3B82F6) at <200 and gray-brown (#78716C) at >400. Blend with ambient temp color. |
| `location.waterStressIndex` | GroundPlane color | Lerp between green (#22C55E) at 0 and brown (#92400E) at 1. |
| `power.levers.powerCap` | ElectricArc intensity | Normalized over 600–1200kW range. Higher = brighter, more frequent arc pulses. |

### Animation Strategy

**Per-frame interpolation (useFrame):**
All continuous animations run in `useFrame`. Components read target values from the Zustand store and interpolate toward them each frame using `THREE.MathUtils.lerp(current, target, 0.05)` for smooth 60fps transitions. This decouples the 2-second server tick rate from the 60fps render rate.

Example: a rack's emissive color changes when health changes. The rack's `useFrame` callback lerps its current color toward the new health color at 5% per frame, completing the transition in ~60 frames (1 second).

**Spring-based transitions for discrete state changes:**
When a rack is shut down (boolean toggle), use `@react-three/drei`'s `useSpring` or manual easing for the opacity transition. Duration: 1 second, ease-out.

**Particle systems:**
Particles use instanced meshes (`THREE.InstancedMesh`) for performance. Each particle system manages a fixed-size pool:
- DataFlow: 2000 max instances
- WaterParticles: 500 max instances per tower (1000 total)
- HeatHaze: 200 max instances per rack (2000 total)

Particles are recycled (reset position) rather than created/destroyed.

### Performance Budget

| Metric | Budget | Justification |
|---|---|---|
| Static polygon count | <10,000 | All geometry is simple boxes, cylinders, spheres. 10 racks × 200 + 2 towers × 300 + 10 CRAHs × 50 + misc ≈ 3,500. |
| Particle instances | <4,000 concurrent | DataFlow (2000) + Water (1000) + HeatHaze (2000) worst case, but HeatHaze only activates on hot racks. Typical: ~2,000. |
| Draw calls | <50 | Instanced meshes reduce draw calls. Each particle system = 1 draw call. Each unique material = 1 draw call. |
| Frame rate target | 60fps on integrated GPU | Achieved by: no shadows, no PBR, no post-processing (simulation mode tint is a CSS filter on the canvas container, not a GPU shader pass), low poly count. |
| Canvas resolution | `devicePixelRatio` capped at 2 | Prevents 3x+ retina from tanking fill rate. Set via `<Canvas dpr={[1, 2]}>`. |

---

## 9. Error Handling Strategy

### WebSocket Disconnects

**Detection:** The `useSimulationSocket` hook listens for `close` and `error` events on the WebSocket.

**Response:**
1. Set `connectionStatus` to `'disconnected'` in the store.
2. The UI displays a non-dismissable banner at the top of the viewport: "Connection lost. Reconnecting..." in amber.
3. Begin exponential backoff reconnection (1s, 2s, 4s, 8s, 16s, 30s cap).
4. While disconnected, the last received `SimulationState` remains in the store. The UI is stale but functional — the operator can still browse historical data and review the last known state.
5. On reconnect, the hook re-establishes the WebSocket. The server immediately sends the current state. The store updates and the UI resumes live updates. Banner disappears.

### REST Call Failures

**Network errors (fetch throws):** Display a toast: "Network error. Please check your connection." Do not retry automatically — the operator can retry manually.

**4xx errors:** Display the error message from the response body in a toast. For `POST /api/actions` specifically:
- 400 (validation failure): Toast the error. Do not clear the modal — the operator can correct and retry.
- 409 (scenario conflict): Toast "Cannot commit during active simulation." Close the modal, revert the lever.

**5xx errors:** Display a toast: "Server error. Please try again." Log the response to the console.

### Invalid Lever Values

**Frontend prevention:** Lever sliders are constrained by `min`, `max`, and `step` attributes from the lever definition (sourced from `constants.ts`). It is impossible to submit an out-of-range value through the UI.

**Backend validation:** `actionsController` validates `newValue` against the lever's valid range. Returns 400 with a descriptive error if out of range. This catches programmatic API calls or tampered requests.

### Simulation Produces NaN

**Prevention:** All formula functions in `formulas.ts` guard against division by zero:
- `computePUE`: if `itEquipmentPower === 0`, return `1.0` (theoretical minimum PUE)
- `computeWUE`: if `itEquipmentPower === 0`, return `0`
- `computeCUE`: if `itEquipmentPower === 0`, return `0`

**Detection:** After `recalculateDerivedMetrics`, the engine checks all derived metric values with `Number.isFinite()`. If any value is NaN or Infinity, it is clamped to the metric's valid range boundary and a warning is logged to the server console. The simulation continues — a single bad tick should not crash the demo.

**Frontend defense:** Components that render numeric values use a display helper: `formatMetric(value)` returns `'--'` if the value is not a finite number. This prevents `NaN` from appearing in the UI.

---

## 10. Development Workflow

### Prerequisites

- Node.js 20 LTS
- npm 10+

### Install

From the repository root:

```bash
npm install
```

This installs all dependencies for all three packages (backend, frontend, shared) via npm workspaces. A single `node_modules` at the root with hoisted dependencies. The shared package is symlinked automatically.

### Run (Development)

```bash
npm run dev
```

The root `package.json` defines:

```json
{
  "scripts": {
    "dev": "npm run dev --workspace=packages/backend & npm run dev --workspace=packages/frontend",
    "build": "npm run build --workspace=packages/shared && npm run build --workspace=packages/backend && npm run build --workspace=packages/frontend"
  }
}
```

**What happens:**
1. Backend starts via `tsx --watch src/index.ts` on port 3001. TypeScript is executed directly with hot reload on file changes. The simulation engine starts immediately and begins ticking.
2. Frontend starts via `vite` on port 5173. Vite's dev server proxies `/api` and `/ws` to `localhost:3001` (configured in `vite.config.ts`).

**Vite proxy config:**

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': { target: 'ws://localhost:3001', ws: true }
    }
  }
})
```

The operator opens `http://localhost:5173` in Chrome. The frontend connects to the WebSocket via the Vite proxy, and the dashboard is live.

### Build (Production)

```bash
npm run build
```

1. Shared package compiles via `tsc` (types only — the source is pure TypeScript consumed directly by the other packages, but the build emits `.d.ts` files for any external consumer).
2. Backend compiles via `tsup src/index.ts --format esm` → outputs `dist/index.js`.
3. Frontend compiles via `vite build` → outputs `dist/` with static HTML/JS/CSS.

### Port Assignments

| Service | Port | Protocol |
|---|---|---|
| Backend (Express + WS) | 3001 | HTTP + WS |
| Frontend (Vite dev) | 5173 | HTTP |
| Frontend (production) | Served via S3/CloudFront | HTTPS |
