-- Teaching objective: Compare collection-level revenue before promotions to net revenue after promotions.
-- Main tables: SalesInvoiceLine, ShipmentLine, SalesInvoice, Item.
-- Expected output shape: One row per month and collection.
-- Recommended build mode: Either.
-- Interpretation notes: This query isolates the revenue effect of promotions before subtracting standard shipment cost.

SELECT
    strftime('%Y-%m', si.InvoiceDate) AS InvoiceMonth,
    COALESCE(i.CollectionName, '(No Collection)') AS CollectionName,
    ROUND(SUM(sil.Quantity * sil.UnitPrice), 2) AS RevenueBeforePromotions,
    ROUND(SUM(sil.LineTotal), 2) AS RevenueAfterPromotions,
    ROUND(SUM(sil.Quantity * sil.UnitPrice) - SUM(sil.LineTotal), 2) AS PromotionRevenueReduction,
    ROUND(SUM(COALESCE(shl.ExtendedStandardCost, 0)), 2) AS StandardCOGS,
    ROUND(SUM(sil.LineTotal - COALESCE(shl.ExtendedStandardCost, 0)), 2) AS GrossMarginAfterPromotions
FROM SalesInvoiceLine AS sil
JOIN SalesInvoice AS si
    ON si.SalesInvoiceID = sil.SalesInvoiceID
LEFT JOIN ShipmentLine AS shl
    ON shl.ShipmentLineID = sil.ShipmentLineID
JOIN Item AS i
    ON i.ItemID = sil.ItemID
GROUP BY
    strftime('%Y-%m', si.InvoiceDate),
    COALESCE(i.CollectionName, '(No Collection)')
ORDER BY
    InvoiceMonth,
    RevenueAfterPromotions DESC,
    CollectionName;
