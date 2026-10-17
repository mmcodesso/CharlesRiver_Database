---
title: Explain Receipt-to-Payable Timing
description: A foundational procure-to-pay exercise tracing a receipt-matched purchase through supplier invoicing, GRNI, accounts payable, and payment timing.
slug: /learn-and-practice/receipt-to-payable
sidebar_label: Receipt-to-Payable Timing
---

import { QueryReference } from "@site/src/components/QueryReference";

# Explain Receipt-to-Payable Timing

## Context and Problem

Purchasing may order goods in one period, receive them in another, and pay the supplier later. A manager asking what the company owes needs more than a purchase-order total. Your task is to explain one receipt-matched purchase line and the evidence supporting its inventory and liability timing.

## Learning Objectives

- Separate an internal request, supplier commitment, receipt, invoice, and payment.
- Trace the stored line keys supporting a receipt match.
- Explain the relationship between goods received not invoiced (GRNI), AP, and later cash settlement.
- Apply a reporting date without treating subsequent payment as an earlier settlement.

## Before You Start

**Prerequisites:** read [Company Story](../learn-the-business/company-story.md) and the [Procure-to-Pay Process](../processes/p2p.md). Review introductory inventory and liability concepts.

**Tools and files:** use the published SQLite database with a query tool or import the required Excel tables into an exercise workbook. The [SQL Guide](../analytics/sql-guide.md) and [Excel Guide](../analytics/excel-guide.md) provide setup instructions.

**Sources:** `PurchaseRequisition`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `PurchaseInvoice`, `PurchaseInvoiceLine`, `DisbursementPayment`, `GLEntry`, and `Account`. Their records supply the requisition, PO, receiving, supplier billing, and payment evidence.

## Evidence Workflow

1. **Select a receipt-matched population.** Record the dataset version and reporting date. Choose an inventory or materials invoice line with a populated `GoodsReceiptLineID`; keep its `PILineID` and invoice identifier.
2. **Trace the originating need.** Follow `GoodsReceiptLine.POLineID` to `PurchaseOrderLine` and its stored `RequisitionID`. Distinguish the PO header from the item and quantity on the selected line.
3. **Build the event timeline.** Record request, order, receipt, invoice, and payment dates that are supported by the selected records. Retain multiple related receipts or payments when they exist; do not force one-to-one relationships.
4. **Inspect recognition and settlement.** Locate related `GLEntry` postings by source type and identifier. Use the [Posting Reference](../reference/posting.md) to explain inventory, GRNI, AP, and cash effects at the relevant stages.
5. **Assess the date boundary.** Describe the obligation at your reporting date and separately note later settlement. Some supplier payments occur in early 2027 even though the main operating window ends in 2026.

The existing invoice-line query distinguishes receipt matching from the accrued-service branch. Use its receipt-matched records for this first exercise:

<QueryReference
  queryKey="cases/03_p2p_invoice_line_trace_receipt_vs_accrual.sql"
  helperText="Inspect the stored receipt or accrual link, then select an actual receipt-matched line for the foundational timeline."
/>

## Assessed Deliverable

Submit one dated document timeline with real identifiers and an evidence table explaining the source and meaning of each inventory, liability, or cash event. Add a short conclusion about the reporting-date position, one check against duplicated quantities or amounts, and one question requiring additional evidence. Attach the query reference or workbook steps used to reconstruct the trace.

## Interpretation and Limitations

A purchase order records a commitment; it does not by itself prove receipt or an AP posting. A later payment does not eliminate the need to explain the earlier liability. Compare values only after defining their basis: ordered quantity, received standard cost, supplier invoice amount, and paid amount can answer different questions.

This exercise covers receipt-matched inventory and materials. Accrued services use `PurchaseInvoiceLine.AccrualJournalEntryID`; capital purchases require asset and financing evidence. Missing receipt support is not automatically an error when the selected line belongs to a different valid branch. One line cannot establish supplier-wide or population-wide completeness.

## Next Steps

Compare the receipt path with the finance-to-AP bridge in the [P2P Accrual Case](../analytics/cases/p2p-accrual-settlement-case.md), or inspect working-capital timing in [Purchasing and Inventory](../analytics/index.md#purchasing-and-inventory). Return to [Learn and Practice](index.md) for the next foundational activity.
