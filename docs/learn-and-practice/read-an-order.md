---
title: "2. Read an Order"
description: "Distinguish one sales order from its two lines and check the amount without counting the header twice."
sidebar_label: "2. Read an Order"
pagination_prev: "learn-and-practice/meet-the-records"
pagination_next: "learn-and-practice/connect-the-records"
tutorial_number: 2
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 2. Read an Order

<span id="context-and-problem"></span>

The sales coordinator opens order **SO-2024-000011**. The order has a total, but its individual products live on separate lines. Your first reconciliation is to explain how those two views fit together.

<span id="learning-objectives"></span>

**Your task.** Distinguish one sales order from its two lines and check the amount without counting the header twice.

<TutorialFigure figureId="read-an-order" />

## Before You Start

Finish [Meet the Records](meet-the-records.md).

<ToolSteps>
<TabItem value="excel">

Create a fresh Excel analysis workbook, `Lesson02.xlsx`. Import `T9_SalesOrder` as `SalesOrderData` and `T10_SalesOrderLine` as `OrderLineData`, using the [repeat-an-import steps](../analytics/excel-guide.md#repeat-an-import). SQL uses `SalesOrder` and `SalesOrderLine`, while the published workbook uses the Excel Table names above.

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson02.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Read the Order Header

The header carries information shared by the whole order, including its customer and order date.

<ToolSteps>
<TabItem value="excel">

Filter `SalesOrderData[SalesOrderID]` to **11**. On a `Notes` sheet, copy the values of `OrderNumber`, `OrderDate`, `CustomerID`, and `OrderTotal`. Keep them together as **one order**.

</TabItem>
<TabItem value="sql">

Run this independently of the line query below.

```sql title="l02-order.sql"
SELECT SalesOrderID, OrderNumber, OrderDate, CustomerID, OrderTotal
FROM SalesOrder
WHERE SalesOrderID = 11;
```


</TabItem>
</ToolSteps>

The header identifies customer **130**, date **2024-01-24**, and order total **11,397.78**.

## 2. Read the Lines

A line identifies part of an order. The same `SalesOrderID` can therefore appear on several lines without creating several orders.

<ToolSteps>
<TabItem value="excel">

1. Filter `OrderLineData[SalesOrderID]` to **11**.
2. Sort `LineNumber` smallest to largest.
3. Read `SalesOrderLineID`, `LineNumber`, and `LineTotal`.
4. In `Notes!B2`, count visible order lines:


```text title="Excel — Notes!B2"
=SUBTOTAL(103,OrderLineData[SalesOrderLineID])
```

5. In `Notes!B3`, total visible line amounts and format to two decimal places:


```text title="Excel — Notes!B3"
=SUBTOTAL(109,OrderLineData[LineTotal])
```



`103` counts visible nonblank identifiers, while `109` sums visible amounts. An ordinary `SUM` still includes filtered-out rows, so it would answer a different question here.

</TabItem>
<TabItem value="sql">

Inspect the rows first, then run the second query to count and total that same population. `COUNT(*)` counts rows, `SUM(LineTotal)` adds their amounts, and `ROUND(..., 2)` displays the result to two decimal places. `AS` gives each result column a readable label.

```sql title="l02-lines.sql"
SELECT SalesOrderLineID, LineNumber, LineTotal
FROM SalesOrderLine
WHERE SalesOrderID = 11
ORDER BY LineNumber;
```


```sql title="l02-line-check.sql"
SELECT COUNT(*) AS OrderLines, ROUND(SUM(LineTotal), 2) AS LineAmount
FROM SalesOrderLine
WHERE SalesOrderID = 11;
```


</TabItem>
</ToolSteps>

| Line ID | Line number | Line amount |
|---|---:|---:|
| 42 | 1 | 3,552.21 |
| 43 | 2 | 7,845.57 |

Your check should return **2 lines** and **11,397.78**, agreeing with the header. These order-line amounts are separate from freight and tax on a later invoice.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the single header, two line identifiers, visible-line count, and line-total check. Explain why two lines do not mean two orders. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

If you later display the header total alongside both lines, adding those repeated header values would double the order amount. A matching total checks this selected order without establishing fulfillment or collection.

## Try One Change

Filter the lines to `LineNumber = 2` as well as `SalesOrderID = 11`. Predict the visible count and sum before calculating them.

<details>
<summary>Compare your reasoning</summary>

The result is one line, ID 43, with 7,845.57. It is a valid subtotal for the second line, not the total for the whole order. In SQL add `AND LineNumber = 2` to the line-check query. In Excel keep both filters active.

</details>

## Next Steps

The keys are now familiar. Next, use them to bring customer and product descriptions into the result. Continue to [Connect the Records](connect-the-records.md).
