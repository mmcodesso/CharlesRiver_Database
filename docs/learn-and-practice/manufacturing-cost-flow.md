---
title: Map Manufacturing Cost Flow
description: A foundational conversion exercise distinguishing manufacturing plans, material issues, standard-cost completion, labor support, and work-order close.
slug: /learn-and-practice/manufacturing-cost-flow
sidebar_label: Manufacturing Cost Flow
---

import { QueryReference } from "@site/src/components/QueryReference";

# Map Manufacturing Cost Flow

## Context and Problem

Finished goods can be completed before accounting closes the work order. A production supervisor and a financial accountant therefore need different evidence to answer whether an order is finished. Your task is to map one actual work order and explain the distinction between physical production and manufacturing cost close.

## Learning Objectives

- Distinguish planning, work-order execution, completion, and close.
- Identify the sources supporting material movement and production cost.
- Explain why standard-cost completion and actual labor evidence are different measures.
- State a supported conclusion without assuming every linked event has the same date or grain.

## Before You Start

**Prerequisites:** read [Company Story](../learn-the-business/company-story.md) and the [Manufacturing Process](../processes/manufacturing.md). Review materials, WIP, finished goods, and basic standard-cost concepts.

**Tools and files:** use the published SQLite file with a query tool, or the selected Excel tables in a separate exercise workbook. Follow the [SQL Guide](../analytics/sql-guide.md) or [Excel Guide](../analytics/excel-guide.md).

**Sources:** `Item`, `WorkOrder`, `WorkOrderOperation`, `MaterialIssue`, `MaterialIssueLine`, `ProductionCompletion`, `ProductionCompletionLine`, `WorkOrderClose`, `GLEntry`, and `Account`. Use `SupplyPlanRecommendation` for planning context and `LaborTimeEntry` when your interpretation reaches labor support.

## Evidence Workflow

1. **Choose a work order.** Record the dataset version, reporting date, `WorkOrderID`, and finished-good item. Check the item supply mode and retain its actual source identifiers.
2. **Separate the planned from the executed.** Identify the work-order and operation records. Note whether a planning recommendation exists; a recommendation describes intended supply rather than a material movement or a posting.
3. **Map material issue and completion.** Follow the issue and completion headers and lines linked to the work order. Keep component quantities separate from finished-good quantities, and record the event dates.
4. **Inspect the close stage.** Locate any `WorkOrderClose` record and its date. Trace the relevant accounting sources into `GLEntry`, then use the [Posting Reference](../reference/posting.md) to explain WIP, finished goods, clearing, and variance.
5. **Write the reporting-date explanation.** Distinguish what the records support about completed production from what they support about cost close. If you discuss labor, identify the relevant approved labor evidence and explain how its grain differs from the completion measure.

Use the existing work-order close query to inspect the accounting trail once you understand the operational events:

<QueryReference
  queryKey="cases/06_manufacturing_work_order_close_gl_trace.sql"
  helperText="Review one actual work order's close and ledger evidence; retain the source identifiers and distinguish posting dates from physical completion dates."
/>

## Assessed Deliverable

Submit one process map or evidence table with real identifiers, dates, row-grain definitions, and links among issue, completion, and close records. Include an explanation of the manufacturing cost stages, a check that avoids adding incompatible quantities or repeating header totals, and one follow-up recommendation. Provide your query reference or workbook steps.

## Interpretation and Limitations

The dataset uses standard-cost manufacturing. Labor records provide operational and payroll-supported cost evidence; they do not transform every completion into full actual-cost inventory. A completed quantity alone does not establish final variance, and an open work order alone does not prove a control failure.

Keep weekly planning, operation schedules, actual activity, and accounting close separate. This first exercise does not establish complete capacity utilization, reconstruct every payroll reclass, or prove that all costs have been captured.

## Next Steps

Extend the trace through labor and operations in the [Manufacturing Labor Case](../analytics/cases/manufacturing-labor-cost-case.md), then read [Operations and Risk](../analytics/reports/operations-and-risk.md) for the wider managerial view. Return to [Learn and Practice](index.md) to compare another process.
