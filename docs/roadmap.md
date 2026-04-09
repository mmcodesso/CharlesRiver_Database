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

## Recently Delivered: Phase 12 - Hybrid Manufacturing Foundation

Phase 12 delivered:

- manufactured-item master attributes on `Item`
- BOM headers and BOM lines
- work orders, material issues, production completions, and work-order close
- manufacturing-driven raw-material replenishment through the normal P2P flow
- WIP, manufacturing clearing, and manufacturing variance accounting
- manufacturing controls in validation
- manufacturing process documentation and starter analytics coverage

This phase turned Greenfield into a hybrid manufacturer-distributor instead of a pure distributor-style dataset.

## Next Phase: Phase 13 - Payroll Cycle

### Why this is next

Payroll currently exists only as journal activity. That is enough for the current manufacturing foundation, but it is not enough for a true operational payroll cycle.

The next high-value addition is a payroll subledger that can support:

- payroll process understanding
- payroll liability analysis
- audit testing of payroll controls
- future labor-based manufacturing analytics

### Planned scope

Phase 13 should add:

- pay periods and payroll registers
- employer taxes and withholdings
- employee net pay and settlement
- payroll liability clearance
- optional labor detail that can later refine manufacturing analytics

## Recommended Sequence

1. Phase 13 - Payroll Cycle
2. Advanced manufacturing extensions such as routings, capacity, and richer cost-accounting detail
3. Additional analytics packs built on top of those new operational layers
