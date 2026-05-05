# AI Factory Digital Twin

A real-time sustainability operations dashboard for AI data centers — built to make the human cost of every infrastructure decision impossible to ignore.

---

## The Problem

AI data centers are optimized for uptime and throughput. The water drawn from drought-stricken communities, the carbon emitted during peak grid hours, and the users quietly dropped during capacity crunches remain invisible to the people making operational decisions. Sustainability is treated as a report generated after the fact, not a gate that must be cleared before acting.

**AI Factory Digital Twin** changes that. Every operational change requires the operator to explicitly acknowledge its community water impact, carbon cost, and end-user effect — before the action commits. Every acknowledgment is permanently logged.

---

## What It Does

Simulates a 240-GPU data center in Oregon across five interdependent infrastructure layers, updating every 2 seconds via WebSocket:

- **Power** — grid draw, PUE, carbon intensity
- **Cooling** — cooling efficiency, water consumption, tower load
- **GPU Fleet** — utilization, thermal state, hardware health
- **Workload** — job queue, priority tiers, SLA compliance
- **Local Environment** — community water stress, grid stress, local air quality

Every operational lever triggers a **mandatory Ethical Tradeoff Acknowledgment Modal** that quantifies the sustainability and community consequences before the change is applied. There is no way to skip it. The full text of what the operator saw and acknowledged is captured in an append-only audit log, exportable at any time.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| 3D Visualization | React Three Fiber, Three.js |
| State Management | Zustand (WebSocket-driven) |
| Backend | Node.js, Express, WebSocket (`ws`) |
| Simulation Engine | Deterministic tick loop (2s), layer dependency propagation |
| Shared Types | TypeScript monorepo (`packages/shared`) |
| Deployment | AWS EC2 (backend), S3 + CloudFront (frontend) |

---

## How to Use

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install

```bash
# From the repo root
npm install
```

### Run

```bash
# Terminal 1 — backend simulation engine + REST API + WebSocket
npm run dev --workspace=packages/backend

# Terminal 2 — frontend dashboard
npm run dev --workspace=packages/frontend
```

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`
- WebSocket connects automatically on frontend load.

### Interact

1. Watch live metrics update every 2 seconds across the 3D scene and top bar.
2. Expand a layer card in the sidebar to see its detailed metrics.
3. Open the **Action Panel** to adjust operational levers (cooling setpoint, GPU power cap, job scheduling priority, etc.).
4. Before any change commits, the **Ethical Tradeoff Acknowledgment Modal** will appear — read it, then acknowledge to proceed.
5. Activate a **Scenario** (e.g., Water Scarcity, Grid Stress Event) to inject a crisis and observe how it cascades across layers.
6. Review the **Audit Log** to see every action taken with its full tradeoff context.

---

## Demo

> Video walkthrough:

[![Watch the demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red?logo=youtube)](https://www.youtube.com/watch?v=FzY3THC-pfo)

---

## Project Structure

```
packages/
  shared/       — TypeScript interfaces, constants, pure metric formulas
  backend/      — Simulation engine, Express REST API, WebSocket server
  frontend/     — React UI, Zustand store, React Three Fiber 3D scene
docs/           — Architecture, PRD, design guidelines, integration contract
```

---

## References

- [ShiftSC AI Ethics Hackathon](https://shiftsc.org) — built for this event
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — Three.js renderer for React
- [Zustand](https://github.com/pmndrs/zustand) — lightweight state management
- [NVIDIA DCGM](https://developer.nvidia.com/dcgm) — GPU telemetry API (future integration target)
- [WattTime API](https://www.watttime.org/api-documentation/) — real-time grid carbon intensity (future integration target)
- [US Drought Monitor](https://droughtmonitor.unl.edu/) — community water stress data source (future integration target)

---

Built with intention at ShiftSC 2025.
