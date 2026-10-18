---
title: "3. Explain Supplier Obligations at Month End"
description: "Which selected obligations are uninvoiced receipts, supplier payables, or remaining estimates?"
sidebar_label: "3. Explain Supplier Obligations at Month End"
pagination_prev: "analytics/cases/design-services-performance-case"
pagination_next: "analytics/cases/product-portfolio-profitability-case"
case_number: 3
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

# 3. Explain Supplier Obligations at Month End

<span id="business-scenario"></span>
<span id="the-problem-to-solve"></span>
<span id="learning-objectives"></span>

Accounts payable and the controller are reviewing quarter-end obligations. Receiving knows what arrived, AP knows which bills were received, and the controller has expense estimates awaiting later evidence. You will prepare two schedules and explain how each changes through June. Predict whether a later payment changes the liability that existed on March 31.

<CaseOverview slug="p2p-accrual-settlement-case" />

**Worked scope.** Supplier 27’s five first-quarter 2024 goods receipts, plus the separate repairs-and-maintenance accrual journals 9, 26, and 43. Review March 31 and subsequent evidence through June 30. The accruals are a separate population, not purchases from supplier 27.

The management request is an illustrative company scenario. The worked records are actual synthetic records from release **v2027.1**, separate from the fictional furnishing project. Your assigned release may differ. Complete either tool route; your Excel/SQL choice follows you between lessons and cases.

**Preparation:** [1. Meet the Records](/docs/learn-and-practice/meet-the-records); [2. Read an Order](/docs/learn-and-practice/read-an-order); [3. Connect the Records](/docs/learn-and-practice/connect-the-records); [8. Follow a Purchase](/docs/learn-and-practice/receipt-to-payable); [11. Follow an Estimate into Settlement](/docs/learn-and-practice/follow-an-estimate-into-settlement). Use the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) for your chosen tool.

**Ready to begin:**

- Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.
- Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.
- Aggregate receipt, invoice, payment, and estimate evidence separately; explain GRNI, AP, and accrued-service obligations at each cutoff.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| PurchaseOrder | T33_PurchaseOrder | PurchaseOrderData |
| PurchaseOrderLine | T34_PurchaseOrderLine | PurchaseOrderLineData |
| GoodsReceipt | T35_GoodsReceipt | GoodsReceiptData |
| GoodsReceiptLine | T36_GoodsReceiptLine | GoodsReceiptLineData |
| PurchaseInvoice | T37_PurchaseInvoice | PurchaseInvoiceData |
| PurchaseInvoiceLine | T38_PurchaseInvoiceLine | PurchaseInvoiceLineData |
| DisbursementPayment | T39_DisbursementPayment | DisbursementPaymentData |
| JournalEntry | T2_JournalEntry | JournalEntryData |
| GLEntry | T3_GLEntry | GLEntryData |
| Account | T1_Account | AccountData |

<CaseMethods />

<span id="step-1-define-the-normal-p2p-document-chain"></span>
<span id="step-2-separate-receipt-matched-invoice-lines-from-accrual-linked-service-lines"></span>
<span id="step-3-explain-the-accounting-bridge-from-accrual-estimate-to-supplier-invoice"></span>

## Session 1 — Follow received goods into supplier liabilities

Create Case03.xlsx or Case03.sql. Label the goods schedule and accrual schedule separately. A purchase order records a commitment; a receipt establishes a different event.

<CaseFigure figureId="case03-branches" />


### 1.1. Select the receipt population

**Predict before you run:** How many receipt lines might one supplier order produce?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `PurchaseOrderData ← PurchaseOrder (import here)`; `GoodsReceiptData ← GoodsReceipt and GoodsReceiptLineData ← GoodsReceiptLine (import here)`.

**Produced outputs:** `SupplierOrders: supplier 27 order headers`; `SelectedGoodsReceipts: Q1 2024 receipt headers`; `Receipts: selected receipt-line detail`.

1. Import PurchaseOrder as PurchaseOrderData, GoodsReceipt as GoodsReceiptData, and GoodsReceiptLine as GoodsReceiptLineData.

2. Preserve all three raw queries.

3. Reference PurchaseOrderData as SupplierOrders and filter SupplierID 27.

4. Reference GoodsReceiptData as SelectedGoodsReceipts and filter ReceiptDate January 1 through March 31, 2024; Inner merge to SupplierOrders on PurchaseOrderID.

5. Reference GoodsReceiptLineData, merge to SelectedGoodsReceipts on GoodsReceiptID, and expand ReceiptDate.

6. Load as Receipts.

7. Preserve GoodsReceiptLineID, POLineID, QuantityReceived, and ExtendedStandardCost.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c03-receipts.sql"
SELECT r.GoodsReceiptID,
       r.ReceiptDate,
       l.GoodsReceiptLineID,
       l.POLineID,
       l.QuantityReceived,
       l.ExtendedStandardCost
FROM GoodsReceipt r
JOIN GoodsReceiptLine l ON l.GoodsReceiptID=r.GoodsReceiptID
JOIN PurchaseOrder o ON o.PurchaseOrderID=r.PurchaseOrderID
WHERE o.SupplierID=27 AND r.ReceiptDate>='2024-01-01' AND r.ReceiptDate<'2024-04-01'
ORDER BY r.ReceiptDate,r.GoodsReceiptID,l.GoodsReceiptLineID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Five receipts and five lines; standard receipt cost totals 7,234.30. Receipt IDs are 174, 175, 253, 396, and 340.

The receipt amount is inventory at standard cost. The supplier invoice may contain a different purchase cost or tax, so receipt cost cannot simply be subtracted from invoice GrandTotal to calculate GRNI.

<details>
<summary>If your result differs</summary>

Filter by receipt date, not purchase-order date. Receipt line IDs are 175, 176, 254, 397, and 341; they differ from header IDs.

</details>

**Keep for the next stage:** Save Receipts and a receipt-date timeline.

### 1.2. Trace partial invoice matches

**Predict before you run:** Will each receipt have exactly one invoice by June 30?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Receipts (Session 1.1)`; `PurchaseInvoiceLineData ← PurchaseInvoiceLine and PurchaseInvoiceData ← PurchaseInvoice (import here)`; `DisbursementPaymentData ← DisbursementPayment (import here)`.

**Produced outputs:** `GoodsInvoices: matched goods-invoice lines through June 30, 2024`; `Payments: selected goods-invoice payments; raw payment query preserved`.

1. Import PurchaseInvoiceLine as PurchaseInvoiceLineData, PurchaseInvoice as PurchaseInvoiceData, and DisbursementPayment as DisbursementPaymentData.

2. Preserve the raw queries.

3. Reference PurchaseInvoiceLineData as GoodsInvoices; Inner merge to Receipts on GoodsReceiptLineID.

4. Merge PurchaseInvoiceData on PurchaseInvoiceID and expand InvoiceDate and GrandTotal.

5. Filter InvoiceDate through June 30, 2024; load as GoodsInvoices.

6. Reference DisbursementPaymentData, filter to the selected PurchaseInvoiceIDs, and load as Payments.

7. Add PaidMarch to GoodsInvoices:

    ~~~text title="Excel — GoodsInvoices[PaidMarch]"
    =SUMIFS(Payments[Amount],Payments[PurchaseInvoiceID],[@PurchaseInvoiceID],Payments[PaymentDate],"<="&DATE(2024,3,31))
    ~~~

8. Add PaidJune:

    ~~~text title="Excel — GoodsInvoices[PaidJune]"
    =SUMIFS(Payments[Amount],Payments[PurchaseInvoiceID],[@PurchaseInvoiceID],Payments[PaymentDate],"<="&DATE(2024,6,30))
    ~~~

9. Keep LineTotal beside GrandTotal.

10. This worked selection has one selected line per invoice; verify that before summing headers.

</TabItem>
<TabItem value="sql">

One result row is one matched supplier invoice line. The two correlated payment totals are calculated independently. InvoiceDate limits subsequent evidence to June 30; it does not imply payment by that date.

Run each complete statement separately and retain its result before continuing.
```sql title="c03-matches.sql"
SELECT l.GoodsReceiptLineID,
       l.PILineID,
       i.PurchaseInvoiceID,
       i.InvoiceDate,
       l.LineTotal,
       i.GrandTotal,
       ROUND(COALESCE((SELECT SUM(p.Amount)
FROM DisbursementPayment p
WHERE p.PurchaseInvoiceID=i.PurchaseInvoiceID AND p.PaymentDate<='2024-03-31'),0),2) AS PaidMarch,
       ROUND(COALESCE((SELECT SUM(p.Amount)
FROM DisbursementPayment p
WHERE p.PurchaseInvoiceID=i.PurchaseInvoiceID AND p.PaymentDate<='2024-06-30'),0),2) AS PaidJune
FROM PurchaseInvoiceLine l
JOIN PurchaseInvoice i ON i.PurchaseInvoiceID=l.PurchaseInvoiceID
WHERE l.GoodsReceiptLineID IN (SELECT gl.GoodsReceiptLineID
FROM GoodsReceiptLine gl
JOIN GoodsReceipt r ON r.GoodsReceiptID=gl.GoodsReceiptID
JOIN PurchaseOrder o ON o.PurchaseOrderID=r.PurchaseOrderID
WHERE o.SupplierID=27 AND r.ReceiptDate>='2024-01-01' AND r.ReceiptDate<'2024-04-01') AND i.InvoiceDate<='2024-06-30'
ORDER BY l.GoodsReceiptLineID,i.PurchaseInvoiceID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Seven invoice lines through June, versus five receipts. Receipt line 176 has two invoices by June and another later in released history. None of the selected goods invoices is paid by March 31.

A receipt can be invoiced in parts, and an invoice can remain unpaid. A one-result lookup would lose the later match. Keep a merge for this one-to-many relationship.

<details>
<summary>If your result differs</summary>

An eighth match dated July 14 lies beyond this follow-up window. Preserve it as later evidence without including it in June totals.

</details>

**Keep for the next stage:** Save GoodsInvoices and date-conditioned payment columns.

### 1.3. Reconstruct the selected liability accounts

**Predict before you run:** Should unbilled receipt cost and unpaid supplier bills share one label?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `AccountData ← Account and GLEntryData ← GLEntry (import here)`; `Payments (Session 1.2)`.

**Produced outputs:** `GoodsLiability: selected 2010/2020 ledger detail`; `Obligations: four account/cutoff rows`.

1. Import Account as AccountData and GLEntry as GLEntryData; retain the raw ledger in Power Query.

2. Create three filtered GLEntryData references, keeping SourceDocumentType with SourceDocumentID: GoodsReceipt IDs 174,175,253,396,340; PurchaseInvoice IDs 143,278,1499,179,422,614,947; and DisbursementPayment IDs obtained from Payments.

3. Append the references, merge AccountData on AccountID, then retain AccountNumber 2010 or 2020.

4. In Power Query choose Add Column → Custom Column, name it LiabilityChange, and paste the expression below without a leading equals sign:

    ~~~text title="Power Query — GoodsLiability / LiabilityChange"
    [Credit]-[Debit]
    ~~~

5. Load as GoodsLiability.

6. On Review create an Excel Table named Obligations with columns AccountNumber, AsOf, and LiabilityBalance.

7. Enter four rows pairing accounts 2010 and 2020 with March 31 and June 30, 2024; ensure AsOf contains real Excel dates.

8. In LiabilityBalance enter:

    ~~~text title="Excel — Obligations[LiabilityBalance]"
    =SUMIFS(GoodsLiability[LiabilityChange],GoodsLiability[AccountNumber],[@AccountNumber],GoodsLiability[PostingDate],"<="&[@AsOf])
    ~~~

</TabItem>
<TabItem value="sql">

events selects liability postings for the known receipt, invoice, and payment population. Credit minus debit gives a positive liability. Each cutoff sums only postings on or before its date. This measures posted GRNI rather than subtracting supplier price from standard receipt cost.

Run each complete statement separately and retain its result before continuing.
```sql title="c03-goods-balances.sql"
WITH cutoffs(AsOf) AS (VALUES('2024-03-31'),('2024-06-30')), events AS (SELECT g.PostingDate,
       a.AccountNumber,
       g.Credit-g.Debit AS LiabilityChange
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
WHERE a.AccountNumber IN(2010,2020) AND ((g.SourceDocumentType='GoodsReceipt' AND g.SourceDocumentID IN(174,175,253,396,340)) OR (g.SourceDocumentType='PurchaseInvoice' AND g.SourceDocumentID IN(143,278,1499,179,422,614,947)) OR (g.SourceDocumentType='DisbursementPayment' AND g.SourceDocumentID IN(SELECT DisbursementID
FROM DisbursementPayment
WHERE PurchaseInvoiceID IN(143,278,1499,179,422,614,947))))) SELECT d.AsOf,
       e.AccountNumber,
       ROUND(SUM(e.LiabilityChange),2) AS SelectedLiability
FROM cutoffs d
JOIN events e ON e.PostingDate<=d.AsOf
GROUP BY d.AsOf,e.AccountNumber
ORDER BY d.AsOf,e.AccountNumber;
```


</TabItem>
</ToolSteps>

**Checkpoint.** March 31: selected AP 5,132.04 and GRNI 2,208.58. June 30: selected AP 2,096.16 and GRNI 142.79.

These balances describe the selected receipt population’s posted transitions. The GRNI balance falls when matched invoices clear receipt cost, while AP falls through payment. Neither schedule represents the company-wide accounts.

<details>
<summary>If your result differs</summary>

Retain document type with source ID. Account numbers are not AccountID values. Do not add all supplier 27 transactions to this selected-receipt schedule.

</details>

**Keep for the next stage:** Save the four-row liability schedule and stop after writing the meaning of each account.

:::tip Session stopping point
Save the receipt-to-invoice matches and two-date liability schedule. Explain the remaining June GRNI before moving to expense estimates.
:::

<span id="step-4-measure-invoice-and-payment-timing-then-identify-what-remains-open"></span>
<span id="step-5-extend-the-case-into-audit-follow-up"></span>

## Session 2 — Replace estimates with later evidence

The controller’s three repairs-and-maintenance estimates follow a different path. An invoice consumes the estimate; any difference must be explained from the actual postings.

<CaseFigure figureId="case03-transitions" />


### 2.1. Read the linked estimates and invoices

**Predict before you run:** What would you expect if the invoice is below the estimate? What if it is above?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `JournalEntryData ← JournalEntry (import here)`; `PurchaseInvoiceLineData and PurchaseInvoiceData (raw queries from Session 1.2)`.

**Produced outputs:** `Estimates: three journal headers`; `AccrualInvoices: linked invoice-line detail`; `EstimateReview: estimate/invoice comparison`.

1. Import JournalEntry as JournalEntryData and preserve the raw query.

2. Reference JournalEntryData, filter IDs 9,26,43, and load as Estimates.

3. Reference the raw PurchaseInvoiceLineData from Session 1.2 as AccrualInvoices, filter AccrualJournalEntryID 9,26,43, and merge to the raw PurchaseInvoiceData on PurchaseInvoiceID.

4. Load as AccrualInvoices.

5. Reference Estimates as EstimateReview, merge to AccrualInvoices on JournalEntryID = AccrualJournalEntryID, and load as EstimateReview.

6. Add EstimateLessInvoice:

    ~~~text title="Excel — EstimateReview[EstimateLessInvoice]"
    =ROUND([@TotalAmount]-[@LineTotal],2)
    ~~~

7. Keep InvoiceDate visible; do not use the final invoice amount to erase the earlier estimate.

</TabItem>
<TabItem value="sql">

LEFT JOIN retains an estimate even if its invoice link is missing. AccrualJournalEntryID supplies the relationship. The later invoice amount is displayed beside the original estimate rather than replacing it.

Run each complete statement separately and retain its result before continuing.
```sql title="c03-accruals.sql"
SELECT j.JournalEntryID,
       j.PostingDate,
       j.TotalAmount AS Estimate,
       l.PILineID,
       l.LineTotal AS Consumed,
       i.PurchaseInvoiceID,
       i.InvoiceDate,
       i.GrandTotal,
       ROUND(COALESCE((SELECT SUM(p.Amount)
FROM DisbursementPayment p
WHERE p.PurchaseInvoiceID=i.PurchaseInvoiceID AND p.PaymentDate<='2024-06-30'),0),2) AS PaidJune
FROM JournalEntry j
LEFT JOIN PurchaseInvoiceLine l ON l.AccrualJournalEntryID=j.JournalEntryID
LEFT JOIN PurchaseInvoice i ON i.PurchaseInvoiceID=l.PurchaseInvoiceID
WHERE j.JournalEntryID IN (9,26,43)
ORDER BY j.JournalEntryID,l.PILineID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Journal 9 estimated 10,039.33; the March 9 invoice was 10,019.59, leaving 19.74. Journal 26 estimated 9,551.39 versus an April invoice of 9,889.91; journal 43 estimated 9,721.85 versus 9,914.02.

The first estimate exceeds its invoice. The other two fall short by 338.52 and 192.17. Describe the direction explicitly before deciding how the accounting resolves it.

<details>
<summary>If your result differs</summary>

Use AccrualJournalEntryID, not a description search, to identify the invoice link. A missing link is not evidence that no expense occurred.

</details>

**Keep for the next stage:** Save the three-row estimate comparison.

### 2.2. Inspect adjustment and recognition entries

**Predict before you run:** Will every difference require a separate adjustment journal?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `JournalEntryData (raw query from Session 2.1)`; `GLEntryData and AccountData (raw queries from Session 1.3)`.

**Produced outputs:** `Adjustments: selected estimate/reversal headers`; `AccrualLedger: complete selected journal/invoice vouchers`; `VoucherChecks: debit/credit PivotTable; two accrued-liability totals`.

1. Reference the raw JournalEntryData as Adjustments; filter JournalEntryID 9,26,43 or ReversesJournalEntryID 9,26,43.

2. Keep distinct IDs; load as Adjustments.

3. Create filtered references of the raw GLEntryData and Append as new using document pairs JournalEntry/9,26,43,698 and PurchaseInvoice/39851,39861,39872.

4. Merge AccountData, retain all account lines, and load as AccrualLedger.

5. Create a PivotTable by VoucherNumber with Debit and Credit totals.

6. On Review label B8 Accrued liability at March 31 and enter:

    ~~~text title="Excel — Review!B8"
    =SUMIFS(AccrualLedger[Credit],AccrualLedger[AccountNumber],2040,AccrualLedger[PostingDate],"<="&DATE(2024,3,31))-SUMIFS(AccrualLedger[Debit],AccrualLedger[AccountNumber],2040,AccrualLedger[PostingDate],"<="&DATE(2024,3,31))
    ~~~

7. Label B9 Accrued liability at June 30 and enter:

    ~~~text title="Excel — Review!B9"
    =SUMIFS(AccrualLedger[Credit],AccrualLedger[AccountNumber],2040,AccrualLedger[PostingDate],"<="&DATE(2024,6,30))-SUMIFS(AccrualLedger[Debit],AccrualLedger[AccountNumber],2040,AccrualLedger[PostingDate],"<="&DATE(2024,6,30))
    ~~~

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c03-journals.sql"
SELECT JournalEntryID,
       PostingDate,
       EntryType,
       TotalAmount,
       ReversesJournalEntryID,
       Description
FROM JournalEntry
WHERE JournalEntryID IN (9,26,43) OR ReversesJournalEntryID IN (9,26,43)
ORDER BY PostingDate,JournalEntryID;
```


```sql title="c03-accrual-postings.sql"
SELECT g.PostingDate,
       g.SourceDocumentType,
       g.SourceDocumentID,
       g.VoucherNumber,
       a.AccountNumber,
       g.Debit,
       g.Credit
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
WHERE ((g.SourceDocumentType='JournalEntry' AND g.SourceDocumentID IN(9,26,43,698)) OR (g.SourceDocumentType='PurchaseInvoice' AND g.SourceDocumentID IN(39851,39861,39872))) AND g.PostingDate<='2024-06-30'
ORDER BY g.PostingDate,g.VoucherNumber,g.GLEntryID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Journal 698 on March 11 clears the 19.74 overestimate by debiting accrued expenses and crediting expense. The two larger invoices consume their full existing estimates and recognize the additional expense in the invoice postings. Their excesses do not require invented residual journals. March 31 selected accrued expenses are 19,273.24; by June 30 they are zero.

The later evidence changes the liability’s form and, where necessary, the expense amount. Reading only journal totals would hide the underestimates recognized on the invoices.

<details>
<summary>If your result differs</summary>

Keep all voucher lines for a balance check. Use only account 2040 when calculating the selected accrued-expense liability.

</details>

**Keep for the next stage:** Save complete voucher checks and identify the expense effect for each estimate.

### 2.3. Follow payment and prepare the review

**Predict before you run:** Does a June payment prove that the obligation was absent in March?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `DisbursementPaymentData (raw query from Session 1.2)`; `Payments, AccrualInvoices, and Obligations (earlier stages)`.

**Produced outputs:** `Payments: expanded goods/accrual selection through June 30, 2024`; `Review: separate goods and accrual settlement schedules`.

1. Edit the Payments reference selection on the raw DisbursementPaymentData to include goods invoice IDs 143, 278, 1499, 179, 422, 614, 947 and accrual invoice IDs 39851, 39861, 39872, filter PaymentDate through June 30, and sort by PurchaseInvoiceID and PaymentDate.

2. Keep goods and accrual IDs in separate categories on Review.

3. On Review label B10 Accrual invoice payments through June 30 and enter the three-invoice sum:

    ~~~text title="Excel — Review!B10"
    =SUMIFS(Payments[Amount],Payments[PurchaseInvoiceID],39851)+SUMIFS(Payments[Amount],Payments[PurchaseInvoiceID],39861)+SUMIFS(Payments[Amount],Payments[PurchaseInvoiceID],39872)
    ~~~

4. Compare the result with the three AccrualInvoices GrandTotal values; Payments is already filtered through June 30.

5. For goods, reconcile the four paid invoices to the June AP schedule.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c03-payments.sql"
SELECT PurchaseInvoiceID,
       DisbursementID,
       PaymentDate,
       Amount
FROM DisbursementPayment
WHERE PurchaseInvoiceID IN(143,278,1499,179,422,614,947,39851,39861,39872) AND PaymentDate<='2024-06-30'
ORDER BY PurchaseInvoiceID,PaymentDate,DisbursementID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Seven payments appear. Goods payments total 5,132.04. The three accrual-related invoices are paid May 20, June 13, and June 22, totaling 29,823.52.

At March 31 the selected expenses include the two open estimates and the first invoice’s AP. Later settlement explains what happened afterward; it does not remove the March obligation.

<details>
<summary>If your result differs</summary>

Keep the separate populations labeled. Do not offset a supplier receipt liability with an unrelated maintenance accrual.

</details>

**Keep for the next stage:** Write a 250–350 word review note: distinguish GRNI, accrued expenses, and AP; quantify the selected positions; name one June follow-up.

:::tip Session stopping point
Retain both schedules, their source links, and the review note. The note should explain recognition dates and settlement dates separately.
:::

<CaseFigure figureId="case03-timeline" />

<span id="required-student-output"></span>
<span id="wrap-up-questions"></span>
<span id="limitations-and-judgment"></span>

## Prepare the Decision

The worked schedules support a bounded quarter-end explanation. Some goods remain partly uninvoiced and some bills unpaid in June. The maintenance estimates are fully consumed and their invoices paid by June. A useful next action is to ask AP and receiving to resolve the residual goods matches, while retaining the estimate comparison for improving the next close.

**Deliverable:** Separate goods and expense-obligation schedules, selected posting checks, and a quarter-end review note. Include the release, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A chart is optional in the SQL route; a clearly ordered result table can support the same conclusion.

## Independent Challenge

Select supplier 27’s April–June receipts and the second-quarter repairs-and-maintenance accruals. Review June 30 and follow subsequent evidence through September 30. Use explicit accrual links and keep the two populations separate.

<details>
<summary>Planning hint</summary>

Find the second-quarter accrual journals by EntryType, PostingDate, and the repairs-and-maintenance description, then use their IDs. A new population may require several invoice lines per estimate.

</details>

**Assessment criteria:** Assess correct receipt and estimate populations, partial matches, date boundaries, liability signs, complete postings, and separation of recognition from payment. Your instructor evaluates the method, evidence, and reasoning; there is no public model answer for this challenge.

<details>
<summary>Further queries and earlier case topics</summary>

<span id="optional-excel-follow-through"></span>

## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. They are optional references; both guided routes above are complete without them. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["p2p-accrual-settlement-case"]} helperText="Choose a reference after completing the guided investigation; verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Choose a Product and Pricing Priority](product-portfolio-profitability-case.md). Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
