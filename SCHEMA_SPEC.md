# Schema Specification

The executable schema is defined in `src/greenfield_dataset/schema.py` as `TABLE_COLUMNS`.

The design follows the Version 3 blueprint in `Design.md` and implements 24 logical tables across accounting, O2C, P2P, master data, and organizational planning.

## Table Groups

| Group | Tables |
|---|---|
| Accounting Core | `Account`, `JournalEntry`, `GLEntry` |
| Order-to-Cash | `Customer`, `SalesOrder`, `SalesOrderLine`, `Shipment`, `ShipmentLine`, `SalesInvoice`, `SalesInvoiceLine`, `CashReceipt` |
| Procure-to-Pay | `Supplier`, `PurchaseRequisition`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `PurchaseInvoice`, `PurchaseInvoiceLine`, `DisbursementPayment` |
| Master Data | `Item`, `Warehouse`, `Employee` |
| Organizational | `CostCenter`, `Budget` |

## Accounting Core

`Account` contains the configured chart of accounts loaded from `config/accounts.csv`.

`JournalEntry` contains manual journal headers. The current implementation creates an opening balance journal header.

`GLEntry` contains all posted accounting lines. It is the main reporting table and includes direct source traceability.

Important `GLEntry` lineage columns:

- `VoucherType`
- `VoucherNumber`
- `SourceDocumentType`
- `SourceDocumentID`
- `SourceLineID`
- `FiscalYear`
- `FiscalPeriod`

## Order-to-Cash Flow

The O2C document chain is:

```text
Customer -> SalesOrder -> SalesOrderLine -> Shipment -> ShipmentLine -> SalesInvoice -> SalesInvoiceLine -> CashReceipt
```

Key design choices:

- Sales orders are operational documents and do not post directly to GL.
- Shipments drive COGS and inventory relief.
- Sales invoices drive AR, revenue, and sales tax payable.
- Cash receipts reduce AR and increase cash.

## Procure-to-Pay Flow

The P2P document chain is:

```text
Supplier -> PurchaseRequisition -> PurchaseOrder -> PurchaseOrderLine -> GoodsReceipt -> GoodsReceiptLine -> PurchaseInvoice -> PurchaseInvoiceLine -> DisbursementPayment
```

Key design choices:

- Requisitions and purchase orders are operational documents and do not post directly to GL.
- Goods receipts drive inventory and GRNI.
- Purchase invoices clear GRNI and create AP.
- Disbursements reduce AP and cash.

## Master Data

`Item` includes account mapping fields:

- `InventoryAccountID`
- `RevenueAccountID`
- `COGSAccountID`
- `PurchaseVarianceAccountID`
- `TaxCategory`

These mappings keep the posting engine data-driven instead of hardcoding item-specific accounts.

`Employee` and `CostCenter` are generated with a manager backfill step because each table can reference the other.

## Budgets

`Budget` is generated monthly by fiscal year, cost center, and selected revenue or expense accounts. It is designed for management accounting and planning analytics rather than direct posting.

## Expected Integrity Rules

- Header totals should equal related line totals.
- Clean operational data should not over-ship or over-receive.
- GL vouchers should balance by `VoucherType` and `VoucherNumber`.
- Trial balance debits should equal credits.
- Control account roll-forwards should reconcile against subledger activity.
