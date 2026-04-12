-- Teaching objective: Trace hourly payroll from raw punch counts through approved time, labor allocation, and gross pay.
-- Main tables: TimeClockPunch, TimeClockEntry, LaborTimeEntry, PayrollRegister, Employee.
-- Expected output shape: One row per hourly employee and payroll period.
-- Recommended build mode: Either.
-- Interpretation notes: Use this bridge to explain how attendance data becomes payable hours and payroll cost.

WITH punch_summary AS (
    SELECT
        tcp.EmployeeID,
        tcp.PayrollPeriodID,
        COUNT(*) AS PunchCount
    FROM TimeClockPunch AS tcp
    GROUP BY
        tcp.EmployeeID,
        tcp.PayrollPeriodID
),
time_summary AS (
    SELECT
        tc.EmployeeID,
        tc.PayrollPeriodID,
        ROUND(SUM(COALESCE(tc.RegularHours, 0) + COALESCE(tc.OvertimeHours, 0)), 2) AS ApprovedClockHours,
        ROUND(SUM(COALESCE(tc.OvertimeHours, 0)), 2) AS ApprovedOvertimeHours
    FROM TimeClockEntry AS tc
    GROUP BY
        tc.EmployeeID,
        tc.PayrollPeriodID
),
labor_summary AS (
    SELECT
        lte.EmployeeID,
        lte.PayrollPeriodID,
        ROUND(SUM(COALESCE(lte.RegularHours, 0) + COALESCE(lte.OvertimeHours, 0)), 2) AS LaborHours,
        ROUND(SUM(COALESCE(lte.ExtendedLaborCost, 0)), 2) AS LaborCost
    FROM LaborTimeEntry AS lte
    GROUP BY
        lte.EmployeeID,
        lte.PayrollPeriodID
),
pay_summary AS (
    SELECT
        pr.EmployeeID,
        pr.PayrollPeriodID,
        ROUND(SUM(COALESCE(pr.GrossPay, 0)), 2) AS GrossPay,
        ROUND(SUM(COALESCE(pr.NetPay, 0)), 2) AS NetPay
    FROM PayrollRegister AS pr
    GROUP BY
        pr.EmployeeID,
        pr.PayrollPeriodID
)
SELECT
    pp.PeriodNumber,
    date(pp.PeriodStartDate) AS PeriodStartDate,
    date(pp.PeriodEndDate) AS PeriodEndDate,
    e.EmployeeNumber,
    e.EmployeeName,
    e.JobTitle,
    e.JobFamily,
    COALESCE(ps.PunchCount, 0) AS PunchCount,
    ROUND(COALESCE(ts.ApprovedClockHours, 0), 2) AS ApprovedClockHours,
    ROUND(COALESCE(ts.ApprovedOvertimeHours, 0), 2) AS ApprovedOvertimeHours,
    ROUND(COALESCE(ls.LaborHours, 0), 2) AS LaborHours,
    ROUND(COALESCE(ls.LaborCost, 0), 2) AS LaborCost,
    ROUND(COALESCE(pay.GrossPay, 0), 2) AS GrossPay,
    ROUND(COALESCE(pay.NetPay, 0), 2) AS NetPay
FROM PayrollRegister AS pr
JOIN PayrollPeriod AS pp
    ON pp.PayrollPeriodID = pr.PayrollPeriodID
JOIN Employee AS e
    ON e.EmployeeID = pr.EmployeeID
LEFT JOIN punch_summary AS ps
    ON ps.EmployeeID = pr.EmployeeID
   AND ps.PayrollPeriodID = pr.PayrollPeriodID
LEFT JOIN time_summary AS ts
    ON ts.EmployeeID = pr.EmployeeID
   AND ts.PayrollPeriodID = pr.PayrollPeriodID
LEFT JOIN labor_summary AS ls
    ON ls.EmployeeID = pr.EmployeeID
   AND ls.PayrollPeriodID = pr.PayrollPeriodID
LEFT JOIN pay_summary AS pay
    ON pay.EmployeeID = pr.EmployeeID
   AND pay.PayrollPeriodID = pr.PayrollPeriodID
WHERE e.PayClass = 'Hourly'
GROUP BY
    pp.PeriodNumber,
    pp.PeriodStartDate,
    pp.PeriodEndDate,
    e.EmployeeNumber,
    e.EmployeeName,
    e.JobTitle,
    e.JobFamily,
    ps.PunchCount,
    ts.ApprovedClockHours,
    ts.ApprovedOvertimeHours,
    ls.LaborHours,
    ls.LaborCost,
    pay.GrossPay,
    pay.NetPay
ORDER BY
    date(pp.PeriodStartDate),
    e.EmployeeNumber;
