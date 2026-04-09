-- Teaching objective: Review labor-control exceptions around time posted after work-order close and hourly employees paid without time.
-- Main tables: LaborTimeEntry, WorkOrder, PayrollRegister, PayrollPeriod, Employee.
-- Output shape: One row per potential control issue.
-- Interpretation notes: Direct labor should not be posted after a work order closes. Hourly payroll without time is a useful ghost-payroll screening pattern.

WITH hourly_time_by_period AS (
    SELECT
        PayrollPeriodID,
        EmployeeID,
        ROUND(SUM(RegularHours + OvertimeHours), 2) AS TotalHours
    FROM LaborTimeEntry
    GROUP BY PayrollPeriodID, EmployeeID
),
issues AS (
    SELECT
        'Labor time after work-order close' AS PotentialIssue,
        wo.WorkOrderNumber AS ReferenceNumber,
        CAST(e.EmployeeID AS TEXT) AS EmployeeReference,
        e.EmployeeName,
        date(lte.WorkDate) AS EventDate,
        ROUND(lte.ExtendedLaborCost, 2) AS Amount
    FROM LaborTimeEntry AS lte
    JOIN WorkOrder AS wo
        ON wo.WorkOrderID = lte.WorkOrderID
    JOIN Employee AS e
        ON e.EmployeeID = lte.EmployeeID
    WHERE lte.WorkOrderID IS NOT NULL
      AND wo.ClosedDate IS NOT NULL
      AND julianday(lte.WorkDate) > julianday(wo.ClosedDate)

    UNION ALL

    SELECT
        'Hourly employee paid without time entry in pay period' AS PotentialIssue,
        pp.PeriodNumber AS ReferenceNumber,
        CAST(e.EmployeeID AS TEXT) AS EmployeeReference,
        e.EmployeeName,
        date(pp.PayDate) AS EventDate,
        ROUND(pr.GrossPay, 2) AS Amount
    FROM PayrollRegister AS pr
    JOIN PayrollPeriod AS pp
        ON pp.PayrollPeriodID = pr.PayrollPeriodID
    JOIN Employee AS e
        ON e.EmployeeID = pr.EmployeeID
    LEFT JOIN hourly_time_by_period AS htp
        ON htp.PayrollPeriodID = pr.PayrollPeriodID
       AND htp.EmployeeID = pr.EmployeeID
    WHERE e.PayClass = 'Hourly'
      AND COALESCE(htp.TotalHours, 0) = 0
)
SELECT *
FROM issues
ORDER BY PotentialIssue, EventDate, EmployeeReference;
