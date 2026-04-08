# Roadmap

**Audience:** Maintainers, contributors, and instructors tracking planned expansion of the dataset.  
**Purpose:** Define the next implementation phase in concrete terms and capture the remaining roadmap in execution order.  
**What you will learn:** What should be built next, why it is next, and how the later phases fit together.

## Current Status

The current generator already delivers:

- five fiscal years of data from 2026 through 2030
- order-to-cash and procure-to-pay transaction generation
- opening balances and budgets
- event-based postings into `GLEntry`
- validations, anomaly injection, and exports

The largest remaining realism gap is the close cycle and recurring journal activity. The schema already supports `JournalEntry`, but the current generated dataset includes only the opening balance journal header.

## Next Phase: Phase 8 - Manual Journals and Close Cycle

### Why this is next

Phase 8 adds the most teaching value with the least schema disruption. It strengthens:

- financial analytics
- managerial accounting analytics
- audit analytics
- close-cycle and period-end instruction
- journal-entry and ledger tracing exercises

It also closes the biggest current scale gap in the dataset: `JournalEntry` is currently far below the intended design range.

### Goal

Implement recurring manual journal generation for the full fiscal range using the existing `JournalEntry` and `GLEntry` tables.

### In Scope

Phase 8 should add these journal categories:

- monthly payroll accruals by cost center
- monthly payroll settlement entries
- monthly office rent journals
- monthly warehouse rent journals
- monthly utilities journals
- monthly depreciation journals by asset class
- month-end accrued expense journals with linked reversals
- year-end closing journals

### Journal Design

The implementation should use existing chart-of-accounts values already present in `config/accounts.csv`.

#### Payroll accrual

- Frequency: monthly
- Granularity: one journal entry per cost center per month
- Debit: salary expense account for the cost center plus payroll taxes and benefits
- Credit: `2030` Accrued Payroll
- Purpose: create realistic recurring expense and liability activity

#### Payroll settlement

- Frequency: monthly
- Timing: first business day of the following month when inside the configured fiscal range
- Debit: `2030` Accrued Payroll
- Credit: `1010` Cash and Cash Equivalents
- Purpose: show payroll liability settlement without creating a separate payroll subledger

#### Rent

- Frequency: monthly
- Separate journals:
  - warehouse rent using `6070`
  - office rent using `6080`
- Credit side: `1010` Cash and Cash Equivalents
- Purpose: create recurring operating expense journals with simple cash effect

#### Utilities

- Frequency: monthly
- Debit: `6090` Utilities Expense
- Credit: `1010` Cash and Cash Equivalents
- Purpose: add recurring operating expense behavior without new source tables

#### Depreciation

- Frequency: monthly
- Granularity: separate journal entry by asset class
- Debit: `6130` Depreciation Expense
- Credit:
  - `1150` Accumulated Depreciation - Furniture and Fixtures
  - `1160` Accumulated Depreciation - Warehouse Equipment
  - `1170` Accumulated Depreciation - Office Equipment
- Purpose: add fixed-asset expense and contra-asset behavior

#### Month-end accrued expenses

- Frequency: monthly
- Debit mix: selected operating expense accounts such as insurance, IT/software, and professional fees
- Credit: `2040` Accrued Expenses
- Reversal: create a linked reversal on the first business day of the next month when that date falls inside the fiscal range
- Purpose: support accrual accounting and reversal exercises

#### Year-end close

- Frequency: once per fiscal year
- Step 1: close revenue and expense accounts to `8010` Income Summary
- Step 2: close `8010` Income Summary to `3030` Retained Earnings
- Purpose: support closing-process analysis without adding a separate closing subsystem

### Implementation Changes

#### `src/greenfield_dataset/journals.py`

- Replace the placeholder with working recurring journal generators.
- Add helper functions for:
  - business-day selection
  - journal header creation
  - GL row creation for manual journals
  - reversal entry creation
- Keep journal generation deterministic under the configured random seed.

#### `src/greenfield_dataset/main.py`

- Integrate recurring journal generation into the full build.
- Generate journals inside the full fiscal loop or in a dedicated journal pass before final posting preservation.
- Add generation-log checkpoints for journal counts and year-end close activity.

#### `src/greenfield_dataset/validations.py`

- Add journal-specific checks:
  - every `JournalEntry` has matching `GLEntry` rows
  - every journal voucher is balanced
  - reversal entries correctly reference `ReversesJournalEntryID`
  - year-end close entries exist for each fiscal year
  - recurring journal categories appear with expected coverage across the date range

#### Documentation

- Update:
  - `docs/process-flows.md`
  - `docs/reference/posting.md`
  - `docs/reference/row-volume.md`
  - `docs/code-architecture.md`
- Reclassify recurring manual journals from planned scope to implemented scope after delivery.

### Out of Scope

Phase 8 should **not** include:

- payroll employee-level detail
- payroll tax withholding subledgers
- supplier-backed rent or utilities invoices in P2P
- bank reconciliation logic
- manufacturing postings

### Acceptance Criteria

Phase 8 is complete when:

- recurring manual journals are generated across the full configured fiscal range
- `JournalEntry` count increases materially from `1` to a recurring multi-year population
- all journal vouchers balance
- reversal linkage works for accrued expense reversals
- year-end closing entries exist for every fiscal year in range
- validations pass with the extended journal population
- documentation is updated to describe the implemented journal cycle

## Remaining Roadmap

### Phase 9 - P2P Realism Expansion

Priority after Phase 8.

Focus areas:

- multi-line purchase orders
- multi-line goods receipts
- multi-line purchase invoices
- partial receipts and partial invoicing across dates
- richer supplier specialization by item category
- more realistic payment timing and aging behavior

Why it matters:

- raises P2P line-table volume toward design intent
- improves AP, receiving, and three-way-match exercises
- creates better audit analytics scenarios

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

1. Phase 8 - Manual Journals and Close Cycle
2. Phase 9 - P2P Realism Expansion
3. Phase 10 - Analytics Starter Layer
4. Phase 11 - O2C and Inventory Enrichment
5. Phase 12 - Manufacturing Foundation

This order adds the most teaching value first, improves current realism before major schema expansion, and prepares the project for manufacturing later without forcing a large redesign too early.
