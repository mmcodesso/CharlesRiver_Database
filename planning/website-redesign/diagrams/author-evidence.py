"""Bootstrap complex evidence maps from reviewed source, with explicit bridge corrections."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import subprocess
from drawio_authoring import Drawing

ROOT=Path(__file__).resolve().parents[3]
BASE=json.loads((Path(__file__).parent/'baseline.json').read_text())['sourceCommit']
assert hashlib.sha256((ROOT/'outputs/_site_build/CharlesRiver.sqlite').read_bytes()).hexdigest()=='de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c'
db=sqlite3.connect((ROOT/'outputs/_site_build/CharlesRiver.sqlite').resolve().as_uri()+'?mode=ro',uri=True);db.execute('PRAGMA query_only=ON')
tables={name:[r[1] for r in db.execute(f'PRAGMA table_info("{name}")')] for name, in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
pks={name:next(r[1] for r in db.execute(f'PRAGMA table_info("{name}")') if r[5]) for name in tables}
SELECT={
 'Connections across six Charles River processes':'company-dependencies',
 'Accrual invoice adjustment and payment evidence':'accrual-posting',
 'Manufacturing records around one work order':'work-order-evidence',
 'Purchased component support and subsequent material issue':'component-availability',
 'Operational labor evidence and payroll cost support':'manufacturing-payroll-support',
 'Separate completion and close branches of a work order':'completion-close',
 'Sales commission accrual adjustment and payment':'commission-posting',
 'Customer order shipment invoice and ledger':'goods-posting',
 'Receipt to unapplied money and invoice application':'cash-posting',
 'Return credit and refund accounting evidence':'returns-posting',
 'Receipt invoice and ledger evidence':'receipt-invoice-posting',
 'Supplier invoice payable and disbursement':'supplier-settlement-posting',
 'Approved time employee payroll and period remittances':'payroll-evidence',
 'Roster punch and approval support for daily time':'attendance-evidence',
 'Employee net pay and other payroll-liability settlement':'payroll-obligations',
 'Attendance evidence exceptions and payroll':'attendance-review',
}
ALIASES={
 'Accrual settlement and adjustment branches':'accrual-posting',
 'Manufacturing labor support and direct payroll recognition':'manufacturing-payroll-support',
}
def parse(block):
    nodes={}
    def capture(m):nodes[m[1]]=m[2];return m[1]
    text=re.sub(r'\b([A-Za-z][A-Za-z0-9_]*)\[([^\]]+)\]',capture,block)
    edges=[]
    for line in text.splitlines():
        if line.strip().startswith(('accTitle:','accDescr:')):continue
        for match in re.finditer(r'(?=\b([A-Za-z][A-Za-z0-9_]*)\s*(?:-->\s*(?:\|([^|]+)\|\s*)?|-\.\s*(.*?)\s*\.->\s*)([A-Za-z][A-Za-z0-9_]*))',line):
            a,label,dashed,b=match.groups();edges.append(dict(source=a,target=b,label=label or dashed or '',kind='aggregate' if dashed is not None else 'reference'))
    return nodes,edges

def add(nodes,edges,a,b,label='',kind='reference'):
    edges.append(dict(source=a,target=b,label=label,kind=kind))

models=[];placements=[]
for page in ['docs/learn-the-business/process-flows.md']+['docs/processes/'+name+'.md' for name in ['manual-journals-and-close','manufacturing','o2c','p2p','payroll']]:
    source=subprocess.check_output(['git','show',BASE+':'+page],cwd=ROOT,text=True)
    for block in re.findall(r'```mermaid\n(.*?)\n```',source,re.S):
        title=re.search(r'accTitle:\s*(.*)',block).group(1)
        if title not in SELECT and title not in ALIASES:continue
        identifier=SELECT.get(title,ALIASES.get(title));placements.append(dict(page=page,title=title,modelId=identifier))
        if title in ALIASES:continue
        labels,edges=parse(block)
        description=re.search(r'accDescr:\s*(.*)',block).group(1)
        if identifier=='company-dependencies':
            for edge in edges:edge['kind']='context';edge['label']=edge['label'] or 'Information and accounting context'
        if identifier=='commission-posting':
            labels['PL']='SalesCommissionPaymentLine'
            edges=[e for e in edges if (e['source'],e['target']) not in [('SI','RATE'),('ACC','PAY'),('ADJ','PAY')]]
            add(labels,edges,'SI','ACC');add(labels,edges,'ACC','PL',"SourceDocumentType = 'SalesCommissionAccrual'",'conditional')
            add(labels,edges,'ADJ','PL',"SourceDocumentType = 'SalesCommissionAdjustment'",'conditional');add(labels,edges,'PL','PAY')
        if identifier=='component-availability':
            labels['PO']='PurchaseOrderLine';labels['GR']='GoodsReceiptLine'
        if identifier=='attendance-evidence':
            for e in edges:
                if (e['source'],e['target'])==('ESA','ESR'):
                    e.update(kind='aggregate',label='Match employee and shift over assignment effective dates; no stored assignment ID on roster')
        if identifier=='returns-posting':
            for e in edges:
                if (e['source'],e['target'])==('CM','RF'):
                    e.update(kind='reference',label='CreditMemoID; a refund is a separate optional cash event')
            description='Stored line and header references connect return evidence to credit and optional refund records. Return, credit memo, and refund each have an independent type-qualified posting route.'
        if identifier=='payroll-evidence':
            for e in edges:
                if (e['source'],e['target'])==('PUNCH','TIME'):
                    e.update(kind='reference',label='TimeClockEntryID; raw punches support review of approved time')
        if identifier=='attendance-review':
            labels.update(LTE='LaborTimeEntry',PRL='PayrollRegisterLine')
            edges=[e for e in edges if (e['source'],e['target']) not in [('TCP','AE'),('TCE','PR')]]
            add(labels,edges,'TCE','LTE');add(labels,edges,'LTE','PRL');add(labels,edges,'PRL','PR')
        if identifier=='payroll-obligations':
            labels.update(PS='PayrollSummary source label',PP='PayrollPeriod',NET='Calculated employee net pay',TAX='Calculated tax and benefit obligations')
            edges=[dict(source=a,target=b,label=label,kind=kind) for a,b,label,kind in [
                ('PR','PAY','Employee-register payment','reference'),('PR','PP','PayrollPeriodID','reference'),('PP','REM','Period-level remittance','reference'),
                ('PR','NET','Register measure','aggregate'),('PR','TAX','Register measure','aggregate'),('PR','PS','Aggregate by period, cost center, and account','aggregate'),
                ('PS','GL','PayrollSummary type and constructed ID','posting'),('PAY','GL','PayrollPayment type and ID','posting'),('REM','GL','PayrollLiabilityRemittance type and ID','posting')]]
        model=dict(id=identifier,title=title,question=title+'?',description=description,page=page,nodes=[],relationships=[],
                   boundary='Read each numbered connector with its evidence explanation. Reference paths are not a time sequence; analytical support and account effects do not create additional stored keys.')
        if identifier=='company-dependencies':model['boundary']='This is a conceptual dependency map of six business processes, not a serial company-wide workflow or a diagram of foreign keys.'
        for key,label in labels.items():
            normalized=re.sub(r'[^a-z0-9]','',label.lower())
            matches=[t for t in tables if re.sub(r'[^a-z0-9]','',t.lower()) in normalized]
            # A named line/header is more precise than an incidental prefix.
            matches=[t for t in matches if not any(t!=other and t in other and other in matches for other in matches)]
            if identifier=='company-dependencies':matches=[]
            if key in ['PS','DEP','AP','NET','TAX','CC','FG','BO','CTX']:matches=[]
            if identifier=='goods-posting':
                matches={'C':['Customer'],'SO':['SalesOrder','SalesOrderLine'],'SH':['Shipment','ShipmentLine'],'SI':['SalesInvoice','SalesInvoiceLine'],'GL':['GLEntry']}.get(key,matches)
            role='record' if matches else 'source label' if key=='PS' else 'account effect' if key in ['DEP','AP','NET','TAX','CC'] else 'business context'
            body=' / '.join(matches) if matches else 'Constructed posting identifier; not a table' if key=='PS' else 'Interpret with the accompanying process explanation'
            if role=='record':body='Record evidence\nCheck row grain and keys in the ER view'
            model['nodes'].append(dict(id=key,title=label,role=role,tables=matches,description=body))
        node_map={n['id']:n for n in model['nodes']}
        for index,edge in enumerate(edges):
            a=node_map[edge['source']];b=node_map[edge['target']]
            evidence=[]
            if identifier!='company-dependencies' and edge['kind']=='reference':
                for ta in a['tables']:
                    for tb in b['tables']:
                        if pks[ta] in tables[tb]:evidence.append(dict(child=tb,field=pks[ta],parent=ta,parentField=pks[ta]))
                        if pks[tb] in tables[ta]:evidence.append(dict(child=ta,field=pks[tb],parent=tb,parentField=pks[tb]))
            posting=b['tables']==['GLEntry'] and (a['tables'] or a['id']=='PS')
            if posting:
                source_types=[t for t in a['tables'] if t in {r[0] for r in db.execute('SELECT DISTINCT SourceDocumentType FROM GLEntry')}]
                if a['id']=='PS':source_types=['PayrollSummary']
                if source_types:
                    edge['kind']='posting';edge['label']='GLEntry source type '+', '.join(source_types)+' and source ID'
                    edge['sourceTypes']=source_types
            if edge['kind']=='reference' and not evidence:
                edge['kind']='context';edge['label']=edge['label'] or 'Conceptual support; consult the detailed keys before joining'
            if identifier=='accrual-posting' and (edge['source'],edge['target'])==('EST','LINE'):
                edge['kind']='reference'
                evidence=[dict(child='PurchaseInvoiceLine',field='AccrualJournalEntryID',parent='JournalEntry',parentField='JournalEntryID')]
            if b['role']=='account effect':edge['kind']='context'
            edge['id']='r'+str(index+1);edge['recordLinks']=evidence
            if edge['kind']=='conditional':
                origin_table=a['tables'][0] if a['tables'] else ''
                edge['conditionalTrace']=dict(child='SalesCommissionPaymentLine',field='SourceDocumentID',parent=origin_table,parentField=pks[origin_table],condition=edge['label'])
            model['relationships'].append(edge)
        model['alt']=model['title']+'. '+model['description']+' '+model['boundary']
        model['steps']=[n['title']+' — '+n['role'] for n in model['nodes']]
        models.append(model)
assert len(models)==16 and len(placements)==18,(len(models),len(placements))
catalog=ROOT/'src/data/processEvidenceDiagrams.json'
extra=[m for m in json.loads(catalog.read_text()) if m['id'] not in {row['id'] for row in models}] if catalog.exists() else []
catalog.write_text(json.dumps(models+extra,indent=2,ensure_ascii=False)+'\n')
(Path(__file__).parent/'evidence-placements.json').write_text(json.dumps(placements,indent=2)+'\n')

parser=argparse.ArgumentParser();parser.add_argument('--replace',action='store_true');args=parser.parse_args()
for model in models:
    target=ROOT/'static/diagrams/evidence'/f'{model["id"]}.drawio'
    if target.exists() and not args.replace:continue
    drawing=Drawing(model['id'],model['title'],'Follow the numbered connectors with the evidence table below the diagram.',1160)
    for index,node in enumerate(model['nodes']):
        col=index%3;row=index//3
        drawing.card(node['id'],node['title'],node['role'].capitalize()+'\n'+node['description'],25+col*385,170+row*280,330,220,
                     fill='#e9f1ed' if node['role']=='record' else '#edf1f5' if node['role']=='source label' else '#f6f4ee')
    for edge in model['relationships']:
        drawing.edge(edge['id'],edge['source'],edge['target'],edge['id'],edge['kind'])
    bottom=max(y+h for x,y,w,h in drawing.boxes.values())
    drawing.write(target,bottom+20,'Solid numbered connectors identify reference or posting paths. Dashed connectors identify analytical, conditional, or business context.\nRead r1, r2… in the evidence table before choosing a join, a date boundary, or an accounting interpretation.')
print('Authored',len(models),'evidence maps for',len(placements),'reviewed placements.')
