# Cases implementation review

Implemented the eight-case plan on 2026-10-17. The public library now contains three basic, three intermediate, and two advanced investigations. Each case has numbered sessions, both tool routes, public worked checks, a decision, and a separate independent challenge without a model answer. The user's follow-up is included: every Excel procedure is a numbered list, with copyable formula blocks within numbered steps.

## Changed areas

- Replaced the case landing page and eight case pages under docs/analytics/cases; retired ten old pages into direct redirects.
- Updated caseCatalog, caseFigures, caseRedirects, CaseExplorer, shared Cases components, sidebar order, Docusaurus redirects, and the curated case query sequences.
- Updated instructor guidance, process/tutorial cross-links, and report-card link presentation. Frozen report catalogs and canonical SQL remain unchanged.
- Added 31 editable Draw.io sources and 31 native exported SVGs under static/diagrams/cases.
- Added worked-example, scope, source-table-name, and legacy-anchor registers plus reproducible authoring/verification scripts in planning/website-redesign/cases. These are outside the published documentation tree. They contain worked results only, never independent challenge answers.
- Updated website test expectations and added cases.test.cjs.

## Page review

| Case | Outcome and new analytical work | Worked population | Optional material / continuation |
|---|---|---|---|
| 1. Customer account | Define an order cohort; aggregate shipments, invoices, applications and credits independently; compare two cutoffs | Customer 120, six Q1 2024 orders; March 31 / April 30 | Canonical O2C queries; continue to design |
| 2. Design services | Reconcile work dates, approval, billing periods, invoice amounts and limited time cost | 204 Q1 time entries, 21 engagements | Service query references; continue to obligations |
| 3. Supplier obligations | Separate GRNI, AP, expense estimates, adjustments and payment | Supplier 27 receipts plus journals 9, 26, 43 | Accrual/purchasing references; continue to product decisions |
| 4. Product and pricing | Compare weighted price realization, current standard cost, delivery and separate credit populations | 1,857 Q1 goods invoice lines | Lifecycle, profitability and pricing queries; continue to manufacturing |
| 5. Production | Preserve a release cohort; summarize four independent event grains; inspect daily capacity | 336 January releases through February 29 | Worked planning extension; continue to payroll |
| 6. Staffing and payroll | Compare compatible center/date populations, employee-period pay, employee payment and remittances | January 1–28, payroll periods 1–2 | Workforce/organization references; continue to close |
| 7. Profit, cash and close | Construct full-history openings, quarter movements, pre-close profit and a complete cash bridge | Q4 2026 with all necessary prior history | Worked asset lifecycle; continue to controls |
| 8. Exceptions and controls | Move from flags to evidence, alternatives and testable proposed controls | Full-history duplicate references and Q4 2026 approved overtime | Specialist pricing, planning and authority references; continue to analytics |

The complete authored sequence was reviewed separately for Excel and SQL. The Excel review repaired summary-column names and removed a dependency on identifiers visible only in the SQL route. Process-led explanations, Key Data Sources, Recommended Query Sequence, Next Steps, query links, and report links are retained. Canonical query sequences appear after the guided investigation in optional reference material.

## Verification completed

- Production build: npm run build; existing report assets reused and validated. Prebuild refreshed branding and query/report manifests through the existing scripts.
- Website checks: navigation-seo.test.cjs, rendered-site.test.cjs, tutorials.test.cjs, cases.test.cjs; 25 passing tests. Runs used a 3,600,000 ms timeout through Node spawnSync.
- All 62 case SQL statements executed read-only against the checksum-matched release; result columns, order, row counts and values matched the worked register. The existing 43 tutorial statements also passed.
- SQLite SHA-256: de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c (v2027.1, default teaching release).
- Published workbook read-only comparison: 108,672 selected records and 1,240,289 cells across 51 source tables matched SQLite, including dates and identifiers.
- Full workbook ledger aggregation: 732,310 pre-quarter rows and 83,085 quarter rows produced matching opening/movement/closing values for all 71 populated accounts. Later 2027 rows were excluded by the stated upper date boundary.
- Independent spreadsheet-equivalent reconstructions: 1,409 comparisons across all eight cases passed, using the workbook-verified raw populations. Includes SUMIFS-style settlement/payment logic, covered service hours, product weighted measures, work-order event totals, gross-to-net pay, ledger rollforwards and exception counts.
- Source/SVG checks: all 31 native exports contain the matching Draw.io source hash, embedded model, accessible title and description, and matching built assets.
- Compatibility: ten direct redirects and all 255 original heading anchors preserved; all rendered internal links/download targets passed. A browser test confirmed the old pricing route preserves its query/fragment and opens the optional reference section for its legacy anchor.
- Browser checks: desktop case layout, mobile and tablet page widths without document overflow, mobile diagram expansion, zoom/reset, keyboard panning, Escape dismissal and focus restoration, keyboard tab activation, remembered tool choice between cases, SQL copy confirmation and clipboard text, and expandable feedback. Representative figure labels were visually reviewed. All eight cases' sources/exports were structurally checked; this is not a full assistive-technology audit.
- Protected-path and frozen-artifact verification: all 293 SHA-256 hashes unchanged; protected tracked paths unchanged.
- git diff --check completed after formatting cleanup.

## Limits and remaining operational work

At the initial implementation review, native Microsoft 365 Windows and Mac walkthroughs were unavailable, so workbook source data and calculation logic were checked independently. The subsequent [Excel formula follow-up](EXCEL_FORMULA_REVIEW.md) added complete copyable formulas and verified the Design Services calculations in native Windows Excel: 819 comparisons passed across 810 calculated cells and nine summary checks. Full native Power Query workflows and Mac walkthroughs remain unverified; the follow-up records that distinction.

The production build retains the existing nonfatal vscode-languageserver dynamic-require warning and the local Docusaurus update-check permission warning. No dependency changes were introduced to suppress them. Python/generator tests were not run because this implementation changes website content/presentation only. No dataset, schema, generator, canonical SQL, published download, calculation implementation, or report asset was changed. Deployment was not part of this request.

The workspace contains earlier company-story/tutorial redesign changes from this ongoing task; those were preserved. Generated manifests were refreshed by the normal build, and heavy generated outputs remain ignored.
