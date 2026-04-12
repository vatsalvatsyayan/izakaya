# Frontend Design Guidelines

**Version:** 1.0
**Date:** April 12, 2026
**Status:** Canonical — this document is the single source of truth for every visual decision in the frontend.

---

## 1. Design Philosophy

### Three Core Principles

**1. Information Density Without Clutter**
Operators need many metrics visible simultaneously. Every pixel must earn its place. Use tight spacing, small but legible type, and subtle separators rather than heavy chrome. Eliminate decorative elements that don't convey information. Prefer data-ink over chart-junk.

**2. Progressive Disclosure**
The dashboard follows a three-level information hierarchy: **overview** (top bar metrics + 3D scene health colors give instant facility status) → **drill-down** (clicking a layer expands its card and focuses the 3D camera) → **action** (lever controls appear only when a layer is selected, and the tradeoff modal appears only at commit time). Each level reveals more detail without overwhelming the previous level.

**3. Ethical Friction by Design**
The tradeoff modal and community burden indicators are deliberately prominent, not minimized. The community impact card in the sidebar is always visible and cannot be dismissed. The tradeoff modal cannot be bypassed, has no "don't show again" option, and requires an explicit checkbox acknowledgment. These elements should feel consequential. Operational convenience does not override ethical accountability.

---

## 2. Color System

### CSS Custom Properties

```css
:root {
  /* ── Background Scale ── */
  --bg-primary:     #0F172A;   /* slate-900 — dashboard background */
  --bg-secondary:   #1E293B;   /* slate-800 — panel backgrounds */
  --bg-tertiary:    #273548;   /* slate-750 — nested containers, input backgrounds */
  --bg-elevated:    #334155;   /* slate-700 — dropdowns, tooltips, popovers */

  /* ── Text Scale ── */
  --text-primary:   #F8FAFC;   /* slate-50 — headings, metric values */
  --text-secondary: #94A3B8;   /* slate-400 — labels, descriptions */
  --text-tertiary:  #64748B;   /* slate-500 — timestamps, hints */
  --text-disabled:  #475569;   /* slate-600 — disabled controls */

  /* ── Health: Healthy ── */
  --healthy:              #22C55E;
  --healthy-glow:         #4ADE80;
  --healthy-bg-subtle:    rgba(34, 197, 94, 0.1);
  --healthy-text:         #86EFAC;   /* green-300, high contrast on dark bg */

  /* ── Health: Warning ── */
  --warning:              #F59E0B;
  --warning-glow:         #FBBF24;
  --warning-bg-subtle:    rgba(245, 158, 11, 0.1);
  --warning-text:         #FCD34D;   /* amber-300 */

  /* ── Health: Critical ── */
  --critical:             #EF4444;
  --critical-glow:        #F87171;
  --critical-bg-subtle:   rgba(239, 68, 68, 0.1);
  --critical-text:        #FCA5A5;   /* red-300 */

  /* ── Accent ── */
  --action-primary:       #3B82F6;   /* blue-500 — commit buttons, active tabs */
  --action-primary-hover: #2563EB;   /* blue-600 */
  --simulation-mode:      #3B82F6;   /* blue-500, 90% opacity in banner context */
  --info:                 #6366F1;   /* indigo-500 — info badges, scenario accents */

  /* ── Semantic ── */
  --success:              #22C55E;
  --error:                #EF4444;
  --border-default:       #334155;   /* slate-700 */
  --border-subtle:        #1E293B;   /* slate-800, barely visible separation */

  /* ── Modal ── */
  --modal-backdrop:       rgba(0, 0, 0, 0.7);
}
```

### Three.js Material Color Reference

CSS hex tokens map directly to `THREE.Color`. Use the following conversion pattern:

```typescript
import * as THREE from 'three';

// Direct hex string — THREE.Color accepts CSS hex
const healthyColor = new THREE.Color('#22C55E');
const warningColor = new THREE.Color('#F59E0B');
const criticalColor = new THREE.Color('#EF4444');

// For lerping between health states:
const currentColor = new THREE.Color();
currentColor.lerp(targetColor, 0.05); // per-frame in useFrame

// 3D scene-specific colors (not used in CSS)
const SCENE_COLORS = {
  serverRack:     new THREE.Color('#2A3042'),
  coolingTower:   new THREE.Color('#3B4A5C'),
  groundPlane:    new THREE.Color('#1A2332'),
  pdu:            new THREE.Color('#2E3B4E'),
  ambientLight:   new THREE.Color('#B8C4D0'),
  skyTop:         new THREE.Color('#0F172A'),
  hemisphereGround: new THREE.Color('#2D2D2D'),
};
```

### Tailwind CSS Configuration

```javascript
// tailwind.config.js — extend section
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0F172A',
          secondary: '#1E293B',
          tertiary:  '#273548',
          elevated:  '#334155',
        },
        txt: {
          primary:   '#F8FAFC',
          secondary: '#94A3B8',
          tertiary:  '#64748B',
          disabled:  '#475569',
        },
        healthy: {
          DEFAULT:  '#22C55E',
          glow:     '#4ADE80',
          subtle:   'rgba(34, 197, 94, 0.1)',
          text:     '#86EFAC',
        },
        warning: {
          DEFAULT:  '#F59E0B',
          glow:     '#FBBF24',
          subtle:   'rgba(245, 158, 11, 0.1)',
          text:     '#FCD34D',
        },
        critical: {
          DEFAULT:  '#EF4444',
          glow:     '#F87171',
          subtle:   'rgba(239, 68, 68, 0.1)',
          text:     '#FCA5A5',
        },
        action: {
          primary:      '#3B82F6',
          'primary-hover': '#2563EB',
        },
        simulation:   '#3B82F6',
        info:         '#6366F1',
        success:      '#22C55E',
        error:        '#EF4444',
        border: {
          DEFAULT:  '#334155',
          subtle:   '#1E293B',
        },
      },
    },
  },
};
```

---

## 3. Typography

### Font Stack

```css
:root {
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono:  'JetBrains Mono', ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
}
```

### Size Scale

| Token  | Size  | Line Height | Letter Spacing | Usage |
|--------|-------|-------------|----------------|-------|
| `xs`   | 11px  | 16px (1.45) | 0.05em         | Metric labels (uppercase, tracking-wide) |
| `sm`   | 12px  | 16px (1.33) | 0.01em         | Timestamps, badges, captions |
| `base` | 14px  | 20px (1.43) | 0              | Body text, descriptions, lever labels |
| `lg`   | 16px  | 24px (1.5)  | -0.01em        | Panel headers, tab labels |
| `xl`   | 20px  | 28px (1.4)  | -0.02em        | Section titles |
| `2xl`  | 24px  | 32px (1.33) | -0.02em        | Metric values (top bar) |
| `3xl`  | 32px  | 40px (1.25) | -0.03em        | Hero numbers (rare, modal headers) |

### Usage Rules

| Element | Font | Size | Weight | Additional |
|---------|------|------|--------|------------|
| Metric value (top bar tile) | Mono | 2xl (24px) | Bold (700) | Tabular numerals (`font-variant-numeric: tabular-nums`) |
| Metric value (sidebar card) | Mono | lg (16px) | Semibold (600) | Tabular numerals |
| Metric label | Sans | xs (11px) | Medium (500) | Uppercase, `letter-spacing: 0.05em` |
| Panel header | Sans | lg (16px) | Semibold (600) | — |
| Body text | Sans | base (14px) | Regular (400) | — |
| Button text | Sans | sm (12px) | Semibold (600) | Uppercase for ghost buttons, sentence case for filled |
| Timestamp | Sans | sm (12px) | Regular (400) | `color: var(--text-tertiary)` |
| Confidence/hint text | Sans | sm (12px) | Regular (400) | Italic, `color: var(--text-tertiary)` |

### Tailwind Config

```javascript
// Add to tailwind.config.js extend
fontFamily: {
  sans: ['Inter', ...defaultTheme.fontFamily.sans],
  mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
},
fontSize: {
  xs:   ['11px', { lineHeight: '16px', letterSpacing: '0.05em' }],
  sm:   ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
  base: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
  lg:   ['16px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
  xl:   ['20px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
  '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
  '3xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.03em' }],
},
```

---

## 4. Spacing & Layout

### Spacing Scale

Base unit: **4px**

| Token | Value | Common Usage |
|-------|-------|-------------|
| `1`   | 4px   | Icon-to-text gap, inline spacing |
| `2`   | 8px   | Gap between cards, compact padding |
| `3`   | 12px  | Card internal padding |
| `4`   | 16px  | Panel internal padding, standard gap |
| `5`   | 20px  | Section spacing |
| `6`   | 24px  | Panel header bottom margin |
| `8`   | 32px  | Between major sections |
| `10`  | 40px  | Large section breaks |
| `12`  | 48px  | Page-level spacing |
| `16`  | 64px  | Top bar height |

### Layout Constants

| Element | Value |
|---------|-------|
| Panel internal padding | 16px |
| Card internal padding | 12px |
| Gap between cards | 8px |
| Panel border radius | 8px |
| Card border radius | 6px |
| Badge border radius | 4px |
| Top bar height | 64px |
| Left sidebar width | 280px |
| Right panel width | 320px |
| Action panel height | 280px |
| Minimum viewport | 1280 × 720px |

### Border Treatment

```css
/* Panel borders */
border: 1px solid var(--border-default);   /* #334155 */

/* Card borders (within panels) */
border: 1px solid var(--border-subtle);     /* #1E293B — nearly invisible */

/* Dividers */
border-top: 1px solid var(--border-default);
```

---

## 5. Component Design Specifications

### 5a. Metric Tile (Top Bar)

The top bar contains six metric tiles in a horizontal row within a 64px-tall bar.

```
┌──────────────────────────┐
│  LABEL              ↑    │  ← xs uppercase, text-secondary
│  1,247 req/s    ┄┄┄┄    │  ← 2xl bold mono, text-primary + sparkline
└──────────────────────────┘
```

| Property | Value |
|----------|-------|
| Tile width | Flex: `1 1 0`, equal distribution across bar |
| Tile height | 64px (fills bar) |
| Padding | 12px horizontal, 8px vertical |
| Value font | JetBrains Mono, 24px, bold, `tabular-nums` |
| Label font | Inter, 11px, medium, uppercase, `letter-spacing: 0.05em`, `color: var(--text-secondary)` |
| Unit | Appended to value in text-tertiary, same size |
| Trend arrow | 12×12px inline icon. Green ↑ for improving, red ↓ for degrading, gray → for stable |
| Sparkline | 50px wide × 24px tall, stroke: `var(--text-tertiary)`, strokeWidth: 1.5, no fill, no axes |
| Background | `var(--bg-secondary)` |
| Separator | 1px right border `var(--border-default)` between tiles (not on last) |
| Value transition | `transition: color 150ms ease-out` on value change |

### 5b. Layer Card (Sidebar)

Five cards stacked vertically, one per infrastructure layer.

**Collapsed State (default):**

```
┌─────────────────────────────┐
│ 🔌  Power Layer    ● 98.2% │  ← 56px height
│                    1.18 PUE │
└─────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 56px collapsed |
| Padding | 12px |
| Icon | Layer emoji, 20px |
| Layer name | Inter, 14px (base), semibold, text-primary |
| Health badge | 8px circle, filled with health color, positioned right of name |
| Key metric values | Mono, 14px, regular, text-secondary, right-aligned |
| Gap between cards | 8px |
| Background | `var(--bg-secondary)` |
| Border | 1px solid `var(--border-default)` |
| Border radius | 6px |
| Hover | Background lightens to `var(--bg-tertiary)`, `transition: background 150ms` |
| Cursor | `pointer` |

**Selected State:**

| Property | Value |
|----------|-------|
| Left border | 3px solid, color = layer's current health color |
| Background | `var(--bg-tertiary)` |
| Expansion | Card expands to show all metrics with sparklines (Framer Motion, 300ms, ease-in-out) |
| Metric row height | 32px per metric |
| Metric layout | Label left (xs, uppercase, text-secondary), value right (mono, 16px, semibold), sparkline inline (40×20px) |

### 5c. Alert Card (Right Panel)

```
┌────────────────────────────────┐
│ ▌ ⚠  GPU Temp Warning   2m ago│  ← left border colored by severity
│ │    Rack 3 GPU temp...   ▼   │
└────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Left border | 3px solid. Critical: `var(--critical)`, Warning: `var(--warning)`, Info: `var(--info)` |
| Padding | 12px, left padding 16px (accounts for border) |
| Icon | Severity icon, 16px. Critical: filled circle-x, Warning: filled triangle-!, Info: filled info-circle |
| Title | Inter, 14px, semibold, text-primary. Single line, truncate with ellipsis |
| Timestamp | Inter, 12px, regular, text-tertiary. Relative format ("2m ago", "1h ago") |
| Body (expanded) | Inter, 14px, regular, text-secondary. Max 3 lines before scroll |
| Expand/collapse | Chevron icon (▼/▲), 12px, text-tertiary. Click toggles body. Framer Motion 200ms |
| Background | `var(--bg-secondary)` |
| Border radius | 6px |
| Gap between cards | 8px |
| Hover | Background → `var(--bg-tertiary)` |

### 5d. Recommendation Card

Same base as Alert Card, plus:

| Property | Value |
|----------|-------|
| Left border color | `var(--action-primary)` (#3B82F6) |
| Icon | Lightbulb, 16px, `var(--action-primary)` |
| Confidence note | Inter, 12px, regular, italic, text-tertiary. e.g., "Confidence: 85% — based on last 30 ticks" |
| Button row | Right-aligned, 8px gap between buttons |
| "Dismiss" button | Ghost style: no background, text-secondary, border 1px solid var(--border-default), 12px semibold, 28px height, 6px border-radius. Hover: text-primary, border-color lightens |
| "Apply" button | Filled style: bg `var(--action-primary)`, text white, 12px semibold, 28px height, 6px border-radius. Hover: bg `var(--action-primary-hover)` |
| Button padding | 8px 16px horizontal |

### 5e. Lever Controls

```
┌─────────────────────────────────────┐
│  Cooling Setpoint                   │
│  ├──────────●──────────┤  25°C      │
│  Projected: -18% water, +8ms lat    │
└─────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Label | Inter, 14px, regular, text-primary |
| Slider track | Height: 4px, background: `var(--bg-elevated)`, border-radius: 2px |
| Slider track fill | Height: 4px, background: `var(--action-primary)`, border-radius: 2px |
| Slider thumb | 16px circle, bg white (#F8FAFC), border: 2px solid `var(--action-primary)` |
| Slider thumb active | Scale to 20px, box-shadow: `0 0 0 4px rgba(59, 130, 246, 0.3)` |
| Value label | Mono, 14px, semibold, text-primary, positioned right of slider |
| Toggle switch | 36px × 20px, border-radius: 10px. Off: bg `var(--bg-elevated)`. On: bg `var(--action-primary)`. Thumb: 16px white circle, transition 150ms |
| Projected impact | Inter, 12px, regular, text-tertiary. Delta arrows: green ↓ for reduction (good), red ↑ for increase (bad), using health colors |
| Spacing | 16px between lever groups |
| "Commit Action" button | Full width, 40px height, bg `var(--action-primary)`, text white, 14px semibold, border-radius 6px. Hover: bg `var(--action-primary-hover)`. Margin-top: 16px |

### 5f. Tradeoff Modal

This modal should feel **consequential, not routine**. It is the ethical accountability checkpoint.

| Property | Value |
|----------|-------|
| Backdrop | `var(--modal-backdrop)` — rgba(0, 0, 0, 0.7). Clicks on backdrop do nothing (modal is blocking) |
| Modal width | 560px |
| Modal max-height | 80vh, scrollable |
| Background | `var(--bg-secondary)` |
| Border | 1px solid `var(--border-default)` |
| Border radius | 8px |
| Padding | 24px |
| Header | "Action Impact Acknowledgment" — Inter, 20px (xl), semibold, text-primary. Prefixed with ⚠ icon in `var(--warning)`. Close [X] button top-right, 16px, text-tertiary, hover text-primary |
| Section dividers | 1px solid `var(--border-default)`, margin 16px vertical |
| Section titles | "ACTION", "TRADEOFF", "COMMUNITY IMPACT", "END USER IMPACT" — Inter, 11px, medium, uppercase, tracking-wide, text-secondary |
| Section body | Inter, 14px, regular, text-primary. Line-height 20px |
| Checkbox | 18px square, border: 2px solid `var(--border-default)`, border-radius: 4px. Checked: bg `var(--action-primary)`, white checkmark. The checkbox label is Inter, 14px, regular, text-primary |
| Checkbox container | Background: `var(--bg-tertiary)`, padding: 16px, border-radius: 6px, margin-top: 16px. This area is visually distinct to draw attention |
| Button row | Flex, justify-end, gap 12px, margin-top: 24px |
| "Cancel" button | Ghost: no bg, text-secondary, border 1px solid `var(--border-default)`, 14px semibold, 40px height, border-radius 6px, padding 0 24px |
| "Confirm & Commit" button | Filled: bg `var(--action-primary)`, text white, 14px semibold, 40px height, border-radius 6px, padding 0 24px |
| "Confirm & Commit" disabled | bg `var(--bg-elevated)`, text `var(--text-disabled)`, cursor not-allowed. Visually muted — the button should look clearly inactive |
| Enter animation | Fade in + scale from 0.95 to 1.0, 300ms, ease-out |
| Focus trap | Focus is trapped within the modal. Tab cycles through: close button → content → checkbox → Cancel → Confirm |

### 5g. Toast Notification

| Property | Value |
|----------|-------|
| Position | Fixed, top-right, offset 16px from top and right edges |
| Width | 320px |
| Min-height | 48px |
| Padding | 12px 16px |
| Background | `var(--bg-elevated)` |
| Border | 1px solid `var(--border-default)` |
| Border radius | 6px |
| Shadow | `0 1px 3px rgba(0, 0, 0, 0.3)` |
| Success variant | Left border 3px solid `var(--success)`, success icon 16px |
| Error variant | Left border 3px solid `var(--error)`, error icon 16px |
| Title | Inter, 14px, semibold, text-primary |
| Body | Inter, 12px, regular, text-secondary |
| Enter animation | Slide in from right (translateX 100% → 0), 300ms, ease-out |
| Exit animation | Fade out + slide right (opacity 1→0, translateX 0→50%), 150ms, ease-in |
| Auto-dismiss | 4 seconds |
| Stacking | Multiple toasts stack vertically, 8px gap, newest on top |

### 5h. Simulation Mode Banner

| Property | Value |
|----------|-------|
| Position | Fixed, top of the 3D viewport area, z-index above canvas |
| Width | Full width of the 3D viewport |
| Height | 36px |
| Background | `rgba(59, 130, 246, 0.9)` — blue-500 at 90% opacity |
| Text | "SIMULATION MODE — changes are hypothetical", Inter, 12px, semibold, uppercase, tracking-wide, white |
| Pulsing dot | 8px circle, bg white, `animation: pulse 2s ease-in-out infinite` (opacity 0.4 → 1.0 → 0.4) |
| Layout | Flex, center-aligned, gap 8px between dot and text |
| Border-bottom | 1px solid `rgba(59, 130, 246, 0.5)` |
| Enter/exit | Slide down from top, 300ms, ease-out / slide up, 200ms, ease-in |

### 5i. Tab Component (Right Panel)

| Property | Value |
|----------|-------|
| Tab bar height | 40px |
| Tab padding | 0 16px |
| Tab text | Inter, 12px, semibold, uppercase, tracking-wide |
| Inactive tab | text-tertiary, no underline. Hover: text-secondary |
| Active tab | text-primary, 2px bottom border `var(--action-primary)` |
| Underline transition | Width and position animate via `transition: all 200ms ease-out` |
| Tab bar border-bottom | 1px solid `var(--border-default)` |
| Tab bar background | `var(--bg-secondary)` |

---

## 6. 3D Scene Visual Design

### Overall Mood

Clean, technical, slightly futuristic. Think **mission-control aesthetic**, not game aesthetic. Subdued colors, functional lighting, no visual noise. The 3D scene should feel like a monitoring tool, not entertainment.

### Lighting Setup

| Light | Type | Intensity | Color | Position/Direction |
|-------|------|-----------|-------|--------------------|
| Ambient | `ambientLight` | 0.4 | `#B8C4D0` | N/A (omnidirectional) |
| Key | `directionalLight` | 0.8 | `#FFFFFF` | `[10, 20, 10]` (top-right) |
| Fill | `hemisphereLight` | 0.3 | Sky: `#87CEEB`, Ground: `#2D2D2D` | N/A (vertical gradient) |

No shadows. Use baked ambient occlusion via darkened ground areas near objects.

### Material Palette

| Component | Base Color | Metalness | Roughness | Notes |
|-----------|-----------|-----------|-----------|-------|
| Server Racks | `#2A3042` | 0.6 | 0.4 | LED strips use emissive, color = health state |
| Cooling Towers | `#3B4A5C` | 0.3 | 0.6 | Fan blade disc on top, rotation speed = fan lever |
| Ground Plane | `#1A2332` | 0.0 | 1.0 | Color lerps by water stress (green→brown) |
| PDU Cabinets | `#2E3B4E` | 0.5 | 0.5 | Electric arc effects emanate from these |
| CRAH Units | `#2A3042` | 0.4 | 0.5 | Positioned above racks, dim slightly on cooling changes |
| Network Cables | — | — | — | `LineBasicMaterial`, color `#475569` |
| Ingress/Egress Spheres | `#3B82F6` / `#8B5CF6` | 0.2 | 0.8 | Low-poly sphere, subtle emissive glow |

### Health State Emissive Glow

Emissive glow is the primary visual indicator of component health in the 3D scene.

```typescript
// Applied to rack LED strips and CRAH units
material.emissive = healthColor; // #22C55E | #F59E0B | #EF4444
material.emissiveIntensity = oscillate(0.1, 0.4, pulseSpeed);

// Pulse speeds by health state:
// Healthy:  2.0s period (gentle)
// Warning:  1.5s period (moderate)
// Critical: 0.8s period (urgent) + expanding ring every 3s

// Implementation in useFrame:
const t = clock.getElapsedTime();
const pulse = THREE.MathUtils.lerp(0.1, 0.4, (Math.sin(t * speed) + 1) / 2);
meshRef.current.material.emissiveIntensity = pulse;
```

### Particle Visual Design

| System | Size | Color | Opacity | Behavior |
|--------|------|-------|---------|----------|
| Data flow | 0.08 | `#60A5FA` (blue-400) | 0.7 | Stream from ingress to egress sphere. Speed inversely proportional to latency. Density proportional to request volume. Dropped requests turn `#EF4444` and fade before reaching egress |
| Water | 0.06 | `#38BDF8` (sky-400) | 0.5 | Flow between cooling towers and racks. Density proportional to cooling load. Recirculation mode: color shifts to `#06B6D4` (cyan), path loops |
| Heat haze | 0.1 | `#F97316` (orange-500) | 0.3 | Rise from rack tops. Density proportional to GPU temperature (normalized 55–90°C). Drift upward with slight random lateral motion |

All particle systems use `InstancedMesh` for performance. Particles are recycled, not created/destroyed.

### Sky Dome

Hemisphere geometry. Gradient from top to horizon:

- **Top:** `#0F172A` (matches dashboard bg for seamless blending)
- **Horizon:** Dynamic, blended from two factors:
  - Ambient temperature: lerp `#3B82F6` (20°C, cool blue) → `#F97316` (42°C, hot orange)
  - Grid carbon intensity: lerp `#3B82F6` (<200, clean) → `#78716C` (>400, brown-gray)
  - Final horizon = average of both lerped colors

---

## 7. Animation & Motion Design

### Easing Functions

| Name | Curve | Usage |
|------|-------|-------|
| Standard | `cubic-bezier(0.4, 0, 0.2, 1)` | Most UI transitions: hover, color changes, panel resizes |
| Enter | `cubic-bezier(0, 0, 0.2, 1)` | Elements appearing: modals, toasts, cards sliding in |
| Exit | `cubic-bezier(0.4, 0, 1, 1)` | Elements disappearing: toasts sliding out, panels collapsing |

### Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| Instant | 0ms | Immediate state changes (checkbox, radio) |
| Fast | 150ms | Metric value color changes, hover states, button feedback |
| Normal | 300ms | Panel expand/collapse, modal appear, toast enter, tab switch |
| Slow | 500ms | Health color transitions (3D), simulation mode overlay, scenario transitions |
| Dramatic | 800ms | Camera fly-to-layer, scenario flythrough start |

### Framer Motion Defaults

```typescript
// Standard transition preset
const standardTransition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

// Panel expand
const expandVariants = {
  collapsed: { height: 56, opacity: 1 },
  expanded:  { height: 'auto', opacity: 1 },
};

// Alert card enter
const alertEnterVariants = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0, 0, 0.2, 1] } },
};

// Modal
const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
  exit:    { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
};
```

### 3D Animation Parameters

| Parameter | Value |
|-----------|-------|
| Color lerp speed | `0.05` per frame (completes in ~60 frames / 1 second) |
| Data flow particle velocity | `0.1–1.0` units/frame (mapped from latency: higher latency = slower) |
| Water particle velocity | `0.05–0.3` units/frame |
| Heat haze rise speed | `0.02` units/frame + random lateral drift ±0.005 |
| Data flow spawn rate | `requestVolume / 5` particles active (max 2000) |
| Rack shutdown opacity transition | 1 second, ease-out, target opacity 0.3 |
| LED sequential turn-off | 100ms per LED |
| Camera orbit during fly-in | 10° rotation over 800ms |

---

## 8. Responsive Behavior

### Minimum Viewport: 1280 × 720

The layout is fixed, not responsive. Below the minimum viewport, display a centered message:

```html
<div class="min-viewport-warning">
  <p>Please use a desktop browser with a window at least 1280×720</p>
</div>
```

```css
.min-viewport-warning {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 16px;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1279px), (max-height: 719px) {
  .min-viewport-warning { display: flex; }
  .dashboard { display: none; }
}
```

### Large Viewports (>1920px)

- Left sidebar: fixed 280px
- Right panel: fixed 320px
- Top bar: fixed 64px height
- 3D viewport: expands to fill all remaining space
- Text does not scale up — font sizes remain fixed
- No max-width container on the layout

---

## 9. Accessibility Baseline

### Contrast Ratios

All text/background combinations meet WCAG AA (4.5:1 minimum):

| Text Color | Background | Ratio | Pass? |
|-----------|-----------|-------|-------|
| `#F8FAFC` (text-primary) | `#0F172A` (bg-primary) | 16.3:1 | Yes |
| `#F8FAFC` (text-primary) | `#1E293B` (bg-secondary) | 12.4:1 | Yes |
| `#94A3B8` (text-secondary) | `#0F172A` (bg-primary) | 5.6:1 | Yes |
| `#94A3B8` (text-secondary) | `#1E293B` (bg-secondary) | 4.5:1 | Yes (borderline) |
| `#64748B` (text-tertiary) | `#1E293B` (bg-secondary) | 3.0:1 | No — use only for non-essential text |

### Color + Secondary Indicator Rule

Health states must **always** use both color and a secondary indicator:

| State | Color | Secondary Indicator |
|-------|-------|-------------------|
| Healthy | Green | Text label "Healthy" or ✓ icon |
| Warning | Amber | Text label "Warning" or ⚠ icon |
| Critical | Red | Text label "Critical" or ✕ icon + pulse animation |

This applies in both 2D panels and the 3D scene (where pulse speed also differentiates states).

### Focus Indicators

```css
/* All interactive elements */
:focus-visible {
  outline: 2px solid var(--action-primary);
  outline-offset: 2px;
}

/* Within dark panels, ensure ring is visible */
button:focus-visible,
input:focus-visible,
[role="tab"]:focus-visible {
  outline: 2px solid var(--action-primary);
  outline-offset: 2px;
  border-radius: inherit;
}
```

### Tradeoff Modal Focus Trap

The modal traps focus using `focus-trap-react` or equivalent:
- On open: focus moves to the close button
- Tab order: close button → scrollable content → checkbox → Cancel → Confirm & Commit
- On close: focus returns to the "Commit Action" button that triggered the modal
- Escape key does not close the modal (deliberate — forces explicit Cancel click)

---

## 10. Design Don'ts

These anti-patterns are explicitly prohibited:

| Don't | Why |
|-------|-----|
| No gradients on backgrounds | Flat colors only. Gradients add visual noise to a data-dense interface |
| No drop shadows heavier than `0 1px 3px rgba(0,0,0,0.3)` | Heavy shadows create depth that competes with the 3D scene |
| No rounded corners above 8px | Larger radii waste space and look playful, not operational |
| No animations longer than 800ms | Anything longer feels sluggish in a real-time monitoring tool |
| No decorative elements that don't convey information | Every visual element must encode data or indicate state |
| No color as sole indicator of state | Always pair with text label or icon (accessibility requirement) |
| No bloom, lens flare, or volumetric fog in 3D | The scene is a monitoring tool, not a game. Keep it clinical |
| No post-processing GPU shader passes | Simulation mode tint uses CSS filter on the canvas container, not a shader |
| No `text-decoration: underline` for non-link text | Underlines are reserved for hyperlinks |
| No opacity below 0.3 for any visible element | Elements below 0.3 opacity are effectively invisible on dark backgrounds |
