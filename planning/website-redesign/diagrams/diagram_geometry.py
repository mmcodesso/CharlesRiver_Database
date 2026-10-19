"""Read exported connector geometry; never writes or substitutes SVG geometry."""
import re
import xml.etree.ElementTree as E
from statistics import median

NS={'s':'http://www.w3.org/2000/svg'}
def read(path):
    root=E.parse(path).getroot(); cells={}
    for obj in root.findall('.//object'):
        cell=obj.find('mxCell');cells[obj.get('id')]=(cell,obj.get('label',''))
    for cell in root.findall('.//root/mxCell'):
        if cell.get('id'):cells[cell.get('id')]=(cell,cell.get('value',''))
    def box(identifier):
        cell=cells[identifier][0];g=cell.find('mxGeometry')
        if g is None:return (0,0,0,0)
        x,y,w,h=[float(g.get(k,0)) for k in ['x','y','width','height']]
        if cell.get('parent') in cells:
            px,py,_,_=box(cell.get('parent'));x+=px;y+=py
        return x,y,w,h
    svg=E.parse(path.with_suffix('.svg')).getroot()
    groups={g.get('data-cell-id'):g for g in svg.iter() if g.get('data-cell-id')}
    edges={}; offsets=[]; boxes={}
    for identifier,(cell,label) in cells.items():
        group=groups.get(identifier)
        if group is None:continue
        paths=group.findall('.//s:path',NS)
        if cell.get('edge')=='1' and paths:
            d=paths[0].get('d','')
            if re.search('[CQAHV]',d):raise ValueError('Unexpected curved edge '+identifier)
            numbers=[float(v) for v in re.findall(r'-?\d+(?:\.\d+)?',d)]
            pts=list(zip(numbers[::2],numbers[1::2]));edges[identifier]={'source':cell.get('source'),'target':cell.get('target'),'segments':list(zip(pts,pts[1:]))}
        elif cell.get('vertex')=='1':
            style=cell.get('style','')
            if 'swimlane' in style and 'tableName' not in root.attrib and cell.get('parent')!='1':continue
            if ('text;' in style and identifier not in ['title','subtitle','footer']) or identifier=='scope' or 'bpmnShapeType=pool' in style or 'bpmnShapeType=lane' in style:continue
            # Include only tables/cards and BPMN flow nodes, not their parent pools.
            if cell.get('parent') not in ['1',None] and 'shape=mxgraph.bpmn' not in style:continue
            if 'swimlane' in style and not any(o.get('id')==identifier and o.get('tableName') for o in root.findall('.//object')):continue
            geom=box(identifier);points=[]
            if paths:
                numbers=[float(v) for v in re.findall(r'-?\d+(?:\.\d+)?',paths[0].get('d',''))]
                points=list(zip(numbers[::2],numbers[1::2]))
            rects=group.findall('.//s:rect',NS)
            if rects and not points:
                rect=rects[0];points=[(float(rect.get('x','0')),float(rect.get('y','0')))]
            if points and 'text;' not in style:
                offsets.append((min(p[0] for p in points)-geom[0],min(p[1] for p in points)-geom[1]))
            boxes[identifier]=geom
    dx=median(x for x,y in offsets) if offsets else 0;dy=median(y for x,y in offsets) if offsets else 0
    boxes={key:(x+dx,y+dy,w,h) for key,(x,y,w,h) in boxes.items()}
    return edges,boxes

def crosses(a,b):
    (x1,y1),(x2,y2)=a;(x3,y3),(x4,y4)=b
    return (abs(y1-y2)<.05 and abs(x3-x4)<.05 and min(x1,x2)+.1<x3<max(x1,x2)-.1 and min(y3,y4)+.1<y1<max(y3,y4)-.1) or (abs(x1-x2)<.05 and abs(y3-y4)<.05 and min(y1,y2)+.1<y3<max(y1,y2)-.1 and min(x3,x4)+.1<x1<max(x3,x4)-.1)

def crossing_pairs(edges):
    pairs=[];items=list(edges.items())
    for i,(a,ea) in enumerate(items):
        for b,eb in items[i+1:]:
            if {ea['source'],ea['target']}&{eb['source'],eb['target']}:continue
            if any(crosses(sa,sb) for sa in ea['segments'] for sb in eb['segments']):pairs.append((a,b))
    return pairs

def collisions(edges,boxes):
    result=[]
    for key,edge in edges.items():
        for identifier,(x,y,w,h) in boxes.items():
            if any(n==identifier or (n or '').startswith(identifier+'__') for n in [edge['source'],edge['target']]):continue
            for (x1,y1),(x2,y2) in edge['segments']:
                hit=(abs(x1-x2)<.1 and x+1<x1<x+w-1 and max(min(y1,y2),y+1)<min(max(y1,y2),y+h-1)) or (abs(y1-y2)<.1 and y+1<y1<y+h-1 and max(min(x1,x2),x+1)<min(max(x1,x2),x+w-1))
                if hit:result.append((key,identifier));break
    return result

if __name__=='__main__':
    import json
    from pathlib import Path
    root=Path(__file__).resolve().parents[3];result={}
    for path in sorted((root/'static/diagrams').glob('*/*.drawio')):
        if not path.with_suffix('.svg').exists():continue
        edges,boxes=read(path);result[str(path.relative_to(root))]={'crossings':crossing_pairs(edges),'nodeCollisions':collisions(edges,boxes)}
    (Path(__file__).parent/'geometry-review.json').write_text(json.dumps(result,indent=2)+'\n')
    for path,row in result.items():
        if row['crossings'] or row['nodeCollisions']:print(path,row)
