---
title: "8. Follow a Purchase"
description: "Follow a receipt-matched purchase through GRNI, supplier invoicing, and a payment after year end."
sidebar_label: "8. Follow a Purchase"
pagination_prev: "learn-and-practice/follow-design-time-into-billing"
pagination_next: "learn-and-practice/manufacturing-cost-flow"
tutorial_number: 8
toc_max_heading_level: 2
slug: "/learn-and-practice/receipt-to-payable"
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 8. Follow a Purchase

<span id="context-and-problem"></span>

The operations planner requests a component for production. Receiving records its arrival, but the supplier bills later and is paid after year end. Follow one small purchased line so you can explain the changing liability without confusing it with the whole purchase order.

<span id="learning-objectives"></span>

**Your task:** Follow a receipt-matched purchase through GRNI, supplier invoicing, and a payment after year end.

<TutorialFigure figureId="receipt-to-payable" />

## Before You Start

Read [Procure-to-Pay](../processes/p2p.md) and finish the earlier document-tracing lessons. This example uses requisition **21330**, PO line **21074**, receipt line **25479**, and supplier invoice **36461**.

<ToolSteps>
<TabItem value="excel">

In `Lesson08.xlsx`, import the source tables named in each step using [the import routine](../analytics/excel-guide.md#repeat-an-import), applying the stated identifier filters before loading.

</TabItem>
<TabItem value="sql">

Open the released SQLite database in your SQL tool. Save this lesson's statements as **Lesson08.sql**. Run each supplied query separately; its filters identify the records and dates for that step.

</TabItem>
</ToolSteps>


These are actual synthetic records from release **v2027.1**, separate from the illustrative customer project in the company story. Use your assigned release when an instructor specifies another file; its results may differ.

<span id="evidence-workflow"></span>

## 1. Trace Request, Order, and Receipt

The request explains an internal need; the purchase order records a supplier commitment; the receipt records arrival. The requisition link here is stored on the purchase-order line.

<ToolSteps>
<TabItem value="excel">

Import `T32_PurchaseRequisition` as `RequestData`, filtered to `RequisitionID = 21330`; `T34_PurchaseOrderLine` as `POLineData`, filtered to `POLineID = 21074`; `T33_PurchaseOrder` as `POData`, filtered to `PurchaseOrderID = 16253`; `T36_GoodsReceiptLine` as `ReceiptLineData`, filtered to `GoodsReceiptLineID = 25479`; and `T35_GoodsReceipt` as `GoodsReceiptData`, filtered to `GoodsReceiptID = 23913`. Read the matching keys, dates, and selected line amounts. Keep the PO's header total separate from the selected line.

</TabItem>
<TabItem value="sql">

Read the purchase-origin link and receipt link separately. A join follows stored keys, not similar amounts.

```sql title="l08-purchase-origin.sql"
SELECT r.RequisitionID, r.RequestDate, pol.POLineID,
       po.PurchaseOrderID, po.OrderDate, pol.LineTotal
FROM PurchaseOrderLine AS pol
JOIN PurchaseOrder AS po ON po.PurchaseOrderID = pol.PurchaseOrderID
JOIN PurchaseRequisition AS r ON r.RequisitionID = pol.RequisitionID
WHERE pol.POLineID = 21074;
```


```sql title="l08-receipt.sql"
SELECT l.GoodsReceiptLineID, l.POLineID, r.GoodsReceiptID,
       r.ReceiptDate, l.QuantityReceived, l.ExtendedStandardCost
FROM GoodsReceiptLine AS l
JOIN GoodsReceipt AS r ON r.GoodsReceiptID = l.GoodsReceiptID
WHERE l.GoodsReceiptLineID = 25479;
```


</TabItem>
</ToolSteps>

Request and order are dated **2026-09-10**. Receipt **23913** is dated **2026-09-27**. The selected line has standard cost **8.83**. Receipt records materials inventory and goods received not invoiced (**GRNI**); the PO itself does not create that inventory posting.

## 2. Follow the Supplier Invoice and Payment

The invoice moves the received-goods obligation into accounts payable. Its tax amount explains why the eventual payment differs from the selected goods amount.

<ToolSteps>
<TabItem value="excel">

Import `T38_PurchaseInvoiceLine` as `PILineData`, filtered to `GoodsReceiptLineID = 25479`; `T37_PurchaseInvoice` as `PurchaseInvoiceData`, filtered to `PurchaseInvoiceID = 36461`; and `T39_DisbursementPayment` as `PaymentData`, filtered to the same invoice ID. Check receipt-line 25479 appears on invoice line **36861**. Record the goods amount, tax, full invoice amount, invoice date, and payment date on `Notes`.

</TabItem>
<TabItem value="sql">

First follow the receipt-to-invoice link. Then read payment as a separate population to avoid repeating an invoice total for every payment.

```sql title="l08-invoice.sql"
SELECT l.PILineID, l.GoodsReceiptLineID, l.LineTotal,
       p.PurchaseInvoiceID, p.InvoiceDate, p.SubTotal,
       p.TaxAmount, p.GrandTotal
FROM PurchaseInvoiceLine AS l
JOIN PurchaseInvoice AS p ON p.PurchaseInvoiceID = l.PurchaseInvoiceID
WHERE l.GoodsReceiptLineID = 25479
ORDER BY l.PILineID;
```


```sql title="l08-payment.sql"
SELECT DisbursementID, PurchaseInvoiceID, PaymentDate, Amount
FROM DisbursementPayment
WHERE PurchaseInvoiceID = 36461
ORDER BY PaymentDate, DisbursementID;
```


</TabItem>
</ToolSteps>

The invoice is dated **2026-11-29**: **8.83** goods + **0.13** tax = **8.96** payable. Disbursement **39645** pays **8.96** on **2027-01-08**. At **2026-12-31**, the invoice is still payable even though the file contains its later payment.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the five-event timeline from request to payment, the stored line keys, and the 8.83 + 0.13 = 8.96 check. State the liability at September 30 and December 31. Record the release, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

At September 30, the received amount belongs in GRNI; after the November invoice, it is replaced by the payable. This selected receipt line has one invoice match. Other receipts can be billed in parts. Accrued-service purchases use a different link, which you will investigate in Lesson 11.

## Try One Change

Move the reporting date from December 31, 2026 to January 8, 2027. Which event changes the payable conclusion?

<details>
<summary>Compare your reasoning</summary>

The recorded disbursement on January 8 settles the 8.96 payable. Its bank-clearing date is January 9, a further date distinction. Do not move the payment into December merely because the invoice is now marked paid.

</details>

## Next Steps

Purchases supply materials for the wider company. Next, follow a separate work order through production. Continue to [Follow Manufacturing Costs](manufacturing-cost-flow.md).
