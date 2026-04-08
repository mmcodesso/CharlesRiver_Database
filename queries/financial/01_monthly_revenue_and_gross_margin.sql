-- Teaching objective: Review monthly revenue, COGS, and gross margin from posted accounting activity.
-- Main tables: GLEntry, Account.
-- Output shape: One row per fiscal year and fiscal period.
-- Interpretation notes: Revenue is shown as credit minus debit; COGS is shown as debit minus credit.

WITH monthly_activity AS (
    SELECT
        gl.FiscalYear,
        gl.FiscalPeriod,
        SUM(
            CASE
                WHEN a.AccountType = 'Revenue' AND a.AccountSubType <> 'Header'
                    THEN gl.Credit - gl.Debit
                ELSE 0
            END
        ) AS RevenueAmount,
        SUM(
            CASE
                WHEN a.AccountSubType = 'COGS'
                    THEN gl.Debit - gl.Credit
                ELSE 0
            END
        ) AS COGSAmount
    FROM GLEntry AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE gl.SourceDocumentType IN ('SalesInvoice', 'Shipment')
    GROUP BY gl.FiscalYear, gl.FiscalPeriod
)
SELECT
    FiscalYear,
    FiscalPeriod,
    ROUND(RevenueAmount, 2) AS RevenueAmount,
    ROUND(COGSAmount, 2) AS COGSAmount,
    ROUND(RevenueAmount - COGSAmount, 2) AS GrossMargin,
    CASE
        WHEN RevenueAmount = 0 THEN NULL
        ELSE ROUND((RevenueAmount - COGSAmount) / RevenueAmount * 100.0, 2)
    END AS GrossMarginPct
FROM monthly_activity
ORDER BY FiscalYear, FiscalPeriod;
