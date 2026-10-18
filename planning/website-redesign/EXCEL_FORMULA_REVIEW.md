# Excel formula follow-up — October 17, 2026

The eight guided cases and the twelve Learn and Practice lessons were reviewed for calculations that learners were asked to construct without a complete formula. Missing worksheet formulas and Power Query custom-column expressions now appear in individual copyable code blocks beside their numbered instructions. Each new block identifies the working table and column, or worksheet and cell. Instructions explain exact-match lookups, dates, blank approval evidence, filtered totals, and filling table formulas down when Excel does not do so automatically.

## Content changed

- All eight pages under `docs/analytics/cases/`, their authoring source `cases/case-drafts.json`, and `cases/build-case-content.cjs`. The generator keeps each formula block inside its corresponding numbered list item.
- Nine lesson pages under `docs/learn-and-practice/`: read-an-order, connect-the-records, follow-customer-settlement, find-the-accounting-entries, follow-design-time-into-billing, manufacturing-cost-flow, follow-hours-into-payroll, follow-an-estimate-into-settlement, and turn-records-into-a-conclusion. Other lessons did not need additional calculation formulas.
- `src/components/Cases/Methods.jsx` explains where to paste worksheet formulas versus Power Query expressions, the fill-down fallback, and regional formula separators.
- `cases/excel-formula-register.json` inventories 136 code blocks across these 17 pages: 122 worksheet formulas and 14 Power Query expressions. It includes pre-existing complete blocks as well as additions; these counts do not describe 136 newly added formulas. The setup guide's existing formula is outside this tab-based inventory.

The process-led flow, numbered Excel instructions, SQL route, independent challenge boundary, public routes, section anchors, case-section headings, and query/report links are preserved. No challenge answers were added.

## Native Excel validation

After the user connected Microsoft Excel, the Design Services worked example was reproduced in the blank Book1 workbook on Windows, on a separate sheet named Formula checks. The released workbook was not edited. Inputs were the previously workbook-verified Q1 2024 source records from release v2027.1.

- Five native tables: 204 time entries, 21 engagements, 33 invoice lines, 33 invoice headers, and 33 billing lines.
- The exact published XLOOKUP, DATE, approval IF, SUMIFS, and hours-difference formulas were entered and filled through 810 calculated cells. Nine additional summary checks brought the total to 819 comparisons, with no differences.
- Engagement 2's hourly rate was 210; the covered, approved, and billed billable-hour checks each returned 1,409.88; the reconciliation difference was zero. The billable share was 95.0374115%, and billed amounts less recorded time cost were 195,843.05.
- A worksheet search found no Excel formula errors. The formatted comparison summary was rendered and visually inspected.
- Native input and result evidence is retained in `cases/native-excel-inputs.json` and `cases/native-excel-verification.json`.

This verifies the Design Services formulas in native Windows Excel. It is not a complete native walkthrough of every case's Power Query import/merge procedure. The other cases retain independent spreadsheet-equivalent checks; Mac Excel and native Power Query expressions were not executed during this follow-up.

A subsequent [native Power Query walkthrough](POWER_QUERY_WALKTHROUGH_REVIEW.md) verified importing and loading all five Design Services source tables in a separate Windows workbook. Editor input limitations prevented completing the filters and merges, so full Power Query walkthrough coverage remains unverified.

## Validation run

- `node planning/website-redesign/cases/build-case-content.cjs` regenerated the case pages from their updated authoring source.
- `npm run build` passed using existing report assets. Normal prebuild scripts refreshed branding and manifests; the existing nonfatal dependency and update-check warnings remain.
- The four website test modules (navigation-seo, rendered-site, tutorials, cases) passed all 25 tests, under a 3,600,000 ms timeout. These include the 62 case SQL and 43 tutorial SQL statements executed read-only against the verified release, plus routes, links, metadata, and diagrams.
- `node planning/website-redesign/cases/verify-analysis.cjs` passed 1,409 independent spreadsheet-equivalent comparisons across the eight cases.
- The formula inventory was compared with authored content: every registered expression is present, worksheet expressions begin with equals, and no ellipsis or cell-name placeholders remain in those expressions.
- Browser checks confirmed numbered-step placement, formula titles, the Copy confirmation, an actual paste of the exact XLOOKUP expression, word wrapping, and phone-width layout without document overflow. The browser automation clipboard-read helper returned stale text; a real Ctrl+V paste into the local search field verified the copied formula. The temporary search text was cleared and the page reloaded.
- `planning/website-redesign/verify-freeze.ps1` passed: protected tracked paths and all 293 frozen dataset/report artifact hashes are unchanged.
- `git diff --check` passed.

Python/generator tests were not run for this content-only change. Dataset, schema, canonical SQL, report assets, and released downloads remain unchanged. No deployment was performed.
