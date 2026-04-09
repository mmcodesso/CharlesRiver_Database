# Managerial Analytics Starter Guide

**Audience:** Students, instructors, and analysts using the dataset for planning, operational, and performance analysis.  
**Purpose:** Show how to work with budgets, cost centers, product mix, inventory movement, purchasing activity, BOMs, work orders, and manufacturing variance.  
**What you will learn:** Which tables to use, how to join them, and which starter queries answer the most useful managerial questions.

> **Implemented in current generator:** Budget rows, cost centers, detailed O2C and P2P volume, item master data, warehouse movement, BOMs, work orders, production completions, and manufacturing variance.

> **Planned future extension:** Payroll-driven labor analytics and deeper cost-accounting detail.

## Relevant Tables

| Topic | Main tables |
|---|---|
| Budget vs actual | `Budget`, `CostCenter`, `Account`, `GLEntry`, `JournalEntry` |
| Sales mix | `SalesInvoice`, `SalesInvoiceLine`, `Customer`, `Item` |
| Inventory movement | `GoodsReceiptLine`, `ShipmentLine`, `SalesReturnLine`, `ProductionCompletionLine`, `Warehouse`, `Item` |
| Purchasing behavior | `PurchaseOrder`, `PurchaseOrderLine`, `Supplier`, `Item` |
| BOM and standard cost | `BillOfMaterial`, `BillOfMaterialLine`, `Item` |
| Work-order throughput | `WorkOrder`, `ProductionCompletion`, `WorkOrderClose` |
| Material usage and scrap | `WorkOrder`, `BillOfMaterialLine`, `MaterialIssueLine`, `ProductionCompletionLine` |
| Manufacturing variance | `WorkOrderClose`, `WorkOrder`, `Item`, `Warehouse` |

## Starter SQL Map

| Topic | Starter SQL file |
|---|---|
| Budget vs actual | [01_budget_vs_actual_by_cost_center.sql](../../queries/managerial/01_budget_vs_actual_by_cost_center.sql) |
| Sales mix | [02_sales_mix_by_customer_region_item_group.sql](../../queries/managerial/02_sales_mix_by_customer_region_item_group.sql) |
| Inventory movement | [03_inventory_movement_by_item_and_warehouse.sql](../../queries/managerial/03_inventory_movement_by_item_and_warehouse.sql) |
| Purchasing activity | [04_purchasing_activity_by_supplier_category.sql](../../queries/managerial/04_purchasing_activity_by_supplier_category.sql) |
| Cost center summary | [05_cost_center_activity_summary.sql](../../queries/managerial/05_cost_center_activity_summary.sql) |
| Basic product profitability | [06_basic_product_profitability.sql](../../queries/managerial/06_basic_product_profitability.sql) |
| BOM standard cost rollup | [07_bom_standard_cost_rollup.sql](../../queries/managerial/07_bom_standard_cost_rollup.sql) |
| Work-order throughput | [08_work_order_throughput_by_month.sql](../../queries/managerial/08_work_order_throughput_by_month.sql) |
| Material usage and scrap | [09_material_usage_and_scrap_review.sql](../../queries/managerial/09_material_usage_and_scrap_review.sql) |
| Production completions and FG availability | [10_production_completion_and_fg_availability.sql](../../queries/managerial/10_production_completion_and_fg_availability.sql) |
| Manufacturing variance | [11_manufacturing_variance_by_month_item_group.sql](../../queries/managerial/11_manufacturing_variance_by_month_item_group.sql) |

## Interpretation Notes

- The item master now mixes purchased and manufactured finished goods.
- `StandardCost` on manufactured items includes BOM-based material cost plus standard conversion cost.
- Manufacturing variance analysis belongs with `WorkOrderClose`, not only with `GLEntry`.
- The current model is a foundation: no routings, labor-time detail, or multi-level BOMs.
