---
title: Business Processes — Following the Work Between Departments
description: Learn to follow Charles River's responsibilities, documents, and accounting events, with a guided introduction to business-process diagrams and optional editable models.
slug: /process-flows
sidebar_label: Business Processes
pagination_prev: learn-the-business/company-story
pagination_next: processes/o2c
toc_max_heading_level: 2
---

import BpmnDiagram, { BpmnModelCatalog } from "@site/src/components/BpmnDiagram";
import EvidenceDiagram from "@site/src/components/EvidenceDiagram";

# Business Processes and Models

The warehouse has recorded goods leaving inventory for the customer in our furnishing story. Customer accounting now needs to know what shipped so it can prepare the invoice. The work crosses a department boundary, and the shipment record gives the next person something to act on.

This handoff illustrates a **business process**: connected activities that begin with a need or event and produce an outcome. To understand it, follow the people doing the work, the information they use, and what changes after each activity.

## Follow a Handoff

Start with five questions. **What starts the work? Who acts? What do they do? What document records it? What outcome allows the next activity?**

For goods fulfillment, the customer's order establishes demand. Warehouse staff record a shipment. Customer accounting uses shipment support for billing. The invoice then establishes an amount owed by the customer.

Each document answers a different question. An order does not prove shipment, and a shipment does not establish invoice settlement. The sequence becomes easier to read when you identify the purpose of each handoff before looking at database names.

When you examine the records, look for partial quantities, different dates, and unresolved balances. Use the process model to identify the next document to inspect, then establish how far the selected transaction has progressed.

<span id="the-connected-business"></span>

## See the Connected Business

**How do the company's activities depend on one another?** Follow customer demand into goods and design work, then look at the support supplied by purchasing, production, and payroll.

<EvidenceDiagram modelId="company-dependencies" />

The map shows dependencies across the business. It is not a schedule in which all transactions occur one after another, and its arrows are not instructions for joining tables. Purchasing and payroll support the wider company as well as customer-facing work.

The controller eventually brings the accounting consequences together. That explanation still depends on the separate events: inventory received or shipped, services billed, wages recorded, obligations settled, and estimates adjusted.

## Read Activities and Records Differently

The chapters use two complementary diagram views. A **BPMN business-process model** shows work and responsibility. A **record and accounting evidence map** shows relationships among documents or accounting events.

In detailed record maps, a field label on a solid arrow identifies a stored-key relationship or an explicit ledger-source mapping. A dashed arrow identifies analytical support, aggregation, or an account effect, with chronology stated on the arrow when it matters. A receipt-to-issue support comparison does not establish a stored lineage key. Read each label before choosing a join. These record-map conventions differ from BPMN sequence and message flows described below.

BPMN means Business Process Model and Notation. You can begin with a small set of symbols:

| Symbol | First reading |
|---|---|
| Circle | An event starts or ends the modeled work |
| Rounded rectangle | Someone performs an activity |
| Lane | A role or department is responsible for activities |
| Diamond | Follow the labeled decision or branching condition |
| Solid arrow within a participant | Activities follow a sequence |
| Dashed message arrow between participants | Information passes between the company and another participant |

A diagram's end event marks its defined boundary. It does not necessarily mean the customer's whole relationship is complete or that all balances are zero. Read the model's explanation to understand what the endpoint represents.

Click either kind of diagram to expand it. The expanded view provides the same navigation and close behavior throughout the site. You can return to the chapter without losing your place.

## Read Every Process in the Same Order

Begin with the ordinary business situation and follow the people doing the work. Then explain the accounting events: which activities create postings, and which simply provide context or support?

Next, connect the familiar documents to their stored records. The chapter's small record map helps you recognize the records needed later without memorizing the full table inventory.

Finally, consider one complication and answer the concept checks. A partial delivery or a later payment can reveal why the process distinctions matter. Optional sections provide detailed fields, additional models, control questions, and assignments when you are ready for them.

Keep three questions alongside each chapter: **What happened? What evidence establishes it? What remains open at this date?** These questions prepare you to interpret an accounting total rather than simply reproduce it.

## Distinguish Responsibilities from Control Evidence

The recurring sales coordinator, operations planner, design lead, and controller help explain the company. Process lanes describe responsibilities. Actual employee fields help you investigate who performed a recorded task.

An approval field or a balanced journal does not establish that every review was independent and effective. Later activities ask you to evaluate evidence and propose controls. Such proposals are labeled as teaching controls wherever the stored records do not establish that the procedure operated.

## Next Steps

Continue to [Order-to-Cash](../processes/o2c.md). Follow the customer's goods from an order through delivery, billing, and invoice settlement before moving to the design work.

## Optional Reference

The model library and extended notation are available for later analysis and diagram editing. The current [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) supports analytical methods. The associated AIS textbook is forthcoming.

<details>
<summary>Explore the full company architecture</summary>

### Business Process Architecture

<BpmnDiagram modelId="process-architecture" />

The architecture groups the company's business cycles and responsibilities. Each cycle has its own trigger and boundary, so the drawing does not impose a single serial schedule on all transactions. Purchasing supplies merchandise and components, manufacturing supplies selected finished goods, payroll supports factory and service staff, and finance complements the operating cycles with journals and close.

Return to [the connected business map](#see-the-connected-business) for a simpler view, or choose an editable source in the [model library](#model-library).

</details>
<details>
<summary>Browse the editable model library</summary>

### Model Library

Begin with **Order-to-Cash**, **Procure-to-Pay**, or **Manufacturing and Conversion** for the three core AIS modules. Design Services, payroll, and finance connect those cycles to employee time, customer billing, settlement, and close. Focused detail models keep exceptions and proposed reviews separate from the main paths.

Before a data activity, finish [Lesson 1](../learn-and-practice/meet-the-records.md), [Lesson 2](../learn-and-practice/read-an-order.md), and [Lesson 3](../learn-and-practice/connect-the-records.md), plus [Excel setup](../analytics/excel-guide.md) or [SQL setup](../analytics/sql-guide.md). Check the first activity's further prerequisites before following the event shown in its model.

| Model | First accounting trace |
|---|---|
| Cash Application | [Lesson 5: Follow Customer Settlement](../learn-and-practice/follow-customer-settlement.md) |
| Accrued-Service Settlement | [Lesson 11: Follow an Estimate into Settlement](../learn-and-practice/follow-an-estimate-into-settlement.md) |
| Design Services | [Lesson 7: Follow Design Time into Billing](../learn-and-practice/follow-design-time-into-billing.md) |
| Payroll | [Lesson 10: Follow Hours into Payroll](../learn-and-practice/follow-hours-into-payroll.md) |
| Manual Journals and Close | [Lesson 11: Follow an Estimate into Settlement](../learn-and-practice/follow-an-estimate-into-settlement.md); then the [statement and close case](../analytics/cases/financial-statement-bridge-case.md) |

The [BPMN and Controls Workshop](../learn-and-practice/bpmn-controls-workshop.md) remains an optional extension after one verified trace. Each row below links a model to its process guide, learning activity, case, and editable `.drawio` source. Click a diagram or its Expand model button to open the viewer. Download the source to adapt it in [diagrams.net](https://app.diagrams.net/) or Draw.io Desktop, keeping proposed changes explicitly labeled. Viewing the published diagrams requires only a browser.

<BpmnModelCatalog />

</details>
<details>
<summary>Read the extended notation and evidence guidance</summary>

### A Short BPMN Reading Guide

| Symbol or connector | Meaning in this library | Reading check |
|---|---|---|
| Thin start circle; thick end circle | A process instance begins or reaches its stated boundary | An end can mean an open item remains; read the label rather than assuming full settlement |
| Envelope in a start or double-ring intermediate circle | A message triggers a process or is awaited during it | Identify the other participant; a message is communication, not a ledger posting |
| Rounded task rectangle | An activity at the stated responsibility | Check its associated tables and evidence before inferring automation or authorization |
| Rounded activity with a boxed plus at the bottom | A collapsed subprocess with a separate detailed model | The plus is a subprocess marker, not a parallel gateway |
| Diamond with X | An exclusive decision or merge | Take one labeled alternative for the selected instance |
| Diamond with + | Parallel split or synchronization | All split branches are required; a join waits for every required incoming branch |
| Pool and lane | A participant boundary and responsibility within it | Charles River's lanes are internal; customers, suppliers, and agencies are separate pools |
| Solid arrow | Sequence within one pool | It may cross lanes but must not cross a participant boundary |
| Dashed arrow with open source circle and open target | Message between participants | It cannot be used as an internal lane-to-lane handoff |

Read the [OMG BPMN 2.0.2 specification](https://www.omg.org/spec/BPMN/2.0.2/) for the formal notation and [Draw.io's BPMN library guide](https://www.drawio.com/docs/diagram-types/bpmn-2-0/) for authoring. In a notation conflict, the OMG specification is authoritative. This introduction explains the symbols used here rather than reproducing the full standard.

### Evidence and Control Boundaries

A stored approver, status, or posting link can support a specific test. It does not establish that every transaction was approved, that people had incompatible duties, or that an exception was automatically blocked. Compare actual source records at the correct dates and grain.

Reconciliations, independent review, holds, and segregation-of-duties improvements that are not represented by a documented field or event are **proposed teaching controls**. Identify them in your annotations and risk/control matrix. Do not present a proposed queue, credit policy, or automated matching rule as a feature of the published dataset.

These `.drawio` files use Draw.io's native XML format. They are **editable visual models, not standards-compliant executable BPMN XML**. Execution or interchange with a BPMN engine would require a separate BPMN export, modeling review, and schema/engine validation.

</details>
<details>
<summary>Connect a process to an investigation</summary>

### Process to Analysis Bridges

The model library supplies the focused activities and cases. These report topics extend a trace into a wider population.

| Process | Report topics |
|---|---|
| [Order-to-cash](../processes/o2c.md) | [Sales and Customers](../analytics/index.md#sales-and-customers), [Statements and Cash](../analytics/index.md#statements-and-cash) |
| [Design Services](../processes/design-services.md) | [Sales and Customers](../analytics/index.md#sales-and-customers) |
| [Procure-to-pay](../processes/p2p.md) | [Purchasing and Inventory](../analytics/index.md#purchasing-and-inventory), [Statements and Cash](../analytics/index.md#statements-and-cash) |
| [Manufacturing](../processes/manufacturing.md) | [Production and Planning](../analytics/index.md#production-and-planning), [Purchasing and Inventory](../analytics/index.md#purchasing-and-inventory) |
| [Payroll](../processes/payroll.md) | [People and Payroll](../analytics/index.md#people-and-payroll) |
| [Manual Journals and Close](../processes/manual-journals-and-close.md) | [Statements and Cash](../analytics/index.md#statements-and-cash), [Controls and Exceptions](../analytics/index.md#controls-and-exceptions) |

For a broader comparison of payroll responsibilities and employee costs, continue to the [Explain Staffing, Overtime, and Payroll Cost](../analytics/cases/workforce-coverage-and-attendance-case.md).

</details>
