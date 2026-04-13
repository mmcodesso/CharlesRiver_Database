-- Teaching objective: Identify customer orders that bypass an available customer-specific price list.
-- Main tables: SalesOrder, SalesOrderLine, Customer, PriceList, PriceListLine.
-- Expected output shape: One row per bypassed sales order line.
-- Recommended build mode: Default.
-- Interpretation notes: A bypass is an exception only when a valid customer-specific list exists for the customer, item, date, and quantity.

WITH customer_specific_options AS (
    SELECT
        so.SalesOrderID,
        sol.SalesOrderLineID,
        MAX(CASE WHEN pl.ScopeType = 'Customer' THEN 1 ELSE 0 END) AS HasCustomerSpecificOption
    FROM SalesOrder AS so
    JOIN SalesOrderLine AS sol
        ON sol.SalesOrderID = so.SalesOrderID
    JOIN Customer AS c
        ON c.CustomerID = so.CustomerID
    JOIN PriceList AS pl
        ON pl.ScopeType = 'Customer'
       AND pl.CustomerID = c.CustomerID
       AND date(so.OrderDate) BETWEEN date(pl.EffectiveStartDate) AND date(pl.EffectiveEndDate)
    JOIN PriceListLine AS pll
        ON pll.PriceListID = pl.PriceListID
       AND pll.ItemID = sol.ItemID
       AND sol.Quantity >= pll.MinimumQuantity
    GROUP BY
        so.SalesOrderID,
        sol.SalesOrderLineID
)
SELECT
    so.OrderNumber,
    so.OrderDate,
    c.CustomerName,
    c.CustomerSegment,
    sol.SalesOrderLineID,
    sol.PricingMethod,
    sol.PriceListLineID
FROM SalesOrderLine AS sol
JOIN SalesOrder AS so
    ON so.SalesOrderID = sol.SalesOrderID
JOIN Customer AS c
    ON c.CustomerID = so.CustomerID
JOIN customer_specific_options AS cso
    ON cso.SalesOrderLineID = sol.SalesOrderLineID
WHERE cso.HasCustomerSpecificOption = 1
  AND sol.PricingMethod <> 'Customer Price List'
ORDER BY
    so.OrderDate,
    so.OrderNumber,
    sol.SalesOrderLineID;
