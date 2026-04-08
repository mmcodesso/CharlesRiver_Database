-- Teaching objective: Search for duplicate disbursement references and duplicate supplier invoice numbers.
-- Main tables: DisbursementPayment, PurchaseInvoice, Supplier.
-- Output shape: One row per duplicate-pattern candidate.
-- Interpretation notes: Clean builds may return no rows; anomaly-enabled builds can produce review hits.

WITH duplicate_check_numbers AS (
    SELECT
        'Duplicate check number by supplier' AS ReviewType,
        SupplierID,
        CheckNumber AS ReferenceValue,
        COUNT(*) AS DuplicateCount,
        ROUND(SUM(Amount), 2) AS TotalAmount
    FROM DisbursementPayment
    WHERE CheckNumber IS NOT NULL
    GROUP BY SupplierID, CheckNumber
    HAVING COUNT(*) > 1
),
duplicate_supplier_invoice_numbers AS (
    SELECT
        'Duplicate supplier invoice number' AS ReviewType,
        SupplierID,
        InvoiceNumber AS ReferenceValue,
        COUNT(*) AS DuplicateCount,
        ROUND(SUM(GrandTotal), 2) AS TotalAmount
    FROM PurchaseInvoice
    GROUP BY SupplierID, InvoiceNumber
    HAVING COUNT(*) > 1
),
duplicates AS (
    SELECT * FROM duplicate_check_numbers
    UNION ALL
    SELECT * FROM duplicate_supplier_invoice_numbers
)
SELECT
    d.ReviewType,
    s.SupplierName,
    d.ReferenceValue,
    d.DuplicateCount,
    d.TotalAmount
FROM duplicates AS d
JOIN Supplier AS s
    ON s.SupplierID = d.SupplierID
ORDER BY d.DuplicateCount DESC, d.TotalAmount DESC, s.SupplierName;
