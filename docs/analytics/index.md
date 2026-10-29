---
title: Reports and Analytics
description: Explore 25 core and 28 specialist Charles River reports, including direct cash flow and annual statements, with period comparisons and PDF, Excel, and data downloads.
slug: /analytics
sidebar_label: Reports and Analytics
---

import { ReportCatalog } from "@site/src/components/ReportCatalog";
import reportTopics from "@site/src/data/reportTopics.json";

# Reports and Analytics

Start with a question from the [company story](../learn-the-business/company-story.md) or a [business process](../learn-the-business/process-flows.md), then choose a report below. The collection starts with 25 core reports across six business topics. Select **Include specialist reports** to explore 28 additional evidence reports. Search also includes specialist reports.

Each card identifies its row grain and period basis and links to the matching process and practice lesson. **Open report** displays complete selected results with period and evidence filters, and a **View source SQL** link for tracing the calculation. Download a formatted **PDF** or **Excel** workbook matching that selection. Downloads include all selected rows, regardless of the current screen page. Expand **Interpret this report** for discussion questions and suggested analysis where available.

Time-series reports offer a selected period, a year of periods, previous-period or previous-year comparisons, and all available periods. Monthly Revenue and Gross Margin opens with a full year of monthly results. Multi-period tables identify the period of every row; rates and balances are not added across periods. Entity filters narrow one another, and controls with only one available choice are omitted.

Choose the [annual income statement](/docs/analytics/reports/annual-income-statement), [annual balance sheet](/docs/analytics/reports/annual-balance-sheet), or [annual cash flows](/docs/analytics/reports/annual-direct-cash-flow) to compare years. Annual balance sheets show fiscal year-end balances. Cash flows retain beginning and ending cash separately from annual activity. The [monthly direct cash flow](/docs/analytics/reports/monthly-direct-cash-flow) presents cash receipts and payments alongside the retained indirect-method reports.

Aging reports offer selected-date and previous-snapshot views. Each snapshot is separate, so repeated invoice balances are not added across dates. Cumulative reports keep their whole-file scope. For very large evidence selections, narrow the filters before exporting PDF; Excel retains the complete selection.

Choose **Export Data** in a report view to download its full CSV, independent of your selected period and filters.

## Start with a Guided Investigation

Choose a defined question before scanning the reference catalog. After the [foundational lessons](../learn-and-practice/index.md) and your chosen [Excel](excel-guide.md) or [SQL](sql-guide.md) setup, follow one investigation:

| Question | Guided investigation | Starting reports |
|---|---|---|
| Why does a customer still owe money? | [Resolve a Customer Account Review](cases/o2c-trace-case.md) | [AR Aging](#report-ar-aging), [Customer Deposits and Unapplied Cash Aging](#report-customer-deposits-and-unapplied-cash-aging) |
| What remains owed to suppliers at month-end? | [Explain Supplier Obligations at Month End](cases/p2p-accrual-settlement-case.md) | [Monthly AP Aging Detail](#report-monthly-ap-aging-detail) |
| How do hours become pay and obligations? | [Explain Staffing, Overtime, and Payroll Cost](cases/workforce-coverage-and-attendance-case.md) | [Punch to Pay Bridge](#report-punch-to-pay-bridge-for-hourly-workers), [Payroll Liability Rollforward](#report-payroll-liability-rollforward) |
| How do profit, cash, and close connect? | [Explain Profit, Cash, and the Year-End Close](cases/financial-statement-bridge-case.md) | [Monthly Income Statement](#report-monthly-income-statement), [Monthly Indirect Cash Flow](#report-monthly-indirect-cash-flow) |

Each case lists its own preparation, evidence workflow, deliverable, and limits. The [guided query paths](analysis-tracks.md#guided-query-paths) provide shorter statement and fixed-asset query sequences.

## Browse Reports

<ReportCatalog topics={reportTopics} />

Search and topic selections are kept in the page URL, so you can share a filtered classroom view and recover it with Back or Forward. A direct report link reveals its destination if a filter would hide it.

## Build Your Own Analysis

| Your next task | Resource |
|---|---|
| Trace a business event before reading a summary | [Learn and Practice](../learn-and-practice/index.md) |
| Reproduce a result from source records | [SQL Guide](sql-guide.md), [Excel Guide](excel-guide.md), and the [Query Library](analysis-tracks.md) |
| Develop a supported recommendation | [Cases](cases/index.md), with defined evidence and assessed outputs |
| Obtain the assigned source dataset | [Downloads](../start-here/downloads.md) |

The [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) develops the concepts behind this work. Keep the business question, accounting explanation, and limits of the evidence together in your interpretation.
