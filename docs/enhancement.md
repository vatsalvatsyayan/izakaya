# AI Data Center — Operator Dashboard Enhancement Plan

## Current State Summary

- **Tech stack:** TypeScript monorepo (Node.js/Express/WebSocket backend, React 18/Three.js/Zustand/Recharts/Framer Motion frontend, shared types package). Vite bundler, Tailwind CSS 3.
- **Current layout:** 3-column CSS Grid (`280px | 1fr | 320px`) with 64px top bar. Left = LayerSidebar (5 expandable layer cards + community burden). Center = 3D Canvas. Right = tabbed panel (alerts/scenarios/history) + conditional ActionPanel. No bottom bar. No header with controls.
- **Available data:**
  - **5 layers:** Power (totalFacilityPower, itEquipmentPower, coolingPower, overheadPower, pue, gridCarbonIntensity, renewableEnergyFraction), Cooling (coolingSetpoint, waterUsageRate, wue, ambientTemperature, coolantSupplyTemperature), GPU (averageGpuTemperature, gpuUtilizationRate, activeGpuCount, gpuIdlePowerWaste, hardwareFailureRate), Workload (requestVolume, averageInferenceLatency, queueDepth, requestDropRate, batchEfficiency), Location (ambientTemperature, gridCarbonIntensity, renewableEnergyFraction, waterStressIndex, localAirQualityIndex, region, communityName)
  - **Derived metrics:** pue, wue, cue, carbonOutputKgPerHr, gpuIdlePowerWasteKw, totalCarbonEmittedKg, totalWaterConsumedLiters
  - **11 levers** across 4 layers (powerCap, renewablePriorityMode, coolingSetpoint, fanSpeedOverride, waterRecirculationMode, gpuPowerLimit, gracefulRackShutdown, thermalThrottleThreshold, requestRateLimit, batchSize, priorityQueueWeight)
  - **REST API:** GET /api/state, POST /api/actions, GET /api/scenarios, POST /api/scenarios/:id/activate, GET /api/logs, GET /api/recommendations, POST /api/recommendations/:id/dismiss
  - **WebSocket events:** `state:update`, `alert:new`, `recommendation:new`, `action:confirmed`, `scenario:progress`, `ping`/`pong`
- **3D model:** React Three Fiber Canvas with procedural geometry — 10 ServerRacks (box geometry + LED strips), 2 CoolingTowers (cylinders + fan discs), PDUCabinets, CRAHUnits, DataFlow particles, HeatHaze/WaterParticles/ElectricArc effects. OrbitControls via CameraController. SkyDome + GroundPlane.
- **State management:** Two Zustand stores — `useDashboardStore` (simulationState, selectedLayer, mode, activePanel, pendingLeverChanges, connectionStatus, metricHistory, showTradeoffModal) and `useToastStore` (toast queue with auto-dismiss). History tracks 6 metrics, 60-point ring buffer.
- **Scenarios:** 5 defined (Heatwave, Demand Spike, Carbon Spike, GPU Degradation, Water Scarcity). Each has timed events, recommendation triggers, ethical dimensions.
- **Dependencies already installed:** `@react-three/drei`, `recharts`, `framer-motion`, `zustand`, `three`

---

## Design System

### Color Palette

Update Tailwind config and CSS custom properties. Use these everywhere.

| Token | Hex | Usage |
|-------|-----|-------|
| bg.primary | `#0f1117` | Page background |
| bg.secondary | `#1a1d27` | Header, bars, fixed strips |
| bg.panel | `#1e2133` | Right panel, card containers |
| bg.card | `#252840` | List items, tiles, interactive cards |
| border.subtle | `#2d3148` | Dividers, section separators |
| border.default | `#3d4168` | Interactive element borders |
| status.normal | `#22c55e` | Healthy / good / on |
| status.caution | `#eab308` | Monitor / fair |
| status.warning | `#f97316` | Action needed / poor |
| status.critical | `#ef4444` | Urgent / critical |
| accent.blue | `#3b82f6` | Active tab, selected controls |
| accent.cyan | `#06b6d4` | 3D selection highlight |

### Typography
- Primary text: `white` / `text-slate-100`
- Secondary text: `text-slate-300`
- Tertiary text: `text-slate-400` to `text-slate-500`
- Numeric values: monospace font (`font-mono`), `text-slate-200`
- Tiny labels: `text-[10px]` to `text-[11px]`

### CSS Additions

**File:** `packages/frontend/src/index.css`

Add after the existing styles:

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1a1d27; }
::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #64748b; }

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Tailwind Config Update

**File:** `packages/frontend/tailwind.config.ts`

Replace the `colors` section in `theme.extend` with:

```ts
colors: {
  bg: {
    primary: '#0f1117',
    secondary: '#1a1d27',
    panel: '#1e2133',
    card: '#252840',
  },
  border: {
    subtle: '#2d3148',
    DEFAULT: '#3d4168',
  },
  status: {
    normal: '#22c55e',
    caution: '#eab308',
    warning: '#f97316',
    critical: '#ef4444',
  },
  accent: {
    blue: '#3b82f6',
    cyan: '#06b6d4',
  },
},
```

Keep the existing `fontFamily` and `fontSize` config. Also update the CSS custom properties in `index.css` `:root` to match:

```css
:root {
  --bg-primary: #0f1117;
  --bg-secondary: #1a1d27;
  --bg-panel: #1e2133;
  --bg-card: #252840;
  --border-subtle: #2d3148;
  --border-default: #3d4168;

  --status-normal: #22c55e;
  --status-caution: #eab308;
  --status-warning: #f97316;
  --status-critical: #ef4444;
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;

  /* Keep existing font vars */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;

  /* Legacy aliases for any components not yet migrated */
  --healthy: #22c55e;
  --warning: #f97316;
  --critical: #ef4444;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --text-disabled: #475569;
  --action-primary: #3b82f6;
  --bg-elevated: #252840;
}
```

---

## Layout Architecture

### Target Layout (fixed viewport, no page scroll)

```
+-------------------------------------------------------------+
| HEADER (56px fixed)                                          |
+-------------------------------------------------------------+
| KPI BAR (64px fixed)                                         |
+----------------------------+--------------------------------+
|   3D VIEWER                |  HEALTH STRIP                   |
|   (55% width)              |  SCENARIO PROGRESS BAR          |
|                            |  TAB BAR                        |
|                            |  TAB CONTENT (scrollable)       |
|   (flex-1 height)          |  (45% width)                    |
+----------------------------+--------------------------------+
| BOTTOM BAR (48px fixed)                                      |
+-------------------------------------------------------------+
```

Root element: `h-screen flex flex-col overflow-hidden bg-[#0f1117]`
- Header: `h-14 flex-shrink-0 bg-[#1a1d27] border-b border-[#2d3148]`
- KPI Bar: `h-16 flex-shrink-0 bg-[#1a1d27] border-b border-[#2d3148]`
- Main area: `flex-1 flex overflow-hidden`
  - Left (3D): `w-[55%] relative` (3D canvas fills this)
  - Right (panels): `w-[45%] flex flex-col border-l border-[#2d3148] bg-[#1e2133]`
- Bottom: `h-12 flex-shrink-0 bg-[#1a1d27] border-t border-[#2d3148]`

This replaces the current 3-column CSS Grid layout. The left sidebar (LayerSidebar) is **removed** — its data is redistributed into the KPI bar, health strip, and sensor tab panels.

### Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| **MODIFY** | `packages/frontend/src/App.tsx` | Replace grid layout with new flex layout, wire all new components |
| **MODIFY** | `packages/frontend/src/index.css` | New color vars, scrollbar, animations |
| **MODIFY** | `packages/frontend/tailwind.config.ts` | New color palette |
| **MODIFY** | `packages/frontend/src/store/useDashboardStore.ts` | Add activeTab, selectedHealthComponent, speedMultiplier, scenarioProgress fields |
| **MODIFY** | `packages/frontend/src/hooks/useSimulationSocket.ts` | Add scenario:progress handling, speed control |
| **CREATE** | `packages/frontend/src/components/Header.tsx` | Top header bar |
| **CREATE** | `packages/frontend/src/components/AssetKPIBar.tsx` | KPI tiles strip |
| **CREATE** | `packages/frontend/src/components/HealthGauge.tsx` | SVG circular gauge |
| **CREATE** | `packages/frontend/src/components/HealthBreakdown.tsx` | Clickable health chips |
| **CREATE** | `packages/frontend/src/components/TabContainer.tsx` | Tab bar + content router |
| **CREATE** | `packages/frontend/src/components/SensorRow.tsx` | Single sensor metric row |
| **CREATE** | `packages/frontend/src/components/SensorPanel.tsx` | Grouped sensor rows by layer |
| **CREATE** | `packages/frontend/src/components/AlertToast.tsx` | Overlay toast on 3D viewer |
| **CREATE** | `packages/frontend/src/components/ScenarioProgressBar.tsx` | Inline progress strip |
| **CREATE** | `packages/frontend/src/components/SpeedControl.tsx` | Speed multiplier buttons |
| **CREATE** | `packages/frontend/src/components/BottomTimeline.tsx` | Bottom time bar |
| **CREATE** | `packages/frontend/src/components/DiagnosticsPanel.tsx` | Diagnostics tab content |
| **CREATE** | `packages/frontend/src/components/DecisionPanel.tsx` | Decision/risk tab content |
| **CREATE** | `packages/frontend/src/components/TimelinePanel.tsx` | Chronological event log |
| **MODIFY** | `packages/frontend/src/components/AlertPanel.tsx` | Restyle to new design |
| **MODIFY** | `packages/frontend/src/components/ActionPanel.tsx` | Move into a tab, restyle |
| **MODIFY** | `packages/frontend/src/three/DataCenterScene.tsx` | Update lighting, add thermal coloring, selection highlight |
| **MODIFY** | `packages/frontend/src/three/ServerRack.tsx` | Add thermal emissive, hover/click, health component highlight |
| **MODIFY** | `packages/frontend/src/three/CoolingTower.tsx` | Add thermal emissive, hover/click |
| **DELETE** | `packages/frontend/src/components/LayerSidebar.tsx` | Replaced by new components |
| **DELETE** | `packages/frontend/src/components/RightPanel.tsx` | Replaced by TabContainer |
| **DELETE** | `packages/frontend/src/components/CommunityBurden.tsx` | Data moved to DecisionPanel |

---

## Component Specifications

### 1. Header (56px)

**File:** `packages/frontend/src/components/Header.tsx`

**Contents (left to right):**
- Logo/app name: `<span className="text-white font-bold text-base tracking-tight">AI FACTORY</span>` + `<span className="text-slate-500 text-xs ml-2">DIGITAL TWIN</span>`
- Scenario selector dropdown (reuses existing scenario fetch logic from ScenarioPanel):
  ```
  bg-[#252840] border border-[#3d4168] text-slate-300 text-xs rounded px-2 py-1
  ```
  Options: "Normal Operations" + all 5 scenarios. Selecting activates via POST /api/scenarios/:id/activate.
  When a scenario is active, show its name and disable the dropdown.
- SpeedControl component (see below)
- HealthGauge component (mini, 28px radius)
- Overall health score number: `text-sm font-mono font-bold` colored by score
- Connection indicator:
  ```tsx
  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#252840]">
    <span className={`w-1.5 h-1.5 rounded-full ${
      status === 'connected' ? 'bg-green-500 animate-pulse' :
      status === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
    }`} />
    <span className="text-[11px] text-slate-400">
      {status === 'connected' ? 'LIVE' : status === 'reconnecting' ? 'RECONNECTING' : 'OFFLINE'}
    </span>
  </div>
  ```

**Layout:** `className="h-14 flex-shrink-0 bg-[#1a1d27] border-b border-[#2d3148] flex items-center px-4 gap-4"`

### 2. SpeedControl

**File:** `packages/frontend/src/components/SpeedControl.tsx`

Speed buttons: `[1x] [10x] [30x] [60x] [100x] [200x]`

```tsx
const speeds = [1, 10, 30, 60, 100, 200];

// Each button:
<button
  onClick={() => {
    store.setSpeedMultiplier(speed);
    // Send to backend: POST /api/speed or via WebSocket
  }}
  className={`px-2 py-1 text-xs rounded transition-colors ${
    active
      ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-[#1a1d27]'
      : 'bg-[#252840] text-slate-400 hover:bg-[#2d3148]'
  }`}
>
  {speed}x
</button>
```

**Note:** The backend currently uses a fixed `TICK_INTERVAL_MS = 2000`. To support speed control, add a new WebSocket message type `speed:set` that the backend listens for and adjusts the interval. Add to `packages/backend/src/websocket/connectionManager.ts`:

```ts
// In the ws.on('message') handler:
if (msg.event === 'speed:set') {
  const speed = msg.data?.speed;
  if (typeof speed === 'number' && [1,10,30,60,100,200].includes(speed)) {
    engine.setTickInterval(Math.round(2000 / speed));
  }
}
```

Add to `packages/backend/src/simulation/engine.ts`:
```ts
setTickInterval(ms: number): void {
  if (this.intervalId) clearInterval(this.intervalId);
  this.intervalId = setInterval(() => this.tick(), ms);
}
```

The frontend WebSocket hook needs to send this message when speedMultiplier changes. Add a `sendMessage` function returned from the hook, or store the ws ref in the store.

### 3. AssetKPIBar (64px)

**File:** `packages/frontend/src/components/AssetKPIBar.tsx`

**Left section — Asset Nameplate:**
```tsx
<div className="flex items-center gap-3 px-4 min-w-[200px]">
  <div>
    <div className="text-white font-mono font-bold text-base">DC-001</div>
    <div className="flex gap-1.5 mt-0.5">
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300">240× H100</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300">10 Racks</span>
    </div>
    <div className="text-[10px] text-slate-500 mt-0.5">Umatilla County, Oregon, USA</div>
  </div>
</div>
```

**Center section — 5 KPI Tiles:**

Read from `useDashboardStore((s) => s.simulationState)` and `useDashboardStore((s) => s.metricHistory)`:

| Tile | Source | Unit | Green | Yellow | Orange | Red |
|------|--------|------|-------|--------|--------|-----|
| PUE | `derivedMetrics.pue` | ratio | <1.3 | 1.3-1.5 | 1.5-1.8 | >1.8 |
| GPU Temp | `layers.gpu.averageGpuTemperature` | °C | <72 | 72-78 | 78-83 | >83 |
| GPU Util | `layers.gpu.gpuUtilizationRate * 100` | % | >70 | 50-70 | 30-50 | <30 |
| Latency | `layers.workload.averageInferenceLatency` | ms | <100 | 100-150 | 150-200 | >200 |
| Carbon | `derivedMetrics.carbonOutputKgPerHr` | kg/hr | <150 | 150-250 | 250-400 | >400 |

Each tile structure:
```tsx
<div className="flex-1 flex flex-col justify-center px-3 border-r border-[#2d3148] min-w-0">
  <div className="text-[11px] text-slate-400 uppercase tracking-wider">{label}</div>
  <div className="flex items-center gap-1">
    <span className={`text-[17px] font-mono font-bold ${colorClass}`}>
      {formattedValue}
    </span>
    <span className="text-[11px] text-slate-500">{unit}</span>
  </div>
  {/* Thin progress bar */}
  <div className="h-[1px] bg-[#2d3148] rounded-full mt-1 w-full">
    <div className={`h-full rounded-full ${barColorClass}`} style={{ width: `${percent}%` }} />
  </div>
  <div className="text-[11px] text-slate-400 mt-0.5">{statusLabel}</div>
</div>
```

Color function:
```ts
function getStatusColor(value: number, thresholds: {green: number, yellow: number, orange: number, red: number}, higherIsWorse: boolean): string {
  if (higherIsWorse) {
    if (value <= thresholds.green) return 'text-green-400';
    if (value <= thresholds.yellow) return 'text-yellow-400';
    if (value <= thresholds.orange) return 'text-orange-400';
    return 'text-red-400';
  } else {
    if (value >= thresholds.green) return 'text-green-400';
    if (value >= thresholds.yellow) return 'text-yellow-400';
    if (value >= thresholds.orange) return 'text-orange-400';
    return 'text-red-400';
  }
}
```

**Right section — Standards badge:**
```tsx
<div className="hidden xl:block text-[9px] text-slate-700 px-3">
  ISO 50001 | ASHRAE A1
</div>
```

**Layout:** `className="h-16 flex-shrink-0 bg-[#1a1d27] border-b border-[#2d3148] flex items-center"`

### 4. HealthGauge (SVG)

**File:** `packages/frontend/src/components/HealthGauge.tsx`

Props: `{ score: number; size?: number }` (default size = 56)

```tsx
export function HealthGauge({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#2d3148" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease-out, stroke 0.3s' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={color}
        fontSize={size * 0.28} fontWeight="bold" fontFamily="var(--font-mono)"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        {Math.round(score)}
      </text>
    </svg>
  );
}
```

**Health score computation** — add to store or as a selector:
```ts
function computeOverallHealth(state: SimulationState): number {
  const layers = state.layers;
  const scores: number[] = [];

  // Power: PUE-based (1.0=100, 1.3=80, 1.5=60, 2.0=0)
  scores.push(Math.max(0, Math.min(100, 100 - (layers.power.pue - 1.0) * 100)));
  // Cooling: WUE-based (0=100, 1.0=70, 1.8=30, 3.0=0)
  scores.push(Math.max(0, Math.min(100, 100 - layers.cooling.wue * 33)));
  // GPU: temp-based (60=100, 72=80, 83=40, 95=0)
  scores.push(Math.max(0, Math.min(100, 100 - Math.max(0, layers.gpu.averageGpuTemperature - 60) * 2.85)));
  // Workload: latency-based (45=100, 100=70, 200=30, 500=0)
  scores.push(Math.max(0, Math.min(100, 100 - Math.max(0, layers.workload.averageInferenceLatency - 45) * 0.22)));
  // Location: water stress (0=100, 0.3=85, 0.6=50, 1.0=0)
  scores.push(Math.max(0, Math.min(100, 100 - layers.location.waterStressIndex * 100)));

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
```

### 5. HealthBreakdown Strip

**File:** `packages/frontend/src/components/HealthBreakdown.tsx`

Horizontal row of clickable chips, one per health component (= layer):

```tsx
const HEALTH_COMPONENTS = [
  { key: 'power', label: 'Power', icon: 'bolt' },
  { key: 'cooling', label: 'Cooling', icon: 'snow' },
  { key: 'gpu', label: 'GPU', icon: 'chip' },
  { key: 'workload', label: 'Workload', icon: 'chart' },
  { key: 'location', label: 'Location', icon: 'globe' },
];

export function HealthBreakdown() {
  const layers = useDashboardStore((s) => s.simulationState.layers);
  const selected = useDashboardStore((s) => s.selectedHealthComponent);
  const setSelected = useDashboardStore((s) => s.setSelectedHealthComponent);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#2d3148] overflow-x-auto">
      {HEALTH_COMPONENTS.map(({ key, label }) => {
        const health = (layers as any)[key]?.health as string;
        const isSelected = selected === key;
        const dotColor = health === 'healthy' ? 'bg-green-500'
          : health === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

        return (
          <button
            key={key}
            onClick={() => setSelected(isSelected ? null : key)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors whitespace-nowrap
              ${isSelected
                ? 'ring-1 ring-sky-500/60 bg-sky-900/40 text-sky-300'
                : 'text-slate-400 hover:bg-[#1e2238]'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

When `selectedHealthComponent` is set, the 3D scene highlights matching parts with cyan emissive glow (see Section 9).

### 6. TabContainer

**File:** `packages/frontend/src/components/TabContainer.tsx`

```tsx
const TABS = [
  { id: 'sensors', label: 'Sensors' },
  { id: 'alerts', label: 'Alerts', badge: true },
  { id: 'controls', label: 'Controls' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'decision', label: 'Decision' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'timeline', label: 'Timeline' },
];
```

Tab bar styling:
```tsx
<div className="flex border-b border-[#2d3148] overflow-x-auto">
  {TABS.map((tab) => {
    const isActive = activeTab === tab.id;
    const alertCount = tab.badge ? store.simulationState.activeAlerts.filter(a => !a.acknowledged).length : 0;

    return (
      <button
        key={tab.id}
        onClick={() => store.setActiveTab(tab.id)}
        className={`px-3 py-2 text-xs whitespace-nowrap transition-colors
          ${isActive ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'}`}
      >
        {tab.label}
        {tab.badge && alertCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 ml-1">
            {alertCount}
          </span>
        )}
      </button>
    );
  })}
</div>
```

Tab content area: `<div className="flex-1 overflow-y-auto">` with custom scrollbar styling.

Content routing:
```tsx
{activeTab === 'sensors' && <SensorPanel />}
{activeTab === 'alerts' && <AlertPanel />}
{activeTab === 'controls' && <ActionPanel />}
{activeTab === 'diagnostics' && <DiagnosticsPanel />}
{activeTab === 'decision' && <DecisionPanel />}
{activeTab === 'scenarios' && <ScenarioPanel />}
{activeTab === 'timeline' && <TimelinePanel />}
```

Store `activeTab` in Zustand (not local state). Default: `'sensors'`.

### 7. SensorRow

**File:** `packages/frontend/src/components/SensorRow.tsx`

Props: `{ label: string; value: number; unit: string; format?: string; status: HealthStatus; history: number[]; isBoolean?: boolean; criticalLimit?: number }`

```tsx
export function SensorRow({ label, value, unit, status, history, isBoolean, criticalLimit }: SensorRowProps) {
  const statusDot = status === 'healthy' ? 'bg-green-500'
    : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

  const statusStroke = status === 'healthy' ? '#22c55e'
    : status === 'warning' ? '#eab308' : '#ef4444';

  // Trend from last 4 readings
  const trend = history.length >= 4
    ? history[history.length - 1] - history[history.length - 4]
    : 0;
  const trendIcon = trend > 0.5 ? '↑' : trend < -0.5 ? '↓' : '→';
  const trendColor = (trend > 0.5 && status !== 'healthy') ? 'text-orange-400'
    : trend < -0.5 ? 'text-slate-500' : 'text-slate-700';

  // Limit bar width
  const barPercent = criticalLimit ? Math.min(100, (value / criticalLimit) * 100) : 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1 hover:bg-[#252840] transition-colors cursor-default">
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${statusDot}`} />
      <span className="text-[11px] text-slate-300 flex-1 truncate">{label}</span>
      <span className={`text-[11px] ${trendColor}`}>{trendIcon}</span>
      {isBoolean ? (
        <span className={`text-xs font-mono ${value ? 'text-green-400' : 'text-slate-500'}`}>
          {value ? 'ON' : 'OFF'}
        </span>
      ) : (
        <span className="text-xs font-mono text-slate-200 text-right w-16 tabular-nums">
          {typeof value === 'number' && value < 1 && value > 0 ? (value * 100).toFixed(1) + '%'
            : typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}
        </span>
      )}
      <span className="text-[10px] text-slate-500 w-10 text-right">{unit}</span>
      {criticalLimit && (
        <div className="w-10 h-[3px] bg-[#252840] rounded-full overflow-hidden flex-shrink-0">
          <div className={`h-full rounded-full`}
            style={{ width: `${barPercent}%`, backgroundColor: statusStroke }} />
        </div>
      )}
      {history.length > 1 && (
        <div className="w-5 h-6 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history.slice(-60).map(v => ({ v }))}>
              <Line type="monotone" dataKey="v" stroke={statusStroke}
                dot={false} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
```

### 8. SensorPanel (Sensors Tab)

**File:** `packages/frontend/src/components/SensorPanel.tsx`

Groups sensor rows by layer with category headers. Reads all metrics from `simulationState.layers` and thresholds from `@izakaya/shared` constants.

```tsx
import { POWER_THRESHOLDS, COOLING_THRESHOLDS, GPU_THRESHOLDS, WORKLOAD_THRESHOLDS, LOCATION_THRESHOLDS } from '@izakaya/shared';

const SENSOR_GROUPS = [
  {
    label: 'Power',
    key: 'power',
    thresholds: POWER_THRESHOLDS,
    metrics: [
      { id: 'totalFacilityPower', label: 'Total Facility Power', unit: 'kW', criticalLimit: 1200 },
      { id: 'itEquipmentPower', label: 'IT Equipment Power', unit: 'kW', criticalLimit: 900 },
      { id: 'coolingPower', label: 'Cooling Power', unit: 'kW' },
      { id: 'pue', label: 'PUE', unit: '', criticalLimit: 2.0 },
      { id: 'gridCarbonIntensity', label: 'Grid Carbon Intensity', unit: 'gCO₂/kWh', criticalLimit: 600 },
      { id: 'renewableEnergyFraction', label: 'Renewable Fraction', unit: '%' },
    ],
  },
  {
    label: 'Cooling',
    key: 'cooling',
    thresholds: COOLING_THRESHOLDS,
    metrics: [
      { id: 'coolingSetpoint', label: 'Cooling Setpoint', unit: '°C' },
      { id: 'waterUsageRate', label: 'Water Usage Rate', unit: 'L/hr', criticalLimit: 1500 },
      { id: 'wue', label: 'WUE', unit: 'L/kWh', criticalLimit: 2.5 },
      { id: 'ambientTemperature', label: 'Ambient Temperature', unit: '°C', criticalLimit: 45 },
      { id: 'coolantSupplyTemperature', label: 'Coolant Supply Temp', unit: '°C', criticalLimit: 30 },
    ],
  },
  {
    label: 'GPU',
    key: 'gpu',
    thresholds: GPU_THRESHOLDS,
    metrics: [
      { id: 'averageGpuTemperature', label: 'Avg GPU Temperature', unit: '°C', criticalLimit: 95 },
      { id: 'gpuUtilizationRate', label: 'GPU Utilization', unit: '%' },
      { id: 'activeGpuCount', label: 'Active GPUs', unit: '' },
      { id: 'gpuIdlePowerWaste', label: 'Idle Power Waste', unit: 'kW', criticalLimit: 80 },
      { id: 'hardwareFailureRate', label: 'HW Failure Rate', unit: '/day' },
    ],
  },
  {
    label: 'Workload',
    key: 'workload',
    thresholds: WORKLOAD_THRESHOLDS,
    metrics: [
      { id: 'requestVolume', label: 'Request Volume', unit: 'req/hr', criticalLimit: 16000 },
      { id: 'averageInferenceLatency', label: 'Inference Latency', unit: 'ms', criticalLimit: 300 },
      { id: 'queueDepth', label: 'Queue Depth', unit: '', criticalLimit: 300 },
      { id: 'requestDropRate', label: 'Drop Rate', unit: '%', criticalLimit: 0.05 },
      { id: 'batchEfficiency', label: 'Batch Efficiency', unit: '%' },
    ],
  },
  {
    label: 'Location',
    key: 'location',
    thresholds: LOCATION_THRESHOLDS,
    metrics: [
      { id: 'ambientTemperature', label: 'Ambient Temperature', unit: '°C', criticalLimit: 45 },
      { id: 'gridCarbonIntensity', label: 'Grid Carbon Intensity', unit: 'gCO₂/kWh' },
      { id: 'renewableEnergyFraction', label: 'Renewable Fraction', unit: '%' },
      { id: 'waterStressIndex', label: 'Water Stress Index', unit: '', criticalLimit: 1.0 },
      { id: 'localAirQualityIndex', label: 'Air Quality Index', unit: 'AQI', criticalLimit: 200 },
    ],
  },
];
```

For each group, render a category header:
```tsx
<div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#2d3148]">
  <span className={`w-1.5 h-1.5 rounded-full ${layerStatusDot}`} />
  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{group.label}</span>
</div>
```

Then render `SensorRow` for each metric. Read values from `state.layers[group.key]`, determine HealthStatus using the threshold ranges from shared constants.

**History tracking:** Expand `metricHistory` in the store to track ALL metrics (not just the current 6). In `setSimulationState`, append values for every metric in every layer. Ring buffer limit: 60 entries per metric.

### 9. AlertPanel (Restyled)

**File:** `packages/frontend/src/components/AlertPanel.tsx` (modify existing)

Restyle to new design — expandable cards, newest first:

```tsx
// Card container:
<div className={`border-l-2 ${severityBorder} bg-[#252840] rounded-r-md mb-1 hover:bg-[#2a2e48] transition-colors`}>
  {/* Header */}
  <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={toggle}>
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${severityDot}`} />
      <span className="text-sm text-white">{alert.metricName}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500">{formatTimestamp(alert.timestamp)}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${severityBadge}`}>
        {alert.severity.toUpperCase()}
      </span>
    </div>
  </div>

  {/* Expanded body */}
  {expanded && (
    <div className="px-3 pb-3">
      <p className="text-xs text-slate-400">{alert.message}</p>
      <div className="mt-2">
        <div className="text-[11px] text-slate-500 uppercase mb-1">Recommended Actions</div>
        <div className="text-xs text-slate-300">
          <span className="text-blue-400">→</span> View {alert.layerId} layer controls
        </div>
      </div>
      {!alert.acknowledged && (
        <button
          onClick={(e) => { e.stopPropagation(); acknowledgeAlert(alert.id); }}
          className="text-[10px] text-slate-500 hover:text-slate-300 border border-[#3d4168] rounded px-2 py-0.5 mt-2"
        >
          Acknowledge
        </button>
      )}
    </div>
  )}
</div>
```

Severity colors:
- critical: `border-red-500`, dot `bg-red-500`, badge `bg-red-500/20 text-red-300`
- warning: `border-orange-500`, dot `bg-orange-500`, badge `bg-orange-500/20 text-orange-300`

Acknowledged alerts: `opacity-50`

Empty state:
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <svg className="w-12 h-12 text-slate-700 mb-3" /* shield icon */> ... </svg>
  <span className="text-slate-500 text-sm">No active alerts</span>
</div>
```

Also include Recommendation cards in this tab, below alerts, with the same card style but `border-blue-500` left border.

### 10. AlertToast (3D Viewer Overlay)

**File:** `packages/frontend/src/components/AlertToast.tsx`

Rendered as an absolute-positioned overlay inside the 3D viewer container:

```tsx
export function AlertToast() {
  const alerts = useDashboardStore((s) => s.simulationState.activeAlerts);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const [visible, setVisible] = useState<Alert | null>(null);
  const lastAlertIdRef = useRef<string | null>(null);

  useEffect(() => {
    const newest = alerts[alerts.length - 1];
    if (newest && newest.id !== lastAlertIdRef.current && !newest.acknowledged) {
      lastAlertIdRef.current = newest.id;
      setVisible(newest);
      const timer = setTimeout(() => setVisible(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alerts]);

  if (!visible) return null;

  const isCritical = visible.severity === 'critical';

  return (
    <div
      onClick={() => { setActiveTab('alerts'); setVisible(null); }}
      className={`absolute top-3 right-3 z-10 rounded-lg p-3 max-w-xs cursor-pointer
        ${isCritical
          ? 'bg-red-950/95 border border-red-700'
          : 'bg-orange-950/95 border border-orange-700'}`}
      style={{ animation: 'fadeSlideIn 0.25s ease-out' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold
          ${isCritical ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'}`}>
          {visible.severity.toUpperCase()}
        </span>
        <span className="text-sm font-bold text-white">{visible.metricName}</span>
      </div>
      <p className="text-xs text-slate-300 line-clamp-2">{visible.message}</p>
    </div>
  );
}
```

Place in App.tsx inside the 3D viewer container (`<div className="w-[55%] relative">`).

### 11. ScenarioProgressBar

**File:** `packages/frontend/src/components/ScenarioProgressBar.tsx`

Only visible when `activeScenario !== null`. Reads scenario progress from store.

```tsx
export function ScenarioProgressBar() {
  const activeScenario = useDashboardStore((s) => s.simulationState.activeScenario);
  const progress = useDashboardStore((s) => s.scenarioProgress);

  if (!activeScenario || !progress) return null;

  const percent = Math.round((progress.ticksElapsed / progress.totalTicks) * 100);
  const isComplete = progress.phase === 'complete';

  // Color tier by progress
  let tierClasses: string;
  if (percent <= 33) {
    tierClasses = 'text-yellow-400 bg-yellow-950/30 border-yellow-600/30';
  } else if (percent <= 66) {
    tierClasses = 'text-orange-400 bg-orange-950/30 border-orange-600/30';
  } else {
    tierClasses = 'text-red-400 bg-red-950/30 border-red-600/30';
  }
  const barColor = percent <= 33 ? 'bg-yellow-500' : percent <= 66 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className={`h-6 flex items-center px-3 text-xs border ${tierClasses}`}>
      <span className="mr-2">⚡</span>
      <span className="font-mono">{activeScenario}</span>
      <span className="mx-2 text-slate-600">|</span>
      <span>{isComplete ? 'COMPLETE' : `Phase ${Math.ceil(percent / 25)}/4`}</span>
      <span className="mx-2 text-slate-600">|</span>
      <div className="w-24 h-1 bg-[#252840] rounded overflow-hidden">
        <div className={`h-full rounded ${barColor} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <span className="ml-2 font-mono">{percent}%</span>
    </div>
  );
}
```

### 12. BottomTimeline (48px)

**File:** `packages/frontend/src/components/BottomTimeline.tsx`

```tsx
export function BottomTimeline() {
  const simTime = useDashboardStore((s) => s.simulationState.simulatedTimeSeconds);
  const mode = useDashboardStore((s) => s.simulationState.mode);
  const connectionStatus = useDashboardStore((s) => s.connectionStatus);
  const timestamp = useDashboardStore((s) => s.simulationState.timestamp);

  const hours = Math.floor(simTime / 3600);
  const minutes = Math.floor((simTime % 3600) / 60);
  const seconds = simTime % 60;
  const timeStr = `T+${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(Math.floor(seconds)).padStart(2, '0')}`;

  return (
    <div className="h-12 flex-shrink-0 bg-[#1a1d27] border-t border-[#2d3148] flex items-center px-4 gap-4">
      {/* LIVE indicator */}
      <div className="flex items-center gap-1.5">
        {mode === 'live' && connectionStatus === 'connected' ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-400 font-bold">LIVE</span>
          </>
        ) : mode === 'simulation' ? (
          <span className="text-xs text-blue-400 font-bold">SIMULATION</span>
        ) : (
          <span className="text-xs text-slate-500">OFFLINE</span>
        )}
      </div>

      {/* Sim time */}
      <span className="font-mono text-slate-400 text-xs">{timeStr}</span>

      {/* Real timestamp */}
      <span className="text-[10px] text-slate-600">
        {new Date(timestamp).toLocaleTimeString()}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tick counter */}
      <span className="text-[10px] text-slate-600 font-mono">
        Tick {useDashboardStore.getState().simulationState.tick}
      </span>

      {/* Cumulative metrics */}
      <span className="text-[10px] text-slate-500">
        CO₂: {Math.round(useDashboardStore.getState().simulationState.derivedMetrics.totalCarbonEmittedKg)} kg
      </span>
      <span className="text-[10px] text-slate-500">
        H₂O: {Math.round(useDashboardStore.getState().simulationState.derivedMetrics.totalWaterConsumedLiters)} L
      </span>
    </div>
  );
}
```

### 13. ActionPanel (Restyled, moved to Controls tab)

**File:** `packages/frontend/src/components/ActionPanel.tsx` (modify existing)

The existing ActionPanel currently renders only when a layer is selected and lives in the right column. Modify it to:
1. Remove the `if (!selectedLayer) return null` guard — instead show a layer selector dropdown at the top
2. Add a layer selector: `<select>` with options for power, cooling, gpu, workload
3. Keep existing lever controls but restyle to match new theme:
   - Labels: `text-[11px] text-slate-400 uppercase`
   - Values: `font-mono text-slate-200`
   - Slider: custom styled with accent color
   - Toggle: same but with new colors
4. "Commit Action" button: `bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded px-4 py-2`

### 14. DiagnosticsPanel

**File:** `packages/frontend/src/components/DiagnosticsPanel.tsx`

Shows failure analysis. Reads GPU health, hardware failure rate, rack shutdown states:

```tsx
export function DiagnosticsPanel() {
  const gpu = useDashboardStore((s) => s.simulationState.layers.gpu);
  const rackShutdowns = gpu.levers.gracefulRackShutdown;

  return (
    <div className="p-3 space-y-3">
      {/* GPU Fleet Status */}
      <div className="bg-[#252840] rounded-md p-3">
        <div className="text-[11px] text-slate-500 uppercase mb-2">GPU Fleet Status</div>
        <div className="grid grid-cols-5 gap-1">
          {rackShutdowns.map((shutdown: boolean, i: number) => (
            <div key={i} className={`rounded p-2 text-center text-[10px] font-mono
              ${shutdown ? 'bg-slate-800 text-slate-600' : 'bg-[#1e2133] text-slate-300'}`}>
              <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${shutdown ? 'bg-slate-600' : 'bg-green-500'}`} />
              R{i}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Active: {gpu.activeGpuCount}/240 GPUs | Failure Rate: {gpu.hardwareFailureRate.toFixed(1)}/day
        </div>
      </div>

      {/* Thermal Map */}
      <div className="bg-[#252840] rounded-md p-3">
        <div className="text-[11px] text-slate-500 uppercase mb-2">Thermal Summary</div>
        <div className="text-sm text-slate-300">
          Avg Temp: <span className="font-mono">{gpu.averageGpuTemperature.toFixed(1)}°C</span>
        </div>
        <div className="text-sm text-slate-300">
          Throttle Threshold: <span className="font-mono">{gpu.levers.thermalThrottleThreshold}°C</span>
        </div>
        <div className="text-sm text-slate-300">
          Headroom: <span className="font-mono">
            {(gpu.levers.thermalThrottleThreshold - gpu.averageGpuTemperature).toFixed(1)}°C
          </span>
        </div>
      </div>
    </div>
  );
}
```

### 15. DecisionPanel

**File:** `packages/frontend/src/components/DecisionPanel.tsx`

Combines recommendations, community burden, and tradeoff economics. Absorbs content from the deleted `CommunityBurden.tsx`.

```tsx
export function DecisionPanel() {
  const state = useDashboardStore((s) => s.simulationState);
  const recs = state.activeRecommendations.filter(r => r.status === 'active');
  const location = state.layers.location;

  return (
    <div className="p-3 space-y-3">
      {/* Community Impact */}
      <div className="bg-[#252840] rounded-md p-3">
        <div className="text-[11px] text-slate-500 uppercase mb-2">Community Impact — {location.communityName}</div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Water Stress</span>
            <span className={`font-mono ${location.waterStressIndex > 0.6 ? 'text-red-400' : location.waterStressIndex > 0.3 ? 'text-yellow-400' : 'text-green-400'}`}>
              {location.waterStressIndex.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Air Quality Index</span>
            <span className="font-mono text-slate-200">{location.localAirQualityIndex}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">CO₂ Output</span>
            <span className="font-mono text-slate-200">{Math.round(state.derivedMetrics.carbonOutputKgPerHr)} kg/hr</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Cumulative CO₂</span>
            <span className="font-mono text-slate-200">{Math.round(state.derivedMetrics.totalCarbonEmittedKg)} kg</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Cumulative Water</span>
            <span className="font-mono text-slate-200">{Math.round(state.derivedMetrics.totalWaterConsumedLiters)} L</span>
          </div>
        </div>
      </div>

      {/* Active Recommendations */}
      <div className="text-[11px] text-slate-500 uppercase">Recommendations ({recs.length})</div>
      {recs.map(rec => (
        <RecommendationCard key={rec.id} rec={rec} />
        /* Reuse the existing RecommendationCard from AlertPanel, but extract it to a shared component */
      ))}
      {recs.length === 0 && (
        <p className="text-slate-500 text-xs text-center py-4">No active recommendations</p>
      )}
    </div>
  );
}
```

### 16. TimelinePanel

**File:** `packages/frontend/src/components/TimelinePanel.tsx`

Chronological event log fetched from GET /api/logs:

```tsx
export function TimelinePanel() {
  const [entries, setEntries] = useState<ChangeLogEntry[]>([]);

  useEffect(() => {
    fetch('/api/logs')
      .then(r => r.ok ? r.json() : { entries: [] })
      .then(data => setEntries(data.entries || []))
      .catch(() => setEntries([]));
  }, []);

  // Also listen for new actions via store
  const tick = useDashboardStore((s) => s.simulationState.tick);
  useEffect(() => {
    // Refetch every 10 ticks
    if (tick % 10 === 0) {
      fetch('/api/logs').then(r => r.ok ? r.json() : { entries: [] }).then(d => setEntries(d.entries || []));
    }
  }, [tick]);

  return (
    <div className="p-3">
      {entries.length === 0 ? (
        <p className="text-slate-500 text-xs text-center py-8">No actions recorded yet</p>
      ) : (
        <div className="space-y-1">
          {entries.slice().reverse().map(entry => (
            <div key={entry.id} className="bg-[#252840] rounded-md p-2.5 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 font-medium">{entry.operatorAction}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                {entry.tradeoffAcknowledgment.tradeoffText.slice(0, 100)}...
              </div>
              {entry.outcomeAfterFiveMinutes && (
                <span className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded
                  ${entry.outcomeAfterFiveMinutes.projectionAccuracy === 'better' ? 'bg-green-900/30 text-green-400'
                    : entry.outcomeAfterFiveMinutes.projectionAccuracy === 'worse' ? 'bg-red-900/30 text-red-400'
                    : 'bg-slate-700/30 text-slate-400'}`}>
                  Outcome: {entry.outcomeAfterFiveMinutes.projectionAccuracy}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 3D Model Enhancements

### Scene Setup

**File:** `packages/frontend/src/three/DataCenterScene.tsx`

Replace current lighting with:
```tsx
<Canvas
  dpr={[1, 2]}
  camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
  style={{ width: '100%', height: '100%' }}
  gl={{ antialias: true }}
>
  {/* Updated lighting */}
  <color attach="background" args={['#c4d4db']} />
  <hemisphereLight args={['#dbeafe', '#a8a090', 1.2]} />
  <directionalLight position={[6, 10, 6]} intensity={2.8} castShadow
    shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
  <directionalLight position={[-4, 8, -3]} intensity={0.6} />
  <directionalLight position={[3, 4, -6]} intensity={0.4} />

  {/* Ground plane - replace existing GroundPlane */}
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
    <planeGeometry args={[50, 50]} />
    <meshStandardMaterial color="#8f8f87" roughness={0.95} />
  </mesh>

  <CameraController />
  <ServerRacks />
  <CoolingTowers />
  <PDUCabinets />
  <CRAHUnits />
  <DataFlow />
  <HeatHaze />
  <WaterParticles />
  <ElectricArcs />
</Canvas>
```

Remove the SkyDome and old GroundPlane imports — replace with inline ground plane and `<color>` background.

### Thermal Coloring (ServerRack.tsx, CoolingTower.tsx)

**File:** `packages/frontend/src/three/ServerRack.tsx` — modify `SingleRack`

Add thermal emissive coloring based on GPU temperature:

```tsx
function getThermalEmissive(value: number, thresholds: { warm: number; caution: number; warning: number; critical: number }) {
  if (value >= thresholds.critical) return { color: '#dc2626', intensity: 1.10 };
  if (value >= thresholds.warning)  return { color: '#ea580c', intensity: 0.75 };
  if (value >= thresholds.caution)  return { color: '#f97316', intensity: 0.40 };
  if (value >= thresholds.warm)     return { color: '#f59e0b', intensity: 0.12 };
  return { color: '#000000', intensity: 0 };
}

const GPU_THERMAL_THRESHOLDS = { warm: 65, caution: 72, warning: 78, critical: 83 };
```

In `useFrame` of `SingleRack`:
```tsx
useFrame(({ clock }) => {
  const state = useDashboardStore.getState();
  const simState = state.simulationState;
  const selectedComponent = state.selectedHealthComponent;
  const isShutdown = simState.layers.gpu.levers.gracefulRackShutdown[index];
  const gpuTemp = simState.layers.gpu.averageGpuTemperature;

  if (bodyRef.current) {
    const mat = bodyRef.current.material as THREE.MeshStandardMaterial;

    // Priority 1: Health component selection highlight (cyan glow)
    if (selectedComponent === 'gpu') {
      mat.emissive.set('#06b6d4');
      mat.emissiveIntensity = THREE.MathUtils.lerp(1.2, 1.8, (Math.sin(clock.getElapsedTime() * 2) + 1) / 2);
    }
    // Priority 2: Shutdown state
    else if (isShutdown) {
      mat.emissive.set('#000000');
      mat.emissiveIntensity = 0;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.3, 0.02);
    }
    // Priority 3: Thermal coloring
    else {
      const thermal = getThermalEmissive(gpuTemp, GPU_THERMAL_THRESHOLDS);
      mat.emissive.set(thermal.color);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, thermal.intensity, 0.05);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1, 0.02);
    }
  }

  // LED strip logic stays the same
  // ...
});
```

Apply similar pattern to `CoolingTower.tsx`:
- Highlight when `selectedComponent === 'cooling'` (cyan glow)
- Thermal coloring based on `coolantSupplyTemperature`
- Thresholds: `{ warm: 15, caution: 18, warning: 22, critical: 26 }`

Apply to `PDUCabinet.tsx`:
- Highlight when `selectedComponent === 'power'` (cyan glow)
- No thermal coloring (just health-based LED)

Apply to `CRAHUnit.tsx`:
- Highlight when `selectedComponent === 'cooling'` (cyan glow)

### Hover Tooltips

Use `@react-three/drei`'s `Html` component for tooltips on hover:

```tsx
import { Html } from '@react-three/drei';

// In SingleRack:
const [hovered, setHovered] = useState(false);

<group
  position={position}
  onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
  onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
>
  {/* existing mesh */}
  {hovered && (
    <Html center style={{ pointerEvents: 'none' }}>
      <div className="bg-[#1a1d27]/95 border border-[#3d4168] rounded px-2 py-1.5 text-[10px] whitespace-nowrap">
        <div className="text-white font-bold">Rack {index}</div>
        <div className="text-slate-400">
          {isShutdown ? 'SHUTDOWN' : `${gpuTemp.toFixed(1)}°C | ${Math.round(gpuUtil * 100)}% util`}
        </div>
      </div>
    </Html>
  )}
</group>
```

---

## State Management Updates

### Zustand Store Additions

**File:** `packages/frontend/src/store/useDashboardStore.ts`

Add these fields and actions to the existing store:

```ts
// New fields
activeTab: string;                        // default 'sensors'
selectedHealthComponent: string | null;   // default null
speedMultiplier: number;                  // default 1
scenarioProgress: ScenarioProgress | null; // default null

// New actions
setActiveTab: (tab: string) => void;
setSelectedHealthComponent: (key: string | null) => void;
setSpeedMultiplier: (speed: number) => void;
setScenarioProgress: (progress: ScenarioProgress | null) => void;
acknowledgeAlert: (id: string) => void;
```

Implementation:
```ts
activeTab: 'sensors',
selectedHealthComponent: null,
speedMultiplier: 1,
scenarioProgress: null,

setActiveTab: (tab) => set({ activeTab: tab }),
setSelectedHealthComponent: (key) => set((prev) => ({
  selectedHealthComponent: prev.selectedHealthComponent === key ? null : key,
})),
setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
setScenarioProgress: (progress) => set({ scenarioProgress: progress }),
acknowledgeAlert: (id) => set((prev) => ({
  simulationState: {
    ...prev.simulationState,
    activeAlerts: prev.simulationState.activeAlerts.map(a =>
      a.id === id ? { ...a, acknowledged: true } : a
    ),
  },
})),
```

### Expanded Metric History

In `setSimulationState`, expand the `append` calls to track ALL layer metrics:

```ts
// Power
append('totalFacilityPower', state.layers.power.totalFacilityPower);
append('itEquipmentPower', state.layers.power.itEquipmentPower);
append('coolingPower', state.layers.power.coolingPower);
append('gridCarbonIntensity', state.layers.power.gridCarbonIntensity);
append('renewableEnergyFraction', state.layers.power.renewableEnergyFraction);
// Cooling
append('coolingSetpoint', state.layers.cooling.coolingSetpoint);
append('waterUsageRate', state.layers.cooling.waterUsageRate);
append('ambientTemperature', state.layers.cooling.ambientTemperature);
append('coolantSupplyTemperature', state.layers.cooling.coolantSupplyTemperature);
// GPU
append('averageGpuTemperature', state.layers.gpu.averageGpuTemperature);
append('activeGpuCount', state.layers.gpu.activeGpuCount);
append('gpuIdlePowerWaste', state.layers.gpu.gpuIdlePowerWaste);
append('hardwareFailureRate', state.layers.gpu.hardwareFailureRate);
// Workload
append('averageInferenceLatency', state.layers.workload.averageInferenceLatency);
append('queueDepth', state.layers.workload.queueDepth);
append('requestDropRate', state.layers.workload.requestDropRate);
append('batchEfficiency', state.layers.workload.batchEfficiency);
// Location
append('waterStressIndex', state.layers.location.waterStressIndex);
append('localAirQualityIndex', state.layers.location.localAirQualityIndex);
// Derived (existing)
append('pue', state.derivedMetrics.pue);
append('wue', state.derivedMetrics.wue);
append('cue', state.derivedMetrics.cue);
append('gpuUtilizationRate', state.layers.gpu.gpuUtilizationRate);
append('carbonOutputKgPerHr', state.derivedMetrics.carbonOutputKgPerHr);
append('requestVolume', state.layers.workload.requestVolume);
```

---

## WebSocket Integration Updates

**File:** `packages/frontend/src/hooks/useSimulationSocket.ts`

Add `scenario:progress` message handling:

```ts
ws.onmessage = (event) => {
  try {
    const msg: WebSocketMessage = JSON.parse(event.data);
    switch (msg.event) {
      case 'state:update':
        setSimulationState(msg.data as SimulationState);
        break;
      case 'alert:new':
        addToast({ type: 'error', title: 'New Alert', body: String((msg.data as any)?.message || '') });
        break;
      case 'scenario:progress':
        setScenarioProgress(msg.data as ScenarioProgress);
        break;
      case 'ping':
        ws.send(JSON.stringify({ event: 'pong', data: {} }));
        break;
    }
  } catch {
    // ignore
  }
};
```

Store the WebSocket ref so SpeedControl can send `speed:set` messages:

```ts
// Store wsRef in a module-level variable or in the store
export let wsInstance: WebSocket | null = null;

// In connect():
wsInstance = ws;

// Export a send function:
export function sendWsMessage(event: string, data: unknown) {
  if (wsInstance?.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify({ event, data }));
  }
}
```

---

## App.tsx Rewrite

**File:** `packages/frontend/src/App.tsx`

Replace entire content:

```tsx
import { useSimulationSocket } from './hooks/useSimulationSocket';
import { Header } from './components/Header';
import { AssetKPIBar } from './components/AssetKPIBar';
import { HealthBreakdown } from './components/HealthBreakdown';
import { ScenarioProgressBar } from './components/ScenarioProgressBar';
import { TabContainer } from './components/TabContainer';
import { BottomTimeline } from './components/BottomTimeline';
import { AlertToast } from './components/AlertToast';
import { TradeoffModal } from './components/TradeoffModal';
import { ToastContainer } from './components/Toast';
import { DataCenterScene } from './three/DataCenterScene';

export default function App() {
  useSimulationSocket();

  return (
    <>
      <div className="min-viewport-warning">
        <p>Please use a desktop browser with a window at least 1280x720</p>
      </div>

      <div className="h-screen flex flex-col overflow-hidden bg-[#0f1117]">
        {/* Header */}
        <Header />

        {/* KPI Bar */}
        <AssetKPIBar />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: 3D Viewer */}
          <div className="w-[55%] relative">
            <DataCenterScene />
            <AlertToast />
          </div>

          {/* Right: Panel system */}
          <div className="w-[45%] flex flex-col border-l border-[#2d3148] bg-[#1e2133]">
            <HealthBreakdown />
            <ScenarioProgressBar />
            <TabContainer />
          </div>
        </div>

        {/* Bottom Timeline */}
        <BottomTimeline />
      </div>

      <TradeoffModal />
      <ToastContainer />
    </>
  );
}
```

---

## Implementation Sequence

Execute in this exact order. Each phase must be complete and verified before starting the next.

### Phase 1: Foundation (Design System + Store)
1. Update `packages/frontend/tailwind.config.ts` with new color palette
2. Update `packages/frontend/src/index.css` with new CSS variables, scrollbar styles, animations
3. Update `packages/frontend/src/store/useDashboardStore.ts` — add activeTab, selectedHealthComponent, speedMultiplier, scenarioProgress, acknowledgeAlert, expanded metricHistory tracking
4. Verify the frontend still compiles: `npm run dev --workspace=packages/frontend`

### Phase 2: Layout Shell
5. Create `packages/frontend/src/components/Header.tsx`
6. Create `packages/frontend/src/components/AssetKPIBar.tsx`
7. Create `packages/frontend/src/components/BottomTimeline.tsx`
8. Create `packages/frontend/src/components/HealthGauge.tsx`
9. Rewrite `packages/frontend/src/App.tsx` with the new flex layout (temporarily stub missing components as empty divs)
10. Verify: fixed viewport layout, no scroll, header/KPI/3D/right-panel/bottom all visible

### Phase 3: Right Panel System
11. Create `packages/frontend/src/components/HealthBreakdown.tsx`
12. Create `packages/frontend/src/components/TabContainer.tsx`
13. Create `packages/frontend/src/components/SensorRow.tsx`
14. Create `packages/frontend/src/components/SensorPanel.tsx`
15. Verify: health chips render, tab switching works, sensor rows show live data with sparklines

### Phase 4: Alerts + Toasts
16. Restyle `packages/frontend/src/components/AlertPanel.tsx` to new card design
17. Create `packages/frontend/src/components/AlertToast.tsx`
18. Wire alert count badge on alerts tab in TabContainer
19. Verify: alert cards expand/collapse, toast appears over 3D viewer, clicking toast switches to alerts tab

### Phase 5: 3D Scene Enhancements
20. Update `packages/frontend/src/three/DataCenterScene.tsx` — new lighting, background color, ground plane
21. Update `packages/frontend/src/three/ServerRack.tsx` — thermal coloring, health component selection highlight (cyan glow), hover tooltips
22. Update `packages/frontend/src/three/CoolingTower.tsx` — same treatment
23. Verify: 3D scene looks brighter and more professional, racks glow based on GPU temp, clicking health chip highlights relevant 3D parts in cyan

### Phase 6: Scenario + Speed Control
24. Create `packages/frontend/src/components/SpeedControl.tsx`
25. Create `packages/frontend/src/components/ScenarioProgressBar.tsx`
26. Move scenario activation UI into Header dropdown
27. Add `setTickInterval` method to backend engine (`packages/backend/src/simulation/engine.ts`)
28. Add `speed:set` WebSocket handler to backend (`packages/backend/src/websocket/connectionManager.ts`)
29. Update `packages/frontend/src/hooks/useSimulationSocket.ts` — handle `scenario:progress`, expose ws send function
30. Verify: speed buttons change simulation pace, scenario progress bar appears during active scenario

### Phase 7: Remaining Tab Panels
31. Modify `packages/frontend/src/components/ActionPanel.tsx` — add layer selector, restyle for Controls tab
32. Create `packages/frontend/src/components/DiagnosticsPanel.tsx`
33. Create `packages/frontend/src/components/DecisionPanel.tsx` (absorb CommunityBurden data)
34. Create `packages/frontend/src/components/TimelinePanel.tsx`
35. Restyle `packages/frontend/src/components/ScenarioPanel.tsx` to match new theme

### Phase 8: Cleanup
36. Delete `packages/frontend/src/components/LayerSidebar.tsx`
37. Delete `packages/frontend/src/components/RightPanel.tsx`
38. Delete `packages/frontend/src/components/CommunityBurden.tsx`
39. Remove `SimulationBanner.tsx` (scenario state now shown in progress bar)
40. Verify no unused imports or dead code remain

### Phase 9: Polish + Verification
41. Verify all status colors are consistent across KPI tiles, sensor rows, alerts, 3D scene
42. Test full scenario flow: activate scenario → progress bar → alerts fire → toast appears → acknowledge alert → scenario completes
43. Test alert toast → click → navigates to alerts tab
44. Test health component chip → 3D cyan highlight → click again to deselect
45. Test speed control → simulation speeds up/slows down
46. Test connection loss → status indicator turns red → reconnection → green
47. Verify no page scroll at any viewport size >= 1280x720
48. Verify all sections properly sized and no overflow
