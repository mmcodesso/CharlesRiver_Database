---
title: Trace a Goods Sale from Source to Ledger
description: A foundational order-to-cash exercise connecting one actual sales line to shipment, invoice, cash application, and posted accounting evidence.
slug: /learn-and-practice/source-to-ledger
sidebar_label: Trace a Goods Sale
---

import { QueryReference } from "@site/src/components/QueryReference";

# Trace a Goods Sale from Source to Ledger

## Context and Problem

Sales, warehouse operations, and accounting can describe the same customer sale using different dates and documents. Your task is to explain one actual goods-sale line from the published dataset, showing which evidence records demand, physical fulfillment, customer billing, and settlement.

This is a foundational exercise. The company setting is fictional; choose a record present in your assigned file rather than assuming that an illustrative customer story identifies a particular order.

## Learning Objectives

- Distinguish an order, shipment, invoice, receipt, and cash application.
- Preserve line-level traceability when a header has multiple lines or shipments.
- Explain the accounting event behind selected `GLEntry` rows.
- State what one selected trace can and cannot establish.

## Before You Start

**Prerequisites:** read [Company Story](../learn-the-business/company-story.md) and the [Order-to-Cash Process](../processes/o2c.md); review introductory revenue, inventory, receivable, and cash concepts.

**Tools and files:** use the published SQLite file with a query tool, or the Excel workbook with filters and lookups or Power Query. Follow the [SQL Guide](../analytics/sql-guide.md) or [Excel Guide](../analytics/excel-guide.md). Retain the source file and work in a separate analysis file.

**Sources:** `SalesOrder`, `SalesOrderLine`, `Shipment`, `ShipmentLine`, `SalesInvoice`, `SalesInvoiceLine`, `CashReceipt`, `CashReceiptApplication`, `GLEntry`, and `Account`. The source documents are the order, shipment, invoice, receipt, and application records in those tables.

## Evidence Workflow

1. **Set the scope.** Record the dataset version, reporting period, and chosen order and line identifiers. Select a goods line with a stored shipment link; service lines use a different fulfillment path.
2. **Build the document trace.** Follow `ShipmentLine.SalesOrderLineID`, then `SalesInvoiceLine.ShipmentLineID`. Retain header and line keys. Record the dates and quantities at each stage; do not repeat a header total for every joined line.
3. **Check settlement separately.** Follow `CashReceiptApplication.SalesInvoiceID` to the invoice and `CashReceiptID` to the receipt. Note applications on or before your reporting date. A receipt may relate to several invoices or leave an unapplied balance.
4. **Locate the accounting evidence.** Use the source type and identifiers in `GLEntry` to identify postings for the selected events. Check the debit and credit effect using `Account` and the [Posting Reference](../reference/posting.md).
5. **Explain the sequence.** Describe the difference between order, shipment, invoice, receipt, and application dates. If a link is missing or a quantity differs, identify the evidence needed before calling it an error.

For SQL support, inspect the existing line-trace query and limit your review to the selected records:

<QueryReference
  queryKey="cases/01_o2c_line_trace_order_shipment_invoice.sql"
  helperText="Use the existing line-level trace to inspect order, shipment, and invoice relationships. State the population you select."
/>

<QueryReference
  queryKey="cases/02_o2c_source_to_gl_trace.sql"
  helperText="Use this existing query to inspect the posting trail after the document sequence is clear."
/>

## Assessed Deliverable

Submit a compact evidence table containing the real document and line identifiers, event dates, quantity or amount definition, linked source, and accounting significance. Add a short explanation of recognition and settlement, one check that protects against duplicated totals, and one follow-up question supported by your evidence. Include your query references or workbook steps so another student can reproduce the trace.

## Interpretation and Limitations

Explain whether the documents support your selected sale as of the chosen date. Distinguish an observed timing difference from an unsupported claim about a control failure. Do not infer invoice settlement from `CashReceipt.SalesInvoiceID`; the authoritative link is `CashReceiptApplication`.

This exercise focuses on the goods path. Returns, credits, commissions, and service billing may require additional evidence. A single trace does not establish population-wide completeness or audit assurance.

## Next Steps

Extend the investigation in the [O2C Trace Case](../analytics/cases/o2c-trace-case.md), or compare periods in [Commercial and Working Capital](../analytics/reports/commercial-and-working-capital.md). Return to [Learn and Practice](index.md) to choose a second process.
