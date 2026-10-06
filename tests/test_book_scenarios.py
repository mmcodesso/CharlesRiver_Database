"""Tests of the book scenarios (src/generator_dataset/book_scenarios.py and the cutoff step of anomalies.py).

They use small synthetic tables, so they run in seconds: the scenarios edit documents, and each has two cases to
show, planting where the storyline is missing and changing nothing where it is in place.
"""

from __future__ import annotations

from types import SimpleNamespace

import pandas as pd
import pytest

from generator_dataset import anomalies, book_scenarios, scenario
from generator_dataset.schema import TABLE_COLUMNS


def frame(table: str, rows: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(rows, columns=TABLE_COLUMNS[table])


def context(tables: dict[str, pd.DataFrame], *, start: str, end: str, scenarios: dict | None) -> SimpleNamespace:
    settings = SimpleNamespace(
        fiscal_year_start=start, fiscal_year_end=end, book_scenarios=scenarios, tax_rate=0.065, random_seed=20260401,
    )
    all_tables = {name: pd.DataFrame(columns=columns) for name, columns in TABLE_COLUMNS.items()}
    all_tables.update(tables)
    return SimpleNamespace(settings=settings, tables=all_tables, anomaly_log=[], counters={})


# --- the switch ------------------------------------------------------------------------------------

@pytest.mark.parametrize(
    ("section", "expected"),
    [
        (None, None),
        ({"enabled": False, "traced_sale": True}, None),
        ({"enabled": True}, {}),
        ({"enabled": True, "traced_sale": False}, None),
        ({"enabled": True, "traced_sale": {"x": 1}}, {"x": 1}),
    ],
)
def test_book_scenario_switch(section, expected) -> None:
    settings = SimpleNamespace(book_scenarios=section)
    assert scenario.book_scenario(settings, "traced_sale") == expected
    assert scenario.book_scenario(SimpleNamespace(settings=settings), "traced_sale") == expected


# --- the cutoff invoices ---------------------------------------------------------------------------

def story_context(rows: list[dict], *, start: str, end: str, scenarios: dict | None) -> SimpleNamespace:
    """Sales invoices of the cutoff story, one line each. A row gives the invoice id, its date, the date its goods
    shipped, whether it bills Furniture, and optionally an earlier shipment of the same order (billed elsewhere)."""
    invoices, lines, shipment_lines, shipments, orders = [], [], [], [], []
    for row in rows:
        invoice_id = row["id"]
        order_id = invoice_id + 100
        invoices.append({
            "SalesInvoiceID": invoice_id, "InvoiceDate": row["date"], "DueDate": row["date"], "SalesOrderID": order_id,
        })
        lines.append({
            "SalesInvoiceLineID": invoice_id, "SalesInvoiceID": invoice_id, "ShipmentLineID": invoice_id,
            "ItemID": 1 if row.get("furniture") else 2,
        })
        shipment_lines.append({"ShipmentLineID": invoice_id, "ShipmentID": invoice_id})
        shipments.append({
            "ShipmentID": invoice_id, "SalesOrderID": order_id, "ShipmentDate": row["ship"], "DeliveryDate": row["ship"],
        })
        if row.get("also"):  # a second line, shipped on its own shipment
            lines.append({
                "SalesInvoiceLineID": 2000 + invoice_id, "SalesInvoiceID": invoice_id, "ShipmentLineID": 2000 + invoice_id,
                "ItemID": 2,
            })
            shipment_lines.append({"ShipmentLineID": 2000 + invoice_id, "ShipmentID": 2000 + invoice_id})
            shipments.append({
                "ShipmentID": 2000 + invoice_id, "SalesOrderID": order_id, "ShipmentDate": row["also"], "DeliveryDate": row["also"],
            })
        if row.get("first_ship"):
            shipments.append({
                "ShipmentID": 1000 + invoice_id, "SalesOrderID": order_id, "ShipmentDate": row["first_ship"],
                "DeliveryDate": row["first_ship"],
            })
        orders.append({"SalesOrderID": order_id, "OrderDate": "2020-01-01"})
    return context(
        {
            "SalesInvoice": frame("SalesInvoice", invoices),
            "SalesInvoiceLine": frame("SalesInvoiceLine", lines),
            "ShipmentLine": frame("ShipmentLine", shipment_lines),
            "Shipment": frame("Shipment", shipments),
            "SalesOrder": frame("SalesOrder", orders),
            "Item": frame("Item", [{"ItemID": 1, "ItemGroup": "Furniture"}, {"ItemID": 2, "ItemGroup": "Lighting"}]),
        },
        start=start, end=end, scenarios=scenarios,
    )


def jan1(invoice_id: int, **kwargs) -> dict:
    """An invoice of 2026-01-01 for goods shipped that day."""
    return {"id": invoice_id, "date": "2026-01-01", "ship": "2026-01-01", **kwargs}


def planted_by_year(ctx: SimpleNamespace) -> dict[int, list[int]]:
    planted: dict[int, list[int]] = {}
    for entry in ctx.anomaly_log:
        planted.setdefault(entry["fiscal_year"], []).append(entry["primary_key_value"])
    return planted


def run_cutoff(ctx: SimpleNamespace) -> None:
    book_scenarios.plan_cutoff_story(ctx)
    anomalies.inject_invoice_before_shipment(ctx, 3)


def test_cutoff_story_moves_one_shipment_to_december_31_when_no_invoice_bills_december_goods() -> None:
    rows = [jan1(6), jan1(7, furniture=True), jan1(8), jan1(9)]
    ctx = story_context(rows, start="2025-01-01", end="2026-12-31", scenarios={"enabled": True})
    run_cutoff(ctx)
    # every shipment is of January 1, so the middle invoice's goods ship on December 31 instead (a cutoff error)
    assert ctx.book_cutoff_plan == {2026: [6, 7, 8]}
    shipments = ctx.tables["Shipment"].set_index("ShipmentID")
    assert shipments.loc[7, "ShipmentDate"] == shipments.loc[7, "DeliveryDate"] == "2025-12-31"
    assert shipments.loc[6, "ShipmentDate"] == "2026-01-01" and shipments.loc[8, "ShipmentDate"] == "2026-01-01"
    assert planted_by_year(ctx) == {2026: [6, 7, 8]}
    dates = ctx.tables["SalesInvoice"].set_index("SalesInvoiceID")["InvoiceDate"]
    assert (dates[6], dates[7], dates[8], dates[9]) == ("2025-12-30", "2025-12-29", "2025-12-30", "2026-01-01")


def test_cutoff_story_moves_the_january_shipment_of_an_invoice_that_also_bills_december_goods() -> None:
    # invoice 6 bills one line shipped on 2025-12-01 and one on 2026-01-01; moving the second to December 31 makes the
    # invoice entirely goods of 2025, with one Furniture invoice among the three and the other two shipped on January 1
    rows = [jan1(6, furniture=True, ship="2025-12-01", also="2026-01-01"), jan1(7), jan1(8)]
    ctx = story_context(rows, start="2025-01-01", end="2026-12-31", scenarios={"enabled": True})
    run_cutoff(ctx)
    assert ctx.book_cutoff_plan == {2026: [6, 7, 8]}
    shipments = ctx.tables["Shipment"].set_index("ShipmentID")
    assert shipments.loc[2006, "ShipmentDate"] == shipments.loc[2006, "DeliveryDate"] == "2025-12-31"
    assert shipments.loc[6, "ShipmentDate"] == "2025-12-01" and shipments.loc[7, "ShipmentDate"] == "2026-01-01"
    assert planted_by_year(ctx) == {2026: [6, 7, 8]}


def test_cutoff_story_is_left_alone_when_the_first_invoices_already_tell_it() -> None:
    rows = [
        jan1(6), jan1(7, furniture=True, ship="2025-12-06"), jan1(8), jan1(9, furniture=True),
    ]
    on = story_context(rows, start="2025-01-01", end="2026-12-31", scenarios={"enabled": True})
    off = story_context(rows, start="2025-01-01", end="2026-12-31", scenarios=None)
    run_cutoff(on)
    anomalies.inject_invoice_before_shipment(off, 3)
    assert on.book_cutoff_plan == {2026: [6, 7, 8]}
    assert planted_by_year(on) == planted_by_year(off) == {2026: [6, 7, 8]}
    assert on.tables["SalesInvoice"].equals(off.tables["SalesInvoice"])
    assert on.tables["Shipment"].equals(off.tables["Shipment"])
    assert on.anomaly_log == off.anomaly_log


def test_cutoff_story_of_earlier_years_has_no_cutoff_error() -> None:
    rows = [
        # fiscal 2025 (not the last year): the first three include goods shipped in 2024
        {"id": 1, "date": "2025-01-01", "ship": "2025-01-01"},
        {"id": 2, "date": "2025-01-01", "ship": "2024-12-20"},
        {"id": 3, "date": "2025-01-01", "ship": "2025-01-01"},
        {"id": 4, "date": "2025-01-02", "ship": "2025-01-02"},
        {"id": 5, "date": "2025-01-02", "ship": "2025-01-02"},
        {"id": 6, "date": "2025-01-02", "ship": "2025-01-02"},
        # fiscal 2026 (the last year): goods shipped in December between two of January 1, one Furniture invoice
        jan1(7), jan1(8, furniture=True, ship="2025-12-20"), jan1(9),
    ]
    ctx = story_context(rows, start="2024-01-01", end="2026-12-31", scenarios={"enabled": True})
    run_cutoff(ctx)
    assert ctx.book_cutoff_plan == {2025: [4, 5, 6], 2026: [7, 8, 9]}
    assert planted_by_year(ctx)[2025] == [4, 5, 6] and planted_by_year(ctx)[2026] == [7, 8, 9]
    assert ctx.tables["Shipment"].set_index("ShipmentID").loc[8, "ShipmentDate"] == "2025-12-20"  # nothing moved


def test_cutoff_invoices_never_fall_before_the_first_year_and_default_when_no_group_tells_the_story() -> None:
    rows = [
        {"id": 1, "date": "2025-01-01", "ship": "2025-01-02"},
        {"id": 2, "date": "2025-01-01", "ship": "2025-01-02"},
        {"id": 3, "date": "2025-02-03", "ship": "2025-02-05"},
        {"id": 4, "date": "2025-02-04", "ship": "2025-02-06"},
        {"id": 5, "date": "2025-02-05", "ship": "2025-02-07"},
        # the last year's invoices are posted on different dates, so no group of three tells the story
        {"id": 6, "date": "2026-01-01", "ship": "2026-01-01"},
        {"id": 7, "date": "2026-01-02", "ship": "2026-01-02"},
        {"id": 8, "date": "2026-01-03", "ship": "2026-01-03"},
    ]
    on = story_context(rows, start="2025-01-01", end="2026-12-31", scenarios={"enabled": True})
    run_cutoff(on)
    # invoices 1 and 2 would be dated 2024-12-31, before the window, so 3-5 are planted; 2026 keeps the first three
    assert planted_by_year(on) == {2025: [3, 4, 5], 2026: [6, 7, 8]}
    assert min(on.tables["SalesInvoice"]["InvoiceDate"]) >= "2025-01-01"

    off = story_context(rows, start="2025-01-01", end="2026-12-31", scenarios=None)
    anomalies.inject_invoice_before_shipment(off, 3)
    assert planted_by_year(off)[2025] == [1, 2, 3]
    assert off.tables["SalesInvoice"].set_index("SalesInvoiceID")["InvoiceDate"][1] == "2024-12-31"


# --- the traced sale -------------------------------------------------------------------------------

def trace_context(*, quantity: float, method: str, freight: float = 51.0, scenarios: dict | None = None) -> SimpleNamespace:
    """Fiscal 2025-2026; the invoice of 2025 for `quantity` desks, shipped in one of several parts of an order
    line of 11.93, paid by receipt 31 together with two other invoices (receipt 31 = 3 applications)."""
    unit_price = 344.21
    sub_total = round(quantity * unit_price, 2)
    tax = round((sub_total + freight) * 0.065, 2)
    grand = round(sub_total + freight + tax, 2)
    tables = {
        "Item": frame("Item", [
            {"ItemID": 218, "ItemCode": "FUR-DSK-0075", "ItemGroup": "Furniture", "StandardCost": 229.66},
        ]),
        "Customer": frame("Customer", [{"CustomerID": 135, "CustomerSegment": "Wholesale", "Region": "East"}]),
        "SalesOrder": frame("SalesOrder", [{"SalesOrderID": 1697, "FreightTerms": "Prepaid and Add", "Status": "Closed"}]),
        "SalesOrderLine": frame("SalesOrderLine", [
            {"SalesOrderLineID": 6522, "SalesOrderID": 1697, "ItemID": 218, "Quantity": 11.93, "UnitPrice": unit_price, "Discount": 0.0},
        ]),
        "Shipment": frame("Shipment", [{
            "ShipmentID": 3603, "SalesOrderID": 1697, "ShipmentDate": "2025-03-02", "ShippedBy": "DHL Supply Chain",
            "FreightCost": 47.42, "BillableFreightAmount": freight,
        }]),
        "ShipmentLine": frame("ShipmentLine", [{
            "ShipmentLineID": 10449, "ShipmentID": 3603, "SalesOrderLineID": 6522, "ItemID": 218,
            "QuantityShipped": quantity, "ExtendedStandardCost": round(quantity * 229.66, 2),
        }]),
        "SalesInvoice": frame("SalesInvoice", [{
            "SalesInvoiceID": 7947, "InvoiceDate": "2025-03-05", "DueDate": "2025-04-19", "SalesOrderID": 1697,
            "CustomerID": 135, "SubTotal": sub_total, "FreightAmount": freight, "TaxAmount": tax, "GrandTotal": grand,
        }]),
        "SalesInvoiceLine": frame("SalesInvoiceLine", [{
            "SalesInvoiceLineID": 10645, "SalesInvoiceID": 7947, "SalesOrderLineID": 6522, "ShipmentLineID": 10449,
            "ItemID": 218, "Quantity": quantity, "UnitPrice": unit_price, "Discount": 0.0, "LineTotal": sub_total,
        }]),
        "CashReceipt": frame("CashReceipt", [
            {"CashReceiptID": 3043, "PaymentMethod": method, "Amount": grand + 1000.0},
        ]),
        "CashReceiptApplication": frame("CashReceiptApplication", [
            {"CashReceiptApplicationID": 10686, "CashReceiptID": 3043, "SalesInvoiceID": 7947, "AppliedAmount": grand},
            {"CashReceiptApplicationID": 10687, "CashReceiptID": 3043, "SalesInvoiceID": 8000, "AppliedAmount": 500.0},
            {"CashReceiptApplicationID": 10688, "CashReceiptID": 3043, "SalesInvoiceID": 8001, "AppliedAmount": 500.0},
        ]),
        "SalesCommissionAccrual": frame("SalesCommissionAccrual", [{
            "SalesCommissionAccrualID": 1, "SalesInvoiceID": 7947, "SalesInvoiceLineID": 10645,
            "CommissionBaseAmount": sub_total, "CommissionRatePct": 0.015, "CommissionAmount": round(sub_total * 0.015, 2),
        }]),
        "SalesCommissionPaymentLine": frame("SalesCommissionPaymentLine", [{
            "SalesCommissionPaymentLineID": 1, "SalesCommissionPaymentID": 5, "SourceDocumentType": "SalesCommissionAccrual",
            "SourceDocumentID": 1, "Amount": round(sub_total * 0.015, 2),
        }]),
        "SalesCommissionPayment": frame("SalesCommissionPayment", [{
            "SalesCommissionPaymentID": 5, "GrossAccrualAmount": 100.0 + round(sub_total * 0.015, 2),
            "NetPaymentAmount": 100.0 + round(sub_total * 0.015, 2),
        }]),
    }
    return context(tables, start="2025-01-01", end="2026-12-31", scenarios=scenarios)


@pytest.fixture
def no_status_refresh(monkeypatch):
    # the status refresh reads the whole O2C group; these tests check the edits themselves
    monkeypatch.setattr(book_scenarios, "refresh_o2c_statuses", lambda ctx: None)
    monkeypatch.setattr(book_scenarios, "invalidate_o2c_caches", lambda ctx, table: None)


def test_traced_sale_is_planted_by_cutting_the_closest_invoice(no_status_refresh) -> None:
    ctx = trace_context(quantity=3.5, method="Wire Transfer", scenarios={"enabled": True})
    before = book_scenarios.trace_frame(ctx, 2025)
    assert book_scenarios.exact_trace_rows(before).empty

    planted = book_scenarios.plant_traced_sale(ctx)
    assert planted is not None and planted["invoice_id"] == 7947 and planted["quantity_before"] == 3.5

    after = book_scenarios.trace_frame(ctx, 2025)
    assert len(book_scenarios.exact_trace_rows(after)) == 1
    invoice = ctx.tables["SalesInvoice"].iloc[0]
    line = ctx.tables["SalesInvoiceLine"].iloc[0]
    assert line["Quantity"] == 2.0 and line["LineTotal"] == invoice["SubTotal"] == round(2 * 344.21, 2)
    assert invoice["GrandTotal"] == round(invoice["SubTotal"] + invoice["FreightAmount"] + invoice["TaxAmount"], 2)
    assert invoice["TaxAmount"] == round((invoice["SubTotal"] + invoice["FreightAmount"]) * 0.065, 2)
    shipment_line = ctx.tables["ShipmentLine"].iloc[0]
    assert shipment_line["QuantityShipped"] == 2.0 and shipment_line["ExtendedStandardCost"] == round(2 * 229.66, 2)
    shipment = ctx.tables["Shipment"].iloc[0]
    assert shipment["BillableFreightAmount"] == invoice["FreightAmount"] > 0

    applications = ctx.tables["CashReceiptApplication"]
    assert applications.iloc[0]["AppliedAmount"] == invoice["GrandTotal"]
    receipt = ctx.tables["CashReceipt"].iloc[0]
    assert receipt["PaymentMethod"] == "Check"
    # the check still equals its three applications
    assert round(float(receipt["Amount"]), 2) == round(float(applications["AppliedAmount"].sum()), 2)

    accrual = ctx.tables["SalesCommissionAccrual"].iloc[0]
    assert accrual["CommissionBaseAmount"] == invoice["SubTotal"]
    assert accrual["CommissionAmount"] == round(invoice["SubTotal"] * 0.015, 2)
    assert ctx.tables["SalesCommissionPaymentLine"].iloc[0]["Amount"] == accrual["CommissionAmount"]
    payment = ctx.tables["SalesCommissionPayment"].iloc[0]
    assert payment["GrossAccrualAmount"] == payment["NetPaymentAmount"] == round(100.0 + accrual["CommissionAmount"], 2)


def test_traced_sale_changes_nothing_when_it_already_exists(no_status_refresh) -> None:
    ctx = trace_context(quantity=2.0, method="Check", scenarios={"enabled": True})
    snapshot = {name: table.copy() for name, table in ctx.tables.items()}
    assert book_scenarios.plant_traced_sale(ctx) is None
    for name, table in snapshot.items():
        assert ctx.tables[name].equals(table), name


def test_traced_sale_needs_the_scenario_and_a_prior_year(no_status_refresh) -> None:
    off = trace_context(quantity=3.5, method="Check", scenarios=None)
    assert book_scenarios.plant_traced_sale(off) is None
    assert off.tables["SalesInvoiceLine"].iloc[0]["Quantity"] == 3.5
    one_year = trace_context(quantity=3.5, method="Check", scenarios={"enabled": True})
    one_year.settings.fiscal_year_start = "2026-01-01"
    assert book_scenarios.plant_traced_sale(one_year) is None


def test_traced_sale_skips_documents_with_returns_and_year_like_keys(no_status_refresh) -> None:
    ctx = trace_context(quantity=3.5, method="Check", scenarios={"enabled": True})
    ctx.tables["SalesReturn"] = frame("SalesReturn", [{"SalesReturnID": 1, "SalesOrderID": 1697}])
    assert book_scenarios.plant_traced_sale(ctx) is None

    ctx = trace_context(quantity=3.5, method="Check", scenarios={"enabled": True})
    ctx.tables["SalesOrder"].loc[0, "SalesOrderID"] = 2024
    ctx.tables["SalesOrderLine"].loc[0, "SalesOrderID"] = 2024
    ctx.tables["Shipment"].loc[0, "SalesOrderID"] = 2024
    ctx.tables["SalesInvoice"].loc[0, "SalesOrderID"] = 2024
    # fiscal 2025 window: the keys 2024 to 2029 read like years (the registry of the text would flag them)
    assert book_scenarios.plant_traced_sale(ctx) is None


# --- work orders still open from an earlier year ---------------------------------------------------

def work_order_context(*, released: str, planned: float, completed: float, scenarios: dict | None) -> SimpleNamespace:
    ctx = context(
        {
            "WorkOrder": frame("WorkOrder", [{
                "WorkOrderID": 7, "WorkOrderNumber": "WO-2026-000007", "PlannedQuantity": planned, "ReleasedDate": released,
                "ClosedDate": None, "CompletedDate": None, "Status": "Released",
            }]),
            "WorkOrderOperation": frame("WorkOrderOperation", [
                {"WorkOrderOperationID": 1, "WorkOrderID": 7, "PlannedQuantity": planned, "ActualEndDate": "2026-09-01"},
            ]),
            "ProductionCompletion": frame("ProductionCompletion", [
                {"ProductionCompletionID": 1, "WorkOrderID": 7, "CompletionDate": "2026-09-02"},
            ]),
            "ProductionCompletionLine": frame("ProductionCompletionLine", [
                {"ProductionCompletionLineID": 1, "ProductionCompletionID": 1, "QuantityCompleted": completed},
            ]),
            "MaterialIssue": frame("MaterialIssue", [{"MaterialIssueID": 1, "WorkOrderID": 7, "IssueDate": "2027-11-30"}]),
            "LaborTimeEntry": frame("LaborTimeEntry", [
                {"LaborTimeEntryID": 1, "LaborType": "Direct Manufacturing", "WorkOrderID": 7, "WorkDate": "2026-08-30"},
            ]),
        },
        start="2025-01-01", end="2027-12-31", scenarios=scenarios,
    )
    return ctx


@pytest.fixture
def recorded_close(monkeypatch):
    calls = []
    monkeypatch.setattr(
        book_scenarios, "close_eligible_work_orders",
        lambda ctx, year, month, force_work_order_ids=None: calls.append((year, month, set(force_work_order_ids))),
    )
    return calls


def test_stranded_work_order_is_short_closed_at_the_quantity_produced(recorded_close) -> None:
    ctx = work_order_context(released="2026-08-15", planned=17.06, completed=17.05, scenarios={"enabled": True})
    assert book_scenarios.settle_stranded_work_orders(ctx) == [7]
    work_order = ctx.tables["WorkOrder"].iloc[0]
    assert work_order["PlannedQuantity"] == 17.05 and work_order["Status"] == "Completed"
    assert work_order["CompletedDate"] == "2027-11-30"  # after the last issue
    assert ctx.tables["WorkOrderOperation"].iloc[0]["PlannedQuantity"] == 17.05
    assert recorded_close == [(2027, 12, {7})]


def test_work_order_of_the_last_year_or_with_a_large_remainder_is_left_open(recorded_close) -> None:
    last_year = work_order_context(released="2027-03-01", planned=17.06, completed=17.05, scenarios={"enabled": True})
    assert book_scenarios.settle_stranded_work_orders(last_year) == []
    large = work_order_context(released="2026-08-15", planned=17.06, completed=5.0, scenarios={"enabled": True})
    assert book_scenarios.settle_stranded_work_orders(large) == []
    assert large.tables["WorkOrder"].iloc[0]["PlannedQuantity"] == 17.06 and recorded_close == []


def test_stranded_work_orders_need_the_scenario(recorded_close) -> None:
    ctx = work_order_context(released="2026-08-15", planned=17.06, completed=17.05, scenarios=None)
    assert book_scenarios.settle_stranded_work_orders(ctx) == []
    assert ctx.tables["WorkOrder"].iloc[0]["Status"] == "Released"
