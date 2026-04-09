# Schema Reference

**Audience:** Contributors, advanced users, and instructors who need the implemented schema in a compact technical form.  
**Purpose:** Summarize the executable schema that the generator currently creates.  
**What you will learn:** The implemented table groups, key columns, and the patterns that matter for joins and traceability.

The canonical schema lives in `src/greenfield_dataset/schema.py` as `TABLE_COLUMNS`.

> **Implemented in current generator:** 31 tables across accounting, O2C, P2P, master data, and organizational planning.

> **Planned future extension:** Manufacturing-related tables and richer operational detail in future phases.

## Table Groups

| Group | Tables | Count |
|---|---|---:|
| Accounting core | `Account`, `JournalEntry`, `GLEntry` | 3 |
| O2C | `Customer`, `SalesOrder`, `SalesOrderLine`, `Shipment`, `ShipmentLine`, `SalesInvoice`, `SalesInvoiceLine`, `CashReceipt`, `CashReceiptApplication`, `SalesReturn`, `SalesReturnLine`, `CreditMemo`, `CreditMemoLine`, `CustomerRefund` | 14 |
| P2P | `Supplier`, `PurchaseRequisition`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `PurchaseInvoice`, `PurchaseInvoiceLine`, `DisbursementPayment` | 9 |
| Master data | `Item`, `Warehouse`, `Employee` | 3 |
| Organizational planning | `CostCenter`, `Budget` | 2 |
| Total |  | 31 |

## Design Patterns That Matter

- Header-line tables are used for sales orders, shipments, sales invoices, purchase orders, goods receipts, and purchase invoices.
- `GLEntry` is the reporting bridge between operational events and accounting analysis.
- `Item` carries account-mapping fields used by the posting engine.
- `Employee` and `CostCenter` reference each other, so generation uses a backfill step for managers.
- `JournalEntry` and `GLEntry` together represent the opening balance, recurring manual journals, accrual reversals, and year-end close activity without requiring a separate journal-line table.

## Accounting Core

| Table | Purpose | High-value columns |
|---|---|---|
| `Account` | Chart of accounts and hierarchy | `AccountNumber`, `AccountType`, `AccountSubType`, `ParentAccountID`, `NormalBalance` |
| `JournalEntry` | Manual journal header table | `EntryNumber`, `PostingDate`, `EntryType`, `CreatedByEmployeeID`, `ApprovedByEmployeeID`, `ReversesJournalEntryID` |
| `GLEntry` | Posted ledger detail and source traceability | `PostingDate`, `AccountID`, `Debit`, `Credit`, `VoucherType`, `VoucherNumber`, `SourceDocumentType`, `SourceDocumentID`, `SourceLineID`, `FiscalYear`, `FiscalPeriod` |

## Order-to-Cash

| Table | Purpose | High-value columns |
|---|---|---|
| `Customer` | Customer master data | `CreditLimit`, `PaymentTerms`, `SalesRepEmployeeID`, `CustomerSegment`, `Industry`, `Region` |
| `SalesOrder` | Sales order header | `OrderNumber`, `OrderDate`, `CustomerID`, `RequestedDeliveryDate`, `SalesRepEmployeeID`, `CostCenterID`, `OrderTotal`, `Status` |
| `SalesOrderLine` | Sales order detail | `SalesOrderID`, `LineNumber`, `ItemID`, `Quantity`, `UnitPrice`, `Discount`, `LineTotal` |
| `Shipment` | Shipment header | `ShipmentNumber`, `SalesOrderID`, `ShipmentDate`, `WarehouseID`, `Status`, `DeliveryDate` |
| `ShipmentLine` | Shipment detail used for fulfillment and COGS | `ShipmentID`, `SalesOrderLineID`, `ItemID`, `QuantityShipped`, `ExtendedStandardCost` |
| `SalesInvoice` | Sales invoice header | `InvoiceNumber`, `InvoiceDate`, `DueDate`, `SalesOrderID`, `CustomerID`, `SubTotal`, `TaxAmount`, `GrandTotal`, `Status` |
| `SalesInvoiceLine` | Sales invoice detail | `SalesInvoiceID`, `SalesOrderLineID`, `ShipmentLineID`, `ItemID`, `Quantity`, `UnitPrice`, `Discount`, `LineTotal` |
| `CashReceipt` | Customer payment header | `ReceiptNumber`, `ReceiptDate`, `CustomerID`, `SalesInvoiceID`, `Amount`, `PaymentMethod`, `ReferenceNumber`, `RecordedByEmployeeID` |
| `CashReceiptApplication` | Receipt-to-invoice application detail | `CashReceiptID`, `SalesInvoiceID`, `ApplicationDate`, `AppliedAmount`, `AppliedByEmployeeID` |
| `SalesReturn` | Customer return header | `ReturnNumber`, `ReturnDate`, `CustomerID`, `SalesOrderID`, `WarehouseID`, `ReasonCode`, `Status` |
| `SalesReturnLine` | Returned item detail used for inventory restoration | `SalesReturnID`, `ShipmentLineID`, `ItemID`, `QuantityReturned`, `ExtendedStandardCost` |
| `CreditMemo` | Customer credit memo header | `CreditMemoNumber`, `CreditMemoDate`, `SalesReturnID`, `OriginalSalesInvoiceID`, `SubTotal`, `TaxAmount`, `GrandTotal`, `Status` |
| `CreditMemoLine` | Customer credit memo detail | `CreditMemoID`, `SalesReturnLineID`, `ItemID`, `Quantity`, `UnitPrice`, `LineTotal` |
| `CustomerRefund` | Customer refund payment record | `RefundNumber`, `RefundDate`, `CustomerID`, `CreditMemoID`, `Amount`, `PaymentMethod`, `ReferenceNumber` |

## Procure-to-Pay

| Table | Purpose | High-value columns |
|---|---|---|
| `Supplier` | Supplier master data | `PaymentTerms`, `TaxID`, `BankAccount`, `SupplierCategory`, `SupplierRiskRating`, `DefaultCurrency` |
| `PurchaseRequisition` | Internal request document | `RequisitionNumber`, `RequestDate`, `RequestedByEmployeeID`, `CostCenterID`, `ItemID`, `Quantity`, `EstimatedUnitCost`, `ApprovedByEmployeeID`, `Status` |
| `PurchaseOrder` | Purchase order header | `PONumber`, `OrderDate`, `SupplierID`, `RequisitionID`, `ExpectedDeliveryDate`, `CreatedByEmployeeID`, `ApprovedByEmployeeID`, `OrderTotal`, `Status` |
| `PurchaseOrderLine` | Purchase order detail | `PurchaseOrderID`, `RequisitionID`, `LineNumber`, `ItemID`, `Quantity`, `UnitCost`, `LineTotal` |
| `GoodsReceipt` | Receipt header | `ReceiptNumber`, `ReceiptDate`, `PurchaseOrderID`, `WarehouseID`, `ReceivedByEmployeeID`, `Status` |
| `GoodsReceiptLine` | Receipt detail used for quantity and cost tracking | `GoodsReceiptID`, `POLineID`, `ItemID`, `QuantityReceived`, `ExtendedStandardCost` |
| `PurchaseInvoice` | Supplier invoice header | `InvoiceNumber`, `InvoiceDate`, `ReceivedDate`, `DueDate`, `PurchaseOrderID`, `SupplierID`, `SubTotal`, `TaxAmount`, `GrandTotal`, `ApprovedByEmployeeID`, `Status` |
| `PurchaseInvoiceLine` | Supplier invoice detail | `PurchaseInvoiceID`, `POLineID`, `GoodsReceiptLineID`, `LineNumber`, `ItemID`, `Quantity`, `UnitCost`, `LineTotal` |
| `DisbursementPayment` | Supplier payment record | `PaymentNumber`, `PaymentDate`, `SupplierID`, `PurchaseInvoiceID`, `Amount`, `PaymentMethod`, `CheckNumber`, `ApprovedByEmployeeID`, `ClearedDate` |

## Master Data

| Table | Purpose | High-value columns |
|---|---|---|
| `Item` | Product master and account mapping | `ItemCode`, `ItemGroup`, `ItemType`, `StandardCost`, `ListPrice`, `InventoryAccountID`, `RevenueAccountID`, `COGSAccountID`, `PurchaseVarianceAccountID`, `TaxCategory` |
| `Warehouse` | Inventory storage locations | `WarehouseName`, `ManagerID`, address fields |
| `Employee` | Employee and approval metadata | `CostCenterID`, `JobTitle`, `ManagerID`, `AuthorizationLevel`, `MaxApprovalAmount`, `IsActive` |

## Organizational Planning

| Table | Purpose | High-value columns |
|---|---|---|
| `CostCenter` | Organizational reporting structure | `CostCenterName`, `ParentCostCenterID`, `ManagerID`, `IsActive` |
| `Budget` | Monthly budget by fiscal year, cost center, and account | `FiscalYear`, `Month`, `CostCenterID`, `AccountID`, `BudgetAmount`, `ApprovedByEmployeeID` |

## Traceability Fields

The most important lineage fields in the implementation are:

- `PurchaseOrder.RequisitionID`
- `PurchaseOrderLine.RequisitionID`
- `SalesInvoiceLine.ShipmentLineID`
- `CashReceiptApplication.CashReceiptID`
- `CashReceiptApplication.SalesInvoiceID`
- `SalesReturnLine.ShipmentLineID`
- `CreditMemo.SalesReturnID`
- `CreditMemo.OriginalSalesInvoiceID`
- `CreditMemoLine.SalesReturnLineID`
- `CustomerRefund.CreditMemoID`
- `GoodsReceiptLine.POLineID`
- `PurchaseInvoiceLine.POLineID`
- `PurchaseInvoiceLine.GoodsReceiptLineID`
- `GLEntry.SourceDocumentType`
- `GLEntry.SourceDocumentID`
- `GLEntry.SourceLineID`

`PurchaseOrder.RequisitionID` is compatibility metadata. When a PO batches multiple requisitions, the authoritative requisition linkage is on `PurchaseOrderLine.RequisitionID`.

`CashReceipt.SalesInvoiceID` is now compatibility metadata only. The authoritative settlement link in O2C is `CashReceiptApplication`.

`PurchaseInvoiceLine.GoodsReceiptLineID` is the authoritative clean-match link for three-way-match style analysis in the current P2P design.

These fields make it possible to trace from posted accounting detail back to the source document that created the entry.

## Current Implementation Notes

- `JournalEntry.EntryType` is actively used for opening, payroll accrual and settlement, rent, utilities, depreciation, accrual, accrual reversal, and year-end close entries.
- O2C now uses line-level shipment-to-invoice linkage and explicit application, return, credit memo, and refund tables.
- `GoodsReceiptLine.ExtendedStandardCost` currently stores the receipt posting basis used for inventory and GRNI, derived from PO cost in the clean generator.
- `PurchaseOrder`, `GoodsReceipt`, `PurchaseInvoice`, and `DisbursementPayment` can now span multiple periods for the same underlying requisition or receipt chain.
- Excel exports include additional worksheets such as `AnomalyLog` and `ValidationSummary`, but those are export artifacts, not schema tables.
- For the exact column order and names, use `TABLE_COLUMNS` in `src/greenfield_dataset/schema.py`.
