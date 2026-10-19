---
title: "6. Explain Staffing, Overtime, and Payroll Cost"
description: "What do staffing plans, approved work, and paid cost actually establish?"
sidebar_label: "6. Explain Staffing, Overtime, and Payroll Cost"
pagination_prev: "analytics/cases/manufacturing-labor-cost-case"
pagination_next: "analytics/cases/financial-statement-bridge-case"
case_number: 6
case_level: Intermediate
case_sessions: 3
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import CaseFigure from "@site/src/components/Cases/Figure";
import CaseMethods from "@site/src/components/Cases/Methods";
import { CaseOverview } from "@site/src/components/CaseExplorer";
import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# 6. Explain Staffing, Overtime, and Payroll Cost

<span id="business-scenario"></span>
<span id="the-problem-to-solve"></span>
<span id="learning-objectives"></span>

The operations planner is considering an overtime response. Payroll asks whether the concern is planned coverage, actual hours, pay calculation, or settlement. You will compare those forms of evidence before recommending a response. Begin by predicting why a work-center workload total might differ from employees’ approved hours even when both are correct.

<CaseOverview slug="workforce-coverage-and-attendance-case" />

**Worked scope.** January 1–28, 2024, using complete payroll periods 1 and 2. Begin with Assembly work center 2, then compare centers and the company-wide period payroll. Payment and remittance dates extend beyond the work window.

Choose Excel or SQL. The site retains your selection between lessons and cases.

**Preparation:** [1. Meet the Records](/docs/learn-and-practice/meet-the-records), [2. Read an Order](/docs/learn-and-practice/read-an-order), [3. Connect the Records](/docs/learn-and-practice/connect-the-records), [10. Follow Hours into Payroll](/docs/learn-and-practice/follow-hours-into-payroll), [12. Turn Records into a Conclusion](/docs/learn-and-practice/turn-records-into-a-conclusion). Use the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) for your chosen tool.

**Ready to begin:**

- Complete your chosen Excel or SQL setup. Preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.
- Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.
- Preserve approved-time detail, distinguish identified from unassigned centers, and keep employee-period pay separate from center workload.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| WorkCenter | T47_WorkCenter | WorkCenterData |
| WorkOrderOperationSchedule | T53_WorkOrderOperationSchedule | WorkOrderOperationScheduleData |
| EmployeeShiftRoster | T63_EmployeeShiftRoster | EmployeeShiftRosterData |
| EmployeeAbsence | T64_EmployeeAbsence | EmployeeAbsenceData |
| TimeClockEntry | T66_TimeClockEntry | TimeClockEntryData |
| PayrollPeriod | T59_PayrollPeriod | PayrollPeriodData |
| PayrollRegister | T69_PayrollRegister | PayrollRegisterData |
| PayrollRegisterLine | T70_PayrollRegisterLine | PayrollRegisterLineData |
| PayrollPayment | T71_PayrollPayment | PayrollPaymentData |
| PayrollLiabilityRemittance | T72_PayrollLiabilityRemittance | PayrollLiabilityRemittanceData |

<CaseMethods />

<span id="step-1-define-payroll-cost-concentration"></span>
<span id="step-2-add-work-location-labor-and-headcount-interpretation"></span>
<span id="step-1-define-staffing-coverage-against-planned-load"></span>
<span id="step-2-compare-rostered-hours-to-approved-worked-hours"></span>

## Session 1 — Compare planned and approved hours

Create Case06.xlsx or Case06.sql. State the grain of each source before joining it. Raw punches, approved time, productive labor allocations, and service time serve different purposes.

<CaseFigure figureId="case06-attendance" />


### 1.1. Build compatible center summaries

**Predict before you run:** Would joining every roster row to every production schedule row give a valid total?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `WorkCenterData ← WorkCenter (import here)`, `EmployeeShiftRosterData ← EmployeeShiftRoster and WorkOrderOperationScheduleData ← WorkOrderOperationSchedule (import here)`, `TimeClockEntryData ← TimeClockEntry (import here)`.

**Produced outputs:** `ApprovedTime: retained approved TimeClockEntryID detail for January 1–28, 2024 / periods 1 and 2`, `RosterByCenter, OperationLoadByCenter, and WorkedByCenter: separate summaries`, `Coverage: identified-center comparisons; null-center summaries retained separately`.

1. Import WorkCenter as WorkCenterData, EmployeeShiftRoster as EmployeeShiftRosterData, WorkOrderOperationSchedule as WorkOrderOperationScheduleData, and TimeClockEntry as TimeClockEntryData.

2. Keep these raw queries unchanged.

3. Reference EmployeeShiftRosterData as RosterByCenter; filter RosterDate January 1–28, 2024 and RosterStatus Scheduled or Reassigned, then group by WorkCenterID, Sum ScheduledHours as RosteredHours.

4. Reference WorkOrderOperationScheduleData as OperationLoadByCenter; filter ScheduleDate to the same dates, then group by WorkCenterID, Sum ScheduledHours as OperationHours.

5. Reference TimeClockEntryData as ApprovedTime; filter WorkDate January 1–28, 2024, PayrollPeriodID 1 or 2, and ClockStatus Approved.

6. Keep ApprovedTime at TimeClockEntryID detail, including EmployeeID, PayrollPeriodID, WorkCenterID, RegularHours, and OvertimeHours for Session 2.

7. Reference ApprovedTime as WorkedByCenter and group by WorkCenterID, Sum RegularHours as RegularHours and Sum OvertimeHours as OvertimeHours.

8. Reference WorkCenterData as Coverage and Left merge RosterByCenter, OperationLoadByCenter, and WorkedByCenter on WorkCenterID; load Coverage.

9. Retain each summary’s null-center row separately for review: the master-center merge cannot display an unassigned location.

10. Keep ApprovedTime available in Power Query; do not group or replace this detail query.

</TabItem>
<TabItem value="sql">

Roster, load, and worked are separate work-center summaries. Their units and inclusion rules remain visible even though they share a center key. The center master retains centers with no activity.

Run each complete statement separately and retain its result before continuing.
```sql title="c06-coverage.sql"
WITH roster AS (SELECT WorkCenterID,
       SUM(ScheduledHours) AS PlannedPresence
FROM EmployeeShiftRoster
WHERE RosterDate BETWEEN '2024-01-01' AND '2024-01-28' AND RosterStatus IN ('Scheduled','Reassigned')
GROUP BY WorkCenterID), load AS (SELECT WorkCenterID,
       SUM(ScheduledHours) AS PlannedLoad
FROM WorkOrderOperationSchedule
WHERE ScheduleDate BETWEEN '2024-01-01' AND '2024-01-28'
GROUP BY WorkCenterID), worked AS (SELECT WorkCenterID,
       SUM(RegularHours) AS Regular,
       SUM(OvertimeHours) AS Overtime
FROM TimeClockEntry
WHERE WorkDate BETWEEN '2024-01-01' AND '2024-01-28' AND PayrollPeriodID IN (1,2) AND ClockStatus='Approved'
GROUP BY WorkCenterID) SELECT c.WorkCenterID,
       c.WorkCenterName,
       ROUND(COALESCE(r.PlannedPresence,0),2) AS RosteredHours,
       ROUND(COALESCE(l.PlannedLoad,0),2) AS OperationHours,
       ROUND(COALESCE(w.Regular,0),2) AS RegularHours,
       ROUND(COALESCE(w.Overtime,0),2) AS OvertimeHours
FROM WorkCenter c
LEFT JOIN roster r ON r.WorkCenterID=c.WorkCenterID
LEFT JOIN load l ON l.WorkCenterID=c.WorkCenterID
LEFT JOIN worked w ON w.WorkCenterID=c.WorkCenterID
ORDER BY c.WorkCenterID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Assembly has 2,033.11 rostered hours, 673.91 operation hours, 1,988.59 approved regular hours, and 177.92 approved overtime hours.

Scheduled operation hours describe production activity, while rostered hours describe people's planned presence. Their difference is not automatically idle time. Employees may perform support work outside the operation schedule.

<details>
<summary>If your result differs</summary>

Do not compute a staffing deficit by subtracting unlike hour measures without a documented labor requirement per operation.

</details>

**Keep for the next stage:** Save Coverage and a short explanation of each denominator.

### 1.2. Inspect absence evidence without forcing a location

**Predict before you run:** Does an absence record always identify a production work center?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `EmployeeAbsenceData ← EmployeeAbsence (import here)`, `EmployeeShiftRosterData (raw query from Session 1.1)`.

**Produced outputs:** `AbsenceDetail: absence rows with roster center evidence`, `AbsenceByCenter: including an Unassigned displayed group`.

1. Import EmployeeAbsence as EmployeeAbsenceData.

2. Reference it as AbsenceDetail, filter AbsenceDate January 1–28, 2024, and merge the raw EmployeeShiftRosterData on EmployeeShiftRosterID to obtain WorkCenterID.

3. Reference AbsenceDetail as AbsenceByCenter; group by WorkCenterID, count EmployeeAbsenceID and sum HoursAbsent.

4. Keep a blank work center as Unassigned in the displayed summary.

5. Do not allocate it across centers.

6. Compare the source roster and approval fields before interpreting the absence.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question and compare the checkpoint before continuing.
```sql title="c06-absence.sql"
SELECT r.WorkCenterID,
       COUNT(*) AS Absences,
       ROUND(SUM(a.HoursAbsent),2) AS AbsentHours
FROM EmployeeAbsence a
JOIN EmployeeShiftRoster r ON r.EmployeeShiftRosterID=a.EmployeeShiftRosterID
WHERE a.AbsenceDate BETWEEN '2024-01-01' AND '2024-01-28'
GROUP BY r.WorkCenterID
ORDER BY r.WorkCenterID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** One selected absence totals 9.10 hours and has no work-center assignment on its linked roster.

This evidence cannot establish an Assembly absence problem. A useful next step is to understand the unassigned record and the coverage definition rather than spreading the absence across centers.

<details>
<summary>If your result differs</summary>

Dropping the blank center makes the absence disappear. Keep missing classification visible.

</details>

**Keep for the next stage:** Save the absence scope note alongside Coverage.

:::tip Session stopping point
Save the coverage and absence summaries. Explain why the hours do not form a simple staffing surplus/deficit equation.
:::

<span id="step-3-test-executive-and-control-owner-role-uniqueness"></span>
<span id="step-4-evaluate-expected-approval-role-families"></span>
<span id="step-3-localize-absence-pressure"></span>
<span id="step-4-evaluate-overtime-as-the-response-mechanism"></span>

## Session 2 — Reconcile employee-period pay

Move from a location view to an employee-period view. One employee’s entire pay must not repeat once for each work center or time entry.

<CaseFigure figureId="case06-grains" />


### 2.1. Build the pay bridge

**Predict before you run:** Will every payroll register have hourly time-clock support?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ApprovedTime (retained detail from Session 1.1)`, `PayrollRegisterData ← PayrollRegister (import here)`.

**Produced outputs:** `HoursByEmployeePeriod: all approved hours, with identified WorkCenters count`, `CentersByEmployeePeriod: distinct nonnull center count`, `UnassignedCenterByEmployeePeriod: separate null-center count and hours`, `SelectedPayroll: periods 1 and 2`, `PayBridge: 209 registers; missing hourly support stays null`.

1. Reference the retained ApprovedTime detail as HoursByEmployeePeriod.

2. Group by EmployeeID and PayrollPeriodID, Sum RegularHours as RegularHours and Sum OvertimeHours as OvertimeHours.

3. Create a separate reference of ApprovedTime named CentersByEmployeePeriod.

4. In this identified-center branch only, filter WorkCenterID to exclude null; keep EmployeeID, PayrollPeriodID, and WorkCenterID, remove duplicate combinations, then group by EmployeeID and PayrollPeriodID and Count Rows as WorkCenters.

5. In another reference of ApprovedTime named UnassignedCenterByEmployeePeriod, retain only null WorkCenterID; group by EmployeeID and PayrollPeriodID, Count Rows as UnassignedTimeEntries, Sum RegularHours as UnassignedRegularHours, and Sum OvertimeHours as UnassignedOvertimeHours.

6. Keep this missing-location evidence separate; do not allocate its hours to identified centers.

7. Left merge CentersByEmployeePeriod into HoursByEmployeePeriod on EmployeeID and PayrollPeriodID and expand WorkCenters.

8. Only in this hours summary, replace a missing WorkCenters count with 0: approved time exists but identifies no center.

9. Import PayrollRegister as PayrollRegisterData and preserve the raw query; reference it as SelectedPayroll and filter periods 1 and 2.

10. Reference SelectedPayroll as PayBridge and Left merge HoursByEmployeePeriod on EmployeeID and PayrollPeriodID, selecting the two keys in that order in both queries.

11. Expand the two hour totals and WorkCenters; load as PayBridge.

12. Keep the 209 register rows and preserve null hours and WorkCenters for registers with no ApprovedTime match; do not invent hours for salaried staff.

13. Load UnassignedCenterByEmployeePeriod separately for review and retain ApprovedTime detail for tracing.

14. Add PayCheck:

    ~~~text title="Excel — PayBridge[PayCheck]"
    =ROUND([@GrossPay]-[@EmployeeWithholdings]-[@NetPay],2)
    ~~~

</TabItem>
<TabItem value="sql">

hours groups by EmployeeID and PayrollPeriodID before joining payroll. A null hours result is retained for a register without approved hourly support. COUNT(DISTINCT WorkCenterID) excludes null centers and records identified location variety without repeating pay across locations. It returns zero for an approved-time employee-period with only null centers. The outer payroll join retains null when there is no approved-time employee-period at all. The Excel route retains missing-center evidence in a separate branch.

Run each complete statement separately and retain its result before continuing.
```sql title="c06-pay.sql"
WITH hours AS (SELECT EmployeeID,
       PayrollPeriodID,
       SUM(RegularHours) AS Regular,
       SUM(OvertimeHours) AS Overtime,
       COUNT(DISTINCT WorkCenterID) AS WorkCenters
FROM TimeClockEntry
WHERE PayrollPeriodID IN(1,2) AND WorkDate BETWEEN '2024-01-01' AND '2024-01-28' AND ClockStatus='Approved'
GROUP BY EmployeeID,PayrollPeriodID) SELECT p.PayrollRegisterID,
       p.EmployeeID,
       p.PayrollPeriodID,
       ROUND(h.Regular,2) AS RegularHours,
       ROUND(h.Overtime,2) AS OvertimeHours,
       h.WorkCenters,
       p.GrossPay,
       p.EmployeeWithholdings,
       p.NetPay,
       p.EmployerPayrollTax,
       p.EmployerBenefits
FROM PayrollRegister p
LEFT JOIN hours h ON h.EmployeeID=p.EmployeeID AND h.PayrollPeriodID=p.PayrollPeriodID
WHERE p.PayrollPeriodID IN (1,2)
ORDER BY p.EmployeeID,p.PayrollPeriodID;
```


```sql title="c06-pay-summary.sql"
SELECT PayrollPeriodID,
       COUNT(*) AS Registers,
       ROUND(SUM(GrossPay),2) AS GrossPay,
       ROUND(SUM(EmployeeWithholdings),2) AS Withholdings,
       ROUND(SUM(NetPay),2) AS NetPay,
       ROUND(SUM(EmployerPayrollTax),2) AS EmployerTax,
       ROUND(SUM(EmployerBenefits),2) AS Benefits
FROM PayrollRegister
WHERE PayrollPeriodID IN(1,2)
GROUP BY PayrollPeriodID
ORDER BY PayrollPeriodID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 209 registers: 104 in period 1 and 105 in period 2. Period 1 gross pay is 125,541.19 and net pay 104,320.59. Period 2 gross pay is 265,084.43 and net pay 220,069.69. Each header’s gross less withholdings equals net.

The periods differ materially in gross pay. Before calling that an overtime effect, inspect employee populations, hours, pay types, and the first period’s support. Company payroll includes more than Assembly. WorkCenters counts identified centers only. A zero means approved time with no identified center, while a null after the payroll join means no approved hourly support in this scope. Keep both categories separate from identified work centers. Complete the [Lesson 10 summary checkpoint](../../learn-and-practice/follow-hours-into-payroll.md#4-compare-summary-recognition-with-detailed-payment) for a separate period/cost-center population before interpreting ledger payroll. Aggregate the register facts and ledger account independently. A PayrollSummary source ID is not PayrollRegisterID.

<details>
<summary>If your result differs</summary>

Do not join payroll headers to raw clock rows. A register repeated ten times would make pay appear ten times too large.

</details>

**Keep for the next stage:** Save PayBridge and the two period totals.

### 2.2. Inspect one Assembly employee’s calculation

**Predict before you run:** Can you explain gross pay before discussing employer cost?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `PayBridge (Session 2.1)`, `PayrollRegisterLineData ← PayrollRegisterLine (import here; raw query retained)`.

**Produced outputs:** `EmployeePayLines: register 121 only`, `EmployeePayCalculation: LineType PivotTable`, `PayBridge: RecordedEmployerCost column`.

1. Filter PayBridge to EmployeeID 17, period 2, register 121.

2. Import PayrollRegisterLine as PayrollRegisterLineData and preserve the raw query.

3. Reference it as EmployeePayLines and filter PayrollRegisterID 121; load EmployeePayLines.

4. Insert a PivotTable with LineType in Rows and sums of Hours and Amount in Values.

5. Compare regular and overtime earnings to GrossPay and tax/benefit deductions to EmployeeWithholdings.

6. Add RecordedEmployerCost to PayBridge:

    ~~~text title="Excel — PayBridge[RecordedEmployerCost]"
    =[@GrossPay]+[@EmployerPayrollTax]+[@EmployerBenefits]
    ~~~

7. Keep deductions and employer costs separate.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question and compare the checkpoint before continuing.
```sql title="c06-employee-lines.sql"
SELECT LineType,
       ROUND(SUM(COALESCE(Hours,0)),2) AS Hours,
       ROUND(SUM(Amount),2) AS Amount
FROM PayrollRegisterLine
WHERE PayrollRegisterID=121
GROUP BY LineType
ORDER BY LineType;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Employee 17 has 74.48 regular hours and 4.93 overtime hours, gross pay 2,320.35, employee withholdings 348.72, and net pay 1,971.63. Employer tax 177.51 and benefits 157.50 bring the selected employer cost to 2,655.36.

Employee deductions reduce the employee's cash payment, while employer costs add to company cost. Apply the manufacturing recognition rules before labeling those costs as period expense. Neither should be confused with a manufacturing labor allocation or a design time-cost snapshot.

<details>
<summary>If your result differs</summary>

Pay is rounded at the earning-line level. Use recorded line amounts before assuming a tiny difference from hours times a displayed rate is an error.

</details>

**Keep for the next stage:** Save the employee reconciliation and a definition of the selected employer-cost measure.

:::tip Session stopping point
Retain the employee example and full period summary. State why neither assigns all employee cost to every center where the person worked.
:::

<span id="step-5-finish-with-approval-concentration-by-organization-position"></span>
<span id="step-5-translate-attendance-drift-into-management-follow-up"></span>

## Session 3 — Separate settlement and recommend action

Paying employees leaves obligations to tax agencies and benefit providers. Examine both branches, then return to the staffing question.

<CaseFigure figureId="case06-pay" />


### 3.1. Check employee payment completeness

**Predict before you run:** Does an approved register prove the employee was paid?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `SelectedPayroll (Session 2.1)`, `PayrollPaymentData ← PayrollPayment (import here)`.

**Produced outputs:** `PaymentSchedule: payment-date / period totals`, `UnpaidRegisters: unmatched register evidence`.

1. Import PayrollPayment as PayrollPaymentData and preserve the raw query.

2. Reference it as PaymentSchedule and merge to SelectedPayroll on PayrollRegisterID, expand PayrollPeriodID and NetPay, then group by PayrollPeriodID and PaymentDate with count and sum NetPay.

3. Separately reference SelectedPayroll as UnpaidRegisters, Left outer merge to PayrollPaymentData, and filter the expanded PayrollPaymentID to null; retain the unmatched register.

4. Do not replace a missing payment with a cleared date from another register.

</TabItem>
<TabItem value="sql">

LEFT JOIN retains the payroll registers, with a null PayrollPaymentID identifying unmatched payment evidence. This is a test of records in the file, not proof of what happened outside it.

Run each complete statement separately and retain its result before continuing.
```sql title="c06-payments.sql"
SELECT p.PayrollPeriodID,
       x.PaymentDate,
       COUNT(*) AS Payments,
       ROUND(SUM(p.NetPay),2) AS NetPayPaid
FROM PayrollPayment x
JOIN PayrollRegister p ON p.PayrollRegisterID=x.PayrollRegisterID
WHERE p.PayrollPeriodID IN(1,2)
GROUP BY p.PayrollPeriodID,x.PaymentDate
ORDER BY p.PayrollPeriodID,x.PaymentDate;
```


```sql title="c06-unpaid.sql"
SELECT p.PayrollRegisterID,
       p.EmployeeID,
       p.PayrollPeriodID,
       p.NetPay
FROM PayrollRegister p
LEFT JOIN PayrollPayment x ON x.PayrollRegisterID=p.PayrollRegisterID
WHERE p.PayrollPeriodID IN(1,2) AND x.PayrollPaymentID IS NULL
ORDER BY p.PayrollPeriodID,p.PayrollRegisterID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Period 1 has 103 payment records covering 96,349.49 of net pay. Register 1, employee 1, has no payment row and net pay 7,971.10. Period 2 has 105 payments totaling 220,069.69 on February 2.

The missing payment link is a follow-up item, not proof of nonpayment outside the dataset. One period-1 payment is dated January 18, which also deserves comparison with its approval evidence if the review extends to payment authorization.

<details>
<summary>If your result differs</summary>

Compare distinct register IDs as well as money. Zero-pay registers can have payment records and should not be silently removed.

</details>

**Keep for the next stage:** Save the payment schedule and one unresolved-payment workpaper.

### 3.2. Reconcile remittances by liability type

**Predict before you run:** Why does the tax remittance differ from total employee withholdings?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `PayrollRegisterLineData (raw query retained in Session 2.2)`, `SelectedPayroll (Session 2.1)`, `PayrollLiabilityRemittanceData ← PayrollLiabilityRemittance (import here)`.

**Produced outputs:** `LiabilityTotals: period / LineType amounts`, `Remittances: two-period liability settlement records`, `Review: matched liability-type reconciliations`.

1. Reference the raw PayrollRegisterLineData as LiabilityTotals and merge SelectedPayroll to restrict periods 1 and 2.

2. Filter LineType to Employee Tax Withholding, Benefits Deduction, Employer Payroll Tax, and Employer Benefits.

3. Group by PayrollPeriodID and LineType, summing Amount into a column named Amount; load as LiabilityTotals.

4. Import PayrollLiabilityRemittance as PayrollLiabilityRemittanceData.

5. Reference it as Remittances, filter the two periods, and keep RemittanceDate.

6. On Review enter payroll period 1 in B12.

7. Label B13 Employee tax, B14 Employer tax, and B15 Combined benefits.

8. Enter the following formula in each labeled cell:

    ~~~text title="Excel — Review!B13"
    =SUMIFS(LiabilityTotals[Amount],LiabilityTotals[PayrollPeriodID],$B$12,LiabilityTotals[LineType],"Employee Tax Withholding")
    ~~~

    ~~~text title="Excel — Review!B14"
    =SUMIFS(LiabilityTotals[Amount],LiabilityTotals[PayrollPeriodID],$B$12,LiabilityTotals[LineType],"Employer Payroll Tax")
    ~~~

    ~~~text title="Excel — Review!B15"
    =SUMIFS(LiabilityTotals[Amount],LiabilityTotals[PayrollPeriodID],$B$12,LiabilityTotals[LineType],"Benefits Deduction")+SUMIFS(LiabilityTotals[Amount],LiabilityTotals[PayrollPeriodID],$B$12,LiabilityTotals[LineType],"Employer Benefits")
    ~~~

9. Compare each result with the corresponding remittance.

10. Retain the period 1 results, change B12 to 2, and repeat.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question and compare the checkpoint before continuing.
```sql title="c06-deductions.sql"
SELECT p.PayrollPeriodID,
       l.LineType,
       ROUND(SUM(l.Amount),2) AS Amount
FROM PayrollRegisterLine l
JOIN PayrollRegister p ON p.PayrollRegisterID=l.PayrollRegisterID
WHERE p.PayrollPeriodID IN(1,2) AND l.LineType IN('Employee Tax Withholding','Benefits Deduction','Employer Payroll Tax','Employer Benefits')
GROUP BY p.PayrollPeriodID,l.LineType
ORDER BY p.PayrollPeriodID,l.LineType;
```


```sql title="c06-remittances.sql"
SELECT PayrollPeriodID,
       LiabilityType,
       RemittanceDate,
       Amount
FROM PayrollLiabilityRemittance
WHERE PayrollPeriodID IN(1,2)
ORDER BY PayrollPeriodID,RemittanceDate,PayrollLiabilityRemittanceID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Period 1 remits 16,841.58 employee tax, 9,603.91 employer tax, and 11,852.88 benefits/other deductions. The last amount equals 4,379.02 employee benefits deductions plus 7,473.86 employer benefits. Remittance dates are January 26, 29, and 31.

These are period-wide obligations. Do not assign the whole remittance to employee 17 or to Assembly. Payment date and remittance date answer different settlement questions.

<details>
<summary>If your result differs</summary>

Total EmployeeWithholdings includes more than tax. Match liability categories before declaring a difference.

</details>

**Keep for the next stage:** Save the two-period liability reconciliation.

### 3.3. Recommend a staffing follow-up

**Predict before you run:** Which evidence supports a staffing change, and which supports a payroll control follow-up?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Coverage, PayBridge, PaymentSchedule, UnpaidRegisters, and Remittances (earlier stages)`.

**Produced outputs:** `Review: separate operating/payroll follow-ups and chart`.

1. Create Review with separate columns for coverage evidence, employee-period cost, payment exceptions, and liability settlement.

2. Chart approved regular and overtime hours by work center from Coverage.

3. Write one operational recommendation and one payroll follow-up, each with a responsible role and evidence needed to resolve uncertainty.

</TabItem>
<TabItem value="sql">

Use the saved result tables from the preceding stages to construct this comparison and written interpretation. Retain the query names, filters, source keys, and amounts in your case notes. An ordered result table can communicate the comparison without making a chart or switching tools.

</TabItem>
</ToolSteps>

**Checkpoint.** Assembly overtime is visible, but the aggregate workload comparison does not prove understaffing. The missing period-1 payment record is a separate accounting follow-up.

A proportionate recommendation is to inspect Assembly’s daily demand and support work before changing roster levels, while payroll verifies register 1’s payment evidence. Keep the two decisions separate.

<details>
<summary>If your result differs</summary>

Avoid explaining all company payroll growth through one center’s overtime.

</details>

**Keep for the next stage:** Save a 400–500 word recommendation and the chart.

:::tip Session stopping point
Save the coverage analysis, pay bridge, employee example, and two settlement schedules. The recommendation should keep operational and accounting responsibilities distinct.
:::

<CaseFigure figureId="case06-settlement" />

<span id="required-student-output"></span>
<span id="wrap-up-questions"></span>
<span id="limitations-and-judgment"></span>

## Prepare the Decision

The worked investigation supports a targeted staffing review and a separate payment-evidence follow-up. It does not establish a direct conversion from operation hours to required headcount. The pay and remittance reconciliations show why employee deductions, employer costs, employee cash, and provider cash must remain separate.

**Deliverable:** A coverage comparison, employee-period pay reconciliation, settlement schedule, and staffing recommendation. Include the source file, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A clearly ordered SQL result table can support the conclusion, with a chart added if useful.

## Independent Challenge

Repeat for payroll periods 3 and 4 using their complete work-date windows. Compare Assembly with another center, reconcile one employee-period, and identify the strongest supported action.

<details>
<summary>Planning hint</summary>

Read the period start/end dates first. Rebuild employee-period summaries and examine unmatched payment rows before deciding whether the earlier exceptions recur.

</details>

**Assessment criteria:** Assess compatible grains, approved-hour filters, unique payroll headers, deduction classification, separate settlement branches, and evidence limits in the recommendation. Your instructor evaluates the method, evidence, and reasoning. Model answers for this challenge remain in private course materials.

<details>
<summary>Further queries and earlier case topics</summary>

<span id="optional-excel-follow-through"></span>

## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. These optional references extend the complete guided routes above. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["workforce-coverage-and-attendance-case"]} helperText="Choose a reference after completing the guided investigation and verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Explain Profit, Cash, and the Year-End Close](financial-statement-bridge-case.md). Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
