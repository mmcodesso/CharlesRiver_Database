-- Teaching objective: Compare margin structure between manufactured and purchased finished goods.
-- Main tables: SalesInvoiceLine, Item.
-- Output shape: One row per supply mode.
-- Interpretation notes: Manufactured items include labor and overhead components. Purchased items mostly carry material-equivalent cost only.

WITH billed_sales AS (
    SELECT
        sil.ItemID,
        ROUND(SUM(sil.Quantity), 2) AS BilledQuantity,
        ROUND(SUM(sil.LineTotal), 2) AS NetSales
    FROM SalesInvoiceLine AS sil
    GROUP BY sil.ItemID
)
SELECT
    i.SupplyMode,
    COUNT(*) AS ItemCount,
    ROUND(SUM(bs.BilledQuantity), 2) AS BilledQuantity,
    ROUND(SUM(bs.NetSales), 2) AS NetSales,
    ROUND(SUM((i.StandardCost - i.StandardConversionCost) * bs.BilledQuantity), 2) AS DirectMaterialCost,
    ROUND(SUM(i.StandardDirectLaborCost * bs.BilledQuantity), 2) AS DirectLaborCost,
    ROUND(SUM(i.StandardVariableOverheadCost * bs.BilledQuantity), 2) AS VariableOverheadCost,
    ROUND(SUM(i.StandardFixedOverheadCost * bs.BilledQuantity), 2) AS FixedOverheadCost,
    ROUND(SUM(bs.NetSales - (i.StandardCost * bs.BilledQuantity)), 2) AS AbsorptionMargin,
    ROUND(
        SUM(
            bs.NetSales
            - ((i.StandardCost - i.StandardConversionCost) * bs.BilledQuantity)
            - (i.StandardDirectLaborCost * bs.BilledQuantity)
            - (i.StandardVariableOverheadCost * bs.BilledQuantity)
        ),
        2
    ) AS ContributionMargin
FROM billed_sales AS bs
JOIN Item AS i
    ON i.ItemID = bs.ItemID
GROUP BY i.SupplyMode
ORDER BY i.SupplyMode;
