-- Teaching objective: Compare BOM-based expected component usage to actual issued material by work order.
-- Main tables: WorkOrder, BillOfMaterialLine, MaterialIssue, MaterialIssueLine, Item.
-- Output shape: One row per work order component.
-- Interpretation notes: Positive issue variance suggests over-issue relative to planned BOM plus standard scrap assumptions.

WITH planned_component_usage AS (
    SELECT
        wo.WorkOrderID,
        wo.WorkOrderNumber,
        wo.PlannedQuantity,
        parent.ItemCode AS ParentItemCode,
        parent.ItemName AS ParentItemName,
        component.ItemCode AS ComponentItemCode,
        component.ItemName AS ComponentItemName,
        bml.BOMLineID,
        ROUND(wo.PlannedQuantity * bml.QuantityPerUnit, 2) AS PlannedComponentQuantity,
        ROUND(wo.PlannedQuantity * bml.QuantityPerUnit * (1.0 + (bml.ScrapFactorPct / 100.0)), 2) AS PlannedWithScrapQuantity
    FROM WorkOrder AS wo
    JOIN Item AS parent
        ON parent.ItemID = wo.ItemID
    JOIN BillOfMaterialLine AS bml
        ON bml.BOMID = wo.BOMID
    JOIN Item AS component
        ON component.ItemID = bml.ComponentItemID
),
actual_issue_usage AS (
    SELECT
        mi.WorkOrderID,
        mil.BOMLineID,
        ROUND(SUM(mil.QuantityIssued), 2) AS ActualIssuedQuantity,
        ROUND(SUM(mil.ExtendedStandardCost), 2) AS ActualIssueCost
    FROM MaterialIssue AS mi
    JOIN MaterialIssueLine AS mil
        ON mil.MaterialIssueID = mi.MaterialIssueID
    GROUP BY mi.WorkOrderID, mil.BOMLineID
)
SELECT
    pcu.WorkOrderNumber,
    pcu.ParentItemCode,
    pcu.ParentItemName,
    pcu.ComponentItemCode,
    pcu.ComponentItemName,
    ROUND(pcu.PlannedQuantity, 2) AS PlannedWorkOrderQuantity,
    pcu.PlannedComponentQuantity,
    pcu.PlannedWithScrapQuantity,
    COALESCE(aiu.ActualIssuedQuantity, 0) AS ActualIssuedQuantity,
    ROUND(COALESCE(aiu.ActualIssuedQuantity, 0) - pcu.PlannedWithScrapQuantity, 2) AS IssueVarianceQuantity,
    COALESCE(aiu.ActualIssueCost, 0) AS ActualIssueCost
FROM planned_component_usage AS pcu
LEFT JOIN actual_issue_usage AS aiu
    ON aiu.WorkOrderID = pcu.WorkOrderID
   AND aiu.BOMLineID = pcu.BOMLineID
ORDER BY pcu.WorkOrderNumber, pcu.ComponentItemCode;
