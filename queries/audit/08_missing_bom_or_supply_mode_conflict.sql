-- Teaching objective: Identify supply-mode and BOM-structure conflicts.
-- Main tables: Item, BillOfMaterial.
-- Output shape: One row per item with a potential BOM or supply-mode issue.
-- Interpretation notes: A clean build should normally return no rows.

WITH active_bom_counts AS (
    SELECT
        ParentItemID AS ItemID,
        COUNT(*) AS ActiveBOMCount
    FROM BillOfMaterial
    WHERE Status = 'Active'
    GROUP BY ParentItemID
)
SELECT
    i.ItemCode,
    i.ItemName,
    i.ItemGroup,
    i.SupplyMode,
    COALESCE(abc.ActiveBOMCount, 0) AS ActiveBOMCount,
    CASE
        WHEN i.SupplyMode = 'Manufactured' AND COALESCE(abc.ActiveBOMCount, 0) <> 1 THEN 'Manufactured item without exactly one active BOM'
        WHEN i.SupplyMode = 'Purchased' AND COALESCE(abc.ActiveBOMCount, 0) > 0 THEN 'Purchased item with active BOM'
        ELSE 'Unknown issue'
    END AS PotentialIssue
FROM Item AS i
LEFT JOIN active_bom_counts AS abc
    ON abc.ItemID = i.ItemID
WHERE (i.SupplyMode = 'Manufactured' AND COALESCE(abc.ActiveBOMCount, 0) <> 1)
   OR (i.SupplyMode = 'Purchased' AND COALESCE(abc.ActiveBOMCount, 0) > 0)
ORDER BY i.ItemGroup, i.ItemCode;
