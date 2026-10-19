"""Bootstrap purposeful native teaching figures; does not change worked examples."""
import argparse
import json
from pathlib import Path
from drawio_authoring import Drawing

ROOT=Path(__file__).resolve().parents[3]
parser=argparse.ArgumentParser();parser.add_argument('--id',default='');parser.add_argument('--replace',action='store_true');args=parser.parse_args()

KINDS={
 'meet-the-records':'record-columns','read-an-order':'header-lines','connect-the-records':'record-links','source-to-ledger':'record-links',
 'follow-customer-settlement':'allocation','find-the-accounting-entries':'dated-events','follow-design-time-into-billing':'billing-match',
 'receipt-to-payable':'dated-events','manufacturing-cost-flow':'dated-events','follow-hours-into-payroll':'payroll-branches',
 'follow-an-estimate-into-settlement':'accrual-branches','turn-records-into-a-conclusion':'analytical-workflow',
 'case01-handoffs':'responsibilities','case01-relationships':'aggregate-join','case01-timeline':'dated-events',
 'case02-responsibilities':'responsibilities','case02-billing':'billing-match','case02-bridge':'measure-comparison',
 'case03-branches':'two-populations','case03-transitions':'liability-states','case03-timeline':'dated-events',
 'case04-decision':'analytical-workflow','case04-relationships':'support-branches','case04-measures':'measure-comparison','case04-conclusion':'analytical-workflow',
 'case05-planning':'planning-evidence','case05-costs':'cost-events','case05-grains':'aggregate-join','case05-timeline':'parallel-timelines',
 'case06-attendance':'support-layers','case06-grains':'aggregate-join','case06-pay':'pay-cost-branches','case06-settlement':'settlement-branches',
 'case07-statements':'analytical-workflow','case07-rollforward':'balance-equation','case07-close':'dated-events','case07-profit-cash':'measure-comparison','case07-asset':'asset-branches',
 'case08-risk':'analytical-workflow','case08-ap':'analytical-workflow','case08-overtime':'analytical-workflow','case08-finding':'classification','case08-assessment':'assessment-cycle',
}
RULES={
 'record-columns':'Three attributes describe one customer row; they are not three tables or three events.',
 'header-lines':'One selected order header supports two separate line records. Connect each line directly to the header.',
 'record-links':'Match stored foreign keys (FK) while keeping headers, lines, and master records at their own grains.',
 'allocation':'An invoice and an incoming receipt meet through a dated application. Their existence alone does not establish allocation.',
 'dated-events':'Read document dates and accounting effects separately. The timeline does not create additional database relationships.',
 'billing-match':'Match engagement and the inclusive billing period, then aggregate approved billable time. This is distinct from a stored billing-line key on each time entry.',
 'payroll-branches':'Employee-register net pay and period-level remittances have separate grains, source records, and settlement dates.',
 'accrual-branches':'Invoice payment settles AP; a residual-accrual adjustment refers back to the estimate independently of payment.',
 'analytical-workflow':'Arrows show steps in the investigation. Confirm record keys, dates, and scope before interpreting a result.',
 'responsibilities':'Rows show proposed teaching responsibilities. They do not establish employee access independence or control operation.',
 'aggregate-join':'Summarize each many-side independently to the comparison grain before joining; keep other analytical grains separate.',
 'measure-comparison':'These measures are compared side by side. Their different definitions and grains do not form a transaction sequence.',
 'two-populations':'Goods and accrued services follow separate evidence paths. Compare their obligations without joining their populations together.',
 'liability-states':'Distinguish pre-invoice obligations, accounts payable, payment, and any independent residual-accrual adjustment.',
 'support-branches':'A billed line has several kinds of supporting context. Foreign keys, approval validity, and cost assumptions answer different questions.',
 'planning-evidence':'Planning and schedules describe intended activity; dated issue, completion, and close records establish execution.',
 'cost-events':'Material issue, standard-cost completion, and variance close have distinct account effects and evidence populations.',
 'parallel-timelines':'Compare work orders on parallel dated tracks. Finished-goods availability and accounting close are different milestones.',
 'support-layers':'Roster expectations, observations, approved time, and payroll supply different evidence; reconcile their grains and linked keys.',
 'pay-cost-branches':'Employee deductions explain net pay. Employer taxes and benefits add separate cost and obligations.',
 'settlement-branches':'Employee net-pay payments and period-level liability remittances settle separate obligations; neither proves the other is complete.',
 'balance-equation':'Opening balance plus in-scope movement equals closing balance. State the cutoff and treatment of closing entries.',
 'asset-branches':'Asset acquisition and financing lead to separate depreciation and debt-service evidence; separate principal from interest.',
 'classification':'An investigation can reach several defensible classifications. A query flag alone does not determine the conclusion.',
 'assessment-cycle':'This is a proposed classroom assessment cycle. Preserve its population and denominator when repeating the assessment.',
}

def cards(drawing,model,positions,headings=None,height=240):
    if 'nodes' in model and isinstance(model['nodes'][0],str):
        texts=[text.replace('|','\n\n',1) for text in model['nodes']]
    else:texts=model['steps']
    for i,(x,y) in enumerate(positions):
        if headings:
            title=headings[i];body=texts[i]
        elif '\n\n' in texts[i]:title,body=texts[i].split('\n\n',1)
        else:title=['Evidence','Comparison','Interpretation'][i];body=texts[i]
        drawing.card('n'+str(i),title,body,x,y,330,height)

def line(drawing,identifier,a,b,label='',kind='context',points=None,source_side=1,target_side=0):
    drawing.edge(identifier,a,b,label,kind,points,source_side,target_side)

def figure(family, model):
    drawing=Drawing(model['id'],model['question'],model['readingRule'],1160)
    if model['id']=='connect-the-records':
        drawing.card('n0','Customer','CustomerID (PK) 130\nJones, Richardson and Beard',25,170,330,170)
        drawing.card('n1','SalesOrder header','SalesOrderID (PK) 11\nFK CustomerID 130',410,170,330,170)
        drawing.card('n2','Item','ItemID (PK) 222\nBrookside Dining Table\nSupplyMode Manufactured',795,445,330,190)
        drawing.card('line','SalesOrderLine example','SalesOrderLineID (PK) 43\nFK SalesOrderID 11\nFK ItemID 222',410,445,330,190)
        drawing.edge('e0','n1','n0','r1',source_side=0,target_side=1)
        drawing.edge('e1','line','n1','r2',points=[(770,540),(770,255)],source_side=1,target_side=1)
        drawing.edge('e2','line','n2','r3')
        drawing.write(ROOT/f'static/diagrams/{family}/{model["id"]}.drawio',660,'r1 CustomerID; r2 SalesOrderID; r3 ItemID. The customer key belongs to the order header.\nArrows point from a stored reference to its referenced record; they do not describe chronology.')
        return
    if model['id']=='case01-relationships':
        for key,title,body,x,y in [
            ('n0','Applications','CashReceiptApplication\nMany dated allocations per invoice',25,170),
            ('n1','Credits','CreditMemo\nUse OriginalSalesInvoiceID and the cutoff',25,465),
            ('applications-summary','Application summary','One row per SalesInvoiceID\nSum only in-scope AppliedAmount',410,170),
            ('credits-summary','Credit summary','One row per original invoice\nSum only in-scope credit amounts',410,465),
            ('n2','Invoice population','SalesInvoice\nOne row per invoice\nCompare amounts after both summaries',795,310)]:
            drawing.card(key,title,body,x,y,330,200)
        drawing.edge('e0','n0','applications-summary','sum',kind='aggregate')
        drawing.edge('e1','n1','credits-summary','sum',kind='aggregate')
        drawing.edge('e2','applications-summary','n2','join',points=[(765,270),(765,390)])
        drawing.edge('e3','credits-summary','n2','join',points=[(765,565),(765,430)])
        drawing.write(ROOT/f'static/diagrams/{family}/{model["id"]}.drawio',700,'Summarize each many-side independently before joining. Receipt amounts can repeat on application rows.\nThe arrows describe an analytical workflow, not additional stored foreign keys or a payment sequence.')
        return
    kind=model['layoutKind']
    target=ROOT/f'static/diagrams/{family}/{model["id"]}.drawio'
    if kind=='liability-states':
        drawing.card('n0','Before a supplier bill',model['steps'][0],25,170,330,235)
        drawing.card('n1','Accounts payable',model['steps'][1],410,170,330,235)
        drawing.card('n2','Cash payment','Payment clears the invoiced AP amount.',795,170,330,235)
        drawing.card('adjustment','Residual-estimate adjustment','For an accrued service, compare the original estimate with the supported invoice amount. A linked adjustment clears any unused estimate separately.',25,535,715,215)
        line(drawing,'recognition','n0','n1','invoice','context')
        line(drawing,'settlement','n1','n2','payment','context')
        line(drawing,'estimate-adjustment','n0','adjustment','estimate difference','context',[(5,285),(5,642)],0,0)
        drawing.write(target,790,model['readingRule']);return
    if kind=='asset-branches':
        drawing.card('n0','Asset acquisition',model['steps'][0],25,170,330,250)
        drawing.card('n1','Financing',model['steps'][1],410,170,330,250)
        drawing.card('n2','Depreciation','Periodic asset-use expense and accumulated depreciation; inspect the asset event and linked journal.',25,535,330,245)
        drawing.card('debt-service','Debt service','Debt installments separate principal reduction from interest. Inspect the agreement, schedule, and linked journal.',795,535,330,245)
        line(drawing,'finance','n0','n1','replace AP','context')
        line(drawing,'asset-use','n0','n2','asset use','context',[(5,295),(5,657)],0,0)
        line(drawing,'debt-service-link','n1','debt-service','installments','context',[(765,295),(765,657)])
        drawing.write(target,820,model['readingRule']);return
    if kind=='aggregate-join' and model['id']=='case05-grains':
        sources=[('Issues','MaterialIssue and lines'),('Labor','LaborTimeEntry'),('Completions','ProductionCompletion and lines'),('Close','WorkOrderClose')]
        for i,(label,table) in enumerate(sources):
            y=170+i*250
            drawing.card('n'+str(i) if i<3 else 'close',label,table+'\nMany-side evidence',25,y,330,185)
            drawing.card('summary-'+str(i),'One work-order summary','Group independently by WorkOrderID\nRetain the selected cutoff',410,y,330,185)
            line(drawing,'sum-'+str(i),'n'+str(i) if i<3 else 'close','summary-'+str(i),'sum','aggregate')
            line(drawing,'join-'+str(i),'summary-'+str(i),'cohort','join','reference',[(765,y+92),(765,580)])
        drawing.card('cohort','Fixed work-order population','336-order cohort\nJoin one-row summaries by WorkOrderID',795,480,330,230)
        drawing.text('capacity','Daily work-center capacity remains a separate center/date analysis.',25,1180,1080,55,20)
        drawing.write(target,1240,model['readingRule']);return
    if kind=='responsibilities':
        headings=['Sales / scope','Operations / evidence','Finance / interpretation'] if model['caseNumber']==1 else ['Design lead','Staff and approval','Billing and controller']
        for i,text in enumerate(model['steps']):
            drawing.vertex('n'+str(i),headings[i],25,170+i*195,1100,165,'swimlane;horizontal=0;startSize=210;collapsible=0;fillColor=#e9f1ed;swimlaneFillColor=#FFFFFF;')
            drawing.text('responsibility-'+str(i),text,265,200+i*195,810,105,20)
        drawing.write(target,770,model['readingRule']);return
    if kind=='parallel-timelines':
        drawing.card('n0','Work order 1','Completion and close',25,170,220,170)
        drawing.card('n1','Work order 67','Completion and close',25,435,220,170)
        drawing.card('complete-1','26 January','Finished goods complete',300,170,240,170)
        drawing.card('close-1','1 February','Accounting close',570,170,240,170)
        drawing.card('complete-67','7 February','Finished goods complete',570,435,240,170)
        drawing.card('close-67','13 February','Accounting close',840,435,240,170)
        line(drawing,'time-1','complete-1','close-1','6 days','chronology')
        line(drawing,'time-67','complete-67','close-67','6 days','chronology')
        drawing.card('n2','Cohort at 29 February',model['steps'][2],25,700,1100,150)
        drawing.write(target,890,'Chronological arrows show elapsed time, not stored keys. The tracks separate completion from financial close.\n'+model['readingRule']);return
    if kind=='allocation':
        # The invoice predates the selected receipt; the two references converge.
        texts=[model['nodes'][0],model['nodes'][1],model['nodes'][2]]
        for index,x,y in [(2,25,170),(0,25,480),(1,795,325)]:
            title,body=texts[index].split('|',1)
            if index==2:body+='\nInvoice date: 31 January 2024'
            drawing.card('n'+str(index),title,body,x,y,330,225)
        line(drawing,'receipt-link','n0','n1','Receipt key','reference',[(580,592),(580,450)])
        line(drawing,'invoice-link','n2','n1','Invoice key','reference',[(580,282),(580,400)])
        drawing.write(target,745,model['readingRule']);return
    if kind=='accrual-branches':
        cards(drawing,model,[(25,170),(410,170),(410,510)],height=240)
        drawing.card('payment','AP payment','Supplier paid on 20 May\nPayment settles the invoice payable',795,170,330,240)
        line(drawing,'r1','n0','n1','r1','reference')
        line(drawing,'r2','n1','payment','r2','reference')
        line(drawing,'r3','n2','n0','r3','reference',[(385,630),(-5,630),(-5,290)],0,0)
        drawing.write(target,790,'r1 AccrualJournalEntryID; r2 supplier invoice payment; r3 ReversesJournalEntryID.\n'+model['readingRule']);return
    if kind=='payroll-branches':
        cards(drawing,model,[(25,170),(410,170),(795,170)],height=240)
        # Replace the mixed settlement card with explicitly separate populations.
        third=next(o for o in drawing.root.findall('object') if o.get('id')=='n2')
        third.set('label','Employee net-pay payment\n\nPayrollPayment 96\n19 January 2024\n1,578.34 paid')
        drawing.card('remittances','Period 1 remittances','Three separate remittances\n26, 29, and 31 January\nPeriod-level obligations',795,515,330,220)
        line(drawing,'hours-register','n0','n1','match','aggregate')
        line(drawing,'register-payment','n1','n2','key','reference')
        line(drawing,'period-remittance','n1','remittances','period','aggregate',[(765,290),(765,625)])
        drawing.write(target,770,model['readingRule']);return
    if kind=='classification':
        cards(drawing,model,[(25,170),(410,170),(795,170)],['Query flag','Supporting investigation','Classification'],height=270)
        line(drawing,'investigate','n0','n1','review')
        line(drawing,'classify','n1','n2','assess')
        outcomes=['Supported exception','Explained circumstance','Unresolved evidence','No exception under the test']
        for i,title in enumerate(outcomes):
            drawing.card('outcome-'+str(i),title,'Retain the evidence and reasoning',25+i*285,570,260,160)
            line(drawing,'choice-'+str(i),'n2','outcome-'+str(i),'','context',[(1145,460),(155+i*285,460)],1,1)
        drawing.write(target,775,model['readingRule']);return
    if kind=='measure-comparison' or kind=='record-columns':
        cards(drawing,model,[(25,170),(410,170),(795,170)],None if family=='tutorials' else ['Measure and definition','Separate comparison','Scope and interpretation'],height=300)
        drawing.write(target,510,model['readingRule']);return
    if kind in ['header-lines','settlement-branches','pay-cost-branches','support-branches','two-populations','asset-branches']:
        merge=kind=='two-populations'
        positions=[(25,170),(25,535),(795,350)] if merge else [(25,350),(795,170),(795,535)]
        heads={'settlement-branches':['Recognized obligations','Employee net pay','Agency / provider remittances'],
               'pay-cost-branches':['Gross earnings','Employee deductions and net pay','Employer cost and liabilities'],
               'support-branches':['Billed invoice line','Commercial support','Product and cost context']}
        cards(drawing,model,positions,None if family=='tutorials' else ['Goods population','Service population','Compare obligations'] if merge else heads.get(kind,['Starting evidence','First branch','Separate branch']),height=260)
        if merge:
            line(drawing,'e0','n0','n2','goods','context',[(580,300),(580,440)])
            line(drawing,'e1','n1','n2','services','context',[(580,665),(580,520)])
        else:
            line(drawing,'e0','n0','n1','branch','context',[(580,480),(580,300)])
            line(drawing,'e1','n0','n2','branch','context',[(580,480),(580,665)])
        drawing.write(target,835,model['readingRule']);return
    if kind in ['support-layers','planning-evidence','cost-events']:
        cards(drawing,model,[(25,170),(410,485),(795,800)],['Context and support','Distinct evidence','Accounting or interpretation'],height=250)
        line(drawing,'e0','n0','n1','review','aggregate',[(380,295),(380,610)])
        line(drawing,'e1','n1','n2','review','aggregate',[(765,610),(765,925)])
        drawing.write(target,1090,model['readingRule']);return
    cards(drawing,model,[(25,170),(410,170),(795,170)],None if family=='tutorials' else ['Starting evidence','Comparison','Interpretation'],height=280)
    if kind=='balance-equation':
        drawing.text('plus','+',360,290,45,45,30,True);drawing.text('equals','=',745,290,45,45,30,True)
    elif kind=='dated-events':
        drawing.text('time-axis','Time / reporting context →     Read each stated date and cutoff; arrows here do not identify stored keys.',25,490,1100,60,20)
    else:
        link_kind='aggregate' if kind in ['billing-match','aggregate-join'] else 'context' if kind in ['analytical-workflow','assessment-cycle'] else 'reference'
        line(drawing,'e0','n0','n1','r1',link_kind);line(drawing,'e1','n1','n2','r2','reference' if kind=='billing-match' else link_kind)
        if kind=='assessment-cycle':line(drawing,'repeat','n2','n0','Repeat assessment','context',[(1145,310),(1145,520),(5,520),(5,310)],1,0)
    drawing.write(target,570 if kind in ['dated-events','assessment-cycle'] else 490,model['readingRule'])

for family, name in [('tutorials','tutorialFigures'),('cases','caseFigures')]:
    file=ROOT/f'src/data/{name}.json';models=json.loads(file.read_text())
    for model in models:
        if model['id']=='connect-the-records':
            model['layoutKind']='Selected-record relationship map'
            model['readingRule']='Keep the order header and order line at separate grains. Match each foreign key to its primary key.'
        elif model['id']=='case01-relationships':
            model['layoutKind']='Independent aggregation and join map'
            model['readingRule']='Keep application and credit populations separate until each is summarized by invoice.'
        if model['id'] not in KINDS:raise ValueError(model['id'])
        model['layoutKind']=KINDS[model['id']]
        model['readingRule']=RULES[model['layoutKind']]
        if args.id and model['id'] not in args.id.split(','): continue
        target=ROOT/f'static/diagrams/{family}/{model["id"]}.drawio'
        if target.exists() and not args.replace:continue
        figure(family,model)
    file.write_text(json.dumps(models,indent=2,ensure_ascii=False)+'\n')
