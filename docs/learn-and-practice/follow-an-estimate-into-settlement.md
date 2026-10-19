---
title: "11. Follow an Estimate into Settlement"
description: "Trace an expense estimate to its supplier invoice, residual adjustment, and later payment."
sidebar_label: "11. Follow an Estimate into Settlement"
pagination_prev: "learn-and-practice/follow-hours-into-payroll"
pagination_next: "learn-and-practice/turn-records-into-a-conclusion"
tutorial_number: 11
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 11. Follow an Estimate into Settlement

<span id="context-and-problem"></span>

At January month end, the controller estimates repairs and maintenance expense before the supplier invoice arrives. Later evidence is slightly lower than the estimate. Follow the remaining accrual separately from the payable and its eventual payment.

<span id="learning-objectives"></span>

**Your task.** Trace an expense estimate to its supplier invoice, residual adjustment, and later payment.

<TutorialFigure figureId="follow-an-estimate-into-settlement" />

## Before You Start

Read [Journals and Close](../processes/manual-journals-and-close.md). This example uses accrual journal **9**, supplier invoice **39851**, and adjustment journal **698**.

<ToolSteps>
<TabItem value="excel">

In `Lesson11.xlsx`, import the following tables with separate filters for each source.

| Published table | Working name | Power Query filter |
|---|---|---|
| `T2_JournalEntry` | `JournalData` | `JournalEntryID = 9` or `698` |
| `T38_PurchaseInvoiceLine` | `PILineData` | `AccrualJournalEntryID = 9` |
| `T37_PurchaseInvoice` | `InvoiceData` | `PurchaseInvoiceID = 39851` |
| `T39_DisbursementPayment` | `PaymentData` | `PurchaseInvoiceID = 39851` |

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson11.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Read the Estimate and Later Invoice

The original journal records estimated expense and an accrued liability. The later supplier invoice consumes that accrual and establishes accounts payable through an explicit link.

<ToolSteps>
<TabItem value="excel">

Read journal 9's date, description, and `TotalAmount`. In `PILineData`, confirm `AccrualJournalEntryID = 9`, `PurchaseInvoiceID = 39851`, and a blank goods-receipt link. Compare the line amount with `InvoiceData`. On Notes label B2 Estimate less invoice and enter the formula below. Use the following lookup to select journal 9 alone. Summing JournalData would also include adjustment 698.

```text title="Excel — Notes!B2"
=XLOOKUP(9,JournalData[JournalEntryID],JournalData[TotalAmount],"No match",0)-SUM(PILineData[LineTotal])
```



</TabItem>
<TabItem value="sql">

Follow `AccrualJournalEntryID`, not a matching description or coincidentally similar amount.

```sql title="l11-estimate.sql"
SELECT JournalEntryID, PostingDate, EntryType, Description, TotalAmount
FROM JournalEntry
WHERE JournalEntryID = 9;
```


```sql title="l11-linked-invoice.sql"
SELECT l.PILineID, l.AccrualJournalEntryID, l.GoodsReceiptLineID,
       l.LineTotal, p.PurchaseInvoiceID, p.InvoiceDate, p.GrandTotal
FROM PurchaseInvoiceLine AS l
JOIN PurchaseInvoice AS p ON p.PurchaseInvoiceID = l.PurchaseInvoiceID
WHERE l.AccrualJournalEntryID = 9
ORDER BY l.PILineID;
```


</TabItem>
</ToolSteps>

The **January 31** estimate is **10,039.33**. The **March 9** supplier invoice is **10,019.59**. The estimate exceeds the invoice by **19.74**. The empty receipt link is expected because this accrued-service branch does not require an inventory receipt.

## 2. Explain the Residual Adjustment and Payment

The invoice settles most of the accrual, but it does not erase the unused estimate by itself. Finance removes the remainder through a separate adjustment.

<ToolSteps>
<TabItem value="excel">

Read journal **698** and its `ReversesJournalEntryID = 9` link. Confirm its amount equals your calculated 19.74 remainder. Then read `PaymentData` for the invoice's payment date and amount. Keep four rows on `Notes`: original estimate, invoice, residual adjustment, supplier payment.

</TabItem>
<TabItem value="sql">

The linked adjustment removes the unused part of the estimate, not the full original accrual. Payment settles the resulting payable later.

```sql title="l11-residual.sql"
SELECT JournalEntryID, PostingDate, EntryType,
       ReversesJournalEntryID, TotalAmount
FROM JournalEntry
WHERE ReversesJournalEntryID = 9
ORDER BY PostingDate, JournalEntryID;
```


```sql title="l11-payment.sql"
SELECT DisbursementID, PurchaseInvoiceID, PaymentDate, Amount
FROM DisbursementPayment
WHERE PurchaseInvoiceID = 39851
ORDER BY PaymentDate, DisbursementID;
```


</TabItem>
</ToolSteps>

Adjustment **698** removes **19.74** on **March 11**. The supplier receives **10,019.59** on **May 20**. By March 31 the selected accrual has been cleared, while the supplier payable remains until payment.

## 3. Confirm the Adjustment's Direction

For this overestimate, removing the unused liability also reduces the expense previously estimated. Inspect the accounts before describing the adjustment.

<ToolSteps>
<TabItem value="excel">

Import `T3_GLEntry` as `AdjustmentGL`, filtered to `SourceDocumentType = JournalEntry` and `SourceDocumentID = 698`. Import `T1_Account` as `AccountData`. In AdjustmentGL add AccountName using the exact account identifier:

```text title="Excel — AdjustmentGL[AccountName]"
=XLOOKUP([@AccountID],AccountData[AccountID],AccountData[AccountName],"No match",0)
```

On Notes label B4 Adjustment debits and B5 Adjustment credits. Enter each total and check both equal 19.74:

```text title="Excel — Notes!B4"
=SUM(AdjustmentGL[Debit])
```



```text title="Excel — Notes!B5"
=SUM(AdjustmentGL[Credit])
```



</TabItem>
<TabItem value="sql">

This is the same source-to-ledger method used for operational events, applied to a finance journal.

```sql title="l11-adjustment-posting.sql"
SELECT g.GLEntryID, a.AccountNumber, a.AccountName, g.Debit, g.Credit
FROM GLEntry AS g
JOIN Account AS a ON a.AccountID = g.AccountID
WHERE g.SourceDocumentType = 'JournalEntry' AND g.SourceDocumentID = 698
ORDER BY g.GLEntryID;
```


</TabItem>
</ToolSteps>

The adjustment debits the accrued-expense liability and credits repairs and maintenance expense, **19.74** on each side. It reduces an estimate that was too high rather than adding expense for an underestimate.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the four-event timeline, 19.74 residual calculation, and adjustment posting explanation. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

Classify each event before interpreting its amount. Journal 9 recognizes expense and accrued liability on January 31. Invoice 39851 transfers **10,019.59** from that liability to AP on March 9. Journal 698 removes the **19.74** unused estimate on March 11. The May 20 payment settles AP and does not create another expense.

For the selected accrual, roll forward a **0.00** opening balance through **10,039.33** recognition, **10,019.59** invoice relief, and **19.74** adjustment relief to **0.00** at March 31. The payable is a separate balance until May 20. Retain the complete adjustment voucher and explain why the invoice's stored AccrualJournalEntryID supports the transfer. A receipt-based inventory match would follow the wrong branch.

<span id="interpretation-and-limitations"></span>

This is a linked expense estimate and settlement, not a rule that every accrual is fully reversed next month. Opening balances and annual closing entries serve other purposes and remain in the process reference.

## Try One Change

What remains of this accrual on **March 10**, and what changes on **March 11**? Is the supplier paid on either date?

<details>
<summary>Compare your reasoning</summary>

After the March 9 invoice, 19.74 remains in the selected accrual until its March 11 adjustment. The 10,019.59 payable remains unpaid on both dates and is settled on May 20.

</details>

## Next Steps

You have followed six processes through their records. Now move from one example to a defined population. Continue to [Turn Records into a Conclusion](turn-records-into-a-conclusion.md).
