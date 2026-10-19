---
title: "5. Follow Customer Settlement"
description: "Compare cash receipts and invoice applications at two dates and explain the remaining balance."
sidebar_label: "5. Follow Customer Settlement"
pagination_prev: "learn-and-practice/source-to-ledger"
pagination_next: "learn-and-practice/find-the-accounting-entries"
tutorial_number: 5
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 5. Follow Customer Settlement

<span id="context-and-problem"></span>

Treasury says the customer has sent money. Customer accounting asks which invoice it settles and when. Invoice **202** provides a useful example because its balance is reduced through four applications, rather than one payment event.

<span id="learning-objectives"></span>

**Your task.** Compare cash receipts and invoice applications at two dates and explain the remaining balance.

<TutorialFigure figureId="follow-customer-settlement" />

## Before You Start

Finish [Follow a Goods Sale](source-to-ledger.md).

<ToolSteps>
<TabItem value="excel">

In `Lesson05.xlsx`, import `T16_SalesInvoice` as `InvoiceData` filtered to ID 202, `T20_CashReceiptApplication` as `ApplicationData` filtered to `SalesInvoiceID = 202`, and `T19_CashReceipt` as `ReceiptData` without filtering. Convert receipt and application date columns to **Date** in Power Query. You will compare **2024-01-31** and **2024-02-29**.

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson05.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Separate Receipt from Application

A receipt records incoming cash. An application records how much of that cash is assigned to this invoice. Follow `CashReceiptID` to read both events.

<ToolSteps>
<TabItem value="excel">

Add two calculated columns to `ApplicationData`:

~~~text
=XLOOKUP([@CashReceiptID],ReceiptData[CashReceiptID],ReceiptData[ReceiptDate],"No match",0)
~~~

Name that column `ReceiptDate` and format it as a date. In `ApplicationData`, add a column named `ReceiptAmount` and enter:

```text title="Excel — ApplicationData[ReceiptAmount]"
=XLOOKUP([@CashReceiptID],ReceiptData[CashReceiptID],ReceiptData[Amount],"No match",0)
```

 Sort by `ApplicationDate`, then `CashReceiptApplicationID`. Keep `AppliedAmount` beside `ReceiptAmount`.

</TabItem>
<TabItem value="sql">

One result row is one application to invoice 202. The receipt amount is descriptive context and must not be summed as if it all settled this invoice.

```sql title="l05-applications.sql"
SELECT a.CashReceiptApplicationID, a.CashReceiptID,
       r.ReceiptDate, r.Amount AS ReceiptAmount,
       a.ApplicationDate, a.AppliedAmount
FROM CashReceiptApplication AS a
JOIN CashReceipt AS r ON r.CashReceiptID = a.CashReceiptID
WHERE a.SalesInvoiceID = 202
ORDER BY a.ApplicationDate, a.CashReceiptApplicationID;
```


</TabItem>
</ToolSteps>

| Application | Receipt | Receipt date | Application date | Applied to invoice 202 |
|---:|---:|---|---|---:|
| 52 | 48 | 2024-01-20 | 2024-01-31 | 238.16 |
| 225 | 173 | 2024-02-22 | 2024-02-23 | 952.07 |
| 608 | 337 | 2024-03-16 | 2024-03-16 | 7,927.21 |
| 1194 | 528 | 2024-04-14 | 2024-04-16 | 3,130.89 |

Receipt **528** is **7,092.79**, but only **3,130.89** is applied here. The first receipt also predates this order. Its stored application establishes the allocation, but the file does not explain the reason for the advance.

## 2. Reconstruct Two Reporting Dates

Use application dates to determine how much of the invoice has been settled by each reporting date. The invoice's final status does not describe every earlier date.

<ToolSteps>
<TabItem value="excel">

In `Notes!A2`, enter the first cutoff:

```text title="Excel — Notes!A2"
=DATE(2024,1,31)
```

In `Notes!A3`, enter the second cutoff:

```text title="Excel — Notes!A3"
=DATE(2024,2,29)
```

 Put the invoice GrandTotal, **12248.33**, in D1 and label it. In B2 enter:

~~~text
=SUMIFS(ApplicationData[AppliedAmount],ApplicationData[ApplicationDate],"<="&A2)
~~~

In `Notes!C2`, calculate the invoice amount less applications:

```text title="Excel — Notes!C2"
=$D$1-B2
```

 Fill B2:C2 down to row 3. Label B **Applied through date** and C **Invoice less applications**. These formulas rely on the import being restricted to invoice 202.

Check for credits by importing `T23_CreditMemo`. Filter `OriginalSalesInvoiceID = 202`, then clear that filter and check `SalesOrderID = 11` separately. Both checks should leave no records.

</TabItem>
<TabItem value="sql">

Run once for January 31. Then change the date literal to `2024-02-29` and run again. The invoice amount is the verified header total from Lesson 4. `AND` requires both the invoice and date conditions to hold, while `<=` includes the cutoff date. The credit query uses `OR` to retain a credit linked through either the invoice or its order.

```sql title="l05-as-of-balance.sql"
SELECT ROUND(SUM(AppliedAmount), 2) AS AppliedThroughDate,
       ROUND(12248.33 - SUM(AppliedAmount), 2) AS InvoiceLessApplications
FROM CashReceiptApplication
WHERE SalesInvoiceID = 202
  AND ApplicationDate <= '2024-01-31';
```


```sql title="l05-credit-check.sql"
SELECT CreditMemoID, CreditMemoDate, GrandTotal
FROM CreditMemo
WHERE OriginalSalesInvoiceID = 202 OR SalesOrderID = 11
ORDER BY CreditMemoDate, CreditMemoID;
```


</TabItem>
</ToolSteps>

At **January 31**, applications total **238.16**, leaving **12,010.17**. At **February 29**, applications total **1,190.23**, leaving **11,058.10**.

The credit checks return **no rows** for this example. For an invoice with credits, include their amount and dates before calling invoice less applications its remaining receivable.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the four application rows, two reporting-date calculations, and the empty credit check. Explain the different purposes of receipt date and application date. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

Use `CashReceiptApplication` to establish settlement of a particular invoice. `CashReceipt.SalesInvoiceID` is not a substitute for the application records. This worked calculation has no credits and does not provide a complete receivables-aging model for every invoice.

## Try One Change

Change the reporting date to **2024-04-16**. Compare the total applied with the invoice total.

<details>
<summary>Compare your reasoning</summary>

The four applications sum to 12,248.33, leaving zero for this invoice. Receipt 528 can still have allocations to other invoices, so use only the amount applied to this invoice.

</details>

## Next Steps

Receiving and applying the same cash are separate accounting events. Next, inspect their postings. Continue to [Find the Accounting Entries](find-the-accounting-entries.md).
