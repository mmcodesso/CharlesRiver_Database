---
title: Replenishment Support Audit Case
description: Guided audit case for planning approval, policy, and replenishment-support controls.
sidebar_label: Replenishment Audit Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Replenishment Support Audit Case

This case treats planning support as an audit trail rather than only a forecasting exercise. It helps students test whether replenishment documents still point back to approved planning logic and whether policy, approval, and conversion controls remain intact before execution begins.

## Business Scenario

The dataset expects weekly planning support behind normal replenishment activity. The audit task is to identify missing forecast approval, inactive policy coverage, unsupported requisitions or work orders, late recommendation conversion, and prelaunch or discontinued planning activity.

## The Problem to Solve

The audit team needs to separate planning-governance failures from later execution failures and decide which unsupported replenishment documents create the strongest control concern.

## Key Data Sources

- `DemandForecast`
- `InventoryPolicy`
- `SupplyPlanRecommendation`
- `PurchaseRequisition`
- `WorkOrder`

## Recommended Query Sequence

<QuerySequence items={caseQuerySequences["replenishment-support-audit-case"]} />

## Suggested Excel Sequence

1. trace the primary keys from the query results into `DemandForecast`, `InventoryPolicy`, `SupplyPlanRecommendation`, `PurchaseRequisition`, and `WorkOrder`
2. compare the audit SQL results to the source-table detail

## What Students Should Notice

- approval failure and override outlier are different control failures
- policy inactivity can break planning support before transaction execution fails
- unsupported requisitions and work orders are document-trace failures as well as planning failures
- late conversion is a timing-control issue even when the source recommendation exists

## Follow-Up Questions

1. Which anomalies indicate poor planning governance versus poor execution timing?
2. How would you separate planning-master exceptions from replenishment-document exceptions in an audit memo?
3. Which planning control failures could cascade into inventory, capacity, or cash-cycle issues?

## Next Steps

- Read [Demand Planning and Replenishment Case](demand-planning-and-replenishment-case.md) when you want the managerial reading of the same planning layer.
- Read [Audit Analytics](../audit.md) for the broader planning-support and control-review query set.
- Read [Operations and Risk](../reports/operations-and-risk.md) when you want the higher-level operational interpretation.
