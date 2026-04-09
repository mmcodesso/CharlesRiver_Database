-- Teaching objective: Review customer credit balances created by credit memos and cleared by refunds.
-- Main tables: CreditMemo, CustomerRefund, SalesInvoice, Customer.
-- Output shape: One row per credit memo with customer-credit and refund activity.
-- Interpretation notes: Credit memos tied to already-paid invoices create customer credit that may be refunded later.

WITH invoice_cash_applied AS (
    SELECT
        SalesInvoiceID,
        ROUND(SUM(AppliedAmount), 2) AS CashApplied
    FROM CashReceiptApplication
    GROUP BY SalesInvoiceID
),
prior_credit_memos AS (
    SELECT
        cm1.CreditMemoID,
        COALESCE((
            SELECT ROUND(SUM(cm2.GrandTotal), 2)
            FROM CreditMemo AS cm2
            WHERE cm2.OriginalSalesInvoiceID = cm1.OriginalSalesInvoiceID
              AND (date(cm2.CreditMemoDate) < date(cm1.CreditMemoDate)
                   OR (date(cm2.CreditMemoDate) = date(cm1.CreditMemoDate) AND cm2.CreditMemoID < cm1.CreditMemoID))
        ), 0) AS PriorCredits
    FROM CreditMemo AS cm1
),
credit_allocations AS (
    SELECT
        cm.CreditMemoID,
        cm.CreditMemoNumber,
        cm.CreditMemoDate,
        cm.CustomerID,
        cm.OriginalSalesInvoiceID,
        ROUND(cm.GrandTotal, 2) AS CreditMemoAmount,
        ROUND(MAX(si.GrandTotal - COALESCE(ica.CashApplied, 0) - COALESCE(pcm.PriorCredits, 0), 0), 2) AS RemainingARBeforeMemo,
        ROUND(
            CASE
                WHEN cm.GrandTotal > MAX(si.GrandTotal - COALESCE(ica.CashApplied, 0) - COALESCE(pcm.PriorCredits, 0), 0)
                THEN cm.GrandTotal - MAX(si.GrandTotal - COALESCE(ica.CashApplied, 0) - COALESCE(pcm.PriorCredits, 0), 0)
                ELSE 0
            END,
            2
        ) AS CustomerCreditCreated
    FROM CreditMemo AS cm
    JOIN SalesInvoice AS si
        ON si.SalesInvoiceID = cm.OriginalSalesInvoiceID
    LEFT JOIN invoice_cash_applied AS ica
        ON ica.SalesInvoiceID = cm.OriginalSalesInvoiceID
    LEFT JOIN prior_credit_memos AS pcm
        ON pcm.CreditMemoID = cm.CreditMemoID
),
refunds_by_memo AS (
    SELECT
        CreditMemoID,
        ROUND(SUM(Amount), 2) AS RefundedAmount
    FROM CustomerRefund
    GROUP BY CreditMemoID
)
SELECT
    ca.CreditMemoNumber,
    date(ca.CreditMemoDate) AS CreditMemoDate,
    c.CustomerName,
    si.InvoiceNumber AS OriginalInvoiceNumber,
    ca.CreditMemoAmount,
    ca.RemainingARBeforeMemo,
    ca.CustomerCreditCreated,
    ROUND(COALESCE(rbm.RefundedAmount, 0), 2) AS RefundedAmount,
    ROUND(ca.CustomerCreditCreated - COALESCE(rbm.RefundedAmount, 0), 2) AS OpenCustomerCredit
FROM credit_allocations AS ca
JOIN Customer AS c
    ON c.CustomerID = ca.CustomerID
JOIN SalesInvoice AS si
    ON si.SalesInvoiceID = ca.OriginalSalesInvoiceID
LEFT JOIN refunds_by_memo AS rbm
    ON rbm.CreditMemoID = ca.CreditMemoID
WHERE ROUND(ca.CustomerCreditCreated, 2) > 0
ORDER BY ca.CreditMemoDate, ca.CreditMemoNumber;
