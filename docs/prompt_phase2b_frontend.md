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
