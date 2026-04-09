# Row Volume Reference

**Audience:** Contributors, instructors, and advanced users who need current scale expectations for the dataset.  
**Purpose:** Compare historical design-intent row ranges with the current deterministic default build.  
**What you will learn:** Which tables are already at useful teaching scale, which ones now exceed the original design bands, and how much manufacturing changed total volume.

The default configuration uses:

- `config/settings.yaml`
- fiscal years `2026-01-01` through `2030-12-31`
- random seed `20260401`

> **Implemented in current generator:** A deterministic five-year hybrid manufacturer-distributor dataset whose default counts are stable unless configuration or generation logic changes.

> **Planned future extension:** A payroll process cycle that will add operational payroll tables and more ledger volume.

## Current Default Build vs Historical Design Intent

The target ranges below come from the project’s earlier design-planning model. They are useful context, not strict quality thresholds.

| Group | Table | Target rows | Current default rows |
|---|---|---:|---:|
| Accounting core | Account | 75 to 95 | 95 |
| Accounting core | JournalEntry | 900 to 1,500 | 1,681 |
| Accounting core | GLEntry | 60,000 to 110,000 | 517,871 |
| O2C | Customer | 150 to 300 | 220 |
| O2C | SalesOrder | 4,500 to 9,000 | 6,777 |
| O2C | SalesOrderLine | 13,000 to 30,000 | 26,422 |
| O2C | Shipment | 4,200 to 8,500 | 23,573 |
| O2C | ShipmentLine | 12,000 to 28,000 | 32,873 |
| O2C | SalesInvoice | 4,200 to 8,500 | 29,839 |
| O2C | SalesInvoiceLine | 12,000 to 28,000 | 32,807 |
| O2C | CashReceipt | 4,000 to 9,500 | 9,242 |
| O2C | CashReceiptApplication | Not specified in original design | 18,165 |
| O2C | SalesReturn | Not specified in original design | 916 |
| O2C | SalesReturnLine | Not specified in original design | 930 |
| O2C | CreditMemo | Not specified in original design | 916 |
| O2C | CreditMemoLine | Not specified in original design | 930 |
| O2C | CustomerRefund | Not specified in original design | 52 |
| P2P | Supplier | 80 to 160 | 110 |
| P2P | PurchaseRequisition | 2,500 to 6,000 | 14,494 |
| P2P | PurchaseOrder | 2,200 to 5,500 | 11,759 |
| P2P | PurchaseOrderLine | 7,000 to 18,000 | 14,225 |
| P2P | GoodsReceipt | 2,100 to 5,000 | 23,192 |
| P2P | GoodsReceiptLine | 6,500 to 17,000 | 23,364 |
| P2P | PurchaseInvoice | 2,100 to 5,000 | 31,990 |
| P2P | PurchaseInvoiceLine | 6,500 to 17,000 | 32,363 |
| P2P | DisbursementPayment | 2,300 to 5,500 | 33,331 |
| Manufacturing | BillOfMaterial | Not specified in original design | 80 |
| Manufacturing | BillOfMaterialLine | Not specified in original design | 282 |
| Manufacturing | WorkOrder | Not specified in original design | 3,932 |
| Manufacturing | MaterialIssue | Not specified in original design | 6,789 |
| Manufacturing | MaterialIssueLine | Not specified in original design | 24,249 |
| Manufacturing | ProductionCompletion | Not specified in original design | 6,572 |
| Manufacturing | ProductionCompletionLine | Not specified in original design | 6,572 |
| Manufacturing | WorkOrderClose | Not specified in original design | 2,867 |
| Master data | Item | 180 to 350 | 240 |
| Master data | Warehouse | 2 to 3 | 2 |
| Master data | Employee | 55 to 75 | 64 |
| Organizational planning | CostCenter | 8 to 14 | 9 |
| Organizational planning | Budget | 2,000 to 4,500 | 3,300 |

## What Changed in Phase 12

Phase 12 added a manufacturing foundation and materially increased total row volume through:

- manufacturing-driven requisitions
- work orders
- material issues
- production completions
- work-order close activity
- factory overhead and manufacturing conversion reclass journals
- larger posted-ledger volume from manufacturing events

## How to Read These Counts

- Treat the current default counts as the best guide for classroom planning.
- Treat the target ranges as historical design guidance, not strict quality thresholds.
- Expect counts to change if you alter settings, anomaly behavior, or later phases.
