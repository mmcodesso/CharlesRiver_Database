---
title: Demand Planning and Replenishment Case
description: Guided planning case using forecast, policy, recommendation, and rough-cut capacity tables.
sidebar_label: Demand Planning Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Demand Planning and Replenishment Case

## Audience and Purpose

- audience: managerial analytics, operations, cost accounting, and supply-chain planning students
- purpose: connect weekly demand forecasts to replenishment recommendations, purchase support, manufacturing release, and rough-cut capacity pressure

## Business Scenario

The dataset plans replenishment weekly. Students need to explain how forecasted demand becomes supply recommendations, why some recommendations are expedited, and where rough-cut capacity tightens before execution starts.

## Query Sequence

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
