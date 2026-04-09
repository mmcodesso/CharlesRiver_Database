-- Teaching objective: Review payroll-liability movement by month and liability account.
-- Main tables: GLEntry, Account.
-- Output shape: One row per fiscal period and payroll-liability account.
-- Interpretation notes: Net movement is period activity. Ending balance is the running balance within each liability account.

WITH payroll_liability_activity AS (
    SELECT
        gl.FiscalYear,
        gl.FiscalPeriod,
        a.AccountNumber,
        a.AccountName,
        ROUND(SUM(gl.Debit), 2) AS DebitAmount,
        ROUND(SUM(gl.Credit), 2) AS CreditAmount,
        ROUND(SUM(gl.Credit - gl.Debit), 2) AS NetIncrease
    FROM GLEntry AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber IN ('2030', '2031', '2032', '2033')
    GROUP BY gl.FiscalYear, gl.FiscalPeriod, a.AccountNumber, a.AccountName
)
SELECT
    pla.FiscalYear,
    pla.FiscalPeriod,
    pla.AccountNumber,
    pla.AccountName,
    pla.DebitAmount,
    pla.CreditAmount,
    pla.NetIncrease,
    ROUND(
        SUM(pla.NetIncrease) OVER (
            PARTITION BY pla.AccountNumber
            ORDER BY pla.FiscalYear, pla.FiscalPeriod
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ),
        2
    ) AS EndingBalance
FROM payroll_liability_activity AS pla
ORDER BY pla.AccountNumber, pla.FiscalYear, pla.FiscalPeriod;
