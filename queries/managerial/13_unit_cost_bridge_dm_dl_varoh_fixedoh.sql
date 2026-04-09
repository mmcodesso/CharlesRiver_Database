-- Teaching objective: Show the standard unit-cost bridge for manufactured finished goods.
-- Main tables: Item.
-- Output shape: One row per manufactured item.
-- Interpretation notes: Standard cost is decomposed into direct material, direct labor, variable overhead, and fixed overhead for manufactured items.

SELECT
    ItemCode,
    ItemName,
    ItemGroup,
    UnitOfMeasure,
    ROUND(StandardCost - StandardConversionCost, 2) AS StandardDirectMaterialCost,
    ROUND(StandardDirectLaborCost, 2) AS StandardDirectLaborCost,
    ROUND(StandardVariableOverheadCost, 2) AS StandardVariableOverheadCost,
    ROUND(StandardFixedOverheadCost, 2) AS StandardFixedOverheadCost,
    ROUND(StandardConversionCost, 2) AS StandardConversionCost,
    ROUND(StandardCost, 2) AS StandardAbsorptionUnitCost,
    ROUND(ListPrice, 2) AS ListPrice,
    ROUND(ListPrice - StandardCost, 2) AS StandardAbsorptionMargin
FROM Item
WHERE SupplyMode = 'Manufactured'
ORDER BY ItemGroup, ItemCode;
