# Charles River content refinement

The public site now introduces Charles River once as a fictional company with synthetic records, in the opening note on Company Story at `/docs/company-story`. The remaining copy uses natural business language and directs students toward the work, documents, accounting effects, interpretation, and next decision.

The source audit and production HTML audit each found that disclosure in exactly one location. The note also explains the boundary between the company narrative and the records selected for analysis. Dataset version guidance and GitHub release links now appear on Downloads only; the rest of the public content has no numbered dataset versions.

## Teaching copy

The revision covers 44 documentation pages, the homepage, shared components/metadata, and public evidence templates. Homepage copy introduces the company and the accounting questions students can investigate. Company Story connects the business activities and staff responsibilities without recurring explanations of the teaching narrative. All six process chapters now use their opening transitions to identify the next accounting question or evidence task.

All 12 lessons and eight cases now proceed without company-origin or dataset-version reminders. Case tool-choice guidance remains. Evidence instructions identify source files, selected records, dates, and scope. The workforce case explains missing work-center categories directly. Case authoring drafts and the shared template are synchronized; `build-case-content.cjs --content-only` published the case text and updated the catalog's descriptive comment without replacing case figures or worked-result registers.

The company → process → evidence → analysis → interpretation → decision progression is preserved. Learning objectives, prerequisites, tool instructions, checkpoints, independent challenges, and the case headings `Key Data Sources`, `Recommended Query Sequence`, and `Next Steps` remain intact. Existing query/report components, links, and Hub/textbook connections remain in place. Evidence limitations about document relationships, dates, controls, and unsupported conclusions remain explicit where needed.

The editorial rules are recorded in `AGENTS.md` so later authoring retains the single disclosure and keeps release information on Downloads. The current changed-file list and validation evidence are in [latest-release-validation.json](latest-release-validation.json); [validation.json](validation.json) retains the earlier copy-refinement checks.

## Routes and metadata

No public route, slug, sidebar entry, pagination destination, or redirect changed. The site retains 47 authored documentation pages and 49 sitemap routes. All 12 lesson routes and eight case routes remain stable. The homepage title/description and the default Dataset structured-data description reflect the learning focus without repeating the disclosure. Canonical URLs, Dataset identity, creator, and license are preserved.

## Downloads and release guidance

Downloads links to GitHub's `/releases/latest`, provides the three `/releases/latest/download/<filename>` links, and links to `/releases` for previous versions. Setup and instructor pages now direct readers to Downloads. The footer release item has been removed. Release-related Dataset metadata and file distribution links are present on Downloads only; other Dataset metadata remains unversioned. Fixed version/hash values have been removed from public runtime code. Checksum instructions point to the current release details instead of presenting an old fixed checksum as the latest file.

The read-only GitHub API check confirmed that the current latest SQLite asset matches the frozen worked-example checksum; [latest-release-check.json](latest-release-check.json) records the asset names, URLs, sizes, and digests. GitHub releases and their files were not modified. The verified version/hash records remain private validation evidence.

All 12 tutorial diagrams had version labels in their footers. Only those footer values changed in the editable `.drawio` sources; all cells, numerical content, and geometry remain intact. Matching SVGs were exported through installed Draw.io Desktop using the existing tutorial helper. All 12 exports retain their viewports, embedded editable XML, accessible titles/descriptions, and matching source hashes. Case and BPMN diagrams were unchanged.

## Validation

| Check | Result |
|---|---|
| `npm run build` | Passed with all 144 existing report assets reused. |
| Five existing website Node suites | 33 passed, zero failed on the final run. |
| Worked SQL and reviewed results | All 43 lesson and 62 case statements executed read-only against the checksum-matched v2027.1 database and matched their reviewed results. |
| Navigation and rendered content | Existing checks passed for routes, fragments, downloads, report/query inventories, metadata, headings, and server-rendered links. |
| Disclosure audit | One source location and one generated HTML location, both Company Story. |
| Version and release-link audit | No numbered dataset versions in public source or generated HTML. Every release link in generated HTML is on Downloads. |
| Tutorial figure exports | 12 editable sources and 12 native SVG exports checked; footer-only source changes, unchanged viewports and numerical content, matching source hashes. |
| Local browser review | Edge review at 1440×1000, 768×1024, and 390×844; sampled homepage, Company Story, payroll chapter, Lesson 2, and Case 1 in light/dark themes. No horizontal overflow on the samples. |
| Keyboard interactions | Homepage link enters Company Story; payroll concept check opens with Enter and retains focus; tool tabs expose visible keyboard focus and activate with Enter; tool choice persists between case and lesson. |

The first Node run passed 31 checks and exposed two existing Windows CRLF assumptions. Baseline content confirmed that the SQL extractor detected no blocks with its LF-only expression and that the original tutorial diagram matched its export hash after LF normalization. The website-only tutorial test helper now compares canonical text. Expected SQL and reviewed results remain unchanged; subsequent footer edits have matching native exports. The final run passes all 33 checks.

Commands ran with a one-hour timeout for explicit tests:

```powershell
node planning/website-redesign/cases/build-case-content.cjs --content-only
npm run build
node --test tests/website/cases.test.cjs tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs tests/website/teaching-refinement.test.cjs tests/website/tutorials.test.cjs
.venv/Scripts/python.exe -m pytest -q tests/test_docs_onboarding_flow.py tests/website/test_teaching_refinement.py -k "not restored_report_binaries"
```

The Python command could not start: `.venv/pyvenv.cfg` points to a missing `C:/Users/mauri/AppData/Local/Programs/Python/Python312/python.exe`. No interpreter substitution or environment modification was performed. Native Excel, screen-reader, native zoom, and learner-pilot checks were not run. Browser sampling does not establish full accessibility conformance. Existing nonblocking build notices concern Browserslist age, an upstream dynamic require, and the local Docusaurus update-check store.

Current build and Node logs are `outputs/_website_content_refinement/latest-release-build.log` and `latest-release-node-checks.log`; earlier logs remain in that ignored directory. The final build and all 33 Node checks passed after the release-link and figure updates. Additional Edge review covered Downloads at 1440×1000 light and 768×1024 dark, and Lesson 2 with its native figure at 390×844 and 1440×1000. The release/history/download hrefs were inspected, and Enter/Escape preserved viewer opening and focus restoration. Browser screenshots were inspected in tool output; no screenshot artifacts were saved. Browser theme, tool selection, and viewport override were restored after review.

The native export initially failed inside the sandbox during graphics/cache initialization. The successful export used an isolated workspace profile outside the sandbox. PowerShell 5 required an ephemeral UTF-8 BOM copy of the checked-in helper, with UTF-8 JSON reading; the temporary helper was removed afterward. No diagram was redrawn or patched as a replacement for native export.

## Preservation

[preservation-baseline.json](preservation-baseline.json) retains the initial SHA-256 inventory. The final comparison verified all 250 dataset/report files unchanged, including all 144 report assets. Of the broader 381-file source inventory, 353 entries retain their initial hashes; the 28 intentional differences are the 24 tutorial presentation files and four website test files. The tests now cover latest links and version-free public content, while retaining accounting/result validation. Reviewed-result registers, case/BPMN diagrams, and generator validation logic were not changed.

The published SQLite SHA-256 remains `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`. No dataset or report generation ran. Existing branding and manifest scripts ran through prebuild; generated manifests have no Git diff. Generator/config/query/script paths have no diff against frozen `7c21218dce19201013f7a71eb7263e12a85af09a`. The final evidence identifies the intentional tutorial presentation changes separately from that protected core.

## Local preview

The production preview is running at [http://127.0.0.1:3107](http://127.0.0.1:3107). Port 3000 was already occupied; its existing process was left running. To restart this preview after stopping it:

```powershell
node node_modules/@docusaurus/core/bin/docusaurus.mjs serve --host 127.0.0.1 --port 3107 --no-open
```

Changes remain in the working tree for review. No commit, push, deployment, release change, or account/hosting change was performed.
