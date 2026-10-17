# Approved website publication — 17 October 2026

The user approved merging the reviewed website redesign into main and deploying it on Cloudflare. This supersedes the earlier local-review restriction; it does not authorize dataset generation or a new dataset release.

## Existing production target

- GitHub repository: `mmcodesso/CharlesRiver_Database` (the former `mmcodesso/greenfield_database` URL redirects to it).
- Cloudflare Worker: `greenfield`, serving `https://charlesriver.accountinganalyticshub.com`.
- Existing Cloudflare Git integration: production branch `main`, build command `npm run build`, deploy command `npx wrangler deploy`.
- The existing GitHub Pages workflow is retained. No hosting project, custom domain, dataset package, or release is replaced.

## Pre-publication verification

- `git fetch origin`: main still matches frozen baseline `7c21218dce19201013f7a71eb7263e12a85af09a`; no incoming changes or conflicts.
- `npm run build`: passed, reusing the existing report assets. Website manifests and branding were refreshed by prebuild with no content diff.
- `node --test tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs`: all 17 checks passed after the fresh build (one-hour process timeout).
- `pwsh -NoProfile -File planning/website-redesign/verify-freeze.ps1`: protected source unchanged and all 293 dataset/report SHA-256 values match.
- Earlier UI review confirmed the unified process, report, and query pages, diagram expansion and keyboard behavior, and responsive query browsing. The process-led learning flow, required case headings, and query/report links remain intact.

The full generator test suite was not run. Frozen legacy tests still contain documentation assertions for retired query/report pages, as recorded in `QUERY_LIBRARY_CONSOLIDATION.md`. Website-specific checks validate the consolidated routes and redirects; no generator or SQL behavior changed.

After merging, monitor the existing Cloudflare production build and check the live custom domain, consolidated pages, redirects, diagram expansion, and representative report/SQL downloads. The GitHub merge and Cloudflare deployment records identify the published commit and permit rollback to the previous production version if needed.
