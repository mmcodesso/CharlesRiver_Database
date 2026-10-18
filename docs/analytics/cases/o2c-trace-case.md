---
title: "1. Resolve a Customer Account Review"
description: "What can we tell the customer about delivery, billing, and the amount still unsettled?"
sidebar_label: "1. Resolve a Customer Account Review"
pagination_prev: "analytics/cases/index"
pagination_next: "analytics/cases/design-services-performance-case"
case_number: 1
case_level: Basic
case_sessions: 2
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import CaseFigure from "@site/src/components/Cases/Figure";
import CaseMethods from "@site/src/components/Cases/Methods";
import { CaseOverview } from "@site/src/components/CaseExplorer";
import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# 1. Resolve a Customer Account Review

<span id="business-scenario"></span>
<span id="the-problem-to-solve"></span>
<span id="learning-objectives"></span>

The sales coordinator is preparing a response to a design-trade customer. The warehouse has delivery information, treasury can see money received, and the controller wants the response to explain which invoices that money settles. You have been asked to assemble one account review that all three teams can use. Begin by predicting whether an undelivered order, an unpaid invoice, and unapplied cash would require the same follow-up.

<CaseOverview slug="o2c-trace-case" />

**Worked scope.** Customer 120, Hubbard Inc: the six orders placed from January 1 through March 31, 2024. Compare March 31 and April 30. This selection excludes other orders and is not the customer’s complete account history.

The management request is an illustrative company scenario. The worked records are actual synthetic records from release **v2027.1**, separate from the fictional furnishing project. Your assigned release may differ. Complete either tool route; your Excel/SQL choice follows you between lessons and cases.

**Preparation:** 1–6: records, goods sales, settlement, and ledger entries. Revisit [the relevant tutorial](../../learn-and-practice/source-to-ledger.md) and the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) if needed.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| Customer | T4_Customer | CustomerData |
| SalesOrder | T9_SalesOrder | SalesOrderData |
| SalesOrderLine | T10_SalesOrderLine | SalesOrderLineData |
| Shipment | T14_Shipment | ShipmentData |
| ShipmentLine | T15_ShipmentLine | ShipmentLineData |
| SalesInvoice | T16_SalesInvoice | SalesInvoiceData |
| SalesInvoiceLine | T17_SalesInvoiceLine | SalesInvoiceLineData |
| CashReceipt | T19_CashReceipt | CashReceiptData |
| CashReceiptApplication | T20_CashReceiptApplication | CashReceiptApplicationData |
| CreditMemo | T23_CreditMemo | CreditMemoData |
| GLEntry | T3_GLEntry | GLEntryData |
| Account | T1_Account | AccountData |

<CaseMethods />

<span id="step-1-define-the-order-population-and-document-chain"></span>
<span id="step-2-understand-fulfillment-lag-and-backorder-pressure"></span>
<span id="step-3-connect-shipment-and-invoice-events-to-accounting-impact"></span>

## Session 1 — Establish what was delivered and billed

Save a separate Case01.xlsx or Case01.sql. Keep a Review sheet or text note for the scope, decisions, and evidence. The order date selects the cohort; shipment and invoice dates determine what had happened by the review date.

<CaseFigure figureId="case01-handoffs" />


### 1.1. Define the order population

**Predict before you run:** Predict the number of rows when six orders have several lines.

<ToolSteps>
<TabItem value="excel">

1. Import `T9_SalesOrder` → `SalesOrderData`, `T10_SalesOrderLine` → `SalesOrderLineData`.

2. In Power Query filter SalesOrderData to CustomerID 120 and OrderDate on or after January 1 and before April 1, 2024.

3. Keep the six IDs.

4. Merge SalesOrderLineData with that filtered query on SalesOrderID using an Inner join; expand OrderDate only.

5. Name the result OrderLines and load it.

6. Insert a PivotTable: Rows = SalesOrderID and OrderDate; Values = Count of SalesOrderLineID and Sum of LineTotal.

7. Set Count explicitly; the default sum of an identifier is meaningless.

</TabItem>
<TabItem value="sql">

GROUP BY produces one result per order and date. COUNT counts line identifiers; SUM totals their amounts. The inner SELECT defines the fixed order population. ORDER BY makes the result repeatable.

Run each complete statement separately and retain its result before continuing.
```sql title="c01-orders.sql"
SELECT o.SalesOrderID,
       o.OrderDate,
       COUNT(l.SalesOrderLineID) AS Lines,
       ROUND(SUM(l.LineTotal),2) AS OrderedLines
FROM SalesOrder o
JOIN SalesOrderLine l ON l.SalesOrderID=o.SalesOrderID
WHERE o.SalesOrderID IN (SELECT SalesOrderID
FROM SalesOrder
WHERE CustomerID=120 AND OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01')
GROUP BY o.SalesOrderID,o.OrderDate
ORDER BY o.OrderDate,o.SalesOrderID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Six orders, 22 lines. Order 29 has five lines totaling 20,969.46. The other orders are 75, 236, 185, 434, and 388.

An order header answers who and when; its lines describe separate goods. Keep the order total out of a line-level sum.

<details>
<summary>If your result differs</summary>

If the count is larger, check the customer and order-date filter before changing any join.

</details>

**Keep for the next stage:** Save OrderLines and the six-row order summary.

### 1.2. Compare ordered, shipped, and billed quantities

**Predict before you run:** Which difference would require operations to act, and which would require billing to act?

<ToolSteps>
<TabItem value="excel">

1. Import Shipment and ShipmentLine.

2. Merge ShipmentLineData to ShipmentData on ShipmentID; expand ShipmentDate.

3. Filter ShipmentDate through March 31.

4. Group by SalesOrderLineID, Sum QuantityShipped into a column named Shipped, name the query Shipped.

5. Separately merge SalesInvoiceLineData to SalesInvoiceData on SalesInvoiceID, expand InvoiceDate, filter through March 31, then group by SalesOrderLineID, Sum Quantity into a column named Billed, name the query Billed.

6. Merge each summary to OrderLines using a Left outer join on SalesOrderLineID.

7. Expand the two totals and replace unmatched numeric nulls with 0 after checking that they mean no event.

8. Load as Fulfillment.

9. Add OrderedLessShipped to Fulfillment and enter:

    ~~~text title="Excel — Fulfillment[OrderedLessShipped]"
    =ROUND([@Quantity]-[@Shipped],2)
    ~~~

10. Add ShippedLessBilled and enter:

    ~~~text title="Excel — Fulfillment[ShippedLessBilled]"
    =ROUND([@Shipped]-[@Billed],2)
    ~~~

</TabItem>
<TabItem value="sql">

WITH names two temporary results inside this statement: shipped and billed. Each is first summed by SalesOrderLineID. The final LEFT JOIN retains every selected order line, and COALESCE shows zero when no dated event exists. This avoids multiplying shipment and invoice detail against each other.

Run each complete statement separately and retain its result before continuing.
```sql title="c01-fulfillment.sql"
WITH shipped AS (SELECT sl.SalesOrderLineID,
       SUM(sl.QuantityShipped) AS Shipped
FROM ShipmentLine sl
JOIN Shipment s ON s.ShipmentID=sl.ShipmentID
WHERE s.ShipmentDate<='2024-03-31'
GROUP BY sl.SalesOrderLineID), billed AS (SELECT il.SalesOrderLineID,
       SUM(il.Quantity) AS Billed
FROM SalesInvoiceLine il
JOIN SalesInvoice i ON i.SalesInvoiceID=il.SalesInvoiceID
WHERE i.InvoiceDate<='2024-03-31'
GROUP BY il.SalesOrderLineID) SELECT l.SalesOrderID,
       l.SalesOrderLineID,
       l.Quantity AS Ordered,
       COALESCE(s.Shipped,0) AS Shipped,
       COALESCE(b.Billed,0) AS Billed
FROM SalesOrderLine l
LEFT JOIN shipped s ON s.SalesOrderLineID=l.SalesOrderLineID
LEFT JOIN billed b ON b.SalesOrderLineID=l.SalesOrderLineID
WHERE l.SalesOrderID IN (SELECT SalesOrderID
FROM SalesOrder
WHERE CustomerID=120 AND OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01')
ORDER BY l.SalesOrderID,l.LineNumber;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 22 rows remain. Lines 924, 1515, and 1694 have ordered quantities exceeding shipments by 0.63, 3.67, and 1.63 respectively. Every line’s shipped quantity equals its billed quantity at this cutoff.

The selected evidence points to incomplete fulfillment on three lines. It does not establish missing billing for goods already shipped. Those are different conclusions.

<details>
<summary>If your result differs</summary>

More than 22 rows means a detail table was joined before summarizing. A tiny floating-point difference is not an unbilled quantity.

</details>

**Keep for the next stage:** Save Fulfillment and identify the three lines for an operations follow-up.

### 1.3. Keep invoices at their own grain

**Predict before you run:** Will the number of invoices equal the number of orders?

<ToolSteps>
<TabItem value="excel">

1. Import SalesInvoiceData and Inner merge to the six-order query on SalesOrderID.

2. Keep SalesInvoiceID, SalesOrderID, InvoiceDate, and GrandTotal.

3. Sort by InvoiceDate and SalesInvoiceID; load as Invoices.

4. Keep all related invoice dates for now so the second session can reconstruct both cutoffs.

5. On Review, label B4 Visible invoices and enter:

    ~~~text title="Excel — Review!B4"
    =SUBTOTAL(103,Invoices[SalesInvoiceID])
    ~~~

6. Label B5 Visible invoice amount and enter:

    ~~~text title="Excel — Review!B5"
    =SUBTOTAL(109,Invoices[GrandTotal])
    ~~~

</TabItem>
<TabItem value="sql">

This result has one invoice header per row. The order subquery selects the cohort, but invoice dates remain unrestricted so both reporting cutoffs can be reconstructed later.

Run each complete statement separately and retain its result before continuing.
```sql title="c01-invoices.sql"
SELECT SalesInvoiceID,
       SalesOrderID,
       InvoiceDate,
       GrandTotal
FROM SalesInvoice
WHERE SalesOrderID IN (SELECT SalesOrderID
FROM SalesOrder
WHERE CustomerID=120 AND OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01')
ORDER BY InvoiceDate,SalesInvoiceID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 20 related invoices in released history; 17 are dated through March 31. Do not add freight and tax again: GrandTotal already includes them.

An order can be invoiced in parts. The April invoices belong in the later review, even though the orders were placed in the first quarter.

<details>
<summary>If your result differs</summary>

Ordinary SUM includes hidden rows. Use SUBTOTAL for filtered totals or a date-conditioned SUMIFS.

</details>

**Keep for the next stage:** Save Invoices and pause. Write one sentence distinguishing cohort selection from event cutoff.

:::tip Session stopping point
You should have six orders, 22 line comparisons, and 20 invoice headers. Keep the three incomplete-fulfillment lines separate from the receivables question.
:::

<span id="step-4-separate-cash-receipt-from-invoice-settlement"></span>
<span id="step-5-extend-the-trace-into-exception-follow-up"></span>

## Session 2 — Reconstruct settlement and prepare the response

Receiving money and applying it to an invoice are separate events. Start from the invoice population, then summarize applications and credits independently.

<CaseFigure figureId="case01-relationships" />


### 2.1. Read cash and credit evidence

**Predict before you run:** Predict whether adding receipt amounts down the application table would overstate this population’s settlement.

<ToolSteps>
<TabItem value="excel">

1. Import CashReceiptApplicationData and Inner merge with Invoices on SalesInvoiceID; load as Applications.

2. Import CashReceiptData as Receipts and add ReceiptDate to Applications:

    ~~~text title="Excel — Applications[ReceiptDate]"
    =XLOOKUP([@CashReceiptID],Receipts[CashReceiptID],Receipts[ReceiptDate],"No match",0)
    ~~~

3. Format ReceiptDate as a date and investigate any No match result.

4. Add ReceiptAmount:

    ~~~text title="Excel — Applications[ReceiptAmount]"
    =XLOOKUP([@CashReceiptID],Receipts[CashReceiptID],Receipts[Amount],"No match",0)
    ~~~

5. Do not total that repeated receipt amount.

6. Import CreditMemoData.

7. Filter the six SalesOrderIDs and, separately, the 20 OriginalSalesInvoiceIDs; union the selections and remove duplicates by CreditMemoID in Power Query.

8. Load as Credits.

9. Inspect OriginalSalesInvoiceID before allocating a credit.

</TabItem>
<TabItem value="sql">

Each result is one application. ReceiptAmount repeats when one receipt funds several applications. Sum AppliedAmount for invoice settlement; use distinct receipt IDs when describing received cash.

Run each complete statement separately and retain its result before continuing.
```sql title="c01-applications.sql"
SELECT a.SalesInvoiceID,
       a.CashReceiptApplicationID,
       a.ApplicationDate,
       a.AppliedAmount,
       r.CashReceiptID,
       r.ReceiptDate,
       r.Amount AS ReceiptAmount
FROM CashReceiptApplication a
JOIN CashReceipt r ON r.CashReceiptID=a.CashReceiptID
WHERE a.SalesInvoiceID IN (SELECT SalesInvoiceID
FROM SalesInvoice
WHERE SalesOrderID IN (SELECT SalesOrderID
FROM SalesOrder
WHERE CustomerID=120 AND OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01'))
ORDER BY a.ApplicationDate,a.CashReceiptApplicationID;
```


```sql title="c01-credits.sql"
SELECT CreditMemoID,
       CreditMemoDate,
       SalesOrderID,
       OriginalSalesInvoiceID,
       GrandTotal
FROM CreditMemo
WHERE SalesOrderID IN (SELECT SalesOrderID
FROM SalesOrder
WHERE CustomerID=120 AND OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01') OR OriginalSalesInvoiceID IN (SELECT SalesInvoiceID
FROM SalesInvoice
WHERE SalesOrderID IN (SELECT SalesOrderID
FROM SalesOrder
WHERE CustomerID=120 AND OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01'))
ORDER BY CreditMemoDate,CreditMemoID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 24 applications across released history. Credit memo 30 is dated April 26 and credits invoice 1086 by 612.38. Receipt 165 appears on several application rows; its 18,938.14 must be counted only once when describing the receipt.

This credit changes the April explanation. It is subsequent evidence, not a reduction that was already recorded on March 31.

<details>
<summary>If your result differs</summary>

A credit found by order only needs further allocation evidence. Do not force it onto the first invoice. This worked credit has an explicit invoice link.

</details>

**Keep for the next stage:** Save Applications, Credits, and the dates of the receipt/application handoffs.

### 2.2. Build the two-date settlement schedule

**Predict before you run:** Will the later balance fall only because of cash, or can new invoices and credits change it too?

<ToolSteps>
<TabItem value="excel">

1. Set the table names to Invoices, Applications, and Credits exactly.

2. On Review label B2 Reporting date and enter:

    ~~~text title="Excel — Review!B2 — first cutoff"
    =DATE(2024,3,31)
    ~~~

3. In Invoices add Applied:

    ~~~text title="Excel — Invoices[Applied]"
    =SUMIFS(Applications[AppliedAmount],Applications[SalesInvoiceID],[@SalesInvoiceID],Applications[ApplicationDate],"<="&Review!$B$2)
    ~~~

4. Add Credited:

    ~~~text title="Excel — Invoices[Credited]"
    =SUMIFS(Credits[GrandTotal],Credits[OriginalSalesInvoiceID],[@SalesInvoiceID],Credits[CreditMemoDate],"<="&Review!$B$2)
    ~~~

5. Add Remaining:

    ~~~text title="Excel — Invoices[Remaining]"
    =ROUND([@GrandTotal]-[@Applied]-[@Credited],2)
    ~~~

6. Filter InvoiceDate through the date in Review!B2.

7. Label Review!B6 Visible remaining balance and enter:

    ~~~text title="Excel — Review!B6"
    =SUBTOTAL(109,Invoices[Remaining])
    ~~~

8. Save a values-only snapshot of the visible rows with its cutoff label.

9. Replace Review!B2 with the second date, update the InvoiceDate filter, and repeat:

    ~~~text title="Excel — Review!B2 — second cutoff"
    =DATE(2024,4,30)
    ~~~

10. Keep the formulas in the working table for refresh.

11. Copy only visible cells when retaining a filtered snapshot; alternatively filter the query before loading each dated view.

</TabItem>
<TabItem value="sql">

The cutoffs result contains the two review dates. CROSS JOIN pairs each date with each selected invoice, and the invoice-date condition excludes bills not yet issued. Each correlated SUM reads only applications or credits for that invoice through that date. Summarize the resulting rows separately by AsOf.

Run each complete statement separately and retain its result before continuing.
```sql title="c01-balances.sql"
WITH cutoffs(AsOf) AS (VALUES('2024-03-31'),('2024-04-30')) SELECT d.AsOf,
       i.SalesInvoiceID,
       i.GrandTotal,
       ROUND(COALESCE((SELECT SUM(a.AppliedAmount)
FROM CashReceiptApplication a
WHERE a.SalesInvoiceID=i.SalesInvoiceID AND a.ApplicationDate<=d.AsOf),0),2) AS Applied,
       ROUND(COALESCE((SELECT SUM(c.GrandTotal)
FROM CreditMemo c
WHERE c.OriginalSalesInvoiceID=i.SalesInvoiceID AND c.CreditMemoDate<=d.AsOf),0),2) AS Credited,
       ROUND(i.GrandTotal-COALESCE((SELECT SUM(a.AppliedAmount)
FROM CashReceiptApplication a
WHERE a.SalesInvoiceID=i.SalesInvoiceID AND a.ApplicationDate<=d.AsOf),0)-COALESCE((SELECT SUM(c.GrandTotal)
FROM CreditMemo c
WHERE c.OriginalSalesInvoiceID=i.SalesInvoiceID AND c.CreditMemoDate<=d.AsOf),0),2) AS Remaining
FROM cutoffs d CROSS
JOIN SalesInvoice i
WHERE i.SalesOrderID IN (SELECT SalesOrderID
FROM SalesOrder
WHERE CustomerID=120 AND OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01') AND i.InvoiceDate<=d.AsOf
ORDER BY d.AsOf,i.SalesInvoiceID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** March 31: 17 invoices, 72,676.21 billed, 44,067.35 applied, zero credits, and 28,608.86 remaining. April 30: 20 invoices, 75,742.57 billed, 67,836.87 applied, 612.38 credited, and 7,293.32 remaining.

The balance fell by 21,315.54 while new invoices added 3,066.36. A statement that “cash collected equals the fall in receivables” would miss both new billing and the credit.

<details>
<summary>If your result differs</summary>

Check application dates, not just receipt dates. A final Paid status cannot reconstruct an earlier balance.

</details>

**Keep for the next stage:** Save the two schedules and a change bridge: new invoices less additional applications less new credits.

### 2.3. Check accounting and assign the response

**Predict before you run:** Which event reduces receivables: cash receipt or cash application?

<ToolSteps>
<TabItem value="excel">

1. Import GLEntryData with filters in Power Query before loading: SourceDocumentType/SourceDocumentID pairs SalesInvoice/68, CashReceipt/43, CashReceiptApplication/47, CreditMemo/30.

2. Use four filtered references and Append as new; do not filter all four IDs without their document types.

3. Merge AccountData on AccountID.

4. Load the 10 rows as SelectedLedger.

5. Insert a PivotTable with VoucherNumber in Rows and sums of Debit and Credit in Values.

6. Check each complete voucher balances.

</TabItem>
<TabItem value="sql">

Keep each SourceDocumentType/SourceDocumentID pair together. The same numeric ID can occur in unrelated source tables. Joining Account adds names without changing the posting grain.

Run each complete statement separately and retain its result before continuing.
```sql title="c01-ledger.sql"
SELECT g.PostingDate,
       g.SourceDocumentType,
       g.SourceDocumentID,
       g.VoucherNumber,
       a.AccountNumber,
       a.AccountName,
       g.Debit,
       g.Credit
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
WHERE (g.SourceDocumentType='SalesInvoice' AND g.SourceDocumentID=68) OR (g.SourceDocumentType='CashReceipt' AND g.SourceDocumentID=43) OR (g.SourceDocumentType='CashReceiptApplication' AND g.SourceDocumentID=47) OR (g.SourceDocumentType='CreditMemo' AND g.SourceDocumentID=30)
ORDER BY g.PostingDate,g.VoucherNumber,g.GLEntryID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 10 posting rows in four balanced vouchers. Receipt 43 debits cash and credits customer deposits by 1,413.08. Application 47 moves that amount from deposits to receivables two days later.

A supported response distinguishes operations follow-up from accounting follow-up. Explain the 7,293.32 selected balance at April 30, acknowledge credit 30, and ask operations to confirm the three earlier fulfillment gaps against later shipments before promising delivery.

<details>
<summary>If your result differs</summary>

Filtering to the AR account alone makes a voucher appear unbalanced. Restore all lines of each selected event.

</details>

**Keep for the next stage:** Retain the voucher check and write a 200–300 word customer response with one named role responsible for each next action.

:::tip Session stopping point
Save the two cutoff schedules, the event-to-accounting check, and your response. Another reader should be able to reproduce every amount from the six-order scope.
:::

<CaseFigure figureId="case01-timeline" />

<span id="required-student-output"></span>
<span id="wrap-up-questions"></span>
<span id="limitations-and-judgment"></span>

## Prepare the Decision

The worked result supports a focused customer-account response, not an assertion about every balance Hubbard Inc has ever held. Operations owns the quantity question; customer accounting owns allocation and credit confirmation; treasury supplies receipt evidence. A plausible next action is to confirm the later fulfillment position and contact the customer about the remaining selected invoices with the two-date schedule attached.

**Deliverable:** A document timeline, two-date invoice settlement schedule, and a customer response with an action owner. Include the release, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A chart is optional in the SQL route; a clearly ordered result table can support the same conclusion.

## Independent Challenge

Select customer 120’s orders dated April 1–June 30, 2024. Reconstruct June 30 and July 31. Retain the cohort, invoice schedule, applications, credits, and one complete voucher. Explain whether the same action priorities still make sense.

<details>
<summary>Planning hint</summary>

Change the order-cohort dates separately from the event cutoffs. Rebuild the invoice list rather than reusing the worked case’s 20 IDs. A valid result can have no credits or no remaining balance.

</details>

**Assessment criteria:** Assess correct population, separate event dates, no repeated receipt totals, complete voucher checks, and an action justified by the observed evidence. Your instructor evaluates the method, evidence, and reasoning; there is no public model answer for this challenge.

<details>
<summary>Further queries and earlier case topics</summary>

<span id="optional-excel-follow-through"></span>

## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. They are optional references; both guided routes above are complete without them. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["o2c-trace-case"]} helperText="Choose a reference after completing the guided investigation; verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Review Design Work and Billing](design-services-performance-case.md). Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
