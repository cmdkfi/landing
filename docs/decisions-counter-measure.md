# Counter-measure direction

Chosen: Origin-inspired text/chart split, Aave-inspired large result figures, using /1 Kecal typography and neutral surfaces.

Rejected: equal-width script columns were too long; dark Night watch interrupted the light page. The full-width chart was replaced with a compact chart beside the narrative.

The chart is a static illustrative comparison, not measured market history. No entrance animation or prototype controls ship. Scenario figures come from the supplied brief.

## Typography and chart refinement

- Reuse incident chart slate #4b657a, paper #fbfcfe, grid #d7dfe8 and shell #e9ebee. Reserve #b44440 for the liquidation path. Solid and dashed strokes distinguish scenarios independently of color.
- Kecal section heading: 36–58px, weight 540, line height 1.08; 36px on mobile. Card heading: 22–28px, weight 540.
- Body: inherited Kecal, 16px/1.6. Legend: 13px. Supporting copy: 14px/1.5.
- Technical labels and notes: shared --font-technical, 12px. Result numbers use the same family, tabular figures, 32–52px; 40px on mobile.
- Remove decorative dots. Stack result metrics on small screens to retain legible figures.
- Static chart: no motion needed; keyboard and reduced-motion users receive the same information.

## Liveline comparison

Selected Multi-series from https://benji.org/liveline: overlapping scenario lines, endpoint labels, inspection crosshair, and series toggles. A fixed 70% reference identifies intervention. The illustrative paths are paused rather than supplied with invented live ticks. The unprotected LTV ends at 86%; liquidation is not depicted as a meaningful subsequent LTV of zero. Reduced-motion users retain the static SVG comparison. The green liquid backdrop remains.

Validation: build and content checks passed; rendered settled chart and toggles verified in the browser.
