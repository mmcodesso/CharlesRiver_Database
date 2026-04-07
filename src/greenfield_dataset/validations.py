from __future__ import annotations

from typing import Any

from greenfield_dataset.schema import TABLE_COLUMNS
from greenfield_dataset.settings import GenerationContext


def account_id_by_number(context: GenerationContext, account_number: str) -> int:
    accounts = context.tables["Account"]
    matches = accounts.loc[accounts["AccountNumber"].astype(str).eq(account_number), "AccountID"]
    if matches.empty:
        raise ValueError(f"Account number {account_number} is not loaded.")
    return int(matches.iloc[0])


def validate_phase1(context: GenerationContext) -> dict[str, Any]:
    results: dict[str, Any] = {
        "row_counts": {table: int(len(df)) for table, df in context.tables.items()},
        "exceptions": [],
    }

    for table_name, expected_columns in TABLE_COLUMNS.items():
        actual_columns = context.tables[table_name].columns.tolist()
        if actual_columns != expected_columns:
            results["exceptions"].append(f"{table_name} columns do not match schema.")

    if context.tables["Account"]["AccountNumber"].duplicated().any():
        results["exceptions"].append("Duplicate account numbers found.")

    if context.tables["CostCenter"]["ManagerID"].isna().any():
        results["exceptions"].append("One or more cost centers are missing managers.")

    context.validation_results["phase1"] = results
    return results


def validate_phase2(context: GenerationContext) -> dict[str, Any]:
    results = validate_phase1(context)
    exceptions = list(results["exceptions"])

    expected_counts = {
        "Item": context.settings.item_count,
        "Customer": context.settings.customer_count,
        "Supplier": context.settings.supplier_count,
    }
    for table_name, expected_count in expected_counts.items():
        actual_count = len(context.tables[table_name])
        if actual_count != expected_count:
            exceptions.append(f"{table_name} row count {actual_count} does not match expected {expected_count}.")

    if context.tables["Item"]["ItemCode"].duplicated().any():
        exceptions.append("Duplicate item codes found.")
    if context.tables["Customer"]["CustomerID"].duplicated().any():
        exceptions.append("Duplicate customer IDs found.")
    if context.tables["Supplier"]["SupplierID"].duplicated().any():
        exceptions.append("Duplicate supplier IDs found.")

    gl = context.tables["GLEntry"]
    if gl.empty:
        exceptions.append("Opening balance GL entries were not generated.")
    else:
        difference = round(float(gl["Debit"].sum()) - float(gl["Credit"].sum()), 2)
        if difference != 0:
            exceptions.append(f"Opening balance GL is not balanced: {difference}.")

    budget_count = len(context.tables["Budget"])
    if not 2000 <= budget_count <= 4500:
        exceptions.append(f"Budget row count {budget_count} is outside the 2,000 to 4,500 target.")

    phase2_results: dict[str, Any] = {
        "row_counts": {table: int(len(df)) for table, df in context.tables.items()},
        "exceptions": exceptions,
    }
    context.validation_results["phase2"] = phase2_results
    return phase2_results


def validate_phase3(context: GenerationContext) -> dict[str, Any]:
    results = validate_phase2(context)
    exceptions = list(results["exceptions"])

    required_non_empty = [
        "SalesOrder",
        "SalesOrderLine",
        "PurchaseRequisition",
        "PurchaseOrder",
        "PurchaseOrderLine",
    ]
    for table_name in required_non_empty:
        if context.tables[table_name].empty:
            exceptions.append(f"{table_name} was not generated.")

    sales_orders = context.tables["SalesOrder"]
    sales_order_lines = context.tables["SalesOrderLine"]
    if not sales_orders.empty and not sales_order_lines.empty:
        line_totals = sales_order_lines.groupby("SalesOrderID")["LineTotal"].sum().round(2)
        header_totals = sales_orders.set_index("SalesOrderID")["OrderTotal"].astype(float).round(2)
        mismatched_ids = [
            int(order_id)
            for order_id, total in header_totals.items()
            if round(float(line_totals.get(order_id, -1)), 2) != round(float(total), 2)
        ]
        if mismatched_ids:
            exceptions.append(f"Sales order header totals do not match lines: {mismatched_ids[:5]}.")

    purchase_orders = context.tables["PurchaseOrder"]
    purchase_order_lines = context.tables["PurchaseOrderLine"]
    if not purchase_orders.empty and not purchase_order_lines.empty:
        line_totals = purchase_order_lines.groupby("PurchaseOrderID")["LineTotal"].sum().round(2)
        header_totals = purchase_orders.set_index("PurchaseOrderID")["OrderTotal"].astype(float).round(2)
        mismatched_ids = [
            int(order_id)
            for order_id, total in header_totals.items()
            if round(float(line_totals.get(order_id, -1)), 2) != round(float(total), 2)
        ]
        if mismatched_ids:
            exceptions.append(f"Purchase order header totals do not match lines: {mismatched_ids[:5]}.")

    if not sales_order_lines.empty:
        valid_order_ids = set(sales_orders["SalesOrderID"].astype(int))
        line_order_ids = set(sales_order_lines["SalesOrderID"].astype(int))
        orphan_ids = sorted(line_order_ids - valid_order_ids)
        if orphan_ids:
            exceptions.append(f"Sales order lines reference missing orders: {orphan_ids[:5]}.")

    if not purchase_order_lines.empty:
        valid_po_ids = set(purchase_orders["PurchaseOrderID"].astype(int))
        line_po_ids = set(purchase_order_lines["PurchaseOrderID"].astype(int))
        orphan_ids = sorted(line_po_ids - valid_po_ids)
        if orphan_ids:
            exceptions.append(f"Purchase order lines reference missing POs: {orphan_ids[:5]}.")

    phase3_results: dict[str, Any] = {
        "row_counts": {table: int(len(df)) for table, df in context.tables.items()},
        "exceptions": exceptions,
    }
    context.validation_results["phase3"] = phase3_results
    return phase3_results


def validate_phase4(context: GenerationContext) -> dict[str, Any]:
    results = validate_phase3(context)
    exceptions = list(results["exceptions"])

    required_non_empty = [
        "Shipment",
        "ShipmentLine",
        "GoodsReceipt",
        "GoodsReceiptLine",
    ]
    for table_name in required_non_empty:
        if context.tables[table_name].empty:
            exceptions.append(f"{table_name} was not generated.")

    shipments = context.tables["Shipment"]
    shipment_lines = context.tables["ShipmentLine"]
    sales_order_lines = context.tables["SalesOrderLine"]
    if not shipment_lines.empty:
        valid_shipment_ids = set(shipments["ShipmentID"].astype(int))
        line_shipment_ids = set(shipment_lines["ShipmentID"].astype(int))
        orphan_ids = sorted(line_shipment_ids - valid_shipment_ids)
        if orphan_ids:
            exceptions.append(f"Shipment lines reference missing shipments: {orphan_ids[:5]}.")

        valid_sales_line_ids = set(sales_order_lines["SalesOrderLineID"].astype(int))
        shipped_sales_line_ids = set(shipment_lines["SalesOrderLineID"].astype(int))
        orphan_sales_line_ids = sorted(shipped_sales_line_ids - valid_sales_line_ids)
        if orphan_sales_line_ids:
            exceptions.append(f"Shipment lines reference missing sales order lines: {orphan_sales_line_ids[:5]}.")

        shipped_quantity = shipment_lines.groupby("SalesOrderLineID")["QuantityShipped"].sum()
        ordered_quantity = sales_order_lines.set_index("SalesOrderLineID")["Quantity"].astype(float)
        over_shipped = [
            int(line_id)
            for line_id, shipped in shipped_quantity.items()
            if round(float(shipped), 2) > round(float(ordered_quantity.get(line_id, 0.0)), 2)
        ]
        if over_shipped:
            exceptions.append(f"Shipment lines exceed ordered quantity: {over_shipped[:5]}.")

    goods_receipts = context.tables["GoodsReceipt"]
    goods_receipt_lines = context.tables["GoodsReceiptLine"]
    purchase_order_lines = context.tables["PurchaseOrderLine"]
    if not goods_receipt_lines.empty:
        valid_receipt_ids = set(goods_receipts["GoodsReceiptID"].astype(int))
        line_receipt_ids = set(goods_receipt_lines["GoodsReceiptID"].astype(int))
        orphan_ids = sorted(line_receipt_ids - valid_receipt_ids)
        if orphan_ids:
            exceptions.append(f"Goods receipt lines reference missing goods receipts: {orphan_ids[:5]}.")

        valid_po_line_ids = set(purchase_order_lines["POLineID"].astype(int))
        received_po_line_ids = set(goods_receipt_lines["POLineID"].astype(int))
        orphan_po_line_ids = sorted(received_po_line_ids - valid_po_line_ids)
        if orphan_po_line_ids:
            exceptions.append(f"Goods receipt lines reference missing PO lines: {orphan_po_line_ids[:5]}.")

        received_quantity = goods_receipt_lines.groupby("POLineID")["QuantityReceived"].sum()
        ordered_quantity = purchase_order_lines.set_index("POLineID")["Quantity"].astype(float)
        over_received = [
            int(line_id)
            for line_id, received in received_quantity.items()
            if round(float(received), 2) > round(float(ordered_quantity.get(line_id, 0.0)), 2)
        ]
        if over_received:
            exceptions.append(f"Goods receipt lines exceed PO quantity: {over_received[:5]}.")

    phase4_results: dict[str, Any] = {
        "row_counts": {table: int(len(df)) for table, df in context.tables.items()},
        "exceptions": exceptions,
    }
    context.validation_results["phase4"] = phase4_results
    return phase4_results


def validate_phase5(context: GenerationContext) -> dict[str, Any]:
    results = validate_phase4(context)
    exceptions = list(results["exceptions"])

    required_non_empty = [
        "SalesInvoice",
        "SalesInvoiceLine",
        "CashReceipt",
        "PurchaseInvoice",
        "PurchaseInvoiceLine",
        "DisbursementPayment",
    ]
    for table_name in required_non_empty:
        if context.tables[table_name].empty:
            exceptions.append(f"{table_name} was not generated.")

    sales_invoices = context.tables["SalesInvoice"]
    sales_invoice_lines = context.tables["SalesInvoiceLine"]
    if not sales_invoice_lines.empty:
        valid_invoice_ids = set(sales_invoices["SalesInvoiceID"].astype(int))
        line_invoice_ids = set(sales_invoice_lines["SalesInvoiceID"].astype(int))
        orphan_ids = sorted(line_invoice_ids - valid_invoice_ids)
        if orphan_ids:
            exceptions.append(f"Sales invoice lines reference missing invoices: {orphan_ids[:5]}.")

        line_totals = sales_invoice_lines.groupby("SalesInvoiceID")["LineTotal"].sum().round(2)
        header_totals = sales_invoices.set_index("SalesInvoiceID")["SubTotal"].astype(float).round(2)
        mismatched_ids = [
            int(invoice_id)
            for invoice_id, total in header_totals.items()
            if round(float(line_totals.get(invoice_id, -1)), 2) != round(float(total), 2)
        ]
        if mismatched_ids:
            exceptions.append(f"Sales invoice subtotals do not match lines: {mismatched_ids[:5]}.")

    cash_receipts = context.tables["CashReceipt"]
    if not cash_receipts.empty:
        valid_invoice_ids = set(sales_invoices["SalesInvoiceID"].astype(int))
        receipt_invoice_ids = set(cash_receipts["SalesInvoiceID"].dropna().astype(int))
        orphan_ids = sorted(receipt_invoice_ids - valid_invoice_ids)
        if orphan_ids:
            exceptions.append(f"Cash receipts reference missing sales invoices: {orphan_ids[:5]}.")

        receipt_totals = cash_receipts.groupby("SalesInvoiceID")["Amount"].sum().round(2)
        invoice_totals = sales_invoices.set_index("SalesInvoiceID")["GrandTotal"].astype(float).round(2)
        overpaid = [
            int(invoice_id)
            for invoice_id, amount in receipt_totals.items()
            if round(float(amount), 2) > round(float(invoice_totals.get(invoice_id, 0.0)), 2)
        ]
        if overpaid:
            exceptions.append(f"Cash receipts exceed sales invoice totals: {overpaid[:5]}.")

    purchase_invoices = context.tables["PurchaseInvoice"]
    purchase_invoice_lines = context.tables["PurchaseInvoiceLine"]
    if not purchase_invoice_lines.empty:
        valid_invoice_ids = set(purchase_invoices["PurchaseInvoiceID"].astype(int))
        line_invoice_ids = set(purchase_invoice_lines["PurchaseInvoiceID"].astype(int))
        orphan_ids = sorted(line_invoice_ids - valid_invoice_ids)
        if orphan_ids:
            exceptions.append(f"Purchase invoice lines reference missing invoices: {orphan_ids[:5]}.")

        line_totals = purchase_invoice_lines.groupby("PurchaseInvoiceID")["LineTotal"].sum().round(2)
        header_totals = purchase_invoices.set_index("PurchaseInvoiceID")["SubTotal"].astype(float).round(2)
        mismatched_ids = [
            int(invoice_id)
            for invoice_id, total in header_totals.items()
            if round(float(line_totals.get(invoice_id, -1)), 2) != round(float(total), 2)
        ]
        if mismatched_ids:
            exceptions.append(f"Purchase invoice subtotals do not match lines: {mismatched_ids[:5]}.")

    disbursements = context.tables["DisbursementPayment"]
    if not disbursements.empty:
        valid_invoice_ids = set(purchase_invoices["PurchaseInvoiceID"].astype(int))
        payment_invoice_ids = set(disbursements["PurchaseInvoiceID"].dropna().astype(int))
        orphan_ids = sorted(payment_invoice_ids - valid_invoice_ids)
        if orphan_ids:
            exceptions.append(f"Disbursements reference missing purchase invoices: {orphan_ids[:5]}.")

        payment_totals = disbursements.groupby("PurchaseInvoiceID")["Amount"].sum().round(2)
        invoice_totals = purchase_invoices.set_index("PurchaseInvoiceID")["GrandTotal"].astype(float).round(2)
        overpaid = [
            int(invoice_id)
            for invoice_id, amount in payment_totals.items()
            if round(float(amount), 2) > round(float(invoice_totals.get(invoice_id, 0.0)), 2)
        ]
        if overpaid:
            exceptions.append(f"Disbursements exceed purchase invoice totals: {overpaid[:5]}.")

    phase5_results: dict[str, Any] = {
        "row_counts": {table: int(len(df)) for table, df in context.tables.items()},
        "exceptions": exceptions,
    }
    context.validation_results["phase5"] = phase5_results
    return phase5_results


def validate_gl_balance(context: GenerationContext) -> dict[str, Any]:
    gl = context.tables["GLEntry"]
    if gl.empty:
        return {"exception_count": 1, "exceptions": [{"message": "GLEntry is empty."}]}

    grouped = gl.groupby(["VoucherType", "VoucherNumber"], dropna=False)[["Debit", "Credit"]].sum()
    grouped["Difference"] = (grouped["Debit"].astype(float) - grouped["Credit"].astype(float)).round(2)
    exceptions = grouped[grouped["Difference"].ne(0)].reset_index()
    return {
        "exception_count": int(len(exceptions)),
        "exceptions": exceptions.to_dict(orient="records"),
    }


def validate_account_rollforward(context: GenerationContext) -> dict[str, Any]:
    gl = context.tables["GLEntry"]
    operational_gl = gl[~gl["SourceDocumentType"].eq("JournalEntry")].copy()
    exceptions: list[dict[str, Any]] = []

    def gl_debit_net(account_number: str) -> float:
        account_id = account_id_by_number(context, account_number)
        account_rows = operational_gl[operational_gl["AccountID"].astype(int).eq(account_id)]
        return round(float(account_rows["Debit"].sum()) - float(account_rows["Credit"].sum()), 2)

    def gl_credit_net(account_number: str) -> float:
        account_id = account_id_by_number(context, account_number)
        account_rows = operational_gl[operational_gl["AccountID"].astype(int).eq(account_id)]
        return round(float(account_rows["Credit"].sum()) - float(account_rows["Debit"].sum()), 2)

    receipt_cost_by_po_line = context.tables["GoodsReceiptLine"].groupby("POLineID")["ExtendedStandardCost"].sum().to_dict()
    cleared_grni = round(
        sum(
            float(receipt_cost_by_po_line.get(int(line.POLineID), 0.0))
            for line in context.tables["PurchaseInvoiceLine"].itertuples(index=False)
        ),
        2,
    )
    checks = [
        {
            "name": "AR",
            "expected": round(
                float(context.tables["SalesInvoice"]["GrandTotal"].sum())
                - float(context.tables["CashReceipt"]["Amount"].sum()),
                2,
            ),
            "actual": gl_debit_net("1020"),
        },
        {
            "name": "AP",
            "expected": round(
                float(context.tables["PurchaseInvoice"]["GrandTotal"].sum())
                - float(context.tables["DisbursementPayment"]["Amount"].sum()),
                2,
            ),
            "actual": gl_credit_net("2010"),
        },
        {
            "name": "Inventory",
            "expected": round(
                float(context.tables["GoodsReceiptLine"]["ExtendedStandardCost"].sum())
                - float(context.tables["ShipmentLine"]["ExtendedStandardCost"].sum()),
                2,
            ),
            "actual": gl_debit_net("1040") + gl_debit_net("1045"),
        },
        {
            "name": "COGS",
            "expected": round(float(context.tables["ShipmentLine"]["ExtendedStandardCost"].sum()), 2),
            "actual": round(
                gl_debit_net("5010") + gl_debit_net("5020") + gl_debit_net("5030") + gl_debit_net("5040"),
                2,
            ),
        },
        {
            "name": "GRNI",
            "expected": round(
                float(context.tables["GoodsReceiptLine"]["ExtendedStandardCost"].sum()) - cleared_grni,
                2,
            ),
            "actual": gl_credit_net("2020"),
        },
    ]

    for check in checks:
        if round(float(check["expected"]) - float(check["actual"]), 2) != 0:
            exceptions.append(check)

    return {
        "exception_count": len(exceptions),
        "exceptions": exceptions,
    }


def validate_phase6(context: GenerationContext) -> dict[str, Any]:
    results = validate_phase5(context)
    exceptions = list(results["exceptions"])

    gl_balance = validate_gl_balance(context)
    if gl_balance["exception_count"]:
        exceptions.append(f"Unbalanced GL vouchers: {gl_balance['exception_count']}.")

    gl = context.tables["GLEntry"]
    trial_balance_difference = round(float(gl["Debit"].sum()) - float(gl["Credit"].sum()), 2)
    if trial_balance_difference != 0:
        exceptions.append(f"Trial balance is not balanced: {trial_balance_difference}.")

    rollforward = validate_account_rollforward(context)
    if rollforward["exception_count"]:
        exceptions.append(f"Control account roll-forward exceptions: {rollforward['exception_count']}.")

    phase6_results: dict[str, Any] = {
        "row_counts": {table: int(len(df)) for table, df in context.tables.items()},
        "exceptions": exceptions,
        "gl_balance": gl_balance,
        "trial_balance_difference": trial_balance_difference,
        "account_rollforward": rollforward,
    }
    context.validation_results["phase6"] = phase6_results
    return phase6_results


def validate_phase7(context: GenerationContext) -> dict[str, Any]:
    results = validate_phase6(context)
    exceptions = list(results["exceptions"])

    if context.settings.anomaly_mode != "none" and not context.anomaly_log:
        exceptions.append("Anomaly mode is enabled but no anomalies were logged.")

    phase7_results: dict[str, Any] = {
        "row_counts": {table: int(len(df)) for table, df in context.tables.items()},
        "exceptions": exceptions,
        "gl_balance": results["gl_balance"],
        "trial_balance_difference": results["trial_balance_difference"],
        "account_rollforward": results["account_rollforward"],
        "anomaly_count": len(context.anomaly_log),
    }
    context.validation_results["phase7"] = phase7_results
    return phase7_results
