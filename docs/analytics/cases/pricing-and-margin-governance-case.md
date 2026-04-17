---
title: Pricing and Margin Governance Case
description: Guided commercial-pricing case using price lists, promotions, overrides, and realized margin.
sidebar_label: Pricing and Margin Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Pricing and Margin Governance Case

This case follows the commercial pricing rules that sit beneath billed revenue and realized margin. It gives students a way to explain how list price, promotions, customer-specific pricing, and override approvals change the commercial result before that result reaches the statements.

## Business Scenario

The dataset prices from formal segment and customer price lists with explicit promotions and override approvals. Students need to explain how price realization changes by customer mix, where promotions dilute revenue, and when override approvals become commercially significant.

## The Problem to Solve

Commercial leadership needs to understand whether lower price realization is coming from deliberate policy choices, portfolio mix, promotion strategy, or weak pricing governance.

## Key Data Sources

- `PriceList`
- `PriceListLine`
- `PromotionProgram`
- `PriceOverrideApproval`
- `SalesOrderLine`
- `SalesInvoiceLine`

## Recommended Query Sequence

<QuerySequence items={caseQuerySequences["pricing-and-margin-governance-case"]} />

## Suggested Excel Sequence

1. open the sheets `PriceList`, `PriceListLine`, `PromotionProgram`, `PriceOverrideApproval`, `SalesOrderLine`, and `SalesInvoiceLine`
2. build a pivot of base-list revenue versus net revenue by customer segment
3. chart promotion revenue reduction by collection
4. isolate override lines and compare them to the price-floor thresholds from `PriceListLine`

## What Students Should Notice

- price realization now comes from explicit commercial rules
- promotions lower net revenue through the line discount field while revenue still posts net in the GL
- customer-specific pricing should concentrate in a minority of strategic accounts, not across the full customer base
- override pressure should be visible but rare relative to total order-line volume

## Follow-Up Questions

1. Which customer segments realize the largest gap between base-list revenue and net revenue?
2. Which collections rely most on promotions to drive billed volume?
3. Which sales reps show the highest override concentration?
4. Where does customer-specific pricing appear commercially justified versus administratively heavy?

## Next Steps

- Read [Commercial and Working Capital](../reports/commercial-and-working-capital.md) when you want the broader commercial story around pricing and settlement timing.
- Read [Pricing Governance Audit Case](pricing-governance-audit-case.md) when you want the control-focused follow-through on the same pricing framework.
- Read [Financial Analytics](../financial.md) and [Managerial Analytics](../managerial.md) for the wider pricing and margin query sets.
