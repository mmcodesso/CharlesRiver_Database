# Database Guide

**Audience:** Students, instructors, and analysts who want to navigate the tables without starting from code.  
**Purpose:** Explain how the database is organized and how to move from operational data to accounting data.  
**What you will learn:** Table families, key joins, header-line patterns, and where to begin for different analytics topics.

## How the Database Is Organized

The current implementation contains **39 tables** grouped into six areas:

| Area | Tables |
|---|---|
| Accounting core | `Account`, `JournalEntry`, `GLEntry` |
| O2C | `Customer`, `SalesOrder`, `SalesOrderLine`, `Shipment`, `ShipmentLine`, `SalesInvoice`, `SalesInvoiceLine`, `CashReceipt`, `CashReceiptApplication`, `SalesReturn`, `SalesReturnLine`, `CreditMemo`, `CreditMemoLine`, `CustomerRefund` |
| P2P | `Supplier`, `PurchaseRequisition`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `PurchaseInvoice`, `PurchaseInvoiceLine`, `DisbursementPayment` |
| Manufacturing | `BillOfMaterial`, `BillOfMaterialLine`, `WorkOrder`, `MaterialIssue`, `MaterialIssueLine`, `ProductionCompletion`, `ProductionCompletionLine`, `WorkOrderClose` |
| Master data | `Item`, `Warehouse`, `Employee` |
| Organizational planning | `CostCenter`, `Budget` |

If you are new to the dataset, the easiest reading order is:

1. [company-story.md](company-story.md)
2. [process-flows.md](process-flows.md)
3. this guide

## Header-Line Pattern

Many business documents use a header table and a line table.

| Header table | Line table | Meaning |
|---|---|---|
| `SalesOrder` | `SalesOrderLine` | One customer order can contain many item lines |
| `Shipment` | `ShipmentLine` | One shipment can contain many shipped lines |
| `SalesInvoice` | `SalesInvoiceLine` | One invoice can contain many billed lines |
| `PurchaseOrder` | `PurchaseOrderLine` | One PO can contain many ordered lines |
| `GoodsReceipt` | `GoodsReceiptLine` | One receipt can contain many received lines |
| `PurchaseInvoice` | `PurchaseInvoiceLine` | One supplier invoice can contain many billed lines |
| `MaterialIssue` | `MaterialIssueLine` | One material issue can contain many component lines |
| `ProductionCompletion` | `ProductionCompletionLine` | One production completion can contain one or more completion lines |

## Most Important Keys

| Key | Use |
|---|---|
| `CustomerID` | Connect customers to orders, invoices, receipts, returns, credit memos, and refunds |
| `SupplierID` | Connect suppliers to purchase orders, invoices, and payments |
| `SalesOrderID` | Connect sales order header to shipments and invoices |
| `SalesOrderLineID` | Connect order lines to shipment lines and sales invoice lines |
| `ShipmentLineID` | Connect billed and returned lines to the exact shipped line |
| `RequisitionID` | Connect requisitions to purchase-order headers and purchase-order lines |
| `PurchaseOrderID` | Connect purchase order header to goods receipts and purchase invoices |
| `POLineID` | Connect purchase order lines to goods receipt lines and purchase invoice lines |
| `GoodsReceiptLineID` | Connect purchase invoice lines to exact receipt lines |
| `BOMID` | Connect manufactured items to their BOM headers |
| `BOMLineID` | Connect component issues back to BOM detail |
| `WorkOrderID` | Connect work-order activity across issue, completion, and close tables |
| `ItemID` | Analyze quantities, prices, standard costs, supply mode, and account mappings |
| `AccountID` | Connect `GLEntry` and `Budget` to the chart of accounts |
| `CostCenterID` | Connect operational activity, employees, and budgets to organizational reporting |

## Core Navigation Paths

### O2C path

`Customer -> SalesOrder -> SalesOrderLine -> Shipment -> ShipmentLine -> SalesInvoice -> SalesInvoiceLine`

Cash collection is tracked through:

`CashReceipt -> CashReceiptApplication -> SalesInvoice`

Returns, credits, and refunds branch from the billed shipment path:

`SalesInvoiceLine -> SalesReturn -> SalesReturnLine -> CreditMemo -> CreditMemoLine -> CustomerRefund`

### P2P path

`Supplier -> PurchaseRequisition -> PurchaseOrder -> PurchaseOrderLine -> GoodsReceipt -> GoodsReceiptLine -> PurchaseInvoice -> PurchaseInvoiceLine -> DisbursementPayment`

### Manufacturing path

`Item -> BillOfMaterial -> BillOfMaterialLine -> WorkOrder -> MaterialIssue -> MaterialIssueLine -> ProductionCompletion -> ProductionCompletionLine -> WorkOrderClose`

Manufacturing also touches P2P and O2C:

- P2P replenishes raw materials and packaging
- O2C consumes completed finished goods

### Ledger path

`GLEntry -> Account`

Then use:

- `SourceDocumentType`
- `SourceDocumentID`
- `SourceLineID`
- `VoucherType`
- `VoucherNumber`

to move back to the originating transaction.

## How to Move From Operations to Accounting

Not every operational document posts to the general ledger.

| Document family | Posts to GL? | Notes |
|---|---|---|
| Sales orders | No | Operational demand document |
| Purchase requisitions | No | Internal approval document |
| Purchase orders | No | External commitment document |
| Bills of material | No | Standard manufacturing structure |
| Work orders | No | Production planning document |
| Shipments | Yes | Posts COGS and inventory relief |
| Sales invoices | Yes | Posts AR, revenue, and sales tax |
| Cash receipts | Yes | Posts cash and customer deposits / unapplied cash |
| Cash receipt applications | Yes | Clears AR from customer deposits / unapplied cash |
| Sales returns | Yes | Posts inventory back in and reverses COGS |
| Credit memos | Yes | Posts contra revenue, tax reversal, and AR or customer credit reduction |
| Customer refunds | Yes | Posts customer credit and cash |
| Goods receipts | Yes | Posts inventory and GRNI |
| Material issues | Yes | Posts WIP and materials inventory |
| Production completions | Yes | Posts finished goods, WIP, and manufacturing clearing |
| Work-order close | Yes | Posts manufacturing variance |
| Purchase invoices | Yes | Posts GRNI clearing, AP, and purchase variance |
| Disbursements | Yes | Posts AP and cash |
| Journal entries | Yes | Opening, recurring manual, manufacturing reclass, reversal, and year-end close journals |

## Start Here by Analytics Topic

### Financial analytics

Start with:

- `GLEntry`
- `Account`
- `SalesInvoice`
- `CashReceiptApplication`
- `CreditMemo`
- `PurchaseInvoice`
- `DisbursementPayment`
- `WorkOrderClose`

### Managerial analytics

Start with:

- `Budget`
- `CostCenter`
- `Item`
- `BillOfMaterial`
- `WorkOrder`
- `MaterialIssueLine`
- `ProductionCompletionLine`
- `ShipmentLine`
- `PurchaseOrderLine`

### Audit analytics

Start with:

- O2C chain tables
- P2P chain tables
- manufacturing chain tables
- `GLEntry`
- `validation_report.json`
- the anomaly log in Excel

## Current Practical Tips

- The SQLite export is the easiest format for SQL work.
- `CashReceiptApplication` is the authoritative invoice-settlement link in O2C.
- For P2P traceability, prefer `PurchaseOrderLine.RequisitionID` and `PurchaseInvoiceLine.GoodsReceiptLineID`.
- For manufacturing traceability, start from `WorkOrderID`.
- For raw multi-year income-statement analysis, exclude the two year-end close entry types.

## Where to Go Next

- Read [process-flows.md](process-flows.md) for the business meaning of each document chain.
- Read [analytics/index.md](analytics/index.md) for the starter analytics layer.
- Read [reference/schema.md](reference/schema.md) for the technical schema reference.
