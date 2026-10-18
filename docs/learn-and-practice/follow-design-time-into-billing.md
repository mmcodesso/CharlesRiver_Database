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

**Your task:** Reconcile approved time to one service billing period and distinguish revenue from time-cost support.

<TutorialFigure figureId="follow-design-time-into-billing" />

## Before You Start

Finish the sales tutorials and read [Design Services](../processes/design-services.md). This separate example uses engagement **2**, January 2024, and service billing line **2**.

<ToolSteps>
<TabItem value="excel">

For `Lesson07.xlsx`, import `T11_ServiceEngagement` as `EngagementData` filtered to ID 2; `T13_ServiceTimeEntry` as `ServiceTimeData` filtered to engagement 2 and January WorkDate; `T18_ServiceBillingLine` as `BillingData` filtered to ID 2; and `T17_SalesInvoiceLine` as `InvoiceLineData` filtered to ID 387. Convert date fields to Date.

</TabItem>
<TabItem value="sql">

Open the released SQLite database in your SQL tool. Save this lesson's statements as **Lesson07.sql**. Run each supplied query separately; its filters identify the records and dates for that step.

</TabItem>
</ToolSteps>


These are actual synthetic records from release **v2027.1**, separate from the illustrative customer project in the company story. Use your assigned release when an instructor specifies another file; its results may differ.

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

Read the agreement, then total approved time for this engagement and work period. Approval and date filters make the population explicit. `IS NOT NULL` requires an approval date to be present; the following date condition checks when approval occurred.

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

Expect **7 approved entries**, **32.67 billable hours**, **1.21 non-billable hours**, and **937.02** of recorded time cost. Non-billable hours are still work; they are not included in this billing quantity.

## 2. Check the Billing Bridge

The billing record identifies the engagement, covered dates, and invoice line. Time entries link to this calculation through the engagement and work period; they do not each carry an invoice-line key.

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

**32.67 × 210.00 = 6,860.70**, agreeing with the billing amount and invoice-line amount. In this dataset, the invoice posts service revenue; approved time by itself does not post that revenue. Collection uses the receipt/application process you already investigated.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save a short hours-to-billing bridge with the seven-entry count, billable/non-billable totals, time cost, billing period, and invoice-line link. Record the release, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

The 937.02 is recorded time-cost support, including the selected non-billable work. It is not a reconciliation of payroll expense or all engagement costs. Subtracting it from billed revenue gives a limited comparison, not full profit. Other engagements or periods may need different approval and billing cutoffs.

## Try One Change

Calculate the total hours worked and the billable share of those hours. Explain why neither number is an invoice amount.

<details>
<summary>Compare your reasoning</summary>

Total recorded hours are 33.88; 32.67 ÷ 33.88 is about 96.43% billable. Hours are a quantity of work. Applying the billing rate to the appropriate billable hours produces a billing amount; payroll expense uses different evidence.

</details>

## Next Steps

The company also needs goods and components. Next, follow a supplier transaction. Continue to [Follow a Purchase](receipt-to-payable.md).
