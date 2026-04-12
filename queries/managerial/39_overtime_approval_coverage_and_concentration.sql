-- Teaching objective: Review how overtime hours concentrate by work center and how consistently those hours carry overtime approvals.
-- Main tables: TimeClockEntry, OvertimeApproval, WorkCenter.
-- Expected output shape: One row per month and work center with overtime totals and approval coverage metrics.
-- Recommended build mode: Either.
-- Interpretation notes: Clean builds should show near-complete approval coverage for meaningful overtime. Default anomaly builds should surface approval gaps.

SELECT
    strftime('%Y-%m', tc.WorkDate) AS YearMonth,
    wc.WorkCenterCode,
    wc.WorkCenterName,
    ROUND(SUM(COALESCE(tc.OvertimeHours, 0)), 2) AS OvertimeHours,
    ROUND(SUM(CASE WHEN tc.OvertimeApprovalID IS NOT NULL THEN COALESCE(tc.OvertimeHours, 0) ELSE 0 END), 2) AS ApprovedOvertimeHours,
    COUNT(DISTINCT CASE WHEN COALESCE(tc.OvertimeHours, 0) > 0 THEN tc.TimeClockEntryID END) AS OvertimeEntryCount,
    COUNT(DISTINCT CASE WHEN COALESCE(tc.OvertimeHours, 0) > 0 AND tc.OvertimeApprovalID IS NOT NULL THEN tc.TimeClockEntryID END) AS ApprovedOvertimeEntryCount,
    COUNT(DISTINCT CASE WHEN COALESCE(tc.OvertimeHours, 0) > 0 AND tc.OvertimeApprovalID IS NULL THEN tc.TimeClockEntryID END) AS MissingApprovalEntryCount,
    CASE
        WHEN SUM(COALESCE(tc.OvertimeHours, 0)) = 0 THEN 0
        ELSE ROUND(SUM(CASE WHEN tc.OvertimeApprovalID IS NOT NULL THEN COALESCE(tc.OvertimeHours, 0) ELSE 0 END) / SUM(COALESCE(tc.OvertimeHours, 0)), 4)
    END AS OvertimeApprovalCoveragePct
FROM TimeClockEntry AS tc
LEFT JOIN WorkCenter AS wc
    ON wc.WorkCenterID = tc.WorkCenterID
GROUP BY
    strftime('%Y-%m', tc.WorkDate),
    wc.WorkCenterCode,
    wc.WorkCenterName
HAVING ROUND(SUM(COALESCE(tc.OvertimeHours, 0)), 2) > 0
ORDER BY
    YearMonth,
    OvertimeHours DESC,
    wc.WorkCenterCode;
