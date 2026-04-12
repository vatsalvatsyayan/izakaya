# Pitch Deck — Concise Slide Content

---

## Slide 1: Opening Hook

**"$1 billion. Every single day."**

That's what Microsoft, Meta, Amazon, Google, and Oracle spend building AI data centers in 2025. In 2026, it's nearly **$2 billion per day**.

The largest infrastructure buildout since the electric grid — with less oversight than a mid-size chemical plant.

---

## Slide 2: The AI Factory

Jensen Huang, NVIDIA CEO:
> "Data centers are no longer cost centers. They are factories — AI factories that take in raw data and produce intelligence."

Every token you generate traces back to a GPU, in a rack, drawing power from a grid, cooled by water, in a building, in someone's community.

---

## Slide 3: The Scale

| | 2024 | 2025 | 2026 (Projected) |
|---|---|---|---|
| Big 5 Capex | ~$200B | ~$355B+ | **~$690-750B** |
| Amazon | ~$59B | ~$100B+ | **~$200B** |
| Google (Alphabet) | ~$52B | ~$75B | **~$175-185B** |
| Microsoft | ~$44B | ~$80B | **~$120B+** |
| Meta | ~$37B | ~$60-65B | **~$115-135B** |
| Oracle | ~$12-15B | ~$40B+ | **~$50B** |

Capex as % of sales in 2026: Oracle **86%**, Meta **54%**, Microsoft **47%**, Google **46%**.

Hyperscaler capex has **quadrupled** since GPT-4's release. Aggregate capex now **exceeds projected free cash flow** — companies are borrowing to build.

---

## Slide 4: The Hidden Cost — Energy

- Global data centers consume **460 TWh/year** — more than most countries
- Ireland: data centers use **21% of national electricity**
- A single AI query uses **5-10x** the electricity of a Google search
- Utilities are **delaying coal plant retirements** to feed data center demand

---

## Slide 5: The Hidden Cost — Water

- 50 prompts with GPT-4 = **500 ml of water**
- Google: **5.6 billion gallons** in 2023 (+17% YoY)
- The Dalles, Oregon (pop. 15,000): Google uses **25-30% of the city's water** — residents faced restrictions during drought while consumption continued

All three hyperscalers committed to water reduction. All three are moving in the opposite direction.

---

## Slide 6: The Hidden Cost — Carbon

- Training GPT-4: **~5,000-10,000 tonnes CO2** (500 transatlantic flights)
- Google's emissions: **+48% from 2019-2023**, driven by AI
- 60-70% of ML energy goes to inference, not training — it scales with every user

---

## Slide 7: Who Pays the Price

- Prince William County, VA: expansion displaced majority-Black and Latino neighborhoods
- Chicago: data center communities have **23% lower median income** than county average
- A $500M+ data center creates **30-50 permanent jobs**
- Virginia gave **$750M in tax exemptions** (2016-2023) — lowest job-to-subsidy ratio of any industry

Communities absorb water depletion, noise, grid strain, and property disruption. They rarely share the upside.

---

## Slide 8: The Feedback Loop

```
More capable models → More users → More inference
→ More data centers → More electricity → More power plants
→ More water consumed → More carbon emitted
→ Climate worsens → Demand for AI climate solutions
→ More compute needed → CYCLE REPEATS
```

Infrastructure lock-in: 20-30 year facility lifetimes. Decisions made now determine emissions through 2050.

---

## Slide 9: The Problem — Flying Blind

Sustainability data exists. It lives in separate annual reports, buried CSR disclosures, and disconnected dashboards.

It is never in the operational loop — never at the moment the operator makes a decision.

**You can't optimize what you can't see. You can't be accountable for what you don't acknowledge.**

---

## Slide 10: Our Solution — The AI Factory Digital Twin

A real-time 3D operations dashboard that makes the invisible costs of AI infrastructure visible, quantifiable, and non-dismissable.

- **5 infrastructure layers**: Power, Cooling, GPU, Workload, Location
- **Live simulation**: WebSocket-driven, updating every 2 seconds
- **What-if scenarios**: Test decisions before committing
- **Ethical tradeoff gate**: Every action requires explicit acknowledgment of who bears the cost

---

## Slide 11: Demo Flow

1. **Monitor** — Real-time 3D twin with live metrics across all layers
2. **Alert fires** — Cooling efficiency drops, water consumption spikes
3. **Investigate** — Drill into layer dependencies, see cascading effects
4. **What-if** — Simulate raising setpoints, shifting workloads
5. **Commit** — Choose an action
6. **Tradeoff acknowledgment** — Forced modal: "This saves X energy but increases Y water stress on Z community"
7. **Logged** — Decision + acknowledgment stored as accountability artifact

---

## Slide 12: How It Works

```
Simulation Engine (2s tick)
  → In-memory state across 5 layers
  → WebSocket broadcast to all clients
  → React + Three.js 3D rendering
  → Zustand state management
  → Ethical gate on every operator action
```

TypeScript monorepo: shared types, Node.js/Express backend, React/Three.js frontend.

---

## Slide 13: Sustainability — Built In, Not Bolted On

Our digital twin doesn't just monitor — it enforces sustainable decision-making at the operational layer.

**Every action has a sustainability cost. We make it visible and non-dismissable.**

- Operator raises cooling setpoints → twin shows: *"Saves 12% energy ($340K/yr), but increases water consumption 8% in a drought-stressed region"*
- Operator shifts workload to cheaper grid → twin shows: *"Saves $18K/month, but increases carbon intensity 34% — equivalent to 200 additional cars/year"*
- The operator must **explicitly acknowledge** the tradeoff before the system commits the change
- Every decision + acknowledgment is **permanently logged** as an accountability artifact

This is a sustainability framework that lives inside the operational loop — not in a quarterly CSR report.

---

## Slide 14: The E-Waste Crisis AI is Creating

- AI e-waste projected to reach **1.2–5.0 million metric tons** by 2030 (Nature Computational Science, 2024)
- GPU hardware becomes obsolete in **18-24 months** — down from 5-year enterprise cycles
- AI hardware contains gold, copper, rare earth elements — but also lead, mercury, chromium
- Server module reuse could **reduce waste by 42%** (2.1M metric tons) — but only if you know *when* to replace and *what* to prioritize

### What a Digital Twin Specifically Enables Here

1. **Per-GPU efficiency tracking**: Model thermal degradation curves for every GPU in the fleet. Know exactly when a unit drops below its efficiency floor — not on a fixed schedule, but based on actual operating conditions.
2. **Replace smart, not fast**: Instead of retiring an entire rack generation, prioritize replacing the *least efficient* units first. Direct capex where it has the highest sustainability ROI.
3. **Circular economy decisions**: Simulate whether a degraded GPU is better redeployed to a lower-intensity workload (inference vs. training) or decommissioned — extending useful life and reducing e-waste.
4. **Fleet-wide what-if**: "If we replace 500 H100s with 200 B200s, what happens to power draw, cooling load, water consumption, and carbon footprint?" — answered in seconds, not spreadsheets.

The digital twin turns hardware lifecycle from a procurement calendar into a **sustainability optimization problem**.

---

## Slide 15: Why Digital Twins, Not Dashboards

| | Dashboard | Digital Twin |
|---|---|---|
| Current state | Yes | Yes |
| "What if CRAH-3 fails at 2 AM during peak?" | No | Physics-based simulation |
| Cross-layer dependencies | Siloed | Unified: GPU → power → cooling → water → community |
| Predictive maintenance | Threshold alerts | Predict *when* a GPU degrades below efficiency floor |
| Sustainability forecasting | Historical reports | Simulate carbon/water impact of decisions *before* committing |

A dashboard tells you what IS happening. A digital twin tells you what WILL happen.

---

## Slide 16: Predictive Maintenance → Predictive Sustainability

Traditional predictive maintenance asks: *"When will this component fail?"*
We extend it to: **"When does this component become unsustainable?"**

| Capability | What it enables |
|---|---|
| GPU thermal degradation modeling | Identify GPUs losing efficiency before they fail — replace with energy-efficient next-gen units |
| Cooling system wear prediction | Schedule maintenance before efficiency drops, avoiding water/energy spikes |
| Power supply aging curves | Predict when PSU efficiency falls below 90%, proactively swap to reduce waste heat |
| Fleet-wide lifecycle optimization | Prioritize replacing the *least efficient* hardware first — maximize sustainability ROI per dollar spent |

**Stats**:
- Predictive maintenance reduces unplanned downtime by **30-45%**
- Extends asset lifecycles by **20-25%** on average
- Reduces maintenance costs by **25-30%**
- Prediction accuracy can reach **98%** in digital twin simulations

---

## Slide 17: The NVIDIA Technology Stack Powering This

NVIDIA isn't just making GPUs — they're building the infrastructure to optimize the infrastructure. And it's already being deployed for AI data centers specifically.

| Technology | What it does | Relevance |
|---|---|---|
| **Omniverse DSX Blueprint** | Full digital twin of gigawatt-scale AI factories | Our architectural model — unified facility simulation |
| **DSX Boost** | Max-Q efficiency: up to **30% higher GPU throughput** in same power envelope | Software-only energy optimization |
| **DSX Flex** | Balances energy demand with real-time grid conditions | Taps into **100 GW of underutilized grid capacity** |
| **DSX Exchange** | Unified IT/OT integration — links power, cooling, safety systems with Omniverse twins via real-time APIs | The control fabric connecting all operational layers |
| **Modulus** | Physics-informed neural networks (PINNs) for real-time thermal simulation | **10-100x faster** than traditional CFD solvers |
| **cuOpt** | AI-powered workload placement optimization | Carbon-aware scheduling across racks and regions |
| **Earth-2** | Planetary climate simulation at **1000x speed** | Long-term site planning against climate projections |

### Already Deployed for AI Data Centers

- **Equinix + NVIDIA**: Retrofitting real facilities — converting traditional 5kW air-cooled cages to Blackwell GPU racks with liquid cooling, using Omniverse to plan the transition digitally first.
- **Schneider Electric + NVIDIA**: Power and cooling reference designs tailored to GB300 NVL72 racks at extreme densities. AI infrastructure controls enabling OT/IT interoperability with NVIDIA Mission Control.
- **Nscale + Caterpillar**: Building a **multi-gigawatt AI factory** in West Virginia using DSX Vera Rubin reference designs — one of the largest in the world.
- **NVIDIA AI Factory Research Center**: At Digital Realty's Manassas, VA site — developing the platform combining Omniverse + OpenUSD for operational twins.
- **ETAP** (March 2025): World's first Electrical Digital Twin simulating AI Factory power from grid to chip using Omniverse.

Partners include Eaton, GE Vernova, Hitachi, Siemens Energy, Trane Technologies, and Vertiv — covering power, cooling, and grid interaction end-to-end.

---

## Slide 18: Which AI Layer Are We Solving For

The full AI stack has 9 layers. We target the **operational infrastructure layers** — where sustainability impact is largest and most actionable.

```
┌─────────────────────────────────────────┐
│  Application (ChatGPT, Copilot)         │  ← Users see this
│  Inference (serving)                    │
│  Training (model creation)              │
├─────────────────────────────────────────┤
│  ★ GPU / Compute         ← WE ARE HERE │  Thermal monitoring, efficiency
│  ★ Cooling               ← WE ARE HERE │  Water, energy, setpoint optimization
│  ★ Power                 ← WE ARE HERE │  Grid, renewables, carbon intensity
│  ★ Facility / Location   ← WE ARE HERE │  Community impact, environmental justice
├─────────────────────────────────────────┤
│  Networking                             │
│  Silicon (fab)                          │
└─────────────────────────────────────────┘
```

**Today**: Real-time monitoring, what-if simulation, ethical tradeoff enforcement across Power, Cooling, GPU, and Facility layers.

**Next**: Extend upward into workload-aware optimization (training/inference scheduling based on carbon intensity) and downward into hardware lifecycle management (predictive e-waste reduction, circular economy recommendations).

---

## Slide 19: Architectural Recommendations for Sustainable AI Data Centers

What should change at the facility level — and what a digital twin can help design and validate before a single dollar is spent.

### Cooling Architecture
- **Shift to direct liquid cooling (DLC)**: Cold plates on GPUs/CPUs deliver up to **45% PUE improvement**, achieving sub-1.2 PUE. Essential for AI racks at 40-120 kW.
- **Zero-water evaporative designs**: Microsoft is piloting zero-water cooling in all new builds (2026). Eliminates freshwater dependency entirely.
- **Immersion cooling**: Two-phase immersion delivers **50% cooling energy reduction** on renewable grids. Ideal for extreme-density GPU clusters.

### Power Architecture
- **On-site renewable + storage**: Co-locate solar/wind with battery storage to reduce grid dependency and carbon intensity during peak hours.
- **Carbon-aware load balancing**: Route flexible workloads (training, batch inference) to times and locations with lowest grid carbon intensity. Proven **5-15% carbon reduction**.
- **Micro-grid design**: Decouple from stressed regional grids. Reduces community burden and improves resilience.

### Facility Design
- **Modular, prefab construction**: Deploy in months vs. years. Global modular DC market growing at **17.4% CAGR** (2025-2030). Smaller footprint, less community disruption.
- **Waste heat reuse**: Pipe thermal output to district heating, greenhouses, or industrial processes. EU EED now encourages this.
- **Low-carbon materials**: Design with carbon budgets — circular construction practices, recyclable server chassis.

### The Digital Twin's Role in Architecture
A digital twin lets you **test all of these changes virtually** before committing capital: simulate liquid cooling retrofits, model grid decoupling scenarios, validate modular expansion plans — with full visibility into sustainability tradeoffs at every step.

---

## Slide 20: The Opportunity — It's Mostly Software (Today)

- Industry average PUE: **1.58** | Best-in-class: **1.10**
- That gap = **30% energy overhead** being wasted by the median facility
- **60-70% of the gap is operational/software**, not hardware
- Global waste: **~90 TWh/year** ($9B in avoidable energy costs)

| Software-only lever | Impact |
|---|---|
| Raise cooling setpoints | 10-15% energy savings |
| AI-driven cooling optimization | 5-10% additional |
| Carbon-aware workload scheduling | 5-15% carbon reduction |
| Eliminate zombie servers (30% are idle) | 5-15% IT energy |

Composite achievable: **20-30% energy reduction, 25-40% carbon reduction** — no hardware changes.

---

## Slide 21: Proven Results in the Wild

- **Google DeepMind**: 40% cooling energy reduction using ML
- **ASHRAE setpoint optimization**: 50-60% cooling savings at zero capex
- **Digital twin deployments**: 15-25% operational cost reduction within 2 years (IDC, 2024)
- **Equinix portfolio**: PUE improved from 1.59 to 1.48 across 260+ facilities

---

## Slide 22: The 5% Number

If we prevent just **5%** of global data center waste:

| Metric | Savings | Equivalent |
|---|---|---|
| Electricity | 23-25 TWh/year | Ireland's annual consumption |
| Carbon | 10-12.5M tonnes CO2 | 2.5M cars off the road |
| Water | 75-120B liters/year | Drinking water for 1.5M people |
| Cost | $12.5-15B/year | Fund UN clean water for 2+ years |

---

## Slide 23: The Regulatory Tailwind

- **EU Energy Efficiency Directive**: Mandatory reporting for all data centers >500 kW (effective 2024)
- **EU AI Act**: Training energy consumption disclosure required
- **Germany**: PUE target of 1.2 by 2027
- **US**: Oregon first state with mandatory reporting; SEC climate disclosure rule advancing
- **Carbon pricing**: EU ETS at ~$80-100/tonne — inefficiency now has a direct cost

The window for voluntary action is closing. Tools that enable compliance become essential.

---

## Slide 24: The Regulatory Argument

> "We regulate factories that produce chemicals. We regulate factories that produce energy. We regulate factories that produce food. Why do we not regulate factories that produce intelligence?"

---

## Slide 25: Future Vision

- **Real telemetry integration**: Connect to actual DCIM/BMS systems
- **AI nutrition labels**: Per-query resource cost transparency for end users
- **Community dashboards**: Public-facing impact visibility for affected neighborhoods
- **Policy integration**: Automated compliance reporting for EU EED, AI Act
- **Multi-site optimization**: Portfolio-level digital twin across geographies

---

## Slide 26: What We Built & What We Learned

- Full-stack TypeScript monorepo in hackathon timeframe
- Real-time 3D digital twin with React Three Fiber
- WebSocket-driven simulation engine with cross-layer dependencies
- Ethics-first design: tradeoff acknowledgment is architecturally enforced, not bolted on

**Key insight**: The hardest part isn't the technology — it's designing systems that refuse to let humans look away from consequences.

---

## Slide 27: Close

**Every operational decision in an AI factory carries a hidden cost. We make it visible, quantifiable, and undeniable.**

*Team: [names]*
*Built for the ShiftSC AI Ethics Hackathon*
