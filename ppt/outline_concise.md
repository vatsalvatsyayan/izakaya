# Pitch Deck — Concise Slide Content

---

## Slide 1: Opening Hook

**"$1 billion. Every single day."**

That's what five companies spend building AI data centers in 2025.

The largest infrastructure buildout since the electric grid — with less oversight than a mid-size chemical plant.

---

## Slide 2: The AI Factory

Jensen Huang, NVIDIA CEO:
> "Data centers are no longer cost centers. They are factories — AI factories that take in raw data and produce intelligence."

Every token you generate traces back to a GPU, in a rack, drawing power from a grid, cooled by water, in a building, in someone's community.

---

## Slide 3: The Scale

| | 2024 | 2025 (Announced) |
|---|---|---|
| Big 5 Capex | ~$200B | ~$355B+ |
| Stargate Project | — | $500B over 4 years |
| Global Power Demand | ~60 GW | 171 GW by 2030 |
| Market Size | ~$350B | $1T+ by 2030 |

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

## Slide 13: Ethics by Design

This is not a toggle. It is not optional.

Every operational change — raising a setpoint, shifting a workload, throttling GPUs — triggers a tradeoff modal:

> "Raising cooling setpoints by 3C saves 12% energy ($340K/year) but increases water consumption by 8% in a region where residents are already under watering restrictions."

The operator must explicitly acknowledge the tradeoff. The decision and acknowledgment are permanently logged.

---

## Slide 14: Why Digital Twins, Not Dashboards

| | Dashboard | Digital Twin |
|---|---|---|
| Current state | Yes | Yes |
| "What happens if CRAH-3 fails at 2 AM?" | No | Physics-based simulation |
| Cross-layer dependencies | Siloed | Unified: GPU load -> power -> cooling -> water -> community |
| Predictive | Statistical | Physics-informed |

A dashboard tells you what IS happening. A digital twin tells you what WILL happen.

---

## Slide 15: The Opportunity — It's Mostly Software

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

## Slide 16: Proven Results in the Wild

- **Google DeepMind**: 40% cooling energy reduction using ML
- **ASHRAE setpoint optimization**: 50-60% cooling savings at zero capex
- **Digital twin deployments**: 15-25% operational cost reduction within 2 years (IDC, 2024)
- **Equinix portfolio**: PUE improved from 1.59 to 1.48 across 260+ facilities

---

## Slide 17: The 5% Number

If we prevent just **5%** of global data center waste:

| Metric | Savings | Equivalent |
|---|---|---|
| Electricity | 23-25 TWh/year | Ireland's annual consumption |
| Carbon | 10-12.5M tonnes CO2 | 2.5M cars off the road |
| Water | 75-120B liters/year | Drinking water for 1.5M people |
| Cost | $12.5-15B/year | Fund UN clean water for 2+ years |

---

## Slide 18: The Regulatory Tailwind

- **EU Energy Efficiency Directive**: Mandatory reporting for all data centers >500 kW (effective 2024)
- **EU AI Act**: Training energy consumption disclosure required
- **Germany**: PUE target of 1.2 by 2027
- **US**: Oregon first state with mandatory reporting; SEC climate disclosure rule advancing
- **Carbon pricing**: EU ETS at ~$80-100/tonne — inefficiency now has a direct cost

The window for voluntary action is closing. Tools that enable compliance become essential.

---

## Slide 19: The Regulatory Argument

> "We regulate factories that produce chemicals. We regulate factories that produce energy. We regulate factories that produce food. Why do we not regulate factories that produce intelligence?"

---

## Slide 20: Future Vision

- **Real telemetry integration**: Connect to actual DCIM/BMS systems
- **AI nutrition labels**: Per-query resource cost transparency for end users
- **Community dashboards**: Public-facing impact visibility for affected neighborhoods
- **Policy integration**: Automated compliance reporting for EU EED, AI Act
- **Multi-site optimization**: Portfolio-level digital twin across geographies

---

## Slide 21: What We Built & What We Learned

- Full-stack TypeScript monorepo in hackathon timeframe
- Real-time 3D digital twin with React Three Fiber
- WebSocket-driven simulation engine with cross-layer dependencies
- Ethics-first design: tradeoff acknowledgment is architecturally enforced, not bolted on

**Key insight**: The hardest part isn't the technology — it's designing systems that refuse to let humans look away from consequences.

---

## Slide 22: Close

**Every operational decision in an AI factory carries a hidden cost. We make it visible, quantifiable, and undeniable.**

*Team: [names]*
*Built for the ShiftSC AI Ethics Hackathon*
