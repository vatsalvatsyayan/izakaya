const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "AI Factory Digital Twin Team";
pres.title = "AI Factory Digital Twin — Sustainable AI Framework";

// Design system
const BG = "0A0E17";
const GREEN = "00E5A0";
const ORANGE = "FF6B35";
const BLUE = "3B82F6";
const WHITE = "FFFFFF";
const GRAY = "94A3B8";
const DARK2 = "111827";
const DARK3 = "1A1F2E";
const CARD_BG = "141925";

// Helpers
function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

function addTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.7, y: 0.4, w: 8.6, h: 0.7,
    fontSize: 36, bold: true, color: WHITE,
    fontFace: "Arial",
    ...opts,
  });
}

function addSubtitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.7, y: 1.15, w: 8.6, h: 0.5,
    fontSize: 16, color: GRAY,
    fontFace: "Arial",
    ...opts,
  });
}

function addCard(slide, x, y, w, h, borderColor) {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h,
    fill: { color: CARD_BG },
    line: { color: borderColor || DARK3, width: 1 },
    rectRadius: 0.1,
  });
}

function addFooter(slide, text, color) {
  slide.addText(text, {
    x: 0.7, y: 5.0, w: 8.6, h: 0.4,
    fontSize: 12, color: color || GRAY,
    fontFace: "Arial",
  });
}

// ============================================================
// SLIDE 1 — Hook
// ============================================================
{
  const s = darkSlide();
  s.addText("$1 Billion. Every Single Day.", {
    x: 0.7, y: 1.0, w: 8.6, h: 1.2,
    fontSize: 54, bold: true, color: GREEN,
    fontFace: "Arial", align: "center",
  });
  s.addText("Microsoft  ·  Meta  ·  Amazon  ·  Google  ·  Oracle\nAI data center spend in 2025", {
    x: 1.5, y: 2.4, w: 7, h: 0.8,
    fontSize: 18, color: GRAY, fontFace: "Arial", align: "center",
  });
  s.addText("In 2026: nearly $2 billion/day", {
    x: 1.5, y: 3.4, w: 7, h: 0.5,
    fontSize: 20, bold: true, color: ORANGE, fontFace: "Arial", align: "center",
  });
  s.addText("The largest infrastructure buildout since the electric grid.\nNo sustainable AI framework governs how it operates.", {
    x: 1.0, y: 4.2, w: 8, h: 0.8,
    fontSize: 14, color: GRAY, fontFace: "Arial", align: "center",
  });
}

// ============================================================
// SLIDE 2 — The AI Factory
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The AI Factory");
  // green accent bar
  s.addShape(pres.ShapeType.rect, { x: 0.7, y: 1.2, w: 0.05, h: 1.4, fill: { color: GREEN } });
  s.addText([
    { text: '"Data centers are factories — AI factories that take in raw data and produce intelligence."', options: { italic: true, fontSize: 22, color: WHITE } },
    { text: "\n", options: { breakLine: true, fontSize: 10 } },
    { text: "— Jensen Huang, CEO, NVIDIA", options: { fontSize: 14, color: GREEN } },
  ], { x: 1.0, y: 1.3, w: 8, h: 1.4, fontFace: "Arial", valign: "middle" });
  s.addText("Every token  >  a GPU  >  a rack  >  power from a grid  >  cooled by water  >  in someone's community.", {
    x: 0.7, y: 3.2, w: 8.6, h: 0.5, fontSize: 16, color: GRAY, fontFace: "Arial",
  });
}

// ============================================================
// SLIDE 3 — The Scale
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The Scale of the Buildout");

  const rows = [
    ["Company", "2024", "2025", "2026"],
    ["Amazon", "$59B", "$100B+", "$200B"],
    ["Google", "$52B", "$75B", "$175-185B"],
    ["Microsoft", "$44B", "$80B", "$120B+"],
    ["Meta", "$37B", "$60-65B", "$115-135B"],
    ["Oracle", "$12-15B", "$40B+", "$50B"],
    ["Total", "$200B", "$355B+", "$690-750B"],
  ];

  const tableRows = rows.map((row, i) => row.map((cell, j) => ({
    text: cell,
    options: {
      fontSize: 13,
      color: i === 0 ? GREEN : (i === rows.length - 1 ? GREEN : WHITE),
      bold: i === 0 || i === rows.length - 1 || j === 3,
      fontFace: "Arial",
      fill: { color: i === 0 ? DARK3 : (i % 2 === 0 ? CARD_BG : BG) },
      border: [{ color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }],
      align: j === 0 ? "left" : "right",
      margin: [4, 8, 4, 8],
    },
  })));

  s.addTable(tableRows, { x: 0.7, y: 1.3, w: 8.6, colW: [2, 2, 2.2, 2.4] });

  s.addText("Capex/sales 2026:  Oracle 86%  ·  Meta 54%  ·  Microsoft 47%  ·  Google 46%", {
    x: 0.7, y: 4.3, w: 8.6, h: 0.4, fontSize: 13, color: ORANGE, fontFace: "Arial",
  });
  addFooter(s, "Quadrupled since GPT-4. Aggregate capex now exceeds free cash flow.");
}

// ============================================================
// SLIDE 4 — The Four Costs
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The Environmental Footprint of Computation");

  const cards = [
    { stat: "460 TWh/yr", label: "Energy", detail: "1,000+ TWh by 2026 (more than Japan)", color: BLUE, x: 0.7, y: 1.4 },
    { stat: "5.6B gallons", label: "Water", detail: "Google alone, 2023. +17% YoY", color: BLUE, x: 5.1, y: 1.4 },
    { stat: "+48%", label: "Carbon", detail: "Google emissions 2019-2023", color: ORANGE, x: 0.7, y: 3.2 },
    { stat: "1.2-5M tons", label: "E-Waste", detail: "AI e-waste by 2030. GPU life: 18-24 months", color: ORANGE, x: 5.1, y: 3.2 },
  ];

  cards.forEach(c => {
    addCard(s, c.x, c.y, 4.2, 1.5, c.color);
    s.addText(c.label, { x: c.x + 0.3, y: c.y + 0.15, w: 3.6, h: 0.35, fontSize: 13, color: c.color, fontFace: "Arial", bold: true });
    s.addText(c.stat, { x: c.x + 0.3, y: c.y + 0.45, w: 3.6, h: 0.55, fontSize: 32, bold: true, color: WHITE, fontFace: "Arial" });
    s.addText(c.detail, { x: c.x + 0.3, y: c.y + 1.0, w: 3.6, h: 0.35, fontSize: 12, color: GRAY, fontFace: "Arial" });
  });
}

// ============================================================
// SLIDE 5 — Energy
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Energy");
  s.addText("460 TWh/year", { x: 0.7, y: 1.3, w: 8.6, h: 0.8, fontSize: 48, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Global data center electricity consumption", { x: 0.7, y: 2.1, w: 8.6, h: 0.4, fontSize: 16, color: GRAY, fontFace: "Arial" });

  const bullets = [
    "Ireland: 21% of national electricity = data centers",
    "1 AI query = 5-10x electricity of a Google search",
    "Utilities delaying coal plant retirements for DC demand",
    "1,000+ TWh by 2026 — more than Japan",
  ];
  bullets.forEach((b, i) => {
    s.addText(b, { x: 1.0, y: 2.8 + i * 0.45, w: 8, h: 0.4, fontSize: 15, color: WHITE, fontFace: "Arial", bullet: true });
  });
}

// ============================================================
// SLIDE 6 — Water
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Water");
  s.addText("5.6 Billion Gallons", { x: 0.7, y: 1.3, w: 8.6, h: 0.8, fontSize: 48, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Google, 2023", { x: 0.7, y: 2.1, w: 8.6, h: 0.4, fontSize: 16, color: GRAY, fontFace: "Arial" });

  const bullets = [
    "50 GPT-4 prompts = 500ml water (one bottle)",
    "The Dalles, OR (pop. 15K): Google uses 25-30% of city water",
    "Microsoft: +34% water since 2021.  Meta: +24%",
  ];
  bullets.forEach((b, i) => {
    s.addText(b, { x: 1.0, y: 2.8 + i * 0.45, w: 8, h: 0.4, fontSize: 15, color: WHITE, fontFace: "Arial", bullet: true });
  });
  s.addText("All 3 hyperscalers pledged water reduction. All 3 went the opposite direction.", {
    x: 0.7, y: 4.3, w: 8.6, h: 0.4, fontSize: 14, bold: true, color: ORANGE, fontFace: "Arial",
  });
}

// ============================================================
// SLIDE 7 — Carbon & E-Waste
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Carbon Emissions & Hardware Waste");

  // Left column - Carbon
  addCard(s, 0.7, 1.3, 4.2, 3.4, ORANGE);
  s.addText("Carbon", { x: 1.0, y: 1.45, w: 3.6, h: 0.4, fontSize: 20, bold: true, color: ORANGE, fontFace: "Arial" });
  const carbonBullets = [
    "GPT-4 training: 5,000-10,000t CO2",
    "= 500 transatlantic flights",
    "Google: +48% emissions (2019-23)",
    "60-70% of ML energy = inference",
  ];
  carbonBullets.forEach((b, i) => {
    s.addText(b, { x: 1.2, y: 2.0 + i * 0.5, w: 3.4, h: 0.4, fontSize: 13, color: WHITE, fontFace: "Arial", bullet: true });
  });

  // Right column - E-Waste
  addCard(s, 5.1, 1.3, 4.2, 3.4, ORANGE);
  s.addText("E-Waste", { x: 5.4, y: 1.45, w: 3.6, h: 0.4, fontSize: 20, bold: true, color: ORANGE, fontFace: "Arial" });
  const ewasteBullets = [
    "AI e-waste: 1.2-5M tons by 2030",
    "GPU obsolescence: 18-24 months (was 5yr)",
    "Contains rare earths, gold, lead, mercury",
    "Cobalt/lithium mining: child labor, toxic runoff",
  ];
  ewasteBullets.forEach((b, i) => {
    s.addText(b, { x: 5.6, y: 2.0 + i * 0.5, w: 3.4, h: 0.4, fontSize: 13, color: WHITE, fontFace: "Arial", bullet: true });
  });
}

// ============================================================
// SLIDE 8 — Who Pays the Price
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Who Pays the Price");

  // Communities
  addCard(s, 0.7, 1.3, 4.2, 3.0, ORANGE);
  s.addText("Communities", { x: 1.0, y: 1.45, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: ORANGE, fontFace: "Arial" });
  const comm = [
    "Prince William County, VA: displaced Black/Latino neighborhoods",
    "Chicago: DC-adjacent = 23% lower income",
    "$500M+ facility > 30-50 permanent jobs",
    "Virginia: $750M tax breaks — lowest job-to-subsidy ratio",
  ];
  comm.forEach((b, i) => {
    s.addText(b, { x: 1.2, y: 2.0 + i * 0.5, w: 3.4, h: 0.45, fontSize: 11, color: WHITE, fontFace: "Arial", bullet: true });
  });

  // Supply Chain
  addCard(s, 5.1, 1.3, 4.2, 3.0, ORANGE);
  s.addText("Supply Chain", { x: 5.4, y: 1.45, w: 3.6, h: 0.4, fontSize: 18, bold: true, color: ORANGE, fontFace: "Arial" });
  const supply = [
    "Cobalt (DRC): child labor, deforestation",
    "Lithium (Chile): depleting driest aquifers",
    "E-waste exported to Ghana, Nigeria, India",
    "DCs compete with agriculture in drought regions",
  ];
  supply.forEach((b, i) => {
    s.addText(b, { x: 5.6, y: 2.0 + i * 0.5, w: 3.4, h: 0.45, fontSize: 11, color: WHITE, fontFace: "Arial", bullet: true });
  });

  addFooter(s, "Cost borne at every stage: extraction > operation > disposal. Upside rarely shared.", ORANGE);
}

// ============================================================
// SLIDE 9 — The Feedback Loop
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Why It Gets Worse");

  const steps = [
    "More capable models",
    "More users",
    "More inference",
    "More data centers",
    "More electricity",
    "More water & carbon",
    "Climate worsens",
    "More AI climate solutions needed",
    "More compute",
  ];

  // Circular-ish flow using cards
  steps.forEach((step, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 1.2 + col * 2.8;
    const y = 1.4 + row * 1.3;
    addCard(s, x, y, 2.4, 0.8, i >= 6 ? ORANGE : GREEN);
    s.addText(step, { x: x + 0.1, y: y + 0.1, w: 2.2, h: 0.6, fontSize: 12, color: WHITE, fontFace: "Arial", align: "center", valign: "middle" });
    if (i < steps.length - 1 && col < 2) {
      s.addText(">", { x: x + 2.4, y: y + 0.15, w: 0.4, h: 0.5, fontSize: 18, color: GREEN, fontFace: "Arial", align: "center", valign: "middle" });
    }
  });

  s.addText("20-30 year facility lifetimes. Decisions made now = emissions through 2050.", {
    x: 0.7, y: 4.6, w: 8.6, h: 0.4, fontSize: 13, bold: true, color: ORANGE, fontFace: "Arial",
  });
}

// ============================================================
// SLIDE 10 — Problem Statement (Section Divider)
// ============================================================
{
  const s = darkSlide();
  s.addText("Operators Are Flying Blind", {
    x: 0.7, y: 1.2, w: 8.6, h: 1.0,
    fontSize: 44, bold: true, color: WHITE, fontFace: "Arial", align: "center",
  });
  s.addText("Sustainability data lives in annual reports and disconnected dashboards.\nNever in the operational loop. Never at the moment of decision.", {
    x: 1.0, y: 2.5, w: 8, h: 1.0,
    fontSize: 18, color: GRAY, fontFace: "Arial", align: "center",
  });
  s.addShape(pres.ShapeType.rect, { x: 1.5, y: 3.6, w: 7, h: 0.03, fill: { color: GREEN } });
  s.addText('"You can\'t optimize what you can\'t see.\nYou can\'t be accountable for what you don\'t acknowledge."', {
    x: 1.0, y: 3.8, w: 8, h: 1.0,
    fontSize: 22, bold: true, color: GREEN, fontFace: "Arial", align: "center", italic: true,
  });
}

// ============================================================
// SLIDE 11 — Our Solution
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "A Sustainable AI Framework for the AI Factory");
  addSubtitle(s, "Real-time 3D digital twin. Makes the environmental footprint of computation visible, quantifiable, and non-dismissable.");

  const features = [
    { label: "5 Infrastructure Layers", detail: "Power  ·  Cooling  ·  GPU  ·  Workload  ·  Location", color: GREEN },
    { label: "Live Simulation", detail: "WebSocket-driven, 2-second updates", color: BLUE },
    { label: "What-If Scenarios", detail: "Test decisions before committing", color: BLUE },
    { label: "Ethical Tradeoff Gate", detail: "Every action requires sustainability acknowledgment", color: ORANGE },
  ];

  features.forEach((f, i) => {
    const y = 2.0 + i * 0.8;
    addCard(s, 0.7, y, 8.6, 0.65, f.color);
    s.addText(f.label, { x: 1.0, y: y + 0.05, w: 3, h: 0.55, fontSize: 15, bold: true, color: f.color, fontFace: "Arial", valign: "middle" });
    s.addText(f.detail, { x: 4.0, y: y + 0.05, w: 5, h: 0.55, fontSize: 14, color: WHITE, fontFace: "Arial", valign: "middle" });
  });
}

// ============================================================
// SLIDE 12 — Demo Flow
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The Operator Journey");

  const steps = [
    { num: "1", label: "Monitor", desc: "3D twin + live metrics" },
    { num: "2", label: "Alert", desc: "Cooling drops, water spikes" },
    { num: "3", label: "Investigate", desc: "Cross-layer cascading" },
    { num: "4", label: "Simulate", desc: "What-if scenarios" },
    { num: "5", label: "Decide", desc: "Choose an action" },
    { num: "6", label: "Acknowledge", desc: "Forced sustainability modal" },
    { num: "7", label: "Log", desc: "Decision stored permanently" },
  ];

  steps.forEach((st, i) => {
    const x = 0.5 + i * 1.3;
    // number circle
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: 1.5, w: 0.5, h: 0.5, fill: { color: i === 5 ? ORANGE : GREEN } });
    s.addText(st.num, { x: x + 0.25, y: 1.5, w: 0.5, h: 0.5, fontSize: 18, bold: true, color: BG, fontFace: "Arial", align: "center", valign: "middle" });
    s.addText(st.label, { x: x, y: 2.2, w: 1.1, h: 0.4, fontSize: 13, bold: true, color: WHITE, fontFace: "Arial", align: "center" });
    s.addText(st.desc, { x: x, y: 2.6, w: 1.1, h: 0.6, fontSize: 10, color: GRAY, fontFace: "Arial", align: "center" });
  });

  // arrows between steps
  for (let i = 0; i < 6; i++) {
    const x = 0.5 + i * 1.3 + 1.1;
    s.addText(">", { x, y: 1.55, w: 0.2, h: 0.4, fontSize: 16, color: GRAY, fontFace: "Arial", align: "center", valign: "middle" });
  }

  s.addText("LIVE DEMO", {
    x: 3.5, y: 4.2, w: 3, h: 0.6,
    fontSize: 20, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ============================================================
// SLIDE 13 — Technical Architecture
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Under the Hood");

  // Backend box
  addCard(s, 0.5, 1.3, 4.0, 2.8, GREEN);
  s.addText("BACKEND", { x: 0.8, y: 1.4, w: 3.4, h: 0.35, fontSize: 16, bold: true, color: GREEN, fontFace: "Arial" });
  const backendItems = ["Simulation Engine", "Tick loop (2s)", "Drift model", "Cross-layer dependencies", "Alert evaluation", "Recommendation engine"];
  backendItems.forEach((item, i) => {
    s.addText(item, { x: 1.0, y: 1.85 + i * 0.35, w: 3.2, h: 0.3, fontSize: 12, color: WHITE, fontFace: "Arial" });
  });

  // Arrow
  s.addText("WebSocket (2s)  >>", { x: 4.3, y: 2.0, w: 1.5, h: 0.4, fontSize: 11, color: GREEN, fontFace: "Arial", align: "center" });
  s.addText("<<  REST API", { x: 4.3, y: 2.5, w: 1.5, h: 0.4, fontSize: 11, color: BLUE, fontFace: "Arial", align: "center" });

  // Frontend box
  addCard(s, 5.5, 1.3, 4.0, 2.8, BLUE);
  s.addText("FRONTEND", { x: 5.8, y: 1.4, w: 3.4, h: 0.35, fontSize: 16, bold: true, color: BLUE, fontFace: "Arial" });
  const frontendItems = ["Zustand Store", "React Three Fiber", "3D Scene + Health colors", "60fps interpolation", "Ethical Gate", "Tradeoff modal"];
  frontendItems.forEach((item, i) => {
    s.addText(item, { x: 6.0, y: 1.85 + i * 0.35, w: 3.2, h: 0.3, fontSize: 12, color: WHITE, fontFace: "Arial" });
  });

  // Shared types bar
  addCard(s, 0.5, 4.3, 9.0, 0.5, GREEN);
  s.addText("Shared Types (single source of truth)", { x: 0.8, y: 4.35, w: 8.4, h: 0.4, fontSize: 13, bold: true, color: GREEN, fontFace: "Arial", align: "center" });

  s.addText("TypeScript monorepo  ·  Node/Express  ·  React/Three.js  ·  Zustand  ·  WebSocket", {
    x: 0.7, y: 5.0, w: 8.6, h: 0.3, fontSize: 11, color: GRAY, fontFace: "Arial", align: "center",
  });
}

// ============================================================
// SLIDE 14 — Product Screenshots (placeholder)
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The Product");

  const screenshots = [
    { label: "Real-time 3D twin with\nlive metrics across 5 layers", x: 0.5 },
    { label: "Forced sustainability\nacknowledgment before any action", x: 3.5 },
    { label: "Cross-layer dependencies\n+ scenario simulation", x: 6.5 },
  ];

  screenshots.forEach(sc => {
    addCard(s, sc.x, 1.4, 2.8, 2.5, DARK3);
    s.addText("[SCREENSHOT]", { x: sc.x + 0.2, y: 1.7, w: 2.4, h: 1.2, fontSize: 16, color: GRAY, fontFace: "Arial", align: "center", valign: "middle" });
    s.addText(sc.label, { x: sc.x + 0.2, y: 3.2, w: 2.4, h: 0.6, fontSize: 11, color: WHITE, fontFace: "Arial", align: "center" });
  });

  s.addText("Replace with actual screenshots before presenting. Judges score Design (15%) on visual evidence.", {
    x: 0.7, y: 4.4, w: 8.6, h: 0.4, fontSize: 12, italic: true, color: ORANGE, fontFace: "Arial",
  });
}

// ============================================================
// SLIDE 15 — Sustainability Built In
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Sustainability — Built In, Not Bolted On");

  // Card 1 - green
  addCard(s, 0.7, 1.4, 8.6, 1.2, GREEN);
  s.addText([
    { text: "Raise cooling setpoints  >  ", options: { fontSize: 14, color: WHITE, bold: true } },
    { text: '"Saves 12% energy ($340K/yr), but increases water consumption 8% in drought-stressed region"', options: { fontSize: 13, color: GRAY, italic: true } },
  ], { x: 1.0, y: 1.5, w: 8, h: 1.0, fontFace: "Arial", valign: "middle" });

  // Card 2 - orange
  addCard(s, 0.7, 2.8, 8.6, 1.2, ORANGE);
  s.addText([
    { text: "Shift workload to cheaper grid  >  ", options: { fontSize: 14, color: WHITE, bold: true } },
    { text: '"Saves $18K/month, but increases carbon intensity 34% = 200 additional cars/year"', options: { fontSize: 13, color: GRAY, italic: true } },
  ], { x: 1.0, y: 2.9, w: 8, h: 1.0, fontFace: "Arial", valign: "middle" });

  const points = [
    "Operator must acknowledge before commit",
    "Every decision + acknowledgment permanently logged",
    "A sustainability framework inside the operational loop — not a quarterly CSR report",
  ];
  points.forEach((p, i) => {
    s.addText(p, { x: 1.0, y: 4.2 + i * 0.35, w: 8, h: 0.3, fontSize: 13, color: WHITE, fontFace: "Arial", bullet: true });
  });
}

// ============================================================
// SLIDE 16 — What's Live Today
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Prototype Status");

  const working = [
    "3D data center rendering (React Three Fiber)",
    "Simulation engine — 2s tick, 5 layers",
    "Cross-layer dependency propagation",
    "WebSocket live broadcast",
    "Drift model + realistic fluctuation",
    "Alert evaluation + threshold triggers",
    "Recommendation engine",
    "Tradeoff modal (enforced, non-bypassable)",
    "Decision + acknowledgment logging",
    "Layer sidebar + metrics top bar",
    "Scenario system",
  ];

  const next = [
    "Real DCIM/BMS telemetry integration",
    "Physics-based CFD thermal simulation",
    "Per-GPU predictive degradation",
    "Multi-site portfolio optimization",
    "Community-facing public dashboards",
    "AI nutrition labels per query",
  ];

  // Headers
  s.addText("Working Now", { x: 0.7, y: 1.25, w: 4.2, h: 0.35, fontSize: 15, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Next Phase", { x: 5.3, y: 1.25, w: 4.2, h: 0.35, fontSize: 15, bold: true, color: GRAY, fontFace: "Arial" });

  working.forEach((item, i) => {
    s.addText("+" + "  " + item, { x: 0.7, y: 1.7 + i * 0.3, w: 4.4, h: 0.28, fontSize: 10.5, color: WHITE, fontFace: "Arial" });
  });

  next.forEach((item, i) => {
    s.addText(">" + "  " + item, { x: 5.3, y: 1.7 + i * 0.3, w: 4.4, h: 0.28, fontSize: 10.5, color: GRAY, fontFace: "Arial" });
  });

  addFooter(s, "Left column = functional, demoed live. Right column = roadmap, architecturally prepared.");
}

// ============================================================
// SLIDE 17 — E-Waste & Digital Twins
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "E-Waste & Digital Twins");
  s.addText("1.2 - 5.0 Million Tons", { x: 0.7, y: 1.3, w: 8.6, h: 0.8, fontSize: 44, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("AI e-waste by 2030 (Nature Computational Science, 2024)", { x: 0.7, y: 2.1, w: 8.6, h: 0.4, fontSize: 14, color: GRAY, fontFace: "Arial" });

  // Two columns
  s.addText("The Problem", { x: 0.7, y: 2.7, w: 4.2, h: 0.35, fontSize: 15, bold: true, color: ORANGE, fontFace: "Arial" });
  const prob = ["GPU obsolescence: 18-24 months (was 5yr)", "Contains gold, copper, rare earths + toxins", "Reuse could cut waste by 42%"];
  prob.forEach((b, i) => {
    s.addText(b, { x: 0.9, y: 3.1 + i * 0.4, w: 4, h: 0.35, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true });
  });

  s.addText("What the Twin Enables", { x: 5.3, y: 2.7, w: 4.2, h: 0.35, fontSize: 15, bold: true, color: GREEN, fontFace: "Arial" });
  const sol = ["Per-GPU thermal degradation tracking", "Replace smart, not fast — highest ROI", "Circular economy: redeploy to lighter loads", "Fleet what-if: instant impact analysis"];
  sol.forEach((b, i) => {
    s.addText(b, { x: 5.5, y: 3.1 + i * 0.4, w: 4, h: 0.35, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true });
  });
}

// ============================================================
// SLIDE 18 — Twin vs. Dashboard
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Why Digital Twins, Not Dashboards");

  const rows = [
    ["", "Dashboard", "Digital Twin"],
    ["Current state", "Yes", "Yes"],
    ["What if CRAH-3 fails at 2 AM?", "No", "Physics simulation"],
    ["Cross-layer deps", "Siloed", "GPU > power > cooling > water > community"],
    ["Maintenance", "Threshold alerts", "Predict when GPU falls below floor"],
    ["Sustainability", "Historical reports", "Simulate impact before committing"],
  ];

  const tableRows = rows.map((row, i) => row.map((cell, j) => ({
    text: cell,
    options: {
      fontSize: 12,
      color: i === 0 ? GREEN : (j === 2 ? GREEN : (j === 1 ? ORANGE : WHITE)),
      bold: i === 0,
      fontFace: "Arial",
      fill: { color: i === 0 ? DARK3 : (i % 2 === 0 ? CARD_BG : BG) },
      border: [{ color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }],
      margin: [4, 8, 4, 8],
    },
  })));

  s.addTable(tableRows, { x: 0.5, y: 1.3, w: 9.0, colW: [2.5, 2.0, 4.5] });

  s.addText("A dashboard shows what IS. A digital twin shows what WILL BE.", {
    x: 0.7, y: 4.5, w: 8.6, h: 0.6, fontSize: 22, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ============================================================
// SLIDE 19 — Predictive Sustainability
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Predictive Maintenance > Predictive Sustainability");
  addSubtitle(s, '"When will it fail?"  >  "When does it become unsustainable?"');

  const caps = [
    { cap: "GPU thermal degradation", enables: "Replace before efficiency drops" },
    { cap: "Cooling system wear", enables: "Maintain before water/energy spikes" },
    { cap: "PSU aging curves", enables: "Swap when efficiency < 90%" },
    { cap: "Fleet lifecycle", enables: "Replace least efficient first" },
  ];

  caps.forEach((c, i) => {
    const y = 2.0 + i * 0.65;
    addCard(s, 0.7, y, 4.0, 0.55, GREEN);
    s.addText(c.cap, { x: 0.9, y: y + 0.05, w: 3.6, h: 0.45, fontSize: 13, color: WHITE, fontFace: "Arial", valign: "middle" });
    s.addText(c.enables, { x: 5.0, y: y + 0.05, w: 4.5, h: 0.45, fontSize: 13, color: GRAY, fontFace: "Arial", valign: "middle" });
  });

  // Stats bar
  const stats = [
    { val: "30-45%", label: "less downtime" },
    { val: "20-25%", label: "longer asset life" },
    { val: "25-30%", label: "lower maint. cost" },
    { val: "98%", label: "prediction accuracy" },
  ];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 2.3;
    addCard(s, x, 4.6, 2.1, 0.8, GREEN);
    s.addText(st.val, { x: x + 0.1, y: 4.62, w: 1.9, h: 0.45, fontSize: 22, bold: true, color: GREEN, fontFace: "Arial", align: "center" });
    s.addText(st.label, { x: x + 0.1, y: 5.05, w: 1.9, h: 0.3, fontSize: 10, color: GRAY, fontFace: "Arial", align: "center" });
  });
}

// ============================================================
// SLIDE 20 — NVIDIA Stack
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The NVIDIA Stack Powering This");

  const rows = [
    ["Tech", "Purpose", "Impact"],
    ["Omniverse DSX", "GW-scale AI factory digital twin", "Unified facility simulation"],
    ["DSX Boost", "Max-Q efficiency", "+30% throughput same power"],
    ["DSX Flex", "Grid demand balancing", "100 GW underutilized capacity"],
    ["DSX Exchange", "IT/OT integration", "Real-time APIs"],
    ["Modulus", "Physics-informed NNs", "10-100x faster than CFD"],
    ["cuOpt", "Workload placement", "Carbon-aware scheduling"],
    ["Earth-2", "Climate simulation", "1000x faster site planning"],
  ];

  const tableRows = rows.map((row, i) => row.map((cell, j) => ({
    text: cell,
    options: {
      fontSize: 11,
      color: i === 0 ? GREEN : (j === 2 ? GREEN : WHITE),
      bold: i === 0 || j === 0,
      fontFace: "Arial",
      fill: { color: i === 0 ? DARK3 : (i % 2 === 0 ? CARD_BG : BG) },
      border: [{ color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }],
      margin: [3, 6, 3, 6],
    },
  })));

  s.addTable(tableRows, { x: 0.5, y: 1.2, w: 9.0, colW: [2.0, 3.5, 3.5] });
}

// ============================================================
// SLIDE 21 — AI Stack Position
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Where We Operate");

  const layers = [
    { label: "Application  ·  Inference  ·  Training", ours: false },
    { label: "GPU / Compute — efficiency, thermal", ours: true },
    { label: "Cooling — water, energy, setpoints", ours: true },
    { label: "Power — grid, carbon, renewables", ours: true },
    { label: "Facility — community, justice", ours: true },
    { label: "Networking  ·  Silicon", ours: false },
  ];

  layers.forEach((l, i) => {
    const y = 1.3 + i * 0.6;
    const color = l.ours ? GREEN : DARK3;
    addCard(s, 1.5, y, 7, 0.5, color);
    if (l.ours) {
      s.addText("*", { x: 1.7, y: y + 0.05, w: 0.3, h: 0.4, fontSize: 16, bold: true, color: GREEN, fontFace: "Arial" });
    }
    s.addText(l.label, {
      x: 2.0, y: y + 0.05, w: 6, h: 0.4,
      fontSize: 13, color: l.ours ? WHITE : GRAY, fontFace: "Arial", valign: "middle",
    });
  });

  // Today vs Next
  s.addText("Today", { x: 1.0, y: 4.8, w: 4, h: 0.3, fontSize: 14, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Monitoring, what-if, tradeoff enforcement", { x: 1.0, y: 5.1, w: 4, h: 0.3, fontSize: 12, color: WHITE, fontFace: "Arial" });
  s.addText("Next", { x: 5.5, y: 4.8, w: 4, h: 0.3, fontSize: 14, bold: true, color: GRAY, fontFace: "Arial" });
  s.addText("Workload scheduling by carbon intensity", { x: 5.5, y: 5.1, w: 4, h: 0.3, fontSize: 12, color: GRAY, fontFace: "Arial" });
}

// ============================================================
// SLIDE 22 — Architecture Recommendations
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Energy-Efficient Data Center Architecture");
  addSubtitle(s, "What a digital twin validates before a dollar is spent");

  const cols = [
    { title: "Cooling", items: ["Direct liquid cooling: 45% PUE improvement", "Zero-water designs (Microsoft 2026)", "Immersion: 50% less cooling energy"], color: BLUE },
    { title: "Power", items: ["On-site renewable + storage", "Carbon-aware load balancing: 5-15% less carbon", "Micro-grid: decouple from stressed grids"], color: GREEN },
    { title: "Facility", items: ["Modular prefab: months not years (17.4% CAGR)", "Waste heat reuse > district heating", "Low-carbon materials, circular construction"], color: ORANGE },
  ];

  cols.forEach((col, ci) => {
    const x = 0.5 + ci * 3.1;
    addCard(s, x, 1.9, 2.9, 2.8, col.color);
    s.addText(col.title, { x: x + 0.2, y: 2.0, w: 2.5, h: 0.4, fontSize: 16, bold: true, color: col.color, fontFace: "Arial" });
    col.items.forEach((item, i) => {
      s.addText(item, { x: x + 0.3, y: 2.5 + i * 0.6, w: 2.3, h: 0.55, fontSize: 11, color: WHITE, fontFace: "Arial", bullet: true });
    });
  });

  addFooter(s, "The twin tests all changes virtually — full sustainability tradeoff visibility before capital commitment.", GREEN);
}

// ============================================================
// SLIDE 23 — Software Opportunity
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The Software Opportunity");
  s.addText("90 TWh/year wasted globally ($9B)", { x: 0.7, y: 1.3, w: 8.6, h: 0.8, fontSize: 44, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Avg PUE 1.58 vs. best 1.10 = 30% waste. 60-70% of the gap is software/ops.", {
    x: 0.7, y: 2.1, w: 8.6, h: 0.4, fontSize: 14, color: GRAY, fontFace: "Arial",
  });

  const levers = [
    { lever: "ASHRAE cooling setpoints", impact: "10-15% energy savings" },
    { lever: "AI-driven cooling", impact: "+5-10% additional" },
    { lever: "Carbon-aware scheduling", impact: "5-15% carbon reduction" },
    { lever: "Kill zombie servers (30% idle)", impact: "5-15% IT energy" },
  ];

  levers.forEach((l, i) => {
    const y = 2.8 + i * 0.6;
    addCard(s, 0.7, y, 8.6, 0.5, GREEN);
    s.addText(l.lever, { x: 1.0, y: y + 0.05, w: 4.5, h: 0.4, fontSize: 14, color: WHITE, fontFace: "Arial", valign: "middle" });
    s.addText(l.impact, { x: 5.5, y: y + 0.05, w: 3.5, h: 0.4, fontSize: 14, bold: true, color: GREEN, fontFace: "Arial", valign: "middle", align: "right" });
  });

  addFooter(s, "Composite: 20-30% less energy, 25-40% less carbon — no hardware changes.", GREEN);
}

// ============================================================
// SLIDE 24 — Proof
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Proven in the Real World");

  const proofs = [
    { stat: "40%", label: "less cooling energy", source: "Google DeepMind (ML optimization)", x: 0.7, y: 1.4 },
    { stat: "50-60%", label: "less cooling cost", source: "ASHRAE setpoint optimization (zero capex)", x: 5.1, y: 1.4 },
    { stat: "15-25%", label: "lower operational cost", source: "Digital twin deployments, 2 years (IDC 2024)", x: 0.7, y: 3.2 },
    { stat: "1.59>1.48", label: "PUE improvement", source: "Equinix, 260+ facilities", x: 5.1, y: 3.2 },
  ];

  proofs.forEach(p => {
    addCard(s, p.x, p.y, 4.2, 1.5, GREEN);
    s.addText(p.stat, { x: p.x + 0.3, y: p.y + 0.15, w: 3.6, h: 0.7, fontSize: 36, bold: true, color: GREEN, fontFace: "Arial" });
    s.addText(p.label, { x: p.x + 0.3, y: p.y + 0.75, w: 3.6, h: 0.3, fontSize: 14, color: WHITE, fontFace: "Arial" });
    s.addText(p.source, { x: p.x + 0.3, y: p.y + 1.05, w: 3.6, h: 0.3, fontSize: 11, color: GRAY, fontFace: "Arial" });
  });
}

// ============================================================
// SLIDE 25 — The 5% Number
// ============================================================
{
  const s = darkSlide();
  s.addText("What if we fixed just 5%?", { x: 0.7, y: 0.5, w: 8.6, h: 1.0, fontSize: 44, bold: true, color: GREEN, fontFace: "Arial", align: "center" });

  const metrics = [
    { metric: "Electricity", saving: "23-25 TWh/yr", equiv: "Ireland's annual consumption", color: BLUE },
    { metric: "Carbon", saving: "10-12.5M tonnes", equiv: "2.5M cars off the road", color: ORANGE },
    { metric: "Water", saving: "75-120B liters/yr", equiv: "Drinking water for 1.5M people", color: BLUE },
    { metric: "Cost", saving: "$12.5-15B/yr", equiv: "UN clean water initiative x 2 years", color: GREEN },
  ];

  metrics.forEach((m, i) => {
    const y = 1.8 + i * 0.9;
    addCard(s, 0.7, y, 8.6, 0.75, m.color);
    s.addText(m.metric, { x: 1.0, y: y + 0.1, w: 1.8, h: 0.55, fontSize: 16, bold: true, color: m.color, fontFace: "Arial", valign: "middle" });
    s.addText(m.saving, { x: 2.8, y: y + 0.1, w: 2.5, h: 0.55, fontSize: 20, bold: true, color: WHITE, fontFace: "Arial", valign: "middle" });
    s.addText("=  " + m.equiv, { x: 5.5, y: y + 0.1, w: 3.5, h: 0.55, fontSize: 14, color: GRAY, fontFace: "Arial", valign: "middle" });
  });
}

// ============================================================
// SLIDE 26 — Regulatory Tailwind
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "The Regulatory Tailwind");

  const regs = [
    { reg: "EU Energy Efficiency Directive (2024)", detail: "Mandatory reporting, all DCs > 500 kW" },
    { reg: "EU AI Act", detail: "Training energy disclosure required" },
    { reg: "Germany", detail: "PUE target 1.2 by 2027 (new builds)" },
    { reg: "US — Oregon", detail: "First mandatory reporting state; SEC climate rule advancing" },
    { reg: "EU ETS", detail: "EUR 80-100/tonne CO2 — inefficiency has a direct cost" },
  ];

  regs.forEach((r, i) => {
    const y = 1.3 + i * 0.7;
    s.addText(r.reg, { x: 0.7, y, w: 4, h: 0.35, fontSize: 14, bold: true, color: WHITE, fontFace: "Arial" });
    s.addText(r.detail, { x: 4.8, y, w: 4.8, h: 0.35, fontSize: 13, color: GRAY, fontFace: "Arial" });
    if (i < regs.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: 0.7, y: y + 0.5, w: 8.6, h: 0.01, fill: { color: DARK3 } });
    }
  });

  s.addText("Voluntary action window closing. Compliance tools become essential.", {
    x: 0.7, y: 4.8, w: 8.6, h: 0.5, fontSize: 16, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ============================================================
// SLIDE 27 — The Quote
// ============================================================
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.rect, { x: 0.7, y: 1.5, w: 0.06, h: 2.5, fill: { color: GREEN } });
  s.addText('"We regulate factories that produce chemicals.\nWe regulate factories that produce energy.\nWe regulate factories that produce food.\n\nWhy do we not regulate factories\nthat produce intelligence?"', {
    x: 1.2, y: 1.3, w: 8, h: 3.0,
    fontSize: 26, color: WHITE, fontFace: "Arial", italic: true, valign: "middle",
  });
}

// ============================================================
// SLIDE 28 — Future Vision
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "Where This Goes");

  const phases = [
    { phase: "1", what: "Real telemetry — connect to DCIM/BMS (Schneider, Siemens)" },
    { phase: "2", what: "AI nutrition labels — \"This response: 12ml water, 0.3g CO2\"" },
    { phase: "3", what: "Community dashboards — public impact visibility" },
    { phase: "4", what: "Policy integration — auto-compliance for EU EED, AI Act, SEC" },
    { phase: "5", what: "Multi-site optimization — portfolio-level twin" },
  ];

  phases.forEach((p, i) => {
    const y = 1.4 + i * 0.75;
    // Phase number circle
    s.addShape(pres.ShapeType.ellipse, { x: 0.9, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: GREEN } });
    s.addText(p.phase, { x: 0.9, y: y + 0.05, w: 0.5, h: 0.5, fontSize: 18, bold: true, color: BG, fontFace: "Arial", align: "center", valign: "middle" });
    s.addText(p.what, { x: 1.7, y: y, w: 7.5, h: 0.6, fontSize: 15, color: WHITE, fontFace: "Arial", valign: "middle" });
    if (i < phases.length - 1) {
      // connecting line
      s.addShape(pres.ShapeType.rect, { x: 1.13, y: y + 0.55, w: 0.04, h: 0.2, fill: { color: DARK3 } });
    }
  });
}

// ============================================================
// SLIDE 29 — What We Built & Learned
// ============================================================
{
  const s = darkSlide();
  addTitle(s, "What We Built & What We Learned");

  // Built column
  s.addText("Built", { x: 0.7, y: 1.25, w: 4.2, h: 0.35, fontSize: 16, bold: true, color: GREEN, fontFace: "Arial" });
  const built = [
    "Full-stack TypeScript monorepo — hackathon timeframe",
    "Real-time 3D digital twin: React Three Fiber + WebSocket",
    "Cross-layer dependency modeling, 5 infrastructure layers",
    "Ethics-first: tradeoff acknowledgment structurally enforced",
  ];
  built.forEach((b, i) => {
    s.addText(b, { x: 0.9, y: 1.7 + i * 0.45, w: 4, h: 0.4, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true });
  });

  // Learned column
  s.addText("Learned", { x: 5.3, y: 1.25, w: 4.2, h: 0.35, fontSize: 16, bold: true, color: ORANGE, fontFace: "Arial" });
  const learned = [
    "3D sync was new territory — 60fps from 2s ticks was hardest",
    "Dependencies harder than expected — full graph rethink",
    "Ethics-first changed every architectural decision",
    "Domain deep-dive: PUE, thermodynamics, environmental justice",
  ];
  learned.forEach((b, i) => {
    s.addText(b, { x: 5.5, y: 1.7 + i * 0.45, w: 4, h: 0.4, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true });
  });

  s.addText("The hardest part isn't the technology — it's designing systems that refuse to let humans look away from consequences.", {
    x: 0.7, y: 4.2, w: 8.6, h: 0.6, fontSize: 16, bold: true, italic: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ============================================================
// SLIDE 30 — Close
// ============================================================
{
  const s = darkSlide();
  s.addText("Every operational decision in an AI factory\ncarries a hidden cost.", {
    x: 0.7, y: 1.0, w: 8.6, h: 1.2,
    fontSize: 28, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
  s.addText("We make it visible, quantifiable, and undeniable.", {
    x: 0.7, y: 2.4, w: 8.6, h: 0.8,
    fontSize: 28, bold: true, color: WHITE, fontFace: "Arial", align: "center",
  });

  s.addShape(pres.ShapeType.rect, { x: 3.0, y: 3.3, w: 4, h: 0.03, fill: { color: GREEN } });

  s.addText("Built for the ShiftSC AI Ethics Hackathon", {
    x: 0.7, y: 3.6, w: 8.6, h: 0.5,
    fontSize: 16, color: GRAY, fontFace: "Arial", align: "center",
  });
  s.addText("[Team Names]  ·  [GitHub]  ·  [Contact]", {
    x: 0.7, y: 4.3, w: 8.6, h: 0.5,
    fontSize: 14, color: GRAY, fontFace: "Arial", align: "center",
  });
}

// ============================================================
// GENERATE
// ============================================================
pres.writeFile({ fileName: "AI_Factory_Digital_Twin.pptx" })
  .then(() => console.log("Created: AI_Factory_Digital_Twin.pptx"))
  .catch(err => console.error(err));
