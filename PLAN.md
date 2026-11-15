# Portfolio Website — Build Plan

## Overview

The site is a single dark page sitting on one fixed canvas of pixel-grid butterflies. The canvas is sharp on the landing screen, blurs gradually as you scroll toward Projects, then holds at full blur for the rest of the page. Five sections stack on top of it:

1. **Landing** — butterflies fully visible, a glass intro card bottom-left, a Résumé button top-right.
2. **Projects** — five cards (3 + 2), each opening its GitHub repo.
3. **Skills** — one large panel of tech icons.
4. **Blogs** — two preview cards linking to AWS Builder Center posts.
5. **Links** — LinkedIn, AWS Builder profile, Instagram, GitHub, email.

### The butterflies are an original rebuild

The visual reference is pocketstudio's ASCII-animals demo (a single Canvas 2D on a `#06070C` background, driven by their own minified bundle, with no export, embed code or license). Do **not** copy, fetch or reuse their code or assets. Rebuild the effect from scratch in this repo, matched to the feel of the original, using the spec in the Butterfly background section.

### Blur scale

The blur runs on a 0–70 intensity scale that rises continuously (no visible steps) and maps to CSS blur at 0.2 px per point, so 70 = 14 px. A literal 70 px blur is one constant away (`PX_PER_POINT = 1`).

Out of scope for v1: the RAG chatbot. It comes later as its own project.

---

## Design system

Black carries the page, French Blue carries the life, Oxblood appears in a few small places only.

### Colour tokens

Contrast ratios are measured against `#06070C`. WCAG AA needs 4.5:1 for body text and 3:1 for large text.

| Token | Hex | Contrast | Use |
| --- | --- | --- | --- |
| `--bg` | `#06070C` | — | Page base, canvas background |
| `--surface` | `rgba(255,255,255,0.04)` | — | Glass cards over the blurred canvas |
| `--border` | `rgba(255,255,255,0.08)` | — | Hairline card borders |
| `--text` | `#F5F5F7` | 18.5:1 | Headlines, body |
| `--text-2` | `#A1A1A6` | 7.8:1 | Secondary copy, captions |
| `--text-3` | `#86868B` | 5.6:1 | Meta (dates, labels) |
| `--blue` | `#003B8F` | 1.9:1 | Fills, glows, butterfly base tone. Never text on black |
| `--blue-text` | `#7AA7FF` | 8.4:1 | Links, focus rings, hover states, text in blue |
| `--red` | `#950F0F` | 2.3:1 | Budgeted accent (below). Never text on black |

White on French Blue is 10.4:1 and white on Oxblood is 8.9:1, so both work as button fills with white labels.

### Red budget (5–10% max)

Red may appear only here:

- The Résumé button fill (the one strong red element on the page).
- The active-section dot in the nav, and the small eyebrow tick before each section title.
- Hover state of the email row in Links.

Never on large surfaces, card backgrounds, the butterflies, body text or gradients. Rough split by area: about 70% black, 20–25% blue family (including the butterflies), under 5% red.

### Typography

SF Pro is not licensed for use on other websites, so use **Geist** for text and **Geist Mono** for small labels. Self-host both as woff2.

| Role | Size | Weight | Tracking |
| --- | --- | --- | --- |
| Hero name | `clamp(48px, 8vw, 96px)` | 600 | −0.03em |
| Section title | `clamp(36px, 5vw, 64px)` | 600 | −0.02em |
| Card title | 21px | 600 | −0.01em |
| Body | 17px, line-height 1.5 | 400 | 0 |
| Label (mono) | 12px, uppercase | 600 | +0.08em |

### Apple principles to follow

- One idea per screen. Each section gets at least `100svh` and a single headline.
- Huge type, lots of negative space, content width capped at 1120 px.
- Material, not decoration: frosted glass cards (`backdrop-filter: blur(20px) saturate(140%)`), hairline borders, radius 24 px on cards and 999 px on buttons.
- Motion explains structure: things rise into place as you reach them; nothing loops except the butterflies.
- Spacing on an 8 px grid; section padding 128 px desktop, 80 px mobile.

---

## Tech stack and structure

Vite + React + TypeScript, with the butterflies in plain TypeScript outside React so scrolling and re-renders never touch the animation loop.

| Layer | Choice | Why |
| --- | --- | --- |
| Build | Vite + React + TypeScript | One static page needs nothing heavier |
| Styling | Tailwind CSS with the tokens as CSS variables | Fast to iterate; tokens stay in one file |
| Smooth scroll | Lenis | Apple-style inertial scroll; feeds the blur loop a smooth value |
| Reveals and hovers | Motion (formerly Framer Motion) | `whileInView` reveals and spring hovers with little code |
| Background | Custom Canvas 2D class, no library | Full control, about 300 lines |
| Icons | Simple Icons (`react-icons/si`) + Lucide for UI arrows | Monochrome brand logos for Skills and Links |
| Hosting | Vercel, or AWS Amplify Hosting | Decided at deploy time |

```
portfolio/
├─ CLAUDE.md                 # design rules, red budget, motion tokens
├─ PLAN.md                   # this file
├─ public/
│  ├─ resume.pdf
│  ├─ og-image.png            # 1200×630 still of the hero
│  └─ fonts/                  # Geist, Geist Mono (woff2)
└─ src/
   ├─ main.tsx
   ├─ App.tsx                 # section order, Lenis setup
   ├─ styles/tokens.css       # colours, type, easing, spacing
   ├─ background/
   │  ├─ ButterflyField.ts    # canvas engine (spawn, update, draw)
   │  ├─ sprites.ts           # procedural wing frames, sprite cache
   │  ├─ config.ts            # density, speed, colours, BLUR_MAX
   │  └─ useScrollBlur.ts     # scroll → blur/scrim CSS variables
   ├─ components/
   │  ├─ Nav.tsx  ResumeButton.tsx  GlassCard.tsx  Reveal.tsx
   ├─ sections/
   │  ├─ Hero.tsx  Projects.tsx  Skills.tsx  Blogs.tsx  Links.tsx
   └─ content/
      ├─ projects.ts  skills.ts  blogs.ts  links.ts   # all copy and URLs live here
```

Every URL and line of copy lives in `src/content/`, so filling in real links touches four small files and no components.

---

## Butterfly background

One full-screen Canvas 2D layer of procedurally drawn, pixel-grid butterflies drifting diagonally across a faint dot grid.

### Target look (observed in the reference)

- One `<canvas>`, `position: fixed`, full viewport, background `#06070C`.
- A faint dot grid covers the screen; butterflies are clusters of small square cells snapped to that grid, which is what makes them read as "ASCII".
- Blue ramp from deep navy to bright sky blue, with shimmer and occasional sparkle cells.
- Depth: far butterflies are smaller, dimmer and slower; near ones are large and crisp.
- They drift corner to corner on a shared heading (about 49°), flapping, with short glides and soft trails.

Starting values for `config.ts` (tune on `/lab`):

| Group | Setting | Value |
| --- | --- | --- |
| Movement | Density / Speed / Size | 1.05 / 1.05 / 1.25 |
| Movement | Direction | 49° |
| Movement | Farthest depth / Far bias | 0.18 / 1.70 |
| Movement | Hold course / Separation | 5.00 / 700 |
| Flight | Flutter / Glide / Flap rate | 0.00 / 2.75 / 1.00 |
| Look | Shimmer / Sparkle | 0.30 / 0.12 |
| Look | Distance fade / Trail / Trail fade | 0.75 / 1.55 / 0.15 |
| Look | Grid / ASCII detail | 1.05 / 1.30 |

### Rebuild spec

1. **Two layers.** A static dot-grid layer (CSS `radial-gradient` background, or a canvas drawn once on resize) and the animated butterfly canvas above it. Trails then fade without smearing the grid.
2. **Sprites.** Generate each butterfly procedurally: a wing outline from a parametric curve, rasterised to a cell bitmap of about 24 × 20 cells. Make 6 flap frames by scaling wing width with `cos(phase)`. Pre-render each frame at 3–4 depth sizes into offscreen canvases once, at startup.
3. **Cells.** Cell size 4–6 px at depth 1. Colour each cell from a ramp `#0A2A66 → #003B8F → #3E74D6 → #9CC2FF` by wing position, plus per-cell shimmer noise. Sparkle = a random cell flashing white for 2–3 frames.
4. **Entities.** Count = `density × viewportArea / 60000`, capped at 40 on desktop and 14 on mobile. Each has position, depth `z` in `[0.18, 1]` biased toward far, heading 49° ± 8°, speed scaled by `z`, flap phase, and a glide timer that pauses flapping for 1–3 s. Respawn off the top-left edge when one exits bottom-right.
5. **Draw order.** Sort by `z` so near butterflies cover far ones. Far ones get lower alpha (distance fade).
6. **Trails.** Each frame, fade the canvas with `globalCompositeOperation = 'destination-out'` and a low-alpha fill instead of a full clear.
7. **Loop.** `requestAnimationFrame` with delta time (same speed at 60 Hz and 120 Hz). Cap device pixel ratio at 1.5. Pause on `visibilitychange`. On resize, debounce 150 ms and re-seed.
8. **Reduced motion.** If `prefers-reduced-motion: reduce`, draw one still frame and stop the loop.

Build it first on a bare `/lab` page with sliders (density, speed, size, cell size, blur) so the feel can be tuned before it goes behind real content.

---

## Scroll-driven blur

Blur goes from 0 at the top of the page to 70 (14 px) at the moment the Projects section's top edge reaches 25% down the viewport, then stays at 70 for Skills, Blogs and Links. A dark scrim fades in alongside it (0 → 35% opacity) so text stays readable.

```
blur
 70 ┤            ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  held at 70, scrim 35%
    │          ╱ ┊
    │        ╱   ┊  lock: Projects top at 25% of viewport
    │      ╱     ┊
  0 ┤━━━━╱       ┊
    └────────────┴──────────┬─────────┬───────┬──────
       Landing     Projects    Skills    Blogs   Links    → page scroll
```

### Rules

- **Continuous, not stepped.** Smoothstep easing: starts gently, settles gently into the lock.
- **Smoothed.** The displayed value chases the scroll-derived target at 12% per frame, so a mouse-wheel jump still glides.
- **Locked by clamping.** Past the lock point the target is clamped at 70.
- **Reversible.** Scrolling back to the top clears the blur. (For one-way, keep the highest value reached.)
- **Only CSS variables change on scroll.** No React state, no re-renders.

### Code

```ts
// src/background/useScrollBlur.ts
import type Lenis from 'lenis';

const BLUR_MAX = 70;        // intensity scale
const PX_PER_POINT = 0.2;   // 70 -> 14px. Set to 1 for a literal 70px.
const SCRIM_MAX = 0.35;
const LOCK_AT = 0.25;       // lock when Projects' top is 25% down the viewport

export function startScrollBlur(lenis: Lenis, projects: HTMLElement) {
  const root = document.documentElement.style;
  let lockY = 1, target = 0, current = 0, last = -1;

  const measure = () => {
    lockY = Math.max(1, projects.offsetTop - innerHeight * LOCK_AT);
  };
  measure();
  addEventListener('resize', measure);

  lenis.on('scroll', ({ scroll }: { scroll: number }) => {
    const p = Math.min(Math.max(scroll / lockY, 0), 1);
    target = p * p * (3 - 2 * p) * BLUR_MAX;   // smoothstep
  });

  const tick = () => {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.01) current = target;
    if (current !== last) {
      root.setProperty('--blur', `${(current * PX_PER_POINT).toFixed(2)}px`);
      root.setProperty('--scrim', (current / BLUR_MAX * SCRIM_MAX).toFixed(3));
      root.setProperty('--blur-progress', (current / BLUR_MAX).toFixed(3));
      last = current;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
```

```css
/* src/styles/tokens.css */
.bg-canvas {
  position: fixed;
  inset: -32px;               /* oversize so blurred edges don't go dark */
  z-index: 0;
  filter: blur(var(--blur, 0px));
  will-change: filter;
}
.bg-scrim {
  position: fixed;
  inset: 0;
  z-index: 1;
  background: #06070C;
  opacity: var(--scrim, 0);
  pointer-events: none;
}
main { position: relative; z-index: 2; }
```

### Keeping it smooth at full blur

1. **Lower the canvas resolution as blur rises.** Read `--blur-progress` in the canvas engine and scale the internal render size from 1.0 down to 0.5. The blur hides the lost detail.
2. **If frames still drop,** replace the live CSS filter with a crossfade: a second canvas drawn at 0.25 scale (naturally soft once stretched) fades in as the sharp one fades out.

Target: steady 60 fps scrolling through the transition with 4× CPU throttling in Chrome DevTools → Performance.

---

## Section specs

### Nav (persistent)

- Thin bar, transparent at the top, turns to glass (`--surface` + 20 px backdrop blur) after 40 px of scroll.
- Left: "Ayush Suryawanshi" in 15 px / 600. Middle (desktop only): Projects, Skills, Blogs, Links, with the red dot under the active one.
- Right: **Résumé** button. Oxblood pill, white label, 40 px tall. Opens `/resume.pdf` in a new tab.

### 1. Landing

- Height `100svh`. Butterflies fully sharp; this screen is mostly the animation.
- Bottom-left glass card, max width 560 px, 48 px from the left and bottom edges:
  - Mono label: "M.TECH · MANIT BHOPAL"
  - Name in hero size
  - One line (placeholder): "I build computer-vision and generative-AI systems, currently transformer-based 3D asset generation."
  - Two buttons: "See projects" (blue-text outline, scrolls to Projects) and "Get in touch" (scrolls to Links)
- Small mono "scroll" cue bottom-right that fades out after 80 px of scroll.
- Load sequence: canvas fades in over 600 ms, then the card rises 24 px and fades in, its lines staggered 80 ms.

### 2. Projects

- Title "Selected work", then five glass cards in a 3 + 2 layout (`flex-wrap`, centred), each about 320 × 220 px. One column on mobile.
- Card: mono category label, title, one-line outcome, 3–4 tech chips, GitHub icon with "View code ↗". The whole card is one link (`target="_blank" rel="noopener"`).
- Hover: lifts 4 px, border shifts to `--blue-text` at 40% opacity, soft French Blue radial glow follows the cursor inside the card.
- Placeholder projects (final five TBD):
  - Indian LPR System — YOLOv11, PaddleOCR — `https://github.com/Ayush1860/L-P-R`
  - Traffic Signal Optimization — DQN, Transformer — TODO URL
  - Commodity Price Prediction — XGBoost, Optuna — `https://github.com/Ayush1860/Commodity-PP`
  - NL-to-SQL Query Assistant — TODO URL
  - Sahayak Setu — `https://github.com/Ayush1860/Sahayak-Setu`

### 3. Skills

- One large glass panel, icons grouped in four rows with mono row labels:
  - Languages: Python, C++, JavaScript, SQL
  - ML and CV: PyTorch, TensorFlow, YOLO, OpenCV
  - Web: React, FastAPI
  - Cloud and DevOps: AWS, GCP, Docker, Kubernetes
- Icons monochrome `--text-2`, 40 px, names under them. Hover: `--blue-text`, lift 2 px. No brand colours.
- Reveal: icons fade up in a 30 ms stagger, row by row.

### 4. Blogs

- Title "Writing", two tall cards side by side, stacked on mobile.
- Card: cover image (16:9, top), mono date and "AWS Builder Center", title, two-line excerpt, "Read ↗". Links to the post, new tab.
- Metadata stored by hand in `blogs.ts` (URL, title, date, excerpt, cover). No scraping.
- "More posts ↗" link under the cards → `https://builder.aws.com/community/@ayush1806`.

### 5. Links

- Big closing line ("Let's build something."), then five full-width rows with hairline dividers: LinkedIn, AWS Builder Center, Instagram, GitHub, Email.
- Each row: icon, label, handle in `--text-3`, arrow that slides 6 px right on hover. Email is a `mailto:` link and the one row whose hover turns Oxblood.
- Known URLs: LinkedIn `https://linkedin.com/in/ayush-suryawanshi-45234a246`, GitHub `https://github.com/Ayush1860`, AWS Builder `https://builder.aws.com/community/@ayush1806`. Instagram and email: TODO.
- Footer: "© 2026 Ayush Suryawanshi" and "Built with React and a lot of butterflies" in `--text-3`.

---

## Motion system

### Tokens

```css
:root {
  --ease-out:    cubic-bezier(0.22, 1, 0.36, 1);   /* entrances, hovers */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* moves between states */
  --ease-in:     cubic-bezier(0.55, 0, 1, 0.45);   /* exits only */
  --dur-fast: 160ms;   /* hover colour, icon nudge */
  --dur-base: 320ms;   /* card lift, nav glass */
  --dur-slow: 700ms;   /* section reveals */
}
```

### Patterns

| Pattern | Spec |
| --- | --- |
| Smooth scroll | Lenis, `lerp: 0.1`, `wheelMultiplier: 1`. Nav links call `lenis.scrollTo('#projects', { offset: -80, duration: 1.2 })` |
| Section reveal | Opacity 0 → 1, `translateY(24px)` → 0, `blur(6px)` → 0, `--dur-slow`, `--ease-out`. Triggers once at 15% in view. Children stagger 60–80 ms |
| Card hover | `translateY(-4px)` with a spring (stiffness 300, damping 24); border and glow over `--dur-base` |
| Cursor glow | Radial gradient positioned from CSS variables set on `pointermove`; no React state |
| Link arrow | `translateX(6px)` over `--dur-fast` |
| Nav glass | Background and blur fade in over `--dur-base` after 40 px scroll |

### Rules

- Animate only `transform` and `opacity` (plus the background's `filter`). Never width, height, top or margin.
- Nothing loops except the butterflies.
- Reveals run once; scrolling back up does not replay them.
- The blur ramp and section reveals are independent; a fast scroll never waits on an animation.

### Reduced motion

When `prefers-reduced-motion: reduce`: Lenis off (native scroll), butterflies show one still frame, reveals become a 200 ms fade with no movement, blur still applies without smoothing.

---

## Performance, accessibility, SEO, deployment

Targets: 60 fps while scrolling, Lighthouse 90+ in every category, LCP under 2.5 s.

### Performance

- Start the butterfly loop after first paint (`requestIdleCallback`).
- DPR capped at 1.5; butterfly count halves when `navigator.hardwareConcurrency <= 4` or on screens under 768 px.
- Loop pauses when the tab is hidden.
- Self-hosted woff2 fonts, regular weight preloaded, `font-display: swap`.
- Blog covers as WebP/AVIF, `loading="lazy"`, width and height set.

### Accessibility

- Canvas and scrim are `aria-hidden="true"`.
- Text uses only the AA-passing tokens. French Blue and Oxblood never appear as text on black.
- Visible focus ring on every link and button: 2 px `--blue-text`, 3 px offset.
- Landmarks: `<header>`, `<main>`, one `<section>` per block with a heading, `<footer>`.
- External links announce "opens in new tab".

### SEO and sharing

- Title "Ayush Suryawanshi — AI/ML Engineer" and a ~150-character meta description.
- Open Graph and Twitter card using `og-image.png`.
- JSON-LD `Person` schema with name, MANIT, and `sameAs` profile URLs.
- `robots.txt`, `sitemap.xml`, favicon set.

### Deployment

- Vercel (push-to-deploy) or AWS Amplify Hosting. Not part of the overnight build.

---

## Build phases

Run in order. After each phase: `npm run build` and `npx tsc --noEmit` must pass, then commit (`git commit -m "Phase N: <summary>"`).

1. **Scaffold.** Vite + React + TS + Tailwind. `tokens.css` with colour, type, easing and duration tokens. Self-host Geist and Geist Mono. Add Lenis. Empty Hero, Projects, Skills, Blogs, Links sections at `100svh` each with placeholder titles.
2. **Butterfly engine.** `src/background/` per the Butterfly background spec: dot-grid layer, procedural sprites with 6 flap frames, depth, 49° drift, glide, shimmer, sparkle, destination-out trails, delta-time loop, DPR cap, pause when hidden, still frame on reduced motion. Add a `/lab` page with sliders for density, speed, size, cell size and blur.
3. **Scroll blur.** `useScrollBlur.ts` from the code above, scrim, oversized canvas, canvas render scale 1.0 → 0.5 with `--blur-progress`.
4. **Sections.** Nav, Hero card, Projects grid, Skills panel, Blog cards, Links rows per Section specs, with placeholder data in `src/content/` and `TODO` for missing URLs.
5. **Motion polish.** Reveal component, card hover springs and cursor glow, nav glass, link arrows, hero load sequence, reduced-motion handling.
6. **Content.** Fill `src/content/`, add `resume.pdf`, blog covers and OG image. (Needs real links — not overnight.)
7. **Ship.** Lighthouse and accessibility pass, meta tags and JSON-LD, deploy. (Not overnight.)

### Content still needed

- [ ] Résumé PDF
- [ ] Final five projects: GitHub URL, one-line outcome, 3–4 tech tags each
- [ ] Final skills list
- [ ] Two blog posts: Builder Center URL, title, date, two-line excerpt, cover image
- [ ] Instagram URL and contact email
- [ ] Hero line: one sentence on what Ayush builds
- [ ] Hosting choice and domain
