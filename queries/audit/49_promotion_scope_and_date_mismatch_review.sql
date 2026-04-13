-- Teaching objective: Find sales lines that use a promotion outside the allowed date window or scope.
-- Main tables: SalesOrder, SalesOrderLine, PromotionProgram, Customer, Item.
-- Expected output shape: One row per mismatched promoted sales line.
-- Recommended build mode: Default.
-- Interpretation notes: This query checks the promotion rules themselves, not whether promotional selling is profitable.

SELECT
    so.OrderNumber,
    so.OrderDate,
    c.CustomerName,
    c.CustomerSegment,
    i.ItemCode,
    i.ItemName,
    p.PromotionCode,
    p.ScopeType,
    p.EffectiveStartDate,
    p.EffectiveEndDate,
    sol.Discount
FROM SalesOrderLine AS sol
JOIN SalesOrder AS so
    ON so.SalesOrderID = sol.SalesOrderID
JOIN Customer AS c
    ON c.CustomerID = so.CustomerID
JOIN Item AS i
    ON i.ItemID = sol.ItemID
JOIN PromotionProgram AS p
    ON p.PromotionID = sol.PromotionID
WHERE sol.PromotionID IS NOT NULL
  AND (
        date(so.OrderDate) < date(p.EffectiveStartDate)
        OR date(so.OrderDate) > date(p.EffectiveEndDate)
        OR (p.ScopeType = 'Segment' AND c.CustomerSegment <> p.CustomerSegment)
        OR (p.ScopeType = 'ItemGroup' AND i.ItemGroup <> p.ItemGroup)
        OR (p.ScopeType = 'Collection' AND COALESCE(i.CollectionName, '') <> COALESCE(p.CollectionName, ''))
      )
ORDER BY
    so.OrderDate,
    so.OrderNumber,
    sol.SalesOrderLineID;
