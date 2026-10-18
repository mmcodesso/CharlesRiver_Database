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
