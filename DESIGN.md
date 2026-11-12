# Família Naves — genealogical atlas

A site-specific identity, independent of the existing Teô, Strateo and Gilenge systems. No shared-system CSS, font assets or components are loaded. Preserved legacy assets are unused reference files.

## Direction

An exploratory atlas of people, time and place: oversized grotesque headings, serif asides, cobalt relationship lines, warm off-white paper and a vermilion meeting date. Home introduces the full available lineage, from the research's initial generation to the latest descendants recorded in Anésia's line. A thirteen-generation navigation spine and four historical chapters replace the six-child home diagram. The scope describes this research, not an exhaustive registry of all Naves families.

## Reading and interaction

- Home: full-lineage introduction and generation navigation → four historical chapters → migrations → gathering. No standalone research section or gathering verification note. Provenance remains in record details and the compilation reading page.
- Family: a ten-generation central lineage in the page's normal flow, from João and Maria to the six children of Anésia and Antônio. Siblings and close relatives appear beside it; opening a name reveals their immediate family and sources. Each additional generation opens on demand. Previous and current relationships remain distinct; a spouse is not assumed to be a parent. Uncertain parentage is labeled.
- All 13 generations remain reachable via generation navigation and explicit search results; selecting a relative changes the focused person. Person URLs use generation, name and family path and support reload and browser history; they can change if those identity fields are corrected. Both family routes start at the first generation unless a deep link selects another person or generation.
- `assets/lineage.js` is shared by the explorer and historical reading page. `assets/family.js` holds the supplied family roster; `assets/genealogy.js` models and renders relationships; `assets/genealogy.css` styles the explorer. `assets/home-generations.css` owns the lineage-wide entrance.
- `/linhagem` uses the same explorer with a historical introduction; `/arvore_naves.html` preserves the detailed compilation reading view. The SVG migration map retains its data and controls.
- There is no embedded tree canvas or custom pinch handler. Native page scrolling and browser zoom remain available. At mobile widths the family groups use one column.
- Paper is the default appearance; a dark appearance is optional. Preference uses `naves-atlas-theme`.
- `assets/atlas.css` owns all presentation. System Arial and Georgia require no downloads. Historical inline layouts use semantic variable aliases defined locally in this stylesheet; no upstream tokens are imported.
- Touch targets ≥44px, visible focus, keyboard navigation, reduced-motion support and reflow at 320px.
- Names and provenance take priority over decoration. Research uncertainty stays explicit.

Run `node scripts/check-site.mjs` for interaction, route, theme, kinship and responsive checks. No build or dependency installation is required.
