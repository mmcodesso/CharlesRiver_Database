-- Teaching objective: Review override approvals that are incomplete or missing from override-priced sales lines.
-- Main tables: PriceOverrideApproval, SalesOrderLine, SalesOrder, Customer, Item, PriceListLine.
-- Expected output shape: One row per incomplete approval or missing linked approval.
-- Recommended build mode: Default.
-- Interpretation notes: This query separates approval-record completeness from pure price-floor exception review.

WITH incomplete_approval AS (
    SELECT
        'Incomplete Approval Record' AS ReviewType,
        poa.PriceOverrideApprovalID,
        so.OrderNumber,
        so.OrderDate,
        c.CustomerName,
        i.ItemCode,
        sol.SalesOrderLineID,
        ROUND(sol.UnitPrice, 2) AS UnitPrice,
        ROUND(pll.MinimumUnitPrice, 2) AS MinimumUnitPrice
    FROM PriceOverrideApproval AS poa
    JOIN SalesOrderLine AS sol
        ON sol.SalesOrderLineID = poa.SalesOrderLineID
    JOIN SalesOrder AS so
        ON so.SalesOrderID = sol.SalesOrderID
    JOIN Customer AS c
        ON c.CustomerID = so.CustomerID
    JOIN Item AS i
        ON i.ItemID = sol.ItemID
    LEFT JOIN PriceListLine AS pll
        ON pll.PriceListLineID = sol.PriceListLineID
    WHERE poa.ApprovedByEmployeeID IS NULL
       OR poa.ApprovedDate IS NULL
       OR poa.Status <> 'Approved'
),
missing_link AS (
    SELECT
        'Missing Override Link' AS ReviewType,
        NULL AS PriceOverrideApprovalID,
        so.OrderNumber,
        so.OrderDate,
        c.CustomerName,
        i.ItemCode,
        sol.SalesOrderLineID,
        ROUND(sol.UnitPrice, 2) AS UnitPrice,
        ROUND(pll.MinimumUnitPrice, 2) AS MinimumUnitPrice
    FROM SalesOrderLine AS sol
    JOIN SalesOrder AS so
        ON so.SalesOrderID = sol.SalesOrderID
    JOIN Customer AS c
        ON c.CustomerID = so.CustomerID
    JOIN Item AS i
        ON i.ItemID = sol.ItemID
    JOIN PriceListLine AS pll
        ON pll.PriceListLineID = sol.PriceListLineID
    WHERE sol.PriceOverrideApprovalID IS NULL
      AND ROUND(sol.UnitPrice, 2) < ROUND(pll.MinimumUnitPrice, 2)
)
SELECT *
FROM incomplete_approval
UNION ALL
SELECT *
FROM missing_link
ORDER BY
    ReviewType,
    OrderDate,
    OrderNumber,
    SalesOrderLineID;
