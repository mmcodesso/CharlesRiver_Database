# Native Power Query walkthrough — October 17, 2026

Status: **partial Windows walkthrough; not an end-to-end pass**.

The user requested a native Power Query test after the Excel formula checks. Testing used a new, separate Book2 workbook in the installed Windows Excel application. The previous Book1 formula checks and the released source workbook were preserved.

## Steps actually completed

1. Created a blank analysis workbook in Excel.
2. Followed Data → Get Data → From File → From Excel Workbook.
3. Selected `outputs/CharlesRiver.xlsx`, the existing published workbook source.
4. Confirmed Navigator lists both formatted tables and worksheets (164 entries for 82 of each). Selected the five named tables required by Design Services, using Select multiple items, rather than selecting their corresponding worksheets.
5. Opened Transform Data. Power Query Editor created the five source queries with Source, Navigation, and automatic Changed Type steps.
6. Inspected the engagement preview: 239 rows and 12 columns. The automatic type inference treats the exported date serials as Whole Number, so the documented conversion to Date is necessary before date filters and comparisons.
7. Used Close & Load to load all five unfiltered source queries into native Excel Tables.
8. Confirmed the Queries & Connections pane reports the loaded counts. The connected Excel table inventory independently confirmed the data ranges below. Compared counts with read-only SQLite queries against the existing release.

| Query and native Excel Table | Loaded rows | Data range | SQLite rows |
|---|---:|---|---:|
| T11_ServiceEngagement | 239 | A2:L240 | 239 |
| T13_ServiceTimeEntry | 2,872 | A2:L2873 | 2,872 |
| T16_SalesInvoice | 20,914 | A2:L20915 | 20,914 |
| T17_SalesInvoiceLine | 27,933 | A2:O27934 | 27,933 |
| T18_ServiceBillingLine | 439 | A2:I440 | 439 |

These are full-history source imports, totaling 52,397 rows. They are not the case's Q1 filtered populations and are not evidence that its later transformations passed.

## Automation blocker and unverified steps

The available Windows automation could click the Navigator and editor controls, but could not reliably enter text into Power Query's separate editor window. Query-name entry did not take effect after focus and window-placement recovery attempts. Keyboard input returned focus to the parent workbook. Accessibility actions against the editor's returned element indices also reported that the elements were unavailable. The tool's accessibility tree sometimes retained the editor after the screenshot showed it had closed; visible screenshots and native table inventory were used to verify the actual load result.

The connected Excel tools can inspect the loaded Tables. Attempts to inspect Power Query metadata through the advertised Office.js tool failed with an unresolved `name` property, including a minimal retry for one known query. No query mutation was attempted through that API. A query capability probe that returned a function was not treated as evidence of a supported create/edit operation.

The following remain unverified in native Power Query: working-query renaming, Date conversion execution, Q1 boundary filters, Reference, Remove Duplicates, Merge Queries, Group By, custom-column expressions, and refresh after those transformations. No claim is made that all case or tutorial Power Query walkthroughs passed. Mac testing remains unavailable on this Windows computer.

## State and files

- Book2 remains open with the five source imports and the ChatGPT add-in connected. It is an unsaved test workbook; no saved deliverable was claimed.
- Book1 retains the prior formula validation.
- No authored website pages, formulas, source data, canonical queries, or released assets were changed in this test.
- The read-only comparison used Node's SQLite interface; no Python commands or generator runs were needed.
- No website build was run because only private test notes changed.
- Protected-path and frozen artifact checks were rerun separately at handoff.

The earlier formula validation remains documented in [EXCEL_FORMULA_REVIEW.md](EXCEL_FORMULA_REVIEW.md). This partial import test does not extend that result to full native Power Query coverage.
