# Charles River Accounting Dataset

Charles River Accounting Dataset is a synthetic business database for undergraduate and graduate accounting analytics courses. It is designed for student work in SQL, Excel, auditing analytics, business-process tracing, and source-to-ledger analysis.

The documentation website is the primary starting point:

- [Charles River documentation site](https://CharlesRiver.AccountingAnalyticsHub.com/)
- [Start Here](https://CharlesRiver.AccountingAnalyticsHub.com/docs/)
- [Downloads](https://CharlesRiver.AccountingAnalyticsHub.com/docs/downloads)
- [Instructor adoption guide](https://CharlesRiver.AccountingAnalyticsHub.com/docs/teach-with-data/instructor-adoption)

Most students should begin with the documentation site and the packaged output files rather than the Python generator.

## What This Repository Contains

- a three-year teaching dataset covering fiscal years 2024 through 2026
- 82 user tables in published release v2027.1, spanning accounting, O2C, P2P, manufacturing, payroll and time, master data, planning, fixed assets, and financing
- starter SQL packs for financial, managerial, and audit analytics
- ready-to-use download files for SQLite and Excel through GitHub Releases
- local generator support for a companion support workbook, CSV zip exports, and generation logs

Student download files:

- `CharlesRiver.sqlite`
- `CharlesRiver.xlsx`
- `CharlesRiver_csv.zip`

The 82-table specification was verified against the published SQLite asset (SHA-256 `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`), excluding SQLite internal tables. The main operating window is 2024–2026; supplier settlements extend into early 2027. The support workbook is a separate local/instructor companion and is not an asset in release v2027.1.

## Website Development

The website redesign is maintained on `feature/charles-river-website-redesign`; the generator, SQL library, configurations, and dataset artifacts are frozen at `7c21218dce19201013f7a71eb7263e12a85af09a`. See [AGENTS.md](AGENTS.md) and [the redesign audit](planning/website-redesign/WEBSITE_REDESIGN_AUDIT.md) before editing. Keep the redesign off main and production until approved.

With dependencies and existing report assets available, run `npm run build`, then `npm run serve -- --host 127.0.0.1 --port 3000`. The normal build refreshes website manifests and validates report assets; do not regenerate the canonical dataset to preview website changes.

## Teaching Package Setup

If you need to generate or refresh the classroom dataset locally, use the teaching guide:

- [Dataset Delivery and Build Setup](https://CharlesRiver.AccountingAnalyticsHub.com/docs/technical/dataset-delivery)

## Repository Links

- [Documentation website](https://CharlesRiver.AccountingAnalyticsHub.com/)
- [Contributing guide](CONTRIBUTING.md)
- [License](LICENSE)
