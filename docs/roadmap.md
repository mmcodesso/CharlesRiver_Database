# Roadmap

**Audience:** Maintainers, contributors, and instructors tracking planned expansion of the dataset.  
**Purpose:** Define the next implementation phase in concrete terms and capture the remaining roadmap in execution order.  
**What you will learn:** What should be built next, why it is next, and how the later phases fit together.

## Current Status

The current generator already delivers:

- five fiscal years of data from 2026 through 2030
- order-to-cash and procure-to-pay transaction generation
- opening balances, recurring manual journals, year-end close, and budgets
- event-based postings into `GLEntry`
- validations, anomaly injection, and exports

Phase 8 is now complete. The default build includes:

- 1,442 journal headers across opening, recurring operating journals, reversals, and year-end close
- 110,075 GL rows in the default five-year build
- journal-focused anomaly patterns that preserve overall GL balance while creating detectable control exceptions

The largest remaining realism gap is now P2P document depth. Purchase orders, goods receipts, and purchase invoices are still mostly one-line documents.

## Recently Delivered: Phase 8 - Manual Journals and Close Cycle

Phase 8 delivered:

- monthly payroll accruals by cost center
- monthly payroll settlements
- monthly office and warehouse rent journals
- monthly utilities journals
- monthly depreciation journals by asset class
- month-end accrued expense journals with linked reversals
- year-end close journals for every fiscal year in range
- journal-specific validation and anomaly coverage

This phase moved `JournalEntry` into its intended teaching scale without adding a new schema table.

## Next Phase: Phase 9 - P2P Realism Expansion

### Why this is next

Phase 9 raises the realism of the purchasing cycle without forcing a major schema redesign. It improves:

- AP and purchasing analytics
- receiving and three-way-match instruction
- audit tests around quantity, timing, and duplicate processing
- row-volume coverage for the P2P line tables that still sit below design intent

### Goal

Increase the realism and volume of P2P line-level data while preserving deterministic generation and balanced posting behavior.

### In Scope

- multi-line purchase orders
- multi-line goods receipts
- multi-line purchase invoices
- partial receipts across multiple dates
- partial invoicing and three-way-match realism
- richer supplier specialization by item category
- more realistic payment timing and aging behavior

### Implementation Areas

- `src/greenfield_dataset/p2p.py`
- `src/greenfield_dataset/posting_engine.py`
- `src/greenfield_dataset/validations.py`
- `docs/process-flows.md`
- `docs/reference/row-volume.md`

### Acceptance Criteria

- purchase order, goods receipt, and purchase invoice line counts move materially closer to design intent
- partial receipt and partial invoicing patterns are visible across multiple dates
- posting and roll-forward validations continue to pass on the clean build
- documentation is updated to explain the richer P2P document chain

## Remaining Roadmap

### Phase 10 - Analytics Starter Layer

Focus areas:

- starter SQL queries
- starter Excel analysis paths
- optional reusable SQLite views for common teaching questions
- example workflows for financial, managerial, and audit analytics

Why it matters:

- reduces onboarding friction for instructors and students
- turns the dataset into a more complete teaching package

### Phase 11 - O2C and Inventory Enrichment

Focus areas:

- more partial-shipment behavior
- richer late-delivery and backorder patterns
- improved collection behavior and payment timing
- optional returns or credit-memo flow
- stronger inventory availability logic

Why it matters:

- deepens revenue-cycle analytics
- improves fulfillment and cut-off exercises
- creates more realistic inventory movement behavior

### Phase 12 - Manufacturing Foundation

Focus areas:

- manufacturing-related master and transaction tables
- production activity generation
- WIP, completion, and variance postings
- manufacturing-specific validations
- process-flow and documentation updates for the new cycle

Why it matters:

- expands the dataset from distributor/light assembler framing into true manufacturing coverage
- opens the door to cost accounting and production analytics

## Recommended Sequence

1. Phase 9 - P2P Realism Expansion
2. Phase 10 - Analytics Starter Layer
3. Phase 11 - O2C and Inventory Enrichment
4. Phase 12 - Manufacturing Foundation

This order adds the most teaching value first, improves current realism before major schema expansion, and prepares the project for manufacturing later without forcing a large redesign too early.
