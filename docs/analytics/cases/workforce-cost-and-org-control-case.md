---
title: Workforce Cost and Org-Control Case
description: Guided walkthrough for workforce mix, payroll cost concentration, approval design, and executive-role review.
sidebar_label: Workforce Cost Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Workforce Cost and Org-Control Case

This case brings people cost, workforce structure, and approval design into one review. It helps students explain not only where payroll cost sits, but also whether the organization and control ownership behind that cost still look credible.

## Business Scenario

Leadership wants to understand where people cost sits, how workforce structure varies by location and cost center, and whether approval activity lines up with the intended organization design.

## The Problem to Solve

Leadership needs a workforce view that connects payroll concentration, organizational structure, and approval ownership without treating those as separate discussions.

## Key Data Sources

- `Employee`
- `CostCenter`
- `PayrollRegister`
- `TimeClockEntry`
- `LaborTimeEntry`
- `PurchaseRequisition`
- `PurchaseOrder`
- `JournalEntry`

## Recommended Query Sequence

<QuerySequence items={caseQuerySequences["workforce-cost-and-org-control-case"]} />

## Suggested Excel Sequence

1. Pivot `Employee` by `WorkLocation`, `JobFamily`, `JobLevel`, and `EmploymentStatus`.
2. Add payroll totals by cost center and pay class.
3. Compare approval concentration to the intended control-owner roles.

## What Students Should Notice

- Workforce structure is easier to interpret now that executive roles are unique and frontline roles repeat only where that makes sense.
- People-cost concentration and approval concentration are related but not identical.
- Work location and cost center answer different managerial questions.
- The published dataset provides reviewable control patterns for cost and organization analysis.

## Follow-Up Questions

- Which job families drive the most payroll cost?
- Which approvals would you expect to be concentrated in finance roles?
- When does a concentrated approval pattern look efficient, and when does it look risky?

## Next Steps

- Read [Payroll and Workforce](../reports/payroll-perspective.md) when you want the report-level perspective on payroll, labor support, and control review.
- Read [Payroll](../../processes/payroll.md) when you want the business-process view behind the same workforce and approval patterns.
- Read [Master Data and Workforce Audit Case](master-data-and-workforce-audit-case.md) when you want the audit follow-through on employee validity and ownership.
