---
title: Attendance Control Audit Case
description: Inquiry-led walkthrough for roster, punch, overtime-approval, and absence-control exception review.
sidebar_label: Attendance Control Case
---

import { QueryReference } from "@site/src/components/QueryReference";
import { CaseOverview } from "@site/src/components/CaseExplorer";

# Attendance Control Audit Case

<CaseOverview slug="attendance-control-audit-case" />

## Business Scenario

**Illustrative teaching scenario.** Select actual records from your assigned release to investigate this request; the scenario does not identify a particular published transaction or prescribe a finding.

Internal audit has been asked to review whether scheduled work, raw punches, approved time, absences, and overtime approvals stay aligned. The objective is to identify attendance-control failures without losing the operational context behind them.

This case starts after the managerial workforce coverage question. Here the focus is formal exception testing: which employee/date combinations break the expected control path, which source table proves the break, and which exceptions create payroll or operating risk.

## The Problem to Solve

The audit team needs to determine which attendance exceptions reflect schedule-linkage gaps, raw punch integrity failures, absence conflicts, overtime approval failures, or post-termination roster control issues.

## Learning Objectives

- Test roster links and punch integrity at a defined employee-date grain.
- Evaluate absence conflicts and overtime support separately.
- Assess payroll risk and identify evidence needed before quantifying an impact.

## Key Data Sources

- Source documents: Shift roster, raw punch sequence, approved time entry, absence record, overtime approval, and employment dates.
- Evidence grain: Retain employee, roster, time-entry, and punch keys; overlapping tests must not multiply distinct affected shifts.
- Main tables: `EmployeeShiftRoster`, `EmployeeAbsence`, `TimeClockPunch`, `TimeClockEntry`, `OvertimeApproval`, `Employee`
- Related process page: [Payroll](../../processes/payroll.md)
- Related report: [People and Payroll](../index.md#people-and-payroll)
- Related guide: [People and Payroll queries](../analysis-tracks.md#people-and-payroll)
- Related case: [Workforce Coverage and Attendance Case](workforce-coverage-and-attendance-case.md)
- Supporting references: [Schema Reference](../../reference/schema.md), [Dataset Guide](../../start-here/dataset-overview.md)
- This case is the formal exception-testing follow-through for attendance controls. Use the workforce coverage case when you want the managerial coverage-pressure view before audit testing.

## Recommended Query Sequence

### Step 1. Test schedule and punch linkage

Start with the basic control expectation: scheduled shifts should have punch or approved time evidence, and raw punches should connect to a valid schedule.

**What we are trying to achieve**

Identify rostered days with no punch activity and punch activity without a valid roster assignment.

**Why this step changes the diagnosis**

This step separates schedule documentation gaps from detached punch evidence. The same employee/date can create different control concerns depending on which side is missing.

**Suggested query**

<QueryReference
  queryKey="audit/37_scheduled_without_punch_and_punch_without_schedule_review.sql"
  helperText="Use this first to find roster-punch linkage failures."
/>

**What this query does**

It flags scheduled roster rows without linked time summaries or raw punches, and raw punch rows that are missing a valid linked roster row.

**How it works**

The query builds one set from `EmployeeShiftRoster` joined to `Employee`, `TimeClockEntry`, and `TimeClockPunch`, then unions it with punch rows whose roster link is missing or invalid.

**What to look for in the result**

- scheduled days with no punch or time-summary support
- punch rows that lack a valid roster assignment
- whether exceptions cluster by employee, date, or work center
- which source row should be traced first in the workbook

### Step 2. Inspect raw punch integrity

After linkage is tested, inspect the punch sequence itself. A linked punch set can still be invalid if the sequence is incomplete or out of order.

**What we are trying to achieve**

Detect incomplete punch sets, unexpected punch counts, and punch sequences with invalid ordering.

**Why this step changes the diagnosis**

Roster linkage tells you whether evidence exists. Punch integrity tells you whether that evidence is usable for attendance and payroll support.

**Suggested query**

<QueryReference
  queryKey="audit/40_overlapping_or_incomplete_punch_review.sql"
  helperText="Use this to test missing clock-out punches, unexpected punch counts, and reversed punch sequences."
/>

**What this query does**

It flags time-clock entries with missing clock-out punches, non-increasing punch timestamps, or unexpected punch counts.

**How it works**

The query orders raw `TimeClockPunch` rows by time-clock entry and sequence, uses window logic to compare each punch timestamp to the prior punch, summarizes punch evidence by entry, and joins back to `Employee`.

**What to look for in the result**

- missing final clock-out punches
- reversed or overlapping punch timestamps
- punch counts outside the expected two- or four-punch pattern
- entries where payroll support should not be accepted without correction

### Step 3. Test absence against worked-time evidence

Once punch integrity is reviewed, test whether absence records conflict with worked-time evidence. Absence rows and worked time should rarely coexist for the same planned shift.

**What we are trying to achieve**

Find rostered absences that still carry approved time summaries or raw punch activity.

**Why this step changes the diagnosis**

This step turns attendance review into a payroll-risk question. If an employee is absent and still has worked time, the issue is not just documentation; it can affect approved pay.

**Suggested query**

<QueryReference
  queryKey="audit/39_absence_with_worked_time_review.sql"
  helperText="Use this to find absence records that conflict with worked-time or punch evidence."
/>

**What this query does**

It lists absence records where the linked roster also has a time-clock entry or raw punch activity.

**How it works**

The query starts from `EmployeeAbsence`, joins the linked roster row, approved time summary, raw punches, and employee master, then keeps only absence rows with worked-time evidence.

**What to look for in the result**

- absence dates with worked hours
- absence records with raw punch counts
- recurring employee or absence-type patterns
- exceptions that require payroll review versus supervisor documentation cleanup

### Step 4. Review overtime approval support

After schedule, punch, and absence evidence are tested, move to overtime. Overtime can be operationally necessary, but it still needs approval support.

**What we are trying to achieve**

Identify approved worked overtime that is missing a linked approval or exceeds the approved amount.

**Why this step changes the diagnosis**

Overtime failures are approval failures, not just attendance-record failures. They can indicate supervisor override behavior or weak payroll support.

**Suggested query**

<QueryReference
  queryKey="audit/38_overtime_without_approval_review.sql"
  helperText="Use this to find overtime missing approval or exceeding approved hours."
/>

**What this query does**

It flags time-clock entries with overtime hours where the overtime approval is missing or the approved hours are below recorded overtime.

**How it works**

The query starts from `TimeClockEntry`, joins `Employee`, `WorkCenter`, and `OvertimeApproval`, then keeps overtime rows where approval support is absent or insufficient.

**What to look for in the result**

- overtime entries with no approval link
- recorded overtime above approved hours
- work centers or employees with repeated overtime approval issues
- whether the issue points to supervisor control or payroll support

### Step 5. Close with post-termination roster control

Finish with employee lifecycle control. A terminated employee can remain in the master for history, but scheduling after termination is a current control failure.

**What we are trying to achieve**

Identify roster rows scheduled after an employee's termination date and determine whether worked time or punch evidence also exists.

**Why this step changes the diagnosis**

This closeout connects attendance control to employee-master validity. Post-termination roster issues may require both scheduling cleanup and master-data follow-up.

**Suggested query**

<QueryReference
  queryKey="audit/41_roster_after_termination_review.sql"
  helperText="Use this to find rostered days after an employee's termination date."
/>

**What this query does**

It lists rostered days after termination and shows scheduled hours, worked hours, and punch counts where available.

**How it works**

The query joins `EmployeeShiftRoster` to terminated employees, left joins approved time and raw punch evidence, and keeps roster dates after each employee's termination date.

**What to look for in the result**

- roster rows after termination
- post-termination rows with worked hours or punch counts
- whether the issue is scheduling-only or payroll-supported activity
- whether follow-up belongs with scheduling, payroll, or employee-master cleanup

## Required Student Output

Submit a reproducible analysis file and a short decision memo. Include your release or file version, reporting period, filters, and query filenames. The assessed submission contains:

- **Evidence summary:** Prepare an employee-date exception register with test family, source keys, scheduled or worked hours, approval support, and review status.
- **Accounting or business interpretation:** Explain the expected control and potential payroll or operating consequence for the selected families.
- **Database explanation:** Trace a selected result to roster, raw punch, approved time, absence, or approval support and explain how overlapping results were handled.
- **Management or audit conclusion:** Prioritize supervisor, payroll, or employee-master follow-up, separating a control gap from an unproven monetary impact.

Assessment focuses on a defensible evidence trail, accurate accounting, reproducible comparisons, and a recommendation supported by the evidence. A result with no flagged rows is valid when its scope and criteria are documented.

## Optional Excel Follow-Through

1. Build one roster-punch linkage tab using employee, date, review type, and work center.
2. Add a raw punch integrity tab with punch count, missing clock-out, and invalid timestamp flags.
3. Build one absence conflict tab that compares absence hours, worked hours, and punch count.
4. Add an overtime approval tab that compares recorded overtime to approved overtime.
5. Finish with a post-termination roster tab and a short conclusion on the strongest exception family.

## Wrap-Up Questions

- Accounting/process: Which attendance-control failure creates the clearest payroll or operating risk?
- Database/source evidence: Which source table and employee-date grain would you trace first to defend the finding?
- Analytics judgment: Is the strongest pattern schedule linkage, punch integrity, absence conflict, overtime support, or terminated-employee roster control?
- Escalation/next step: Which issue should move to supervisors, payroll, or formal audit follow-up first?

## Limitations and Judgment

An attendance exception does not establish an overpayment. Quantifying pay impact requires payroll linkage and review of approved time and absence context.

## Next Steps

- Read [Workforce Coverage and Attendance Case](workforce-coverage-and-attendance-case.md) when you want the managerial coverage-pressure view that precedes formal exception testing.
- Read [Payroll](../../processes/payroll.md) when you want the wider business and accounting flow behind attendance and payroll support.
- Read [People and Payroll](../index.md#people-and-payroll) when you want the report-level interpretation of the same control questions.
- Read [People and Payroll queries](../analysis-tracks.md#people-and-payroll) when you want the broader exception and control-review query set.
