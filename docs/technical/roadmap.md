---
title: Charles River Dataset and Documentation Roadmap
description: Review implemented Charles River capabilities and proposed dataset and documentation improvements when planning future teaching materials.
slug: /roadmap
sidebar_label: Roadmap
---

# Roadmap

This page separates the available data and teaching resources from planned future expansion. The rest of the documentation explains how to work with those resources.

## Implemented in the Current Release

### Core business processes and accounting

- three fiscal years of data from 2024 through 2026
- order-to-cash, returns, procure-to-pay, manufacturing, payroll, and close-cycle activity
- event-based postings into `GLEntry` with source-to-ledger traceability
- accrued-expense settlement, payroll cash movement, and year-end close activity

### Workforce, payroll, and time tracking

- approved daily time clocks, attendance exceptions, overtime approvals, and payroll periods
- raw punch-event evidence beneath approved daily time: `TimeClockPunch` contains **165,137 rows**
- labor allocation that connects payroll support to manufacturing activity
- richer employee master data with role, lifecycle, work location, and current-state assignment coverage
- audit coverage for employee validity, approvals, roster controls, punch controls, and overtime controls

### Planning and replenishment

- weekly demand forecasts and inventory policies
- replenishment recommendations for purchasing and manufacturing demand
- `MaterialRequirementPlan` and `RoughCutCapacityPlan` to connect planning pressure to execution
- analytics and audit queries for forecast quality, planning support, and recommendation timing

### Pricing and commercial governance

- formal price lists, promotions, and override approvals
- pricing lineage from commercial policy into O2C documents and margin analysis
- audit coverage for price-floor review, expired pricing, promotion scope, and override completeness

### Analytics, cases, and teaching materials

- starter SQL coverage across financial, managerial, audit, and cost-accounting topics
- guided walkthrough cases that connect business context, queries, and interpretation
- company, process, dataset, schema, and posting documentation that supports classroom adoption
- Excel guidance for workbook-based analysis and exception review

### Technical delivery and validation

- public SQLite, Excel, and CSV zip formats, with separate local/instructor support-workbook and generation-log outputs
- validation scopes for `core`, `operational`, and `full` checks
- anomaly logging and validation exception reporting
- local generation settings for full release, fast validation, and performance profiling

## Future Implementations and Improvements

- richer schedule modeling, including rotating shift rosters and shift-level capacity calendars
- deeper manufacturing structure, including subassemblies and multi-level BOM support
- continued growth in analytics cases, teaching notes, and adoption materials as the classroom library expands
