-- Teaching objective: Surface any P&L or income-summary accounts that still carry a balance after the annual close.
-- Main tables: GLEntry, Account, JournalEntry.
-- Expected output shape: One row per fiscal year and leaked account with a non-zero ending balance.
-- Recommended build mode: Either. Use the clean full-size build first, then compare the anomaly build.
-- Interpretation notes: Revenue, expense, and income-summary accounts should net to zero inside each closed fiscal year after the close completes.

WITH closed_years AS (
    SELECT
        CAST(substr(PostingDate, 1, 4) AS INTEGER) AS FiscalYear
    FROM JournalEntry
    WHERE EntryType IN (
        'Year-End Close - P&L to Income Summary',
        'Year-End Close - Income Summary to Retained Earnings'
    )
    GROUP BY CAST(substr(PostingDate, 1, 4) AS INTEGER)
    HAVING COUNT(DISTINCT EntryType) = 2
),
account_year_balances AS (
    SELECT
        gl.FiscalYear,
        a.AccountNumber,
        a.AccountName,
        a.AccountType,
        a.AccountSubType,
        ROUND(SUM(gl.Debit - gl.Credit), 2) AS EndingNetDebitLessCredit,
        ROUND(SUM(gl.Credit - gl.Debit), 2) AS BalanceSheetResidualContribution
    FROM GLEntry AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE gl.FiscalYear IN (SELECT FiscalYear FROM closed_years)
      AND (
            (a.AccountType IN ('Revenue', 'Expense') AND a.AccountSubType <> 'Header')
            OR a.AccountNumber = '8010'
      )
    GROUP BY
        gl.FiscalYear,
        a.AccountNumber,
        a.AccountName,
        a.AccountType,
        a.AccountSubType
)
SELECT
    FiscalYear,
    AccountNumber,
    AccountName,
    AccountType,
    AccountSubType,
    EndingNetDebitLessCredit,
    BalanceSheetResidualContribution
FROM account_year_balances
WHERE ROUND(EndingNetDebitLessCredit, 2) <> 0
ORDER BY FiscalYear, CAST(AccountNumber AS INTEGER);
