-- Teaching objective: Run heuristic anomaly checks using currently implemented tables and fields.
-- Main tables: JournalEntry, PurchaseOrder, PurchaseRequisition, SalesInvoice, Shipment, DisbursementPayment.
-- Output shape: One row per potential anomaly candidate with a type, document reference, and explanatory detail.
-- Interpretation notes: This query is useful in both clean and anomaly-enabled datasets; anomaly-enabled builds should surface more candidates.

WITH first_shipment AS (
    SELECT
        SalesOrderID,
        MIN(ShipmentDate) AS FirstShipmentDate
    FROM Shipment
    GROUP BY SalesOrderID
),
duplicate_payment_refs AS (
    SELECT
        SupplierID,
        CheckNumber,
        COUNT(*) AS DuplicateCount
    FROM DisbursementPayment
    WHERE CheckNumber IS NOT NULL
    GROUP BY SupplierID, CheckNumber
    HAVING COUNT(*) > 1
)
SELECT
    'weekend_journal_entry' AS PotentialIssue,
    'JournalEntry' AS TableName,
    je.EntryNumber AS DocumentNumber,
    je.PostingDate AS EventDate,
    'EntryType=' || je.EntryType AS Details
FROM JournalEntry AS je
WHERE strftime('%w', je.PostingDate) IN ('0', '6')

UNION ALL

SELECT
    'same_creator_approver_purchase_order' AS PotentialIssue,
    'PurchaseOrder' AS TableName,
    po.PONumber AS DocumentNumber,
    po.OrderDate AS EventDate,
    'CreatedByEmployeeID=' || po.CreatedByEmployeeID || '; ApprovedByEmployeeID=' || po.ApprovedByEmployeeID AS Details
FROM PurchaseOrder AS po
WHERE po.CreatedByEmployeeID = po.ApprovedByEmployeeID

UNION ALL

SELECT
    'same_creator_approver_journal' AS PotentialIssue,
    'JournalEntry' AS TableName,
    je.EntryNumber AS DocumentNumber,
    je.PostingDate AS EventDate,
    'CreatedByEmployeeID=' || je.CreatedByEmployeeID || '; ApprovedByEmployeeID=' || je.ApprovedByEmployeeID AS Details
FROM JournalEntry AS je
WHERE je.CreatedByEmployeeID = je.ApprovedByEmployeeID

UNION ALL

SELECT
    'missing_approval_on_converted_requisition' AS PotentialIssue,
    'PurchaseRequisition' AS TableName,
    pr.RequisitionNumber AS DocumentNumber,
    pr.RequestDate AS EventDate,
    'Status=' || pr.Status AS Details
FROM PurchaseRequisition AS pr
WHERE pr.Status = 'Converted to PO'
  AND pr.ApprovedByEmployeeID IS NULL

UNION ALL

SELECT
    'invoice_before_shipment' AS PotentialIssue,
    'SalesInvoice' AS TableName,
    si.InvoiceNumber AS DocumentNumber,
    si.InvoiceDate AS EventDate,
    'FirstShipmentDate=' || fs.FirstShipmentDate AS Details
FROM SalesInvoice AS si
JOIN first_shipment AS fs
    ON fs.SalesOrderID = si.SalesOrderID
WHERE date(si.InvoiceDate) < date(fs.FirstShipmentDate)

UNION ALL

SELECT
    'duplicate_supplier_payment_reference' AS PotentialIssue,
    'DisbursementPayment' AS TableName,
    dp.PaymentNumber AS DocumentNumber,
    dp.PaymentDate AS EventDate,
    'SupplierID=' || dp.SupplierID || '; CheckNumber=' || dp.CheckNumber || '; DuplicateCount=' || dpr.DuplicateCount AS Details
FROM DisbursementPayment AS dp
JOIN duplicate_payment_refs AS dpr
    ON dpr.SupplierID = dp.SupplierID
   AND dpr.CheckNumber = dp.CheckNumber

ORDER BY PotentialIssue, EventDate, DocumentNumber;
