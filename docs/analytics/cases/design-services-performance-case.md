---
title: "2. Review Design Work and Billing"
description: "How does design effort become approved work, billed amounts, and recorded cost?"
sidebar_label: "2. Review Design Work and Billing"
pagination_prev: "analytics/cases/o2c-trace-case"
pagination_next: "analytics/cases/p2p-accrual-settlement-case"
case_number: 2
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

# 2. Review Design Work and Billing



The design lead is preparing a quarterly review with the controller. Several engagements overlap, and a busy month does not necessarily mean that the same month contains all related invoices. You will explain the relationship before suggesting where the lead should spend follow-up time. Predict which date describes work and which date establishes billing.

<CaseOverview slug="design-services-performance-case" />

**Worked scope.** Service work dated January 1–March 31, 2024: 204 time entries across 21 engagements. Begin with engagement 2, then use the whole defined population. Billing periods are selected by their work coverage; invoice dates remain visible.

Choose Excel or SQL; your selection carries between lessons and cases.

**Preparation:** [1. Meet the Records](/docs/learn-and-practice/meet-the-records); [2. Read an Order](/docs/learn-and-practice/read-an-order); [3. Connect the Records](/docs/learn-and-practice/connect-the-records); [7. Follow Design Time into Billing](/docs/learn-and-practice/follow-design-time-into-billing); [12. Turn Records into a Conclusion](/docs/learn-and-practice/turn-records-into-a-conclusion). Use the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) for your chosen tool.

**Ready to begin:**

- Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.
- Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.
- Distinguish work dates, approval dates, billing coverage, and invoice dates; summarize hours and costs at engagement/month grain.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| ServiceEngagement | T11_ServiceEngagement | ServiceEngagementData |
| ServiceTimeEntry | T13_ServiceTimeEntry | ServiceTimeEntryData |
| ServiceBillingLine | T18_ServiceBillingLine | ServiceBillingLineData |
| SalesInvoiceLine | T17_SalesInvoiceLine | SalesInvoiceLineData |
| SalesInvoice | T16_SalesInvoice | SalesInvoiceData |

<CaseMethods />



## Session 1 — Establish the work and its terms

Create Case02.xlsx or Case02.sql. Your Review note should distinguish work performed, approved billable hours, invoiced amounts, and cost evidence. Each has a different purpose.

<CaseFigure figureId="case02-responsibilities" />


### 1.1. Read engagement terms

**Predict before you run:** Does a planned-hours figure establish how much work actually occurred?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ServiceTimeEntryData ← ServiceTimeEntry (import here; filter Q1 2024 into TimeData)`; `Engagements ← ServiceEngagement (import here)`.

**Produced outputs:** `TimeData: 204 time-entry rows with HourlyRate formula`; `SelectedEngagements: unique selected engagements`.

1. Import ServiceTimeEntry as ServiceTimeEntryData; reference it as TimeData and filter WorkDate from January 1 through March 31, 2024.

2. Load as TimeData.

3. Import ServiceEngagement as Engagements.

4. Filter TimeData to ServiceEngagementID 2 and inspect its dates before clearing the filter.

5. Add a column named HourlyRate to TimeData and paste this formula into its first data row; copy it down through the table column if Excel does not fill it automatically:

    ~~~text title="Excel — TimeData[HourlyRate]"
    =XLOOKUP([@ServiceEngagementID],Engagements[ServiceEngagementID],Engagements[HourlyRate],"No match",0)
    ~~~

6. The final 0 requires an exact match.

7. Investigate No match rather than treating it as a zero rate.

8. In Power Query create a Reference of the filtered time query as SelectedEngagements, keep ServiceEngagementID, remove duplicates, and merge with Engagements; load as SelectedEngagements.

9. The reference reads the imported query, so worksheet formula columns are not required for this selection.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c02-terms.sql"
SELECT ServiceEngagementID,
       CustomerID,
       StartDate,
       EndDate,
       PlannedHours,
       HourlyRate
FROM ServiceEngagement
WHERE ServiceEngagementID IN (SELECT ServiceEngagementID
FROM ServiceTimeEntry
WHERE WorkDate>='2024-01-01' AND WorkDate<'2024-04-01')
ORDER BY ServiceEngagementID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 21 engagement terms. Engagement 2 belongs to customer 30, has 69.59 planned hours, and an hourly rate of 210. Its start and end dates are January 12 and February 29.

The terms provide a rate and planning context. They do not replace recorded hours or establish whether time was approved.

<details>
<summary>If your result differs</summary>

A lookup is appropriate here because ServiceEngagementID is unique in the terms table. Confirm 21 distinct keys before merging.

</details>

**Keep for the next stage:** Save the selected engagement list and engagement 2’s terms.

### 1.2. Separate time, approval, and cost

**Predict before you run:** Will all first-quarter work be approved by the quarter end?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `TimeData and its HourlyRate column (Session 1.1)`.

**Produced outputs:** `TimeData: WorkMonth and ApprovedBillable columns`; `TimeByEngagementMonth: time/approval/cost PivotTable`.

1. In TimeData add WorkMonth:

    ~~~text title="Excel — TimeData[WorkMonth]"
    =DATE(YEAR([@WorkDate]),MONTH([@WorkDate]),1)
    ~~~

2. Format WorkMonth as yyyy-mm.

3. Add ApprovedBillable; the numeric-date check prevents a blank approval from counting as approved:

    ~~~text title="Excel — TimeData[ApprovedBillable]"
    =IF(AND(ISNUMBER([@ApprovedDate]),[@ApprovedDate]<=DATE(2024,3,31)),[@BillableHours],0)
    ~~~

4. Insert a PivotTable with ServiceEngagementID and WorkMonth in Rows; Values = Count of ServiceTimeEntryID and sums of BillableHours, NonBillableHours, ApprovedBillable, ExtendedCost.

5. Rename the last measure RecordedTimeCost.

6. Clear worksheet filters before creating the PivotTable; its source should include all 204 imported rows.

</TabItem>
<TabItem value="sql">

substr(WorkDate,1,7) creates a month key from the stored ISO date. GROUP BY engagement and month keeps different engagements separate. CASE includes billable hours only when approval occurred by the cutoff.

Run each complete statement separately and retain its result before continuing.
```sql title="c02-time.sql"
SELECT ServiceEngagementID,
       substr(WorkDate,1,7) AS WorkMonth,
       COUNT(*) AS Entries,
       ROUND(SUM(BillableHours),2) AS BillableHours,
       ROUND(SUM(NonBillableHours),2) AS NonBillableHours,
       ROUND(SUM(CASE WHEN ApprovedDate<='2024-03-31' THEN BillableHours ELSE 0 END),2) AS ApprovedBillable,
       ROUND(SUM(ExtendedCost),2) AS RecordedTimeCost
FROM ServiceTimeEntry
WHERE WorkDate>='2024-01-01' AND WorkDate<'2024-04-01'
GROUP BY ServiceEngagementID,substr(WorkDate,1,7)
ORDER BY ServiceEngagementID,WorkMonth;
```


```sql title="c02-cutoff.sql"
SELECT COUNT(*) AS Entries,
       COUNT(DISTINCT ServiceEngagementID) AS Engagements,
       ROUND(SUM(BillableHours),2) AS BillableHours,
       ROUND(SUM(NonBillableHours),2) AS NonBillableHours,
       ROUND(SUM(ExtendedCost),2) AS TimeCost,
       SUM(CASE WHEN ApprovedDate IS NULL OR ApprovedDate>'2024-03-31' THEN 1 ELSE 0 END) AS NotApprovedAtCutoff
FROM ServiceTimeEntry
WHERE WorkDate>='2024-01-01' AND WorkDate<'2024-04-01';
```


</TabItem>
</ToolSteps>

**Checkpoint.** 33 engagement-month groups. Total billable hours 1,409.88; non-billable hours 73.62; recorded time cost 49,022.40. No selected entry remains unapproved at March 31. Engagement 2 has 32.67 billable hours in January and 36.92 in February.

An empty exception list is a finding about this criterion and scope. It does not justify inventing an approval problem. Non-billable time still consumes staff capacity and contributes to the recorded cost measure.

<details>
<summary>If your result differs</summary>

Use actual date types. A text date or an empty date treated as zero can distort the approval test.

</details>

**Keep for the next stage:** Save the 33-row summary and the approval cutoff check.

:::tip Session stopping point
Save terms, the 204-row source selection, and the engagement-month summary. Write what each total includes before adding invoice data.
:::



## Session 2 — Connect covered time to billing

A time row is not a billing row. Aggregate within the billing period before comparing hours; otherwise each invoice amount could repeat once for every time entry.

<CaseFigure figureId="case02-billing" />


### 2.1. Build the period reconciliation

**Predict before you run:** What happens if you join all engagement time directly to every billing line?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ServiceBillingLineData ← ServiceBillingLine (import here; filter Q1 2024 into Billing)`; `InvoiceLines ← SalesInvoiceLine and Invoices ← SalesInvoice (import here)`; `TimeData (Session 1)`.

**Produced outputs:** `Billing: billing-line detail with invoice date, covered hours, and approval comparison`.

1. Import ServiceBillingLine as ServiceBillingLineData; reference it as Billing and filter BillingPeriodStartDate on or after January 1, 2024 and BillingPeriodEndDate before April 1, 2024.

2. Load as Billing.

3. Import SalesInvoiceLine as InvoiceLines and SalesInvoice as Invoices.

4. Keep ServiceBillingLineID as the unique row key.

5. In Billing add SalesInvoiceID using the unique invoice-line key:

    ~~~text title="Excel — Billing[SalesInvoiceID]"
    =XLOOKUP([@SalesInvoiceLineID],InvoiceLines[SalesInvoiceLineID],InvoiceLines[SalesInvoiceID],"No match",0)
    ~~~

6. Add InvoiceDate using the unique invoice header key, then format it as a date:

    ~~~text title="Excel — Billing[InvoiceDate]"
    =XLOOKUP([@SalesInvoiceID],Invoices[SalesInvoiceID],Invoices[InvoiceDate],"No match",0)
    ~~~

7. Resolve any No match before calculating the approval comparison.

8. Add CoveredBillable:

    ~~~text title="Excel — Billing[CoveredBillable]"
    =SUMIFS(TimeData[BillableHours],TimeData[ServiceEngagementID],[@ServiceEngagementID],TimeData[WorkDate],">="&[@BillingPeriodStartDate],TimeData[WorkDate],"<="&[@BillingPeriodEndDate])
    ~~~

9. Add HoursApprovedByInvoice; approval must be present and no later than the invoice date:

    ~~~text title="Excel — Billing[HoursApprovedByInvoice]"
    =SUMIFS(TimeData[BillableHours],TimeData[ServiceEngagementID],[@ServiceEngagementID],TimeData[WorkDate],">="&[@BillingPeriodStartDate],TimeData[WorkDate],"<="&[@BillingPeriodEndDate],TimeData[ApprovedDate],">0",TimeData[ApprovedDate],"<="&[@InvoiceDate])
    ~~~

10. Add HoursDifference:

    ~~~text title="Excel — Billing[HoursDifference]"
    =ROUND([@BilledHours]-[@HoursApprovedByInvoice],2)
    ~~~

</TabItem>
<TabItem value="sql">

The correlated SUM uses the billing line’s engagement and inclusive coverage dates, plus approval by InvoiceDate. It returns one hours total per billing row without expanding that row once for every time entry.

Run each complete statement separately and retain its result before continuing.
```sql title="c02-billing.sql"
SELECT b.ServiceBillingLineID,
       b.ServiceEngagementID,
       b.BillingPeriodStartDate,
       b.BillingPeriodEndDate,
       b.BilledHours,
       b.LineAmount,
       i.SalesInvoiceID,
       i.InvoiceDate,
       ROUND(COALESCE((SELECT SUM(t.BillableHours)
FROM ServiceTimeEntry t
WHERE t.ServiceEngagementID=b.ServiceEngagementID AND t.WorkDate BETWEEN b.BillingPeriodStartDate AND b.BillingPeriodEndDate AND t.ApprovedDate<=i.InvoiceDate),0),2) AS HoursApprovedByInvoice
FROM ServiceBillingLine b
JOIN SalesInvoiceLine l ON l.SalesInvoiceLineID=b.SalesInvoiceLineID
JOIN SalesInvoice i ON i.SalesInvoiceID=l.SalesInvoiceID
WHERE b.BillingPeriodStartDate>='2024-01-01' AND b.BillingPeriodEndDate<'2024-04-01'
ORDER BY b.ServiceEngagementID,b.BillingPeriodStartDate,b.ServiceBillingLineID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 33 billing lines cover 1,409.88 hours and 244,865.45 of line amounts. Every billed-hours comparison agrees. Billing line 2 covers January 12–30 for engagement 2; its 32.67 hours become 6,860.70 on invoice 241 dated January 31.

Coverage dates explain which work is billed. Invoice date explains when it is invoiced. A future population may have uncovered time, overlapping periods, or approval after invoicing; retain those as exceptions rather than filling in a match.

<details>
<summary>If your result differs</summary>

If totals multiply, check whether you merged raw time rows into Billing. SUMIFS keeps the billing row unique. Compare period boundaries inclusively.

</details>

**Keep for the next stage:** Save Billing and a zero/nonzero HoursDifference check.

### 2.2. Compare effort, price, and limited cost

**Predict before you run:** Does the difference between billed amounts and recorded time cost equal engagement profit?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `TimeData and Billing (earlier stages)`.

**Produced outputs:** `EffortByEngagementMonth and BillingByEngagementMonth: separate PivotTables`; `Review: billable share and limited cost comparison; chart`.

1. Create a PivotTable from TimeData with ServiceEngagementID and WorkMonth in Rows and sums of BillableHours, NonBillableHours, and ExtendedCost in Values.

2. In Billing add WorkMonth:

    ~~~text title="Excel — Billing[WorkMonth]"
    =DATE(YEAR([@BillingPeriodStartDate]),MONTH([@BillingPeriodStartDate]),1)
    ~~~

3. Format WorkMonth as yyyy-mm.

4. Create a second PivotTable from Billing using the same Rows and sums of BilledHours and LineAmount.

5. Align the summaries by engagement and month, not row position.

6. For engagement 2 inspect January and February separately.

7. On Review label B2 Quarter billable share, enter the formula below, and format it as a percentage:

    ~~~text title="Excel — Review!B2"
    =SUM(TimeData[BillableHours])/(SUM(TimeData[BillableHours])+SUM(TimeData[NonBillableHours]))
    ~~~

8. Label B3 Billed amounts less recorded time cost and enter:

    ~~~text title="Excel — Review!B3"
    =SUM(Billing[LineAmount])-SUM(TimeData[ExtendedCost])
    ~~~

9. These totals use the full Q1 imported populations; ordinary SUM includes rows hidden by worksheet filters.

10. Create a clustered-column chart from engagement-level billable and non-billable hours using the verified summary.

</TabItem>
<TabItem value="sql">

effort and billing each return one aggregate row before they are combined. The ratio uses all selected hours; the difference uses billed line amounts and recorded time cost with the stated boundary.

Run each complete statement separately and retain its result before continuing.
```sql title="c02-bridge.sql"
WITH effort AS (SELECT SUM(BillableHours) AS Billable,
       SUM(NonBillableHours) AS NonBillable,
       SUM(ExtendedCost) AS TimeCost
FROM ServiceTimeEntry
WHERE WorkDate>='2024-01-01' AND WorkDate<'2024-04-01'), billing AS (SELECT SUM(LineAmount) AS Billed
FROM ServiceBillingLine
WHERE BillingPeriodStartDate>='2024-01-01' AND BillingPeriodEndDate<'2024-04-01') SELECT ROUND(e.Billable,2) AS BillableHours,
       ROUND(e.NonBillable,2) AS NonBillableHours,
       ROUND(100.0*e.Billable/(e.Billable+e.NonBillable),2) AS BillableSharePct,
       ROUND(b.Billed,2) AS BilledAmount,
       ROUND(e.TimeCost,2) AS RecordedTimeCost,
       ROUND(b.Billed-e.TimeCost,2) AS BilledLessTimeCost
FROM effort e CROSS
JOIN billing b;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Engagement 2: January billed amount 6,860.70 and time cost 937.02; February 7,753.20 and 1,042.22. Quarter billable share is 95.04%; billed amounts less recorded time cost is 195,843.05.

The release supports an hours-to-billing reconciliation and a limited time-cost comparison. It does not allocate every overhead, selling, support, or financing cost to each engagement. Also, an invoice is not evidence of cash collection; use Case 1 for settlement.

<details>
<summary>If your result differs</summary>

Do not subtract a full employee’s payroll from each engagement. Work-date cost and invoice-date revenue need aligned coverage before comparison.

</details>

**Keep for the next stage:** Retain the matched summaries, chart, and a 250-word memo explaining one follow-up and one limitation.

:::tip Session stopping point
Your memo should explain that the worked hours reconcile, state the cost boundary, and recommend a targeted review of non-billable effort or engagement terms without alleging missing billing.
:::

<CaseFigure figureId="case02-bridge" />



## Prepare the Decision

The reconciliation does not reveal unapproved quarter-end time or a billed-hours mismatch in this population. A useful management response is to discuss where non-billable effort occurred and whether it was planned, while preserving the distinction between billing rates and staff-cost snapshots. The evidence supports a focused operational conversation, not a claim that all engagements are equally profitable.

**Deliverable:** An engagement-period reconciliation, an hours/billing/cost bridge, and a design review memo. Include the source file, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A chart is optional in the SQL route; a clearly ordered result table can support the same conclusion.

## Independent Challenge

Repeat the investigation for April–June 2024 work. Rebuild the engagement and billing-period populations. Identify one changed result, inspect its source rows, and explain whether it reflects mix, timing, price, non-billable effort, or unresolved evidence.

<details>
<summary>Planning hint</summary>

Begin with the new work-date population. Check whether each billing period stays inside the selected quarter before comparing its entire amount with quarter-only time.

</details>

**Assessment criteria:** Assess population completeness, approval-date handling, unique billing rows, aligned coverage, precise cost labels, and a conclusion supported by source evidence. Your instructor evaluates the method, evidence, and reasoning; there is no public model answer for this challenge.

<details>
<summary>Further queries and earlier case topics</summary>



## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. They are optional references; both guided routes above are complete without them. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["design-services-performance-case"]} helperText="Choose a reference after completing the guided investigation; verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Explain Supplier Obligations at Month End](p2p-accrual-settlement-case.md). Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
