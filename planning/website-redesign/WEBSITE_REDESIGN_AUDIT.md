# Charles River website audit — 17 October 2026

## Baseline and evidence

- Frozen baseline: `7c21218dce19201013f7a71eb7263e12a85af09a`. Working tree initially clean. Fetch completed; local/remote main and book-roll-feasibility all already point here. No unmerged commits, open PRs, branch protection, or repository rulesets were found. No merge or main push was required.
- Origin's legacy greenfield_database URL redirects to [CharlesRiver_Database](https://github.com/mmcodesso/CharlesRiver_Database). Preserve source settings during the freeze; presentation links can use the canonical repository.
- Reviewed deployment workflow: push to main or manual dispatch builds and deploys GitHub Pages, downloading the published SQLite and deriving reports. Neither action is part of this redesign.
- Baseline validation: production `npm run build` passed; 27 targeted tests in book scenarios, schema, and website onboarding passed. Existing report assets were complete and reused. No database generation ran.
- [Release v2027.1](https://github.com/mmcodesso/CharlesRiver_Database/releases/tag/v2027.1) metadata and asset digests inspected through GitHub. Local `outputs/CharlesRiver.sqlite` matches SHA-256 `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c` exactly. Read-only SQLite inspection found **82 user tables** (excluding SQLite internal tables). README says 55, Dataset Guide 73, schema reference 77: all need website/repository documentation corrections, never a data change.
- Release provides SQLite, Excel, and CSV ZIP. Support workbook exists locally but is not a published asset. Release prose contains conflicting citation years; prefer verified version, URL, author, and GitHub date over reproducing inconsistent citation text. Operating years are 2024–2026; some settlement postings extend beyond that window.
- Reviewed rendered production homepage and student orientation, source navigation and educational pages. Delegated specialists inventoried every case and reviewed process/instructor/reference architecture. Source coverage is broader than manual rendered-page coverage.
- Reviewed [Hub](https://accountinganalyticshub.com/) and [textbook](https://aa.accountinganalyticshub.com/), plus newer local Hub source `D:/codes projects/AccountingAnalyticsHub_Website`, commit `72ce05f`. Current Hub uses paper/teal/navy, restrained rules, serif headings, sans-serif text, process diagrams, and explicitly planned courses.

## Inventory and structure

The baseline has 54 documentation pages, 17 case detail pages, 170 canonical SQL files (58 financial, 53 managerial, 53 audit, 6 case support), 48 report definitions, and four guided report perspectives. Existing routes and SQL/report URLs are valuable teaching links and should all remain stable.

| Current section | Finding | Redesign decision |
| --- | --- | --- |
| Start Here | Strong process-first philosophy, but repeated setup and navigation across four pages | Preserve routes; make orientation a staged first session, downloads a file/version guide, dataset overview a verified reference |
| Learn the Business | Company and individual processes share one category; narrative repeats operational summaries | Separate Company and Business Processes; make the profile concrete and label illustrative details |
| Analyze the Data | Tutorials, cases, report packs, report libraries, and queries compete within nested categories | Add Learn and Practice; make Cases independently discoverable; flatten Reports and Analytics |
| Cases | Seventeen useful assignments hidden in nested categories and a wide six-column matrix | Server-rendered catalog with accessible filters, prerequisites and deliverables; retain all routes |
| Reports | Useful report components/previews/downloads and perspectives already exist | Preserve generated catalog/pack assets and components; improve entry links and navigation |
| Reference | Detailed schema/posting guidance, table count lags release | Correct authored claims and distinguish release from current generator source |
| Instructors | Rollout guidance is useful but curriculum relationships are implicit | Map AIS, analytics, financial, managerial and auditing pathways, especially O2C/P2P/conversion |
| Technical | Contributor material is secondary for students | Keep accessible at the end; explain dataset freeze for website contributors |

## Company and instructional content

The hybrid merchandise/manufacturing/hourly-service model is accurate and worth retaining. The story currently reads as repeated process summaries; customer promises and buyer descriptions are not clearly marked as illustrative narrative. Explain the make/buy decision, departments, and timing dependencies through a labeled scenario, without inventing transaction IDs, financial outcomes, or operational guarantees.

Process pages retain valuable accounting distinctions: orders are commitments rather than automatic revenue; goods fulfillment differs from service billing; receipt-matched AP differs from accrued services; manufacturing standard cost differs from labor support; payroll and service cost snapshots serve different analyses. Preserve these distinctions and point each process toward evidence, cases, and interpretation.

All cases have a guided investigation and query references, but repeated generic deliverables obscure the assessed outcome. Beginner SQL currently opens with a complex working-capital bridge. Excel guidance supplies tables without a tightly scoped first submission. Add foundational exercises and case-specific evidence/interpretation criteria before adding new integrated cases.

The current website onboarding test forbids the very case headings required by the assignment/current AGENTS. Update only website-specific tests to assert the new learning contract; generator tests remain frozen. `queryDocCollections` has known portfolio sequence drift; do not silently rewrite frozen SQL or rely on that sequence for a new catalog.

## UX and accessibility

The existing serif/green identity is compatible with the Hub but uses large gradient panels, repeated rounded cards, and long introductions. At the observed narrow viewport, the homepage's first screen explains the principle but gives little sense of the company or connected system. Replace repeated promotional sections with a two-part introduction and actual process-to-ledger diagram, then concise resource pathways.

Use restrained paper/teal/navy colors, readable widths, simple rules, fewer decorative surfaces, explicit focus styles, responsive grids and scrollable tables. Keep dark mode. Essential content must remain in server-rendered HTML. Native labeled selects and text search can enhance a fully visible initial case catalog. Review focus management in existing overlays, accessible zoom names, reduced motion, keyboard search and mobile navigation.

## SEO and discoverability

All baseline docs already have descriptions; canonical URLs, local search, robots, sitemap and Docusaurus breadcrumbs exist. Six process pages lack explicit title front matter but derive a title from H1. Preserve these working foundations and existing redirects. Retain all established routes to avoid unnecessary client-side redirects (GitHub Pages cannot supply HTTP 301 rules through Docusaurus alone).

Homepage search intent is broad and repetitive; orient it around a synthetic accounting environment, connected processes, and practical resources. Use unique descriptions and cross-links for company/process/case/reference intent. Dataset JSON-LD should have one stable identity, verified Person creator, publisher, version, license, citation and real distributions. LearningResource data must match the visible activity, without invented duration, results, or scholarly identifiers. Use existing breadcrumb support, not duplicate graphs. Link the Hub, textbook, repository, versioned release and license clearly.

## Risks and validation plan

1. Freeze protected tracked paths and hash local dataset/report artifacts before edits; compare at completion.
2. Reuse complete existing reports during the normal production build. Never regenerate canonical data or replace releases.
3. Check all routes, manifests, case/query/report references, metadata, robots/sitemap and structured data in built HTML.
4. Inspect desktop, tablet and mobile; exercise filters, search, navigation, dark mode and keyboard behavior. Run Lighthouse if available; distinguish automated findings from manual conformance.
5. Preserve all 54 original public document routes, required case sections, generated inventories and source-to-ledger correctness. Keep planning outside `docs/` so it is not indexed.
