from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
import yaml

from greenfield_dataset.settings import GenerationContext
from greenfield_dataset.utils import money


def fiscal_years(context: GenerationContext) -> list[int]:
    start = pd.Timestamp(context.settings.fiscal_year_start).year
    end = pd.Timestamp(context.settings.fiscal_year_end).year
    return list(range(int(start), int(end) + 1))


def load_anomaly_profile(context: GenerationContext, profile_path: str | Path = "config/anomaly_profile.yaml") -> dict[str, Any]:
    path = Path(profile_path)
    if not path.exists():
        return {"enabled": False}

    with path.open("r", encoding="utf-8") as handle:
        raw = yaml.safe_load(handle) or {}

    mode = raw.get("mode", context.settings.anomaly_mode)
    return raw.get("profiles", {}).get(mode, {"enabled": False})


def log_anomaly(
    context: GenerationContext,
    anomaly_type: str,
    table_name: str,
    primary_key_value: int,
    fiscal_year: int,
    description: str,
    expected_detection_test: str,
) -> None:
    context.anomaly_log.append({
        "anomaly_type": anomaly_type,
        "table_name": table_name,
        "primary_key_value": int(primary_key_value),
        "fiscal_year": int(fiscal_year),
        "description": description,
        "expected_detection_test": expected_detection_test,
    })


def rows_for_year(df: pd.DataFrame, date_column: str, year: int) -> pd.DataFrame:
    if df.empty or date_column not in df.columns:
        return df.head(0)
    dates = pd.to_datetime(df[date_column], errors="coerce")
    return df[dates.dt.year.eq(year)]


def first_saturday(year: int) -> str:
    day = pd.Timestamp(year=year, month=1, day=1)
    while day.day_name() != "Saturday":
        day = day + pd.Timedelta(days=1)
    return day.strftime("%Y-%m-%d")


def inject_weekend_journal_entries(context: GenerationContext, count_per_year: int) -> None:
    journal_entries = context.tables["JournalEntry"]
    if journal_entries.empty or count_per_year <= 0:
        return

    for year in fiscal_years(context):
        selected = rows_for_year(journal_entries, "PostingDate", year).head(count_per_year)
        for row in selected.itertuples(index=False):
            weekend_date = first_saturday(year)
            mask = context.tables["JournalEntry"]["JournalEntryID"].astype(int).eq(int(row.JournalEntryID))
            context.tables["JournalEntry"].loc[mask, "CreatedDate"] = f"{weekend_date} 10:00:00"
            context.tables["JournalEntry"].loc[mask, "ApprovedDate"] = f"{weekend_date} 11:00:00"
            log_anomaly(
                context,
                "weekend_journal_entry",
                "JournalEntry",
                int(row.JournalEntryID),
                year,
                f"Journal entry created and approved on Saturday {weekend_date}.",
                "Weekend journal entry query using CreatedDate or ApprovedDate.",
            )


def inject_same_creator_approver(context: GenerationContext, count_per_year: int) -> None:
    purchase_orders = context.tables["PurchaseOrder"]
    if purchase_orders.empty or count_per_year <= 0:
        return

    for year in fiscal_years(context):
        selected = rows_for_year(purchase_orders, "OrderDate", year).head(count_per_year)
        for row in selected.itertuples(index=False):
            mask = context.tables["PurchaseOrder"]["PurchaseOrderID"].astype(int).eq(int(row.PurchaseOrderID))
            context.tables["PurchaseOrder"].loc[mask, "ApprovedByEmployeeID"] = int(row.CreatedByEmployeeID)
            log_anomaly(
                context,
                "same_creator_approver",
                "PurchaseOrder",
                int(row.PurchaseOrderID),
                year,
                "Purchase order creator also appears as approver.",
                "Creator-versus-approver segregation of duties query.",
            )


def inject_missing_approvals(context: GenerationContext, count_per_year: int) -> None:
    requisitions = context.tables["PurchaseRequisition"]
    if requisitions.empty or count_per_year <= 0:
        return

    converted = requisitions[requisitions["Status"].eq("Converted to PO")]
    for year in fiscal_years(context):
        selected = rows_for_year(converted, "RequestDate", year).head(count_per_year)
        for row in selected.itertuples(index=False):
            mask = context.tables["PurchaseRequisition"]["RequisitionID"].astype(int).eq(int(row.RequisitionID))
            context.tables["PurchaseRequisition"].loc[mask, "ApprovedByEmployeeID"] = None
            context.tables["PurchaseRequisition"].loc[mask, "ApprovedDate"] = None
            log_anomaly(
                context,
                "missing_approval",
                "PurchaseRequisition",
                int(row.RequisitionID),
                year,
                "Converted requisition has missing approval fields.",
                "Converted requisitions with null ApprovedByEmployeeID or ApprovedDate.",
            )


def inject_invoice_before_shipment(context: GenerationContext, count_per_year: int) -> None:
    invoices = context.tables["SalesInvoice"]
    shipments = context.tables["Shipment"]
    if invoices.empty or shipments.empty or count_per_year <= 0:
        return

    shipment_by_order = shipments.sort_values("ShipmentDate").drop_duplicates("SalesOrderID").set_index("SalesOrderID")
    for year in fiscal_years(context):
        selected = rows_for_year(invoices, "InvoiceDate", year)
        injected = 0
        for row in selected.itertuples(index=False):
            if injected >= count_per_year or int(row.SalesOrderID) not in shipment_by_order.index:
                continue

            shipment_date = pd.Timestamp(shipment_by_order.loc[int(row.SalesOrderID), "ShipmentDate"])
            invoice_date = shipment_date - pd.Timedelta(days=2)
            due_date = invoice_date + (pd.Timestamp(row.DueDate) - pd.Timestamp(row.InvoiceDate))
            mask = context.tables["SalesInvoice"]["SalesInvoiceID"].astype(int).eq(int(row.SalesInvoiceID))
            context.tables["SalesInvoice"].loc[mask, "InvoiceDate"] = invoice_date.strftime("%Y-%m-%d")
            context.tables["SalesInvoice"].loc[mask, "DueDate"] = due_date.strftime("%Y-%m-%d")
            log_anomaly(
                context,
                "invoice_before_shipment",
                "SalesInvoice",
                int(row.SalesInvoiceID),
                year,
                "Sales invoice date intentionally precedes related shipment date.",
                "Invoice date before earliest shipment date by sales order.",
            )
            injected += 1


def inject_duplicate_vendor_payment_reference(context: GenerationContext, count_per_year: int) -> None:
    payments = context.tables["DisbursementPayment"]
    if len(payments) < 2 or count_per_year <= 0:
        return

    for year in fiscal_years(context):
        year_payments = rows_for_year(payments, "PaymentDate", year)
        if len(year_payments) < 2:
            continue

        first_payment = year_payments.iloc[0]
        duplicate_reference = first_payment["CheckNumber"] or first_payment["PaymentNumber"]
        selected = year_payments.iloc[1: 1 + count_per_year]
        for row in selected.itertuples(index=False):
            mask = context.tables["DisbursementPayment"]["DisbursementID"].astype(int).eq(int(row.DisbursementID))
            context.tables["DisbursementPayment"].loc[mask, "PaymentMethod"] = first_payment["PaymentMethod"]
            context.tables["DisbursementPayment"].loc[mask, "CheckNumber"] = duplicate_reference
            log_anomaly(
                context,
                "duplicate_vendor_payment_reference",
                "DisbursementPayment",
                int(row.DisbursementID),
                year,
                "Vendor payment shares a payment reference with another disbursement in the same fiscal year.",
                "Duplicate CheckNumber or payment reference query by fiscal year.",
            )


def inject_threshold_adjacent_entries(context: GenerationContext, count_per_year: int) -> None:
    requisitions = context.tables["PurchaseRequisition"]
    if requisitions.empty or count_per_year <= 0:
        return

    for year in fiscal_years(context):
        selected = rows_for_year(requisitions, "RequestDate", year).head(count_per_year)
        for offset, row in enumerate(selected.itertuples(index=False), start=1):
            quantity = float(row.Quantity) if float(row.Quantity) else 1.0
            target_total = 4995.00 - offset
            estimated_unit_cost = money(target_total / quantity)
            mask = context.tables["PurchaseRequisition"]["RequisitionID"].astype(int).eq(int(row.RequisitionID))
            context.tables["PurchaseRequisition"].loc[mask, "EstimatedUnitCost"] = estimated_unit_cost
            log_anomaly(
                context,
                "threshold_adjacent_requisition",
                "PurchaseRequisition",
                int(row.RequisitionID),
                year,
                "Requisition amount adjusted just below a common approval threshold.",
                "Requisition totals immediately below approval thresholds.",
            )


def inject_related_party_address_matches(context: GenerationContext, count_per_year: int) -> None:
    suppliers = context.tables["Supplier"]
    employees = context.tables["Employee"]
    if suppliers.empty or employees.empty or count_per_year <= 0:
        return

    total_needed = count_per_year * len(fiscal_years(context))
    supplier_rows = suppliers.head(total_needed)
    employee_rows = employees.sample(n=min(total_needed, len(employees)), random_state=context.settings.random_seed, replace=True)
    for index, (supplier_row, employee_row) in enumerate(zip(supplier_rows.itertuples(index=False), employee_rows.itertuples(index=False))):
        year = fiscal_years(context)[index // count_per_year]
        mask = context.tables["Supplier"]["SupplierID"].astype(int).eq(int(supplier_row.SupplierID))
        context.tables["Supplier"].loc[mask, "Address"] = employee_row.Address
        context.tables["Supplier"].loc[mask, "City"] = employee_row.City
        context.tables["Supplier"].loc[mask, "State"] = employee_row.State
        log_anomaly(
            context,
            "related_party_address_match",
            "Supplier",
            int(supplier_row.SupplierID),
            year,
            "Supplier address intentionally matches an employee address.",
            "Supplier-to-employee address match query.",
        )


def inject_anomalies(context: GenerationContext) -> None:
    profile = load_anomaly_profile(context)
    if not profile.get("enabled", False):
        return

    inject_weekend_journal_entries(context, int(profile.get("weekend_journal_entries_per_year", 0)))
    inject_same_creator_approver(context, int(profile.get("same_creator_approver_per_year", 0)))
    inject_missing_approvals(context, int(profile.get("missing_approvals_per_year", 0)))
    inject_invoice_before_shipment(context, int(profile.get("invoice_before_shipment_per_year", 0)))
    inject_duplicate_vendor_payment_reference(context, int(profile.get("duplicate_vendor_payments_per_year", 0)))
    inject_threshold_adjacent_entries(context, int(profile.get("threshold_adjacent_entries_per_year", 0)))
    inject_related_party_address_matches(context, int(profile.get("related_party_address_matches_per_year", 0)))
