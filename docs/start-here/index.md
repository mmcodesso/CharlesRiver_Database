---
title: Start Learning with Charles River
description: Meet the fictional home-furnishings company, download the accounting dataset, and choose a first process, exercise, or teaching pathway.
slug: /
sidebar_label: Start Here
---

# Start Here

<DatasetName /> is an open teaching environment built around <CompanyName />, a fictional greater-Boston home-furnishings business. It buys merchandise, manufactures selected products, and sells hourly Design Services. Its connected records let you follow a business event through source documents, accounting recognition, analysis, and a supported decision.

Start with the business before the joins. You do not need to learn every table or install the generator to begin.

## Your First Learning Path

1. **Meet the company.** Read [Company Story](../learn-the-business/company-story.md) to understand what it sells and how its departments depend on one another.
2. **Follow one process.** Open [Process Flows](../learn-the-business/process-flows.md), then choose order-to-cash, procure-to-pay, or manufacturing.
3. **Get the evidence.** Download the published teaching files below. Use the [Dataset Guide](dataset-overview.md) to identify the tables for your chosen process.
4. **Try a focused task.** Begin with a foundational exercise in [Learn and Practice](../learn-and-practice/index.md). Keep the [SQL Guide](../analytics/sql-guide.md) or [Excel Guide](../analytics/excel-guide.md) beside your work.
5. **Interpret and decide.** Explain the accounting meaning of your evidence before moving into an [integrated case](../analytics/cases/index.md) or a [report perspective](../analytics/reports/index.md).

## Download the Teaching Files

Choose the format your assignment uses. The published SQLite, Excel, and CSV files present the same synthetic company records in different working formats.

| Format | Direct download | Best starting use |
|---|---|---|
| SQLite | <ReleaseDownloadLink type="sqlite">Download the SQLite database</ReleaseDownloadLink> | Joins, document tracing, and source-to-ledger analysis |
| Excel | <ReleaseDownloadLink type="excel">Download the Excel workbook</ReleaseDownloadLink> | Filters, PivotTables, charts, and workbook analysis |
| CSV | <ReleaseDownloadLink type="csv">Download the CSV package</ReleaseDownloadLink> | Importing individual tables into another analysis tool |

[Downloads](downloads.md) explains the package and links to setup guidance. Work from a copy and retain the published source files for comparison.

## Choose a Starting Point

| Your goal | Begin here | What you will produce |
|---|---|---|
| Understand how a sale becomes accounting evidence | [Order-to-cash exercise](../learn-and-practice/source-to-ledger.md) | A document trace and an explanation of recognition and settlement |
| Explain purchasing and liability timing | [Receipt-to-payable exercise](../learn-and-practice/receipt-to-payable.md) | A timeline separating commitment, receipt, invoice, and payment |
| Understand conversion and manufacturing cost | [Manufacturing cost-flow exercise](../learn-and-practice/manufacturing-cost-flow.md) | A work-order evidence map separating completion from close |
| Read business performance before writing queries | [Reports Hub](../analytics/reports/index.md) | A report interpretation grounded in its source and scope |
| Prepare a course or module | [Instructor Adoption Guide](../teach-with-data/instructor-guide.md) | A sequenced pathway with a defined student submission |

## One Company in a Wider Learning Environment

Charles River belongs to [Accounting Analytics Hub](https://accountinganalyticshub.com/). The [Accounting Analytics: An Integrated Approach textbook](https://aa.accountinganalyticshub.com/) supplies conceptual explanations and tool instruction; this site supplies the shared company, data, process evidence, practice, and cases.

The Hub's AIS and tool courses are planned resources. The materials linked on this site are available now; those future courses are not prerequisites.

## What to Keep in Mind

- The company and every record are synthetic. The data is designed for teaching, including intentional anomalies and control exceptions.
- A flagged row is a lead for investigation. Check its source, timing, and related records before reaching a conclusion.
- A process diagram explains the business sequence. The [Schema Reference](../reference/schema.md) identifies stored relationships; arrows in a business diagram do not automatically define a join.
- The main operating window is 2024–2026. Some supplier payments settle in early 2027, so document your date boundaries.

Continue with [Company Story](../learn-the-business/company-story.md), or open [Learn and Practice](../learn-and-practice/index.md) if you already know the business.
