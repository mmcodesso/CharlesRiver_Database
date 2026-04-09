-- Teaching objective: Summarize released, completed, and closed work-order activity by month.
-- Main tables: WorkOrder, ProductionCompletionLine, WorkOrderClose.
-- Output shape: One row per release month.
-- Interpretation notes: This query is useful for throughput, cycle-time, and production-planning review.

WITH completed_qty AS (
    SELECT
        pc.WorkOrderID,
        ROUND(SUM(pcl.QuantityCompleted), 2) AS CompletedQuantity
    FROM ProductionCompletion AS pc
    JOIN ProductionCompletionLine AS pcl
        ON pcl.ProductionCompletionID = pc.ProductionCompletionID
    GROUP BY pc.WorkOrderID
),
close_flags AS (
    SELECT
        WorkOrderID,
        1 AS IsClosed
    FROM WorkOrderClose
)
SELECT
    CAST(strftime('%Y', wo.ReleasedDate) AS INTEGER) AS FiscalYear,
    CAST(strftime('%m', wo.ReleasedDate) AS INTEGER) AS FiscalPeriod,
    COUNT(*) AS WorkOrdersReleased,
    ROUND(SUM(wo.PlannedQuantity), 2) AS PlannedQuantity,
    ROUND(SUM(COALESCE(cq.CompletedQuantity, 0)), 2) AS CompletedQuantity,
    SUM(CASE WHEN wo.CompletedDate IS NOT NULL THEN 1 ELSE 0 END) AS WorkOrdersCompleted,
    SUM(COALESCE(cf.IsClosed, 0)) AS WorkOrdersClosed,
    ROUND(AVG(CASE WHEN wo.CompletedDate IS NOT NULL THEN julianday(wo.CompletedDate) - julianday(wo.ReleasedDate) END), 2) AS AvgDaysReleaseToComplete,
    ROUND(AVG(CASE WHEN wo.ClosedDate IS NOT NULL THEN julianday(wo.ClosedDate) - julianday(wo.ReleasedDate) END), 2) AS AvgDaysReleaseToClose
FROM WorkOrder AS wo
LEFT JOIN completed_qty AS cq
    ON cq.WorkOrderID = wo.WorkOrderID
LEFT JOIN close_flags AS cf
    ON cf.WorkOrderID = wo.WorkOrderID
GROUP BY CAST(strftime('%Y', wo.ReleasedDate) AS INTEGER), CAST(strftime('%m', wo.ReleasedDate) AS INTEGER)
ORDER BY FiscalYear, FiscalPeriod;
