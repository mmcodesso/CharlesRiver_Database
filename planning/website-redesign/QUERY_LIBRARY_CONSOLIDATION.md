# Unified Query Library

The Query Library remains at `/docs/analytics/analysis-tracks`, directly below Reports and Analytics in top-level navigation. The Financial, Managerial, and Audit query subpages have been removed, with their former URLs redirected to the library. Authored links in cases, the SQL guide, the manual-journal process, and case discovery now target the relevant topic in the single library.

All 170 canonical SQL files appear once under the same six business topics and labels as the 48 reports:

| Topic | Queries |
| --- | ---: |
| Statements and Cash | 36 |
| Sales and Customers | 43 |
| Purchasing and Inventory | 19 |
| Production and Planning | 36 |
| People and Payroll | 30 |
| Controls and Exceptions | 6 |

The six case-tracing queries are included in their corresponding business topics. Every report's source query is assigned to the same topic as that report. Query IDs, SQL, asset URLs, generator configuration, manifests, and release files remain unchanged. No classification depends on a filename heuristic at runtime: `src/data/queryTopics.json` is the authored presentation map.

The catalog retains shared report styling, search, topic filtering, counts, empty results, clear filters, topic jumps, SQL expansion, and original-file downloads. Forty interpretation notes from the removed pages are retained as expandable topic guidance in `src/data/queryTopicGuidance.json`; anomaly coverage is read from the existing curated query collections and attached to the applicable query card. The statement-reconciliation and CAPEX paths retain their original two six-step sequences and guidance in `src/data/queryLearningPaths.json`, linking to stable query headings without rendering duplicate query cards.

The site now has 47 authored documents and 23 learning resources. All 17 cases retain required sections and their existing QueryReference/QuerySequence content and order. All 48 Mermaid diagrams and 11 BPMN models remain unchanged. Company → process → evidence → analysis → interpretation → decision remains the teaching flow.

Implementation changes: QueryLibrary, optional QueryReference heading anchors/guidance, shared catalog spacing, the three authored query data maps, the main query/SQL-guide docs, dependent authored links, sidebar, redirects, website guards, AGENTS, and planning inventories. Removed sources: `docs/analytics/financial.md`, `managerial.md`, and `audit.md`.

Validation logs and preview images are in ignored `outputs/_website_redesign/query-topics-*`. Final results are recorded after the build and browser checks. Existing npm prebuild hooks refresh website manifests through their original scripts, validate and reuse existing report assets, and do not regenerate data. No generator tests or dataset builds are required for this presentation-only change. Main and production remain unchanged; the preview stays on port 3000.

Validation results: `npm run build` passed with no broken-link/anchor notices. All 17 website/navigation/rendered-site Node tests and 12 documentation/report-preview pytest tests passed. Test processes used one-hour timeouts; Python ran through the repo virtual environment. Website guards compare the 170 unique query keys against the canonical SQL inventory, compare every report's source query topic against the report taxonomy, verify guided-path targets, check the three redirects and sitemap exclusions, and validate remaining metadata/internal links.

Browser checks passed for the six-topic navigation, People and Payroll's 30-query filter, combined search, empty results, reset via a topic jump, SQL fetch/expansion, retained anomaly coverage, the six-step statement path, filter reset and scrolling to its target query, and all three old URL redirects. At 390px, Purchasing and Inventory returned 19 queries with no page overflow; temporary viewport overrides were reset. The final session recorded no browser errors. Screenshots: `outputs/_website_redesign/query-topics-desktop.png` and `query-topics-mobile.png`.

Freeze checks passed for protected tracked paths and all 293 dataset/report SHA-256s. Existing manifests refreshed through normal build hooks with no tracked content changes; report files were reused. All 17 case query components and their sequences were compared against the previous commit and remain unchanged. No generator/data build ran, and no dependency changed.

Known legacy-test drift: protected generator test files also contain assertions about the old documentation layout. For example, `tests/test_phase10_analytics.py::test_phase10_analytics_docs_and_queries_exist` still requires the three removed query sources; `tests/test_financial_reconciliation_queries.py::test_reconciliation_queries_are_in_catalog_and_docs` and balance-sheet, income-statement, cash-flow, fixed-asset, manufacturing-audit, and phase 17–23 documentation assertions read those retired paths or old case links. `tests/test_report_exports.py::test_report_manifest_and_docs_include_curated_paths` similarly expects the report subpages retired in the earlier consolidation. These frozen source-layout assertions were inspected but not run or modified; a full generator-suite pass is not claimed. Their documentation-only expectations need migration if the freeze is later lifted. Current website-specific guards validate the replacement presentation, preserved inventory/guidance/links, and redirects. No SQL semantics or dataset validation logic changed.
