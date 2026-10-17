# Reports, analytics, and query navigation consolidation

The canonical report hub is `/docs/analytics`. Nine former report documents were removed and their URLs redirect to this page or a relevant business-topic anchor. Header, sidebar, homepage, process, exercise, case, and instructor links now lead to the unified hub.

All 48 reports appear once in six authored presentation topics:

| Topic | Reports |
| --- | ---: |
| Statements and Cash | 11 |
| Sales and Customers | 13 |
| Purchasing and Inventory | 6 |
| Production and Planning | 3 |
| People and Payroll | 13 |
| Controls and Exceptions | 2 |

Search and topic filtering combine, announce result counts, support an empty state and reset, and leave all reports available in server-rendered HTML. Topic jump links reset filters before navigating. Preview dialogs and original Excel/CSV asset URLs are retained. Existing report-level discussion questions and suggested analysis are deduplicated from the frozen report-pack manifest into expandable interpretation panels, preserving prompts for 44 unique reports. The old perspective introduction/sequence layer is retired. The unused legacy ReportLearningPack component and generated manifests remain for compatibility; they no longer publish separate report pages.

Query Library is now a top-level section immediately below Reports and Analytics, as requested in the follow-up. Its main page uses the report catalog's shared layout styles, search, domain filter, live count, reset, empty state, and domain jump links. All 170 SQL files are available once (58 financial, 53 managerial, 53 audit, 6 case traces), with existing objectives/output grains/tables, expandable SQL, and original-file download links. Financial/Managerial/Audit query pages remain as guided analysis paths beneath the library. Canonical SQL and all case query sequences are unchanged.

There are 50 authored documents and 23 learning activities. All 17 cases preserve their assessed sections and source-query sequence. All six process guides, 37 Mermaid blocks, and 11 BPMN models remain. Company → process → evidence → analysis → interpretation → decision remains the teaching sequence.

Implementation: `docs/analytics/index.md`, `src/data/reportTopics.json`, `src/components/ReportCatalog/`, `src/components/QueryLibrary/`, `src/components/QueryReference/`, `docs/analytics/analysis-tracks.md`, navigation/config, and dependent authored links. The page/changed-file inventories and AGENTS report guidance are updated.

Validation: production build passed; 16 website/navigation/rendered-HTML checks passed; 12 targeted documentation and report-preview pytest checks passed using the repository virtual environment. Each test process had a one-hour timeout. The frozen-scope guard passed for all protected tracked paths and 293 SHA-256 artifact checks. All 170 SQL download links resolve in the built site, every report is assigned once, and all nine report redirects are emitted outside the sitemap. Existing build hooks refreshed the website manifests through their normal scripts with no generated content diff; report assets were reused and validated. No dataset generation or broad generator suite ran for this presentation-only change.

Browser checks covered report/query search, combined filters, empty results, reset, section jumps, report preview loading and Escape/focus restoration, source SQL expansion, old report URLs, and representative desktop/tablet/mobile layouts. Production QA exposed a server/client difference in iterable Set spreading in report prompt lists; materializing arrays with Array.from fixes that mismatch. Temporary diagnostics stayed in ignored outputs and are excluded from the final configuration. Browserslist age, the existing vscode-languageserver-types dependency warning, and the update-check permission notice remain unrelated build notices. Detailed final browser results and local commit are recorded in the session handoff. Logs and screenshots are in ignored `outputs/_website_redesign/`. The preview remains at `http://localhost:3000/docs/analytics` and `http://localhost:3000/docs/analytics/analysis-tracks`.

Final verification: production browser checks passed after the prompt-list fix, with no new console errors in the final report/query session. The navigation drawer visibly places Query Library directly below Reports and Analytics at the same indentation. Final catalog and navigation screenshots are `outputs/_website_redesign/query-library-catalog-final.png`, `query-library-navigation-final.png`, and `reports-consolidated-final.png`; the mobile report filter view is `reports-mobile.png`. The actual query preview viewport was 900px wide because the app constrained the requested desktop override; report layout had also been reviewed at the earlier wider desktop viewport, and report responsive checks covered 390px and 768px. Temporary viewport overrides were reset. The temporary development server at port 3001 was stopped; the user-facing production preview at port 3000 remains running.
