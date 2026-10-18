# Learn and Practice implementation review

Implemented 17 October 2026. Local review entry: http://localhost:3000/docs/learn-and-practice.

## Delivered curriculum

The section now contains twelve numbered tutorials, a course introduction, two setup guides, and the optional BPMN and Controls Workshop. The business question, figure, expected result, evidence submission, and interpretation are shared. Synchronized Excel / SQL tabs retain the learner's selection across lessons, defaulting to Excel on a first visit.

The recurring company roles provide the reason to investigate. Actual examples are explicitly identified as synthetic records from release v2027.1, separate from the illustrative furnishing project. The first six lessons continue customer 130 / sales order 11; later processes use independent verified examples.

| Page | Learning outcome and new skill | Verified example and checkpoint | Optional material and continuation |
|---|---|---|---|
| Course introduction | Choose one tool and understand the sequence and evidence portfolio | Three groups: foundations, processes, interpretation | Setup as needed; Lesson 1 |
| Set Up Excel | Import a named Excel Table with Power Query into a separate workbook; confirm types and names | T4_Customer → CustomerData; 220 rows; customer 130 | Repeat-import and troubleshooting guidance; Lesson 1 |
| Set Up SQL | Open SQLite in DB Browser, browse a table, execute and save a short query | Customer table; 220 rows; customer 130 | Alternate editors and adapting examples; Lesson 1 |
| 1. Meet the Records | Explain a row, key, and attribute; filter and sort / SELECT, WHERE, ORDER BY, LIMIT | Customer 130, Jones, Richardson and Beard; five sorted Design Trade customer IDs 45, 102, 5, 210, 191 | Customer 131 variation; Lesson 2 |
| 2. Read an Order | Separate header and line grain; SUBTOTAL / COUNT, SUM, ROUND | Order 11; lines 42 and 43; 3,552.21 + 7,845.57 = 11,397.78 | Line 2 variation; Lesson 3 |
| 3. Connect the Records | Add descriptions using unique keys; exact XLOOKUP / two independently explained joins | Customer 130; items 234 and 222; two lines and unchanged total | Unit of measure variation; Lesson 4 |
| 4. Follow a Goods Sale | Trace precise document links; Power Query merges / LEFT JOIN | Line 43 → shipment line 347 → invoice line 272; shipment 87 and invoice 202 on January 31; full invoice 12,248.33 | Trace line 42; Lesson 5 |
| 5. Follow Customer Settlement | Distinguish receipt and application; SUMIFS / date-conditioned totals | Invoice 202; four applications; balances 12,010.17 at January 31 and 11,058.10 at February 29; no credits | April 16 zero balance; Lesson 6 |
| 6. Find the Accounting Entries | Filter full source events, add account names, and check vouchers | Shipment 87, invoice 202, receipt 173, application 225; 15 rows; four balanced vouchers | Receipt 528 versus application 1194; posting reference; Lesson 7 |
| 7. Follow Design Time into Billing | Aggregate approved time and follow engagement/period billing without duplicating amounts | Engagement 2, January; seven entries; 32.67 billable + 1.21 non-billable hours; time cost 937.02; billing line 2 → invoice line 387; 6,860.70 | Billable-share variation; Lesson 8 |
| 8. Follow a Purchase | Separate request, commitment, receipt, payable, and payment | Request 21330; PO line 21074; receipt line 25479; invoice 36461; 8.83 goods + 0.13 tax = 8.96; payment January 8, 2027 | Reporting-date change; Lesson 9 |
| 9. Follow Manufacturing Costs | Keep event-specific populations separate and distinguish completion from close | WO 1; issued materials 754.29; two completions total 1,019.85; February 1 close variance 743.16; five labor rows total 191.89 | Material variance 24.93; manufacturing case; Lesson 10 |
| 10. Follow Hours into Payroll | Reconcile approved hours and net pay; distinguish employee and period grains | Employee 109, period 1, register 96; 10 approved rows; 79.44 regular + 0.09 overtime hours; gross 1,902.64, net 1,578.34; three separate whole-period remittances | January 20 settlement variation; Lesson 11 |
| 11. Follow an Estimate into Settlement | Follow explicit accrual links, residual adjustment, and later payable settlement | Journal 9, invoice 39851, adjustment 698; estimate 10,039.33 exceeds invoice 10,019.59; liability debit / expense credit 19.74; May 20 payment | March 10 / March 11 distinction; Lesson 12 |
| 12. Turn Records into a Conclusion | Define a population, reconcile a summary, and support a bounded judgment; PivotTable and chart / GROUP BY | Q1 2024 SalesInvoice.SubTotal; 1,355 headers; 5,796,664.16 before freight, tax, and credits; largest February invoice 693 subtotal 30,053.79 | 2025 variation; Cases first, reports and queries as later resources |
| Optional controls workshop | Move from an investigated handoff to evidence, risk, control, and assessment | Uses the process already studied; no public graded-case solution | Full notation, model editing, broader controls activities retained |

## Authoring conventions and example register

- Authored lessons live in docs/learn-and-practice; the setup URLs remain docs/analytics/excel-guide and docs/analytics/sql-guide. Their front matter describes tutorials and explicit previous/next destinations.
- Each process lesson introduces a small situation, guided figure, starting records, tool steps, visible result checks, evidence submission, limitation, variation with expandable feedback, and one main continuation.
- Excel working files are separate from the published workbook and start afresh per lesson. The setup guide distinguishes exported Table names, worksheet names, query names, and working Table names. Later lessons state filters before loading large tables. Lookup keys are unique; multi-match relationships use merges.
- SQL is authored in lesson content, read-only, explicit about columns, keys and dates, and deterministic for the selected examples. Canonical query packs are unchanged.
- The machine-readable register is tutorials/verified-examples.json: page, query title, complete SQL, expected columns and rows, release, and SHA-256. Excel instructions and working names are maintained beside each corresponding SQL block in the lesson; this table records the teaching and accounting qualifications.
- tutorials/workbook-selections.json identifies 36 source populations. prepare-workbook-check.cjs reads the release through Node SQLite with readOnly: true; verify-workbook.ps1 streams the original XLSX ZIP/XML and checks every selected cell, converting Excel serial dates. These helpers only write ignored verification output under outputs/_website_redesign/tutorials.
- Student formulas are English Microsoft 365 formulas; localization and comma/semicolon differences are explained in setup. Advanced M, Power Pivot, macros, and database services are outside the core course.

## Figures and interfaces

Each lesson has one principal three-panel figure, an editable .drawio source, and a native Draw.io-exported SVG in static/diagrams/tutorials. Diagram labels use the actual selected keys and amounts. Sources and exports include a release label; expanded text describes the relationships without claiming that the examples establish universal cardinality.

The 12 SVGs embed their editable source and carry a source SHA-256, accessible title, and description. The private exporter is tutorials/export-diagrams.ps1. It uses the installed official Draw.io Desktop CLI with hidden windows, then adds accessibility metadata. Tutorial assets remain separate from the formal BPMN inventory and preserve its identifiers.

StaticDiagram now owns the existing image/modal/zoom/pan/reset/Escape/focus behavior. BpmnDiagram wraps it, retaining its model labels, evidence descriptions, and downloads. Tutorial/Figure uses the same viewer and the existing Mermaid visual style. Tutorial/ToolSteps uses Docusaurus synchronized tab storage and the optional tool query-string choice. No new package dependency was introduced.

## Navigation and compatibility

Learn and Practice retains its top-level position. Its shallow sidebar lists all 12 lessons, followed by setup help and the optional workshop. Lesson 12 continues to the existing Cases hub. The Dataset Guide and practical entry links now point beginners to Lesson 1.

Preserved routes include source-to-ledger (now Lesson 4), receipt-to-payable (Lesson 8), manufacturing-cost-flow (Lesson 9), both analytics setup guides, the landing page, and controls workshop. TUTORIAL_ORIGINAL_ANCHORS.json records the original section IDs; aliases retain all of them, with meaningful transitional copy. The older guide exercise anchors are explicit heading IDs so Docusaurus can validate existing case links.

Cases, Reports and Analytics, Query Library, downloads, formal BPMN identifiers, and canonical SQL remain separate and unchanged. Case-required headings and QuerySequence components were preserved. Existing process/model links continue to their relevant investigation. Tutorial learning-resource metadata now identifies all twelve lessons as Tutorial.

## Validation and commands

- npm run build: passed with existing report assets; prebuild refreshed branding and manifests through their existing scripts, with no resulting generated-file diff. No report or dataset regeneration. Existing upstream warnings concern stale Browserslist data, vscode-languageserver-types dynamic require, and the local update-check store; no broken-link warnings remain.
- Node website tests: 21 passed, including navigation/SEO, all authored rendered pages, legacy routes, report/query catalogs, tutorial metadata/pagination, all 43 worked SQL blocks, SVG/source matches, and legacy section anchors. Test runner used spawnSync with a 3,600,000 ms timeout.
- 43 SQL blocks executed against checksum-matched v2027.1 using read-only SQLite. Results include exact rows/columns/order/amounts. Additional checks cover cutoff dates, partial cash allocation, order-line totals, completion costs, and residual accruals.
- Read-only workbook comparison: 1,770 selected rows and 22,270 cells across 36 tables agree with SQLite. No released workbook was modified.
- Browser review: all twelve lesson routes rendered with loaded figures, consistent selected tool and pagination, without page-level horizontal overflow. Reviewed the whole text once as the Excel route and once as the SQL route. Added first-use clause explanations and independent result checkpoints during that review.
- Interactive review: synchronized tool tabs and persistence, copy feedback, expandable explanations, image-click expansion, zoom, reset, Escape dismissal, focus restoration, keyboard pan and modal focus behavior. Representative desktop, 768-pixel tablet, and 390-pixel mobile layouts reviewed. Existing BPMN and Mermaid image expansion still work.
- Protected-path diff and all 293 frozen dataset/report artifact SHA-256 values: passed. Frozen baseline: 7c21218dce19201013f7a71eb7263e12a85af09a.
- SQLite SHA-256: de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c.
- git diff --check: passed.

Reproduce website tests with Node 22+ (CI uses Node 24):

~~~powershell
@'
const {spawnSync}=require('node:child_process');
const result=spawnSync(process.execPath,['--test','tests/website/navigation-seo.test.cjs','tests/website/rendered-site.test.cjs','tests/website/tutorials.test.cjs'],{stdio:'inherit',timeout:3600000});
process.exit(result.status ?? 1);
'@ | node
node planning/website-redesign/tutorials/prepare-workbook-check.cjs
& planning/website-redesign/tutorials/verify-workbook.ps1
& planning/website-redesign/verify-freeze.ps1
~~~

## Limits and handoff

Actual Excel desktop interaction on Windows or Mac was not available in this session. The workbook structures, selected data, formula logic, and written procedures were reviewed; Power Query imports, formulas, and PivotTables were not executed through either Excel desktop UI. Platform menu instructions were checked against Microsoft's current Windows import and Mac Power Query documentation. DB Browser menu use was documented, while queries were executed with Node's SQLite runtime rather than through the DB Browser desktop UI. This is not a claim of full accessibility conformance or classroom usability testing.

Python/generator regression tests and dataset generation were not run: this is website-only work and the repo-local Python environment is unavailable. Dataset, generator, accounting calculations, queries, released downloads, and report assets are unchanged. No deployment was performed for this tutorial implementation.

The existing uncommitted company/story/process rewrites and MDX deep-link handling from the earlier content phase were preserved. Current changed groups are tutorial/setup/workshop docs, beginner cross-links, sidebar, shared static viewer and tutorial components/data, learning metadata, authored diagrams, website tests, and private review/register files. The complete local journey is ready for review through the production preview on port 3000.
