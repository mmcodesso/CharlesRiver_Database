---
title: Pricing Governance Audit Case
description: Guided audit case focused on expired pricing, promotion misuse, customer-specific bypass, and override approval completeness.
sidebar_label: Pricing Governance Audit
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Pricing Governance Audit Case

This case reads the pricing framework as a control system rather than just a margin system. Students move from the approved commercial rules into flagged exceptions and decide which pricing failures reflect poor master data, poor execution, or missing approval discipline.

## Business Scenario

The dataset maintains formal price lists, seasonal promotions, and explicit override approvals. Students need to determine whether the commercial-control design is being followed and where transaction pricing no longer matches the approved pricing framework.

## The Problem to Solve

The review team needs to identify where transaction pricing breaks from the approved pricing design and which exceptions should be escalated as governance failures rather than normal commercial variation.

## Key Data Sources

- `PriceList`
- `PriceListLine`
- `PromotionProgram`
- `PriceOverrideApproval`
- `SalesOrderLine`

## Recommended Query Sequence

<QuerySequence items={caseQuerySequences["pricing-governance-audit-case"]} />

## Suggested Excel Sequence

1. open `PriceList`, `PriceListLine`, `PromotionProgram`, `PriceOverrideApproval`, and `SalesOrderLine`
2. trace one flagged line from the order line into its linked price-list line and override record
3. compare effective dates and scope fields directly in the workbook

## What Students Should Notice

- expired-price-list use and overlapping active lists are different failures and should not be treated as the same control issue
- a line below floor is only acceptable when the override documentation is complete
- customer-specific price-list bypass is a governance issue even when the final price still looks commercially plausible
- promotion date and scope failures are master-data/control problems before they are margin-analysis problems

## Follow-Up Questions

1. Which anomaly type creates the strongest evidence of missing commercial governance?
2. Which exceptions are master-data failures versus transaction-execution failures?
3. Which pricing exceptions would require immediate remediation before the next sales cycle?
4. Which pricing controls should be reviewed by sales leadership versus finance leadership?

## Next Steps

- Read [Pricing and Margin Governance Case](pricing-and-margin-governance-case.md) when you want the commercial interpretation beside the audit interpretation.
- Read [Audit Analytics](../audit.md) for the broader control-review query library.
- Read [Commercial and Working Capital](../reports/commercial-and-working-capital.md) when you want the business perspective that sits above the control issues.
