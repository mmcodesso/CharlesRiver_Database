# Charles River review fixes and validation

Publication follow-up: after reviewing this handoff, the user authorized committing, merging, and deploying on October 19. The account below records the original implementation-stage results. [PUBLICATION.md](PUBLICATION.md) records the later approval and validation using the previously published report assets in temporary storage.

The verified website corrections and teaching improvements are implemented on `codex/review-improvements-2026-10-19`, starting from `6424f57b684030817fde232e94eb8084238493cf`. The attached reviews supplied findings to investigate. The user's request authorized the analysis and fixes, with the pasted academic-language brief guiding the editorial work. No commit, merge, push, deployment, release change, or hosting change was performed.

The website source compiles, and its teaching examples reproduce the published results. Complete release validation remains blocked by pre-existing local report prerequisites. This checkout has nine missing report sets and five stale report sets. Those frozen artifacts have not been replaced or regenerated.

## Finding dispositions

| Finding | Implementation |
|---|---|
| F01 | Corrected manufacturing/payroll prose, event tables, optional maps, alternative descriptions, analytical tasks, and incoming labels. PayrollSummary directly recognizes qualifying manufacturing costs in 1090, with the no-capitalizable-labor exception in 5080. Preserved the former section anchor and legitimate Debt Reclass. |
| F02 | Corrected Lesson 6 continuity to Lesson 4's core line 43 and variation line 42. Complete shipment/invoice scope and all 15 ledger rows remain unchanged. |
| F03 | Renamed the Dataset Guide layer to Business documents and operational events. Added the event/status/date evidence needed beyond an approved order or released work order. |
| F04 | Added the solo readiness route, expandable two-line/11,397.78 check, unique Item key explanation, two-shipment-match counterexample, and rubric link. |
| F05 | Added query-result CSV export, headers, saved evidence notes, reopened-file verification, empty-result treatment, and Copy with Headers alternative. Updated the shared case instructions to link directly to this procedure. English controls were verified in official DB Browser 3.13.1 source shared by Windows and Mac. Native execution remains unverified. |
| F06 | Replaced the duplicated CAPEX case label with the accurately named CAPEX and Fixed Asset Path query extension. Eight cases and existing redirects remain. |
| F07 | Made week 2 notation-only Activity 1 items 1–4. Deferred item 5 and evidence/control activities until a verified trace. Workshop prerequisites now distinguish those stages. |
| F08 | Revised the case-authoring source and Case 4 to distinguish a recorded authorization basis from valid authority, status, date, and commercial success. |
| F09 | Added the four posting routes beside the first record trace. Clarified non-posting terminology and added the verified FixedAssetEvent 14 → JournalEntry 103 and DebtScheduleLine 1 → JournalEntry 121 examples. |
| F10 | Extended the existing evidence template with operational date, grain/key, actual posting type/ID/date, account effect or no-new-posting reason, and remaining obligation. Added Why now and evidence-limit prompts. AIS and analytics use the same checked trace before their respective extensions. |
| F11 | Clarified the reviewed O2C cash/return maps, independent posting routes, conditional refunds, SalesReturnLine label, manufacturing receipt-to-issue support boundary, payroll aggregation, and P2P date purposes. Added a record-map legend distinct from BPMN notation. |
| F12 | Added prediction and cutoff evidence requirements to the existing O2C trace. Extended public repair feedback for receipt-as-revenue and journal-mediated-posting errors. Added staged second-record practice for purchasing, services, manufacturing, and payroll while preserving existing O2C variations. |
| F13 | Added the service invoice 241 voucher, receipt 23913/invoice 36461/payment 39645 checkpoints, short selected-work-order WIP roll-forward, PayrollSummary reconciliation and separate PayrollPayment, accrual roll-forward, and definition/scope guidance for posted comparisons. Cases 2, 4, 5, and 6 link to the relevant checks. |
| F14 | Added a worked proposed risk/control example and defensible alternative, retained the six-criterion method rubric, and separated accounting refreshers from data/tool prerequisites. Workload remains a planning estimate excluding setup, tutorials, and reading. |
| F15 | Collapsed seed-specific construction detail in Customize with its existing heading/anchor retained. Kept latest-release guidance on Downloads, technical history, compatibility links, and private challenge boundaries. |
| F16 | Re-executed all 105 named examples, added stable expected-result checks for the three additional manufacturing queries, verified posting categories and new checkpoints, compiled the site, audited rendered links, and sampled browser interactions. Native Excel/platform runs, screen-reader review, and learner pilots remain open. |

## Editorial scope and examples

The pass reviewed all 47 authored documentation pages and edited 44, along with the homepage, shared case instructions/template, evidence template, and authored case metadata. The Query Library introduction, Contributing, and License needed no revision. Language now uses more connected accounting explanations, fewer prose colons and semicolons, and clearer distinctions between commitments, operational support, recognition, and settlement. Long tutorial import instructions use compact tables that preserve every working name and filter.

| Before | After |
|---|---|
| Finance then uses payroll-supported reclassification entries to connect manufacturing labor and burden to costing. | PayrollSummary posts capitalizable manufacturing labor and related burden directly to Manufacturing Cost Clearing (`1090`). |
| Earlier lessons followed order line 42. | Lesson 4 followed order line 43, while its practice variation followed line 42. |
| Execution documents / Shows what actually happened | Business documents and operational events, with event, status, and date evidence required to distinguish commitment from execution. |
| An approval explains authorization, not whether the discount was commercially successful. | The linked approval records the stated authorization basis. Verify the actor's authority, status, and date before concluding that authorization was valid. |
| A matching total checks this selected order; it does not establish fulfillment or collection. | A matching total checks this selected order without establishing fulfillment or collection. |

Technical punctuation remains in unchanged executable examples, formulas, YAML/JSON, URLs, identifiers, and formal resource titles. Concise table cells and named input/output specifications retain useful field/list separators. Stable headings and compatibility anchors were preserved. Frozen SQL/catalog summaries, generated diagram captions, release artifacts, and historical private validation records were excluded from stylistic rewriting.

The company → process → evidence → analysis → interpretation → decision progression remains. All twelve lessons and eight cases retain their order and public routes. Case headings Key Data Sources, Recommended Query Sequence, and Next Steps, query/report components, learning objectives, and private independent-challenge solutions remain intact.

## Validation results

| Check | Actual result |
|---|---|
| Source compilation | `npm --ignore-scripts run build` passed after installing locked dependencies. Lifecycle preparation was deliberately excluded because it would regenerate missing reports. This is source compilation, not complete report-asset acceptance. |
| Six website Node suites | 36 passed, 1 failed. The failure is the existing missing report-download target check. All case, tutorial, metadata, route, inventory, and new accounting regressions passed. |
| Focused Python teaching checks | 119 passed, with 48 report-binary checks excluded from this first slice. |
| Broader website/Python onboarding checks | 162 passed, 14 failed. Nine failures identify missing report sets and five identify stale existing assets. Thirty-four report sets matched canonical query output in preview, CSV, and workbook form. |
| Worked examples | All 43 named tutorial and 62 named case queries reproduce their unchanged expected rows. Three additional manufacturing queries have stable row-level expected checks. |
| Rendered link audit | 49 sitemap routes and 4,902 internal-link occurrences inspected. Zero missing page/fragment targets. Eighteen unique report download URLs are absent, corresponding to the nine missing sets. Preview JSON files make the missing-file prerequisite total 27. |
| Preservation | All 122 existing dataset/report files, including 117 report files, retain their initial SHA-256 hashes. All 252 existing executable/formula blocks, existing explicit anchors, routes, and pagination values remain unchanged. |
| Browser samples | Homepage at 1440×1000 light and 390×844 light, Lesson 3 at 768×1024 light, payroll map in desktop dark, and Lesson 8 at 390×844 dark. No horizontal page overflow on those samples. A wide checkpoint table was simplified after phone inspection. |
| Keyboard/interaction samples | Solo reveal opens with Enter and visible focus. Query search changes counts, survives reload, presents an empty state, and recovers with Back. SQL expansion loads. Diagram/report viewers open from keyboard, keep focus in the checked modal interactions, and restore the opener on Escape. Missing-preview error/Retry and an available preview were inspected. |

Browser sampling does not establish full accessibility conformance. Induced SQL-request failure/retry, exhaustive filter combinations, screen-reader use, native Excel/Power Query on Windows and Mac, and learner outcomes were not tested. Attempting to open the native Mac DB Browser timed out, so no native export success is claimed. The official UI source check is separate evidence. No learner timing claim was added.

## Remaining report prerequisites

The nine missing report sets are the three pro forma statements, budget-versus-actual statement bridge, design-service revenue and billed hours, budget-versus-actual working-capital/cash bridge, commission payable roll-forward, commission expense by rep/segment, and budget-versus-actual revenue/price/volume/cost bridge.

The five stale local sets are Monthly Income Statement, Monthly Balance Sheet, Monthly Indirect Cash Flow, Working Capital Bridge by Month, and Budget versus Actual by Cost Center. Diagnostics include changed columns or row counts. These are existing local artifacts, not newly generated outputs. [report-prerequisites.json](report-prerequisites.json) records the exact files and differences. The attempt to reuse missing files from the published HTTPS site received HTTP 403 with a Cloudflare challenge. No challenge was bypassed and no files were restored.

The main local `outputs/CharlesRiver.sqlite` also differs from the reviewed teaching baseline. It was preserved and excluded from claim validation. Every claim check instead used `outputs/_site_build/CharlesRiver.sqlite`, SHA-256 `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`, opened read-only. Website tests now accept `CHARLES_RIVER_TEACHING_SQLITE` while retaining their checksum guards. No generator/configuration variant was regenerated or altered.

Before publication, obtain the matching published report assets without changing the frozen datasets, rerun ordinary build/asset checks, and complete the separately recorded platform/pilot work. Do not treat this source preview as a fully validated report package.

## Commands and evidence

Commands used the repository `.venv`. Test subprocess timeouts were 3,600 seconds for targeted slices and 7,200 seconds for the broader Python slice.

```sh
node planning/website-redesign/cases/build-case-content.cjs --content-only
npm ci --ignore-scripts --no-audit --no-fund
npm run generate-site-branding
npm run generate-query-manifest
npm run generate-report-manifest
npm run generate-report-pack-manifest
node scripts/validate-report-assets.mjs
npm --ignore-scripts run build
CHARLES_RIVER_TEACHING_SQLITE=outputs/_site_build/CharlesRiver.sqlite node --test tests/website/cases.test.cjs tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs tests/website/teaching-refinement.test.cjs tests/website/tutorials.test.cjs tests/website/review-improvements.test.cjs
CHARLES_RIVER_TEACHING_SQLITE=outputs/_site_build/CharlesRiver.sqlite PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python -m pytest -q tests/website/test_teaching_refinement.py -k 'not restored_report_binaries'
CHARLES_RIVER_TEACHING_SQLITE=outputs/_site_build/CharlesRiver.sqlite PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 .venv/bin/python -m pytest -q tests/website/test_teaching_refinement.py tests/test_docs_onboarding_flow.py
.venv/bin/python planning/website-redesign/review-2026-10-19/verify-preservation.py
node planning/website-redesign/review-2026-10-19/audit-rendered-links.cjs
git diff --check
```

Branding and manifest scripts refreshed their outputs with no Git differences. Content-only case authoring updated the eight case pages and case catalog. Worked-result registers, all diagram sources/exports, dataset/report files, dependencies/lockfile, and protected generator/config/query/script paths remain unchanged. The protected core has no diff against frozen commit `7c21218dce19201013f7a71eb7263e12a85af09a`. [preservation-validation.json](preservation-validation.json) and [rendered-link-audit.json](rendered-link-audit.json) retain the checks. Logs are in ignored `outputs/_website_review_2026_10_19/`.

The [implementation plan](PLAN.md) records the initial findings and sequence. [changed-files.json](changed-files.json) lists the exact source files. Local preview is [http://127.0.0.1:3108/](http://127.0.0.1:3108/). Restart it without report preparation using the following command.

```sh
node node_modules/@docusaurus/core/bin/docusaurus.mjs serve --host 127.0.0.1 --port 3108 --no-open
```
