-- Teaching objective: Produce a period-by-period trial balance from the posted general ledger.
-- Main tables: GLEntry, Account.
-- Output shape: One row per fiscal period and non-header account.
-- Interpretation notes: Net balance is debit minus credit; positive values indicate a debit-side net balance.

SELECT
    gl.FiscalYear,
    gl.FiscalPeriod,
    a.AccountNumber,
    a.AccountName,
    a.AccountType,
    a.AccountSubType,
    a.NormalBalance,
    ROUND(SUM(gl.Debit), 2) AS DebitAmount,
    ROUND(SUM(gl.Credit), 2) AS CreditAmount,
    ROUND(SUM(gl.Debit - gl.Credit), 2) AS NetDebitLessCredit
FROM GLEntry AS gl
JOIN Account AS a
    ON a.AccountID = gl.AccountID
WHERE a.AccountSubType <> 'Header'
GROUP BY
    gl.FiscalYear,
    gl.FiscalPeriod,
    a.AccountNumber,
    a.AccountName,
    a.AccountType,
    a.AccountSubType,
    a.NormalBalance
HAVING ROUND(SUM(gl.Debit), 2) <> 0
    OR ROUND(SUM(gl.Credit), 2) <> 0
ORDER BY gl.FiscalYear, gl.FiscalPeriod, a.AccountNumber;
