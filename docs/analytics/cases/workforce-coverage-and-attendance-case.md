---
title: Workforce Coverage and Attendance Case
description: Inquiry-led walkthrough for staffing coverage, approved worked hours, absence concentration, overtime response, and attendance drift.
sidebar_label: Workforce Coverage Case
---

import { QueryReference } from "@site/src/components/QueryReference";
import { CaseOverview } from "@site/src/components/CaseExplorer";

# Workforce Coverage and Attendance Case

<CaseOverview slug="workforce-coverage-and-attendance-case" />

## Business Scenario

**Illustrative teaching scenario.** Select actual records from your assigned release to investigate this request; the scenario does not identify a particular published transaction or prescribe a finding.

Operations leaders can see production pressure building across several work centers. Scheduled load remains high, but coverage is uneven from one team and shift to the next. Some areas appear fully staffed on the roster, yet approved worked hours still fall short once absences, late arrivals, and early departures are included.

Supervisors respond with reassigned shifts and overtime, but those actions do not answer the core management question. Leaders still need to know whether workforce pressure comes from weak initial coverage, concentrated absence, recurring attendance drift, or a chronic dependence on overtime to hold throughput together.

This case treats attendance as an operating signal first. The goal is to explain coverage pressure and management response before moving into the separate audit case for formal exception testing.

## The Problem to Solve

You need to prove where planned load outpaces rostered coverage, where approved worked hours recover that gap, and where absence or attendance drift keeps work centers under pressure. You also need to show whether overtime stabilizes operations or only hides recurring staffing weakness.

## Learning Objectives

- Compare planned work-center load with rostered and approved worked hours.
- Evaluate absence, overtime, and attendance drift without double counting employee-days.
- Separate managerial coverage pressure from exceptions needing formal control testing.

## Key Data Sources

- Source documents: Work-center plan, shift roster, approved time entry, absence record, overtime approval, and shift definition.
- Evidence grain: Align planning, work-center, shift, and employee-date summaries before interpreting coverage or overtime rates.
- Main tables: `EmployeeShiftRoster`, `WorkOrderOperationSchedule`, `TimeClockEntry`, `EmployeeAbsence`, `OvertimeApproval`, `ShiftDefinition`, `WorkCenter`, `Employee`
- Related guides: [People and Payroll](../index.md#people-and-payroll)
- Related process pages: [Payroll Process](../../processes/payroll.md), [Manufacturing Process](../../processes/manufacturing.md)
- Supporting references: [Schema Reference](../../reference/schema.md), [Dataset Guide](../../start-here/dataset-overview.md)
- This case diagnoses staffing coverage and attendance pressure rather than formal punch or approval exceptions. Use the audit case for exception testing and the workforce-cost case for payroll-cost interpretation.

## Recommended Query Sequence

### Step 1. Define staffing coverage against planned load

Start with the operational demand side. Before you interpret absences or overtime, you need to know where planned work already exceeds planned people coverage.

**What we are trying to achieve**

Measure the daily gap between scheduled work-center load and rostered staffing hours.

**Why this step changes the diagnosis**

Coverage pressure starts here. If planned load already exceeds rostered hours, later worked-hour and overtime results become easier to interpret.

**Suggested query**

<QueryReference
  queryKey="managerial/36_staffing_coverage_vs_work_center_planned_load.sql"
  helperText="Use this first to identify work centers where planned load exceeds rostered hours."
/>

**What this query does**

It compares daily work-center planned load from operation schedules to daily rostered hours from employee rosters and calculates the coverage gap.

**How it works**

The query aggregates `EmployeeShiftRoster` by work center and date, aggregates `WorkOrderOperationSchedule` on the same grain, and then joins the two results so both over-covered and under-covered days remain visible.

**What to look for in the result**

- work centers with repeated negative coverage gaps
- days where rostered employees look adequate in count but hours still fall short
- whether coverage gaps cluster in specific months or centers
- where the production story already signals staffing strain before attendance issues are added

### Step 2. Compare rostered hours to approved worked hours

Once the planned gap is clear, move to the execution question. A rostered day does not guarantee equivalent worked hours.

**What we are trying to achieve**

Compare planned rostered hours with approved worked hours by work center and shift.

**Why this step changes the diagnosis**

Rostered coverage and worked coverage answer different questions. The first shows staffing intent. The second shows the hours operations actually received.

**Suggested query**

<QueryReference
  queryKey="managerial/37_rostered_vs_worked_hours_by_work_center_shift.sql"
  helperText="Use this to compare rostered hours, approved worked hours, and overtime by shift."
/>

**What this query does**

It summarizes rostered hours, approved worked hours, and overtime hours by month, work center, and shift.

**How it works**

The query builds one aggregate from `EmployeeShiftRoster` and another from `TimeClockEntry`, aligns them on month, work center, and shift, and then calculates the variance between planned and worked time.

**What to look for in the result**

- shifts where approved worked hours consistently trail rostered hours
- areas where overtime fills part of the shortfall
- shifts that appear fully rostered but still underperform on worked hours
- whether coverage pressure concentrates on one shift pattern

### Step 3. Localize absence pressure

After you understand the coverage gap, isolate the workforce groups driving attendance pressure.

**What we are trying to achieve**

Identify where absence hours concentrate across work locations and job families.

**Why this step changes the diagnosis**

Managers cannot act on a generic absence rate. They need to know which parts of the workforce create the pressure.

**Suggested query**

<QueryReference
  queryKey="managerial/38_absence_rate_by_work_location_job_family_month.sql"
  helperText="Use this to localize absence pressure by month, location, and job family."
/>

**What this query does**

It measures rostered hours, absence hours, and absence rates by month, work location, and job family.

**How it works**

The query aggregates rostered hours from `EmployeeShiftRoster`, aggregates absence hours from `EmployeeAbsence`, joins both sets through `Employee`, and calculates paid and unpaid absence patterns on the same workforce grouping.

**What to look for in the result**

- locations with the highest absence rates
- job families with unusual absence concentration
- whether paid and unpaid absence patterns differ materially
- where absence pressure is strong enough to help explain the coverage gaps from the earlier steps

### Step 4. Evaluate overtime as the response mechanism

Now assess how operations responded once staffing pressure appeared.

**What we are trying to achieve**

Show where overtime concentrates and whether it functions as occasional support or recurring dependency.

**Why this step changes the diagnosis**

Overtime can protect throughput in the short term. It also signals that the staffing model may already be under strain.

**Suggested query**

<QueryReference
  queryKey="managerial/39_overtime_approval_coverage_and_concentration.sql"
  helperText="Use this to measure overtime concentration and approval coverage by work center."
/>

**What this query does**

It summarizes overtime hours, approved overtime hours, and approval coverage metrics by month and work center.

**How it works**

The query starts from `TimeClockEntry`, groups overtime activity by month and work center, joins `OvertimeApproval`, and then calculates how much recorded overtime carried supporting approval.

**What to look for in the result**

- work centers with repeated overtime concentration
- months where overtime grows while coverage gaps remain negative
- whether approval coverage stays high even when overtime volume rises
- where overtime looks like a sustained operating response rather than a short-term fix

### Step 5. Translate attendance drift into management follow-up

Finish by measuring the smaller attendance patterns that reduce available time even when staffing and overtime look reasonable on the surface.

**What we are trying to achieve**

Identify shifts and departments where late arrivals or early departures reduce actual available labor time.

**Why this step changes the diagnosis**

This is the last management step before a formal control review. Attendance drift is an operating signal. The audit case handles the exception-testing follow-through.

**Suggested query**

<QueryReference
  queryKey="managerial/41_late_arrival_early_departure_by_shift_department.sql"
  helperText="Use this to measure attendance drift by month, shift, and department."
/>

**What this query does**

It measures minutes late, minutes of early departure, and the number of affected rostered days by month, department, and shift.

**How it works**

The query compares scheduled start and end times from `EmployeeShiftRoster` to approved clock-in and clock-out times from `TimeClockEntry`, then rolls those differences up through `ShiftDefinition`.

**What to look for in the result**

- shifts with repeated late-start patterns
- departments losing significant time to early departures
- whether attendance drift appears in the same areas that already show coverage or overtime strain
- which area should move next into [Attendance Control Audit Case](attendance-control-audit-case.md) for formal exception review

## Required Student Output

Submit a reproducible analysis file and a short decision memo. Include your release or file version, reporting period, filters, and query filenames. The assessed submission contains:

- **Evidence summary:** Prepare a staffing-pressure schedule connecting load, rostered hours, worked hours, absence, overtime, and attendance drift for a stated scope.
- **Accounting or business interpretation:** Explain whether the evidence suggests coverage shortfall, attendance pressure, overtime response, or a mixture, without assuming causation.
- **Database explanation:** Show grain, denominator, and period alignment, including how multiple roster or time rows were handled.
- **Management or audit conclusion:** Recommend an operational response and identify any unresolved issue for the attendance-control audit case.

Assessment focuses on a defensible evidence trail, accurate accounting, reproducible comparisons, and a recommendation supported by the evidence. A result with no flagged rows is valid when its scope and criteria are documented.

## Optional Excel Follow-Through

1. Build one coverage pivot by month and work center for planned load, rostered hours, and coverage gap.
2. Add a worked-hours tab that compares rostered hours, approved worked hours, and overtime by shift.
3. Build one absence pivot by work location and job family.
4. Add a narrower overtime-response tab by work center and month.
5. Finish with a shift or department tab for late-arrival and early-departure minutes, then name the first management follow-up.

## Wrap-Up Questions

- Accounting/process: Which staffing or attendance pressure best explains the coverage gap?
- Database/source evidence: Which work-center, roster, worked-hour, absence, overtime, or shift grain supports the diagnosis?
- Analytics judgment: Where does overtime look like a temporary response versus recurring dependency?
- Escalation/next step: Should the next action sit with planners, supervisors, or the attendance-control audit case?

## Limitations and Judgment

Planned load, rostered coverage, and approved time are different measures. A gap does not establish individual productivity or prove an attendance-control violation.

## Next Steps

- Use [Attendance Control Audit Case](attendance-control-audit-case.md) when you want to test punch, approval, and absence exceptions formally.
- Use [Payroll Process](../../processes/payroll.md) when you want the broader support-to-payroll flow behind approved hours and overtime.
- Use [Workforce Cost and Org-Control Case](workforce-cost-and-org-control-case.md) when you want to connect workforce structure to payroll cost and approval design.
- Use [People and Payroll](../index.md#people-and-payroll) when you want reports on staffing, attendance, payroll, and time controls.
