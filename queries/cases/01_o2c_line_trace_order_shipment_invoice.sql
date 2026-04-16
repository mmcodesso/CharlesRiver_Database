-- Teaching objective: Trace one O2C line from order entry through shipment and invoice detail.
-- Main tables: SalesOrder, SalesOrderLine, Shipment, ShipmentLine, SalesInvoice, SalesInvoiceLine, Customer.
-- Expected output shape: One row per order-line-to-shipment-line-to-invoice-line trace.
-- Interpretation notes: Open, partially fulfilled, and fully billed lines remain visible because the downstream joins stay left-sided.

WITH shipment_activity AS (
    SELECT
        shl.SalesOrderLineID,
        sh.ShipmentID,
        sh.ShipmentNumber,
        date(sh.ShipmentDate) AS ShipmentDate,
        sh.Status AS ShipmentStatus,
        shl.ShipmentLineID,
        ROUND(shl.QuantityShipped, 2) AS QuantityShipped
    FROM ShipmentLine AS shl
    JOIN Shipment AS sh
        ON sh.ShipmentID = shl.ShipmentID
),
invoice_activity AS (
    SELECT
        sil.SalesOrderLineID,
        sil.ShipmentLineID,
        si.SalesInvoiceID,
        si.InvoiceNumber,
        date(si.InvoiceDate) AS InvoiceDate,
        si.Status AS InvoiceStatus,
        sil.SalesInvoiceLineID,
        ROUND(sil.Quantity, 2) AS QuantityInvoiced,
        ROUND(sil.LineTotal, 2) AS InvoicedLineAmount
    FROM SalesInvoiceLine AS sil
    JOIN SalesInvoice AS si
        ON si.SalesInvoiceID = sil.SalesInvoiceID
)
SELECT
    so.SalesOrderID,
    so.OrderNumber,
    date(so.OrderDate) AS OrderDate,
    date(so.RequestedDeliveryDate) AS RequestedDeliveryDate,
    c.CustomerName,
    sol.SalesOrderLineID,
    sol.LineNumber AS OrderLineNumber,
    sol.ItemID,
    ROUND(sol.Quantity, 2) AS OrderedQuantity,
    ROUND(sol.LineTotal, 2) AS OrderedLineAmount,
    sa.ShipmentID,
    sa.ShipmentNumber,
    sa.ShipmentDate,
    sa.ShipmentStatus,
    sa.ShipmentLineID,
    sa.QuantityShipped,
    ia.SalesInvoiceID,
    ia.InvoiceNumber,
    ia.InvoiceDate,
    ia.InvoiceStatus,
    ia.SalesInvoiceLineID,
    ia.QuantityInvoiced,
    ia.InvoicedLineAmount,
    CASE
        WHEN sa.ShipmentLineID IS NULL THEN 'Ordered only'
        WHEN ia.SalesInvoiceLineID IS NULL THEN 'Shipped not yet invoiced'
        WHEN ROUND(COALESCE(ia.QuantityInvoiced, 0), 2) < ROUND(COALESCE(sa.QuantityShipped, 0), 2) THEN 'Partially invoiced'
        ELSE 'Shipped and invoiced'
    END AS TraceStatus
FROM SalesOrderLine AS sol
JOIN SalesOrder AS so
    ON so.SalesOrderID = sol.SalesOrderID
JOIN Customer AS c
    ON c.CustomerID = so.CustomerID
LEFT JOIN shipment_activity AS sa
    ON sa.SalesOrderLineID = sol.SalesOrderLineID
LEFT JOIN invoice_activity AS ia
    ON ia.SalesOrderLineID = sol.SalesOrderLineID
   AND (
        (ia.ShipmentLineID IS NOT NULL AND ia.ShipmentLineID = sa.ShipmentLineID)
        OR (ia.ShipmentLineID IS NULL AND sa.ShipmentLineID IS NULL)
   )
ORDER BY so.OrderDate, so.OrderNumber, sol.LineNumber, sa.ShipmentDate, ia.InvoiceDate, ia.SalesInvoiceLineID;
