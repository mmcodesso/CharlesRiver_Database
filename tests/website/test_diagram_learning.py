"""Published diagram claims, editable exports, and connector geometry."""
import hashlib
import json
from pathlib import Path
import sqlite3
import sys
import xml.etree.ElementTree as E

import pytest
from release_database import select_release_database

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'planning/website-redesign/diagrams'))
from diagram_geometry import read, crossing_pairs, collisions
SCHEMA=json.loads((ROOT/'src/data/schemaDiagrams.json').read_text())
EVIDENCE=json.loads((ROOT/'src/data/processEvidenceDiagrams.json').read_text())
CATALOGS={'er':SCHEMA,'evidence':EVIDENCE,**{f:json.loads((ROOT/f'src/data/{n}.json').read_text()) for f,n in [('bpmn','bpmnModels'),('tutorials','tutorialFigures'),('cases','caseFigures')]}}
PAIRS=[(family,m) for family,models in CATALOGS.items() for m in models]

@pytest.fixture(scope='module')
def release():
    path=select_release_database()
    assert hashlib.sha256(path.read_bytes()).hexdigest()=='de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c'
    db=sqlite3.connect(path.resolve().as_uri()+'?mode=ro',uri=True);db.execute('PRAGMA query_only=ON')
    yield db
    db.close()


def test_every_table_has_exactly_one_indexed_primary_home(release):
    tables={r[0] for r in release.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
    homes=[t['name'] for m in SCHEMA for t in m['tables'] if t['primary']]
    assert len(SCHEMA)==19 and len(tables)==82
    assert len(homes)==len(set(homes))==82 and set(homes)==tables
    for m in SCHEMA[1:]:
        assert m['question'] and m['boundary'] and m['processPath'] and m['casePath'] and m['exercisePath']
        for t in m['tables']:
            info=list(release.execute('PRAGMA table_info("'+t['name']+'")'))
            assert t['grain'] and t['pk']==next(r[1] for r in info if r[5])
            assert set(f['name'] for f in t['fields'])<={r[1] for r in info}
        for r in m['relationships']:
            assert set(r['childFields'])<={c[1] for c in release.execute('PRAGMA table_info("'+r['child']+'")')}
            assert set(r['parentFields'])<={c[1] for c in release.execute('PRAGMA table_info("'+r['parent']+'")')}
            if r['kind']=='conditional':assert 'SourceDocumentType' in r['condition']
            if r['kind']=='aggregate':assert r['note']
    assert not any(list(release.execute('PRAGMA foreign_key_list("'+t+'")')) for t in tables)


def test_optional_parents_are_visible_without_erasing_anomalies(release):
    for table,field in [('PriceList','CustomerID'),('SalesInvoiceLine','ShipmentLineID'),('PurchaseInvoiceLine','POLineID'),('BudgetLine','CostCenterID')]:
        relation=next(r for m in SCHEMA for r in m['relationships'] if r['child']==table and r['childFields']==[field])
        assert relation['optionalParent']
        assert release.execute(f'SELECT COUNT(*) FROM "{table}" WHERE "{field}" IS NULL').fetchone()[0]>0


@pytest.mark.parametrize('family,model',PAIRS,ids=[f'{f}/{m["id"]}' for f,m in PAIRS])
def test_native_sources_and_accessible_exports_agree(family,model):
    path=ROOT/f'static/diagrams/{family}/{model["id"]}.drawio'
    source=E.parse(path).getroot();svg=E.parse(path.with_suffix('.svg')).getroot()
    assert svg.get('role')=='img' and svg.get('data-source-sha256')==hashlib.sha256(path.read_bytes()).hexdigest()
    assert svg.find('{http://www.w3.org/2000/svg}title').text==model['title']
    assert svg.find('{http://www.w3.org/2000/svg}desc').text==model['alt']
    embedded=E.fromstring(svg.get('content'));assert embedded.get('version')=='29.6.6'
    original={o.get('id'):o for o in source.findall('.//object')}
    native={o.get('id'):o for o in embedded.findall('.//object')}
    assert set(original)==set(native)
    def geometry(element):
        if element is None:return None
        def value(text):
            try:return float(text)
            except ValueError:return text
        attributes={k:value(v) for k,v in element.attrib.items()}
        # Draw.io omits default zero coordinates when embedding the source.
        attributes={k:v for k,v in attributes.items() if not(k in ['x','y','width','height','relative'] and v==0)}
        return element.tag,sorted(attributes.items()),[geometry(c) for c in element]
    for key,obj in original.items():
        assert obj.get('label')==native[key].get('label')
        for attr in ['source','target','parent','style']:
            assert obj.find('mxCell').get(attr)==native[key].find('mxCell').get(attr),(model['id'],key,attr)
        assert geometry(obj.find('mxCell/mxGeometry'))==geometry(native[key].find('mxCell/mxGeometry')),(model['id'],key,'geometry')
    edges,boxes=read(path)
    assert not collisions(edges,boxes),(model['id'],collisions(edges,boxes))
    assert not crossing_pairs(edges),(model['id'],crossing_pairs(edges))


def test_bpmn_crossings_removed_without_changing_meaning():
    for m in CATALOGS['bpmn']:
        edges,_=read(ROOT/f'static/diagrams/bpmn/{m["id"]}.drawio')
        assert not crossing_pairs(edges),(m['id'],crossing_pairs(edges))
        assert m['instanceScope']


def test_evidence_paths_have_physical_keys_or_explicit_boundaries(release):
    types={r[0] for r in release.execute('SELECT DISTINCT SourceDocumentType FROM GLEntry')}
    for m in EVIDENCE:
        for edge in m['relationships']:
            for link in edge['recordLinks']:
                assert link['field'] in {r[1] for r in release.execute('PRAGMA table_info("'+link['child']+'")')}
                assert link['parentField'] in {r[1] for r in release.execute('PRAGMA table_info("'+link['parent']+'")')}
            if edge['kind']=='reference':assert edge['recordLinks']
            if edge['kind']=='posting':assert set(edge['sourceTypes'])<=types
            if edge['kind']=='conditional':assert 'SourceDocumentType' in edge['conditionalTrace']['condition']
            if edge['kind'] in ['aggregate','context']:assert edge['label']
    assert len(EVIDENCE)==34
    assert all(n['tables']==[] for m in EVIDENCE for n in m['nodes'] if n['id']=='PS')


def test_foreign_key_labels_keep_analytical_dates_distinct():
    for m in SCHEMA:
        for table in m['tables']:
            for field in table['fields']:
                assert not field['label'].startswith(('ref ','PK ','FK '))
                if field['name']==table['pk']:assert field['label']==field['name']+' (PK)'
                if field['name'] in ['WorkDate','CalendarDate','ScheduleDate','BillingPeriodStartDate']:
                    assert not field['label'].endswith(' (FK)')
        source=(ROOT/f'static/diagrams/er/{m["id"]}.drawio').read_text()
        assert 'does not enforce' not in source and 'not an enforced' not in source
    assert '(FK) marks a foreign key.' in (ROOT/'src/components/SchemaDiagram/index.jsx').read_text()


def test_added_timeline_and_settlement_labels_match_the_selected_records(release):
    from datetime import date
    assert release.execute('SELECT InvoiceDate FROM SalesInvoice WHERE SalesInvoiceID=202').fetchone()==('2024-01-31',)
    payment=release.execute('SELECT p.PaymentDate,r.NetPay FROM PayrollPayment p JOIN PayrollRegister r USING(PayrollRegisterID) WHERE p.PayrollPaymentID=96').fetchone()
    assert payment==('2024-01-19',1578.34)
    assert [r[0] for r in release.execute('SELECT RemittanceDate FROM PayrollLiabilityRemittance WHERE PayrollPeriodID=1 ORDER BY RemittanceDate')]==['2024-01-26','2024-01-29','2024-01-31']
    for work_order,completion,close in [(1,'2024-01-26','2024-02-01'),(67,'2024-02-07','2024-02-13')]:
        row=release.execute('SELECT MAX(p.CompletionDate),c.CloseDate FROM ProductionCompletion p JOIN WorkOrderClose c USING(WorkOrderID) WHERE p.WorkOrderID=?',(work_order,)).fetchone()
        assert row==(completion,close)
        assert (date.fromisoformat(close)-date.fromisoformat(completion)).days==6


def test_figures_keep_verified_record_selections_and_distinguish_layout_purpose():
    import subprocess
    for family,name in [('tutorials','tutorialFigures'),('cases','caseFigures')]:
        before=json.loads(subprocess.check_output(['git','show','22b215f304aedd3c2507b56783be38847ba14f0d:src/data/'+name+'.json'],cwd=ROOT))
        after=CATALOGS[family]
        assert [m['id'] for m in before]==[m['id'] for m in after]
        for old,new in zip(before,after):
            for key,value in old.items():assert new[key]==value,(new['id'],key)
            assert new['readingRule'] and new['layoutKind']
        assert len({m['layoutKind'] for m in after})>=8
    builder=(ROOT/'planning/website-redesign/cases/build-case-content.cjs').read_text()
    assert "write('src/data/caseFigures.json'" not in builder
    assert '.drawio' not in builder and 'verified-examples.json' not in builder
