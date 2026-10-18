# Teaching refinement implementation checklist

Both supplied review documents were read in full from their attached DOCX copies. Their recommendations are reference material; the pasted implementation request supplies the current authorization and boundaries.

## Reconciliation and baseline

Fetched `origin/main` and reviewed source are both `37d17fd5ca288a5c386481ce7059cfda14563aee`. The initial working tree was clean, with 548 tracked files; no intervening main changes or concurrent edits were present. The new branch is `codex/charles-river-teaching-refinement`. The README already states the release-qualified 82-table inventory, so that review item receives credit without replacing correct prose. Other applicable findings will be checked against this actual source and release.

Dataset v2027.1 is present at `outputs/CharlesRiver.sqlite`, SHA-256 `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`. It is opened only read-only. Initial protected generator/config/query/script diff against frozen `7c21218dce19201013f7a71eb7263e12a85af09a` is empty. Baseline source/artifact inventories are retained outside the checkout in `/workspace/.charlesriver-refinement`.

Build lifecycle inspection confirmed preparation can generate missing reports. Instead, all 144 existing report files were restored unchanged from the published HTTPS site and validated. No report or dataset generation ran. Their new local hashes establish the report-preservation baseline for this review pass.

## Corrections before enhancements

| ID | Priority / disposition to establish | Owned files | Expected outcome and acceptance check |
|---|---|---|---|
| F01 | P1 confirmed procedure mismatch | case authoring JSON/script; workforce case | Retained ApprovedTime, independent hours/known-center/unassigned references; all 15 null-center groups, population and pay checked independently against read-only SQL. Native Power Query gate remains separate. |
| F02 | P1 confirmed unit error | case authoring; audit case | 336 time entries / 1,895 entries, 17.73%; 71 people only as separately verified count; no misconduct claim. |
| F03 | P1 confirmed incomplete join | manufacturing chapter | Center plus date; schedule 5 has one matching day; independent daily load/capacity regression. |
| F04 | P1 confirmed account-direction error | posting reference | Credit-balance P&L debited; debit-balance P&L credited; Income Summary net direction; full JE846 balances, excerpts labeled. |
| F05 | P1 confirmed missing explanation | posting reference and incoming guide/payroll/lesson links | Register-summary grain/encoding vs detailed payment explained; PRS-0001-001 three-register-row tie-out, no register-ID join. |
| F06 | P1 confirmed date wording | Excel setup | Explicit March and Q1 half-open 2024 intervals; boundary tests. |
| F12 | P1 confirmed missing first imports | all eight cases' authoring and text | Invoice raw inputs imported before merge; named stage inputs/outputs, retained references; first-use audit. |
| F07 | P2 confirmed teaching destination mismatch | BPMN metadata, process exits | First activity matches the event type; preserve optional model/control workshop and story sequence. |
| F08 | P2 homepage stale count; README already corrected | homepage, sidebar/navigation | Derive case count from catalog; current inventory parity; release-qualified 82-table statement preserved. |
| F09 | P2 confirmed misleading optional path | manufacturing chapter | Completion and close branch independently through WorkOrder; aggregate before comparing. |
| F10 | P2 confirmed reference drift | actual Customize page `technical/dataset-delivery.md`, roadmap | Three public formats vs optional support workbook; recognize TimeClockPunch; label legacy Pages vs current Cloudflare. |
| F11 | P2 future reproducibility risk | presentation release constant, SiteBranding, downloads/config | Fixed v2027.1 classroom links + JSON-LD; explicit checksum/version check; protected config untouched. |

## Focused enhancements

| ID | Owned files | Expected outcome and acceptance check |
|---|---|---|
| E01 | six process chapters, Lesson 6 | Compact predict/reveal event/date/document/account/cutoff bridges; verify real four-event sale and all 15 ledger rows; no invented links between processes. |
| E02 | manufacturing lesson/reference | One optional work-order reconciliation with defined date/population and supported opening/movements/closing; distinguish pooled clearing and attribution limits. |
| E03 | tutorial index/readiness gates, case metadata/components, instructor guide | Preserve all 12 lessons; individual prerequisites, optional modules, public repair exercise/template/rubric; estimated 23 sessions and 23–34.5 hours; no private challenge answers. |
| E04 | report/query components and authored metadata | All 48 exact source-query anchors via shared helper; grain/period/process/lesson; filters/deep links/history preserve discoverability. |
| E05 | report/query controls, Mermaid/report dialogs | Specific names, SQL retry/status, model-specific descriptions, inert background; browser tests for focus/keyboard/error/filter/history and representative widths/themes. |
| E06 / gates | website-only tests and validation report | Existing 105 query results unchanged; independent accounting/procedure regressions, production build, routes/anchors/artifact checks. Native Excel, screen reader, social unfurls and actual learner timing remain distinct evidence categories. |

## Ownership and handoff

The primary agent owns integration, branch operations, modal refinements, shared instructions and final reporting. Exclusive roles handle case procedures/authoring, accounting references, teaching pathways, catalog UX, release consistency and independent validation. No agent may edit another's assigned files or mutate Git. Correctness work precedes enhancements within each track.

Preserve current narrative, recurring roles, tool tabs, twelve-lesson order, eight cases, public worked examples/private challenge boundary, stable routes/legacy fragments, report/query IDs, diagram sources/exports, canonical metadata and search. No merge, push, deployment, release modification or account-setting change is authorized.

The final handoff will record each disposition, exact files, test outcomes and evidence, teacher pathways, unchanged-artifact hashes, and local preview commands. Required validation gates remain open until actually executed; native Microsoft 365 and a learner pilot cannot be inferred from SQL equivalents or automated browser checks.
