# Charles River website redesign — review handoff

**BPMN extension:** [the current BPMN/AIS handoff](bpmn/REVIEW_HANDOFF.md) adds 11 editable models with SVGs, a controls workshop, and a proposed 14-week sequence. The model library and notation are consolidated into `/docs/process-flows`; `/docs/process-models` redirects there. Current totals are 59 documents and 23 learning resources. The initial redesign record below retains its original counts and validation history.

Completed 17 October 2026 on `feature/charles-river-website-redesign`. The redesign is committed locally and remains separate from main and production.

## Git consolidation and frozen baseline

Fetched origin and inspected branches, history, working tree, open PRs, main protection, rulesets, release metadata, and the deployment workflow. Both local and remote main and book-roll-feasibility already pointed to `7c21218dce19201013f7a71eb7263e12a85af09a`. There were no outstanding branch commits to merge, no open PRs, and no protection/rulesets reported by GitHub. Main was already current; no merge or main push was necessary.

The baseline passed the production build and 27 targeted tests before branch creation. Main remains at that SHA. No force push, reset, history rewrite, release modification, deployment, or dataset version creation occurred. No redesign PR or remote branch was created; the complete work is available locally for review.

## What changed and why

The original site had sound process explanations and substantial accounting content, but repeated onboarding copy, deeply nested case/report navigation, generic assessed outputs, a wide case matrix, and weak links to the larger educational project. The homepage repeated benefits without showing much of the company or its connected evidence flow. Published table counts differed across the README, guide, and schema page.

The implementation preserves the accounting substance and makes the learning sequence explicit: company → process → evidence → analysis → interpretation → decision.

| Area | Implemented result |
| --- | --- |
| Homepage | Company introduction, linked process-to-ledger map, interactive six-process evidence explorer, direct company/learning/download/instructor actions, verified release specifications, selected cases, and Hub/textbook relationships |
| Navigation | Getting Started; The Company; Business Processes; Learn and Practice; Cases; Reports and Analytics; Dataset Reference; For Instructors; Technical. Header groups Learn and Explore while keeping Downloads and For Instructors direct; Hub and textbook links remain visible |
| Company story | Merchandise, selected manufacturing, hourly Design Services, make/buy interpretation, departmental dependencies, and a clearly labeled illustrative operating cycle |
| Learning progression | New practice hub and three focused source-to-ledger, receipt-to-payable, and manufacturing-cost-flow exercises; assessed SQL and Excel starter activities |
| Cases | All 17 existing cases refined with preparation, objectives, source documents and grain, process links, case-specific assessed artifacts, interpretation limits, and explicit scenario labels |
| Case discovery | Authored 17-case catalog, server-rendered cards, search plus process/area/level/tool filters, live counts, empty results, and reset. SQLite and optional Excel companion coverage is stated accurately |
| Reports and queries | Existing 48 reports, four perspectives, and 170 SQL files retained; entry guidance and presentation improved. All 133 original case query references remain in their original per-case sequence |
| Visual system | Hub-compatible paper/teal/navy, serif headings, system sans-serif body, restrained borders/corners, readable layouts, responsive controls, and dark mode. Removed remote font CSS request; no new dependencies |
| Accessibility | Visible focus, native labeled filters, keyboard order, modal focus containment/restoration, focusable report scrolling, named diagram zoom controls, keyboard diagram controls, and reduced motion |
| SEO | Stable Dataset identity, verified Person creator, publisher, version, license, citation and three distributions; LearningResource data for 22 activities; preserved canonical URLs, Open Graph, sitemap, robots, breadcrumbs, local search, and redirects |
| Contributor guidance | Updated AGENTS with explicit freeze, editorial/learning/design/SEO standards, validation and deployment rules; five project-scoped TOML agent roles |

The [audit](WEBSITE_REDESIGN_AUDIT.md), [design strategy](DESIGN_STRATEGY.md), [page inventory](PAGE_CHANGE_INVENTORY.md), and [changed-file inventory](CHANGED_FILES.md) provide the detailed review trail. Planning is outside the published Docusaurus docs.

## Pages, routes, and teaching material

All **54 original document routes** remain intact. Four routes were added: the practice hub and three exercises. No pages were deleted, consolidated, or moved to new URLs. The six pre-existing client redirects remain; no new redirect is needed. There are now 58 authored public documents.

The company, orientation, process map, instructor guide, case hub, and analytics entry pages were rewritten or substantially refined. Six process guides retain their detailed event/accounting distinctions and links while adding decision/evidence context. Report library/perspective components and existing query/download paths were preserved. The [page inventory](PAGE_CHANGE_INVENTORY.md) identifies every preserved, refined, and added page individually.

Case improvements cover O2C trace; P2P accrual/settlement; manufacturing labor; product lifecycle; working capital; statement bridge; CAPEX; pricing/margin; portfolio profitability; workforce coverage; demand planning; master-data/workforce audit; workforce cost/organization; cross-process audit review; attendance controls; replenishment support; and pricing governance. Required `Key Data Sources`, `Recommended Query Sequence`, and `Next Steps` headings are present. Existing QueryReference components and their SQL sequence are preserved; no assignment answers or fabricated numerical results were added.

The foundational exercises precede these cases. The SQL guide begins with an existing order-line trace and an assessed evidence table. The Excel guide begins with an item-catalog profile, key/count checks, a reproducible pivot, and interpretation boundaries. The three new process exercises specify context, objectives, prerequisites, tools, sources, workflow, assessed deliverable, and limitations.

## Verified dataset claims and protection

The local SQLite SHA-256 equals the published v2027.1 asset: `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`. Read-only inspection established **82 user tables**, excluding SQLite internal tables. Corrected README 55, Dataset Guide 73, and Schema Reference 77 to that verified release count. All 82 tables are represented in the schema documentation.

The main operating window is 2024–2026; supplier disbursements extend into early 2027. The Posting Reference's opening journal date was corrected from 2026-01-01 to the release's 2024-01-01. The support workbook is described as a separate local/instructor companion because the release provides only SQLite, Excel, and CSV ZIP.

**No generator source, canonical configuration/source data, schema logic, canonical SQL, generator tests, dataset/report generation scripts, published packages, or release artifacts changed during the redesign.** The tracked-path diff against the frozen baseline is empty for all protected paths. Only the website-specific onboarding test and new website tests changed under tests.

The repeatable [freeze check](verify-freeze.ps1) compares protected tracked paths and checks [293 starting artifact hashes](frozen-artifact-hashes.json): five existing dataset files/copies and 288 report files across outputs/reports and static/reports. Every hash matches. The report/download files were reused, not regenerated or hand-edited. No canonical dataset generation ran.

Normal npm build hooks refreshed branding/query/report/report-pack website manifests through their existing scripts and validated complete existing report assets. The refreshed generated files have no content diff from baseline. No generated asset was hand-edited.

## Validation performed

All explicit automated test processes used a one-hour timeout. Python commands used the repository `.venv` interpreter; its backing runtime required sandbox escalation, which succeeded.

| Check | Result |
| --- | --- |
| Baseline `npm run build` | Passed before feature branch creation |
| Baseline targeted pytest: book scenarios, schema, onboarding | 27 passed; no canonical regeneration |
| Final `npm run build` | Passed, including manifest/branding pre-hooks, existing report validation, strict Docusaurus links, static output and local search index |
| `node --test tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs` | 12 passed; all 58 documents checked for distinct titles, descriptions, canonical, H1, OG, sitemap and breadcrumbs; all 22 learning activities checked; internal links/static downloads/filter options verified |
| `.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider tests/test_docs_onboarding_flow.py tests/test_report_preview_overlay.py` | 12 passed after fixes |
| `.venv\Scripts\python.exe -B -m compileall -q src tests` | Passed |
| Read-only SQLite query/field checks | Existing O2C trace executed; retained SELECT example returned 25 rows; Excel Item fields verified; four process-exercise query references compiled with EXPLAIN QUERY PLAN |
| `pwsh -NoProfile -File planning/website-redesign/verify-freeze.ps1` | Passed: protected paths unchanged and all 293 hashes identical |
| `git diff --check` | Passed |
| Essential external URLs | Hub, textbook, instructor preface and SQL chapter loaded; repository, v2027.1 release, three download assets and license returned HTTP 200 using HEAD |

Browser review used the production build at 1440×1000, 820×1180, and 390×844 viewport settings. Homepage/case layouts showed no page-level horizontal overflow. Verified mobile drawer, light/dark themes, native control keyboard order and focus, evidence-explorer selection, combined case filters, zero-result state and reset, local search suggestions and Enter navigation, report preview loading, dialog Tab containment/Escape/focus return, and expanded Mermaid zoom/Escape/focus return. The Company page renders one H1. No new console errors appeared after correcting the filter hydration defect.

Review screenshots are available locally: [desktop homepage](../../outputs/_website_redesign/home-desktop.png) and [mobile homepage](../../outputs/_website_redesign/home-mobile.png). Build logs are in `outputs/_website_redesign/` and intentionally ignored.

## Hub, textbook, and curriculum integration

Reviewed both the public Hub and the newer local Hub repository at `72ce05f` before styling. The sites share a restrained academic palette and editorial typography, while Charles River emphasizes company/process diagrams and evidence investigations. Links in navigation, footer, orientation, practice, cases and instructor guidance connect [Accounting Analytics Hub](https://accountinganalyticshub.com/) with [Accounting Analytics: An Integrated Approach](https://aa.accountinganalyticshub.com/). Instructor guidance maps AIS, analytics, financial, managerial and audit courses and gives O2C, P2P and conversion/manufacturing their own modules. Future AIS/tool courses are explicitly planned. Textbook chapters are linked, not duplicated.

## Remaining limitations

- Lighthouse was not installed in the available project/tooling; no Lighthouse scores are claimed. Manual keyboard/responsive review and automated structural checks do not establish complete WCAG 2.2 AA conformance or replace screen-reader/user testing.
- The full generator suite was not run during the website phase because it invokes data-generation fixtures; frozen generator behavior was not changed. Targeted baseline tests, read-only release checks, and website regression coverage ran instead.
- Existing build warnings remain: `vscode-languageserver-types` static dependency analysis and a local Docusaurus update-check permission notice; stale Browserslist data was also reported on an earlier pass. Dependency/config updates were outside the frozen redesign and no package files changed.
- The unused curated product-lifecycle sequence in `src/generated/queryDocCollections.js` differs from the case's actual query list. This existing drift is documented; the new catalog and case pages use the preserved case references rather than that stale sequence. Canonical SQL and generated inventories remain unchanged.
- GitHub Pages uses client redirects supplied by Docusaurus, not HTTP 301 rules. This redesign keeps all old routes, so it creates no additional redirect dependency.
- Freeze checking requires the existing local artifacts recorded in the inventory. On a fresh checkout, missing artifacts are reported rather than silently regenerated.

## Local preview and review

Use Node >=20 and installed dependencies. This workspace already has the required reports. If a fresh checkout lacks report assets, obtain the existing matching assets before a freeze-safe build; do not rebuild the canonical dataset.

```powershell
git switch feature/charles-river-website-redesign
npm run build
npm run serve -- --host 127.0.0.1 --port 3000 --no-open
```

Open `http://127.0.0.1:3000/`. Review the company, practice hub, cases, reports, schema and instructor guide, including dark mode and a narrow viewport. The temporary QA server is stopped after review; the command above starts a new local preview.

```powershell
node --test tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs
.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider tests/test_docs_onboarding_flow.py tests/test_report_preview_overlay.py
pwsh -NoProfile -File planning/website-redesign/verify-freeze.ps1
```

When automating pytest or other test commands, retain the repository's minimum one-hour process timeout. Do not deploy, merge to main, or alter releases until the user approves publication.
