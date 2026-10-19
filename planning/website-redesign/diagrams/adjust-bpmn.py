"""Presentation-only BPMN layout corrections; preserve activities and flow semantics."""
import json
from pathlib import Path
import re
import xml.etree.ElementTree as E

ROOT=Path(__file__).resolve().parents[3]

def style(cell, **values):
    text=cell.get('style','')
    for key,value in values.items():
        text=re.sub(r'(?<![\w])'+re.escape(key)+r'=[^;]*;', '', text)
        text+=key+'='+str(value)+';'
    cell.set('style',text)

def reroute(objects, source, target, points, label_position=None, **styles):
    item=next(o for o in objects.values() if o.get('flowType')=='message' and o.find('mxCell').get('source')==source and o.find('mxCell').get('target')==target)
    cell=item.find('mxCell');style(cell,**styles)
    geo=cell.find('mxGeometry')
    for array in list(geo):geo.remove(array)
    array=E.SubElement(geo,'Array',{'as':'points'})
    for x,y in points:E.SubElement(array,'mxPoint',x=str(x),y=str(y))
    if label_position is not None:geo.set('x',str(label_position))

scopes={
    'order-to-cash':'One goods-fulfillment and customer-cash review pass; demand or balances can remain open.',
    'procure-to-pay':'One selected goods-purchasing path, with receipt, invoice, and payment as distinct events.',
    'manufacturing-conversion':'One work-order production and accounting-close pass; completion makes goods available before close.',
    'design-services':'One selected time classification within an engagement; monthly billing aggregates approved billable time.',
    'payroll':'One payroll period with employee-level net-pay payments and separate period-level remittance obligations.',
    'manual-journals-close':'One reporting-period journal path, with annual closing entries on the year-end branch.',
    'returns-credit-refunds':'One goods-return and customer-credit resolution pass; refund remains optional.',
    'cash-application':'One receipt and allocation review pass, allowing unapplied residual money.',
    'accrual-settlement':'One accrued-service invoice and AP settlement path, with any residual accrual evaluated separately.',
    'manufacturing-variances':'One proposed classroom review of selected work-order cost-close evidence.',
    'process-architecture':'Six independently triggered process scopes; no global sequence or reporting synchronization is implied.',
}
for path in sorted((ROOT/'static/diagrams/bpmn').glob('*.drawio')):
    tree=E.parse(path);objects={o.get('id'):o for o in tree.findall('.//object')}
    for item in objects.values():
        if item.get('bpmnType') in {'task','subprocess','start','messageStart','messageCatch','timerStart','end','exclusive','parallel'}:
            style(item.find('mxCell'),fontSize=16)
    name=path.stem
    if name=='design-services':
        reroute(objects,'bill','customer',[(1418,665),(2065,665),(2065,205),(2020,205)],exitX=.9,exitY=0,entryX=.99,entryY=1)
    elif name=='payroll':
        objects['agency'].find('mxCell/mxGeometry').set('y','960')
        style(objects['agency'].find('mxCell'),horizontal=1,startSize=65)
        objects['scope'].find('mxCell/mxGeometry').set('y','1049')
        reroute(objects,'remit','agency',[(1185,935)],exitX=.5,exitY=1,entryX=.6361,entryY=0)
    elif name=='process-architecture':
        reroute(objects,'customer','services-start',[(185,205),(185,759)],label_position=-.85,exitX=.08056,exitY=1,entryX=0,entryY=.5)
    elif name=='returns-credit-refunds':
        reroute(objects,'pay','customer',[(1645,833),(1645,935),(1870,935),(1870,205),(1820,205)],exitX=1,exitY=.5,entryX=.9889,entryY=1)
    E.indent(tree,space='  ');path.write_text(E.tostring(tree.getroot(),encoding='unicode')+'\n',encoding='utf-8',newline='\n')
file=ROOT/'src/data/bpmnModels.json';models=json.loads(file.read_text())
for m in models:m['instanceScope']=scopes[m['id']]
file.write_text(json.dumps(models,indent=2,ensure_ascii=False)+'\n')
print('Preserved BPMN activities and semantics; corrected four message corridors and enlarged flow labels.')
