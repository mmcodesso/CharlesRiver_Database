---
title: "7. Follow Design Time into Billing"
description: "Reconcile approved time to one service billing period and distinguish revenue from time-cost support."
sidebar_label: "7. Follow Design Time into Billing"
pagination_prev: "learn-and-practice/find-the-accounting-entries"
pagination_next: "learn-and-practice/receipt-to-payable"
tutorial_number: 7
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 7. Follow Design Time into Billing

<span id="context-and-problem"></span>

The design lead has approved the team's January work. Customer accounting must decide what can be billed, while the controller needs to understand the cost information. Here the delivered activity is staff time, so a shipment is not the bridge to the invoice.

<span id="learning-objectives"></span>

**Your task.** Reconcile approved time to one service billing period and distinguish revenue from time-cost support.

<TutorialFigure figureId="follow-design-time-into-billing" />

## Before You Start

Finish the sales tutorials and read [Design Services](../processes/design-services.md). This separate example uses engagement **2**, January 2024, and service billing line **2**.

<ToolSteps>
<TabItem value="excel">

In `Lesson07.xlsx`, import the following tables and convert date fields to Date.

| Published table | Working name | Power Query filter |
|---|---|---|
| `T11_ServiceEngagement` | `EngagementData` | `ServiceEngagementID = 2` |
| `T13_ServiceTimeEntry` | `ServiceTimeData` | `ServiceEngagementID = 2` and January 2024 `WorkDate` |
| `T18_ServiceBillingLine` | `BillingData` | `ServiceBillingLineID = 2` |
| `T17_SalesInvoiceLine` | `InvoiceLineData` | `SalesInvoiceLineID = 387` |

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson07.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Read the Engagement and Approved Time

The engagement establishes the billing arrangement. Individual time entries distinguish billable work from other work. Approval is a separate field from the work date.

<ToolSteps>
<TabItem value="excel">

Read `EngagementData`: engagement **SE-2024-000002**, customer **30**, hourly rate **210.00**. In `ServiceTimeData`, retain entries with a nonblank `ApprovedDate` on or before **2024-01-31**. On `Notes`, label B2 Approved entries, B3 Billable hours, B4 Non-billable hours, and B5 Recorded time cost. Enter each visible-row calculation:

```text title="Excel — Notes!B2"
=SUBTOTAL(103,ServiceTimeData[ServiceTimeEntryID])
```



```text title="Excel — Notes!B3"
=SUBTOTAL(109,ServiceTimeData[BillableHours])
```



```text title="Excel — Notes!B4"
=SUBTOTAL(109,ServiceTimeData[NonBillableHours])
```



```text title="Excel — Notes!B5"
=SUBTOTAL(109,ServiceTimeData[ExtendedCost])
```



</TabItem>
<TabItem value="sql">

Read the agreement, then total approved time for this engagement and work period. Approval and date filters make the population explicit. `IS NOT NULL` requires an approval date to be present, and the following date condition checks when approval occurred.

```sql title="l07-engagement.sql"
SELECT ServiceEngagementID, EngagementNumber, CustomerID, HourlyRate
FROM ServiceEngagement
WHERE ServiceEngagementID = 2;
```


```sql title="l07-approved-time.sql"
SELECT COUNT(*) AS TimeEntries,
       ROUND(SUM(BillableHours), 2) AS BillableHours,
       ROUND(SUM(NonBillableHours), 2) AS NonBillableHours,
       ROUND(SUM(ExtendedCost), 2) AS TimeCost
FROM ServiceTimeEntry
WHERE ServiceEngagementID = 2
  AND WorkDate >= '2024-01-01' AND WorkDate < '2024-02-01'
  AND ApprovedDate IS NOT NULL AND ApprovedDate <= '2024-01-31';
```


</TabItem>
</ToolSteps>

Expect **7 approved entries**, **32.67 billable hours**, **1.21 non-billable hours**, and **937.02** of recorded time cost. Non-billable hours represent work that is excluded from this billing quantity.

## 2. Check the Billing Bridge

The billing record identifies the engagement, covered dates, and invoice line. Time entries support this calculation through their engagement and work period rather than an invoice-line key on each entry.

<ToolSteps>
<TabItem value="excel">

Read `BillingData`: start **2024-01-12**, end **2024-01-30**, billed hours **32.67**, rate **210.00**, invoice line **387**. Check all seven selected work dates fall in that interval. In `Notes!B7`, multiply billed hours by the rate for the single imported billing row and compare with LineAmount. SUMPRODUCT multiplies corresponding values and adds the products:

```text title="Excel — Notes!B7"
=SUMPRODUCT(BillingData[BilledHours],BillingData[HourlyRate])
```

 Inspect `InvoiceLineData`: it belongs to invoice **241**, has `LineTotal` **6860.70**, and a blank `ShipmentLineID`.

</TabItem>
<TabItem value="sql">

Use the stored billing-to-invoice-line link. The empty shipment key is expected for this service line.

```sql title="l07-billing-bridge.sql"
SELECT b.ServiceBillingLineID, b.BillingPeriodStartDate,
       b.BillingPeriodEndDate, b.BilledHours, b.HourlyRate,
       b.LineAmount, sil.SalesInvoiceLineID, sil.SalesInvoiceID,
       sil.LineTotal, sil.ShipmentLineID
FROM ServiceBillingLine AS b
JOIN SalesInvoiceLine AS sil
    ON sil.SalesInvoiceLineID = b.SalesInvoiceLineID
WHERE b.ServiceBillingLineID = 2;
```


</TabItem>
</ToolSteps>

**32.67 × 210.00 = 6,860.70**, agreeing with the billing amount and invoice-line amount. In this dataset, the invoice posts service revenue, while approved time supports billing without an additional revenue posting. Collection uses the receipt/application process you already investigated.

## 3. Retrieve the Invoice Voucher

Reuse the [complete-voucher method from Lesson 6](find-the-accounting-entries.md#1-locate-the-complete-event-vouchers). In Excel, import `T3_GLEntry` as `ServiceInvoiceGL`, filtered to `SourceDocumentType = SalesInvoice` and `SourceDocumentID = 241`, and add account names from `T1_Account`. In SQL, adapt Lesson 6's paired source filters to the same type and ID. Retrieve all accounts before totaling debits and credits.

Expect three ledger rows dated **January 31, 2024**, with **7,306.65** on each side. AR is debited for 7,306.65, service revenue is credited for 6,860.70, and sales tax payable is credited for 445.95. Explain why the seven approved time entries support the invoice without recognizing another 6,860.70 of revenue. Approval establishes a billing input, while the invoice is the revenue posting source.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save a short hours-to-billing bridge with the seven-entry count, billable/non-billable totals, time cost, billing period, and invoice-line link. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

The 937.02 is recorded time-cost support, including the selected non-billable work. It is not a reconciliation of payroll expense or all engagement costs. Subtracting it from billed revenue gives a limited comparison, not full profit. Other engagements or periods may need different approval and billing cutoffs.

## Try One Change

Calculate the total hours worked and the billable share of those hours. Explain why neither number is an invoice amount. Then transfer the billing and ledger method to billing line **3**, a separate engagement example. Predict the posting route before retrieving its linked invoice.

<details>
<summary>Hint for the second billing record</summary>

Filter ServiceBillingLine to ID 3 and follow its stored SalesInvoiceLineID to the invoice header. Keep this engagement and billing period separate from engagement 2. Retrieve that invoice's complete voucher with its actual source type and ID.

</details>

<details>
<summary>Compare your reasoning</summary>

Of the 33.88 recorded hours, 32.67 are billable, a share of about 96.43%. Hours are a quantity of work. Applying the billing rate to the appropriate billable hours produces a billing amount, while payroll expense requires different evidence.

Billing line 3 identifies invoice line **388** on invoice **242**. Its **31.18** billed hours at **185.00** produce **5,768.30** service revenue. The complete invoice voucher balances at **6,143.24**, including **374.94** tax payable. A different total from invoice 241 is expected because the selected work, rate, and tax differ. Time approval is still support for billing rather than an additional revenue event.

</details>

## Next Steps

The company also needs goods and components. Next, follow a supplier transaction. Continue to [Follow a Purchase](receipt-to-payable.md).
