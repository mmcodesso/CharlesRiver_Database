-- Teaching objective: Compare absorption margin and contribution margin by item and supply mode.
-- Main tables: SalesInvoiceLine, SalesInvoice, Item.
-- Output shape: One row per item.
-- Interpretation notes: Contribution margin excludes fixed overhead. Purchased items carry zero labor and overhead components in this bridge.

WITH billed_sales AS (
    SELECT
        sil.ItemID,
        ROUND(SUM(sil.Quantity), 2) AS BilledQuantity,
        ROUND(SUM(sil.LineTotal), 2) AS NetSales
    FROM SalesInvoiceLine AS sil
    JOIN SalesInvoice AS si
        ON si.SalesInvoiceID = sil.SalesInvoiceID
    GROUP BY sil.ItemID
)
SELECT
    i.ItemCode,
    i.ItemName,
    i.ItemGroup,
    i.SupplyMode,
    bs.BilledQuantity,
    bs.NetSales,
    ROUND((i.StandardCost - i.StandardConversionCost) * bs.BilledQuantity, 2) AS DirectMaterialCost,
    ROUND(i.StandardDirectLaborCost * bs.BilledQuantity, 2) AS DirectLaborCost,
    ROUND(i.StandardVariableOverheadCost * bs.BilledQuantity, 2) AS VariableOverheadCost,
    ROUND(i.StandardFixedOverheadCost * bs.BilledQuantity, 2) AS FixedOverheadCost,
    ROUND(bs.NetSales - (i.StandardCost * bs.BilledQuantity), 2) AS AbsorptionMargin,
    ROUND(
        bs.NetSales
        - ((i.StandardCost - i.StandardConversionCost) * bs.BilledQuantity)
        - (i.StandardDirectLaborCost * bs.BilledQuantity)
        - (i.StandardVariableOverheadCost * bs.BilledQuantity),
        2
    ) AS ContributionMargin
FROM billed_sales AS bs
JOIN Item AS i
    ON i.ItemID = bs.ItemID
ORDER BY ContributionMargin DESC, i.ItemCode;
