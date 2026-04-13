-- Teaching objective: Show which customers depend most on customer-specific pricing instead of segment pricing.
-- Main tables: SalesOrder, SalesOrderLine, Customer.
-- Expected output shape: One row per customer.
-- Recommended build mode: Either.
-- Interpretation notes: Customer-specific pricing concentration helps frame commercial dependency and negotiation complexity.

SELECT
    c.CustomerName,
    c.Region,
    c.CustomerSegment,
    COUNT(*) AS SalesOrderLineCount,
    SUM(CASE WHEN sol.PricingMethod = 'Customer Price List' THEN 1 ELSE 0 END) AS CustomerSpecificLineCount,
    ROUND(SUM(sol.LineTotal), 2) AS NetOrderValue,
    ROUND(
        CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE SUM(CASE WHEN sol.PricingMethod = 'Customer Price List' THEN 1 ELSE 0 END) * 1.0 / COUNT(*)
        END * 100,
        2
    ) AS CustomerSpecificLineSharePct
FROM SalesOrderLine AS sol
JOIN SalesOrder AS so
    ON so.SalesOrderID = sol.SalesOrderID
JOIN Customer AS c
    ON c.CustomerID = so.CustomerID
GROUP BY
    c.CustomerName,
    c.Region,
    c.CustomerSegment
HAVING CustomerSpecificLineCount > 0
ORDER BY
    CustomerSpecificLineSharePct DESC,
    NetOrderValue DESC,
    c.CustomerName;
