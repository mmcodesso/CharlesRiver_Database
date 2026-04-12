-- Teaching objective: Review roster rows scheduled after an employee's termination date.
-- Main tables: EmployeeShiftRoster, Employee, TimeClockEntry, TimeClockPunch.
-- Expected output shape: One row per invalid rostered day.
-- Recommended build mode: Default.
-- Interpretation notes: This isolates current scheduling failures after employee termination and shows whether worked time was also recorded.

SELECT
    date(esr.RosterDate) AS RosterDate,
    e.EmployeeNumber,
    e.EmployeeName,
    e.JobTitle,
    date(e.TerminationDate) AS TerminationDate,
    esr.EmployeeShiftRosterID,
    esr.RosterStatus,
    ROUND(COALESCE(esr.ScheduledHours, 0), 2) AS ScheduledHours,
    tc.TimeClockEntryID,
    ROUND(COALESCE(tc.RegularHours, 0) + COALESCE(tc.OvertimeHours, 0), 2) AS WorkedHours,
    COUNT(tcp.TimeClockPunchID) AS PunchCount
FROM EmployeeShiftRoster AS esr
JOIN Employee AS e
    ON e.EmployeeID = esr.EmployeeID
LEFT JOIN TimeClockEntry AS tc
    ON tc.EmployeeShiftRosterID = esr.EmployeeShiftRosterID
LEFT JOIN TimeClockPunch AS tcp
    ON tcp.EmployeeShiftRosterID = esr.EmployeeShiftRosterID
WHERE e.TerminationDate IS NOT NULL
  AND date(esr.RosterDate) > date(e.TerminationDate)
GROUP BY
    date(esr.RosterDate),
    e.EmployeeNumber,
    e.EmployeeName,
    e.JobTitle,
    date(e.TerminationDate),
    esr.EmployeeShiftRosterID,
    esr.RosterStatus,
    esr.ScheduledHours,
    tc.TimeClockEntryID,
    tc.RegularHours,
    tc.OvertimeHours
ORDER BY
    RosterDate,
    e.EmployeeNumber;
