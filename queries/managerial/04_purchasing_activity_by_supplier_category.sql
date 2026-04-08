-- Teaching objective: Review purchasing volume by supplier, supplier category, and item group.
-- Main tables: PurchaseOrder, PurchaseOrderLine, Supplier, Item.
-- Output shape: One row per order month, supplier, and item group.
-- Interpretation notes: This query focuses on commitments at PO creation, not later receipts or invoicing.

SELECT
    substr(po.OrderDate, 1, 7) AS OrderMonth,
    s.SupplierCategory,
    s.SupplierRiskRating,
    s.SupplierName,
    i.ItemGroup,
    COUNT(DISTINCT po.PurchaseOrderID) AS PurchaseOrderCount,
    COUNT(pol.POLineID) AS PurchaseOrderLineCount,
    ROUND(SUM(pol.Quantity), 2) AS OrderedQuantity,
    ROUND(SUM(pol.LineTotal), 2) AS OrderedValue
FROM PurchaseOrderLine AS pol
JOIN PurchaseOrder AS po
    ON po.PurchaseOrderID = pol.PurchaseOrderID
JOIN Supplier AS s
    ON s.SupplierID = po.SupplierID
JOIN Item AS i
    ON i.ItemID = pol.ItemID
GROUP BY
    substr(po.OrderDate, 1, 7),
    s.SupplierCategory,
    s.SupplierRiskRating,
    s.SupplierName,
    i.ItemGroup
ORDER BY OrderMonth, s.SupplierCategory, OrderedValue DESC, s.SupplierName;
