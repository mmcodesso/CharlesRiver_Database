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

## Optional Account Reconciliation

Keep the introductory lesson above intact. This extension asks a narrower accounting question: **what balance is supported by the selected work-order events at a cutoff, and what requires a wider ledger population?** Use a new worksheet or SQL section so the original evidence remains available.

**Prerequisites and deliverable:** finish this lesson and [Find the Accounting Entries](find-the-accounting-entries.md). Review [WIP, clearing, and variance](../reference/posting.md#core-control-accounts), then save a dated roll-forward, its source keys, and one paragraph distinguishing a selected work-order balance from company-wide manufacturing clearing. Predict each debit or credit before checking the following schedule.

<details>
<summary>Reconcile the selected work-order events, then widen the clearing population</summary>

### 1. Define the Selected Population

Use release **v2027.1**, `WorkOrderID = 1`, and its material issue **1**, completions **1 and 2**, and close **1**. The following query pairs source **type and ID**, retains each complete event voucher, and groups its lines by account. It does not join a ledger amount to every operational line.

```sql
WITH selected_sources AS (
    SELECT 'MaterialIssue' AS SourceType, MaterialIssueID AS SourceID
    FROM MaterialIssue WHERE WorkOrderID = 1
    UNION ALL
    SELECT 'ProductionCompletion', ProductionCompletionID
    FROM ProductionCompletion WHERE WorkOrderID = 1
    UNION ALL
    SELECT 'WorkOrderClose', WorkOrderCloseID
    FROM WorkOrderClose WHERE WorkOrderID = 1
)
SELECT g.PostingDate, g.VoucherNumber, g.SourceDocumentType,
       g.SourceDocumentID, a.AccountNumber,
       ROUND(SUM(g.Debit), 2) AS Debit,
       ROUND(SUM(g.Credit), 2) AS Credit
FROM selected_sources AS s
JOIN GLEntry AS g
  ON g.SourceDocumentType = s.SourceType AND g.SourceDocumentID = s.SourceID
JOIN Account AS a ON a.AccountID = g.AccountID
GROUP BY g.PostingDate, g.VoucherNumber, g.SourceDocumentType,
         g.SourceDocumentID, a.AccountNumber
ORDER BY g.PostingDate, g.VoucherNumber, a.AccountNumber;
```

In Excel, filter `GLEntry` on each of those type/ID pairs, append the four complete voucher populations, merge `Account` on `AccountID`, and group by the displayed fields with separate debit and credit sums. Retain the ungrouped detail to check each voucher's balance. There are **14 original ledger rows**; grouping produces **11 account rows**, and each of the four complete vouchers balances.

| Event | `1045` materials | `1046` WIP | `1040` finished goods | `1090` clearing | `5080` variance |
|---|---:|---:|---:|---:|---:|
| January 17 issue | Credit 754.29 | Debit 754.29 | — | — | — |
| January 25–26 completions, combined | — | Credit 729.36 | Debit 1,019.85 | Credit 290.49 | — |
| February 1 close | — | Credit 24.93 | — | Credit 718.23 | Debit 743.16 |

`1045` holds components before issue; `1046` holds their issued cost awaiting completion or close. `1040` receives the standard completed cost. `1090` connects conversion cost recognition and relief across a wider manufacturing population. `5080` records the close differences.

### 2. Roll Forward Selected WIP at Two Cutoffs

For **this work order's material-issue/completion/close postings to `1046`**, the opening contribution at **January 1, 2024** is **0.00**. By January 31:

**0.00 opening + 754.29 issued − 729.36 relieved on completion = 24.93 debit WIP.**

For February 1 alone:

**24.93 opening + 0.00 new selected WIP debits − 24.93 close credit = 0.00 selected WIP.**

The February close is excluded from January 31. The selected `1040` completion debits of **1,019.85** measure goods received from this order; they are not the company's finished-goods balance or proof those goods remain unsold. Likewise, the selected `1045` credits are an issue movement, not the materials account's ending balance. The `5080` close debits total **743.16**; they do not summarize all company manufacturing variances.

### 3. Separate Operational Labor from Conversion Valuation

The five labor entries already inspected total **191.89**, while the two completion lines contain **185.67** standard direct labor and **104.82** standard variable plus fixed overhead. Together those standards equal the completed conversion cost **290.49**. Verify each population independently:

```sql
WITH standard_cost AS (
    SELECT ROUND(SUM(l.ExtendedStandardDirectLaborCost), 2) AS StandardLabor,
           ROUND(SUM(l.ExtendedStandardVariableOverheadCost
                   + l.ExtendedStandardFixedOverheadCost), 2) AS StandardOverhead
    FROM ProductionCompletion AS p
    JOIN ProductionCompletionLine AS l
      ON l.ProductionCompletionID = p.ProductionCompletionID
    WHERE p.WorkOrderID = 1
), labor_support AS (
    SELECT ROUND(SUM(ExtendedLaborCost), 2) AS RecordedDirectLabor
    FROM LaborTimeEntry
    WHERE WorkOrderID = 1 AND LaborType = 'Direct Manufacturing'
)
SELECT s.StandardLabor, s.StandardOverhead, l.RecordedDirectLabor,
       ROUND(l.RecordedDirectLabor - s.StandardLabor, 2) AS LaborDifference,
       c.DirectLaborVarianceAmount, c.OverheadVarianceAmount,
       c.ConversionVarianceAmount
FROM standard_cost AS s
CROSS JOIN labor_support AS l
JOIN WorkOrderClose AS c ON c.WorkOrderID = 1;
```

In Excel, sum those two standard-cost columns in `CompletionTrace` separately; sum `LaborData[ExtendedLaborCost]` at its retained labor-entry grain. The labor difference **191.89 − 185.67 = 6.22** agrees with the stored direct-labor variance. The close separately stores **712.01** overhead variance, giving **6.22 + 712.01 = 718.23** conversion variance. The five labor rows do not substantiate a work-order overhead amount. Adding an unexplained remainder to them and calling it “actual overhead” would go beyond this evidence.

### 4. Roll Forward the Complete Clearing Account

An order's completion and close credits to `1090` do not carry the pooled payroll or depreciation debits for that order. Widen this part to **every company `1090` posting**, keeping posting-date cutoffs explicit. Positive signed balances below mean debit; negative means credit.

```sql
WITH periods AS (
    SELECT 'January 2024' AS Period, '2024-01-01' AS StartDate,
           '2024-02-01' AS EndDate
    UNION ALL SELECT 'February 1', '2024-02-01', '2024-02-02'
    UNION ALL SELECT 'February 2', '2024-02-02', '2024-02-03'
), clearing AS (
    SELECT g.PostingDate, g.Debit, g.Credit
    FROM GLEntry AS g
    JOIN Account AS a ON a.AccountID = g.AccountID
    WHERE a.AccountNumber = 1090
)
SELECT p.Period,
       ROUND(COALESCE(SUM(CASE WHEN g.PostingDate < p.StartDate
                    THEN g.Debit - g.Credit ELSE 0 END), 0), 2) AS Opening,
       ROUND(COALESCE(SUM(CASE WHEN g.PostingDate >= p.StartDate
                    THEN g.Debit ELSE 0 END), 0), 2) AS PeriodDebit,
       ROUND(COALESCE(SUM(CASE WHEN g.PostingDate >= p.StartDate
                    THEN g.Credit ELSE 0 END), 0), 2) AS PeriodCredit,
       ROUND(COALESCE(SUM(g.Debit - g.Credit), 0), 2) AS Closing
FROM periods AS p
LEFT JOIN clearing AS g ON g.PostingDate < p.EndDate
GROUP BY p.Period, p.StartDate
ORDER BY p.StartDate;
```

| Posting-date period | Signed opening | Debits | Credits | Signed closing |
|---|---:|---:|---:|---:|
| January 1–31, 2024 | 0.00 | 20,875.00 | 23,327.60 | −2,452.60 |
| February 1 | −2,452.60 | 0.00 | 12,894.16 | −15,346.76 |
| February 2 | −15,346.76 | 169,382.48 | 8,968.64 | 145,067.08 |

For an Excel equivalent, retain a separate reference containing **all** `GLEntry` rows for account `1090`. Use posting dates before each start date for opening, dates from the start inclusive to the end exclusive for period debit/credit, and dates before the end for closing. Check **opening + debits − credits = closing**; do not filter this reference to work order 1's four vouchers.

Every movement here has a ledger source. January's **20,875.00** debit is the five manufacturing-equipment depreciation lines in `JournalEntryID = 6` on January 31; January credits are production completions. February 1 credits comprise **8,666.21** completions and **4,227.95** work-order closes. February 2 has **8,968.64** completion credits and a **169,382.48** payroll-summary debit, voucher **PRS-0002-004**, source ID **1002004**. That summary covers payroll period **2**, manufacturing cost center **4**; its debit is not allocated by `GLEntry` to work order 1. Use the [PayrollSummary mapping](../reference/posting.md#payrollsummary-register-summaries) rather than a direct employee-register-ID join.

The pooled balance changes with payroll, depreciation, completion, and close posting dates. A credit balance at a cutoff does not establish negative physical production cost, and this short window does not represent the full manufacturing cycle. **Attribution limit:** the selected evidence supports the work-order WIP roll-forward, standard completion, stored variances, and the complete pooled clearing roll-forward. It does not provide a work-order-specific allocation of every pooled debit, independently verify the overhead allocation underlying the stored close, or establish a complete actual-cost valuation for work order 1. State that limit rather than inventing an allocation or unexplained overhead residual.

</details>

## Next Steps

Production depends on employees. Next, follow approved work into payroll and its separate settlements. Continue to [Follow Hours into Payroll](follow-hours-into-payroll.md).
