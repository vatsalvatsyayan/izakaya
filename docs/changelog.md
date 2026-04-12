# Changelog

All notable changes to this project are documented here. Format:

## [Date] — [Summary]
- **Changed:** [description]
- **Added:** [description]
- **Fixed:** [description]
- **Files affected:** [list]

---

## 2026-04-12 — Frontend visual overhaul per improvement specification v1.0

### 3D Scene
- **Changed:** Ground plane from beige/green dynamic to dark `#0F172A` with blue-gray grid overlay (`#1E3A5F`, opacity 0.3, 40×40 divisions simulating raised-floor tiles)
- **Changed:** Sky dome replaced by solid `#0F172A` scene background; `SkyDome.tsx` emptied
- **Changed:** DataCenterScene background from `#c4d4db` to `#0F172A`; hemisphere light now blue-tinted; removed inline ground mesh
- **Added:** `FogExp2` atmospheric fog (`#0EA5E9`, density 0.015) for scene depth
- **Added:** Simulation mode blue tint overlay (`rgba(59,130,246,0.12)`) inside DataCenterScene canvas
- **Changed:** Server rack base color from `#2A3042` to `#1E293B`; added emissive front-face edge highlight `#334155`; health glow intensities raised (healthy 0.6, warning 0.7, critical 0.8 with rapid pulse)
- **Changed:** Cooling tower color from `#3B4A5C` to `#263548`; fan rotation speed now `(fanSpeedLever/50)*0.3` rad/s per-frame
- **Changed:** DataFlow particle colors to `#38BDF8`→`#0EA5E9` gradient with red (`#EF4444`) for dropped; removed ingress/egress marker spheres; particle scale 0.05

### UI Components
- **Added:** `CommunityBurdenIndicator` component — pinned to bottom of right panel, never collapsible; shows community name, WSI badge (color-coded + pulse at Critical), water draw L/day, carbon kgCO₂/hr with car-miles equivalence
- **Changed:** `TradeoffModal` — backdrop `rgba(0,0,0,0.75)`, card `#1E293B`, border `#334155`, radius 12px; community/WSI/liters/requests now 18px accent `#38BDF8`; disabled button `opacity:0.4 cursor:not-allowed`; X button = Cancel (spec §2.5)
- **Changed:** `HistoryPanel` — timestamps now ISO monospace; "Append-only" immutability label with lock icon; download filename includes ISO timestamp; expanded view shows full tradeoff/community/end-user text; 5-min outcome badge (Better/Worse/Matched)
- **Added:** Simulation mode banner (full-width `#3B82F6` stripe above header)
- **Added:** Reconnecting amber banner (`#F59E0B` on `#78350F`) when WS is disconnected/reconnecting

### Files affected
- `packages/frontend/src/three/GroundPlane.tsx`
- `packages/frontend/src/three/SkyDome.tsx`
- `packages/frontend/src/three/DataCenterScene.tsx`
- `packages/frontend/src/three/ServerRack.tsx`
- `packages/frontend/src/three/CoolingTower.tsx`
- `packages/frontend/src/three/DataFlow.tsx`
- `packages/frontend/src/components/TradeoffModal.tsx`
- `packages/frontend/src/components/HistoryPanel.tsx`
- `packages/frontend/src/components/CommunityBurdenIndicator.tsx` (new)
- `packages/frontend/src/App.tsx`

---

## 2026-04-12 — Fix KPI bar tiles being clipped/too narrow
- **Fixed:** KPI tiles in `AssetKPIBar` were shrinking to near-zero width due to `min-w-0` with no floor
- **Changed:** Added `min-w-[130px]` to each `KPITile` to prevent over-shrinking
- **Changed:** Increased bar height from `h-16` (64px) to `h-20` (80px) for better vertical breathing room
- **Changed:** Switched to `items-stretch` so tiles fill the full bar height consistently
- **Changed:** Replaced `truncate` on label with `whitespace-nowrap` so labels are never clipped
- **Changed:** Reduced nameplate `min-w` from 220px to 190px and added `flex-shrink-0` to prevent it from shrinking
- **Changed:** Added `overflow-x-auto` to the bar as a graceful fallback at narrow viewports
- **Removed:** Decorative ISO/ASHRAE badge (non-data-ink element wasting horizontal space)
- **Files affected:** `packages/frontend/src/components/AssetKPIBar.tsx`

---

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
- Verified all 5 user flows end-to-end
- Fixed ScenarioPanel to fetch scenarios from backend API instead of hardcoded list (scenario IDs now match backend: heatwave-001, demand-spike-001, etc.)
- Fixed HistoryPanel to poll for log updates every 4 seconds
- Wired up recommendation dismiss button to POST /api/recommendations/:id/dismiss

Files affected: packages/frontend/src/components/ScenarioPanel.tsx, packages/frontend/src/components/HistoryPanel.tsx, packages/frontend/src/components/AlertPanel.tsx, docs/progress.md, docs/changelog.md

---

## 2026-04-12 — Project Initialization
- **Added:** Project documentation suite
  - docs/prd.md — Product Requirements Document
  - docs/architecture.md — Software Architecture & Design
  - docs/backend_plan.md — Backend Implementation Plan
  - docs/frontend_plan.md — Frontend Implementation Plan
  - docs/frontend_design.md — Frontend Design Guidelines
  - docs/integration_contract.md — Integration Contract
  - CLAUDE.md — Project governance and agent guidance
  - docs/progress.md — Implementation tracking
  - docs/changelog.md — This file
  - docs/decisions.md — Decision log
- **Files affected:** All docs/
