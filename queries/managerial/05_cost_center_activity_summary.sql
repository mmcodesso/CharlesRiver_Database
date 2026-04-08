-- Teaching objective: Summarize operational volume and posted operating expense by cost center and month.
-- Main tables: SalesOrder, PurchaseRequisition, GLEntry, Account, JournalEntry, CostCenter.
-- Output shape: One row per activity month and cost center.
-- Interpretation notes: Posted operating expense includes manual journals and operational expense postings, excluding year-end close activity.

WITH sales_activity AS (
    SELECT
        substr(OrderDate, 1, 7) AS ActivityMonth,
        CostCenterID,
        COUNT(*) AS SalesOrderCount,
        ROUND(SUM(OrderTotal), 2) AS SalesOrderAmount
    FROM SalesOrder
    GROUP BY substr(OrderDate, 1, 7), CostCenterID
),
requisition_activity AS (
    SELECT
        substr(RequestDate, 1, 7) AS ActivityMonth,
        CostCenterID,
        COUNT(*) AS RequisitionCount,
        ROUND(SUM(Quantity * EstimatedUnitCost), 2) AS EstimatedRequisitionSpend
    FROM PurchaseRequisition
    GROUP BY substr(RequestDate, 1, 7), CostCenterID
),
expense_activity AS (
    SELECT
        printf('%04d-%02d', gl.FiscalYear, gl.FiscalPeriod) AS ActivityMonth,
        gl.CostCenterID,
        ROUND(SUM(gl.Debit - gl.Credit), 2) AS PostedOperatingExpense
    FROM GLEntry AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    LEFT JOIN JournalEntry AS je
        ON gl.SourceDocumentType = 'JournalEntry'
       AND gl.VoucherNumber = je.EntryNumber
    WHERE gl.CostCenterID IS NOT NULL
      AND a.AccountType = 'Expense'
      AND a.AccountSubType = 'Operating Expense'
      AND (
            gl.SourceDocumentType <> 'JournalEntry'
            OR COALESCE(je.EntryType, '') NOT LIKE 'Year-End Close%'
        )
    GROUP BY printf('%04d-%02d', gl.FiscalYear, gl.FiscalPeriod), gl.CostCenterID
),
activity_keys AS (
    SELECT ActivityMonth, CostCenterID FROM sales_activity
    UNION
    SELECT ActivityMonth, CostCenterID FROM requisition_activity
    UNION
    SELECT ActivityMonth, CostCenterID FROM expense_activity
)
SELECT
    ak.ActivityMonth,
    cc.CostCenterName,
    COALESCE(sa.SalesOrderCount, 0) AS SalesOrderCount,
    COALESCE(sa.SalesOrderAmount, 0) AS SalesOrderAmount,
    COALESCE(ra.RequisitionCount, 0) AS RequisitionCount,
    COALESCE(ra.EstimatedRequisitionSpend, 0) AS EstimatedRequisitionSpend,
    COALESCE(ea.PostedOperatingExpense, 0) AS PostedOperatingExpense
FROM activity_keys AS ak
JOIN CostCenter AS cc
    ON cc.CostCenterID = ak.CostCenterID
LEFT JOIN sales_activity AS sa
    ON sa.ActivityMonth = ak.ActivityMonth
   AND sa.CostCenterID = ak.CostCenterID
LEFT JOIN requisition_activity AS ra
    ON ra.ActivityMonth = ak.ActivityMonth
   AND ra.CostCenterID = ak.CostCenterID
LEFT JOIN expense_activity AS ea
    ON ea.ActivityMonth = ak.ActivityMonth
   AND ea.CostCenterID = ak.CostCenterID
ORDER BY ak.ActivityMonth, cc.CostCenterName;
