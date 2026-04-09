-- Teaching objective: Build an accounts receivable aging listing from invoices, cash applications, and credit memos.
-- Main tables: SalesInvoice, CashReceiptApplication, CreditMemo, Customer.
-- Output shape: One row per open sales invoice.
-- Interpretation notes: Aging is calculated as of the latest invoice, cash application, or credit memo date in the dataset.

WITH as_of_date AS (
    SELECT MAX(ActivityDate) AS AsOfDate
    FROM (
        SELECT InvoiceDate AS ActivityDate FROM SalesInvoice
        UNION ALL
        SELECT ApplicationDate AS ActivityDate FROM CashReceiptApplication
        UNION ALL
        SELECT CreditMemoDate AS ActivityDate FROM CreditMemo
    )
),
application_totals AS (
    SELECT
        SalesInvoiceID,
        ROUND(SUM(AppliedAmount), 2) AS CashApplied
    FROM CashReceiptApplication
    GROUP BY SalesInvoiceID
),
credit_memo_allocations AS (
    SELECT
        cm.CreditMemoID,
        cm.OriginalSalesInvoiceID AS SalesInvoiceID,
        ROUND(
            CASE
                WHEN cm.GrandTotal <= MAX(0, si.GrandTotal - COALESCE(at.CashApplied, 0) - COALESCE(prev_cm.PriorCredits, 0))
                    THEN cm.GrandTotal
                ELSE MAX(0, si.GrandTotal - COALESCE(at.CashApplied, 0) - COALESCE(prev_cm.PriorCredits, 0))
            END,
            2
        ) AS CreditMemoApplied
    FROM CreditMemo AS cm
    JOIN SalesInvoice AS si
        ON si.SalesInvoiceID = cm.OriginalSalesInvoiceID
    LEFT JOIN application_totals AS at
        ON at.SalesInvoiceID = cm.OriginalSalesInvoiceID
    LEFT JOIN (
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
    ) AS prev_cm
        ON prev_cm.CreditMemoID = cm.CreditMemoID
),
credit_memo_totals AS (
    SELECT
        SalesInvoiceID,
        ROUND(SUM(CreditMemoApplied), 2) AS CreditMemoApplied
    FROM credit_memo_allocations
    GROUP BY SalesInvoiceID
),
open_invoices AS (
    SELECT
        si.SalesInvoiceID,
        si.InvoiceNumber,
        c.CustomerName,
        c.Region,
        c.CustomerSegment,
        date(si.InvoiceDate) AS InvoiceDate,
        date(si.DueDate) AS DueDate,
        ROUND(si.GrandTotal, 2) AS InvoiceAmount,
        ROUND(COALESCE(at.CashApplied, 0), 2) AS CashApplied,
        ROUND(COALESCE(cm.CreditMemoApplied, 0), 2) AS CreditMemoApplied,
        ROUND(si.GrandTotal - COALESCE(at.CashApplied, 0) - COALESCE(cm.CreditMemoApplied, 0), 2) AS OpenAmount,
        CAST(julianday((SELECT AsOfDate FROM as_of_date)) - julianday(si.DueDate) AS INTEGER) AS DaysPastDue
    FROM SalesInvoice AS si
    JOIN Customer AS c
        ON c.CustomerID = si.CustomerID
    LEFT JOIN application_totals AS at
        ON at.SalesInvoiceID = si.SalesInvoiceID
    LEFT JOIN credit_memo_totals AS cm
        ON cm.SalesInvoiceID = si.SalesInvoiceID
    WHERE ROUND(si.GrandTotal - COALESCE(at.CashApplied, 0) - COALESCE(cm.CreditMemoApplied, 0), 2) > 0
)
SELECT
    InvoiceNumber,
    CustomerName,
    Region,
    CustomerSegment,
    InvoiceDate,
    DueDate,
    InvoiceAmount,
    CashApplied,
    CreditMemoApplied,
    OpenAmount,
    DaysPastDue,
    CASE
        WHEN DaysPastDue <= 0 THEN 'Current'
        WHEN DaysPastDue <= 30 THEN '1-30 Days'
        WHEN DaysPastDue <= 60 THEN '31-60 Days'
        WHEN DaysPastDue <= 90 THEN '61-90 Days'
        ELSE '91+ Days'
    END AS AgingBucket
FROM open_invoices
ORDER BY DaysPastDue DESC, OpenAmount DESC, InvoiceNumber;
