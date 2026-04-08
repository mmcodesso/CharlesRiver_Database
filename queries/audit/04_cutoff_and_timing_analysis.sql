-- Teaching objective: Summarize timing gaps across key O2C and P2P process transitions.
-- Main tables: SalesInvoice, SalesInvoiceLine, Shipment, ShipmentLine, PurchaseRequisition, PurchaseOrderLine, PurchaseOrder, GoodsReceipt, GoodsReceiptLine, PurchaseInvoice, PurchaseInvoiceLine.
-- Output shape: One row per timing metric with average, minimum, maximum, and negative-gap counts.
-- Interpretation notes: Negative gaps may indicate cut-off issues or intentionally injected anomalies.

WITH timing_gaps AS (
    SELECT
        'O2C shipment-to-invoice gap' AS Metric,
        CAST(julianday(si.InvoiceDate) - julianday(sh.ShipmentDate) AS INTEGER) AS DayGap
    FROM SalesInvoiceLine AS sil
    JOIN SalesInvoice AS si
        ON si.SalesInvoiceID = sil.SalesInvoiceID
    JOIN ShipmentLine AS shl
        ON shl.SalesOrderLineID = sil.SalesOrderLineID
    JOIN Shipment AS sh
        ON sh.ShipmentID = shl.ShipmentID

    UNION ALL

    SELECT
        'P2P requisition-to-order gap' AS Metric,
        CAST(julianday(po.OrderDate) - julianday(pr.RequestDate) AS INTEGER) AS DayGap
    FROM PurchaseOrderLine AS pol
    JOIN PurchaseOrder AS po
        ON po.PurchaseOrderID = pol.PurchaseOrderID
    JOIN PurchaseRequisition AS pr
        ON pr.RequisitionID = pol.RequisitionID
    WHERE pol.RequisitionID IS NOT NULL

    UNION ALL

    SELECT
        'P2P order-to-receipt gap' AS Metric,
        CAST(julianday(gr.ReceiptDate) - julianday(po.OrderDate) AS INTEGER) AS DayGap
    FROM GoodsReceiptLine AS grl
    JOIN GoodsReceipt AS gr
        ON gr.GoodsReceiptID = grl.GoodsReceiptID
    JOIN PurchaseOrderLine AS pol
        ON pol.POLineID = grl.POLineID
    JOIN PurchaseOrder AS po
        ON po.PurchaseOrderID = pol.PurchaseOrderID

    UNION ALL

    SELECT
        'P2P receipt-to-invoice gap' AS Metric,
        CAST(julianday(pi.InvoiceDate) - julianday(gr.ReceiptDate) AS INTEGER) AS DayGap
    FROM PurchaseInvoiceLine AS pil
    JOIN PurchaseInvoice AS pi
        ON pi.PurchaseInvoiceID = pil.PurchaseInvoiceID
    JOIN GoodsReceiptLine AS grl
        ON grl.GoodsReceiptLineID = pil.GoodsReceiptLineID
    JOIN GoodsReceipt AS gr
        ON gr.GoodsReceiptID = grl.GoodsReceiptID
    WHERE pil.GoodsReceiptLineID IS NOT NULL
)
SELECT
    Metric,
    ROUND(AVG(DayGap), 2) AS AverageDays,
    MIN(DayGap) AS MinimumDays,
    MAX(DayGap) AS MaximumDays,
    SUM(CASE WHEN DayGap < 0 THEN 1 ELSE 0 END) AS NegativeGapCount,
    COUNT(*) AS ObservationCount
FROM timing_gaps
GROUP BY Metric
ORDER BY Metric;
