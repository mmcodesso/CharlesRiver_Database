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

<span id="a-common-evidence-standard"></span>

## Keep a Small Evidence Portfolio

For each lesson, retain your workbook or SQL, source release, selected identifiers, filters, result check, and short interpretation. A useful submission explains both what the evidence supports and what it leaves unresolved.

Worked outputs use **release v2027.1**. The company scenes are fictional teaching situations; the named examples are actual synthetic records in that release. The file includes intentional exceptions. A discrepancy calls for investigation, and a matched example does not establish that the whole population is correct.

If your assigned file differs, follow your instructor's version and explain any differences rather than altering records to reproduce a displayed number.

## Next Steps

[Begin with Meet the Records](meet-the-records.md), or finish the setup for your chosen tool first.

Instructors can use the [Adoption Guide](../teach-with-data/instructor-guide.md) to select a shorter pathway. [Accounting Analytics Hub](https://accountinganalyticshub.com/) and the [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) provide the wider learning context.
