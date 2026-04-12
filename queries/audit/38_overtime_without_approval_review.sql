-- Teaching objective: Identify approved worked overtime that is missing a linked overtime approval or exceeds the approved amount.
-- Main tables: TimeClockEntry, OvertimeApproval, Employee, WorkCenter.
-- Expected output shape: One row per flagged time-clock entry.
-- Recommended build mode: Default.
-- Interpretation notes: Clean builds should have very few or no rows. Default anomaly builds should surface missing approval cases.

SELECT
    date(tc.WorkDate) AS WorkDate,
    e.EmployeeNumber,
    e.EmployeeName,
    e.JobTitle,
    wc.WorkCenterCode,
    wc.WorkCenterName,
    tc.TimeClockEntryID,
    ROUND(COALESCE(tc.OvertimeHours, 0), 2) AS OvertimeHours,
    tc.OvertimeApprovalID,
    ROUND(COALESCE(oa.RequestedHours, 0), 2) AS RequestedHours,
    ROUND(COALESCE(oa.ApprovedHours, 0), 2) AS ApprovedHours,
    oa.ReasonCode,
    CASE
        WHEN tc.OvertimeApprovalID IS NULL THEN 'Missing Overtime Approval'
        WHEN COALESCE(oa.ApprovedHours, 0) < COALESCE(tc.OvertimeHours, 0) THEN 'Approved Hours Below Recorded Overtime'
    END AS ReviewFlag
FROM TimeClockEntry AS tc
JOIN Employee AS e
    ON e.EmployeeID = tc.EmployeeID
LEFT JOIN WorkCenter AS wc
    ON wc.WorkCenterID = tc.WorkCenterID
LEFT JOIN OvertimeApproval AS oa
    ON oa.OvertimeApprovalID = tc.OvertimeApprovalID
WHERE ROUND(COALESCE(tc.OvertimeHours, 0), 2) > 0
  AND (
        tc.OvertimeApprovalID IS NULL
        OR COALESCE(oa.ApprovedHours, 0) < COALESCE(tc.OvertimeHours, 0)
      )
ORDER BY
    WorkDate,
    e.EmployeeNumber,
    tc.TimeClockEntryID;
