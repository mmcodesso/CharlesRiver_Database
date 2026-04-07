# Schema Spec

This project follows the revised Version 3 schema in `Design.md`.

## Table Groups

Accounting Core:
- Account
- JournalEntry
- GLEntry

Order-to-Cash:
- Customer
- SalesOrder
- SalesOrderLine
- Shipment
- ShipmentLine
- SalesInvoice
- SalesInvoiceLine
- CashReceipt

Procure-to-Pay:
- Supplier
- PurchaseRequisition
- PurchaseOrder
- PurchaseOrderLine
- GoodsReceipt
- GoodsReceiptLine
- PurchaseInvoice
- PurchaseInvoiceLine
- DisbursementPayment

Master Data:
- Item
- Warehouse
- Employee

Organizational:
- CostCenter
- Budget

## Implementation Source

The executable table registry is defined in `src/greenfield_dataset/schema.py` as `TABLE_COLUMNS`.

## Required Traceability Fields

`GLEntry` keeps direct source traceability with `SourceDocumentType`, `SourceDocumentID`, `SourceLineID`, `FiscalYear`, and `FiscalPeriod`.

`JournalEntry` includes `ReversesJournalEntryID` to support reversal analysis.
