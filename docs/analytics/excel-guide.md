# Excel Starter Guide

**Audience:** Students, instructors, and analysts using the Excel export for classroom analysis.  
**Purpose:** Show how to turn the generated workbook into a practical starter environment for pivots, charts, aging schedules, and anomaly review.  
**What you will learn:** Which sheets matter for each analytics area, how to structure pivots, and how to separate clean analysis from anomaly-focused review.

> **Implemented in current generator:** A workbook with one sheet per table plus `AnomalyLog` and `ValidationSummary`, suitable for Excel-based starter analytics.

> **Planned future extension:** Additional workbook guidance for manufacturing analytics after that phase is implemented.

## Workbook Setup

The generated workbook contains:

- one worksheet for each dataset table
- `AnomalyLog` when anomalies are enabled
- `ValidationSummary`

Recommended first steps:

1. open `outputs/greenfield_2026_2030.xlsx`
2. convert the most-used sheets into Excel Tables
3. freeze the top row on large sheets
4. format date and amount columns consistently
5. add slicers or timeline filters for year and month where helpful

## Financial Accounting Workflows

### Monthly revenue and gross margin

Use:

- `GLEntry`
- `Account`

Recommended pivot layout:

- rows: `FiscalYear`, `FiscalPeriod`
- columns: `AccountType` or `AccountSubType`
- values:
  - `Sum of Debit`
  - `Sum of Credit`

Recommended helper logic:

- create a net amount column such as `Debit - Credit`
- for revenue analysis, treat revenue as credit-oriented and COGS as debit-oriented

Suggested charts:

- monthly revenue trend
- monthly gross margin trend

### AR aging

Use:

- `SalesInvoice`
- `CashReceipt`
- `CashReceiptApplication`
- `CreditMemo`
- `Customer`

Recommended steps:

1. summarize cash applications by `SalesInvoiceID`
2. summarize credit memos by `OriginalSalesInvoiceID`
3. join or look up those totals to invoice rows
4. compute open amount
5. compute aging bucket from `DueDate`

Suggested outputs:

- open AR by customer
- open AR by aging bucket
- open AR by region or customer segment

### AP aging

Use:

- `PurchaseInvoice`
- `DisbursementPayment`
- `Supplier`

Recommended outputs:

- open AP by supplier
- open AP by supplier category
- overdue AP by aging bucket

### Journal and close-cycle analysis

Use:

- `JournalEntry`
- `GLEntry`

Recommended outputs:

- journal counts by `EntryType`
- journal amounts by month
- close-entry review by fiscal year

If you want to exclude year-end close activity from ledger analysis:

- use `XLOOKUP` from `GLEntry[VoucherNumber]` to `JournalEntry[EntryNumber]`
- bring `JournalEntry[EntryType]` into the ledger view
- filter out:
  - `Year-End Close - P&L to Income Summary`
  - `Year-End Close - Income Summary to Retained Earnings`

## Managerial Accounting Workflows

### Budget vs actual

Use:

- `Budget`
- `CostCenter`
- `Account`
- `GLEntry`
- `JournalEntry`

Recommended approach:

1. build a budget pivot by year, month, cost center, and account
2. build an actual-expense pivot from `GLEntry`
3. exclude year-end close journal rows from actual expense
4. compare the two in a summary sheet or Power Query merge

Suggested charts:

- monthly budget versus actual by cost center
- variance by account within one cost center

### Sales mix and product mix

Use:

- `SalesInvoice`
- `SalesInvoiceLine`
- `Customer`
- `Item`

Recommended pivots:

- revenue by region and item group
- revenue by customer segment and item
- billed quantity by item group

### Inventory movement

Use:

- `GoodsReceipt`
- `GoodsReceiptLine`
- `Shipment`
- `ShipmentLine`
- `Warehouse`
- `Item`

Suggested outputs:

- inbound quantity by warehouse and item group
- outbound quantity by warehouse and item group
- net movement by item

### Supplier and purchasing analysis

Use:

- `PurchaseOrder`
- `PurchaseOrderLine`
- `Supplier`
- `Item`

Suggested pivots:

- ordered value by supplier category
- ordered value by supplier risk rating
- item-group purchasing by month

## Audit Analytics Workflows

### Document-chain completeness

Use:

- O2C document sheets for sales-side completeness
- P2P document sheets for purchasing-side completeness

Recommended approach:

- build summary pivots by document status
- use Power Query or lookups for line-level completeness checks
- focus on:
  - partially shipped or billed sales activity
  - requisitions with missing later-stage activity

### Approval and segregation-of-duties review

Use:

- `PurchaseRequisition`
- `PurchaseOrder`
- `PurchaseInvoice`
- `JournalEntry`
- `Employee`

Suggested checks:

- same creator and approver
- missing approver on approved status
- concentration of approvals by one employee

### Cut-off and timing review

Use:

- `Shipment` and `SalesInvoice`
- `PurchaseRequisition`, `PurchaseOrder`, `GoodsReceipt`, and `PurchaseInvoice`

Suggested measures:

- days from shipment to invoice
- days from requisition to order
- days from order to receipt
- days from receipt to invoice

### Anomaly review

Use:

- `AnomalyLog`
- `ValidationSummary`
- the base document sheets that the anomaly references

Suggested workflow:

1. review anomaly counts by type
2. filter one anomaly type at a time
3. trace the related document back into the operational sheets
4. compare the anomaly to the clean process expectation

## Clean Analysis vs Anomaly Analysis

- For clean baseline analysis, use a build with `anomaly_mode: none`.
- For controls teaching, use the default `standard` build.
- Make the distinction explicit in class, because some review sheets should be interpreted as designed exceptions rather than system errors.

## Current Scope Limits

The Excel starter layer does **not** assume:

- prebuilt pivot tables inside the exported workbook
- manufacturing sheets
- work-in-process analysis

Those are future teaching extensions, not missing pieces of the current workbook.

## Where to Go Next

- Read [financial.md](financial.md), [managerial.md](managerial.md), or [audit.md](audit.md) for topic-specific workflows.
- Read [../instructor-guide.md](../instructor-guide.md) for how to sequence these workflows in class.
