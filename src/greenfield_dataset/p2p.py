from __future__ import annotations

import pandas as pd

from greenfield_dataset.schema import TABLE_COLUMNS
from greenfield_dataset.settings import GenerationContext
from greenfield_dataset.utils import format_doc_number, money, next_id, qty, random_date_in_month


ITEM_GROUP_REQUISITION_WEIGHTS = {
    "Furniture": 0.27,
    "Lighting": 0.15,
    "Textiles": 0.17,
    "Accessories": 0.18,
    "Packaging": 0.13,
    "Raw Materials": 0.10,
}

DISBURSEMENT_METHODS = ["ACH", "Check", "Wire Transfer"]


def append_rows(context: GenerationContext, table_name: str, rows: list[dict]) -> None:
    if not rows:
        return

    new_rows = pd.DataFrame(rows, columns=TABLE_COLUMNS[table_name])
    context.tables[table_name] = pd.concat(
        [context.tables[table_name], new_rows],
        ignore_index=True,
    )


def cost_center_id(context: GenerationContext, cost_center_name: str) -> int:
    cost_centers = context.tables["CostCenter"]
    matches = cost_centers.loc[cost_centers["CostCenterName"].eq(cost_center_name), "CostCenterID"]
    if matches.empty:
        raise ValueError(f"{cost_center_name} cost center is required for P2P generation.")
    return int(matches.iloc[0])


def employee_ids_for_cost_center(context: GenerationContext, cost_center_id_value: int) -> list[int]:
    employees = context.tables["Employee"]
    ids = employees.loc[employees["CostCenterID"].eq(cost_center_id_value), "EmployeeID"].astype(int).tolist()
    if not ids:
        ids = employees["EmployeeID"].astype(int).tolist()
    return ids


def approver_id(context: GenerationContext, minimum_amount: float = 0.0) -> int:
    employees = context.tables["Employee"].copy()
    eligible = employees[
        employees["AuthorizationLevel"].isin(["Manager", "Executive"])
        & (employees["MaxApprovalAmount"].astype(float) >= minimum_amount)
    ]
    if eligible.empty:
        eligible = employees[employees["AuthorizationLevel"].isin(["Manager", "Executive"])]
    if eligible.empty:
        eligible = employees
    return int(eligible.iloc[0]["EmployeeID"])


def payment_term_days(payment_terms: str) -> int:
    try:
        return int(str(payment_terms).split()[-1])
    except (ValueError, IndexError):
        return 30


def active_purchasable_items(context: GenerationContext) -> pd.DataFrame:
    items = context.tables["Item"]
    purchasable = items[
        items["IsActive"].eq(1)
        & items["InventoryAccountID"].notna()
        & items["StandardCost"].notna()
    ].copy()
    if purchasable.empty:
        raise ValueError("Generate active purchasable items before P2P transactions.")
    return purchasable


def select_requisition_item(context: GenerationContext, items: pd.DataFrame) -> pd.Series:
    weights = items["ItemGroup"].map(ITEM_GROUP_REQUISITION_WEIGHTS).fillna(0.01).astype(float)
    weights = weights / weights.sum()
    selected_index = context.rng.choice(items.index.to_numpy(), p=weights.to_numpy())
    return items.loc[selected_index]


def select_supplier(context: GenerationContext, item_group: str) -> pd.Series:
    suppliers = context.tables["Supplier"]
    approved = suppliers[suppliers["IsApproved"].eq(1)].copy()
    if approved.empty:
        raise ValueError("Generate approved suppliers before P2P transactions.")

    specialized = approved[approved["SupplierCategory"].eq(item_group)]
    candidates = specialized if not specialized.empty else approved
    selected_index = context.rng.choice(candidates.index.to_numpy())
    return candidates.loc[selected_index]


def generate_month_requisitions(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    items = active_purchasable_items(context)
    warehouse_id = cost_center_id(context, "Warehouse")
    purchasing_id = cost_center_id(context, "Purchasing")
    administration_id = cost_center_id(context, "Administration")
    cost_center_choices = [warehouse_id, purchasing_id, administration_id]
    cost_center_weights = [0.55, 0.30, 0.15]
    requisition_count = int(rng.integers(58, 82))

    rows: list[dict] = []
    for _ in range(requisition_count):
        item = select_requisition_item(context, items)
        cost_center = int(rng.choice(cost_center_choices, p=cost_center_weights))
        requestors = employee_ids_for_cost_center(context, cost_center)
        request_date = random_date_in_month(rng, year, month)
        quantity_range = (12, 75) if item["ItemGroup"] in ["Packaging", "Raw Materials"] else (3, 28)
        quantity = qty(int(rng.integers(*quantity_range)))
        estimated_unit_cost = money(float(item["StandardCost"]) * rng.uniform(0.96, 1.06))
        estimated_total = quantity * estimated_unit_cost
        approved = rng.random() <= 0.94
        requisition_id = next_id(context, "PurchaseRequisition")

        rows.append({
            "RequisitionID": requisition_id,
            "RequisitionNumber": format_doc_number("PR", year, requisition_id),
            "RequestDate": request_date.strftime("%Y-%m-%d"),
            "RequestedByEmployeeID": int(rng.choice(requestors)),
            "CostCenterID": cost_center,
            "ItemID": int(item["ItemID"]),
            "Quantity": quantity,
            "EstimatedUnitCost": estimated_unit_cost,
            "Justification": f"Monthly replenishment for {item['ItemGroup']}",
            "ApprovedByEmployeeID": approver_id(context, estimated_total) if approved else None,
            "ApprovedDate": (request_date + pd.Timedelta(days=int(rng.integers(0, 3)))).strftime("%Y-%m-%d")
            if approved
            else None,
            "Status": "Approved" if approved else "Pending",
        })

    append_rows(context, "PurchaseRequisition", rows)


def generate_month_purchase_orders(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    requisitions = context.tables["PurchaseRequisition"]
    existing_po_requisition_ids = set(context.tables["PurchaseOrder"]["RequisitionID"].dropna().astype(int).tolist())
    candidates = requisitions[
        requisitions["Status"].eq("Approved")
        & ~requisitions["RequisitionID"].astype(int).isin(existing_po_requisition_ids)
    ].copy()
    if candidates.empty:
        return

    item_map = context.tables["Item"].set_index("ItemID").to_dict("index")
    purchasing_id = cost_center_id(context, "Purchasing")
    purchasing_agents = employee_ids_for_cost_center(context, purchasing_id)
    po_rows: list[dict] = []
    po_line_rows: list[dict] = []
    converted_requisition_ids: list[int] = []

    for requisition in candidates.itertuples(index=False):
        if rng.random() > 0.90:
            continue

        item = item_map[int(requisition.ItemID)]
        supplier = select_supplier(context, str(item["ItemGroup"]))
        request_date = pd.Timestamp(requisition.RequestDate)
        order_date = request_date + pd.Timedelta(days=int(rng.integers(1, 6)))
        expected_delivery_date = order_date + pd.Timedelta(days=int(rng.integers(5, 22)))
        purchase_order_id = next_id(context, "PurchaseOrder")
        unit_cost = money(float(requisition.EstimatedUnitCost) * rng.uniform(0.97, 1.04))
        line_total = money(float(requisition.Quantity) * unit_cost)

        po_rows.append({
            "PurchaseOrderID": purchase_order_id,
            "PONumber": format_doc_number("PO", year, purchase_order_id),
            "OrderDate": order_date.strftime("%Y-%m-%d"),
            "SupplierID": int(supplier["SupplierID"]),
            "RequisitionID": int(requisition.RequisitionID),
            "ExpectedDeliveryDate": expected_delivery_date.strftime("%Y-%m-%d"),
            "Status": "Open",
            "CreatedByEmployeeID": int(rng.choice(purchasing_agents)),
            "ApprovedByEmployeeID": approver_id(context, line_total),
            "OrderTotal": line_total,
        })

        po_line_rows.append({
            "POLineID": next_id(context, "PurchaseOrderLine"),
            "PurchaseOrderID": purchase_order_id,
            "LineNumber": 1,
            "ItemID": int(requisition.ItemID),
            "Quantity": float(requisition.Quantity),
            "UnitCost": unit_cost,
            "LineTotal": line_total,
        })
        converted_requisition_ids.append(int(requisition.RequisitionID))

    append_rows(context, "PurchaseOrder", po_rows)
    append_rows(context, "PurchaseOrderLine", po_line_rows)

    if converted_requisition_ids:
        mask = context.tables["PurchaseRequisition"]["RequisitionID"].astype(int).isin(converted_requisition_ids)
        context.tables["PurchaseRequisition"].loc[mask, "Status"] = "Converted to PO"


def generate_month_goods_receipts(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    purchase_orders = context.tables["PurchaseOrder"]
    purchase_order_lines = context.tables["PurchaseOrderLine"]
    warehouses = context.tables["Warehouse"]
    items = context.tables["Item"].set_index("ItemID").to_dict("index")
    if purchase_orders.empty or purchase_order_lines.empty:
        return
    if warehouses.empty:
        raise ValueError("Generate warehouses before goods receipts.")

    existing_receipt_po_ids = set(context.tables["GoodsReceipt"]["PurchaseOrderID"].dropna().astype(int).tolist())
    candidates = purchase_orders[
        pd.to_datetime(purchase_orders["OrderDate"]).dt.year.eq(year)
        & pd.to_datetime(purchase_orders["OrderDate"]).dt.month.eq(month)
        & ~purchase_orders["PurchaseOrderID"].astype(int).isin(existing_receipt_po_ids)
    ].copy()
    if candidates.empty:
        return

    warehouse_ids = warehouses["WarehouseID"].astype(int).tolist()
    warehouse_center = cost_center_id(context, "Warehouse")
    receivers = employee_ids_for_cost_center(context, warehouse_center)
    receipt_rows: list[dict] = []
    receipt_line_rows: list[dict] = []
    status_updates: dict[int, str] = {}

    for purchase_order in candidates.itertuples(index=False):
        if rng.random() > 0.88:
            continue

        related_lines = purchase_order_lines[
            purchase_order_lines["PurchaseOrderID"].astype(int).eq(int(purchase_order.PurchaseOrderID))
        ]
        if related_lines.empty:
            continue

        goods_receipt_id = next_id(context, "GoodsReceipt")
        order_date = pd.Timestamp(purchase_order.OrderDate)
        receipt_date = order_date + pd.Timedelta(days=int(rng.integers(5, 24)))
        is_partial = rng.random() <= 0.18
        ordered_quantity_total = float(related_lines["Quantity"].sum())
        received_quantity_total = 0.0
        line_number = 1

        for line in related_lines.itertuples(index=False):
            ordered_quantity = float(line.Quantity)
            received_quantity = ordered_quantity
            if is_partial:
                received_quantity = max(1.0, float(int(ordered_quantity * rng.uniform(0.50, 0.90))))
                received_quantity = min(received_quantity, ordered_quantity)
            received_quantity = qty(received_quantity)
            if received_quantity <= 0:
                continue

            item = items[int(line.ItemID)]
            receipt_line_rows.append({
                "GoodsReceiptLineID": next_id(context, "GoodsReceiptLine"),
                "GoodsReceiptID": goods_receipt_id,
                "POLineID": int(line.POLineID),
                "LineNumber": line_number,
                "ItemID": int(line.ItemID),
                "QuantityReceived": received_quantity,
                "ExtendedStandardCost": money(received_quantity * float(item["StandardCost"])),
            })
            received_quantity_total += received_quantity
            line_number += 1

        if line_number == 1:
            context.counters["GoodsReceipt"] -= 1
            continue

        receipt_rows.append({
            "GoodsReceiptID": goods_receipt_id,
            "ReceiptNumber": format_doc_number("GR", year, goods_receipt_id),
            "ReceiptDate": receipt_date.strftime("%Y-%m-%d"),
            "PurchaseOrderID": int(purchase_order.PurchaseOrderID),
            "WarehouseID": int(rng.choice(warehouse_ids)),
            "ReceivedByEmployeeID": int(rng.choice(receivers)),
            "Status": "Partially Received"
            if round(received_quantity_total, 2) < round(ordered_quantity_total, 2)
            else "Received",
        })
        status_updates[int(purchase_order.PurchaseOrderID)] = (
            "Partially Received"
            if round(received_quantity_total, 2) < round(ordered_quantity_total, 2)
            else "Received"
        )

    append_rows(context, "GoodsReceipt", receipt_rows)
    append_rows(context, "GoodsReceiptLine", receipt_line_rows)

    if status_updates:
        for purchase_order_id, status in status_updates.items():
            mask = context.tables["PurchaseOrder"]["PurchaseOrderID"].astype(int).eq(purchase_order_id)
            context.tables["PurchaseOrder"].loc[mask, "Status"] = status


def generate_month_purchase_invoices(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    goods_receipts = context.tables["GoodsReceipt"]
    goods_receipt_lines = context.tables["GoodsReceiptLine"]
    if goods_receipts.empty or goods_receipt_lines.empty:
        return

    existing_invoice_po_ids = set(context.tables["PurchaseInvoice"]["PurchaseOrderID"].dropna().astype(int).tolist())
    candidates = goods_receipts[
        pd.to_datetime(goods_receipts["ReceiptDate"]).dt.year.eq(year)
        & pd.to_datetime(goods_receipts["ReceiptDate"]).dt.month.eq(month)
        & ~goods_receipts["PurchaseOrderID"].astype(int).isin(existing_invoice_po_ids)
    ].copy()
    if candidates.empty:
        return

    purchase_orders = context.tables["PurchaseOrder"].set_index("PurchaseOrderID").to_dict("index")
    purchase_order_lines = context.tables["PurchaseOrderLine"].set_index("POLineID").to_dict("index")
    suppliers = context.tables["Supplier"].set_index("SupplierID").to_dict("index")
    invoice_rows: list[dict] = []
    invoice_line_rows: list[dict] = []

    for receipt in candidates.itertuples(index=False):
        if rng.random() > 0.90:
            continue

        related_lines = goods_receipt_lines[
            goods_receipt_lines["GoodsReceiptID"].astype(int).eq(int(receipt.GoodsReceiptID))
        ]
        if related_lines.empty:
            continue

        purchase_order = purchase_orders[int(receipt.PurchaseOrderID)]
        supplier = suppliers[int(purchase_order["SupplierID"])]
        purchase_invoice_id = next_id(context, "PurchaseInvoice")
        receipt_date = pd.Timestamp(receipt.ReceiptDate)
        invoice_date = receipt_date + pd.Timedelta(days=int(rng.integers(0, 5)))
        received_date = invoice_date + pd.Timedelta(days=int(rng.integers(0, 3)))
        due_date = invoice_date + pd.Timedelta(days=payment_term_days(str(supplier["PaymentTerms"])))
        subtotal = 0.0
        line_number = 1

        for receipt_line in related_lines.itertuples(index=False):
            po_line = purchase_order_lines[int(receipt_line.POLineID)]
            unit_cost = money(float(po_line["UnitCost"]) * rng.uniform(0.985, 1.025))
            line_total = money(float(receipt_line.QuantityReceived) * unit_cost)
            subtotal = money(subtotal + line_total)
            invoice_line_rows.append({
                "PILineID": next_id(context, "PurchaseInvoiceLine"),
                "PurchaseInvoiceID": purchase_invoice_id,
                "POLineID": int(receipt_line.POLineID),
                "LineNumber": line_number,
                "ItemID": int(receipt_line.ItemID),
                "Quantity": float(receipt_line.QuantityReceived),
                "UnitCost": unit_cost,
                "LineTotal": line_total,
            })
            line_number += 1

        tax_amount = money(subtotal * 0.015) if rng.random() <= 0.20 else 0.0
        grand_total = money(subtotal + tax_amount)
        invoice_rows.append({
            "PurchaseInvoiceID": purchase_invoice_id,
            "InvoiceNumber": f"V{int(purchase_order['SupplierID']):04d}-{year}-{purchase_invoice_id:06d}",
            "InvoiceDate": invoice_date.strftime("%Y-%m-%d"),
            "ReceivedDate": received_date.strftime("%Y-%m-%d"),
            "DueDate": due_date.strftime("%Y-%m-%d"),
            "PurchaseOrderID": int(receipt.PurchaseOrderID),
            "SupplierID": int(purchase_order["SupplierID"]),
            "SubTotal": subtotal,
            "TaxAmount": tax_amount,
            "GrandTotal": grand_total,
            "Status": "Approved",
            "ApprovedByEmployeeID": approver_id(context, grand_total),
            "ApprovedDate": received_date.strftime("%Y-%m-%d"),
        })

    append_rows(context, "PurchaseInvoice", invoice_rows)
    append_rows(context, "PurchaseInvoiceLine", invoice_line_rows)


def generate_month_disbursements(context: GenerationContext, year: int, month: int) -> None:
    rng = context.rng
    invoices = context.tables["PurchaseInvoice"]
    if invoices.empty:
        return

    existing_payment_invoice_ids = set(
        context.tables["DisbursementPayment"]["PurchaseInvoiceID"].dropna().astype(int).tolist()
    )
    candidates = invoices[
        pd.to_datetime(invoices["InvoiceDate"]).dt.year.eq(year)
        & pd.to_datetime(invoices["InvoiceDate"]).dt.month.eq(month)
        & ~invoices["PurchaseInvoiceID"].astype(int).isin(existing_payment_invoice_ids)
    ].copy()
    if candidates.empty:
        return

    payment_rows: list[dict] = []
    invoice_status_updates: dict[int, str] = {}
    for invoice in candidates.itertuples(index=False):
        if rng.random() > 0.72:
            continue

        due_date = pd.Timestamp(invoice.DueDate)
        payment_date = due_date + pd.Timedelta(days=int(rng.choice([-4, -2, 0, 2, 6], p=[0.10, 0.15, 0.50, 0.18, 0.07])))
        split_payment = rng.random() <= 0.08
        grand_total = float(invoice.GrandTotal)
        amounts = [grand_total]
        if split_payment:
            first_amount = money(grand_total * rng.uniform(0.45, 0.70))
            amounts = [first_amount, money(grand_total - first_amount)]

        for amount_index, amount in enumerate(amounts, start=1):
            disbursement_id = next_id(context, "DisbursementPayment")
            issued_date = payment_date + pd.Timedelta(days=amount_index - 1)
            method = str(rng.choice(DISBURSEMENT_METHODS, p=[0.60, 0.30, 0.10]))
            payment_rows.append({
                "DisbursementID": disbursement_id,
                "PaymentNumber": format_doc_number("DP", year, disbursement_id),
                "PaymentDate": issued_date.strftime("%Y-%m-%d"),
                "SupplierID": int(invoice.SupplierID),
                "PurchaseInvoiceID": int(invoice.PurchaseInvoiceID),
                "Amount": money(amount),
                "PaymentMethod": method,
                "CheckNumber": f"CHK{disbursement_id:07d}" if method == "Check" else None,
                "ApprovedByEmployeeID": approver_id(context, amount),
                "ClearedDate": (issued_date + pd.Timedelta(days=int(rng.integers(1, 5)))).strftime("%Y-%m-%d"),
            })

        invoice_status_updates[int(invoice.PurchaseInvoiceID)] = "Paid"

    append_rows(context, "DisbursementPayment", payment_rows)

    for invoice_id, status in invoice_status_updates.items():
        mask = context.tables["PurchaseInvoice"]["PurchaseInvoiceID"].astype(int).eq(invoice_id)
        context.tables["PurchaseInvoice"].loc[mask, "Status"] = status


def generate_month_p2p(context: GenerationContext, year: int, month: int) -> None:
    generate_month_requisitions(context, year, month)
    generate_month_purchase_orders(context, year, month)
