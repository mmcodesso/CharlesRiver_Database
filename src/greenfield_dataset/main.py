from __future__ import annotations

from pathlib import Path
from typing import Iterable

import pandas as pd

from greenfield_dataset.anomalies import inject_anomalies
from greenfield_dataset.budgets import generate_budgets, generate_opening_balances
from greenfield_dataset.exporters import export_excel, export_sqlite, export_validation_report
from greenfield_dataset.master_data import (
    backfill_cost_center_managers,
    generate_cost_centers,
    generate_customers,
    generate_employees,
    generate_items,
    generate_suppliers,
    generate_warehouses,
    load_accounts,
)
from greenfield_dataset.o2c import (
    generate_month_cash_receipts,
    generate_month_o2c,
    generate_month_sales_invoices,
    generate_month_shipments,
)
from greenfield_dataset.p2p import (
    generate_month_disbursements,
    generate_month_goods_receipts,
    generate_month_p2p,
    generate_month_purchase_invoices,
)
from greenfield_dataset.posting_engine import post_all_transactions
from greenfield_dataset.schema import create_empty_tables
from greenfield_dataset.settings import GenerationContext, initialize_context, load_settings
from greenfield_dataset.validations import (
    validate_phase1,
    validate_phase2,
    validate_phase3,
    validate_phase4,
    validate_phase5,
    validate_phase6,
    validate_phase7,
)


def build_phase1(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    settings = load_settings(config_path)
    context = initialize_context(settings)

    create_empty_tables(context)
    generate_cost_centers(context)
    load_accounts(context, accounts_path="config/accounts.csv")
    generate_employees(context)
    backfill_cost_center_managers(context)
    generate_warehouses(context)
    validate_phase1(context)
    export_validation_report(context)

    return context


def build_phase2(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    context = build_phase1(config_path)

    generate_items(context)
    generate_customers(context)
    generate_suppliers(context)
    generate_opening_balances(context)
    generate_budgets(context)
    validate_phase2(context)
    export_validation_report(context)

    return context


def build_phase3(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    context = build_phase2(config_path)

    generate_month_o2c(context, 2026, 1)
    generate_month_p2p(context, 2026, 1)
    validate_phase3(context)
    export_validation_report(context)

    return context


def build_phase4(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    context = build_phase3(config_path)

    generate_month_shipments(context, 2026, 1)
    generate_month_goods_receipts(context, 2026, 1)
    validate_phase4(context)
    export_validation_report(context)

    return context


def build_phase5(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    context = build_phase4(config_path)

    generate_month_sales_invoices(context, 2026, 1)
    generate_month_cash_receipts(context, 2026, 1)
    generate_month_purchase_invoices(context, 2026, 1)
    generate_month_disbursements(context, 2026, 1)
    validate_phase5(context)
    export_validation_report(context)

    return context


def build_phase6(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    context = build_phase5(config_path)

    post_all_transactions(context)
    validate_phase6(context)
    export_validation_report(context)

    return context


def build_phase7(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    context = build_phase6(config_path)

    inject_anomalies(context)
    validate_phase7(context)
    if context.settings.export_sqlite:
        export_sqlite(context)
    if context.settings.export_excel:
        export_excel(context)
    export_validation_report(context)

    return context


def fiscal_months(context: GenerationContext) -> Iterable[tuple[int, int]]:
    start = pd.Timestamp(context.settings.fiscal_year_start)
    end = pd.Timestamp(context.settings.fiscal_year_end)
    current = pd.Timestamp(year=start.year, month=start.month, day=1)
    final = pd.Timestamp(year=end.year, month=end.month, day=1)

    while current <= final:
        yield int(current.year), int(current.month)
        current = current + pd.DateOffset(months=1)


def generate_all_months(context: GenerationContext) -> None:
    for year, month in fiscal_months(context):
        generate_month_o2c(context, year, month)
        generate_month_p2p(context, year, month)
        generate_month_shipments(context, year, month)
        generate_month_goods_receipts(context, year, month)
        generate_month_sales_invoices(context, year, month)
        generate_month_cash_receipts(context, year, month)
        generate_month_purchase_invoices(context, year, month)
        generate_month_disbursements(context, year, month)


def build_full_dataset(config_path: str | Path = "config/settings.yaml") -> GenerationContext:
    context = build_phase2(config_path)

    generate_all_months(context)
    validate_phase5(context)
    post_all_transactions(context)
    validate_phase6(context)
    inject_anomalies(context)
    validate_phase7(context)
    if context.settings.export_sqlite:
        export_sqlite(context)
    if context.settings.export_excel:
        export_excel(context)
    export_validation_report(context)

    return context


def print_summary(context: GenerationContext) -> None:
    row_counts = context.validation_results["phase7"]["row_counts"]
    print("Full dataset generated.")
    print(f"Fiscal range: {context.settings.fiscal_year_start} to {context.settings.fiscal_year_end}")
    print(f"Accounts: {row_counts['Account']}")
    print(f"Cost centers: {row_counts['CostCenter']}")
    print(f"Employees: {row_counts['Employee']}")
    print(f"Warehouses: {row_counts['Warehouse']}")
    print(f"Items: {row_counts['Item']}")
    print(f"Customers: {row_counts['Customer']}")
    print(f"Suppliers: {row_counts['Supplier']}")
    print(f"Journal entries: {row_counts['JournalEntry']}")
    print(f"Budget rows: {row_counts['Budget']}")
    print(f"Sales orders: {row_counts['SalesOrder']}")
    print(f"Sales order lines: {row_counts['SalesOrderLine']}")
    print(f"Purchase requisitions: {row_counts['PurchaseRequisition']}")
    print(f"Purchase orders: {row_counts['PurchaseOrder']}")
    print(f"Purchase order lines: {row_counts['PurchaseOrderLine']}")
    print(f"Shipments: {row_counts['Shipment']}")
    print(f"Shipment lines: {row_counts['ShipmentLine']}")
    print(f"Goods receipts: {row_counts['GoodsReceipt']}")
    print(f"Goods receipt lines: {row_counts['GoodsReceiptLine']}")
    print(f"Sales invoices: {row_counts['SalesInvoice']}")
    print(f"Sales invoice lines: {row_counts['SalesInvoiceLine']}")
    print(f"Cash receipts: {row_counts['CashReceipt']}")
    print(f"Purchase invoices: {row_counts['PurchaseInvoice']}")
    print(f"Purchase invoice lines: {row_counts['PurchaseInvoiceLine']}")
    print(f"Disbursements: {row_counts['DisbursementPayment']}")
    print(f"GL entries: {row_counts['GLEntry']}")
    print(f"GL balance exceptions: {context.validation_results['phase7']['gl_balance']['exception_count']}")
    print(f"Anomalies logged: {context.validation_results['phase7']['anomaly_count']}")
    print(f"SQLite export: {context.settings.sqlite_path}")
    print(f"Excel export: {context.settings.excel_path}")
    print(f"Validation report: {context.settings.validation_report_path}")


def main() -> None:
    print_summary(build_full_dataset())


if __name__ == "__main__":
    main()
