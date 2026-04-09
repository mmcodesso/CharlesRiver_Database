-- Teaching objective: Trace sales orders through shipment, billing, cash application, and return activity to review document-chain completeness.
-- Main tables: SalesOrder, SalesOrderLine, Shipment, ShipmentLine, SalesInvoice, SalesInvoiceLine, CashReceiptApplication, SalesReturnLine, CreditMemo.
-- Output shape: One row per sales order with quantity and document-chain completion indicators.
-- Interpretation notes: Orders with partial shipment, billing, settlement, or returns will remain visible even when the header status looks complete.

WITH shipped_lines AS (
    SELECT
        sh.SalesOrderID,
        shl.SalesOrderLineID,
        ROUND(SUM(shl.QuantityShipped), 2) AS ShippedQuantity
    FROM ShipmentLine AS shl
    JOIN Shipment AS sh
        ON sh.ShipmentID = shl.ShipmentID
    GROUP BY sh.SalesOrderID, shl.SalesOrderLineID
),
billed_lines AS (
    SELECT
        si.SalesOrderID,
        sil.SalesOrderLineID,
        ROUND(SUM(sil.Quantity), 2) AS BilledQuantity
    FROM SalesInvoiceLine AS sil
    JOIN SalesInvoice AS si
        ON si.SalesInvoiceID = sil.SalesInvoiceID
    GROUP BY si.SalesOrderID, sil.SalesOrderLineID
),
cash_by_order AS (
    SELECT
        si.SalesOrderID,
        COUNT(DISTINCT si.SalesInvoiceID) AS InvoiceCount,
        ROUND(SUM(si.GrandTotal), 2) AS InvoicedAmount,
        ROUND(SUM(COALESCE(cra.AppliedAmount, 0)), 2) AS CashCollected
    FROM SalesInvoice AS si
    LEFT JOIN CashReceiptApplication AS cra
        ON cra.SalesInvoiceID = si.SalesInvoiceID
    GROUP BY si.SalesOrderID
),
returns_by_order AS (
    SELECT
        sr.SalesOrderID,
        ROUND(SUM(srl.QuantityReturned), 2) AS ReturnedQuantity,
        ROUND(SUM(COALESCE(cm.GrandTotal, 0)), 2) AS CreditedAmount
    FROM SalesReturn AS sr
    JOIN SalesReturnLine AS srl
        ON srl.SalesReturnID = sr.SalesReturnID
    LEFT JOIN CreditMemo AS cm
        ON cm.SalesReturnID = sr.SalesReturnID
    GROUP BY sr.SalesOrderID
)
SELECT
    so.SalesOrderID,
    so.OrderNumber,
    so.Status,
    ROUND(so.OrderTotal, 2) AS OrderTotal,
    COUNT(DISTINCT sol.SalesOrderLineID) AS OrderedLineCount,
    SUM(CASE WHEN COALESCE(sh.ShippedQuantity, 0) > 0 THEN 1 ELSE 0 END) AS ShippedLineCount,
    SUM(CASE WHEN COALESCE(bl.BilledQuantity, 0) > 0 THEN 1 ELSE 0 END) AS BilledLineCount,
    ROUND(SUM(sol.Quantity), 2) AS OrderedQuantity,
    ROUND(SUM(COALESCE(sh.ShippedQuantity, 0)), 2) AS ShippedQuantity,
    ROUND(SUM(COALESCE(bl.BilledQuantity, 0)), 2) AS BilledQuantity,
    COALESCE(cbo.InvoiceCount, 0) AS InvoiceCount,
    COALESCE(cbo.InvoicedAmount, 0) AS InvoicedAmount,
    COALESCE(cbo.CashCollected, 0) AS CashCollected,
    COALESCE(rbo.ReturnedQuantity, 0) AS ReturnedQuantity,
    COALESCE(rbo.CreditedAmount, 0) AS CreditedAmount,
    CASE
        WHEN SUM(CASE WHEN COALESCE(sh.ShippedQuantity, 0) > 0 THEN 1 ELSE 0 END) = 0 THEN 'No shipment'
        WHEN SUM(CASE WHEN COALESCE(bl.BilledQuantity, 0) > 0 THEN 1 ELSE 0 END) = 0 THEN 'No invoice'
        WHEN COALESCE(cbo.CashCollected, 0) = 0 AND COALESCE(cbo.InvoicedAmount, 0) > 0 THEN 'No cash collected'
        WHEN COALESCE(rbo.ReturnedQuantity, 0) > 0 THEN 'Returned or credited'
        WHEN ROUND(SUM(sol.Quantity), 2) > ROUND(SUM(COALESCE(sh.ShippedQuantity, 0)), 2) THEN 'Partially shipped'
        WHEN ROUND(SUM(COALESCE(sh.ShippedQuantity, 0)), 2) > ROUND(SUM(COALESCE(bl.BilledQuantity, 0)), 2) THEN 'Partially billed'
        WHEN ROUND(COALESCE(cbo.InvoicedAmount, 0), 2) > ROUND(COALESCE(cbo.CashCollected, 0), 2) THEN 'Partially collected'
        ELSE 'Complete'
    END AS AuditFlag
FROM SalesOrder AS so
JOIN SalesOrderLine AS sol
    ON sol.SalesOrderID = so.SalesOrderID
LEFT JOIN shipped_lines AS sh
    ON sh.SalesOrderID = so.SalesOrderID
   AND sh.SalesOrderLineID = sol.SalesOrderLineID
LEFT JOIN billed_lines AS bl
    ON bl.SalesOrderID = so.SalesOrderID
   AND bl.SalesOrderLineID = sol.SalesOrderLineID
LEFT JOIN cash_by_order AS cbo
    ON cbo.SalesOrderID = so.SalesOrderID
LEFT JOIN returns_by_order AS rbo
    ON rbo.SalesOrderID = so.SalesOrderID
GROUP BY so.SalesOrderID, so.OrderNumber, so.Status, so.OrderTotal, cbo.InvoiceCount, cbo.InvoicedAmount, cbo.CashCollected, rbo.ReturnedQuantity, rbo.CreditedAmount
ORDER BY so.OrderDate, so.OrderNumber;
