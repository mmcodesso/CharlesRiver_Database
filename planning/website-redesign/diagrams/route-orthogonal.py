"""Route native ER/evidence connectors around unrelated table/card boundaries.

Only changes editable mxGraph waypoints. SVG geometry is always exported by
Draw.io Desktop. BPMN has dedicated authored message corridors and is excluded.
"""
import argparse
import heapq
import itertools
from pathlib import Path
import re
import random
import xml.etree.ElementTree as E

ROOT=Path(__file__).resolve().parents[3]

def intersection(a,b):
    (x1,y1),(x2,y2)=a;(x3,y3),(x4,y4)=b
    if y1==y2 and x3==x4 and min(x1,x2)<=x3<=max(x1,x2) and min(y3,y4)<=y1<=max(y3,y4):return 1
    if x1==x2 and y3==y4 and min(y1,y2)<=y3<=max(y1,y2) and min(x3,x4)<=x1<=max(x3,x4):return 1
    if y1==y2==y3==y4:return 2 if min(max(x1,x2),max(x3,x4))-max(min(x1,x2),min(x3,x4))>1 else 0
    if x1==x2==x3==x4:return 2 if min(max(y1,y2),max(y3,y4))-max(min(y1,y2),min(y3,y4))>1 else 0
    return 0

def route(path, trial=0):
    tree=E.parse(path);objects={o.get('id'):o for o in tree.findall('.//object')}
    def geo(key):
        item=objects[key];cell=item.find('mxCell');g=cell.find('mxGeometry')
        x,y,w,h=[float(g.get(k,0)) for k in ['x','y','width','height']]
        if cell.get('parent') in objects:
            px,py,_,_=geo(cell.get('parent'));x+=px;y+=py
        return x,y,w,h
    boxes={key:geo(key) for key,obj in objects.items() if obj.find('mxCell').get('vertex')=='1' and obj.find('mxCell').get('parent')=='1' and key not in ['title','subtitle','footer']}
    if not boxes:return
    xs=sorted({x-24 for x,y,w,h in boxes.values()}|{x+w+24 for x,y,w,h in boxes.values()}|{min(x for x,y,w,h in boxes.values())-70,max(x+w for x,y,w,h in boxes.values())+70})
    base_ys={y-24 for x,y,w,h in boxes.values()}|{y+h+24 for x,y,w,h in boxes.values()}
    # Keep the upper corridor below the question, whose box ends at y=142.
    base_ys|={min(y for x,y,w,h in boxes.values())-24,max(y+h for x,y,w,h in boxes.values())+60}
    base_ys|={min(y for x,y,w,h in boxes.values())-16,min(y for x,y,w,h in boxes.values())-8}
    occupied=[];routed=[]
    edge_items=[obj for obj in objects.values() if obj.find('mxCell').get('edge')=='1']
    if trial==1:edge_items.reverse()
    elif trial>1:random.Random(trial).shuffle(edge_items)
    for item in edge_items:
        cell=item.find('mxCell');source=cell.get('source');target=cell.get('target')
        if source not in objects or target not in objects:continue
        sx,sy,sw,sh=geo(source);tx,ty,tw,th=geo(target)
        sy+=sh/2;ty+=th/2
        ys=sorted(base_ys|{sy,ty})
        def clear(a,b):
            for x,y,w,h in boxes.values():
                if a[0]==b[0] and x+.1<a[0]<x+w-.1 and max(min(a[1],b[1]),y+.1)<min(max(a[1],b[1]),y+h-.1):return False
                if a[1]==b[1] and y+.1<a[1]<y+h-.1 and max(min(a[0],b[0]),x+.1)<min(max(a[0],b[0]),x+w-.1):return False
            return True
        candidates=[]
        for source_side,target_side in itertools.product([0,1],repeat=2):
            source_edge=(sx+sw*source_side,sy);target_edge=(tx+tw*target_side,ty)
            start=(source_edge[0]+(24 if source_side else -24),sy)
            finish=(target_edge[0]+(24 if target_side else -24),ty)
            if not clear(source_edge,start) or not clear(finish,target_edge):continue
            xx=sorted(set(xs+[start[0],finish[0]]));x_index={v:i for i,v in enumerate(xx)};y_index={v:i for i,v in enumerate(ys)}
            queue=[(0,0,start,0)];best={(start,0):0};previous={};end_state=None
            while queue:
                _,cost,p,direction=heapq.heappop(queue)
                if cost!=best.get((p,direction)):continue
                if p==finish:end_state=(p,direction);break
                i,j=x_index[p[0]],y_index[p[1]]
                for ni,nj,nd in [(i-1,j,1),(i+1,j,1),(i,j-1,2),(i,j+1,2)]:
                    if not(0<=ni<len(xx) and 0<=nj<len(ys)):continue
                    q=(xx[ni],ys[nj]);segment=(p,q)
                    if not clear(p,q):continue
                    penalty=sum(intersection(segment,other) for other in occupied)*3000
                    new_cost=cost+abs(p[0]-q[0])+abs(p[1]-q[1])+(35 if direction and direction!=nd else 0)+penalty
                    state=(q,nd)
                    if new_cost>=best.get(state,float('inf')):continue
                    best[state]=new_cost;previous[state]=(p,direction)
                    heuristic=abs(q[0]-finish[0])+abs(q[1]-finish[1])
                    heapq.heappush(queue,(new_cost+heuristic,new_cost,q,nd))
            if end_state:
                points=[];state=end_state
                while state[1]:points.append(state[0]);state=previous[state]
                points.append(start);points.reverse();points=[source_edge]+points+[target_edge]
                compact=[points[0]]
                for index in range(1,len(points)-1):
                    a=compact[-1];b=points[index];c=points[index+1]
                    if (a[0]==b[0]==c[0]) or (a[1]==b[1]==c[1]):continue
                    compact.append(b)
                compact.append(points[-1])
                full_penalty=sum(intersection(segment,other) for segment in zip(compact,compact[1:]) for other in occupied)*10000
                candidates.append((best[end_state]+full_penalty,source_side,target_side,compact))
        if not candidates:raise ValueError('No clear native route: '+str(path)+' '+item.get('id'))
        _,source_side,target_side,points=min(candidates)
        style=cell.get('style','')
        for key,value in [('exitX',source_side),('exitY',.5),('entryX',target_side),('entryY',.5)]:
            style=re.sub(r'(?<![\w])'+key+r'=[^;]*;','',style)+key+'='+str(value)+';'
        cell.set('style',style)
        geometry=cell.find('mxGeometry')
        for array in list(geometry):geometry.remove(array)
        array=E.SubElement(geometry,'Array',{'as':'points'})
        for x,y in points[1:-1]:E.SubElement(array,'mxPoint',x=str(x),y=str(y))
        occupied.extend(zip(points,points[1:]))
        routed.append((source,target,list(zip(points,points[1:]))))
    footer=objects.get('footer')
    if footer is not None and occupied:
        bottom=max(max(a[1],b[1]) for a,b in occupied)
        bottom=max(bottom,max(y+h for x,y,w,h in boxes.values()))
        g=footer.find('mxCell/mxGeometry');g.set('y',str(bottom+32))
    E.indent(tree,space='  ')
    def crossing(a,b):
        (x1,y1),(x2,y2)=a;(x3,y3),(x4,y4)=b
        return (y1==y2 and x3==x4 and min(x1,x2)+.1<x3<max(x1,x2)-.1 and min(y3,y4)+.1<y1<max(y3,y4)-.1) or (x1==x2 and y3==y4 and min(y1,y2)+.1<y3<max(y1,y2)-.1 and min(x3,x4)+.1<x1<max(x3,x4)-.1)
    crossings=sum(any(crossing(a,b) for a in sa for b in sb) for i,(a1,a2,sa) in enumerate(routed) for b1,b2,sb in routed[i+1:] if not {a1,a2}&{b1,b2})
    return crossings,E.tostring(tree.getroot(),encoding='unicode')+'\n'

parser=argparse.ArgumentParser();parser.add_argument('--family',choices=['er','evidence'],default='er');parser.add_argument('--id',default='');parser.add_argument('--trials',type=int,default=32);args=parser.parse_args()
for path in sorted((ROOT/'static/diagrams'/args.family).glob('*.drawio')):
    if args.id and path.stem not in args.id.split(','):continue
    best=None
    for trial in range(args.trials):
        candidate=route(path,trial)
        if candidate is None:break
        if best is None or candidate[0]<best[0]:best=candidate
        if best[0]==0:break
    if best:path.write_text(best[1],encoding='utf-8',newline='\n')
    print('Routed native source:',path.stem,'crossings:',best[0] if best else 0)
