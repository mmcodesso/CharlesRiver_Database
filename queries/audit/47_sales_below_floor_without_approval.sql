-- Teaching objective: Identify sales lines priced below the configured floor without a valid override approval.
-- Main tables: SalesOrder, SalesOrderLine, PriceListLine, Customer, Item.
-- Expected output shape: One row per offending sales order line.
-- Recommended build mode: Default.
-- Interpretation notes: A line below floor is not automatically wrong if an override exists; this query isolates the no-approval condition.

SELECT
    so.OrderNumber,
    so.OrderDate,
    c.CustomerName,
    c.CustomerSegment,
    i.ItemCode,
    i.ItemName,
    sol.Quantity,
    ROUND(sol.UnitPrice, 2) AS UnitPrice,
    ROUND(pll.MinimumUnitPrice, 2) AS MinimumUnitPrice,
    sol.PricingMethod,
    sol.PriceOverrideApprovalID
FROM SalesOrderLine AS sol
JOIN SalesOrder AS so
    ON so.SalesOrderID = sol.SalesOrderID
JOIN Customer AS c
    ON c.CustomerID = so.CustomerID
JOIN Item AS i
    ON i.ItemID = sol.ItemID
JOIN PriceListLine AS pll
    ON pll.PriceListLineID = sol.PriceListLineID
WHERE ROUND(sol.UnitPrice, 2) < ROUND(pll.MinimumUnitPrice, 2)
  AND sol.PriceOverrideApprovalID IS NULL
ORDER BY
    so.OrderDate,
    so.OrderNumber,
    sol.SalesOrderLineID;
