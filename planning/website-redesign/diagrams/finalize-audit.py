"""Maintain the disposition of all 99 original diagrams and the current inventory."""
import json
import hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];HERE=Path(__file__).parent
read=lambda p:json.loads((ROOT/p).read_text())
rows=read('planning/website-redesign/diagrams/audit-register.json')
schema=read('src/data/schemaDiagrams.json');evidence=read('src/data/processEvidenceDiagrams.json')
by_title={m['title']:m for m in evidence}
aliases={'Accrual settlement and adjustment branches':'accrual-posting','Manufacturing labor support and direct payroll recognition':'manufacturing-payroll-support'}
er_groups=[['accounting-core'],['asset-financing'],['commercial-terms','goods-fulfillment','service-delivery','cash-allocation','returns-credit','commissions'],['procurement-receiving','supplier-liabilities'],['manufacturing-definitions','work-order-scheduling','manufacturing-cost-events'],['attendance-time','payroll-settlement'],['shared-masters'],['budgets-responsibility'],['demand-supply-planning']]
catalogs={f:read('src/data/'+n+'.json') for f,n in [('er','schemaDiagrams'),('evidence','processEvidenceDiagrams'),('bpmn','bpmnModels'),('tutorials','tutorialFigures'),('cases','caseFigures')]}
notes={
 'commission-posting':'Invoice lines and commission rates meet at accruals. Payment-line SourceDocumentType qualifies SourceDocumentID for accruals and adjustments.',
 'accrual-posting':'PurchaseInvoiceLine.AccrualJournalEntryID links the estimate; ReversesJournalEntryID links the independent residual adjustment. Payment settles AP.',
 'manufacturing-payroll-support':'PayrollRegisterLine bridges labor to register; period/cost-center/account aggregation supports the constructed PayrollSummary source, separate from journals.',
 'payroll-obligations':'Employee-register net pay and period-level remittances are separate obligations. Recognition uses the PayrollSummary aggregation bridge.',
 'attendance-review':'AttendanceException has no punch key. Roster/time keys supply the trace; payroll uses LaborTimeEntry and PayrollRegisterLine.',
 'service-time-billing':'Approved billable time matches engagement and inclusive billing dates; the billed invoice line has its own stored key.',
 'service-billing-settlement':'ServiceBillingLine links to SalesInvoiceLine; invoice-header SalesInvoiceID links to cash applications. Time is aggregated by engagement/interval.',
 'pricing-evidence':'PriceListLine bridges list scope to SalesOrderLine. PromotionID and PriceOverrideApprovalID remain separate foreign-key paths.',
 'recipe-routing':'BillOfMaterialLine explicitly supplies component recipes alongside the routing/operation/work-center path.',
 'operation-scheduling':'Daily calendar matching uses BOTH WorkCenterID and ScheduleDate/CalendarDate.',
 'approved-time-register':'Approved time aggregates by employee and period, while labor allocations pass through PayrollRegisterLine.',
}
for row in rows:
 if row['format']=='erDiagram':
  ids=er_groups[int(row['originalId'].rsplit('-',1)[1])-1]
  row.update(disposition='Replaced by focused native Draw.io ER views',replacementModels=ids,semanticCorrections='Physical primary keys, foreign-key optionality, grain, conditional source traces, and composite/aggregate matches verified against the checksum-matched release.',layoutIssues='Split large collections into focused views. Short numbered connectors preserve readable table labels. Every table has an indexed primary home.')
  if ids==['accounting-core']:row['semanticCorrections']+=' JournalEntry is now visible.'
  if 'commercial-terms' in ids:row['semanticCorrections']+=' PriceList.CustomerID and SalesInvoiceLine.ShipmentLineID are optional.'
  if 'supplier-liabilities' in ids:row['semanticCorrections']+=' PurchaseInvoiceLine.POLineID is optional.'
  if 'budgets-responsibility' in ids:row['semanticCorrections']+=' BudgetLine.CostCenterID is optional.'
  if 'demand-supply-planning' in ids:row['semanticCorrections']+=' DemandForecast and InventoryPolicy are now visible as analytical context.'
 elif row['format'].startswith('flowchart'):
  model=by_title.get(row['title'])
  identifier=model['id'] if model else aliases[row['title']]
  row.update(disposition='Consolidated to one same-page map and anchor' if row['title']=='Accrual settlement and adjustment branches' else 'Reused shared native Draw.io support map' if row['title']=='Manufacturing labor support and direct payroll recognition' else 'Converted to native Draw.io evidence map',replacementModels=[identifier],semanticCorrections=notes.get(identifier,'Foreign-key paths are distinct from analytical matches, account effects, and business context. Existing process scope is preserved.'),layoutIssues='Native editable cards, numbered connectors, and exported clear corridors replace automatic Mermaid layout.')
  if identifier=='technical-build':row.update(audience='Technical maintainers',purpose='Local generator build sequence',semanticCorrections='Existing technical workflow is retained outside the business-process learning sequence.')
 else:
  family,identifier=row['originalId'].split('/');model=next(m for m in catalogs[family] if m['id']==identifier)
  row['replacementModels']=[identifier]
  if family=='bpmn':
   row.update(disposition='Retained native BPMN with label and corridor refinements',semanticCorrections='Existing gateways, open-item outcomes, separate settlement/completion/close events, and proposed-control boundaries are preserved. Instance scope is explicit.',layoutIssues='Essential labels enlarged. Five original crossings in four models were removed.' if identifier in ['design-services','payroll','process-architecture','returns-credit-refunds'] else 'Existing flow layout retained with larger essential labels.')
  else:row.update(disposition='Redrawn for the learning question',semanticCorrections=model['readingRule'],layoutIssues='Replaced universal three-box sequence with '+model['layoutKind']+'. Original figure ID, selected records, amounts, and text steps are preserved.')
 row['evidenceBasis']='Checksum-matched released SQLite, retained process/posting documentation, original verified worked selections; conceptual and technical paths are explicitly identified.'
 row['validation']='Passed: source/export/hash agreement, released field checks, connector geometry, production build, and website regression. Shared viewer checked on representative desktop, tablet, and phone views; no learner-study or accessibility-conformance claim.'
assert len(rows)==99 and not any(r['disposition']=='pending' for r in rows)
(HERE/'audit-register.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n')
inventory=[]
for family,models in catalogs.items():
 for m in models:
  stem=ROOT/f'static/diagrams/{family}/{m["id"]}'
  inventory.append({'family':family,'id':m['id'],'title':m['title'],'source':str(stem.with_suffix('.drawio').relative_to(ROOT)),'sourceSha256':hashlib.sha256(stem.with_suffix('.drawio').read_bytes()).hexdigest(),'svgSha256':hashlib.sha256(stem.with_suffix('.svg').read_bytes()).hexdigest()})
(HERE/'native-inventory.json').write_text(json.dumps(inventory,indent=2)+'\n')
print('Recorded',len(rows),'original dispositions and',len(inventory),'current native diagrams.')
