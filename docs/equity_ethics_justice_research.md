# Equity, Ethics, and Justice Dimensions of AI Data Centers

*Research brief for ShiftSC AI Ethics Hackathon*

---

## 1. Environmental Justice: Who Lives Next to the Cloud?

Data centers are not distributed randomly. They cluster in areas with cheap land, low tax burdens, and permissive zoning -- conditions that correlate strongly with low-income and minority communities.

### Key findings

- **Prince William County, Virginia** -- the epicenter of "Data Center Alley" in Northern Virginia, which handles roughly 70% of global internet traffic. Between 2018 and 2023, rapid data center expansion displaced residential communities in majority-Black and Latino neighborhoods along the Route 234 corridor. Residents reported persistent diesel generator noise (backup power testing), increased truck traffic during construction, and property tax reassessments that raised housing costs without proportional service improvements.

- **South Side Chicago and Elk Grove Village, IL** -- Meta and other hyperscalers sited facilities near historically redlined neighborhoods. A 2022 analysis by the Illinois Environmental Justice Commission found that communities within 1 mile of large data centers had median household incomes 23% below the county average and were disproportionately Black and Hispanic.

- **The Dalles, Oregon** -- Google's massive campus consumes over 25% of the city's water supply (revealed via public records requests reported by *The Oregonian* in 2022). The Dalles has a population of roughly 15,000, with a significant migrant agricultural worker population who depend on the same watershed for farming.

- **Mesa, Arizona and Chandler, Arizona** -- Apple, Google, and Meta facilities in the Phoenix metro area draw tens of millions of gallons annually from aquifers already strained by drought. Nearby tribal nations, including the Salt River Pima-Maricopa Indian Community, have raised concerns about long-term groundwater depletion.

- **Academic framing**: Professor Safiya Umoja Noble (UCLA) and researchers at the AI Now Institute have documented how the environmental costs of AI infrastructure follow the same spatial logic as polluting factories: toward communities with the least political power to resist. A 2023 paper by Shaolei Ren and colleagues at UC Riverside, "Making AI Less Thirsty," quantified that a single GPT-3 training run consumed approximately 700,000 liters of freshwater for cooling, and that operational inference costs are similarly concentrated geographically.

### The pattern

The siting logic is identical to the pattern documented for petrochemical plants, landfills, and incinerators since Robert Bullard's foundational 1990 work *Dumping in Dixie*. The difference is that data centers enjoy a "clean industry" reputation that shields them from the scrutiny applied to traditional polluters.

---

## 2. Benefit Asymmetry: Who Gains, Who Pays

### The value chain is geographically inverted

| Who | Gets | Pays |
|---|---|---|
| **Tech companies** (HQ in SF, Seattle, NYC) | Revenue, market cap, AI capabilities | Capital expenditure (tax-deductible) |
| **End users** (global, affluent) | ChatGPT, cloud services, recommendations | Monthly subscription fees |
| **Local communities** (rural, low-income) | A handful of full-time jobs (typically 30-50 per facility) | Water depletion, noise, grid strain, land use, visual blight, property disruption |

### Specific cost dimensions

- **Water**: A mid-size 30 MW data center using evaporative cooling consumes roughly 100-150 million gallons of water per year -- equivalent to the annual supply of a community of 1,000-2,000 households. In water-stressed regions (Arizona, West Texas, Chile, Uruguay), this creates direct competition with residential and agricultural use.

- **Power grid strain**: In Northern Virginia, Dominion Energy reported in 2023 that data center load growth was driving the need for new high-voltage transmission lines through residential areas. Ireland's national grid operator EirGrid warned in 2022 that data centers could consume 30% of the country's total electricity by 2028, threatening residential supply reliability.

- **Noise**: Backup diesel generators and cooling fans produce sustained noise at 60-75 dB at facility perimeters. Residents near the QTS data center in Ashburn, VA and AWS facilities in Northern Virginia have filed noise complaints documented in Loudoun County public records.

- **Tax incentives**: Virginia, Oregon, Iowa, and other states offer data center tax exemptions worth hundreds of millions annually. A 2023 report by Good Jobs First found that data center tax incentives in Virginia alone totaled over $1 billion between 2010 and 2022, while the facilities generated fewer than 10 jobs per $100 million in investment -- among the lowest job-to-subsidy ratios of any industry.

- **Jobs promise vs. reality**: A typical hyperscale data center employs 30-50 permanent staff after construction. The construction phase (12-24 months) creates temporary jobs, but these are often filled by specialized out-of-state contractors, not local labor.

---

## 3. Data Colonialism: Extraction Under a Different Name

### The pattern

Scholars Nick Couldry and Ulises Mejias coined "data colonialism" in their 2019 book *The Costs of Connection* to describe the appropriation of human life data as raw material. The physical infrastructure dimension extends this: hyperscalers extract natural resources (water, land, grid capacity) from communities that have minimal access to or benefit from the AI services those resources enable.

### Cases

- **Uruguay (2023)**: Google's planned data center in the department of Canelones triggered public protests after it was revealed the facility would consume approximately 7.6 million liters of potable water per day from the public supply, during a period when Montevideo residents faced a severe drought and were receiving brackish tap water. The juxtaposition -- rationed drinking water for citizens, unlimited cooling water for AI servers -- became a flashpoint.

- **Chile**: Google and other hyperscalers have built in the Cerrillos district of Santiago and in Quilicura. Chile is one of the most water-stressed nations in the Western Hemisphere. Indigenous Mapuche communities and agricultural cooperatives have raised concerns about aquifer draw-down.

- **South Africa**: Microsoft's data center regions in Johannesburg and Cape Town draw power from Eskom, a utility that imposes rolling blackouts ("load shedding") on residential customers due to insufficient generation capacity. Data center power purchase agreements effectively create a two-tier system: guaranteed uptime for cloud services, intermittent supply for households.

- **Indigenous lands in North America**: The Salt River Pima-Maricopa Indian Community in Arizona, whose water rights under the 1908 Winters Doctrine are legally senior to municipal claims, has raised concerns about the cumulative impact of Phoenix-area data center water consumption on the Salt River watershed. In New Mexico, Meta's planned facility near the village of Los Lunas (a majority-Hispanic community) drew scrutiny for groundwater impacts.

- **Nordic "clean energy" narrative**: While hyperscalers tout facilities in Sweden, Finland, and Norway as "100% renewable," the reality is more complex. These facilities consume renewable megawatts that would otherwise serve residential and industrial decarbonization goals. The IEA noted in its 2024 Electricity report that Nordic data center growth is creating grid congestion that slows electrification of transport and heating.

---

## 4. The 5% Waste Number: What Prevention Is Worth

### Establishing the baseline (as of 2024-2025 estimates)

| Metric | Global data center total (annual) | Source |
|---|---|---|
| Electricity | ~460-500 TWh (1.5-2% of global electricity) | IEA (2024) |
| Carbon emissions | ~200-250 million metric tons CO2e | IEA, extrapolated from energy mix |
| Water consumption | ~4.2-6.6 billion liters/day (cooling + on-site generation) | Estimates from Shehabi et al., Ren et al. |
| Industry revenue/opex | ~$250-300 billion annually in operational spending | Synergy Research, Uptime Institute |

### If we eliminate 5% of waste

| Metric | 5% reduction | Equivalent to... |
|---|---|---|
| **Electricity** | 23-25 TWh saved | The entire annual electricity consumption of Ireland (~30 TWh) or Kenya (~12 TWh). Enough to power 2-2.5 million American homes for a year. |
| **Carbon** | 10-12.5 million metric tons CO2e avoided | Taking 2.5-3 million cars off the road for a year. Roughly equal to the annual emissions of a country like Croatia or Estonia. |
| **Water** | 75-120 billion liters/year saved | Annual drinking water for 1-1.5 million people at WHO minimum standards (50 liters/person/day). Enough to irrigate 20,000-30,000 hectares of farmland. |
| **Dollars** | $12.5-15 billion in operational savings | More than the entire annual GDP of countries like Bermuda or Greenland. Enough to fund the UN's global clean water access initiative (WASH) for 2+ years. |

### Why 5% is achievable

Common sources of data center waste include: overprovisioned cooling (running chillers at full capacity regardless of load), zombie servers (estimated at 15-30% of installed servers by the Uptime Institute), inefficient workload scheduling (running inference jobs during grid peak hours), and PUE gaps (industry average PUE of ~1.55-1.6 vs. best-practice ~1.1). A 5% reduction represents the low-hanging fruit -- achievable through operational optimization without capital-intensive retrofits.

---

## 5. Carbon Labels and Nutrition Labels for AI

### Existing tools and initiatives

- **Cloud Carbon Footprint (CCF)**: Open-source tool (cloudcarbonfootprint.org) created by Thoughtworks. Connects to AWS, GCP, and Azure billing APIs to estimate carbon emissions by service, region, and time period. Uses methodology from Etsy's "Cloud Jewels" approach and EPA emission factors.

- **Microsoft Emissions Impact Dashboard**: Available to enterprise Azure customers since 2021. Reports Scope 1, 2, and 3 carbon emissions attributable to a customer's cloud usage. Uses real-time grid carbon intensity data. Microsoft committed to being carbon negative by 2030.

- **Google Carbon Footprint**: Available in the Google Cloud Console. Reports gross carbon emissions by project, service, and region. Google also provides a "Carbon Free Energy Percentage" (CFE%) for each data center region, showing what fraction of energy comes from carbon-free sources on an hourly basis. Their 2024 Environmental Report disclosed that actual emissions rose 48% from 2019 to 2023, largely due to AI compute growth.

- **AWS Customer Carbon Footprint Tool**: Launched 2022. Shows estimated carbon emissions associated with AWS usage. Less granular than Google's offering. Amazon has been criticized for lack of transparency about Scope 3 emissions.

- **Green Software Foundation**: Industry consortium (Linux Foundation project) developing the Software Carbon Intensity (SCI) specification -- a rate-based metric (grams CO2e per functional unit) designed to be the "nutrition label" for software. SCI = ((E * I) + M) per R, where E = energy, I = grid carbon intensity, M = embodied emissions, R = functional unit.

- **MLCo2 Impact**: Tool from researchers at Universite de Montreal and Mila for estimating the carbon footprint of training ML models. Published alongside the Strubell et al. (2019) paper "Energy and Policy Considerations for Deep Learning in NLP" which found that training a single large NLP model could emit as much CO2 as five cars over their lifetimes.

### The "nutrition label" concept

Researchers at the AI Now Institute, the Mozilla Foundation, and the Partnership on AI have all proposed mandatory disclosure labels for AI systems. A comprehensive AI "nutrition label" would include:

```
+------------------------------------------+
|        AI MODEL ENVIRONMENTAL LABEL       |
+------------------------------------------+
| Training carbon:     500 tCO2e           |
| Training water:      3.2M liters         |
| Training energy:     1,287 MWh           |
| Inference (per 1K queries): 0.5 kWh     |
| Hardware lifecycle:  Server refresh 4yr  |
| Grid region:         US-WEST (CFE 87%)   |
| Embodied emissions:  120 tCO2e (chips)   |
+------------------------------------------+
| Community impact score: MODERATE          |
| Water stress region: YES                  |
| Environmental justice flag: REVIEW        |
+------------------------------------------+
```

This concept parallels the EU Energy Label system for appliances, which demonstrably shifted consumer and manufacturer behavior over two decades.

---

## 6. Accountability Standards and Frameworks

### Existing standards

- **ISO 14001 (Environmental Management Systems)**: General-purpose EMS standard. Applicable to data centers but not specific to them. Requires organizations to identify environmental aspects, set objectives, and implement controls.

- **ISO 50001 (Energy Management)**: Specifically targets energy performance. Several hyperscalers certify individual facilities. Useful but does not address water, land, or community impact.

- **ISO 30134 series (Data Centre KPIs)**: Specifically designed for data centers. Includes PUE (30134-2), Renewable Energy Factor (30134-3), and Water Usage Effectiveness (30134-9, published 2023). This is the closest thing to an industry-specific environmental standard.

- **EN 50600 series (European)**: European standard for data center design and operation. Includes energy efficiency requirements increasingly tied to EU Taxonomy for sustainable activities.

- **EU Energy Efficiency Directive (2023 recast)**: Article 12 mandates that data centers above 500 kW report energy performance, PUE, water use, waste heat utilization, and renewable energy share to a public EU database starting in 2024. First reporting deadline: May 15, 2024. This is the world's first mandatory data center environmental disclosure regime.

- **SEC Climate Disclosure Rule (2024)**: Requires large public companies (including hyperscalers) to report Scope 1 and 2 emissions and climate-related risks. Initially included Scope 3 but this was scaled back. Litigation ongoing as of early 2025.

### Proposed and emerging frameworks

- **IEEE P7010 (Wellbeing Impact Assessment)**: Recommended practice for assessing the impact of autonomous and intelligent systems on human wellbeing. Provides methodology for evaluating community impact of AI infrastructure.

- **NIST AI Risk Management Framework (AI RMF 1.0, 2023)**: Includes "societal impact" as a dimension of trustworthy AI but does not specifically address physical infrastructure environmental costs. The framework's "Map" function (identifying context and impacts) could be extended to cover siting and resource decisions.

- **Partnership on AI's "ABOUT ML" framework**: Focuses on documentation practices for ML systems. Could be extended to require environmental impact statements.

- **The Algorithmic Justice League's audit framework**: Primarily focused on bias, but Joy Buolamwini and others have called for expanding algorithmic audits to include environmental justice dimensions.

- **Proposed: Data Center Environmental Impact Assessment (DC-EIA)**: Analogous to the Environmental Impact Assessments required for mining, manufacturing, and energy projects under NEPA (US) and the EIA Directive (EU). Currently, data centers in most US jurisdictions are classified as "light industrial" and exempt from EIA requirements. Multiple advocacy groups (including the Sierra Club, Earthjustice, and local chapters in Virginia and Oregon) have called for reclassification.

### The gap

No existing standard integrates all of: energy, carbon, water, noise, community impact, and benefit distribution into a single data-center-specific accountability framework. This is the gap our project addresses.

---

## 7. "What If AI Could See the Cost of Its Own Existence?"

### Thought leadership and precedents

- **Kate Crawford, *Atlas of AI* (2021)**: The foundational text arguing that AI must be understood as a physical, extractive industry -- not a disembodied intelligence. Crawford documents the lithium mines, rare earth processing, underwater cables, and cooling systems that constitute AI's material substrate. Key quote: "AI is neither artificial nor intelligent. It is made from natural resources, fuel, human labor, infrastructures, logistics, histories, and classifications."

- **Timnit Gebru, Emily Bender, et al., "On the Dangers of Stochastic Parrots" (2021)**: While focused on language model harms, Section 6 explicitly calls for computing the environmental costs of training and deploying large models, arguing that these costs should be weighed against claimed benefits.

- **Strubell, Ganesh, and McCallum (2019)**: "Energy and Policy Considerations for Deep Learning in NLP." The paper that first quantified training costs of large NLP models and proposed that papers should report compute costs alongside accuracy metrics -- a form of infrastructure self-awareness at the research level.

- **The concept of "reflexive AI"**: Philosopher Luciano Floridi (Oxford Internet Institute) has written about the need for AI systems to incorporate feedback loops about their own resource consumption. In his "translucent" AI framework, systems should be capable of reporting not just their outputs but the costs of producing those outputs.

- **Microsoft's internal carbon tax**: Since 2012, Microsoft has charged its business units an internal carbon fee (initially $15/ton, raised to $100/ton by 2024). This is a concrete implementation of making infrastructure "see" its own cost -- the carbon price flows into product planning and architectural decisions.

- **The "AI mirror" concept**: Researchers at the Montreal AI Ethics Institute have proposed that AI systems should include a mandatory "resource reflection" module -- a subsystem that logs and exposes energy, water, and carbon costs per inference. The idea: if GPT could "see" that answering a question cost 0.001 kWh and 10ml of water, it could factor that into response strategies (e.g., shorter responses for trivial queries, cached responses where possible).

- **Our project's contribution**: The AI Factory Digital Twin operationalizes this concept. By rendering the physical infrastructure, resource flows, and community impacts of a data center in real-time -- and requiring operators to acknowledge tradeoffs before acting -- we create a system where the cost of AI's existence is not hidden but foregrounded. The ethical acknowledgment modal is the mechanism by which the system "sees" its own impact and forces humans to see it too.

---

## 8. The Justice Framing: Regulating Intelligence Factories

### The argument

> "We regulate factories that produce chemicals. We regulate factories that produce energy. We regulate factories that produce food. Why do we not regulate factories that produce intelligence?"

This framing draws on three established regulatory precedents:

### Precedent 1: Clean Air Act and Clean Water Act (US)

Chemical plants and power stations must obtain permits, monitor emissions, report publicly, and reduce pollution according to technology-based standards (Best Available Technology) and health-based standards (NAAQS). Data centers -- which emit carbon, consume water, generate noise, and produce e-waste -- are exempt from equivalent scrutiny because they are classified as "light commercial" or "office" use in most zoning codes.

### Precedent 2: Environmental Impact Statements (NEPA, 1970)

Any "major federal action significantly affecting the quality of the human environment" requires an EIS. Data center construction on federal land or with federal subsidies should arguably trigger this requirement, but rarely does in practice. The 2023 CHIPS Act allocated $52.7 billion for semiconductor manufacturing with EIS requirements; no equivalent exists for the data centers those chips populate.

### Precedent 3: Food labeling (FDA Nutrition Facts, 1990)

The Nutrition Labeling and Education Act mandated that food products disclose ingredients and nutritional content. The parallel: AI services should disclose their environmental "ingredients" -- the energy, water, carbon, and community cost embedded in each query, each training run, each model deployment.

### Why "intelligence factories" is the right frame

1. **Scale**: Global data center electricity consumption (~500 TWh) exceeds the total electricity use of most individual countries. This is industrial-scale resource consumption.

2. **Concentration**: Five companies (Amazon, Microsoft, Google, Meta, Apple) control the vast majority of hyperscale capacity. This is industrial-scale market concentration, analogous to the steel or oil industries at their peaks.

3. **Externalities**: The costs of data center operations (carbon, water, noise, grid strain, community disruption) are borne by communities that did not choose and do not benefit from the products. This is the textbook definition of a negative externality that justifies regulation.

4. **Opacity**: Unlike a chemical plant, whose emissions are visible (smokestacks, discharge pipes), a data center's environmental impact is invisible to neighbors and users alike. This information asymmetry is precisely what disclosure regulation is designed to correct.

5. **Precedent in other "clean" industries**: The semiconductor fabrication industry was initially perceived as "clean" compared to heavy manufacturing. It took decades to recognize that fab plants used enormous quantities of toxic chemicals and ultrapure water. Data centers are at a similar inflection point.

### The regulatory gap

As of mid-2025, the only mandatory data center environmental disclosure regime in the world is the EU Energy Efficiency Directive (Article 12), effective 2024. The US has no federal data center environmental reporting requirement. Most US states exempt data centers from the environmental review processes applied to manufacturing facilities of equivalent resource intensity. This gap is not accidental -- it reflects successful industry lobbying and the persistent myth that digital infrastructure is "clean."

---

## Summary: The Ethical Imperative

The AI industry is constructing the largest physical infrastructure buildout since the electric grid -- and doing so with less environmental oversight than a mid-size chemical plant. The communities that host this infrastructure are disproportionately low-income and non-white. The resources consumed (water, energy, land) are drawn from regions already under stress. The benefits flow to technology companies and their affluent global user base. The costs are local, invisible, and uncompensated.

A digital twin that renders these costs visible -- that forces operators to confront the water, carbon, and community consequences of every operational decision -- is not just a monitoring tool. It is an accountability mechanism. It operationalizes the principle that the factories producing intelligence should be held to the same standard as the factories producing chemicals, energy, and food.

---

*Sources draw from: IEA Data Centres and Data Transmission Networks reports (2022-2024); Ren et al., "Making AI Less Thirsty" (2023); Crawford, Atlas of AI (2021); Strubell et al. (2019); Couldry & Mejias, The Costs of Connection (2019); Bullard, Dumping in Dixie (1990); EU Energy Efficiency Directive recast (2023); ISO 30134 series; Green Software Foundation SCI specification; Cloud Carbon Footprint project; Good Jobs First subsidy tracker; public utility filings from Dominion Energy, EirGrid, and Eskom; news reporting from The Oregonian, The Guardian, Reuters, and MIT Technology Review.*
