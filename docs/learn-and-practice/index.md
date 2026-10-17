---
title: Accounting Exercises and Learning Pathways
description: Progress from foundational source-to-ledger exercises to applied SQL and Excel analysis and integrated Charles River accounting cases.
slug: /learn-and-practice
sidebar_label: Learn and Practice
---

# Learn and Practice

Begin with a question small enough to explain from its source evidence. Once you can identify the document, its row grain, and its accounting effect, extend the same reasoning to a population, a report, or a business case.

Read [Company Story](../learn-the-business/company-story.md) and select a cycle in [Process Flows](../learn-the-business/process-flows.md) first. The [published files](../start-here/downloads.md) support SQL and Excel pathways; the [Dataset Guide](../start-here/dataset-overview.md) helps you find the relevant table families.

## 1. Foundational Exercises

These focused activities introduce the three core process modules. Choose one before opening a large query pack.

| Exercise | Process and concept | Prerequisites and tools | Assessed deliverable |
|---|---|---|---|
| [Trace a goods sale from source to ledger](source-to-ledger.md) | Order-to-cash; fulfillment, recognition, and settlement | Introductory debits and credits; SQL or Excel table navigation | One document trace, a posting explanation, and a timing conclusion |
| [Explain receipt-to-payable timing](receipt-to-payable.md) | Procure-to-pay; commitment, receipt, GRNI, AP, and payment | Basic inventory and liability concepts; SQL or Excel | One receipt-matched timeline, a liability explanation, and a follow-up question |
| [Map manufacturing cost flow](manufacturing-cost-flow.md) | Conversion; material issue, standard-cost completion, and close | Basic inventory and cost-flow concepts; SQL or Excel | One work-order evidence map with cost-stage distinctions and a stated limitation |

Each page specifies the source tables, evidence workflow, submission, interpretation, and boundaries of the task. No supplied scenario requires you to find an invented customer or transaction.

## 2. Applied Analytical Exercises

Expand from one trace to a defined population. These pathways reuse the existing guides, query resources, and reports.

| Pathway | Evidence workflow | Suggested submission | Interpretation requirement |
|---|---|---|---|
| [SQL Guide](../analytics/sql-guide.md) and [Query Library](../analytics/analysis-tracks.md) | Run an existing query, define its row grain, inspect a source sample, and change one documented date or grouping choice | Saved query or query reference, result excerpt, and source reconciliation | Explain what changed and whether the comparison is valid |
| [Excel Guide](../analytics/excel-guide.md) | Import only the required tables, preserve keys, construct a summary, and check a source total | Working workbook with import notes, one PivotTable or chart, and a check | Explain the measure and show that joins or filters did not duplicate it |
| [Reports and Analytics](../analytics/index.md) | Choose a business topic, read the report definition, compare periods, and drill into source evidence | One annotated report and a short decision memo | Distinguish an observed pattern from an explanation requiring more evidence |

Use the [Schema Reference](../reference/schema.md) for keys and the [GLEntry Posting Reference](../reference/posting.md) for event-to-accounting rules. The [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) provides deeper methods, including the [SQL essentials chapter](https://aa.accountinganalyticshub.com/chapters/09-sql-essentials/chapter.html).

For an AIS extension, use the [BPMN and Controls Workshop](bpmn-controls-workshop.md) with an editable [process model](../learn-the-business/process-flows.md#model-library). Interpret responsibilities, trace an activity to actual records, build a risk and control matrix, and propose a change with a testable evidence plan. Start after one foundational trace so the control discussion rests on source evidence.

## 3. Integrated Business Cases

The [Case Library](../analytics/cases/index.md) combines business context, related query sequences, accounting logic, and interpretation. Begin with the matching process case, then progress toward wider financial, managerial, or audit synthesis.

- Continue a customer trace in the [O2C Trace Case](../analytics/cases/o2c-trace-case.md).
- Compare receipt matching and accrual settlement in the [P2P Accrual Case](../analytics/cases/p2p-accrual-settlement-case.md).
- Connect approved labor, operations, and cost close in the [Manufacturing Labor Case](../analytics/cases/manufacturing-labor-cost-case.md).
- After those foundations, use the case library's difficulty and process guidance to select a more integrated investigation.

## A Common Evidence Standard

For every activity, retain the dataset version, file format, reporting dates, source identifiers, and definition of one result row. Show how you checked the evidence, explain its accounting meaning, and state what the analysis cannot establish. End with a supported action or a specific request for further evidence.

The data is synthetic and includes intentional exceptions. A complete trace is evidence about the selected records, not proof that every transaction or control is correct. A flagged record is a reason to investigate, not a ready-made conclusion.

Instructors can use the [Adoption Guide](../teach-with-data/instructor-guide.md) to align these levels with course objectives and assessment. [Accounting Analytics Hub](https://accountinganalyticshub.com/) connects the dataset, current textbook, and planned future course resources.
