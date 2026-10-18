---
title: "10. Follow Hours into Payroll"
description: "Reconcile approved hours and net pay while distinguishing employee payment from period-wide remittances."
sidebar_label: "10. Follow Hours into Payroll"
pagination_prev: "learn-and-practice/manufacturing-cost-flow"
pagination_next: "learn-and-practice/follow-an-estimate-into-settlement"
tutorial_number: 10
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 10. Follow Hours into Payroll

<span id="context-and-problem"></span>

Payroll staff have approved an hourly employee's work for a pay period. The controller needs to explain both the employee's payment and the obligations paid to other organizations. Follow employee **109** through period **1**, keeping the employee and company-wide views separate.

<span id="learning-objectives"></span>

**Your task:** Reconcile approved hours and net pay while distinguishing employee payment from period-wide remittances.

<TutorialFigure figureId="follow-hours-into-payroll" />

## Before You Start

Read [Payroll](../processes/payroll.md).

<ToolSteps>
<TabItem value="excel">

In `Lesson10.xlsx`, import `T59_PayrollPeriod` as `PeriodData` filtered to ID 1; `T66_TimeClockEntry` as `TimeData` filtered to EmployeeID 109 and PayrollPeriodID 1; `T69_PayrollRegister` as `RegisterData` with the same two filters; `T71_PayrollPayment` as `PayData` filtered to PayrollRegisterID 96; and `T72_PayrollLiabilityRemittance` as `RemittanceData` filtered to PayrollPeriodID 1.

</TabItem>
<TabItem value="sql">

Open the released SQLite database in your SQL tool. Save this lesson's statements as **Lesson10.sql**. Run each supplied query separately; its filters identify the records and dates for that step.

</TabItem>
</ToolSteps>


These are actual synthetic records from release **v2027.1**, separate from the illustrative customer project in the company story. Use your assigned release when an instructor specifies another file; its results may differ.

<span id="evidence-workflow"></span>

## 1. Establish the Period and Approved Hours

Raw clock punches are observations. This lesson starts from approved time entries, which provide the hours used by payroll.

<ToolSteps>
<TabItem value="excel">

Read the period's start and end dates in `PeriodData`. Filter `TimeData[ClockStatus]` to **Approved**. On Notes label B2 Approved time rows, B3 Regular hours, and B4 Overtime hours. Enter:

```text title="Excel — Notes!B2"
=SUBTOTAL(103,TimeData[TimeClockEntryID])
```



```text title="Excel — Notes!B3"
=SUBTOTAL(109,TimeData[RegularHours])
```



```text title="Excel — Notes!B4"
=SUBTOTAL(109,TimeData[OvertimeHours])
```

 Retain both EmployeeID and PayrollPeriodID in your notes.

</TabItem>
<TabItem value="sql">

The period query establishes the date boundary. The time query specifies the employee, period, and approval status.

```sql title="l10-period.sql"
SELECT PayrollPeriodID, PeriodStartDate, PeriodEndDate, PayDate
FROM PayrollPeriod
WHERE PayrollPeriodID = 1;
```


```sql title="l10-approved-hours.sql"
SELECT COUNT(*) AS ApprovedEntries,
       ROUND(SUM(RegularHours), 2) AS RegularHours,
       ROUND(SUM(OvertimeHours), 2) AS OvertimeHours
FROM TimeClockEntry
WHERE EmployeeID = 109 AND PayrollPeriodID = 1
  AND ClockStatus = 'Approved';
```


</TabItem>
</ToolSteps>

Period 1 covers **2024-01-01 through 2024-01-14**, with pay date **January 19**. The employee has **10 approved entries**, **79.44 regular hours**, and **0.09 overtime hours**. These are approved payroll hours, not a new calculation from raw punches.

## 2. Reconcile Gross and Net Pay

Gross pay is reduced by employee withholdings to arrive at net pay. Employer payroll tax and benefits are additional employer costs, not additional deductions from this net pay.

<ToolSteps>
<TabItem value="excel">

Read the single `RegisterData` row. On Notes label B6 Employee net pay and enter:

```text title="Excel — Notes!B6"
=SUM(RegisterData[GrossPay])-SUM(RegisterData[EmployeeWithholdings])
```

Label B7 Net pay difference and compare with the recorded net pay:

```text title="Excel — Notes!B7"
=ROUND(B6-SUM(RegisterData[NetPay]),2)
```

Label B8 Recorded employer cost components and enter:

```text title="Excel — Notes!B8"
=SUM(RegisterData[GrossPay])+SUM(RegisterData[EmployerPayrollTax])+SUM(RegisterData[EmployerBenefits])
```



</TabItem>
<TabItem value="sql">

Read the stored payroll result before trying to reconstruct earnings from hours. Detailed earnings and deduction lines would be needed for a fuller pay calculation.

```sql title="l10-register.sql"
SELECT PayrollRegisterID, EmployeeID, PayrollPeriodID,
       GrossPay, EmployeeWithholdings, NetPay,
       EmployerPayrollTax, EmployerBenefits,
       ROUND(GrossPay - EmployeeWithholdings - NetPay, 2) AS NetPayCheck
FROM PayrollRegister
WHERE EmployeeID = 109 AND PayrollPeriodID = 1;
```


</TabItem>
</ToolSteps>

Register **96** shows **1,902.64** gross − **324.30** employee withholdings = **1,578.34** net. The check is **0.00**. Employer payroll tax **145.55** and benefits **92.32** bring the selected recorded employer cost components to **2,140.51**.

## 3. Separate the Two Settlement Branches

Paying the employee settles net pay. Remittances settle other payroll liabilities across the pay period. Their grain is not one employee.

<ToolSteps>
<TabItem value="excel">

Read the payment date in `PayData`. Then inspect the three `RemittanceData` rows, their liability types, dates, and amounts. Do not merge each period-level remittance into the employee's register and call it that employee's cost. Record them in a separate section labeled **Whole period, all employees**.

</TabItem>
<TabItem value="sql">

Run the payment and remittance queries separately. The payment links to one register; the remittances link to the entire period.

```sql title="l10-employee-payment.sql"
SELECT PayrollPaymentID, PayrollRegisterID, PaymentDate, ClearedDate
FROM PayrollPayment
WHERE PayrollRegisterID = 96
ORDER BY PaymentDate, PayrollPaymentID;
```


```sql title="l10-period-remittances.sql"
SELECT PayrollLiabilityRemittanceID, LiabilityType, RemittanceDate, Amount
FROM PayrollLiabilityRemittance
WHERE PayrollPeriodID = 1
ORDER BY RemittanceDate, PayrollLiabilityRemittanceID;
```


</TabItem>
</ToolSteps>

Employee payment **96** is dated **January 19**. Period-wide remittances occur on **January 26**, **29**, and **31**, for **16,841.58**, **9,603.91**, and **11,852.88** respectively. The employee can have been paid while other payroll obligations remain unsettled.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the approved-hours check, gross-to-net reconciliation, employee-payment date, and separately labeled period-remittance schedule. Record the release, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

Approved attendance, production labor allocation, and service time have different purposes. Do not add them as if they were independent payroll hours. In ledger tracing, `PayrollSummary` is a source-type label for payroll postings; it is not a table to import. The [Posting Reference](../reference/posting.md) explains that mapping.

## Try One Change

Describe the selected payroll settlements as of **2024-01-20**, using the recorded payment and remittance dates.

<details>
<summary>Compare your reasoning</summary>

The employee payment is recorded on January 19, but none of the three period-wide remittances is recorded by January 20. The employee payment clears the bank later, on January 22. State which date and event your conclusion uses.

</details>

## Next Steps

Some period-end expenses also depend on estimates. Next, follow the controller's accrual into later supplier evidence. Continue to [Follow an Estimate into Settlement](follow-an-estimate-into-settlement.md).
