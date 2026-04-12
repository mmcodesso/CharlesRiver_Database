-- Teaching objective: Measure absence rates by month, work location, and job family.
-- Main tables: EmployeeAbsence, EmployeeShiftRoster, Employee.
-- Expected output shape: One row per month, work location, and job family with absence hours, rostered hours, and absence rate.
-- Recommended build mode: Either.
-- Interpretation notes: Use this to compare attendance pressure across workforce groups and to distinguish paid from unpaid absence patterns.

WITH rostered AS (
    SELECT
        strftime('%Y-%m', esr.RosterDate) AS YearMonth,
        COALESCE(e.WorkLocation, '(No Work Location)') AS WorkLocation,
        COALESCE(e.JobFamily, '(No Job Family)') AS JobFamily,
        ROUND(SUM(CASE WHEN esr.RosterStatus IN ('Scheduled', 'Reassigned', 'Absent') THEN COALESCE(esr.ScheduledHours, 0) ELSE 0 END), 2) AS RosteredHours
    FROM EmployeeShiftRoster AS esr
    JOIN Employee AS e
        ON e.EmployeeID = esr.EmployeeID
    GROUP BY
        strftime('%Y-%m', esr.RosterDate),
        COALESCE(e.WorkLocation, '(No Work Location)'),
        COALESCE(e.JobFamily, '(No Job Family)')
),
absent AS (
    SELECT
        strftime('%Y-%m', ea.AbsenceDate) AS YearMonth,
        COALESCE(e.WorkLocation, '(No Work Location)') AS WorkLocation,
        COALESCE(e.JobFamily, '(No Job Family)') AS JobFamily,
        ROUND(SUM(COALESCE(ea.HoursAbsent, 0)), 2) AS HoursAbsent,
        ROUND(SUM(CASE WHEN ea.IsPaid = 1 THEN COALESCE(ea.HoursAbsent, 0) ELSE 0 END), 2) AS PaidAbsenceHours,
        ROUND(SUM(CASE WHEN ea.IsPaid = 0 THEN COALESCE(ea.HoursAbsent, 0) ELSE 0 END), 2) AS UnpaidAbsenceHours
    FROM EmployeeAbsence AS ea
    JOIN Employee AS e
        ON e.EmployeeID = ea.EmployeeID
    GROUP BY
        strftime('%Y-%m', ea.AbsenceDate),
        COALESCE(e.WorkLocation, '(No Work Location)'),
        COALESCE(e.JobFamily, '(No Job Family)')
)
SELECT
    r.YearMonth,
    r.WorkLocation,
    r.JobFamily,
    ROUND(r.RosteredHours, 2) AS RosteredHours,
    ROUND(COALESCE(a.HoursAbsent, 0), 2) AS HoursAbsent,
    ROUND(COALESCE(a.PaidAbsenceHours, 0), 2) AS PaidAbsenceHours,
    ROUND(COALESCE(a.UnpaidAbsenceHours, 0), 2) AS UnpaidAbsenceHours,
    CASE
        WHEN r.RosteredHours = 0 THEN 0
        ELSE ROUND(COALESCE(a.HoursAbsent, 0) / r.RosteredHours, 4)
    END AS AbsenceRate
FROM rostered AS r
LEFT JOIN absent AS a
    ON a.YearMonth = r.YearMonth
   AND a.WorkLocation = r.WorkLocation
   AND a.JobFamily = r.JobFamily
ORDER BY
    r.YearMonth,
    r.WorkLocation,
    r.JobFamily;
