# Consistent diagram expansion

Mermaid diagrams now open their existing expanded viewer when the diagram itself is clicked, matching BPMN preview behavior. The shared `src/theme/Mermaid/index.jsx` override applies to all 48 Mermaid blocks across 10 authored pages. The existing Expand diagram button remains and calls the same opener.

Inline previews use native buttons with a dialog label, a zoom cursor, visible focus, and Enter/Space support. The opener remains mounted while its SVG is shown in the viewer, preserving focus after Close or Escape without duplicating SVG IDs. Expanded SVG dimensions are normalized to their viewBox so the fit calculation uses the same coordinates as the rendered image. The minimum zoom now matches BPMN at 0.05; percentage sizing and the former 0.35 limit could crop diagrams on opening. Zoom, pan, reset, modal styling, and existing diagram rendering remain in the shared viewer. No diagram source, teaching copy, route, case section, query sequence, or report/download path changed; only the shared preview hint was clarified.

Changed implementation files: `src/theme/Mermaid/index.jsx`, `src/theme/Mermaid/styles.module.css`; AGENTS records the consistent interaction and focus/ID conventions. Planning inventories include this follow-up.

Validation:

- `npm run build` passed, reusing existing report assets. Normal prebuild hooks refreshed website manifests with no content diff.
- The 16 existing Node website/navigation/rendered-site checks passed, using a one-hour process timeout.
- Browser coverage confirmed the expected 48 preview buttons across all 10 pages: company story, process overview, six process guides, schema reference, and technical guide. A viewer was opened from a preview on each page, with click or Enter/Space activation and Close/Escape focus restoration. Expand diagram was separately verified to open the same viewer and return focus to the toolbar opener.
- One SVG copy exists while expanded: the inline button remains mounted with no duplicate SVG. Viewer zoom and reset controls were checked, and the reviewed browser session reported no console errors.
- Protected-path and 293-artifact SHA-256 freeze checks passed. No dataset/report generation, diagram exports, generator tests, or dependency changes were needed.

Logs, route inventory, per-page browser results, and screenshots are in ignored `outputs/_website_redesign/mermaid-click-*`. Preview: `http://localhost:3000/docs/company-story` or any process/reference page containing Mermaid. Changes remain local to the redesign branch; main and production remain unchanged.

Final visual verification confirmed the full company diagram stays within the viewer bounds at the available 900px preview width and at 390px mobile width. The percentage-sized SVG is normalized before panzoom initialization, and the lower zoom limit allows the initial fit to be applied. Mobile Space activation and Escape focus restoration passed. Temporary viewport overrides were reset, and the final screenshot is `outputs/_website_redesign/mermaid-click-expanded.png` with a companion `mermaid-click-mobile.png`. The final build and all 16 website checks passed after the sizing correction; all 293 frozen artifacts still match.
