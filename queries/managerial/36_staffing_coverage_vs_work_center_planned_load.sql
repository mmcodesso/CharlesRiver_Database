-- Teaching objective: Compare rostered staffing hours to scheduled work-center load at the daily grain with monthly rollup context.
-- Main tables: EmployeeShiftRoster, WorkOrderOperationSchedule, WorkCenter.
-- Expected output shape: One row per work center and calendar day with rostered hours, scheduled load hours, and the coverage gap.
-- Recommended build mode: Either.
-- Interpretation notes: Positive gap means rostered hours exceed scheduled operation load. Negative gap highlights potential staffing pressure or backlog risk.

WITH roster_hours AS (
    SELECT
        esr.WorkCenterID,
        date(esr.RosterDate) AS WorkDate,
        ROUND(SUM(CASE WHEN esr.RosterStatus IN ('Scheduled', 'Reassigned', 'Absent') THEN COALESCE(esr.ScheduledHours, 0) ELSE 0 END), 2) AS RosteredHours,
        COUNT(DISTINCT CASE WHEN esr.RosterStatus IN ('Scheduled', 'Reassigned', 'Absent') THEN esr.EmployeeID END) AS RosteredEmployees
    FROM EmployeeShiftRoster AS esr
    WHERE esr.WorkCenterID IS NOT NULL
    GROUP BY
        esr.WorkCenterID,
        date(esr.RosterDate)
),
planned_load AS (
    SELECT
        woos.WorkCenterID,
        date(woos.ScheduleDate) AS WorkDate,
        ROUND(SUM(COALESCE(woos.ScheduledHours, 0)), 2) AS PlannedLoadHours
    FROM WorkOrderOperationSchedule AS woos
    GROUP BY
        woos.WorkCenterID,
        date(woos.ScheduleDate)
),
date_keys AS (
    SELECT WorkCenterID, WorkDate FROM roster_hours
    UNION
    SELECT WorkCenterID, WorkDate FROM planned_load
)
SELECT
    strftime('%Y-%m', dk.WorkDate) AS YearMonth,
    dk.WorkDate,
    wc.WorkCenterCode,
    wc.WorkCenterName,
    ROUND(COALESCE(pl.PlannedLoadHours, 0), 2) AS PlannedLoadHours,
    ROUND(COALESCE(rh.RosteredHours, 0), 2) AS RosteredHours,
    COALESCE(rh.RosteredEmployees, 0) AS RosteredEmployees,
    ROUND(COALESCE(rh.RosteredHours, 0) - COALESCE(pl.PlannedLoadHours, 0), 2) AS CoverageGapHours
FROM date_keys AS dk
JOIN WorkCenter AS wc
    ON wc.WorkCenterID = dk.WorkCenterID
LEFT JOIN planned_load AS pl
    ON pl.WorkCenterID = dk.WorkCenterID
   AND pl.WorkDate = dk.WorkDate
LEFT JOIN roster_hours AS rh
    ON rh.WorkCenterID = dk.WorkCenterID
   AND rh.WorkDate = dk.WorkDate
ORDER BY
    dk.WorkDate,
    wc.WorkCenterCode;
