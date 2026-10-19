---
title: BPMN Process and Internal Control Workshop
description: Extend a completed tutorial trace into a process handoff, evidence map, and proposed control with a testable assessment plan.
pagination_prev: learn-and-practice/turn-records-into-a-conclusion
pagination_next: analytics/cases/index
slug: /learn-and-practice/bpmn-controls-workshop
sidebar_label: BPMN and Controls Workshop
---

import { QueryReference } from "@site/src/components/QueryReference";

# BPMN Process and Internal Control Workshop

## Context and Problem

You have followed actual records through a business process. Now return to one handoff: what could prevent it from achieving its purpose, and which evidence would help you assess that risk?

This optional workshop starts from your completed [goods-sale trace](source-to-ledger.md), [purchase investigation](receipt-to-payable.md), or [manufacturing investigation](manufacturing-cost-flow.md). Bring the identifiers, dates, result checks, and limitations you already recorded. You do not need to select another transaction before beginning.

Follow five steps: **identify a handoff → connect it to evidence → describe a risk → propose a control → explain how it could be assessed**. Start with one handoff before expanding to the full matrix below. The editable BPMN model helps you discuss responsibilities without establishing that every depicted control operated.

## Learning Objectives

- Explain the trigger, participants, normal path, decisions, exceptions, and end state of a process.
- Distinguish organizational responsibility in BPMN from database relationships and posting lineage in Mermaid.
- Match selected business activities to source documents, table grains, keys, dates, and `GLEntry` evidence.
- Identify business risks and control objectives, and design procedures that could assess a proposed control.
- Explain the limits of transaction data when evaluating authorization and segregation of duties.

## Before You Start

**Prerequisites:** read [Company Story](../learn-the-business/company-story.md) and [Business Processes and Models](../learn-the-business/process-flows.md), including its BPMN reading guide. Complete a [process tutorial](index.md#processes-follow-events-and-accounting), including its result checks, before attempting the evidence extension.

For an early notation introduction, complete only Activity 1 items 1–4 after those readings. Item 5 and all later activities require a completed, checked process trace. Keep the notation exercise and later evidence work as two stages of the same workshop.

**Tools and files:** view the diagrams in a browser. For the modeling extension, download an editable `.drawio` file from the model library and open a separate working copy in diagrams.net. Use the assigned published SQLite database in read-only mode, or analyze copies of selected Excel tables in a separate workbook. Follow the [SQL Guide](../analytics/sql-guide.md) or [Excel Guide](../analytics/excel-guide.md) and record your source filename and reporting date.

**Sources:** choose a process from the table below. Read its full process page and use the [Schema Reference](../reference/schema.md) and [Posting Reference](../reference/posting.md) to confirm the actual columns and accounting sources before joining. Listed tables are starting evidence, rather than a claim that one join connects every row.

| Process and reading | Starting source documents and tables | Investigation focus |
|---|---|---|
| [Order-to-cash](../processes/o2c.md) | Order, shipment, invoice, receipt and application: `SalesOrderLine`, `ShipmentLine`, `SalesInvoiceLine`, `CashReceipt`, `CashReceiptApplication`; relevant headers and `GLEntry` | Separate goods fulfillment, billing, cash arrival, and settlement |
| [Procure-to-pay](../processes/p2p.md) | Requisition, PO, receipt, supplier invoice and payment: `PurchaseRequisition`, `PurchaseOrderLine`, `GoodsReceiptLine`, `PurchaseInvoiceLine`, `DisbursementPayment`; relevant headers and `GLEntry` | Distinguish receipt matching from direct accrued-service settlement |
| [Manufacturing and conversion](../processes/manufacturing.md) | Work order, operation, issue, completion and close: `WorkOrder`, `WorkOrderOperation`, `MaterialIssueLine`, `ProductionCompletionLine`, `WorkOrderClose`, `LaborTimeEntry`; relevant headers and `GLEntry` | Separate planning, physical completion, labor support, and standard-cost close |
| [Design Services](../processes/design-services.md) | Engagement, approved time and billing: `ServiceEngagement`, `ServiceEngagementAssignment`, `ServiceTimeEntry`, `ServiceBillingLine`, `SalesInvoiceLine`, `GLEntry` | Follow approved hours into monthly billing without assuming shipment |
| [Payroll](../processes/payroll.md) | Attendance, register and settlement: `TimeClockPunch`, `TimeClockEntry`, `OvertimeApproval`, `AttendanceException`, `PayrollRegister`, `PayrollRegisterLine`, `PayrollPayment`, `PayrollLiabilityRemittance`, `GLEntry` | Distinguish raw attendance, approved hours, employee payment, and liability remittance |
| [Manual journals and close](../processes/manual-journals-and-close.md) | Journal and posted detail: `JournalEntry`, `GLEntry`, `Account`; `PurchaseInvoiceLine` for linked accrual settlement | Separate recurring entries, accrual adjustments, and reporting-boundary entries |

## Activity 1: Interpret Responsibilities and Handoffs

Begin with order-to-cash, then compare procure-to-pay and conversion. Choose one process for the remaining activities.

1. State the business objective and the scope of the model. Identify its trigger, expected end state, external participants, and the responsibilities represented by internal lanes.
2. Narrate one normal path in business language. At each handoff, identify what the receiving role needs to know and which document or information supports the next activity.
3. Select a gateway. Explain what question it answers, which outcomes are possible, and whether its outgoing paths represent alternatives or parallel work. Do not infer execution times or concurrency from the dates of unrelated rows.
4. Identify an exception or an out-of-scope branch. Explain how it changes the question being asked. If the overview omits its detail, follow the related model or process subsection before adding steps yourself.
5. Compare the BPMN and Mermaid views. Choose one BPMN task and locate the corresponding operational record or posting path. Explain why a lane, a table, and a ledger source are different representations.

For notation checks, sequence flows stay within a pool and can cross its lanes, while message flows communicate between participants in separate pools. An exclusive gateway selects an alternative path, while a parallel split activates each outgoing path. Check the [OMG BPMN 2.0.2 specification](https://www.omg.org/spec/BPMN/2.0.2/) and the [official draw.io BPMN guide](https://www.drawio.com/docs/diagram-types/bpmn-2-0/) when reviewing a model.

## Activity 2: Connect a Model to Actual Evidence

1. Select an actual document or line in the assigned file and retain its identifier, date, process branch, and reporting boundary. State what one row represents before following its links.
2. Build an activity-to-evidence map. For each selected task, record the document, table, stored key, related record, and accounting significance. Mark a task as a teaching interpretation when the data does not directly establish its execution or owner.
3. Follow at least one source event into `GLEntry`. Explain when recognition occurs and how it differs from settlement or later close. Preserve both header and line keys where the accounting sources use different grains.
4. Check completeness in a defined direction. Explain whether you started with orders, shipments, receipts, invoices, or another population, and which missing downstream rows that choice can reveal. Check join multiplicity before comparing totals.
5. Record an unresolved evidence question. Describe plausible timing, valid alternative branches, and analytical errors to investigate before concluding that a process failed. A result without exceptions is acceptable when the scope and criteria are explicit.

Select the existing query that supports the process trace in your assignment. They provide evidence paths rather than control-effectiveness conclusions.

<QueryReference
  queryKey="cases/01_o2c_line_trace_order_shipment_invoice.sql"
  helperText="Trace actual goods lines from order through shipment and invoice, then investigate settlement separately through CashReceiptApplication."
/>

<QueryReference
  queryKey="cases/03_p2p_invoice_line_trace_receipt_vs_accrual.sql"
  helperText="Distinguish receipt-linked invoice lines from accrual-linked service settlement before defining a completeness test."
/>

<QueryReference
  queryKey="cases/06_manufacturing_work_order_close_gl_trace.sql"
  helperText="Compare operational work-order evidence with its close and ledger trail while preserving the reporting date."
/>

## Activity 3: Build a Risk and Control Matrix

Create a separate matrix for your chosen process. Develop at least four rows covering authorization, transaction completeness, segregation of duties, and reconciliation. Include exception handling in at least one row. Determine the risk and proposed response yourself. The questions below guide that assessment without asserting that a control exists or has failed.

| Matrix field | What your submission must establish |
|---|---|
| Process step and business risk | Which task or handoff could prevent the business objective from being achieved, and what could go wrong? |
| Control objective | What outcome should authorization, completeness, accuracy, timing, or custody safeguards support? |
| Evidence status | Label the row **observed record**, **documented process interpretation**, or **proposed control**; cite the basis for the label |
| Control design | Who would act, what would they check, when would they act, and how would exceptions be resolved? Identify preventive or detective intent |
| Responsibility and independence | Which duties should be separated, and what evidence would establish that the people or access rights are independent? |
| Database evidence and population | Which actual tables, keys, dates, and row grains could support a procedure? Define the population and comparison |
| Additional evidence needed | Which approval policy, access record, review sign-off, external document, or other support would you request if absent from the assigned file? |
| Assessment procedure and limitations | What observation would support or challenge the design, and what would the database alone leave unresolved? |

An approval-related record can support a question about a stored approval without establishing the approver's authority, independent access, or consistent control operation. A balanced voucher supports an accounting check but cannot by itself establish transaction authorization or economic validity. Explain those differences in your matrix.

### Public Practice Row

Consider a proposed review of cash application as a practice example before developing your own matrix. The risk is allocation to the wrong invoice or date. A **proposed detective control** would have a reviewer compare the application with its receipt and invoice, inspect customer consistency and available amounts, and resolve exceptions before the reporting cutoff. Use receipt 173, application 225, and invoice 202 as a traceable sample. Request the review sign-off, approval policy, and access evidence before concluding that the review operated independently.

An alternative defensible design is a **proposed preventive control** that validates the receipt customer, invoice customer, and available balance before accepting an application, with a documented override review. The stored keys can support a sample check, but they do not establish that the proposed validation exists. Neither design is proved effective by one balanced voucher. In your own row, identify the population and evidence needed to assess operation over time.

Use the [method rubric](pathname:///teaching/method-rubric.md) to assess the event, grain, link, cutoff, accounting effect, and bounded conclusion. Cite the corresponding evidence for each criterion rather than awarding credit solely for a matching total.

## Advanced Extension: Propose and Assess a Change

Save a copy of the chosen model and add one clearly labeled **proposed control** or **proposed exception procedure**. Preserve the original process view and distinguish your addition with text, not color alone. Use BPMN 2.0 shapes, label the decision outcomes, keep sequence flows inside their pool, and use message flows only for communication between participants. Justify any parallel split and join, including what happens when an exception prevents one branch from completing.

Provide a matching evidence plan. State which existing records could help assess the proposal and which additional information would be required. If the proposed control needs a new log or system capability, describe it as a future design requirement rather than an existing table or operational feature. Do not modify the class database, canonical SQL library, or original model files.

## Assessed Deliverable

Submit an annotated process interpretation, an activity-to-evidence map with real identifiers and reproducible query or workbook steps, the completed risk and control matrix, and a short recommendation. Include the source filename, reporting date, population definition, source checks, alternative explanations, and evidence still needed. For the advanced extension, also submit the editable `.drawio` copy, an SVG, and a readable text explanation of the change.

Assessment considers business understanding, notation, traceability, control reasoning, reproducibility, and judgment. A well-supported conclusion can be that more evidence is needed. Instructors choose the scope and weighting. The public workshop develops the method without supplying an expected numerical finding or an answer key for the independent task.

## Interpretation and Limitations

BPMN expresses a process model. To evaluate a depicted control, inspect the relevant approval, timing, and transaction evidence because the diagram itself is not an execution log. Lane assignments describe responsibilities and do not establish actual system access. Confirm exact cardinality and fields before analyzing the selected information relationships and accounting effects shown in Mermaid.

The published data supports source-record investigation, with intentional anomalies and documented model boundaries. Transaction rows alone cannot provide complete assurance about employee conduct, external documents, management review, or control effectiveness. A `.drawio` document is an editable diagram, not validated executable BPMN 2.0 XML.

## Next Steps

Continue with the [Resolve a Customer Account Review](../analytics/cases/o2c-trace-case.md), [P2P Accrual Case](../analytics/cases/p2p-accrual-settlement-case.md), [Manufacturing Labor Case](../analytics/cases/manufacturing-labor-cost-case.md), or [Investigate Exceptions and Recommend Controls](../analytics/cases/audit-review-pack-case.md). Reuse the matrix with the chosen case's existing query sequence. Return to the [model library](../learn-the-business/process-flows.md#model-library) for another cycle or to [Learn and Practice](index.md) for a narrower evidence exercise.
