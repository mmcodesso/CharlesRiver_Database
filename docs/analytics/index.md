---
title: Reports and Analytics
description: Browse all 48 Charles River reports by business topic, preview results, download Excel or CSV files, and connect findings to SQL and teaching cases.
slug: /analytics
sidebar_label: Reports and Analytics
---

import { ReportCatalog } from "@site/src/components/ReportCatalog";
import reportTopics from "@site/src/data/reportTopics.json";

# Reports and Analytics

Start with a question from the [company story](../learn-the-business/company-story.md) or a [business process](../learn-the-business/process-flows.md), then choose a report below. Reports are grouped by the part of the business you are investigating, with previews and Excel or CSV downloads together in each card.

Each card identifies its row grain and period basis, links to the matching process and practice lesson, and opens the exact **View source SQL** destination in the existing Query Library. Check these before interpreting a result. Previews show a limited number of rows; downloads contain the full report. Expand **Interpret this report** for discussion questions and suggested analysis where available.

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
