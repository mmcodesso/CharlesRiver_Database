---
title: Attendance Control Audit Case
description: Guided walkthrough for roster, punch, overtime-approval, and absence-control review.
sidebar_label: Attendance Control Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Attendance Control Audit Case

Attendance control is one of the clearest places where workforce planning, timekeeping, payroll support, and audit review meet. This case turns those layers into one investigation so students can explain an exception from planned shift through raw evidence and approved time.

## Business Scenario

Internal audit has been asked to review whether scheduled work, raw punches, approved time, absences, and overtime approvals stay aligned. The objective is to identify attendance-control failures without losing the operational context behind them.

## The Problem to Solve

The audit team needs to determine which attendance exceptions reflect documentation gaps, which reflect approval failures, and which create a real payroll-risk concern.

## Key Data Sources

- `EmployeeShiftRoster`
- `EmployeeAbsence`
- `TimeClockPunch`
- `TimeClockEntry`
- `OvertimeApproval`
- `AttendanceException`
- `Employee`

## Recommended Query Sequence

<QuerySequence items={caseQuerySequences["attendance-control-audit-case"]} />

## Suggested Excel Sequence

1. Filter the query results to one workforce exception pattern at a time.
2. Trace the affected employee/date combinations into `EmployeeShiftRoster`, `TimeClockPunch`, and `TimeClockEntry`.
3. Compare the source-table evidence to the control failure identified by the query.

## What Students Should Notice

- Roster failures, punch failures, and approval failures are different control problems even when they occur on the same day.
- A missing final punch can create both attendance and payroll review consequences.
- Absence rows and worked time should rarely coexist for the same planned shift.
- Workforce-planning exceptions are more meaningful when students trace them back to the planned roster row and the approved daily time summary.

## Follow-Up Questions

- Which anomaly type is easiest to detect with a simple query, and which requires a multi-table review?
- When should auditors move from a summary exception query into the raw attendance tables?
- Which attendance exception would create the greatest payroll overstatement risk?
- Which attendance exception is operationally serious even if the payroll impact is small?

## Next Steps

- Read [Payroll](../../processes/payroll.md) when you want the wider business and accounting flow behind attendance and payroll support.
- Read [Payroll and Workforce](../reports/payroll-perspective.md) when you want the report-level interpretation of the same control questions.
- Read [Audit Analytics](../audit.md) when you want the broader exception and control-review query set.
