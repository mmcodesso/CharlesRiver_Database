-- Teaching objective: Review price lists that are used after expiry or overlap another active list for the same scope.
-- Main tables: PriceList, PriceListLine, SalesOrder, SalesOrderLine.
-- Expected output shape: One row per expired-use or overlapping-scope exception.
-- Recommended build mode: Default.
-- Interpretation notes: Overlap is a master-data governance issue; expired use is a transaction-support issue.

WITH overlapping_lists AS (
    SELECT
        'Overlapping Active Price List' AS ReviewType,
        p1.PriceListID AS PriceListID,
        NULL AS OrderNumber,
        NULL AS OrderDate,
        p1.ScopeType,
        COALESCE(CAST(p1.CustomerID AS TEXT), p1.CustomerSegment) AS ScopeValue,
        p1.EffectiveStartDate,
        p1.EffectiveEndDate
    FROM PriceList AS p1
    JOIN PriceList AS p2
        ON p1.PriceListID < p2.PriceListID
       AND p1.ScopeType = p2.ScopeType
       AND COALESCE(CAST(p1.CustomerID AS TEXT), p1.CustomerSegment) = COALESCE(CAST(p2.CustomerID AS TEXT), p2.CustomerSegment)
       AND p1.Status = 'Active'
       AND p2.Status = 'Active'
       AND date(p1.EffectiveStartDate) <= date(p2.EffectiveEndDate)
       AND date(p2.EffectiveStartDate) <= date(p1.EffectiveEndDate)
),
expired_use AS (
    SELECT
        'Expired Price List Used' AS ReviewType,
        pl.PriceListID,
        so.OrderNumber,
        so.OrderDate,
        pl.ScopeType,
        COALESCE(CAST(pl.CustomerID AS TEXT), pl.CustomerSegment) AS ScopeValue,
        pl.EffectiveStartDate,
        pl.EffectiveEndDate
    FROM SalesOrderLine AS sol
    JOIN SalesOrder AS so
        ON so.SalesOrderID = sol.SalesOrderID
    JOIN PriceListLine AS pll
        ON pll.PriceListLineID = sol.PriceListLineID
    JOIN PriceList AS pl
        ON pl.PriceListID = pll.PriceListID
    WHERE date(so.OrderDate) > date(pl.EffectiveEndDate)
       OR pl.Status = 'Expired'
)
SELECT *
FROM (
    SELECT *
    FROM overlapping_lists
    UNION ALL
    SELECT *
    FROM expired_use
)
ORDER BY
    ReviewType,
    COALESCE(OrderDate, EffectiveStartDate),
    PriceListID;
