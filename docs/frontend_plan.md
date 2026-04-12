# Frontend Implementation Plan

**Version:** 1.0
**Date:** April 12, 2026
**Source:** docs/prd.md v1.0, docs/architecture.md v1.0

---

## 1. Implementation Order

### Phase 1: Project Setup & Store
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 1 | `packages/frontend/package.json` | Dependencies: react, react-dom, @react-three/fiber, @react-three/drei, three, zustand, recharts, framer-motion, tailwindcss | S |
| 2 | `packages/frontend/vite.config.ts` | Vite config with React plugin, dev server proxy to backend :3001 | S |
| 3 | `packages/frontend/tsconfig.json` | Strict mode TS config, references `../shared/tsconfig.json` | S |
| 4 | `packages/frontend/tailwind.config.ts` | Dark theme, custom colors (slate-900 bg, health colors, simulation blue) | S |
| 5 | `packages/frontend/postcss.config.js` | Tailwind + autoprefixer | S |
| 6 | `packages/frontend/index.html` | Root HTML with `<div id="root">`, min-viewport meta | S |
| 7 | `packages/frontend/src/index.css` | Tailwind directives, CSS custom properties for health colors, base dark styles | S |
| 8 | `packages/frontend/src/main.tsx` | ReactDOM.createRoot entry point | S |
| 9 | `packages/frontend/src/types/index.ts` | Re-export barrel: `export * from '@izakaya/shared'` | S |
| 10 | `packages/frontend/src/store/useDashboardStore.ts` | Zustand store with all slices, actions, selectors | M |
| 11 | `packages/frontend/src/hooks/useSimulationSocket.ts` | WebSocket hook: connect, reconnect, event dispatch | M |
| 12 | `packages/frontend/src/hooks/useLayerHealth.ts` | Derives layer health summaries from simulation state | S |

### Phase 2: Layout Shell
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 13 | `packages/frontend/src/App.tsx` | Root CSS Grid layout: sidebar + top bar + viewport + right panel | M |
| 14 | `packages/frontend/src/components/MetricsTopBar.tsx` | Container for six metric tiles (stub) | S |
| 15 | `packages/frontend/src/components/LayerSidebar.tsx` | Container for five layer cards (stub) | S |
| 16 | `packages/frontend/src/components/RightPanel.tsx` | Tab container: Alerts/Scenarios/History (stub) | S |
| 17 | `packages/frontend/src/components/ActionPanel.tsx` | Lever panel container (stub) | S |
| 18 | `packages/frontend/src/three/DataCenterScene.tsx` | R3F Canvas placeholder (stub) | S |

### Phase 3: Metrics Top Bar
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 19 | `packages/frontend/src/components/MetricsTopBar.tsx` | Full implementation: six metric tiles, sparklines, trend arrows | M |

### Phase 4: Layer Sidebar
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 20 | `packages/frontend/src/components/LayerSidebar.tsx` | Full: five cards, click-to-select, expanded detail view | M |
| 21 | `packages/frontend/src/components/CommunityBurden.tsx` | Persistent community impact card at sidebar bottom | S |

### Phase 5: 3D Twin Viewport
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 22 | `packages/frontend/src/three/DataCenterScene.tsx` | Full R3F Canvas + scene composition + lighting | M |
| 23 | `packages/frontend/src/three/CameraController.tsx` | OrbitControls + fly-to-layer animation | M |
| 24 | `packages/frontend/src/three/GroundPlane.tsx` | Ground plane colored by water stress | S |
| 25 | `packages/frontend/src/three/SkyDome.tsx` | Hemisphere colored by grid carbon + ambient temp | M |
| 26 | `packages/frontend/src/three/ServerRack.tsx` | Box geometry, LEDs, health color, shutdown state | L |
| 27 | `packages/frontend/src/three/CoolingTower.tsx` | Cylinder + animated fan + health color | M |
| 28 | `packages/frontend/src/three/PDUCabinet.tsx` | Box + panel lines + health color | S |
| 29 | `packages/frontend/src/three/CRAHUnit.tsx` | Flat box above each rack | S |
| 30 | `packages/frontend/src/three/DataFlow.tsx` | Ingress/egress spheres + particle stream | L |
| 31 | `packages/frontend/src/three/effects/HeatHaze.tsx` | Per-rack heat shimmer particles | M |
| 32 | `packages/frontend/src/three/effects/WaterParticles.tsx` | Tower-to-rack water flow particles | M |
| 33 | `packages/frontend/src/three/effects/ElectricArc.tsx` | PDU-to-rack energy arcs | M |

### Phase 6: Recommendation & Alert Panel
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 34 | `packages/frontend/src/components/RightPanel.tsx` | Full tab implementation | S |
| 35 | `packages/frontend/src/components/AlertPanel.tsx` | Alert/recommendation cards with severity borders | M |
| 36 | `packages/frontend/src/components/ScenarioPanel.tsx` | Scenario list with Simulate buttons, progress bar | M |
| 37 | `packages/frontend/src/components/HistoryPanel.tsx` | Change log entries, expandable detail, JSON download | M |

### Phase 7: Action/Lever Panel
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 38 | `packages/frontend/src/components/ActionPanel.tsx` | Full lever rendering, live preview, Commit button | L |

### Phase 8: Ethical Tradeoff Modal
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 39 | `packages/frontend/src/components/TradeoffModal.tsx` | Blocking modal, dynamic content, checkbox-gated confirm | L |
| 40 | `packages/frontend/src/components/Toast.tsx` | Success/error toast notifications | S |

### Phase 9: Simulation Mode
| # | File Path | Purpose | Complexity |
|---|-----------|---------|------------|
| 41 | Modifications to `DataCenterScene.tsx`, `MetricsTopBar.tsx`, `App.tsx` | Simulation banner, blue tint, dashed sparklines, results overlay | M |

---

## 2. Phase 1: Project Setup & Store

### 2.1 Vite Project Initialization

The project already has the structure defined in `packages/frontend/`. Initialize with:

```bash
cd packages/frontend
npm init -y
npm install react@^18.3.1 react-dom@^18.3.1 @react-three/fiber@^8.16.8 @react-three/drei@^9.109.2 three@^0.167.1 zustand@^4.5.4 recharts@^2.12.7 framer-motion@^11.3.19
npm install -D typescript@^5.4.5 @types/react@^18.3.3 @types/react-dom@^18.3.0 @types/three@^0.167.1 vite@^5.4.0 @vitejs/plugin-react@^4.3.1 tailwindcss@^3.4.7 autoprefixer@^10.4.19 postcss@^8.4.40
```

**`vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
});
```

**`tsconfig.json`:**
- `strict: true`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`
- References: `["../shared/tsconfig.json"]`
- Paths: `"@izakaya/shared": ["../shared/src"]`

### 2.2 Tailwind CSS Configuration

**`tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dashboard chrome
        'dash-bg': '#0F172A',        // slate-900
        'panel-bg': '#1E293B',       // slate-800
        'panel-border': '#334155',   // slate-700
        'text-primary': '#F8FAFC',   // slate-50
        'text-secondary': '#94A3B8', // slate-400

        // Health states
        'health-green': '#22C55E',
        'health-green-glow': '#4ADE80',
        'health-amber': '#F59E0B',
        'health-amber-glow': '#FBBF24',
        'health-red': '#EF4444',
        'health-red-glow': '#F87171',

        // Simulation mode
        'sim-blue': '#3B82F6',

        // Severity
        'severity-info': '#6366F1',
        'severity-warning': '#F59E0B',
        'severity-critical': '#EF4444',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

**`src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --health-green: #22C55E;
  --health-amber: #F59E0B;
  --health-red: #EF4444;
  --sim-blue: #3B82F6;
}

body {
  margin: 0;
  background-color: #0F172A;
  color: #F8FAFC;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  min-width: 1280px;
  min-height: 720px;
  overflow: hidden;
}
```

### 2.3 Zustand Store Definition

**File:** `src/store/useDashboardStore.ts`

```typescript
import { create } from 'zustand';
import type { SimulationState } from '@izakaya/shared';

interface DashboardStore {
  // --- Simulation state (replaced wholesale every WS tick) ---
  simulationState: SimulationState | null;

  // --- UI state ---
  selectedLayer: string | null;                      // 'power' | 'cooling' | 'gpu' | 'workload' | 'location' | null
  activePanel: 'alerts' | 'scenarios' | 'history';
  pendingLeverChanges: Record<string, number | boolean>;  // e.g. { "cooling.coolingSetpoint": 25 }
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  modalOpen: boolean;                                 // tradeoff modal visibility
  modalPayload: ModalPayload | null;                  // data for the tradeoff modal
  toasts: Toast[];                                    // active toast notifications
  scenarioProgress: { scenarioId: string; ticksElapsed: number; totalTicks: number; phase: string } | null;

  // --- Metric history (client-side ring buffer for sparklines) ---
  metricHistory: Record<string, number[]>;            // key = metric ID, value = last 60 values

  // --- Actions ---
  setSimulationState: (state: SimulationState) => void;
  selectLayer: (layerId: string | null) => void;
  setActivePanel: (panel: 'alerts' | 'scenarios' | 'history') => void;
  setPendingLeverChange: (key: string, value: number | boolean) => void;
  clearPendingLeverChanges: () => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  openTradeoffModal: (payload: ModalPayload) => void;
  closeTradeoffModal: () => void;
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  setScenarioProgress: (progress: { scenarioId: string; ticksElapsed: number; totalTicks: number; phase: string } | null) => void;
}

interface ModalPayload {
  layerId: string;
  leverId: string;
  leverName: string;
  previousValue: number | boolean;
  newValue: number | boolean;
  tradeoffText: string;
  communityImpactText: string;
  endUserImpactText: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  createdAt: number;
}
```

**`setSimulationState` implementation details:**
1. Replace `simulationState` wholesale with the incoming state.
2. Append current derived metric values to `metricHistory` ring buffers (keep last 60 entries per metric). The metrics to track:
   - `derivedMetrics.pue`
   - `derivedMetrics.wue`
   - `derivedMetrics.cue`
   - `derivedMetrics.carbonOutputKgPerHr`
   - `derivedMetrics.gpuIdlePowerWasteKw` (used internally but not in top bar)
   - `layers.gpu.gpuUtilizationRate` (for top bar GPU Utilization tile)
   - `layers.workload.requestVolume` (for top bar Throughput tile)
3. Also append per-layer metric values to history for layer detail sparklines. For each layer, track all metrics listed in PRD Section 4.

**Selectors (defined as standalone functions for component subscriptions):**

```typescript
// Top bar
export const selectDerivedMetrics = (s: DashboardStore) => s.simulationState?.derivedMetrics ?? null;
export const selectGpuUtilization = (s: DashboardStore) => s.simulationState?.layers.gpu.gpuUtilizationRate ?? 0;
export const selectThroughput = (s: DashboardStore) => s.simulationState?.layers.workload.requestVolume ?? 0;

// Layer sidebar
export const selectLayers = (s: DashboardStore) => s.simulationState?.layers ?? null;
export const selectSelectedLayer = (s: DashboardStore) => s.selectedLayer;

// Alert panel
export const selectActiveAlerts = (s: DashboardStore) => s.simulationState?.activeAlerts ?? [];
export const selectActiveRecommendations = (s: DashboardStore) => s.simulationState?.activeRecommendations ?? [];

// Action panel
export const selectSelectedLayerState = (s: DashboardStore) => {
  if (!s.selectedLayer || !s.simulationState) return null;
  return s.simulationState.layers[s.selectedLayer as keyof typeof s.simulationState.layers];
};

// 3D components
export const selectPowerLayer = (s: DashboardStore) => s.simulationState?.layers.power ?? null;
export const selectCoolingLayer = (s: DashboardStore) => s.simulationState?.layers.cooling ?? null;
export const selectGpuLayer = (s: DashboardStore) => s.simulationState?.layers.gpu ?? null;
export const selectWorkloadLayer = (s: DashboardStore) => s.simulationState?.layers.workload ?? null;
export const selectLocationLayer = (s: DashboardStore) => s.simulationState?.layers.location ?? null;
export const selectSimMode = (s: DashboardStore) => s.simulationState?.mode ?? 'live';

// Metric history for sparklines
export const selectMetricHistory = (key: string) => (s: DashboardStore) => s.metricHistory[key] ?? [];

// Connection
export const selectConnectionStatus = (s: DashboardStore) => s.connectionStatus;
```

### 2.4 WebSocket Hook — `useSimulationSocket`

**File:** `src/hooks/useSimulationSocket.ts`

**Behavior:**
1. On mount, connect to `ws://localhost:3001/ws` (in dev) or `wss://${window.location.host}/ws` (in prod, determined by `import.meta.env.PROD`).
2. Set `connectionStatus` to `'connected'` on open.
3. On message, parse JSON envelope `{ event, data }` and dispatch:

| Event | Action |
|-------|--------|
| `state:update` | `store.setSimulationState(data)` |
| `alert:new` | `store.addToast({ type: 'warning', message: data.message })`, play audio chime (warning = soft, critical = sharp) |
| `recommendation:new` | `store.addToast({ type: 'info', message: data.title })` |
| `scenario:progress` | `store.setScenarioProgress(data)` |
| `action:confirmed` | `store.clearPendingLeverChanges()`, `store.addToast({ type: 'success', message: 'Action committed. Monitoring impact.' })` |

4. On close/error: set `connectionStatus` to `'disconnected'`, begin reconnection.
5. **Reconnection logic:** exponential backoff starting at 1000ms, doubling each attempt, capped at 30000ms. On each attempt, set `connectionStatus` to `'reconnecting'`. On success, reset delay to 1000ms and set `'connected'`.
6. On unmount, close the WebSocket and cancel any pending reconnect timeout.
7. **Audio:** Import two small audio files (or generate via Web Audio API). Warning = 440Hz sine wave 200ms. Critical = 880Hz sine wave 300ms. Only play if `document.visibilityState === 'visible'`.

**No return value.** This hook is called once in `App.tsx` purely for its side effects.

### 2.5 useLayerHealth Hook

**File:** `src/hooks/useLayerHealth.ts`

**Purpose:** Derives a summary array of `LayerHealth` objects from the simulation state for the sidebar.

**Returns:** `LayerHealth[]` — array of 5 objects, one per layer, each containing:
- `layerId`: `'power' | 'cooling' | 'gpu' | 'workload' | 'location'`
- `layerName`: Human-readable name (e.g., "Power & Energy")
- `health`: The `health` field from the layer state
- `icon`: Emoji icon — `'⚡'` (power), `'❄️'` (cooling), `'🖥️'` (gpu), `'📊'` (workload), `'🌍'` (location)
- `primaryMetrics`: Two key metrics per layer:
  - Power: PUE, Renewable Energy Fraction
  - Cooling: WUE, Cooling Setpoint
  - GPU: GPU Utilization, Avg GPU Temp
  - Workload: Inference Latency, Request Volume
  - Location: Water Stress Index, Grid Carbon Intensity

**Subscribes to:** `selectLayers` selector. Uses `useMemo` to recompute only when layers change.

---

## 3. Phase 2: Layout Shell

### 3.1 App.tsx — Root Layout

**File:** `src/App.tsx`

**Structure:** CSS Grid with named areas:

```css
.dashboard {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  grid-template-rows: 64px 1fr;
  grid-template-areas:
    "sidebar topbar    topbar"
    "sidebar viewport  rightcol";
  height: 100vh;
  width: 100vw;
  min-width: 1280px;
  min-height: 720px;
  background-color: #0F172A;
}
```

The right column (`rightcol`) is itself a flex column containing:
- `RightPanel` (flex: 1, overflow: hidden)
- `ActionPanel` (height: 280px, flex-shrink: 0)

**Renders:**
```tsx
<div className="dashboard">
  {/* Connection banner — shows above grid when disconnected */}
  {connectionStatus !== 'connected' && <ConnectionBanner status={connectionStatus} />}

  {/* Simulation mode banner — shows above grid when in simulation mode */}
  {simMode === 'simulation' && <SimulationBanner />}

  <aside style={{ gridArea: 'sidebar' }}>
    <LayerSidebar />
  </aside>

  <header style={{ gridArea: 'topbar' }}>
    <MetricsTopBar />
  </header>

  <main style={{ gridArea: 'viewport' }}>
    <DataCenterScene />
  </main>

  <div style={{ gridArea: 'rightcol' }} className="flex flex-col">
    <RightPanel />
    <ActionPanel />
  </div>

  {/* Modals & toasts (portaled) */}
  {modalOpen && <TradeoffModal />}
  <ToastContainer />

  {/* Minimum viewport warning */}
  <MinViewportWarning />
</div>
```

**Calls:** `useSimulationSocket()` once at the top level.
**Subscribes to:** `selectConnectionStatus`, `selectSimMode`, `modalOpen`.

**`ConnectionBanner`** (inline component): Fixed position bar at top, amber background, text: "Connection lost. Reconnecting..." when disconnected, "Reconnecting..." with a spinner when reconnecting. z-index: 50.

**`SimulationBanner`** (inline component): Fixed position bar below connection banner, `bg-sim-blue` (#3B82F6), text: "SIMULATION MODE — Changes are not committed". z-index: 49.

**`MinViewportWarning`** (inline component): Only renders if `window.innerWidth < 1280 || window.innerHeight < 720`. Full-screen overlay with message: "Please resize your browser to at least 1280×720." Check on mount and on window resize.

### 3.2 Panel Dimensions

| Panel | Position | Width | Height | Overflow |
|-------|----------|-------|--------|----------|
| Layer Sidebar | Left | 280px fixed | 100vh - 64px (below top bar area, but grid puts it full height) | overflow-y: auto, scrollbar-thin |
| Metrics Top Bar | Top | Full width minus sidebar and right panel (grid: spans 2 cols) | 64px fixed | overflow: hidden |
| 3D Viewport | Center | Fills remaining (grid: 1fr) | Fills remaining (grid: 1fr) | overflow: hidden |
| Right Panel (alerts/scenarios/history) | Right top | 320px fixed | Flex: 1 (fills space above action panel) | overflow-y: auto per tab |
| Action Panel | Right bottom | 320px fixed | 280px fixed | overflow-y: auto |

All panels: `bg-panel-bg` (`#1E293B`), `border border-panel-border` (`#334155`), `rounded-none` (square corners to fill grid cells exactly).

---

## 4. Phase 3: Metrics Top Bar

### 4.1 MetricsTopBar Component

**File:** `src/components/MetricsTopBar.tsx`

**Subscribes to:** `selectDerivedMetrics`, `selectGpuUtilization`, `selectThroughput`, `selectMetricHistory(key)` for each of the six metrics.

**Renders:** A horizontal flex row of six `MetricTile` sub-components, evenly spaced, inside a 64px tall container with `bg-panel-bg`, `border-b border-panel-border`.

### 4.2 MetricTile Sub-Component (defined inside MetricsTopBar.tsx)

**Props:**
```typescript
interface MetricTileProps {
  label: string;       // e.g., "PUE"
  value: number;       // current value
  unit: string;        // e.g., "ratio", "L/kWh", "%", "kgCO2/hr", "req/hr"
  history: number[];   // last 60 values for sparkline
  precision: number;   // decimal places (e.g., 2 for PUE, 0 for throughput)
}
```

**Six tiles:**

| Label | Source | Unit | Precision | Format |
|-------|--------|------|-----------|--------|
| PUE | `derivedMetrics.pue` | ratio | 2 | `1.24` |
| WUE | `derivedMetrics.wue` | L/kWh | 2 | `0.87` |
| CUE | `derivedMetrics.cue` | kgCO2/kWh | 2 | `0.22` |
| GPU Util | `layers.gpu.gpuUtilizationRate × 100` | % | 1 | `72.0%` |
| Carbon | `derivedMetrics.carbonOutputKgPerHr` | kgCO2/hr | 1 | `145.3` |
| Throughput | `layers.workload.requestVolume` | req/hr | 0 | `8,000` |

**Tile layout (each tile ~180px wide, 48px tall):**
```
┌──────────────────────────┐
│ PUE          1.24  ↑     │
│ ratio   ▁▂▃▄▅▆▇█▇▆▅▃▂   │
└──────────────────────────┘
```

- **Label:** `text-text-secondary text-xs font-medium uppercase`, top-left
- **Value:** `text-text-primary text-xl font-bold tabular-nums`, top-right. Apply CSS transition: `transition: all 200ms ease-out` — this makes value changes animate smoothly.
- **Trend arrow:** To the right of the value. Compare current value to value from 5 ticks ago (`history[history.length - 6]`):
  - If current > 5-ago by > 1%: `↑` in green (for metrics where up is good, like GPU Util, Throughput) or red (for PUE, WUE, CUE, Carbon where up is bad)
  - If current < 5-ago by > 1%: `↓` in red or green (inverse)
  - Otherwise: `→` in `text-text-secondary`
  - Color logic: PUE/WUE/CUE/Carbon — lower is better (↓ = green, ↑ = red). GPU Util/Throughput — higher is better (↑ = green, ↓ = red).
- **Unit:** `text-text-secondary text-[10px]`, below label
- **Sparkline:** `Recharts` `<LineChart>` or `<AreaChart>`, 80px wide × 20px tall, no axes, no grid, no tooltip. Single line in `#94A3B8` (text-secondary). When in simulation mode, the projected portion (after the current tick) renders as a dashed line in `#3B82F6`.

**Sparkline implementation:**
```tsx
<ResponsiveContainer width={80} height={20}>
  <LineChart data={history.map((v, i) => ({ i, v }))}>
    <Line type="monotone" dataKey="v" stroke="#94A3B8" strokeWidth={1} dot={false} />
  </LineChart>
</ResponsiveContainer>
```

If Recharts sparklines are too heavy, fall back to inline SVG:
```tsx
<svg width={80} height={20} viewBox={`0 0 ${history.length} 20`}>
  <polyline
    points={history.map((v, i) => `${i},${20 - normalize(v) * 20}`).join(' ')}
    fill="none" stroke="#94A3B8" strokeWidth="1"
  />
</svg>
```

The inline SVG approach is preferred for performance (60 data points × 6 tiles = 360 points, trivial).

---

## 5. Phase 4: Layer Sidebar

### 5.1 LayerSidebar Component

**File:** `src/components/LayerSidebar.tsx`

**Subscribes to:** `selectLayers`, `selectSelectedLayer`, `selectMetricHistory(key)`.

**Renders:** A vertical flex column of five `LayerCard` components plus a `CommunityBurden` card at the bottom, all inside a scrollable container with `bg-panel-bg`, `border-r border-panel-border`.

### 5.2 LayerCard Sub-Component

**Props:**
```typescript
interface LayerCardProps {
  layerId: string;
  layerName: string;
  icon: string;          // emoji
  health: HealthStatus;
  primaryMetrics: { name: string; value: number; unit: string }[];
  isSelected: boolean;
  onSelect: () => void;
}
```

**Collapsed state (default, 56px height):**
```
┌─────────────────────────────┐
│ ⚡ Power & Energy    ● 1.24 │
│                       68%   │
└─────────────────────────────┘
```

- Left: icon (emoji, 20px), layer name (`text-text-primary text-sm font-medium`)
- Right: health badge (colored circle, 8px diameter), two metric values (`text-text-secondary text-xs tabular-nums`)
- Health badge colors: healthy = `bg-health-green`, warning = `bg-health-amber`, critical = `bg-health-red`
- Click anywhere on the card: call `store.selectLayer(layerId)`. If already selected, call `store.selectLayer(null)` to deselect.

**Selected state:** Card gets a left border (4px) in the health color. Background shifts to the health color at 10% opacity:
- Healthy: `rgba(34, 197, 94, 0.1)`
- Warning: `rgba(245, 158, 11, 0.1)`
- Critical: `rgba(239, 68, 68, 0.1)`

**Expanded state (when selected):** Card animates open using Framer Motion `<motion.div>` with `animate={{ height: 'auto' }}` over 300ms ease-in-out. Shows all metrics for the layer with sparklines:

```
┌─────────────────────────────┐
│ ⚡ Power & Energy    ●      │  ← header row with health badge
├─────────────────────────────┤
│ Total Facility Power   850kW │
│ ▁▂▃▄▅▆▇█▇▆▅▃▂             │  ← sparkline
│ IT Equipment Power     720kW │
│ ▁▂▃▄▅▆▇█▇▆▅▃▂             │
│ PUE                    1.24  │
│ ▁▂▃▄▅▆▇█▇▆▅▃▂             │
│ Grid Carbon Int.    180gCO2  │
│ ▁▂▃▄▅▆▇█▇▆▅▃▂             │
│ Renewable Frac.       65%    │
│ ▁▂▃▄▅▆▇█▇▆▅▃▂             │
└─────────────────────────────┘
```

Each metric row: name on left (`text-text-secondary text-xs`), value+unit on right (`text-text-primary text-sm tabular-nums`), sparkline below (80px × 16px, same inline SVG approach as top bar).

**Metric status color:** Each metric value text is colored by its health status: green/amber/red. Determine status by checking the value against thresholds from `@izakaya/shared/constants`.

**Scroll behavior:** The sidebar container has `overflow-y: auto`. When an expanded card exceeds the visible area, the sidebar scrolls. Use `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` on the selected card when it expands.

### 5.3 Metrics per layer for expanded view

| Layer | Metrics |
|-------|---------|
| Power | Total Facility Power (kW), IT Equipment Power (kW), PUE (ratio), Grid Carbon Intensity (gCO2/kWh), Renewable Energy Fraction (%) |
| Cooling | Cooling Setpoint (°C), Water Usage Rate (L/hr), WUE (L/kWh), Ambient Temperature (°C), Coolant Supply Temperature (°C) |
| GPU | Avg GPU Temperature (°C), GPU Utilization (%), Active GPU Count, GPU Idle Power Waste (kW), Hardware Failure Rate (failures/day) |
| Workload | Request Volume (req/hr), Avg Inference Latency (ms), Queue Depth (requests), Request Drop Rate (%), Batch Efficiency (%) |
| Location | Ambient Temperature (°C), Grid Carbon Intensity (gCO2/kWh), Renewable Energy Fraction (%), Water Stress Index (ratio), Local Air Quality Index (AQI) |

### 5.4 CommunityBurden Component

**File:** `src/components/CommunityBurden.tsx`

**Subscribes to:** `selectLocationLayer`, `selectCoolingLayer`.

**Renders:** A persistent card at the bottom of the sidebar. Always visible, not dismissable.

```
┌─────────────────────────────┐
│ 🏘️ Community Impact         │
├─────────────────────────────┤
│ Umatilla County, Oregon     │
│                              │
│ Water Stress:  ●● LOW (0.3)  │  ← colored badge
│ Water Draw:    650 L/hr      │
│ Carbon:  ≈ 12 cars/day equiv │
│ Air Quality:   Good (AQI 42) │
└─────────────────────────────┘
```

- Water stress level: derived from `location.waterStressIndex`:
  - < 0.3: `LOW` (green)
  - 0.3–0.6: `MODERATE` (amber)
  - > 0.6: `HIGH` (red)
  - > 0.8: `CRITICAL` (red, pulsing)
- Water draw: `cooling.waterUsageRate` × 24 for daily estimate
- Carbon context: `derivedMetrics.carbonOutputKgPerHr × 24 / 404` (404 gCO2/mile, 12,000 miles/year ≈ 4,600 kgCO2/year/car ≈ 12.6 kgCO2/day/car). Display as "≈ X cars/day equiv".
- Air quality: Map AQI to label (0–50: Good, 51–100: Moderate, 101+: Unhealthy).

---

## 6. Phase 5: 3D Twin Viewport

### 6.1 DataCenterScene — Canvas Setup

**File:** `src/three/DataCenterScene.tsx`

**Subscribes to:** `selectSimMode` (for blue tint CSS filter).

**Renders:**
```tsx
<div className="relative w-full h-full" style={{
  filter: simMode === 'simulation' ? 'saturate(0.7) brightness(0.9) sepia(0.1) hue-rotate(200deg)' : 'none',
  transition: 'filter 500ms ease-in-out',
}}>
  <Canvas
    dpr={[1, 2]}
    camera={{ position: [25, 20, 25], fov: 45, near: 0.1, far: 200 }}
    style={{ background: 'transparent' }}
  >
    <ambientLight intensity={0.4} />
    <directionalLight position={[10, 20, 10]} intensity={0.8} />

    <CameraController />
    <SkyDome />
    <GroundPlane />

    <group position={[0, 0, 0]}>
      {/* Row 1: Racks 0-4, positioned at z = -3 */}
      {[0, 1, 2, 3, 4].map(i => (
        <ServerRack key={i} position={[-8 + i * 4, 0, -3]} rackIndex={i} />
      ))}
      {/* Row 2: Racks 5-9, positioned at z = 3 */}
      {[5, 6, 7, 8, 9].map(i => (
        <ServerRack key={i} position={[-8 + (i - 5) * 4, 0, 3]} rackIndex={i} />
      ))}

      {/* CRAH units above each rack */}
      {[0, 1, 2, 3, 4].map(i => (
        <CRAHUnit key={`crah-top-${i}`} position={[-8 + i * 4, 3.5, -3]} rackIndex={i} />
      ))}
      {[5, 6, 7, 8, 9].map(i => (
        <CRAHUnit key={`crah-bot-${i}`} position={[-8 + (i - 5) * 4, 3.5, 3]} rackIndex={i} />
      ))}

      {/* Cooling towers */}
      <CoolingTower position={[-14, 0, -8]} />
      <CoolingTower position={[14, 0, -8]} />

      {/* PDU cabinets */}
      <PDUCabinet position={[-14, 0, 8]} />
      <PDUCabinet position={[14, 0, 8]} />

      {/* Data flow */}
      <DataFlow />
    </group>

    {/* Particle effects (read state from store, render globally) */}
    <HeatHaze />
    <WaterParticles />
    <ElectricArc />
  </Canvas>

  {/* Simulation mode badge overlay (DOM, top-left of canvas) */}
  {simMode === 'simulation' && (
    <div className="absolute top-3 left-3 bg-sim-blue/80 text-white text-xs px-3 py-1 rounded-full font-medium">
      SIMULATION
    </div>
  )}
</div>
```

**No props.** Reads all state via Zustand selectors internally or passes down via child components.

### 6.2 CameraController

**File:** `src/three/CameraController.tsx`

**Subscribes to:** `selectSelectedLayer`.

**Behavior:**
- Wraps `<OrbitControls>` from `@react-three/drei` with constraints:
  - `minPolarAngle={Math.PI / 9}` (20°)
  - `maxPolarAngle={Math.PI * 4 / 9}` (80°)
  - `minDistance={15}`
  - `maxDistance={50}`
  - `enablePan={false}` (prevent panning away from the scene)
  - `target={[0, 0, 0]}` (default look-at)

**Fly-to-layer:** When `selectedLayer` changes from null to a layer ID, animate the camera to focus on that layer's primary components:

| Layer | Target Position (camera) | Target LookAt |
|-------|-------------------------|---------------|
| power | `[14, 8, 12]` | `[14, 0, 8]` (PDU area) |
| cooling | `[-14, 10, -12]` | `[-14, 0, -8]` (cooling tower area) |
| gpu | `[0, 12, 0]` | `[0, 0, 0]` (center, rack area) |
| workload | `[-12, 8, 0]` | `[0, 0, 0]` (wide view showing data flow) |
| location | `[25, 20, 25]` | `[0, 0, 0]` (default overview — shows ground + sky) |
| null (deselect) | `[25, 20, 25]` | `[0, 0, 0]` (return to default) |

**Animation implementation:** In `useFrame`, lerp `camera.position` and OrbitControls `target` toward the destination using `THREE.Vector3.lerp(target, 0.04)`. This produces ~800ms transition at 60fps (0.04^48 ≈ 0.13, so 96% of distance covered in 48 frames). Add a slight orbit offset: during fly-in, offset the camera by `sin(elapsed * 2) * 0.5` on the X axis for the 10° visual orbit.

When `selectedLayer` becomes null, lerp back to default position.

### 6.3 GroundPlane

**File:** `src/three/GroundPlane.tsx`

**Subscribes to:** `selectLocationLayer` (for `waterStressIndex`).

**Geometry:** `<planeGeometry args={[60, 40]}/>` rotated -90° on X axis, positioned at `y = -0.01` (just below origin).

**Material:** `<meshStandardMaterial>` with color interpolated from water stress:
- `waterStressIndex = 0` → `#22C55E` (green)
- `waterStressIndex = 0.5` → `#92400E` halfway blend
- `waterStressIndex = 1` → `#92400E` (brown)

**Color interpolation:** In `useFrame`, use `THREE.Color.lerp()` to smoothly transition the ground color. Store a `THREE.Color` ref for the current rendered color and lerp it toward the target color at `0.05` per frame.

**Community burden ring:** A `<ringGeometry>` (inner radius 18, outer radius 19) at `y = 0.01`, same color-mapping logic but with 0.3 opacity. Represents the community zone around the facility.

### 6.4 SkyDome

**File:** `src/three/SkyDome.tsx`

**Subscribes to:** `selectLocationLayer` (for `ambientTemperature`, `gridCarbonIntensity`).

**Geometry:** `<sphereGeometry args={[80, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]}/>` — a hemisphere. Positioned at origin, `side: THREE.BackSide` so it renders on the inside.

**Color logic:** Two influences blended together:
1. **Temperature color:** Lerp between `#3B82F6` (blue, at 20°C) and `#F97316` (intense orange, at 42°C). `t = clamp((ambientTemp - 20) / 22, 0, 1)`.
2. **Carbon color:** Lerp between `#3B82F6` (blue, at 200 gCO2/kWh) and `#78716C` (gray-brown, at 400+ gCO2/kWh). `t = clamp((gridCarbon - 200) / 200, 0, 1)`.
3. **Blend:** Average the two colors. Use `THREE.Color.lerp()` in `useFrame` at rate `0.03` per frame for smooth sky transitions.

**Material:** `<meshBasicMaterial side={THREE.BackSide}>` — no lighting on the sky dome, it provides ambient backdrop.

### 6.5 ServerRack

**File:** `src/three/ServerRack.tsx`

**Props:**
```typescript
interface ServerRackProps {
  position: [number, number, number];
  rackIndex: number;  // 0–9
}
```

**Subscribes to:** `selectGpuLayer` (for temperature, utilization, shutdown state, health).

**Geometry:** Box geometry `<boxGeometry args={[3, 4, 1.5]}/>` centered at the given position, with Y offset so the base sits at y=0: `position={[x, 2, z]}`.

**Material:** `<meshStandardMaterial>` with:
- **Base color:** `#334155` (slate-700, the rack housing)
- **Emissive color:** Driven by the GPU layer's `health` field:
  - Healthy: `#22C55E` with emissive intensity `0.15`
  - Warning: `#F59E0B` with emissive intensity `0.25`
  - Critical: `#EF4444` with emissive intensity `0.35`
- **Temperature-driven glow:** Additionally, normalize `averageGpuTemperature` to 0–1 over range 55°C–90°C. Add this normalized value × 0.3 to the emissive intensity. This creates a visible "heat glow" independent of health status.

**LED indicators:** 24 small box geometries (0.05 × 0.05 × 0.05) arranged in a 4×6 grid on the front face of the rack. Each LED:
- Color: `#22C55E` when rack is active, `#1E293B` (off) when rack is shut down
- When rack `gracefulRackShutdown[rackIndex]` is true: LEDs turn off sequentially (use `useFrame` with a stagger timer, 100ms per LED). Rack body opacity fades to 0.3 over 1 second.

**Pulse animation:** In `useFrame`, oscillate the emissive intensity using a sine wave:
- Healthy: `intensity = base + sin(time * PI) * 0.1` (period 2s)
- Warning: `intensity = base + sin(time * PI * 1.33) * 0.15` (period 1.5s)
- Critical: `intensity = base + sin(time * PI * 2.5) * 0.2` (period 0.8s)

**Click handler:** `onClick` → `store.selectLayer('gpu')`. Use `<mesh onClick={...}>` — R3F handles raycasting.

**Shutdown state:** When `gracefulRackShutdown[rackIndex] === true`:
1. LEDs turn off one by one (100ms stagger via a counter in useFrame)
2. Rack material `opacity` lerps to 0.3, set `transparent: true`
3. Emissive intensity drops to 0

### 6.6 CoolingTower

**File:** `src/three/CoolingTower.tsx`

**Props:**
```typescript
interface CoolingTowerProps {
  position: [number, number, number];
}
```

**Subscribes to:** `selectCoolingLayer` (for health, fanSpeedOverride, waterRecirculationMode).

**Geometry:**
- **Tower body:** `<cylinderGeometry args={[1.5, 2, 5, 16]}/>` — tapered cylinder, wider at the base. Position: `[x, 2.5, z]`.
- **Fan blades:** A `<group>` at the top of the cylinder (`y = 5`). Contains 4 flat box geometries (blades): `<boxGeometry args={[2.5, 0.05, 0.3]}/>` rotated at 0°, 90°, 45°, 135°.

**Material (tower body):** `<meshStandardMaterial>` with color = `#64748B` (slate-500) and emissive driven by cooling layer `health`:
- Same health color mapping as ServerRack

**Fan animation:** In `useFrame`, rotate the fan group on Y axis:
- `rotationSpeed = fanSpeedOverride * 2 * Math.PI` radians per second
- `group.rotation.y += rotationSpeed * delta`
- Where `delta` is the frame delta time from `useFrame((_, delta) => ...)`.
- `fanSpeedOverride` is the lever value (0.4–1.0). So at min speed (40%), fan rotates at ~2.5 rad/s; at max (100%), ~6.28 rad/s.

**Click handler:** `onClick` → `store.selectLayer('cooling')`

### 6.7 PDUCabinet

**File:** `src/three/PDUCabinet.tsx`

**Props:**
```typescript
interface PDUCabinetProps {
  position: [number, number, number];
}
```

**Subscribes to:** `selectPowerLayer` (for health, powerCap).

**Geometry:** `<boxGeometry args={[2, 3, 1]}/>` positioned at `[x, 1.5, z]`.

**Material:** `<meshStandardMaterial>` color `#475569` (slate-600), emissive driven by power layer `health`.

**Panel lines:** Two thin box geometries on the front face representing cabinet doors/panels: `<boxGeometry args={[0.8, 2.5, 0.02]}/>`.

**Click handler:** `onClick` → `store.selectLayer('power')`

### 6.8 CRAHUnit

**File:** `src/three/CRAHUnit.tsx`

**Props:**
```typescript
interface CRAHUnitProps {
  position: [number, number, number];
  rackIndex: number;
}
```

**Subscribes to:** `selectCoolingLayer` (for health).

**Geometry:** `<boxGeometry args={[3, 0.4, 1.5]}/>` — a flat box positioned above each rack.

**Material:** `<meshStandardMaterial>` color `#64748B` (slate-500), emissive driven by cooling layer `health`. Slightly less emissive than the towers (×0.7).

### 6.9 DataFlow

**File:** `src/three/DataFlow.tsx`

**Subscribes to:** `selectWorkloadLayer` (for requestVolume, averageInferenceLatency, requestDropRate, queueDepth).

**Components:**
1. **Ingress sphere:** `<sphereGeometry args={[0.8, 16, 16]}/>` at position `[-16, 2, 0]`. Color: `#3B82F6` (blue). Emissive intensity proportional to requestVolume (normalized over 2000–16000).
2. **Egress sphere:** `<sphereGeometry args={[0.8, 16, 16]}/>` at position `[16, 2, 0]`. Color: `#22C55E` (green). Emissive intensity proportional to throughput.
3. **Particle stream:** Uses `THREE.InstancedMesh` with `<sphereGeometry args={[0.06, 4, 4]}/>` and max 2000 instances.

**Particle system logic (in `useFrame`):**
- **Particle count:** `min(2000, requestVolume / 5)`. E.g., 8000 req/hr = 1600 particles active.
- **Particle speed:** `speed = max(0.1, 1 - (averageInferenceLatency / 400))`. Higher latency = slower.
- Each particle has a position along the X axis from -16 (ingress) to +16 (egress). On each frame, advance X by `speed * delta * 10`. When X > 16, reset to -16 (recycle).
- **Y/Z variation:** Each particle has a slight random Y offset (0–1) and Z offset (±2) assigned on spawn. Particles traveling through the rack zone (X ∈ [-10, 10]) converge toward z=0 to simulate flowing through racks.
- **Request drops:** For each particle, on each frame, random chance `requestDropRate` to "drop" it: change color to red (`#EF4444`), start fading opacity to 0 over 0.5 seconds, then recycle.
- **Queue visualization:** Near the ingress sphere (X ∈ [-16, -14]), particle density increases proportionally to `queueDepth`. Do this by slowing particle speed in this zone: `speed *= max(0.1, 1 - queueDepth / 500)`.

**Batch grouping:** When `batchSize > 1`, particles cluster into groups. Assign each particle a batch ID = `floor(particleIndex / batchSize)`. Particles in the same batch have the same X position (leader particle), offset only in Y/Z.

**Instance matrix updates:** On each frame, loop through active particle instances and update their transformation matrices via `instancedMesh.setMatrixAt(i, matrix)`. Call `instancedMesh.instanceMatrix.needsUpdate = true`.

**Color updates:** Use `instancedMesh.setColorAt(i, color)` for per-instance colors. Normal = `#60A5FA` (blue-400), dropped = `#EF4444`.

**Click handler:** `onClick` on ingress or egress sphere → `store.selectLayer('workload')`.

### 6.10 HeatHaze Effect

**File:** `src/three/effects/HeatHaze.tsx`

**Subscribes to:** `selectGpuLayer` (for averageGpuTemperature, gracefulRackShutdown).

**Implementation:** `THREE.InstancedMesh` with `<planeGeometry args={[0.1, 0.1]}/>` (flat squares), max 2000 instances (200 per rack). Material: `<meshBasicMaterial color="#F97316" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />`.

**Per-rack particle count:** `floor(normalize(avgGpuTemp, 55, 90) * 200)`. Racks that are shut down get 0 particles.

**Behavior:** Particles rise slowly from above each rack (Y increases by `0.5 * delta`). Random X/Z jitter within the rack's footprint. When Y exceeds rack top + 3, reset to rack top Y. Opacity oscillates with `sin(time * 3 + particleId) * 0.15 + 0.2` for shimmer effect.

### 6.11 WaterParticles Effect

**File:** `src/three/effects/WaterParticles.tsx`

**Subscribes to:** `selectCoolingLayer` (for waterUsageRate, waterRecirculationMode, fanSpeedOverride).

**Implementation:** `THREE.InstancedMesh` with `<sphereGeometry args={[0.04, 4, 4]}/>`, max 1000 instances (500 per tower).

**Particle count per tower:** Proportional to `waterUsageRate`, normalized over 400–1400 L/hr → 100–500 particles.

**Behavior:**
- **Normal mode (recirculation off):** Particles flow in a linear path from cooling tower position toward the nearest rack row. Color: `#3B82F6` (blue). Speed proportional to `fanSpeedOverride`.
- **Recirculation mode (on):** Particles change color to `#06B6D4` (cyan) and follow an elliptical loop path: from tower → racks → back to tower. Achieve this by parameterizing each particle with an angle on an ellipse and advancing the angle each frame.
- **Sparsity:** When `waterRecirculationMode` is on, reduce particle count by 30% (the recirculation reduces fresh water intake).

### 6.12 ElectricArc Effect

**File:** `src/three/effects/ElectricArc.tsx`

**Subscribes to:** `selectPowerLayer` (for powerCap, totalFacilityPower).

**Implementation:** Line segments (`THREE.Line` with `THREE.BufferGeometry`) connecting each PDU to the nearest 5 racks. Two sets of 5 lines (one per PDU).

**Behavior:**
- Line color: `#60A5FA` (blue-400) normally, shifting to `#FBBF24` (amber) when power is high.
- Normalized intensity: `(totalFacilityPower / powerCap)` — how close to the cap the facility is running.
- **Arc effect:** On each frame, each line's control points (3 points per line) have their Y coordinates jittered by `random(-0.3, 0.3) * intensity`. This creates a flickering arc effect.
- **Brightness:** Line material opacity = `0.3 + intensity * 0.5`. When `powerCap` is reduced, arcs dim and jitter less.
- Lines are only visible when `totalFacilityPower > 300` (don't show arcs at very low power).

### 6.13 Scene Positioning Summary

| Component | Position (X, Y, Z) | Notes |
|-----------|-------------------|-------|
| Rack 0 | (-8, 2, -3) | Row 1 |
| Rack 1 | (-4, 2, -3) | |
| Rack 2 | (0, 2, -3) | |
| Rack 3 | (4, 2, -3) | |
| Rack 4 | (8, 2, -3) | |
| Rack 5 | (-8, 2, 3) | Row 2 |
| Rack 6 | (-4, 2, 3) | |
| Rack 7 | (0, 2, 3) | |
| Rack 8 | (4, 2, 3) | |
| Rack 9 | (8, 2, 3) | |
| CRAH 0–4 | Same X/Z as racks, Y=3.5, Z=-3 | Above row 1 |
| CRAH 5–9 | Same X/Z as racks, Y=3.5, Z=3 | Above row 2 |
| Cooling Tower A | (-14, 2.5, -8) | Left perimeter |
| Cooling Tower B | (14, 2.5, -8) | Right perimeter |
| PDU A | (-14, 1.5, 8) | Left entrance |
| PDU B | (14, 1.5, 8) | Right entrance |
| Ingress Sphere | (-16, 2, 0) | Left side |
| Egress Sphere | (16, 2, 0) | Right side |
| Ground Plane | (0, -0.01, 0) | Flat, rotated |
| Sky Dome | (0, 0, 0) | Large hemisphere |

---

## 7. Phase 6: Recommendation & Alert Panel

### 7.1 RightPanel Container

**File:** `src/components/RightPanel.tsx`

**Subscribes to:** `selectActivePanel`.

**Renders:** Three tabs at the top, content area below.

```
┌──────────────────────────────┐
│  Alerts | Scenarios | History │  ← tab bar
├──────────────────────────────┤
│                               │
│  (tab content)                │  ← scrollable
│                               │
└──────────────────────────────┘
```

**Tab bar:** Three buttons, horizontal. Active tab: `border-b-2 border-sim-blue text-text-primary`. Inactive: `text-text-secondary`. Background: `bg-panel-bg`. Height: 36px.

**Tab switching:** On click, call `store.setActivePanel(panel)`. Content area renders the corresponding panel component:
- `'alerts'` → `<AlertPanel />`
- `'scenarios'` → `<ScenarioPanel />`
- `'history'` → `<HistoryPanel />`

**Alert count badge:** On the Alerts tab label, show a red badge with count if `activeAlerts.length > 0`: `<span className="bg-health-red text-white text-[10px] rounded-full px-1.5 ml-1">{count}</span>`.

### 7.2 AlertPanel

**File:** `src/components/AlertPanel.tsx`

**Subscribes to:** `selectActiveAlerts`, `selectActiveRecommendations`.

**Renders:** A reverse-chronological list mixing alerts and recommendations (sorted by timestamp descending). Each item is an `AlertCard` or `RecommendationCard`.

**AlertCard sub-component:**

```
┌──────────────────────────────┐
│ │ ⚠ GPU Fleet Running Hot    │  ← colored left border (4px), severity icon, title
│ │ 12:34:05  Cooling Layer    │  ← timestamp, affected layer
│ │                             │
│ │ Average GPU temp has...     │  ← expandable body (collapsed by default)
│ │                             │
│ │ [View Layer]                │  ← button
└──────────────────────────────┘
```

**Props:**
```typescript
interface AlertCardProps {
  alert: Alert;
}
```

- Left border color: `border-l-4`, warning = `border-health-amber`, critical = `border-health-red`.
- Severity icon: warning = `⚠`, critical = `🔴`.
- Title: `text-text-primary text-sm font-medium`.
- Timestamp: `text-text-secondary text-xs`. Format: `HH:MM:SS`.
- Body: Hidden by default, toggled by clicking the card. Framer Motion `<motion.div>` animate height.
- "View Layer" button: `text-sim-blue text-xs hover:underline`. On click: `store.selectLayer(alert.layerId)`.

**RecommendationCard sub-component:**

Same as AlertCard plus:
- Severity icon for `info`: `ℹ️`.
- Additional buttons: "Dismiss" and "Apply".
- "Dismiss": POST to `/api/recommendations/:id/dismiss`. On success, recommendation disappears on next state update.
- "Apply": `store.selectLayer(rec.layerAffected)` and auto-set the lever to the recommended value: `store.setPendingLeverChange(rec.suggestedAction.lever, rec.suggestedAction.suggestedValue)`.
- Below body text: `confidenceNote` in `text-text-secondary text-[10px] italic`.

**Entry animation:** New cards use Framer Motion `<motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>`.

### 7.3 ScenarioPanel

**File:** `src/components/ScenarioPanel.tsx`

**Props/state:** Fetches scenario list on mount via `GET /api/scenarios`. Stores in local component state.

**Subscribes to:** `selectScenarioProgress` (from store), `selectSimMode`.

**Renders:** List of scenario cards:

```
┌──────────────────────────────┐
│ 🌡️ Heatwave Stress Event     │  ← name
│ An extreme heatwave drives...│  ← description (truncated, 2 lines)
│ [Location] [Cooling] [GPU]   │  ← affected layer badges
│                               │
│ [ Simulate ]                  │  ← button
└──────────────────────────────┘
```

- Layer badges: Small rounded pills with layer name, colored by the layer's current health.
- "Simulate" button: `bg-sim-blue text-white text-sm px-3 py-1 rounded`. On click:
  1. POST to `/api/scenarios/:id/activate` with `{ mode: 'simulation' }`.
  2. On success, the backend enters simulation mode. The next `state:update` will have `mode: 'simulation'`.
  3. Button changes to disabled state while a scenario is active.

**Active scenario progress:** When `scenarioProgress` is non-null:
```
┌──────────────────────────────┐
│ ▶ Heatwave Stress Event      │
│ Phase: Temperature Rising     │
│ ████████████░░░░░  12/20     │  ← progress bar
│ [ End Simulation ]            │
└──────────────────────────────┘
```

Progress bar: `bg-panel-border` track, `bg-sim-blue` fill. Width = `(ticksElapsed / totalTicks) * 100%`.

"End Simulation" button: On click, POST to `/api/scenarios/:id/activate` with a deactivate endpoint (or a dedicated `POST /api/scenarios/deactivate` if available — check architecture). This ends the scenario early.

### 7.4 HistoryPanel

**File:** `src/components/HistoryPanel.tsx`

**State:** Fetches history on mount via `GET /api/logs?limit=50`. Re-fetches when the `'history'` tab is selected and on `action:confirmed` events.

**Renders:** Reverse-chronological list of `ChangeLogEntry` items:

```
┌──────────────────────────────┐
│ ● 12:34:05                    │  ← projection accuracy color dot, timestamp
│ Cooling setpoint: 22°C → 25°C│  ← operatorAction
│                               │
│ ▼ Expand                      │  ← click to show full detail
└──────────────────────────────┘
```

- Projection accuracy dot: green (`matched`), amber (`worse`), red (if `outcomeAfterFiveMinutes` is null, show gray — pending).
- Expanded view: tradeoff acknowledgment text, metric snapshots at commit time and 5 minutes after, end-user impact actual.

**"Download Log" button:** At the top of the panel. On click:
1. Fetch `GET /api/logs?limit=9999` to get all entries.
2. Create a `Blob` from `JSON.stringify(entries, null, 2)`.
3. Create a temporary `<a>` element with `href = URL.createObjectURL(blob)`, `download = "change-log.json"`, trigger click.

---

## 8. Phase 7: Action/Lever Panel

### 8.1 ActionPanel

**File:** `src/components/ActionPanel.tsx`

**Subscribes to:** `selectSelectedLayer`, `selectSelectedLayerState`, `pendingLeverChanges`.

**Renders:** Nothing when `selectedLayer` is null. When a layer is selected:

```
┌──────────────────────────────┐
│ ⚡ Power & Energy  — Levers   │  ← layer name + icon
├──────────────────────────────┤
│ Power Cap                     │
│ ├─────────●──────────┤ 900kW │  ← slider
│ Projected: PUE +0.08, Carbon +12 kgCO2/hr │
│                               │
│ Renewable Priority Mode       │
│ [  OFF  ][  ON  ]             │  ← toggle
│                               │
│       [ Commit Action ]       │  ← primary button
└──────────────────────────────┘
```

**Lever data per layer:**

| Layer | Levers |
|-------|--------|
| Power | Power Cap (slider, 600–1200 kW, step 50), Renewable Priority Mode (toggle) |
| Cooling | Cooling Setpoint (slider, 16–30°C, step 1), Fan Speed Override (slider, 40–100%, step 5), Water Recirculation Mode (toggle) |
| GPU | GPU Power Limit (slider, 200–700W, step 50), Graceful Rack Shutdown ×10 (toggle array), Thermal Throttle Threshold (slider, 75–90°C, step 1) |
| Workload | Request Rate Limit (slider, 2000–16000 req/hr, step 500), Batch Size (slider, 1–64, step 1), Priority Queue Weight (slider, 50–90, step 10) |
| Location | No levers. Panel shows: "This layer has no operator-controllable levers. Adjust other layers to respond to environmental changes." |

### 8.2 Lever Components

**SliderLever:**
```typescript
interface SliderLeverProps {
  name: string;
  leverId: string;        // e.g., "cooling.coolingSetpoint"
  currentValue: number;   // server-confirmed value
  pendingValue: number | undefined;  // from pendingLeverChanges
  min: number;
  max: number;
  step: number;
  unit: string;
}
```

Renders a styled `<input type="range">` with Tailwind:
- Track: `bg-panel-border h-1 rounded-full`
- Thumb: `bg-sim-blue w-4 h-4 rounded-full`
- Value label to the right: `text-text-primary text-sm tabular-nums`
- `onChange`: call `store.setPendingLeverChange(leverId, newValue)`

**ToggleLever:**
```typescript
interface ToggleLeverProps {
  name: string;
  leverId: string;
  currentValue: boolean;
  pendingValue: boolean | undefined;
}
```

Renders a toggle switch:
- Track: `w-10 h-5 rounded-full`, active = `bg-sim-blue`, inactive = `bg-panel-border`
- Thumb: `w-4 h-4 bg-white rounded-full`, slides left/right
- `onChange`: call `store.setPendingLeverChange(leverId, !currentValue)`

**Graceful Rack Shutdown (special case):** For the GPU layer, render 10 small toggle switches in a 2×5 grid, each labeled "Rack 1" through "Rack 10". Each toggles `store.setPendingLeverChange('gpu.gracefulRackShutdown.0', true)` etc.

### 8.3 Live Preview (Projected Impact)

Below each lever slider, show a projected impact line when `pendingValue !== currentValue`:

```
Projected: GPU Temp +3.2°C | Water -18% | Latency +8ms
```

**Calculation:** Import formula functions from `@izakaya/shared/formulas`. Create a copy of relevant metric values, substitute the pending lever value, and recompute affected metrics.

For example, if the user changes `cooling.coolingSetpoint` from 22 to 25:
1. Call `computeGpuTemperature(utilization, 25, ambientTemp, gpuPowerLimit)` → new GPU temp
2. Call `computeWaterUsageRate(ambientTemp, 25, recircMode)` → new water rate
3. Call `computeInferenceLatency(newGpuTemp, queueDepth, batchSize)` → new latency
4. Display deltas: `newValue - currentValue` for each metric.

**Lever → affected metrics mapping:**

| Lever | Affected Metrics (via formulas) |
|-------|-------------------------------|
| powerCap | totalFacilityPower, PUE, carbonOutput |
| renewablePriorityMode | (qualitative: "Defers ~20% of workload to high-renewable windows") |
| coolingSetpoint | waterUsageRate, WUE, gpuTemperature, inferenceLatency |
| fanSpeedOverride | coolingPower, totalFacilityPower, PUE |
| waterRecirculationMode | waterUsageRate (×0.7), coolingPower (×1.15), WUE |
| gpuPowerLimit | itEquipmentPower, gpuTemperature, gpuIdlePowerWaste, PUE |
| gracefulRackShutdown | activeGpuCount, itEquipmentPower, throughput |
| thermalThrottleThreshold | (qualitative: affects when GPUs auto-throttle) |
| requestRateLimit | requestDropRate, queueDepth, throughput |
| batchSize | inferenceLatency, batchEfficiency |
| priorityQueueWeight | (qualitative: premium vs free-tier latency split) |

Display as `text-text-secondary text-xs`. Green text for improvements, red for degradations.

### 8.4 Commit Action Button

`<button>` with:
- Default (no changes): `bg-panel-border text-text-secondary cursor-not-allowed opacity-50`
- Changes pending: `bg-sim-blue text-white hover:bg-blue-600 cursor-pointer`

**On click:** Check if any `pendingLeverChanges` exist. If yes:
1. Compute tradeoff text, community impact text, and end-user impact text from the pending changes and current state.
2. Call `store.openTradeoffModal(payload)` with the computed modal content.

**Tradeoff text generation:** Template-based. Example for cooling setpoint change:
- Tradeoff: `"This action will ${direction} water consumption by approximately ${waterDeltaPct}% but may ${latDirection} inference latency by up to ${latDelta}ms, affecting an estimated ${affectedReqs} requests per hour."`
- Community: `"The ${communityName} community, which hosts this data center's water supply, currently has a water stress index of ${wsi} (${wsiLevel}). This action ${reduces/increases} facility water draw by approximately ${waterDeltaDaily} liters/day."`
- End user: `"Premium users: ${premLatDelta}ms latency. Free-tier users: ${freeLatDelta}ms latency. ${dropText}"`

---

## 9. Phase 8: Ethical Tradeoff Modal

### 9.1 TradeoffModal

**File:** `src/components/TradeoffModal.tsx`

**Subscribes to:** `modalPayload` from store.

**Renders:** Blocking modal with:

```
┌──────────────────────────────────────────────────┐
│  (dark overlay rgba(0,0,0,0.7) — full screen)    │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │  ⚠ Action Impact Acknowledgment         [X] │ │
│  ├──────────────────────────────────────────────┤ │
│  │                                              │ │
│  │  ACTION:                                     │ │
│  │  {modalPayload.leverName}: {prev} → {new}    │ │
│  │                                              │ │
│  │  TRADEOFF:                                   │ │
│  │  {modalPayload.tradeoffText}                 │ │
│  │                                              │ │
│  │  COMMUNITY IMPACT:                           │ │
│  │  {modalPayload.communityImpactText}          │ │
│  │                                              │ │
│  │  END USER IMPACT:                            │ │
│  │  {modalPayload.endUserImpactText}            │ │
│  │                                              │ │
│  │  ┌──────────────────────────────────────────┐│ │
│  │  │ ☐ I understand this tradeoff and accept  ││ │
│  │  │   responsibility for the impact on end   ││ │
│  │  │   users and the local community.         ││ │
│  │  └──────────────────────────────────────────┘│ │
│  │                                              │ │
│  │  [ Cancel ]           [ Confirm & Commit ]   │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└──────────────────────────────────────────────────┘
```

**State:** Local `useState<boolean>(false)` for checkbox. Resets on mount.

**Overlay:** `fixed inset-0 z-50 bg-black/70 flex items-center justify-center`. Clicking the overlay does nothing (modal is blocking). Add `onClick={e => e.stopPropagation()}` on the modal card.

**Modal card:** `bg-panel-bg border border-panel-border rounded-lg shadow-2xl max-w-lg w-full mx-4 p-6`. Entry animation via Framer Motion: `initial={{ opacity: 0, scale: 0.95 }}`, `animate={{ opacity: 1, scale: 1 }}`, `transition={{ duration: 0.2, ease: 'easeOut' }}`.

**Section headers:** `text-text-secondary text-xs uppercase tracking-wider font-medium mb-1` — "ACTION", "TRADEOFF", "COMMUNITY IMPACT", "END USER IMPACT".

**Section text:** `text-text-primary text-sm leading-relaxed`.

**Checkbox:** `<label className="flex items-start gap-3 p-3 bg-dash-bg rounded border border-panel-border cursor-pointer">`. Input: `<input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} className="mt-0.5 w-4 h-4 accent-sim-blue" />`. Label text: `text-text-primary text-sm`.

**Cancel button:** `bg-panel-border text-text-primary px-4 py-2 rounded hover:bg-slate-600`. On click:
1. Call `store.clearPendingLeverChanges()` (reverts all lever previews).
2. Call `store.closeTradeoffModal()`.

**[X] close button:** Same behavior as Cancel.

**Confirm & Commit button:**
- Disabled state (checkbox unchecked): `bg-panel-border text-text-secondary opacity-50 cursor-not-allowed`
- Enabled state (checkbox checked): `bg-sim-blue text-white hover:bg-blue-600 cursor-pointer`

**On Confirm & Commit click:**
1. Construct the request body:
```typescript
const body = {
  layerId: modalPayload.layerId,
  leverId: modalPayload.leverId,
  previousValue: modalPayload.previousValue,
  newValue: modalPayload.newValue,
  tradeoffAcknowledgment: {
    tradeoffText: modalPayload.tradeoffText,
    communityImpactText: modalPayload.communityImpactText,
    endUserImpactText: modalPayload.endUserImpactText,
    acknowledged: true,
  },
};
```
2. `const res = await fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })`.
3. If `res.ok`:
   - `store.closeTradeoffModal()`.
   - Toast is handled by the `action:confirmed` WebSocket event handler.
4. If `res.status === 400`:
   - Display error from response body in a toast.
   - Keep modal open so user can retry.
5. If `res.status === 409`:
   - `store.addToast({ type: 'error', message: 'Cannot commit during active simulation.' })`.
   - `store.clearPendingLeverChanges()`.
   - `store.closeTradeoffModal()`.
6. If network error or 5xx:
   - `store.addToast({ type: 'error', message: 'Server error. Please try again.' })`.
   - Keep modal open.

### 9.2 Toast Component

**File:** `src/components/Toast.tsx`

**Subscribes to:** `toasts` from store.

**Renders:** Portal to `document.body`. Fixed position, top-right corner (`top-4 right-4`), z-index 60.

Each toast:
```
┌──────────────────────────────┐
│ ✓ Action committed.          │  ← icon + message
│   Monitoring impact.         │
└──────────────────────────────┘
```

- Background: success = `bg-health-green/90`, error = `bg-health-red/90`, warning = `bg-health-amber/90`, info = `bg-severity-info/90`.
- Text: `text-white text-sm`.
- Entry: Framer Motion `initial={{ x: 100, opacity: 0 }}`, `animate={{ x: 0, opacity: 1 }}`, `transition={{ duration: 0.3 }}`.
- Exit: `exit={{ x: 100, opacity: 0 }}`, `transition={{ duration: 0.2 }}`.
- Auto-dismiss: `setTimeout(() => store.removeToast(id), 4000)` on mount.
- Stack: Multiple toasts stack vertically with 8px gap.

---

## 10. Phase 9: Simulation Mode

### 10.1 Entering Simulation Mode

Triggered by clicking "Simulate" on a scenario in `ScenarioPanel`. After the POST succeeds:
1. Backend forks state and sets `state.mode = 'simulation'`.
2. Next `state:update` arrives with `mode: 'simulation'`.
3. `App.tsx` detects `simMode === 'simulation'` and shows the SimulationBanner.
4. `DataCenterScene.tsx` applies the CSS filter for blue tint.

### 10.2 SimulationBanner

Inline in `App.tsx`. Fixed position bar, `bg-sim-blue text-white text-sm font-medium py-2 px-4 text-center z-40`. Text: `"SIMULATION MODE — Changes are not committed"`.

### 10.3 3D Blue Tint

Applied as a CSS filter on the canvas container div (not a GPU shader pass for performance):
```css
filter: saturate(0.7) brightness(0.9) sepia(0.1) hue-rotate(200deg);
transition: filter 500ms ease-in-out;
```

### 10.4 Metrics During Simulation

In `MetricsTopBar`, when `mode === 'simulation'`:
- Sparkline data after the simulation start tick renders as a dashed line. Implementation: in the SVG sparkline, split the `history` array into pre-simulation and post-simulation segments. Render pre as solid, post as `stroke-dasharray="3,2"`.
- Values display normally (they reflect the forked simulated state).

### 10.5 Exiting Simulation

Two buttons appear during simulation mode:

1. **"End Simulation"** (in `ScenarioPanel` next to the progress bar): Ends the scenario early. Triggers a results summary overlay, then returns to live state.
2. **"Exit Simulation"** (in `SimulationBanner`): Immediately exits without results summary. Returns to live state.

Both trigger: POST to deactivate the scenario → backend discards fork → next `state:update` has `mode: 'live'` → UI reverts.

### 10.6 Results Summary Overlay

When a scenario completes naturally or "End Simulation" is clicked, display an overlay on the 3D viewport:

```
┌──────────────────────────────────────┐
│  SIMULATION RESULTS                   │
│  Heatwave Stress Event               │
│                                       │
│  Peak GPU Temp:       86°C           │
│  Total Carbon:        14.2 kgCO2     │
│  Total Water:         18,500 L       │
│  Max Latency:         180ms          │
│  Requests Affected:   ~2,000/hr      │
│  Most Effective Lever: Fan Speed     │
│                                       │
│  [ Close ]                            │
└──────────────────────────────────────┘
```

This is a DOM overlay positioned absolutely over the 3D canvas. Background: `bg-panel-bg/95 border border-panel-border rounded-lg`. Data comes from tracking the min/max/total of key metrics during the simulation (accumulate in local state of the ScenarioPanel or a separate hook).

On "Close", call exit simulation flow.

---

## 11. Component Communication Map

| Component | Data Source | Store Slices | Props from Parent | Local Computation |
|-----------|-----------|-------------|-------------------|-------------------|
| **App.tsx** | Zustand | `connectionStatus`, `simMode`, `modalOpen` | None | None |
| **MetricsTopBar** | Zustand | `derivedMetrics`, `gpuUtilization`, `throughput`, `metricHistory`, `simMode` | None | Trend arrow direction |
| **LayerSidebar** | Zustand | `layers`, `selectedLayer`, `metricHistory` | None | Layer health summaries (via `useLayerHealth`) |
| **CommunityBurden** | Zustand | `locationLayer`, `coolingLayer`, `derivedMetrics` | None | Water stress level, carbon car-equivalent |
| **RightPanel** | Zustand | `activePanel` | None | None (delegates to child panels) |
| **AlertPanel** | Zustand | `activeAlerts`, `activeRecommendations` | None | Sorted merged list |
| **ScenarioPanel** | REST + Zustand | `scenarioProgress`, `simMode` | None | Fetches scenarios from `/api/scenarios` |
| **HistoryPanel** | REST | None (fetches from `/api/logs`) | None | None |
| **ActionPanel** | Zustand | `selectedLayer`, `selectedLayerState`, `pendingLeverChanges` | None | Projected impact via `@izakaya/shared/formulas` |
| **TradeoffModal** | Zustand | `modalPayload` | None | Checkbox state (local) |
| **Toast** | Zustand | `toasts` | None | Auto-dismiss timer |
| **DataCenterScene** | Zustand | `simMode` | None | CSS filter |
| **CameraController** | Zustand | `selectedLayer` | None | Lerp camera position |
| **ServerRack** | Zustand | `gpuLayer` (temp, utilization, health, shutdown) | `position`, `rackIndex` | Emissive intensity, LED state, pulse timing |
| **CoolingTower** | Zustand | `coolingLayer` (health, fanSpeed, recircMode) | `position` | Fan rotation speed |
| **PDUCabinet** | Zustand | `powerLayer` (health, powerCap) | `position` | Emissive intensity |
| **CRAHUnit** | Zustand | `coolingLayer` (health) | `position`, `rackIndex` | Emissive color |
| **DataFlow** | Zustand | `workloadLayer` (requestVolume, latency, dropRate, queueDepth, batchSize) | None | Particle positions, speeds, colors |
| **GroundPlane** | Zustand | `locationLayer` (waterStressIndex) | None | Color lerp |
| **SkyDome** | Zustand | `locationLayer` (ambientTemp, gridCarbon) | None | Color blend lerp |
| **HeatHaze** | Zustand | `gpuLayer` (temp, shutdown) | None | Particle count per rack, positions |
| **WaterParticles** | Zustand | `coolingLayer` (waterUsage, recircMode, fanSpeed) | None | Particle count, color, path |
| **ElectricArc** | Zustand | `powerLayer` (powerCap, totalPower) | None | Arc jitter intensity, color |
| **useSimulationSocket** | WebSocket | Writes to: `simulationState`, `connectionStatus`, `toasts`, `scenarioProgress`, `pendingLeverChanges` | N/A (hook) | Reconnection logic |

---

## Appendix: Key Constants from Shared Package

These are imported from `@izakaya/shared/constants` and used throughout the frontend:

- Tick rate: 2000ms
- Health thresholds: All values from PRD Section 4 tables
- Health colors: `HEALTH_COLORS = { healthy: '#22C55E', warning: '#F59E0B', critical: '#EF4444' }`
- Health glow colors: `HEALTH_GLOW_COLORS = { healthy: '#4ADE80', warning: '#FBBF24', critical: '#F87171' }`
- Lever definitions: min/max/step/unit per lever per layer
- Formula functions: all `compute*` functions from `formulas.ts`
