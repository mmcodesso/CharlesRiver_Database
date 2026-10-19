"""Website-only schema catalog and initial native ER cells; never changes the database.

Run with the repo .venv. --id selects bootstrap sources; existing sources require
--replace. Catalog/text metadata can be refreshed without rewriting geometry.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sqlite3
from drawio_authoring import Drawing

ROOT = Path(__file__).resolve().parents[3]
DB = ROOT / 'outputs/_site_build/CharlesRiver.sqlite'
SHA = 'de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c'
with DB.open('rb') as stream:
    assert hashlib.file_digest(stream, 'sha256').hexdigest() == SHA
db = sqlite3.connect(DB.resolve().as_uri() + '?mode=ro', uri=True)
db.execute('PRAGMA query_only=ON')
columns = {name: list(db.execute(f'PRAGMA table_info("{name}")')) for name, in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
pks = {name: next(row[1] for row in rows if row[5]) for name, rows in columns.items()}

GRAINS = {
    'Account': 'One chart-of-accounts account', 'JournalEntry': 'One finance-controlled journal header', 'GLEntry': 'One posted account line in a voucher',
    'FixedAsset': 'One asset in the asset register', 'FixedAssetEvent': 'One recorded asset lifecycle event', 'DebtAgreement': 'One financing agreement', 'DebtScheduleLine': 'One scheduled debt-payment installment',
    'Customer': 'One customer', 'PriceList': 'One customer or segment price-list scope', 'PriceListLine': 'One item price within a price list', 'PromotionProgram': 'One promotion definition', 'PriceOverrideApproval': 'One recorded order-line price approval', 'SalesOrder': 'One customer order header', 'SalesOrderLine': 'One ordered item or service line',
    'Shipment': 'One goods-shipment header', 'ShipmentLine': 'One shipped order-line quantity', 'SalesInvoice': 'One customer invoice header', 'SalesInvoiceLine': 'One billed goods or service line',
    'ServiceEngagement': 'One engagement for a service order line', 'ServiceEngagementAssignment': 'One employee assignment to an engagement', 'ServiceTimeEntry': 'One employee service-time entry on a work date', 'ServiceBillingLine': 'One engagement billing-period rollup linked to an invoice line',
    'CashReceipt': 'One incoming customer cash event', 'CashReceiptApplication': 'One dated receipt allocation to an invoice',
    'SalesReturn': 'One goods-return header', 'SalesReturnLine': 'One returned shipment-line quantity', 'CreditMemo': 'One customer credit-memo header', 'CreditMemoLine': 'One credited return line', 'CustomerRefund': 'One cash refund against a credit memo',
    'SalesCommissionRate': 'One commission rate by revenue type, segment, and effective period', 'SalesCommissionAccrual': 'One invoice-line commission accrual', 'SalesCommissionAdjustment': 'One credit-related commission clawback', 'SalesCommissionPayment': 'One sales-rep commission payment', 'SalesCommissionPaymentLine': 'One accrual or adjustment included in a commission payment',
    'Supplier': 'One supplier', 'PurchaseRequisition': 'One internal item requisition', 'PurchaseOrder': 'One supplier purchase-order header', 'PurchaseOrderLine': 'One ordered purchasing line', 'GoodsReceipt': 'One supplier goods-receipt header', 'GoodsReceiptLine': 'One received purchasing-line quantity', 'PurchaseInvoice': 'One supplier invoice header', 'PurchaseInvoiceLine': 'One goods or accrued-service supplier invoice line', 'DisbursementPayment': 'One supplier invoice payment',
    'BillOfMaterial': 'One versioned manufactured-item recipe', 'BillOfMaterialLine': 'One component within a BOM', 'Routing': 'One versioned manufactured-item routing', 'RoutingOperation': 'One operation within a routing', 'WorkCenter': 'One production work center', 'WorkCenterCalendar': 'One work center on one calendar date',
    'WorkOrder': 'One manufacturing work-order header', 'WorkOrderOperation': 'One operation within a work order', 'WorkOrderOperationSchedule': 'One scheduled operation on a work-center date', 'MaterialIssue': 'One work-order material-issue header', 'MaterialIssueLine': 'One issued component line', 'ProductionCompletion': 'One work-order completion event', 'ProductionCompletionLine': 'One completed-product cost line', 'WorkOrderClose': 'One work-order accounting-close record',
    'ShiftDefinition': 'One shift template', 'EmployeeShiftAssignment': 'One employee shift assignment over effective dates', 'EmployeeShiftRoster': 'One employee planned shift on a roster date', 'EmployeeAbsence': 'One absence record against a roster', 'OvertimeApproval': 'One recorded overtime approval', 'TimeClockPunch': 'One raw clock-punch event', 'TimeClockEntry': 'One approved-time record for an employee work date', 'AttendanceException': 'One logged attendance-review exception',
    'PayrollPeriod': 'One payroll calendar period', 'LaborTimeEntry': 'One labor allocation supporting an operation and pay period', 'PayrollRegister': 'One employee payroll register in a pay period', 'PayrollRegisterLine': 'One earning, deduction, tax, or benefit line', 'PayrollPayment': 'One employee net-pay payment', 'PayrollLiabilityRemittance': 'One period-level liability remittance',
    'Item': 'One item in the product or service master', 'Warehouse': 'One warehouse', 'Employee': 'One employee', 'CostCenter': 'One organizational reporting cost center', 'Budget': 'One monthly cost-center/account budget summary', 'BudgetLine': 'One monthly budget driver or statement-planning detail',
    'DemandForecast': 'One item/location forecast for a weekly bucket', 'InventoryPolicy': 'One item/location replenishment policy', 'SupplyPlanRecommendation': 'One item/location supply recommendation in a planning bucket', 'MaterialRequirementPlan': 'One component requirement for a supply recommendation', 'RoughCutCapacityPlan': 'One work-center capacity requirement for a supply recommendation',
}
assert set(GRAINS) == set(columns), set(columns) ^ set(GRAINS)

def ref(child, key, parent, target=None, kind='reference', condition='', note='', optional=None):
    keys = key.split(',')
    targets = (target or pks[parent]).split(',')
    for name in keys: assert name in {r[1] for r in columns[child]}, (child, name)
    for name in targets: assert name in {r[1] for r in columns[parent]}, (parent, name)
    if optional is None:
        optional = bool(db.execute(f'SELECT COUNT(*) FROM "{child}" WHERE ' + ' OR '.join('"'+key+'" IS NULL' for key in keys)).fetchone()[0])
    return dict(child=child, childFields=keys, parent=parent, parentFields=targets, kind=kind,
                condition=condition, note=note, optionalParent=optional)

def context(child, key, parent, target, note):
    return ref(child, key, parent, target, 'aggregate', note=note, optional=True)

MODELS = []
def view(identifier, title, area, primary, refs, question, relations, positions=None, note=''):
    MODELS.append(dict(id=identifier, title=title, area=area, primary=primary.split(), context=refs.split(), question=question,
                       relationships=relations, positions=positions or {}, boundary=note))

view('accounting-core', 'Accounts, journals, and posted detail', 'Accounting', 'Account JournalEntry GLEntry', '',
     'Which source identifier identifies the posted event?', [ref('GLEntry','AccountID','Account'), ref('GLEntry','SourceDocumentID','JournalEntry',kind='conditional',condition="SourceDocumentType = 'JournalEntry'",note='Other posting types have their own source records.')],
     note='JournalEntry is one posting route. Operational sources and constructed PayrollSummary identifiers must not be treated as journal headers.')
view('asset-financing', 'Asset events and financing', 'Fixed assets', 'FixedAsset FixedAssetEvent DebtAgreement DebtScheduleLine', 'JournalEntry',
     'Which asset event or debt installment links to a journal?', [ref('FixedAssetEvent','FixedAssetID','FixedAsset'), ref('DebtAgreement','FixedAssetID','FixedAsset'), ref('DebtScheduleLine','DebtAgreementID','DebtAgreement'), ref('FixedAssetEvent','JournalEntryID','JournalEntry'), ref('DebtScheduleLine','JournalEntryID','JournalEntry')],
     note='Asset and debt records link to journals when present; they do not post under their own GLEntry source labels.')
view('commercial-terms', 'Customer orders and commercial terms', 'Sales', 'Customer PriceList PriceListLine PromotionProgram PriceOverrideApproval SalesOrder SalesOrderLine', '',
     'Which terms describe an order without recognizing revenue?', [ref('PriceList','CustomerID','Customer'),ref('PriceListLine','PriceListID','PriceList'),ref('SalesOrder','CustomerID','Customer'),ref('SalesOrderLine','SalesOrderID','SalesOrder'),ref('SalesOrderLine','PriceListLineID','PriceListLine'),ref('SalesOrderLine','PromotionID','PromotionProgram'),ref('SalesOrderLine','PriceOverrideApprovalID','PriceOverrideApproval')],
     note='Segment price lists need no CustomerID. A linked approval records an authorization basis; inspect authority, dates, and status separately.')
view('goods-fulfillment', 'Goods fulfillment and customer billing', 'Sales', 'Shipment ShipmentLine SalesInvoice SalesInvoiceLine', 'SalesOrder SalesOrderLine',
     'Which line-level keys connect ordered, shipped, and billed quantities?', [ref('SalesOrderLine','SalesOrderID','SalesOrder'),ref('Shipment','SalesOrderID','SalesOrder'),ref('ShipmentLine','ShipmentID','Shipment'),ref('ShipmentLine','SalesOrderLineID','SalesOrderLine'),ref('SalesInvoiceLine','SalesInvoiceID','SalesInvoice'),ref('SalesInvoiceLine','ShipmentLineID','ShipmentLine')],
     positions={'SalesOrder':[0,0],'Shipment':[1,0],'SalesInvoice':[2,0],'SalesOrderLine':[0,1],'ShipmentLine':[1,1],'SalesInvoiceLine':[2,1]},
     note='ShipmentLineID is optional on customer invoice lines because services use ServiceBillingLine. This view focuses on the goods path; an order is non-posting.')
view('service-delivery', 'Design work, time, and billing', 'Design Services', 'ServiceEngagement ServiceEngagementAssignment ServiceTimeEntry ServiceBillingLine', 'SalesOrderLine SalesInvoiceLine',
     'How are dated time entries matched to a billing-period rollup?', [ref('ServiceEngagement','SalesOrderLineID','SalesOrderLine'),ref('ServiceEngagementAssignment','ServiceEngagementID','ServiceEngagement'),ref('ServiceTimeEntry','ServiceEngagementAssignmentID','ServiceEngagementAssignment'),ref('ServiceBillingLine','ServiceEngagementID','ServiceEngagement'),ref('ServiceBillingLine','SalesInvoiceLineID','SalesInvoiceLine'),context('ServiceTimeEntry','ServiceEngagementID,WorkDate','ServiceBillingLine','ServiceEngagementID,BillingPeriodStartDate','Match engagement; WorkDate lies within BillingPeriodStartDate and BillingPeriodEndDate. Aggregate approved billable hours before comparing.')],
     note='The time-to-billing match is an engagement/date-interval analysis, not a stored billing-line ID on each time entry. Non-billable time retains cost support without customer billing.')
view('cash-allocation', 'Received cash and invoice allocation', 'Sales', 'CashReceipt CashReceiptApplication', 'SalesInvoice',
     'Why can received cash and an open invoice coexist?', [ref('CashReceiptApplication','CashReceiptID','CashReceipt'),ref('CashReceiptApplication','SalesInvoiceID','SalesInvoice')],
     positions={'CashReceipt':[0,0],'CashReceiptApplication':[1,0],'SalesInvoice':[2,0]},
     note='Receipt and invoice dates do not establish allocation. CashReceiptApplication supplies the amount and application date; CashReceipt.SalesInvoiceID is compatibility metadata.')
view('returns-credit', 'Returns, customer credit, and refunds', 'Sales', 'SalesReturn SalesReturnLine CreditMemo CreditMemoLine CustomerRefund', 'ShipmentLine SalesInvoice',
     'Which records distinguish returned goods, credit, and cash paid back?', [ref('SalesReturnLine','SalesReturnID','SalesReturn'),ref('SalesReturnLine','ShipmentLineID','ShipmentLine'),ref('CreditMemo','SalesReturnID','SalesReturn'),ref('CreditMemo','OriginalSalesInvoiceID','SalesInvoice'),ref('CreditMemoLine','CreditMemoID','CreditMemo'),ref('CreditMemoLine','SalesReturnLineID','SalesReturnLine'),ref('CustomerRefund','CreditMemoID','CreditMemo')],
     positions={'ShipmentLine':[0,0],'SalesReturnLine':[1,0],'CreditMemoLine':[2,0],'SalesReturn':[1,1],'CreditMemo':[2,1],'SalesInvoice':[0,1],'CustomerRefund':[2,2]},
     note='A memo can reduce AR and retain excess customer credit. A refund is a separate optional cash event; do not infer one from a return.')
view('commissions', 'Commission accrual, clawback, and payment', 'Sales', 'SalesCommissionRate SalesCommissionAccrual SalesCommissionAdjustment SalesCommissionPayment SalesCommissionPaymentLine', 'SalesInvoiceLine',
     'How does a payment identify its accruals and adjustments?', [ref('SalesCommissionAccrual','SalesInvoiceLineID','SalesInvoiceLine'),ref('SalesCommissionAccrual','SalesCommissionRateID','SalesCommissionRate'),ref('SalesCommissionAdjustment','SalesCommissionAccrualID','SalesCommissionAccrual'),ref('SalesCommissionPaymentLine','SalesCommissionPaymentID','SalesCommissionPayment'),ref('SalesCommissionPaymentLine','SourceDocumentID','SalesCommissionAccrual',kind='conditional',condition="SourceDocumentType = 'SalesCommissionAccrual'"),ref('SalesCommissionPaymentLine','SourceDocumentID','SalesCommissionAdjustment',kind='conditional',condition="SourceDocumentType = 'SalesCommissionAdjustment'")],
     positions={'SalesCommissionRate':[0,1],'SalesInvoiceLine':[0,0],'SalesCommissionAccrual':[1,0],'SalesCommissionAdjustment':[2,0],'SalesCommissionPayment':[2,1],'SalesCommissionPaymentLine':[1,1]},
     note='The accrual stores both the invoice-line and rate keys. Payment lines use a type-qualified source ID; commissions settle separately from payroll.')
view('procurement-receiving', 'Procurement and goods receiving', 'Purchasing', 'Supplier PurchaseRequisition PurchaseOrder PurchaseOrderLine GoodsReceipt GoodsReceiptLine', '',
     'Which requisition and PO line support a received quantity?', [ref('PurchaseOrder','SupplierID','Supplier'),ref('PurchaseOrderLine','RequisitionID','PurchaseRequisition'),ref('PurchaseOrderLine','PurchaseOrderID','PurchaseOrder'),ref('GoodsReceipt','PurchaseOrderID','PurchaseOrder'),ref('GoodsReceiptLine','GoodsReceiptID','GoodsReceipt'),ref('GoodsReceiptLine','POLineID','PurchaseOrderLine')],
     note='Use PurchaseOrderLine.RequisitionID for a batched order. A stored receipt/invoice relationship does not prove a system-enforced matching control.')
view('supplier-liabilities', 'Supplier invoices and separate settlement', 'Purchasing', 'PurchaseInvoice PurchaseInvoiceLine DisbursementPayment', 'GoodsReceiptLine JournalEntry PurchaseOrderLine',
     'Does the supplier line match received goods or an accrued-service estimate?', [ref('PurchaseInvoiceLine','PurchaseInvoiceID','PurchaseInvoice'),ref('PurchaseInvoiceLine','POLineID','PurchaseOrderLine'),ref('PurchaseInvoiceLine','GoodsReceiptLineID','GoodsReceiptLine'),ref('PurchaseInvoiceLine','AccrualJournalEntryID','JournalEntry'),ref('DisbursementPayment','PurchaseInvoiceID','PurchaseInvoice')],
     note='GoodsReceiptLineID and POLineID are absent on direct accrued-service invoice lines. Payment clears AP; it does not prove that a residual estimate has cleared.')
view('manufacturing-definitions', 'Product recipes and production capacity', 'Manufacturing', 'BillOfMaterial BillOfMaterialLine Routing RoutingOperation WorkCenter WorkCenterCalendar', 'Item',
     'Which item, component, operation, and work center define production?', [ref('BillOfMaterial','ParentItemID','Item'),ref('BillOfMaterialLine','BOMID','BillOfMaterial'),ref('Routing','ParentItemID','Item'),ref('RoutingOperation','RoutingID','Routing'),ref('RoutingOperation','WorkCenterID','WorkCenter'),ref('WorkCenterCalendar','WorkCenterID','WorkCenter')],
     note='BOM and routing definitions support planned work. Their existence does not establish material issue, completion, or cost close.')
view('work-order-scheduling', 'Work orders and daily operation schedules', 'Manufacturing', 'WorkOrder WorkOrderOperation WorkOrderOperationSchedule', 'SupplyPlanRecommendation WorkCenterCalendar',
     'Which two fields match a scheduled operation to available daily capacity?', [ref('WorkOrder','SupplyPlanRecommendationID','SupplyPlanRecommendation'),ref('WorkOrderOperation','WorkOrderID','WorkOrder'),ref('WorkOrderOperationSchedule','WorkOrderOperationID','WorkOrderOperation'),context('WorkOrderOperationSchedule','WorkCenterID,ScheduleDate','WorkCenterCalendar','WorkCenterID,CalendarDate','Match BOTH work center and date. Aggregate scheduled operations at work-center/date grain before comparing available hours.')],
     note='No WorkCenterCalendarID is stored on the schedule. Joining on work center alone repeats calendar capacity.')
view('manufacturing-cost-events', 'Material, completion, and accounting close', 'Manufacturing', 'MaterialIssue MaterialIssueLine ProductionCompletion ProductionCompletionLine WorkOrderClose', 'WorkOrder LaborTimeEntry',
     'Which independent branches must be summarized before a work-order comparison?', [ref('MaterialIssue','WorkOrderID','WorkOrder'),ref('MaterialIssueLine','MaterialIssueID','MaterialIssue'),ref('ProductionCompletion','WorkOrderID','WorkOrder'),ref('ProductionCompletionLine','ProductionCompletionID','ProductionCompletion'),ref('WorkOrderClose','WorkOrderID','WorkOrder'),ref('LaborTimeEntry','WorkOrderID','WorkOrder')],
     note='Close does not store a ProductionCompletionLineID. Aggregate issues, labor, completions, and close independently. Payroll clearing remains pooled by period/cost center.')
view('attendance-time', 'Attendance support and approved daily time', 'Payroll', 'ShiftDefinition EmployeeShiftAssignment EmployeeShiftRoster EmployeeAbsence OvertimeApproval TimeClockPunch TimeClockEntry AttendanceException', '',
     'Which stored keys connect a daily time record to its supporting evidence?', [ref('EmployeeShiftAssignment','ShiftDefinitionID','ShiftDefinition'),ref('EmployeeShiftRoster','ShiftDefinitionID','ShiftDefinition'),ref('EmployeeAbsence','EmployeeShiftRosterID','EmployeeShiftRoster'),ref('OvertimeApproval','EmployeeShiftRosterID','EmployeeShiftRoster'),ref('TimeClockEntry','EmployeeShiftRosterID','EmployeeShiftRoster'),ref('TimeClockPunch','TimeClockEntryID','TimeClockEntry'),ref('AttendanceException','TimeClockEntryID','TimeClockEntry')],
     note='There is no assignment ID on the roster or punch ID on AttendanceException. Effective-date matching and shared roster/time records supply those investigations; a flag does not prove a payment block.')
view('payroll-settlement', 'Payroll support, employee pay, and remittances', 'Payroll', 'PayrollPeriod LaborTimeEntry PayrollRegister PayrollRegisterLine PayrollPayment PayrollLiabilityRemittance', 'TimeClockEntry',
     'Which obligation is employee-specific, and which is period-level?', [ref('LaborTimeEntry','TimeClockEntryID','TimeClockEntry'),ref('PayrollRegisterLine','LaborTimeEntryID','LaborTimeEntry'),ref('PayrollRegisterLine','PayrollRegisterID','PayrollRegister'),ref('PayrollRegister','PayrollPeriodID','PayrollPeriod'),ref('PayrollPayment','PayrollRegisterID','PayrollRegister'),ref('PayrollLiabilityRemittance','PayrollPeriodID','PayrollPeriod')],
     note='PayrollSummary is a constructed GLEntry source label, not a table. Aggregate registers by period, cost center, and account to reconcile recognition; remittances have a different grain from employee payments.')
view('shared-masters', 'Shared item, warehouse, and employee records', 'Shared records', 'Item Warehouse Employee', '',
     'Which identifiers let an investigation move across processes?', [],
     note='These records recur as shared references in process views. Item account mappings, employee approvals, and warehouse context answer different questions; a shared item does not identify one receipt-to-issue transaction.')
view('budgets-responsibility', 'Budgets and reporting responsibility', 'Planning', 'CostCenter Budget BudgetLine', 'Account',
     'How do detailed budget drivers differ from a cost-center summary?', [ref('Budget','CostCenterID','CostCenter'),ref('Budget','AccountID','Account'),ref('BudgetLine','CostCenterID','CostCenter'),ref('BudgetLine','AccountID','Account')],
     note='Some BudgetLine rows have no CostCenterID. Budget and BudgetLine are separate grains; do not join their amounts as if they were matching individual transactions.')
view('demand-supply-planning', 'Demand, supply recommendations, and requirements', 'Planning', 'DemandForecast InventoryPolicy SupplyPlanRecommendation MaterialRequirementPlan RoughCutCapacityPlan', '',
     'Which links are stored, and which are analytical planning context?', [ref('MaterialRequirementPlan','SupplyPlanRecommendationID','SupplyPlanRecommendation'),ref('RoughCutCapacityPlan','SupplyPlanRecommendationID','SupplyPlanRecommendation'),context('SupplyPlanRecommendation','ItemID,WarehouseID','DemandForecast','ItemID,WarehouseID','Match item/location and the relevant weekly bucket and DriverType; there is no stored DemandForecastID.'),context('SupplyPlanRecommendation','ItemID,WarehouseID','InventoryPolicy','ItemID,WarehouseID','Inspect item/location, active policy, planning bucket, and DriverType; there is no stored InventoryPolicyID.')],
     note='Planning context is not a one-record foreign-key trace. Requisitions and work orders reference SupplyPlanRecommendationID when converted into execution documents.')

PATHS = {
    'Accounting': ('manual-journals-and-close','turn-records-into-a-conclusion','financial-statement-bridge-case'),
    'Fixed assets': ('manual-journals-and-close','turn-records-into-a-conclusion','financial-statement-bridge-case'),
    'Sales': ('o2c','source-to-ledger','o2c-trace-case'),
    'Design Services': ('design-services','follow-design-time-into-billing','design-services-performance-case'),
    'Purchasing': ('p2p','receipt-to-payable','p2p-accrual-settlement-case'),
    'Manufacturing': ('manufacturing','manufacturing-cost-flow','manufacturing-labor-cost-case'),
    'Payroll': ('payroll','follow-hours-into-payroll','workforce-coverage-and-attendance-case'),
    'Planning': ('manufacturing','manufacturing-cost-flow','manufacturing-labor-cost-case'),
    'Shared records': ('o2c','connect-the-records','o2c-trace-case'),
}
SELECT = {
    'SalesOrder':['SalesOrderID','CustomerID','OrderDate'], 'SalesOrderLine':['SalesOrderLineID','SalesOrderID','ItemID'],
    'Shipment':['ShipmentID','SalesOrderID','ShipmentDate'], 'ShipmentLine':['ShipmentLineID','ShipmentID','SalesOrderLineID','QuantityShipped'],
    'SalesInvoice':['SalesInvoiceID','CustomerID','InvoiceDate'], 'SalesInvoiceLine':['SalesInvoiceLineID','SalesInvoiceID','ShipmentLineID','SalesOrderLineID'],
    'CashReceipt':['CashReceiptID','CustomerID','ReceiptDate','Amount'], 'CashReceiptApplication':['CashReceiptApplicationID','CashReceiptID','SalesInvoiceID','ApplicationDate','AppliedAmount'],
    'Account':['AccountID','AccountNumber','AccountType'], 'JournalEntry':['JournalEntryID','EntryType','PostingDate','ReversesJournalEntryID'], 'GLEntry':['GLEntryID','AccountID','SourceDocumentType','SourceDocumentID','PostingDate'],
    'DemandForecast':['DemandForecastID','ItemID','WarehouseID','ForecastWeekStartDate'], 'InventoryPolicy':['InventoryPolicyID','ItemID','WarehouseID','IsActive'],
    'SupplyPlanRecommendation':['SupplyPlanRecommendationID','ItemID','WarehouseID','BucketWeekStartDate','DriverType'],
    'ServiceBillingLine':['ServiceBillingLineID','ServiceEngagementID','SalesInvoiceLineID','BillingPeriodStartDate','BillingPeriodEndDate'],
    'ServiceTimeEntry':['ServiceTimeEntryID','ServiceEngagementID','ServiceEngagementAssignmentID','WorkDate','BillableHours'],
    'PayrollRegister':['PayrollRegisterID','PayrollPeriodID','EmployeeID','CostCenterID','NetPay'],
    'PayrollLiabilityRemittance':['PayrollLiabilityRemittanceID','PayrollPeriodID','RemittanceDate','Amount'],
    'BudgetLine':['BudgetLineID','AccountID','CostCenterID','FiscalYear','Month'],
}
source_text = (ROOT/'docs/reference/schema.md').read_text()
reference_fields = {name: re.findall(r'`([^`]+)`', fields) for name, fields in re.findall(r'^\| `(\w+)` \| [^\n]*? \| ([^\n]+) \|$',source_text,re.M)}
owned = []
for model in MODELS:
    owned += model['primary']
    process,lesson,case = PATHS[model['area']]
    model['processPath']='/docs/processes/'+process
    model['exercisePath']='/docs/learn-and-practice/'+lesson
    model['casePath']='/docs/analytics/cases/'+case
    if model['id']=='cash-allocation': model['exercisePath']='/docs/learn-and-practice/follow-customer-settlement'
    if model['id']=='commercial-terms': model['casePath']='/docs/analytics/cases/product-portfolio-profitability-case'
    if model['id']=='budgets-responsibility':
        model['processPath']='/docs/processes/manual-journals-and-close';model['exercisePath']='/docs/learn-and-practice/turn-records-into-a-conclusion';model['casePath']='/docs/analytics/cases/financial-statement-bridge-case'
    model['tables']=[]
    for table in model['primary']+model['context']:
        used=[]
        for rel in model['relationships']:
            if rel['child']==table: used+=rel['childFields']
            if rel['parent']==table: used+=rel['parentFields']
        available={r[1] for r in columns[table]}
        default=SELECT.get(table,reference_fields.get(table,[pks[table]])[:4])
        fields=list(dict.fromkeys([pks[table]]+used+[name for name in default if name in available]))
        model['tables'].append(dict(name=table,primary=table in model['primary'],pk=pks[table],grain=GRAINS[table],fields=[dict(name=name,label=name+(' (PK)' if name==pks[table] else ' (source)' if name=='SourceDocumentID' else ' (FK)' if name.endswith('ID') else '')) for name in fields]))
    for i,rel in enumerate(model['relationships']): rel['id']='r'+str(i+1)
    model['alt']=model['title']+'. '+model['question']+' Primary tables: '+', '.join(model['primary'])+'. '+model['boundary']
assert len(owned)==len(set(owned))==82

overview=dict(id='company-data-overview',title='Company data areas and shared records',area='Overview',question='Where should you start an investigation, and which records are shared?',
              alt='Nine data areas organize all 82 tables. Sales, Design Services, purchasing, manufacturing, payroll, accounting, fixed assets, planning, and shared master records have focused linked views. The layout groups evidence rather than imposing a company-wide sequence.',
              tables=[],relationships=[],primary=[],context=[],boundary='These are learning areas, not additional database tables or proof of departmental independence.',processPath='/docs/process-flows',exercisePath='/docs/learn-and-practice/meet-the-records',casePath='/docs/analytics/cases/o2c-trace-case')
models=[overview]+MODELS
(ROOT/'src/data/schemaDiagrams.json').write_text(json.dumps(models,indent=2)+'\n')

parser=argparse.ArgumentParser();parser.add_argument('--id',default='');parser.add_argument('--replace',action='store_true');args=parser.parse_args()
for model in models:
    if args.id and model['id'] not in args.id.split(','): continue
    target=ROOT/'static/diagrams/er'/f'{model["id"]}.drawio'
    if target.exists() and not args.replace: continue
    drawing=Drawing(model['id'],model['title'],model['question'],1160)
    if model['id']=='company-data-overview':
        for i,area in enumerate(PATHS):
            group=[m for m in MODELS if m['area']==area];count=sum(len(m['primary']) for m in group)
            drawing.card('area-'+str(i),area,f'{count} primary tables\n{len(group)} focused '+('view' if len(group)==1 else 'views')+'\n\nFind each table in the index below.',25+(i%3)*375,170+(i//3)*290,355,245)
        drawing.write(target,1010,'Choose a process area, then use the table index to find a focused map. Cards are areas of evidence, not a workflow.')
        continue
    tables=model['tables'];positions=model['positions']
    # A two-row reading grid keeps each table editable; per-model positions
    # preserve the selected evidence path. Refine authoritative source cells.
    for i,table in enumerate(tables):
        col,row=positions.get(table['name'],[i%3,i//3])
        table['layout']=(25+col*385,170+row*440)
        drawing.table(table,*table['layout'])
    bottom=max(y+h for x,y,w,h in drawing.boxes.values())
    table_map={t['name']:t for t in tables}
    route_bottom=bottom
    for i,rel in enumerate(model['relationships']):
        a=table_map[rel['parent']];b=table_map[rel['child']]
        source,x1,y1,w1=a['ports'][rel['parentFields'][0]];target_id,x2,y2,w2=b['ports'][rel['childFields'][0]]
        points=None;source_side=1;target_side=0
        if x1==x2:
            source_side=0;target_side=0;channel=x1-28;points=[(channel,y1),(channel,y2)]
        elif x1>x2:
            source_side=0;target_side=1;channel=x1-8;points=[(channel,y1),(channel,y2)]
        else:
            channel=x1+w1+8;points=[(channel,y1),(channel,y2)]
        if abs(x1-x2)>400:
            source_side=1;target_side=0;outside=bottom+60+i*25
            points=[(x1+w1+20,y1),(x1+w1+20,outside),(x2-20,outside),(x2-20,y2)]
            route_bottom=max(route_bottom,outside)
        conditional=rel['kind']!='reference'
        drawing.edge(rel['id'],source,target_id,rel['id'],rel['kind'],points,source_side,target_side,
                     'none' if conditional else 'ERzeroToOne' if rel['optionalParent'] else 'ERmandOne',
                     'open' if conditional else 'ERzeroToMany',attributes={'childTable':rel['child'],'childFields':','.join(rel['childFields']),'parentTable':rel['parent'],'parentFields':','.join(rel['parentFields']),'condition':rel['condition']})
    drawing.write(target,route_bottom+20,
                  '(PK) = primary key. (FK) = foreign key.\nSolid crow’s-foot lines show foreign-key relationships; dashed labeled lines show conditional traces or analytical matches. See r1, r2… in the relationship table.')
    # Ports/layout are authoring-only; leave a stable semantic catalog.
    for table in tables: table.pop('ports',None);table.pop('layout',None)
for model in models: model.pop('positions',None)
(ROOT/'src/data/schemaDiagrams.json').write_text(json.dumps(models,indent=2)+'\n')
print('Catalog:',len(models),'maps;',len(owned),'primary table homes. Sources selected:',args.id or 'all')
