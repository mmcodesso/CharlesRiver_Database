---
title: GLEntry Posting Reference
description: Student-friendly guide to how business events become posted ledger entries.
sidebar_label: GLEntry Posting
---

# GLEntry Posting Reference

This reference explains which business events post to `GLEntry`, which documents remain operational only, which accounts move, and which posting date the dataset uses.

Students can use it with the process guides and Schema Reference to understand how source documents turn into accounting results.

## Non-Posting Documents

These documents are generated for process analysis but do **not** create `GLEntry` rows:

- `SalesOrder`
- `SalesOrderLine`
- `ServiceEngagement`
- `ServiceEngagementAssignment`
- `ServiceTimeEntry`
- `ServiceBillingLine`
- `PurchaseRequisition`
- `PurchaseOrder`
- `PurchaseOrderLine`
- `BillOfMaterial`
- `BillOfMaterialLine`
- `WorkCenter`
- `WorkCenterCalendar`
- `Routing`
- `RoutingOperation`
- `WorkOrder`
- `WorkOrderOperation`
- `WorkOrderOperationSchedule`
- `ShiftDefinition`
- `EmployeeShiftAssignment`
- `TimeClockEntry`
- `AttendanceException`
- `PayrollPeriod`
- `LaborTimeEntry`
- `FixedAsset`
- `FixedAssetEvent`
- `DebtAgreement`
- `DebtScheduleLine`

## Posting Matrix

| Event | Source tables | Posting date used | Debit | Credit |
|---|---|---|---|---|
| Opening balance journal | `JournalEntry` plus seeded GL rows | `2024-01-01` | Asset accounts and selected opening balances | Liability, equity, contra-asset balances, and retained earnings plug |
| Rent | `JournalEntry` plus seeded GL rows | First business day of month | `6070` Warehouse Rent or `6080` Office Rent | `1010` Cash and Cash Equivalents |
| Utilities | `JournalEntry` plus seeded GL rows | Last business day of month | `6090` Utilities Expense | `1010` Cash and Cash Equivalents |
| Factory overhead | `JournalEntry` plus seeded GL rows | Last business day of month | `1090` Manufacturing Cost Clearing, or `5080` Manufacturing Variance when the month has no capitalizable direct labor | `1010` Cash and Cash Equivalents |
| Depreciation | `JournalEntry` plus seeded GL rows, supported by `FixedAsset` | Last calendar day of month | `1090` for manufacturing equipment or `6130` for warehouse, office, and showroom assets | accumulated depreciation accounts such as `1150`, `1160`, `1170`, and `1186` |
| Debt reclass | `JournalEntry` plus `FixedAssetEvent` | linked CAPEX invoice approval date, or asset event date when approval metadata is unavailable | `2010` Accounts Payable | `2110` Notes Payable |
| Debt principal payment | `JournalEntry` plus `DebtScheduleLine` | `PaymentDate` | `2110` Notes Payable | `1010` Cash and Cash Equivalents |
| Interest payment | `JournalEntry` plus `DebtScheduleLine` | `PaymentDate` | `7030` Interest Expense | `1010` Cash and Cash Equivalents |
| Asset disposal | `JournalEntry` plus `FixedAssetEvent` | `EventDate` | cash proceeds when present, accumulated depreciation, and any loss on disposal | gross fixed-asset account and any gain on disposal |
| Month-end accrual | `JournalEntry` plus seeded GL rows | Last business day of month | selected operating expenses | `2040` Accrued Expenses |
| Accrual adjustment | `JournalEntry` plus seeded GL rows | First business day on or after the linked invoice approval date for invoice-linked residuals, or a rare later cleanup date for stale uninvoiced accruals | `2040` Accrued Expenses | original accrued expense account |
| Freight settlement | `JournalEntry` plus seeded GL rows | First business day of month | `2040` Accrued Expenses | `1010` Cash and Cash Equivalents |
| Shipment | `Shipment`, `ShipmentLine` | `ShipmentDate` | Item COGS account and `5050` Freight-Out Expense | Item inventory account and `2040` Accrued Expenses for outbound freight |
| Sales invoice | `SalesInvoice`, `SalesInvoiceLine` | `InvoiceDate` | Accounts receivable | Item revenue account, `4050` Freight Revenue, and sales tax payable |
| Design-service invoice | `SalesInvoice`, `SalesInvoiceLine`, `ServiceBillingLine` | `InvoiceDate` | Accounts receivable | `4080` Sales Revenue - Design Services and sales tax payable |
| Cash receipt | `CashReceipt` | `ReceiptDate` | Cash | `2060` Customer Deposits and Unapplied Cash |
| Cash receipt application | `CashReceiptApplication` | `ApplicationDate` | `2060` Customer Deposits and Unapplied Cash | Accounts receivable |
| Sales return | `SalesReturn`, `SalesReturnLine` | `ReturnDate` | Item inventory account | Item COGS account |
| Credit memo | `CreditMemo`, `CreditMemoLine` | `CreditMemoDate` | `4060` Sales Returns and Allowances, optional `4050` Freight Revenue reversal, and sales tax payable reversal | Accounts receivable or `2060` Customer Deposits and Unapplied Cash |
| Customer refund | `CustomerRefund` | `RefundDate` | `2060` Customer Deposits and Unapplied Cash | Cash |
| Sales commission accrual | `SalesCommissionAccrual` | `AccrualDate`, aligned to invoice date | `6290` Sales Commission Expense | `2034` Sales Commission Payable |
| Sales commission adjustment | `SalesCommissionAdjustment` | `AdjustmentDate`, aligned to credit memo date | `2034` Sales Commission Payable | `6290` Sales Commission Expense |
| Sales commission payment | `SalesCommissionPayment` | `PaymentDate` | `2034` Sales Commission Payable | Cash |
| Goods receipt | `GoodsReceipt`, `GoodsReceiptLine` | `ReceiptDate` | Item inventory account | `2020` Goods Received Not Invoiced |
| Material issue | `MaterialIssue`, `MaterialIssueLine` | `IssueDate` | `1046` Inventory - Work in Process | `1045` Inventory - Materials and Packaging |
| Production completion | `ProductionCompletion`, `ProductionCompletionLine` | `CompletionDate` | `1040` Inventory - Finished Goods | `1046` Inventory - Work in Process and `1090` Manufacturing Cost Clearing |
| Work-order close | `WorkOrderClose` | `CloseDate` | or credit `5080` Manufacturing Variance depending on sign | offset `1046` or `1090` residual balances |
| Payroll register | `PayrollRegister`, `PayrollRegisterLine` | `ApprovedDate` | Salary and wage expense by nonmanufacturing cost center, `6060` nonmanufacturing payroll burden, `1090` capitalizable manufacturing labor plus related burden, and `5080` noncapitalizable manufacturing payroll in no-direct-labor months | `2030` Accrued Payroll, `2031` Payroll Tax Withholdings Payable, `2032` Employer Payroll Taxes Payable, `2033` Employee Benefits and Other Deductions Payable |
| Payroll payment | `PayrollPayment` | `PaymentDate` | `2030` Accrued Payroll | Cash |
| Payroll liability remittance | `PayrollLiabilityRemittance` | `RemittanceDate` | `2031`, `2032`, or `2033` | Cash |
| Purchase invoice | `PurchaseInvoice`, `PurchaseInvoiceLine` | `ApprovedDate` | For receipt-matched inventory lines: GRNI cleared at matched receipt-line basis, purchase variance when needed, and nonrecoverable tax to variance. For capitalized CAPEX lines: the linked fixed-asset gross account such as `1110`, `1120`, `1130`, or `1185`. For accrued-service lines: `2040` up to the linked accrued amount and expense for any excess above the estimate; any invoice shortfall is reversed later through a linked accrual adjustment. | Accounts payable and purchase variance when needed |
| Disbursement | `DisbursementPayment` | `PaymentDate` | Accounts payable | Cash |
| Year-end close: P&L to income summary | `JournalEntry` plus seeded GL rows | `YYYY-12-31` | Credit-balance P&L accounts; `8010` Income Summary for the balancing amount when there is a net loss | Debit-balance P&L accounts, including expenses and contra-revenue; `8010` Income Summary for the balancing amount when there is net income |
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
| `1185` | Manufacturing equipment |
| `1186` | Accumulated depreciation - manufacturing equipment |
| `2010` | Accounts payable |
| `2020` | Goods Received Not Invoiced |
| `2030` | Accrued payroll |
| `2031` | Payroll tax withholdings payable |
| `2032` | Employer payroll taxes payable |
| `2033` | Employee benefits and other deductions payable |
| `2034` | Sales commission payable |
| `2040` | Accrued expenses |
| `2050` | Sales tax payable |
| `2060` | Customer deposits and unapplied cash |
| `2110` | Notes payable |
| `4050` | Freight revenue |
| `4060` | Sales returns and allowances |
| `5050` | Freight-out expense |
| `5080` | Manufacturing variance |
| `6290` | Sales commission expense |
| `7020` | Gain or loss on asset disposal |
| `7030` | Interest expense |
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

For design services, `SourceDocumentType = 'SalesInvoice'` and `SourceLineID = SalesInvoiceLineID` still hold the revenue trace. `ServiceBillingLine` is the extra bridge that explains which approved hours created that invoice line.

Sales commissions are a separate O2C payable, not payroll. `SalesCommissionAccrual` rows use `SalesInvoiceLine.LineTotal` as the commission base, credit-memo clawbacks use `SalesCommissionAdjustment`, and monthly settlements use `SalesCommissionPayment`.

## PayrollSummary Register Summaries

`PayrollSummary` is a ledger source label, **not a table**. Payroll-register postings summarize employee register facts by **payroll period, cost center, and account**. A summary ledger line therefore represents several employee records; its `SourceDocumentID` is not a `PayrollRegisterID` foreign key.

| Released posting | `VoucherType` / `SourceDocumentType` | Source identifier and grain |
|---|---|---|
| Register recognition, such as `PRS-0001-001` | `PayrollSummary` / `PayrollSummary` | Constructed register-summary ID; ledger amounts grouped by period, cost center, and account |
| Employee payment, such as `PRPAY-2024-000002` | `PayrollPayment` / `PayrollPayment` | `SourceDocumentID = PayrollPayment.PayrollPaymentID`; follow its `PayrollRegisterID` to the employee register |

For a register summary, this release uses:

```text
SourceDocumentID = 1,000,000 + PayrollPeriodID × 1,000 + CostCenterID
VoucherNumber = PRS-<four-digit period>-<three-digit cost center>
```

Thus `PRS-0001-001` means period **1**, cost center **1**, and constructed source ID **1001001**. This encoding identifies a period/cost-center summary. Never join it directly to `PayrollRegister.PayrollRegisterID`. `SourceLineID` is null because no single employee register line represents the summary; null does not establish missing payroll support.

Aggregate the employee facts first, aggregate the relevant ledger account separately, then compare the two results at period/cost-center grain. Joining each register row to every voucher line before summing would repeat net pay.

```sql
WITH register_totals AS (
    SELECT PayrollPeriodID, CostCenterID, COUNT(*) AS RegisterRows,
           ROUND(SUM(NetPay), 2) AS RegisterNetPay
    FROM PayrollRegister
    WHERE PayrollPeriodID = 1 AND CostCenterID = 1
    GROUP BY PayrollPeriodID, CostCenterID
), ledger_totals AS (
    SELECT g.SourceDocumentID, g.CostCenterID,
           ROUND(SUM(g.Credit - g.Debit), 2) AS AccruedPayrollCredit
    FROM GLEntry AS g
    JOIN Account AS a ON a.AccountID = g.AccountID
    WHERE g.VoucherType = 'PayrollSummary'
      AND g.SourceDocumentType = 'PayrollSummary'
      AND g.VoucherNumber = 'PRS-0001-001'
      AND a.AccountNumber = 2030
    GROUP BY g.SourceDocumentID, g.CostCenterID
)
SELECT r.PayrollPeriodID, r.CostCenterID, r.RegisterRows,
       r.RegisterNetPay, l.AccruedPayrollCredit,
       ROUND(r.RegisterNetPay - l.AccruedPayrollCredit, 2) AS Difference
FROM register_totals AS r
JOIN ledger_totals AS l
  ON l.SourceDocumentID = 1000000 + r.PayrollPeriodID * 1000 + r.CostCenterID
 AND l.CostCenterID = r.CostCenterID;
```

The result has **three register rows**, net pay **23,489.30**, a `2030` credit of **23,489.30**, and difference **0.00**. This compares net pay only. The complete six-line voucher also recognizes gross-pay expense, employer expense, and the other payroll liabilities; its debits and credits each total **31,560.24**.

Payments retain detailed `PayrollPayment` source IDs and null `SourceLineID`. Do not apply the register-summary formula to them. A ledger source label does not guarantee that its referenced record exists: some payment evidence is missing, so test the relationship before concluding that the source trail is complete. Continue with [Follow Hours into Payroll](../learn-and-practice/follow-hours-into-payroll.md) to distinguish recognition, employee payment, and liability remittance.

## Annual Closing Directions

Closing reverses each P&L account's annual balance. **Debit a credit-balance account and credit a debit-balance account.** A debit-balance contra-revenue account such as `4060` Sales Returns and Allowances therefore receives a closing credit, as does a debit-balance expense. The balancing amount goes to `8010` Income Summary: a credit for net income or a debit for net loss. The released journal combines these P&L closing lines and the net Income Summary line in one voucher; it does not create a separate Income Summary line for every account.

For example, `JournalEntryID = 846`, voucher **JE-2024-000265**, is dated **December 31, 2024**. These are **four selected evidence rows, not the complete voucher**:

| Account | Debit | Credit | Closing explanation |
|---|---:|---:|---|
| `4010` Sales Revenue - Furniture | 15,673,061.54 | 0.00 | Reverse a credit-balance revenue account |
| `4060` Sales Returns and Allowances | 0.00 | 145,655.35 | Reverse a debit-balance contra-revenue account |
| `6070` Rent Expense - Warehouse | 0.00 | 268,131.51 | Reverse a debit-balance expense account |
| `8010` Income Summary | 0.00 | 5,110,308.27 | Record the net income transferred by the combined close |

The excerpt does not balance by itself. Check the **complete** source-type-and-ID population:

```sql
SELECT VoucherNumber, COUNT(*) AS LedgerRows,
       ROUND(SUM(Debit), 2) AS TotalDebit,
       ROUND(SUM(Credit), 2) AS TotalCredit,
       ROUND(SUM(Debit - Credit), 2) AS Difference
FROM GLEntry
WHERE SourceDocumentType = 'JournalEntry' AND SourceDocumentID = 846
GROUP BY VoucherNumber;
```

All **42 ledger rows** balance: total debits and credits are each **27,503,887.96**, with difference **0.00**. Balance establishes arithmetic equality at this scope; it does not independently prove every account or amount is appropriate. The later Income Summary-to-retained-earnings entry is a separate closing event, as shown in the matrix.
