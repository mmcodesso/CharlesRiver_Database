-- Teaching objective: Review basic approval and segregation-of-duties conditions across major document types.
-- Main tables: PurchaseRequisition, PurchaseOrder, PurchaseInvoice, JournalEntry, Employee.
-- Output shape: One row per potentially suspicious document.
-- Interpretation notes: A clean build may return few or no rows; anomaly-enabled builds should produce more review candidates.

SELECT
    'Purchase Requisition' AS DocumentType,
    pr.RequisitionNumber AS DocumentNumber,
    pr.RequestDate AS DocumentDate,
    'Missing approval on approved or converted requisition' AS IssueType,
    req.EmployeeName AS PrimaryEmployee,
    appr.EmployeeName AS SecondaryEmployee,
    pr.Status
FROM PurchaseRequisition AS pr
LEFT JOIN Employee AS req
    ON req.EmployeeID = pr.RequestedByEmployeeID
LEFT JOIN Employee AS appr
    ON appr.EmployeeID = pr.ApprovedByEmployeeID
WHERE pr.Status IN ('Approved', 'Converted to PO')
  AND pr.ApprovedByEmployeeID IS NULL

UNION ALL

SELECT
    'Purchase Requisition' AS DocumentType,
    pr.RequisitionNumber AS DocumentNumber,
    pr.RequestDate AS DocumentDate,
    'Requester and approver are the same person' AS IssueType,
    req.EmployeeName AS PrimaryEmployee,
    appr.EmployeeName AS SecondaryEmployee,
    pr.Status
FROM PurchaseRequisition AS pr
LEFT JOIN Employee AS req
    ON req.EmployeeID = pr.RequestedByEmployeeID
LEFT JOIN Employee AS appr
    ON appr.EmployeeID = pr.ApprovedByEmployeeID
WHERE pr.ApprovedByEmployeeID IS NOT NULL
  AND pr.RequestedByEmployeeID = pr.ApprovedByEmployeeID

UNION ALL

SELECT
    'Purchase Order' AS DocumentType,
    po.PONumber AS DocumentNumber,
    po.OrderDate AS DocumentDate,
    'Creator and approver are the same person' AS IssueType,
    creator.EmployeeName AS PrimaryEmployee,
    approver.EmployeeName AS SecondaryEmployee,
    po.Status
FROM PurchaseOrder AS po
LEFT JOIN Employee AS creator
    ON creator.EmployeeID = po.CreatedByEmployeeID
LEFT JOIN Employee AS approver
    ON approver.EmployeeID = po.ApprovedByEmployeeID
WHERE po.CreatedByEmployeeID = po.ApprovedByEmployeeID

UNION ALL

SELECT
    'Purchase Invoice' AS DocumentType,
    pi.InvoiceNumber AS DocumentNumber,
    pi.ApprovedDate AS DocumentDate,
    'Approved invoice is missing approver' AS IssueType,
    supplier.SupplierName AS PrimaryEmployee,
    NULL AS SecondaryEmployee,
    pi.Status
FROM PurchaseInvoice AS pi
LEFT JOIN Supplier AS supplier
    ON supplier.SupplierID = pi.SupplierID
WHERE pi.Status IN ('Approved', 'Partially Paid', 'Paid')
  AND pi.ApprovedByEmployeeID IS NULL

UNION ALL

SELECT
    'Journal Entry' AS DocumentType,
    je.EntryNumber AS DocumentNumber,
    je.PostingDate AS DocumentDate,
    'Creator and approver are the same person' AS IssueType,
    creator.EmployeeName AS PrimaryEmployee,
    approver.EmployeeName AS SecondaryEmployee,
    je.EntryType AS Status
FROM JournalEntry AS je
LEFT JOIN Employee AS creator
    ON creator.EmployeeID = je.CreatedByEmployeeID
LEFT JOIN Employee AS approver
    ON approver.EmployeeID = je.ApprovedByEmployeeID
WHERE je.CreatedByEmployeeID = je.ApprovedByEmployeeID

ORDER BY DocumentDate, DocumentType, DocumentNumber;
