-- Teaching objective: Review override concentration and promotion discount dispersion by sales rep and customer segment.
-- Main tables: SalesOrder, SalesOrderLine, Employee, Customer.
-- Expected output shape: One row per sales rep and customer segment.
-- Recommended build mode: Either.
-- Interpretation notes: Override concentration can suggest negotiation pressure, large-project selling, or weak price-floor discipline.

SELECT
    e.EmployeeName AS SalesRepName,
    c.CustomerSegment,
    COUNT(*) AS SalesOrderLineCount,
    SUM(CASE WHEN sol.PriceOverrideApprovalID IS NOT NULL THEN 1 ELSE 0 END) AS OverrideLineCount,
    ROUND(AVG(sol.Discount) * 100, 2) AS AveragePromotionDiscountPct,
    ROUND(MAX(sol.Discount) * 100, 2) AS MaximumPromotionDiscountPct,
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
JOIN Employee AS e
    ON e.EmployeeID = so.SalesRepEmployeeID
JOIN Customer AS c
    ON c.CustomerID = so.CustomerID
GROUP BY
    e.EmployeeName,
    c.CustomerSegment
ORDER BY
    OverrideRatePct DESC,
    SalesOrderLineCount DESC,
    e.EmployeeName,
    c.CustomerSegment;
