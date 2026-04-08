-- Teaching objective: Trace requisitions through PO lines, receipts, supplier invoices, and payments to review P2P completeness.
-- Main tables: PurchaseRequisition, PurchaseOrderLine, PurchaseOrder, GoodsReceiptLine, PurchaseInvoiceLine, PurchaseInvoice, DisbursementPayment.
-- Output shape: One row per purchase requisition.
-- Interpretation notes: Phase 9 uses line-level requisition and receipt matching, so completeness should be reviewed at the line level rather than only at document headers.

WITH po_link AS (
    SELECT
        RequisitionID,
        COUNT(*) AS POLineCount,
        COUNT(DISTINCT PurchaseOrderID) AS PurchaseOrderCount,
        ROUND(SUM(LineTotal), 2) AS OrderedAmount
    FROM PurchaseOrderLine
    WHERE RequisitionID IS NOT NULL
    GROUP BY RequisitionID
),
receipt_link AS (
    SELECT
        pol.RequisitionID,
        COUNT(grl.GoodsReceiptLineID) AS ReceiptLineCount,
        ROUND(SUM(grl.QuantityReceived), 2) AS ReceivedQuantity,
        ROUND(SUM(grl.ExtendedStandardCost), 2) AS ReceivedAmount
    FROM PurchaseOrderLine AS pol
    LEFT JOIN GoodsReceiptLine AS grl
        ON grl.POLineID = pol.POLineID
    WHERE pol.RequisitionID IS NOT NULL
    GROUP BY pol.RequisitionID
),
invoice_headers AS (
    SELECT DISTINCT
        pol.RequisitionID,
        pi.PurchaseInvoiceID,
        pi.GrandTotal
    FROM PurchaseOrderLine AS pol
    JOIN PurchaseInvoiceLine AS pil
        ON pil.POLineID = pol.POLineID
    JOIN PurchaseInvoice AS pi
        ON pi.PurchaseInvoiceID = pil.PurchaseInvoiceID
    WHERE pol.RequisitionID IS NOT NULL
),
invoice_link AS (
    SELECT
        pol.RequisitionID,
        COUNT(pil.PILineID) AS InvoiceLineCount,
        ROUND(SUM(pil.Quantity), 2) AS InvoicedQuantity
    FROM PurchaseOrderLine AS pol
    LEFT JOIN PurchaseInvoiceLine AS pil
        ON pil.POLineID = pol.POLineID
    WHERE pol.RequisitionID IS NOT NULL
    GROUP BY pol.RequisitionID
),
payment_link AS (
    SELECT
        ih.RequisitionID,
        COUNT(dp.DisbursementID) AS PaymentCount,
        ROUND(SUM(dp.Amount), 2) AS PaidAmount
    FROM invoice_headers AS ih
    LEFT JOIN DisbursementPayment AS dp
        ON dp.PurchaseInvoiceID = ih.PurchaseInvoiceID
    GROUP BY ih.RequisitionID
),
invoice_totals AS (
    SELECT
        RequisitionID,
        COUNT(PurchaseInvoiceID) AS PurchaseInvoiceCount,
        ROUND(SUM(GrandTotal), 2) AS InvoicedAmount
    FROM invoice_headers
    GROUP BY RequisitionID
)
SELECT
    pr.RequisitionID,
    pr.RequisitionNumber,
    pr.Status,
    cc.CostCenterName,
    i.ItemCode,
    i.ItemName,
    ROUND(pr.Quantity, 2) AS RequestedQuantity,
    ROUND(pr.Quantity * pr.EstimatedUnitCost, 2) AS EstimatedAmount,
    COALESCE(pl.PurchaseOrderCount, 0) AS PurchaseOrderCount,
    COALESCE(pl.POLineCount, 0) AS POLineCount,
    COALESCE(rl.ReceiptLineCount, 0) AS ReceiptLineCount,
    COALESCE(il.InvoiceLineCount, 0) AS InvoiceLineCount,
    COALESCE(it.PurchaseInvoiceCount, 0) AS PurchaseInvoiceCount,
    COALESCE(pm.PaymentCount, 0) AS PaymentCount,
    COALESCE(it.InvoicedAmount, 0) AS InvoicedAmount,
    COALESCE(pm.PaidAmount, 0) AS PaidAmount,
    CASE
        WHEN pr.Status = 'Converted to PO' AND COALESCE(pl.POLineCount, 0) = 0 THEN 'Converted without PO line'
        WHEN COALESCE(pl.POLineCount, 0) = 0 THEN 'No PO line'
        WHEN COALESCE(rl.ReceiptLineCount, 0) = 0 THEN 'No receipt'
        WHEN COALESCE(il.InvoiceLineCount, 0) = 0 THEN 'No invoice'
        WHEN COALESCE(pm.PaymentCount, 0) = 0 AND COALESCE(it.InvoicedAmount, 0) > 0 THEN 'No payment'
        WHEN ROUND(COALESCE(it.InvoicedAmount, 0), 2) > ROUND(COALESCE(pm.PaidAmount, 0), 2) THEN 'Partially paid'
        ELSE 'Complete'
    END AS AuditFlag
FROM PurchaseRequisition AS pr
JOIN CostCenter AS cc
    ON cc.CostCenterID = pr.CostCenterID
JOIN Item AS i
    ON i.ItemID = pr.ItemID
LEFT JOIN po_link AS pl
    ON pl.RequisitionID = pr.RequisitionID
LEFT JOIN receipt_link AS rl
    ON rl.RequisitionID = pr.RequisitionID
LEFT JOIN invoice_link AS il
    ON il.RequisitionID = pr.RequisitionID
LEFT JOIN invoice_totals AS it
    ON it.RequisitionID = pr.RequisitionID
LEFT JOIN payment_link AS pm
    ON pm.RequisitionID = pr.RequisitionID
ORDER BY pr.RequestDate, pr.RequisitionNumber;
