# Product Requirements Document: AI Factory Digital Twin — Sustainability Operations Dashboard

**Version:** 1.0  
**Date:** April 12, 2026  
**Status:** Implementation-Ready  
**Hackathon:** ShiftSC AI Ethics Hackathon  

---

## 1. Executive Summary

The AI Factory Digital Twin is a simulated real-time operations dashboard that puts operators in control of a virtual AI data center, forcing them to confront the environmental and human costs of every operational decision. The product renders a live 3D digital twin of a mid-size AI data center (240 NVIDIA H100 GPUs in Oregon, USA), displays real-time simulated metrics across five infrastructure layers, surfaces AI-generated recommendations, and lets operators run what-if scenarios and commit actions — all while requiring explicit acknowledgment of ethical tradeoffs before any change takes effect. The problem being solved: AI infrastructure operators today optimize for uptime and throughput with minimal visibility into downstream sustainability consequences — water consumption, carbon emissions, community burden, and end-user quality degradation. This dashboard makes those invisible costs visible and non-dismissable. The target user is a senior AI factory operator responsible for balancing performance, cost, and sustainability. The product is unique because it embeds ethical accountability directly into the operational loop rather than relegating sustainability to a reporting afterthought. The hackathon winning strategy is to score maximum points on Ethical Impact & Responsibility (30%) by making ethics inseparable from the core interaction — every action requires tradeoff acknowledgment, every decision is logged as an accountability artifact, and community burden is always visible — while delivering polished technical execution through a visually striking 3D twin with smooth WebSocket-driven state updates.

---

## 2. User Persona

**Name:** Dana Reyes  
**Role:** Senior AI Infrastructure Operations Manager  
**Organization:** A mid-size AI company running inference and training workloads  

**Goals:**
- Maintain 99.9% uptime for AI inference services
- Keep PUE below 1.3 and WUE below 1.0 L/kWh
- Respond to infrastructure events within 5 minutes
- Minimize carbon emissions without degrading end-user experience
- Demonstrate compliance with internal sustainability targets to leadership

**Frustrations:**
- Sustainability dashboards are separate from operational dashboards, requiring context-switching
- No visibility into how a cooling change affects GPU utilization, which affects end-user latency
- AI-generated recommendations come without context on who bears the cost of following them
- Change history does not capture *why* a decision was made or what tradeoff was accepted

**Information Needs:**
- Current health of all five infrastructure layers at a glance (within 2 seconds of opening the dashboard)
- Drill-down into any layer's metrics with one click
- Clear indication of which metrics are trending toward warning/critical thresholds
- Immediate notification when any threshold is breached
- Understanding of end-user impact before committing any action

**Typical Session:**
Dana opens the dashboard at the start of her shift. She scans the 3D twin for any red or amber indicators. She notices the cooling layer is amber — water usage is elevated. She clicks the cooling layer to drill in, sees that ambient temperature has risen and the cooling system is compensating. She reviews the AI recommendation suggesting a cooling setpoint increase. She opens the what-if simulator to test the recommendation, observes that GPU temperatures would rise 4°C and inference latency would increase 12ms. She decides to accept a partial setpoint increase, acknowledges the tradeoff (slightly higher latency for 15% water savings), commits the action, and watches the 3D model animate the change. She checks the impact log to confirm the change is recorded with her tradeoff acknowledgment.

---

## 3. Core User Flows

### Flow 1: Operator Opens Dashboard and Monitors Live Twin State

1. Operator navigates to the dashboard URL.
2. The frontend establishes a WebSocket connection to the backend simulation engine.
3. The 3D digital twin renders in the center viewport showing the full data center layout: server racks in rows, cooling towers on the perimeter, power distribution units, and a geographic region indicator (Oregon, USA).
4. Each component in the 3D model displays its health state via color: green (healthy), amber (warning), red (critical). Components pulse gently at their health color.
5. The top metrics bar displays six key metrics with current values, trend arrows, and mini sparkline charts (last 60 ticks): PUE, WUE, CUE, GPU Utilization %, Carbon Output (kgCO2/hr), and Request Throughput (req/hr).
6. The left sidebar shows all five infrastructure layers as stacked cards. Each card shows the layer name, an aggregate health badge (green/amber/red), and the two most important metrics for that layer.
7. The simulation engine pushes state updates every 2 seconds via WebSocket. Each update causes smooth interpolation of metric values and 3D model states (no jarring jumps).
8. If all layers are green, the 3D model has a calm ambient animation: slow rack indicator lights blinking, gentle airflow particle effects around cooling towers.

### Flow 2: Alert Fires and Operator Investigates

1. The simulation engine detects a metric crossing a warning or critical threshold.
2. The backend emits an `alert:new` WebSocket event with the affected layer, metric name, current value, threshold breached, and severity level.
3. The frontend displays the alert in the right panel as a card with a colored left border (amber or red), timestamp, metric name, value, and a "View Layer" button.
4. Simultaneously, the affected component in the 3D model transitions to the new health color with an attention animation: a brief flash and an expanding ring effect.
5. An audio cue plays: a soft chime for warning, a sharper tone for critical.
6. The operator clicks "View Layer" or clicks the affected component in the 3D model.
7. The camera smoothly flies to focus on the affected layer's components (500ms ease-in-out transition).
8. The left sidebar expands to show the full detail view for that layer: all metrics with their current values, thresholds, sparklines, and any active recommendations.
9. The action/lever panel in the bottom right populates with the controllable levers for that layer.

### Flow 3: Operator Runs a What-If Scenario Simulation

1. The operator clicks the "Scenarios" tab in the right panel.
2. A list of available scenarios appears, each showing: name, description, affected layers (as colored badges), severity level, and a "Simulate" button.
3. The operator clicks "Simulate" on a scenario (e.g., "Heatwave Stress Event").
4. The dashboard enters simulation mode. A banner appears at the top: "SIMULATION MODE — Changes are not committed" in a distinct blue color (#3B82F6).
5. The 3D model dims slightly and gains a blue tint overlay to visually distinguish simulation from live state.
6. The simulation engine forks the current state and applies the scenario's effects over a compressed timeline (30 seconds of simulation time represents the scenario's full duration).
7. Metrics animate through the scenario's progression. The sparklines extend with projected values shown as dashed lines.
8. The recommendation engine generates contextual recommendations based on the scenario state.
9. The operator can adjust levers during simulation to test responses. Lever changes are reflected in the forked state only.
10. After the scenario completes (or the operator clicks "End Simulation"), a results summary overlay appears showing: peak metric values during scenario, total carbon emitted, total water consumed, end-user impact (latency increase, requests affected), and which levers were most effective.
11. The operator clicks "Exit Simulation" to return to live state. All simulation state is discarded.

### Flow 4: Operator Takes an Action and Commits It

1. The operator selects a layer (via sidebar click or 3D model click).
2. The action/lever panel shows available levers for that layer as sliders, toggles, or dropdown selectors.
3. The operator adjusts a lever (e.g., drags "Cooling Setpoint" from 22°C to 25°C).
4. A live preview appears next to the lever showing projected impact: "GPU Temp: +3.2°C | Water Savings: -18% | Latency Impact: +8ms".
5. The operator clicks "Commit Action".
6. The **Ethical Tradeoff Acknowledgment Modal** appears. This modal is non-skippable and contains:
   - **Header:** "Action Impact Acknowledgment"
   - **Action summary:** "Increase cooling setpoint from 22°C to 25°C"
   - **Tradeoff statement:** A dynamically generated sentence describing the tradeoff, e.g., "This action will reduce water consumption by approximately 18% but may increase inference latency by up to 8ms, affecting an estimated 640 requests per hour."
   - **Community burden note:** "The Umatilla County community, which hosts this data center's water supply, currently has a water stress index of 0.3 (low). This action reduces facility water draw by approximately 2,400 liters/day."
   - **Checkbox (required):** "I understand this tradeoff and accept responsibility for the impact on end users and the local community."
   - **Buttons:** "Confirm & Commit" (disabled until checkbox is checked) and "Cancel"
7. If the operator checks the box and clicks "Confirm & Commit":
   - A POST request is sent to `/api/actions` with the lever change and acknowledgment.
   - The backend applies the change to the simulation state.
   - The 3D model animates the change: cooling towers slow their rotation animation, ambient temperature visualization shifts warmer.
   - A success toast appears: "Action committed. Monitoring impact."
   - The change log records the action with the full tradeoff acknowledgment text and timestamp.
8. If the operator clicks "Cancel", the lever reverts to its previous value and no state change occurs.

### Flow 5: Operator Reviews Change History and Impact Log

1. The operator clicks the "History" tab in the right panel.
2. A reverse-chronological list of all committed actions appears. Each entry shows:
   - Timestamp
   - Action description (e.g., "Cooling setpoint: 22°C → 25°C")
   - Tradeoff acknowledgment text that was displayed
   - Outcome metrics at the time of commit and 5 minutes after commit
   - End-user impact: latency change, throughput change, affected request count
   - A color indicator: green if outcome matched projections, amber if worse than projected, red if significantly worse.
3. The operator can click any entry to expand it and see the full state snapshot at commit time.
4. A "Download Log" button exports the change log as a JSON file for external audit.
5. The change log is append-only and immutable — entries cannot be edited or deleted.

---

## 4. Infrastructure Layers Being Modeled

### Layer 1: Power & Energy

**Physical representation:** Power distribution units (PDUs), transformers, uninterruptible power supplies (UPS), and the facility's connection to the utility grid. Represents total facility power draw and its breakdown between IT equipment and overhead (cooling, lighting, networking).

**Key metrics:**

| Metric | Unit | Healthy | Warning | Critical |
|--------|------|---------|---------|----------|
| Total Facility Power | kW | < 900 | 900–1100 | > 1100 |
| IT Equipment Power | kW | < 750 | 750–900 | > 900 |
| PUE (Power Usage Effectiveness) | ratio | < 1.3 | 1.3–1.5 | > 1.5 |
| Grid Carbon Intensity | gCO2/kWh | < 200 | 200–400 | > 400 |
| Renewable Energy Fraction | % | > 60 | 40–60 | < 40 |

**Controllable levers:**

| Lever | Type | Min | Max | Step |
|-------|------|-----|-----|------|
| Power Cap (facility-wide) | slider | 600 kW | 1200 kW | 50 kW |
| Renewable Priority Mode | toggle | off | on | — |

**Power Cap** reduces total facility draw by throttling GPU power limits proportionally. **Renewable Priority Mode** shifts schedulable workloads to hours when renewable fraction is projected higher, at the cost of increased latency during low-renewable windows.

**Dependencies:**
- Increasing Power Cap → higher cooling demand (Layer 2) → higher water usage
- Decreasing Power Cap → lower GPU performance (Layer 3) → lower throughput (Layer 4)
- Grid Carbon Intensity changes (Layer 5) → direct impact on CUE and carbon output

**3D representation:** Two power distribution unit cabinets near the facility entrance. Color reflects PUE health. Animated electricity arc effects between PDU and server racks when power is high. When power cap is reduced, the arc effects dim and slow.

### Layer 2: Cooling & Water

**Physical representation:** Evaporative cooling towers on the facility perimeter, chilled water pipes running between towers and server rows, and Computer Room Air Handlers (CRAHs) mounted above rack rows.

**Key metrics:**

| Metric | Unit | Healthy | Warning | Critical |
|--------|------|---------|---------|----------|
| Cooling Setpoint | °C | 18–22 | 23–26 | > 26 |
| Water Usage Rate | liters/hr | < 800 | 800–1200 | > 1200 |
| WUE (Water Usage Effectiveness) | L/kWh | < 1.0 | 1.0–1.8 | > 1.8 |
| Ambient Temperature | °C | < 30 | 30–38 | > 38 |
| Coolant Supply Temperature | °C | < 18 | 18–24 | > 24 |

**Controllable levers:**

| Lever | Type | Min | Max | Step |
|-------|------|-----|-----|------|
| Cooling Setpoint | slider | 16°C | 30°C | 1°C |
| Fan Speed Override | slider | 40% | 100% | 5% |
| Water Recirculation Mode | toggle | off | on | — |

**Cooling Setpoint** controls the target air temperature in the server room. Lowering it uses more water and energy but keeps GPUs cooler. **Fan Speed Override** forces higher airflow at the cost of power draw. **Water Recirculation Mode** reduces fresh water intake by 30% but reduces cooling efficiency by 15%.

**Dependencies:**
- Raising Cooling Setpoint → higher GPU temperatures (Layer 3) → thermal throttling → lower utilization
- Higher Ambient Temperature (Layer 5 weather) → forces cooling to work harder → more water and power
- Higher Fan Speed → more power draw (Layer 1)

**3D representation:** Two cooling towers on the facility perimeter with spinning fan blades. Animated water particle effects flowing from towers to racks. Fan speed visually corresponds to the fan animation speed. Water particles become sparser when Water Recirculation Mode is on. Health color applied to the tower bodies and CRAH units above racks.

### Layer 3: GPU Fleet & Hardware

**Physical representation:** 10 server racks, each containing 24 NVIDIA H100 GPUs (240 total). Racks are arranged in two rows of five with a hot aisle / cold aisle configuration.

**Key metrics:**

| Metric | Unit | Healthy | Warning | Critical |
|--------|------|---------|---------|----------|
| Average GPU Temperature | °C | < 72 | 72–83 | > 83 |
| GPU Utilization Rate | % | > 70 | 50–70 | < 50 |
| Active GPU Count | count | 240 | 200–239 | < 200 |
| GPU Idle Power Waste | kW | < 30 | 30–60 | > 60 |
| Hardware Failure Rate | failures/day | 0 | 1–2 | > 2 |

**Controllable levers:**

| Lever | Type | Min | Max | Step |
|-------|------|-----|-----|------|
| GPU Power Limit | slider | 200 W | 700 W (H100 TDP) | 50 W |
| Graceful Rack Shutdown (per rack) | toggle | off | on | — |
| Thermal Throttle Threshold | slider | 75°C | 90°C | 1°C |

**GPU Power Limit** caps per-GPU power draw, reducing performance but also reducing heat and power consumption. **Graceful Rack Shutdown** takes an entire rack offline (24 GPUs), reducing capacity but improving efficiency if those GPUs were underutilized. **Thermal Throttle Threshold** sets the temperature at which GPUs automatically reduce clock speed.

**Dependencies:**
- Higher GPU Temperature (from Layer 2 changes) → automatic thermal throttling → reduced utilization
- Lower GPU Power Limit → reduced total IT power (Layer 1) → reduced cooling load (Layer 2)
- Fewer Active GPUs → reduced throughput capacity (Layer 4)

**3D representation:** 10 server rack units in two rows. Each rack has individual LED indicators (small colored dots on the rack face). Racks glow according to their aggregate GPU temperature: cool blue → green → amber → red. When a rack is gracefully shut down, its LEDs turn off and it dims to a dark gray. A heat haze particle effect rises from racks proportional to GPU temperature.

### Layer 4: Workload & Scheduling

**Physical representation:** This is a logical layer — it has no single physical component but is represented in the 3D model as a data flow visualization: animated particles flowing from an ingress point (representing incoming requests) through the server racks and out an egress point (representing responses).

**Key metrics:**

| Metric | Unit | Healthy | Warning | Critical |
|--------|------|---------|---------|----------|
| Request Volume | req/hr | < 10000 | 10000–14000 | > 14000 |
| Average Inference Latency | ms | < 100 | 100–200 | > 200 |
| Queue Depth | requests | < 50 | 50–200 | > 200 |
| Request Drop Rate | % | 0 | 0.1–1.0 | > 1.0 |
| Batch Efficiency | % | > 80 | 60–80 | < 60 |

**Controllable levers:**

| Lever | Type | Min | Max | Step |
|-------|------|-----|-----|------|
| Request Rate Limit | slider | 2000 req/hr | 16000 req/hr | 500 req/hr |
| Batch Size | slider | 1 | 64 | 1 |
| Priority Queue Weight (premium vs. free) | slider | 50/50 | 90/10 | 10 |

**Request Rate Limit** caps inbound traffic, preventing overload at the cost of dropping excess requests. **Batch Size** groups inference requests for GPU efficiency — larger batches improve throughput but increase per-request latency. **Priority Queue Weight** allocates GPU time between premium and free-tier users; higher premium weight means free-tier users experience longer latency.

**Dependencies:**
- Fewer Active GPUs (Layer 3) → higher queue depth → higher latency → potential request drops
- Higher Request Volume → higher GPU utilization (Layer 3) → higher power (Layer 1) → higher cooling demand (Layer 2)
- Rate limiting → reduced end-user access → ethical tradeoff

**3D representation:** Animated particle streams flowing from a blue ingress sphere on one side of the facility through the rack rows to a green egress sphere on the other side. Particle speed corresponds to latency (slower = higher latency). Particle density corresponds to request volume. When requests are dropped, particles turn red and fade out before reaching racks. Queue depth is visualized as a growing cluster of particles near the ingress point.

### Layer 5: Location & Grid

**Physical representation:** The geographic and environmental context of the data center. Represented in the 3D model as the ground plane and sky dome surrounding the facility.

**Key metrics:**

| Metric | Unit | Healthy | Warning | Critical |
|--------|------|---------|---------|----------|
| Ambient Temperature | °C | < 30 | 30–38 | > 38 |
| Grid Carbon Intensity | gCO2/kWh | < 200 | 200–400 | > 400 |
| Renewable Energy Fraction | % | > 60 | 40–60 | < 40 |
| Water Stress Index | ratio (0–1) | < 0.3 | 0.3–0.6 | > 0.6 |
| Local Air Quality Index | AQI | < 50 | 50–100 | > 100 |

**Controllable levers:**

This layer has no operator-controllable levers. Its metrics are driven by pre-scripted scenarios and the simulation's environmental drift model. The operator must react to this layer's changes by adjusting other layers.

**Dependencies:**
- Ambient Temperature → directly affects cooling load (Layer 2)
- Grid Carbon Intensity → directly affects carbon output and CUE (Layer 1)
- Renewable Energy Fraction → affects Renewable Priority Mode effectiveness (Layer 1)
- Water Stress Index → ethical weight of water consumption decisions (Layer 2)

**3D representation:** The ground plane color shifts from green (low stress) to brown (high stress) based on water stress index. The sky dome color shifts from blue (clean grid) to gray-brown (high carbon intensity). A sun/temperature indicator in the sky dome reflects ambient temperature. When a weather event scenario activates, the sky dome animates dramatically (e.g., heatwave: intense orange sky, visible heat shimmer).

---

## 5. Simulation Engine Specification

### State Model

The simulation state is a single JSON object holding the complete twin state. It is held in memory on the backend server and pushed to connected clients on every tick.

```typescript
interface SimulationState {
  tick: number;                        // monotonically increasing tick counter
  timestamp: string;                   // ISO 8601 simulated time
  simulatedTimeSeconds: number;        // total simulated seconds since start
  mode: 'live' | 'simulation';        // whether a what-if is active
  layers: {
    power: PowerLayerState;
    cooling: CoolingLayerState;
    gpu: GPULayerState;
    workload: WorkloadLayerState;
    location: LocationLayerState;
  };
  derivedMetrics: DerivedMetrics;
  activeScenario: string | null;       // scenario ID if active
  activeAlerts: Alert[];
  activeRecommendations: Recommendation[];
}
```

### Tick Rate

The simulation updates every **2 seconds** (0.5 Hz tick rate). Each tick:

1. Advance simulated time by a configurable interval (default: 5 minutes of simulated time per tick, giving 150 minutes of simulated operations per real-time hour).
2. Apply environmental drift to Location layer metrics (small random perturbations within defined bounds).
3. Apply degradation patterns to hardware metrics (GPU temperatures drift upward by 0.01–0.05°C per tick under load).
4. Check for active scenario events and apply their effects at the appropriate simulated time.
5. Propagate layer interdependencies (see dependency formulas below).
6. Recalculate all derived metrics.
7. Check all thresholds and generate alerts for any new breaches.
8. Evaluate recommendation trigger conditions and generate new recommendations.
9. Emit `state:update` WebSocket event with the full updated state.

### Metric Evolution Without Operator Intervention

**Drift model:** Each metric has a baseline value, a drift direction, a drift magnitude, and noise:

```
metric_new = metric_current + (drift_direction × drift_magnitude) + random(-noise, +noise)
```

| Metric | Drift Direction | Drift Magnitude/tick | Noise Range |
|--------|----------------|---------------------|-------------|
| Ambient Temperature | +0.1°C/tick (daytime), -0.05°C/tick (nighttime) | based on time-of-day | ±0.3°C |
| GPU Temperature | +0.02°C/tick (under load) | proportional to utilization | ±0.1°C |
| Grid Carbon Intensity | sinusoidal (peaks midday) | amplitude 50 gCO2/kWh | ±10 gCO2/kWh |
| Request Volume | +50 req/hr/tick (business hours), -30 (off-peak) | based on simulated time-of-day | ±100 req/hr |
| Water Stress Index | stable | 0 | ±0.01 |

**Degradation patterns:** Without maintenance, GPU temperatures trend upward slowly (0.02°C/tick). If a GPU rack exceeds 85°C for 10 consecutive ticks, one GPU in that rack fails (Active GPU Count decreases by 1, Hardware Failure Rate increases).

**Recovery patterns:** After an operator action (e.g., lowering cooling setpoint), the affected metrics converge toward their new equilibrium exponentially: `value_new = value_target + (value_current - value_target) × 0.85`. This means 85% of the remaining gap closes each tick, producing a smooth asymptotic approach.

### Scenario Event Injection

Pre-scripted scenarios are defined as a sequence of timed events. When a scenario activates (manually or by threshold trigger), the engine inserts the scenario's event sequence into the tick loop:

```typescript
interface ScenarioEvent {
  tickOffset: number;          // ticks after scenario activation
  layerAffected: string;       // which layer state to modify
  metricAffected: string;      // which metric within the layer
  operation: 'set' | 'add' | 'multiply';
  value: number;
  durationTicks: number;       // how many ticks this effect persists
}
```

Events are processed in order. Multiple events can fire on the same tick. Effects are additive (they layer on top of normal drift). When an event's duration expires, its effect is removed and the metric returns to drift-driven behavior.

### Operator Action Effects

When an operator commits a lever change:

1. The lever's current value in the state is updated immediately.
2. Dependent metrics begin converging toward their new equilibrium using the exponential convergence formula (85% per tick).
3. The dependency graph is traversed to propagate secondary effects.

### Derived Metric Formulas

All formulas use the following variables from the layer states:

| Variable | Source | Unit |
|----------|--------|------|
| `totalFacilityPower` | Power layer: sum of IT power + cooling power + overhead | kW |
| `itEquipmentPower` | Power layer: sum of all GPU power draw | kW |
| `totalWaterUsed` | Cooling layer: water usage rate × simulated time interval | liters |
| `gridCarbonIntensity` | Location layer | gCO2/kWh |
| `gpuUtilization` | GPU layer: average across all active GPUs | ratio (0–1) |
| `totalGpuTDP` | Constant: 700W per H100 | W |
| `activeGpuCount` | GPU layer | count |
| `timeIntervalHours` | Simulated time per tick converted to hours | hours |

**PUE:**
```
PUE = totalFacilityPower / itEquipmentPower
```
Healthy range: 1.0–1.3. A PUE of 1.0 means all power goes to compute (impossible in practice). Typical target: 1.2.

**WUE:**
```
WUE = totalWaterUsed / (itEquipmentPower × timeIntervalHours)
```
Unit: L/kWh. Calculated per tick using the tick's water usage and energy.

**CUE:**
```
CUE = (totalFacilityPower × timeIntervalHours × gridCarbonIntensity) / (itEquipmentPower × timeIntervalHours × 1000)
```
Simplified: `CUE = (totalFacilityPower × gridCarbonIntensity) / (itEquipmentPower × 1000)`
Unit: kgCO2/kWh (the ×1000 converts gCO2 to kgCO2).

**Carbon Output:**
```
carbonOutput = totalFacilityPower × gridCarbonIntensity × timeIntervalHours / 1000
```
Unit: kgCO2 per tick interval.

**GPU Idle Power Waste:**
```
gpuIdlePowerWaste = (1 - gpuUtilization) × totalGpuTDP × activeGpuCount / 1000
```
Unit: kW. Represents power consumed by GPUs not doing useful work.

**Inference Latency Model:**
```
baseLatency = 45  // ms, base inference time at optimal conditions
temperaturePenalty = max(0, (avgGpuTemp - 72) × 2.5)  // ms per °C above 72
queuePenalty = queueDepth × 0.8  // ms per queued request
batchPenalty = (batchSize - 1) × 1.2  // ms per additional batch item
inferenceLatency = baseLatency + temperaturePenalty + queuePenalty + batchPenalty
```

**Cooling Power Model:**
```
coolingPower = baseCoolingPower × (1 + (ambientTemp - 20) × 0.04) × (fanSpeedPercent / 100) × (waterRecircMode ? 1.15 : 1.0)
```
Where `baseCoolingPower` = 120 kW.

**Layer Interdependency Propagation Order:**

1. Location → Cooling (ambient temperature affects cooling load)
2. Cooling → GPU (cooling setpoint affects GPU temperatures)
3. GPU → Workload (GPU availability and temperature affect throughput and latency)
4. Workload → GPU → Power (workload volume affects GPU utilization affects power draw)
5. Power + Cooling → Derived metrics (PUE, WUE, CUE, carbon output)

### Pre-scripted Scenario List

See Section 10 for complete definitions. Summary:

1. Heatwave Stress Event
2. Demand Spike / Traffic Surge
3. Grid Carbon Intensity Spike
4. GPU Fleet Degradation
5. Water Scarcity Alert

---

## 6. Mocked AI Recommendation Engine

### Recommendation Data Model

```typescript
interface Recommendation {
  id: string;                          // UUID
  timestamp: string;                   // ISO 8601
  severity: 'info' | 'warning' | 'critical';
  layerAffected: string;              // 'power' | 'cooling' | 'gpu' | 'workload' | 'location'
  triggerCondition: string;           // human-readable condition that fired
  title: string;                      // short recommendation title
  body: string;                       // full recommendation text
  suggestedAction: {
    lever: string;                    // which lever to adjust
    suggestedValue: number;           // recommended new value
    currentValue: number;             // current value for context
  };
  projectedImpact: {
    metricChanges: Array<{ metric: string; currentValue: number; projectedValue: number; unit: string }>;
    endUserImpact: string;            // human-readable end-user impact summary
    communityImpact: string;          // human-readable community impact summary
  };
  status: 'active' | 'dismissed' | 'acted_on';
  dismissedAt: string | null;
  actedOnAt: string | null;
  confidenceNote: string;             // ethics: reminder that this is AI-generated
}
```

### Trigger Conditions and Recommendation Templates

| # | Condition | Severity | Title | Body Template |
|---|-----------|----------|-------|---------------|
| 1 | PUE > 1.3 for 5+ ticks | warning | "Elevated PUE Detected" | "PUE has remained above 1.3 for the past {duration}. Consider reducing GPU power limits by {amount}W to decrease total facility power draw. Projected PUE improvement: {delta}. Note: This will reduce maximum inference throughput by approximately {pct}%." |
| 2 | PUE > 1.5 for 3+ ticks | critical | "Critical PUE — Immediate Action Recommended" | "PUE has exceeded 1.5, indicating significant energy waste. Recommend immediately enabling Renewable Priority Mode and reducing Power Cap to {value}kW. Without intervention, carbon output will exceed {amount} kgCO2/hr." |
| 3 | WUE > 1.0 for 5+ ticks | warning | "Water Efficiency Below Target" | "WUE has exceeded 1.0 L/kWh. Consider raising the cooling setpoint by {amount}°C or enabling Water Recirculation Mode. Projected water savings: {liters} liters/hr. GPU temperatures may increase by approximately {delta}°C." |
| 4 | WUE > 1.8 for 3+ ticks | critical | "Critical Water Usage" | "Water usage is critically high at {value} L/kWh. Immediate intervention required. Recommend enabling Water Recirculation Mode and raising cooling setpoint to {value}°C. The local community water stress index is {wsi} — continued high usage increases community burden." |
| 5 | Avg GPU Temp > 78°C for 5+ ticks | warning | "GPU Fleet Running Hot" | "Average GPU temperature has exceeded 78°C. Consider lowering the thermal throttle threshold to {value}°C or increasing fan speed to {pct}%. Extended high temperatures increase hardware failure probability by approximately {pct}%." |
| 6 | Avg GPU Temp > 83°C for 2+ ticks | critical | "Critical GPU Temperatures — Throttling Imminent" | "GPUs are approaching thermal shutdown thresholds. Recommend immediately reducing GPU power limits to {value}W and lowering cooling setpoint to {value}°C. Failure to act may result in hardware damage and service degradation." |
| 7 | GPU Utilization < 50% for 10+ ticks | info | "Low GPU Utilization — Consolidation Opportunity" | "GPU utilization has been below 50% for an extended period. Consider gracefully shutting down {count} underutilized racks to reduce idle power waste by approximately {amount}kW. This would save {carbon} kgCO2/hr at current grid carbon intensity." |
| 8 | Request Drop Rate > 0.5% | warning | "Requests Being Dropped" | "The request drop rate has exceeded 0.5%. Consider increasing the Request Rate Limit to {value} req/hr or reducing Batch Size to {value} to improve throughput. Approximately {count} end-user requests are being lost per hour." |
| 9 | Request Drop Rate > 2% | critical | "Significant Service Degradation" | "More than 2% of requests are being dropped. Immediate action needed: ensure all GPU racks are online, reduce batch size, and verify cooling is maintaining safe GPU temperatures. {count} end users are currently unable to access services." |
| 10 | Grid Carbon Intensity > 400 for 3+ ticks | warning | "High Grid Carbon Intensity" | "Grid carbon intensity has exceeded 400 gCO2/kWh. Consider enabling Renewable Priority Mode and deferring non-critical batch workloads. Current carbon output: {value} kgCO2/hr. Shifting {pct}% of workload to off-peak hours could reduce emissions by {amount} kgCO2." |

### Recommendation Lifecycle

1. **Generated:** The engine evaluates conditions on every tick. If a condition is newly met (was not met on previous tick), a recommendation is created and emitted via `recommendation:new` WebSocket event.
2. **Active:** The recommendation appears in the right panel. The operator can read it, dismiss it, or act on it.
3. **Dismissed:** Operator clicks "Dismiss". The recommendation moves to `dismissed` status with a timestamp. It still appears in the history log.
4. **Acted On:** Operator adjusts the suggested lever. The engine detects the lever change matches the recommendation's suggested action (within 20% tolerance). The recommendation moves to `acted_on` status.
5. **Resolved:** If the trigger condition is no longer met (e.g., PUE drops below 1.3), the recommendation auto-resolves. It remains in the log.

### Ethics Commentary

Every recommendation object includes a `confidenceNote` field. This field always contains the text: *"This recommendation is generated by a rule-based simulation engine. In a production system, AI-generated recommendations carry model uncertainty and may reflect biases in training data. Always apply human judgment before acting on automated suggestions."*

This exists to reinforce the principle that AI recommendations are decision support, not decision makers. The UI displays this note in a muted font below each recommendation body.

---

## 7. 3D Model Specification

### Technology Choice

**Three.js via React Three Fiber (@react-three/fiber).** Justification:

1. React Three Fiber integrates seamlessly with the React frontend — 3D components are React components, enabling shared state and reactive updates without manual imperative synchronization.
2. Three.js has the largest WebGL ecosystem, extensive documentation, and wide browser support.
3. @react-three/drei provides pre-built helpers (OrbitControls, Float, Text, Glow effects) that accelerate development.
4. Performance is sufficient for the target scene complexity (see constraints below).
5. No dependency on paid or licensed game engines.

### Scene Layout

The data center is viewed from a 3/4 isometric perspective. The scene measures approximately 40 × 30 × 15 (arbitrary units). Layout:

```
+--------------------------------------------------+
|                   SKY DOME                         |
|  [Sun/Temp]                                        |
|                                                    |
|  [Cooling Tower A]              [Cooling Tower B]  |
|       |                               |            |
|  +---------+---------+---------+---------+-------+ |
|  | Rack 1  | Rack 2  | Rack 3  | Rack 4  | Rack 5 |
|  |         |         |         |         |        ||
|  +---------+---------+---------+---------+-------+ |
|  |                 HOT AISLE                      | |
|  +---------+---------+---------+---------+-------+ |
|  | Rack 6  | Rack 7  | Rack 8  | Rack 9  | Rack10||
|  |         |         |         |         |        ||
|  +---------+---------+---------+---------+-------+ |
|       |                                    |       |
|  [PDU A]  [Ingress]            [Egress]  [PDU B]  |
|                                                    |
|  [Region Label: Oregon, USA]                       |
+--------------------------------------------------+
```

### Rendered Components

| Component | Count | Geometry | Approx. Polygons |
|-----------|-------|----------|-------------------|
| Server Rack | 10 | Box with detail panels, LED strips | 200 each |
| Cooling Tower | 2 | Cylinder with fan blade disc on top | 300 each |
| PDU Cabinet | 2 | Box with panel lines | 100 each |
| CRAH Unit | 10 | Flat box above each rack | 50 each |
| Ingress Sphere | 1 | Sphere (low-poly) | 100 |
| Egress Sphere | 1 | Sphere (low-poly) | 100 |
| Ground Plane | 1 | Plane | 2 |
| Sky Dome | 1 | Hemisphere | 200 |
| Network cables | 10 | Line segments between racks | 20 each |
| **Total static** | — | — | **~3,500** |

Particle systems (data flow, water, heat haze) add approximately 500–2,000 transient points. Total scene budget: under 10,000 polygons. This ensures 60fps on integrated GPUs.

### Health State Visual Communication

| Health State | Color (Hex) | Glow Color (Hex) | Animation |
|--------------|-------------|-------------------|-----------|
| Healthy | #22C55E | #4ADE80 | Gentle pulse: opacity oscillates 0.8–1.0 over 2s, ease-in-out |
| Warning | #F59E0B | #FBBF24 | Moderate pulse: opacity 0.7–1.0 over 1.5s, ease-in-out |
| Critical | #EF4444 | #F87171 | Rapid pulse: opacity 0.6–1.0 over 0.8s, ease-in-out, plus expanding ring effect every 3s |

Components transition between health states over 500ms using a color lerp.

### Reaction to Operator Actions

| Lever | 3D Animation |
|-------|-------------|
| Cooling Setpoint increase | Cooling tower fan blades slow rotation. Water particles become sparser. CRAH units dim slightly. |
| Cooling Setpoint decrease | Fan blades speed up. Water particles become denser and faster. |
| Fan Speed Override change | Fan blade rotation speed directly maps to fan speed percentage. |
| Water Recirculation Mode on | Water particles change from blue to cyan and form a visible loop pattern. |
| GPU Power Limit decrease | Rack LED brightness dims proportionally. Heat haze particles reduce. |
| Graceful Rack Shutdown | Target rack LEDs turn off sequentially (100ms per LED). Rack model fades to 30% opacity over 1s. |
| Power Cap decrease | Electricity arc effects between PDUs and racks dim and slow. |
| Request Rate Limit decrease | Data flow particle density decreases proportionally. |
| Batch Size increase | Data flow particles clump into groups instead of individual streams. |

### Camera Behavior

- **Default view:** 3/4 isometric, positioned at (25, 20, 25) looking at (0, 0, 0). OrbitControls enabled with constrained polar angle (20°–80°) and zoom limits (distance 15–50).
- **Click-to-focus:** Clicking a layer's component or clicking a layer card in the sidebar smoothly animates the camera to focus on that layer's primary component(s) over 800ms using ease-in-out. The camera orbits slightly (10° rotation) during the fly-in for visual interest.
- **Scenario flythrough:** When a scenario activates, the camera briefly (2s) pulls back to show the full facility, then slowly orbits as the scenario plays out.
- **Simulation mode:** Camera gains a slight blue-tinted post-processing effect (via @react-three/postprocessing or a simple CSS filter on the canvas).

### Performance Constraints

- Maximum polygon count: 10,000 (static geometry)
- Maximum particle count: 2,000 concurrent
- Target frame rate: 60fps on Chrome (desktop, integrated GPU)
- Canvas resolution: match device pixel ratio up to 2x
- No real-time shadows (use baked ambient occlusion via simple darkened ground areas)
- No physically-based rendering — use MeshStandardMaterial with emissive for glow effects

---

## 8. Frontend Architecture

### Framework and Libraries

- **React 18** with TypeScript (strict mode)
- **React Three Fiber** (@react-three/fiber) for 3D rendering
- **@react-three/drei** for camera controls, text, glow effects
- **Zustand** for state management (lightweight, no boilerplate, supports WebSocket-driven updates)
- **Tailwind CSS** for layout and styling
- **Recharts** for metric sparklines and charts
- **Framer Motion** for UI panel animations and transitions

### State Management

Zustand store with the following slices:

```typescript
interface DashboardStore {
  // Simulation state (updated via WebSocket)
  simulationState: SimulationState | null;
  
  // UI state
  selectedLayer: string | null;           // which layer is focused
  mode: 'live' | 'simulation';           // mirrors simulation mode
  activePanel: 'recommendations' | 'scenarios' | 'history';
  
  // Actions
  setSimulationState: (state: SimulationState) => void;
  selectLayer: (layer: string | null) => void;
  setMode: (mode: 'live' | 'simulation') => void;
  setActivePanel: (panel: string) => void;
}
```

The WebSocket connection is managed by a custom React hook (`useSimulationSocket`) that connects on mount, handles reconnection with exponential backoff (1s, 2s, 4s, max 30s), and calls `setSimulationState` on every `state:update` event.

### Dashboard Layout

```
+------+------------------------------------------+------------+
|      |          METRICS TOP BAR (h: 64px)        |            |
|      +------------------------------------------+            |
|      |                                          | RECOMMEND  |
| LAYER|                                          | & ALERT    |
| SIDE |          3D TWIN VIEWPORT                | PANEL      |
| BAR  |          (primary, fills remaining)       | (w: 320px) |
|      |                                          |            |
|(w:   |                                          |            |
| 280px|                                          |            |
|      |                                          +------------+
|      |                                          | ACTION     |
|      |                                          | PANEL      |
|      |                                          | (h: 280px) |
+------+------------------------------------------+------------+
```

- **Total minimum viewport:** 1280 × 720
- **Layer sidebar:** fixed 280px width, full height minus top bar
- **Top metrics bar:** full width, 64px height
- **Right panel:** fixed 320px width, split vertically between recommendation/alert panel (top, flexible height) and action/lever panel (bottom, 280px)
- **3D viewport:** fills remaining space

The layout is fixed (not responsive). A minimum-width CSS rule prevents rendering below 1280px. If the viewport is too small, a message instructs the user to resize.

### UI Panel Details

**Panel 1: 3D Twin Viewport**
- React Three Fiber Canvas filling the center area
- Transparent background showing the application's dark theme behind
- Overlaid in the top-left corner: a simulation mode indicator badge (only visible in simulation mode)

**Panel 2: Layer Health Sidebar (Left)**
- Five stacked cards, one per layer
- Each card: 56px height, contains layer icon (emoji), layer name, aggregate health badge (colored circle), two key metric values
- Click a card to select that layer (highlights with a left border in the layer's health color)
- Selected layer card expands to show all metrics with sparklines
- Scrollable if expanded card exceeds sidebar height

**Panel 3: Metrics Dashboard (Top Bar)**
- Six metric tiles in a horizontal row
- Each tile: metric name, current value (large text), unit, trend arrow (↑↓→), and a 60-tick sparkline (50px wide, 24px tall)
- Metric values animate on update using CSS transitions (200ms)

**Panel 4: Recommendation & Alert Panel (Right Top)**
- Three tabs: "Alerts", "Scenarios", "History"
- **Alerts tab:** Reverse-chronological list of alerts and recommendations. Each item has a colored left border (severity), timestamp, title, and expandable body. Recommendations have "Dismiss" and "Apply" buttons.
- **Scenarios tab:** List of available scenarios with "Simulate" buttons. Active scenario shows progress bar.
- **History tab:** Reverse-chronological change log entries.

**Panel 5: Action/Lever Panel (Right Bottom)**
- Appears when a layer is selected
- Shows the selected layer's name and available levers
- Each lever rendered as: label, current value, slider/toggle, projected impact text
- "Commit Action" button at the bottom, styled as a prominent button (#3B82F6 background)

### Color System

**Background and chrome:**
- Dashboard background: `#0F172A` (slate-900)
- Panel backgrounds: `#1E293B` (slate-800)
- Panel borders: `#334155` (slate-700)
- Text primary: `#F8FAFC` (slate-50)
- Text secondary: `#94A3B8` (slate-400)

**Health state colors:**

| State | Normal | Glow/Emphasis | Background (10% opacity) |
|-------|--------|---------------|--------------------------|
| Healthy | `#22C55E` | `#4ADE80` | `rgba(34, 197, 94, 0.1)` |
| Warning | `#F59E0B` | `#FBBF24` | `rgba(245, 158, 11, 0.1)` |
| Critical | `#EF4444` | `#F87171` | `rgba(239, 68, 68, 0.1)` |

**Simulation mode accent:** `#3B82F6` (blue-500)

**Severity badge colors:**
- Info: `#6366F1` (indigo-500)
- Warning: `#F59E0B` (amber-500)
- Critical: `#EF4444` (red-500)

### Animation Specifications

| Animation | Duration | Easing | Details |
|-----------|----------|--------|---------|
| Metric value change | 200ms | ease-out | CSS transition on the value text |
| Health color transition | 500ms | ease-in-out | Three.js color lerp |
| Camera fly-to-layer | 800ms | cubic-bezier(0.4, 0, 0.2, 1) | Position and target interpolation |
| Panel expand/collapse | 300ms | ease-in-out | Framer Motion height animation |
| Alert card enter | 400ms | ease-out | Slide in from right + fade in |
| Modal appear | 200ms | ease-out | Fade in + scale from 0.95 to 1.0 |
| Toast notification | 300ms in, 200ms out | ease-out / ease-in | Slide in from top right, auto-dismiss after 4s |
| Simulation mode overlay | 500ms | ease-in-out | Blue tint fades in on 3D canvas |

### Ethical Tradeoff Acknowledgment Modal

**Trigger:** Fires every time the operator clicks "Commit Action" on any lever change.

**Layout:**
```
+--------------------------------------------------+
|  ⚠ Action Impact Acknowledgment            [X]  |
+--------------------------------------------------+
|                                                    |
|  ACTION:                                           |
|  [Dynamic: e.g., "Increase cooling setpoint        |
|   from 22°C to 25°C"]                              |
|                                                    |
|  TRADEOFF:                                         |
|  [Dynamic: e.g., "This action will reduce water    |
|   consumption by ~18% but may increase inference    |
|   latency by up to 8ms, affecting ~640 req/hr."]   |
|                                                    |
|  COMMUNITY IMPACT:                                 |
|  [Dynamic: community burden statement with          |
|   geographic specifics]                             |
|                                                    |
|  END USER IMPACT:                                  |
|  [Dynamic: which user segments are affected,        |
|   estimated latency/quality changes]               |
|                                                    |
|  +-----------------------------------------------+|
|  | ☐ I understand this tradeoff and accept       ||
|  |   responsibility for the impact on end users   ||
|  |   and the local community.                     ||
|  +-----------------------------------------------+|
|                                                    |
|  [ Cancel ]            [ Confirm & Commit ]        |
|                         (disabled until checked)   |
+--------------------------------------------------+
```

**Behavior:**
- The [X] close button and "Cancel" both cancel the action. The lever reverts.
- Clicking outside the modal does nothing (modal is blocking).
- The checkbox is unchecked by default. "Confirm & Commit" is visually disabled (grayed out) until checked.
- The operator cannot bypass this modal. There is no "don't show again" option.
- When "Confirm & Commit" is clicked, the full text of the tradeoff, community impact, and end-user impact statements are included in the ChangeLogEntry.

---

## 9. Backend Architecture

### Runtime

Node.js 20 LTS with TypeScript (strict mode). Single server process. No clustering needed for hackathon scale.

### Dependencies

- `express` — HTTP server
- `ws` — WebSocket server
- `uuid` — ID generation
- `typescript`, `tsx` — runtime

### API Design

**Base URL:** `/api`

#### REST Endpoints

**GET /api/state**
Returns the current simulation state.

```typescript
// Response 200
interface StateResponse {
  state: SimulationState;
}
```

**GET /api/scenarios**
Returns available scenario definitions.

```typescript
// Response 200
interface ScenariosResponse {
  scenarios: ScenarioDefinition[];
}
```

**POST /api/scenarios/:id/activate**
Activates a scenario by ID.

```typescript
// Request body
interface ActivateScenarioRequest {
  mode: 'live' | 'simulation';  // 'simulation' for what-if, 'live' for applying to real state
}

// Response 200
interface ActivateScenarioResponse {
  success: boolean;
  scenarioId: string;
  estimatedDurationTicks: number;
}

// Response 404
{ error: "Scenario not found" }

// Response 409
{ error: "Another scenario is already active" }
```

**POST /api/actions**
Commits an operator action.

```typescript
// Request body
interface CommitActionRequest {
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    acknowledged: true;  // must be true
  };
}

// Response 200
interface CommitActionResponse {
  success: boolean;
  changeLogEntryId: string;
  projectedImpact: {
    metricChanges: Array<{ metric: string; projectedValue: number }>;
  };
}

// Response 400
{ error: "Tradeoff acknowledgment required" }
```

**GET /api/logs**
Returns the change history.

```typescript
// Query parameters: ?limit=50&offset=0
// Response 200
interface LogsResponse {
  entries: ChangeLogEntry[];
  total: number;
}
```

**GET /api/recommendations**
Returns active recommendations.

```typescript
// Response 200
interface RecommendationsResponse {
  recommendations: Recommendation[];
}
```

**POST /api/recommendations/:id/dismiss**
Dismisses a recommendation.

```typescript
// Response 200
{ success: true, recommendationId: string }

// Response 404
{ error: "Recommendation not found" }
```

### Simulation Loop

The simulation runs as a `setInterval` on the backend at 2000ms intervals. The loop:

```typescript
setInterval(() => {
  state.tick += 1;
  state.simulatedTimeSeconds += SIMULATED_SECONDS_PER_TICK; // 300 (5 min)
  state.timestamp = new Date(baseTime + state.simulatedTimeSeconds * 1000).toISOString();
  
  applyEnvironmentalDrift(state);
  applyScenarioEvents(state);
  propagateLayerDependencies(state);
  recalculateDerivedMetrics(state);
  evaluateAlerts(state);
  evaluateRecommendations(state);
  
  broadcastToClients({ event: 'state:update', data: state });
}, 2000);
```

### WebSocket Specification

**Connection:** `ws://[host]:3001/ws`

**Server → Client Events:**

| Event | Payload | When |
|-------|---------|------|
| `state:update` | Full `SimulationState` object | Every tick (2s) |
| `alert:new` | `Alert` object | When a new threshold breach is detected |
| `recommendation:new` | `Recommendation` object | When a new recommendation triggers |
| `scenario:progress` | `{ scenarioId: string, ticksElapsed: number, totalTicks: number, phase: string }` | Every tick during active scenario |
| `action:confirmed` | `{ changeLogEntryId: string, success: true }` | After an action is committed |

**Client → Server Events:**

The client communicates exclusively via REST endpoints. WebSocket is server-push only.

### Data Persistence

For the hackathon prototype, persistence is in-memory. Two arrays hold historical data:

```typescript
const changeLog: ChangeLogEntry[] = [];     // append-only
const alertHistory: Alert[] = [];           // append-only
const recommendationHistory: Recommendation[] = [];
```

These arrays persist for the lifetime of the server process. If the server restarts, history is lost. This is acceptable for a hackathon demo. The change log is downloadable as JSON via the frontend.

### Seed Data

See Section 16 for the complete initial state JSON.

---

## 10. Pre-scripted Scenarios

### Scenario 1: Heatwave Stress Event

**Name:** Heatwave Stress Event  
**Description:** An extreme heatwave drives ambient temperature to 42°C over 20 ticks, overwhelming the cooling system and stressing GPUs.

**Trigger:** Manual selection from the Scenarios panel, or automatic if Ambient Temperature exceeds 35°C for 5 consecutive ticks.

**Affected layers:** Location, Cooling, GPU, Power

**Metric changes over time:**

| Tick Offset | Ambient Temp (°C) | Coolant Supply Temp (°C) | Avg GPU Temp (°C) | Water Usage (L/hr) | Cooling Power (kW) |
|-------------|-------------------|--------------------------|--------------------|---------------------|---------------------|
| 0 | 28 (current) | 16 | 68 | 650 | 120 |
| 5 | 33 | 19 | 73 | 900 | 145 |
| 10 | 38 | 22 | 79 | 1100 | 168 |
| 15 | 42 | 25 | 84 | 1350 | 190 |
| 20 | 42 (plateau) | 26 | 86 | 1400 | 195 |

**Recommendations that fire:**
- Tick 5: "GPU Fleet Running Hot" (warning)
- Tick 10: "Water Efficiency Below Target" (warning) and "Elevated PUE Detected" (warning)
- Tick 15: "Critical GPU Temperatures" (critical) and "Critical Water Usage" (critical)

**Available levers:**
- Cooling Setpoint (lower to compensate — costs more water and power)
- Fan Speed Override (increase — costs more power)
- GPU Power Limit (decrease — reduces heat generation, reduces performance)
- Graceful Rack Shutdown (take racks offline to reduce heat load)
- Request Rate Limit (reduce inbound traffic to reduce GPU load)

**3D model visual effects:**
- Sky dome transitions from blue to intense orange/red over 20 ticks
- Heat shimmer particle effects intensify around facility
- Cooling tower fan blades visibly speed up as the system compensates
- Server racks transition from green to amber to red
- Heat haze above racks intensifies

**Resolution:** The operator must reduce GPU load (lower power limits or shut down racks) and increase cooling (lower setpoint, increase fan speed). A balanced response: lower GPU power limit to 400W, increase fan speed to 90%, and reduce request rate limit to 6000 req/hr. This brings GPU temperatures below 80°C within 10 ticks of action.

**End user impact:** During peak stress, inference latency increases from 55ms to 180ms. If the operator rate-limits, approximately 2,000 requests/hr are dropped. Premium users are unaffected if Priority Queue Weight is set to 80/20.

**Ethical dimension:** The operator must choose between water conservation (community resource in a heatwave when residential demand is also high) and service quality (end users depend on the AI service). The heatwave makes water a scarce community resource, and the data center is consuming more of it precisely when the community needs it most.

### Scenario 2: Demand Spike / Traffic Surge

**Name:** Demand Spike  
**Description:** A viral event causes request volume to triple over 10 ticks, overwhelming GPU capacity and creating queuing delays.

**Trigger:** Manual selection, or automatic if Request Volume exceeds 12,000 req/hr for 3 consecutive ticks.

**Affected layers:** Workload, GPU, Power, Cooling

**Metric changes over time:**

| Tick Offset | Request Volume (req/hr) | Queue Depth | GPU Utilization (%) | Avg GPU Temp (°C) | Inference Latency (ms) |
|-------------|-------------------------|-------------|---------------------|---------------------|------------------------|
| 0 | 8000 | 10 | 72 | 68 | 55 |
| 3 | 12000 | 80 | 88 | 74 | 95 |
| 6 | 18000 | 250 | 96 | 80 | 180 |
| 10 | 24000 | 500+ | 99 | 84 | 350+ |

**Recommendations that fire:**
- Tick 3: "Requests Being Dropped" (warning)
- Tick 6: "Critical GPU Temperatures" (critical), "Significant Service Degradation" (critical)
- Tick 8: "Elevated PUE Detected" (warning)

**Available levers:**
- Request Rate Limit (cap traffic)
- Batch Size (increase for throughput at latency cost)
- Priority Queue Weight (prioritize premium users)
- GPU Power Limit (increase to max for more performance)
- Power Cap (increase to allow more total power)

**3D model visual effects:**
- Ingress sphere grows larger and pulses rapidly
- Data flow particle density dramatically increases, particles moving faster
- Particles begin turning red and fading (dropped requests)
- Queue cluster near ingress grows visibly
- GPU racks transition to amber/red as temperatures rise

**Resolution:** The operator must rate-limit to a sustainable level (~10,000 req/hr), increase batch size to 32 for efficiency, and increase Priority Queue Weight to 80/20 to protect premium users. Full recovery within 8 ticks of action.

**End user impact:** At peak, 67% of free-tier requests are dropped or experience >5s latency. Premium users see latency increase from 55ms to 120ms.

**Ethical dimension:** The operator must decide who gets degraded service. Increasing Priority Queue Weight protects paying customers at the direct expense of free-tier users. The acknowledgment modal forces the operator to confront that free-tier users — often in less affluent demographics — disproportionately bear the cost of capacity constraints.

### Scenario 3: Grid Carbon Intensity Spike

**Name:** Grid Carbon Intensity Spike  
**Description:** A grid event (coal plant brought online, wind farm goes offline) causes carbon intensity to spike to 600 gCO2/kWh, tripling the data center's carbon footprint.

**Trigger:** Manual selection, or automatic if Grid Carbon Intensity exceeds 350 gCO2/kWh.

**Affected layers:** Location, Power

**Metric changes over time:**

| Tick Offset | Grid Carbon Intensity (gCO2/kWh) | Renewable Fraction (%) | CUE (kgCO2/kWh) | Carbon Output (kgCO2/hr) |
|-------------|-----------------------------------|------------------------|------------------|--------------------------|
| 0 | 180 | 65 | 0.22 | 145 |
| 5 | 350 | 35 | 0.43 | 280 |
| 10 | 500 | 20 | 0.62 | 400 |
| 15 | 600 | 10 | 0.74 | 480 |

**Recommendations that fire:**
- Tick 5: "High Grid Carbon Intensity" (warning)
- Tick 10: "Critical PUE" (critical, because the energy is now dirtier, making PUE optimization more urgent)

**Available levers:**
- Renewable Priority Mode (defer non-critical workloads)
- Power Cap (reduce facility power to minimize total emissions)
- GPU Power Limit (reduce GPU power to cut IT load)
- Request Rate Limit (reduce throughput to reduce power draw)

**3D model visual effects:**
- Sky dome transitions from blue to dark gray-brown (smog effect)
- A subtle dark particle haze settles over the facility
- PDU cabinets glow amber, then red
- An overlay counter in the 3D viewport shows live carbon output: "XX kgCO2/hr" in red text

**Resolution:** Enable Renewable Priority Mode and reduce Power Cap to 800kW. This reduces throughput by approximately 20% but cuts carbon output by 35%. Carbon output stabilizes at ~310 kgCO2/hr until the grid event passes.

**End user impact:** Renewable Priority Mode defers 20% of requests to future windows, adding 10–30 minutes of latency for batch workloads. Real-time inference is unaffected if rate limit is maintained.

**Ethical dimension:** The operator is directly choosing between carbon emissions and service availability. Every hour of inaction emits an additional 335 kgCO2 compared to taking action. The scenario quantifies this: "Each hour of delay is equivalent to driving a passenger car 1,350 km."

### Scenario 4: GPU Fleet Degradation

**Name:** GPU Fleet Degradation  
**Description:** An aging firmware bug causes accelerating GPU failures: 2 GPUs fail per tick starting at tick 5, escalating to 5 per tick at tick 15. Active GPU count drops from 240 to below 160.

**Trigger:** Manual selection, or automatic if Hardware Failure Rate exceeds 2/day.

**Affected layers:** GPU, Workload, Power

**Metric changes over time:**

| Tick Offset | Active GPUs | GPU Utilization (%) | Idle Power Waste (kW) | Request Drop Rate (%) | Inference Latency (ms) |
|-------------|-------------|---------------------|------------------------|------------------------|------------------------|
| 0 | 240 | 72 | 27 | 0 | 55 |
| 5 | 230 | 78 | 24 | 0.2 | 62 |
| 10 | 210 | 88 | 18 | 1.5 | 95 |
| 15 | 180 | 98 | 5 | 5.0 | 210 |
| 20 | 160 | 99+ | 2 | 12.0 | 400+ |

**Recommendations that fire:**
- Tick 5: "Low GPU Utilization — Consolidation Opportunity" transitions to "Requests Being Dropped" as utilization rises
- Tick 10: "Requests Being Dropped" (warning)
- Tick 15: "Significant Service Degradation" (critical)

**Available levers:**
- Request Rate Limit (reduce to match diminished capacity)
- Batch Size (increase for efficiency)
- Priority Queue Weight (protect premium users)
- Graceful Rack Shutdown (preemptively shut down failing racks to consolidate load to healthy ones)

**3D model visual effects:**
- Individual rack LEDs begin flickering and turning off (one per failed GPU)
- Failed racks get a static/glitch effect overlay
- Data flow particles slow down and more turn red
- A counter overlay: "Active GPUs: XXX / 240" appears on the 3D viewport

**Resolution:** Preemptively shut down racks with the most failures (consolidate to healthy racks), reduce rate limit to 5,000 req/hr, increase batch size to 48. The facility stabilizes at reduced capacity.

**End user impact:** At worst, 12% of requests are dropped. Service is effectively degraded for all users. The operator must communicate the degradation.

**Ethical dimension:** The operator must decide whether to maintain high throughput (risking cascading failures that could cause a total outage) or proactively reduce capacity (immediately degrading service for users but preventing catastrophic failure). Short-term harm vs. long-term resilience.

### Scenario 5: Water Scarcity Alert

**Name:** Water Scarcity Alert  
**Description:** A regional drought causes the Water Stress Index to spike from 0.3 to 0.8. The data center's water consumption becomes a community concern.

**Trigger:** Manual selection, or automatic if Water Stress Index exceeds 0.5.

**Affected layers:** Location, Cooling, GPU

**Metric changes over time:**

| Tick Offset | Water Stress Index | Water Usage (L/hr) | WUE (L/kWh) | Community Burden Level |
|-------------|--------------------|--------------------|--------------|----------------------|
| 0 | 0.3 | 650 | 0.87 | Low |
| 5 | 0.5 | 650 (unchanged) | 0.87 | Moderate |
| 10 | 0.7 | 650 (unchanged) | 0.87 | High |
| 15 | 0.8 | 650 (unchanged) | 0.87 | Critical |

Note: The data center's actual water usage does not change — the community's available water has decreased, making the same consumption rate more impactful.

**Recommendations that fire:**
- Tick 5: "Water Efficiency Below Target" (warning) — recontextualized with water stress information
- Tick 10: "Critical Water Usage" (critical) — emphasizing community burden
- Tick 15: New recommendation: "Emergency Water Conservation" (critical) — "Community water stress is critical. Consider enabling Water Recirculation Mode and raising cooling setpoint to minimize water draw. Local authorities may impose mandatory restrictions."

**Available levers:**
- Water Recirculation Mode (on — reduces fresh water intake 30%)
- Cooling Setpoint (raise — reduces water usage but increases GPU temperatures)
- Fan Speed Override (increase fan speed to compensate for higher setpoint with air cooling instead of evaporative cooling)
- Graceful Rack Shutdown (reduce heat load to reduce cooling water needs)

**3D model visual effects:**
- Ground plane transitions from green to brown/tan
- Water particle effects in cooling towers become sparse and turn from blue to yellowish
- A community impact overlay appears on the ground plane: a ring around the facility showing the community zone, colored by water stress level
- The region label updates: "Oregon, USA — Water Stress: HIGH"

**Resolution:** Enable Water Recirculation Mode, raise cooling setpoint to 26°C, increase fan speed to 85%. This reduces water intake by ~45% while keeping GPU temperatures below 80°C.

**End user impact:** Slightly increased latency (~+15ms) due to higher GPU temperatures. No request drops.

**Ethical dimension:** This scenario is the most ethically potent. The data center's water consumption is physically unchanged, but its ethical weight has increased because the community has less water. The acknowledgment modal makes this explicit: "Umatilla County is under drought advisory. Local residential water restrictions are in effect. Your facility's current water draw of 650 L/hr represents X% of the county's allocated industrial water budget."

---

## 11. Ethical Impact Layer

### End User Impact Calculation

Every operator action generates an end-user impact estimate. The calculation:

```typescript
interface EndUserImpact {
  latencyChangeMs: number;           // projected latency delta
  throughputChangeReqHr: number;     // projected throughput delta
  requestsAffectedPerHour: number;   // number of requests impacted
  affectedSegments: {
    premium: { latencyMs: number; dropRate: number };
    free: { latencyMs: number; dropRate: number };
  };
  qualityOfServiceDescription: string; // human-readable summary
}
```

The impact is calculated by the simulation engine using the lever change's projected effect on the workload layer. The Priority Queue Weight lever determines how impact is distributed between premium and free-tier users. Free-tier users always bear a proportionally larger share of degradation.

The end-user impact is displayed:
1. In the live preview next to the lever (real-time as the operator drags a slider)
2. In the Ethical Tradeoff Acknowledgment Modal before commit
3. In the Change Log Entry after commit

### Community Burden Indicator

The community burden is derived from the Location layer's Water Stress Index and the facility's resource consumption:

```typescript
interface CommunityBurden {
  communityName: string;               // "Umatilla County, Oregon"
  waterStressIndex: number;            // 0–1
  waterStressLevel: 'low' | 'moderate' | 'high' | 'critical';
  facilityWaterDrawLitersPerDay: number;
  communityWaterBudgetPercent: number;  // facility's share of community industrial allocation
  carbonFootprintContext: string;       // e.g., "equivalent to XX passenger cars per day"
  airQualityImpact: string;           // based on AQI
}
```

**Display:** The community burden is shown in three places:
1. **3D Model:** The ground plane surrounding the facility is colored by community burden level (green → amber → red). A dashed ring around the facility represents the community zone.
2. **Bottom of the Layer sidebar:** A persistent "Community Impact" card showing water stress level, carbon context, and AQI. This card is always visible, not dismissable.
3. **Tradeoff Modal:** Dynamic text that contextualizes the specific action's community impact.

### Ethical Tradeoff Acknowledgment Flow

1. Operator adjusts a lever and clicks "Commit Action."
2. The modal appears (defined in Section 8). It is full-screen overlay with dark backdrop (rgba(0,0,0,0.7)).
3. The modal contains four dynamically generated sections: Action, Tradeoff, Community Impact, End User Impact.
4. The operator must check the acknowledgment checkbox.
5. **If the operator closes the modal without committing**, the lever reverts. No state change occurs. This is logged as an "abandoned action" in the internal analytics (not shown to user).
6. **If the operator commits**, the full text of all four sections is captured verbatim in the ChangeLogEntry.

**The operator cannot skip this flow.** There is no setting to disable it, no keyboard shortcut to bypass it, and no way to bulk-commit without individual acknowledgment. This is a deliberate design decision: operational convenience does not override ethical accountability.

### Sustainability Decisions Have Human Consequences

The product embodies this principle through:
1. **Quantification:** Every metric change is translated into human terms: "X requests affected", "Y liters of community water", "Z equivalent car-miles of carbon".
2. **Specificity:** The community is named (Umatilla County, Oregon), not abstracted. The end-user segments are identified (premium vs. free tier), not aggregated.
3. **Non-dismissability:** The tradeoff modal and community burden indicator cannot be hidden or minimized.
4. **Accountability trail:** Every action is logged with the full context of what the operator saw, what they acknowledged, and what actually happened. This is an audit artifact.

### Change Log as Accountability Artifact

```typescript
interface ChangeLogEntry {
  id: string;                          // UUID
  timestamp: string;                   // ISO 8601
  operatorAction: string;             // "cooling.setpoint: 22 → 25"
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    acknowledgedAt: string;            // timestamp of checkbox click
  };
  outcomeAtCommit: {
    metrics: Record<string, number>;   // snapshot of all metrics at commit time
  };
  outcomeAfterFiveMinutes: {
    metrics: Record<string, number>;   // snapshot 5 simulated minutes later
    projectionAccuracy: 'matched' | 'worse' | 'better';
  } | null;                            // null until 5 minutes have elapsed
  endUserImpactActual: EndUserImpact;  // measured impact, not projected
}
```

The change log is:
- Append-only: entries can never be modified or deleted
- Always accessible via the History tab
- Exportable as JSON
- A complete record of who did what, why, and what happened next

---

## 12. AWS Deployment Architecture

### Recommended Services (Hackathon Minimal)

| Component | AWS Service | Justification |
|-----------|-------------|---------------|
| Frontend hosting | S3 + CloudFront | Static React build served via CDN. Cheapest and fastest option. Free tier covers hackathon traffic. |
| Backend compute | EC2 t3.small (single instance) | Runs the Node.js simulation server. A single instance is sufficient for demo. ~$0.02/hr. |
| WebSocket | Handled by the EC2 instance directly | The ws library on the Node.js server handles WebSocket connections. No need for API Gateway WebSocket at hackathon scale. |
| Data storage | In-memory (server process) | Change log and state are held in memory. Acceptable for a demo with no persistence requirement. |
| CI/CD | GitHub Actions | Build React app, build backend, deploy to S3 and EC2 via SSH. |
| DNS (optional) | Route 53 | Only if a custom domain is desired. Otherwise, use CloudFront distribution URL. |

### Environment Configuration

**Development:**
- Local Node.js server running simulation engine on port 3001
- React dev server on port 3000 with proxy to backend
- WebSocket at ws://localhost:3001/ws

**Production:**
- React build deployed to S3 bucket, served via CloudFront
- Backend deployed to EC2 instance, running on port 3001
- CloudFront configured to proxy /api/* and /ws to EC2 instance
- Environment variables: `NODE_ENV=production`, `PORT=3001`, `TICK_RATE_MS=2000`, `SIMULATED_SECONDS_PER_TICK=300`

---

## 13. Data Models

All TypeScript interfaces are defined below. All fields are required unless annotated with a comment explaining when they may be null.

```typescript
// --- Core State ---

interface SimulationState {
  tick: number;
  timestamp: string;
  simulatedTimeSeconds: number;
  mode: 'live' | 'simulation';
  layers: {
    power: PowerLayerState;
    cooling: CoolingLayerState;
    gpu: GPULayerState;
    workload: WorkloadLayerState;
    location: LocationLayerState;
  };
  derivedMetrics: DerivedMetrics;
  activeScenario: string | null;       // null when no scenario active
  activeAlerts: Alert[];
  activeRecommendations: Recommendation[];
}

interface PowerLayerState {
  totalFacilityPower: number;          // kW
  itEquipmentPower: number;            // kW
  coolingPower: number;                // kW
  overheadPower: number;               // kW (lighting, networking, misc)
  pue: number;                         // ratio
  gridCarbonIntensity: number;         // gCO2/kWh
  renewableEnergyFraction: number;     // 0–1
  levers: {
    powerCap: number;                  // kW
    renewablePriorityMode: boolean;
  };
  health: HealthStatus;
}

interface CoolingLayerState {
  coolingSetpoint: number;             // °C
  waterUsageRate: number;              // liters/hr
  wue: number;                         // L/kWh
  ambientTemperature: number;          // °C
  coolantSupplyTemperature: number;    // °C
  levers: {
    coolingSetpoint: number;           // °C
    fanSpeedOverride: number;          // 0.4–1.0
    waterRecirculationMode: boolean;
  };
  health: HealthStatus;
}

interface GPULayerState {
  averageGpuTemperature: number;       // °C
  gpuUtilizationRate: number;          // 0–1
  activeGpuCount: number;              // count
  gpuIdlePowerWaste: number;           // kW
  hardwareFailureRate: number;         // failures/day
  levers: {
    gpuPowerLimit: number;             // W per GPU
    gracefulRackShutdown: boolean[];   // array of 10 booleans, one per rack
    thermalThrottleThreshold: number;  // °C
  };
  health: HealthStatus;
}

interface WorkloadLayerState {
  requestVolume: number;               // req/hr
  averageInferenceLatency: number;     // ms
  queueDepth: number;                  // requests
  requestDropRate: number;             // 0–1
  batchEfficiency: number;             // 0–1
  levers: {
    requestRateLimit: number;          // req/hr
    batchSize: number;                 // 1–64
    priorityQueueWeight: number;       // 0.5–0.9 (premium share)
  };
  health: HealthStatus;
}

interface LocationLayerState {
  ambientTemperature: number;          // °C
  gridCarbonIntensity: number;         // gCO2/kWh
  renewableEnergyFraction: number;     // 0–1
  waterStressIndex: number;            // 0–1
  localAirQualityIndex: number;        // AQI (0–500)
  region: string;                      // "Oregon, USA"
  communityName: string;               // "Umatilla County"
  health: HealthStatus;
}

interface DerivedMetrics {
  pue: number;                         // ratio
  wue: number;                         // L/kWh
  cue: number;                         // kgCO2/kWh
  carbonOutputKgPerHr: number;         // kgCO2/hr
  gpuIdlePowerWasteKw: number;         // kW
  totalCarbonEmittedKg: number;        // cumulative since simulation start
  totalWaterConsumedLiters: number;    // cumulative since simulation start
}

// --- Health ---

type HealthStatus = 'healthy' | 'warning' | 'critical';

interface LayerHealth {
  layerId: string;
  layerName: string;
  health: HealthStatus;
  metrics: Metric[];
}

interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string;
  healthyMin: number;
  healthyMax: number;
  warningMin: number;
  warningMax: number;
  criticalMin: number;
  criticalMax: number;
  status: HealthStatus;
  history: number[];                   // last 60 tick values for sparkline
}

// --- Controls ---

interface Lever {
  id: string;
  name: string;
  layerId: string;
  type: 'slider' | 'toggle' | 'dropdown';
  currentValue: number;
  minValue: number;
  maxValue: number;
  step: number;
  unit: string;
  effectMap: Array<{
    targetMetric: string;
    relationship: 'proportional' | 'inverse' | 'threshold';
    magnitude: number;                 // coefficient
    description: string;               // human-readable effect description
  }>;
}

// --- Recommendations ---

interface Recommendation {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  layerAffected: string;
  triggerCondition: string;
  title: string;
  body: string;
  suggestedAction: {
    lever: string;
    suggestedValue: number;
    currentValue: number;
  };
  projectedImpact: {
    metricChanges: Array<{
      metric: string;
      currentValue: number;
      projectedValue: number;
      unit: string;
    }>;
    endUserImpact: string;
    communityImpact: string;
  };
  status: 'active' | 'dismissed' | 'acted_on' | 'resolved';
  dismissedAt: string | null;         // null until dismissed
  actedOnAt: string | null;           // null until acted on
  resolvedAt: string | null;          // null until resolved
  confidenceNote: string;
}

// --- Alerts ---

interface Alert {
  id: string;
  timestamp: string;
  severity: 'warning' | 'critical';
  layerId: string;
  metricId: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  thresholdDirection: 'above' | 'below';
  message: string;
  acknowledged: boolean;
}

// --- Scenarios ---

interface ScenarioDefinition {
  id: string;
  name: string;
  description: string;
  affectedLayers: string[];
  triggerType: 'manual' | 'automatic';
  autoTriggerCondition: string | null; // null for manual-only
  totalDurationTicks: number;
  events: ScenarioEvent[];
  recommendationTriggers: Array<{
    tickOffset: number;
    recommendationTemplateId: string;
  }>;
  resolution: string;                  // human-readable resolution description
  endUserImpactSummary: string;
  ethicalDimension: string;
}

interface ScenarioEvent {
  tickOffset: number;
  layerAffected: string;
  metricAffected: string;
  operation: 'set' | 'add' | 'multiply';
  value: number;
  durationTicks: number;
}

// --- Actions ---

interface ActionCommit {
  id: string;
  timestamp: string;
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    acknowledgedAt: string;
  };
  projectedImpact: {
    metricChanges: Array<{
      metric: string;
      projectedValue: number;
    }>;
  };
}

// --- Change Log ---

interface ChangeLogEntry {
  id: string;
  timestamp: string;
  operatorAction: string;
  layerId: string;
  leverId: string;
  previousValue: number;
  newValue: number;
  tradeoffAcknowledgment: {
    tradeoffText: string;
    communityImpactText: string;
    endUserImpactText: string;
    acknowledgedAt: string;
  };
  outcomeAtCommit: {
    metrics: Record<string, number>;
  };
  outcomeAfterFiveMinutes: {
    metrics: Record<string, number>;
    projectionAccuracy: 'matched' | 'worse' | 'better';
  } | null;                            // null until 5 simulated minutes have elapsed
  endUserImpactActual: EndUserImpact;
}

// --- End User Impact ---

interface EndUserImpact {
  latencyChangeMs: number;
  throughputChangeReqHr: number;
  requestsAffectedPerHour: number;
  affectedSegments: {
    premium: { latencyMs: number; dropRate: number };
    free: { latencyMs: number; dropRate: number };
  };
  qualityOfServiceDescription: string;
}
```

---

## 14. API Specification

### REST Endpoints

#### GET /api/state

Returns the current simulation state.

**Response 200:**
```json
{
  "state": { /* SimulationState object */ }
}
```

#### GET /api/scenarios

Returns all available scenario definitions.

**Response 200:**
```json
{
  "scenarios": [ /* array of ScenarioDefinition objects */ ]
}
```

#### POST /api/scenarios/:id/activate

Activates a scenario by ID.

**Request Body:**
```json
{
  "mode": "simulation"
}
```

**Response 200:**
```json
{
  "success": true,
  "scenarioId": "heatwave-001",
  "estimatedDurationTicks": 20
}
```

**Response 404:**
```json
{ "error": "Scenario not found" }
```

**Response 409:**
```json
{ "error": "Another scenario is already active" }
```

#### POST /api/actions

Commits an operator action.

**Request Body:**
```json
{
  "layerId": "cooling",
  "leverId": "coolingSetpoint",
  "previousValue": 22,
  "newValue": 25,
  "tradeoffAcknowledgment": {
    "tradeoffText": "This action will reduce water consumption by ~18% but may increase inference latency by up to 8ms, affecting ~640 requests per hour.",
    "communityImpactText": "Umatilla County water stress index: 0.3 (low). This action reduces facility water draw by ~2,400 liters/day.",
    "endUserImpactText": "Premium users: +3ms latency. Free-tier users: +8ms latency. No requests dropped.",
    "acknowledged": true
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "changeLogEntryId": "uuid-here",
  "projectedImpact": {
    "metricChanges": [
      { "metric": "waterUsageRate", "projectedValue": 533 },
      { "metric": "averageGpuTemperature", "projectedValue": 71.2 },
      { "metric": "averageInferenceLatency", "projectedValue": 63 }
    ]
  }
}
```

**Response 400:**
```json
{ "error": "Tradeoff acknowledgment required" }
```

#### GET /api/logs

Returns change history.

**Query Parameters:** `limit` (default 50), `offset` (default 0)

**Response 200:**
```json
{
  "entries": [ /* array of ChangeLogEntry objects */ ],
  "total": 12
}
```

#### GET /api/recommendations

Returns active recommendations.

**Response 200:**
```json
{
  "recommendations": [ /* array of Recommendation objects with status 'active' */ ]
}
```

#### POST /api/recommendations/:id/dismiss

Dismisses a recommendation.

**Response 200:**
```json
{ "success": true, "recommendationId": "uuid-here" }
```

**Response 404:**
```json
{ "error": "Recommendation not found" }
```

### WebSocket Events (Server → Client)

**Connection:** `ws://[host]:[port]/ws`

| Event | Payload Type | Description |
|-------|-------------|-------------|
| `state:update` | `SimulationState` | Full state on every tick (2s) |
| `alert:new` | `Alert` | New threshold breach detected |
| `recommendation:new` | `Recommendation` | New recommendation triggered |
| `scenario:progress` | `{ scenarioId: string, ticksElapsed: number, totalTicks: number, phase: string }` | Progress during active scenario |
| `action:confirmed` | `{ changeLogEntryId: string, success: true }` | Action successfully committed |

All payloads are JSON-encoded. The client should parse the event type from a wrapper:

```json
{
  "event": "state:update",
  "data": { /* payload */ }
}
```

---

## 15. Simulation Formulas

### Primary Derived Metrics

**PUE (Power Usage Effectiveness):**
```
PUE = totalFacilityPower / itEquipmentPower
```
- `totalFacilityPower` = `itEquipmentPower` + `coolingPower` + `overheadPower` (kW)
- `itEquipmentPower` = sum of all active GPU power draws (kW)
- `overheadPower` = 45 kW (constant: lighting, networking, misc)
- Valid range: 1.0–3.0. Target: < 1.3.

**WUE (Water Usage Effectiveness):**
```
WUE = waterUsageRate / itEquipmentPower
```
- `waterUsageRate` in L/hr, `itEquipmentPower` in kW
- Unit: L/kWh
- Valid range: 0–5.0. Target: < 1.0.

**CUE (Carbon Usage Effectiveness):**
```
CUE = (totalFacilityPower * gridCarbonIntensity) / (itEquipmentPower * 1000)
```
- `gridCarbonIntensity` in gCO2/kWh
- Division by 1000 converts g to kg
- Unit: kgCO2/kWh
- Valid range: 0–2.0. Target: < 0.3.

**Carbon Output:**
```
carbonOutputKgPerHr = totalFacilityPower * gridCarbonIntensity / 1000
```
- Unit: kgCO2/hr

**GPU Idle Power Waste:**
```
gpuIdlePowerWaste = (1 - gpuUtilizationRate) * gpuPowerLimit * activeGpuCount / 1000
```
- `gpuPowerLimit` in W per GPU
- Division by 1000 converts W to kW
- Unit: kW

### Layer-Specific Formulas

**IT Equipment Power:**
```
itEquipmentPower = activeGpuCount * gpuPowerLimit * (0.4 + 0.6 * gpuUtilizationRate) / 1000
```
- GPUs draw 40% of their power limit at idle, scaling to 100% at full utilization
- Unit: kW

**Cooling Power:**
```
baseCoolingPower = 120  // kW
ambientFactor = 1 + max(0, (ambientTemperature - 20)) * 0.04
fanFactor = fanSpeedOverride  // 0.4–1.0
recircPenalty = waterRecirculationMode ? 1.15 : 1.0
setpointFactor = max(0.6, 1 - (coolingSetpoint - 18) * 0.05)  // lower setpoint = more power

coolingPower = baseCoolingPower * ambientFactor * fanFactor * recircPenalty * setpointFactor
```

**Water Usage Rate:**
```
baseWaterRate = 600  // L/hr
temperatureFactor = 1 + max(0, (ambientTemperature - 20)) * 0.035
setpointFactor = max(0.3, 1 - (coolingSetpoint - 18) * 0.06)  // higher setpoint = less water
recircSavings = waterRecirculationMode ? 0.70 : 1.0  // 30% savings

waterUsageRate = baseWaterRate * temperatureFactor * setpointFactor * recircSavings
```

**GPU Temperature:**
```
baseTemp = 55  // °C at idle with optimal cooling
utilizationHeat = gpuUtilizationRate * 25  // full utilization adds 25°C
coolingEffect = max(0, (coolingSetpoint - 18)) * 1.2  // higher setpoint = less cooling
ambientEffect = max(0, (ambientTemperature - 25)) * 0.8  // hot ambient adds heat
powerEffect = (gpuPowerLimit - 200) / 500 * 5  // higher power limit = more heat

averageGpuTemperature = baseTemp + utilizationHeat + coolingEffect + ambientEffect + powerEffect
```

**Inference Latency:**
```
baseLatency = 45  // ms
temperaturePenalty = max(0, (averageGpuTemperature - 72)) * 2.5  // ms per °C above 72
queuePenalty = queueDepth * 0.8  // ms per queued request
batchPenalty = (batchSize - 1) * 1.2  // ms per additional item in batch

averageInferenceLatency = baseLatency + temperaturePenalty + queuePenalty + batchPenalty
```

**Queue Depth:**
```
effectiveThroughput = activeGpuCount * gpuUtilizationRate * (700 / gpuPowerLimit) * (64 / batchSize) * baseRequestCapacityPerGpu
inboundRate = min(requestVolume, requestRateLimit)
surplus = max(0, inboundRate - effectiveThroughput)

queueDepth = previousQueueDepth * 0.9 + surplus * (tickIntervalHours)  // drains 10% per tick naturally
```
Where `baseRequestCapacityPerGpu` = 40 req/hr per GPU at full power and batch size 1.

**Request Drop Rate:**
```
maxQueueCapacity = 500
requestDropRate = max(0, (queueDepth - maxQueueCapacity)) / inboundRate
```

**Batch Efficiency:**
```
batchEfficiency = min(1.0, gpuUtilizationRate * (batchSize / 64) * 1.2)
```

### Input Variable Summary

| Variable | Unit | Baseline | Valid Range |
|----------|------|----------|-------------|
| ambientTemperature | °C | 28 | 10–50 |
| gridCarbonIntensity | gCO2/kWh | 180 | 50–800 |
| renewableEnergyFraction | ratio | 0.65 | 0–1 |
| waterStressIndex | ratio | 0.3 | 0–1 |
| localAirQualityIndex | AQI | 35 | 0–500 |
| gpuPowerLimit | W | 600 | 200–700 |
| activeGpuCount | count | 240 | 0–240 |
| coolingSetpoint | °C | 22 | 16–30 |
| fanSpeedOverride | ratio | 0.65 | 0.4–1.0 |
| waterRecirculationMode | boolean | false | — |
| requestRateLimit | req/hr | 12000 | 2000–16000 |
| batchSize | count | 16 | 1–64 |
| priorityQueueWeight | ratio | 0.6 | 0.5–0.9 |
| powerCap | kW | 1000 | 600–1200 |
| renewablePriorityMode | boolean | false | — |
| thermalThrottleThreshold | °C | 83 | 75–90 |

---

## 16. Seed Data

The complete initial simulation state at tick 0:

```json
{
  "tick": 0,
  "timestamp": "2026-04-12T08:00:00Z",
  "simulatedTimeSeconds": 0,
  "mode": "live",
  "layers": {
    "power": {
      "totalFacilityPower": 820,
      "itEquipmentPower": 650,
      "coolingPower": 125,
      "overheadPower": 45,
      "pue": 1.26,
      "gridCarbonIntensity": 180,
      "renewableEnergyFraction": 0.65,
      "levers": {
        "powerCap": 1000,
        "renewablePriorityMode": false
      },
      "health": "healthy"
    },
    "cooling": {
      "coolingSetpoint": 22,
      "waterUsageRate": 650,
      "wue": 1.0,
      "ambientTemperature": 28,
      "coolantSupplyTemperature": 16,
      "levers": {
        "coolingSetpoint": 22,
        "fanSpeedOverride": 0.65,
        "waterRecirculationMode": false
      },
      "health": "warning"
    },
    "gpu": {
      "averageGpuTemperature": 68,
      "gpuUtilizationRate": 0.72,
      "activeGpuCount": 240,
      "gpuIdlePowerWaste": 27,
      "hardwareFailureRate": 0,
      "levers": {
        "gpuPowerLimit": 600,
        "gracefulRackShutdown": [false, false, false, false, false, false, false, false, false, false],
        "thermalThrottleThreshold": 83
      },
      "health": "healthy"
    },
    "workload": {
      "requestVolume": 8000,
      "averageInferenceLatency": 55,
      "queueDepth": 10,
      "requestDropRate": 0,
      "batchEfficiency": 0.82,
      "levers": {
        "requestRateLimit": 12000,
        "batchSize": 16,
        "priorityQueueWeight": 0.6
      },
      "health": "healthy"
    },
    "location": {
      "ambientTemperature": 28,
      "gridCarbonIntensity": 180,
      "renewableEnergyFraction": 0.65,
      "waterStressIndex": 0.3,
      "localAirQualityIndex": 35,
      "region": "Oregon, USA",
      "communityName": "Umatilla County",
      "health": "healthy"
    }
  },
  "derivedMetrics": {
    "pue": 1.26,
    "wue": 1.0,
    "cue": 0.23,
    "carbonOutputKgPerHr": 147.6,
    "gpuIdlePowerWasteKw": 27,
    "totalCarbonEmittedKg": 0,
    "totalWaterConsumedLiters": 0
  },
  "activeScenario": null,
  "activeAlerts": [
    {
      "id": "alert-seed-001",
      "timestamp": "2026-04-12T08:00:00Z",
      "severity": "warning",
      "layerId": "cooling",
      "metricId": "wue",
      "metricName": "Water Usage Effectiveness",
      "currentValue": 1.0,
      "threshold": 1.0,
      "thresholdDirection": "above",
      "message": "WUE has reached the warning threshold of 1.0 L/kWh. Water efficiency is borderline.",
      "acknowledged": false
    }
  ],
  "activeRecommendations": [
    {
      "id": "rec-seed-001",
      "timestamp": "2026-04-12T08:00:00Z",
      "severity": "warning",
      "layerAffected": "cooling",
      "triggerCondition": "WUE >= 1.0 for 5+ ticks",
      "title": "Water Efficiency at Threshold",
      "body": "WUE has reached 1.0 L/kWh, the upper bound of the healthy range. Consider enabling Water Recirculation Mode to reduce fresh water intake by approximately 30%. This would lower WUE to approximately 0.7 L/kWh. GPU temperatures may increase by approximately 1-2°C due to reduced cooling efficiency.",
      "suggestedAction": {
        "lever": "waterRecirculationMode",
        "suggestedValue": 1,
        "currentValue": 0
      },
      "projectedImpact": {
        "metricChanges": [
          { "metric": "wue", "currentValue": 1.0, "projectedValue": 0.7, "unit": "L/kWh" },
          { "metric": "waterUsageRate", "currentValue": 650, "projectedValue": 455, "unit": "L/hr" },
          { "metric": "averageGpuTemperature", "currentValue": 68, "projectedValue": 70, "unit": "°C" }
        ],
        "endUserImpact": "Minimal. GPU temperature increase of ~2°C is within healthy range. No expected latency impact.",
        "communityImpact": "Umatilla County water stress is currently low (0.3). Enabling recirculation would reduce facility water draw by ~4,680 liters/day — a proactive conservation measure."
      },
      "status": "active",
      "dismissedAt": null,
      "actedOnAt": null,
      "resolvedAt": null,
      "confidenceNote": "This recommendation is generated by a rule-based simulation engine. In a production system, AI-generated recommendations carry model uncertainty and may reflect biases in training data. Always apply human judgment before acting on automated suggestions."
    }
  ]
}
```

**Design note on seed state:** The cooling layer starts at "warning" health with WUE exactly at the threshold (1.0 L/kWh). This creates an immediately interesting demo state — the operator sees amber on the cooling layer from the first moment, prompting investigation and action without needing to wait for a scenario to fire.

---

## 17. Demo Script

**Total duration: 90 seconds**

---

**[0:00–0:10] Opening — Establish Context**

*Narration:* "This is the AI Factory Digital Twin — a sustainability operations dashboard for managing an AI data center. I'm looking at a live 3D simulation of a 240-GPU facility in Oregon. Everything you see — every metric, every recommendation, every environmental condition — is driven by a real-time simulation engine."

*UI:* Dashboard is loaded. Camera is in default isometric view. The 3D model shows a healthy green facility with one amber cooling layer visible in the sidebar.

*3D Model:* Server racks glow green. Cooling towers spin gently. Data flow particles stream smoothly from ingress to egress.

---

**[0:10–0:20] Problem Introduction — The Amber Warning**

*Narration:* "Notice the cooling layer is already amber. Our water efficiency is borderline. The AI recommendation engine has flagged this and is suggesting we enable water recirculation. But here's the question this dashboard forces us to ask: what's the real cost of that decision?"

*UI:* Click on the cooling layer card in the sidebar. Camera flies to focus on cooling towers. The recommendation panel highlights the active recommendation.

*3D Model:* Camera smoothly orbits to cooling towers. Water particles are visible flowing through the system.

---

**[0:20–0:35] Scenario Activation — Heatwave Hits**

*Narration:* "Let me show what happens when the environment changes. I'm activating a heatwave scenario — ambient temperature surges to 42 degrees."

*UI:* Click "Scenarios" tab. Click "Simulate" on Heatwave Stress Event.

*3D Model:* Sky dome shifts from blue to orange-red. Heat shimmer particles appear. Cooling towers spin faster. Server racks begin transitioning from green to amber. The simulation mode banner appears.

*Narration:* "Watch the cascade. The cooling system is maxing out. Water consumption spikes. GPU temperatures are climbing. And look — requests are starting to slow down. Real users would be feeling this right now."

---

**[0:35–0:50] Operator Action — The Tradeoff**

*Narration:* "I need to act. I'll reduce GPU power limits to lower heat generation."

*UI:* Click on GPU layer. Drag GPU Power Limit slider from 600W to 400W. Click "Commit Action."

*3D Model:* Rack LED brightness dims slightly in the preview.

*Narration:* "And here's what makes this dashboard different. Before I can commit, I must acknowledge the tradeoff."

*UI:* The Ethical Tradeoff Acknowledgment Modal appears. Pause to let the audience read it.

*Narration:* "The system tells me exactly what this costs: inference latency increases by 15 milliseconds. Free-tier users — the ones who don't pay — are disproportionately affected. And it quantifies the community impact. I check the box. I accept responsibility."

*UI:* Check the acknowledgment checkbox. Click "Confirm & Commit."

*3D Model:* Rack LEDs dim. Heat haze reduces. Temperatures begin dropping. Racks transition back toward green.

---

**[0:50–1:05] Resolution and Reflection**

*Narration:* "The facility stabilizes. Temperatures are coming down. But look at the change log."

*UI:* Click "History" tab. The committed action appears with full tradeoff text, community impact, and end-user impact.

*Narration:* "Every decision I made is permanently recorded — what I changed, what I acknowledged, and what actually happened. This is an accountability artifact. In a real AI factory, this log answers the question: who decided to trade end-user experience for water savings, and did they understand the consequences?"

---

**[1:05–1:20] Ethical Reflection — Why This Matters**

*Narration:* "AI data centers consume enormous resources — water, energy, carbon. The communities that host them bear costs they never agreed to. And the end users who depend on these services have no visibility into the tradeoffs being made on their behalf. This dashboard makes those invisible costs visible, those silent tradeoffs audible, and those unaccountable decisions accountable."

*UI:* Camera pulls back to full facility view. The ground plane shows the community impact ring. The sky dome shows the environmental state.

*3D Model:* Slow orbit around the full facility. Metrics stabilizing. Community burden indicator visible.

---

**[1:20–1:30] Close**

*Narration:* "The AI Factory Digital Twin. Because sustainability isn't a dashboard you check once a quarter — it's a responsibility you carry with every decision."

*UI:* Fade to the default isometric view. All layers green. Community impact ring visible.

---

## 18. Out of Scope

The following are explicitly **not** being built for this hackathon:

- **No real data center integration.** All data is simulated by the backend engine. No connections to physical infrastructure, IPMI, SNMP, or any hardware telemetry system.
- **No real AI/ML model calls.** The "AI recommendation engine" is a deterministic rule-based system. No LLM, no neural network, no model inference. Recommendations are template-based.
- **No real API calls to Gemini, Claude, or any external AI service.** All intelligence is simulated locally.
- **No authentication or multi-user support.** The dashboard is single-user, no login, no RBAC, no session management.
- **No real GPU hardware telemetry.** No NVIDIA DCGM, no nvidia-smi, no actual hardware metrics.
- **No mobile responsive design.** The dashboard requires a minimum viewport of 1280 × 720 and is designed for desktop Chrome only.
- **No real-time collaboration.** Single operator, single browser session.
- **No persistent database.** All state is in-memory. Server restart clears all history.
- **No internationalization.** English only.
- **No accessibility compliance.** While basic keyboard navigation should work, WCAG compliance is not a goal for the hackathon.
- **No automated testing.** Manual QA only for the hackathon demo.
- **No historical data import/export** (beyond the JSON change log download).
- **No integration with cloud provider APIs** (AWS CloudWatch, etc.) for real monitoring.

---

## 19. Success Criteria

The hackathon submission is considered "done" when all of the following are true:

1. **All five user flows are completable end-to-end:**
   - Flow 1: Dashboard loads and displays live 3D twin with updating metrics.
   - Flow 2: An alert fires (from seed state or scenario), surfaces in the UI, and the operator can drill into the affected layer.
   - Flow 3: At least one scenario (Heatwave) can be simulated with visible metric changes and 3D model effects.
   - Flow 4: An operator can adjust a lever, see the tradeoff modal, acknowledge it, and commit the action with visible 3D model response.
   - Flow 5: The change log shows committed actions with full tradeoff text and is downloadable as JSON.

2. **3D model renders and animates correctly in Chrome (desktop):**
   - All 10 server racks, 2 cooling towers, 2 PDUs, ingress/egress points, and sky dome are visible.
   - Health color transitions work (green → amber → red).
   - At least one particle system is active (data flow or water).
   - Camera fly-to-layer works on click.

3. **At least 3 scenarios are fully playable:**
   - Heatwave Stress Event (required)
   - Demand Spike (required)
   - Water Scarcity Alert (required)
   - GPU Fleet Degradation and Grid Carbon Intensity Spike are stretch goals.

4. **Change log persists across scenario runs** within a single server session.

5. **Ethical tradeoff modal fires on every action commit** with dynamically generated tradeoff, community impact, and end-user impact text. The checkbox must be checked before "Confirm & Commit" is enabled.

6. **Dashboard loads in under 3 seconds** on a standard broadband connection (initial page load including 3D assets).

7. **WebSocket updates arrive within 1 second of simulation tick** (measured as time between server tick and client state update render).