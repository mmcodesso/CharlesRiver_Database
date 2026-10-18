---
title: "9. Follow Manufacturing Costs"
description: "Separate material issue, standard-cost completion, and the later close of one work order."
sidebar_label: "9. Follow Manufacturing Costs"
pagination_prev: "learn-and-practice/receipt-to-payable"
pagination_next: "learn-and-practice/follow-hours-into-payroll"
tutorial_number: 9
toc_max_heading_level: 2
slug: "/learn-and-practice/manufacturing-cost-flow"
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 9. Follow Manufacturing Costs

<span id="context-and-problem"></span>

The operations planner sees that work order **1** has produced its finished goods. The controller still needs to close the costs. Inspect the events separately: physical completion and accounting close answer different questions.

<span id="learning-objectives"></span>

**Your task:** Separate material issue, standard-cost completion, and the later close of one work order.

<TutorialFigure figureId="manufacturing-cost-flow" />

## Before You Start

Read [Manufacturing](../processes/manufacturing.md). This work order is a separate released example, not a claimed production link to the earlier sales or purchase examples.

<ToolSteps>
<TabItem value="excel">

In `Lesson09.xlsx`, import `T51_WorkOrder` as `WorkOrderData` filtered to ID 1; `T54_MaterialIssue` as `IssueData` filtered to WorkOrderID 1; `T55_MaterialIssueLine` as `IssueLineData` filtered to MaterialIssueID 1; `T56_ProductionCompletion` as `CompletionData` filtered to WorkOrderID 1; `T57_ProductionCompletionLine` as `CompletionLineData` filtered to ProductionCompletionID 1 **or** 2; and `T58_WorkOrderClose` as `CloseData` filtered to WorkOrderID 1.

</TabItem>
<TabItem value="sql">

Open the released SQLite database in your SQL tool. Save this lesson's statements as **Lesson09.sql**. Run each supplied query separately; its filters identify the records and dates for that step.

</TabItem>
</ToolSteps>


These are actual synthetic records from release **v2027.1**, separate from the illustrative customer project in the company story. Use your assigned release when an instructor specifies another file; its results may differ.

<span id="evidence-workflow"></span>

## 1. Identify the Work and Material Issue

The work order plans a product and quantity. A material issue records components moving into work in process (WIP). Component quantities are different from finished-good quantities.

<ToolSteps>
<TabItem value="excel">

Read the work-order number, item, planned quantity, and dates from `WorkOrderData`. On Notes label B2 Issued standard cost and enter:

```text title="Excel — Notes!B2"
=SUM(IssueLineData[ExtendedStandardCost])
```

 Read the issue date from `IssueData`. Do not add component quantities to finished-good quantities.

</TabItem>
<TabItem value="sql">

Read the work-order header, then aggregate the material issue at its own event grain.

```sql title="l09-work-order.sql"
SELECT WorkOrderID, WorkOrderNumber, ItemID, PlannedQuantity,
       ReleasedDate, CompletedDate, ClosedDate
FROM WorkOrder
WHERE WorkOrderID = 1;
```


```sql title="l09-material-issue.sql"
SELECT m.MaterialIssueID, m.IssueDate, COUNT(*) AS ComponentLines,
       ROUND(SUM(l.ExtendedStandardCost), 2) AS IssuedCost
FROM MaterialIssue AS m
JOIN MaterialIssueLine AS l ON l.MaterialIssueID = m.MaterialIssueID
WHERE m.WorkOrderID = 1
GROUP BY m.MaterialIssueID, m.IssueDate
ORDER BY m.IssueDate, m.MaterialIssueID;
```


</TabItem>
</ToolSteps>

Work order **WO-2024-000001** plans **7.03** units of item **231**. Material issue **1**, dated **2024-01-17**, has **two component lines** costing **754.29**. These are recorded synthetic quantities and costs; retain the supplied precision.

## 2. Separate Completion from Close

Completion moves goods into finished inventory at standard cost. Close later resolves the work order's remaining material and conversion cost differences.

<ToolSteps>
<TabItem value="excel">

Merge `CompletionData` with `CompletionLineData` on `ProductionCompletionID`, using the merge procedure from Lesson 4. Expand `QuantityCompleted`, `ExtendedStandardMaterialCost`, `ExtendedStandardConversionCost`, and `ExtendedStandardTotalCost`. Keep both completion rows and load the merged table as CompletionTrace. On Notes label B3 Completed quantity, B4 Completed materials, B5 Completed conversion, and B6 Completed total. Enter each total:

```text title="Excel — Notes!B3"
=SUM(CompletionTrace[QuantityCompleted])
```



```text title="Excel — Notes!B4"
=SUM(CompletionTrace[ExtendedStandardMaterialCost])
```



```text title="Excel — Notes!B5"
=SUM(CompletionTrace[ExtendedStandardConversionCost])
```



```text title="Excel — Notes!B6"
=SUM(CompletionTrace[ExtendedStandardTotalCost])
```

Read CloseData and compare its date with the last completion date. Label Notes!B7 Variance components and B8 Stored variance; enter:

```text title="Excel — Notes!B7"
=SUM(CloseData[MaterialVarianceAmount])+SUM(CloseData[ConversionVarianceAmount])
```



```text title="Excel — Notes!B8"
=SUM(CloseData[TotalVarianceAmount])
```



</TabItem>
<TabItem value="sql">

Keep the completion result separate from the close result. Joining both directly to every material line could multiply measures.

```sql title="l09-completions.sql"
SELECT p.ProductionCompletionID, p.CompletionDate,
       l.QuantityCompleted, l.ExtendedStandardMaterialCost,
       l.ExtendedStandardConversionCost, l.ExtendedStandardTotalCost
FROM ProductionCompletion AS p
JOIN ProductionCompletionLine AS l
    ON l.ProductionCompletionID = p.ProductionCompletionID
WHERE p.WorkOrderID = 1
ORDER BY p.CompletionDate, p.ProductionCompletionID;
```


```sql title="l09-close.sql"
SELECT WorkOrderCloseID, CloseDate, MaterialVarianceAmount,
       DirectLaborVarianceAmount, OverheadVarianceAmount,
       ConversionVarianceAmount, TotalVarianceAmount
FROM WorkOrderClose
WHERE WorkOrderID = 1;
```


</TabItem>
</ToolSteps>

Completions on **January 25 and 26** total **7.03 units**, **729.36** standard material cost, **290.49** standard conversion cost, and **1,019.85** total standard cost. Close occurs on **February 1**.

The close records material variance **24.93** and conversion variance **718.23**, totaling **743.16**. Conversion variance already includes direct labor **6.22** and overhead **712.01**; adding all four variance columns would count parts twice.

## 3. Read Actual Labor Support Separately

Actual labor support helps explain production cost, but it is not the standard conversion amount used on completion.

<ToolSteps>
<TabItem value="excel">

Import `T60_LaborTimeEntry` as `LaborData`, filtered to `WorkOrderID = 1`. Inspect its `EmployeeID`, `WorkDate`, `ApprovedDate`, hours, and `ExtendedLaborCost`. In Notes!B10 total only ExtendedLaborCost:

```text title="Excel — Notes!B10"
=SUM(LaborData[ExtendedLaborCost])
```

 Label it **Recorded labor support**, keeping it separate from the completion totals.

</TabItem>
<TabItem value="sql">

This query deliberately retains the work-order labor population separately from material and completion records.

```sql title="l09-labor-support.sql"
SELECT LaborTimeEntryID, EmployeeID, WorkDate, RegularHours,
       OvertimeHours, ExtendedLaborCost, ApprovedDate
FROM LaborTimeEntry
WHERE WorkOrderID = 1
ORDER BY WorkDate, LaborTimeEntryID;
```


</TabItem>
</ToolSteps>

Expect **five labor entries**, IDs **213, 214, 215, 429, and 501**, with recorded labor support totaling **191.89**. Compare the meaning of this result with completion's standard conversion cost. Labor records describe work and its stored cost basis; conversion also includes overhead. Do not claim a complete variance reconciliation from labor rows alone.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save separate issue, completion, close, and labor-support sections. Explain what had occurred by January 31 and what was recorded on February 1. Record the release, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

At January 31, the selected goods are completed but work-order close has not yet occurred. The standard-cost and actual-support populations have different meanings. Fuller overhead and ledger analysis belongs in the [Manufacturing Labor Case](../analytics/cases/manufacturing-labor-cost-case.md).

## Try One Change

Compare the issued material cost with the standard material cost completed. Which recorded variance does their difference explain?

<details>
<summary>Compare your reasoning</summary>

754.29 − 729.36 = 24.93, matching the selected material variance. It does not explain the 718.23 conversion variance or make the completed standard total an actual-cost total.

</details>

## Next Steps

Production depends on employees. Next, follow approved work into payroll and its separate settlements. Continue to [Follow Hours into Payroll](follow-hours-into-payroll.md).
