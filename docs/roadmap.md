# Roadmap

**Audience:** Maintainers, contributors, and instructors tracking planned expansion of the dataset.  
**Purpose:** Define the next implementation phase and capture the remaining roadmap sequence.  
**What you will learn:** What has been delivered, what should be built next, and why.

## Current Status

The current generator already delivers:

- five fiscal years of data from 2026 through 2030
- order-to-cash and procure-to-pay transaction generation
- manufacturing foundation with BOMs, work orders, issues, completions, and close
- opening balances, recurring manual journals, manufacturing reclasses, year-end close, and budgets
- event-based postings into `GLEntry`
- validations, anomaly injection, starter analytics assets, and exports

## Recently Delivered: Phase 13 - Payroll Cycle With Manufacturing Direct Labor

Phase 13 delivered:

- payroll periods, labor time, payroll registers, payroll payments, and payroll liability remittances
- payroll posting into accrued payroll and payroll liability accounts
- payroll-driven direct labor and manufacturing-overhead integration
- manufactured-item cost components for direct material, direct labor, variable overhead, and fixed overhead
- unit-cost and contribution-margin starter analytics
- payroll controls in validation
- payroll process documentation and starter analytics coverage

This phase turned Greenfield into a hybrid manufacturer-distributor with an operational payroll subledger instead of journal-only payroll.

## Next Phase: Advanced Manufacturing and Labor Planning

### Why this is next

The dataset now has operational payroll, direct labor, and manufacturing cost components. The next high-value gap is not payroll basic processing. It is deeper production-planning realism.

The next high-value addition is advanced manufacturing and labor-planning detail that can support:

- routings and work centers
- time-clock or shift-level labor capture
- capacity and schedule analytics
- deeper manufacturing efficiency analysis

### Planned scope

The next phase should add:

- routings or operation sequences for manufactured items
- time-clock or shift scheduling detail
- richer open-work-order and bottleneck analysis
- deeper labor and overhead planning analytics
- more advanced manufacturing-control anomalies

## Recommended Sequence

1. Advanced manufacturing and labor-planning extensions
2. Additional analytics packs built on top of those new operational layers
3. Broader scenario and anomaly packs for teaching controls and planning
