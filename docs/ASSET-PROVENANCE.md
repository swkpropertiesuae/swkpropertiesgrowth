# Brand and asset provenance

Source selected by the user: https://github.com/swkpropertiesuae/swkpropertiesuae.com

Snapshot: `f50616a934e2902ad8ec592a2f1913e4fd6013e9`, retrieved 25 October 2026.

| Destination | Source in partner repository | Use |
| --- | --- | --- |
| `public/brand/swk-properties.png` | `public/assets/images/brand/swk-logo-dark.png` | Authentic partner logo; original aspect ratio and pixels retained |
| `public/assets/team/*.webp` | `public/assets/images/team/*.webp` | All five authentic partner portraits, unchanged |
| `src/brand.json` | `data/team.json`, `data/site.json`, selected records from `data/properties.json` | Source names, roles, biographies, contacts and portfolio metadata |
| `public/assets/dubai-skyline-hero.webp` | `public/assets/images/hero/dubai-skyline-hero.webp` | Source skyline image; no independent claim about photographic origin |
| `public/assets/dubai-cinema-home.webp` | `public/assets/images/hero/dubai-cinema-home.webp` | Source architectural composition |
| `public/assets/golf-fields.webp` | `public/assets/images/properties/golf-fields-1.webp` | Source portfolio image |
| `public/assets/raw-district-2.webp` | `public/assets/images/properties/raw-district-2-1.webp` | Source portfolio image |
| `public/assets/river-cove-residences.webp` | `public/assets/images/properties/river-cove-residences-1.webp` | Source portfolio image |

A repository snapshot establishes provenance, not live availability, regulatory verification, or third-party copyright ownership. The user requested reuse of these brand assets. Confirm usage permissions before any broader distribution. Source ROI percentages are deliberately not displayed or used in calculations.

SWKGrowth's wordmark, growth icon, CSS glass blocks and UI are original to this implementation and distinct from the SWK Properties logo. Icons come from Lucide (ISC). Instrument Sans and Plus Jakarta Sans are served locally through Fontsource packages; their bundled font licenses apply. Source brand assets retain their existing rights; no new blanket software license is asserted over them.

## SWK OS brand assets (added 26 October 2026)

Source: https://github.com/swkpropertiesuae/swkpropertiesOS (read at its default branch, 26 October 2026). Used only for the internal report in `reports/growth-lead-engine/`.

| Destination | Source in OS repository |
| --- | --- |
| `public/brand/os/swk-logo-white.png`, `swk-logo-dark.png`, `swk-logo-ink.png` | `public/brand/swk-logo-*.png` |
| `public/brand/os/skyline-back.svg`, `skyline-front.svg` | `public/brand/skyline-*.svg` |
| `public/brand/os/fonts/clash-display-{500,600,700}.woff2`, `general-sans-{400,500,600}.woff2` | `public/fonts/` (Clash Display and General Sans are Fontshare fonts; confirm the licence terms before any external use) |

Palette taken from the shipped stylesheet `src/web/index.css` ("Midnight & Champagne": navy `#14305c`, midnight `#0b1a33`, champagne `#c9a96e`, pearl `#f6f2ea`, signal `#c4492f`). Note: the OS `DESIGN.md` and README still describe an older emerald palette; the stylesheet and the navy logo are the current identity.
