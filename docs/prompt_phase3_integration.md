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
