---
title: "12. Turn Records into a Conclusion"
description: "Build a monthly invoice summary and turn a checked result into a bounded business conclusion."
sidebar_label: "12. Turn Records into a Conclusion"
pagination_prev: "learn-and-practice/follow-an-estimate-into-settlement"
pagination_next: "analytics/cases/index"
tutorial_number: 12
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 12. Turn Records into a Conclusion

<span id="context-and-problem"></span>

The controller asks how invoiced activity changed across the first three months of 2024. You now know why an order, shipment, invoice, and receipt cannot be used interchangeably. Define the measure first, then build a summary you can explain.

<span id="learning-objectives"></span>

**Your task.** Build a monthly invoice summary and turn a checked result into a bounded business conclusion.

<TutorialFigure figureId="turn-records-into-a-conclusion" />

## Before You Start

The recommended full route completes Lessons 1–11 in order. For a focused module, the minimum preparation is [Lesson 1](meet-the-records.md), [Lesson 2](read-an-order.md), [Lesson 3](connect-the-records.md), and [Excel setup](../analytics/excel-guide.md) or [SQL setup](../analytics/sql-guide.md). You must also be able to distinguish order, shipment, invoice, receipt, and application. [Lesson 4](source-to-ledger.md), [Lesson 5](follow-customer-settlement.md), and [Lesson 6](find-the-accounting-entries.md) teach those distinctions.

**Summary readiness:** Before proceeding, show that you can keep one row per invoice, compare row count with distinct-key count, set inclusive-start/exclusive-end date bounds, group without repeating header amounts, and trace a summary back to a source example. State one conclusion that an invoice subtotal cannot support. If these skills are missing, complete the linked sales lessons first.

<ToolSteps>
<TabItem value="excel">

Start a **new** `Lesson12.xlsx` so earlier single-invoice filters cannot carry over. Import `T16_SalesInvoice` as `InvoiceData`, converting `InvoiceDate` to Date and filtering it to **on or after 2024-01-01 and before 2024-04-01**. Keep the complete filtered header table.

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson12.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Define and Check the Population

Measure **invoiced amounts before freight, tax, and credits**, using `SalesInvoice.SubTotal`. This includes goods and services invoiced in the selected dates. It is not net revenue, cash collected, or an order total.

<ToolSteps>
<TabItem value="excel">

On Notes label B2 Invoice rows, B3 Invoiced amount, and B4 Distinct invoices. Enter:

```text title="Excel — Notes!B2"
=ROWS(InvoiceData[SalesInvoiceID])
```



```text title="Excel — Notes!B3"
=SUM(InvoiceData[SubTotal])
```



```text title="Excel — Notes!B4"
=ROWS(UNIQUE(InvoiceData[SalesInvoiceID]))
```

UNIQUE lists distinct keys, and ROWS counts them. The row count and distinct-key count should agree because this source is one row per invoice.

</TabItem>
<TabItem value="sql">

Check the population independently before grouping it. `COUNT(DISTINCT ...)` counts unique invoice identifiers.

```sql title="l12-population-check.sql"
SELECT COUNT(*) AS InvoiceRows,
       COUNT(DISTINCT SalesInvoiceID) AS DistinctInvoices,
       ROUND(SUM(SubTotal), 2) AS InvoicedAmount
FROM SalesInvoice
WHERE InvoiceDate >= '2024-01-01' AND InvoiceDate < '2024-04-01';
```


</TabItem>
</ToolSteps>

Expect **1,355 rows**, **1,355 distinct invoices**, and **5,796,664.16** invoiced amount. If your Excel result is one row, check whether an earlier Power Query filter was reused. If it is larger, check both date boundaries.

## 2. Summarize by Month

Keep the same population and change only its presentation: combine invoices sharing a month while retaining a count and amount for each month.

<ToolSteps>
<TabItem value="excel">

1. Add a MonthStart column to InvoiceData, enter the formula below, and format it as yyyy-mm:


```text title="Excel — InvoiceData[MonthStart]"
=DATE(YEAR([@InvoiceDate]),MONTH([@InvoiceDate]),1)
```


2. Click inside the table and choose **Insert → PivotTable → New Worksheet**.
3. Put `MonthStart` in **Rows**. If Excel automatically groups dates, right-click a grouped date and choose **Ungroup** because the MonthStart values already identify months.
4. Put `SalesInvoiceID` in **Values**, open **Value Field Settings**, and select **Count**.
5. Put `SubTotal` in **Values** and select **Sum**. Format amounts with two decimal places.
6. Sort months oldest to newest. Compare both grand totals with Step 1.
7. On `Notes`, put **Month** in E1 and **Invoiced amount** in F1. Copy the three monthly labels and amounts from the PivotTable into E2:F4 as values, excluding the grand total.
8. Select E1:F4, choose **Insert → Column or Bar Chart → Clustered Column**, and edit the chart title to **Invoiced amounts before freight, tax, and credits — Q1 2024**. If you later change the population, update this small chart table as well.

</TabItem>
<TabItem value="sql">

`strftime('%Y-%m', InvoiceDate)` produces a year-month label. `GROUP BY` forms one group per month, and `ORDER BY` makes the result chronological.

```sql title="l12-monthly-summary.sql"
SELECT strftime('%Y-%m', InvoiceDate) AS Month,
       COUNT(*) AS InvoiceCount,
       ROUND(SUM(SubTotal), 2) AS InvoicedAmount
FROM SalesInvoice
WHERE InvoiceDate >= '2024-01-01' AND InvoiceDate < '2024-04-01'
GROUP BY strftime('%Y-%m', InvoiceDate)
ORDER BY Month;
```


</TabItem>
</ToolSteps>

| Month | Invoice count | Invoiced amount |
|---|---:|---:|
| 2024-01 | 279 | 1,408,516.50 |
| 2024-02 | 512 | 2,170,765.25 |
| 2024-03 | 564 | 2,217,382.41 |
| **Quarter** | **1,355** | **5,796,664.16** |

Both tools should produce the same monthly values. The SQL route can present the result table as visual evidence, with a chart added if useful.

## 3. Investigate Before Explaining

February's invoiced amount exceeds January's. That observation does not establish why. Inspect a small part of February's population and propose a next comparison.

<ToolSteps>
<TabItem value="excel">

Filter the worksheet table `InvoiceData[MonthStart]` to February. Sort `SubTotal` largest to smallest, using ascending `SalesInvoiceID` to resolve ties. Inspect the first five invoice IDs, customers, dates, and subtotals. Do not reinterpret the filtered worksheet subtotal as the full-quarter total. Keep the original PivotTable as the unfiltered population summary.

</TabItem>
<TabItem value="sql">

Inspect the five largest February invoices as a selected sample. This query does not explain all of February's change.

```sql title="l12-february-sample.sql"
SELECT SalesInvoiceID, CustomerID, InvoiceDate, SubTotal
FROM SalesInvoice
WHERE InvoiceDate >= '2024-02-01' AND InvoiceDate < '2024-03-01'
ORDER BY SubTotal DESC, SalesInvoiceID
LIMIT 5;
```


</TabItem>
</ToolSteps>

The five invoice IDs, in descending amount order, are **693, 698, 696, 690, and 682**. The largest has subtotal **30,053.79**. Record at least one actual invoice identifier from the sample. A larger count of invoices is one observed difference between January and February. Investigate customer mix, service billing, credits, and timing before explaining the change.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Write a short memo with four parts: **Finding**, **Evidence and check**, **Limit**, and **Next action**. Attach the monthly table, one source example, and your reproducible workbook or SQL. State the measure in the finding itself. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

This summary excludes credits and does not establish recognized net revenue, margin, cash collection, or a cause of change. Before comparing it with [Reports and Analytics](../analytics/index.md#sales-and-customers), read the report's population and calculation. Different definitions can produce valid different totals.

For a posted comparison, read the [monthly income statement source](../analytics/analysis-tracks.md#query-financial-27-income-statement-monthly). Select January–March 2024 and its net-revenue rows in your saved results, retaining the fiscal year, period, line label, and row type. Its account-based revenue includes the effects defined in that query, while the tutorial sums invoice SubTotal. Explain credits, freight, tax exclusions, source populations, and posting cutoffs before proposing a reconciliation. Keep invoice-based and posted measures separately labeled. A difference between their totals does not by itself establish an error.

## Try One Change

Change the population to **January through March 2025**. Rebuild the population check and monthly summary before comparing the years.

<details>
<summary>Compare your reasoning</summary>

Change both boundaries to 2025-01-01 and 2025-04-01, including the Power Query source filter in Excel. Refresh the data and PivotTable. Keep the measure unchanged and report any difference as an observation until additional evidence supports an explanation. A familiar year label alone is not evidence of comparable scope.

</details>

## Readiness Check: Before an Advanced Case

Use your saved memo to demonstrate the [public method rubric](pathname:///teaching/method-rubric.md): define grain and cutoff, justify the key and match counts, tie a summary to an independent source check, distinguish recognition from settlement, and state a bounded conclusion. A correct total with duplicated headers or an unsupported causal explanation needs repair before a wider population. Confirm the chosen case’s individually linked prerequisites and keep its separate challenge work independent.

## Next Steps

You now have a repeatable method: define a question, trace records, check the result, and state a bounded conclusion. The cases ask you to choose and justify more of those steps yourself. Continue to the [Case Library](../analytics/cases/index.md).

For an optional extension, compare a clearly defined measure in [Reports and Analytics](../analytics/index.md), or adapt a related example from the [Query Library](../analytics/analysis-tracks.md). Keep its population and calculation explicit.
