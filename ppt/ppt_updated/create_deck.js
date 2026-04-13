const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "AI Factory Digital Twin Team";
pres.title = "AI Factory Digital Twin — Sustainable AI Framework";

// ── Design System ──
const BG = "0A0E17";
const GREEN = "00E5A0";
const ORANGE = "FF6B35";
const BLUE = "3B82F6";
const WHITE = "FFFFFF";
const GRAY = "94A3B8";
const DARK2 = "111827";
const DARK3 = "1A1F2E";
const CARD_BG = "141925";

// ── Layout Constants ──
const MARGIN_L = 0.8;
const MARGIN_R = 0.8;
const CONTENT_W = 10 - MARGIN_L - MARGIN_R; // 8.4
const TITLE_Y = 0.45;
const TITLE_H = 0.65;
const SUB_Y = 1.15;
const SUB_H = 0.45;
const BODY_TOP = 1.8; // consistent start for body content
const FOOTER_Y = 5.05;
const SLIDE_W = 10;
const SLIDE_H = 5.63;

// ── Helpers ──
function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

function addTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: MARGIN_L, y: TITLE_Y, w: CONTENT_W, h: TITLE_H,
    fontSize: 36, bold: true, color: WHITE, fontFace: "Arial",
    ...opts,
  });
}

function addSubtitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: MARGIN_L, y: SUB_Y, w: CONTENT_W, h: SUB_H,
    fontSize: 16, color: GRAY, fontFace: "Arial",
    ...opts,
  });
}

function addCard(slide, x, y, w, h, borderColor) {
  slide.addShape(pres.ShapeType.rect, {
    x, y, w, h,
    fill: { color: CARD_BG },
    line: { color: borderColor || DARK3, width: 1 },
    rectRadius: 0.08,
  });
}

function addFooter(slide, text, color) {
  slide.addText(text, {
    x: MARGIN_L, y: FOOTER_Y, w: CONTENT_W, h: 0.4,
    fontSize: 12, color: color || GRAY, fontFace: "Arial",
  });
}

function addSectionDivider(title, subtitle) {
  const s = darkSlide();
  // Subtle accent line
  s.addShape(pres.ShapeType.rect, { x: MARGIN_L, y: 2.2, w: 2.5, h: 0.04, fill: { color: GREEN } });
  s.addText(title, {
    x: MARGIN_L, y: 2.35, w: CONTENT_W, h: 0.8,
    fontSize: 40, bold: true, color: WHITE, fontFace: "Arial",
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: MARGIN_L, y: 3.15, w: CONTENT_W, h: 0.5,
      fontSize: 18, color: GRAY, fontFace: "Arial",
    });
  }
  return s;
}

function makeTable(slide, rows, opts = {}) {
  const tableRows = rows.map((row, i) => row.map((cell, j) => ({
    text: cell,
    options: {
      fontSize: opts.fontSize || 12,
      color: i === 0 ? GREEN : (opts.colColors ? (opts.colColors[j] || WHITE) : WHITE),
      bold: i === 0 || (opts.boldCol0 && j === 0) || (opts.boldLastCol && j === row.length - 1),
      fontFace: "Arial",
      fill: { color: i === 0 ? DARK3 : (i % 2 === 0 ? CARD_BG : BG) },
      border: [{ color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }, { color: DARK3, pt: 0.5 }],
      align: opts.aligns ? (opts.aligns[j] || "left") : (j === 0 ? "left" : "left"),
      margin: [4, 8, 4, 8],
      valign: "middle",
    },
  })));
  slide.addTable(tableRows, {
    x: opts.x || MARGIN_L, y: opts.y || BODY_TOP,
    w: opts.w || CONTENT_W,
    colW: opts.colW,
    autoPage: false,
  });
}

function addBullets(slide, items, opts = {}) {
  const startY = opts.y || BODY_TOP;
  const spacing = opts.spacing || 0.42;
  const x = opts.x || (MARGIN_L + 0.2);
  const w = opts.w || (CONTENT_W - 0.2);
  items.forEach((b, i) => {
    slide.addText(b, {
      x, y: startY + i * spacing, w, h: spacing,
      fontSize: opts.fontSize || 15, color: opts.color || WHITE,
      fontFace: "Arial", bullet: true, valign: "middle",
    });
  });
}

// Half-width columns
const COL_W = (CONTENT_W - 0.3) / 2; // 4.05
const COL1_X = MARGIN_L;
const COL2_X = MARGIN_L + COL_W + 0.3;

// ============================================================
// SECTION A: THE PROBLEM
// ============================================================

// ── SLIDE 1 — Hook ──
{
  const s = darkSlide();
  s.addText("$1 Billion. Every Single Day.", {
    x: MARGIN_L, y: 1.1, w: CONTENT_W, h: 1.1,
    fontSize: 54, bold: true, color: GREEN, fontFace: "Arial", align: "center",
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
    x: 1.2, y: 4.2, w: 7.6, h: 0.7,
    fontSize: 14, color: GRAY, fontFace: "Arial", align: "center",
  });
}

// ── SLIDE 2 — The AI Factory ──
{
  const s = darkSlide();
  addTitle(s, "The AI Factory");
  // green accent bar
  s.addShape(pres.ShapeType.rect, { x: MARGIN_L, y: BODY_TOP, w: 0.05, h: 1.4, fill: { color: GREEN } });
  s.addText([
    { text: '"Data centers are factories — AI factories that take in raw data and produce intelligence."', options: { italic: true, fontSize: 22, color: WHITE } },
    { text: "\n", options: { breakLine: true, fontSize: 10 } },
    { text: "— Jensen Huang, CEO, NVIDIA", options: { fontSize: 14, color: GREEN } },
  ], { x: MARGIN_L + 0.3, y: BODY_TOP + 0.05, w: CONTENT_W - 0.3, h: 1.3, fontFace: "Arial", valign: "middle" });
  s.addText("Every token  →  a GPU  →  a rack  →  power from a grid  →  cooled by water  →  in someone's community.", {
    x: MARGIN_L, y: 3.6, w: CONTENT_W, h: 0.5, fontSize: 16, color: GRAY, fontFace: "Arial",
  });
}

// ── SLIDE 3 — The Scale ──
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
      valign: "middle",
    },
  })));
  s.addTable(tableRows, { x: MARGIN_L, y: 1.35, w: CONTENT_W, colW: [2.1, 2.1, 2.1, 2.1] });

  s.addText("Capex/sales 2026:  Oracle 86%  ·  Meta 54%  ·  Microsoft 47%  ·  Google 46%", {
    x: MARGIN_L, y: 4.4, w: CONTENT_W, h: 0.4, fontSize: 13, color: ORANGE, fontFace: "Arial",
  });
  addFooter(s, "Quadrupled since GPT-4. Aggregate capex now exceeds free cash flow.");
}

// ── SLIDE 4 — The Four Costs ──
{
  const s = darkSlide();
  addTitle(s, "The Environmental Footprint of Computation");

  const cards = [
    { stat: "460 TWh/yr", label: "Energy", detail: "→ 1,000+ TWh by 2026 (more than Japan)", color: BLUE, col: 0, row: 0 },
    { stat: "5.6B gallons", label: "Water", detail: "Google alone, 2023. +17% YoY", color: BLUE, col: 1, row: 0 },
    { stat: "+48%", label: "Carbon", detail: "Google emissions 2019–2023", color: ORANGE, col: 0, row: 1 },
    { stat: "1.2–5M tons", label: "E-Waste", detail: "AI e-waste by 2030. GPU life: 18–24 months", color: ORANGE, col: 1, row: 1 },
  ];

  cards.forEach(c => {
    const x = c.col === 0 ? COL1_X : COL2_X;
    const y = c.row === 0 ? 1.5 : 3.3;
    addCard(s, x, y, COL_W, 1.5, c.color);
    s.addText(c.label, { x: x + 0.25, y: y + 0.15, w: COL_W - 0.5, h: 0.3, fontSize: 13, color: c.color, fontFace: "Arial", bold: true });
    s.addText(c.stat, { x: x + 0.25, y: y + 0.45, w: COL_W - 0.5, h: 0.55, fontSize: 32, bold: true, color: WHITE, fontFace: "Arial" });
    s.addText(c.detail, { x: x + 0.25, y: y + 1.0, w: COL_W - 0.5, h: 0.35, fontSize: 12, color: GRAY, fontFace: "Arial" });
  });
}

// ── SLIDE 5 — Energy ──
{
  const s = darkSlide();
  addTitle(s, "Energy");
  s.addText("460 TWh/year", { x: MARGIN_L, y: 1.3, w: CONTENT_W, h: 0.8, fontSize: 48, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Global data center electricity consumption", { x: MARGIN_L, y: 2.1, w: CONTENT_W, h: 0.4, fontSize: 16, color: GRAY, fontFace: "Arial" });

  addBullets(s, [
    "Ireland: 21% of national electricity = data centers",
    "1 AI query = 5–10x electricity of a Google search",
    "Utilities delaying coal plant retirements for DC demand",
    "1,000+ TWh by 2026 — more than Japan",
  ], { y: 2.8 });
}

// ── SLIDE 6 — Water ──
{
  const s = darkSlide();
  addTitle(s, "Water");
  s.addText("5.6 Billion Gallons", { x: MARGIN_L, y: 1.3, w: CONTENT_W, h: 0.8, fontSize: 48, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Google, 2023", { x: MARGIN_L, y: 2.1, w: CONTENT_W, h: 0.4, fontSize: 16, color: GRAY, fontFace: "Arial" });

  addBullets(s, [
    "50 GPT-4 prompts = 500ml water (one bottle)",
    "The Dalles, OR (pop. 15K): Google uses 25–30% of city water",
    "Microsoft: +34% water since 2021.  Meta: +24%",
  ], { y: 2.8 });

  s.addText("All 3 hyperscalers pledged water reduction. All 3 went the opposite direction.", {
    x: MARGIN_L, y: 4.3, w: CONTENT_W, h: 0.4, fontSize: 14, bold: true, color: ORANGE, fontFace: "Arial",
  });
}

// ── SLIDE 7 — Carbon & E-Waste ──
{
  const s = darkSlide();
  addTitle(s, "Carbon Emissions & Hardware Waste");

  // Left column - Carbon
  addCard(s, COL1_X, 1.4, COL_W, 3.3, ORANGE);
  s.addText("Carbon", { x: COL1_X + 0.25, y: 1.55, w: COL_W - 0.5, h: 0.4, fontSize: 20, bold: true, color: ORANGE, fontFace: "Arial" });
  const carbonBullets = [
    "GPT-4 training: 5,000–10,000t CO₂",
    "= 500 transatlantic flights",
    "Google: +48% emissions (2019–23)",
    "60–70% of ML energy = inference",
  ];
  carbonBullets.forEach((b, i) => {
    s.addText(b, { x: COL1_X + 0.35, y: 2.1 + i * 0.5, w: COL_W - 0.6, h: 0.45, fontSize: 13, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });

  // Right column - E-Waste
  addCard(s, COL2_X, 1.4, COL_W, 3.3, ORANGE);
  s.addText("E-Waste", { x: COL2_X + 0.25, y: 1.55, w: COL_W - 0.5, h: 0.4, fontSize: 20, bold: true, color: ORANGE, fontFace: "Arial" });
  const ewasteBullets = [
    "AI e-waste: 1.2–5M tons by 2030",
    "GPU obsolescence: 18–24 months (was 5yr)",
    "Contains rare earths, gold, lead, mercury",
    "Cobalt/lithium mining: child labor, toxic runoff",
  ];
  ewasteBullets.forEach((b, i) => {
    s.addText(b, { x: COL2_X + 0.35, y: 2.1 + i * 0.5, w: COL_W - 0.6, h: 0.45, fontSize: 13, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });
}

// ── SLIDE 8 — Who Pays the Price ──
{
  const s = darkSlide();
  addTitle(s, "Who Pays the Price");

  // Communities
  addCard(s, COL1_X, 1.4, COL_W, 3.0, ORANGE);
  s.addText("Communities", { x: COL1_X + 0.25, y: 1.55, w: COL_W - 0.5, h: 0.4, fontSize: 18, bold: true, color: ORANGE, fontFace: "Arial" });
  const comm = [
    "Prince William County, VA: displaced Black/Latino neighborhoods",
    "Chicago: DC-adjacent = 23% lower income",
    "$500M+ facility → 30–50 permanent jobs",
    "Virginia: $750M tax breaks — lowest job-to-subsidy ratio",
  ];
  comm.forEach((b, i) => {
    s.addText(b, { x: COL1_X + 0.35, y: 2.1 + i * 0.5, w: COL_W - 0.6, h: 0.45, fontSize: 11, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });

  // Supply Chain
  addCard(s, COL2_X, 1.4, COL_W, 3.0, ORANGE);
  s.addText("Supply Chain", { x: COL2_X + 0.25, y: 1.55, w: COL_W - 0.5, h: 0.4, fontSize: 18, bold: true, color: ORANGE, fontFace: "Arial" });
  const supply = [
    "Cobalt (DRC): child labor, deforestation",
    "Lithium (Chile): depleting driest aquifers",
    "E-waste exported to Ghana, Nigeria, India",
    "DCs compete with agriculture in drought regions",
  ];
  supply.forEach((b, i) => {
    s.addText(b, { x: COL2_X + 0.35, y: 2.1 + i * 0.5, w: COL_W - 0.6, h: 0.45, fontSize: 11, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });

  addFooter(s, "Cost borne at every stage: extraction → operation → disposal. Upside rarely shared.", ORANGE);
}

// ── SLIDE 9 — The Feedback Loop ──
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
    "More AI climate solutions",
    "More compute",
  ];

  // 3x3 grid — evenly spaced
  const gridX = 1.0;
  const gridY = 1.5;
  const cellW = 2.5;
  const cellH = 0.75;
  const gapX = 0.25;
  const gapY = 0.35;

  steps.forEach((step, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = gridX + col * (cellW + gapX);
    const y = gridY + row * (cellH + gapY);
    addCard(s, x, y, cellW, cellH, i >= 6 ? ORANGE : GREEN);
    s.addText(step, { x: x + 0.1, y: y + 0.05, w: cellW - 0.2, h: cellH - 0.1, fontSize: 12, color: WHITE, fontFace: "Arial", align: "center", valign: "middle" });
    // Arrow between items in a row
    if (col < 2) {
      s.addText("→", { x: x + cellW, y: y + 0.1, w: gapX, h: cellH - 0.2, fontSize: 16, color: i >= 6 ? ORANGE : GREEN, fontFace: "Arial", align: "center", valign: "middle" });
    }
  });

  // Down arrows between rows
  for (let row = 0; row < 2; row++) {
    const arrowX = gridX + 2 * (cellW + gapX) + cellW / 2 - 0.15;
    if (row === 0) {
      // Right end of row 0 → left of row 1 (wrap)
      s.addText("↓", { x: gridX + 2 * (cellW + gapX) + cellW + 0.05, y: gridY + cellH, w: 0.3, h: gapY, fontSize: 14, color: GREEN, fontFace: "Arial", align: "center", valign: "middle" });
    }
    if (row === 1) {
      s.addText("↓", { x: gridX + 2 * (cellW + gapX) + cellW + 0.05, y: gridY + (cellH + gapY) + cellH, w: 0.3, h: gapY, fontSize: 14, color: ORANGE, fontFace: "Arial", align: "center", valign: "middle" });
    }
  }

  s.addText("20–30 year facility lifetimes. Decisions made now = emissions through 2050.", {
    x: MARGIN_L, y: 4.7, w: CONTENT_W, h: 0.4, fontSize: 13, bold: true, color: ORANGE, fontFace: "Arial",
  });
}

// ── SLIDE 10 — Problem Statement ──
{
  const s = darkSlide();
  s.addText("Operators Are Flying Blind", {
    x: MARGIN_L, y: 1.2, w: CONTENT_W, h: 1.0,
    fontSize: 44, bold: true, color: WHITE, fontFace: "Arial", align: "center",
  });
  s.addText("Sustainability data lives in annual reports and disconnected dashboards.\nNever in the operational loop. Never at the moment of decision.", {
    x: 1.2, y: 2.5, w: 7.6, h: 1.0,
    fontSize: 18, color: GRAY, fontFace: "Arial", align: "center",
  });
  s.addShape(pres.ShapeType.rect, { x: 3.0, y: 3.65, w: 4, h: 0.03, fill: { color: GREEN } });
  s.addText('"You can\'t optimize what you can\'t see.\nYou can\'t be accountable for what you don\'t acknowledge."', {
    x: 1.2, y: 3.85, w: 7.6, h: 1.0,
    fontSize: 22, bold: true, color: GREEN, fontFace: "Arial", align: "center", italic: true,
  });
}

// ============================================================
// SECTION B: THE SOLUTION
// ============================================================

addSectionDivider("The Solution", "A sustainable AI framework for the AI factory");

// ── SLIDE 11 — Our Solution ──
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
    const y = BODY_TOP + i * 0.78;
    addCard(s, MARGIN_L, y, CONTENT_W, 0.65, f.color);
    s.addText(f.label, { x: MARGIN_L + 0.25, y: y + 0.05, w: 3.2, h: 0.55, fontSize: 15, bold: true, color: f.color, fontFace: "Arial", valign: "middle" });
    s.addText(f.detail, { x: MARGIN_L + 3.5, y: y + 0.05, w: CONTENT_W - 3.75, h: 0.55, fontSize: 14, color: WHITE, fontFace: "Arial", valign: "middle" });
  });
}

// ── SLIDE 12 — Demo Flow ──
{
  const s = darkSlide();
  addTitle(s, "The Operator Journey");

  const steps = [
    { num: "1", label: "Monitor", desc: "3D twin +\nlive metrics" },
    { num: "2", label: "Alert", desc: "Cooling drops,\nwater spikes" },
    { num: "3", label: "Investigate", desc: "Cross-layer\ncascading" },
    { num: "4", label: "Simulate", desc: "What-if\nscenarios" },
    { num: "5", label: "Decide", desc: "Choose\nan action" },
    { num: "6", label: "Acknowledge", desc: "Forced\nsustainability modal" },
    { num: "7", label: "Log", desc: "Decision stored\npermanently" },
  ];

  const stepW = 1.1;
  const totalW = steps.length * stepW + (steps.length - 1) * 0.15;
  const startX = (SLIDE_W - totalW) / 2;

  steps.forEach((st, i) => {
    const x = startX + i * (stepW + 0.15);
    const circleSize = 0.5;
    const circleX = x + (stepW - circleSize) / 2;
    // number circle
    s.addShape(pres.ShapeType.ellipse, { x: circleX, y: 1.6, w: circleSize, h: circleSize, fill: { color: i === 5 ? ORANGE : GREEN } });
    s.addText(st.num, { x: circleX, y: 1.6, w: circleSize, h: circleSize, fontSize: 18, bold: true, color: BG, fontFace: "Arial", align: "center", valign: "middle" });
    s.addText(st.label, { x: x, y: 2.25, w: stepW, h: 0.35, fontSize: 12, bold: true, color: WHITE, fontFace: "Arial", align: "center", valign: "middle" });
    s.addText(st.desc, { x: x, y: 2.6, w: stepW, h: 0.65, fontSize: 10, color: GRAY, fontFace: "Arial", align: "center", valign: "top" });

    // arrow between steps
    if (i < steps.length - 1) {
      s.addText("→", { x: x + stepW, y: 1.65, w: 0.15, h: 0.4, fontSize: 14, color: GRAY, fontFace: "Arial", align: "center", valign: "middle" });
    }
  });

  s.addText("LIVE DEMO", {
    x: 3.5, y: 4.2, w: 3, h: 0.6,
    fontSize: 20, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ── SLIDE 13 — Technical Architecture ──
{
  const s = darkSlide();
  addTitle(s, "Under the Hood");

  // Backend box
  addCard(s, MARGIN_L, 1.4, COL_W, 2.7, GREEN);
  s.addText("BACKEND", { x: MARGIN_L + 0.25, y: 1.5, w: COL_W - 0.5, h: 0.35, fontSize: 16, bold: true, color: GREEN, fontFace: "Arial" });
  const backendItems = ["Simulation Engine", "Tick loop (2s)", "Drift model", "Cross-layer dependencies", "Alert evaluation", "Recommendation engine"];
  backendItems.forEach((item, i) => {
    s.addText(item, { x: MARGIN_L + 0.4, y: 1.95 + i * 0.33, w: COL_W - 0.65, h: 0.3, fontSize: 12, color: WHITE, fontFace: "Arial" });
  });

  // Arrows in center
  const arrowX = COL1_X + COL_W + 0.05;
  const arrowW = 0.2;
  s.addText("WebSocket\n(2s)  →", { x: arrowX, y: 2.0, w: arrowW, h: 0.7, fontSize: 9, color: GREEN, fontFace: "Arial", align: "center" });
  s.addText("←  REST\nAPI", { x: arrowX, y: 2.8, w: arrowW, h: 0.7, fontSize: 9, color: BLUE, fontFace: "Arial", align: "center" });

  // Frontend box
  addCard(s, COL2_X, 1.4, COL_W, 2.7, BLUE);
  s.addText("FRONTEND", { x: COL2_X + 0.25, y: 1.5, w: COL_W - 0.5, h: 0.35, fontSize: 16, bold: true, color: BLUE, fontFace: "Arial" });
  const frontendItems = ["Zustand Store", "React Three Fiber", "3D Scene + Health colors", "60fps interpolation", "Ethical Gate", "Tradeoff modal"];
  frontendItems.forEach((item, i) => {
    s.addText(item, { x: COL2_X + 0.4, y: 1.95 + i * 0.33, w: COL_W - 0.65, h: 0.3, fontSize: 12, color: WHITE, fontFace: "Arial" });
  });

  // Shared types bar
  addCard(s, MARGIN_L, 4.3, CONTENT_W, 0.45, GREEN);
  s.addText("Shared Types (single source of truth)", { x: MARGIN_L + 0.2, y: 4.33, w: CONTENT_W - 0.4, h: 0.4, fontSize: 13, bold: true, color: GREEN, fontFace: "Arial", align: "center" });

  s.addText("TypeScript monorepo  ·  Node/Express  ·  React/Three.js  ·  Zustand  ·  WebSocket", {
    x: MARGIN_L, y: FOOTER_Y, w: CONTENT_W, h: 0.3, fontSize: 11, color: GRAY, fontFace: "Arial", align: "center",
  });
}

// ── SLIDE 14 — Product Screenshots ──
{
  const s = darkSlide();
  addTitle(s, "The Product");

  const screenshots = [
    { label: "Real-time 3D twin with\nlive metrics across 5 layers" },
    { label: "Forced sustainability\nacknowledgment before any action" },
    { label: "Cross-layer dependencies\n+ scenario simulation" },
  ];

  const cardW = 2.6;
  const gap = (CONTENT_W - 3 * cardW) / 2;

  screenshots.forEach((sc, i) => {
    const x = MARGIN_L + i * (cardW + gap);
    addCard(s, x, 1.5, cardW, 2.4, DARK3);
    s.addText("[SCREENSHOT]", { x: x + 0.2, y: 1.8, w: cardW - 0.4, h: 1.2, fontSize: 16, color: GRAY, fontFace: "Arial", align: "center", valign: "middle" });
    s.addText(sc.label, { x: x + 0.15, y: 3.25, w: cardW - 0.3, h: 0.55, fontSize: 11, color: WHITE, fontFace: "Arial", align: "center" });
  });

  s.addText("Replace with actual screenshots before presenting. Judges score Design (15%) on visual evidence.", {
    x: MARGIN_L, y: 4.4, w: CONTENT_W, h: 0.4, fontSize: 12, italic: true, color: ORANGE, fontFace: "Arial",
  });
}

// ── SLIDE 15 — Sustainability Built In ──
{
  const s = darkSlide();
  addTitle(s, "Sustainability — Built In, Not Bolted On");

  // Card 1 - green
  addCard(s, MARGIN_L, 1.5, CONTENT_W, 1.1, GREEN);
  s.addText([
    { text: "Raise cooling setpoints  →  ", options: { fontSize: 14, color: WHITE, bold: true } },
    { text: '"Saves 12% energy ($340K/yr), but increases water consumption 8% in drought-stressed region"', options: { fontSize: 13, color: GRAY, italic: true } },
  ], { x: MARGIN_L + 0.25, y: 1.55, w: CONTENT_W - 0.5, h: 1.0, fontFace: "Arial", valign: "middle" });

  // Card 2 - orange
  addCard(s, MARGIN_L, 2.8, CONTENT_W, 1.1, ORANGE);
  s.addText([
    { text: "Shift workload to cheaper grid  →  ", options: { fontSize: 14, color: WHITE, bold: true } },
    { text: '"Saves $18K/month, but increases carbon intensity 34% = 200 additional cars/year"', options: { fontSize: 13, color: GRAY, italic: true } },
  ], { x: MARGIN_L + 0.25, y: 2.85, w: CONTENT_W - 0.5, h: 1.0, fontFace: "Arial", valign: "middle" });

  addBullets(s, [
    "Operator must acknowledge before commit",
    "Every decision + acknowledgment permanently logged",
    "A sustainability framework inside the operational loop — not a quarterly CSR report",
  ], { y: 4.15, fontSize: 13, spacing: 0.35 });
}

// ── SLIDE 16 — What's Live Today ──
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
  s.addText("✓  Working Now", { x: COL1_X, y: 1.3, w: COL_W, h: 0.35, fontSize: 15, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("→  Next Phase", { x: COL2_X, y: 1.3, w: COL_W, h: 0.35, fontSize: 15, bold: true, color: GRAY, fontFace: "Arial" });

  // Divider line
  s.addShape(pres.ShapeType.rect, { x: COL1_X, y: 1.68, w: COL_W, h: 0.02, fill: { color: GREEN } });
  s.addShape(pres.ShapeType.rect, { x: COL2_X, y: 1.68, w: COL_W, h: 0.02, fill: { color: DARK3 } });

  working.forEach((item, i) => {
    s.addText("✓  " + item, { x: COL1_X, y: 1.8 + i * 0.28, w: COL_W, h: 0.26, fontSize: 10.5, color: WHITE, fontFace: "Arial", valign: "middle" });
  });

  next.forEach((item, i) => {
    s.addText("→  " + item, { x: COL2_X, y: 1.8 + i * 0.28, w: COL_W, h: 0.26, fontSize: 10.5, color: GRAY, fontFace: "Arial", valign: "middle" });
  });

  addFooter(s, "Left column = functional, demoed live. Right column = roadmap, architecturally prepared.");
}

// ============================================================
// SECTION C: WHY DIGITAL TWINS
// ============================================================

addSectionDivider("Why Digital Twins", "Beyond dashboards — simulate, predict, prevent");

// ── SLIDE 17 — E-Waste & Digital Twins ──
{
  const s = darkSlide();
  addTitle(s, "E-Waste & Digital Twins");
  s.addText("1.2 – 5.0 Million Tons", { x: MARGIN_L, y: 1.3, w: CONTENT_W, h: 0.8, fontSize: 44, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("AI e-waste by 2030 (Nature Computational Science, 2024)", { x: MARGIN_L, y: 2.1, w: CONTENT_W, h: 0.4, fontSize: 14, color: GRAY, fontFace: "Arial" });

  // Two columns
  s.addText("The Problem", { x: COL1_X, y: 2.7, w: COL_W, h: 0.35, fontSize: 15, bold: true, color: ORANGE, fontFace: "Arial" });
  const prob = ["GPU obsolescence: 18–24 months (was 5yr)", "Contains gold, copper, rare earths + toxins", "Reuse could cut waste by 42%"];
  prob.forEach((b, i) => {
    s.addText(b, { x: COL1_X + 0.2, y: 3.15 + i * 0.42, w: COL_W - 0.2, h: 0.4, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });

  s.addText("What the Twin Enables", { x: COL2_X, y: 2.7, w: COL_W, h: 0.35, fontSize: 15, bold: true, color: GREEN, fontFace: "Arial" });
  const sol = ["Per-GPU thermal degradation tracking", "Replace smart, not fast — highest ROI", "Circular economy: redeploy to lighter loads", "Fleet what-if: instant impact analysis"];
  sol.forEach((b, i) => {
    s.addText(b, { x: COL2_X + 0.2, y: 3.15 + i * 0.42, w: COL_W - 0.2, h: 0.4, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });
}

// ── SLIDE 18 — Twin vs. Dashboard ──
{
  const s = darkSlide();
  addTitle(s, "Why Digital Twins, Not Dashboards");

  const rows = [
    ["", "Dashboard", "Digital Twin"],
    ["Current state", "Yes", "Yes"],
    ["What if CRAH-3 fails at 2 AM?", "No", "Physics simulation"],
    ["Cross-layer deps", "Siloed", "GPU → power → cooling → water → community"],
    ["Maintenance", "Threshold alerts", "Predict when GPU falls below floor"],
    ["Sustainability", "Historical reports", "Simulate impact before committing"],
  ];

  makeTable(s, rows, {
    y: 1.35,
    colW: [2.5, 2.0, 3.9],
    colColors: { 1: ORANGE, 2: GREEN },
  });

  s.addText("A dashboard shows what IS.  A digital twin shows what WILL BE.", {
    x: MARGIN_L, y: 4.5, w: CONTENT_W, h: 0.6, fontSize: 22, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ── SLIDE 19 — Predictive Sustainability ──
{
  const s = darkSlide();
  addTitle(s, "Predictive Maintenance → Predictive Sustainability");
  addSubtitle(s, '"When will it fail?"  →  "When does it become unsustainable?"');

  const caps = [
    { cap: "GPU thermal degradation", enables: "Replace before efficiency drops" },
    { cap: "Cooling system wear", enables: "Maintain before water/energy spikes" },
    { cap: "PSU aging curves", enables: "Swap when efficiency < 90%" },
    { cap: "Fleet lifecycle", enables: "Replace least efficient first" },
  ];

  caps.forEach((c, i) => {
    const y = BODY_TOP + i * 0.62;
    addCard(s, MARGIN_L, y, COL_W, 0.52, GREEN);
    s.addText(c.cap, { x: MARGIN_L + 0.2, y: y + 0.03, w: COL_W - 0.4, h: 0.46, fontSize: 13, color: WHITE, fontFace: "Arial", valign: "middle" });
    s.addText("→  " + c.enables, { x: COL2_X, y: y + 0.03, w: COL_W, h: 0.46, fontSize: 13, color: GRAY, fontFace: "Arial", valign: "middle" });
  });

  // Stats bar
  const stats = [
    { val: "30-45%", label: "↓ downtime" },
    { val: "20-25%", label: "↑ asset life" },
    { val: "25-30%", label: "↓ maint. cost" },
    { val: "98%", label: "prediction accuracy" },
  ];
  const statW = (CONTENT_W - 0.3 * 3) / 4;
  stats.forEach((st, i) => {
    const x = MARGIN_L + i * (statW + 0.3);
    addCard(s, x, 4.5, statW, 0.8, GREEN);
    s.addText(st.val, { x: x + 0.1, y: 4.52, w: statW - 0.2, h: 0.45, fontSize: 22, bold: true, color: GREEN, fontFace: "Arial", align: "center" });
    s.addText(st.label, { x: x + 0.1, y: 4.95, w: statW - 0.2, h: 0.3, fontSize: 10, color: GRAY, fontFace: "Arial", align: "center" });
  });
}

// ── SLIDE 20 — NVIDIA Stack ──
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

  makeTable(s, rows, {
    y: 1.25,
    fontSize: 11,
    colW: [2.0, 3.2, 3.2],
    boldCol0: true,
    colColors: { 2: GREEN },
  });
}

// ── SLIDE 21 — AI Stack Position ──
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

  const layerW = 7;
  const layerX = (SLIDE_W - layerW) / 2;

  layers.forEach((l, i) => {
    const y = 1.4 + i * 0.58;
    const color = l.ours ? GREEN : DARK3;
    addCard(s, layerX, y, layerW, 0.48, color);
    if (l.ours) {
      s.addText("★", { x: layerX + 0.2, y: y + 0.04, w: 0.3, h: 0.4, fontSize: 14, bold: true, color: GREEN, fontFace: "Arial", valign: "middle" });
    }
    s.addText(l.label, {
      x: layerX + (l.ours ? 0.55 : 0.2), y: y + 0.04, w: layerW - 0.75, h: 0.4,
      fontSize: 13, color: l.ours ? WHITE : GRAY, fontFace: "Arial", valign: "middle",
    });
  });

  // Today vs Next
  s.addText("Today", { x: layerX, y: 4.8, w: 3.5, h: 0.3, fontSize: 14, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Monitoring, what-if, tradeoff enforcement", { x: layerX, y: 5.1, w: 3.5, h: 0.3, fontSize: 12, color: WHITE, fontFace: "Arial" });
  s.addText("Next", { x: layerX + 3.8, y: 4.8, w: 3.2, h: 0.3, fontSize: 14, bold: true, color: GRAY, fontFace: "Arial" });
  s.addText("Workload scheduling by carbon intensity", { x: layerX + 3.8, y: 5.1, w: 3.2, h: 0.3, fontSize: 12, color: GRAY, fontFace: "Arial" });
}

// ============================================================
// SECTION D: IMPACT & PROOF
// ============================================================

addSectionDivider("Impact & Proof", "Real numbers from real deployments");

// ── SLIDE 22 — Architecture Recommendations ──
{
  const s = darkSlide();
  addTitle(s, "Energy-Efficient Data Center Architecture");
  addSubtitle(s, "What a digital twin validates before a dollar is spent");

  const colW3 = (CONTENT_W - 0.4) / 3;
  const cols = [
    { title: "Cooling", items: ["Direct liquid cooling:\n45% PUE improvement", "Zero-water designs\n(Microsoft 2026)", "Immersion: 50% less\ncooling energy"], color: BLUE },
    { title: "Power", items: ["On-site renewable\n+ storage", "Carbon-aware load balancing:\n5-15% less carbon", "Micro-grid: decouple from\nstressed grids"], color: GREEN },
    { title: "Facility", items: ["Modular prefab: months\nnot years (17.4% CAGR)", "Waste heat reuse →\ndistrict heating", "Low-carbon materials,\ncircular construction"], color: ORANGE },
  ];

  cols.forEach((col, ci) => {
    const x = MARGIN_L + ci * (colW3 + 0.2);
    addCard(s, x, BODY_TOP, colW3, 2.8, col.color);
    s.addText(col.title, { x: x + 0.2, y: BODY_TOP + 0.1, w: colW3 - 0.4, h: 0.4, fontSize: 16, bold: true, color: col.color, fontFace: "Arial" });
    col.items.forEach((item, i) => {
      s.addText(item, { x: x + 0.25, y: BODY_TOP + 0.6 + i * 0.7, w: colW3 - 0.5, h: 0.65, fontSize: 11, color: WHITE, fontFace: "Arial", bullet: true, valign: "top" });
    });
  });

  addFooter(s, "The twin tests all changes virtually — full sustainability tradeoff visibility before capital commitment.", GREEN);
}

// ── SLIDE 23 — Software Opportunity ──
{
  const s = darkSlide();
  addTitle(s, "The Software Opportunity");
  s.addText("90 TWh/year wasted globally ($9B)", { x: MARGIN_L, y: 1.3, w: CONTENT_W, h: 0.8, fontSize: 44, bold: true, color: GREEN, fontFace: "Arial" });
  s.addText("Avg PUE 1.58 vs. best 1.10 = 30% waste. 60–70% of the gap is software/ops.", {
    x: MARGIN_L, y: 2.1, w: CONTENT_W, h: 0.4, fontSize: 14, color: GRAY, fontFace: "Arial",
  });

  const levers = [
    { lever: "ASHRAE cooling setpoints", impact: "10–15% energy savings" },
    { lever: "AI-driven cooling", impact: "+5–10% additional" },
    { lever: "Carbon-aware scheduling", impact: "5–15% carbon reduction" },
    { lever: "Kill zombie servers (30% idle)", impact: "5–15% IT energy" },
  ];

  levers.forEach((l, i) => {
    const y = 2.8 + i * 0.58;
    addCard(s, MARGIN_L, y, CONTENT_W, 0.48, GREEN);
    s.addText(l.lever, { x: MARGIN_L + 0.25, y: y + 0.02, w: 4.5, h: 0.44, fontSize: 14, color: WHITE, fontFace: "Arial", valign: "middle" });
    s.addText(l.impact, { x: MARGIN_L + 4.8, y: y + 0.02, w: CONTENT_W - 5.1, h: 0.44, fontSize: 14, bold: true, color: GREEN, fontFace: "Arial", valign: "middle", align: "right" });
  });

  addFooter(s, "Composite: 20–30% less energy, 25–40% less carbon — no hardware changes.", GREEN);
}

// ── SLIDE 24 — Proof ──
{
  const s = darkSlide();
  addTitle(s, "Proven in the Real World");

  const proofs = [
    { stat: "40%", label: "↓ cooling energy", source: "Google DeepMind (ML optimization)", col: 0, row: 0 },
    { stat: "50-60%", label: "↓ cooling cost", source: "ASHRAE setpoint optimization (zero capex)", col: 1, row: 0 },
    { stat: "15-25%", label: "↓ operational cost", source: "Digital twin deployments, 2 years (IDC 2024)", col: 0, row: 1 },
    { stat: "1.59→1.48", label: "PUE improvement", source: "Equinix, 260+ facilities", col: 1, row: 1 },
  ];

  proofs.forEach(p => {
    const x = p.col === 0 ? COL1_X : COL2_X;
    const y = p.row === 0 ? 1.5 : 3.3;
    addCard(s, x, y, COL_W, 1.5, GREEN);
    s.addText(p.stat, { x: x + 0.3, y: y + 0.15, w: COL_W - 0.6, h: 0.65, fontSize: 36, bold: true, color: GREEN, fontFace: "Arial" });
    s.addText(p.label, { x: x + 0.3, y: y + 0.75, w: COL_W - 0.6, h: 0.3, fontSize: 14, color: WHITE, fontFace: "Arial" });
    s.addText(p.source, { x: x + 0.3, y: y + 1.05, w: COL_W - 0.6, h: 0.3, fontSize: 11, color: GRAY, fontFace: "Arial" });
  });
}

// ── SLIDE 25 — The 5% Number ──
{
  const s = darkSlide();
  s.addText("What if we fixed just 5%?", { x: MARGIN_L, y: 0.5, w: CONTENT_W, h: 1.0, fontSize: 44, bold: true, color: GREEN, fontFace: "Arial", align: "center" });

  const metrics = [
    { metric: "Electricity", saving: "23–25 TWh/yr", equiv: "Ireland's annual consumption", color: BLUE },
    { metric: "Carbon", saving: "10–12.5M tonnes", equiv: "2.5M cars off the road", color: ORANGE },
    { metric: "Water", saving: "75–120B liters/yr", equiv: "Drinking water for 1.5M people", color: BLUE },
    { metric: "Cost", saving: "$12.5–15B/yr", equiv: "UN clean water initiative × 2 years", color: GREEN },
  ];

  metrics.forEach((m, i) => {
    const y = 1.8 + i * 0.88;
    addCard(s, MARGIN_L, y, CONTENT_W, 0.75, m.color);
    s.addText(m.metric, { x: MARGIN_L + 0.25, y: y + 0.08, w: 1.8, h: 0.6, fontSize: 16, bold: true, color: m.color, fontFace: "Arial", valign: "middle" });
    s.addText(m.saving, { x: MARGIN_L + 2.2, y: y + 0.08, w: 2.5, h: 0.6, fontSize: 20, bold: true, color: WHITE, fontFace: "Arial", valign: "middle" });
    s.addText("=  " + m.equiv, { x: MARGIN_L + 4.9, y: y + 0.08, w: 3.3, h: 0.6, fontSize: 14, color: GRAY, fontFace: "Arial", valign: "middle" });
  });
}

// ============================================================
// SECTION E: CONTEXT & CLOSE
// ============================================================

addSectionDivider("Context & Close", "Regulatory tailwinds, vision, and what we learned");

// ── SLIDE 26 — Regulatory Tailwind ──
{
  const s = darkSlide();
  addTitle(s, "The Regulatory Tailwind");

  const regs = [
    { reg: "EU Energy Efficiency Directive (2024)", detail: "Mandatory reporting, all DCs > 500 kW" },
    { reg: "EU AI Act", detail: "Training energy disclosure required" },
    { reg: "Germany", detail: "PUE target 1.2 by 2027 (new builds)" },
    { reg: "US — Oregon", detail: "First mandatory reporting state; SEC climate rule advancing" },
    { reg: "EU ETS", detail: "€80–100/tonne CO₂ — inefficiency has a direct cost" },
  ];

  regs.forEach((r, i) => {
    const y = 1.4 + i * 0.68;
    s.addText(r.reg, { x: MARGIN_L, y, w: COL_W, h: 0.35, fontSize: 14, bold: true, color: WHITE, fontFace: "Arial", valign: "middle" });
    s.addText(r.detail, { x: COL2_X, y, w: COL_W, h: 0.35, fontSize: 13, color: GRAY, fontFace: "Arial", valign: "middle" });
    if (i < regs.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: MARGIN_L, y: y + 0.5, w: CONTENT_W, h: 0.01, fill: { color: DARK3 } });
    }
  });

  s.addText("Voluntary action window closing. Compliance tools become essential.", {
    x: MARGIN_L, y: 4.8, w: CONTENT_W, h: 0.5, fontSize: 16, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ── SLIDE 27 — The Quote ──
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.rect, { x: MARGIN_L, y: 1.5, w: 0.06, h: 2.5, fill: { color: GREEN } });
  s.addText('"We regulate factories that produce chemicals.\nWe regulate factories that produce energy.\nWe regulate factories that produce food.\n\nWhy do we not regulate factories\nthat produce intelligence?"', {
    x: MARGIN_L + 0.5, y: 1.3, w: 7.8, h: 3.0,
    fontSize: 26, color: WHITE, fontFace: "Arial", italic: true, valign: "middle",
  });
}

// ── SLIDE 28 — Future Vision ──
{
  const s = darkSlide();
  addTitle(s, "Where This Goes");

  const phases = [
    { phase: "1", what: "Real telemetry — connect to DCIM/BMS (Schneider, Siemens)" },
    { phase: "2", what: 'AI nutrition labels — "This response: 12ml water, 0.3g CO₂"' },
    { phase: "3", what: "Community dashboards — public impact visibility" },
    { phase: "4", what: "Policy integration — auto-compliance for EU EED, AI Act, SEC" },
    { phase: "5", what: "Multi-site optimization — portfolio-level twin" },
  ];

  phases.forEach((p, i) => {
    const y = 1.5 + i * 0.72;
    const circleX = MARGIN_L + 0.1;
    const circleSize = 0.45;
    s.addShape(pres.ShapeType.ellipse, { x: circleX, y: y + 0.08, w: circleSize, h: circleSize, fill: { color: GREEN } });
    s.addText(p.phase, { x: circleX, y: y + 0.08, w: circleSize, h: circleSize, fontSize: 18, bold: true, color: BG, fontFace: "Arial", align: "center", valign: "middle" });
    s.addText(p.what, { x: MARGIN_L + 0.8, y: y, w: CONTENT_W - 0.8, h: 0.6, fontSize: 15, color: WHITE, fontFace: "Arial", valign: "middle" });
    if (i < phases.length - 1) {
      s.addShape(pres.ShapeType.rect, { x: circleX + circleSize / 2 - 0.02, y: y + circleSize + 0.08, w: 0.04, h: 0.18, fill: { color: DARK3 } });
    }
  });
}

// ── SLIDE 29 — What We Built & Learned ──
{
  const s = darkSlide();
  addTitle(s, "What We Built & What We Learned");

  // Built column
  s.addText("Built", { x: COL1_X, y: 1.3, w: COL_W, h: 0.35, fontSize: 16, bold: true, color: GREEN, fontFace: "Arial" });
  s.addShape(pres.ShapeType.rect, { x: COL1_X, y: 1.68, w: 1.5, h: 0.02, fill: { color: GREEN } });
  const built = [
    "Full-stack TypeScript monorepo — hackathon timeframe",
    "Real-time 3D digital twin: React Three Fiber + WebSocket",
    "Cross-layer dependency modeling, 5 infrastructure layers",
    "Ethics-first: tradeoff acknowledgment structurally enforced",
  ];
  built.forEach((b, i) => {
    s.addText(b, { x: COL1_X + 0.15, y: 1.8 + i * 0.45, w: COL_W - 0.15, h: 0.42, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });

  // Learned column
  s.addText("Learned", { x: COL2_X, y: 1.3, w: COL_W, h: 0.35, fontSize: 16, bold: true, color: ORANGE, fontFace: "Arial" });
  s.addShape(pres.ShapeType.rect, { x: COL2_X, y: 1.68, w: 1.5, h: 0.02, fill: { color: ORANGE } });
  const learned = [
    "3D sync was new territory — 60fps from 2s ticks was hardest",
    "Dependencies harder than expected — full graph rethink",
    "Ethics-first changed every architectural decision",
    "Domain deep-dive: PUE, thermodynamics, environmental justice",
  ];
  learned.forEach((b, i) => {
    s.addText(b, { x: COL2_X + 0.15, y: 1.8 + i * 0.45, w: COL_W - 0.15, h: 0.42, fontSize: 12, color: WHITE, fontFace: "Arial", bullet: true, valign: "middle" });
  });

  s.addText("The hardest part isn't the technology — it's designing systems that refuse to let humans look away from consequences.", {
    x: MARGIN_L, y: 4.2, w: CONTENT_W, h: 0.6, fontSize: 16, bold: true, italic: true, color: GREEN, fontFace: "Arial", align: "center",
  });
}

// ── SLIDE 30 — Close ──
{
  const s = darkSlide();
  s.addText("Every operational decision in an AI factory\ncarries a hidden cost.", {
    x: MARGIN_L, y: 1.2, w: CONTENT_W, h: 1.2,
    fontSize: 28, bold: true, color: GREEN, fontFace: "Arial", align: "center",
  });
  s.addText("We make it visible, quantifiable, and undeniable.", {
    x: MARGIN_L, y: 2.6, w: CONTENT_W, h: 0.8,
    fontSize: 28, bold: true, color: WHITE, fontFace: "Arial", align: "center",
  });

  s.addShape(pres.ShapeType.rect, { x: 3.2, y: 3.5, w: 3.6, h: 0.03, fill: { color: GREEN } });

  s.addText("Built for the ShiftSC AI Ethics Hackathon", {
    x: MARGIN_L, y: 3.8, w: CONTENT_W, h: 0.5,
    fontSize: 16, color: GRAY, fontFace: "Arial", align: "center",
  });
  s.addText("[Team Names]  ·  [GitHub]  ·  [Contact]", {
    x: MARGIN_L, y: 4.4, w: CONTENT_W, h: 0.5,
    fontSize: 14, color: GRAY, fontFace: "Arial", align: "center",
  });
}

// ── APPENDIX (hidden) ──
{
  const s = darkSlide();
  addTitle(s, "Appendix — Sources");
  s.addText("IEA 2024  ·  Goldman Sachs 2024  ·  McKinsey 2024  ·  Nature Computational Science 2024  ·  Ren et al. 2023  ·  Google/Microsoft/Meta Environmental Reports 2023-24  ·  Futurum \"AI Capex 2026\"  ·  Epoch AI  ·  NVIDIA GTC 2024/CES 2025  ·  Omniverse DSX Blueprint (Oct 2025)  ·  Vera Rubin DSX (2026)  ·  Schneider+NVIDIA (Oct 2025)  ·  ETAP (Mar 2025)  ·  EU Directive 2023/1791  ·  Uptime Institute 2023  ·  IDC 2024  ·  DeepMind 2016/2018  ·  Good Jobs First  ·  Crawford, Atlas of AI (2021)", {
    x: MARGIN_L, y: 1.4, w: CONTENT_W, h: 3.5,
    fontSize: 11, color: GRAY, fontFace: "Arial",
  });
}

// ============================================================
// GENERATE
// ============================================================
pres.writeFile({ fileName: "AI_Factory_Digital_Twin.pptx" })
  .then(() => console.log("Created: AI_Factory_Digital_Twin.pptx"))
  .catch(err => console.error(err));
