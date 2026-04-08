-- Teaching objective: Build an accounts payable aging listing from supplier invoices and disbursements.
-- Main tables: PurchaseInvoice, DisbursementPayment, Supplier.
-- Output shape: One row per open supplier invoice.
-- Interpretation notes: Aging is calculated as of the latest invoice or payment date in the dataset.

WITH as_of_date AS (
    SELECT MAX(ActivityDate) AS AsOfDate
    FROM (
        SELECT InvoiceDate AS ActivityDate FROM PurchaseInvoice
        UNION ALL
        SELECT PaymentDate AS ActivityDate FROM DisbursementPayment
    )
),
payment_totals AS (
    SELECT
        PurchaseInvoiceID,
        ROUND(SUM(Amount), 2) AS CashPaid
    FROM DisbursementPayment
    GROUP BY PurchaseInvoiceID
),
open_invoices AS (
    SELECT
        pi.PurchaseInvoiceID,
        pi.InvoiceNumber,
        s.SupplierName,
        s.SupplierCategory,
        s.SupplierRiskRating,
        date(pi.InvoiceDate) AS InvoiceDate,
        date(pi.DueDate) AS DueDate,
        ROUND(pi.GrandTotal, 2) AS InvoiceAmount,
        ROUND(COALESCE(pt.CashPaid, 0), 2) AS CashPaid,
        ROUND(pi.GrandTotal - COALESCE(pt.CashPaid, 0), 2) AS OpenAmount,
        CAST(julianday((SELECT AsOfDate FROM as_of_date)) - julianday(pi.DueDate) AS INTEGER) AS DaysPastDue
    FROM PurchaseInvoice AS pi
    JOIN Supplier AS s
        ON s.SupplierID = pi.SupplierID
    LEFT JOIN payment_totals AS pt
        ON pt.PurchaseInvoiceID = pi.PurchaseInvoiceID
    WHERE ROUND(pi.GrandTotal - COALESCE(pt.CashPaid, 0), 2) > 0
)
SELECT
    InvoiceNumber,
    SupplierName,
    SupplierCategory,
    SupplierRiskRating,
    InvoiceDate,
    DueDate,
    InvoiceAmount,
    CashPaid,
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
