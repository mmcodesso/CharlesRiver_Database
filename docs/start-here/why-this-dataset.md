---
title: Why Teach with an Integrated Accounting Dataset
description: Connect accounting information systems, analytics, financial accounting, managerial accounting, and auditing through one openly licensed synthetic company.
slug: /why-this-dataset
sidebar_label: Why This Dataset
---

# Why This Dataset

A revenue total becomes more useful when a student can explain the order, shipment, invoice, and cash application behind it. <DisplayName /> provides a shared business setting for that explanation: one fictional company whose operating records connect to posted accounting.

## A Common Business Across Accounting Courses

<CompanyName /> buys merchandise, manufactures selected products, and sells hourly Design Services. The three activities create different evidence and cost questions while sharing customers, employees, organizational data, and the general ledger.

| Teaching emphasis | Question the environment makes possible |
|---|---|
| Accounting information systems | Which document records an event, which approval supports it, and which stored key carries the event forward? |
| Financial accounting | When does the event affect inventory, revenue, a receivable, a liability, or cash? |
| Managerial accounting | How do product mix, standard cost, labor, capacity, and planning assumptions affect the interpretation of performance? |
| Auditing | Does the source evidence support a posting, and what further work does an exception require? |
| Accounting analytics | Can another analyst reproduce the population, joins, measures, and conclusion? |

The [Company Story](../learn-the-business/company-story.md) makes the operating model understandable before students encounter table names. [Process Flows](../learn-the-business/process-flows.md) then connects departments, documents, recognition, and analysis.

## Traceable Accounting Evidence

The ledger retains `SourceDocumentType`, `SourceDocumentID`, `SourceLineID`, `VoucherType`, and `VoucherNumber`. These fields let students investigate where a posting came from, while the operational tables explain the event behind it.

Goods sales and Design Services offer a useful comparison. Goods follow shipment and invoice records. Services follow engagements, approved time, and `ServiceBillingLine`. Both reach customer receivables and cash application, but their fulfillment evidence differs. Manufacturing adds a separate distinction between material issue, production completion, payroll-supported labor, and work-order close.

The [Dataset Guide](dataset-overview.md), [Schema Reference](../reference/schema.md), and [GLEntry Posting Reference](../reference/posting.md) support that work without asking students to memorize the full model first.

## Practice That Progresses

[Learn and Practice](../learn-and-practice/index.md) begins with focused evidence tasks. Existing [SQL](../analytics/sql-guide.md) and [Excel guides](../analytics/excel-guide.md), [query resources](../analytics/analysis-tracks.md), [Reports and Analytics](../analytics/index.md), and [cases](../analytics/cases/index.md) extend the work into applied analysis and integrated investigation.

The goal is a supported explanation. Students identify the population, preserve source references, interpret a result, state its limitations, and recommend a next action. A query result alone is not a complete accounting conclusion.

## Open Reuse with Clear Limits

The project uses [CC BY-SA 4.0](../technical/license.md), allowing sharing and adaptation with attribution and the same license for adaptations. Instructors can assign the published files and adapt the teaching sequence to their course.

The environment is synthetic and deliberately includes anomalies. It supports practice with evidence and controls, but it does not demonstrate how a real company performed or establish that a flagged condition is fraud. Illustrated business scenarios supply context; students must derive findings from actual records in their assigned file.

## The Textbook and the Teaching Environment

[Accounting Analytics Hub](https://accountinganalyticshub.com/) connects this environment with the [Accounting Analytics: An Integrated Approach textbook](https://aa.accountinganalyticshub.com/). The textbook develops the conceptual and analytical methods. Charles River supplies a company, connected data, and opportunities to apply those methods.

The Hub's future AIS and tool courses are planned resources. Instructors can use the current Charles River materials independently, guided by the [Instructor Adoption Guide](../teach-with-data/instructor-guide.md).

Begin at [Start Here](index.md), get the [published files](downloads.md), or review the [first exercises](../learn-and-practice/index.md).
