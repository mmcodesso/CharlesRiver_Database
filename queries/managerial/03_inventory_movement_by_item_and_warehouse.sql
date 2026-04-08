-- Teaching objective: Compare inbound and outbound inventory movement by month, warehouse, and item.
-- Main tables: GoodsReceipt, GoodsReceiptLine, Shipment, ShipmentLine, Warehouse, Item.
-- Output shape: One row per activity month, warehouse, and item.
-- Interpretation notes: Inbound cost uses receipt posting basis; outbound cost uses shipment standard cost.

WITH inventory_movements AS (
    SELECT
        substr(gr.ReceiptDate, 1, 7) AS ActivityMonth,
        w.WarehouseName,
        i.ItemGroup,
        i.ItemCode,
        i.ItemName,
        grl.QuantityReceived AS InboundQuantity,
        0.0 AS OutboundQuantity,
        grl.ExtendedStandardCost AS InboundCost,
        0.0 AS OutboundCost
    FROM GoodsReceiptLine AS grl
    JOIN GoodsReceipt AS gr
        ON gr.GoodsReceiptID = grl.GoodsReceiptID
    JOIN Warehouse AS w
        ON w.WarehouseID = gr.WarehouseID
    JOIN Item AS i
        ON i.ItemID = grl.ItemID

    UNION ALL

    SELECT
        substr(sh.ShipmentDate, 1, 7) AS ActivityMonth,
        w.WarehouseName,
        i.ItemGroup,
        i.ItemCode,
        i.ItemName,
        0.0 AS InboundQuantity,
        shl.QuantityShipped AS OutboundQuantity,
        0.0 AS InboundCost,
        shl.ExtendedStandardCost AS OutboundCost
    FROM ShipmentLine AS shl
    JOIN Shipment AS sh
        ON sh.ShipmentID = shl.ShipmentID
    JOIN Warehouse AS w
        ON w.WarehouseID = sh.WarehouseID
    JOIN Item AS i
        ON i.ItemID = shl.ItemID
)
SELECT
    ActivityMonth,
    WarehouseName,
    ItemGroup,
    ItemCode,
    ItemName,
    ROUND(SUM(InboundQuantity), 2) AS InboundQuantity,
    ROUND(SUM(OutboundQuantity), 2) AS OutboundQuantity,
    ROUND(SUM(InboundCost), 2) AS InboundCost,
    ROUND(SUM(OutboundCost), 2) AS OutboundCost,
    ROUND(SUM(InboundQuantity) - SUM(OutboundQuantity), 2) AS NetQuantityMovement
FROM inventory_movements
GROUP BY ActivityMonth, WarehouseName, ItemGroup, ItemCode, ItemName
ORDER BY ActivityMonth, WarehouseName, ItemGroup, ItemCode;
