# Família Naves — genealogical atlas

A site-specific identity, independent of the existing Teô, Strateo and Gilenge systems. No shared-system CSS, font assets or components are loaded. Preserved legacy assets are unused reference files.

## Direction

An exploratory atlas of people, time and place: oversized grotesque headings, serif asides, cobalt relationship lines, warm off-white paper and a vermilion meeting date. Home introduces the full available lineage, from the research's initial generation to the latest descendants recorded in Anésia's line. A thirteen-generation navigation spine and four historical chapters replace the six-child home diagram. The scope describes this research, not an exhaustive registry of all Naves families.

## Reading and interaction

- Home: full-lineage introduction and generation navigation → four historical chapters → migrations → gathering. No standalone research section or gathering verification note. Provenance remains in record details and the compilation reading page.
- Family: a traditional chart spanning the 13 available generations, organized by exact parental sets. Couples with shared children have one descent junction and one sibling bar. Previous and current families occupy separate blocks, preventing chains through unrelated partners. A person can appear in several units, explicitly labeled as the same logical record; descendant counts use unique people. Unknown parentage is not invented.
- The chart has its own scroll viewport, zoom controls, full-tree overview, family/origins shortcuts, search and branch filtering. Couples do not automatically share parentage: explicit mother/father links are modeled separately from current and former relationships.
- `assets/lineage.js` is shared by the chart and historical reading page. `assets/family.js` holds the supplied family roster; `assets/genealogy.js` models and renders relationships; `assets/genealogy.css` styles the chart. `assets/home-generations.css` owns the lineage-wide entrance. Generation anchors focus a complete generation without selecting an individual modern branch.
- `/linhagem` uses the same chart in historical-only mode (generations 1–9); `/arvore_naves.html` preserves the detailed compilation reading view. The SVG migration map retains its data and controls.
- Initial zoom fits the selected family; the historical view opens as an overview. Search can focus a person; the toolbar permits closer reading. No hard-coded 75% initial zoom.
- Paper is the default appearance; a dark appearance is optional. Preference uses `naves-atlas-theme`.
- `assets/atlas.css` owns all presentation. System Arial and Georgia require no downloads. Historical inline layouts use semantic variable aliases defined locally in this stylesheet; no upstream tokens are imported.
- Touch targets ≥44px, visible focus, keyboard navigation, reduced-motion support and reflow at 320px.
- Names and provenance take priority over decoration. Research uncertainty stays explicit.

Run `node scripts/check-site.mjs` for interaction, route, theme, kinship and responsive checks. No build or dependency installation is required.
