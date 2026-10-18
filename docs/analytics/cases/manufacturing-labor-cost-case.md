---
title: "5. Explain Production Cost and Delivery Pressure"
description: "Do completion, recorded cost, and financial close tell the same production story?"
sidebar_label: "5. Explain Production Cost and Delivery Pressure"
pagination_prev: "analytics/cases/product-portfolio-profitability-case"
pagination_next: "analytics/cases/workforce-coverage-and-attendance-case"
case_number: 5
case_level: Intermediate
case_sessions: 3
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import CaseFigure from "@site/src/components/Cases/Figure";
import CaseMethods from "@site/src/components/Cases/Methods";
import { CaseOverview } from "@site/src/components/CaseExplorer";
import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# 5. Explain Production Cost and Delivery Pressure

<span id="business-scenario"></span>
<span id="the-problem-to-solve"></span>
<span id="learning-objectives"></span>

The operations planner wants to change a schedule after a difficult production period. The controller asks whether late completion, material usage, labor support, and cost variance point to the same cause. You will examine the January release cohort, trace two work orders, and identify the operational evidence needed before recommending a change.

<CaseOverview slug="manufacturing-labor-cost-case" />

**Worked scope.** 336 work orders released January 1–31, 2024, with events assessed through February 29. Begin with work order 1 and compare work order 67. Capacity comparisons cover all scheduled work in the selected work centers and dates, not only the January cohort.

The management request is an illustrative company scenario. The worked records are actual synthetic records from release **v2027.1**, separate from the fictional furnishing project. Your assigned release may differ. Complete either tool route; your Excel/SQL choice follows you between lessons and cases.

**Preparation:** [1. Meet the Records](/docs/learn-and-practice/meet-the-records); [2. Read an Order](/docs/learn-and-practice/read-an-order); [3. Connect the Records](/docs/learn-and-practice/connect-the-records); [9. Follow Manufacturing Costs](/docs/learn-and-practice/manufacturing-cost-flow); [Manufacturing process chapter](/docs/processes/manufacturing). Use the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) for your chosen tool.

**Ready to begin:**

- Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.
- Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.
- Aggregate issue, labor, completion, and close independently by work order; compare capacity at one row per center/day.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| WorkOrder | T51_WorkOrder | WorkOrderData |
| WorkOrderOperation | T52_WorkOrderOperation | WorkOrderOperationData |
| WorkOrderOperationSchedule | T53_WorkOrderOperationSchedule | WorkOrderOperationScheduleData |
| MaterialIssue | T54_MaterialIssue | MaterialIssueData |
| MaterialIssueLine | T55_MaterialIssueLine | MaterialIssueLineData |
| LaborTimeEntry | T60_LaborTimeEntry | LaborTimeEntryData |
| ProductionCompletion | T56_ProductionCompletion | ProductionCompletionData |
| ProductionCompletionLine | T57_ProductionCompletionLine | ProductionCompletionLineData |
| WorkOrderClose | T58_WorkOrderClose | WorkOrderCloseData |
| WorkCenter | T47_WorkCenter | WorkCenterData |
| WorkCenterCalendar | T48_WorkCenterCalendar | WorkCenterCalendarData |
| SupplyPlanRecommendation | T80_SupplyPlanRecommendation | SupplyPlanRecommendationData |
| DemandForecast | T78_DemandForecast | DemandForecastData |

<CaseMethods />

<span id="step-1-define-the-demand-signal-and-forecast-quality"></span>
<span id="step-2-explain-what-is-driving-the-recommendation-pool"></span>
<span id="step-1-define-the-standard-cost-baseline"></span>
<span id="step-2-trace-one-work-order-through-operations-and-scheduled-hours"></span>

## Session 1 — Define the cohort and read the plan

Create Case05.xlsx or Case05.sql. A release-date cohort stays fixed even when completion or close occurs in a later month. Keep actual event dates visible.

<CaseFigure figureId="case05-planning" />


### 1.1. Keep the release cohort fixed

**Predict before you run:** Would filtering by completion month answer the same question as filtering by release month?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `WorkOrderData ← WorkOrder (import here)`.

**Produced outputs:** `Orders: fixed January 2024 release cohort; 336 rows, missing dates retained`.

1. Import WorkOrder as WorkOrderData.

2. Reference it as Orders and filter ReleasedDate January 1–31, 2024, preserving the raw query.

3. Load as Orders, keeping IDs and all date fields.

4. Label Review!B2 Release cohort and enter:

    ~~~text title="Excel — Review!B2"
    =ROWS(Orders[WorkOrderID])
    ~~~

5. Add CompletedByCutoff to Orders:

    ~~~text title="Excel — Orders[CompletedByCutoff]"
    =IF(AND(ISNUMBER([@CompletedDate]),[@CompletedDate]<=DATE(2024,2,29)),1,0)
    ~~~

6. Add ClosedByCutoff:

    ~~~text title="Excel — Orders[ClosedByCutoff]"
    =IF(AND(ISNUMBER([@ClosedDate]),[@ClosedDate]<=DATE(2024,2,29)),1,0)
    ~~~

7. Add MissingPlanLink:

    ~~~text title="Excel — Orders[MissingPlanLink]"
    =IF([@SupplyPlanRecommendationID]="",1,0)
    ~~~

8. Do not filter away missing dates or links.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c05-cohort.sql"
SELECT WorkOrderID,
       ItemID,
       PlannedQuantity,
       ReleasedDate,
       DueDate,
       CompletedDate,
       ClosedDate,
       SupplyPlanRecommendationID
FROM WorkOrder
WHERE ReleasedDate>='2024-01-01' AND ReleasedDate<'2024-02-01'
ORDER BY WorkOrderID;
```


```sql title="c05-timing.sql"
SELECT COUNT(*) AS Orders,
       SUM(CASE WHEN CompletedDate<='2024-02-29' THEN 1 ELSE 0 END) AS CompletedByCutoff,
       SUM(CASE WHEN ClosedDate<='2024-02-29' THEN 1 ELSE 0 END) AS ClosedByCutoff,
       SUM(CASE WHEN CompletedDate<='2024-02-29' AND CompletedDate>DueDate THEN 1 ELSE 0 END) AS CompletedAfterDueDate,
       SUM(CASE WHEN SupplyPlanRecommendationID IS NULL THEN 1 ELSE 0 END) AS MissingPlanLink,
       SUM(CASE WHEN CompletedDate<ReleasedDate THEN 1 ELSE 0 END) AS CompletionBeforeRelease
FROM WorkOrder
WHERE ReleasedDate>='2024-01-01' AND ReleasedDate<'2024-02-01';
```


</TabItem>
</ToolSteps>

**Checkpoint.** 336 released orders; 336 completed by February 29 but only 290 closed. 136 completed after their due date. One lacks a planning link; one has completion before release.

Completion and close measure different responsibilities. A chronology anomaly also means these dates require source follow-up before a scheduling recommendation relies on them.

<details>
<summary>If your result differs</summary>

Current Status is not an as-of measure. Test the actual dates against the cutoff and retain missing links.

</details>

**Keep for the next stage:** Save Orders and the timing counts, including the exceptions.

### 1.2. Trace the two operation paths

**Predict before you run:** Can a work order be completed in the file even when its operation support is missing?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `WorkOrderOperationData ← WorkOrderOperation and WorkOrderOperationScheduleData ← WorkOrderOperationSchedule (import here)`.

**Produced outputs:** `SelectedOperations: operations for WO1/WO67`; `ScheduleByOperation: dated schedule summary`; `OperationTrace: selected operations with schedule support`.

1. Import WorkOrderOperation as WorkOrderOperationData and WorkOrderOperationSchedule as WorkOrderOperationScheduleData; preserve the raw queries.

2. Reference WorkOrderOperationData as SelectedOperations and filter WorkOrderID 1 or 67.

3. Reference WorkOrderOperationScheduleData as ScheduleByOperation, filter ScheduleDate through February 29, 2024, and group by WorkOrderOperationID, Sum ScheduledHours as ScheduledHours.

4. Reference SelectedOperations as OperationTrace, Left merge ScheduleByOperation on WorkOrderOperationID, and sort by WorkOrderID then OperationSequence.

5. Keep PlannedLoadHours and actual start/end dates beside the schedule total.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c05-operations.sql"
SELECT o.WorkOrderID,
       o.WorkOrderOperationID,
       o.OperationSequence,
       o.WorkCenterID,
       o.PlannedLoadHours,
       o.PlannedStartDate,
       o.PlannedEndDate,
       o.ActualStartDate,
       o.ActualEndDate,
       ROUND(COALESCE(SUM(CASE WHEN s.ScheduleDate<='2024-02-29' THEN s.ScheduledHours ELSE 0 END),0),2) AS ScheduledThroughCutoff
FROM WorkOrderOperation o
LEFT JOIN WorkOrderOperationSchedule s ON s.WorkOrderOperationID=o.WorkOrderOperationID
WHERE o.WorkOrderID IN (1,67)
GROUP BY o.WorkOrderOperationID
ORDER BY o.WorkOrderID,o.OperationSequence,o.WorkOrderOperationID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Four operation rows for work order 67, progressing through work centers 1–4. No operation rows are returned for work order 1. WO67’s scheduled hours are 9.47, 19.28, 11.45, and 4.44 by operation sequence.

The absence of operation detail for WO1 is an evidence limitation, not proof that no work happened. Other documents still record its material issue and completion. Compare support completeness before inferring efficiency.

<details>
<summary>If your result differs</summary>

Do not use an Inner join from Orders to Operations for the cohort summary; it would hide WO1.

</details>

**Keep for the next stage:** Save the operation trace and a note about WO1’s missing support.

:::tip Session stopping point
Retain the 336-order cohort and the four-row comparison trace. State what the planning records can establish and what actual-event evidence is still needed.
:::

<span id="step-3-measure-projected-availability-and-stockout-risk"></span>
<span id="step-4-show-where-planning-pressure-escalates-into-urgency-and-conversion"></span>
<span id="step-3-connect-approved-clocks-to-productive-labor-and-direct-labor-cost"></span>
<span id="step-4-move-from-completion-to-close-and-ledger-impact"></span>

## Session 2 — Build costs at one row per work order

Materials, labor support, completions, and close records each have their own grain. Summarize them separately before merging to the cohort.

<CaseFigure figureId="case05-costs" />


### 2.1. Prepare the four event summaries

**Predict before you run:** How would joining raw issue lines to raw labor entries change the totals?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Orders (Session 1.1)`; `MaterialIssueLineData ← MaterialIssueLine and MaterialIssueData ← MaterialIssue (import here)`; `LaborTimeEntryData ← LaborTimeEntry (import here)`; `ProductionCompletionLineData ← ProductionCompletionLine and ProductionCompletionData ← ProductionCompletion (import here)`; `WorkOrderCloseData ← WorkOrderClose (import here)`.

**Produced outputs:** `IssuesByWorkOrder, LaborByWorkOrder, CompletionsByWorkOrder, ClosesByWorkOrder: separate one-row-per-work-order summaries`; `CostBridge: all 336 cohort orders; unclosed variance remains null`.

1. Import MaterialIssueLine as MaterialIssueLineData, MaterialIssue as MaterialIssueData, LaborTimeEntry as LaborTimeEntryData, ProductionCompletionLine as ProductionCompletionLineData, ProductionCompletion as ProductionCompletionData, and WorkOrderClose as WorkOrderCloseData.

2. Keep those raw queries unchanged.

3. Create four references and summarize before merging.

4. IssuesByWorkOrder: merge MaterialIssueLineData to MaterialIssueData on MaterialIssueID, filter IssueDate through February 29, group by WorkOrderID and sum ExtendedStandardCost as Issued.

5. LaborByWorkOrder: filter LaborTimeEntryData WorkDate through February 29, group by WorkOrderID and sum ExtendedLaborCost as LaborSupport.

6. CompletionsByWorkOrder: merge ProductionCompletionLineData to ProductionCompletionData on ProductionCompletionID, filter CompletionDate through February 29, group by WorkOrderID and sum QuantityCompleted as CompletedQty, ExtendedStandardMaterialCost as CompletedMaterials, ExtendedStandardConversionCost as CompletedConversion, and ExtendedStandardTotalCost as CompletedTotal.

7. ClosesByWorkOrder: filter WorkOrderCloseData CloseDate through February 29, group by WorkOrderID and sum MaterialVarianceAmount as MaterialVariance, ConversionVarianceAmount as ConversionVariance, and TotalVarianceAmount as TotalVariance.

8. Reference Orders as CostBridge and Left merge these four unique-key summaries on WorkOrderID; load as CostBridge.

9. Replace missing issue/labor/completion totals with zero only after checking event absence.

10. Leave missing close variances blank, meaning no close by cutoff.

</TabItem>
<TabItem value="sql">

Four named results summarize issues, labor, completions, and closes separately by WorkOrderID. LEFT JOIN adds these totals to the fixed release cohort. Missing close totals stay null, distinguishing an unclosed order from a zero variance.

Run each complete statement separately and retain its result before continuing.
```sql title="c05-costs.sql"
WITH issues AS (SELECT h.WorkOrderID,
       SUM(l.ExtendedStandardCost) AS Issued
FROM MaterialIssue h
JOIN MaterialIssueLine l ON l.MaterialIssueID=h.MaterialIssueID
WHERE h.IssueDate<='2024-02-29'
GROUP BY h.WorkOrderID), labor AS (SELECT WorkOrderID,
       SUM(ExtendedLaborCost) AS LaborSupport
FROM LaborTimeEntry
WHERE WorkDate<='2024-02-29'
GROUP BY WorkOrderID), completions AS (SELECT h.WorkOrderID,
       SUM(l.QuantityCompleted) AS CompletedQty,
       SUM(l.ExtendedStandardMaterialCost) AS CompletedMaterials,
       SUM(l.ExtendedStandardConversionCost) AS CompletedConversion,
       SUM(l.ExtendedStandardTotalCost) AS CompletedTotal
FROM ProductionCompletion h
JOIN ProductionCompletionLine l ON l.ProductionCompletionID=h.ProductionCompletionID
WHERE h.CompletionDate<='2024-02-29'
GROUP BY h.WorkOrderID), closes AS (SELECT WorkOrderID,
       SUM(MaterialVarianceAmount) AS MaterialVariance,
       SUM(ConversionVarianceAmount) AS ConversionVariance,
       SUM(TotalVarianceAmount) AS TotalVariance
FROM WorkOrderClose
WHERE CloseDate<='2024-02-29'
GROUP BY WorkOrderID) SELECT w.WorkOrderID,
       ROUND(COALESCE(i.Issued,0),2) AS Issued,
       ROUND(COALESCE(l.LaborSupport,0),2) AS LaborSupport,
       ROUND(COALESCE(c.CompletedQty,0),2) AS CompletedQty,
       ROUND(COALESCE(c.CompletedMaterials,0),2) AS CompletedMaterials,
       ROUND(COALESCE(c.CompletedConversion,0),2) AS CompletedConversion,
       ROUND(COALESCE(c.CompletedTotal,0),2) AS CompletedTotal,
       x.MaterialVariance,
       x.ConversionVariance,
       x.TotalVariance
FROM WorkOrder w
LEFT JOIN issues i ON i.WorkOrderID=w.WorkOrderID
LEFT JOIN labor l ON l.WorkOrderID=w.WorkOrderID
LEFT JOIN completions c ON c.WorkOrderID=w.WorkOrderID
LEFT JOIN closes x ON x.WorkOrderID=w.WorkOrderID
WHERE w.ReleasedDate>='2024-01-01' AND w.ReleasedDate<'2024-02-01'
ORDER BY w.WorkOrderID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 336 rows remain. WO1: issue 754.29, labor support 191.89, completion materials 729.36, conversion 290.49, completed total 1,019.85. Its material variance is 24.93 and conversion variance 718.23, totaling 743.16.

Material issue less standard material completion equals the material variance for this closed example. Labor support is only one cost input; it is not the whole actual conversion cost. Do not force it to equal completion conversion plus close variance.

<details>
<summary>If your result differs</summary>

Do not add direct labor and overhead variance again after using ConversionVarianceAmount; that amount already combines them.

</details>

**Keep for the next stage:** Save CostBridge and a WO1 bridge with units and cost basis labeled.

### 2.2. Compare a contrasting cost result

**Predict before you run:** Is the largest absolute variance also the largest variance relative to output?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `CostBridge (Session 2.1)`.

**Produced outputs:** `CostBridge: AbsVariance and VariancePerCompletedUnit columns`; `Review: separate WO1/WO67 cost and timing comparison`.

1. In CostBridge add AbsVariance; leave unclosed orders blank:

    ~~~text title="Excel — CostBridge[AbsVariance]"
    =IF([@TotalVariance]="","",ABS([@TotalVariance]))
    ~~~

2. Filter TotalVariance nonblank and sort AbsVariance descending.

3. Inspect WO67.

4. Retain the ReleasedDate, DueDate, CompletedDate, and ClosedDate columns carried from Orders in the previous merges.

5. Compare WO1 and WO67 on completed quantity, total completion cost, material variance, and conversion variance.

6. Add VariancePerCompletedUnit only where a close exists and completed quantity is positive:

    ~~~text title="Excel — CostBridge[VariancePerCompletedUnit]"
    =IF(OR([@TotalVariance]="",[@CompletedQty]<=0),"",[@TotalVariance]/[@CompletedQty])
    ~~~

7. Keep LaborSupport in a separate column.

</TabItem>
<TabItem value="sql">

This repeats the same independently aggregated cost method for WO1 and WO67. It is executable by itself; it does not depend on a temporary table created in another step.

Run each complete statement separately and retain its result before continuing.
```sql title="c05-contrast.sql"
WITH issues AS (SELECT h.WorkOrderID,
       SUM(l.ExtendedStandardCost) AS Issued
FROM MaterialIssue h
JOIN MaterialIssueLine l ON l.MaterialIssueID=h.MaterialIssueID
WHERE h.IssueDate<='2024-02-29'
GROUP BY h.WorkOrderID), labor AS (SELECT WorkOrderID,
       SUM(ExtendedLaborCost) AS LaborSupport
FROM LaborTimeEntry
WHERE WorkDate<='2024-02-29'
GROUP BY WorkOrderID), completions AS (SELECT h.WorkOrderID,
       SUM(l.QuantityCompleted) AS CompletedQty,
       SUM(l.ExtendedStandardMaterialCost) AS CompletedMaterials,
       SUM(l.ExtendedStandardConversionCost) AS CompletedConversion,
       SUM(l.ExtendedStandardTotalCost) AS CompletedTotal
FROM ProductionCompletion h
JOIN ProductionCompletionLine l ON l.ProductionCompletionID=h.ProductionCompletionID
WHERE h.CompletionDate<='2024-02-29'
GROUP BY h.WorkOrderID), closes AS (SELECT WorkOrderID,
       SUM(MaterialVarianceAmount) AS MaterialVariance,
       SUM(ConversionVarianceAmount) AS ConversionVariance,
       SUM(TotalVarianceAmount) AS TotalVariance
FROM WorkOrderClose
WHERE CloseDate<='2024-02-29'
GROUP BY WorkOrderID) SELECT w.WorkOrderID,
       ROUND(COALESCE(i.Issued,0),2) AS Issued,
       ROUND(COALESCE(l.LaborSupport,0),2) AS LaborSupport,
       ROUND(COALESCE(c.CompletedQty,0),2) AS CompletedQty,
       ROUND(COALESCE(c.CompletedMaterials,0),2) AS CompletedMaterials,
       ROUND(COALESCE(c.CompletedConversion,0),2) AS CompletedConversion,
       ROUND(COALESCE(c.CompletedTotal,0),2) AS CompletedTotal,
       x.MaterialVariance,
       x.ConversionVariance,
       x.TotalVariance
FROM WorkOrder w
LEFT JOIN issues i ON i.WorkOrderID=w.WorkOrderID
LEFT JOIN labor l ON l.WorkOrderID=w.WorkOrderID
LEFT JOIN completions c ON c.WorkOrderID=w.WorkOrderID
LEFT JOIN closes x ON x.WorkOrderID=w.WorkOrderID
WHERE w.ReleasedDate>='2024-01-01' AND w.ReleasedDate<'2024-02-01' AND w.WorkOrderID IN(1,67)
ORDER BY w.WorkOrderID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** WO67 has the largest absolute closed variance in this cohort: 5,463.38, including 647.23 material and 4,816.15 conversion. It completed 32.99 units at 20,387.82 standard total cost. It completed February 7 against a February 4 due date and closed February 13.

The larger absolute variance partly reflects scale. It also has operation support that WO1 lacks. Inspect the dates and cost components before attributing the difference to worker productivity or a particular work center.

<details>
<summary>If your result differs</summary>

A blank variance is not a zero variance. Rank closed orders only and show the 46 orders not yet closed separately.

</details>

**Keep for the next stage:** Save the two-order comparison and two competing explanations.

:::tip Session stopping point
Your cost bridge should preserve 336 orders and separate missing close evidence from zero variances. Save the two-order comparison before examining capacity.
:::

<span id="step-5-connect-replenishment-pressure-to-rough-cut-capacity-response"></span>
<span id="step-5-extend-the-case-into-control-follow-up"></span>

## Session 3 — Relate timing to capacity and recommend a follow-up

A cohort’s late completion can coincide with capacity pressure without proving causation. Compare dates and work centers, then identify the evidence needed to test the explanation.

<CaseFigure figureId="case05-grains" />


### 3.1. Look beneath the period capacity total

**Predict before you run:** Could total scheduled hours be below capacity while individual days are over capacity?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `WorkOrderOperationScheduleData (raw query from Session 1.2)`; `WorkCenterCalendarData ← WorkCenterCalendar (import here)`.

**Produced outputs:** `LoadByCenterDay: one schedule total per center/day`; `DailyCapacity: one calendar capacity row per center/day; retained for inspection`; `UnmatchedScheduleDates: reverse Left anti merge`; `CapacityByCenter: independently summed daily capacity/load`.

1. Reference the raw WorkOrderOperationScheduleData as LoadByCenterDay, filter ScheduleDate January 1–February 29, 2024, group by WorkCenterID and ScheduleDate, and sum ScheduledHours.

2. Import WorkCenterCalendar as WorkCenterCalendarData.

3. Reference it as DailyCapacity and filter CalendarDate to the same dates.

4. Left merge DailyCapacity to LoadByCenterDay on WorkCenterID and CalendarDate = ScheduleDate, selecting keys in that order.

5. Replace unmatched scheduled totals with zero after checking for schedule dates absent from the calendar: reference LoadByCenterDay as UnmatchedScheduleDates and Left anti merge to DailyCapacity on the same two keys, in the same order.

6. In Power Query add a Custom Column named AboveCapacity:

    ~~~text title="Power Query — Daily capacity / AboveCapacity"
    if [ScheduledHours] > [AvailableHours] then 1 else 0
    ~~~

7. Preserve DailyCapacity; reference it as CapacityByCenter and group by WorkCenterID to sum available hours, scheduled hours, and AboveCapacity.

8. For WO67’s centers inspect daily rows around January 30–February 5.

</TabItem>
<TabItem value="sql">

Daily schedule totals are joined to the calendar before work-center aggregation. DaysAboveCapacity counts daily peaks; comparing only two period totals would lose them.

Run each complete statement separately and retain its result before continuing.
```sql title="c05-capacity.sql"
WITH load AS (SELECT WorkCenterID,
       ScheduleDate,
       SUM(ScheduledHours) AS Hours
FROM WorkOrderOperationSchedule
WHERE ScheduleDate>='2024-01-01' AND ScheduleDate<='2024-02-29'
GROUP BY WorkCenterID,ScheduleDate) SELECT c.WorkCenterID,
       ROUND(SUM(c.AvailableHours),2) AS AvailableHours,
       ROUND(SUM(COALESCE(l.Hours,0)),2) AS ScheduledHours,
       SUM(CASE WHEN COALESCE(l.Hours,0)>c.AvailableHours THEN 1 ELSE 0 END) AS DaysAboveCapacity
FROM WorkCenterCalendar c
LEFT JOIN load l ON l.WorkCenterID=c.WorkCenterID AND l.ScheduleDate=c.CalendarDate
WHERE c.CalendarDate>='2024-01-01' AND c.CalendarDate<='2024-02-29'
GROUP BY c.WorkCenterID
ORDER BY c.WorkCenterID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Assembly: 9,230.89 available hours, 5,316.59 scheduled, but two days above capacity. Finishing and Test has seven days above capacity. Period totals alone conceal daily peaks.

This capacity comparison covers all scheduled work, so it provides context for the cohort rather than allocating all capacity pressure to it. Available work-center hours are not interchangeable with employee paid hours.

<details>
<summary>If your result differs</summary>

Keep calendar dates with no load. Check calendar coverage before concluding there are no overloaded days.

</details>

**Keep for the next stage:** Save the center summary and one daily detail view supporting or weakening your explanation.

### 3.2. Prepare the production review

**Predict before you run:** What can you recommend now, and what still needs an operational explanation?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Orders, CostBridge, DailyCapacity, and CapacityByCenter (earlier stages)`.

**Produced outputs:** `Review: timing, cost, and capacity sections; recommendation and chart`.

1. Build Review with three sections: cohort timing, two-order cost comparison, and capacity context.

2. Link their verified results.

3. Create a column chart for the five centers’ counts of days above capacity.

4. Write a recommendation that names the planner or production role, identifies a specific date/center or missing record to inspect, and explains how that inspection would affect the proposed schedule change.

</TabItem>
<TabItem value="sql">

Use the saved result tables from the preceding stages to construct this comparison and written interpretation. Retain the query names, filters, source keys, and amounts in your case notes. An ordered result table can communicate the comparison without making a chart or switching tools.

</TabItem>
</ToolSteps>

**Checkpoint.** The worked evidence shows 46 completed but unclosed orders, missing operation support for WO1, and daily capacity peaks despite spare period totals. These are distinct follow-ups.

Recommend checking daily scheduling and missing support before changing staffing or treating variance as inefficiency. A cost variance, a late completion, and a documentation gap need not share one cause.

<details>
<summary>If your result differs</summary>

Do not claim that spare aggregate hours prove enough capacity on every day, or that standard-cost variance measures cash overspending.

</details>

**Keep for the next stage:** Save a 400–500 word memo with one prioritized action and a stated alternative explanation.

:::tip Session stopping point
Save a reproducible cost bridge and a bounded recommendation. Keep unresolved evidence visible.
:::

<CaseFigure figureId="case05-timeline" />

<span id="required-student-output"></span>
<span id="wrap-up-questions"></span>
<span id="limitations-and-judgment"></span>

## Prepare the Decision

The production review should separate cost accounting from operational timing. The data supports specific investigations into documentation, daily capacity peaks, and the 46 orders awaiting close at the cutoff. It does not support a blanket conclusion that employees were inefficient or that every late order arose from inadequate capacity.

**Deliverable:** A work-order cost bridge, completion/close comparison, capacity evidence, and a production review memo. Include the release, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A chart is optional in the SQL route; a clearly ordered result table can support the same conclusion.

## Independent Challenge

Use work orders released in February 2024 and assess events through March 31. Rebuild all four cost summaries, select a contrasting order by an explicit rule, and defend one operational follow-up.

<details>
<summary>Planning hint</summary>

Keep the release cohort fixed while changing event cutoffs. Do not select only orders that eventually close; that would remove the unfinished population you need to explain.

</details>

**Assessment criteria:** Assess cohort integrity, separate aggregation, standard versus actual support, completion versus close, capacity scope, and a recommendation that acknowledges uncertainty. Your instructor evaluates the method, evidence, and reasoning; there is no public model answer for this challenge.

## Optional worked extension — Read the replenishment support

Follow WO67’s recommendation 777 into its item, warehouse, and planning week. This is one planning trace, not a reconstruction of the whole planning system.


<ToolSteps>
<TabItem value="excel">

**Named inputs:** `SupplyPlanRecommendationData ← SupplyPlanRecommendation and DemandForecastData ← DemandForecast (import here)`.

**Produced outputs:** `PlanningSupport: recommendation 777 matched to current forecast by item/warehouse/week`.

1. Import SupplyPlanRecommendation as SupplyPlanRecommendationData and reference it to filter ID 777.

2. Import DemandForecast as DemandForecastData and filter IsCurrent = 1.

3. Reference the selected recommendation as PlanningSupport and Left merge on ItemID, WarehouseID, and BucketWeekStartDate = ForecastWeekStartDate in that order.

4. Keep forecast approval and recommended quantity separate; a gross requirement can include more than forecast demand.

</TabItem>
<TabItem value="sql">

Use the following source trace for this optional extension.
```sql title="c05-planning.sql"
SELECT s.SupplyPlanRecommendationID,
       s.ItemID,
       s.WarehouseID,
       s.BucketWeekStartDate,
       s.BucketWeekEndDate,
       s.DriverType,
       s.GrossRequirementQuantity,
       s.ProjectedAvailableQuantity,
       s.RecommendedOrderQuantity,
       s.NeedByDate,
       s.ReleaseByDate,
       f.DemandForecastID,
       f.ForecastQuantity,
       f.ApprovedDate
FROM SupplyPlanRecommendation s
LEFT JOIN DemandForecast f ON f.ItemID=s.ItemID AND f.WarehouseID=s.WarehouseID AND f.ForecastWeekStartDate=s.BucketWeekStartDate AND f.IsCurrent=1
WHERE s.SupplyPlanRecommendationID=777
ORDER BY f.DemandForecastID;
```


</TabItem>
</ToolSteps>

**Worked check.** Recommendation 777 has Sales Backlog as its driver, gross requirement 36.25, recommended quantity 32.99, and need-by date February 4. The matching current forecast is 10.96, approved January 19. Forecast alone therefore does not explain the recommendation quantity; keep backlog, availability, and the recommendation calculation distinct.

<details>
<summary>Further queries and earlier case topics</summary>

<span id="optional-excel-follow-through"></span>

## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. They are optional references; both guided routes above are complete without them. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["manufacturing-labor-cost-case"]} helperText="Choose a reference after completing the guided investigation; verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Explain Staffing, Overtime, and Payroll Cost](workforce-coverage-and-attendance-case.md). Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
