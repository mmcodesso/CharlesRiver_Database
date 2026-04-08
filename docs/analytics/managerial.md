# Managerial Analytics Starter Guide

**Audience:** Students, instructors, and analysts using the dataset for planning, operational, and performance analysis.  
**Purpose:** Show how to work with budgets, cost centers, product mix, inventory movement, purchasing activity, and simple profitability views.  
**What you will learn:** Which tables to use, how to join them, which measures are most useful, and how to start the work in both SQL and Excel.

> **Implemented in current generator:** Budget rows, cost centers, detailed O2C and P2P volume, item master data, warehouse movement, and cost-center-tagged operational and journal activity where meaningful.

> **Planned future extension:** Stronger inventory constraints, richer O2C behavior, and manufacturing cost-accounting analytics.

## Learning Goals

- compare budgeted versus actual expense by cost center
- analyze customer and product mix
- review inbound and outbound inventory movement
- understand purchasing activity by supplier and item category
- summarize activity by cost center
- build a simple product-level profitability view

## Relevant Tables

| Topic | Main tables |
|---|---|
| Budget vs actual | `Budget`, `CostCenter`, `Account`, `GLEntry`, `JournalEntry` |
| Sales mix | `SalesInvoice`, `SalesInvoiceLine`, `Customer`, `Item` |
| Inventory movement | `GoodsReceipt`, `GoodsReceiptLine`, `Shipment`, `ShipmentLine`, `Warehouse`, `Item` |
| Purchasing behavior | `PurchaseOrder`, `PurchaseOrderLine`, `Supplier`, `Item` |
| Cost center activity | `SalesOrder`, `PurchaseRequisition`, `GLEntry`, `CostCenter` |
| Basic profitability | `SalesOrderLine`, `SalesInvoiceLine`, `ShipmentLine`, `Item` |

## Key Joins and Navigation

- `Budget.CostCenterID -> CostCenter.CostCenterID`
- `Budget.AccountID -> Account.AccountID`
- `GLEntry.CostCenterID -> CostCenter.CostCenterID`
- `SalesInvoiceLine.ItemID -> Item.ItemID`
- `GoodsReceiptLine.ItemID -> Item.ItemID`
- `PurchaseOrder.SupplierID -> Supplier.SupplierID`
- `Shipment.WarehouseID -> Warehouse.WarehouseID`

## Common Measures

| Measure | Basic definition in the current dataset |
|---|---|
| Budget variance | Actual amount minus budget amount |
| Sales mix | Revenue or quantity by customer, region, segment, item group, or item |
| Inventory movement | Received quantity and shipped quantity by warehouse and item |
| Supplier spend | Ordered quantity or ordered value by supplier and category |
| Cost center activity | Operational document counts and posted expense by cost center |
| Basic profitability | Billed revenue minus shipped cost at the item level |

## Starter SQL Map

| Topic | Starter SQL file | What it answers |
|---|---|---|
| Budget vs actual | [01_budget_vs_actual_by_cost_center.sql](../../queries/managerial/01_budget_vs_actual_by_cost_center.sql) | Which cost centers and accounts are over or under budget? |
| Sales mix | [02_sales_mix_by_customer_region_item_group.sql](../../queries/managerial/02_sales_mix_by_customer_region_item_group.sql) | Which regions, segments, and items drive billed sales? |
| Inventory movement | [03_inventory_movement_by_item_and_warehouse.sql](../../queries/managerial/03_inventory_movement_by_item_and_warehouse.sql) | Which items move in and out of each warehouse? |
| Purchasing activity | [04_purchasing_activity_by_supplier_category.sql](../../queries/managerial/04_purchasing_activity_by_supplier_category.sql) | Which suppliers and categories drive purchasing commitments? |
| Cost center summary | [05_cost_center_activity_summary.sql](../../queries/managerial/05_cost_center_activity_summary.sql) | How much operational volume and expense is tied to each cost center? |
| Basic product profitability | [06_basic_product_profitability.sql](../../queries/managerial/06_basic_product_profitability.sql) | Which items generate the most billed gross margin? |

## Typical SQL Workflow

1. Start with budget versus actual if the class is focused on planning and control.
2. Use sales mix and profitability together when teaching customer and product analysis.
3. Use inventory movement and purchasing activity together when teaching supply-side operations.
4. Finish with cost center summary when students are ready to connect organizational structure to activity and expense.

## Typical Excel Workflow

- Use `Budget`, `CostCenter`, `Account`, and `GLEntry` to build a monthly budget-versus-actual pivot.
- Use `SalesInvoiceLine`, `SalesInvoice`, `Customer`, and `Item` for customer or product mix pivots.
- Use `GoodsReceiptLine` and `ShipmentLine` for inventory inflow versus outflow charts.
- Use `PurchaseOrderLine`, `PurchaseOrder`, `Supplier`, and `Item` for supplier concentration and category spend analysis.
- Use slicers for:
  - fiscal year
  - cost center
  - region
  - item group
  - supplier category

## Interpretation Notes and Pitfalls

- Budget rows focus on the currently implemented planning model. They are not a full managerial accounting system.
- Some balance-sheet control-account rows have `CostCenterID = null`, so cost-center reporting should focus on the expense and operational views that actually carry cost center tags.
- The basic profitability view is intentionally simple. It compares billed revenue to shipped cost and does not attempt a full product-costing model.
- The current dataset does not yet include manufacturing, WIP, standard-cost variance decomposition, or detailed production planning.

## Current Scope vs Future Scope

### Implemented in current generator

- cost-center planning and expense analysis
- customer and product mix analysis
- warehouse movement and purchasing volume analysis
- simple item-level profitability analysis

### Planned future extension

- richer inventory availability logic after Phase 11
- manufacturing and cost-accounting analytics after Phase 12

## Where to Go Next

- Read [sql-guide.md](sql-guide.md) for the query-running workflow.
- Read [excel-guide.md](excel-guide.md) for workbook setup and pivot ideas.
