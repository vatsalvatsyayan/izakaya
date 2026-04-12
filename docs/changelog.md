# Changelog

All notable changes to this project are documented here. Format:

## [Date] — [Summary]
- **Changed:** [description]
- **Added:** [description]
- **Fixed:** [description]
- **Files affected:** [list]

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
