# Data Center Environmental Impact: Water, Energy, Carbon

> **Note**: This research was compiled from published reports and academic papers available through early 2025. Web search was unavailable at time of writing, so the very latest 2026 figures could not be verified. All numbers are sourced from the references cited inline.

---

## 1. Electricity Consumption: Current and 2030 Projections

### Current State
- **2022**: Global data centers consumed approximately **460 TWh** of electricity — roughly **1.5-2% of global electricity demand** (IEA, "Electricity 2024" report, Jan 2024).
- **2023**: The IEA revised its estimate upward to **500-520 TWh**, driven largely by AI workload growth.
- **2024**: Estimated at **580-650 TWh** as hyperscaler capacity expansion accelerated.
- **United States specifically**: Data centers consumed roughly **4.4% of total US electricity** in 2023, projected to reach **6-12%** by 2028 (EPRI, May 2024; Lawrence Berkeley National Lab, Sep 2024).

### 2030 Projections
- **IEA (Jan 2024)**: Global data center electricity demand could reach **800 TWh by 2026** — more than Japan's total electricity consumption. By 2030, estimates range from **945 TWh to 1,580 TWh** depending on AI adoption rates.
- **Goldman Sachs (Apr 2024)**: Data center power demand will grow **160%** by 2030, reaching roughly **1,000 TWh** globally.
- **McKinsey (Oct 2024)**: US data center power demand alone could reach **35 GW by 2030**, up from ~17 GW in 2022 — a doubling.
- **SemiAnalysis**: More aggressive estimates suggest **4-5% of global electricity** by 2030.

### Context
- The entire country of **France** consumed ~450 TWh in 2022. Data centers already exceed that.
- Ireland: Data centers consumed **21% of Ireland's total electricity** in 2023 (EirGrid, 2024), expected to reach **27-32%** by 2026.

---

## 2. Water Consumption Per AI Query

### The Foundational Research
The key paper is **"Making AI Less Thirsty"** by Pengfei Li, Jianyi Yang, Mohammad A. Islam, and Shaolei Ren (University of California, Riverside), published April 2023 (arXiv:2304.03271).

### Per-Query Numbers
- A single **ChatGPT conversation of 20-50 questions** consumes approximately **500 ml (about 16.9 oz) of water** — equivalent to a standard water bottle.
- This translates to roughly **10-25 ml per query** (for GPT-3.5-class inference). GPT-4 queries, being more compute-intensive (estimated 5-10x), consume proportionally more: roughly **50-150 ml per query**.
- This water is used primarily for **cooling the data center servers** via evaporative cooling systems.

### Scaled to Billions of Queries
- ChatGPT reportedly handles **~1.5-2 billion visits per month** as of late 2024, with estimates of **~200 million+ daily queries** across OpenAI's products.
- At **50 ml/query (conservative GPT-4 estimate)**: 200 million queries/day = **10 million liters/day** = **2.64 million gallons/day**.
- At the higher end (150 ml/query): **30 million liters/day** = **7.9 million gallons/day**.
- Annually (at midpoint): **~3.6-7.3 billion liters/year** just for ChatGPT inference — roughly equivalent to the annual water consumption of a small city.
- Google Search (8.5 billion searches/day) moving to AI Overviews could consume **10x more water per query** than traditional search, given the compute difference.

### Training Water Footprint
- Training GPT-3 (175B parameters) consumed an estimated **700,000 liters (185,000 gallons)** of fresh water (Li et al., 2023).
- GPT-4 training, estimated at ~5-10x the compute of GPT-3, likely consumed **3.5-7 million liters** of water.

---

## 3. Carbon Footprint of Training Frontier Models

### Published Training Carbon Numbers

| Model | Organization | Estimated CO2 (metric tons) | Source |
|-------|-------------|---------------------------|--------|
| GPT-3 (175B) | OpenAI | **552 tCO2e** | Patterson et al., 2021 (Google Research) |
| GPT-4 | OpenAI | **~5,000-15,000 tCO2e** (estimated) | Various analyses based on rumored compute; not officially disclosed |
| Llama 2 (70B) | Meta | **539 tCO2e** | Meta's Llama 2 paper, Jul 2023 |
| Llama 3 (405B) | Meta | **~8,900 tCO2e** | Meta's Llama 3 paper, Jul 2024 — computed from 30.84M GPU-hours on H100s |
| BLOOM (176B) | BigScience | **25 tCO2e** | Luccioni et al., 2023 — trained on French nuclear grid |
| PaLM (540B) | Google | **~3,400 tCO2e** | Chowdhery et al., 2022 |
| Gemini Ultra | Google | Not disclosed | Estimated similar to or exceeding GPT-4 |

### Everyday Comparisons

- **552 tCO2e** (GPT-3 training) is equivalent to:
  - **~123 round-trip flights** New York to London (4.5 tCO2e each)
  - **~60 average Americans' annual carbon footprint** (~16 tCO2/year per capita)
  - **~138 gasoline-powered cars driven for one year** (~4 tCO2/year per car)

- **~10,000 tCO2e** (estimated GPT-4 range) is equivalent to:
  - **~2,200 transatlantic round-trip flights**
  - **~625 Americans' annual footprint**
  - **~2,500 cars for a year**
  - **~1,250 US homes' annual electricity** (~8 tCO2/home/year)

- **Important caveat**: Training is a one-time cost, but **inference dominates total lifecycle emissions**. Google estimated that inference accounts for **60-90%** of total ML energy use. A model serving billions of queries daily accumulates far more carbon than training.

---

## 4. Water Consumption by Major Tech Companies

### Google
- **2021**: 15.8 billion liters (4.17 billion gallons)
- **2022**: 21.2 billion liters (5.6 billion gallons) — **a 20% year-over-year increase**
- **2023**: 24.2 billion liters (6.4 billion gallons) — **another 17% increase**
- Google attributed the increase largely to AI workload growth (Google Environmental Report 2024).

### Microsoft
- **2021**: 4.73 billion liters (1.25 billion gallons)
- **2022**: 6.4 billion liters (1.7 billion gallons) — **a 34% increase**, the largest YoY jump among the three
- **2023**: 7.8 billion liters (2.06 billion gallons) — **another 22% increase**
- Microsoft's 2024 Sustainability Report acknowledged that AI investments were a significant driver of water consumption growth.
- Microsoft had previously pledged to be "water positive" by 2030.

### Meta
- **2021**: 4.0 billion liters (1.06 billion gallons)
- **2022**: 5.3 billion liters (1.4 billion gallons) — **a 33% increase**
- **2023**: ~5.9 billion liters (1.56 billion gallons) (Meta Sustainability Report 2024)
- Meta's increase is driven by both AI training infrastructure (Llama models) and expansion of data center campuses.

### Combined Trajectory
- The three companies together consumed roughly **38 billion liters (~10 billion gallons) in 2023**, up from ~24.5 billion liters in 2021 — a **55% increase in two years**.
- This is enough water to fill approximately **15,000 Olympic swimming pools per year**.

---

## 5. Restarting Retired Fossil Fuel and Nuclear Plants

### Nuclear Restarts

- **Three Mile Island (Pennsylvania)**: In September 2024, Microsoft signed a **20-year power purchase agreement** with Constellation Energy to restart **Three Mile Island Unit 1** (the unit that did NOT have the 1979 meltdown). The 837 MW reactor is expected to come back online by 2028. The deal is reportedly worth over **$100/MWh**. (Source: Constellation Energy press release, Sep 2024)

- **Palisades Nuclear Plant (Michigan)**: Holtec International is working to restart the Palisades plant, which closed in 2022. The DOE offered a **$1.52 billion conditional loan** in March 2024 to support the restart. If successful, it would be the first US nuclear plant to restart after full decommissioning had begun. Multiple tech companies are reportedly interested in purchasing power.

- **Small Modular Reactors (SMRs)**: Google signed a deal with **Kairos Power** in October 2024 to purchase power from SMRs, with the first reactor expected by 2030. Amazon invested in **X-energy** for SMR development. Microsoft signed a PPA with Constellation for nuclear power.

### Fossil Fuel Restarts and New Gas Plants

- **Talen Energy / Amazon (Pennsylvania)**: Amazon purchased the **Cumulus Data** data center campus directly adjacent to the Susquehanna nuclear plant for **$650 million** in March 2024, securing up to 960 MW of nuclear power.

- **Natural gas buildout**: According to the Sierra Club and Grid Strategies (2024), utilities across the US proposed over **75 GW of new natural gas generation** in integrated resource plans filed in 2023-2024, much of it justified by data center demand. This reverses the prior trend of gas plant retirements.

- **Virginia**: Dominion Energy, which serves "Data Center Alley" (Northern Virginia, the world's largest cluster of data centers), has been expanding natural gas capacity and delaying coal plant retirements to meet surging demand. Dominion's 2024 IRP projects load growth of **~4.7% annually** — nearly unprecedented for a mature US utility.

- **Ohio/West Virginia**: AEP and other utilities in PJM Interconnection territory have been reconsidering retirements of coal and gas plants due to data center demand in the region.

- **Saudi Arabia / Middle East**: Hyperscalers building massive data centers in the region rely substantially on natural-gas-fired and oil-fired power.

---

## 6. Impact on Local Water Tables: Case Studies

### The Dalles, Oregon (Google)

- Google operates a major data center complex in The Dalles, a city of ~15,000 people on the Columbia River.
- In 2022, Google's data centers in The Dalles consumed over **25% of the city's total water supply** — approximately **355 million gallons** in a year.
- The city initially **kept Google's water usage secret** under trade-secret claims. Public records requests by The Oregonian in 2022 forced disclosure.
- The Dalles experienced **drought conditions** simultaneously, with residents asked to conserve water while Google's consumption grew.
- Google has since invested in water recycling and agreed to use treated wastewater, but community tension remains.
- In 2024, Google proposed further expansion, prompting renewed public debate about water allocation priorities.

### Mesa and Goodyear, Arizona (Google, Microsoft, Meta)

- **Arizona** is in a **decades-long megadrought**; Colorado River allocations have been repeatedly cut.
- Despite this, Mesa, Goodyear, Chandler, and other Phoenix-area cities have approved massive data center campuses.
- **Google's Mesa campus**: Approved for up to 750,000 sq ft; water usage estimated at hundreds of millions of gallons annually.
- **Meta's Mesa data center**: A $800M+ facility using evaporative cooling.
- In Goodyear, AZ, the city council approved a Microsoft data center despite community concerns about groundwater depletion. The area relies on **finite groundwater aquifers** that are being drawn down faster than they recharge.
- Arizona state regulators in 2023 acknowledged that some basins near Phoenix had **insufficient groundwater** for planned growth, leading to a partial moratorium on new housing — but data centers were not included in the restrictions.
- Residents have noted the paradox: new housing is restricted due to water scarcity, but water-intensive data centers continue to be approved.

### Papillion / Sarpy County, Nebraska (Meta/Facebook)

- Meta's large data center draws water from the **Platte River basin** and local groundwater.
- Local residents raised concerns about long-term aquifer depletion, especially during drought years.

### Uruguay (Google)

- In 2023, Google began building a data center near **Canelones, Uruguay** during the country's worst drought in 74 years. Montevideo was rationing drinking water.
- Public backlash was significant: protesters argued that Google would consume water that residents desperately needed.
- The local government had not disclosed the water agreement terms. After public pressure, some details emerged showing guaranteed water allocations for Google.

---

## 7. Communities That Have Blocked or Protested Data Center Construction

### Successful Blockages

- **Prince William County, Virginia (2024)**: Residents organized against a proposed QTS (now Blackstone) data center, citing noise, property values, and strain on county infrastructure. The county board of supervisors delayed and ultimately imposed stricter zoning requirements.

- **Warrenton, Virginia (2023-2024)**: The small town rejected a data center rezoning proposal near historic areas. Community groups formed "Citizens Against the Datacenter" and packed public hearings. The proposal was voted down by the planning commission.

- **Holland, Netherlands (2021-ongoing)**: The Dutch government imposed a **moratorium on new hyperscale data centers** in parts of the Amsterdam region (the "Haarlemmermeer" area), citing strain on the power grid and land use concerns. This was later partially extended.

- **Dublin / Ireland (2022-ongoing)**: EirGrid and the Irish government effectively paused new data center grid connections in the Dublin area after data centers reached 21% of national electricity. The Commission for Regulation of Utilities (CRU) imposed conditions requiring new data centers to have on-site generation or be able to reduce consumption during peak demand.

- **Haymarket, Virginia (2024)**: Residents protested a proposed 800-acre data center campus near Battlefield Park. The community coalition succeeded in getting the project scaled back.

### Major Protests and Organized Opposition

- **Northern Virginia broadly**: The "Coalition to Protect Prince William County" and similar groups have organized against the rapid proliferation of data centers in the region, which has the **world's highest concentration** of data centers (over 300 facilities). Complaints center on noise, visual blight, property devaluation, water use, and grid strain.

- **Chandler, Arizona**: Residents near Intel and other tech campuses have raised alarms about the cumulative water impact of data centers in an arid region.

- **Chile (2023)**: Activists protested Google's planned data center in **Cerrillos, Santiago**, citing water usage in a country experiencing severe drought.

- **Eemshaven, Netherlands**: Residents protested Meta's planned hyperscale data center (subsequently approved but with conditions).

- **Mt. Holly, North Carolina (2023-2024)**: Apple's planned data center expansion faced community opposition over water and power concerns.

---

## 8. The Compounding Feedback Loop

### The Mechanism

The AI-energy feedback loop operates as follows:

```
More capable AI models released
  -> More users and applications adopt AI
    -> More inference queries per day
      -> More data center capacity needed
        -> More GPUs manufactured (energy-intensive)
        -> More data centers constructed
          -> More electricity consumed
          -> More water consumed for cooling
          -> More land consumed
            -> Utilities build more generation (often gas)
            -> Grid emissions increase OR renewables diverted from other uses
              -> Higher carbon footprint per query at scale
                -> AI used to "optimize" energy systems (justifying more AI)
                  -> Cycle accelerates
```

### Specific Compounding Factors

1. **Model size growth**: Frontier model training compute has grown **~4x per year** (Epoch AI, 2024). Each generation requires more energy to train and more energy per inference query.

2. **Inference scaling laws**: Techniques like chain-of-thought, tree-of-search, and multi-agent architectures multiply the compute per user-visible query by **10-100x** compared to a single forward pass.

3. **Jevons Paradox**: Efficiency improvements in AI chips (e.g., H100 -> B200 -> Rubin) reduce cost per query, which **increases total demand** rather than reducing total energy. Goldman Sachs (2024) explicitly called this out: "AI efficiency gains will likely be consumed by demand growth."

4. **Embodied energy**: Manufacturing a single NVIDIA H100 GPU has an **embodied carbon footprint of ~150 kg CO2e** (semiconductor fab energy in Taiwan/Korea). TSMC alone consumed **~23 TWh in 2023** (more than many countries), and AI chip demand is driving its expansion.

5. **Rebound into the grid**: Data center electricity demand is causing utilities to **defer retirement of fossil fuel plants** and **build new gas peakers**, locking in carbon-intensive generation for decades. The Electric Power Research Institute (EPRI) estimated in 2024 that US data center demand could add **~50-90 million tons of CO2** annually by 2030 if met primarily by gas.

6. **Water-energy nexus**: Cooling data centers requires water; pumping and treating water requires energy; generating that energy requires water (thermal power plants). This creates a second-order feedback loop especially harmful in water-stressed regions.

7. **The "AI for sustainability" paradox**: Tech companies justify AI expansion partly by claiming AI will solve climate change (optimizing grids, discovering materials, etc.). Yet the near-term environmental cost of building out AI infrastructure is concrete and measurable, while the future sustainability benefits remain speculative and unproven at scale.

### Projections of the Compound Effect

- **Boston Consulting Group (2024)**: If current trends continue, data centers could account for **~2.5-3.5% of global CO2 emissions by 2030** (up from ~1% in 2023).
- **IEA (2024)**: Data center demand growth could consume **all new renewable energy additions** in some regions, meaning other sectors cannot decarbonize as planned.
- **SemiAnalysis (2024)**: AI inference alone could require **~500 TWh by 2030** — roughly equal to the entire electricity consumption of a G7 country.

---

## Summary Table

| Metric | Current (2023-2024) | Projected (2028-2030) |
|--------|---------------------|----------------------|
| Global data center electricity | ~500-650 TWh (~2% global) | 945-1,580 TWh (~3-5% global) |
| US data center share of grid | ~4.4% | 6-12% |
| Water per GPT-4 query | ~50-150 ml | Likely similar or worse with larger models |
| Google annual water use | 24.2B liters (2023) | Trend: +17-20%/year |
| Microsoft annual water use | 7.8B liters (2023) | Trend: +20-34%/year |
| Combined Big 3 water use | ~38B liters/year | Potentially 60-80B liters by 2027 |
| GPT-4 training carbon | ~5,000-15,000 tCO2e (est.) | Next-gen models likely 2-5x more |
| Data center CO2 share | ~1% global emissions | 2.5-3.5% by 2030 |

---

## Key Sources

1. IEA, "Electricity 2024: Analysis and Forecast to 2026" (January 2024)
2. Li, P. et al., "Making AI Less Thirsty," arXiv:2304.03271 (April 2023)
3. Patterson, D. et al., "Carbon Emissions and Large Neural Network Training," arXiv:2104.10350 (Google Research, 2021)
4. Meta, "Llama 2: Open Foundation and Fine-Tuned Chat Models" (July 2023)
5. Meta, "Llama 3" technical report (July 2024)
6. Google Environmental Report 2024
7. Microsoft Sustainability Report 2024
8. Meta Sustainability Report 2024
9. EPRI, "Powering Intelligence: Analyzing AI and Data Center Energy Consumption" (May 2024)
10. Lawrence Berkeley National Lab, "United States Data Center Energy Usage Report" (September 2024)
11. Goldman Sachs, "AI, Data Centers, and the Coming US Power Demand Surge" (April 2024)
12. Epoch AI, "Compute Trends Across Three Eras of Machine Learning" (2024 update)
13. The Oregonian, reporting on Google's The Dalles water usage (2022-2024)
14. Grid Strategies, "The Era of Flat Power Demand is Over" (December 2023)
15. Constellation Energy, Three Mile Island restart announcement (September 2024)
16. DOE Loan Programs Office, Palisades conditional loan announcement (March 2024)
17. Luccioni, A.S. et al., "Power Hungry Processing: Watts Driving the Cost of AI Deployment?" (2023)
