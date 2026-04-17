---
title: Demand Planning and Replenishment Case
description: Guided planning case using forecast, policy, recommendation, and rough-cut capacity tables.
sidebar_label: Demand Planning Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Demand Planning and Replenishment Case

This case follows the planning layer before execution begins. It asks students to explain how weekly forecasts, inventory policy, and supply recommendations shape purchasing and manufacturing pressure before those decisions appear in receipts, work orders, or financial results.

## Business Scenario

The dataset plans replenishment weekly. Students need to explain how forecasted demand becomes supply recommendations, why some recommendations are expedited, and where rough-cut capacity tightens before execution starts.

## The Problem to Solve

The planning team needs a clear explanation of which item families drive the heaviest recommendation pressure, where that pressure turns into expedite signals, and how rough-cut capacity starts tightening before operations execute the plan.

## Key Data Sources

- `DemandForecast`
- `InventoryPolicy`
- `SupplyPlanRecommendation`
- `MaterialRequirementPlan`
- `RoughCutCapacityPlan`
- `PurchaseRequisition`
- `WorkOrder`

## Recommended Query Sequence

<QuerySequence items={caseQuerySequences["demand-planning-and-replenishment-case"]} />

## Suggested Excel Sequence

1. open the dataset workbook sheets `DemandForecast`, `InventoryPolicy`, `SupplyPlanRecommendation`, `MaterialRequirementPlan`, and `RoughCutCapacityPlan`
2. build a weekly pivot from `DemandForecast`
3. compare latest projected availability and expedite counts from `SupplyPlanRecommendation`
4. chart weekly load versus available hours from `RoughCutCapacityPlan`

## What Students Should Notice

- forecast is weekly and warehouse-specific, but execution remains monthly
- expedited recommendations should concentrate in narrower item families and months, not across the full catalog
- manufactured demand creates both supply recommendations and rough-cut capacity pressure
- component demand appears separately from finished-good demand

## Follow-Up Questions

1. Which item families carry the highest recurring expedite pressure?
2. Where does forecast bias appear systematic?
3. Which work centers become tight first when manufactured demand rises?
4. How would a planner explain the mix of forecast-driven versus backlog-driven recommendations?

## Next Steps

- Read [Process Flows](../../learn-the-business/process-flows.md) and [Manufacturing](../../processes/manufacturing.md) when you want the operational bridge from planning into execution.
- Read [Operations and Risk](../reports/operations-and-risk.md) when you want the management-level reading of the same planning signals.
- Read [Managerial Analytics](../managerial.md) for the broader planning, capacity, and supply-risk query set.
