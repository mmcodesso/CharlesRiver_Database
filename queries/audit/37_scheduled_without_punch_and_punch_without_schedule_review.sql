-- Teaching objective: Find rostered days with no punch activity and punch activity without a valid roster assignment.
-- Main tables: EmployeeShiftRoster, TimeClockEntry, TimeClockPunch, Employee.
-- Expected output shape: One row per flagged roster or punch event.
-- Recommended build mode: Default.
-- Interpretation notes: Clean builds should mainly show nothing here after excluding absence and cancelled roster rows. Default anomaly builds should surface detached punches or missing final punch patterns.

WITH scheduled_without_punch AS (
    SELECT
        'Scheduled Without Punch' AS ReviewType,
        esr.EmployeeShiftRosterID AS ReferenceID,
        esr.RosterDate AS WorkDate,
        e.EmployeeNumber,
        e.EmployeeName,
        e.JobTitle,
        esr.RosterStatus,
        esr.WorkCenterID,
        NULL AS TimeClockEntryID,
        NULL AS TimeClockPunchID,
        'Roster row has no linked time summary or raw punches.' AS ReviewMessage
    FROM EmployeeShiftRoster AS esr
    JOIN Employee AS e
        ON e.EmployeeID = esr.EmployeeID
    LEFT JOIN TimeClockEntry AS tc
        ON tc.EmployeeShiftRosterID = esr.EmployeeShiftRosterID
    LEFT JOIN TimeClockPunch AS tcp
        ON tcp.EmployeeShiftRosterID = esr.EmployeeShiftRosterID
    WHERE esr.RosterStatus IN ('Scheduled', 'Reassigned')
      AND tc.TimeClockEntryID IS NULL
      AND tcp.TimeClockPunchID IS NULL
),
punch_without_schedule AS (
    SELECT
        'Punch Without Schedule' AS ReviewType,
        COALESCE(tcp.EmployeeShiftRosterID, 0) AS ReferenceID,
        tcp.WorkDate AS WorkDate,
        e.EmployeeNumber,
        e.EmployeeName,
        e.JobTitle,
        NULL AS RosterStatus,
        tcp.WorkCenterID,
        tcp.TimeClockEntryID,
        tcp.TimeClockPunchID,
        'Punch row is missing a valid linked roster row.' AS ReviewMessage
    FROM TimeClockPunch AS tcp
    JOIN Employee AS e
        ON e.EmployeeID = tcp.EmployeeID
    LEFT JOIN EmployeeShiftRoster AS esr
        ON esr.EmployeeShiftRosterID = tcp.EmployeeShiftRosterID
    WHERE tcp.EmployeeShiftRosterID IS NULL
       OR esr.EmployeeShiftRosterID IS NULL
)
SELECT *
FROM scheduled_without_punch
UNION ALL
SELECT *
FROM punch_without_schedule
ORDER BY
    WorkDate,
    ReviewType,
    EmployeeNumber;
