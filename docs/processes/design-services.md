---
title: Hourly Design Services Accounting Process
description: Read the Design Services BPMN model alongside Mermaid records for engagement staffing, approved hours, monthly billing, payroll support, and an AIS billing-control activity.
---

import BpmnDiagram from "@site/src/components/BpmnDiagram";

# Design Services Process

## Business Storyline

**Illustrative scenario:** a Charles River customer buys hourly design help alongside furnishing choices. An engagement needs staffing, approved time, and monthly billing. The scenario does not identify a customer in the data or establish that every design deliverable is recorded.

<CompanyName /> earns revenue from physical goods and hourly Design Services. In the fictional company setting, students can picture design staff helping a customer plan furnishing choices. The dataset records engagement staffing, approved hours, monthly billing, payroll expense, and settlement; that illustrative setting does not establish a separate operational workflow for every kind of design task.

The process starts with the same commercial promise as the rest of O2C. Sales records a service order line, operations opens a customer engagement, managers staff that engagement with one or more employees, approved service time accumulates through the month, and accounting bills the approved billable hours at the agreed hourly rate. Treasury and accounting then settle the invoice through the normal cash-receipt and cash-application path.

In this dataset, an engagement and its approved time support the monthly service invoice; they do not post service revenue themselves. Payroll expense remains a normal period expense. Students can see the customer-billing side and the labor-cost side together without treating the service line as project-based actual costing.

## What Students Should Learn

- Distinguish customer demand, staffing, approved service hours, monthly billing, payroll expense, and cash settlement in the design-services line.
- Trace a design-service engagement from `SalesOrderLine` into `ServiceEngagement`, `ServiceTimeEntry`, `ServiceBillingLine`, `SalesInvoiceLine`, and `GLEntry`.
- Recognize how multiple employees can support one engagement while billing still rolls up at the customer-engagement level.
- Separate service margin analysis from manufacturing costing and inventory movement.

## Decisions and Evidence

An engagement manager needs to distinguish planned work, assigned people, approved hours, and billed hours. Customer accounting needs the monthly billing bridge. An analyst comparing service revenue with labor cost must also state whether the measure includes non-billable hours and which broader costs it omits.

Read the [Company Story](../learn-the-business/company-story.md) for the illustrative service setting. Use the actual engagement and invoice records for findings. The billing and payroll rules described here belong to the synthetic model and should not be generalized into a revenue-recognition policy for every service business.

## Participants and Responsibilities

The **customer** is external. **Sales** captures the service order; the **Engagement Lead** organizes assignments and approval support; **Design Staff** provide the service time recorded for the engagement; **Accounting** prepares monthly billing and cash applications; and **Treasury** records receipts. Payroll supplies the employee-cost side through its own cycle. The lanes explain responsibilities rather than proving that every duty was independently performed.

## BPMN Business Process

<BpmnDiagram modelId="design-services" />

### Interpret the Activities and Decisions

1. A service order opens an engagement and supports employee assignments. This is customer demand and delivery support, not shipment or revenue recognition.
2. Approved time distinguishes billable from non-billable hours. Only approved billable hours support the monthly billing rollup; both kinds can matter when interpreting labor effort and margin.
3. Accounting invoices the billing rollup, then the normal O2C receipt and application activities support settlement. The model does not add an unrecorded customer-acceptance or project-deliverable workflow.

### Risks, Controls, and Evidence

| Risk and control objective | Evidence available | Teaching boundary |
|---|---|---|
| Unsupported service hours: connect staff and approved time to an engagement | `ServiceEngagementAssignment`, `ServiceTimeEntry` approval fields | Test approval support and assignment links; a recorded approver alone does not establish the effectiveness of time review |
| Missing or incorrect billing: connect approved billable hours to the monthly invoice | `ServiceBillingLine.ServiceEngagementID`, `SalesInvoiceLineID`, and billing-period dates | An independent hours-to-billing reconciliation is a **proposed teaching control**, not a documented automated hold |
| Misleading margin: keep customer billing and labor cost on stated bases | `ServiceTimeEntry.ExtendedCost`, billable and non-billable hours, invoice-line revenue | This is a labor-cost analytical bridge; it does not establish full engagement profitability or capitalize service payroll into inventory |

The Mermaid views below connect the service activities to records and accounting effects. The [Process Models](../process-models/index.md) library includes editable sources and notation guidance.

## Normal Process Overview

```mermaid
flowchart LR
    C[Customer]
    SO[Sales Order]
    ENG[Service Engagement]
    STAFF[Assignments]
    TIME[Approved Service Time]
    BILL[Monthly Billing Rollup]
    INV[Sales Invoice]
    CASH[Cash Receipt and Application]
    PAY[Payroll Register]
    GL[GLEntry]

    C --> SO --> ENG --> STAFF --> TIME --> BILL --> INV --> CASH
    STAFF --> PAY
    INV -. Posts AR Service Revenue and Sales Tax .-> GL
    CASH -. Settles AR through unapplied cash .-> GL
    PAY -. Posts payroll expense and liabilities .-> GL
```

Read the main diagram as commercial promise, staffing, approved hours, monthly billing, settlement, and payroll support. The service line shares the customer-side invoice and cash path with the rest of O2C, but it does not require shipment, return, or inventory activity.

## Core Tables and What They Represent

| Process stage | Main tables | Grain or event represented | Why students use them |
|---|---|---|---|
| Customer demand | `SalesOrder`, `SalesOrderLine` | One customer order and ordered service line | Shows the original commercial promise, hourly rate, and planned service hours |
| Engagement setup | `ServiceEngagement` | One customer service job tied to one service order line | Anchors customer, service item, lead employee, planned hours, and engagement dates |
| Staffing | `ServiceEngagementAssignment` | One employee assignment on one engagement | Shows how many employees supported the same engagement and how hours were assigned |
| Approved service delivery | `ServiceTimeEntry` | One approved service-work day for one employee and engagement | Measures billable versus non-billable hours and snapshots labor cost for margin analysis |
| Monthly billing trace | `ServiceBillingLine` | One invoiced billing slice for approved hours | Connects approved hours to the exact `SalesInvoiceLine` used to bill the customer |
| Customer billing and settlement | `SalesInvoice`, `SalesInvoiceLine`, `CashReceipt`, `CashReceiptApplication` | Invoice, receipt, and settlement events | Completes the AR and cash path using the normal O2C backbone |
| Payroll support | `PayrollRegister`, `PayrollRegisterLine` | Gross-to-net payroll for the service staff | Keeps payroll expense and liability activity visible beside the customer-billing flow |

## When Accounting Happens

| Event | Business meaning | Accounting effect |
|---|---|---|
| Service order and engagement setup | Customer demand is accepted and staffed | No direct posting |
| Approved service time | Managers approve billable and non-billable hours worked on the engagement | No direct posting |
| Monthly service invoice | Accounting bills approved billable hours for the period | Debit accounts receivable and credit `4080` Sales Revenue - Design Services plus sales tax payable |
| Cash receipt and application | Treasury receives customer cash and later settles the invoice | Same customer-deposit and AR-clearing pattern used in O2C |
| Payroll register | Payroll records the wages and burden for service employees | Debits `6280` Salaries Expense - Design Services and related payroll expense pools, then credits accrued payroll and payroll liabilities |

## Key Traceability and Data Notes

- `ServiceEngagement.SalesOrderLineID` is the bridge from customer demand into service delivery.
- `ServiceEngagementAssignment` lets several employees work on the same engagement while preserving assigned-role detail.
- `ServiceTimeEntry` stores both `BillableHours` and `NonBillableHours`, plus `CostRateUsed` and `ExtendedCost` for labor-margin analysis.
- `ServiceBillingLine` is the authoritative hours-to-invoice bridge for services. Use it instead of trying to infer service billing from `SalesInvoiceLine` alone.
- Service invoice lines stay in `SalesInvoiceLine`, but `ShipmentLineID` remains null for those rows because nothing shipped physically.
- Payroll supports the same employees, but service labor is analyzed through `ServiceTimeEntry` rather than capitalized into manufacturing inventory.

## Analytical Subsections

### 1. Customer Demand to Engagement Setup

The process begins on the customer side. A service line is created on the sales order, then the operating team opens an engagement that carries planned hours, the lead employee, and the expected delivery window.

```mermaid
flowchart LR
    C[Customer]
    SO[Sales Order]
    SOL[Service Order Line]
    ENG[Service Engagement]

    C --> SO --> SOL --> ENG
```

**Starter analytical question:** Which customers create the most planned design-service hours, and how concentrated is that workload?

### 2. Staffing and Approved Time

Once the engagement is active, the company assigns one or more employees to it. Approved daily service time then accumulates by employee and date. This layer is where students can compare planned hours, assigned hours, billable hours, non-billable hours, and cost snapshots.

```mermaid
flowchart LR
    ENG[Service Engagement]
    ASG[Assignments]
    TIME[Service Time Entry]
    EMP[Employee]

    ENG --> ASG --> TIME
    EMP --> ASG
    EMP --> TIME
```

**Starter analytical question:** Which engagements rely most on senior-designer time versus designer time, and where do non-billable hours accumulate?

### 3. Monthly Billing and Settlement

Billing does not happen every time an employee works. The dataset bills approved billable hours monthly. `ServiceBillingLine` stores the rolled-up hours for that invoice line, which makes it the main student bridge between approved service delivery and posted customer revenue.

```mermaid
flowchart LR
    TIME[Approved Service Time]
    BILL[Service Billing Line]
    INV[Sales Invoice Line]
    CASH[Cash Application]

    TIME --> BILL --> INV --> CASH
```

**Starter analytical question:** Which customers show the biggest difference between approved service hours and billed service hours at month-end?

### 4. Payroll and Service Margin Interpretation

The same service staff still pass through the normal payroll cycle. That means students should read service profitability in two layers. Billing and receivables live in the customer process. Labor cost and payroll liabilities live in payroll. `ServiceTimeEntry.ExtendedCost` gives the analytical bridge that lets students compare billed revenue to labor cost without converting the service line into manufacturing cost accounting.

**Starter analytical question:** Which engagements show the strongest labor margin after comparing billed revenue to the approved time-cost snapshot?

## Optional AIS Activity: Review Approved Hours and Billing

**Context and objective:** an engagement lead and accounting need to understand whether approved service effort was billed on the intended monthly basis. Interpret the service process and evaluate one risk at the handoff from time approval to billing.

**Prerequisites, tools, and sources:** read the O2C cash-application discussion and this page's billing bridge. Use a SQL tool with the published SQLite file, or Excel filters and lookups, plus a copy of the editable Draw.io model. Sources are `SalesOrderLine`, `ServiceEngagement`, `ServiceEngagementAssignment`, `ServiceTimeEntry`, `ServiceBillingLine`, `SalesInvoiceLine`, `SalesInvoice`, and `GLEntry`; add payroll records only when explaining the separately defined employee-cost scope.

1. Record the release, engagement, billing period, and reporting date. Mark the relevant activities and responsible roles on the model.
2. Compare approved billable hours, non-billable hours, and billed hours for the period. Preserve the monthly rollup grain and explain date or scope differences before calling them missing revenue.
3. Add one **proposed teaching control** for time approval or billing completeness. State the risk, objective, owner, source evidence, reproducible test, and limitation using the [workshop matrix](../learn-and-practice/bpmn-controls-workshop.md).

**Assessed deliverable:** submit an annotated model, an engagement-period evidence schedule, and the risk/control row. Explain the effect of a supported difference on billing or staffing decisions. Do not invent a customer sign-off, link individual time rows directly to an invoice without the billing bridge, or treat the labor-cost snapshot as all service costs. Continue through the existing commercial and managerial reports below for broader interpretation.

## Common Student Questions

- Which customers buy only goods, which buy design services, and which buy both?
- How many employees typically support one design-service engagement?
- Which service hours were billable versus non-billable?
- Which approved hours remain unbilled at the end of the month?
- How do service invoices differ from shipment-based goods invoices?
- Where does payroll expense sit for design staff, and why does that not create manufacturing cost?

## Next Steps

- Read [O2C](o2c.md) when you want the broader customer-demand and settlement cycle around invoices, cash, returns, and working capital.
- Read [Payroll](payroll.md) when you want the payroll posting, liability, and cash-settlement side of the same service staff.
- Read [Commercial and Working Capital](../analytics/reports/commercial-and-working-capital.md) or [Managerial Reports](../analytics/reports/managerial.md) when you want the service activity summarized as management reporting.
- Read [Schema Reference](../reference/schema.md) and [GLEntry Posting Reference](../reference/posting.md) when you need the exact joins and posting rules.
