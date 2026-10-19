# October 19 review-improvements publication

## Authorization and scope

After reviewing the implementation handoff, the user explicitly requested, "Great, now lets commit, merge and deploy." This authorizes committing the reviewed website corrections on `codex/review-improvements-2026-10-19`, merging into `main`, and publishing through the existing Cloudflare `greenfield` Worker and its main-branch Git integration. It supersedes the earlier review-only publication restriction for this change.

The existing release, dataset, generator, SQL, report definitions, hosting configuration, and account settings remain unchanged. The original [handoff](HANDOFF.md) preserves the implementation-stage findings and limitations.

## Published report reuse and acceptance

The local checkout has nine missing report sets and five stale sets. None was regenerated or replaced. Instead, the previously successful main build's existing `github-pages` artifact was downloaded into `/tmp/charles-publication-validate/` for independent acceptance checks. It contains all 48 report sets and 144 required report files.

- Source commit: `6424f57b684030817fde232e94eb8084238493cf`.
- Existing successful workflow: [Deploy Docs run 39154833086](https://github.com/mmcodesso/CharlesRiver_Database/actions/runs/39154833086).
- Artifact ID: `12146119779`.
- Archive SHA-256: `90e548dc5730b6e2ab59fc0be74b39a5d568cb48a401d6fee9b6e2fc1b7c4788`, matching GitHub's artifact digest.
- Release SQLite SHA-256: `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`, opened read-only from `outputs/_site_build/CharlesRiver.sqlite`.

The existing report acceptance assertions were executed against every downloaded set, comparing all preview, CSV, and XLSX values to the canonical SQL executed on the checksum-matched SQLite. All 48 sets passed. [published-report-validation.json](published-report-validation.json) records the result.

A temporary copy of the reviewed website source then reused those report files and the existing locked dependencies. Ordinary `npm run build`, including its existing preparation and validation hooks, passed without report generation. The rendered-link audit inspected all 49 sitemap routes and 4,902 internal-link occurrences with zero missing file, page, or fragment targets. [published-assets-link-audit.json](published-assets-link-audit.json) records that complete-asset audit. Original local prerequisite diagnostics remain accurate for this checkout.

All six website Node suites passed with the complete published report assets: 37 tests passed, zero failed. The unchanged 105 named worked examples and the new accounting regressions remain valid.

The existing Git-integrated production build remains the publication mechanism. No incomplete local build will be uploaded. Main's exact published commit and the Cloudflare build/version outcome must be verified after push; a successful push alone does not establish deployment. Deployment identifiers are reported at completion in the chat and retained in ignored `outputs/_website_review_2026_10_19/`.

## Commands and remaining limits

Validation used the repository `.venv`, existing scripts, and temporary copies. Commands included `npm run build`, the six website Node suites with a 3,600-second subprocess timeout, the existing row-level report acceptance assertions, the rendered-link audit, preservation verification, and `git diff --check`. Temporary build and Node logs are `/tmp/charles-publication-build.log` and `/tmp/charles-publication-node.log`.

The earlier platform and learner limitations remain: native Excel/Power Query on Windows and Mac, a screen-reader audit, and a learner pilot were not completed. Browser samples do not establish full accessibility conformance. Routes, case headings, query/report links, worked examples, and the process-led progression are preserved. Generated manifests have no tracked changes; existing dataset/report hashes remain unchanged.
