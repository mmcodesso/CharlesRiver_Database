---
title: Order-to-Cash Accounting Process
description: Follow order-to-cash with editable BPMN models, Mermaid source-document flows, internal-control questions, and evidence from sales orders through cash application and GLEntry.
---

import BpmnDiagram from "@site/src/components/BpmnDiagram";

# Order-to-Cash Process

## Business Storyline

**Illustrative scenario:** a Charles River customer orders furnishings, receives goods in one or more shipments, and pays an invoice. Follow the business handoffs, then select real records from your assigned file to investigate them; the scenario does not identify a particular customer or order.

In this dataset, the order-to-cash cycle starts when the sales team records customer demand and ends only when that sale is settled in cash. Several teams touch the process along the way. Sales captures the order and freight terms, warehouse staff ship what is available, accounting bills what actually left the warehouse and any billable freight, accounting accrues sales commissions from invoice-line revenue, treasury records the money when it arrives, and accounting applies that cash against open invoices.

That distinction matters. A customer order is not revenue. A shipment is not the same thing as an invoice. A cash receipt is not the same thing as settlement. Students can see those stages separately in the data and use that separation to answer both accounting and audit questions.

Most sales follow the normal path of order, shipment, invoice, cash, and settlement. Some sales later move into the customer-side exception path of return, credit, and sometimes refund. That exception path is part of O2C, not a separate business cycle.

The company also uses O2C for hourly design services. Those sales still start from `SalesOrder` and `SalesOrderLine`, but they move into `ServiceEngagement`, `ServiceTimeEntry`, and monthly billing instead of shipment. Students should read that as a second customer-fulfillment path inside O2C, not as a separate receivables system.

## What Students Should Learn

- Distinguish the order, shipment, invoice, cash receipt, settlement, and return-correction stages in one customer sale.
- Trace an O2C transaction from operational documents into `GLEntry`.
- Identify the core tables used for revenue, receivables, fulfillment, cash, and customer-side exceptions.
- Recognize timing differences that matter for cut-off, completeness, open-AR, working-capital, and return analysis.

## Decisions and Evidence

Sales, warehouse operations, customer accounting, and treasury answer different questions about the same sale. Is demand accepted? Have goods left inventory? Has the customer been billed? Did cash arrive, and was it applied? A useful investigation names the event and its date before it calculates a balance or labels a delay.

Begin with the [goods-sale tracing exercise](../learn-and-practice/source-to-ledger.md), then extend the evidence into the [O2C Trace Case](../analytics/cases/o2c-trace-case.md). Record a real order and line from your assigned file; any fictional buyer scenario supplies context rather than a transaction to locate.

## Participants and Responsibilities

The **customer** is an external participant. Within Charles River, **Sales** records demand and commercial terms; the **Warehouse** fulfills goods orders; **Accounting** bills and applies cash; and **Treasury** records cash received. The BPMN lanes illustrate these responsibilities. Stored employee fields can support specific tests, but the lane layout does not establish segregation of duties in the actual records.

## BPMN Business Process

<BpmnDiagram modelId="order-to-cash" />

### Interpret the Activities and Decisions

1. An order starts a commercial commitment. The available-stock decision separates immediate fulfillment from a backorder that awaits supply. Neither the order nor the decision creates revenue.
2. Warehouse fulfillment and accounting billing are separate activities. Goods invoices trace to shipped lines; hourly service work follows the [Design Services](design-services.md) model instead.
3. Cash arrival and invoice application are separate handoffs. The allocation review may record an application or leave cash unapplied; its completion does not mean full settlement. Interpret the boundary with the selected reporting date and actual applications.

<details>
<summary>Examine cash application and the returns exception</summary>

<BpmnDiagram modelId="cash-application" />

The matching decision explains application versus remaining unapplied cash. The detail includes receipt capture for context; the parent allocation review starts after that receipt. It is a teaching interpretation of the records, not evidence of an automated exception queue or a one-to-one execution binding between diagrams.

<BpmnDiagram modelId="returns-credit-refunds" />

A physical return restores inventory. An approved credit memo reduces open receivables and retains any excess as customer credit; one memo can do both. A later refund clears customer credit in cash. These events need not occur together. Mermaid links show relationship endpoints rather than an exclusive business gateway; use the detailed BPMN allocation step and actual `GLEntry` rows when a memo spans both.

</details>

### Risks, Controls, and Evidence

| Risk and control objective | Evidence available | Teaching boundary |
|---|---|---|
| Unauthorized pricing: support an exceptional price with approval | `SalesOrderLine.PriceOverrideApprovalID` and `PriceOverrideApproval` request and approval fields | Test the selected population; the presence of a record does not prove every override was authorized |
| Incomplete billing: account for shipped quantities | `ShipmentLine` and `SalesInvoiceLine.ShipmentLineID` | An independent shipment-to-invoice reconciliation is a **proposed teaching control**, not a stored automated blocking rule |
| Incorrect settlement or refund: distinguish cash, AR, and customer credit | `CashReceiptApplication`, `CreditMemo` approval fields, `CustomerRefund` | Compare authorizers and dates; do not infer a complete control procedure from lane separation |

The Mermaid views below explain document lineage and posting effects. They complement the BPMN activities rather than representing additional approval workflows. The [Process Models](../process-models/index.md) library explains the notation and provides editable sources.

## Normal Process Overview

```mermaid
flowchart LR
    C[Customer]
    SO[Sales Order]
    SH[Shipment]
    SI[Sales Invoice]
    SC[Sales Commission Accrual]
    CR[Cash Receipt]
    CRA[Cash Receipt Application]
    GL[GLEntry]

    C --> SO --> SH --> SI
    SI --> SC
    C --> CR --> CRA
    SH -. Posts COGS Inventory and Freight-Out Accrual .-> GL
    SI -. Posts AR Revenue Freight Revenue and Sales Tax .-> GL
    SC -. Posts Commission Expense and Commission Payable .-> GL
    CR -. Posts Cash and Customer Deposits .-> GL
    CRA -. Clears AR from Customer Deposits .-> GL
```

Read the main diagram as promise, fulfillment, billing, commission accrual, cash, and settlement. Orders show demand. Shipments show physical movement. Invoices create receivables and revenue. Commission accruals match selling expense to the invoice-line revenue that earned it. Cash receipts record the arrival of money. Cash applications show which invoices were actually settled.

## How to Read This Process in the Data

This page is organized around business flow first and data navigation second. The main diagram shows the normal O2C path. The smaller diagrams below show local lineage for one analytical task at a time. The fuller relationship map belongs on [Schema Reference](../reference/schema.md), not on this process page.

:::tip
Start with the business flow, then move into the subsection diagrams and tables when you need the exact trace for one analytical question.
:::

## Core Tables and What They Represent

| Process stage | Main tables | Grain or event represented | Why students use them |
|---|---|---|---|
| Pricing and commercial setup | `PriceList`, `PriceListLine`, `PromotionProgram`, `PriceOverrideApproval` | Pricing rules, promotions, and rare override approvals behind a sales line | Review commercial terms, pricing controls, and margin drivers |
| Order capture | `SalesOrder`, `SalesOrderLine` | Customer order header and ordered line | See promised demand, ordered quantity, and freight terms before fulfillment |
| Service delivery and staffing | `ServiceEngagement`, `ServiceEngagementAssignment`, `ServiceTimeEntry` | One customer engagement, the employees assigned to it, and approved daily service hours | Review service staffing, approved billable versus non-billable time, and labor-cost snapshots |
| Service billing trace | `ServiceBillingLine` | Monthly billed-hours rollup tied to one invoice line | Trace approved service hours into billed revenue without using shipment logic |
| Sales commissions | `SalesCommissionRate`, `SalesCommissionAccrual`, `SalesCommissionAdjustment`, `SalesCommissionPayment`, `SalesCommissionPaymentLine` | Commission rate rules, invoice-line accruals, return clawbacks, and sales-rep payments | Trace selling expense, commission payable, and settlement timing |
| Fulfillment | `Shipment`, `ShipmentLine` | Physical shipment event and shipped line | Measure what actually left the warehouse, carrier choice, and shipment-level freight accrual |
| Billing | `SalesInvoice`, `SalesInvoiceLine` | Invoice header and billed line | Trace receivable creation, merchandise revenue, and billed freight back to shipment |
| Cash receipt | `CashReceipt` | Cash arrival from the customer | Review collection timing, unapplied cash, and deposit behavior |
| Settlement | `CashReceiptApplication` | Application of received cash to one or more invoices | Measure true invoice settlement and open-AR reduction |

## When Accounting Happens

| Event | Business meaning | Accounting effect |
|---|---|---|
| Shipment | Goods physically leave inventory and customer fulfillment occurs | Debit COGS and freight-out expense, and credit inventory plus accrued expenses for outbound freight |
| Sales invoice | Accounting bills shipped quantity and creates the customer receivable | Debit AR and credit merchandise revenue, freight revenue, and sales tax payable |
| Service invoice | Accounting bills approved design-service hours for the month | Debit AR and credit `4080` Sales Revenue - Design Services plus sales tax payable, with no shipment-driven inventory or COGS entry |
| Sales commission accrual | Accounting recognizes commission earned on invoice-line revenue | Debit `6290` Sales Commission Expense and credit `2034` Sales Commission Payable |
| Sales commission adjustment | A credit memo reverses commission on returned revenue | Debit `2034` Sales Commission Payable and credit `6290` Sales Commission Expense |
| Sales commission payment | Accounting pays prior-month net commissions to sales reps | Debit `2034` Sales Commission Payable and credit cash |
| Cash receipt | Customer money arrives, even if it is not yet matched to a specific invoice | Debit cash and credit customer deposits or unapplied cash |
| Cash application | Accounting settles one or more open invoices with previously received cash | Debit customer deposits or unapplied cash and credit AR |

## Key Traceability and Data Notes

- `SalesInvoiceLine.ShipmentLineID` is the main shipment-to-invoice traceability field in the normal O2C path.
- Service invoice lines stay in `SalesInvoiceLine`, but `ShipmentLineID` stays null for those rows because no physical shipment occurred.
- `SalesOrder.FreightTerms`, `Shipment.FreightCost`, `Shipment.BillableFreightAmount`, and `SalesInvoice.FreightAmount` show how outbound freight moves from commercial policy into operational cost and customer billing.
- `CashReceiptApplication` is the true settlement table because it shows which invoices the cash actually cleared.
- `CashReceipt.SalesInvoiceID` is compatibility metadata only and should not be treated as the authoritative settlement link.
- `SalesOrderLine` carries pricing lineage through `BaseListPrice`, `PriceListLineID`, `PromotionID`, `PriceOverrideApprovalID`, and `PricingMethod`.
- `ServiceBillingLine` is the authoritative hours-to-invoice bridge for design services, and `ServiceTimeEntry` is the approved-hours source behind that billing.
- `SalesCommissionAccrual` is the invoice-line commission bridge. Its base is `SalesInvoiceLine.LineTotal`; freight, sales tax, deposits, AR timing, and unapplied cash are outside the commission base.
- `SalesCommissionAdjustment` records credit-memo clawbacks, and `SalesCommissionPaymentLine` shows which accruals and adjustments were included in each sales-rep payment.
- Some receipts remain unapplied for a period of time, which is useful for open-AR, unapplied-cash, and settlement-timing analysis.

## Analytical Subsections

### 1. Pricing and Commercial Terms

Before warehouse activity or billing begins, the dataset resolves the commercial terms for the order line. Students should read this step as the pricing decision layer: what was the base price, did a promotion apply, was an override approved, and how did the final pricing method affect margin and pricing-control review. For the full process-level entity relationships, see the [Schema Reference](../reference/schema.md).

```mermaid
flowchart LR
    CTX[Customer and Item Context]
    PL[Price List]
    PROMO[Promotion Program]
    OVR[Price Override Approval]
    SO[Sales Order]

    CTX --> PL --> SO
    CTX --> PROMO --> SO
    CTX --> OVR --> SO
```

**Tables involved**

| Table | Role in the flow |
|---|---|
| `PriceList`, `PriceListLine` | Provide the base commercial price by customer or segment scope |
| `PromotionProgram` | Adds the promotion-based discount when one valid promotion applies |
| `PriceOverrideApproval` | Captures rare below-floor approval support |
| `SalesOrderLine` | Stores the final pricing lineage on the ordered line |

**Starter analytical question:** Which sales lines used standard price-list logic versus promotion pricing versus approved override logic?

**Analytical plan**

- Objective: Compare pricing method, promotion use, and override approvals.
- Evidence path: SalesOrderLine -> PriceListLine -> PriceList, plus PromotionProgram and PriceOverrideApproval.
- Comparison: Group by PricingMethod, customer segment, item group, or sales rep.

### 2. Sales Commissions and Payable Settlement

Commission accounting starts from posted customer invoice lines. The routine applies a simple rate matrix by revenue type and customer segment, accrues the expense to a dedicated payable, reverses part of that payable when a credit memo claws back returned revenue, and pays sales reps monthly in arrears.

```mermaid
flowchart LR
    SI[Sales Invoice Line]
    RATE[Sales Commission Rate]
    ACC[Sales Commission Accrual]
    ADJ[Sales Commission Adjustment]
    PAY[Sales Commission Payment]
    GL[GLEntry]

    SI --> RATE --> ACC --> GL
    ACC --> ADJ --> GL
    ACC --> PAY --> GL
    ADJ --> PAY
```

**Tables involved**

| Table | Role in the flow |
|---|---|
| `SalesCommissionRate` | Holds the active commission-rate matrix by revenue type and customer segment |
| `SalesCommissionAccrual` | Records one commission accrual for each eligible invoice line |
| `SalesCommissionAdjustment` | Records credit-memo clawbacks tied back to the original accrual |
| `SalesCommissionPayment` | Records monthly net commission payments by sales rep |
| `SalesCommissionPaymentLine` | Shows which accruals and adjustments were included in the payment |

**Starter analytical question:** Which sales reps and customer segments generated the highest net commission expense after credit-memo clawbacks?

**Analytical plan**

- Objective: Review commission expense and clawbacks by rep, segment, and month.
- Evidence path: SalesCommissionAccrual -> SalesCommissionAdjustment, plus Employee and Customer.
- Comparison: Compare gross commission expense, clawbacks, and net commission expense by revenue type.

### 3. Shipment to Invoice Traceability

This view teaches students how billed revenue ties back to physical fulfillment. Treat this as a traceability diagram, not as a full ER diagram. For the full process-level entity relationships, see the [Schema Reference](../reference/schema.md). This subsection is especially useful for cutoff, completeness, and occurrence testing.

```mermaid
flowchart LR
    C[Customer]
    SO[Sales Order]
    SH[Shipment]
    SI[Sales Invoice]
    GL[GLEntry]

    C --> SO -->  SH  --> SI  --> GL
```

**Tables involved**

| Table | Role in the flow |
|---|---|
| `SalesOrder`, `SalesOrderLine` | Show the original customer promise, ordered quantity, and freight terms |
| `Shipment`, `ShipmentLine` | Show what actually shipped, when it shipped, and the shipment-level freight accrual |
| `SalesInvoice`, `SalesInvoiceLine` | Show what was billed from the shipped quantity and whether freight was billed to the customer |
| `GLEntry` | Shows the posted receivable, revenue, COGS, and freight effects |

**Key joins**

- `ShipmentLine.SalesOrderLineID -> SalesOrderLine.SalesOrderLineID`
- `SalesInvoiceLine.ShipmentLineID -> ShipmentLine.ShipmentLineID`
- `GLEntry.SourceDocumentType` plus `SourceDocumentID` or `SourceLineID` for posting trace

**Analytical plan**

- Objective: Trace billed revenue back to the shipped line that supported it.
- Evidence path: SalesOrderLine -> ShipmentLine -> SalesInvoiceLine.
- Comparison: Filter invoice and shipment dates by month-end to test cutoff timing.

### 4. Cash Receipt, Application, and Settlement

This is the section students often need most. The cash receipt is the cash event. The cash application is the settlement event. Those are related, but they are not the same accounting moment. This distinction drives open-AR analysis, unapplied-cash review, and receivables testing.

```mermaid
flowchart LR
    CR[Cash Receipt]
    DEP[Customer Deposits and Unapplied Cash]
    CRA[Cash Receipt Application]
    SI[Sales Invoice]
    GL[GLEntry]

    CR --> DEP --> CRA --> SI --> GL
```

**Tables involved**

| Table | Role in the flow |
|---|---|
| `CashReceipt` | Records when customer cash arrived |
| `CashReceiptApplication` | Records which invoices were actually settled |
| `SalesInvoice` | Provides the receivable being cleared |
| `GLEntry` | Shows cash, liability, and AR-clearing effects |

:::warning
Do not use `CashReceipt.SalesInvoiceID` as the main settlement link. The authoritative settlement path is `CashReceiptApplication`, because one receipt can settle multiple invoices and some cash can remain unapplied temporarily.
:::

**Analytical plan**

- Objective: Separate cash arrival from invoice settlement.
- Evidence path: CashReceipt -> CashReceiptApplication -> SalesInvoice.
- Comparison: Compare receipt date, application date, and invoice due date for open-AR review.

### 5. Design Services and Monthly Hour Billing

The design-services branch shares the same customer, invoice, and cash backbone as the rest of O2C, but it does not use shipment. Instead, one service order line opens one engagement, multiple employees can be assigned to that engagement, approved service time accumulates through the month, and `ServiceBillingLine` ties the approved billed hours to the invoice line.

```mermaid
flowchart LR
    SOL[Service Order Line]
    ENG[Service Engagement]
    ASG[Assignments]
    TIME[Service Time Entry]
    BILL[Service Billing Line]
    SIL[Sales Invoice Line]

    SOL --> ENG --> ASG --> TIME --> BILL --> SIL
```

**Tables involved**

| Table | Role in the flow |
|---|---|
| `SalesOrderLine` | Carries the ordered service hours and fixed hourly rate |
| `ServiceEngagement` | Defines the customer job, lead employee, planned hours, and status |
| `ServiceEngagementAssignment` | Shows which employees worked on the engagement and how many hours were assigned |
| `ServiceTimeEntry` | Stores approved billable and non-billable service hours plus analytical labor cost |
| `ServiceBillingLine` | Stores the monthly billed-hours rollup tied to `SalesInvoiceLine` |
| `SalesInvoiceLine` | Stores the billed service quantity and billed amount with null shipment linkage |

**Starter analytical question:** Which customers or engagements show the biggest gap between approved service hours and billed service hours at month-end?

**Analytical plan**

- Objective: Trace approved service hours into the monthly customer invoice.
- Evidence path: SalesOrderLine -> ServiceEngagement -> ServiceTimeEntry -> ServiceBillingLine -> SalesInvoiceLine.
- Comparison: Compare planned hours, approved billable hours, billed hours, and labor cost by customer or engagement.

### 6. Backorder to Shipment Lag

Not every order ships immediately. This subsection helps students see why order date, shipment date, and invoice date can diverge when inventory is short. It is useful for fulfillment-lag analysis, billing-lag review, and period timing differences around month-end.

```mermaid
flowchart LR
    SOL[Sales Order]
    FG[Available Finished Goods]
    BO[Backordered Quantity]
    SHL[Later Shipment]
    SIL[Later Sales Invoice]

    SOL --> FG
    FG -->|Enough stock| SHL --> SIL
    FG -->|Short stock| BO --> SHL
```

**Tables involved**

| Table | Role in the flow |
|---|---|
| `SalesOrderLine` | Shows the original promised quantity |
| `ShipmentLine` | Shows what quantity left inventory and when |
| `SalesInvoiceLine` | Shows when the delayed shipment was billed |

**Starter analytical question:** Which customers or item groups show the longest lag between order capture, shipment, and billing?

**Analytical plan**

- Objective: Measure fulfillment lag from ordered quantity to shipped quantity and billed quantity.
- Evidence path: SalesOrderLine -> ShipmentLine -> SalesInvoiceLine.
- Comparison: Compare order date, shipment date, and invoice date by customer, item group, or month.

## Returns, Credits, and Refunds

Some sales do not end with the original invoice. In this dataset, returns are the main customer-side exception path inside O2C, not a separate business cycle. The exception starts from something that was already shipped and billed, then moves through physical return, financial correction, and sometimes cash refund if the customer had already paid.

```mermaid
flowchart LR
    SHL[Shipment]
    SIL[Sales Invoice]
    SR[Sales Return]
    SRL[Sales Return]
    CM[Credit Memo]
    RF[CustomerRefund]
    GL[GLEntry]

    SHL --> SIL --> SR --> SRL --> CM --> RF
    SR -. Restores Inventory and Reverses COGS .-> GL
    CM -. Posts Contra Revenue Tax Reversal and AR or Customer Credit .-> GL
    RF -. Clears Customer Credit and Cash .-> GL
```

| Exception stage | Main tables | Why students use them |
|---|---|---|
| Original billed shipment | `ShipmentLine`, `SalesInvoiceLine` | Identify the shipment and invoice that the correction started from |
| Physical return | `SalesReturn`, `SalesReturnLine` | Show returned quantity and the operational return event |
| Financial correction | `CreditMemo`, `CreditMemoLine` | Show the customer-facing credit and its allocation to AR, customer credit, or both |
| Cash resolution | `CustomerRefund` | Show when customer credit was returned in cash |

| Event | Business meaning | Accounting effect |
|---|---|---|
| Sales return | Goods come back after a shipment and invoice already existed | Debit inventory and credit COGS |
| Credit memo | Accounting reverses part of the original sale | Debit sales returns and allowances, freight revenue when policy allows a freight credit, and tax reversal, then credit AR, customer credit, or both |
| Customer refund | Treasury clears customer credit in cash | Debit customer credit and credit cash |

**Traceability notes**

- `SalesReturnLine.ShipmentLineID` is the core operational return trace field.
- `CreditMemo.OriginalSalesInvoiceID` ties the financial correction back to the earlier invoice.
- `CreditMemo.FreightCreditAmount` shows when part of the original billed freight was credited back because the return reason justified it.
- `CreditMemoLine` preserves the original pricing lineage through `BaseListPrice`, `PriceListLineID`, `PromotionID`, `PriceOverrideApprovalID`, `PricingMethod`, and `Discount`.
- `CustomerRefund` is used only when the return scenario leaves customer credit that is later cleared in cash.

```mermaid
flowchart LR
    INV[Original Sales Invoice]
    RET[Sales Return]
    CM[Credit Memo]
    CC[Customer Credit]
    RF[Customer Refund]

    INV --> RET --> CM
    CM -->|Invoice still open| INV
    CM -->|Invoice already paid| CC --> RF
```

This local lineage view distinguishes AR correction from customer credit. Its labeled links illustrate common endpoint relationships, not an exclusive gateway or a rule that every memo generates a refund. A memo may reduce the remaining AR and create excess customer credit in the same posting, including after partial settlement. Treasury may later clear that credit through `CustomerRefund`; reconcile both account effects at the selected date.

## Optional AIS Activity: Assess a Customer Handoff

**Context and objective:** accounting needs a defensible view of whether goods fulfillment was billed and settled at a stated date. Interpret the BPMN model, identify a business risk, and connect a control objective to actual source evidence.

**Prerequisites, tools, and sources:** complete the goods-sale tracing exercise linked above. Use the published SQLite file with a SQL tool, or the Excel workbook with filters and lookups, plus the editable Draw.io model. Work from `SalesOrderLine`, `ShipmentLine`, `SalesInvoiceLine`, their headers, `CashReceiptApplication`, `CashReceipt`, and `GLEntry`. Add `PriceOverrideApproval`, `CreditMemo`, or `CustomerRefund` only if your selected issue needs that evidence.

1. Record the release, scope, reporting date, and actual document and line keys. Mark the corresponding activities and responsibilities on a copy of the model.
2. Compare demand, fulfillment, billing, and application dates without duplicating header totals. Identify an observed gap or timing difference; do not assume a violation.
3. Write one risk/control-matrix row naming the risk, objective, proposed owner, evidence, test, and limitation. Label any added independent review or hold as a **proposed teaching control**.

**Assessed deliverable:** submit the annotated model, a reproducible evidence table, and the risk/control row. Explain which observation could change a business decision and what follow-up evidence would be needed. One trace cannot establish population completeness, operational effectiveness, or misconduct. Extend the work through the existing O2C case and reports below; the [BPMN and controls workshop](../learn-and-practice/bpmn-controls-workshop.md) supplies a reusable matrix format.

## Common Student Questions

- Which orders shipped immediately and which became backorders?
- Which shipment lines were invoiced later than the shipment date?
- Which invoices remain open after cash applications?
- Which customers pay one invoice at a time versus several at once?
- Which pricing methods appear most often by customer segment or item family?
- Which shipment lines were later returned?
- Which returns reduced open AR versus created customer credit?
- How do revenue, receivables, unapplied cash, collections timing, and return corrections differ by period?

## Next Steps

- Read [Commercial and Working Capital](../analytics/reports/commercial-and-working-capital.md) when you want the business perspective built around pricing, collections, receivables, payables, and settlement timing.
- Read [Financial Reports](../analytics/reports/financial.md) when you want the broader reporting layer behind revenue, AR, working capital, and cash conversion.
- Read [Design Services](design-services.md) when you want the full staffing, approved-hours, and monthly service-billing branch that now sits inside customer revenue.
- Read [O2C Trace Case](../analytics/cases/o2c-trace-case.md) when you want a guided walkthrough from order through posting and settlement.
- Jump to [Returns, Credits, and Refunds](#returns-credits-and-refunds) when you want the main O2C exception path.
- Read [GLEntry Posting Reference](../reference/posting.md) and [Schema Reference](../reference/schema.md) when you need the detailed posting or join logic.
