-- Teaching objective: Review released work orders that are already due in-horizon but still have no actual start recorded.
-- Main tables: WorkOrder, WorkOrderOperation, WorkOrderOperationSchedule, WorkCenter, Item.
-- Expected output shape: One row per released work order with no actual start.
-- Recommended build mode: Default.
-- Interpretation notes: In the published default build, this query should return the small intentional manufacturing audit-seed set.

WITH fiscal_horizon AS (
    SELECT MAX(PeriodEndDate) AS FiscalYearEnd
    FROM PayrollPeriod
),
schedule_bounds AS (
    SELECT
        woo.WorkOrderID,
        MIN(wos.ScheduleDate) AS FirstScheduledDate,
        MAX(wos.ScheduleDate) AS FinalScheduledDate
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
candidates AS (
    SELECT
        wo.WorkOrderID,
        wo.WorkOrderNumber,
        i.ItemCode,
        i.ItemName,
        wo.ReleasedDate,
        wo.DueDate,
        sb.FirstScheduledDate,
        sb.FinalScheduledDate,
        fswc.FirstScheduledWorkCenterCode,
        ROUND(julianday(sb.FirstScheduledDate) - julianday(wo.ReleasedDate), 1) AS DaysReleaseToFirstScheduled,
        COALESCE(ast.FirstActualStartDate, 'No actual start recorded') AS FirstActualStartStatus
    FROM WorkOrder AS wo
    JOIN Item AS i
        ON i.ItemID = wo.ItemID
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
)
SELECT *
FROM candidates
ORDER BY
    WorkOrderID
LIMIT 5;
