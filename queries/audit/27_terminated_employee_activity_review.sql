-- Teaching objective: Detect post-termination payroll, approval, and labor activity.
-- Main tables: Employee, PayrollRegister, TimeClockEntry, LaborTimeEntry, PurchaseOrder, JournalEntry.
-- Expected output shape: One row per employee activity that occurs after the employee's termination date.
-- Recommended build mode: Standard anomaly build.
-- Interpretation notes: Clean builds should normally return no rows; the default anomaly-enabled build should surface planted exceptions.

WITH terminated_employees AS (
    SELECT
        EmployeeID,
        EmployeeNumber,
        EmployeeName,
        JobTitle,
        EmploymentStatus,
        date(TerminationDate) AS TerminationDate
    FROM Employee
    WHERE EmploymentStatus = 'Terminated'
      AND TerminationDate IS NOT NULL
),
post_termination_events AS (
    SELECT
        'Payroll register after termination' AS ExceptionType,
        'PayrollRegister' AS SourceTable,
        pr.PayrollRegisterID AS SourceID,
        te.EmployeeID,
        te.EmployeeNumber,
        te.EmployeeName,
        te.JobTitle,
        te.TerminationDate,
        date(pr.ApprovedDate) AS EventDate,
        pr.Status AS ReferenceStatus
    FROM terminated_employees AS te
    JOIN PayrollRegister AS pr
        ON pr.EmployeeID = te.EmployeeID
    WHERE date(pr.ApprovedDate) > te.TerminationDate

    UNION ALL

    SELECT
        'Time clock after termination',
        'TimeClockEntry',
        tc.TimeClockEntryID,
        te.EmployeeID,
        te.EmployeeNumber,
        te.EmployeeName,
        te.JobTitle,
        te.TerminationDate,
        date(tc.WorkDate),
        tc.ClockStatus
    FROM terminated_employees AS te
    JOIN TimeClockEntry AS tc
        ON tc.EmployeeID = te.EmployeeID
    WHERE date(tc.WorkDate) > te.TerminationDate

    UNION ALL

    SELECT
        'Labor entry after termination',
        'LaborTimeEntry',
        lte.LaborTimeEntryID,
        te.EmployeeID,
        te.EmployeeNumber,
        te.EmployeeName,
        te.JobTitle,
        te.TerminationDate,
        date(lte.WorkDate),
        lte.LaborType
    FROM terminated_employees AS te
    JOIN LaborTimeEntry AS lte
        ON lte.EmployeeID = te.EmployeeID
    WHERE date(lte.WorkDate) > te.TerminationDate

    UNION ALL

    SELECT
        'Purchase-order approval after termination',
        'PurchaseOrder',
        po.PurchaseOrderID,
        te.EmployeeID,
        te.EmployeeNumber,
        te.EmployeeName,
        te.JobTitle,
        te.TerminationDate,
        date(po.OrderDate),
        po.Status
    FROM terminated_employees AS te
    JOIN PurchaseOrder AS po
        ON po.ApprovedByEmployeeID = te.EmployeeID
    WHERE date(po.OrderDate) > te.TerminationDate

    UNION ALL

    SELECT
        'Journal approval after termination',
        'JournalEntry',
        je.JournalEntryID,
        te.EmployeeID,
        te.EmployeeNumber,
        te.EmployeeName,
        te.JobTitle,
        te.TerminationDate,
        date(je.ApprovedDate),
        je.EntryType
    FROM terminated_employees AS te
    JOIN JournalEntry AS je
        ON je.ApprovedByEmployeeID = te.EmployeeID
    WHERE date(je.ApprovedDate) > te.TerminationDate
)
SELECT
    ExceptionType,
    SourceTable,
    SourceID,
    EmployeeID,
    EmployeeNumber,
    EmployeeName,
    JobTitle,
    TerminationDate,
    EventDate,
    ROUND(julianday(EventDate) - julianday(TerminationDate), 1) AS DaysAfterTermination,
    ReferenceStatus
FROM post_termination_events
ORDER BY
    EventDate,
    EmployeeID,
    SourceTable,
    SourceID;
