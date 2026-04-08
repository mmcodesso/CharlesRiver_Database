-- Teaching objective: Estimate product-level profitability from billed revenue and shipped cost.
-- Main tables: SalesOrderLine, SalesInvoiceLine, ShipmentLine, Item.
-- Output shape: One row per item.
-- Interpretation notes: Revenue is aggregated from invoice lines tied to the sales order line; cost is aggregated from shipment lines tied to the same sales order line.

WITH line_revenue AS (
    SELECT
        SalesOrderLineID,
        ROUND(SUM(LineTotal), 2) AS RevenueAmount
    FROM SalesInvoiceLine
    GROUP BY SalesOrderLineID
),
line_cogs AS (
    SELECT
        SalesOrderLineID,
        ROUND(SUM(ExtendedStandardCost), 2) AS COGSAmount
    FROM ShipmentLine
    GROUP BY SalesOrderLineID
)
SELECT
    i.ItemGroup,
    i.ItemCode,
    i.ItemName,
    COUNT(DISTINCT sol.SalesOrderLineID) AS SalesOrderLineCount,
    ROUND(SUM(sol.Quantity), 2) AS OrderedQuantity,
    ROUND(SUM(COALESCE(lr.RevenueAmount, 0)), 2) AS RevenueAmount,
    ROUND(SUM(COALESCE(lc.COGSAmount, 0)), 2) AS COGSAmount,
    ROUND(SUM(COALESCE(lr.RevenueAmount, 0) - COALESCE(lc.COGSAmount, 0)), 2) AS GrossMargin,
    CASE
        WHEN ROUND(SUM(COALESCE(lr.RevenueAmount, 0)), 2) = 0 THEN NULL
        ELSE ROUND(
            SUM(COALESCE(lr.RevenueAmount, 0) - COALESCE(lc.COGSAmount, 0))
            / SUM(COALESCE(lr.RevenueAmount, 0)) * 100.0,
            2
        )
    END AS GrossMarginPct
FROM SalesOrderLine AS sol
JOIN Item AS i
    ON i.ItemID = sol.ItemID
LEFT JOIN line_revenue AS lr
    ON lr.SalesOrderLineID = sol.SalesOrderLineID
LEFT JOIN line_cogs AS lc
    ON lc.SalesOrderLineID = sol.SalesOrderLineID
GROUP BY i.ItemGroup, i.ItemCode, i.ItemName
HAVING ROUND(SUM(COALESCE(lr.RevenueAmount, 0)), 2) <> 0
    OR ROUND(SUM(COALESCE(lc.COGSAmount, 0)), 2) <> 0
ORDER BY GrossMargin DESC, RevenueAmount DESC, i.ItemCode;
