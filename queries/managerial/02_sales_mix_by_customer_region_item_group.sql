-- Teaching objective: Analyze billed sales mix by customer geography, customer segment, and product family.
-- Main tables: SalesInvoice, SalesInvoiceLine, Customer, Item.
-- Output shape: One row per invoice month, region, customer segment, item group, and item.
-- Interpretation notes: This is a billed-sales view, so timing follows invoice dates rather than shipment dates.

SELECT
    substr(si.InvoiceDate, 1, 7) AS InvoiceMonth,
    c.Region,
    c.CustomerSegment,
    i.ItemGroup,
    i.ItemCode,
    i.ItemName,
    ROUND(SUM(sil.Quantity), 2) AS BilledQuantity,
    ROUND(SUM(sil.LineTotal), 2) AS RevenueAmount,
    ROUND(AVG(sil.UnitPrice), 2) AS AverageUnitPrice
FROM SalesInvoiceLine AS sil
JOIN SalesInvoice AS si
    ON si.SalesInvoiceID = sil.SalesInvoiceID
JOIN Customer AS c
    ON c.CustomerID = si.CustomerID
JOIN Item AS i
    ON i.ItemID = sil.ItemID
GROUP BY
    substr(si.InvoiceDate, 1, 7),
    c.Region,
    c.CustomerSegment,
    i.ItemGroup,
    i.ItemCode,
    i.ItemName
ORDER BY InvoiceMonth, c.Region, c.CustomerSegment, RevenueAmount DESC, i.ItemCode;
