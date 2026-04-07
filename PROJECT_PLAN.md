# Project Plan

This document summarizes the implementation status of the Greenfield Accounting Dataset Generator. The long-form design remains in `Design.md`.

## Objective

Build a reproducible Python generator for a five-year accounting analytics dataset for Greenfield Home Furnishings, Inc.

The generator produces:

- Synthetic master data
- Monthly O2C and P2P operational transactions
- Opening balances and budgets
- Event-based general ledger postings
- Configurable planted anomalies
- SQLite, Excel, and JSON report outputs

## Completed Phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Package skeleton, settings loader, context, calendar, schema registry, accounts, cost centers, employees, warehouses | Complete |
| 2 | Items, customers, suppliers, opening balances, budgets | Complete |
| 3 | Sales orders, sales order lines, requisitions, purchase orders, purchase order lines | Complete |
| 4 | Shipments, shipment lines, goods receipts, goods receipt lines | Complete |
| 5 | Sales invoices, cash receipts, purchase invoices, disbursements | Complete |
| 6 | Posting engine and accounting validations | Complete |
| 7 | Anomaly injection and SQLite/Excel/JSON export | Complete |

## Current Build Command

```powershell
python generate_dataset.py
```

## Future Enhancements

- Add recurring manual operating journals for payroll, rent, utilities, depreciation, accruals, and reversals
- Add multi-year weekend journal anomalies once recurring journal headers exist beyond 2026
- Add more supplier specialization and multi-line purchase orders
- Add inventory availability simulation
- Add richer payment behavior, aging, and write-off logic
- Add optional CLI arguments for config path and output paths
- Add packaging metadata through `pyproject.toml`
- Add a public open-source license
