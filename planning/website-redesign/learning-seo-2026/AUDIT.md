# Educational website audit and implementation

The follow-up in `HUB_ALIGNMENT_REVIEW.md` refines the first implementation against the Hub's clean main source. The final contract uses the Hub's existing dataset entity ID, DOI identifiers, publisher/person IDs and public attribution; it also adds explicit social metadata and global discovery links. This report describes the integrated result.

## Baseline and evidence

Task branch: `feature/charles-river-learning-seo-2026`, based on clean `main` at `6424f57b684030817fde232e94eb8084238493cf`. The task's no-merge/no-deploy instruction supersedes historical publication approvals. No other repository is edited.

The audit covers the homepage, all 47 authored documentation pages, navigation, custom components, generated HTML and resource assets. `baseline-inventory.md` and `baseline.json` record every page's purpose, audience, existing level, headings, authored links and source hash. `final-inventory.md` and `final.json` record the final state. The inventory's audience classifications are editorial assessments; no new competency levels are promised. Component-generated links are checked in rendered HTML rather than mistaken for missing Markdown links.

Baseline facts already satisfied much of the requested architecture: ten shallow sidebar groups/entries, six process chapters, twelve sequenced lessons, eight cases in three levels, 170 SQL files and 48 reports in six matching topics. The catalogs already provide filtering, interpretation, deep links, recovery, previews, and original downloads. Existing redirects consolidate former query/report perspectives and the process-model overview. Those implementations are retained.

The inventory includes 358 existing dataset/report/diagram artifacts and 259 protected source files. SQLite was opened read-only. Its 82 user tables and 220 customers agree with current public descriptions. The workbook contains 82 sheets and the CSV archive 82 members. Package hashes match the official release. Sales orders span 2024–2026; supplier payment dates extend to 23 February 2027. This confirms the existing distinction between main operating years and later settlement. Full evidence is in `package-evidence.json`; no rows, formulas, files, or schemas were changed.

## Findings and dispositions

| Finding | Priority | Evidence and decision |
|---|---|---|
| Repeated full Dataset markup creates three publisher-style descriptions | P1 | Homepage, Dataset Guide, and Downloads shared a site-local identity. Concentrate the full Dataset entity on Downloads; emit WebSite/WebPage on the homepage, WebPage on docs, and retain LearningResource for actual activities. |
| Publication identity omits supplied DOI and publisher discovery URL | P1 | Add shared authored identity metadata and visible publication links. Reuse the Hub's `https://charlesriver.accountinganalyticshub.com/#dataset` entity; the concept DOI is its identifier/sameAs and the citation uses the verified version DOI. Educational canonicals stay local. |
| Citation year and title differ between external descriptions | P1 | Zenodo API resolves concept DOI to record 23428084: title “Charles River Accounting Database,” version 2027.1, publication date 2027-01-18, archival creator Codesso, Mauricio Mello, CC BY-SA 4.0. GitHub includes conflicting years. Match the Hub recommendation using 2027, public attribution Mauricio Codesso and Accounting Analytics Hub as publisher; preserve the archival creator spelling as an alias. Explain the title difference on Downloads. Do not edit external records. |
| Query topic descriptions do not expose related process, tables, practice and cases together | P2 | Add six shared reading paths to query/report topics using ordinary server-rendered links. Keep all source IDs and filters unchanged. |
| Process-to-catalog exits often sit inside optional material | P2 | Add a concise visible evidence exit before optional reference sections in all six guides. Existing process explanation, controls, concept checks and diagrams remain intact. |
| Several reference/technical titles are generic | P2 | Refine query/schema and contribution/customization/license/roadmap metadata. Preserve sidebar labels, H1s, slugs and instructional procedures. |
| Hub publication page is absent from key orientation paths | P2 | Add concise links from Start Here, Downloads and instructor adoption. Keep textbook links and independent indexing. |
| Textbook instructor preface link uses an obsolete fragment | P2 | HTTP 200 masked the missing `#to-the-instructor` target. Verify and replace it with `#sec-to-the-instructor`; add contextual SQL chapter links. |
| Existing browser test assumes Linux Chromium | P2 validation | Support an explicit browser executable and retain the existing Linux fallback; use installed Chrome on Windows. No npm dependencies added. |
| Local virtual environment references an unavailable Python 3.12 installation | P2 validation | Recreate its launchers with available Python 3.13 and reinstall incompatible NumPy/pandas/PyYAML packages in ignored `.venv`. Tracked requirements and generator code remain unchanged. |
| Homepage already has the process-to-ledger progression | Retain/refine | Preserve layout and educational narrative; give Query Library its own direct entry, link to the Hub overview, and focus the snippet on educational use. |
| Case catalog already supplies questions, levels, tools, preparation and deliverables | Retain | Improve inbound discovery through both catalogs. No need to rewrite cases or touch the synchronized case authoring/registers. |
| Lessons and technical setup have distinct instructional value | Retain | Preserve twelve lessons, readiness checks, both tool routes, technical setup and local customization instructions. Do not turn the site into a tool textbook. |

## Learning architecture and content ownership

Keep the existing route architecture: Getting Started → Company Story → Business Processes → Learn and Practice → Cases → adjacent Reports and Analytics / Query Library → Dataset Reference → For Instructors / Technical. Dataset Reference remains available as a lookup throughout; this reading sequence does not require students to finish every chapter before investigating a focused module.

The improvement is contextual rather than a URL migration: each process now reaches its query/report topic; each catalog topic reaches its process, schema group, practice and case. Catalogs remain indexable without JavaScript. All 48 authored public routes and legacy redirects are retained; no new indexable pages, menus or query-detail pages are created.

The Hub owns publication discovery, this site owns the company and detailed educational evidence, and the textbook owns conceptual/tool instruction. Existing textbook chapter links are validated alongside the new Hub links. No Course markup is introduced. The company-origin disclosure stays in Company Story; publication version and release links stay on Downloads. No assessment, worked solution, or process diagram is changed.

## Duplication matrix

| Pages / resource pair | Apparent overlap | Distinct value / disposition |
|---|---|---|
| Homepage / Start Here | Business-to-evidence progression | Homepage orients; Start Here specifies reading order and readiness. Retain both; do not repeat publication prose. |
| Start Here / Why This Dataset | Value of connected records | Orientation versus a short conceptual rationale. Retain stable routes; cross-link rather than merge. |
| Company Story / six process chapters | Recurring people and furnishing project | Shared scenario supports continuity. Process-specific events remain separate; no claim that one project links actual transactions across processes. |
| Dataset Guide / Schema Reference | Keys, headers, lines, relationships | Beginner mental model versus detailed lookup. Preserve examples and technical reference. |
| Schema Reference / Posting Reference | Source-to-ledger relationships | Relational keys versus event posting rules. Preserve both. |
| Process overview / notation and model inventory | Business processes and BPMN | Already consolidated into `/docs/process-flows`. Retain former `/docs/process-models` redirect. |
| Process chapters / practice lessons | Same transaction families | Explanation before reproducible evidence workflow. Add direct catalog exits; preserve exercises. |
| SQL/Excel setup / technical customization | Opening files versus generation | Student working setup is different from optional instructor generation. Keep procedures; clarify metadata. |
| Reports / Query Library | Six shared topics and paired SQL | Rendered interpretation versus source logic. Keep adjacent hubs and exact source-query links; add shared reading paths. |
| Lessons / cases | Same company and analytical techniques | Foundational skills versus integrated decisions. Preserve existing level/readiness gates and assessment boundaries. |
| Eight case source notes | Repeated import/grain warning | Intentional safety against invalid joins; retain inside each standalone case. |
| Eight case query-sequence notes | Repeated population/date caveat | Essential because canonical queries may differ from a worked case. Retain. |
| Five case interpretation instructions | Repeated evidence-retention guidance | Assessment-method guidance, within protected exercise substance; retain. |
| Homepage / Guide / Downloads Dataset JSON-LD | Repeated publication entity | Remove full Dataset markup from homepage and Guide. Downloads retains the detailed site description; pages reference the shared dataset entity, whose DOI is independently identified. |
| Hub / Charles River | Dataset introduction and publication identity | Hub is concise discovery; Downloads handles practical formats/citation; educational docs remain independently canonical. |

The exact-paragraph scan in `repeated-passages.json` supplements this semantic matrix; imports, tables, code and short headings are not evidence of editorial duplication. Repetition that makes standalone investigations safe is intentionally preserved.

## Pre-existing inconsistencies and remaining recommendations

- Zenodo's API lists a future publication date (2027-01-18) relative to this session (2026-10-22). The displayed citation follows that authoritative record; it is not inferred from the version label or treated as the GitHub release date. The title and version/concept DOI distinction are recorded in `zenodo-evidence.json`.
- The checked-in GitHub Pages workflow coexists with current Cloudflare hosting. Preserve it and `wrangler.jsonc`; deployment configuration changes are outside this pass.
- Search-volume/ranking analysis, learner completion-time validation, screen-reader testing and Search Console indexing outcomes require separate evidence. No claims are made about them.
- No process/schema/accounting correction was needed from this audit. If a later finding requires protected source changes, report it separately instead of adapting the dataset to presentation.

See `VALIDATION.md` for executed checks, limitations, hashes, changed files and local review commands.
