Slides (30 total)



SECTION A: THE PROBLEM (1–10)



Slide 1 — Hook

Layout: Hero Stat (dark, dramatic)

Hero: $1 Billion. Every Single Day.

Sub: Microsoft · Meta · Amazon · Google · Oracle — AI data center spend in 2025

Bottom (orange): In 2026: nearly $2 billion/day

Tagline: The largest infrastructure buildout since the electric grid. No sustainable AI framework governs how it operates.

Notes: Silence. Let the number land. Pause.



Slide 2 — The AI Factory

Layout: Title + Quote

Title: The AI Factory

Quote (large, italic, green accents):

 "Data centers are factories — AI factories that take in raw data and produce intelligence." — Jensen Huang, CEO, NVIDIA

One-liner below: Every token → a GPU → a rack → power from a grid → cooled by water → in someone's community.



Slide 3 — The Scale

Layout: Title + Table

Title: The Scale of the Buildout

Company 2024 2025 2026 Amazon $59B $100B+ $200B Google $52B $75B $175-185B Microsoft $44B $80B $120B+ Meta $37B $60-65B $115-135B Oracle $12-15B $40B+ $50B Total $200B $355B+ $690-750B

Callout (orange): Capex/sales 2026: Oracle 86% · Meta 54% · Microsoft 47% · Google 46%

Footer: Quadrupled since GPT-4. Aggregate capex now exceeds free cash flow.



Slide 4 — The Four Costs

Layout: 2x2 stat cards

Title: The Environmental Footprint of Computation

Card Stat Detail Energy (blue) 460 TWh/yr → 1,000+ TWh by 2026 (more than Japan) Water (blue) 5.6B gallons Google alone, 2023. +17% YoY Carbon (orange) +48% Google emissions 2019→2023 E-Waste (orange) 1.2–5M tons AI e-waste by 2030. GPU life: 18-24 months

Footer: Every AI query has an energy, water, carbon, and hardware cost. Operators see none at decision time.



Slide 5 — Energy

Layout: Hero Stat + Bullets

Hero: 460 TWh/year — global DC electricity

Ireland: 21% of national electricity = data centers

1 AI query = 5-10x electricity of a Google search

Utilities delaying coal plant retirements for DC demand

1,000+ TWh by 2026 — more than Japan



Slide 6 — Water

Layout: Hero Stat + Bullets

Hero: 5.6 Billion Gallons — Google, 2023

50 GPT-4 prompts = 500ml water (one bottle)

The Dalles, OR (pop. 15K): Google uses 25-30% of city water — residents faced restrictions during drought

Microsoft: +34% water since 2021. Meta: +24%

Callout (orange): All 3 hyperscalers pledged water reduction. All 3 went the opposite direction.



Slide 7 — Carbon & E-Waste

Layout: Two columns

Title: Carbon Emissions & Hardware Waste

Carbon E-Waste GPT-4 training: 5,000-10,000t CO2 AI e-waste: 1.2–5M tons by 2030 = 500 transatlantic flights GPU obsolescence: 18-24 months (was 5yr) Google: +48% emissions (2019-23) Contains rare earths, gold, lead, mercury 60-70% of ML energy = inference Cobalt/lithium mining: child labor, toxic runoff, aquifer depletion (DRC, Chile)



Slide 8 — Who Pays the Price

Layout: Two sections

Title: Who Pays the Price

Communities (orange stats):

Prince William County, VA: displaced majority-Black/Latino neighborhoods

Chicago: DC-adjacent communities = 23% lower income than county avg

$500M+ facility → 30-50 permanent jobs

Virginia: $750M tax breaks (2016-23) — lowest job-to-subsidy ratio in any industry

Supply Chain (orange stats):

Cobalt (DRC): child labor, deforestation

Lithium (Chile): depleting aquifers in driest regions

E-waste disposal: exported to Ghana, Nigeria, India — informal recycling → lead/mercury exposure

Water: DCs compete with agriculture/residential in drought-stressed regions

Footer: Cost borne at every stage: extraction → operation → disposal. Upside rarely shared.



Slide 9 — The Feedback Loop

Layout: Title + Circular diagram

Title: Why It Gets Worse

Diagram (circular arrows, green cycle, orange trap callout):

More capable models → More users → More inference → More data centers → More electricity → More power plants → More water → More carbon → Climate worsens → More AI climate solutions needed → More compute → REPEAT 

Callout: 20-30 year facility lifetimes. Decisions made now = emissions through 2050.



Slide 10 — Problem Statement

Layout: Section Divider (dramatic)

Title: Operators Are Flying Blind

Sub: Sustainability data lives in annual reports and disconnected dashboards. Never in the operational loop. Never at the moment of decision.

Tagline (green, large): "You can't optimize what you can't see. You can't be accountable for what you don't acknowledge."



SECTION B: THE SOLUTION (11–16)



Slide 11 — Our Solution

Layout: Title + Bullets + Screenshot

Title: A Sustainable AI Framework for the AI Factory

Sub: Real-time 3D digital twin. Makes the environmental footprint of computation visible, quantifiable, and non-dismissable.

Feature Detail 5 infrastructure layers Power · Cooling · GPU · Workload · Location Live simulation WebSocket-driven, 2-second updates What-if scenarios Test decisions before committing Ethical tradeoff gate Every action requires sustainability acknowledgment

Right: [SCREENSHOT: Full dashboard — 3D twin + metrics overlay]



Slide 12 — Demo Flow

Layout: Horizontal timeline (7 steps with icons)

Title: The Operator Journey

Step Action 1. Monitor 3D twin + live metrics across 5 layers 2. Alert Cooling drops, water spikes 3. Investigate Drill into cross-layer cascading effects 4. Simulate What-if: raise setpoints, shift loads, swap HW 5. Decide Choose an action 6. Acknowledge Forced modal: "Saves X energy, increases Y water stress on Z community" 7. Log Decision + acknowledgment stored permanently

Footer: [LIVE DEMO HERE if presenting]



Slide 13 — Technical Architecture

Layout: Title + Diagram + 3 callout cards

Title: Under the Hood

Diagram:

┌─────────────────────┐   WebSocket (2s)   ┌─────────────────────┐ │  BACKEND            │ ─────────────────→  │  FRONTEND           │ │  Simulation Engine  │                     │  Zustand Store      │ │  ├─ Tick loop       │    REST API         │  React Three Fiber  │ │  ├─ Drift model     │ ←─────────────────→ │  ├─ 3D Scene        │ │  ├─ Dependencies    │                     │  ├─ Health colors    │ │  ├─ Alerts          │                     │  ├─ 60fps interp    │ │  └─ Recommendations │                     │  Ethical Gate       │ │  5 Layers:          │                     │  └─ Tradeoff modal  │ │  Power·Cool·GPU     │                     │                     │ │  Workload·Location  │                     │                     │ └─────────────────────┘                     └─────────────────────┘          ▲          Shared Types (single source of truth)         ▲          └────────────────────────────────────────────────────────┘ 

3 cards:

Dependency graph: GPU load → power draw → cooling demand → water consumption → community impact. Not independent metrics.

Shared types: Single TypeScript package enforces backend/frontend contract. Zero runtime mismatches.

3D perf: 60fps interpolation from 2-second state ticks. Smooth despite discrete simulation.

Tech stack: TypeScript monorepo · Node/Express · React/Three.js · Zustand · WebSocket



Slide 14 — Product Screenshots

Layout: Gallery (3 images)

Title: The Product

Screenshot Caption [SCREENSHOT: Main 3D view + dashboard] Real-time 3D twin with live metrics across 5 layers [SCREENSHOT: Tradeoff modal] Forced sustainability acknowledgment before any action [SCREENSHOT: Layer detail / what-if panel] Cross-layer dependencies + scenario simulation

NOTE: Replace with actual screenshots before presenting. Judges score Design (15%) on visual evidence.



Slide 15 — Sustainability Built In

Layout: Title + 2 example cards

Title: Sustainability — Built In, Not Bolted On

Card 1 (green border):

Raise cooling setpoints → "Saves 12% energy ($340K/yr), but increases water consumption 8% in drought-stressed region"

Card 2 (orange border):

Shift workload to cheaper grid → "Saves $18K/month, but increases carbon intensity 34% = 200 additional cars/year"

Operator must acknowledge before commit

Every decision + acknowledgment permanently logged

A sustainability framework inside the operational loop — not a quarterly CSR report



Slide 16 — What's Live Today

Layout: Two columns (green checks vs. gray arrows)

Title: Prototype Status

Working Now ✓ Next Phase → 3D data center rendering (React Three Fiber) Real DCIM/BMS telemetry integration Simulation engine — 2s tick, 5 layers Physics-based CFD thermal simulation Cross-layer dependency propagation Per-GPU predictive degradation curves WebSocket live broadcast Multi-site portfolio optimization Drift model + realistic fluctuation Community-facing public dashboards Alert evaluation + threshold triggers AI nutrition labels per query Recommendation engine Tradeoff modal (enforced, non-bypassable) Decision + acknowledgment logging Layer sidebar + metrics top bar Scenario system

Footer: Left column = functional, demoed live. Right column = roadmap, architecturally prepared.



SECTION C: WHY DIGITAL TWINS (17–21)



Slide 17 — E-Waste & Digital Twins

Layout: Hero Stat + Bullets

Hero: 1.2–5.0 Million Tons — AI e-waste by 2030 (Nature Computational Science, 2024)

The problem:

GPU obsolescence: 18-24 months (was 5 years)

Contains gold, copper, rare earths + lead, mercury, chromium

Reuse could cut waste by 42% — if you know when and what to replace

What the digital twin enables:

Per-GPU tracking: Thermal degradation curves → know when each unit drops below efficiency floor

Replace smart, not fast: Prioritize least efficient units → highest sustainability ROI

Circular economy: Simulate redeploying degraded GPUs to lighter workloads vs. decommission

Fleet what-if: "Replace 500 H100s with 200 B200s" → power, cooling, water, carbon impact in seconds



Slide 18 — Twin vs. Dashboard

Layout: Comparison table + Tagline

Title: Why Digital Twins, Not Dashboards

Dashboard Digital Twin Current state ✓ ✓ "What if CRAH-3 fails at 2 AM?" ✗ Physics simulation Cross-layer deps Siloed GPU → power → cooling → water → community Maintenance Threshold alerts Predict when GPU falls below efficiency floor Sustainability Historical reports Simulate impact before committing

Tagline (large, green): A dashboard shows what IS. A digital twin shows what WILL BE.



Slide 19 — Predictive Sustainability

Layout: Title + Table + Stats bar

Title: Predictive Maintenance → Predictive Sustainability

Sub: "When will it fail?" → "When does it become unsustainable?"

Capability Enables GPU thermal degradation Replace before efficiency drops → energy-efficient next-gen Cooling system wear Maintain before water/energy spikes PSU aging curves Swap when efficiency < 90% → reduce waste heat Fleet lifecycle Replace least efficient first → max sustainability ROI

Stats bar (4 columns, large green numbers): 30-45% ↓ downtime · 20-25% ↑ asset life · 25-30% ↓ maintenance cost · 98% prediction accuracy



Slide 20 — NVIDIA Stack

Layout: Title + Table + Deployments

Title: The NVIDIA Stack Powering This

Tech Purpose Impact Omniverse DSX GW-scale AI factory digital twin Unified facility simulation DSX Boost Max-Q efficiency +30% throughput same power DSX Flex Grid demand balancing 100 GW underutilized capacity DSX Exchange IT/OT integration Real-time APIs to power, cooling, safety Modulus Physics-informed NNs (PINNs) 10-100x faster than CFD cuOpt Workload placement Carbon-aware scheduling Earth-2 Climate simulation 1000x faster site planning

Deployed now:

Equinix: 5kW air-cooled → Blackwell GPU racks — planned in Omniverse first

Schneider Electric: Power/cooling designs for GB300 NVL72 at extreme density

Nscale + Caterpillar: Multi-GW AI factory, West Virginia

ETAP (Mar 2025): First electrical digital twin, grid-to-chip



Slide 21 — AI Stack Position

Layout: Title + Stack diagram + Two columns

Title: Where We Operate

Stack (green = us, gray = other layers):

  Application · Inference · Training          [gray]   ─────────────────────────────────────────   ★ GPU / Compute    — efficiency, thermal    [GREEN]   ★ Cooling          — water, energy, setpts  [GREEN]   ★ Power            — grid, carbon, renew    [GREEN]   ★ Facility         — community, justice     [GREEN]   ─────────────────────────────────────────   Networking · Silicon                        [gray] 

Today Next Monitoring, what-if, tradeoff enforcement ↑ Workload scheduling by carbon intensity Power · Cooling · GPU · Facility ↓ Hardware lifecycle / e-waste reduction



SECTION D: IMPACT & PROOF (22–25)



Slide 22 — Architecture Recommendations

Layout: Three columns

Title: Energy-Efficient Data Center Architecture

Sub: What a digital twin validates before a dollar is spent

Cooling Power Facility Direct liquid cooling: 45% PUE improvement On-site renewable + storage Modular prefab: months not years (17.4% CAGR) Zero-water designs (Microsoft 2026) Carbon-aware load balancing: 5-15% ↓ carbon Waste heat reuse → district heating Immersion: 50% ↓ cooling energy Micro-grid: decouple from stressed grids Low-carbon materials, circular construction

Footer (green): The twin tests all changes virtually — full sustainability tradeoff visibility before capital commitment.



Slide 23 — Software Opportunity

Layout: Hero Stat + Table

Hero: 90 TWh/year wasted globally ($9B)

Sub: Avg PUE 1.58 vs. best 1.10 = 30% waste. 60-70% of the gap is software/ops.

Lever Impact ASHRAE cooling setpoints 10-15% energy savings AI-driven cooling +5-10% additional Carbon-aware scheduling 5-15% carbon reduction Kill zombie servers (30% idle) 5-15% IT energy

Footer: Composite: 20-30% ↓ energy, 25-40% ↓ carbon — no hardware changes.



Slide 24 — Proof

Layout: 2x2 stat cards (large green numbers)

Title: Proven in the Real World

Stat Source 40% ↓ cooling energy Google DeepMind (ML optimization) 50-60% ↓ cooling cost ASHRAE setpoint optimization (zero capex) 15-25% ↓ operational cost Digital twin deployments, 2 years (IDC 2024) 1.59 → 1.48 PUE Equinix, 260+ facilities



Slide 25 — The 5% Number

Layout: Hero + Table

Hero: What if we fixed just 5%?

Metric Savings = Electricity 23-25 TWh/yr Ireland's annual consumption Carbon 10-12.5M tonnes 2.5M cars off the road Water 75-120B liters/yr Drinking water for 1.5M people Cost $12.5-15B/yr UN clean water initiative × 2 years



SECTION E: CONTEXT & CLOSE (26–30)



Slide 26 — Regulatory Tailwind

Layout: Title + Bullets

Title: The Regulatory Tailwind

EU Energy Efficiency Directive (2024): mandatory reporting, all DCs >500 kW

EU AI Act: training energy disclosure required

Germany: PUE target 1.2 by 2027 (new builds)

US: Oregon first mandatory reporting state; SEC climate rule advancing

EU ETS: €80-100/tonne CO2 — inefficiency has a direct cost

Callout (green): Voluntary action window closing. Compliance tools become essential.



Slide 27 — The Quote

Layout: Hero Quote (full slide, very large)

"We regulate factories that produce chemicals. We regulate factories that produce energy. We regulate factories that produce food. Why do we not regulate factories that produce intelligence?"



Slide 28 — Future Vision

Layout: Title + Roadmap (5 items, arrow progression)

Title: Where This Goes

Phase What 1 Real telemetry — connect to DCIM/BMS (Schneider, Siemens) 2 AI nutrition labels — "This response: 12ml water, 0.3g CO2" 3 Community dashboards — public impact visibility for neighborhoods 4 Policy integration — auto-compliance for EU EED, AI Act, SEC 5 Multi-site optimization — portfolio-level twin across geographies



Slide 29 — What We Built & Learned

Layout: Two sections

Title: What We Built & What We Learned

Built:

Full-stack TypeScript monorepo — hackathon timeframe

Real-time 3D digital twin: React Three Fiber + WebSocket simulation

Cross-layer dependency modeling, 5 infrastructure layers

Ethics-first architecture: tradeoff acknowledgment structurally enforced

Learned (personal/reflective):

3D sync was new territory — 60fps interpolation from 2s state ticks was our hardest technical problem

Dependencies were harder than expected — GPU throttle cascading through power → cooling → water → community required a full dependency graph rethink

Ethics-first changed everything — the non-optional tradeoff gate shaped every architectural decision

Domain deep-dive — PUE, cooling thermodynamics, environmental justice. Changed how we think about the AI tools we use daily

Callout (green): The hardest part isn't the technology — it's designing systems that refuse to let humans look away from consequences.

Notes: This targets Learning & Ambition (15%). Be genuine. Adapt bullet wording to match actual team experience.



Slide 30 — Close

Layout: Hero text + Team

Line 1 (large, green): Every operational decision in an AI factory carries a hidden cost.

Line 2 (large, green): We make it visible, quantifiable, and undeniable.

Team: [Insert names]

Event: Built for the ShiftSC AI Ethics Hackathon

Links: [GitHub / Contact]



Appendix (hidden slide)

Sources: IEA 2024 · Goldman Sachs 2024 · McKinsey 2024 · Nature Computational Science 2024 · Ren et al. 2023 · Google/Microsoft/Meta Environmental Reports 2023-24 · Futurum "AI Capex 2026" · Epoch AI · NVIDIA GTC 2024/CES 2025 · Omniverse DSX Blueprint (Oct 2025) · Vera Rubin DSX (2026) · Schneider+NVIDIA (Oct 2025) · ETAP (Mar 2025) · EU Directive 2023/1791 · Uptime Institute 2023 · IDC 2024 · DeepMind 2016/2018 · Good Jobs First · Crawford, Atlas of AI (2021)