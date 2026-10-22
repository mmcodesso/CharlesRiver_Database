---
title: Dataset Guide — Reading Documents, Tables, and Relationships
description: Learn what a record represents, how document headers and lines connect, and how Charles River's operational events lead to accounting entries.
slug: /dataset-overview
sidebar_label: Dataset Guide
pagination_prev: start-here/downloads
pagination_next: learn-and-practice/meet-the-records
toc_max_heading_level: 2
---

# Dataset Guide

The [company story](../learn-the-business/company-story.md) introduces orders, deliveries, invoices, and payments. The dataset stores information about those familiar business events in tables. You can read this introduction before opening a file; keep it nearby when you begin your first exercise.

<span id="what-the-dataset-is"></span>

## Start with One Record

A **record** is one stored row describing something. A customer record describes a customer. A sales-order record describes an order. A shipment record describes a shipment. The row's meaning determines which questions it can answer.

A **table** groups records of the same kind. The customer table therefore contains customer rows, while the sales-order table contains order rows. Columns hold the attributes of each record, such as an order date or a customer identifier.

The technical table names are `Customer`, `SalesOrder`, and `Shipment`. Names help you locate the records, but start by saying what one row represents. Analysts call this the table's **grain**.

## Read the Document Header and Its Lines

Many business documents have information about the whole document and information about individual items on it. An order's customer, date, and overall amount belong to its **header**. The products, quantities, and line amounts belong to its **lines**.

The dataset stores those two levels separately. `SalesOrder` holds one header per order, while `SalesOrderLine` holds the individual ordered lines. Each line carries the identifier of its parent order.

Begin with order **SO-2024-000011**: `SalesOrderID` **11** has **two lines** and an order total of **11,397.78**. Read the header and its lines together to distinguish the whole order from the products it contains.

If you display the header beside each line, the order number and total appear twice. There are still two lines belonging to one order. Summing the repeated header total would count the order twice.

Before calculating, decide whether you are counting orders, lines, or another event. Use header amounts at header grain and line amounts at line grain. Keep the original level visible when combining information.

## Connect Records Through Their Keys

An **identifier**, often called a key, distinguishes a record. The order's `SalesOrderID` identifies its header; the same value on a line indicates which order owns that line. The identifier is a link, not a quantity to add.

Other relationships connect different stages of work. A goods invoice line can identify the shipment line it bills. A cash application identifies the invoice to which received money was allocated. Those relationships let you ask specific questions about fulfillment and settlement.

A relationship does not always mean one row matches one other row. An order can have several lines and shipments; an invoice can have several cash applications. Combining these records without considering their grain can repeat quantities or amounts.

Business diagrams help you understand the purpose of a relationship. For exact columns, consult [Schema Reference](../reference/schema.md). An arrow between activities does not by itself specify a database join.

## Follow a Small Goods-Sale Trace

Begin with an order line and ask what happened to the requested goods. Find its shipment evidence, then the goods invoice line linked to that shipment. Finally, examine the invoice's cash applications.

| Question | Records to inspect |
|---|---|
| What was ordered? | Order header and ordered line |
| What left inventory? | Shipment header and shipped line |
| What was billed? | Invoice header and billed line |
| What settled the invoice? | Cash applications and their receipts |
| What accounting was posted? | General-ledger entries for the relevant events |

Keep the dates as well as the identifiers. A shipment and invoice can be related while belonging to different dates. A later cash application may explain eventual settlement without reducing the invoice balance at an earlier cutoff.

You do not need the whole database for this first trace. Add records because they answer a question, rather than joining every available table.

## Distinguish Plans, Events, and Accounting

Some records describe expectations or setup. An item record describes a product; a forecast describes expected demand; a purchase order records a supplier commitment. These provide context without necessarily creating an accounting entry.

Other records describe execution or settlement: goods arrive, products ship, payroll is posted, or an invoice is settled. Each event has its own accounting treatment in this model.

The **general ledger**, stored in `GLEntry`, holds the posted debit and credit detail. Source fields identify the event behind a posting. The [Posting Reference](../reference/posting.md) explains those mappings, including cases where a source-type label differs from the table name.

Start with the event, then inspect its accounting. Trying to interpret a ledger total without knowing its sources can mix ordinary activity, estimates, settlement, and annual closing entries.

<span id="how-to-start-navigating-by-topic"></span>

<span id="financial-accounting"></span>

<span id="managerial-accounting"></span>

<span id="auditing-and-controls"></span>

## Find the Next Group of Records

The same approach extends beyond sales:

- **Purchasing:** distinguish the request, supplier commitment, receipt, invoice, and payment.
- **Manufacturing:** follow a work order into material issues, completions, and close.
- **Design services:** connect an engagement with approved time and monthly billing.
- **Payroll:** separate approved time, the payroll register, employee payments, and remittances.
- **Finance:** follow journal headers into posted detail and relevant settlement support.

The optional reference below retains the full inventory and technical navigation paths. You can return to it after identifying the business question and the document you need.

## Check Your Understanding

<details>
<summary>An order header appears beside each of its lines. Can you sum the repeated order total?</summary>

No. The display repeats header information to provide context for each line. Aggregate at the grain appropriate to your question, keeping one header amount per order or using the relevant line amounts.

</details>

## Next Steps

Continue to [Meet the Records](../learn-and-practice/meet-the-records.md), the first guided tutorial. You will find a customer, read an order, and then build a source-to-ledger trace one step at a time.

## Optional Reference

Expand the reference that answers your current question. These paths summarize related records; consult the schema for the full keys and the posting reference for accounting rules.

<details>
<summary>Look up the table inventory and document structure</summary>

### What the Dataset Contains

The database contains **82 user tables** across nine areas. Use the groups below to locate the records needed for your question.

The main operating window is 2024–2026. Supplier disbursements continue into early 2027 to settle prior obligations. State the reporting date and whether subsequent settlement is included when interpreting balances or payment timing.

| Area | What it covers | Count |
|---|---|---:|
| Accounting core | Chart of accounts, journals, and posted ledger detail | 3 |
| Fixed assets and financing | Asset register, asset lifecycle events, debt agreements, and payment schedules | 4 |
| Order-to-cash | Customers, pricing, goods and service orders, approved service billing, shipments, invoices, commissions, cash, returns, credits, and refunds | 27 |
| Procure-to-pay | Requisitions, purchase orders, receipts, supplier invoices, and disbursements | 9 |
| Manufacturing | BOMs, routings, work centers, work orders, issues, completions, and close | 14 |
| Payroll and time | Shifts, rosters, absences, overtime approvals, punches, approved daily time, payroll, and remittances | 14 |
| Master data | Item, warehouse, and employee records | 3 |
| Organizational planning | Cost centers, budget summary, and budget detail | 3 |
| Demand planning and MRP | Forecasting, inventory policy, recommendations, MRP, and rough-cut capacity | 5 |
| Total | Published user tables | 82 |

Most classes use these ready-to-use files:

- <FileName type="sqlite" />
- <FileName type="excel" />
- <FileName type="csv" />

Download them from [Downloads](downloads.md) or use the copies already shared for your course.

### How the Data Is Organized

Students usually understand the model fastest when they read it in layers:

| Layer | What belongs here | What it adds |
|---|---|---|
| Business master data | `Customer`, `Supplier`, `Item`, `Employee`, `Warehouse`, `CostCenter` | Defines who, what, and where |
| Planning and setup | BOMs, routings, shifts, rosters, forecasts, inventory policies | Explains what should happen before execution starts |
| Execution documents | Orders, service engagements, approved service time, shipments, receipts, invoices, work orders, labor records, payroll records | Shows what actually happened |
| Ledger and control | `JournalEntry`, `GLEntry`, budgets, remittances | Shows the accounting effect and reporting layer |

Many document families also use a header-line pattern:

| Header table | Line table | Meaning |
|---|---|---|
| `SalesOrder` | `SalesOrderLine` | One customer order can contain many goods lines or service lines |
| `Shipment` | `ShipmentLine` | One shipment can contain many shipped lines |
| `SalesInvoice` | `SalesInvoiceLine` | One invoice can contain many shipment-based lines or service-billing lines |
| `PurchaseOrder` | `PurchaseOrderLine` | One PO can contain many ordered lines |
| `GoodsReceipt` | `GoodsReceiptLine` | One receipt can contain many received lines |
| `PurchaseInvoice` | `PurchaseInvoiceLine` | One supplier invoice can contain many billed lines |
| `MaterialIssue` | `MaterialIssueLine` | One material issue can contain many component lines |
| `ProductionCompletion` | `ProductionCompletionLine` | One production completion can contain one or more completion lines |
| `PayrollRegister` | `PayrollRegisterLine` | One payroll register can contain many earnings and deduction lines |

</details>
<details>
<summary>Look up identifiers and navigation paths</summary>

### The Most Important Keys

You do not need every key on day one. Start with the keys that anchor document chains:

| Key | Use it to connect |
|---|---|
| `CustomerID` | Customer to orders, invoices, receipts, returns, credits, and refunds |
| `SalesOrderID` | Sales order header to goods fulfillment and service-billing branches |
| `SalesOrderLineID` | Order lines to shipment lines, service engagements, and invoice lines |
| `ServiceEngagementID` | One service engagement across staffing, approved time, and billing |
| `ServiceEngagementAssignmentID` | One employee assignment across approved service-time rows |
| `ServiceBillingLineID` | One billed-hours record back to its engagement and invoice line |
| `SalesCommissionAccrualID` | An invoice-line commission to later credit adjustments and payment detail |
| `ShipmentLineID` | Shipped lines to billed lines and returned lines |
| `SupplierID` | Supplier to purchase orders, invoices, and payments |
| `PurchaseOrderID` | Purchase order header to receipts and invoices |
| `POLineID` | Purchase order lines to receipt lines and invoice lines |
| `GoodsReceiptLineID` | Inventory receipt lines to supplier invoice lines |
| `AccrualJournalEntryID` | Accrued service invoice lines back to the original accrual journal |
| `WorkOrderID` | Work-order activity across issue, completion, close, and direct labor |
| `WorkOrderOperationID` | Operation-level schedules and labor to one work-order operation |
| `EmployeeShiftRosterID` | Planned roster rows to absences, overtime approvals, punches, and approved daily time |
| `TimeClockEntryID` | Approved daily time to labor entries and attendance exceptions |
| `PayrollPeriodID` | Labor entries, payroll registers, and liability remittances to a pay period |
| `PayrollRegisterID` | Payroll header to line detail and net-pay settlement |
| `SupplyPlanRecommendationID` | Planning recommendations to requisitions, work orders, MRP rows, and rough-cut capacity rows |
| `ItemID` | Product-level analysis across sales, purchasing, manufacturing, and planning |
| `AccountID` | `GLEntry`, `Budget`, and `BudgetLine` to the chart of accounts |
| `CostCenterID` | Operating activity, labor, budgets, and reporting by organization unit |
| `FixedAssetID` | Asset register to lifecycle events and financing agreements |
| `DebtAgreementID` | Financing agreement to scheduled principal and interest payments |

For exact field-level lookup, go to [Schema Reference](../reference/schema.md).

### Core Navigation Paths

These are the fastest ways to move through the model.

Read the paths as navigation sequences. A complete join often passes through line tables or a stored bridge key; use the [Schema Reference](../reference/schema.md) to confirm each relationship and row grain before combining amounts.

### O2C path

The customer-demand flow splits into a goods path and a design-services path.

Goods path:

`Customer -> SalesOrder -> SalesOrderLine -> Shipment -> ShipmentLine -> SalesInvoice -> SalesInvoiceLine`

Design-services path:

`Customer -> SalesOrder -> SalesOrderLine -> ServiceEngagement -> ServiceEngagementAssignment -> ServiceTimeEntry -> ServiceBillingLine -> SalesInvoiceLine`

Cash settlement is tracked through:

`CashReceipt -> CashReceiptApplication -> SalesInvoice`

Returns branch from the billed shipment path:

`SalesInvoiceLine -> SalesReturn -> SalesReturnLine -> CreditMemo -> CreditMemoLine -> CustomerRefund`

Commercial pricing is resolved before shipment and billing through:

`Customer -> PriceList -> PriceListLine -> SalesOrderLine <- PromotionProgram and PriceOverrideApproval`

Sales commissions follow the invoice-line revenue path:

`SalesCommissionRate -> SalesCommissionAccrual -> SalesCommissionAdjustment or SalesCommissionPaymentLine -> SalesCommissionPayment`

Commission accruals reference `SalesInvoiceLine`; return-related adjustments reference `CreditMemoLine`. Payment detail preserves the accrual or adjustment source being settled.

### P2P path

`Supplier -> PurchaseRequisition -> PurchaseOrder -> PurchaseOrderLine -> GoodsReceipt -> GoodsReceiptLine -> PurchaseInvoice -> PurchaseInvoiceLine -> DisbursementPayment`

The accrued-service branch is:

`JournalEntry (Accrual) -> PurchaseInvoiceLine.AccrualJournalEntryID -> PurchaseInvoice -> DisbursementPayment`

### Manufacturing path

`Item -> BillOfMaterial -> BillOfMaterialLine -> WorkOrder -> WorkOrderOperation -> WorkOrderOperationSchedule -> MaterialIssue -> MaterialIssueLine -> ProductionCompletion -> ProductionCompletionLine -> WorkOrderClose`

Manufacturing also depends on:

- P2P for raw materials and packaging
- time and payroll for labor support
- O2C for finished-goods demand and shipment

### Demand-planning path

`Item -> InventoryPolicy -> DemandForecast -> SupplyPlanRecommendation -> MaterialRequirementPlan -> PurchaseRequisition or WorkOrder`

Capacity tieout is tracked through:

`SupplyPlanRecommendation -> RoughCutCapacityPlan -> WorkCenterCalendar`

### Fixed-asset and financing path

`PurchaseInvoiceLine -> FixedAssetEvent -> FixedAsset -> DebtAgreement -> DebtScheduleLine`

Asset events and debt schedule lines link back to finance-controlled journals. Use the event type and stored invoice, disbursement, or journal keys to distinguish acquisition, payment, depreciation, and disposal.

### Payroll and time path

`ShiftDefinition -> EmployeeShiftAssignment -> EmployeeShiftRoster -> TimeClockPunch -> TimeClockEntry -> LaborTimeEntry -> PayrollPeriod -> PayrollRegister -> PayrollRegisterLine -> PayrollPayment`

Liability clearance is tracked through:

`PayrollPeriod -> PayrollLiabilityRemittance`

### Ledger path

`GLEntry -> Account`

Then use:

- `SourceDocumentType`
- `SourceDocumentID`
- `SourceLineID`
- `VoucherType`
- `VoucherNumber`

to move back to the originating event.

Use the stored source type rather than assuming it always matches a table name. For example, payroll-register postings use `PayrollSummary` as their `GLEntry.SourceDocumentType`; the [PayrollSummary register mapping](../reference/posting.md#payrollsummary-register-summaries) explains its period/cost-center summary grain, constructed source identifier, and aggregate tie-out. Do not join that identifier directly to `PayrollRegisterID`.

</details>
<details>
<summary>Look up posting categories and tracing reminders</summary>

### How Operational Activity Reaches the Ledger

The most important mental rule is simple: planning and setup tables usually stay outside the posting flow, while execution and finance events often reach the ledger.

| Type of activity | Usually posts to GL? | Examples |
|---|---|---|
| Master data and planning | No | `Item`, `Employee`, `Budget`, `BudgetLine`, BOMs, routings, forecasts, inventory policies |
| Operational commitments | No | `SalesOrder`, `PurchaseRequisition`, `PurchaseOrder`, `WorkOrder` |
| Operational execution with accounting effect | Yes | `Shipment`, `SalesInvoice`, `GoodsReceipt`, `MaterialIssue`, `ProductionCompletion`, `PayrollRegister` |
| Settlements and clearances | Yes | `CashReceipt`, `CashReceiptApplication`, `DisbursementPayment`, `PayrollPayment`, `PayrollLiabilityRemittance`, `CustomerRefund` |
| Finance-controlled entries | Yes | `JournalEntry`, `WorkOrderClose`, accruals, reclasses, year-end close |

Use [GLEntry Posting Reference](../reference/posting.md) when you want the exact posting rules behind one event.

### Practical Starting Tips

- `CashReceiptApplication` is the authoritative invoice-settlement link in O2C.
- `ServiceBillingLine` is the authoritative hours-to-invoice bridge for design-service billing.
- For P2P traceability, start with `PurchaseOrderLine.RequisitionID`, `PurchaseInvoiceLine.GoodsReceiptLineID`, and `PurchaseInvoiceLine.AccrualJournalEntryID`.
- For manufacturing, start from `WorkOrderID` and then move outward to issues, completions, close, and labor.
- For time and attendance, start from `EmployeeShiftRosterID`, `TimeClockEntryID`, or `ShiftDefinitionID`.
- For payroll, start from `PayrollPeriodID` or `PayrollRegisterID` and then move back to `LaborTimeEntry` and `TimeClockEntry`.
- For raw multi-year income-statement analysis, exclude the year-end close entry types.

</details>
<details>
<summary>Look up accounting and process terminology</summary>

### Glossary

| Term | Plain-language meaning |
|---|---|
| O2C | Order-to-cash. The sales cycle from customer order through billing, cash application, and possible return activity. |
| P2P | Procure-to-pay. The purchasing cycle from requisition through supplier payment. |
| BOM | Bill of material. The standard list of components required to make a manufactured item. |
| WIP | Work in process. Inventory value that has been issued into production but not yet completed into finished goods. |
| GL | General ledger. The accounting table used for reporting and control-account reconciliation. |
| GRNI | Goods received not invoiced. A liability recorded when inventory is received before the supplier invoice is approved. |
| Control account | A GL account such as AR, AP, inventory, GRNI, customer deposits, WIP, or manufacturing clearing that summarizes detailed activity. |
| Manufacturing variance | The difference between actual and standard manufacturing cost that is closed from work orders. |
| Contribution margin | Revenue less variable product cost. In this dataset, fixed overhead is excluded from contribution-margin analysis. |

</details>
