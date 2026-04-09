-- Teaching objective: Review manufacturing-related ledger movement by period.
-- Main tables: GLEntry, Account, WorkOrderClose.
-- Output shape: One row per fiscal period.
-- Interpretation notes: Amounts are period movement, not ending balances. Use this query to identify when WIP, manufacturing clearing, and variance activity is concentrated.

WITH account_movement AS (
    SELECT
        gl.FiscalYear,
        gl.FiscalPeriod,
        SUM(CASE WHEN a.AccountNumber = '1046' THEN gl.Debit - gl.Credit ELSE 0 END) AS WIPNetMovement,
        SUM(CASE WHEN a.AccountNumber = '1090' THEN gl.Debit - gl.Credit ELSE 0 END) AS ManufacturingClearingNetMovement,
        SUM(CASE WHEN a.AccountNumber = '5080' THEN gl.Debit - gl.Credit ELSE 0 END) AS ManufacturingVarianceNetMovement
    FROM GLEntry AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber IN ('1046', '1090', '5080')
    GROUP BY gl.FiscalYear, gl.FiscalPeriod
),
work_order_close_summary AS (
    SELECT
        CAST(strftime('%Y', CloseDate) AS INTEGER) AS FiscalYear,
        CAST(strftime('%m', CloseDate) AS INTEGER) AS FiscalPeriod,
        COUNT(*) AS WorkOrdersClosed,
        ROUND(SUM(TotalVarianceAmount), 2) AS ClosedVarianceAmount
    FROM WorkOrderClose
    GROUP BY CAST(strftime('%Y', CloseDate) AS INTEGER), CAST(strftime('%m', CloseDate) AS INTEGER)
)
SELECT
    am.FiscalYear,
    am.FiscalPeriod,
    ROUND(am.WIPNetMovement, 2) AS WIPNetMovement,
    ROUND(am.ManufacturingClearingNetMovement, 2) AS ManufacturingClearingNetMovement,
    ROUND(am.ManufacturingVarianceNetMovement, 2) AS ManufacturingVarianceNetMovement,
    COALESCE(wcs.WorkOrdersClosed, 0) AS WorkOrdersClosed,
    COALESCE(wcs.ClosedVarianceAmount, 0) AS ClosedVarianceAmount
FROM account_movement AS am
LEFT JOIN work_order_close_summary AS wcs
    ON wcs.FiscalYear = am.FiscalYear
   AND wcs.FiscalPeriod = am.FiscalPeriod
ORDER BY am.FiscalYear, am.FiscalPeriod;
