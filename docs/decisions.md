# Decision Log

Architectural and design decisions made during development. Each entry captures what was decided, why, what alternatives were considered, and who/what made the decision.

## Format

### [DECISION-NNN] — [Short Title]
- **Date:** YYYY-MM-DD
- **Context:** Why this decision was needed
- **Decision:** What was decided
- **Alternatives considered:** What else was evaluated
- **Rationale:** Why this option was chosen
- **Consequences:** What this means for the implementation
- **Documents affected:** Which docs were updated

---

### DECISION-001 — Monorepo with shared types package
- **Date:** 2026-04-12
- **Context:** Backend and frontend need to share TypeScript interfaces and formula functions
- **Decision:** Use a monorepo with packages/shared, packages/backend, packages/frontend
- **Alternatives considered:** (1) Duplicate types in both packages, (2) Git submodule, (3) Published npm package
- **Rationale:** Monorepo with workspace dependencies is simplest for a hackathon. No publish step, instant type synchronization, single repo to manage.
- **Consequences:** Must use npm/yarn/pnpm workspaces. Both packages import from @izakaya/shared via workspace protocol.
- **Documents affected:** docs/architecture.md

### DECISION-002 — In-memory state with no database
- **Date:** 2026-04-12
- **Context:** The simulation needs a state store and change log persistence
- **Decision:** All state held in-memory in the Node.js process. No database.
- **Alternatives considered:** (1) SQLite, (2) Redis, (3) DynamoDB
- **Rationale:** Hackathon prototype. Adding a database creates deployment complexity with zero user-facing benefit. Server restart clears state, which is acceptable for a demo.
- **Consequences:** Change log is lost on server restart. Export-to-JSON is the only persistence mechanism.
- **Documents affected:** docs/architecture.md, docs/backend_plan.md

### DECISION-003 — Zustand over Redux for frontend state
- **Date:** 2026-04-12
- **Context:** Need a state management solution for React that handles frequent WebSocket updates
- **Decision:** Zustand
- **Alternatives considered:** (1) Redux Toolkit, (2) Jotai, (3) React Context
- **Rationale:** Zustand has minimal boilerplate, supports direct mutation-style updates (good for replacing state on every WebSocket tick), and integrates naturally with React Three Fiber (which already uses Zustand internally).
- **Consequences:** No Redux DevTools (Zustand has its own). Store is defined as a single hook.
- **Documents affected:** docs/architecture.md, docs/frontend_plan.md
