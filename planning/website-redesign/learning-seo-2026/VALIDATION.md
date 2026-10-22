# Validation and review handoff

Publication update: the subsequent user instruction “Merge, commit and deploy” supersedes the review-only status below. `PUBLICATION.md` records integration with the newer main and the final deployment acceptance process. The results here describe the original reviewed feature state; integrated publication results are separately retained in `outputs/_learning_seo_publication/`.

Branch: `feature/charles-river-learning-seo-2026`.
Baseline commit: `6424f57b684030817fde232e94eb8084238493cf`.
Review date: 22 October 2026.

Updated after the Hub-alignment follow-up. `HUB_ALIGNMENT_REVIEW.md` contains its findings, implemented plan, metadata contract and source/deployment distinction.

Changes are left in the working tree on the feature branch for review. No commit, push, merge, deployment, hosting change, GitHub Release change, Zenodo change, or external repository edit was performed.

## Results

| Check | Actual result |
|---|---|
| Production build, `npm run build` | PASS after final website source edits. Prebuild regenerated site branding and four manifest outputs through existing scripts; they have no substantive Git differences. Preparation explicitly reused existing report assets. |
| `node --test --test-timeout=7200000 tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs tests/website/teaching-refinement.test.cjs tests/website/tutorials.test.cjs tests/website/cases.test.cjs` | 36 passed after Hub alignment, including read-only worked SQL, all authored HTML pages, canonicals, sitemap, breadcrumbs, ordinary links, static downloads, redirects, catalog inventory, JSON-LD, shared Hub entity contracts and unique social metadata. |
| `node --test --test-timeout=7200000 tests/website/browser-interactions.cjs` | Seven passed after Hub alignment with installed Chrome and bundled Playwright. No project dependencies added. |
| `.venv/Scripts/python.exe -m pytest -q tests/website/test_bpmn_models.py` | 57 passed. A non-fatal cache-directory permission warning was reported. |
| `PYTHONUTF8=1 .venv/Scripts/python.exe -m pytest -q -p no:cacheprovider tests/website/test_teaching_refinement.py` | 167 passed. UTF-8 mode is required by existing implicit text reads on this Windows host. In PowerShell set `$env:PYTHONUTF8='1'` before the command. |
| `node scripts/validate-report-assets.mjs` | PASS; all existing required report assets available. |
| `pwsh -NoProfile -File planning/website-redesign/verify-freeze.ps1` | PASS: protected tracked paths unchanged against frozen baseline `7c21218dce19201013f7a71eb7263e12a85af09a`; all 293 historical artifacts match SHA-256. |
| `node planning/website-redesign/learning-seo-2026/audit.cjs final` | PASS: all 358 task-start artifacts and all 259 captured protected source hashes unchanged; 48 authored public routes unchanged. Includes diagram sources/exports and existing dataset/report artifacts. |
| `git diff --check` | PASS. |
| External links, `node planning/website-redesign/learning-seo-2026/check-external-links.cjs` | Fifteen URLs checked after alignment. Ten HTTP 200 results include textbook pages, corrected instructor fragment, repository/release links and all three direct dataset downloads. Five direct-client 403 responses documented below. Downloads use HEAD only. |
| Package inspection | SQLite has 82 user tables; Excel 82 sheets; CSV 82 members. Local files match GitHub SHA-256 and Zenodo MD5 records. Database inspection uses read-only mode. |

Python commands were launched separately with a PowerShell process wrapper enforcing `WaitForExit(3600000)` and terminating on timeout. Node multi-file/browser runs use a two-hour test timeout. No full generator test suite or dataset/report generation was invoked.

The 57 BPMN and 167 teaching-evidence Python passes are from the first implementation. They were not rerun for the subsequent metadata/navigation/social-card follow-up; accounting exercises, diagrams and dataset files did not change. The final Node pass re-executes worked SQL read-only and the final freeze comparison rechecks all protected artifacts.

## Browser and visual review

The existing interaction suite covers report-preview fetch failure/retry, exact source SQL links, filtered deep-link recovery, SQL fetch retry/copy, empty catalog states, Back/Forward state, modal focus/inert behavior, Mermaid/BPMN keyboard zoom, Reset, Escape and opener focus restoration.

The responsive suite checks 320, 390, 768 and 1440 px widths in light/dark themes on representative report, query, case and reference pages, plus CSS zoom stress. The added section-entry review checks homepage, orientation, Company Story, O2C, Learn and Practice, Cases, Reports, Query Library, Schema, Technical Guide, instructor adoption and Downloads at 390, 768 and 1440 px. Every page has one H1 and no page-wide overflow. A keyboard-activated catalog reading link successfully reaches its process guide.

Screenshots were captured to ignored `outputs/_website_teaching_refinement/browser/`. The homepage at desktop, Query Library at phone width, O2C at tablet width, and the new topic-link block at phone width were visually inspected. Text and links are readable and the existing palette/layout remain intact. Automated behavior checks and these screenshots do not establish full WCAG conformance. Native screen-reader review and a learner pilot were not performed.

The first added keyboard-navigation assertion checked the heading before React finished rendering the destination. It was corrected to wait for the destination heading; the final six-test run passes. An initial Python run encountered two Windows code-page decoding errors; the final 167-test run passes in UTF-8 mode without source changes.

## Structured data, identity and indexing

- All JSON-LD in the generated pages parses as JSON, with asserted identity, page URL, creator, license, publication citation and format coverage.
- Exactly one full Dataset entity is emitted, on Downloads. Its shared identity matches Hub main: `https://charlesriver.accountinganalyticshub.com/#dataset`. The concept DOI is an identifier/sameAs; its educational URL stays on Charles River and subjectOf points to the Hub discovery page.
- Homepage emits WebSite and WebPage. Every authored doc emits WebPage and retains native breadcrumbs. Twenty-three activity pages retain LearningResource based on their actual metadata.
- Downloads has a visible citation matching the Hub recommendation, with the scholarly title, 2027 year and version DOI `10.5281/zenodo.23428084`. Publisher and creator identities match Hub main; the archival full creator name is an alias. No publication year is inferred from operating years or release naming. Other public pages contain no numbered release guidance or GitHub Release links.
- All 48 authored pages have a single effective Open Graph/Twitter image, accurate image MIME/dimensions/alt text, unique descriptions and matching page-specific social titles/descriptions. The authored 1200×630 PNG is 54,543 bytes; its SVG/PNG provenance is in `social-card-evidence.json`. Original generated branding assets are unchanged.
- All 48 authored public routes, sidebar membership, legacy route/fragment behavior, self-canonicals and 49 sitemap entries remain intact. Navigation already satisfies the intended shallow progression; no sidebar or redirect migration is needed.
- Google's live Rich Results Test / Schema Markup Validator were not run. Local validation confirms JSON syntax, expected properties and consistency with rendered content; it does not promise search features or ranking.

## External evidence and limitations

`external-links.json` records the final direct-client results. Hub homepage/discovery/author-profile and both DOI landing URLs returned 403 to the Node client. These are client access limitations, not confirmed missing pages: the web tool read the Hub homepage/discovery pages, and an earlier PowerShell request resolved the supplied DOI with HTTP 200. The author route/identity is confirmed in the clean Hub main source; live retrieval remains unavailable. The Zenodo API independently returned the record and file metadata, saved in `zenodo-evidence.json`; all three local packages match its checksums. Do not describe the five URLs as fully verified by the Node checker.

The Hub clean main source was read without edits and six selected file hashes were compared afterwards. The live web retrieval shows older content, so this review does not assert that the Hub's latest source metadata is deployed. Charles River was aligned to the recorded main-source contract while preserving its independent educational canonicals.

The instructor preface returned HTTP 200 but its old `#to-the-instructor` fragment was missing. Inspection found the current `#sec-to-the-instructor`; the corrected fragment verifies successfully. Both linked SQL chapters also return HTTP 200. GitHub's issue-selection link redirects to login for this unsigned client, as expected.

Performance tracing and Core Web Vitals measurement were not available. The applied [web-performance skill](C:/Users/mauri/.codex/plugins/cache/openai-curated-remote/app-6a99ceead2c481919fb44845267235c4/1.0.1/skills/web-perf/SKILL.md) states: “If unavailable, STOP—the chrome-devtools MCP server isn't configured.” No `navigate_page` or `performance_start_trace` tool was available, so that subtask stopped. A later performance audit needs Chrome DevTools MCP configured; no Lighthouse score, LCP, INP, CLS or performance improvement is claimed.

The build reports an existing `vscode-languageserver-types` dynamic-require warning and a Docusaurus update-check permission notice. Both builds completed successfully. Existing GitHub Pages automation and current Cloudflare Worker configuration were inspected and preserved.

## Preserved artifacts and teaching content

SHA-256 for the unchanged public packages:

| File | SHA-256 |
|---|---|
| `outputs/CharlesRiver.sqlite` | `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c` |
| `outputs/CharlesRiver.xlsx` | `185d42bd069fad177fae23c5e30df93edc7cf2669f687236c8a9f29435388e09` |
| `outputs/CharlesRiver_csv.zip` | `5f2821ee81f86c2da60702a9feaa51fa18f72687e5d0807c44a7d5489fecffb6` |

Full before/after inventories are in `baseline.json` and `final.json`. Generator, configurations, seeds, schema, accounting calculations, anomalies, validation logic, SQL solutions, answer keys, report assets, dataset outputs and diagrams remain unchanged. There were no case-file or case-authoring edits, no worked-register edits, and no new numerical accounting results.

The process-led teaching sequence, all eight cases, twelve numbered lessons, case headings, query/report IDs and original resource links are preserved. Inbound case discovery and visible process-to-catalog links were improved. No new data build variant was run; all read-only accounting checks used the checksum-matched published teaching snapshot represented by `config/settings.yaml`.

## Local review and deliverables

After confirming report assets remain complete, run `npm run build` and `npm run serve -- --host 127.0.0.1 --port 3000`. The local review URL is `http://127.0.0.1:3000/`. If a preview server is already listening, use it or choose another port. Stop if preparation would recreate reports.

For the Windows browser suite, set `NODE_PATH` to the existing runtime's Node packages and `WEBSITE_CHROMIUM_PATH` to the installed Chrome executable before running the command above. This session used `C:/Users/mauri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules` and `C:/Program Files/Google/Chrome/Application/chrome.exe`.

- `AUDIT.md`: baseline findings, revised contextual architecture, duplication matrix, pre-existing inconsistencies and recommendations.
- `baseline-inventory.md` / `final-inventory.md`: all-page purpose, audience, supported level and disposition; JSON counterparts include links, headings and hashes.
- `KEYWORD_MAP.md`: instructional search intent mapped to actual material and explicit unsupported-topic boundaries.
- `HUB_ALIGNMENT_REVIEW.md`: follow-up metadata/discovery review, implemented plan, identity contract and final acceptance results.
- `CHANGED_FILES.md`: complete changed-file list, including private evidence and review helpers.
- Ignored `outputs/learning-seo-*.log`: command logs. Screenshots are also ignored; neither logs nor heavyweight outputs are committed.
