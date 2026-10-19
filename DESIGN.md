# Família Naves design

This personal genealogy site adopts [Teô Design System v2.7.1](https://github.com/rteoo/teo-design-system/releases/tag/v2.7.1), release commit `ae9756c3411acda96171181ae83b334c9c149c01`.

`assets/teo/tokens.css` and `assets/teo/components.css` are copied from that release. The only change to the upstream layers is replacing the remote font import in `tokens.css` with `../fonts/fonts.css`. They own the Ink & Copper palette, semantic theme roles, typography, focus, and control sizing. Load them in that order. `assets/site.css` contains site-specific presentation; `assets/theme.js` implements the reference theme behavior with Portuguese labels and local preference persistence. Dark is the default; both appearances are supported. Fonts are self-hosted WOFF2 with their SIL OFL licenses and provenance under `assets/fonts/`; runtime requests remain local.

The existing landing page, genealogy reading layout, SVG geography, routes, and historical records remain. This content site does not need the design system's application rail or dashboard shell, so `layouts.css` and the unrelated reference JavaScript are not shipped.

Project extensions:

- Long genealogy sections retain the vertical lineage and generation navigation. Use display typography for names, body typography for records, and neutral surfaces; copper signals navigation and the current map stage.
- Map regions use the canonical secondary, neutral, and primary chart roles. State abbreviations and names accompany color; the full textual timeline provides the map's equivalent historical data and full-size native buttons. Spatial SVG markers remain compact to preserve geographic positions; every stage is also operable through the 44px-or-larger timeline buttons. Markers support Enter/Space and visible keyboard focus.
- The migration map is a geographic illustration rather than a numeric chart; its labeled timeline is the accessible data equivalent.
- No automatic map playback, pulse rings, glow, grain, decorative gradients, or glass effects. Reduced-motion preferences suppress transitions and entry animations.

Validate both themes, theme persistence across routes, tree generation navigation, map timeline/marker selection, keyboard focus, 320px reflow, and 200% zoom. The site remains static and needs no build or package installation.
