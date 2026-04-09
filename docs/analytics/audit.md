# Audit Analytics Starter Guide

**Audience:** Students, instructors, and analysts using the dataset for controls, exception review, and process-traceability work.  
**Purpose:** Show how to use the dataset for document-chain testing, approval review, cut-off analysis, duplicate detection, and manufacturing-control exercises.  
**What you will learn:** Which document links matter most and which audit-oriented SQL files to run first.

> **Implemented in current generator:** O2C, P2P, and manufacturing process chains; approval fields; detailed posting traceability; validation outputs; and planted anomalies in the default `standard` mode.

> **Planned future extension:** Payroll controls after the payroll process cycle is implemented.

## Relevant Tables

| Topic | Main tables |
|---|---|
| O2C completeness | O2C header and line tables plus `CashReceiptApplication` |
| P2P completeness | P2P header and line tables |
| Approvals and SOD | `PurchaseRequisition`, `PurchaseOrder`, `PurchaseInvoice`, `JournalEntry`, `CreditMemo`, `CustomerRefund`, `Employee` |
| Manufacturing controls | `Item`, `BillOfMaterial`, `BillOfMaterialLine`, `WorkOrder`, `MaterialIssueLine`, `ProductionCompletionLine`, `WorkOrderClose` |
| Cut-off and timing | operational header and line tables plus date fields |
| Duplicate and anomaly review | `DisbursementPayment`, `PurchaseInvoice`, `JournalEntry`, `SalesInvoice`, `CreditMemo`, Excel `AnomalyLog` |

## Starter SQL Map

| Topic | Starter SQL file |
|---|---|
| O2C completeness | [01_o2c_document_chain_completeness.sql](../../queries/audit/01_o2c_document_chain_completeness.sql) |
| P2P completeness | [02_p2p_document_chain_completeness.sql](../../queries/audit/02_p2p_document_chain_completeness.sql) |
| Approval and SOD review | [03_approval_and_sod_review.sql](../../queries/audit/03_approval_and_sod_review.sql) |
| Cut-off and timing | [04_cutoff_and_timing_analysis.sql](../../queries/audit/04_cutoff_and_timing_analysis.sql) |
| Duplicate review | [05_duplicate_payment_reference_review.sql](../../queries/audit/05_duplicate_payment_reference_review.sql) |
| Potential anomaly review | [06_potential_anomaly_review.sql](../../queries/audit/06_potential_anomaly_review.sql) |
| Backorder and return review | [07_backorder_and_return_review.sql](../../queries/audit/07_backorder_and_return_review.sql) |
| BOM and supply-mode conflicts | [08_missing_bom_or_supply_mode_conflict.sql](../../queries/audit/08_missing_bom_or_supply_mode_conflict.sql) |
| Over-issue and open WIP review | [09_over_issue_and_open_wip_review.sql](../../queries/audit/09_over_issue_and_open_wip_review.sql) |
| Work-order close timing | [10_work_order_close_timing_review.sql](../../queries/audit/10_work_order_close_timing_review.sql) |

## Interpretation Notes

- A clean build with `anomaly_mode: none` may return few or no exceptions from anomaly-oriented queries.
- The default `standard` build is better for controls teaching because anomalies are present while the GL remains balanced.
- O2C completeness should be checked at the line and application level.
- Manufacturing controls should start from BOM integrity and work-order close timing before moving to ledger balances.
