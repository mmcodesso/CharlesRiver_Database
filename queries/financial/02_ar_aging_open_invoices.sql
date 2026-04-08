-- Teaching objective: Build an accounts receivable aging listing from invoices and cash receipts.
-- Main tables: SalesInvoice, CashReceipt, Customer.
-- Output shape: One row per open sales invoice.
-- Interpretation notes: Aging is calculated as of the latest invoice or cash receipt date in the dataset.

WITH as_of_date AS (
    SELECT MAX(ActivityDate) AS AsOfDate
    FROM (
        SELECT InvoiceDate AS ActivityDate FROM SalesInvoice
        UNION ALL
        SELECT ReceiptDate AS ActivityDate FROM CashReceipt
    )
),
receipt_totals AS (
    SELECT
        SalesInvoiceID,
        ROUND(SUM(Amount), 2) AS CashApplied
    FROM CashReceipt
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
        ROUND(COALESCE(rt.CashApplied, 0), 2) AS CashApplied,
        ROUND(si.GrandTotal - COALESCE(rt.CashApplied, 0), 2) AS OpenAmount,
        CAST(julianday((SELECT AsOfDate FROM as_of_date)) - julianday(si.DueDate) AS INTEGER) AS DaysPastDue
    FROM SalesInvoice AS si
    JOIN Customer AS c
        ON c.CustomerID = si.CustomerID
    LEFT JOIN receipt_totals AS rt
        ON rt.SalesInvoiceID = si.SalesInvoiceID
    WHERE ROUND(si.GrandTotal - COALESCE(rt.CashApplied, 0), 2) > 0
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
