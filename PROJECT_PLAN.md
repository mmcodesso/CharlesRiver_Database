# Project Plan

## Objective

Build a reproducible Python generator for the Greenfield Home Furnishings accounting analytics dataset described in `Design.md`.

The target dataset covers fiscal years 2026 through 2030 and includes order-to-cash, procure-to-pay, master data, budgets, general ledger postings, validation, anomaly injection, and SQLite/Excel exports.

## Implementation Phases

1. Foundation: package skeleton, settings loader, shared context, fiscal calendar, empty table registry, chart of accounts loader, cost center generator, employee generator, and warehouse generator.
2. Master data and planning: item generator, customer generator, supplier generator, opening balances, and budgets.
3. Operational documents: sales orders, sales order lines, purchase requisitions, purchase orders, and purchase order lines.
4. Fulfillment and receiving: shipments, shipment lines, goods receipts, and goods receipt lines.
5. Billing and settlement: sales invoices, cash receipts, purchase invoices, and disbursements.
6. Accounting layer: manual journals, posting engine, and validation checks.
7. Analytics realism: anomaly injection, validation after anomaly injection, and SQLite/Excel/report exports.

## Current Starting Scope

This repository now starts with Phase 1 so later phases can build on deterministic context, schema, and master data.
