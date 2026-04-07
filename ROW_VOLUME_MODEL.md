# Row Volume Model

This document compares the target five-year row-volume ranges from `Design.md` with the current default generated output.

The default configuration uses `config/settings.yaml` with fiscal years 2026 through 2030 and random seed `20260401`.

| Group | Table | Target Rows | Current Default Rows |
|---|---:|---:|---:|
| Accounting Core | Account | 75 to 95 | 87 |
| Accounting Core | JournalEntry | 900 to 1,500 | 1 |
| Accounting Core | GLEntry | 60,000 to 110,000 | 106,355 |
| O2C | Customer | 150 to 300 | 220 |
| O2C | SalesOrder | 4,500 to 9,000 | 6,950 |
| O2C | SalesOrderLine | 13,000 to 30,000 | 24,150 |
| O2C | Shipment | 4,200 to 8,500 | 6,352 |
| O2C | ShipmentLine | 12,000 to 28,000 | 21,186 |
| O2C | SalesInvoice | 4,200 to 8,500 | 6,332 |
| O2C | SalesInvoiceLine | 12,000 to 28,000 | 21,115 |
| O2C | CashReceipt | 4,000 to 9,500 | 5,347 |
| P2P | Supplier | 80 to 160 | 110 |
| P2P | PurchaseRequisition | 2,500 to 6,000 | 4,155 |
| P2P | PurchaseOrder | 2,200 to 5,500 | 3,910 |
| P2P | PurchaseOrderLine | 7,000 to 18,000 | 3,910 |
| P2P | GoodsReceipt | 2,100 to 5,000 | 3,112 |
| P2P | GoodsReceiptLine | 6,500 to 17,000 | 3,112 |
| P2P | PurchaseInvoice | 2,100 to 5,000 | 2,768 |
| P2P | PurchaseInvoiceLine | 6,500 to 17,000 | 2,768 |
| P2P | DisbursementPayment | 2,300 to 5,500 | 2,210 |
| Master Data | Item | 180 to 350 | 240 |
| Master Data | Warehouse | 2 to 3 | 2 |
| Master Data | Employee | 55 to 75 | 64 |
| Organizational | CostCenter | 8 to 14 | 8 |
| Organizational | Budget | 2,000 to 4,500 | 2,940 |

## Notes

- `JournalEntry` is currently below the design target because recurring manual operating journals have not yet been implemented.
- P2P line tables are below the design target because the current clean implementation uses mostly one-line purchase orders, goods receipts, and purchase invoices.
- The GL row count is within the design target because operational postings produce substantial line-level accounting detail.
- Future enhancements should add recurring manual journals and more multi-line P2P documents to better match all row-volume targets.
