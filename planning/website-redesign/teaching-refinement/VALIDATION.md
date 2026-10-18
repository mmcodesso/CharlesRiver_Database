# Teaching refinement validation

Source baseline: `37d17fd5ca288a5c386481ce7059cfda14563aee`. Dataset: published **v2027.1**, SQLite SHA-256 `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`. Linux validation used Python 3.13.16 in the repository `.venv` and Node 24.19.0. The database was opened using a file URI with `mode=ro` and connection-level `query_only=ON`; its checksum matched before and after execution.

[Machine-readable evidence](validation-evidence.json) records commands, results, baseline case anchors, numerical checks, and a separate native-tool matrix. This document distinguishes an independent equivalent from native application execution. No expected-result register was rewritten to make a changed result pass.

## Executed independent checks

| Gate | Result | Evidence and scope |
|---|---|---|
| Existing worked SQL | Passed | All **43 tutorial + 62 case statements** remain byte-identical to their reviewed registers and reproduce their columns, row order, and values. |
| F01 retained detail and null centers | Passed, independent equivalent | 782 approved detail rows form 79 employee-period groups. All 15 groups with missing centers agree with `COUNT(DISTINCT WorkCenterID)`, including employee 109 in periods 1 and 2. Missing-center counts/hours remain available. All 209 payroll registers survive; 130 without approved-hour support retain nulls. Gross pay, deductions, net pay, employer tax, and benefits are preserved. Period net pay remains 104,320.59 and 220,069.69. |
| F02 exception units | Passed | 336 missing-linked-approval **entries** / 1,895 eligible entries = 17.73%. The flagged entries represent 71 distinct people; that separate figure is not substituted for the entry denominator. |
| F03 calendar matching and capacity | Passed | Schedule 5 produces 1,180 center-only matches and one center/date match. Center 1 on January 22 has four operations / 6.45 hours and one 101.76-hour capacity row. Summing capacity after the operation join incorrectly yields 407.04. |
| F04 annual close | Passed | All 42 ledger rows for JournalEntry 846 balance at 27,503,887.96 on each side. Every P&L account reverses its prior balance, including debit-balance contra-revenue. The selected four-line excerpt does not balance alone. |
| F05 PayrollSummary | Passed | PRS-0001-001 has source ID 1001001, null source line, six ledger rows, and three register facts totaling 23,489.30 net pay, equal to the 2030 credit. No PayrollRegisterID 1001001 exists. Detailed PayrollPayment remains the released source pattern. |
| F06 date intervals | Passed | March 2024 includes March 1 and excludes April 1 (162 orders); Q1 includes January 1 and excludes April 1 (486 orders). Actual first/last dates and boundary predicates are checked separately. |
| F09 independent branches | Passed | Work order 1 has two completion lines totaling 1,019.85 and one 743.16 close. Directly joining detail repeats the close as 1,486.32; independent work-order aggregates retain the correct values. No completion-line key exists on WorkOrderClose. |
| F08/F10 release inventory | Passed | The checksum-matched release contains 82 user tables and 165,137 raw TimeClockPunch rows. |
| E01 accounting bridge | Passed | The four complete event vouchers contain 15 ledger rows and each balances. Invoice 202 already has 238.16 applied by January 31; total applied is 1,190.23 by February 29 and 12,248.33 by April 16. The selected 952.07 application alone cannot establish its full balance. |
| E02 optional reconciliation | Passed within stated scope | All eight new reference/extension SQL snippets execute in addition to the original 105. Selected manufacturing vouchers balance; direct labor support 191.89 versus standard labor 185.67 yields 6.22. Company-wide 1090 opening/movement/closing identities reproduce at January 31, February 1, and February 2. Pooled-period support does not establish work-order overhead attribution. |
| Onboarding-flow assertions | Passed | Replaced retired 17-case/heading/direct-link assumptions with the actual eight-case inventory, twelve-lesson sequence, prediction/checkpoint/deliverable requirements, documented historical fragments, and working setup links. Generator tests were not edited or invoked. |
| F01/F02/F12 source contracts | Passed | All eight Excel routes expose named inputs/outputs; authoring stage metadata agrees with rendered Markdown. Raw invoice queries are imported before the first merge, and ApprovedTime has separate retained references. This is source inspection, not native Power Query execution. |
| F07 activity destinations | Passed | Cash Application → Lesson 5; Accrued-Service Settlement and Close → Lesson 11; Design Services → Lesson 7; Payroll → Lesson 10. Workshop access is preserved. |
| Restored report binaries | Passed | All 48 canonical report queries execute read-only; all 144 report files match their exact query columns and result order. Full CSV and XLSX rows agree (240,800 rows in each format); all 1,172 preview-prefix rows and full population counts agree. All file hashes are unchanged before/after the checks. |

The targeted Python command passed **128 checks**:

```bash
timeout 3600 .venv/bin/python -m pytest -q \
  tests/website/test_teaching_refinement.py tests/test_docs_onboarding_flow.py
```

The Node source-contract slice passed three checks:

```bash
timeout 3600 node --test --test-name-pattern='F01|F06|F07' \
  tests/website/teaching-refinement.test.cjs
```

Additional controls test pinned download URLs even if a supplied latest-release URL changes, catalog/sidebar/homepage/rendered-index parity, independently clickable prerequisites, all 48 exact report-to-query anchors, report teaching metadata, and unique repeated-control names. The final post-build run passed **all 33 website Node checks**:

```bash
timeout 3600 node --test tests/website/*.test.cjs
```

The independent report-content slice passed **48 checks** in 35.85 seconds:

```bash
timeout 3600 .venv/bin/python -m pytest -q \
  tests/website/test_teaching_refinement.py -k restored_report_binaries
```

The report check opens XLSX read-only with cached formula evaluation disabled. Headers, order, strings, and counts agree exactly; typed XLSX dates must equal the SQL ISO calendar date with a midnight time. Numeric comparisons allow only floating/Excel representation noise (`rel_tol=1e-14`, `abs_tol=1e-8`). CSV/XLSX serialize SQL nulls as blanks; the check never treats these blanks as zero, and documents that those formats cannot distinguish an empty text cell from null. Per-report populations, columns, and all 144 hashes are retained in the evidence JSON. These independent cell comparisons verify restored file content; HTTP reachability alone was not used as evidence of correctness.

## Retained source exceptions

The anomaly-enriched release contains three balanced PayrollPayment vouchers whose source records are absent: SourceDocumentID 1, 2646, and 5420, each with a debit/credit pair of 7,971.10. This is preserved missing-evidence behavior, not a reason to change release data or claim every detailed source key matches. The regression records the six orphan ledger rows explicitly. A missing source link does not establish what happened outside the file.

## Native application and learner gates

| Gate | Status | Required next evidence |
|---|---|---|
| Windows Microsoft 365: fresh setup, Lessons 4/6, Cases 1/3/5/6/7 | Not run | A fresh analysis workbook; record Windows and Excel build, imports, naming/types, reference preservation, unique keys, expanded rows, null classifications, amounts, saving and refresh. |
| Mac Microsoft 365: the same eight workflow cells | Not run | Independent macOS/Excel build and results for supported import/reference/merge/date/refresh paths. |
| Historical Design Services formulas | Historical success retained | Repository evidence reports 819 comparisons and five initial imports totaling 52,397 rows. Those records are credited; they are not new native execution or proof of later Power Query completion. |
| Screen-reader review | Not run | Native assistive-technology checks for names, reading order, loading/error announcements, dialog background isolation, and return focus. Automated attributes and keyboard behavior alone do not certify conformance. |
| Learner pilot | Not run | Learners with basic accounting and no AIS experience; observe stage completion time, rescue requests, wrong joins, grain/cutoff explanations, and changed-population transfer. No participant results or measured tutorial times have been invented. |
| Social-platform SVG unfurls | Not run | Actual platform retrieval and preview behavior. The present SVG is not described as proven broken. |

The JSON matrix has **16 explicit not-run native workflow cells**, separated by Windows/Mac and route. Row counts, unique keys, expanded rows, null classes, final amounts, application versions, and refresh outcomes remain null until a native run supplies evidence. The public method rubric/evidence template must remain separate from private challenge solutions.

## Final integration checks

The primary agent completed the production build with existing report assets; no data/report generation ran. All 33 post-build Node checks passed, including **47 authored pages / 49 sitemap routes**, built internal links and fragments, canonical/metadata/breadcrumb controls, legacy routes/anchors, unchanged tutorial/case figure-source parity, all 48 exact report SQL destinations, 170 unique SQL-control names, and eight-case/23-session navigation parity. A preliminary rendered-test attempt during build clearance lacked build files and is superseded by this final post-build pass. An initial report-test date-type mismatch was corrected to compare native XLSX dates to exact ISO dates, then all 48 reports passed; no report bytes were changed.

The primary agent completed the remaining integration gates:

| Final gate | Result | Evidence |
|---|---|---|
| Selected Python checks | Passed | 193 checks passed in the combined website/accounting run; the subsequently added 48 report checks also passed. This is 241 distinct Python checks across successful runs. The earlier 128-check slice overlaps and is not added again. |
| Production build | Passed | Report validation followed by `npm run build`; existing report assets reused. Site manifests refreshed through their existing hooks with identical content. Nonblocking upstream dynamic-require/Browserslist notices remain. |
| Complete website Node suites | Passed | `timeout 3600 node --test tests/website/*.test.cjs`: **33 passed**, zero failures on the final production build. |
| Local production HTTP | Passed | All **49 sitemap pages** returned HTML; six SQL/report/template assets matched expected file bytes. [HTTP evidence](http-smoke.json) was checked against the final build. |
| Chromium interactions | Passed | **5 groups**, zero failures: induced report/SQL 503 then success, retained retry focus, copy feedback, empty/reset/reload/history/deep links, report/Mermaid/BPMN keyboard behavior and exact focus restoration. Viewer/Reset fit actual Mermaid content. |
| Native modal background isolation | Passed in browser | Native `:modal` state, blocked background focus and three Chrome accessibility-tree probes showed no unignored background navigation. [Tree evidence](dialog-accessibility-tree.json). This is distinct from screen-reader execution. |
| Widths/themes/reduced motion | Passed within selected scope | Chromium 154.0.8037.57 on Linux: 320/390/768/1440px, light/dark, reduced motion. Posting/report/query/case catalogs remain horizontally contained; long tables/code scroll within their regions. Screenshots retained in ignored `outputs/_website_teaching_refinement/browser/`; representative phone, report/model/diagram captures visually inspected. |
| Native browser UI zoom | Not run | CSS 200%/400% zoom stress checked containment only. The CSS-only 400% screenshot shows navbar/sidebar overlap; CSS zoom does not substitute for native zoom/breakpoint behavior and is not claimed as an all-zoom usability pass. Narrow viewport reflow passed separately. |
| Protected source/data/report preservation | Passed | **392 protected tracked files and 145 dataset/report files** retain SHA-256 values. [Inventory](protected-hashes.json); `.venv/bin/python planning/website-redesign/teaching-refinement/verify-freeze.py`. Generator/config/SQL/script diff against frozen `7c21218dce19201013f7a71eb7263e12a85af09a` remains empty. |

Browser validation corrected two product issues: moving focus to persistent content before retry removes its button, and fitting Mermaid to actual SVG content rather than an oversized declared viewport. Diagram sources/exports and original worked results remain unchanged. A locator was tightened to await the specific named diagram after its asynchronous render, preserving a meaningful size/Reset assertion.

Changes remain on `codex/charles-river-teaching-refinement` for local review. No commit, merge, push, deployment, release change, or account/hosting-setting change ran in this task.

Do not infer an all-viewports visual pass from static Draw.io/SVG/source-hash checks. Do not infer binary integrity from HTTP 200. No full WCAG certification, native Excel pass, or learner-effectiveness claim is issued.
