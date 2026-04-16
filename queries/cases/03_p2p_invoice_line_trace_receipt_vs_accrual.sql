-- Teaching objective: Separate receipt-matched supplier invoice lines from accrual-linked service-settlement lines.
-- Main tables: PurchaseInvoiceLine, PurchaseInvoice, PurchaseOrderLine, PurchaseRequisition, GoodsReceiptLine, JournalEntry, Supplier, Item.
-- Output shape: One row per purchase invoice line.
-- Interpretation notes: A line with GoodsReceiptLineID follows the normal receipt-matched path; a line with AccrualJournalEntryID follows the accrued-service settlement path.

SELECT
    pil.PILineID,
    pi.InvoiceNumber,
    date(pi.InvoiceDate) AS InvoiceDate,
    s.SupplierName,
    i.ItemCode,
    i.ItemName,
    ROUND(pil.Quantity, 2) AS InvoicedQuantity,
    ROUND(pil.UnitCost, 2) AS UnitCost,
    ROUND(pil.LineTotal, 2) AS InvoiceLineAmount,
    pr.RequisitionNumber,
    date(pr.RequestDate) AS RequisitionDate,
    po.PONumber,
    date(po.OrderDate) AS PurchaseOrderDate,
    gr.ReceiptNumber,
    date(gr.ReceiptDate) AS ReceiptDate,
    je.EntryNumber AS AccrualEntryNumber,
    date(je.PostingDate) AS AccrualDate,
    pil.GoodsReceiptLineID,
    pil.AccrualJournalEntryID,
    CASE
        WHEN pil.GoodsReceiptLineID IS NOT NULL AND pil.AccrualJournalEntryID IS NULL THEN 'Receipt matched'
        WHEN pil.AccrualJournalEntryID IS NOT NULL AND pil.GoodsReceiptLineID IS NULL THEN 'Accrual settled'
        ELSE 'Unclassified follow-up'
    END AS MatchBasis,
    CASE
        WHEN pil.GoodsReceiptLineID IS NOT NULL AND pil.AccrualJournalEntryID IS NULL THEN 'Normal inventory or material path'
        WHEN pil.AccrualJournalEntryID IS NOT NULL AND pil.GoodsReceiptLineID IS NULL THEN 'Direct service accrual-clearing path'
        ELSE 'Investigate missing receipt or accrual linkage'
    END AS InterpretationCue
FROM PurchaseInvoiceLine AS pil
JOIN PurchaseInvoice AS pi
    ON pi.PurchaseInvoiceID = pil.PurchaseInvoiceID
JOIN Supplier AS s
    ON s.SupplierID = pi.SupplierID
JOIN Item AS i
    ON i.ItemID = pil.ItemID
LEFT JOIN PurchaseOrderLine AS pol
    ON pol.POLineID = pil.POLineID
LEFT JOIN PurchaseRequisition AS pr
    ON pr.RequisitionID = pol.RequisitionID
LEFT JOIN PurchaseOrder AS po
    ON po.PurchaseOrderID = COALESCE(pol.PurchaseOrderID, pi.PurchaseOrderID)
LEFT JOIN GoodsReceiptLine AS grl
    ON grl.GoodsReceiptLineID = pil.GoodsReceiptLineID
LEFT JOIN GoodsReceipt AS gr
    ON gr.GoodsReceiptID = grl.GoodsReceiptID
LEFT JOIN JournalEntry AS je
    ON je.JournalEntryID = pil.AccrualJournalEntryID
ORDER BY
    date(pi.InvoiceDate),
    s.SupplierName,
    pi.InvoiceNumber,
    pil.PILineID;
