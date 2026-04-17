---
title: Workforce Coverage and Attendance Case
description: Guided walkthrough for staffing coverage, rostered hours, attendance, overtime, and work-center load.
sidebar_label: Workforce Coverage Case
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Workforce Coverage and Attendance Case

This case follows staffing pressure from planned roster through approved time and overtime response. It helps students explain whether workforce coverage kept pace with operational demand and where absence or overtime patterns start changing the production story.

## Business Scenario

Operations leaders want to understand whether work-center staffing kept pace with scheduled load, where absences concentrated, and how overtime was used to protect throughput.

## The Problem to Solve

Operations leaders need to decide whether coverage pressure is coming from weak staffing, concentrated absence, uneven load, or short-term overtime response.

## Key Data Sources

- `EmployeeShiftRoster`
- `EmployeeAbsence`
- `TimeClockEntry`
- `TimeClockPunch`
- `OvertimeApproval`
- `WorkOrderOperationSchedule`
- `WorkCenter`
- `Employee`

## Recommended Query Sequence

<QuerySequence items={caseQuerySequences["workforce-coverage-and-attendance-case"]} />

## Suggested Excel Sequence

1. Build a pivot from `EmployeeShiftRoster` by `RosterDate`, `WorkCenterID`, and `RosterStatus`.
2. Add approved worked hours from `TimeClockEntry`.
3. Add absence hours from `EmployeeAbsence`.
4. Compare overtime by work center using `OvertimeApproval`.

## What Students Should Notice

- Staffing gaps do not always show up as zero rostered hours. They often show up as planned load outpacing rostered or worked hours.
- Absence pressure and overtime pressure are linked but not identical.
- Reassigned rosters and overtime approvals are operational responses, not necessarily control failures.
- The published dataset includes both normal operating pressure and a small number of attendance-control exceptions.

## Follow-Up Questions

- Which work centers show the largest repeated negative coverage gap?
- Does overtime concentrate where coverage gaps persist?
- Are absences more concentrated by location, job family, or shift?
- Which attendance trend would matter most to a production planner?

## Next Steps

- Read [Operations and Risk](../reports/operations-and-risk.md) when you want the broader planning, capacity, and workforce-risk perspective.
- Read [Attendance Control Audit Case](attendance-control-audit-case.md) when you want the control-focused review of the same attendance evidence.
- Read [Manufacturing](../../processes/manufacturing.md) when you want the work-center and production side of the coverage story.
