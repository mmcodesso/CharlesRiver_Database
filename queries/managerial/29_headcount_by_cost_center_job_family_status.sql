-- Teaching objective: Review workforce composition by cost center, job family, level, and employment status.
-- Main tables: Employee, CostCenter.
-- Expected output shape: One row per cost center, job family, job level, and employment status.
-- Recommended build mode: Either.
-- Interpretation notes: IsActive is the end-of-range current-state flag, while EmploymentStatus and TerminationDate preserve historical workforce context.

SELECT
    cc.CostCenterName,
    e.JobFamily,
    e.JobLevel,
    e.EmploymentStatus,
    COUNT(*) AS Headcount,
    SUM(CASE WHEN e.PayClass = 'Hourly' THEN 1 ELSE 0 END) AS HourlyEmployees,
    SUM(CASE WHEN e.PayClass = 'Salary' THEN 1 ELSE 0 END) AS SalariedEmployees,
    SUM(CASE WHEN e.IsActive = 1 THEN 1 ELSE 0 END) AS ActiveAtRangeEnd,
    ROUND(
        AVG(
            (julianday(COALESCE(e.TerminationDate, '2030-12-31')) - julianday(e.HireDate)) / 365.25
        ),
        2
    ) AS AverageTenureYears
FROM Employee AS e
JOIN CostCenter AS cc
    ON cc.CostCenterID = e.CostCenterID
GROUP BY
    cc.CostCenterName,
    e.JobFamily,
    e.JobLevel,
    e.EmploymentStatus
ORDER BY
    cc.CostCenterName,
    e.JobFamily,
    e.JobLevel,
    e.EmploymentStatus;
