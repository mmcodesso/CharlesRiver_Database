# Content course publication

The user authorized commit, merge, and Cloudflare deployment of the reviewed company/process content, twelve guided tutorials, eight cases, and copyable Excel formulas. This publication uses the existing `greenfield` Worker and `main` Git integration at https://charlesriver.accountinganalyticshub.com.

## Pre-publication verification

- Fetched origin; the working base and remote main both matched `cdc2697` before publication. No incoming changes or open pull requests were present.
- `npm run build` passed. Prebuild refreshed website branding/manifests through their existing scripts and reused existing report assets. The existing dynamic-require and local update-check warnings remain nonfatal.
- The navigation, rendered-site, tutorial, and case Node test files passed all 25 checks with a one-hour process timeout. These execute the 43 tutorial and 62 case SQL statements against the checksum-matched read-only release and check navigation, metadata, diagrams, redirects, legacy anchors, and static links.
- `node planning/website-redesign/cases/verify-analysis.cjs` passed 1,409 independent spreadsheet-equivalent comparisons across the eight cases.
- `planning/website-redesign/verify-freeze.ps1` passed: protected source paths and all 293 dataset/report SHA-256 values remain unchanged. `git diff --check` passed.
- Earlier browser review covered responsive pages, remembered tool tabs, formula copying, disclosures, diagram controls, keyboard behavior, and old deep links. The process-led reading sequence, required case headings, and query/report links are preserved.

## Desktop validation limits

Windows Excel evaluated 819 formula/result comparisons for the Design Services case with no mismatches. Native Power Query successfully imported and loaded all five source tables (52,397 rows), matching SQLite. Editor focus problems prevented completing native filtering, merging, grouping, and custom-column walkthroughs. Mac desktop checks were unavailable. These limits are detailed in `EXCEL_FORMULA_REVIEW.md` and `POWER_QUERY_WALKTHROUGH_REVIEW.md`; spreadsheet-equivalent checks are not represented as complete native walkthroughs.

No dataset generation or generator regression suite was needed for this website-only publication. Released downloads, schema, canonical queries, accounting calculations, and report assets remain frozen. The production commit and deployment result are recorded by the pull request and Cloudflare build history.
