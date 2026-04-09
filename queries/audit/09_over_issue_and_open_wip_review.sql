-- Teaching objective: Review work orders with possible material over-issue or unusually old open WIP.
-- Main tables: WorkOrder, BillOfMaterialLine, MaterialIssue, MaterialIssueLine, ProductionCompletionLine, WorkOrderClose.
-- Output shape: One row per work order needing review.
-- Interpretation notes: Clean builds may return few or no rows. This is a review query, not proof of error.

WITH issue_summary AS (
    SELECT
        mi.WorkOrderID,
        ROUND(SUM(mil.QuantityIssued), 2) AS TotalIssuedQuantity,
        ROUND(SUM(mil.ExtendedStandardCost), 2) AS TotalIssuedCost,
        MAX(mi.IssueDate) AS LastIssueDate
    FROM MaterialIssue AS mi
    JOIN MaterialIssueLine AS mil
        ON mil.MaterialIssueID = mi.MaterialIssueID
    GROUP BY mi.WorkOrderID
),
planned_issue_tolerance AS (
    SELECT
        wo.WorkOrderID,
        ROUND(SUM(wo.PlannedQuantity * bml.QuantityPerUnit * (1.0 + (bml.ScrapFactorPct / 100.0) + 0.03)), 2) AS AllowedIssueQuantity
    FROM WorkOrder AS wo
    JOIN BillOfMaterialLine AS bml
        ON bml.BOMID = wo.BOMID
    GROUP BY wo.WorkOrderID
),
completion_summary AS (
    SELECT
        pc.WorkOrderID,
        ROUND(SUM(pcl.QuantityCompleted), 2) AS CompletedQuantity,
        MAX(pc.CompletionDate) AS LastCompletionDate
    FROM ProductionCompletion AS pc
    JOIN ProductionCompletionLine AS pcl
        ON pcl.ProductionCompletionID = pc.ProductionCompletionID
    GROUP BY pc.WorkOrderID
),
anchor_date AS (
    SELECT MAX(EventDate) AS MaxEventDate
    FROM (
        SELECT MAX(ReleasedDate) AS EventDate FROM WorkOrder
        UNION ALL
        SELECT MAX(IssueDate) AS EventDate FROM MaterialIssue
        UNION ALL
        SELECT MAX(CompletionDate) AS EventDate FROM ProductionCompletion
        UNION ALL
        SELECT MAX(CloseDate) AS EventDate FROM WorkOrderClose
    )
)
SELECT
    wo.WorkOrderNumber,
    wo.Status,
    date(wo.ReleasedDate) AS ReleasedDate,
    date(wo.CompletedDate) AS CompletedDate,
    ROUND(wo.PlannedQuantity, 2) AS PlannedQuantity,
    COALESCE(cs.CompletedQuantity, 0) AS CompletedQuantity,
    COALESCE(isu.TotalIssuedQuantity, 0) AS TotalIssuedQuantity,
    COALESCE(pit.AllowedIssueQuantity, 0) AS AllowedIssueQuantity,
    ROUND(COALESCE(isu.TotalIssuedQuantity, 0) - COALESCE(pit.AllowedIssueQuantity, 0), 2) AS OverIssueQuantity,
    ROUND(COALESCE(isu.TotalIssuedCost, 0), 2) AS TotalIssuedCost,
    ROUND(julianday(ad.MaxEventDate) - julianday(wo.ReleasedDate), 2) AS DaysOpenRelativeToDatasetEnd,
    CASE
        WHEN COALESCE(isu.TotalIssuedQuantity, 0) > COALESCE(pit.AllowedIssueQuantity, 0) THEN 'Potential over-issue'
        WHEN wo.Status <> 'Closed' AND julianday(ad.MaxEventDate) - julianday(wo.ReleasedDate) > 45 THEN 'Older open WIP'
        ELSE 'Review'
    END AS PotentialIssue
FROM WorkOrder AS wo
LEFT JOIN issue_summary AS isu
    ON isu.WorkOrderID = wo.WorkOrderID
LEFT JOIN planned_issue_tolerance AS pit
    ON pit.WorkOrderID = wo.WorkOrderID
LEFT JOIN completion_summary AS cs
    ON cs.WorkOrderID = wo.WorkOrderID
CROSS JOIN anchor_date AS ad
WHERE COALESCE(isu.TotalIssuedQuantity, 0) > COALESCE(pit.AllowedIssueQuantity, 0)
   OR (wo.Status <> 'Closed' AND julianday(ad.MaxEventDate) - julianday(wo.ReleasedDate) > 45)
ORDER BY PotentialIssue, wo.ReleasedDate, wo.WorkOrderNumber;
