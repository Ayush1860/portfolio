# Ayush Suryawanshi — Portfolio

Personal site of Ayush Suryawanshi, AI/ML engineer and M.Tech researcher at MANIT Bhopal.

**Live:** https://ayush-suryawanshi.vercel.app

A single dark page over a live field of ASCII cranes. The cranes are sharp on the landing screen, then blur as you scroll into the content; the panels on top are liquid glass that bends the background at its edges.

## Sections

- **Landing** — name, one-line intro and the Résumé button
- **Projects** — SecureRAG, AgentGate, Indian License Plate Recognition, Commodity Price Prediction and this site
- **Skills** — five groups from the résumé, with icons
- **Blogs** — articles on AWS Builder Center
- **Links** — LinkedIn, AWS Builder Center, Instagram, GitHub and email

## Built with

| Layer | Choice |
| --- | --- |
| App | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, design tokens as CSS variables |
| Motion | Motion (scroll reveals, hover springs, parallax), Lenis (smooth scroll) |
| Background | [ascii-animals](https://github.com/DesignerStephen1/ascii-animals) crane engine on Canvas 2D |
| Glass | `backdrop-filter` with a generated SVG displacement map for edge refraction (Chromium; plain frosted glass elsewhere) |
| Icons | Simple Icons and Font Awesome via `react-icons`, Lucide |
| Fonts | Geist and Geist Mono, self-hosted |
| Hosting | Vercel — every push to `main` deploys |

## Run it locally

Needs Node 20 or later.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

`/lab` is a tuning page for the background: every crane setting as a slider, plus a blur slider.

## Editing content

All copy and links live in `src/content/`, so updating the site never touches a component:

| File | What it holds |
| --- | --- |
| `site.ts` | Name, hero line, nav, footer |
| `projects.ts` | Project cards |
| `skills.ts` | Skill groups and their icons |
| `blogs.ts` | Blog posts (title, date, excerpt, link, cover) |
| `links.ts` | Profile links and email |

Static files are in `public/`: the résumé (`resume.pdf`), blog covers (`blog/`), the share image (`og-image.png`) and fonts.

## How it fits together

```
src/
├─ background/          # crane canvas setup, scroll → blur, background grid
├─ vendor/ascii-animals # the crane engine (MIT), see SOURCE.md for local changes
├─ lib/liquidGlass.ts   # edge-refraction filter for glass panels
├─ components/          # nav, glass card, reveal, parallax
├─ sections/            # Hero, Projects, Skills, Blogs, Links
├─ content/             # all copy and URLs
└─ styles/              # tokens, components, motion
```

The background runs outside React, and scrolling only writes CSS variables, so nothing re-renders while you scroll. Motion respects `prefers-reduced-motion`: the cranes show a single still frame and reveals become a short fade.

## Credits

- Crane animation: [ascii-animals](https://github.com/DesignerStephen1/ascii-animals) by drewdi and Stephen Zhang, MIT licence (`src/vendor/ascii-animals/LICENSE`)
- Geist and Geist Mono by Vercel, SIL Open Font Licence (`public/fonts/OFL.txt`)
