-- Teaching objective: Review how often sales lines sit at or below the price floor and how often override approvals are used.
-- Main tables: SalesOrder, SalesOrderLine, PriceListLine.
-- Expected output shape: One row per month.
-- Recommended build mode: Either.
-- Interpretation notes: Price-floor pressure should concentrate in selected months and customer types, not dominate the full sales book.

SELECT
    strftime('%Y-%m', so.OrderDate) AS OrderMonth,
    COUNT(*) AS SalesOrderLineCount,
    SUM(CASE WHEN sol.PriceOverrideApprovalID IS NOT NULL THEN 1 ELSE 0 END) AS OverrideLineCount,
    SUM(
        CASE
            WHEN pll.PriceListLineID IS NOT NULL AND ROUND(sol.UnitPrice, 2) <= ROUND(pll.MinimumUnitPrice, 2) THEN 1
            ELSE 0
        END
    ) AS AtOrBelowFloorLineCount,
    ROUND(AVG(sol.Discount) * 100, 2) AS AveragePromotionDiscountPct,
    ROUND(
        CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE SUM(CASE WHEN sol.PriceOverrideApprovalID IS NOT NULL THEN 1 ELSE 0 END) * 1.0 / COUNT(*)
        END * 100,
        2
    ) AS OverrideRatePct
FROM SalesOrderLine AS sol
JOIN SalesOrder AS so
    ON so.SalesOrderID = sol.SalesOrderID
LEFT JOIN PriceListLine AS pll
    ON pll.PriceListLineID = sol.PriceListLineID
GROUP BY
    strftime('%Y-%m', so.OrderDate)
ORDER BY
    OrderMonth;
