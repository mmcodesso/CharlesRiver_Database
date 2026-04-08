-- Teaching objective: Compare key control-account balances to expected subledger balances.
-- Main tables: GLEntry, Account, SalesInvoice, CashReceipt, PurchaseInvoice, PurchaseInvoiceLine, PurchaseOrderLine, DisbursementPayment, GoodsReceiptLine, ShipmentLine.
-- Output shape: One row per control area with expected, actual, and difference amounts.
-- Interpretation notes: Actual ledger balances exclude JournalEntry-sourced rows to match operational roll-forward logic.

WITH operational_gl AS (
    SELECT *
    FROM GLEntry
    WHERE SourceDocumentType <> 'JournalEntry'
),
actual_balances AS (
    SELECT
        'Accounts Payable' AS ControlArea,
        ROUND(SUM(Credit - Debit), 2) AS ActualAmount
    FROM operational_gl AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber = '2010'

    UNION ALL

    SELECT
        'Accounts Receivable' AS ControlArea,
        ROUND(SUM(Debit - Credit), 2) AS ActualAmount
    FROM operational_gl AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber = '1020'

    UNION ALL

    SELECT
        'GRNI' AS ControlArea,
        ROUND(SUM(Credit - Debit), 2) AS ActualAmount
    FROM operational_gl AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber = '2020'

    UNION ALL

    SELECT
        'Inventory' AS ControlArea,
        ROUND(SUM(Debit - Credit), 2) AS ActualAmount
    FROM operational_gl AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber IN ('1040', '1045')
),
expected_balances AS (
    SELECT
        'Accounts Payable' AS ControlArea,
        ROUND(
            (SELECT COALESCE(SUM(GrandTotal), 0) FROM PurchaseInvoice)
            - (SELECT COALESCE(SUM(Amount), 0) FROM DisbursementPayment),
            2
        ) AS ExpectedAmount

    UNION ALL

    SELECT
        'Accounts Receivable' AS ControlArea,
        ROUND(
            (SELECT COALESCE(SUM(GrandTotal), 0) FROM SalesInvoice)
            - (SELECT COALESCE(SUM(Amount), 0) FROM CashReceipt),
            2
        ) AS ExpectedAmount

    UNION ALL

    SELECT
        'GRNI' AS ControlArea,
        ROUND(
            (SELECT COALESCE(SUM(ExtendedStandardCost), 0) FROM GoodsReceiptLine)
            - (
                SELECT COALESCE(SUM(pil.Quantity * pol.UnitCost), 0)
                FROM PurchaseInvoiceLine AS pil
                JOIN PurchaseOrderLine AS pol
                    ON pol.POLineID = pil.POLineID
            ),
            2
        ) AS ExpectedAmount

    UNION ALL

    SELECT
        'Inventory' AS ControlArea,
        ROUND(
            (SELECT COALESCE(SUM(ExtendedStandardCost), 0) FROM GoodsReceiptLine)
            - (SELECT COALESCE(SUM(ExtendedStandardCost), 0) FROM ShipmentLine),
            2
        ) AS ExpectedAmount
)
SELECT
    e.ControlArea,
    e.ExpectedAmount,
    a.ActualAmount,
    ROUND(a.ActualAmount - e.ExpectedAmount, 2) AS DifferenceAmount
FROM expected_balances AS e
JOIN actual_balances AS a
    ON a.ControlArea = e.ControlArea
ORDER BY e.ControlArea;
