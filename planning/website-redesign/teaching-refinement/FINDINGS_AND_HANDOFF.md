# Charles River teaching refinement — review handoff

Review branch: `codex/charles-river-teaching-refinement`, based on `37d17fd5ca288a5c386481ce7059cfda14563aee`. Fetched main was identical to the reviewed source; the starting tree was clean. Both supplied DOCX reports were read in full, with their recommendations distinguished from the pasted implementation request. Changes are local for review: no commit, push, merge, deployment, publication, release change, or account/hosting-setting change was performed in this task.

The existing redesign remains the foundation: company story and recurring roles, six process chapters, twelve connected Excel/SQL lessons, eight multi-session cases, public worked examples and private independent challenges, process models, unified reports/query hubs, search, tool tabs, canonical metadata, and existing stable routes. This pass repairs correctness and procedure gaps, then makes evidence and practice easier to follow.

## Finding dispositions

The table names implementation results separately from execution gates. Native Excel and learner validation remain open; an implemented procedure correction is not a new native application pass.

| Finding | Disposition | Exact principal files and evidence |
|---|---|---|
| F01 | Implemented; native Power Query gate open | `case-drafts.json`, content-only `build-case-content.cjs`, `docs/analytics/cases/workforce-coverage-and-attendance-case.md`: retain ApprovedTime, separate hours/identified-center/unassigned references, preserve null vs zero after left joins. Independent equivalent verifies all 15 affected groups, employee 109 periods 1/2, all 209 register rows, unchanged pay and missing-support classification. |
| F02 | Implemented | The same authoring source and `audit-review-pack-case.md` use the requested 336-time-entry sentence. Independent SQL verifies 336/1,895 = 17.73%, representing 71 distinct people separately. No misconduct conclusion or changed denominator. |
| F03 | Implemented | `docs/processes/manufacturing.md`: both center and date, then independently aggregate center/day load before capacity. Schedule 5 matches once rather than 1,180 times; four operations cannot multiply one 101.76-hour capacity row. |
| F04 | Implemented | `docs/reference/posting.md`: debit credit-balance P&L, credit debit-balance P&L including contra-revenue, net Income Summary direction. Four selected lines are an excerpt; full JE846 balances 42 rows at 27,503,887.96 per side. |
| F05 | Implemented | Posting reference `#payrollsummary-register-summaries`, plus incoming Dataset Guide, Payroll chapter and Lesson 10 links. Period/cost-center/account summary and synthetic ID convention are explicit; three register rows reconcile 23,489.30 to account 2030. The ordinary detailed-payment example uses a source record that exists; missing-source evidence is not assumed away. |
| F06 | Implemented | `docs/analytics/excel-guide.md`: March 1 inclusive–April 1 exclusive and January 1 inclusive–April 1 exclusive, all 2024. Independent date checks return 162 and 486 orders respectively. |
| F07 | Implemented | `src/data/bpmnModels.json`, model catalog and process exits: Cash Application→5, Design Services→7, Payroll→10, accrued settlement/Close→11; workshop retained as optional, statement case an extension. Story order is a teaching order, not serial business execution. |
| F08 | Implemented; credited existing correction | Homepage derives case count from catalog; 8 cases / 23 sessions, 48 reports and 170 query entries agree with actual inventories. Company Story labels agree across hero/navigation/sidebar. README already had release-qualified 82 tables and was preserved. Repository About settings were not changed or certified; any remaining external metadata adjustment needs a separate authorized task. |
| F09 | Implemented | Manufacturing chapter: completion and close branch separately through WorkOrder; independently aggregate before comparison. Regression shows a naive join repeats 743.16 as 1,486.32. |
| F10 | Implemented | The real Customize page is `docs/technical/dataset-delivery.md`; it now separates three public formats from optional instructor/local support. Roadmap and Technical Guide recognize 165,137 released punch rows; current Cloudflare and legacy GitHub Pages are distinguished without hosting changes. |
| F11 | Implemented | `src/data/teachingRelease.cjs`, SiteBranding helpers, homepage, Docusaurus presentation config and Downloads share fixed v2027.1 links and Dataset identity. Integrity instructions expose the actual SQLite SHA-256; primary URLs remain pinned even when a supplied latest URL changes. Protected configuration loaders/settings were untouched. |
| F12 | Implemented; native workbook gate open | Authoring JSON/script and all eight generated case pages: import invoice inputs before Case 1's first merge, retain raw references; audit names/first use across eight cases. All 51 stages and three extensions publish named inputs/outputs. Content-only regeneration is repeatable and leaves worked-result registers and figures unchanged. |
| E01 | Implemented | Six compact process predict/reveal bridges and Lesson 6's four-event explanation use existing release records. Complete shipment/invoice/receipt/application vouchers contain 15 ledger rows. The selected 952.07 application is not the full invoice settlement; other applications existed by January 31. |
| E02 | Implemented as one optional pilot | Lesson 9 retains its introductory flow and adds a bounded work-order WIP roll-forward (24.93 at January 31→0 after February 1 close), standard/operational labor comparison and separate company-wide clearing roll-forward. Eight new untitled SQL snippets execute independently. Pooled payroll/depreciation is not allocated to this order without support; an unexplained residual is never called actual overhead. |
| E03 | Implemented; timing/pilot gate open | Lesson index, gates after 3/6/before a case, individual case prerequisites/readiness, instructor modules, public method repair, `static/teaching/evidence-template.md` and `method-rubric.md`. Workload remains explicitly estimated: 23 sessions / 23–34.5 hours excludes setup/tutorials/reading. No private answers or invented learner timing. |
| E04 | Implemented | Report/query components, shared anchor/filter helpers and `src/data/reportTeachingMetadata.json`: all 48 reports link to the exact existing query anchor and name row grain, period basis, process and lesson. Guided paths precede catalogs; no SQL catalog duplication or frozen-manifest changes. |
| E05 | Implemented for available browser checks; manual gates open | Specific control and model names; retry/status/focus recovery; URL-backed filters, deep links and history; native report/Mermaid dialogs align with the existing native model viewer. Background cannot take focus, Tab wraps, Escape closes and returns to the exact opener. Existing Draw.io/SVG sources are unchanged. Native screen-reader, actual browser UI zoom and platform social-preview testing remain unrun; raster social output was optional and not justified by a proven SVG defect. |
| E06 | Technical evidence completed; external gates explicit | All original 105 worked SQL results, new independent accounting/procedure checks, all 48 report binaries, production build, rendered/HTTP routes, browser interactions and hashes are recorded in the validation matrix. Native Windows/Mac Excel and an actual learner pilot remain unrun. |

The case-source paths above share prefix `planning/website-redesign/cases/`; generated case paths share prefix `docs/analytics/cases/`. Exact changed-file inventory is available with `git diff --name-only origin/main` plus `git ls-files --others --exclude-standard`.

## Teacher-facing pathway

Keep the full reading story: company → O2C → design services → purchasing → manufacturing → payroll → close. Business cycles overlap; this order introduces ideas, not a dependency that every transaction follows. Ask for event/accounting predictions before revealing worked results, and keep the illustrative furnishing project distinct from actual selected release records.

Every focused module begins with company/process context, one tool's setup and Lessons 1–3. The first gate checks row grain, retained population/count/amounts and descriptive-join cardinality. Choose a core module and one case, then add extensions only when its stated prerequisites are met:

- **O2C:** Lessons 4–6, the complete-voucher/source-type-plus-ID gate, then Case 1.
- **P2P:** Lessons 8 and 11, summary readiness from Lesson 12, then Case 3; separate receipt-matched inventory from accrued services.
- **Manufacturing:** Lesson 9, relevant standard-cost/WIP refreshers and summary readiness, then Case 5. The new reconciliation is optional and bounded by attribution limits.
- **Payroll:** Lesson 10 plus Lesson 12 summary skills, then Case 6; retain unassigned-center evidence and distinguish employee/period grain from summary/remittance grain.
- **Financial close:** Lessons 6, 11 and 12, relevant earlier case experience and Case 7's individual prerequisites. Introduce the BPMN/control workshop after at least one verified trace.

Before a case, learners name cohort, cutoff, row key, independent aggregation and evidence limitation. The public rubric assesses event/account explanation, reproducibility, analytical checking and bounded judgment. It does not supply independent-challenge solutions. Select cases rather than assigning all eight by default. The instructor guide proposes a small real learner pilot measuring stage time, assistance requests, wrong joins, terminology problems and quality of transfer explanations; no pilot results are claimed.

## Validation and remaining limits

See [the detailed matrix](VALIDATION.md), [machine-readable evidence](validation-evidence.json), [HTTP responses](http-smoke.json), and [protected SHA-256 inventory](protected-hashes.json). Final source/figure/accounting checks and browser outcomes are recorded there. Historical Windows evidence—819 Design Services formula comparisons and five imports totaling 52,397 rows—is credited without extending it to unexecuted Power Query steps or Mac behavior.

The production build uses the existing published report assets. Its remaining notices are upstream Browserslist age and a `vscode-languageserver-types` dynamic-require warning; neither blocks the successful build. No lockfile/dependency changes were made to remove those notices.

Screen-reader behavior, native Windows/Mac Microsoft 365 procedures, actual browser UI 200%/400% zoom, social unfurls and learner timing/effectiveness remain separate unrun gates. CSS zoom stress and reduced-width reflow are equivalents, not a native zoom certification. The CSS zoom screenshots are not claimed to establish complete usability. Broad generator suites were intentionally not run: the user froze both generator execution and existing generator tests. No unknown failing accounting result was hidden by editing data or expected registers.

## Reproduce the website-only checks

From `/workspace/CharlesRiver_Database`:

```bash
.venv/bin/python planning/website-redesign/teaching-refinement/verify-freeze.py
node planning/website-redesign/cases/build-case-content.cjs --content-only
npm run validate-report-assets
XDG_CONFIG_HOME=/workspace/.charlesriver-setup/xdg-config npm run build
timeout 7200 .venv/bin/python -m pytest -q -p no:cacheprovider tests/test_docs_onboarding_flow.py tests/test_report_preview_overlay.py tests/test_contribution_feedback_workflow.py tests/website/test_bpmn_models.py tests/website/test_teaching_refinement.py
timeout 3600 node --test tests/website/*.test.cjs
```

**Report guard:** if report validation fails, stop before start/build/serve, whose lifecycle hooks can recreate missing reports. Restore only existing report bytes; never generate them for this task.

For a local production preview, the task's server is running on port 3000. In another task with no server, after the report guard passes:

```bash
XDG_CONFIG_HOME=/workspace/.charlesriver-setup/xdg-config npm run serve -- --host 127.0.0.1 --port 3000 --no-open
```

For live editing, stop only the preview process you started and use `npm run start -- --host 127.0.0.1 --port 3000 --no-open` with the same writable XDG_CONFIG_HOME. The runtime already supplies Playwright and `/usr/bin/chromium`; no project dependency was added. With a local server running, execute `timeout 3600 node --test tests/website/browser-interactions.cjs`. Screenshots are retained under ignored `outputs/_website_teaching_refinement/browser/`. No localhost preview link is published.
