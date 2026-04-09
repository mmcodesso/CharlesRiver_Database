-- Teaching objective: Review manufacturing variance by month, item group, and warehouse.
-- Main tables: WorkOrderClose, WorkOrder, Item, Warehouse.
-- Output shape: One row per close month, warehouse, and item group.
-- Interpretation notes: Positive variance means actual cost exceeded standard cost in aggregate for the closed work orders.

SELECT
    CAST(strftime('%Y', woc.CloseDate) AS INTEGER) AS FiscalYear,
    CAST(strftime('%m', woc.CloseDate) AS INTEGER) AS FiscalPeriod,
    w.WarehouseName,
    i.ItemGroup,
    COUNT(*) AS ClosedWorkOrderCount,
    ROUND(SUM(woc.MaterialVarianceAmount), 2) AS MaterialVarianceAmount,
    ROUND(SUM(woc.ConversionVarianceAmount), 2) AS ConversionVarianceAmount,
    ROUND(SUM(woc.TotalVarianceAmount), 2) AS TotalVarianceAmount
FROM WorkOrderClose AS woc
JOIN WorkOrder AS wo
    ON wo.WorkOrderID = woc.WorkOrderID
JOIN Item AS i
    ON i.ItemID = wo.ItemID
JOIN Warehouse AS w
    ON w.WarehouseID = wo.WarehouseID
GROUP BY CAST(strftime('%Y', woc.CloseDate) AS INTEGER), CAST(strftime('%m', woc.CloseDate) AS INTEGER), w.WarehouseName, i.ItemGroup
ORDER BY FiscalYear, FiscalPeriod, w.WarehouseName, i.ItemGroup;
