# Report presentation publication

The user authorized "Merge commit and deploy" after reviewing the report presentation implementation and the Export Data follow-up. The checkout and remote main initially both pointed to `f852c41b0ba9bfb8e8714953f344121df3f8e984`; no separate feature branch needs merging. Commit this reviewed batch on main and use the existing main-branch Cloudflare trigger for the `greenfield` Worker.

## Clean build integration

Local review reused the original frozen report assets and checksum-matched SQLite. Clean Cloudflare builds do not have those ignored prerequisites. `reuse-published-reports.cjs` therefore reads the existing Worker downloads into temporary `outputs/_published_report_assets`, checking every file against the captured publication-input inventory. All 43 retained published CSVs were compared against the verified local CSVs before capturing the inventory: data is identical, with LF versus CRLF line-ending differences. The staged original Excel, CSV and preview files are published at their existing paths without regeneration. Existing local report files are not overwritten.

In CI, the new presentation builder accepts only the captured CSV/SQL hashes, field definitions and row counts, previously verified against the published teaching database. It creates the website's new presentation JSON using the same formatting definitions. Local preparation continues to verify SQL read-only against the checksum-matched database. A missing or changed published prerequisite fails the build. No database or protected report exporter is invoked by the CI presentation path.

The existing GitHub Pages workflow's report-export step was removed; the normal site build now provisions existing published bytes. Release-download, account, Worker, domain, Git trigger and deploy settings remain unchanged. The original generator and report scripts are unchanged.

## Acceptance

The report implementation and Export Data follow-up passed production builds, model/export checks, and browser checks documented in HANDOFF.md. Publication additionally validates the CI path, the unchanged 250 original artifact hashes, stable CSV paths and protected generator/config/SQL paths. Exact pushed commit, Cloudflare build outcome and live verification evidence are retained under ignored `outputs/_website_reports/` to avoid a follow-up deployment only for deployment identifiers.
