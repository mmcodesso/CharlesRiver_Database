-- Teaching objective: Trace annual net revenue from operational source documents into posted GL activity and the annual income statement.
-- Main tables: SalesInvoice, SalesInvoiceLine, CreditMemo, CreditMemoLine, GLEntry, Account, JournalEntry.
-- Expected output shape: One row per fiscal year with operational, pre-close GL, and statement net-revenue totals plus variances.
-- Recommended build mode: Either. Start with the clean build to confirm the revenue pipeline before investigating anomalies.
-- Interpretation notes: Operational gross revenue should tie to invoice-line totals, contra revenue should tie to credit-memo lines, and both should reconcile to the pre-close GL and annual income statement.

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
invoice_totals AS (
    SELECT
        CAST(substr(si.InvoiceDate, 1, 4) AS INTEGER) AS FiscalYear,
        ROUND(SUM(sil.LineTotal), 2) AS OperationalGrossRevenue
    FROM SalesInvoice AS si
    JOIN SalesInvoiceLine AS sil
        ON sil.SalesInvoiceID = si.SalesInvoiceID
    GROUP BY CAST(substr(si.InvoiceDate, 1, 4) AS INTEGER)
),
credit_memo_totals AS (
    SELECT
        CAST(substr(cm.CreditMemoDate, 1, 4) AS INTEGER) AS FiscalYear,
        ROUND(-SUM(cml.LineTotal), 2) AS OperationalContraRevenue
    FROM CreditMemo AS cm
    JOIN CreditMemoLine AS cml
        ON cml.CreditMemoID = cm.CreditMemoID
    GROUP BY CAST(substr(cm.CreditMemoDate, 1, 4) AS INTEGER)
),
pre_close_gl_revenue AS (
    SELECT
        gl.FiscalYear,
        ROUND(SUM(CASE
            WHEN a.AccountType = 'Revenue'
             AND a.AccountSubType = 'Operating Revenue'
             AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4000 AND 4059
                THEN gl.Credit - gl.Debit
            ELSE 0
        END), 2) AS PreCloseGlGrossRevenue,
        ROUND(SUM(CASE
            WHEN a.AccountType = 'Revenue'
             AND a.AccountSubType = 'Contra Revenue'
             AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4060 AND 4099
                THEN gl.Credit - gl.Debit
            ELSE 0
        END), 2) AS PreCloseGlContraRevenue
    FROM GLEntry AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    LEFT JOIN JournalEntry AS je
        ON je.JournalEntryID = gl.SourceDocumentID
       AND gl.SourceDocumentType = 'JournalEntry'
    WHERE a.AccountSubType <> 'Header'
      AND COALESCE(je.EntryType, '') NOT IN (
            'Year-End Close - P&L to Income Summary',
            'Year-End Close - Income Summary to Retained Earnings'
      )
      AND (
            (
                a.AccountType = 'Revenue'
                AND a.AccountSubType = 'Operating Revenue'
                AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4000 AND 4059
            )
            OR (
                a.AccountType = 'Revenue'
                AND a.AccountSubType = 'Contra Revenue'
                AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4060 AND 4099
            )
      )
    GROUP BY gl.FiscalYear
),
income_statement_net_revenue AS (
    SELECT
        gl.FiscalYear,
        ROUND(SUM(CASE
            WHEN a.AccountType = 'Revenue'
             AND a.AccountSubType = 'Operating Revenue'
             AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4000 AND 4059
                THEN gl.Credit - gl.Debit
            WHEN a.AccountType = 'Revenue'
             AND a.AccountSubType = 'Contra Revenue'
             AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4060 AND 4099
                THEN gl.Credit - gl.Debit
            ELSE 0
        END), 2) AS IncomeStatementNetRevenue
    FROM GLEntry AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    LEFT JOIN JournalEntry AS je
        ON je.JournalEntryID = gl.SourceDocumentID
       AND gl.SourceDocumentType = 'JournalEntry'
    WHERE a.AccountSubType <> 'Header'
      AND COALESCE(je.EntryType, '') NOT IN (
            'Year-End Close - P&L to Income Summary',
            'Year-End Close - Income Summary to Retained Earnings'
      )
      AND (
            (
                a.AccountType = 'Revenue'
                AND a.AccountSubType = 'Operating Revenue'
                AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4000 AND 4059
            )
            OR (
                a.AccountType = 'Revenue'
                AND a.AccountSubType = 'Contra Revenue'
                AND CAST(a.AccountNumber AS INTEGER) BETWEEN 4060 AND 4099
            )
    )
    GROUP BY gl.FiscalYear
),
reporting_years AS (
    SELECT FiscalYear FROM closed_years
)
SELECT
    y.FiscalYear,
    ROUND(COALESCE(inv.OperationalGrossRevenue, 0), 2) AS OperationalGrossRevenue,
    ROUND(COALESCE(cm.OperationalContraRevenue, 0), 2) AS OperationalContraRevenue,
    ROUND(COALESCE(inv.OperationalGrossRevenue, 0) + COALESCE(cm.OperationalContraRevenue, 0), 2) AS OperationalNetRevenue,
    ROUND(COALESCE(glr.PreCloseGlGrossRevenue, 0), 2) AS PreCloseGlGrossRevenue,
    ROUND(COALESCE(glr.PreCloseGlContraRevenue, 0), 2) AS PreCloseGlContraRevenue,
    ROUND(COALESCE(glr.PreCloseGlGrossRevenue, 0) + COALESCE(glr.PreCloseGlContraRevenue, 0), 2) AS PreCloseGlNetRevenue,
    ROUND(COALESCE(isr.IncomeStatementNetRevenue, 0), 2) AS IncomeStatementNetRevenue,
    ROUND(
        (COALESCE(inv.OperationalGrossRevenue, 0) + COALESCE(cm.OperationalContraRevenue, 0))
        - (COALESCE(glr.PreCloseGlGrossRevenue, 0) + COALESCE(glr.PreCloseGlContraRevenue, 0)),
        2
    ) AS OperationalToPreCloseGlNetRevenueVariance,
    ROUND(
        (COALESCE(glr.PreCloseGlGrossRevenue, 0) + COALESCE(glr.PreCloseGlContraRevenue, 0))
        - COALESCE(isr.IncomeStatementNetRevenue, 0),
        2
    ) AS PreCloseGlToIncomeStatementNetRevenueVariance
FROM reporting_years AS y
LEFT JOIN invoice_totals AS inv
    ON inv.FiscalYear = y.FiscalYear
LEFT JOIN credit_memo_totals AS cm
    ON cm.FiscalYear = y.FiscalYear
LEFT JOIN pre_close_gl_revenue AS glr
    ON glr.FiscalYear = y.FiscalYear
LEFT JOIN income_statement_net_revenue AS isr
    ON isr.FiscalYear = y.FiscalYear
ORDER BY y.FiscalYear;
