# Demo Flow — AI Factory Digital Twin

## 1. Opening State (Tick 0 — "Everything is Green")

- App loads with 3D viewport showing 10 server racks (green LEDs), 2 cooling towers, 2 PDUs, animated data flow particles
- **Top bar**: PUE 1.21, WUE, Carbon, GPU Temp, Latency 50ms, Drop Rate 0%
- **Bottom timeline**: 6 sparklines (PUE, WUE, Carbon, GPU Temp, Latency, Drop Rate) updating every 2s
- **Community Burden indicator** (bottom-right): Umatilla County, Water Stress 0.12 (green), carbon output in car-miles equivalent
- Point out: "All systems nominal" — no alerts, no recommendations

---

## 2. Explore Layers (click through each)

- **Power**: 750 kW facility power, 75% renewable, PUE 1.21
- **Cooling**: setpoint, water usage, ambient temp, coolant supply temp
- **GPU**: 240/240 active, 72% utilization, avg temp in healthy range
- **Workload**: 8,000 req/hr, 50ms latency, zero drops
- **Location**: ambient temp 24°C, water stress 0.12, AQI healthy
- Camera flies to each layer's area in the 3D scene

---

## 3. Manual Lever Demo (before any scenario)

- Open **Action Panel** → select a layer (e.g., Cooling)
- Adjust **Cooling Setpoint** slider up a few degrees
- Click **"Commit Action"** → **Tradeoff Modal** appears (non-skippable):
  - Shows lever change, tradeoff description, community impact (water stress, facility water draw), end-user impact (latency, carbon as car-miles)
  - **Checkbox**: "I acknowledge the tradeoffs, community burden, and end-user impact"
  - Must check to unlock **Confirm & Commit**
- After commit → change appears in **Change Log** (History tab) with projected vs actual outcome

---

## 4. Scenario 1: Heatwave Stress Event (best demo scenario)

- Activate from **Scenario Panel** → progress bar starts (20 ticks / 40 seconds)
- Watch: ambient temp climbs to 42°C, rack LEDs shift orange→red, cooling towers spin faster, sky dome color shifts
- **Alerts fire**: GPU temp warning → critical, water usage spikes, PUE degrades
- **Recommendations appear**: "Increase Fan Speed to 85%", then "Reduce GPU Power Limit to 400W"
- Key talking point: *"Water usage is surging during a drought — same cooling that's technically fine becomes ethically problematic"*
- **Respond**: Click "Apply Suggestion" on a recommendation or manually adjust levers → forced through tradeoff modal each time
- Show metrics recovering on sparklines

---

## 5. Scenario 2: Demand Spike (end-user impact focus)

- Request volume triples → queue depth explodes, latency jumps to 180ms, drops start
- **Priority Queue Weight** lever demo: sliding it up protects premium users but drops 67% of free-tier requests
- Tradeoff modal makes this explicit — *"who gets degraded service?"*

---

## 6. Scenario 3: Grid Carbon Intensity Spike (carbon ethics)

- Carbon intensity hits 600 gCO2/kWh → sky dome darkens
- Recommendation: Enable **Renewable Priority Mode** (defers 20% of batch workloads)
- Tradeoff modal shows: inaction = 335 kgCO2/hr = driving 1,350 km/hr equivalent
- Toggle **Renewable Priority Mode** → accept tradeoff of added batch latency

---

## 7. Scenario 4: Water Scarcity Alert (community burden)

- Water Stress Index jumps from 0.3 → 0.8 — community burden indicator pulses red
- Same water usage, different ethical weight
- Enable **Water Recirculation Mode** (30% less water, 15% more cooling power)
- Raise cooling setpoint → GPU temps rise, latency increases 10-20ms

---

## 8. Scenario 5: GPU Fleet Degradation (operational crisis)

- Active GPUs drop from 240 → <160, cascading failures
- Dilemma: maintain throughput (risk more failures) vs. proactively reduce capacity
- Consolidate racks, reduce rate limit, increase batch size

---

## 9. Closing Points to Highlight

- **Change Log**: full audit trail of every decision, projected vs actual outcomes, downloadable JSON, S3 audit trail
- **Simulation Mode toggle**: blue banner + overlay, lets you test scenarios without committing
- **Reconnection handling**: if WebSocket drops, amber banner auto-reconnects
- **Every action forces ethical acknowledgment** — no silent optimization

---

## Recommended Demo Order (if time-limited)

| Time | Steps |
|------|-------|
| **5 min** | Steps 1 → 2 → 3 → 4 (Heatwave only) → 9 |
| **10 min** | Add Demand Spike + Water Scarcity |
| **Full** | All scenarios sequentially |
