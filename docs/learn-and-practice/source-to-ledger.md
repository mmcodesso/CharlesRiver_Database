---
title: "4. Follow a Goods Sale"
description: "Trace a released goods line from order to shipment and invoice with Excel or simple SQL."
sidebar_label: "4. Follow a Goods Sale"
pagination_prev: "learn-and-practice/connect-the-records"
pagination_next: "learn-and-practice/follow-customer-settlement"
tutorial_number: 4
toc_max_heading_level: 2
slug: "/learn-and-practice/source-to-ledger"
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 4. Follow a Goods Sale

<span id="context-and-problem"></span>

The operations planner can identify the ordered products. Customer accounting now needs to know which goods were shipped and billed. Follow order line **43**, rather than assuming that an order status proves each downstream event.

<span id="learning-objectives"></span>

**Your task.** Trace a released goods line from order to shipment and invoice with Excel or simple SQL.

<TutorialFigure figureId="source-to-ledger" />

## Before You Start

Finish [Connect the Records](connect-the-records.md) and recall the [Order-to-Cash process](../processes/o2c.md).

<ToolSteps>
<TabItem value="excel">

In `Lesson04.xlsx`, import the following tables with `SalesOrderLineID = 43` as the Power Query filter. Retain the identifier columns.

| Published table | Working name |
|---|---|
| `T10_SalesOrderLine` | `OrderLineData` |
| `T15_ShipmentLine` | `ShipmentLineData` |
| `T17_SalesInvoiceLine` | `InvoiceLineData` |

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson04.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Follow the Shipment Link

The shipment line stores the order-line key. This is the link between what was requested and what left the warehouse.

<ToolSteps>
<TabItem value="excel">

1. Open the `OrderLineData` query in Power Query. Choose **Home → Merge Queries → Merge Queries as New**.
2. Choose `ShipmentLineData` as the second query. Select `SalesOrderLineID` in each preview.
3. Choose **Left Outer** so the order line would remain visible even without a shipment. Select **OK**.
4. Expand the resulting table column, clear **Use original column name as prefix**, and retain `ShipmentLineID`, `ShipmentID`, and `QuantityShipped`. Name the new query `GoodsTrace`.
5. Confirm one row before adding another relationship. An order line with two shipments would legitimately produce two rows.

</TabItem>
<TabItem value="sql">

The left join retains the chosen order line. A missing shipment would appear as `NULL` in the shipment columns without establishing that the order was erroneous.

```sql title="l04-shipment-link.sql"
SELECT sol.SalesOrderLineID, sol.Quantity AS OrderedQuantity,
       sl.ShipmentLineID, sl.ShipmentID, sl.QuantityShipped
FROM SalesOrderLine AS sol
LEFT JOIN ShipmentLine AS sl
    ON sl.SalesOrderLineID = sol.SalesOrderLineID
WHERE sol.SalesOrderLineID = 43
ORDER BY sl.ShipmentLineID;
```


</TabItem>
</ToolSteps>

Expect **one row**: order line **43**, ordered quantity **9**, shipment line **347**, shipment **87**, and shipped quantity **9**.

## 2. Follow the Invoice Link

The invoice line identifies the shipment line it bills. Match that precise line rather than matching an entire order to every invoice.

<ToolSteps>
<TabItem value="excel">

In Power Query, merge `GoodsTrace` with `InvoiceLineData`: select `ShipmentLineID` in both previews, choose **Left Outer**, then expand (with **Use original column name as prefix** cleared) `SalesInvoiceLineID`, `SalesInvoiceID`, `Quantity`, and `LineTotal`. Keep a clear name such as `InvoicedQuantity` for the invoice quantity. Close & Load the result. Expect one row. Do not remove duplicates to force a preferred count.

</TabItem>
<TabItem value="sql">

This query starts at the shipment line you just found. The first query establishes its originating order line.

```sql title="l04-invoice-link.sql"
SELECT sl.ShipmentLineID, sl.QuantityShipped,
       sil.SalesInvoiceLineID, sil.SalesInvoiceID,
       sil.Quantity AS InvoicedQuantity, sil.LineTotal
FROM ShipmentLine AS sl
LEFT JOIN SalesInvoiceLine AS sil
    ON sil.ShipmentLineID = sl.ShipmentLineID
WHERE sl.ShipmentLineID = 347
ORDER BY sil.SalesInvoiceLineID;
```


</TabItem>
</ToolSteps>

The invoice link is line **272** on invoice **202**, with quantity **9** and line amount **7,845.57**. This amount describes one line, not the entire invoice.

## 3. Put Dates and Totals Beside the Trace

The document headers supply dates and totals shared by their lines. Read them separately before comparing events.

<ToolSteps>
<TabItem value="excel">

Import `T14_Shipment` as `ShipmentData`, filtered to `ShipmentID = 87`, and `T16_SalesInvoice` as `InvoiceData`, filtered to `SalesInvoiceID = 202`. Read the shipment and invoice dates. On `Notes`, record invoice `SubTotal`, `FreightAmount`, `TaxAmount`, and `GrandTotal`. Add the first three amounts and compare their sum with the fourth.

</TabItem>
<TabItem value="sql">

Run each header query separately. Neither needs to repeat the invoice total alongside every line.

```sql title="l04-shipment-date.sql"
SELECT ShipmentID, ShipmentDate, DeliveryDate
FROM Shipment
WHERE ShipmentID = 87;
```


```sql title="l04-invoice-total.sql"
SELECT SalesInvoiceID, InvoiceDate, SubTotal, FreightAmount,
       TaxAmount, GrandTotal
FROM SalesInvoice
WHERE SalesInvoiceID = 202;
```


</TabItem>
</ToolSteps>

Shipment and invoice are dated **2024-01-31**. Invoice 202 includes **both** order lines: 11,397.78 subtotal + 103.00 freight + 747.55 tax = **12,248.33**. Do not compare one line's 7,845.57 directly with this full invoice total.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the trace 43 → 347 → 272, its document IDs and dates, and the separate invoice-total check. Explain the purpose of each document. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

This trace supports shipment and billing of the selected line. It does not establish customer settlement. A missing downstream row needs investigation of timing and process branch before a conclusion about failure.

## Try One Change

Follow order line **42** using the same method. Change the shipment-line filter in the second query to the identifier you actually find.

<details>
<summary>Compare your reasoning</summary>

Order line 42 leads to shipment line 346 and invoice line 271. It shares shipment 87 and invoice 202 with line 43. The line amount is 3,552.21. Shared headers must still be counted once.

</details>

## Next Steps

The invoice creates a customer balance. Next, distinguish receiving cash from allocating it to that balance. Continue to [Follow Customer Settlement](follow-customer-settlement.md).
