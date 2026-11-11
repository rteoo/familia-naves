# Família Naves — genealogical atlas

A site-specific identity, independent of the existing Teô, Strateo and Gilenge systems. No shared-system CSS, font assets or components are loaded. Preserved legacy assets are unused reference files.

## Direction

An exploratory atlas of people, time and place: oversized grotesque headings, serif asides, cobalt relationship lines, warm off-white paper and a vermilion meeting date. The home diagram is a real navigation surface connecting Anésia and Antônio to their six children. It contains no invented portraits, archival artifacts or geographic precision.

## Reading and interaction

- Home: family diagram → six branches → migrations and lineage → gathering → sources.
- Family: a traditional connected chart spanning the 13 available generations, with individual person boxes, same-generation relationship lines and orthogonal parent-child lines. Historical collateral relatives and all six modern branches are included. Shared people are reused; unknown parentage is not invented. Unresolved links are dashed, with provenance in the person inspector.
- The chart has its own scroll viewport, zoom controls, full-tree overview, family/origins shortcuts, search and branch filtering. Couples do not automatically share parentage: explicit mother/father links are modeled separately from current and former relationships.
- `assets/lineage.js` is shared by the chart and historical reading page. `assets/family.js` holds the supplied family roster; `assets/genealogy.js` models and renders relationships; `assets/genealogy.css` styles the chart. Home uses a traditional two-parent/six-child diagram.
- Historical lineage and SVG map retain their data and controls, with the same atlas typography and colors.
- Paper is the default appearance; a dark appearance is optional. Preference uses `naves-atlas-theme`.
- `assets/atlas.css` owns all presentation. System Arial and Georgia require no downloads. Historical inline layouts use semantic variable aliases defined locally in this stylesheet; no upstream tokens are imported.
- Touch targets ≥44px, visible focus, keyboard navigation, reduced-motion support and reflow at 320px.
- Names and provenance take priority over decoration. Research uncertainty stays explicit.

Run `node scripts/check-site.mjs` for interaction, route, theme, kinship and responsive checks. No build or dependency installation is required.
