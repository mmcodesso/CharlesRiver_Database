-- Teaching objective: Summarize the released-work-order-without-actual-start pattern by release month, due month, and first scheduled work center.
-- Main tables: WorkOrder, WorkOrderOperation, WorkOrderOperationSchedule, WorkCenter.
-- Expected output shape: Aggregated rows by due month, release month, and first scheduled work center.
-- Recommended build mode: Default.
-- Interpretation notes: Use this query after the detail review when students need to explain the timing pattern rather than just list the source documents.

WITH fiscal_horizon AS (
    SELECT MAX(PeriodEndDate) AS FiscalYearEnd
    FROM PayrollPeriod
),
schedule_bounds AS (
    SELECT
        woo.WorkOrderID,
        MIN(wos.ScheduleDate) AS FirstScheduledDate
    FROM WorkOrderOperationSchedule AS wos
    JOIN WorkOrderOperation AS woo
        ON woo.WorkOrderOperationID = wos.WorkOrderOperationID
    GROUP BY woo.WorkOrderID
),
first_scheduled_work_center AS (
    SELECT
        sb.WorkOrderID,
        (
            SELECT wc.WorkCenterCode
            FROM WorkOrderOperationSchedule AS wos2
            JOIN WorkOrderOperation AS woo2
                ON woo2.WorkOrderOperationID = wos2.WorkOrderOperationID
            JOIN WorkCenter AS wc
                ON wc.WorkCenterID = wos2.WorkCenterID
            WHERE woo2.WorkOrderID = sb.WorkOrderID
            ORDER BY
                date(wos2.ScheduleDate),
                wos2.WorkOrderOperationScheduleID
            LIMIT 1
        ) AS FirstScheduledWorkCenterCode
    FROM schedule_bounds AS sb
),
actual_start AS (
    SELECT
        WorkOrderID,
        MIN(ActualStartDate) AS FirstActualStartDate
    FROM WorkOrderOperation
    WHERE ActualStartDate IS NOT NULL
    GROUP BY WorkOrderID
),
detail AS (
    SELECT
        strftime('%Y-%m', wo.DueDate) AS DueMonth,
        strftime('%Y-%m', wo.ReleasedDate) AS ReleaseMonth,
        COALESCE(fswc.FirstScheduledWorkCenterCode, 'UNASSIGNED') AS FirstScheduledWorkCenterCode,
        julianday(sb.FirstScheduledDate) - julianday(wo.ReleasedDate) AS DaysReleaseToFirstScheduled,
        wo.WorkOrderID,
        wo.DueDate
    FROM WorkOrder AS wo
    JOIN schedule_bounds AS sb
        ON sb.WorkOrderID = wo.WorkOrderID
    LEFT JOIN first_scheduled_work_center AS fswc
        ON fswc.WorkOrderID = wo.WorkOrderID
    LEFT JOIN actual_start AS ast
        ON ast.WorkOrderID = wo.WorkOrderID
    CROSS JOIN fiscal_horizon AS fh
    WHERE wo.Status = 'Released'
      AND ast.FirstActualStartDate IS NULL
      AND date(wo.DueDate) <= date(fh.FiscalYearEnd)
      AND date(wo.ReleasedDate) <= date(fh.FiscalYearEnd, '-30 day')
),
selected_detail AS (
    SELECT *
    FROM detail
    ORDER BY WorkOrderID
    LIMIT 5
)
SELECT
    DueMonth,
    ReleaseMonth,
    FirstScheduledWorkCenterCode,
    COUNT(*) AS WorkOrderCount,
    ROUND(AVG(DaysReleaseToFirstScheduled), 1) AS AvgDaysReleaseToFirstScheduled,
    MIN(DueDate) AS EarliestDueDate,
    MAX(DueDate) AS LatestDueDate
FROM selected_detail
GROUP BY
    DueMonth,
    ReleaseMonth,
    FirstScheduledWorkCenterCode
ORDER BY
    DueMonth,
    ReleaseMonth,
    FirstScheduledWorkCenterCode;
