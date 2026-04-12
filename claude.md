# CLAUDE.md — Project Governance for AI Coding Agents

## Project Summary

The AI Factory Digital Twin is a simulated real-time operations dashboard that renders a 3D digital twin of a mid-size AI data center, displays live metrics across five infrastructure layers (Power, Cooling, GPU, Workload, Location), and forces operators to explicitly acknowledge ethical tradeoffs before committing any operational change. It is built for the ShiftSC AI Ethics Hackathon, targeting senior AI infrastructure operators who need visibility into sustainability consequences (water, carbon, community burden) of every decision. The tech stack is a TypeScript monorepo with a Node.js/Express/WebSocket backend, a React/Three.js/Zustand frontend, and a shared types package.

---

## Document Map

| Document | Contains | Read when... |
| --- | --- | --- |
| docs/prd.md | Full product requirements, user flows, data models, seed data | You need to understand WHAT to build |
| docs/architecture.md | System design, repo structure, tech stack, state management | You need to understand HOW things connect |
| docs/backend_plan.md | Step-by-step backend implementation phases | You are working on backend code |
| docs/frontend_plan.md | Step-by-step frontend implementation phases | You are working on frontend code |
| docs/frontend_design.md | Colors, typography, spacing, component specs, 3D scene design | You are making ANY visual decision |
| docs/integration_contract.md | API schemas, WebSocket events, shared types, error handling | You are writing code that crosses the network boundary |
| docs/progress.md | Current implementation status | Before starting any task (to know what's done) |
| docs/changelog.md | Record of all changes made | After completing any task (to log what you did) |
| docs/decisions.md | Architecture and design decisions with rationale | When you face a decision not covered by existing docs |

---

## Working Rules

1. **ALWAYS** read `docs/progress.md` before starting work to understand current state.
2. **ALWAYS** update `docs/progress.md` after completing a task.
3. **ALWAYS** log changes in `docs/changelog.md` with date, description, and files affected.
4. If you encounter a decision not covered by the docs, document it in `docs/decisions.md` with rationale before implementing.
5. The shared types in `packages/shared/src/types.ts` are the **single source of truth** for data structures. Never redefine these types locally.
6. The integration contract (`docs/integration_contract.md`) is the **single source of truth** for API shapes. Never deviate from it.
7. The frontend design guidelines (`docs/frontend_design.md`) are the **single source of truth** for visual decisions. Never pick colors, fonts, or spacing values without checking this document.
8. Run the dev server and verify your changes work before marking a task complete.
9. Keep commits small and focused. One logical change per commit.

---

## Quick Start

```bash
# Install all dependencies (from repo root)
npm install

# Start the backend dev server
npm run dev --workspace=packages/backend

# Start the frontend dev server (separate terminal)
npm run dev --workspace=packages/frontend

# Verify: backend should be running on http://localhost:3001
# Verify: frontend should be running on http://localhost:5173
# Verify: WebSocket connection should establish automatically
```

---

## Architecture Quick Reference

### Monorepo Structure

```
packages/shared/      — TypeScript interfaces, constants, pure formula functions
packages/backend/     — Node.js simulation engine, Express REST API, WebSocket server
packages/frontend/    — React UI, Zustand store, React Three Fiber 3D scene
```

### Data Flow

```
Simulation Engine (setInterval 2s)
  → mutates in-memory SimulationState
  → WebSocket broadcast { event: "state:update", data: SimulationState }
  → useSimulationSocket hook receives & parses
  → Zustand store updated via setSimulationState()
  → React components re-render from store slices
  → Three.js components interpolate toward new values in useFrame
```

### Key Files

| Purpose | File |
| --- | --- |
| Shared types (source of truth) | `packages/shared/src/types.ts` |
| Constants & thresholds | `packages/shared/src/constants.ts` |
| Pure metric formulas | `packages/shared/src/formulas.ts` |
| Simulation tick loop | `packages/backend/src/simulation/engine.ts` |
| Drift model | `packages/backend/src/simulation/drift.ts` |
| Layer dependencies | `packages/backend/src/simulation/dependencies.ts` |
| Alert evaluation | `packages/backend/src/simulation/alerts.ts` |
| Recommendations | `packages/backend/src/simulation/recommendations.ts` |
| Scenario definitions | `packages/backend/src/simulation/scenarios.ts` |
| Seed state (tick 0) | `packages/backend/src/simulation/seed.ts` |
| REST API router | `packages/backend/src/api/router.ts` |
| WebSocket manager | `packages/backend/src/websocket/connectionManager.ts` |
| Backend entry point | `packages/backend/src/index.ts` |
| Zustand store | `packages/frontend/src/store/useDashboardStore.ts` |
| WebSocket hook | `packages/frontend/src/hooks/useSimulationSocket.ts` |
| 3D scene root | `packages/frontend/src/three/DataCenterScene.tsx` |
| App layout | `packages/frontend/src/App.tsx` |
| Tailwind config | `packages/frontend/tailwind.config.ts` |

---

## Common Tasks

### "I need to add a new metric"

1. `packages/shared/src/types.ts` — Add field to the relevant layer state interface
2. `packages/shared/src/constants.ts` — Add thresholds, seed value, drift config
3. `packages/shared/src/formulas.ts` — Add calculation function if it's a derived metric
4. `packages/backend/src/simulation/seed.ts` — Add initial value
5. `packages/backend/src/simulation/drift.ts` — Add drift behavior
6. `packages/backend/src/simulation/dependencies.ts` — Add dependency propagation if cross-layer
7. `packages/backend/src/simulation/alerts.ts` — Add threshold alert if needed
8. `packages/frontend/src/store/useDashboardStore.ts` — Ensure store exposes the new field
9. `packages/frontend/src/components/LayerSidebar.tsx` — Display in layer detail view
10. `packages/frontend/src/components/MetricsTopBar.tsx` — Add tile if it's a top-level KPI
11. `docs/integration_contract.md` — Update the type definition

### "I need to add a new lever"

1. `packages/shared/src/types.ts` — Add to `ActionPayload` or relevant lever interface
2. `packages/shared/src/constants.ts` — Add min/max/step/default values
3. `packages/backend/src/simulation/engine.ts` — Handle lever application in tick
4. `packages/backend/src/simulation/dependencies.ts` — Propagate lever effects
5. `packages/backend/src/api/actionsController.ts` — Validate the new lever in POST /api/actions
6. `packages/frontend/src/components/ActionPanel.tsx` — Add slider/toggle control
7. `packages/frontend/src/components/TradeoffModal.tsx` — Ensure tradeoff text covers new lever
8. `docs/integration_contract.md` — Update action payload schema

### "I need to add a new scenario"

1. `packages/shared/src/types.ts` — Add scenario ID to union type if using literal types
2. `packages/backend/src/simulation/scenarios.ts` — Define scenario events and timeline
3. `packages/frontend/src/components/ScenarioPanel.tsx` — Add to scenario list UI
4. `docs/integration_contract.md` — Document scenario in GET /api/scenarios response

### "I need to change a threshold"

1. `packages/shared/src/constants.ts` — Update the threshold value
2. `packages/backend/src/simulation/alerts.ts` — Verify alert triggers use the constant
3. `packages/backend/src/simulation/recommendations.ts` — Verify recommendation triggers
4. `docs/frontend_design.md` — Check if color breakpoints need updating

### "I need to add a new 3D component"

1. `packages/frontend/src/three/` — Create new component file (e.g., `NewComponent.tsx`)
2. `packages/frontend/src/three/DataCenterScene.tsx` — Mount the component in the scene
3. `packages/frontend/src/store/useDashboardStore.ts` — Ensure relevant state is available
4. `docs/frontend_design.md` — Check material palette, lighting, and animation specs
5. If the component reacts to health state: use the health color system from `docs/frontend_design.md` Section 6
