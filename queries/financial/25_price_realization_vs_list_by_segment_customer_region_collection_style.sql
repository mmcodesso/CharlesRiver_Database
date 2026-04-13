-- Teaching objective: Compare realized billed pricing to base list price by customer, segment, region, and product portfolio.
-- Main tables: SalesInvoice, SalesInvoiceLine, Customer, Item.
-- Expected output shape: One row per month, region, customer segment, customer, collection, and style family.
-- Recommended build mode: Either.
-- Interpretation notes: Price realization below 100% reflects price-list discounts, promotions, or approved overrides layered beneath list price.

SELECT
    strftime('%Y-%m', si.InvoiceDate) AS InvoiceMonth,
    c.Region,
    c.CustomerSegment,
    c.CustomerName,
    COALESCE(i.CollectionName, '(No Collection)') AS CollectionName,
    COALESCE(i.StyleFamily, '(No Style Family)') AS StyleFamily,
    ROUND(SUM(sil.Quantity), 2) AS InvoicedQuantity,
    ROUND(SUM(sil.Quantity * sil.BaseListPrice), 2) AS BaseListRevenue,
    ROUND(SUM(sil.LineTotal), 2) AS NetRevenue,
    ROUND(AVG(sil.Discount) * 100, 2) AS AveragePromotionDiscountPct,
    ROUND(
        CASE
            WHEN SUM(sil.Quantity * sil.BaseListPrice) = 0 THEN 0
            ELSE SUM(sil.LineTotal) / SUM(sil.Quantity * sil.BaseListPrice)
        END * 100,
        2
    ) AS PriceRealizationPct
FROM SalesInvoiceLine AS sil
JOIN SalesInvoice AS si
    ON si.SalesInvoiceID = sil.SalesInvoiceID
JOIN Customer AS c
    ON c.CustomerID = si.CustomerID
JOIN Item AS i
    ON i.ItemID = sil.ItemID
GROUP BY
    strftime('%Y-%m', si.InvoiceDate),
    c.Region,
    c.CustomerSegment,
    c.CustomerName,
    COALESCE(i.CollectionName, '(No Collection)'),
    COALESCE(i.StyleFamily, '(No Style Family)')
ORDER BY
    InvoiceMonth,
    NetRevenue DESC,
    c.Region,
    c.CustomerSegment,
    c.CustomerName;
