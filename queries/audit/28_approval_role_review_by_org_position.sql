-- Teaching objective: Review who is approving operational and accounting documents by role and organization position.
-- Main tables: Employee, PurchaseRequisition, PurchaseOrder, PurchaseInvoice, CreditMemo, CustomerRefund, JournalEntry, PayrollRegister.
-- Expected output shape: One row per document family and approver role.
-- Recommended build mode: Either.
-- Interpretation notes: Use this query to understand approval concentration and whether the approval layer is relying on the expected executive, finance, or operations roles.

WITH approvals AS (
    SELECT
        'Purchase Requisition' AS DocumentType,
        RequestedByEmployeeID AS CreatedByEmployeeID,
        ApprovedByEmployeeID AS ApprovedByEmployeeID,
        date(ApprovedDate) AS ApprovalDate,
        CostCenterID
    FROM PurchaseRequisition
    WHERE ApprovedByEmployeeID IS NOT NULL

    UNION ALL

    SELECT
        'Purchase Order',
        CreatedByEmployeeID,
        ApprovedByEmployeeID,
        date(OrderDate),
        NULL
    FROM PurchaseOrder
    WHERE ApprovedByEmployeeID IS NOT NULL

    UNION ALL

    SELECT
        'Purchase Invoice',
        NULL,
        ApprovedByEmployeeID,
        date(ApprovedDate),
        NULL
    FROM PurchaseInvoice
    WHERE ApprovedByEmployeeID IS NOT NULL

    UNION ALL

    SELECT
        'Credit Memo',
        NULL,
        ApprovedByEmployeeID,
        date(ApprovedDate),
        NULL
    FROM CreditMemo
    WHERE ApprovedByEmployeeID IS NOT NULL

    UNION ALL

    SELECT
        'Customer Refund',
        NULL,
        ApprovedByEmployeeID,
        date(RefundDate),
        NULL
    FROM CustomerRefund
    WHERE ApprovedByEmployeeID IS NOT NULL

    UNION ALL

    SELECT
        'Journal Entry',
        CreatedByEmployeeID,
        ApprovedByEmployeeID,
        date(ApprovedDate),
        NULL
    FROM JournalEntry
    WHERE ApprovedByEmployeeID IS NOT NULL

    UNION ALL

    SELECT
        'Payroll Register',
        EmployeeID,
        ApprovedByEmployeeID,
        date(ApprovedDate),
        CostCenterID
    FROM PayrollRegister
    WHERE ApprovedByEmployeeID IS NOT NULL
)
SELECT
    a.DocumentType,
    e.JobTitle AS ApproverJobTitle,
    e.JobFamily AS ApproverJobFamily,
    e.JobLevel AS ApproverJobLevel,
    e.AuthorizationLevel AS ApproverAuthorizationLevel,
    COUNT(*) AS ApprovalCount,
    COUNT(DISTINCT a.ApprovedByEmployeeID) AS DistinctApprovers,
    ROUND(100.0 * AVG(CASE WHEN a.CreatedByEmployeeID IS NOT NULL AND a.CreatedByEmployeeID = a.ApprovedByEmployeeID THEN 1.0 ELSE 0.0 END), 2) AS SamePersonApprovalPct,
    MIN(a.ApprovalDate) AS FirstApprovalDate,
    MAX(a.ApprovalDate) AS LastApprovalDate
FROM approvals AS a
JOIN Employee AS e
    ON e.EmployeeID = a.ApprovedByEmployeeID
GROUP BY
    a.DocumentType,
    e.JobTitle,
    e.JobFamily,
    e.JobLevel,
    e.AuthorizationLevel
ORDER BY
    a.DocumentType,
    ApprovalCount DESC,
    e.JobTitle;
