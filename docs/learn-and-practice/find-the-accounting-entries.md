---
title: "6. Find the Accounting Entries"
description: "Connect selected business events to complete ledger vouchers and explain their debit and credit effects."
sidebar_label: "6. Find the Accounting Entries"
pagination_prev: "learn-and-practice/follow-customer-settlement"
pagination_next: "learn-and-practice/follow-design-time-into-billing"
tutorial_number: 6
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 6. Find the Accounting Entries

<span id="context-and-problem"></span>

The controller asks you to explain the accounting behind the sale. You already know what happened in the documents. Now identify the ledger entries for four events and check each complete voucher before interpreting individual accounts.

<span id="learning-objectives"></span>

**Your task:** Connect selected business events to complete ledger vouchers and explain their debit and credit effects.

<TutorialFigure figureId="find-the-accounting-entries" />

## Before You Start

Finish [Follow Customer Settlement](follow-customer-settlement.md). Use shipment **87**, sales invoice **202**, cash receipt **173**, and cash application **225**. Review basic debits and credits.

<ToolSteps>
<TabItem value="excel">

For Excel, start `Lesson06.xlsx`; import `T1_Account` as `AccountData`. The ledger import is large, so apply the filters below in Power Query **before** loading.

</TabItem>
<TabItem value="sql">

Open the released SQLite database in your SQL tool. Save this lesson's statements as **Lesson06.sql**. Run each supplied query separately; its filters identify the records and dates for that step.

</TabItem>
</ToolSteps>


These are actual synthetic records from release **v2027.1**, separate from the illustrative customer project in the company story. Use your assigned release when an instructor specifies another file; its results may differ.

<span id="evidence-workflow"></span>

## 1. Locate the Complete Event Vouchers

A source identifier is meaningful together with its source type. Shipment 87 and invoice 87 would be different documents.

<ToolSteps>
<TabItem value="excel">

Import `T3_GLEntry` four times, keeping all its columns but applying these pairs of filters before loading:

| Working table | SourceDocumentType | SourceDocumentID |
|---|---|---:|
| ShipmentGL | Shipment | 87 |
| InvoiceGL | SalesInvoice | 202 |
| ReceiptGL | CashReceipt | 173 |
| ApplicationGL | CashReceiptApplication | 225 |

In each table, add an `AccountName` column:

~~~text
=XLOOKUP([@AccountID],AccountData[AccountID],AccountData[AccountName],"No match",0)
~~~

Keep `GLEntryID`, `VoucherNumber`, `PostingDate`, `Debit`, and `Credit` visible. Do not filter the voucher down to one account before checking its balance.

</TabItem>
<TabItem value="sql">

The parentheses keep each type paired with its identifier. The account join adds names without changing the ledger-row grain.

```sql title="l06-event-postings.sql"
SELECT g.GLEntryID, g.PostingDate, g.SourceDocumentType,
       g.SourceDocumentID, g.VoucherNumber, a.AccountNumber,
       a.AccountName, g.Debit, g.Credit
FROM GLEntry AS g
JOIN Account AS a ON a.AccountID = g.AccountID
WHERE (g.SourceDocumentType = 'Shipment' AND g.SourceDocumentID = 87)
   OR (g.SourceDocumentType = 'SalesInvoice' AND g.SourceDocumentID = 202)
   OR (g.SourceDocumentType = 'CashReceipt' AND g.SourceDocumentID = 173)
   OR (g.SourceDocumentType = 'CashReceiptApplication' AND g.SourceDocumentID = 225)
ORDER BY g.PostingDate, g.GLEntryID;
```


</TabItem>
</ToolSteps>

Expect **15 ledger rows**. Shipment records inventory/COGS and freight cost; the invoice records the customer receivable, sales, freight revenue, and tax. Receipt 173 increases cash and customer deposits. Application 225 reduces deposits and the receivable.

## 2. Check and Explain Each Voucher

Balance is a necessary accounting check. It does not establish that the event was authorized or that every amount is economically correct.

<ToolSteps>
<TabItem value="excel">

On `Notes`, keep four rows for Shipment, Invoice, Receipt, and Application. Label columns B Debits, C Credits, and D Difference. Enter each formula in the named cell; each source table must contain only the selected event.


```text title="Excel — Notes!B2"
=SUM(ShipmentGL[Debit])
```



```text title="Excel — Notes!C2"
=SUM(ShipmentGL[Credit])
```



```text title="Excel — Notes!D2"
=ROUND(B2-C2,2)
```



```text title="Excel — Notes!B3"
=SUM(InvoiceGL[Debit])
```



```text title="Excel — Notes!C3"
=SUM(InvoiceGL[Credit])
```



```text title="Excel — Notes!D3"
=ROUND(B3-C3,2)
```



```text title="Excel — Notes!B4"
=SUM(ReceiptGL[Debit])
```



```text title="Excel — Notes!C4"
=SUM(ReceiptGL[Credit])
```



```text title="Excel — Notes!D4"
=ROUND(B4-C4,2)
```



```text title="Excel — Notes!B5"
=SUM(ApplicationGL[Debit])
```



```text title="Excel — Notes!C5"
=SUM(ApplicationGL[Credit])
```



```text title="Excel — Notes!D5"
=ROUND(B5-C5,2)
```

Inspect VoucherNumber in each source table and confirm each complete voucher balances.

</TabItem>
<TabItem value="sql">

Group the complete selected postings by event and voucher. `GROUP BY` puts rows with the same listed values into a group, so `SUM` and `COUNT` produce one check per voucher. Read the numbers together with the accounts in the first result.

```sql title="l06-voucher-check.sql"
SELECT SourceDocumentType, SourceDocumentID, VoucherNumber,
       COUNT(*) AS LedgerRows,
       ROUND(SUM(Debit), 2) AS Debits,
       ROUND(SUM(Credit), 2) AS Credits,
       ROUND(SUM(Debit - Credit), 2) AS Difference
FROM GLEntry
WHERE (SourceDocumentType = 'Shipment' AND SourceDocumentID = 87)
   OR (SourceDocumentType = 'SalesInvoice' AND SourceDocumentID = 202)
   OR (SourceDocumentType = 'CashReceipt' AND SourceDocumentID = 173)
   OR (SourceDocumentType = 'CashReceiptApplication' AND SourceDocumentID = 225)
GROUP BY SourceDocumentType, SourceDocumentID, VoucherNumber
ORDER BY SourceDocumentType, SourceDocumentID, VoucherNumber;
```


</TabItem>
</ToolSteps>

| Event | Ledger rows | Total debit = total credit |
|---|---:|---:|
| Shipment 87 | 6 | 6,089.34 |
| Invoice 202 | 5 | 12,248.33 |
| Receipt 173 | 2 | 952.07 |
| Application 225 | 2 | 952.07 |

Each difference is **0.00**. The two 952.07 vouchers describe different events; adding them does not mean the customer sent 1,904.14.

## 3. Tell the Event-to-Entry Story

**Predict first:** Why can January 31 goods revenue and February 22 cash both be correct? Would recording application 225 on February 23 mean receiving more cash?

<details>
<summary>Reveal the complete-voucher bridge</summary>

| Event and posting date | Complete debit side | Complete credit side | Evidence scope |
|---|---|---|---|
| Shipment 87, January 31, 2024 | 5010 COGS 1,715.19 + 4,270.14; 5050 freight-out expense 104.01 | 1040 finished goods 1,715.19 + 4,270.14; 2040 accrued expenses 104.01 | All 6 ledger rows; each side 6,089.34 |
| Invoice 202, January 31, 2024 | 1020 AR 12,248.33 | 4010 goods revenue 3,552.21 + 7,845.57; 4050 freight revenue 103.00; 2050 sales tax payable 747.55 | All 5 ledger rows; each side 12,248.33 |
| Receipt 173, February 22, 2024 | 1010 cash 952.07 | 2060 customer deposits and unapplied cash 952.07 | All 2 ledger rows; each side 952.07 |
| Application 225, February 23, 2024 | 2060 customer deposits and unapplied cash 952.07 | 1020 AR 952.07 | All 2 ledger rows; each side 952.07 |

These are **all 15 rows** returned in Step 1, grouped for explanation rather than reduced to a selected sales line. Earlier lessons followed order line 42; this shipment and invoice also include the other goods line. The shipment’s total goods cost is 5,985.33, while the invoice’s total goods revenue is 11,397.78. Freight-out expense 104.01 and freight revenue 103.00 are different accounts and amounts. Tax payable is a liability, not revenue.

The order established demand without a posting. Shipment records cost and inventory movement; invoice records this dataset’s goods revenue and receivable. Receipt records cash arrival, and application allocates it to AR without another inflow. The January events do not wait for February’s cash.

At January 31, exclude both later cash events. At February 22, exclude application 225; receipt 173 itself has not reduced invoice 202’s receivable. These observations describe the **selected events**, not the invoice’s entire open balance. Retrieve all its dated applications and relevant credits before calculating that balance; one 952.07 application cannot establish full settlement.

</details>

## Readiness Check: After Lesson 6

Before widening the investigation, show that you can:

- Pair a source type with its identifier, retrieve all 15 rows, and balance each complete voucher before selecting accounts.
- Explain why a selected order-line amount differs from a complete shipment or invoice voucher.
- Separate receipt from application and state which events fall inside a specified cutoff.
- Write a conclusion limited to the selected evidence, naming the other settlement records needed for an invoice balance.

If a total differs, check the paired filters, retained source lines, date types, and join multiplicity before adjusting your interpretation. If the number matches but the grain or cutoff explanation fails, revisit [Lesson 3](connect-the-records.md), [Lesson 4](source-to-ledger.md), or [Lesson 5](follow-customer-settlement.md). A matching answer alone does not pass this checkpoint.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the four voucher checks and an event-to-accounting explanation. Identify which entries recognize inventory movement, billing, cash receipt, and invoice settlement. Record the release, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

A source-to-ledger match supports this selected trace. A balanced voucher does not prove authorization or population completeness. Keep the [Posting Reference](../reference/posting.md) available for fuller definitions.

## Try One Change

Find the ledger rows for cash receipt **528**, then for application **1194**. Predict whether their voucher totals should match.

<details>
<summary>Compare your reasoning</summary>

They should not match: receipt 528 records 7,092.79; application 1194 assigns 3,130.89 to invoice 202. Change both the source type and its paired identifier when adapting a filter.

</details>

## Next Steps

You can now follow goods from demand to accounting. The next investigation applies the same method to staff time. Continue to [Follow Design Time into Billing](follow-design-time-into-billing.md).
