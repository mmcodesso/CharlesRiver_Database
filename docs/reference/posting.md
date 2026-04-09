# Posting Reference

**Audience:** Contributors, advanced students, and instructors who need the implemented accounting logic in technical form.  
**Purpose:** Document the event-based posting rules used by the current generator.  
**What you will learn:** Which documents post, which accounts are affected, and how postings are traced back to source transactions.

Posting logic is implemented across `src/greenfield_dataset/budgets.py`, `src/greenfield_dataset/journals.py`, and `src/greenfield_dataset/posting_engine.py`.

> **Implemented in current generator:** Event-based postings for O2C, P2P, manufacturing, opening balances, recurring manual journals, reversal journals, manufacturing reclasses, and year-end close.

> **Planned future extension:** Payroll-cycle posting events beyond the current journal-only payroll treatment.

## Non-Posting Documents

These documents are generated for process analysis but do **not** create `GLEntry` rows:

- `SalesOrder`
- `SalesOrderLine`
- `PurchaseRequisition`
- `PurchaseOrder`
- `PurchaseOrderLine`
- `BillOfMaterial`
- `BillOfMaterialLine`
- `WorkOrder`

## Posting Matrix

| Event | Source tables | Posting date used | Debit | Credit |
|---|---|---|---|---|
| Opening balance journal | `JournalEntry` plus seeded GL rows | `2026-01-01` | Asset accounts and selected opening balances | Liability, equity, contra-asset balances, and retained earnings plug |
| Payroll accrual | `JournalEntry` plus seeded GL rows | Last calendar day of month | Salary expense by cost center and `6060` Payroll Taxes and Benefits | `2030` Accrued Payroll |
| Payroll settlement | `JournalEntry` plus seeded GL rows | First business day of following month | `2030` Accrued Payroll | `1010` Cash and Cash Equivalents |
| Rent | `JournalEntry` plus seeded GL rows | First business day of month | `6070` Warehouse Rent or `6080` Office Rent | `1010` Cash and Cash Equivalents |
| Utilities | `JournalEntry` plus seeded GL rows | Last business day of month | `6090` Utilities Expense | `1010` Cash and Cash Equivalents |
| Factory overhead | `JournalEntry` plus seeded GL rows | Last business day of month | `6270` Factory Overhead Expense | `1010` Cash and Cash Equivalents |
| Manufacturing conversion reclass | `JournalEntry` plus seeded GL rows | Last business day of month | `1090` Manufacturing Cost Clearing | `6260` Salaries Expense - Manufacturing and `6270` Factory Overhead Expense |
| Depreciation | `JournalEntry` plus seeded GL rows | Last calendar day of month | `6130` Depreciation Expense | accumulated depreciation accounts |
| Month-end accrual | `JournalEntry` plus seeded GL rows | Last business day of month | selected operating expenses | `2040` Accrued Expenses |
| Accrual reversal | `JournalEntry` plus seeded GL rows | First business day of following month | Reverse prior accrual liability and expense lines | Reverse prior accrual liability and expense lines |
| Shipment | `Shipment`, `ShipmentLine` | `ShipmentDate` | Item COGS account | Item inventory account |
| Sales invoice | `SalesInvoice`, `SalesInvoiceLine` | `InvoiceDate` | Accounts receivable | Item revenue account and sales tax payable |
| Cash receipt | `CashReceipt` | `ReceiptDate` | Cash | `2060` Customer Deposits and Unapplied Cash |
| Cash receipt application | `CashReceiptApplication` | `ApplicationDate` | `2060` Customer Deposits and Unapplied Cash | Accounts receivable |
| Sales return | `SalesReturn`, `SalesReturnLine` | `ReturnDate` | Item inventory account | Item COGS account |
| Credit memo | `CreditMemo`, `CreditMemoLine` | `CreditMemoDate` | `4060` Sales Returns and Allowances and sales tax payable reversal | Accounts receivable or `2060` Customer Deposits and Unapplied Cash |
| Customer refund | `CustomerRefund` | `RefundDate` | `2060` Customer Deposits and Unapplied Cash | Cash |
| Goods receipt | `GoodsReceipt`, `GoodsReceiptLine` | `ReceiptDate` | Item inventory account | `2020` Goods Received Not Invoiced |
| Material issue | `MaterialIssue`, `MaterialIssueLine` | `IssueDate` | `1046` Inventory - Work in Process | `1045` Inventory - Materials and Packaging |
| Production completion | `ProductionCompletion`, `ProductionCompletionLine` | `CompletionDate` | `1040` Inventory - Finished Goods | `1046` Inventory - Work in Process and `1090` Manufacturing Cost Clearing |
| Work-order close | `WorkOrderClose` | `CloseDate` | or credit `5080` Manufacturing Variance depending on sign | offset `1046` or `1090` residual balances |
| Purchase invoice | `PurchaseInvoice`, `PurchaseInvoiceLine` | `ApprovedDate` | GRNI cleared at matched receipt-line basis, purchase variance when needed, and nonrecoverable tax to variance | Accounts payable and purchase variance when needed |
| Disbursement | `DisbursementPayment` | `PaymentDate` | Accounts payable | Cash |
| Year-end close: P&L to income summary | `JournalEntry` plus seeded GL rows | `YYYY-12-31` | Revenue or expense balances needed to close annual P&L accounts | `8010` Income Summary |
| Year-end close: income summary to retained earnings | `JournalEntry` plus seeded GL rows | `YYYY-12-31` | `8010` Income Summary or `3030` Retained Earnings depending on sign | offset retained earnings or income summary |

## Core Control Accounts

| Account number | Meaning |
|---|---|
| `1010` | Cash and cash equivalents |
| `1020` | Accounts receivable |
| `1040` | Inventory - finished goods |
| `1045` | Inventory - materials and packaging |
| `1046` | Inventory - work in process |
| `1090` | Manufacturing cost clearing |
| `2010` | Accounts payable |
| `2020` | Goods Received Not Invoiced |
| `2030` | Accrued payroll |
| `2040` | Accrued expenses |
| `2050` | Sales tax payable |
| `2060` | Customer deposits and unapplied cash |
| `4060` | Sales returns and allowances |
| `5080` | Manufacturing variance |
| `3030` | Retained earnings |
| `5060` | Purchase price variance |
| `8010` | Income summary |

## Source Traceability

Each operational posting written to `GLEntry` includes:

- `VoucherType`
- `VoucherNumber`
- `SourceDocumentType`
- `SourceDocumentID`
- `SourceLineID`
- `PostingDate`
- `FiscalYear`
- `FiscalPeriod`

## Validation Coverage

`src/greenfield_dataset/validations.py` checks:

- voucher-level balance
- overall trial balance equality
- AR roll-forward
- AP roll-forward
- inventory roll-forward
- customer deposit and unapplied cash roll-forward
- sales tax and contra-revenue roll-forwards
- GRNI roll-forward
- WIP roll-forward
- manufacturing clearing roll-forward
- manufacturing variance roll-forward
- journal header-to-GL agreement
- accrual reversal linkage and timing
- year-end close completeness and annual P&L closure
