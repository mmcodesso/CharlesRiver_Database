-- Teaching objective: Detect incomplete punch sets and punch sequences with invalid ordering.
-- Main tables: TimeClockPunch, TimeClockEntry, Employee.
-- Expected output shape: One row per flagged time-clock entry.
-- Recommended build mode: Default.
-- Interpretation notes: This query is the main review for missing final punches and overlapping meal punch sequences.

WITH ordered AS (
    SELECT
        tcp.TimeClockEntryID,
        tcp.EmployeeID,
        tcp.WorkDate,
        tcp.SequenceNumber,
        tcp.PunchType,
        tcp.PunchTimestamp,
        LAG(tcp.PunchTimestamp) OVER (
            PARTITION BY tcp.TimeClockEntryID
            ORDER BY tcp.SequenceNumber, tcp.TimeClockPunchID
        ) AS PriorPunchTimestamp
    FROM TimeClockPunch AS tcp
),
flags AS (
    SELECT
        o.TimeClockEntryID,
        o.EmployeeID,
        o.WorkDate,
        MAX(CASE WHEN o.PunchType = 'Clock Out' THEN 1 ELSE 0 END) AS HasClockOutPunch,
        MAX(CASE
            WHEN o.PriorPunchTimestamp IS NOT NULL
             AND julianday(o.PunchTimestamp) <= julianday(o.PriorPunchTimestamp)
            THEN 1 ELSE 0 END
        ) AS NonIncreasingPunchTimestampFlag,
        COUNT(*) AS PunchCount
    FROM ordered AS o
    GROUP BY
        o.TimeClockEntryID,
        o.EmployeeID,
        o.WorkDate
)
SELECT
    date(f.WorkDate) AS WorkDate,
    e.EmployeeNumber,
    e.EmployeeName,
    tc.TimeClockEntryID,
    f.PunchCount,
    f.HasClockOutPunch,
    f.NonIncreasingPunchTimestampFlag,
    CASE
        WHEN f.HasClockOutPunch = 0 THEN 'Missing Clock Out Punch'
        WHEN f.NonIncreasingPunchTimestampFlag = 1 THEN 'Overlapping or Reversed Punch Sequence'
        WHEN f.PunchCount NOT IN (2, 4) THEN 'Unexpected Punch Count'
    END AS ReviewFlag
FROM flags AS f
JOIN TimeClockEntry AS tc
    ON tc.TimeClockEntryID = f.TimeClockEntryID
JOIN Employee AS e
    ON e.EmployeeID = f.EmployeeID
WHERE f.HasClockOutPunch = 0
   OR f.NonIncreasingPunchTimestampFlag = 1
   OR f.PunchCount NOT IN (2, 4)
ORDER BY
    WorkDate,
    e.EmployeeNumber,
    tc.TimeClockEntryID;
