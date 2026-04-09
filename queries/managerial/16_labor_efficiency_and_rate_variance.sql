-- Teaching objective: Review direct labor rate and efficiency variance by work order.
-- Main tables: LaborTimeEntry, WorkOrder, Item, ProductionCompletionLine.
-- Output shape: One row per work order with direct labor activity.
-- Interpretation notes: Rate variance isolates wage-rate differences. Efficiency variance isolates hours used versus standard hours allowed.

WITH actual_labor AS (
    SELECT
        lte.WorkOrderID,
        ROUND(SUM(lte.RegularHours + lte.OvertimeHours), 2) AS ActualHours,
        ROUND(SUM(lte.ExtendedLaborCost), 2) AS ActualDirectLaborCost
    FROM LaborTimeEntry AS lte
    WHERE lte.LaborType = 'Direct Manufacturing'
      AND lte.WorkOrderID IS NOT NULL
    GROUP BY lte.WorkOrderID
),
completed_units AS (
    SELECT
        pc.WorkOrderID,
        ROUND(SUM(pcl.QuantityCompleted), 2) AS QuantityCompleted,
        ROUND(SUM(pcl.ExtendedStandardDirectLaborCost), 2) AS StandardDirectLaborCost
    FROM ProductionCompletion AS pc
    JOIN ProductionCompletionLine AS pcl
        ON pcl.ProductionCompletionID = pc.ProductionCompletionID
    GROUP BY pc.WorkOrderID
)
SELECT
    wo.WorkOrderNumber,
    i.ItemCode,
    i.ItemName,
    ROUND(cu.QuantityCompleted, 2) AS QuantityCompleted,
    ROUND(i.StandardLaborHoursPerUnit, 4) AS StandardLaborHoursPerUnit,
    ROUND(cu.QuantityCompleted * i.StandardLaborHoursPerUnit, 2) AS StandardHoursAllowed,
    al.ActualHours,
    ROUND(
        CASE
            WHEN i.StandardLaborHoursPerUnit > 0 THEN i.StandardDirectLaborCost / i.StandardLaborHoursPerUnit
            ELSE 0
        END,
        2
    ) AS StandardHourlyRate,
    al.ActualDirectLaborCost,
    cu.StandardDirectLaborCost,
    ROUND(
        al.ActualDirectLaborCost
        - (
            al.ActualHours * CASE
                WHEN i.StandardLaborHoursPerUnit > 0 THEN i.StandardDirectLaborCost / i.StandardLaborHoursPerUnit
                ELSE 0
            END
        ),
        2
    ) AS LaborRateVariance,
    ROUND(
        (
            al.ActualHours - (cu.QuantityCompleted * i.StandardLaborHoursPerUnit)
        ) * CASE
            WHEN i.StandardLaborHoursPerUnit > 0 THEN i.StandardDirectLaborCost / i.StandardLaborHoursPerUnit
            ELSE 0
        END,
        2
    ) AS LaborEfficiencyVariance
FROM actual_labor AS al
JOIN completed_units AS cu
    ON cu.WorkOrderID = al.WorkOrderID
JOIN WorkOrder AS wo
    ON wo.WorkOrderID = al.WorkOrderID
JOIN Item AS i
    ON i.ItemID = wo.ItemID
ORDER BY ABS(LaborEfficiencyVariance) DESC, ABS(LaborRateVariance) DESC, wo.WorkOrderNumber;
