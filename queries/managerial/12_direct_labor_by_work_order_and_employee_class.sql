-- Teaching objective: Review direct labor hours and cost by work order, employee title, and pay class.
-- Main tables: LaborTimeEntry, Employee, WorkOrder, Item, PayrollPeriod.
-- Output shape: One row per work order and employee class grouping.
-- Interpretation notes: Only direct-manufacturing labor should tie to work orders in the clean build.

SELECT
    pp.FiscalYear,
    pp.FiscalPeriod,
    wo.WorkOrderNumber,
    i.ItemCode,
    i.ItemName,
    i.ItemGroup,
    e.JobTitle,
    e.PayClass,
    ROUND(SUM(lte.RegularHours), 2) AS RegularHours,
    ROUND(SUM(lte.OvertimeHours), 2) AS OvertimeHours,
    ROUND(SUM(lte.RegularHours + lte.OvertimeHours), 2) AS TotalHours,
    ROUND(AVG(lte.HourlyRateUsed), 2) AS AvgHourlyRate,
    ROUND(SUM(lte.ExtendedLaborCost), 2) AS DirectLaborCost
FROM LaborTimeEntry AS lte
JOIN PayrollPeriod AS pp
    ON pp.PayrollPeriodID = lte.PayrollPeriodID
JOIN Employee AS e
    ON e.EmployeeID = lte.EmployeeID
JOIN WorkOrder AS wo
    ON wo.WorkOrderID = lte.WorkOrderID
JOIN Item AS i
    ON i.ItemID = wo.ItemID
WHERE lte.LaborType = 'Direct Manufacturing'
GROUP BY
    pp.FiscalYear,
    pp.FiscalPeriod,
    wo.WorkOrderNumber,
    i.ItemCode,
    i.ItemName,
    i.ItemGroup,
    e.JobTitle,
    e.PayClass
ORDER BY pp.FiscalYear, pp.FiscalPeriod, wo.WorkOrderNumber, e.JobTitle;
