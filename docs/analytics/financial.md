# Financial Analytics Starter Guide

**Audience:** Students, instructors, and analysts starting with financial accounting questions in the dataset.  
**Purpose:** Show how to study revenue, COGS, receivables, payables, trial balance logic, and journal activity using the current implementation.  
**What you will learn:** Which tables matter most, which joins are common, which starter SQL files to run, and how to reproduce the same ideas in Excel.

> **Implemented in current generator:** Revenue-cycle postings, P2P liability postings, recurring manual journals, year-end close, and a full `GLEntry` ledger suitable for multi-period financial analysis.

> **Planned future extension:** Returns, credit-memo style flows, richer O2C timing behavior, and manufacturing-related financial analytics.

## Learning Goals

- connect operational documents to posted ledger activity
- analyze revenue and gross margin by period
- build AR and AP open-item views
- understand trial balance structure from `GLEntry`
- review recurring journals, reversals, and year-end close behavior
- reconcile subledgers to control accounts

## Relevant Tables

| Topic | Main tables |
|---|---|
| Revenue and margin | `GLEntry`, `Account`, `SalesInvoice`, `SalesInvoiceLine`, `ShipmentLine` |
| AR | `SalesInvoice`, `CashReceipt`, `Customer`, `GLEntry` |
| AP | `PurchaseInvoice`, `DisbursementPayment`, `Supplier`, `GLEntry` |
| Trial balance | `GLEntry`, `Account` |
| Journals and close | `JournalEntry`, `GLEntry`, `Account` |

## Key Joins and Navigation

- `GLEntry.AccountID -> Account.AccountID`
- `SalesInvoice.CustomerID -> Customer.CustomerID`
- `CashReceipt.SalesInvoiceID -> SalesInvoice.SalesInvoiceID`
- `PurchaseInvoice.SupplierID -> Supplier.SupplierID`
- `DisbursementPayment.PurchaseInvoiceID -> PurchaseInvoice.PurchaseInvoiceID`
- `GLEntry.VoucherNumber -> JournalEntry.EntryNumber` for journal-sourced rows

## Common Measures

| Measure | Basic definition in the current dataset |
|---|---|
| Revenue | Revenue-account credit minus debit, usually from `SalesInvoice` postings |
| COGS | COGS-account debit minus credit, usually from `Shipment` postings |
| Gross margin | Revenue minus COGS |
| Open AR | Sales invoice total minus collected cash |
| Open AP | Purchase invoice total minus disbursements |
| Trial balance balance check | Sum of debits minus credits should equal zero |
| Journal volume | Count and amount of `JournalEntry` rows by `EntryType` and posting period |

## Starter SQL Map

| Topic | Starter SQL file | What it answers |
|---|---|---|
| Monthly revenue and margin | [01_monthly_revenue_and_gross_margin.sql](../../queries/financial/01_monthly_revenue_and_gross_margin.sql) | What did the company recognize as revenue, COGS, and gross margin each period? |
| AR aging | [02_ar_aging_open_invoices.sql](../../queries/financial/02_ar_aging_open_invoices.sql) | Which customer invoices remain open and how old are they? |
| AP aging | [03_ap_aging_open_invoices.sql](../../queries/financial/03_ap_aging_open_invoices.sql) | Which supplier invoices remain unpaid and how old are they? |
| Trial balance | [04_trial_balance_by_period.sql](../../queries/financial/04_trial_balance_by_period.sql) | What does the period trial balance look like by account? |
| Journal and close review | [05_journal_and_close_cycle_review.sql](../../queries/financial/05_journal_and_close_cycle_review.sql) | How much activity comes from recurring journals and close entries? |
| Control-account reconciliation | [06_control_account_reconciliation.sql](../../queries/financial/06_control_account_reconciliation.sql) | Do AR, AP, inventory, and GRNI agree with subledger-derived expectations? |

## Typical SQL Workflow

1. Start with the monthly revenue and margin query.
2. Compare AR and AP aging to the control-account reconciliation query.
3. Open the trial balance query to connect account numbers to the summarized ledger.
4. Review journal and close-cycle activity before using multi-year ledger results for financial statement style analysis.
5. If you need raw multi-year profit-and-loss activity, exclude year-end close entry types when working with journals.

## Typical Excel Workflow

- Use `GLEntry` and `Account` to create a monthly pivot by:
  - `FiscalYear`
  - `FiscalPeriod`
  - `AccountType`
  - `AccountNumber`
- Use `SalesInvoice` plus `CashReceipt` for an AR aging workbook tab.
- Use `PurchaseInvoice` plus `DisbursementPayment` for an AP aging workbook tab.
- Use `JournalEntry` to build a journal summary by `EntryType` and posting month.
- Use `XLOOKUP` from `GLEntry[VoucherNumber]` to `JournalEntry[EntryNumber]` when you need to identify close entries inside ledger detail.

## Interpretation Notes and Pitfalls

- Revenue and COGS are separate posting events. Revenue posts at invoicing and COGS posts at shipment.
- Control-account queries are the best bridge between document-level activity and ledger balances.
- Year-end close entries are real posted journals in the current generator. They are useful for close-cycle analysis but can distort raw multi-year income statement analysis if not filtered.
- The current dataset does not yet model returns, credit memos, or manufacturing cost flows.
- AR and AP aging in the starter pack use the latest transaction date in the dataset as the as-of date, not today’s real-world date.

## Current Scope vs Future Scope

### Implemented in current generator

- monthly revenue and COGS analysis
- AR and AP open-item analysis
- trial balance and control-account analysis
- recurring journal and year-end close analysis

### Planned future extension

- returns and allowance analytics
- richer O2C timing analytics after Phase 11
- manufacturing-related inventory and margin analytics after Phase 12

## Where to Go Next

- Read [sql-guide.md](sql-guide.md) for how to run and adapt the SQL files.
- Read [excel-guide.md](excel-guide.md) for pivot-table and chart setups.
