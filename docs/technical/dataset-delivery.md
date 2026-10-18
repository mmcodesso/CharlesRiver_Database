---
title: Customize
description: Optional instructor guide for creating a local dataset and adjusting generation settings.
slug: /technical/dataset-delivery
sidebar_label: Customize
---

# Customize

This page covers local dataset generation and the settings that shape a customized teaching build.

Most instructors can teach directly from the published package and the documentation site. Use customization only when you need a different date range, different dataset size, different outputs, or a different validation or anomaly setting.

If you want to customize <DisplayName /> locally, use the repository workflow described on this page.

## Default Teaching Package

For most courses, start with the three public formats:

- <FileName type="sqlite" />
- <FileName type="excel" />
- <FileName type="csv" />

Get these files from [Downloads](../start-here/downloads.md). A <FileName type="support" /> companion can be created by a local instructor run or supplied separately for a course; it is not part of the public download package. Do not ask students to find a fourth public download.

Then point students to:

- [Start Here](../start-here/index.md)
- [Downloads](../start-here/downloads.md)
- [Dataset Guide](../start-here/dataset-overview.md)
- [Reports and Analytics](../analytics/index.md)

## When Customization Is Useful

Customize the dataset when you want to:

- shorten the fiscal range for a smaller assignment
- change the number of employees, customers, suppliers, items, or warehouses
- change which outputs are exported
- produce a local validation or performance-focused run
- change anomaly behavior for instructor preparation or internal testing

The published files remain the default classroom package. Local settings files are optional tools for instructor customization and validation.

## How to Generate the Dataset Locally

From the repository root:

```bash
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 generate_dataset.py
```

Generated files are written to `outputs/`.

Faker supplies names and addresses, and pandas' handling of missing values reaches some anomalies. For reproducible local generation, install `requirements-lock.txt` instead of `requirements.txt` and retain the generation log with your source files.

By default, `generate_dataset.py` reads `config/settings.yaml`. You can also pass a settings file and validation scope explicitly:

```bash
python3 generate_dataset.py config/settings_validation.yaml core
```

The validation scope options are `core`, `operational`, and `full`.

## Settings You Can Adjust

The generator currently exposes these instructor-facing settings in the YAML files under `config/`:

### Fiscal range

- `fiscal_year_start`
- `fiscal_year_end`

Use these when you want a shorter or longer teaching horizon.

### Entity counts

- `employee_count`
- `customer_count`
- `supplier_count`
- `item_count`
- `warehouse_count`

Use these when you want to scale the dataset up or down for course difficulty, performance, or assignment size.

### Export controls and output paths

- `export_sqlite`
- `export_excel`
- `export_support_excel`
- `export_csv_zip`
- `export_reports`
- `sqlite_path`
- `excel_path`
- `support_excel_path`
- `csv_zip_path`
- `report_output_dir`
- `report_preview_row_count`
- `generation_log_path`

Use these when you want to control which files are produced and where they are written.

### Anomaly behavior

- `anomaly_mode`

Use this when you need a local run with or without anomaly injection for instructor preparation or validation work.

### Other teaching parameters

- `random_seed`
- `company_name`
- `short_name`
- `base_url`
- `tax_rate`

Use these when you need stable reruns or limited local adjustments to the generated environment.

### Rolling the fiscal window and the book scenarios

The calibrations that give the dataset its storylines (the plant's late-year load and its bridge year, cost and pay growth, the dates of the capital plan) are stated relative to the year the scenario ends. That year is the year of `fiscal_year_end` unless the settings file sets `scenario_end_year`, which a short or long test configuration uses to keep the default calibration years. Changing only the fiscal range and keeping `random_seed` therefore tells the same story a year later: fiscal 2025-2027 or 2026-2028 instead of 2024-2026.

A few storylines the companion textbook (Accounting Analytics: An Integrated Approach) relies on are not calibrations but accidents of the seed on one window. The `book_scenarios` section of `config/settings.yaml` states each of them relative to the window, with the last fiscal year C and the year before it, P. A step plants its storyline only when the build does not already contain it, so the default window is unchanged and a rolled window keeps the story.

| Setting | What it keeps true |
|---|---|
| `cutoff_invoices` | The invoices planted with a date before their shipment never fall before the first fiscal year, and each year's group tells the revenue cutoff story: consecutive invoices numbered in that year but dated in the year before, posted on one date (January 1 where possible), billing goods shipped on one date of the new year. In C exactly one of the group bills goods that all shipped in P (the cutoff error); in earlier years none does. Where the first invoices of a year do not have that shape, the generator takes the nearest consecutive invoices that do, and in C, if none bills goods shipped in December, it moves a January shipment that one of the group's invoices bills to December 31 (shipped on the last day of the year, invoiced on the first). |
| `traced_sale` | One invoice of P is the sale the text traces from order to ledger: a single line of two desks (item code `FUR-DSK-`), with freight and sales tax, shipped as part of a larger order line, billed to a wholesale customer and paid in full by one check that also paid at least two other invoices. If no invoice of P already has that shape, the generator cuts the closest one down to it (shipped and invoiced quantity, freight, tax, the cash application, the commission accrual) before posting, so the ledger and the closes follow. |
| `stranded_work_orders` | No work order released before C is still open when the data end. A work order that stalls with a rounding sliver of its quantity unfinished is short-closed at the quantity produced and closed in the last month. Work orders released in C stay open, as the backlog the text describes. |

`enabled: false` (or no section, as in the test configurations) turns all three off. The steps live in `src/generator_dataset/book_scenarios.py` and, for `cutoff_invoices`, in `inject_invoice_before_shipment` of `anomalies.py`. Each logs a `BOOK SCENARIO` line saying whether it found its storyline in place or planted it.

## Available Settings Files

The repository currently includes these settings files:

- `config/settings.yaml` as the main local generation template
- `config/settings_validation.yaml` for a smaller validation-oriented run
- `config/settings_perf.yaml` for short-horizon performance profiling

These files support local generation workflows. The published teaching package is distributed separately and should remain the normal starting point for classroom use.

## What Local Generation Produces

The generator writes:

- <FileName type="sqlite" prefix="outputs/" />
- <FileName type="excel" prefix="outputs/" />
- <FileName type="support" prefix="outputs/" />
- <FileName type="csv" prefix="outputs/" />
- `outputs/reports/`
- `outputs/generation.log`

The main SQLite database and main Excel workbook are the core student-facing dataset files. The support workbook is an optional instructor/local output for exception review or validation context. Supply it separately only when the course needs it. Share the CSV zip when flat-file delivery is useful.

## How to Share a Customized Package

- Share the SQLite database for SQL work.
- Share the Excel workbook for pivot and chart-based analysis.
- Local full runs can write report files to `outputs/reports/`. Website report assets are served from `static/reports/`; the current public documentation site is hosted through the Cloudflare `greenfield` Worker and its Git integration.
- `.github/workflows/deploy-docs.yml` retains a legacy GitHub Pages workflow. Its report-preparation and deployment steps describe that workflow, not the current Cloudflare hosting path. Classroom adoption does not require a hosting change or a new report build.
- Share the support workbook when classes need anomaly and validation companion material.
- Share the CSV zip when students or analysts need one CSV per table.
- Publish the student files through GitHub Releases or your course LMS.
- Keep `generation.log` for instructor review only.
- Ask students to start from the documentation site and the published teaching files, not from the local generation workflow.
- If you want a smaller assignment, filter to one fiscal year in SQL or Excel without creating many custom classroom variants.

## Next Steps

- Read [Instructor Adoption Guide](../teach-with-data/instructor-guide.md) for course sequencing.
- Read [SQL Guide](../analytics/sql-guide.md) if students will work primarily in SQLite.
- Read [Excel Guide](../analytics/excel-guide.md) if students will work primarily in the workbook.
