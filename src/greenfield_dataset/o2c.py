from __future__ import annotations

import pandas as pd

from greenfield_dataset.schema import TABLE_COLUMNS
from greenfield_dataset.settings import GenerationContext
from greenfield_dataset.utils import format_doc_number, money, next_id, qty, random_date_in_month


SEGMENT_ORDER_WEIGHTS = {
    "Strategic": 4.0,
    "Wholesale": 2.5,
    "Design Trade": 1.7,
    "Small Business": 1.0,
}

SEGMENT_LINE_RANGES = {
    "Strategic": (3, 7),
    "Wholesale": (2, 6),
    "Design Trade": (2, 5),
    "Small Business": (1, 4),
}

SEGMENT_QUANTITY_RANGES = {
    "Strategic": (4, 18),
    "Wholesale": (3, 14),
    "Design Trade": (2, 9),
    "Small Business": (1, 6),
}

CARRIERS = ["Greenfield Fleet", "FedEx Freight", "UPS Freight", "DHL Supply Chain"]
PAYMENT_METHODS = ["ACH", "Wire Transfer", "Check", "Credit Card"]


def append_rows(context: GenerationContext, table_name: str, rows: list[dict]) -> None:
    if not rows:
        return

    new_rows = pd.DataFrame(rows, columns=TABLE_COLUMNS[table_name])
    context.tables[table_name] = pd.concat(
        [context.tables[table_name], new_rows],
        ignore_index=True,
    )


def sales_cost_center_id(context: GenerationContext) -> int:
    cost_centers = context.tables["CostCenter"]
    matches = cost_centers.loc[cost_centers["CostCenterName"].eq("Sales"), "CostCenterID"]
    if matches.empty:
        raise ValueError("Sales cost center is required for sales order generation.")
    return int(matches.iloc[0])


def employee_ids_for_cost_center(context: GenerationContext, cost_center_name: str) -> list[int]:
    cost_centers = context.tables["CostCenter"]
    matches = cost_centers.loc[cost_centers["CostCenterName"].eq(cost_center_name), "CostCenterID"]
    if matches.empty:
        return context.tables["Employee"]["EmployeeID"].astype(int).tolist()

    employee_ids = context.tables["Employee"].loc[
        context.tables["Employee"]["CostCenterID"].eq(int(matches.iloc[0])),
        "EmployeeID",
    ].astype(int).tolist()
    return employee_ids or context.tables["Employee"]["EmployeeID"].astype(int).tolist()


def payment_term_days(payment_terms: str) -> int:
    try:
        return int(str(payment_terms).split()[-1])
    except (ValueError, IndexError):
        return 30


def active_sellable_items(context: GenerationContext) -> pd.DataFrame:
    items = context.tables["Item"]
    sellable = items[
        items["IsActive"].eq(1)
        & items["ListPrice"].notna()
        & items["RevenueAccountID"].notna()
    ].copy()
    if sellable.empty:
        raise ValueError("Generate active sellable items before O2C transactions.")
    return sellable


def select_customer(context: GenerationContext) -> pd.Series:
    customers = context.tables["Customer"]
    active = customers[customers["IsActive"].eq(1)].copy()
    if active.empty:
        raise ValueError("Generate active customers before O2C transactions.")

    weights = active["CustomerSegment"].map(SEGMENT_ORDER_WEIGHTS).astype(float)
    weights = weights / weights.sum()
    selected_index = context.rng.choice(active.index.to_numpy(), p=weights.to_numpy())
    return active.loc[selected_index]


def select_sales_item(context: GenerationContext, sellable_items: pd.DataFrame, customer_segment: str) -> pd.Series:
    group_preferences = {
        "Strategic": {"Furniture": 0.42, "Lighting": 0.18, "Textiles": 0.20, "Accessories": 0.20},
        "Wholesale": {"Furniture": 0.35, "Lighting": 0.20, "Textiles": 0.20, "Accessories": 0.25},
        "Design Trade": {"Furniture": 0.30, "Lighting": 0.24, "Textiles": 0.26, "Accessories": 0.20},
        "Small Business": {"Furniture": 0.25, "Lighting": 0.22, "Textiles": 0.22, "Accessories": 0.31},
    }
    preferences = group_preferences[customer_segment]
    weights = sellable_items["ItemGroup"].map(preferences).fillna(0.01).astype(float)
    weights = weights / weights.sum()
    selected_index = context.rng.choice(sellable_items.index.to_numpy(), p=weights.to_numpy())
    return sellable_items.loc[selected_index]


def generate_month_sales_orders(context: GenerationContext, year: int, month: int) -> None:
    sellable_items = active_sellable_items(context)
    sales_center_id = sales_cost_center_id(context)
    rng = context.rng
    order_count = int(rng.integers(95, 126))
    if month in [3, 4, 9, 10, 11]:
        order_count = int(order_count * 1.10)

    order_rows: list[dict] = []
    line_rows: list[dict] = []

    for _ in range(order_count):
        customer = select_customer(context)
        order_id = next_id(context, "SalesOrder")
        order_date = random_date_in_month(rng, year, month)
        requested_delivery_date = order_date + pd.Timedelta(days=int(rng.integers(3, 15)))
        segment = str(customer["CustomerSegment"])
        line_min, line_max = SEGMENT_LINE_RANGES[segment]
        line_count = int(rng.integers(line_min, line_max))

        order_total = 0.0
        used_item_ids: set[int] = set()
        for line_number in range(1, line_count + 1):
            item = select_sales_item(context, sellable_items, segment)
            retry_count = 0
            while int(item["ItemID"]) in used_item_ids and retry_count < 5:
                item = select_sales_item(context, sellable_items, segment)
                retry_count += 1

            used_item_ids.add(int(item["ItemID"]))
            qty_min, qty_max = SEGMENT_QUANTITY_RANGES[segment]
            quantity = qty(int(rng.integers(qty_min, qty_max)))
            unit_price = money(float(item["ListPrice"]) * rng.uniform(0.97, 1.04))
            discount = qty(rng.uniform(0.00, 0.12), "0.0001")
            if segment in ["Strategic", "Wholesale"]:
                discount = qty(rng.uniform(0.04, 0.18), "0.0001")
            line_total = money(quantity * unit_price * (1 - discount))
            order_total = money(order_total + line_total)

            line_rows.append({
                "SalesOrderLineID": next_id(context, "SalesOrderLine"),
                "SalesOrderID": order_id,
                "LineNumber": line_number,
                "ItemID": int(item["ItemID"]),
                "Quantity": quantity,
                "UnitPrice": unit_price,
                "Discount": discount,
                "LineTotal": line_total,
            })

        order_rows.append({
            "SalesOrderID": order_id,
            "OrderNumber": format_doc_number("SO", year, order_id),
            "OrderDate": order_date.strftime("%Y-%m-%d"),
            "CustomerID": int(customer["CustomerID"]),
            "RequestedDeliveryDate": requested_delivery_date.strftime("%Y-%m-%d"),
            "Status": "Open",
            "SalesRepEmployeeID": int(customer["SalesRepEmployeeID"]),
            "CostCenterID": sales_center_id,
            "OrderTotal": order_total,
            "Notes": None,
        })

    append_rows(context, "SalesOrder", order_rows)
    append_rows(context, "SalesOrderLine", line_rows)


def generate_month_shipments(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    orders = context.tables["SalesOrder"]
    order_lines = context.tables["SalesOrderLine"]
    warehouses = context.tables["Warehouse"]
    items = context.tables["Item"].set_index("ItemID").to_dict("index")
    if orders.empty or order_lines.empty:
        return
    if warehouses.empty:
        raise ValueError("Generate warehouses before shipments.")

    existing_shipped_order_ids = set(context.tables["Shipment"]["SalesOrderID"].dropna().astype(int).tolist())
    month_orders = orders[
        pd.to_datetime(orders["OrderDate"]).dt.year.eq(year)
        & pd.to_datetime(orders["OrderDate"]).dt.month.eq(month)
        & ~orders["SalesOrderID"].astype(int).isin(existing_shipped_order_ids)
    ].copy()
    if month_orders.empty:
        return

    warehouse_ids = warehouses["WarehouseID"].astype(int).tolist()
    shipment_rows: list[dict] = []
    shipment_line_rows: list[dict] = []
    status_updates: dict[int, str] = {}

    for order in month_orders.itertuples(index=False):
        if rng.random() > 0.92:
            continue

        related_lines = order_lines[order_lines["SalesOrderID"].astype(int).eq(int(order.SalesOrderID))]
        if related_lines.empty:
            continue

        shipment_id = next_id(context, "Shipment")
        order_date = pd.Timestamp(order.OrderDate)
        shipment_date = order_date + pd.Timedelta(days=int(rng.integers(1, 11)))
        delivery_date = shipment_date + pd.Timedelta(days=int(rng.integers(1, 6)))
        is_partial = rng.random() <= 0.22
        shipped_quantity_total = 0.0
        ordered_quantity_total = float(related_lines["Quantity"].sum())
        line_number = 1

        for line in related_lines.itertuples(index=False):
            if is_partial and rng.random() <= 0.20:
                continue

            ordered_quantity = float(line.Quantity)
            shipped_quantity = ordered_quantity
            if is_partial and rng.random() <= 0.55:
                shipped_quantity = max(1.0, float(int(ordered_quantity * rng.uniform(0.45, 0.85))))
                shipped_quantity = min(shipped_quantity, ordered_quantity)
            shipped_quantity = qty(shipped_quantity)
            if shipped_quantity <= 0:
                continue

            item = items[int(line.ItemID)]
            shipment_line_rows.append({
                "ShipmentLineID": next_id(context, "ShipmentLine"),
                "ShipmentID": shipment_id,
                "SalesOrderLineID": int(line.SalesOrderLineID),
                "LineNumber": line_number,
                "ItemID": int(line.ItemID),
                "QuantityShipped": shipped_quantity,
                "ExtendedStandardCost": money(shipped_quantity * float(item["StandardCost"])),
            })
            shipped_quantity_total += shipped_quantity
            line_number += 1

        if line_number == 1:
            context.counters["Shipment"] -= 1
            continue

        shipment_rows.append({
            "ShipmentID": shipment_id,
            "ShipmentNumber": format_doc_number("SH", year, shipment_id),
            "SalesOrderID": int(order.SalesOrderID),
            "ShipmentDate": shipment_date.strftime("%Y-%m-%d"),
            "WarehouseID": int(rng.choice(warehouse_ids)),
            "ShippedBy": str(rng.choice(CARRIERS)),
            "TrackingNumber": f"TRK{year}{shipment_id:08d}" if rng.random() > 0.04 else None,
            "Status": "Delivered" if rng.random() > 0.08 else "In Transit",
            "DeliveryDate": delivery_date.strftime("%Y-%m-%d"),
        })
        status_updates[int(order.SalesOrderID)] = (
            "Shipped"
            if round(shipped_quantity_total, 2) >= round(ordered_quantity_total, 2)
            else "Partially Shipped"
        )

    append_rows(context, "Shipment", shipment_rows)
    append_rows(context, "ShipmentLine", shipment_line_rows)

    if status_updates:
        for sales_order_id, status in status_updates.items():
            mask = context.tables["SalesOrder"]["SalesOrderID"].astype(int).eq(sales_order_id)
            context.tables["SalesOrder"].loc[mask, "Status"] = status


def generate_month_sales_invoices(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    shipments = context.tables["Shipment"]
    shipment_lines = context.tables["ShipmentLine"]
    if shipments.empty or shipment_lines.empty:
        return

    existing_invoice_order_ids = set(context.tables["SalesInvoice"]["SalesOrderID"].dropna().astype(int).tolist())
    month_shipments = shipments[
        pd.to_datetime(shipments["ShipmentDate"]).dt.year.eq(year)
        & pd.to_datetime(shipments["ShipmentDate"]).dt.month.eq(month)
        & ~shipments["SalesOrderID"].astype(int).isin(existing_invoice_order_ids)
    ].copy()
    if month_shipments.empty:
        return

    sales_orders = context.tables["SalesOrder"].set_index("SalesOrderID").to_dict("index")
    sales_order_lines = context.tables["SalesOrderLine"].set_index("SalesOrderLineID").to_dict("index")
    customers = context.tables["Customer"].set_index("CustomerID").to_dict("index")
    invoice_rows: list[dict] = []
    invoice_line_rows: list[dict] = []
    status_updates: list[int] = []

    for shipment in month_shipments.itertuples(index=False):
        related_lines = shipment_lines[shipment_lines["ShipmentID"].astype(int).eq(int(shipment.ShipmentID))]
        if related_lines.empty:
            continue

        sales_order = sales_orders[int(shipment.SalesOrderID)]
        customer = customers[int(sales_order["CustomerID"])]
        invoice_id = next_id(context, "SalesInvoice")
        shipment_date = pd.Timestamp(shipment.ShipmentDate)
        invoice_date = shipment_date + pd.Timedelta(days=int(rng.integers(0, 4)))
        due_date = invoice_date + pd.Timedelta(days=payment_term_days(str(customer["PaymentTerms"])))
        subtotal = 0.0
        line_number = 1

        for shipment_line in related_lines.itertuples(index=False):
            sales_line = sales_order_lines[int(shipment_line.SalesOrderLineID)]
            line_total = money(
                float(shipment_line.QuantityShipped)
                * float(sales_line["UnitPrice"])
                * (1 - float(sales_line["Discount"]))
            )
            subtotal = money(subtotal + line_total)
            invoice_line_rows.append({
                "SalesInvoiceLineID": next_id(context, "SalesInvoiceLine"),
                "SalesInvoiceID": invoice_id,
                "SalesOrderLineID": int(shipment_line.SalesOrderLineID),
                "LineNumber": line_number,
                "ItemID": int(shipment_line.ItemID),
                "Quantity": float(shipment_line.QuantityShipped),
                "UnitPrice": float(sales_line["UnitPrice"]),
                "Discount": float(sales_line["Discount"]),
                "LineTotal": line_total,
            })
            line_number += 1

        tax_amount = money(subtotal * context.settings.tax_rate)
        invoice_rows.append({
            "SalesInvoiceID": invoice_id,
            "InvoiceNumber": format_doc_number("SI", year, invoice_id),
            "InvoiceDate": invoice_date.strftime("%Y-%m-%d"),
            "DueDate": due_date.strftime("%Y-%m-%d"),
            "SalesOrderID": int(shipment.SalesOrderID),
            "CustomerID": int(sales_order["CustomerID"]),
            "SubTotal": subtotal,
            "TaxAmount": tax_amount,
            "GrandTotal": money(subtotal + tax_amount),
            "Status": "Submitted",
            "PaymentDate": None,
        })
        status_updates.append(int(shipment.SalesOrderID))

    append_rows(context, "SalesInvoice", invoice_rows)
    append_rows(context, "SalesInvoiceLine", invoice_line_rows)

    for sales_order_id in status_updates:
        mask = context.tables["SalesOrder"]["SalesOrderID"].astype(int).eq(sales_order_id)
        context.tables["SalesOrder"].loc[mask, "Status"] = "Invoiced"


def generate_month_cash_receipts(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    invoices = context.tables["SalesInvoice"]
    if invoices.empty:
        return

    existing_receipt_invoice_ids = set(context.tables["CashReceipt"]["SalesInvoiceID"].dropna().astype(int).tolist())
    candidates = invoices[
        pd.to_datetime(invoices["InvoiceDate"]).dt.year.eq(year)
        & pd.to_datetime(invoices["InvoiceDate"]).dt.month.eq(month)
        & ~invoices["SalesInvoiceID"].astype(int).isin(existing_receipt_invoice_ids)
    ].copy()
    if candidates.empty:
        return

    customers = context.tables["Customer"].set_index("CustomerID").to_dict("index")
    recorders = employee_ids_for_cost_center(context, "Customer Service")
    receipt_rows: list[dict] = []
    invoice_status_updates: dict[int, tuple[str, str | None]] = {}

    for invoice in candidates.itertuples(index=False):
        if rng.random() > 0.76:
            continue

        customer = customers[int(invoice.CustomerID)]
        invoice_date = pd.Timestamp(invoice.InvoiceDate)
        due_date = pd.Timestamp(invoice.DueDate)
        behavior_days = int(rng.choice([-5, -2, 0, 3, 7, 15], p=[0.08, 0.12, 0.45, 0.18, 0.12, 0.05]))
        payment_date = due_date + pd.Timedelta(days=behavior_days)
        split_payment = rng.random() <= 0.12
        grand_total = float(invoice.GrandTotal)
        amounts = [grand_total]
        if split_payment:
            first_amount = money(grand_total * rng.uniform(0.35, 0.65))
            amounts = [first_amount, money(grand_total - first_amount)]

        for amount_index, amount in enumerate(amounts, start=1):
            receipt_id = next_id(context, "CashReceipt")
            receipt_date = payment_date + pd.Timedelta(days=amount_index - 1)
            receipt_rows.append({
                "CashReceiptID": receipt_id,
                "ReceiptNumber": format_doc_number("CR", year, receipt_id),
                "ReceiptDate": receipt_date.strftime("%Y-%m-%d"),
                "CustomerID": int(invoice.CustomerID),
                "SalesInvoiceID": int(invoice.SalesInvoiceID),
                "Amount": money(amount),
                "PaymentMethod": str(rng.choice(PAYMENT_METHODS)),
                "ReferenceNumber": f"AR{receipt_id:08d}",
                "DepositDate": (receipt_date + pd.Timedelta(days=int(rng.integers(0, 3)))).strftime("%Y-%m-%d"),
                "RecordedByEmployeeID": int(rng.choice(recorders)),
            })

        invoice_status_updates[int(invoice.SalesInvoiceID)] = ("Paid", payment_date.strftime("%Y-%m-%d"))

    append_rows(context, "CashReceipt", receipt_rows)

    for invoice_id, (status, payment_date) in invoice_status_updates.items():
        mask = context.tables["SalesInvoice"]["SalesInvoiceID"].astype(int).eq(invoice_id)
        context.tables["SalesInvoice"].loc[mask, "Status"] = status
        context.tables["SalesInvoice"].loc[mask, "PaymentDate"] = payment_date


def generate_month_o2c(context: GenerationContext, year: int, month: int) -> None:
    generate_month_sales_orders(context, year, month)
