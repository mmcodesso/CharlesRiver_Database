"""Author the remaining reviewed explanations as native editable Draw.io maps.

The saved specs preserve the reviewed wording and bridges. Existing geometry is
never replaced unless --replace is explicitly supplied.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sqlite3
from drawio_authoring import Drawing

ROOT=Path(__file__).resolve().parents[3]
DB=ROOT/'outputs/_site_build/CharlesRiver.sqlite'
assert hashlib.sha256(DB.read_bytes()).hexdigest()=='de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c'
db=sqlite3.connect(DB.resolve().as_uri()+'?mode=ro',uri=True);db.execute('PRAGMA query_only=ON')
tables={t:[r[1] for r in db.execute(f'PRAGMA table_info("{t}")')] for t, in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
pks={t:next(r[1] for r in db.execute(f'PRAGMA table_info("{t}")') if r[5]) for t in tables}
grains={t['name']:t['grain'] for m in json.loads((ROOT/'src/data/schemaDiagrams.json').read_text()) for t in m['tables']}
IDs=['weekly-planning','recipe-routing','operation-scheduling','approved-time-register','recurring-journal','overhead-support','service-time-billing','service-demand','service-staffing','service-billing-settlement','goods-purchase-path','purchase-planning','requisition-receipt','goods-settlement-path','pricing-evidence','backorder-context','customer-credit-path','technical-build']
specs=json.loads((Path(__file__).parent/'simple-map-specs.json').read_text())
assert len(specs)==len(IDs)==18
models=[]
for identifier,spec in zip(IDs,specs):
    labels={}
    def capture(m):labels[m[1]]=m[2];return m[1]
    text=re.sub(r'\b([A-Za-z][A-Za-z0-9_]*)\[([^\]]+)\]',capture,spec['notation'])
    edges=[]
    for line in text.splitlines():
        if line.strip().startswith(('accTitle:','accDescr:')):continue
        for match in re.finditer(r'(?=\b([A-Za-z][A-Za-z0-9_]*)\s*(?:-->\s*(?:\|([^|]+)\|\s*)?|-\.\s*(.*?)\s*\.->\s*)([A-Za-z][A-Za-z0-9_]*))',line):
            a,label,dashed,b=match.groups();edges.append(dict(source=a,target=b,label=label or dashed or '',kind='aggregate' if dashed is not None else 'reference'))
    overrides={}
    if identifier.startswith('service-'):
        overrides={'ORDER':['SalesOrderLine'],'SOL':['SalesOrderLine'],'ENG':['ServiceEngagement'],'STAFF':['ServiceEngagementAssignment'],'ASG':['ServiceEngagementAssignment'],'TIME':['ServiceTimeEntry'],'BILL':['ServiceBillingLine'],'INV':['SalesInvoiceLine'],'CASH':['CashReceiptApplication']}
    if identifier=='goods-settlement-path':overrides={'SO':['SalesOrder','SalesOrderLine'],'SH':['Shipment','ShipmentLine'],'SI':['SalesInvoice','SalesInvoiceLine']}
    if identifier=='pricing-evidence':
        overrides={'CTX':[],'SO':['SalesOrderLine']};labels['SO']='SalesOrderLine';labels['PLL']='PriceListLine'
        edges=[e for e in edges if not(e['source']=='PL' and e['target']=='SO')]
        edges += [dict(source='PL',target='PLL',label='PriceListID',kind='reference'),dict(source='PLL',target='SO',label='PriceListLineID',kind='reference')]
    if identifier=='recipe-routing':
        labels['BOML']='BillOfMaterialLine';edges.append(dict(source='BOM',target='BOML',label='BOMID',kind='reference'))
    model=dict(id=identifier,title=spec['title'],question='Which connections use foreign keys, and which supply analytical or business context?',description=spec['description'],page=spec['page'],technical=identifier=='technical-build',nodes=[],relationships=[],boundary='Keep the record grains separate. Foreign-key paths, analytical matches, and business context answer different questions; read the numbered evidence table before joining.')
    if identifier=='technical-build':model.update(question='What order does the local generator follow?',boundary='Technical maintainer workflow. Classroom work begins with the published files; these are build steps, not business transactions.')
    if identifier=='backorder-context':model['boundary']='Conceptual fulfillment branches. Check the actual order-line and shipment-line quantities and dates; the diagram does not identify one receipt-to-shipment inventory lot.'
    for key,label in labels.items():
        normalized=re.sub('[^a-z0-9]','',label.lower());matches=[t for t in tables if re.sub('[^a-z0-9]','',t.lower()) in normalized]
        matches=[t for t in matches if not any(t!=other and t in other for other in matches)]
        matches=overrides.get(key,matches)
        if identifier in ['technical-build','backorder-context'] or key in ['RC','FO','MFG','CTX','CC']:matches=[]
        role='record' if matches else 'workflow step' if model['technical'] else 'business context'
        title=' / '.join(matches) if matches else label
        body='\n'.join(grains[t] for t in matches) if matches else 'Stage '+str(len(model['nodes'])+1) if model['technical'] else 'Context for interpreting the named evidence'
        model['nodes'].append(dict(id=key,title=title,description=body,role=role,tables=matches))
    nodes={n['id']:n for n in model['nodes']}
    for index,edge in enumerate(edges):
        a,b=nodes[edge['source']],nodes[edge['target']];links=[]
        if edge['kind']=='reference':
            for ta in a['tables']:
                for tb in b['tables']:
                    if pks[ta] in tables[tb]:links.append(dict(child=tb,field=pks[ta],parent=ta,parentField=pks[ta]))
                    if pks[tb] in tables[ta]:links.append(dict(child=ta,field=pks[tb],parent=tb,parentField=pks[tb]))
        if edge['kind']=='reference' and not links:edge.update(kind='context',label=edge['label'] or 'Business context; no direct foreign key is depicted')
        if a['tables']==['JournalEntry'] and b['tables']==['GLEntry']:edge.update(kind='posting',sourceTypes=['JournalEntry'],label="SourceDocumentType = 'JournalEntry' plus SourceDocumentID")
        if identifier=='customer-credit-path' and edge['source']=='INV' and edge['target']=='CM':
            links=[dict(child='CreditMemo',field='OriginalSalesInvoiceID',parent='SalesInvoice',parentField='SalesInvoiceID')];edge['kind']='reference'
        if model['technical']:edge.update(kind='workflow',label='Next build stage')
        if identifier=='backorder-context':edge.update(kind='context',label=edge['label'] or 'Fulfillment context')
        edge.update(id='r'+str(index+1),recordLinks=links);model['relationships'].append(edge)
    model['alt']=model['title']+'. '+model['description']+' '+model['boundary']
    model['steps']=[n['title']+' — '+n['role'] for n in model['nodes']];models.append(model)
file=ROOT/'src/data/processEvidenceDiagrams.json';existing=json.loads(file.read_text());file.write_text(json.dumps([m for m in existing if m['id'] not in IDs]+models,indent=2,ensure_ascii=False)+'\n')
parser=argparse.ArgumentParser();parser.add_argument('--replace',action='store_true');args=parser.parse_args()
for model in models:
    target=ROOT/f'static/diagrams/evidence/{model["id"]}.drawio'
    if target.exists() and not args.replace:continue
    drawing=Drawing(model['id'],model['title'],model['question'],1160)
    for index,node in enumerate(model['nodes']):
        drawing.card(node['id'],node['title'],node['description'],25+index%3*385,170+index//3*280,330,220,fill='#e9f1ed' if node['role']=='record' else '#f6f4ee')
    for edge in model['relationships']:drawing.edge(edge['id'],edge['source'],edge['target'],edge['id'],edge['kind'])
    bottom=max(y+h for x,y,w,h in drawing.boxes.values())
    drawing.write(target,bottom+20,'Numbered connectors are explained in the evidence table. Solid lines show foreign-key or posting paths; dashed lines show analytical or business context.' if not model['technical'] else 'Arrows show local build stages. This technical sequence is separate from the business-process learning path.')
print('Authored',len(models),'additional maps; catalog now contains',len(json.loads(file.read_text())),'.')
