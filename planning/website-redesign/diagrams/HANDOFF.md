# Diagram learning refinement — implementation handoff

19 October 2026. Review branch: `codex/diagram-learning-refinement`, starting from `22b215f304aedd3c2507b56783be38847ba14f0d`. This handoff records the completed implementation review. The user's subsequent commit, merge, and deployment authorization is recorded in [PUBLICATION.md](PUBLICATION.md). No dataset or report generation was performed during this work.

## Delivered scope

All published diagrams now use native editable Draw.io sources and their actual Desktop SVG exports. The later user instructions superseded the plan's proposal to retain 18 Mermaid flowcharts. Key markers follow column names: `SalesOrderID (PK)` and `CustomerID (FK)`. Public foreign-key enforcement notes were removed as requested. Long key rows have enough height to display their suffixes fully.

| Current family | Models | Learning purpose |
| --- | ---: | --- |
| Company data overview and focused ERs | 19 | Nine areas, 18 focused views, all 82 tables indexed with exactly one primary home |
| Process evidence and technical maps | 34 | Foreign-key bridges, analytical matches, conditional source traces, accounting effects, and the separate technical build sequence |
| BPMN | 11 | Activities, teaching responsibilities, decisions, and distinct event/settlement endpoints |
| Tutorial figures | 12 | Selected records, keys, dated events, billing, allocations, and analytical workflows |
| Case figures | 31 | Branches, responsibility maps, independent aggregation, comparisons, timelines, classifications, and balance equations |
| **Total** | **107** | **107 authoritative `.drawio` files and 107 matching accessible `.svg` exports** |

The 99 original diagrams all have dispositions, evidence bases, semantic corrections, layout findings, and validation outcomes in `audit-register.json`. Two repeated explanations are consolidated/reused. `native-inventory.json` records current source and SVG hashes.

## Learning and semantic changes

- The O2C pilot combined goods and cash ERs, the existing BPMN, the selected-record lesson, and independent invoice-settlement summaries. `PILOT.md` records its review.
- Customer relationships are divided into commercial terms, goods, services, cash allocation, returns/credit, and commissions. Price-list customer scope, shipment support on service invoices, supplier PO-line support on accrued services, and budget cost-center scope retain their optional paths.
- JournalEntry, DemandForecast, and InventoryPolicy are visible. Conditional source IDs include their source type. Engagement/date-period, employee/period, and work-center/date matches are distinguished from foreign-key paths.
- Commission payment lines, PayrollRegisterLine, PayrollSummary aggregation, PriceListLine, and BOM-line support are explicit where needed. Operational support and ledger posting remain separate.
- Native BPMN gateways, open-item endpoints, completion versus close, receipt versus application, employee pay versus remittance, and proposed-control scope are preserved. Five original crossings in four models are removed.
- Case/tutor figures use layouts suited to their questions. Separate populations and obligations branch; comparisons retain their grains; work-order sources aggregate independently; roll-forwards use an equation and date windows; completion and close have separate dated tracks.
- Text relationship tables, grain descriptions, reading questions/rules, and process/lesson/case/posting links supplement the images. The process-led teaching sequence, case headings, original figure IDs, original selections and amounts, query/report components, and worked SQL remain intact.

## Viewer and maintenance

`SchemaDiagram` and `EvidenceDiagram` reuse `StaticDiagram`. Every map has editable downloads, meaningful descriptions, keyboard opening, pan, zoom, Reset, actual-size 100%, a zoom indicator, Escape, and exact-opener focus restoration. The first actual-size action now normalizes position before scaling, avoiding a panzoom bounds rejection. Images have a white canvas in dark-theme viewers. Touch controls measured at least 44 CSS pixels in the phone review.

The retained Mermaid renderer is compatibility code; there are no Mermaid diagrams or Mermaid teaching-format references in published docs. Its shared CSS continues to serve the native viewers.

Use the cross-platform, diagram-only exporter:

```sh
node planning/website-redesign/diagrams/export-diagrams.cjs --family=all
node planning/website-redesign/diagrams/export-diagrams.cjs --family=er --id=goods-fulfillment
```

The installed Draw.io Desktop 29.6.6 produced the exports. `--app=...` or `DRAWIO_PATH` selects another installation. Sources remain authoritative; do not run private bootstrap helpers with `--replace` during routine copy updates. LF is explicit in native-source authoring helpers. Embedded source, titles/descriptions, hashes, and native geometry are preserved. No substitute SVG geometry is drawn by the tooling.

Case-content authoring no longer writes diagrams, figure metadata, or result registers. A content-only dry run reproduced all eight pages and the case catalog, preserving 65 diagram/metadata/register files. `case-authoring-result.json` records this check. The small Case 8 wording correction is synchronized with `case-drafts.json`.

## Validation evidence

| Check | Result |
| --- | --- |
| Diagram and BPMN pytest modules | 171 passed, including the default verified-database selector |
| Teaching/query/report and onboarding pytest modules | 176 passed in the isolated folder with matching published report assets |
| Website Node checks | 40 passed |
| Production `npm run build` | Passed, reusing existing published report assets |
| Worked SQL | All 105 original queries retain their reviewed results |
| Report comparisons | All 48 existing preview/CSV/Excel report sets match canonical read-only query results |
| Native export agreement | All 107 source/embedded cell graphs, labels, styles, normalized geometry, and hashes agree |
| Connector geometry | Zero proper crossings between unrelated edges; zero unrelated node/header box collisions across the current library |
| Protected artifacts | All 122 original dataset/report files retain their SHA-256 hashes |
| Worked registers | All 3 retain their hashes |
| Code/routes | Non-diagram code, explicit fragments, slugs, and pagination checked across 47 pages |
| Case rebuild isolation | 8 pages and catalog reproduced; 65 geometry/metadata/register files unchanged |
| Git whitespace | `git diff --check` passed |

Validation used the unchanged release SQLite with SHA-256 `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`, opened read-only. Python website checks share an existing-file selector that prefers a checksum match and honors `CHARLES_RIVER_TEACHING_SQLITE`. No replacement database was created.

Python commands used the repository `.venv`, with subprocess timeouts of 3600 seconds for targeted diagram checks and 7200 seconds for the broader teaching/report slice:

```sh
.venv/bin/python -m pytest -q tests/website/test_diagram_learning.py tests/website/test_bpmn_models.py
# In the isolated validation folder, with the absolute verified SQLite override:
.venv/bin/python -m pytest -q tests/website/test_teaching_refinement.py tests/test_docs_onboarding_flow.py
node --test tests/website/*.test.cjs
npm run build
.venv/bin/python planning/website-redesign/diagrams/diagram_geometry.py
.venv/bin/python planning/website-redesign/diagrams/verify-preservation.py
```

`geometry-review.json`, `preservation-result.json`, `browser-review.json`, `verified-report-assets.json`, and the validation logs record the details. Native PNG previews were inspected for layout, wrapped text, field suffixes, branches, and message corridors. The geometry test normalizes omitted zero coordinates in Draw.io's embedded XML; it does not waive actual geometry differences.

Browser review covered desktop 1440×1000, tablet 768×1024, and phone 390×844, light/dark themes, image activation with Space, Enter, Tab wrapping, keyboard pan/zoom, actual size, Reset, reduced motion, Escape, and exact-opener focus restoration. Representative schema, lesson, process, and case pages had no horizontal page overflow. `browser-review.json` records the checks. Temporary viewport/media/cache overrides were restored.

Expert learning walkthroughs checked whether the materials expose grain, identify the necessary join, warn about row multiplication through independent summaries, distinguish recognition from settlement and completion from close, and state an evidence limitation. Actual learner effectiveness, native-device touch/pinch behavior, screen-reader coverage, and full accessibility conformance still require human evaluation.

## Preserved scope and local prerequisites

No public routes were changed. Existing schema section anchors, case/tutorial fragments, navigation, canonical metadata, query/report links, downloads, and redirects are preserved. New `#er-*` and `#evidence-*` anchors are additive.

No protected generator, config, SQL, dataset, or report logic changed. The protected-path diff since the starting commit is empty. Against frozen commit `7c21218dce19201013f7a71eb7263e12a85af09a`, the sole existing difference in that audit scope is the previously published website test `tests/test_docs_onboarding_flow.py`; this task did not alter it.

The primary checkout's frozen report folder contains 117 files, including nine missing and five stale report sets. A direct broader check there exposed those 14 pre-existing prerequisites. They were preserved. The successful build and report regression used 144 already available published assets in `/tmp/charles-publication-validate/site/static/reports`; no download or regeneration was used. Their inventory is recorded separately.

Existing prebuild branding/query/report manifest scripts ran in the isolated validation folder. No canonical inventories changed and no root generated manifests required updates. Build logs contain non-blocking existing Browserslist, dependency-analysis, and updater-access notices; no dependency or permission changes were made to suppress them.

## Review files and preview

The implementation spans `docs/`, `src/components/SchemaDiagram`, `src/components/EvidenceDiagram`, `StaticDiagram`, tutorial/case/BPMN wrappers, the retained Mermaid viewer and shared styles, authored diagram catalogs, `static/diagrams/`, website tests, AGENTS guidance, and private diagram/case tooling. `changed-files.json` gives the exact file inventory.

The prepared local site is running at:

- `http://127.0.0.1:3111/docs/reference/schema#er-cash-allocation`
- `http://127.0.0.1:3111/docs/processes/design-services`
- `http://127.0.0.1:3111/docs/analytics/cases/manufacturing-labor-cost-case`

The isolated site folder reuses the repository's installed dependencies and complete published report assets. Keep using that folder for review builds while the primary checkout's report prerequisites remain frozen. The user subsequently authorized committing, merging, and deploying this reviewed batch; [PUBLICATION.md](PUBLICATION.md) records the publication scope and verification requirements.
