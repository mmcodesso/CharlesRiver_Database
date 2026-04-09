-- Teaching objective: Review manufactured finished-goods activity by month, warehouse, and item group.
-- Main tables: ProductionCompletion, ProductionCompletionLine, Shipment, ShipmentLine, SalesReturn, SalesReturnLine, WorkOrder, Warehouse, Item.
-- Output shape: One row per fiscal period, warehouse, and item group.
-- Interpretation notes: Net finished-goods movement is a starter proxy for availability pressure, not a full ending-inventory calculation.

WITH completions AS (
    SELECT
        CAST(strftime('%Y', pc.CompletionDate) AS INTEGER) AS FiscalYear,
        CAST(strftime('%m', pc.CompletionDate) AS INTEGER) AS FiscalPeriod,
        pc.WarehouseID,
        i.ItemGroup,
        ROUND(SUM(pcl.QuantityCompleted), 2) AS CompletedQuantity
    FROM ProductionCompletion AS pc
    JOIN ProductionCompletionLine AS pcl
        ON pcl.ProductionCompletionID = pc.ProductionCompletionID
    JOIN Item AS i
        ON i.ItemID = pcl.ItemID
    GROUP BY CAST(strftime('%Y', pc.CompletionDate) AS INTEGER), CAST(strftime('%m', pc.CompletionDate) AS INTEGER), pc.WarehouseID, i.ItemGroup
),
shipments AS (
    SELECT
        CAST(strftime('%Y', s.ShipmentDate) AS INTEGER) AS FiscalYear,
        CAST(strftime('%m', s.ShipmentDate) AS INTEGER) AS FiscalPeriod,
        s.WarehouseID,
        i.ItemGroup,
        ROUND(SUM(sl.QuantityShipped), 2) AS ShippedQuantity
    FROM Shipment AS s
    JOIN ShipmentLine AS sl
        ON sl.ShipmentID = s.ShipmentID
    JOIN Item AS i
        ON i.ItemID = sl.ItemID
    WHERE i.SupplyMode = 'Manufactured'
    GROUP BY CAST(strftime('%Y', s.ShipmentDate) AS INTEGER), CAST(strftime('%m', s.ShipmentDate) AS INTEGER), s.WarehouseID, i.ItemGroup
),
returns AS (
    SELECT
        CAST(strftime('%Y', sr.ReturnDate) AS INTEGER) AS FiscalYear,
        CAST(strftime('%m', sr.ReturnDate) AS INTEGER) AS FiscalPeriod,
        sr.WarehouseID,
        i.ItemGroup,
        ROUND(SUM(srl.QuantityReturned), 2) AS ReturnedQuantity
    FROM SalesReturn AS sr
    JOIN SalesReturnLine AS srl
        ON srl.SalesReturnID = sr.SalesReturnID
    JOIN Item AS i
        ON i.ItemID = srl.ItemID
    WHERE i.SupplyMode = 'Manufactured'
    GROUP BY CAST(strftime('%Y', sr.ReturnDate) AS INTEGER), CAST(strftime('%m', sr.ReturnDate) AS INTEGER), sr.WarehouseID, i.ItemGroup
),
all_periods AS (
    SELECT FiscalYear, FiscalPeriod, WarehouseID, ItemGroup FROM completions
    UNION
    SELECT FiscalYear, FiscalPeriod, WarehouseID, ItemGroup FROM shipments
    UNION
    SELECT FiscalYear, FiscalPeriod, WarehouseID, ItemGroup FROM returns
)
SELECT
    ap.FiscalYear,
    ap.FiscalPeriod,
    w.WarehouseName,
    ap.ItemGroup,
    COALESCE(c.CompletedQuantity, 0) AS CompletedQuantity,
    COALESCE(s.ShippedQuantity, 0) AS ShippedQuantity,
    COALESCE(r.ReturnedQuantity, 0) AS ReturnedQuantity,
    ROUND(COALESCE(c.CompletedQuantity, 0) + COALESCE(r.ReturnedQuantity, 0) - COALESCE(s.ShippedQuantity, 0), 2) AS NetFinishedGoodsMovement
FROM all_periods AS ap
JOIN Warehouse AS w
    ON w.WarehouseID = ap.WarehouseID
LEFT JOIN completions AS c
    ON c.FiscalYear = ap.FiscalYear
   AND c.FiscalPeriod = ap.FiscalPeriod
   AND c.WarehouseID = ap.WarehouseID
   AND c.ItemGroup = ap.ItemGroup
LEFT JOIN shipments AS s
    ON s.FiscalYear = ap.FiscalYear
   AND s.FiscalPeriod = ap.FiscalPeriod
   AND s.WarehouseID = ap.WarehouseID
   AND s.ItemGroup = ap.ItemGroup
LEFT JOIN returns AS r
    ON r.FiscalYear = ap.FiscalYear
   AND r.FiscalPeriod = ap.FiscalPeriod
   AND r.WarehouseID = ap.WarehouseID
   AND r.ItemGroup = ap.ItemGroup
ORDER BY ap.FiscalYear, ap.FiscalPeriod, w.WarehouseName, ap.ItemGroup;
