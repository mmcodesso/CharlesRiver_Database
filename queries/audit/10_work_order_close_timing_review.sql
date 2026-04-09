-- Teaching objective: Review the timing between the last production activity and work-order close.
-- Main tables: WorkOrder, MaterialIssue, ProductionCompletion, WorkOrderClose.
-- Output shape: One row per work order with delayed or missing close behavior.
-- Interpretation notes: Clean builds may return few rows because most work orders should close promptly.

WITH final_activity AS (
    SELECT
        wo.WorkOrderID,
        MAX(ActivityDate) AS LastActivityDate
    FROM WorkOrder AS wo
    LEFT JOIN (
        SELECT WorkOrderID, IssueDate AS ActivityDate
        FROM MaterialIssue
        UNION ALL
        SELECT WorkOrderID, CompletionDate AS ActivityDate
        FROM ProductionCompletion
    ) AS activity
        ON activity.WorkOrderID = wo.WorkOrderID
    GROUP BY wo.WorkOrderID
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
    date(fa.LastActivityDate) AS LastActivityDate,
    date(wo.ClosedDate) AS ClosedDate,
    ROUND(CASE
        WHEN wo.ClosedDate IS NOT NULL THEN julianday(wo.ClosedDate) - julianday(fa.LastActivityDate)
        ELSE julianday(ad.MaxEventDate) - julianday(fa.LastActivityDate)
    END, 2) AS DaysFromLastActivity,
    CASE
        WHEN wo.ClosedDate IS NULL THEN 'Missing close after last activity'
        ELSE 'Late close after last activity'
    END AS PotentialIssue
FROM WorkOrder AS wo
JOIN final_activity AS fa
    ON fa.WorkOrderID = wo.WorkOrderID
CROSS JOIN anchor_date AS ad
WHERE fa.LastActivityDate IS NOT NULL
  AND (
        (wo.ClosedDate IS NULL AND julianday(ad.MaxEventDate) - julianday(fa.LastActivityDate) > 7)
        OR (wo.ClosedDate IS NOT NULL AND julianday(wo.ClosedDate) - julianday(fa.LastActivityDate) > 7)
      )
ORDER BY DaysFromLastActivity DESC, wo.WorkOrderNumber;
