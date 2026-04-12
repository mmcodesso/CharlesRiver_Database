-- Teaching objective: Find rostered absences that still carry time summaries or raw punch activity.
-- Main tables: EmployeeAbsence, EmployeeShiftRoster, TimeClockEntry, TimeClockPunch, Employee.
-- Expected output shape: One row per conflicting absence record.
-- Recommended build mode: Default.
-- Interpretation notes: The default anomaly build should surface worked time on absent days. Clean builds should not.

SELECT
    date(ea.AbsenceDate) AS AbsenceDate,
    e.EmployeeNumber,
    e.EmployeeName,
    e.JobTitle,
    ea.AbsenceType,
    ROUND(COALESCE(ea.HoursAbsent, 0), 2) AS HoursAbsent,
    esr.EmployeeShiftRosterID,
    esr.RosterStatus,
    tc.TimeClockEntryID,
    ROUND(COALESCE(tc.RegularHours, 0) + COALESCE(tc.OvertimeHours, 0), 2) AS WorkedHours,
    COUNT(tcp.TimeClockPunchID) AS PunchCount
FROM EmployeeAbsence AS ea
JOIN Employee AS e
    ON e.EmployeeID = ea.EmployeeID
LEFT JOIN EmployeeShiftRoster AS esr
    ON esr.EmployeeShiftRosterID = ea.EmployeeShiftRosterID
LEFT JOIN TimeClockEntry AS tc
    ON tc.EmployeeShiftRosterID = ea.EmployeeShiftRosterID
LEFT JOIN TimeClockPunch AS tcp
    ON tcp.EmployeeShiftRosterID = ea.EmployeeShiftRosterID
GROUP BY
    date(ea.AbsenceDate),
    e.EmployeeNumber,
    e.EmployeeName,
    e.JobTitle,
    ea.AbsenceType,
    ea.HoursAbsent,
    esr.EmployeeShiftRosterID,
    esr.RosterStatus,
    tc.TimeClockEntryID,
    tc.RegularHours,
    tc.OvertimeHours
HAVING tc.TimeClockEntryID IS NOT NULL
    OR COUNT(tcp.TimeClockPunchID) > 0
ORDER BY
    AbsenceDate,
    e.EmployeeNumber;
