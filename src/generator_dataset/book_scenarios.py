"""Book scenarios: storylines of the Accounting Analytics textbook that a rolled window must still contain.

The textbook (Accounting Analytics: An Integrated Approach) is written against one build of this dataset, fiscal
2024-2026 with seed 20260401 (release v2026.1). Most of its storylines come from the generator's calibrations,
which scenario.py anchors on the scenario's end year. A few are accidents of that seed instead: the one sale the
text traces through the ledger, the one invoice that is a revenue cutoff error, and the absence of work orders
left open from an earlier year. Rebuilding the same seed for another window (fiscal 2025-2027, 2026-2028) loses
them, so each is stated here relative to the window and planted only when the build does not already contain it.
On the window of release v2026.1 every step finds its storyline in place and changes nothing, so that build is
identical with and without the scenarios.

The window is described by its last fiscal year C (the year of fiscal_year_end) and the year before it, P.

- cutoff_invoices (plan_cutoff_story below; anomalies.py, inject_invoice_before_shipment): the planted invoices
  dated before their shipment never fall before the first fiscal year, and each year's group tells the book's
  revenue cutoff story: consecutive invoices numbered in one year but dated in the year before, posted on one
  date. In C exactly one of them bills goods that all shipped in P (the cutoff error) and the others bill goods
  shipped in C; in earlier years none does.
- traced_sale (plant_traced_sale, below): the sale that Chapters 1, 3 and 5 trace from order to ledger exists
  exactly as the text tells it, as an invoice of P.
- stranded_work_orders (settle_stranded_work_orders, below): no work order released before C is still open.

Settings: the book_scenarios section of the settings file (enabled, plus one entry per scenario).
"""

from __future__ import annotations

import logging
from typing import Any

import pandas as pd

from generator_dataset import scenario
from generator_dataset.manufacturing import (
    close_eligible_work_orders,
    final_work_order_activity_dates,
    invalidate_manufacturing_caches,
    month_bounds,
    update_work_order_row,
    work_order_completed_quantity_map,
)
from generator_dataset.o2c import (
    invalidate_o2c_caches,
    refresh_o2c_statuses,
    shipment_freight_amounts,
)
from generator_dataset.settings import GenerationContext
from generator_dataset.utils import money, qty

LOGGER = logging.getLogger("generator_dataset")

# The traced sale (Tutorial 3.2, Figures 1.6 and 3.10): one line of two desks, with freight and sales tax, shipped
# and invoiced in parts of a larger order line, billed to a wholesale customer and paid in full by one check that
# also paid other invoices.
TRACE_ITEM_PREFIX = "FUR-DSK-"
TRACE_QUANTITY = 2.0
TRACE_CUSTOMER_SEGMENT = "Wholesale"
TRACE_PAYMENT_METHOD = "Check"
TRACE_MIN_RECEIPT_APPLICATIONS = 3
# The planted invoice is not among the first invoices of its year, which the cutoff anomaly moves.
TRACE_EARLIEST_MONTH = 2


def window_years(context: GenerationContext) -> tuple[int, int]:
    """(the first fiscal year, the last fiscal year C) of the build."""
    return (
        int(pd.Timestamp(context.settings.fiscal_year_start).year),
        int(pd.Timestamp(context.settings.fiscal_year_end).year),
    )


def apply_after_subledgers(context: GenerationContext) -> None:
    """The scenarios that edit documents, run once the monthly subledger transactions exist and before they are
    posted to the general ledger (so the ledger, the closes and the validations see the planted documents)."""
    settle_stranded_work_orders(context)
    plan_cutoff_story(context)
    plant_traced_sale(context)


# --- the revenue cutoff story ----------------------------------------------------------------------

# The invoices the cutoff anomaly dates before their shipment are, in the book's story (Chapter 6 and Exercise 6.1,
# the Part II case, Chapters 14 and 16), a group of consecutive invoices numbered in one year and dated in the year
# before, posted on one date (January 1). In every year but the last they bill goods shipped in the year they were
# posted, all on one date. In the last year exactly one of them bills goods that shipped in the year before (the
# revenue cutoff error: a December shipment invoiced in January) and the others bill goods shipped on one date of
# the last year; exactly one of the three invoices bills Furniture, and all are dated late in the year before.
STORY_LATE_MONTH = 10


def _story_kind(dates: list[str | None], year: int) -> str:
    """How goods shipped on `dates` relate to January 1 of `year`: "prior", "current" or "other" (mixed or unknown)."""
    if not dates or any(shipped is None for shipped in dates):
        return "other"
    if all(shipped < f"{year}-01-01" for shipped in dates):
        return "prior"
    if all(shipped >= f"{year}-01-01" for shipped in dates):
        return "current"
    return "other"


def _story_rows(context: GenerationContext, year: int) -> list[dict[str, Any]]:
    """One record per sales invoice dated in `year` (before the cutoff anomaly), in invoice order: its lines as
    (shipment, shipment date), whether it bills Furniture, the date of its order's first shipment, and the shipment
    that could move to December 31 (those of an order placed before then)."""
    tables = context.tables
    invoices = tables["SalesInvoice"][["SalesInvoiceID", "InvoiceDate", "SalesOrderID"]].copy()
    invoices = _ints(invoices, "SalesInvoiceID", "SalesOrderID")
    invoices["InvoiceDate"] = invoices["InvoiceDate"].astype(str)
    invoices = invoices[invoices["InvoiceDate"].between(f"{year}-01-01", f"{year}-12-31")].sort_values("SalesInvoiceID")
    if invoices.empty:
        return []

    lines = tables["SalesInvoiceLine"][["SalesInvoiceID", "ShipmentLineID", "ItemID"]].copy()
    lines = _ints(lines, "SalesInvoiceID", "ItemID")
    lines["ShipmentLineID"] = pd.to_numeric(lines["ShipmentLineID"], errors="coerce")
    shipment_lines = tables["ShipmentLine"][["ShipmentLineID", "ShipmentID"]].copy()
    shipment_lines = _ints(shipment_lines, "ShipmentLineID", "ShipmentID")
    shipments = tables["Shipment"][["ShipmentID", "SalesOrderID", "ShipmentDate"]].copy()
    shipments = _ints(shipments, "ShipmentID", "SalesOrderID")
    shipments["ShipmentDate"] = shipments["ShipmentDate"].astype(str)
    first_shipment = shipments.groupby("SalesOrderID")["ShipmentDate"].min().to_dict()
    order_dates = tables["SalesOrder"][["SalesOrderID", "OrderDate"]].copy()
    order_dates = _ints(order_dates, "SalesOrderID")
    order_date = dict(zip(order_dates["SalesOrderID"], order_dates["OrderDate"].astype(str)))
    item_groups = tables["Item"][["ItemID", "ItemGroup"]].copy()
    item_groups = _ints(item_groups, "ItemID")

    merged = (
        lines[lines["SalesInvoiceID"].isin(invoices["SalesInvoiceID"])]
        .merge(shipment_lines, on="ShipmentLineID", how="left")
        .merge(shipments[["ShipmentID", "ShipmentDate"]], on="ShipmentID", how="left")
        .merge(item_groups, on="ItemID", how="left")
    )
    by_invoice = {int(invoice_id): group for invoice_id, group in merged.groupby("SalesInvoiceID")}
    records = []
    for row in invoices.itertuples(index=False):
        group = by_invoice.get(int(row.SalesInvoiceID))
        if group is None:
            continue
        shipped_lines = [
            (None if pd.isna(shipment_id) else int(shipment_id), None if pd.isna(shipped) else str(shipped))
            for shipment_id, shipped in zip(group["ShipmentID"], group["ShipmentDate"])
        ]
        # the shipments of this year the invoice bills that could move to December 31: those of an order placed before it
        movable = []
        if order_date.get(int(row.SalesOrderID), "9") < f"{year - 1}-12-31":
            movable = sorted({
                shipment_id for shipment_id, shipped in shipped_lines
                if shipment_id is not None and shipped is not None and shipped >= f"{year}-01-01"
            })
        first = first_shipment.get(int(row.SalesOrderID))
        records.append({
            "id": int(row.SalesInvoiceID),
            "date": row.InvoiceDate,
            "lines": shipped_lines,
            "furniture": bool(group["ItemGroup"].eq("Furniture").any()),
            "first_shipment": pd.Timestamp(first) if first else None,
            "movable": movable,
        })
    return records


def _story_window(
    window: list[dict[str, Any]], year: int, last: bool, move: int | None
) -> tuple[bool, tuple[bool, ...]]:
    """(is it the story, which of its details hold) for consecutive invoices, with the shipment `move` (if any) moved
    to December 31 of the year before."""
    moved = f"{year - 1}-12-31"
    members = []
    for record in window:
        dates = [moved if move is not None and shipment_id == move else shipped for shipment_id, shipped in record["lines"]]
        first = record["first_shipment"]
        if move is not None and first is not None and any(shipment_id == move for shipment_id, _ in record["lines"]):
            first = min(first, pd.Timestamp(moved))
        members.append({
            "id": record["id"], "date": record["date"], "furniture": record["furniture"],
            "kind": _story_kind(dates, year), "dates": set(dates),
            "planted": first - pd.Timedelta(days=2) if first is not None else None,
        })
    ids = [member["id"] for member in members]
    prior = sum(member["kind"] == "prior" for member in members)
    current = [member for member in members if member["kind"] == "current"]
    valid = (
        ids == list(range(ids[0], ids[0] + len(ids)))
        and len({member["date"] for member in members}) == 1
        and all(member["planted"] is not None and member["planted"].year == year - 1 for member in members)
        and len(current) + prior == len(members)
        and prior == (1 if last else 0)
    )
    if not valid:
        return False, ()
    details = [
        members[0]["date"] == f"{year}-01-01",
        len({shipped for member in current for shipped in member["dates"]}) == 1,
    ]
    if last:
        details += [
            sum(member["furniture"] for member in members) == 1,
            all(member["planted"] >= pd.Timestamp(f"{year - 1}-{STORY_LATE_MONTH:02d}-01") for member in members),
        ]
    return True, tuple(details)


def plan_cutoff_story(context: GenerationContext) -> dict[int, list[int]]:
    """Choose, for every year after the first, the invoices the cutoff anomaly will date before their shipment, so
    that they tell the book's revenue cutoff story (see the comment above). The anomaly step plants them
    (`context.book_cutoff_plan`, read by inject_invoice_before_shipment in anomalies.py).

    The first invoices of a year are the default. If they already tell the story (the default build's do, in every
    year) nothing changes. Otherwise the plan takes the consecutive invoices that tell it best (posted on January 1
    first, then billing one shipment date, one Furniture invoice, and dates late in the year). In the last year,
    when no group has an invoice billing goods shipped in the year before, one is made: a shipment of this year that
    an invoice of the group bills moves to December 31 (shipped on the last day of the year, invoiced on the first,
    a cutoff error) and is delivered that day. Nothing is planned for a year where no group tells the story.
    """
    options = scenario.book_scenario(context, "cutoff_invoices")
    if options is None:
        return {}
    first_year, last_year = window_years(context)
    size = int(options.get("group_size", 3))
    plan: dict[int, list[int]] = {}
    for year in range(first_year + 1, last_year + 1):
        last = year == last_year
        rows = _story_rows(context, year)
        best = None
        for start in range(max(len(rows) - size + 1, 0)):
            window = rows[start:start + size]
            moves: list[int | None] = [None]
            if last:
                moves += sorted({shipment_id for record in window for shipment_id in record["movable"]})
            for move in moves:
                story, details = _story_window(window, year, last, move)
                if not story:
                    continue
                position = next((i for i, record in enumerate(window) if move is not None and move in record["movable"]), None)
                centrality = 0.0 if position is None else abs(position - (size - 1) / 2)
                key = (details, move is None, -centrality, -start)
                if best is None or key > best[0]:
                    best = (key, window, move)
            if start == 0 and best is not None and best[2] is None and all(best[0][0]):
                break  # the first invoices of the year already tell the whole story
        if best is None:
            LOGGER.warning("BOOK SCENARIO | cutoff_invoices | no group of invoices tells the cutoff story for %s", year)
            continue
        key, window, move = best
        if move is not None:
            moved = f"{year - 1}-12-31"
            _set_rows(context, "Shipment", "ShipmentID", move, ShipmentDate=moved, DeliveryDate=moved)
            LOGGER.info("BOOK SCENARIO | cutoff_invoices | %s | shipment %s moved to %s", year, move, moved)
        plan[year] = [record["id"] for record in window]
        LOGGER.info("BOOK SCENARIO | cutoff_invoices | %s | planned invoices %s | details %s", year, plan[year], key[0])
    context.book_cutoff_plan = plan
    return plan


# --- the traced sale -------------------------------------------------------------------------------

def _ints(frame: pd.DataFrame, *columns: str) -> pd.DataFrame:
    for column in columns:
        frame[column] = pd.to_numeric(frame[column]).astype(int)
    return frame


def trace_frame(context: GenerationContext, prior_year: int) -> pd.DataFrame:
    """One row per one-line invoice of `prior_year` for a desk shipped from a single shipment line and paid by a
    single application, with the facts the traced sale is tested on."""
    tables = context.tables
    invoices = tables["SalesInvoice"][
        ["SalesInvoiceID", "InvoiceDate", "SalesOrderID", "CustomerID", "SubTotal", "FreightAmount", "TaxAmount", "GrandTotal"]
    ].copy()
    invoices = _ints(invoices, "SalesInvoiceID", "SalesOrderID", "CustomerID")
    invoices["InvoiceDate"] = invoices["InvoiceDate"].astype(str)
    invoices = invoices[invoices["InvoiceDate"].between(f"{prior_year}-01-01", f"{prior_year}-12-31")]

    lines = tables["SalesInvoiceLine"][
        ["SalesInvoiceLineID", "SalesInvoiceID", "SalesOrderLineID", "ShipmentLineID", "ItemID", "Quantity", "UnitPrice", "Discount"]
    ].copy()
    lines["ShipmentLineID"] = pd.to_numeric(lines["ShipmentLineID"], errors="coerce")
    lines = _ints(lines, "SalesInvoiceLineID", "SalesInvoiceID", "SalesOrderLineID", "ItemID")
    line_counts = lines.groupby("SalesInvoiceID").size()
    lines = lines[lines["SalesInvoiceID"].map(line_counts).eq(1) & lines["ShipmentLineID"].notna()]
    lines["ShipmentLineID"] = lines["ShipmentLineID"].astype(int)
    for column in ("Quantity", "UnitPrice", "Discount"):
        lines[column] = lines[column].astype(float)

    items = tables["Item"][["ItemID", "ItemCode", "StandardCost"]].copy()
    items = _ints(items, "ItemID")
    items["StandardCost"] = items["StandardCost"].astype(float)
    items = items[items["ItemCode"].astype(str).str.startswith(TRACE_ITEM_PREFIX)]

    order_lines = tables["SalesOrderLine"][["SalesOrderLineID", "Quantity"]].copy()
    order_lines = _ints(order_lines, "SalesOrderLineID").rename(columns={"Quantity": "OrderLineQuantity"})
    order_lines["OrderLineQuantity"] = order_lines["OrderLineQuantity"].astype(float)

    shipment_lines = tables["ShipmentLine"][["ShipmentLineID", "ShipmentID", "QuantityShipped"]].copy()
    shipment_lines = _ints(shipment_lines, "ShipmentLineID", "ShipmentID")
    shipment_lines["QuantityShipped"] = shipment_lines["QuantityShipped"].astype(float)

    shipments = tables["Shipment"][["ShipmentID", "ShipmentDate", "ShippedBy", "FreightCost", "BillableFreightAmount"]].copy()
    shipments = _ints(shipments, "ShipmentID")
    shipments["ShipmentDate"] = shipments["ShipmentDate"].astype(str)
    shipments = shipments.rename(columns={"FreightCost": "ShipmentFreightCost", "BillableFreightAmount": "ShipmentBillableFreight"})
    shipments["ShipmentBillableFreight"] = shipments["ShipmentBillableFreight"].astype(float).fillna(0.0)

    customers = tables["Customer"][["CustomerID", "CustomerSegment", "Region"]].copy()
    customers = _ints(customers, "CustomerID")

    sales_orders = tables["SalesOrder"][["SalesOrderID", "FreightTerms"]].copy()
    sales_orders = _ints(sales_orders, "SalesOrderID")

    applications = tables["CashReceiptApplication"][
        ["CashReceiptApplicationID", "CashReceiptID", "SalesInvoiceID", "AppliedAmount"]
    ].copy()
    applications = _ints(applications, "CashReceiptApplicationID", "CashReceiptID", "SalesInvoiceID")
    applications["AppliedAmount"] = applications["AppliedAmount"].astype(float)
    invoice_application_counts = applications.groupby("SalesInvoiceID").size().rename("ApplicationCount")
    receipt_application_counts = applications.groupby("CashReceiptID").size().rename("ReceiptApplicationCount")

    receipts = tables["CashReceipt"][["CashReceiptID", "PaymentMethod"]].copy()
    receipts = _ints(receipts, "CashReceiptID")

    frame = (
        invoices.merge(lines, on="SalesInvoiceID")
        .merge(items, on="ItemID")
        .merge(order_lines, on="SalesOrderLineID")
        .merge(shipment_lines, on="ShipmentLineID")
        .merge(shipments, on="ShipmentID")
        .merge(customers, on="CustomerID")
        .merge(sales_orders, on="SalesOrderID")
        .merge(invoice_application_counts, left_on="SalesInvoiceID", right_index=True)
        .merge(applications, on="SalesInvoiceID")
        .merge(receipt_application_counts, left_on="CashReceiptID", right_index=True)
        .merge(receipts, on="CashReceiptID")
    )
    for column in ("SubTotal", "FreightAmount", "TaxAmount", "GrandTotal"):
        frame[column] = frame[column].astype(float)
    return frame.sort_values(["InvoiceDate", "SalesInvoiceID"]).reset_index(drop=True)


def exact_trace_rows(frame: pd.DataFrame) -> pd.DataFrame:
    """The invoices that already are the traced sale (the facts/visible.py rule's first tier, before posting: a
    one-line invoice with freight and tax posts the four ledger rows the text lists)."""
    return frame[
        frame["Quantity"].eq(TRACE_QUANTITY)
        & frame["QuantityShipped"].eq(frame["Quantity"])
        & frame["OrderLineQuantity"].gt(frame["Quantity"])
        & frame["ShipmentDate"].lt(frame["InvoiceDate"])
        & frame["FreightAmount"].gt(0)
        & frame["TaxAmount"].gt(0)
        & frame["ApplicationCount"].eq(1)
        & (frame["AppliedAmount"] - frame["GrandTotal"]).abs().lt(0.005)
        & frame["ReceiptApplicationCount"].ge(TRACE_MIN_RECEIPT_APPLICATIONS)
        & frame["CustomerSegment"].eq(TRACE_CUSTOMER_SEGMENT)
        & frame["PaymentMethod"].eq(TRACE_PAYMENT_METHOD)
    ]


def plantable_trace_rows(context: GenerationContext, frame: pd.DataFrame, prior_year: int) -> pd.DataFrame:
    """The invoices that become the traced sale by cutting the shipped quantity down to two desks.

    Their other facts already match, so only the amounts that follow the quantity change (the shipment's freight is
    figured again for two desks), and the payment method of the check is set. Invoices that already carry freight
    come first; an invoice without freight (an order whose freight the customer prepays) is used only when none does.
    The planted sale avoids documents with returns, and any key that reads like a year (the text's registry holds
    document keys, and a key such as 2026 would read as one).
    """
    tables = context.tables
    first_year, last_year = window_years(context)
    returned_orders = set(pd.to_numeric(tables["SalesReturn"]["SalesOrderID"]).astype(int)) | set(
        pd.to_numeric(tables["CreditMemo"]["SalesOrderID"]).astype(int)
    )
    returned_lines = set(pd.to_numeric(tables["SalesReturnLine"]["ShipmentLineID"]).astype(int))
    year_like = range(first_year - 1, last_year + 3)
    key_columns = [
        "SalesInvoiceID", "SalesOrderID", "SalesInvoiceLineID", "SalesOrderLineID", "ShipmentLineID", "ShipmentID",
        "CustomerID", "ItemID", "CashReceiptApplicationID", "CashReceiptID",
    ]
    mask = (
        frame["Quantity"].gt(TRACE_QUANTITY)
        & frame["QuantityShipped"].eq(frame["Quantity"])
        & frame["OrderLineQuantity"].ge(frame["Quantity"])
        & frame["ShipmentDate"].lt(frame["InvoiceDate"])
        & frame["InvoiceDate"].ge(f"{prior_year}-{TRACE_EARLIEST_MONTH:02d}-01")
        & frame["TaxAmount"].gt(0)
        & frame["ApplicationCount"].eq(1)
        & (frame["AppliedAmount"] - frame["GrandTotal"]).abs().lt(0.005)
        & frame["ReceiptApplicationCount"].ge(TRACE_MIN_RECEIPT_APPLICATIONS)
        & frame["CustomerSegment"].eq(TRACE_CUSTOMER_SEGMENT)
        # the freight on the invoice is the freight of its shipment (billed once), or the shipment bills none
        & ((frame["FreightAmount"].gt(0) & (frame["FreightAmount"] - frame["ShipmentBillableFreight"]).abs().lt(0.005))
           | (frame["FreightAmount"].eq(0) & frame["ShipmentBillableFreight"].eq(0)))
        & ~frame["SalesOrderID"].isin(returned_orders)
        & ~frame["ShipmentLineID"].isin(returned_lines)
    )
    for column in key_columns:
        mask &= ~frame[column].isin(year_like)
    chosen = frame[mask].copy()
    chosen["HasFreight"] = chosen["FreightAmount"].gt(0)
    chosen["IsCheck"] = chosen["PaymentMethod"].eq(TRACE_PAYMENT_METHOD)
    chosen["QuantityGap"] = chosen["Quantity"] - TRACE_QUANTITY
    return chosen.sort_values(
        ["HasFreight", "IsCheck", "QuantityGap", "InvoiceDate", "SalesInvoiceID"],
        ascending=[False, False, True, True, True],
    )


def _set_rows(context: GenerationContext, table: str, key_column: str, key: int, **values: Any) -> int:
    frame = context.tables[table]
    mask = pd.to_numeric(frame[key_column]).astype(int).eq(int(key))
    for column, value in values.items():
        frame.loc[mask, column] = value
    return int(mask.sum())


def plant_traced_sale(context: GenerationContext) -> dict[str, Any] | None:
    """Make an invoice of P the sale the text traces, unless the build already contains it.

    Returns what was planted (None when the scenario is off, the window has no prior year, the sale already
    exists, or no invoice can be cut down to it).
    """
    if scenario.book_scenario(context, "traced_sale") is None:
        return None
    first_year, last_year = window_years(context)
    prior_year = last_year - 1
    if prior_year < first_year:
        return None

    frame = trace_frame(context, prior_year)
    existing = exact_trace_rows(frame)
    if not existing.empty:
        LOGGER.info(
            "BOOK SCENARIO | traced_sale | already present | invoice_id=%s",
            int(existing.iloc[0]["SalesInvoiceID"]),
        )
        return None

    candidates = plantable_trace_rows(context, frame, prior_year)
    if candidates.empty:
        LOGGER.warning("BOOK SCENARIO | traced_sale | no invoice of %s can be cut down to the traced sale", prior_year)
        return None

    row = candidates.iloc[0]
    invoice_id = int(row["SalesInvoiceID"])
    old_grand_total = float(row["GrandTotal"])
    sub_total = money(TRACE_QUANTITY * float(row["UnitPrice"]) * (1 - float(row["Discount"])))
    # An invoice that carried no freight belongs to an order whose freight the customer prepays; making it the
    # traced sale puts "Prepaid and Add" terms on the order and bills the freight of this shipment.
    adds_freight_terms = float(row["FreightAmount"]) <= 0
    freight_cost, freight = _shipment_freight_for_two_desks(
        context, row, "Prepaid and Add" if adds_freight_terms else str(row["FreightTerms"])
    )
    if freight <= 0:
        LOGGER.warning("BOOK SCENARIO | traced_sale | invoice %s would carry no freight; nothing planted", invoice_id)
        return None
    tax_amount = money((sub_total + freight) * context.settings.tax_rate)
    grand_total = money(sub_total + freight + tax_amount)
    grand_total_change = money(grand_total - old_grand_total)

    _set_rows(
        context, "ShipmentLine", "ShipmentLineID", int(row["ShipmentLineID"]),
        QuantityShipped=TRACE_QUANTITY, ExtendedStandardCost=money(TRACE_QUANTITY * float(row["StandardCost"])),
    )
    _set_rows(
        context, "Shipment", "ShipmentID", int(row["ShipmentID"]),
        FreightCost=freight_cost, BillableFreightAmount=freight,
    )
    if adds_freight_terms:
        _set_rows(context, "SalesOrder", "SalesOrderID", int(row["SalesOrderID"]), FreightTerms="Prepaid and Add")
    _set_rows(
        context, "SalesInvoiceLine", "SalesInvoiceLineID", int(row["SalesInvoiceLineID"]),
        Quantity=TRACE_QUANTITY, LineTotal=sub_total,
    )
    _set_rows(
        context, "SalesInvoice", "SalesInvoiceID", invoice_id,
        SubTotal=sub_total, FreightAmount=freight, TaxAmount=tax_amount, GrandTotal=grand_total,
    )
    _set_rows(
        context, "CashReceiptApplication", "CashReceiptApplicationID", int(row["CashReceiptApplicationID"]),
        AppliedAmount=grand_total,
    )
    receipts = context.tables["CashReceipt"]
    receipt_mask = pd.to_numeric(receipts["CashReceiptID"]).astype(int).eq(int(row["CashReceiptID"]))
    receipts.loc[receipt_mask, "Amount"] = money(float(receipts.loc[receipt_mask, "Amount"].iloc[0]) + grand_total_change)
    receipts.loc[receipt_mask, "PaymentMethod"] = TRACE_PAYMENT_METHOD
    _reprice_commission(context, int(row["SalesInvoiceLineID"]), sub_total)

    for table in ("ShipmentLine", "SalesInvoice", "SalesInvoiceLine", "CashReceiptApplication", "CashReceipt"):
        invalidate_o2c_caches(context, table)
    refresh_o2c_statuses(context)

    planted = {
        "invoice_id": invoice_id,
        "sales_order_id": int(row["SalesOrderID"]),
        "item_code": str(row["ItemCode"]),
        "invoice_date": str(row["InvoiceDate"]),
        "quantity_before": float(row["Quantity"]),
        "grand_total": grand_total,
    }
    LOGGER.info(
        "BOOK SCENARIO | traced_sale | planted | invoice_id=%s | order_id=%s | item=%s | invoice_date=%s | quantity %s -> %s | grand_total %s -> %s",
        invoice_id, planted["sales_order_id"], planted["item_code"], planted["invoice_date"],
        planted["quantity_before"], TRACE_QUANTITY, old_grand_total, grand_total,
    )
    return planted


def _shipment_freight_for_two_desks(context: GenerationContext, row: pd.Series, freight_terms: str) -> tuple[float, float]:
    """(freight cost, billable freight) of the traced shipment figured again by the generator's own rule, with the
    traced line cut to two desks (the shipment is partial: the rest of the order line stays unshipped)."""
    shipment_id = int(row["ShipmentID"])
    shipment_lines = context.tables["ShipmentLine"]
    lines = shipment_lines[pd.to_numeric(shipment_lines["ShipmentID"]).astype(int).eq(shipment_id)]
    order_lines = context.tables["SalesOrderLine"].set_index("SalesOrderLineID")
    item_groups = context.tables["Item"].set_index("ItemID")["ItemGroup"].astype(str)
    metrics = []
    for line in lines.itertuples(index=False):
        quantity = TRACE_QUANTITY if int(line.ShipmentLineID) == int(row["ShipmentLineID"]) else float(line.QuantityShipped)
        sales_line = order_lines.loc[int(line.SalesOrderLineID)]
        metrics.append({
            "ItemGroup": str(item_groups.loc[int(line.ItemID)]),
            "QuantityShipped": quantity,
            "MerchandiseSubTotal": money(quantity * float(sales_line["UnitPrice"]) * (1 - float(sales_line["Discount"]))),
        })
    return shipment_freight_amounts(
        context,
        shipment_id=shipment_id,
        customer_region=str(row["Region"]),
        carrier_name=str(row["ShippedBy"]),
        freight_terms=freight_terms,
        shipped_line_metrics=metrics,
        is_partial_shipment=True,
    )


def _reprice_commission(context: GenerationContext, invoice_line_id: int, base_amount: float) -> None:
    """Carry a changed invoice line into its commission accrual and, if paid, into the payment that settled it."""
    accruals = context.tables["SalesCommissionAccrual"]
    accrual_mask = pd.to_numeric(accruals["SalesInvoiceLineID"], errors="coerce").eq(int(invoice_line_id))
    for index in accruals.index[accrual_mask]:
        accrual_id = int(accruals.at[index, "SalesCommissionAccrualID"])
        old_amount = float(accruals.at[index, "CommissionAmount"])
        new_amount = money(base_amount * float(accruals.at[index, "CommissionRatePct"]))
        accruals.at[index, "CommissionBaseAmount"] = base_amount
        accruals.at[index, "CommissionAmount"] = new_amount
        change = money(new_amount - old_amount)

        payment_lines = context.tables["SalesCommissionPaymentLine"]
        line_mask = (
            payment_lines["SourceDocumentType"].eq("SalesCommissionAccrual")
            & pd.to_numeric(payment_lines["SourceDocumentID"]).astype(int).eq(accrual_id)
        )
        for line_index in payment_lines.index[line_mask]:
            payment_id = int(payment_lines.at[line_index, "SalesCommissionPaymentID"])
            payment_lines.at[line_index, "Amount"] = money(float(payment_lines.at[line_index, "Amount"]) + change)
            payments = context.tables["SalesCommissionPayment"]
            payment_mask = pd.to_numeric(payments["SalesCommissionPaymentID"]).astype(int).eq(payment_id)
            for payment_index in payments.index[payment_mask]:
                payments.at[payment_index, "GrossAccrualAmount"] = money(float(payments.at[payment_index, "GrossAccrualAmount"]) + change)
                payments.at[payment_index, "NetPaymentAmount"] = money(float(payments.at[payment_index, "NetPaymentAmount"]) + change)


# --- work orders still open from an earlier year ---------------------------------------------------

def settle_stranded_work_orders(context: GenerationContext) -> list[int]:
    """Close the work orders released before the last year that the monthly simulation left open.

    A work order can strand with a rounding sliver of its quantity unfinished (completed 17.05 of 17.06 units, every
    operation done, a requisition for a few hundredths of a unit raised each month). Most resolve in time; those
    still open when the data end are settled in the last month: short-closed at the quantity produced and closed
    with the variances of the work actually done. Work orders released in the last year stay open, as the book
    describes (the backlog at the end of the data). Nothing happens where no such work order exists, as in the
    default build.

    Options (book_scenarios.stranded_work_orders): max_remaining_share, the largest unfinished share of the planned
    quantity that is settled this way (default 0.05); a work order with more left, or with nothing produced or no
    direct labor, is reported and left open.
    """
    options = scenario.book_scenario(context, "stranded_work_orders")
    if options is None:
        return []
    work_orders = context.tables["WorkOrder"]
    if work_orders.empty:
        return []
    _, last_year = window_years(context)
    released_year = pd.to_datetime(work_orders["ReleasedDate"]).dt.year
    stranded = work_orders[work_orders["ClosedDate"].isna() & released_year.lt(last_year)].sort_values("WorkOrderID")
    if stranded.empty:
        return []

    max_share = float(options.get("max_remaining_share", 0.05))
    final_month_end = month_bounds(*_last_month(context))[1]
    completed = work_order_completed_quantity_map(context)
    activity = final_work_order_activity_dates(context)
    completions = context.tables["ProductionCompletion"]
    completion_dates = (
        completions.assign(WorkOrderID=pd.to_numeric(completions["WorkOrderID"]).astype(int))
        .groupby("WorkOrderID")["CompletionDate"].max().to_dict()
        if not completions.empty else {}
    )
    labor = context.tables["LaborTimeEntry"]
    direct_labor_ids = set(
        pd.to_numeric(labor.loc[labor["LaborType"].eq("Direct Manufacturing") & labor["WorkOrderID"].notna(), "WorkOrderID"]).astype(int)
    ) if not labor.empty else set()

    settled: list[int] = []
    left_open: list[str] = []
    for work_order in stranded.itertuples(index=False):
        work_order_id = int(work_order.WorkOrderID)
        planned = float(work_order.PlannedQuantity)
        done = float(completed.get(work_order_id, 0.0))
        remaining = round(planned - done, 2)
        if done <= 0 or work_order_id not in direct_labor_ids or remaining > max_share * planned:
            left_open.append(f"{work_order.WorkOrderNumber} (planned {planned}, completed {done})")
            continue

        if remaining > 0:
            _set_rows(context, "WorkOrder", "WorkOrderID", work_order_id, PlannedQuantity=qty(done))
            _set_rows(context, "WorkOrderOperation", "WorkOrderID", work_order_id, PlannedQuantity=qty(done))
        completed_on = max(
            pd.Timestamp(completion_dates[work_order_id]),
            pd.Timestamp(activity.get(work_order_id, pd.Timestamp(completion_dates[work_order_id]))),
        )
        completed_on = min(completed_on, final_month_end)
        update_work_order_row(context, work_order_id, "Completed", completed_date=completed_on.strftime("%Y-%m-%d"))
        settled.append(work_order_id)

    if settled:
        invalidate_manufacturing_caches(context, "WorkOrderOperation")
        year, month = _last_month(context)
        close_eligible_work_orders(context, year, month, force_work_order_ids=set(settled))
    LOGGER.info(
        "BOOK SCENARIO | stranded_work_orders | settled=%s | left_open=%s%s",
        len(settled), len(left_open), f" | {'; '.join(left_open)}" if left_open else "",
    )
    return settled


def _last_month(context: GenerationContext) -> tuple[int, int]:
    end = pd.Timestamp(context.settings.fiscal_year_end)
    return int(end.year), int(end.month)
