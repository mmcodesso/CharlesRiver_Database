---
title: BPMN Process Models for Accounting Information Systems
description: Explore editable Charles River BPMN 2.0 models, organizational responsibilities, internal controls, and their connection to Mermaid data lineage and accounting evidence.
slug: /process-models
sidebar_label: Process Models
---

import BpmnDiagram, { BpmnModelCatalog } from "@site/src/components/BpmnDiagram";

# Process Models

A customer order, a supplier receipt, and a work order each involve people, decisions, documents, and accounting consequences. Read Charles River from two complementary perspectives: BPMN shows the business activities and responsibilities; Mermaid shows the records, relationships, and postings through which you investigate them.

The models support the forthcoming *Accounting Information Systems: An Integrated Approach* and the current [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/). They are reusable teaching models grounded in the published synthetic dataset. Role allocations illustrate responsibility; they do not prove who actually performed a task or whether a control operated effectively.

## Read a Process from Three Perspectives

| Perspective | Question it helps answer | Where to continue |
|---|---|---|
| BPMN activities and participants | What triggers work, who is responsible, and where does the path branch? | Open the model, read its text description, and inspect pools and lanes |
| Mermaid records and accounting | Which documents, keys, and events connect to the general ledger? | Read the matching [process guide](../learn-the-business/process-flows.md), [schema](../reference/schema.md), and [posting reference](../reference/posting.md) |
| Investigation and judgment | What can actual records establish about the process or a control objective? | Complete the [BPMN and controls workshop](../learn-and-practice/bpmn-controls-workshop.md) and a linked case |

## Business-Process Architecture

<BpmnDiagram modelId="process-architecture" />

The six collapsed activities show independently triggered business cycles. Shared records connect them; their information dependencies are explained in [Process Flows](../learn-the-business/process-flows.md). The architecture does not require every cycle to finish before another can operate.

## Reference Model: Order-to-Cash

<BpmnDiagram modelId="order-to-cash" />

## Model Library

The predictable filenames pair an editable `.drawio` source with an SVG exported by Draw.io. Click a diagram or its Expand model button to view it with zoom and pan controls. Download the source below to adapt a model in [diagrams.net](https://app.diagrams.net/) or Draw.io Desktop. Keep any proposed change clearly labeled as a teaching proposal.

<BpmnModelCatalog />

## A Short BPMN Reading Guide

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

Read the [OMG BPMN 2.0.2 specification](https://www.omg.org/spec/BPMN/2.0.2/) for the formal notation and [Draw.io's BPMN library guide](https://www.drawio.com/docs/diagram-types/bpmn-2-0/) for authoring. In a notation conflict, the OMG specification is authoritative. This introduction selects the symbols used here; it does not reproduce the full standard.

## Evidence and Control Boundaries

A stored approver, status, or posting link can support a specific test. It does not establish that every transaction was approved, that people had incompatible duties, or that an exception was automatically blocked. Compare actual source records at the correct dates and grain.

Reconciliations, independent review, holds, and segregation-of-duties improvements that are not represented by a documented field or event are **proposed teaching controls**. Identify them in your annotations and risk/control matrix. Do not present a proposed queue, credit policy, or automated matching rule as a feature of the published dataset.

These `.drawio` files use Draw.io's native XML format. They are **editable visual models, not standards-compliant executable BPMN XML**. Execution or interchange with a BPMN engine would require a separate BPMN export, modeling review, and schema/engine validation.

## Next Steps

1. Start with [Order-to-Cash](../processes/o2c.md), [Procure-to-Pay](../processes/p2p.md), or [Manufacturing and Conversion](../processes/manufacturing.md).
2. Use the [BPMN and controls workshop](../learn-and-practice/bpmn-controls-workshop.md) to connect a model, a risk, and real source evidence.
3. Extend the analysis through the [case library](../analytics/cases/index.md) or plan a course using the [instructor guide](../teach-with-data/instructor-guide.md).
