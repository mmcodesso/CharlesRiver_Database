# BPMN and AIS extension — review handoff

## Process-page consolidation

At the user's request, the process overview and model-library page now form one **Business Processes and Models** hub at `/docs/process-flows`. Removed `docs/process-models/index.md` and its sidebar entry; added a client redirect from `/docs/process-models`. Updated every authored link and diagram footer to the combined page or its notation/library anchors. There are now **59 authored documents**, with 23 learning resources unchanged. The earlier delivery records below retain their original counts and page names as history.

The hub contains one BPMN architecture embed, the original Mermaid information map, the full 11-model catalog, notation and control guidance, the teaching sequence, and report pathways. Removed the duplicate Order-to-Cash preview (its detailed process guide retains it), repeated introductions, duplicate core/supporting process tables, and repeated case links. All 11 editable sources/SVGs remain available; all 37 original Mermaid blocks, the process-led flow, required case headings, and existing query/report references remain intact.

Validation: `npm run build` passed with strict link checks; the Node website checks passed **13/13**, including the redirect, sitemap exclusion of the retired page, one architecture embed, and all model/learning/download connections. The repo `.venv` documentation slice passed **9/9**. Both test processes used one-hour timeouts. An initial rendered-site check ran before the build completed; the completed-build rerun passed. The freeze guard confirmed **all 293 artifacts unchanged**; manifests refreshed through normal build hooks with no content diff, and existing reports were reused. No dataset or diagram regeneration occurred.

Browser review confirmed the production-build redirect, one architecture and Mermaid map, 11 catalog rows, working viewer and notation anchor, no extra sidebar entry, and contained table scrolling at 390px. A separate owned port-3001 production-preview server was stopped after review. A port-3000 preview remains available for the user at `http://localhost:3000/docs/process-flows`; the old URL was also verified to redirect there. [Consolidated page screenshot](../../../outputs/_website_redesign/bpmn/process-consolidated.png).

## Viewer refinement requested after library delivery

Removed standalone Open SVG / View SVG navigation from the figures and library. Each diagram is now a keyboard-accessible image button opening the same dialog as Expand model. The inline toolbar and viewer reuse Mermaid's actual CSS module: the same buttons, paper background, rounded modal, dimensions, dark theme, and Zoom out / Zoom in / Reset / Close controls. The existing `panzoom` dependency supplies drag/pinch interaction and keyboard pan/zoom; Reset fits the whole image and cancels an in-progress zoom animation. Editable Draw.io downloads and text evidence remain available.

Changed the BPMN component and its small image/native-dialog CSS overrides, the library introduction, the existing rendered-site assertions, `AGENTS.md`, and this handoff. No Mermaid source, process/case sequence, query/report link, diagram source, or exported asset changed. The process-led teaching flow and required case headings remain intact.

Validation: `npm run build` passed; the existing Node website checks passed **13/13** using the documented one-hour process timeout; the freeze guard confirmed all **293 artifacts unchanged**; `git diff --check` passed. Browser checks at 1440×1000 and 390×844 confirmed both openers, keyboard image activation, zoom, reset, focus containment/restoration, Escape, and light/dark layouts. Computed desktop modal size, corner radius, and background matched the existing Mermaid dialog exactly. The screenshot shows the [updated inline format](../../../outputs/_website_redesign/bpmn/viewer-refinement.png).

Build hooks refreshed manifests with no content diff and reused the existing reports. SVGs were not regenerated. Python/generator tests were not rerun for this component/CSS-only behavior change; the original library checks below remain the source/model validation record. The temporary preview server was stopped after review.

## Initial library delivery

Completed 17 October 2026 on `feature/charles-river-website-redesign`, extending the initial website redesign at `1ea2e71`. Implementation commit: `3ede287`. Main remains at frozen baseline `7c21218dce19201013f7a71eb7263e12a85af09a`. No merge, push, deployment, release edit, or dataset generation occurred.

## Delivered library and teaching flow

The library contains **11 editable Draw.io sources and 11 actual Draw.io SVG exports**: six core cycles, a process architecture, and four focused details. [The diagram inventory](DIAGRAM_INVENTORY.md) lists every filename, process guide, activity, and related case. The website's catalog uses the same authored metadata in `src/data/bpmnModels.json`.

The [Order-to-Cash pilot](PILOT_REVIEW.md) was completed and reviewed before the remaining library was authored. Independent notation review then examined all 11 models. They use Draw.io's native BPMN library, separate external pools, internal responsibility lanes, proper sequence/message flows, meaningful end boundaries, labeled exclusive alternatives, and an actual parallel split/join in payroll. The architecture contains independent process scopes rather than an invented global execution sequence. The manufacturing variance model is explicitly a proposed classroom review, not an implemented approval gate or a hold on finished goods.

Review corrected two material interpretation issues: cash-review completion can leave money unapplied, and one credit memo can affect both open AR and excess customer credit. The latter was checked against actual ledger rows in the checksum-matched published SQLite file using read-only access. Parent cash models explain that the related detail includes receipt capture for context rather than representing a one-to-one engine execution binding.

The six process guides follow business scenario → learning objectives/participants → BPMN and decision interpretation → risk/control evidence → existing Mermaid/data/posting explanation → investigation and optional AIS activity. All **37 existing Mermaid blocks and 101 original link occurrences across the seven process/architecture pages were preserved**, compared directly with `1ea2e71`. The return explanation now clarifies that Mermaid endpoint links are not an exclusive whole-memo gateway. Existing case section headings, query sequences, report links, routes, and MDX integrations remain intact.

Two routes were added: `/docs/process-models` and `/docs/learn-and-practice/bpmn-controls-workshop`. They are discoverable within existing shallow sidebar sections and linked from process, practice, and instructor pages. The site now has **60 authored documents** and **23 activities with LearningResource metadata**. No existing route moved or disappeared.

The workshop provides interpretation, actual-record tracing, a reusable risk/control matrix, and an advanced proposed-change/evidence-plan assignment. Each process also has a focused optional AIS activity. The instructor guide includes an explicitly **proposed, adaptable 14-week AIS sequence** prioritizing O2C, P2P, and conversion; it does not claim to be a verified forthcoming-textbook chapter map. Public prompts contain no solutions. Instructor answers and grading notes belong in private course materials.

## Files and maintenance

- `static/diagrams/bpmn/`: 22 intentional teaching assets; source and publication filenames match.
- `src/components/BpmnDiagram/`: shared figure, catalog, SVG/editable downloads, expanded viewer, zoom, text equivalent, evidence references, and source-format boundary.
- `src/data/bpmnModels.json`: model descriptions, steps, alt text, actual evidence tables, learning links, and limitations.
- `docs/process-models/index.md`, `docs/learn-and-practice/bpmn-controls-workshop.md`, six `docs/processes/*.md`, process-flows, practice index, and instructor guide: integrated learning content.
- `sidebars.js` and `tests/website/`: discovery, route/metadata/rendered-download checks, and diagram validation.
- `AGENTS.md`, `.gitattributes`, and this planning directory: authoring workflow, LF-stable source identities, pilot record, export helper, inventory, and review evidence.

Edit the `.drawio` source in diagrams.net / Draw.io, then run:

```powershell
pwsh -NoProfile -File planning/website-redesign/bpmn/export-diagrams.ps1 -ModelId order-to-cash
```

Omit the model ID for all models; use `-DrawioPath` for a different installation. Tested with Draw.io Desktop 29.6.6. The helper exports to a fresh temporary SVG, requires successful output before replacing the publication, embeds editable XML, and adds accessible title/description and source SHA-256 without redrawing geometry. Native sources remain authoritative; there is no committed source-regeneration script that would overwrite direct diagram edits. Scratch authoring and raster QA files remain ignored under `outputs/`.

## Validation performed

All explicit automated test processes used a **3,600,000 ms process timeout**. Python used the repository `.venv`; its backing runtime required sandbox escalation, which succeeded.

| Check / command | Result |
| --- | --- |
| `pwsh -NoProfile -File planning/website-redesign/bpmn/export-diagrams.ps1` | Passed for all 11 sources; native editable export and SVG publication confirmed |
| Draw.io PNG rendering and visual inspection | All 11 rendered; corrected connector overlap, event-label clearance, pool labels, and subprocess glyphs |
| `npm run build` | Passed with strict links, server/client compilation, static assets, search index, and existing report validation |
| `node --test tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs` | **13 passed**; all 60 document routes/meta, 23 learning resources, 22 diagram links, process/activity/case links, existing static downloads, and shallow discovery checked |
| `.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider tests/test_docs_onboarding_flow.py tests/test_report_preview_overlay.py tests/website/test_bpmn_models.py` | **69 passed**: 57 BPMN checks plus 12 existing website checks |
| `.venv\Scripts\python.exe -B -m compileall -q src tests` | Passed |
| Read-only release checks | All named evidence tables exist; mixed AR/customer-credit posting confirmed; no database writes |
| Browser SVG publication | All 11 standalone SVGs rendered actual shapes/text with their accessible titles |
| Browser viewer and responsive review | Passed at 1440×1000, 820×1180, and 390×844; representative O2C/P2P/conversion, workshop and text explanations; no page overflow; light/dark, zoom/fit/keyboard, forward/reverse Tab wrapping, Close/Escape and opener focus restoration checked |
| Existing Mermaid interaction | P2P's five Mermaid diagrams rendered without alerts; expansion, zoom, Escape, and opener focus restoration still work alongside BPMN |
| Source/SVG parity | All sources contain editable native cells; exports preserve those cells and connector parents/endpoints; source hashes match; built SVGs match published files byte-for-byte |
| Preservation comparison with `1ea2e71` | 37 Mermaid blocks and 101 original link occurrences retained across seven process pages |
| `pwsh -NoProfile -File planning/website-redesign/verify-freeze.ps1` | Passed: protected paths unchanged; **all 293 frozen dataset/report hashes identical** |
| `git diff --check` | Passed |

The test commands above were executed through Node `spawnSync` wrappers with `timeout:3600000`; the wrappers invoked the stated Node or repo-local Python command unchanged.

Build pre-hooks refreshed branding, query/report/report-pack manifests through their existing scripts, with **no generated content diff**. Existing report assets were reused and validated; none was regenerated or hand-edited. No generator, schema, configuration, canonical SQL, published package, SQLite, Excel, CSV, or support-workbook output changed. Validation used the existing published v2027.1 SQLite, not a newly generated settings variant.

## Limits and review artifacts

Draw.io native XML is an editable visual document, **not executable BPMN 2.0 interchange XML**. This work does not claim BPMN-engine/schema validation, measured control effectiveness, or actual access independence. External participants are black boxes; roles and selected process boundaries are teaching allocations. Proposed controls are explicitly labeled and connected to evidence questions.

The full generator suite was not run because the dataset and generator remained frozen and some fixtures generate data. No screen-reader certification, Lighthouse score, or complete WCAG conformance is claimed. Manual browser review and structural tests cover the specific behaviors listed above. The pre-existing `vscode-languageserver-types` static dependency warning and local Docusaurus update-check permission notice remain; no dependency changes were made.

Local screenshots: [desktop reference page](../../../outputs/_website_redesign/bpmn/desktop-reference.png). The final build log and native raster previews are under ignored `outputs/_website_redesign/bpmn/`. The temporary QA server is stopped after review.

For local review, with the existing matching report assets available:

```powershell
npm run build
npm run serve -- --host 127.0.0.1 --port 3000 --no-open
```

Open `http://127.0.0.1:3000/docs/process-flows`, download a source, compare its process guide's Mermaid view, and follow the workshop into an existing case. Publication remains a separate user decision.
