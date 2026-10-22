# Learning discovery and metadata publication

## Authorization and integration

On 22 October 2026, after the review and Hub-alignment handoff, the user requested: “Merge, commit and deploy.” This supersedes the earlier review-only/no-publication restriction for these website changes.

The reviewed implementation was committed on `feature/charles-river-learning-seo-2026` as `a04afc1`. Fetch found that main had advanced from `6424f57` through `22b215f` to `05868411d31d8726e9b0a106494cac9a89eef1c2`, adding teaching corrections and the native diagram library. Those changes were integrated in `583d267`; no other development branch was merged. Three conflicts were resolved by retaining the educational homepage description and verified textbook/Hub links alongside main's revised teaching wording.

The existing origin uses the old repository name `mmcodesso/greenfield_database`, which GitHub redirects to repository ID 1203343831, `mmcodesso/CharlesRiver_Database`. The remote is preserved. The existing Cloudflare `greenfield` Worker has a default-branch trigger for `main`, build command `npm run build`, and deploy command `npx wrangler deploy`. No hosting/account/release settings are changed.

## Integration adjustments

- The old browser test expected a Mermaid SVG on O2C. It now checks the named native evidence map and BPMN viewer while preserving keyboard zoom/reset, modal isolation, Escape and focus-return assertions.
- Main's new case/evidence/ER/tutorial diagram folders were checked out with Windows CRLF, which invalidated embedded source hashes. Extend the existing LF attributes to all native diagram folders and restore the untouched assets to their exact Git bytes. The diagram XML/SVG content remains identical to incoming main.
- Normalize CRLF when reading case Markdown in the website test, so the read-only SQL checks discover the same 62 worked blocks on Windows and Linux. No SQL, expected results, or exercise content is changed.
- Register dynamic evidence-map anchors with Docusaurus so a valid rendered accrual-map link is also recognized during the build.

## Acceptance and deployment evidence

The integrated production build passed with existing report assets, all 43 website Node checks passed, all seven browser tests passed, and all 171 native-diagram/BPMN Python checks passed. The browser pass covers current native evidence-map fit/keyboard zoom/reset, modal focus/Escape behavior, metadata navigation and representative responsive layouts. The Python subprocess checks used a process-local Git safe-directory setting; no global Git configuration was changed.

The historical verifier confirms all 293 frozen artifacts and protected tracked paths. The integrated preservation check additionally confirms 250 original task-start dataset/report artifacts, 259 protected source hashes, all 48 authored routes, and 214 incoming native diagram files byte-identical to main. All 105 worked SQL results retain their reviewed values. `git diff --check` passes. The existing dynamic-require build warning remains non-fatal; no broken-anchor warning remains after registering the evidence-map anchor.

The original `baseline.json` and `final.json` remain historical review snapshots. The integrated main intentionally contains newer diagrams and teaching copy, so do not overwrite those snapshots or incorrectly treat upstream diagram changes as dataset mutations. `publication-review.cjs` separately verifies all original dataset/report artifact hashes, protected source hashes and public routes, and compares every incoming diagram file with main's exact Git bytes. The historical freeze verifier remains required.

Final integration results and exact Cloudflare build/commit/live checks are recorded in ignored `outputs/_learning_seo_publication/` and in the completion response. This avoids a second deployment solely to record the first deployment's identifiers. Publication is complete only after the exact pushed commit has a successful Cloudflare build and the public domain serves the new metadata, social PNG, discovery links, and preserved native diagram assets.

No dataset generation, released-package replacement, SQL/answer-key change, GitHub Release change, Zenodo edit, Hub repository edit, or hosting/account change is authorized by this publication. Existing report assets are reused for local build validation.
