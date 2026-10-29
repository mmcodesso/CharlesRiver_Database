# Report selection and query-library review

All 43 retained original reports were reviewed individually. Ten views were added from existing canonical queries. Period controls display source periods without averaging percentages or summing balances. Filters use available source dimensions and cascade; one-choice controls are hidden.

| Report | Rows / periods | Default view | Available filters | Scope |
|---|---|---|---|---|
| Monthly Income Statement | 1836 / 36 | month | Period controls only | Posted fiscal-month activity; excludes year-end closing journals. |
| Monthly Balance Sheet | 1872 / 36 | month | Period controls only | Cumulative ending balances by fiscal month; interim equity includes current-year earnings. |
| Monthly Indirect Cash Flow | 684 / 36 | month | Period controls only | Fiscal-month movement; opening journals establish beginning cash rather than operating cash flow. |
| Monthly Revenue and Gross Margin | 36 / 36 | year | Period controls only | Posted SalesInvoice and Shipment activity grouped by ledger fiscal month. |
| Design Service Revenue and Billed Hours | 368 / 36 | month | CustomerName, CustomerSegment, Region | Invoice-date month; billed hours and invoice-line service revenue are aggregated before comparison. |
| AR Aging | 1079 / 1 | month | CustomerName, CustomerSegment, Region, AgingBucket | Latest invoice, application, or credit-memo date in the file; not today's date. |
| AP Aging | 3224 / 1 | month | SupplierName, AgingBucket, SupplierCategory, SupplierRiskRating | Latest supplier-invoice or disbursement date in the file; not today's date. |
| Monthly AR Aging Detail | 38633 / 36 | month | CustomerName, CustomerSegment, Region, AgingBucket | Calendar month-end; includes invoices, applications, and credits dated on or before the cutoff. |
| Monthly AR Aging Summary | 7130 / 36 | month | CustomerName, CustomerSegment, Region | Calendar month-end open receivables, with settlement and credits limited to that cutoff. |
| Monthly AP Aging Detail | 80521 / 38 | month | SupplierName, AgingBucket, SupplierCategory, SupplierRiskRating | Calendar month-end; invoices and payments are limited to that cutoff. |
| Monthly AP Aging Summary | 3793 / 38 | month | SupplierName, SupplierCategory, SupplierRiskRating | Calendar month-end open payables, with payments limited to that cutoff. |
| Working Capital Bridge by Month | 38 / 38 | year | Period controls only | Running ledger ending balances by fiscal month, rather than monthly expense or cash flow. |
| Sales Commission Payable Rollforward | 36 / 36 | year | Period controls only | Posted accruals, clawbacks, and payments by fiscal month with a running payable balance. |
| Customer Credit and Refunds | 225 / 1 | month | CustomerName | Whole-file cash applications and refunds; the credit-memo date labels the row, not an as-of cutoff. |
| Customer Deposits and Unapplied Cash Aging | 7409 / 1 | month | CustomerName | Age uses the latest receipt date; application totals use the whole file, not a historical cutoff. |
| Cash Conversion Timing Review | 108 / 36 | year | MetricFamily | Invoice or goods-receipt month; elapsed days end at the first linked settlement in the file. |
| Price Realization vs List by Customer and Portfolio | 26020 / 36 | month | CustomerName, CustomerSegment, Region, CollectionName, StyleFamily | Invoice-date month; billed price is compared with line-level base list price. |
| Payroll Expense Mix by Cost Center and Pay Class | 504 / 36 | month | CostCenterName, PayClass | PayrollPeriod PayDate month; payroll-subledger totals, not ledger posting month. |
| Payroll and People Cost Mix by Cost Center Job Family and Level | 25 / 1 | month | CostCenterName, JobFamily, JobLevel, PayClass | Whole-file payroll totals alongside end-state Employee attributes and headcount; no monthly filter. |
| Gross to Net Payroll Review | 8197 / 77 | month | CostCenterName, EmployeeName, Status, PayClass | Each register's payroll period and scheduled PayDate; actual payment is a separate event. |
| Hourly Payroll Hours to Paid Earnings Bridge | 5537 / 77 | month | CostCenterName, EmployeeName, Status | Payroll-period approved hours and earnings, with scheduled PayDate and first actual payment date. |
| Payroll Cash Payments and Remittances | 36 / 36 | year | Period controls only | Actual employee-payment and liability-remittance date months, aggregated separately. |
| Payroll Liability Rollforward | 144 / 36 | month | AccountName | Posted fiscal-month movement with a running credit-minus-debit liability balance. |
| Budget vs Actual by Cost Center | 960 / 48 | month | CostCenterName, AccountName | Budget month against posted expense month; actuals exclude year-end closing entries. |
| Sales Commission Expense by Rep and Segment | 979 / 36 | month | CustomerSegment, SalesRepName, RevenueType | Accrual-date month with all linked clawbacks attributed to the original accrual; not clawback-month activity. |
| Budget vs Actual Revenue Price Volume Cost Bridge | 4555 / 48 | month | CollectionName, StyleFamily | Budget month against invoice-date month; actual cost uses current item standard cost for comparability. |
| Sales and Margin by Collection and Style | 180 / 1 | month | CollectionName, StyleFamily, PrimaryMaterial, LifecycleStatus, ItemGroup | Whole-file billed sales less credited returns and their standard costs; no monthly cutoff. |
| Monthly Work Center Utilization | 195 / 39 | month | WorkCenterName | Calendar-date month; operations aggregate to center/day before joining daily available capacity. |
| Headcount by Cost Center and Job Family | 35 / 1 | month | CostCenterName, JobFamily, JobLevel, EmploymentStatus | End-state Employee attributes, not historical month-end headcount. Tenure uses termination date or the query's fixed 2030-12-31 fallback. |
| Customer Sales Mix by Region and Item Group | 22906 / 36 | month | CustomerSegment, Region, ItemGroup, ItemName | Invoice-date month; billed sales timing rather than shipment timing. |
| Supplier Purchasing Activity by Category | 5479 / 36 | month | SupplierName, SupplierCategory, SupplierRiskRating, ItemGroup | Purchase-order date month; commitments, not receipt or invoice recognition. |
| Supplier Lead Time and Receipt Reliability | 3493 / 36 | month | SupplierName, SupplierCategory | Purchase-order date month; first and latest observed receipt dates use the whole file. Latest receipt need not mean fully received. |
| Inventory Coverage and Projected Stockout Risk | 115 / 1 | month | WarehouseName, CollectionName, StockoutRisk, ItemGroup, StyleFamily, ItemName | Latest supply-plan bucket; average weekly forecast spans 21 days before through 35 days after that bucket. |
| Rough-Cut Capacity Load vs Available Hours | 804 / 162 | month | WorkCenterName, CapacityStatus | Bucket start and end dates; sums planned load and uses one available-hours value per center/week. |
| Forecast Error and Bias by Collection and Style Family | 96 / 1 | month | CollectionName, StyleFamily | Whole-file forecast quantities compared with whole-file order quantities; no aligned weekly or monthly cutoff. |
| Labor and Headcount by Work Location Job Family and Cost Center | 13 / 1 | month | CostCenterName, WorkLocation, JobFamily | Whole-file payroll, approved time, and labor totals alongside end-state Employee attributes; not a monthly trend. |
| Absence Rate by Work Location and Job Family | 180 / 36 | month | WorkLocation, JobFamily | RosterDate and AbsenceDate calendar months; absence hours are compared with scheduled, reassigned, or absent roster hours. |
| Overtime Approval Coverage and Concentration | 216 / 36 | month | WorkCenterName | TimeClockEntry WorkDate month with positive total overtime; linked approval coverage is not proof of authorization outside the file. |
| Punch to Pay Bridge for Hourly Workers | 5537 / 77 | month | JobFamily, EmployeeName, JobTitle | Payroll-period start and end dates; independently aggregated punches, approved time, labor, and pay. |
| Approval and SOD Review | 373 / 1 | month | IssueType, Status, DocumentType, PrimaryEmployee, SecondaryEmployee | Whole-file screening using each document's request, approval, or posting date; no as-of cutoff. |
| Potential Anomaly Review | 46 / 1 | month | PotentialIssue, TableName | Whole-file heuristic screening; event date depends on the document type, without a common cutoff. |
| Payroll Control Review | 70 / 1 | month | EmployeeName, PotentialIssue | Whole-file register review; EventDate follows the relevant approval date, scheduled pay date, or first payment date. |
| Paid Without Clock and Clock Without Pay Review | 9 / 1 | month | EmployeeName, PotentialIssue | Whole-file support comparison; EventDate is the scheduled pay date for pay rows or work date for clock rows. |
| Monthly Direct Cash Flow | 576 / 36 | month | Period controls only | Period cash activity; opening journals establish beginning cash and are excluded from cash-flow sections. |
| Annual Income Statement | 153 / 3 | all | Period controls only | Annual posted activity excluding year-end closing journals. |
| Annual Balance Sheet | 156 / 3 | all | Period controls only | Fiscal period 12 ending balances; monthly balances are not summed. |
| Annual Indirect Cash Flow | 57 / 3 | all | Period controls only | Annual cash activity, with period 1 beginning cash and period 12 ending cash. |
| Annual Direct Cash Flow | 48 / 3 | all | Period controls only | Annual posted cash activity, with period 1 beginning cash and period 12 ending cash. |
| Trial Balance by Period | 2247 / 38 | month | AccountType, AccountSubType, AccountName | Period ledger activity, not cumulative account ending balances. |
| Fixed Asset Rollforward | 108 / 36 | month | BehaviorGroup | Monthly opening balances, activity and ending balances; balances are not summed across months. |
| Debt Amortization and Cash Impact | 108 / 78 | month | AgreementNumber, BehaviorGroup, ScheduleStatus | Scheduled payment period; payment status identifies the recorded schedule state. |
| Work Order Throughput | 36 / 36 | year | Period controls only | Monthly release and completion metrics as defined by the source query; timing averages are not added. |
| Design Service Utilization and Labor Margin | 239 / 1 | month | CustomerName, ServiceName, LeadEmployeeName, EngagementStatus | Whole-engagement assigned, approved and billed activity; engagement dates do not create historical cutoffs. |

## New report choices

- Core: monthly direct cash flow; annual income statement, balance sheet, direct and indirect cash flow. Annual balance sheets retain fiscal period 12 balances; cash statements retain separate beginning and ending cash.
- Specialist: trial balance, fixed asset rollforward, debt amortization/cash impact, monthly work-order throughput, and engagement utilization/labor margin. These fill close, asset-financing, production and services gaps without duplicating existing report grain.
- Quarterly statements remain available as SQL. The new period views already allow monthly comparisons across a year; quarterly statement presentation can be added separately.
- Detailed inventory movement was evaluated (12,674 item/warehouse/month rows). It remains in the Query Library: inventory coverage and existing merchandise evidence already provide a focused report entry point. No large inventory snapshot was added.

## Query inventory decisions

The following covers all 170 existing queries. Existing report IDs and SQL remain unchanged; investigative queries remain available in the library.

| Query | Report decision |
|---|---|
| queries/audit/01_o2c_document_chain_completeness.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/02_p2p_document_chain_completeness.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/03_approval_and_sod_review.sql | Report: approval-and-sod-review |
| queries/audit/04_cutoff_and_timing_analysis.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/05_duplicate_payment_reference_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/06_potential_anomaly_review.sql | Report: potential-anomaly-review |
| queries/audit/07_backorder_and_return_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/08_missing_bom_or_supply_mode_conflict.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/09_over_issue_and_open_wip_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/10_work_order_close_timing_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/11_payroll_control_review.sql | Report: payroll-control-review |
| queries/audit/12_labor_time_after_close_and_paid_without_time.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/13_over_under_accrual_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/14_missing_routing_or_operation_link_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/15_operation_sequence_and_final_completion_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/16_schedule_on_nonworking_day_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/17_over_capacity_day_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/18_completion_before_scheduled_operation_end.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/19_time_clock_exceptions_by_employee_supervisor_work_center.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/20_labor_outside_scheduled_operation_window_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/21_paid_without_clock_and_clock_without_pay_review.sql | Report: paid-without-clock-and-clock-without-pay-review |
| queries/audit/23_accrued_service_settlement_exception_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/24_customer_deposits_and_unapplied_cash_exception_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/25_time_clock_payroll_labor_bridge_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/26_duplicate_ap_reference_detail_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/27_terminated_employee_activity_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/28_approval_role_review_by_org_position.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/29_executive_role_uniqueness_and_control_assignment_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/30_item_master_completeness_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/31_discontinued_or_prelaunch_item_activity_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/32_approval_authority_review_by_expected_role_family.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/33_terminated_employee_activity_rollup_by_process_area.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/34_current_state_employee_assignment_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/35_approval_authority_limit_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/36_item_status_alignment_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/37_scheduled_without_punch_and_punch_without_schedule_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/38_overtime_without_approval_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/39_absence_with_worked_time_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/40_overlapping_or_incomplete_punch_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/41_roster_after_termination_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/42_forecast_approval_and_override_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/43_inactive_or_stale_inventory_policy_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/44_requisitions_and_work_orders_without_planning_support.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/45_recommendation_converted_after_need_by_date_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/46_discontinued_or_prelaunch_planning_activity_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/47_sales_below_floor_without_approval.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/48_expired_or_overlapping_price_list_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/49_promotion_scope_and_date_mismatch_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/50_customer_specific_price_list_bypass_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/51_override_approval_completeness_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/52_released_work_orders_due_without_actual_start_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/53_released_work_orders_due_without_actual_start_summary.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/audit/54_design_service_approved_vs_billed_hours_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/cases/01_o2c_line_trace_order_shipment_invoice.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/cases/02_o2c_source_to_gl_trace.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/cases/03_p2p_invoice_line_trace_receipt_vs_accrual.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/cases/04_p2p_accrual_journal_invoice_payment_gl_trace.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/cases/05_manufacturing_work_order_operation_trace.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/cases/06_manufacturing_work_order_close_gl_trace.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/01_monthly_revenue_and_gross_margin.sql | Report: monthly-revenue-and-gross-margin |
| queries/financial/02_ar_aging_open_invoices.sql | Report: ar-aging |
| queries/financial/03_ap_aging_open_invoices.sql | Report: ap-aging |
| queries/financial/04_trial_balance_by_period.sql | Report: trial-balance-by-period |
| queries/financial/05_journal_and_close_cycle_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/06_control_account_reconciliation.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/07_customer_credit_and_refunds.sql | Report: customer-credit-and-refunds |
| queries/financial/08_manufacturing_wip_clearing_variance.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/09_payroll_liability_rollforward.sql | Report: payroll-liability-rollforward |
| queries/financial/10_gross_to_net_payroll_review.sql | Report: gross-to-net-payroll-review |
| queries/financial/11_payroll_cash_payments_and_remittances.sql | Report: payroll-cash-payments-and-remittances |
| queries/financial/12_accrued_expense_rollforward.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/13_accrued_vs_invoiced_vs_paid_timing.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/14_hourly_payroll_hours_to_paid_earnings_bridge.sql | Report: hourly-payroll-hours-to-paid-earnings-bridge |
| queries/financial/15_customer_deposits_and_unapplied_cash_aging.sql | Report: customer-deposits-and-unapplied-cash-aging |
| queries/financial/16_retained_earnings_and_close_entry_impact.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/17_manufacturing_cost_component_bridge.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/18_payroll_expense_mix_by_cost_center_and_pay_class.sql | Report: payroll-expense-mix-by-cost-center-and-pay-class |
| queries/financial/19_working_capital_bridge_by_month.sql | Report: working-capital-bridge-by-month |
| queries/financial/20_cash_conversion_timing_review.sql | Report: cash-conversion-timing-review |
| queries/financial/21_revenue_and_gross_margin_by_collection_style_lifecycle_supply_mode.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/22_payroll_and_people_cost_mix_by_cost_center_job_family_level.sql | Report: payroll-and-people-cost-mix-by-cost-center-job-family-level |
| queries/financial/23_forecast_vs_actual_demand_by_week_item_group_collection_lifecycle.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/24_recommendation_conversion_by_type_priority_planner.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/25_price_realization_vs_list_by_segment_customer_region_collection_style.sql | Report: price-realization-vs-list-by-customer-and-portfolio |
| queries/financial/26_gross_margin_impact_of_promotions_vs_nonpromotion_sales.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/27_income_statement_monthly.sql | Report: monthly-income-statement |
| queries/financial/28_income_statement_quarterly.sql | Query Library; quarterly statement detail |
| queries/financial/29_income_statement_annual.sql | Report: annual-income-statement |
| queries/financial/30_balance_sheet_monthly.sql | Report: monthly-balance-sheet |
| queries/financial/31_balance_sheet_quarterly.sql | Query Library; quarterly statement detail |
| queries/financial/32_balance_sheet_annual.sql | Report: annual-balance-sheet |
| queries/financial/33_cash_flow_statement_indirect_monthly.sql | Report: monthly-indirect-cash-flow |
| queries/financial/34_cash_flow_statement_indirect_quarterly.sql | Query Library; quarterly statement detail |
| queries/financial/35_cash_flow_statement_indirect_annual.sql | Report: annual-indirect-cash-flow |
| queries/financial/36_cash_flow_statement_direct_monthly.sql | Report: monthly-direct-cash-flow |
| queries/financial/37_cash_flow_statement_direct_quarterly.sql | Query Library; quarterly statement detail |
| queries/financial/38_cash_flow_statement_direct_annual.sql | Report: annual-direct-cash-flow |
| queries/financial/39_annual_income_to_equity_bridge.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/40_post_close_profit_and_loss_leakage_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/41_round_dollar_manual_journal_close_sensitivity_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/42_annual_net_revenue_bridge.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/43_invoice_revenue_cutoff_exception_summary.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/44_invoice_revenue_cutoff_exception_trace.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/45_monthly_ar_aging_detail.sql | Report: monthly-ar-aging-detail |
| queries/financial/46_monthly_ar_aging_summary.sql | Report: monthly-ar-aging-summary |
| queries/financial/47_monthly_ap_aging_detail.sql | Report: monthly-ap-aging-detail |
| queries/financial/48_monthly_ap_aging_summary.sql | Report: monthly-ap-aging-summary |
| queries/financial/49_pro_forma_income_statement_monthly.sql | Query Library; pro forma/related planning report remains retired |
| queries/financial/50_pro_forma_balance_sheet_monthly.sql | Query Library; pro forma/related planning report remains retired |
| queries/financial/51_pro_forma_cash_flow_indirect_monthly.sql | Query Library; pro forma/related planning report remains retired |
| queries/financial/52_budget_vs_actual_statement_bridge_monthly.sql | Query Library; pro forma/related planning report remains retired |
| queries/financial/53_budget_vs_actual_working_capital_and_cash_bridge.sql | Query Library; pro forma/related planning report remains retired |
| queries/financial/54_fixed_asset_rollforward_by_behavior_group.sql | Report: fixed-asset-rollforward |
| queries/financial/55_capex_acquisitions_financing_and_disposals.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/financial/56_debt_amortization_and_cash_impact.sql | Report: debt-amortization-and-cash-impact |
| queries/financial/57_design_service_revenue_and_billed_hours_by_customer_month.sql | Report: design-service-revenue-and-billed-hours |
| queries/financial/58_sales_commission_payable_rollforward.sql | Report: sales-commission-payable-rollforward |
| queries/managerial/01_budget_vs_actual_by_cost_center.sql | Report: budget-vs-actual-by-cost-center |
| queries/managerial/02_sales_mix_by_customer_region_item_group.sql | Report: customer-sales-mix-by-region-and-item-group |
| queries/managerial/03_inventory_movement_by_item_and_warehouse.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/04_purchasing_activity_by_supplier_category.sql | Report: supplier-purchasing-activity-by-category |
| queries/managerial/05_cost_center_activity_summary.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/06_basic_product_profitability.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/07_bom_standard_cost_rollup.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/08_work_order_throughput_by_month.sql | Report: work-order-throughput |
| queries/managerial/09_material_usage_and_scrap_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/10_production_completion_and_fg_availability.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/11_manufacturing_variance_by_month_item_group.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/12_direct_labor_by_work_order_and_employee_class.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/13_unit_cost_bridge_dm_dl_varoh_fixedoh.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/14_absorption_vs_contribution_margin.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/15_manufactured_vs_purchased_margin_comparison.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/16_labor_efficiency_and_rate_variance.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/17_routing_master_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/18_work_center_activity_and_operation_hours.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/19_daily_load_vs_capacity.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/20_monthly_work_center_utilization.sql | Report: monthly-work-center-utilization |
| queries/managerial/21_operation_delay_and_bottleneck_review.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/22_backlog_aging_by_work_center.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/23_shift_adherence_and_overtime_by_work_center.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/24_approved_clock_hours_vs_labor_allocation.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/25_backorder_fill_rate_and_shipment_lag.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/26_returns_and_refund_impact_by_customer_and_item.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/27_supplier_lead_time_and_receipt_reliability.sql | Report: supplier-lead-time-and-receipt-reliability |
| queries/managerial/28_paid_hours_vs_productive_labor_by_work_center.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/29_headcount_by_cost_center_job_family_status.sql | Report: headcount-by-cost-center-and-job-family |
| queries/managerial/30_sales_margin_by_collection_style_material.sql | Report: sales-and-margin-by-collection-and-style |
| queries/managerial/31_product_portfolio_mix_by_collection_style_lifecycle_supply_mode.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/32_contribution_margin_by_collection_material_lifecycle_supply_mode.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/33_customer_service_impact_by_collection_style.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/34_labor_and_headcount_by_work_location_job_family_cost_center.sql | Report: labor-and-headcount-by-work-location-job-family-cost-center |
| queries/managerial/35_portfolio_return_refund_impact_by_collection_lifecycle.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/36_staffing_coverage_vs_work_center_planned_load.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/37_rostered_vs_worked_hours_by_work_center_shift.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/38_absence_rate_by_work_location_job_family_month.sql | Report: absence-rate-by-work-location-job-family-month |
| queries/managerial/39_overtime_approval_coverage_and_concentration.sql | Report: overtime-approval-coverage-and-concentration |
| queries/managerial/40_punch_to_pay_bridge_for_hourly_workers.sql | Report: punch-to-pay-bridge-for-hourly-workers |
| queries/managerial/41_late_arrival_early_departure_by_shift_department.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/42_inventory_coverage_and_projected_stockout_risk.sql | Report: inventory-coverage-and-projected-stockout-risk |
| queries/managerial/43_rough_cut_capacity_load_vs_available_hours.sql | Report: rough-cut-capacity-load-vs-available-hours |
| queries/managerial/44_expedite_pressure_by_item_family_and_month.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/45_forecast_error_and_bias_by_collection_style_family.sql | Report: forecast-error-and-bias-by-collection-and-style-family |
| queries/managerial/46_supply_plan_driver_mix_by_collection_and_supply_mode.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/47_sales_rep_override_rate_and_discount_dispersion.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/48_collection_revenue_margin_before_after_promotions.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/49_customer_specific_pricing_concentration_and_dependency.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/50_monthly_price_floor_pressure_and_override_concentration.sql | Query Library; focused technical, source-detail or investigative analysis |
| queries/managerial/51_budget_vs_actual_revenue_price_volume_cost_bridge.sql | Report: budget-vs-actual-revenue-price-volume-cost-bridge |
| queries/managerial/52_design_service_engagement_utilization_and_labor_margin.sql | Report: design-service-utilization-and-labor-margin |
| queries/managerial/53_sales_commission_expense_by_rep_segment.sql | Report: sales-commission-expense-by-rep-segment |
