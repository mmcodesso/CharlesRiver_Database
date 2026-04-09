# Audit Analytics Starter Guide

**Audience:** Students, instructors, and analysts using the dataset for controls, exception review, and process-traceability work.  
**Purpose:** Show how to use the current dataset for document-chain testing, approval review, cut-off analysis, duplicate detection, backorder review, and anomaly-focused exercises.  
**What you will learn:** Which document links matter most, which audit-oriented SQL files to run, and how to pair the SQLite results with the Excel anomaly and validation outputs.

> **Implemented in current generator:** O2C and P2P process chains, approval fields, detailed posting traceability, receipt applications, returns, credit memos, customer refunds, validation outputs, and planted anomalies in the default `standard` mode.

> **Planned future extension:** Manufacturing process controls.

## Learning Goals

- trace transactions from one process step to the next
- identify incomplete O2C and P2P document chains
- review approval and segregation-of-duties conditions
- evaluate cut-off, timing, and backorder behavior
- search for duplicate references and unusual activity
- distinguish between clean-data analysis and anomaly-enabled exercises

## Relevant Tables

| Topic | Main tables |
|---|---|
| O2C completeness | `SalesOrder`, `SalesOrderLine`, `Shipment`, `ShipmentLine`, `SalesInvoice`, `SalesInvoiceLine`, `CashReceipt`, `CashReceiptApplication`, `SalesReturn`, `SalesReturnLine`, `CreditMemo`, `CustomerRefund` |
| P2P completeness | `PurchaseRequisition`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `PurchaseInvoice`, `PurchaseInvoiceLine`, `DisbursementPayment` |
| Approvals and SOD | `PurchaseRequisition`, `PurchaseOrder`, `PurchaseInvoice`, `JournalEntry`, `Employee`, `CreditMemo`, `CustomerRefund` |
| Cut-off and timing | operational header and line tables plus date fields |
| Duplicate and anomaly review | `DisbursementPayment`, `PurchaseInvoice`, `JournalEntry`, `PurchaseOrder`, `SalesInvoice`, `CreditMemo`, Excel `AnomalyLog` |

## Key Joins and Navigation

- `SalesOrderLine.SalesOrderLineID -> ShipmentLine.SalesOrderLineID`
- `SalesInvoiceLine.ShipmentLineID -> ShipmentLine.ShipmentLineID`
- `CashReceiptApplication.SalesInvoiceID -> SalesInvoice.SalesInvoiceID`
- `CashReceiptApplication.CashReceiptID -> CashReceipt.CashReceiptID`
- `SalesReturnLine.ShipmentLineID -> ShipmentLine.ShipmentLineID`
- `CreditMemo.SalesReturnID -> SalesReturn.SalesReturnID`
- `CustomerRefund.CreditMemoID -> CreditMemo.CreditMemoID`
- `PurchaseOrderLine.RequisitionID -> PurchaseRequisition.RequisitionID`
- `GoodsReceiptLine.POLineID -> PurchaseOrderLine.POLineID`
- `PurchaseInvoiceLine.GoodsReceiptLineID -> GoodsReceiptLine.GoodsReceiptLineID`
- `DisbursementPayment.PurchaseInvoiceID -> PurchaseInvoice.PurchaseInvoiceID`
- `GLEntry.SourceDocumentType`, `SourceDocumentID`, and `SourceLineID` for ledger traceability

## Common Audit Tests

| Test idea | Meaning in the current dataset |
|---|---|
| Completeness | Does a transaction move through all expected stages? |
| Approval review | Are approvals present and separated from request or creation roles? |
| Cut-off review | Are accounting dates reasonable relative to operational dates? |
| Backorder review | Were shipments delayed relative to requested delivery dates or supply availability? |
| Duplicate review | Are there repeated supplier invoice numbers or payment references? |
| Anomaly review | Do heuristic checks match planted anomaly patterns? |

## Starter SQL Map

| Topic | Starter SQL file | What it answers |
|---|---|---|
| O2C completeness | [01_o2c_document_chain_completeness.sql](../../queries/audit/01_o2c_document_chain_completeness.sql) | Which sales orders are incomplete, partially shipped, partially billed, partially collected, or returned? |
| P2P completeness | [02_p2p_document_chain_completeness.sql](../../queries/audit/02_p2p_document_chain_completeness.sql) | Which requisitions do not fully trace through PO, receipt, invoice, and payment activity? |
| Approval and SOD review | [03_approval_and_sod_review.sql](../../queries/audit/03_approval_and_sod_review.sql) | Which documents look suspicious from an approval or role-separation perspective? |
| Cut-off and timing | [04_cutoff_and_timing_analysis.sql](../../queries/audit/04_cutoff_and_timing_analysis.sql) | What are the timing gaps between process steps, and are any negative? |
| Duplicate review | [05_duplicate_payment_reference_review.sql](../../queries/audit/05_duplicate_payment_reference_review.sql) | Are there duplicate check numbers or duplicate supplier invoice numbers? |
| Potential anomaly review | [06_potential_anomaly_review.sql](../../queries/audit/06_potential_anomaly_review.sql) | Do heuristic checks surface entries consistent with planted anomaly patterns? |
| Backorder and return review | [07_backorder_and_return_review.sql](../../queries/audit/07_backorder_and_return_review.sql) | Which orders stayed backordered or later flowed through returns and credit memos? |

## Typical SQL Workflow

1. Start with O2C and P2P completeness queries to understand the document chains.
2. Run approval and SOD review next.
3. Use cut-off and timing analysis to quantify process gaps.
4. Review backorders, returns, and credits on the revenue side.
5. Run duplicate and potential-anomaly queries last, especially on anomaly-enabled builds.
6. If you need posted-accounting traceability, move from source documents into `GLEntry`.

## Typical Excel Workflow

- Use the workbook sheets for the same operational document chains shown in the SQL pack.
- Use `AnomalyLog` to review intentionally planted issues in the default `standard` mode.
- Use `ValidationSummary` to compare the clean design to anomaly-enriched exceptions.
- Build pivots that count:
  - documents by status
  - approvals by employee
  - negative timing gaps
  - duplicate references
  - backorders, returns, and refunds by month

## Interpretation Notes and Pitfalls

- A clean build with `anomaly_mode: none` may return few or no audit exceptions from the more exception-oriented queries.
- The default `standard` build is intentionally better for controls teaching because anomalies are present while the GL remains balanced.
- O2C completeness should be checked at the line and application level, not only at the invoice header level.
- The SQLite export does not currently contain a separate `AnomalyLog` table. That log is available in the Excel workbook and validation JSON output.
- The current dataset does not yet model manufacturing controls.

## Current Scope vs Future Scope

### Implemented in current generator

- completeness and traceability testing for O2C and P2P
- approval and SOD review
- cut-off, timing, backorder, return, and refund analysis
- heuristic anomaly checks against current fields

### Planned future extension

- manufacturing-process audit analytics after Phase 12

## Where to Go Next

- Read [sql-guide.md](sql-guide.md) for query execution and adaptation.
- Read [excel-guide.md](excel-guide.md) for workbook-based anomaly and validation review.
