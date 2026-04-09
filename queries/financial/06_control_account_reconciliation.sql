-- Teaching objective: Compare key control-account balances to expected subledger balances.
-- Main tables: GLEntry, Account, SalesInvoice, CashReceipt, CashReceiptApplication, CreditMemo, CustomerRefund, PurchaseInvoice, PurchaseInvoiceLine, PurchaseOrderLine, DisbursementPayment, GoodsReceiptLine, ShipmentLine, SalesReturnLine.
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

    UNION ALL

    SELECT
        'Customer Deposits and Unapplied Cash' AS ControlArea,
        ROUND(SUM(Credit - Debit), 2) AS ActualAmount
    FROM operational_gl AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber = '2060'

    UNION ALL

    SELECT
        'Sales Tax Payable' AS ControlArea,
        ROUND(SUM(Credit - Debit), 2) AS ActualAmount
    FROM operational_gl AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber = '2050'

    UNION ALL

    SELECT
        'Sales Returns and Allowances' AS ControlArea,
        ROUND(SUM(Debit - Credit), 2) AS ActualAmount
    FROM operational_gl AS gl
    JOIN Account AS a
        ON a.AccountID = gl.AccountID
    WHERE a.AccountNumber = '4060'
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
            - (SELECT COALESCE(SUM(AppliedAmount), 0) FROM CashReceiptApplication)
            - (
                SELECT COALESCE(SUM(CASE
                    WHEN cm.GrandTotal <= MAX(0, si.GrandTotal - COALESCE(apps.CashApplied, 0) - COALESCE(prev_cm.PriorCredits, 0))
                        THEN cm.GrandTotal
                    ELSE MAX(0, si.GrandTotal - COALESCE(apps.CashApplied, 0) - COALESCE(prev_cm.PriorCredits, 0))
                END), 0)
                FROM CreditMemo AS cm
                JOIN SalesInvoice AS si
                    ON si.SalesInvoiceID = cm.OriginalSalesInvoiceID
                LEFT JOIN (
                    SELECT SalesInvoiceID, ROUND(SUM(AppliedAmount), 2) AS CashApplied
                    FROM CashReceiptApplication
                    GROUP BY SalesInvoiceID
                ) AS apps
                    ON apps.SalesInvoiceID = cm.OriginalSalesInvoiceID
                LEFT JOIN (
                    SELECT cm1.CreditMemoID, COALESCE((
                        SELECT ROUND(SUM(cm2.GrandTotal), 2)
                        FROM CreditMemo AS cm2
                        WHERE cm2.OriginalSalesInvoiceID = cm1.OriginalSalesInvoiceID
                          AND (date(cm2.CreditMemoDate) < date(cm1.CreditMemoDate)
                               OR (date(cm2.CreditMemoDate) = date(cm1.CreditMemoDate) AND cm2.CreditMemoID < cm1.CreditMemoID))
                    ), 0) AS PriorCredits
                    FROM CreditMemo AS cm1
                ) AS prev_cm
                    ON prev_cm.CreditMemoID = cm.CreditMemoID
            ),
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
            + (SELECT COALESCE(SUM(ExtendedStandardCost), 0) FROM SalesReturnLine)
            - (SELECT COALESCE(SUM(ExtendedStandardCost), 0) FROM ShipmentLine),
            2
        ) AS ExpectedAmount

    UNION ALL

    SELECT
        'Customer Deposits and Unapplied Cash' AS ControlArea,
        ROUND(
            (SELECT COALESCE(SUM(Amount), 0) FROM CashReceipt)
            + (
                SELECT COALESCE(SUM(CASE
                    WHEN cm.GrandTotal > (
                        si.GrandTotal - COALESCE(apps.CashApplied, 0) - COALESCE(prev_cm.PriorCredits, 0)
                    )
                    THEN cm.GrandTotal - (
                        si.GrandTotal - COALESCE(apps.CashApplied, 0) - COALESCE(prev_cm.PriorCredits, 0)
                    )
                    ELSE 0
                END), 0)
                FROM CreditMemo AS cm
                JOIN SalesInvoice AS si
                    ON si.SalesInvoiceID = cm.OriginalSalesInvoiceID
                LEFT JOIN (
                    SELECT SalesInvoiceID, ROUND(SUM(AppliedAmount), 2) AS CashApplied
                    FROM CashReceiptApplication
                    GROUP BY SalesInvoiceID
                ) AS apps
                    ON apps.SalesInvoiceID = cm.OriginalSalesInvoiceID
                LEFT JOIN (
                    SELECT cm1.CreditMemoID, COALESCE((
                        SELECT ROUND(SUM(cm2.GrandTotal), 2)
                        FROM CreditMemo AS cm2
                        WHERE cm2.OriginalSalesInvoiceID = cm1.OriginalSalesInvoiceID
                          AND (date(cm2.CreditMemoDate) < date(cm1.CreditMemoDate)
                               OR (date(cm2.CreditMemoDate) = date(cm1.CreditMemoDate) AND cm2.CreditMemoID < cm1.CreditMemoID))
                    ), 0) AS PriorCredits
                    FROM CreditMemo AS cm1
                ) AS prev_cm
                    ON prev_cm.CreditMemoID = cm.CreditMemoID
            )
            - (SELECT COALESCE(SUM(AppliedAmount), 0) FROM CashReceiptApplication)
            - (SELECT COALESCE(SUM(Amount), 0) FROM CustomerRefund),
            2
        ) AS ExpectedAmount

    UNION ALL

    SELECT
        'Sales Tax Payable' AS ControlArea,
        ROUND(
            (SELECT COALESCE(SUM(TaxAmount), 0) FROM SalesInvoice)
            - (SELECT COALESCE(SUM(TaxAmount), 0) FROM CreditMemo),
            2
        ) AS ExpectedAmount

    UNION ALL

    SELECT
        'Sales Returns and Allowances' AS ControlArea,
        ROUND((SELECT COALESCE(SUM(SubTotal), 0) FROM CreditMemo), 2) AS ExpectedAmount
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
