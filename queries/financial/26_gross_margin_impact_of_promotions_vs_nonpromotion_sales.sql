-- Teaching objective: Compare revenue and gross margin for promoted versus non-promoted sales.
-- Main tables: SalesInvoiceLine, ShipmentLine, SalesInvoice, Item.
-- Expected output shape: One row per month, collection, and promotion flag.
-- Recommended build mode: Either.
-- Interpretation notes: Promotions reduce net revenue through the line discount field while COGS still follows shipped standard cost.

SELECT
    strftime('%Y-%m', si.InvoiceDate) AS InvoiceMonth,
    COALESCE(i.CollectionName, '(No Collection)') AS CollectionName,
    CASE
        WHEN sil.PromotionID IS NOT NULL THEN 'Promotion'
        ELSE 'No Promotion'
    END AS PromotionFlag,
    ROUND(SUM(sil.Quantity), 2) AS InvoicedQuantity,
    ROUND(SUM(sil.LineTotal), 2) AS NetRevenue,
    ROUND(SUM(COALESCE(shl.ExtendedStandardCost, 0)), 2) AS StandardCOGS,
    ROUND(SUM(sil.LineTotal - COALESCE(shl.ExtendedStandardCost, 0)), 2) AS GrossMargin,
    ROUND(
        CASE
            WHEN SUM(sil.LineTotal) = 0 THEN 0
            ELSE SUM(sil.LineTotal - COALESCE(shl.ExtendedStandardCost, 0)) / SUM(sil.LineTotal)
        END * 100,
        2
    ) AS GrossMarginPct
FROM SalesInvoiceLine AS sil
JOIN SalesInvoice AS si
    ON si.SalesInvoiceID = sil.SalesInvoiceID
LEFT JOIN ShipmentLine AS shl
    ON shl.ShipmentLineID = sil.ShipmentLineID
JOIN Item AS i
    ON i.ItemID = sil.ItemID
GROUP BY
    strftime('%Y-%m', si.InvoiceDate),
    COALESCE(i.CollectionName, '(No Collection)'),
    CASE WHEN sil.PromotionID IS NOT NULL THEN 'Promotion' ELSE 'No Promotion' END
ORDER BY
    InvoiceMonth,
    CollectionName,
    PromotionFlag;
