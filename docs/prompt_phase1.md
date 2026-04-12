You are building the shared types package and monorepo scaffolding for the AI Factory Digital Twin project. This is Phase 1 of a 3-phase parallel build. Phase 2 agents (backend + frontend) will depend on everything you produce here. Your work must be complete and correct — any missing type or wrong constant will block two parallel agents.

## Docs to Read First

Read these files completely before writing any code:
- docs/prd.md (especially Sections 4-6, 10-11, 13, 16)
- docs/architecture.md (especially Sections 3-4)
- docs/integration_contract.md (all of it — this defines every type)
- docs/backend_plan.md (Section 2 — shared types and constants)
- CLAUDE.md

## Boundary

You may create or modify:
- packages/shared/ (entire directory)
- package.json (root — workspace config only)
- tsconfig.base.json (root)

You must NOT create or modify anything in packages/backend/ or packages/frontend/.

## Implementation Steps (in order)

### Step 1: Root monorepo scaffolding

Create `package.json` at repo root:
```json
{
  "name": "izakaya",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:backend": "npm run dev --workspace=packages/backend",
    "dev:frontend": "npm run dev --workspace=packages/frontend"
  }
}
```

Create `tsconfig.base.json` at repo root:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Step 2: packages/shared/package.json and tsconfig.json

`packages/shared/package.json`:
```json
{
  "name": "@izakaya/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {}
}
```

`packages/shared/tsconfig.json` extending the base, with `composite: true`.

`packages/shared/src/index.ts` — barrel export: re-exports everything from types.ts, constants.ts, formulas.ts.

### Step 3: packages/shared/src/types.ts

Define EVERY interface from docs/integration_contract.md Section 1. The complete list:
- HealthStatus (type alias)
- SimulationState
- PowerLayerState
- CoolingLayerState
- GPULayerState
- WorkloadLayerState
- LocationLayerState
- DerivedMetrics
- LayerHealth
- Metric
- Lever
- Recommendation
- Alert
- ScenarioDefinition
- ScenarioEvent
- ActionCommit
- ChangeLogEntry
- EndUserImpact
- CommunityBurden

Also define these WebSocket event types:
```typescript
interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
}

interface ScenarioProgress {
  scenarioId: string;
  ticksElapsed: number;
  totalTicks: number;
  phase: string;
}

interface ActionConfirmed {
  changeLogEntryId: string;
  success: true;
}
```

Also define the REST request/response types:
- ActivateScenarioRequest
- CommitActionRequest
- StateResponse
- ScenariosResponse
- LogsResponse
- RecommendationsResponse
- CommitActionResponse

Every field must have a JSDoc comment with its unit and range where applicable.

### Step 4: packages/shared/src/constants.ts

Define all threshold constants, seed values, and configuration. Source: PRD Sections 4-5, docs/integration_contract.md sample values.

Must include:
- TICK_INTERVAL_MS = 2000
- SIMULATED_SECONDS_PER_TICK = 300
- BASE_TIME (ISO string for simulation start)
- Threshold objects per layer (e.g., POWER_THRESHOLDS with healthy/warning/critical ranges for each metric)
- Seed values for every metric (the tick-0 state from PRD Section 16 / integration_contract.md GET /api/state example response)
- Drift configuration per metric (direction, magnitude, noise range — from PRD Section 5)
- Lever definitions with min/max/step/unit for every lever
- Recommendation templates (the 10 templates from PRD Section 6)
- BASE_COOLING_POWER = 120
- BASE_INFERENCE_LATENCY = 45
- GPU_TDP = 700
- TOTAL_GPU_COUNT = 240
- RACKS = 10
- GPUS_PER_RACK = 24
- OVERHEAD_POWER = 45
- CONVERGENCE_FACTOR = 0.85

### Step 5: packages/shared/src/formulas.ts

Implement every pure formula function. Source: PRD Section 5 "Derived Metric Formulas."

Functions to implement:
- computePUE(totalFacilityPower, itEquipmentPower): number
- computeWUE(waterUsageRate, itEquipmentPower): number
- computeCUE(totalFacilityPower, itEquipmentPower, gridCarbonIntensity): number
- computeCarbonOutput(totalFacilityPower, gridCarbonIntensity, timeIntervalHours): number
- computeGpuIdlePowerWaste(gpuUtilization, activeGpuCount): number
- computeInferenceLatency(avgGpuTemp, queueDepth, batchSize): number
- computeCoolingPower(baseCoolingPower, ambientTemp, fanSpeedPercent, waterRecircMode): number
- computeWaterUsageRate(coolingPower, coolingSetpoint, ambientTemp, waterRecircMode): number
- computeITEquipmentPower(activeGpuCount, gpuPowerLimit, gpuUtilization): number
- computeBatchEfficiency(batchSize, gpuUtilization): number
- computeGpuTemperature(coolingSetpoint, gpuPowerLimit, gpuUtilization, ambientTemp): number
- computeRequestDropRate(requestVolume, requestRateLimit, activeGpuCount, gpuUtilization): number
- computeQueueDepth(requestVolume, activeGpuCount, gpuUtilization, batchSize): number
- determineHealthStatus(value, thresholds): HealthStatus — generic threshold evaluator
- computeCommunityBurden(locationState, waterUsageRate): CommunityBurden

Each function must:
1. Match the formula exactly as specified in PRD Section 5
2. Clamp outputs to valid ranges (e.g., PUE >= 1.0, utilization 0-1)
3. Accept the minimum required parameters (not the full state object)

### Step 6: Verify

Run `npx tsc --noEmit -p packages/shared/tsconfig.json` to verify no type errors. If TypeScript is not installed, that's fine — just ensure the code is syntactically correct and all exports are consistent.

## Output Quality Checklist

Before finishing, verify:
- [ ] Every interface from integration_contract.md Section 1 is exported from types.ts
- [ ] Every threshold from PRD Section 4 (all 5 layer tables) is in constants.ts
- [ ] Every formula from PRD Section 5 is in formulas.ts
- [ ] The seed state values in constants.ts match the GET /api/state example in integration_contract.md
- [ ] All lever definitions (min/max/step/unit) match PRD Section 4
- [ ] The barrel index.ts re-exports everything
- [ ] Root package.json has workspaces configured
- [ ] tsconfig.base.json exists with shared compiler options
- [ ] packages/shared/tsconfig.json extends base and has composite: true

Do NOT update docs/progress.md or docs/changelog.md — the integration agent handles that.
