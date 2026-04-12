-- Teaching objective: Compare planned rostered hours to approved worked hours by work center, shift, and month.
-- Main tables: EmployeeShiftRoster, TimeClockEntry, ShiftDefinition, WorkCenter.
-- Expected output shape: One row per month, work center, and shift with planned hours, worked hours, and variance.
-- Recommended build mode: Either.
-- Interpretation notes: This query highlights underworked schedules, overtime pressure, and shift-level utilization patterns.

WITH rostered AS (
    SELECT
        strftime('%Y-%m', esr.RosterDate) AS YearMonth,
        COALESCE(esr.WorkCenterID, sd.WorkCenterID) AS WorkCenterID,
        COALESCE(sd.ShiftCode, '(No Shift)') AS ShiftCode,
        COALESCE(sd.ShiftName, '(No Shift)') AS ShiftName,
        ROUND(SUM(CASE WHEN esr.RosterStatus IN ('Scheduled', 'Reassigned', 'Absent') THEN COALESCE(esr.ScheduledHours, 0) ELSE 0 END), 2) AS RosteredHours
    FROM EmployeeShiftRoster AS esr
    LEFT JOIN ShiftDefinition AS sd
        ON sd.ShiftDefinitionID = esr.ShiftDefinitionID
    GROUP BY
        strftime('%Y-%m', esr.RosterDate),
        COALESCE(esr.WorkCenterID, sd.WorkCenterID),
        COALESCE(sd.ShiftCode, '(No Shift)'),
        COALESCE(sd.ShiftName, '(No Shift)')
),
worked AS (
    SELECT
        strftime('%Y-%m', tc.WorkDate) AS YearMonth,
        COALESCE(tc.WorkCenterID, sd.WorkCenterID) AS WorkCenterID,
        COALESCE(sd.ShiftCode, '(No Shift)') AS ShiftCode,
        COALESCE(sd.ShiftName, '(No Shift)') AS ShiftName,
        ROUND(SUM(COALESCE(tc.RegularHours, 0) + COALESCE(tc.OvertimeHours, 0)), 2) AS ApprovedWorkedHours,
        ROUND(SUM(COALESCE(tc.OvertimeHours, 0)), 2) AS OvertimeHours
    FROM TimeClockEntry AS tc
    LEFT JOIN ShiftDefinition AS sd
        ON sd.ShiftDefinitionID = tc.ShiftDefinitionID
    WHERE tc.ClockStatus = 'Approved'
    GROUP BY
        strftime('%Y-%m', tc.WorkDate),
        COALESCE(tc.WorkCenterID, sd.WorkCenterID),
        COALESCE(sd.ShiftCode, '(No Shift)'),
        COALESCE(sd.ShiftName, '(No Shift)')
),
keys AS (
    SELECT YearMonth, WorkCenterID, ShiftCode, ShiftName FROM rostered
    UNION
    SELECT YearMonth, WorkCenterID, ShiftCode, ShiftName FROM worked
)
SELECT
    k.YearMonth,
    wc.WorkCenterCode,
    wc.WorkCenterName,
    k.ShiftCode,
    k.ShiftName,
    ROUND(COALESCE(r.RosteredHours, 0), 2) AS RosteredHours,
    ROUND(COALESCE(w.ApprovedWorkedHours, 0), 2) AS ApprovedWorkedHours,
    ROUND(COALESCE(w.OvertimeHours, 0), 2) AS OvertimeHours,
    ROUND(COALESCE(w.ApprovedWorkedHours, 0) - COALESCE(r.RosteredHours, 0), 2) AS WorkedMinusRosteredHours
FROM keys AS k
LEFT JOIN WorkCenter AS wc
    ON wc.WorkCenterID = k.WorkCenterID
LEFT JOIN rostered AS r
    ON r.YearMonth = k.YearMonth
   AND r.WorkCenterID = k.WorkCenterID
   AND r.ShiftCode = k.ShiftCode
LEFT JOIN worked AS w
    ON w.YearMonth = k.YearMonth
   AND w.WorkCenterID = k.WorkCenterID
   AND w.ShiftCode = k.ShiftCode
ORDER BY
    k.YearMonth,
    wc.WorkCenterCode,
    k.ShiftCode;
