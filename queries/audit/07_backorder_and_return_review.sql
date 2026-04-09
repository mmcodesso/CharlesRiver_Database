-- Teaching objective: Identify backordered orders and orders that later experienced returns or credit memos.
-- Main tables: SalesOrder, SalesOrderLine, ShipmentLine, SalesInvoiceLine, SalesReturn, SalesReturnLine, CreditMemo.
-- Output shape: One row per sales order with backorder and return indicators.
-- Interpretation notes: This query is useful for cut-off, fulfillment, and customer-service exception analysis.

WITH shipped_by_line AS (
    SELECT
        SalesOrderLineID,
        ROUND(SUM(QuantityShipped), 2) AS ShippedQuantity
    FROM ShipmentLine
    GROUP BY SalesOrderLineID
),
billed_by_line AS (
    SELECT
        SalesOrderLineID,
        ROUND(SUM(Quantity), 2) AS BilledQuantity
    FROM SalesInvoiceLine
    GROUP BY SalesOrderLineID
),
returns_by_order AS (
    SELECT
        sr.SalesOrderID,
        COUNT(DISTINCT sr.SalesReturnID) AS ReturnCount,
        ROUND(SUM(srl.QuantityReturned), 2) AS ReturnedQuantity,
        ROUND(SUM(COALESCE(cm.GrandTotal, 0)), 2) AS CreditedAmount
    FROM SalesReturn AS sr
    JOIN SalesReturnLine AS srl
        ON srl.SalesReturnID = sr.SalesReturnID
    LEFT JOIN CreditMemo AS cm
        ON cm.SalesReturnID = sr.SalesReturnID
    GROUP BY sr.SalesOrderID
)
SELECT
    so.OrderNumber,
    so.Status,
    date(so.OrderDate) AS OrderDate,
    date(so.RequestedDeliveryDate) AS RequestedDeliveryDate,
    ROUND(SUM(sol.Quantity), 2) AS OrderedQuantity,
    ROUND(SUM(COALESCE(sbl.ShippedQuantity, 0)), 2) AS ShippedQuantity,
    ROUND(SUM(COALESCE(bbl.BilledQuantity, 0)), 2) AS BilledQuantity,
    ROUND(SUM(sol.Quantity) - SUM(COALESCE(sbl.ShippedQuantity, 0)), 2) AS BackorderedQuantity,
    COALESCE(rbo.ReturnCount, 0) AS ReturnCount,
    COALESCE(rbo.ReturnedQuantity, 0) AS ReturnedQuantity,
    COALESCE(rbo.CreditedAmount, 0) AS CreditedAmount
FROM SalesOrder AS so
JOIN SalesOrderLine AS sol
    ON sol.SalesOrderID = so.SalesOrderID
LEFT JOIN shipped_by_line AS sbl
    ON sbl.SalesOrderLineID = sol.SalesOrderLineID
LEFT JOIN billed_by_line AS bbl
    ON bbl.SalesOrderLineID = sol.SalesOrderLineID
LEFT JOIN returns_by_order AS rbo
    ON rbo.SalesOrderID = so.SalesOrderID
GROUP BY so.OrderNumber, so.Status, so.OrderDate, so.RequestedDeliveryDate, rbo.ReturnCount, rbo.ReturnedQuantity, rbo.CreditedAmount
HAVING ROUND(SUM(sol.Quantity) - SUM(COALESCE(sbl.ShippedQuantity, 0)), 2) > 0
    OR COALESCE(rbo.ReturnCount, 0) > 0
ORDER BY RequestedDeliveryDate, OrderNumber;
