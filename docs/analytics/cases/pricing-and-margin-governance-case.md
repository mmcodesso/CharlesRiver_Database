---
title: Pricing and Margin Governance Case
description: Guided commercial-pricing case using price lists, promotions, overrides, and realized margin.
sidebar_label: Pricing and Margin Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Pricing and Margin Governance Case

## Audience and Purpose

- audience: financial analytics, managerial analytics, and commercial-policy students
- purpose: connect list price, negotiated pricing, promotions, and net margin without introducing a separate quote system

## Business Scenario

The dataset prices from formal segment and customer price lists with explicit promotions and override approvals. Students need to explain how price realization changes by customer mix, where promotions dilute revenue, and when override approvals become commercially significant.

## Query Sequence

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
