-- Teaching objective: Compare manufactured-item standard cost to BOM material plus standard conversion cost.
-- Main tables: Item, BillOfMaterial, BillOfMaterialLine.
-- Output shape: One row per manufactured finished good.
-- Interpretation notes: The rolled standard cost should closely match the item master standard cost in the clean build.

WITH active_boms AS (
    SELECT *
    FROM BillOfMaterial
    WHERE Status = 'Active'
),
bom_material_cost AS (
    SELECT
        b.BOMID,
        b.ParentItemID,
        COUNT(*) AS BOMLineCount,
        ROUND(SUM((bml.QuantityPerUnit * (1.0 + (bml.ScrapFactorPct / 100.0))) * component.StandardCost), 2) AS MaterialCostPerUnit
    FROM active_boms AS b
    JOIN BillOfMaterialLine AS bml
        ON bml.BOMID = b.BOMID
    JOIN Item AS component
        ON component.ItemID = bml.ComponentItemID
    GROUP BY b.BOMID, b.ParentItemID
)
SELECT
    parent.ItemGroup,
    parent.ItemCode,
    parent.ItemName,
    bmc.BOMLineCount,
    ROUND(bmc.MaterialCostPerUnit, 2) AS MaterialCostPerUnit,
    ROUND(parent.StandardConversionCost, 2) AS StandardConversionCost,
    ROUND(bmc.MaterialCostPerUnit + parent.StandardConversionCost, 2) AS RolledStandardCost,
    ROUND(parent.StandardCost, 2) AS ItemMasterStandardCost,
    ROUND(parent.StandardCost - (bmc.MaterialCostPerUnit + parent.StandardConversionCost), 2) AS StandardCostDifference,
    ROUND(parent.ListPrice, 2) AS ListPrice
FROM bom_material_cost AS bmc
JOIN Item AS parent
    ON parent.ItemID = bmc.ParentItemID
ORDER BY parent.ItemGroup, parent.ItemCode;
