---
title: Teaching Accounting with Charles River
description: Plan process-led accounting modules, select foundational exercises and integrated cases, and assess evidence, interpretation, and decisions with Charles River.
slug: /teach-with-data/instructor-adoption
sidebar_label: For Instructors
---

# Instructor Adoption Guide

Start with an accounting question students should be able to explain. <DisplayName /> supplies one fictional company, connected business processes, published teaching files, reports, query resources, and cases. You can assign a focused document trace or build a wider investigation without requiring students to run the dataset generator.

Charles River is part of [Accounting Analytics Hub](https://accountinganalyticshub.com/). The [Accounting Analytics: An Integrated Approach textbook](https://aa.accountinganalyticshub.com/) supplies conceptual depth and tool instruction; this site supplies the company, records, and applied work. The textbook's [instructor preface](https://aa.accountinganalyticshub.com/front-matter/preface.html#to-the-instructor) provides additional adoption context. The Hub's future AIS and tool courses are planned resources, rather than available courses required for this material.

## Prepare the Class Files

Choose the published format that matches the intended evidence workflow:

- <ReleaseDownloadLink type="sqlite">SQLite database</ReleaseDownloadLink> for joins, document tracing, and query-based analysis.
- <ReleaseDownloadLink type="excel">Excel workbook</ReleaseDownloadLink> for filters, Power Query imports, PivotTables, and visual interpretation.
- <ReleaseDownloadLink type="csv">CSV package</ReleaseDownloadLink> for table imports into a course-selected tool.

Record the release version, retain the source files, and give students a common reporting period. The published database contains 82 user tables. Its main operating window covers 2024–2026; supplier disbursements can settle in early 2027. Assign a clear reporting date so subsequent settlements do not silently change a period-end conclusion.

Review the chosen activity with the actual class file before assigning it. The default teaching data deliberately includes anomalies; an exception result is a lead for evidence work, not a supplied diagnosis.

## Recommended Teaching Sequence

1. **Understand the company.** Assign [Start Here](../start-here/index.md) and [Company Story](../learn-the-business/company-story.md). Ask students to explain the difference between purchased goods, manufactured goods, and hourly services.
2. **Understand a process.** Use [Business Processes and Models](../learn-the-business/process-flows.md), then one detailed process page. Pair BPMN with Mermaid to distinguish activities and responsibilities from information relationships and accounting effects. Identify the business need, documents, approvals, and handoffs.
3. **Explore the evidence.** Use [Dataset Guide](../start-here/dataset-overview.md) and a foundational task in [Learn and Practice](../learn-and-practice/index.md). Keep the [Schema Reference](../reference/schema.md) and [Posting Reference](../reference/posting.md) available as lookup tools.
4. **Analyze a population.** Choose the [SQL Guide](../analytics/sql-guide.md), [Excel Guide](../analytics/excel-guide.md), a [query resource](../analytics/analysis-tracks.md), or a [Reports and Analytics](../analytics/index.md).
5. **Interpret and decide.** Assign an [integrated case](../analytics/cases/index.md). Require a supported accounting explanation, limitations, and a specific recommendation or request for further evidence.

## Three Core AIS Process Modules

These modules support source-document, relational-data, posting, and control instruction within an existing AIS course. They can also anchor financial, managerial, or audit modules while the complementary AIS textbook is in development.

| Process module | Foundational task | Applied or integrated continuation | Assess the distinction between |
|---|---|---|---|
| [Order-to-cash](../processes/o2c.md) | [Goods sale source-to-ledger trace](../learn-and-practice/source-to-ledger.md) | [Resolve a Customer Account Review](../analytics/cases/o2c-trace-case.md) | Order, shipment, invoice, cash receipt, and invoice settlement |
| [Procure-to-pay](../processes/p2p.md) | [Receipt-to-payable timing](../learn-and-practice/receipt-to-payable.md) | [P2P Accrual Case](../analytics/cases/p2p-accrual-settlement-case.md) | Commitment, receipt, GRNI, AP, payment, and accrued-service settlement |
| [Conversion and manufacturing](../processes/manufacturing.md) | [Manufacturing cost-flow map](../learn-and-practice/manufacturing-cost-flow.md) | [Manufacturing Labor Case](../analytics/cases/manufacturing-labor-cost-case.md) | Planning, execution, standard-cost completion, labor support, and close |

The [BPMN and Controls Workshop](../learn-and-practice/bpmn-controls-workshop.md) adds process interpretation, responsibility mapping, an activity-to-database evidence trace, and a reusable risk and control matrix. Begin with the three core modules above, then extend into [Design Services](../processes/design-services.md), [Payroll](../processes/payroll.md), and [Manual Journals and Close](../processes/manual-journals-and-close.md). Viewing the published diagrams requires only a browser; students need diagrams.net for the optional model-editing extension.

## Run One Self-Contained Module

Use one chosen tool throughout. Assign [Lesson 1](../learn-and-practice/meet-the-records.md), [Lesson 2](../learn-and-practice/read-an-order.md), and [Lesson 3](../learn-and-practice/connect-the-records.md), with [Excel setup](../analytics/excel-guide.md) or [SQL setup](../analytics/sql-guide.md), before the process-specific work below. Students need basic debit/credit and recognition/settlement knowledge. The [full twelve-lesson route](../learn-and-practice/index.md) keeps its existing order; a module selects only the relevant work after those foundations.

| Module and objective | Preparation and sources | Evidence workflow and assessed deliverable | Readiness and continuation |
|---|---|---|---|
| O2C: distinguish delivery, billing, cash, and allocation | [O2C chapter](../processes/o2c.md); [Lesson 4](../learn-and-practice/source-to-ledger.md), [Lesson 5](../learn-and-practice/follow-customer-settlement.md), [Lesson 6](../learn-and-practice/find-the-accounting-entries.md); order/shipment/invoice lines, receipts/applications, Account, GLEntry | Trace stored line keys, widen deliberately to full vouchers, balance them, and submit a dated event/account schedule with cutoff-specific limitations. | Pass the [Lesson 3](../learn-and-practice/connect-the-records.md#readiness-check-after-lesson-3) and [Lesson 6](../learn-and-practice/find-the-accounting-entries.md#readiness-check-after-lesson-6) gates; continue to [Case 1](../analytics/cases/o2c-trace-case.md). |
| P2P: distinguish receipt-matched liability from an expense estimate | [P2P chapter](../processes/p2p.md); [Lesson 8](../learn-and-practice/receipt-to-payable.md), [Lesson 11](../learn-and-practice/follow-an-estimate-into-settlement.md); receipt/invoice lines, JournalEntry, DisbursementPayment, GLEntry | Trace the receipt link and accrual link separately; submit two event timelines explaining GRNI, accrued expenses, AP, and later payment. | Pass foundation and [summary readiness](../learn-and-practice/turn-records-into-a-conclusion.md#before-you-start); continue to [Case 3](../analytics/cases/p2p-accrual-settlement-case.md). |
| Manufacturing: distinguish execution, standard completion, and close | [Manufacturing chapter](../processes/manufacturing.md); [Lesson 9](../learn-and-practice/manufacturing-cost-flow.md); WorkOrder, material/completion lines, labor support, WorkOrderClose, GLEntry | Independently aggregate work-order branches; submit a cost-flow explanation and supported reconciliation, identifying pooled-allocation limits. | Pass foundation and [summary readiness](../learn-and-practice/turn-records-into-a-conclusion.md#before-you-start); continue to the [manufacturing case](../analytics/cases/manufacturing-labor-cost-case.md). |
| Payroll: distinguish approved time, employee net pay, and other liabilities | [Payroll chapter](../processes/payroll.md); [Lesson 10](../learn-and-practice/follow-hours-into-payroll.md); TimeClockEntry, PayrollRegister/lines, PayrollPayment, period remittances, GLEntry | Retain employee/period facts and separate whole-period remittances; submit an approved-hours/gross-to-net check and dated liability explanation. | Pass foundation and [summary readiness](../learn-and-practice/turn-records-into-a-conclusion.md#before-you-start); continue to the [workforce case](../analytics/cases/workforce-coverage-and-attendance-case.md). |

Assess event, grain, valid relationship, cutoff, account effect, reproducible check, and bounded conclusion separately with the [public method rubric](pathname:///teaching/method-rubric.md) and [blank evidence template](pathname:///teaching/evidence-template.md). A correct number from repeated header amounts does not pass. The [public repair exercise](../learn-and-practice/index.md#repair-the-method-before-a-challenge) supplies method feedback; keep the independent case challenge and its grading materials separate.

For a financial emphasis, select [Lesson 4](../learn-and-practice/source-to-ledger.md), [Lesson 5](../learn-and-practice/follow-customer-settlement.md), [Lesson 6](../learn-and-practice/find-the-accounting-entries.md), [Lesson 8](../learn-and-practice/receipt-to-payable.md), [Lesson 11](../learn-and-practice/follow-an-estimate-into-settlement.md), and [Lesson 12](../learn-and-practice/turn-records-into-a-conclusion.md). For a managerial emphasis, select [Lesson 7](../learn-and-practice/follow-design-time-into-billing.md), [Lesson 8](../learn-and-practice/receipt-to-payable.md), [Lesson 9](../learn-and-practice/manufacturing-cost-flow.md), [Lesson 10](../learn-and-practice/follow-hours-into-payroll.md), and [Lesson 12](../learn-and-practice/turn-records-into-a-conclusion.md). Complete each selected lesson’s further preparation and the chosen case’s linked prerequisites. Use the [advanced-case readiness gate](../learn-and-practice/turn-records-into-a-conclusion.md#readiness-check-before-an-advanced-case) before the wider investigations. Introduce the [BPMN and Controls Workshop](../learn-and-practice/bpmn-controls-workshop.md) after at least one verified trace.

## Proposed 14-Week AIS Sequence

The following is an **adaptable teaching proposal** for using Charles River alongside the forthcoming *Accounting Information Systems: An Integrated Approach*. It is not a verified chapter map or a published syllabus for that planned textbook. Review its eventual contents and your course objectives before adopting the sequence. The existing [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) remains the available companion for analytics concepts and tools.

Keep the same company, assigned release, and evidence standards throughout the term. The early weeks establish business context and modeling; order-to-cash, procure-to-pay, and conversion receive the largest share of process work before students integrate controls, accounting, and analytics.

| Week | Process or AIS focus | Charles River preparation and practice | Assessable artifact |
|---|---|---|---|
| 1 | Company, value creation, and evidence boundaries | [Company Story](../learn-the-business/company-story.md) and [Dataset Guide](../start-here/dataset-overview.md) | Company explanation, selected release, and scope statement |
| 2 | Process architecture and BPMN responsibilities | [model library](../learn-the-business/process-flows.md#model-library); workshop Activity 1 | Annotated normal path with participants, handoffs, and a decision |
| 3 | Documents, relational records, and posting lineage | [Schema Reference](../reference/schema.md), [Posting Reference](../reference/posting.md), and a course-selected SQL or Excel introduction | Activity-to-document-to-table map with grain and keys |
| 4 | Order-to-cash: demand, fulfillment, and billing | [Order-to-Cash](../processes/o2c.md) and [Goods Sale Trace](../learn-and-practice/source-to-ledger.md) | Reproducible goods-line trace with accounting explanation |
| 5 | Order-to-cash: settlement, exceptions, and controls | [Resolve a Customer Account Review](../analytics/cases/o2c-trace-case.md); workshop matrix | Cash-versus-settlement explanation and risk/control questions |
| 6 | Procure-to-pay: need, commitment, receipt, and liability | [Procure-to-Pay](../processes/p2p.md) and [Receipt-to-Payable Timing](../learn-and-practice/receipt-to-payable.md) | Dated receipt-matched source and posting trail |
| 7 | Procure-to-pay: accrual settlement and evidence alternatives | [P2P Accrual Case](../analytics/cases/p2p-accrual-settlement-case.md) | Receipt versus accrued-service comparison and proposed control procedure |
| 8 | Conversion: planning, operations, and material movement | [Manufacturing](../processes/manufacturing.md) and [Cost-Flow Map](../learn-and-practice/manufacturing-cost-flow.md) | Map separating planning signals from execution and completion |
| 9 | Conversion: labor, costing, and close | [Manufacturing Labor Case](../analytics/cases/manufacturing-labor-cost-case.md) | Standard-cost and labor-support explanation with a close/reconciliation question |
| 10 | Connected service and payroll processes | [Design Services](../processes/design-services.md), [Payroll](../processes/payroll.md), and a selected trace | Comparison of approved hours, billing, payroll posting, and settlement |
| 11 | Journals, accruals, reporting boundaries, and close | [Manual Journals and Close](../processes/manual-journals-and-close.md) and [Explain Profit, Cash, and the Year-End Close](../analytics/cases/financial-statement-bridge-case.md) | Source-supported reconciliation and period-boundary explanation |
| 12 | Control evidence, authorization, and independence | [Investigate Exceptions and Recommend Controls](../analytics/cases/audit-review-pack-case.md); workshop matrix | Evidence-based risk/control matrix with missing evidence stated |
| 13 | Process redesign and testable recommendations | Workshop advanced extension, using one core process | Editable proposed model, SVG, text interpretation, and evidence assessment plan |
| 14 | Integrated accounting, analytics, and judgment | A scoped [integrated case](../analytics/cases/index.md) or selected parts of the [Investigate Exceptions and Recommend Controls](../analytics/cases/audit-review-pack-case.md) | Reproducible analysis and a defended recommendation with limitations |

Adapt the number of sessions, tools, case depth, and assessment weights to the course. A shorter module can pair one core process model with its foundational exercise and selected matrix rows. A capstone can compare controls across two processes without requiring students to analyze every table or every exception family.

## Assess Process and Control Reasoning

Require students to label **observed records**, **documented process interpretations**, and **proposed controls** in their models and matrices. The published BPMN models explain the teaching process; lane names are not evidence of actual access permissions, and a stored approval-related record alone does not prove authority, independence, or operating effectiveness. Ask students to identify the evidence that would support each additional conclusion.

The workshop matrix is reusable with existing cases and their query sequences. Assess the business risk, control objective, accountable role, timing, exception response, evidence population, proposed procedure, and limitations. Require authorization, completeness, segregation of duties, and reconciliation to be considered before accepting a proposed improvement. Students should identify the relevant procedures themselves, without being graded against an undisclosed finding.

The public tutorial and case cores include worked records, reproducible Excel and SQL steps, expected results, and explanatory feedback. Each case then presents a separate independent challenge. Keep challenge model answers, completed assessment workpapers, grading notes, and alternative assessment datasets in private course materials; do not place them in public pages, hidden tabs, downloads, or this repository. If you choose a specific transaction or provide a supplemental approval policy, distribute it explicitly and identify which evidence comes from the release and which comes from the instructor. A proposed system log or approval workflow must remain labeled as a design proposal rather than an existing dataset capability.

## Pathways Across the Curriculum

| Course emphasis | Starting evidence and preparation | Suggested continuation | Student submission |
|---|---|---|---|
| Accounting information systems | Company story, one core process, and document/line keys | Process exercise followed by a related case | Annotated document-to-table-to-ledger map with a control question |
| Accounting analytics | One process plus the SQL or Excel guide; define row grain before joining | [Query Library](../analytics/analysis-tracks.md) and a matching case | Reproducible analysis, source checks, and a decision memo |
| Financial accounting | Recognition and settlement concepts; `GLEntry` and `Account` | [Explain Profit, Cash, and the Year-End Close](../analytics/cases/financial-statement-bridge-case.md) or [CAPEX Lifecycle Case](../analytics/cases/financial-statement-bridge-case.md) | Reconciliation with source support and reporting-date explanation |
| Managerial accounting | Product, cost, labor, and planning concepts | [Production and Planning](../analytics/index.md#production-and-planning), portfolio or planning cases | Defined performance measure, a supported comparison, and limitations |
| Auditing | A normal process trace before exception testing | Specialized [audit cases](../analytics/cases/index.md), then the [Investigate Exceptions and Recommend Controls](../analytics/cases/audit-review-pack-case.md) | Exception triage, alternative explanations, and a proposed evidence procedure |

The case library has three Basic, three Intermediate, and two Advanced investigations. Establish the single-event explanation in the tutorials first, then widen the population and judgment required in the cases.

## Specify the Assignment Before Choosing More Queries

Give students a defined business problem, learning objectives, prerequisite reading, permitted tools, source tables or documents, evidence workflow, submission format, interpretation requirements, and scope limits. The [Learn and Practice](../learn-and-practice/index.md) pages demonstrate this structure.

A useful assessed submission has four parts:

| Criterion | Evidence of learning |
|---|---|
| Business and accounting explanation | Correctly distinguishes events, recognition, settlement, and the relevant process |
| Reproducible evidence | Retains version, dates, identifiers, query or workbook steps, and the meaning of one result row |
| Analytical checking | Tests source totals, join multiplicity, filters, and the basis of compared measures |
| Interpretation and judgment | Separates findings from hypotheses, states limitations, and proposes a supported next action |

Set the required length and weighting for your course. Assess the explanation as well as the output; a correct-looking total does not demonstrate that the student preserved the intended population.

## Teaching with Intentional Exceptions

Students should first explain the normal process, then investigate where source evidence or timing departs from that expectation. Require them to distinguish a business condition, a model limitation, an analytical error, and a potential control issue before recommending action.

If you supply <FileName type="support" />, use it as companion context for anomaly families and validation review. The workbook is available in local instructor materials but is not included among the public release downloads. Confirm version compatibility and provide it explicitly when an activity depends on it. Support summaries guide investigation; the underlying source records remain necessary evidence.

For broad capstone work, limit the initial assignment to selected exception families unless students already know the related document chains. Avoid grading students against an undisclosed fictional event or an assumed numerical outcome.

## Adoption Checklist

- Choose the process and accounting judgment you want students to demonstrate.
- Review the matching published file, reporting boundary, and activity before class.
- Assign the company and process reading before a technical task.
- Begin with a focused exercise, then progress to applied analysis and integrated cases.
- Require source checks and a reproducible evidence trail in SQL and Excel submissions.
- State whether a separately provided support workbook is required.
- Link to the textbook for conceptual development instead of duplicating its chapters.

## Next Steps

Share [Start Here](../start-here/index.md) with students, choose the first activity in [Learn and Practice](../learn-and-practice/index.md), and use the [Case Library](../analytics/cases/index.md) to extend the module. The [technical documentation](../technical/technical-guide.md) describes the existing project for instructors who need implementation context.


## Teaching with the Eight Guided Cases

Choose a case after its listed tutorial prerequisites. The three basic cases use two sessions, the three intermediate cases use three, and the two advanced cases use four; allow 60–90 minutes per session as a planning estimate. Together these are **23 sessions**, implying **23–34.5 hours** for all eight cases, excluding setup, tutorials, and reading. These are estimates, not measured learner durations. Tutorial timing remains unmeasured; assign it without claiming a validated duration. Students can complete either Excel or SQL throughout. Ask them to retain the named outputs at each stopping point and explain a mismatch before continuing.

Use the worked core for instruction and feedback. Assess the independent challenge on population definition, reproducibility, accounting distinctions, source evidence, limitations, and a justified recommendation. A clean result or an unresolved evidence gap can be a sound conclusion. Do not require students to prove a predetermined anomaly. For advanced cases, evaluate how they prioritize follow-up and specify an assessable control or management action.


## Separate Reproducibility from a Learner Pilot

Record the **website content commit**, **dataset release v2027.1**, checksum, tool version/build, and actual check date with every class validation. SQL execution, a static formula inspection, native workbook execution, and learner success establish different things. Native Microsoft 365 Excel and Power Query were unavailable in the cloud refinement environment; the workflows below remain **not run natively in this pass**. Do not treat a SQL match or historical formula result as an Excel pass.

| Native validation route | Work to record | Status for this refinement pass |
|---|---|---|
| Windows Microsoft 365: fresh [setup](../analytics/excel-guide.md), [Lesson 4](../learn-and-practice/source-to-ledger.md), [Lesson 6](../learn-and-practice/find-the-accounting-entries.md), [Case 1](../analytics/cases/o2c-trace-case.md) | Imports and named references before use; date/key types; join expansion; source-type/ID pairs; cutoff; values and refresh | Not run |
| Windows Microsoft 365: [Case 3](../analytics/cases/p2p-accrual-settlement-case.md), [Case 5](../analytics/cases/manufacturing-labor-cost-case.md), [Case 6](../analytics/cases/workforce-coverage-and-attendance-case.md), [Case 7](../analytics/cases/financial-statement-bridge-case.md) | Multi-reference append; grouped joins and missing-close evidence; null-center branches; large-ledger/history workflow; checks and refresh | Not run |
| Mac Microsoft 365: selected module and case | Independently verify supported import, query naming, references, date conversion, merges, final checks, and refresh | Not run |

For each attempted route, record row counts, key uniqueness, expanded-row counts, null classes, final values, and refresh outcomes; mark passed, failed, or not run with evidence. Retain raw/detail queries when grouped references are needed later.

**Proposed learner pilot; no results claimed:** Recruit learners who know basic accounting and are new to this environment. Observe one short module and selected cases, capturing setup time separately from task time. At the three readiness gates, ask learners to explain grain, join multiplicity, cutoff, and limits aloud before checking the expected number. Record wrong row counts, duplicated totals, date/type errors, null handling, recognition/settlement confusion, and successful repairs. Compare Excel and SQL routes independently, revise confusing instructions from observed evidence, and only then propose tutorial time estimates. The pilot has not been conducted for these refinements.
