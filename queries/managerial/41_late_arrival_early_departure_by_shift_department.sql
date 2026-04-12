-- Teaching objective: Measure late-arrival and early-departure patterns by shift and department.
-- Main tables: EmployeeShiftRoster, TimeClockEntry, ShiftDefinition.
-- Expected output shape: One row per month, department, and shift.
-- Recommended build mode: Either.
-- Interpretation notes: Compare planned start and end times from the roster to actual approved time summaries to understand attendance drift.

WITH attendance AS (
    SELECT
        strftime('%Y-%m', esr.RosterDate) AS YearMonth,
        COALESCE(sd.Department, '(No Department)') AS Department,
        COALESCE(sd.ShiftCode, '(No Shift)') AS ShiftCode,
        COALESCE(sd.ShiftName, '(No Shift)') AS ShiftName,
        COUNT(*) AS RosterDayCount,
        ROUND(SUM(
            CASE
                WHEN tc.TimeClockEntryID IS NOT NULL
                 AND julianday(tc.ClockInTime) > julianday(esr.RosterDate || ' ' || esr.ScheduledStartTime)
                THEN (julianday(tc.ClockInTime) - julianday(esr.RosterDate || ' ' || esr.ScheduledStartTime)) * 24.0 * 60.0
                ELSE 0
            END
        ), 2) AS MinutesLate,
        ROUND(SUM(
            CASE
                WHEN tc.TimeClockEntryID IS NOT NULL
                 AND julianday(tc.ClockOutTime) < julianday(esr.RosterDate || ' ' || esr.ScheduledEndTime)
                THEN (julianday(esr.RosterDate || ' ' || esr.ScheduledEndTime) - julianday(tc.ClockOutTime)) * 24.0 * 60.0
                ELSE 0
            END
        ), 2) AS MinutesEarlyDeparture,
        SUM(CASE
            WHEN tc.TimeClockEntryID IS NOT NULL
             AND julianday(tc.ClockInTime) > julianday(esr.RosterDate || ' ' || esr.ScheduledStartTime)
            THEN 1 ELSE 0 END
        ) AS LateArrivalDays,
        SUM(CASE
            WHEN tc.TimeClockEntryID IS NOT NULL
             AND julianday(tc.ClockOutTime) < julianday(esr.RosterDate || ' ' || esr.ScheduledEndTime)
            THEN 1 ELSE 0 END
        ) AS EarlyDepartureDays
    FROM EmployeeShiftRoster AS esr
    LEFT JOIN ShiftDefinition AS sd
        ON sd.ShiftDefinitionID = esr.ShiftDefinitionID
    LEFT JOIN TimeClockEntry AS tc
        ON tc.EmployeeShiftRosterID = esr.EmployeeShiftRosterID
    WHERE esr.RosterStatus IN ('Scheduled', 'Reassigned')
    GROUP BY
        strftime('%Y-%m', esr.RosterDate),
        COALESCE(sd.Department, '(No Department)'),
        COALESCE(sd.ShiftCode, '(No Shift)'),
        COALESCE(sd.ShiftName, '(No Shift)')
)
SELECT
    YearMonth,
    Department,
    ShiftCode,
    ShiftName,
    RosterDayCount,
    MinutesLate,
    MinutesEarlyDeparture,
    LateArrivalDays,
    EarlyDepartureDays,
    CASE WHEN RosterDayCount = 0 THEN 0 ELSE ROUND(LateArrivalDays * 1.0 / RosterDayCount, 4) END AS LateArrivalRate,
    CASE WHEN RosterDayCount = 0 THEN 0 ELSE ROUND(EarlyDepartureDays * 1.0 / RosterDayCount, 4) END AS EarlyDepartureRate
FROM attendance
ORDER BY
    YearMonth,
    Department,
    ShiftCode;
