---
title: "Learn and Practice — Guided Excel and SQL Tutorials"
description: "Follow twelve connected Charles River tutorials from customer records to accounting evidence and a supported business conclusion, using Excel or SQL."
slug: "/learn-and-practice"
sidebar_label: "Learn and Practice"
pagination_prev: "processes/manual-journals-and-close"
pagination_next: "learn-and-practice/meet-the-records"
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";

# Learn and Practice

You have met the company and followed its processes. Now open its records and learn to support an explanation with evidence.

Begin with one customer and one order. Follow the order through shipment, billing, settlement, and accounting. Then reuse that method for services, purchasing, manufacturing, payroll, and close. Finish by turning a monthly summary into a conclusion you can defend.

The course assumes basic financial accounting, including debits and credits. It introduces the database and tool steps as you need them. Each lesson has a worked example, a result check, and one small variation.

## Choose Your Tool

The business question and expected result are shared. Select **Excel** or **SQL** and follow that route throughout the course; the site remembers your selection. You can switch tools or compare results later.

<ToolSteps>
<TabItem value="excel">

Use **Microsoft 365 desktop Excel**. You will import selected tables into a separate analysis workbook, then learn filters, lookups, merges, and PivotTables.

[Set up Excel](../analytics/excel-guide.md) to import your first customer table. Allow time for the published workbook to download before opening the import window.

</TabItem>
<TabItem value="sql">

Use the released SQLite database with **DB Browser for SQLite**. You will begin with complete queries to copy and run, then learn to change a filter, follow a key, and summarize records.

[Set up SQL](../analytics/sql-guide.md) to open the database and run your first query.

</TabItem>
</ToolSteps>

**Already set up? [Begin Lesson 1: Meet the Records](meet-the-records.md).**

<span id="1-foundational-exercises"></span>

## Foundations: Recognize and Connect Records

| Lesson | What you will learn |
|---|---|
| [1. Meet the Records](meet-the-records.md) | Find one customer and explain its identifier and descriptive fields. |
| [2. Read an Order](read-an-order.md) | Distinguish an order header from its lines and check their total. |
| [3. Connect the Records](connect-the-records.md) | Add customer and item descriptions using matching keys. |

These lessons establish a habit: say what one row represents before you calculate a total.

<span id="2-applied-analytical-exercises"></span>

## Processes: Follow Events and Accounting

| Lesson | Question to answer |
|---|---|
| [4. Follow a Goods Sale](source-to-ledger.md) | What was ordered, shipped, and invoiced? |
| [5. Follow Customer Settlement](follow-customer-settlement.md) | When was cash received, and when did it settle this invoice? |
| [6. Find the Accounting Entries](find-the-accounting-entries.md) | Which events changed which accounts? |
| [7. Follow Design Time into Billing](follow-design-time-into-billing.md) | How does approved time become a customer invoice? |
| [8. Follow a Purchase](receipt-to-payable.md) | What is owed before and after the supplier bill arrives? |
| [9. Follow Manufacturing Costs](manufacturing-cost-flow.md) | When are goods complete, and when are their costs closed? |
| [10. Follow Hours into Payroll](follow-hours-into-payroll.md) | Which obligations remain after an employee is paid? |
| [11. Follow an Estimate into Settlement](follow-an-estimate-into-settlement.md) | How does later evidence replace an expense estimate? |

The first sales lessons continue the same selected order. Later processes use separate verified records. Their teaching sequence does not mean that every purchase, work order, or pay record belongs to the illustrative customer project.

<span id="3-integrated-business-cases"></span>

## Interpretation: Explain a Result

[12. Turn Records into a Conclusion](turn-records-into-a-conclusion.md) moves from individual records to a monthly invoice population. Build a checked summary, investigate a source sample, and write a short evidence memo.

After Lesson 12, continue to the [Case Library](../analytics/cases/index.md). The optional [BPMN and Controls Workshop](bpmn-controls-workshop.md) builds on a trace you have already completed.

## Choose a Focused Module

The twelve lessons above remain the full route in their existing order. A module selects from that route after the same foundations; it does not require every case or every catalog query.

All modules begin with [Lesson 1](meet-the-records.md), [Lesson 2](read-an-order.md), and [Lesson 3](connect-the-records.md), plus [Excel setup](../analytics/excel-guide.md) or [SQL setup](../analytics/sql-guide.md). Pass the [Lesson 3 readiness check](connect-the-records.md#readiness-check-after-lesson-3) before adding event relationships.

| Module | Lessons after foundations | Continuation and readiness |
|---|---|---|
| First O2C module | [4. Goods sale](source-to-ledger.md), [5. Customer settlement](follow-customer-settlement.md), [6. Accounting entries](find-the-accounting-entries.md) | Pass the [Lesson 6 check](find-the-accounting-entries.md#readiness-check-after-lesson-6), then [Case 1: customer account review](../analytics/cases/o2c-trace-case.md). |
| Focused P2P module | [8. Purchase](receipt-to-payable.md), [11. Estimate and settlement](follow-an-estimate-into-settlement.md) | Explain receipt-matched and accrued-service links separately; pass [summary readiness](turn-records-into-a-conclusion.md#before-you-start), then [Case 3: supplier obligations](../analytics/cases/p2p-accrual-settlement-case.md). |
| Focused manufacturing module | [9. Manufacturing costs](manufacturing-cost-flow.md) | Separate completion from close, reconcile without multiplying work-order totals, then pass [summary readiness](turn-records-into-a-conclusion.md#before-you-start) before the [manufacturing case](../analytics/cases/manufacturing-labor-cost-case.md). |
| Focused payroll module | [10. Hours and payroll](follow-hours-into-payroll.md) | Separate employee/period facts from period-wide remittances, then pass [summary readiness](turn-records-into-a-conclusion.md#before-you-start) before the [workforce case](../analytics/cases/workforce-coverage-and-attendance-case.md). |
| Financial emphasis | [4. Goods sale](source-to-ledger.md), [5. Settlement](follow-customer-settlement.md), [6. Entries](find-the-accounting-entries.md), [8. Purchase](receipt-to-payable.md), [11. Estimates](follow-an-estimate-into-settlement.md), [12. Conclusions](turn-records-into-a-conclusion.md) | Check the [statement case](../analytics/cases/financial-statement-bridge-case.md) prerequisites and the [advanced-case gate](turn-records-into-a-conclusion.md#readiness-check-before-an-advanced-case). |
| Managerial emphasis | [7. Design time](follow-design-time-into-billing.md), [8. Inputs](receipt-to-payable.md), [9. Manufacturing](manufacturing-cost-flow.md), [10. Payroll](follow-hours-into-payroll.md), [12. Conclusions](turn-records-into-a-conclusion.md) | Complete each lesson’s linked preparation; choose the [design-services](../analytics/cases/design-services-performance-case.md), [manufacturing](../analytics/cases/manufacturing-labor-cost-case.md), or [portfolio](../analytics/cases/product-portfolio-profitability-case.md) case after its prerequisites. |

Take [Lesson 12](turn-records-into-a-conclusion.md) when its explicit minimum skills are met; the recommended full route still completes all earlier lessons. The [BPMN and Controls Workshop](bpmn-controls-workshop.md) follows at least one verified event trace. Model viewing itself needs no file download.

## Repair the Method Before a Challenge

This **public practice exercise** is separate from every case’s independent challenge. A classmate joins an invoice header to its two invoice lines, then sums the repeated header total and calls the result cash collected. Diagnose the grain and measure errors before writing any calculation. Propose a repair and a before/after check; no new dataset record is implied.

<details>
<summary>Compare the method repair</summary>

Keep the header total once per invoice, or independently summarize lines at invoice grain before comparing them with the header. Check row counts, unique invoice IDs, and amounts before and after the join. Invoice totals are billed amounts; cash collection needs dated receipt/application evidence and a defined cutoff. A plausible number from repeated headers does not support the conclusion.

</details>

<span id="a-common-evidence-standard"></span>

## Keep a Small Evidence Portfolio

For each lesson, retain your workbook or SQL, source release, selected identifiers, filters, result check, and short interpretation. Download the [blank evidence template](pathname:///teaching/evidence-template.md) and the [public method rubric](pathname:///teaching/method-rubric.md); both describe the method without supplying private challenge solutions. A useful submission explains both what the evidence supports and what it leaves unresolved.

Worked outputs use **release v2027.1**. The company scenes are fictional teaching situations; the named examples are actual synthetic records in that release. The file includes intentional exceptions. A discrepancy calls for investigation, and a matched example does not establish that the whole population is correct.

If your assigned file differs, follow your instructor's version and explain any differences rather than altering records to reproduce a displayed number.

## Plan the Workload

The eight cases contain **23 sessions**. At the published estimate of **60–90 minutes per session**, all cases imply **23–34.5 hours**, excluding setup, tutorials, and reading. This is a planning estimate, not measured learner completion time. Choose one module and its case first. Tutorial time estimates await a learner pilot; none are claimed here.

## Next Steps

[Begin with Meet the Records](meet-the-records.md), or finish the setup for your chosen tool first.

Instructors can use the [Adoption Guide](../teach-with-data/instructor-guide.md) to select a shorter pathway. [Accounting Analytics Hub](https://accountinganalyticshub.com/) and the [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) provide the wider learning context.
