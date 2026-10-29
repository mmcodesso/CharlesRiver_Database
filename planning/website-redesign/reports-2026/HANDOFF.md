# Report presentation implementation

## Follow-up: Export Data

The report viewer now includes an **Export Data** download link styled alongside PDF and Excel. It uses the existing CSV URL from the generated report manifest, with no new CSV generation or filtering. A visible description explains that CSV includes the complete report independent of the current period and filters. The original CSV remains downloadable even when the current report selection is empty or a formatted export is running. The Reports and Analytics hub documents this option. Retired report pages remain retirement notices.

Follow-up validation: `npm run build` passed with existing assets; the eight existing teaching-refinement Node checks passed. An installed-Chrome check downloaded CSV using keyboard activation from a filtered annual statement and confirmed its SHA-256 matches the existing file exactly. It also confirmed the control remains available for an empty filtered selection and the 390-pixel layout does not overflow. All 250 original artifact hashes remain unchanged, and `git diff --check` passed. No additional manifests, CSV files, or generator outputs were authored; normal prebuild scripts refreshed their existing manifests without tracked content changes. Evidence is retained privately in `outputs/_website_reports/export-data/` and `export-data-build.log`.

## Delivered behavior

The existing Reports and Analytics hub now starts with 20 core reports. Search includes the 23 specialist reports, and a URL-backed checkbox reveals them as a collection. Existing specialist anchors reveal their destinations automatically. The three pro forma statements and their two dependent statement/working-capital comparisons are retired from report discovery. Their anchors and new report routes provide an actual-results destination. All original download files and URLs remain available; report cards no longer advertise CSV.

All 43 retained reports have dedicated pages at `/docs/analytics/reports/<original-slug>`. Statement views include a complete selected month, the preceding calendar month where available, and fiscal-year monthly columns. Other reports retain source grain and expose only available period and entity filters. Registers paginate at 50 source rows. Complete filtered selections feed cancellable worker-based PDF and Excel exports, independently of the current screen page. Excel contains Report, Data, and Read Me sheets, numeric amounts, typed dates, text identifiers, frozen headings, print settings and source scope. PDF panels repeat the identifying column, headings, scope and page numbers. PDF selections above 10,000 source rows require narrower filters; Excel retains all selected rows.

## Changed implementation areas

- `src/components/ReportViewer/`: common report model, web viewer, print styling, export worker, PDF and Excel adapters.
- `src/data/reportPresentation.json`: authored classification, layouts, supported period fields, entity filters, grouping and permitted aging totals for all 48 original IDs. Individual source ratios remain unchanged; no percentage averaging or month-end balance summation is introduced.
- `src/plugins/report-pages.cjs`: server-rendered report routes, descriptions, source/process/practice links, and retirement pages.
- `scripts/prepare-report-presentation.{py,cjs}`: new website-only preparation. Reads CSV, verifies every retained report against unchanged canonical SQL executed with SQLite `mode=ro`, and writes period-partitioned presentation JSON. Does not import or call the generator/exporter. The Python interpreter is repo-local when available; `REPORTS_PYTHON` supports an explicit interpreter in build environments.
- ReportCatalog and ReportLearningPack now link to formatted views; all six original topics, source IDs, SQL anchors and original downloads are preserved. Catalog checkbox styling and responsive report containment were reviewed.
- Reports hub and Excel setup explain the new workflow. One statement-case instruction and its corresponding `case-drafts.json` sentence were synchronized. The process-led learning flow, required case headings, existing query/report components and worked results remain intact.
- Package scripts run the presentation prerequisite check before existing hooks. Added lazy-loaded ExcelJS, jsPDF and jsPDF-AutoTable dependencies and updated the lockfile. No hosting, release, account or workflow configuration was changed.
- Website tests cover presentation semantics, exports, curated discovery, routes and browser interaction. Existing teaching tests now check the curated hub and all retained report pages rather than expecting 48 flat-preview buttons.

## Prerequisites and generated assets

`npm run prepare-report-presentation` requires the existing report preview/CSV/Excel files and the checksum-matched published teaching database. It stops before existing build hooks can regenerate missing reports. Obtain missing prerequisites deliberately; do not regenerate the dataset or reports to bypass this check. This also applies to clean CI/hosting workspaces: deployment needs these prerequisites provisioned before the build. Deployment was not attempted in this task.

On 28 October 2026, GitHub's latest published release was verified as v2027.1, with SQLite SHA-256 `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`. This matches `outputs/CharlesRiver.sqlite` and the private website teaching baseline. All 48 original CSV reports were initially compared with canonical SQL results; all matched. Every presentation preparation re-verifies the 43 retained reports. If a future release changes that baseline, reconcile verification evidence before updating the private baseline; public release guidance remains on Downloads.

New generated assets live in ignored `static/report-data/`, including the presentation manifest and period partitions. Private provenance records CSV hashes, SQL hashes, the database hash, definition hash and row counts in `outputs/_website_reports/provenance.json`. Existing branding/query/report/report-pack manifests were refreshed by their normal scripts and have no tracked content changes. Frozen report assets were reused, never regenerated or overwritten.

## Validation evidence

- `npm run build`: passed on the final implementation. Existing reports were available and reused. The existing dynamic-require warning and old Browserslist-data notice remain non-fatal.
- `node --test --test-timeout=3600000 tests/website/navigation-seo.test.cjs tests/website/review-improvements.test.cjs tests/website/teaching-refinement.test.cjs tests/website/report-presentation.test.cjs`: 29 passed.
- With bundled Playwright available through `NODE_PATH`, `node --test --test-timeout=3600000 tests/website/report-browser.cjs`: passed against the final production preview using installed Chrome. Covers all 43 report routes, core/specialist discovery, specialist anchors, annual statement changes and browser Back, actual PDF/Excel worker downloads, entity/search filters, empty selections, pagination/keyboard activation, retirement notice and desktop/tablet/mobile containment. Representative screenshots include light/dark themes.
- Repo `.venv` pytest teaching-refinement slice: 165 initially passed; two Windows default-encoding failures passed when rerun using `-X utf8`. The focused rerun (`-k "worked_inventory or new_reference_queries"`, 3600-second subprocess timeout) passed all four selected tests, covering the failed cases and their related parameter cases. All 167 cases are covered across those runs. No generator tests or data generation were run.
- `compileall -q src tests`: initial cache-write permissions prevented three existing test cache writes. Re-running with `-X pycache_prefix=outputs/_website_reports/pycache` passed. The new preparation script also passed direct syntax compilation.
- PDF and Excel exports were exercised for statement, summary, register and rollforward families. PDF pages were rendered with Poppler and inspected. Every page in the four sample PDFs was checked for company, report title and correct page footer using pypdf. The income-statement workbook was imported and rendered with Artifact Tool; numeric values and typed date cells were independently checked using read-only openpyxl. The actual browser-generated annual workbook and PDF were downloaded successfully.
- `git diff --check`: passed.

The broader four-file Node run also exercised cases. Three case checks passed, including all worked case SQL and route compatibility. Its existing Draw.io hash check failed for `case01-handoffs`: the unchanged working source has CRLF while Git's source bytes have LF. Normalizing CRLF produces exactly HEAD's source. No diagram source or export was modified to address this unrelated checkout issue.

## Preservation and limitations

`outputs/_website_reports/baseline-hashes.json` and `final-preservation.json` record SHA-256 for all 250 original local dataset/report artifacts. Every hash is unchanged. There is no task diff in the generator, configuration, canonical queries, original report scripts or existing generated manifests. The protected-path comparison against frozen commit `7c21218dce19201013f7a71eb7263e12a85af09a` retains only the pre-existing `src/generated/queryDocCollections.js` difference already present at HEAD. The two new presentation preparation scripts are the separately authorized website layer.

Exports are snapshots of selected source results. They do not add editable accounting models or inferred accounting capabilities. Wide PDFs use column panels, which can produce long documents for large evidence selections. Browser printing is also available; the dedicated PDF action controls fixed-page layout. PDFs are text-based but untagged; automated and keyboard checks do not establish full accessibility conformance. Native desktop Excel printing was not independently exercised.

The dependency audit reports existing broader project advisories and a moderate ExcelJS transitive UUID advisory. The UUID advisory concerns buffer handling in UUID v3/v5/v6; this report feature does not accept UUID buffers or call those methods. Neither jsPDF nor jsPDF-AutoTable has an advisory in the captured audit. No broad dependency migration was attempted. Full audit output is retained privately in `outputs/_website_reports/npm-audit.json`.

## Preview

The production preview is available at `http://127.0.0.1:3000/docs/analytics`. It was started with `node node_modules/@docusaurus/core/bin/docusaurus.mjs serve --port 3000 --host 127.0.0.1 --no-open` after the build, avoiding another preparation pass. For a fresh preview, run `npm run build`, then `npm run serve` with the prerequisites above. No commit, push or deployment was performed.
