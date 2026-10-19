"""Bootstrap native editable presentation cells. Existing .drawio files remain authoritative."""
from pathlib import Path
import textwrap
import xml.etree.ElementTree as ET

NAVY = '#17333e'
TEAL = '#196252'
PAPER = '#f6f4ee'
BASE = f'html=0;fontFamily=Arial;fontSize=20;fontColor={NAVY};strokeColor={TEAL};strokeWidth=1.5;whiteSpace=wrap;'


class Drawing:
    def __init__(self, model_id, title, subtitle, width=1160):
        self.id = model_id
        self.width = width
        self.document = ET.Element('mxfile', host='Electron', version='29.6.6', type='device')
        page = ET.SubElement(self.document, 'diagram', id=model_id, name=title)
        model = ET.SubElement(page, 'mxGraphModel', grid='1', gridSize='10', page='0', pageWidth=str(width), pageHeight='1000', background='#FFFFFF')
        self.root = ET.SubElement(model, 'root')
        ET.SubElement(self.root, 'mxCell', id='0')
        ET.SubElement(self.root, 'mxCell', id='1', parent='0')
        self.boxes = {}
        self.text('title', title, 25, 15, width - 50, 70, 28, bold=True)
        self.text('subtitle', subtitle, 25, 87, width - 50, 55, 18)

    def vertex(self, identifier, label, x, y, width, height, style='', parent='1', attributes=None):
        attributes = attributes or {}
        obj = ET.SubElement(self.root, 'object', id=identifier, label=label, **attributes)
        cell = ET.SubElement(obj, 'mxCell', style=BASE + style, vertex='1', parent=parent)
        ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(width), height=str(height), **{'as': 'geometry'})
        if parent == '1': self.boxes[identifier] = (x, y, width, height)
        return identifier

    def text(self, identifier, label, x, y, width, height, size=18, bold=False):
        return self.vertex(identifier, label, x, y, width, height,
                            f'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;fontSize={size};fontStyle={1 if bold else 0};')

    def card(self, identifier, heading, body, x, y, width=310, height=190, fill=PAPER):
        self.vertex(identifier, heading + '\n\n' + body, x, y, width, height,
                    f'rounded=1;arcSize=6;fillColor={fill};align=left;verticalAlign=top;spacing=18;')

    def edge(self, identifier, source, target, label='', kind='reference', points=None, source_side=1, target_side=0, start_arrow='none', end_arrow='block', attributes=None):
        dashed = kind in {'conditional', 'aggregate', 'context'}
        style = BASE + f'edgeStyle=orthogonalEdgeStyle;rounded=0;fillColor=none;fontSize=17;labelBackgroundColor=#FFFFFF;startArrow={start_arrow};endArrow={end_arrow};endFill=1;dashed={1 if dashed else 0};exitX={source_side};exitY=0.5;entryX={target_side};entryY=0.5;'
        obj = ET.SubElement(self.root, 'object', id=identifier, label=label, relationKind=kind, **(attributes or {}))
        cell = ET.SubElement(obj, 'mxCell', style=style, edge='1', parent='1', source=source, target=target)
        geometry = ET.SubElement(cell, 'mxGeometry', relative='1', **{'as': 'geometry'})
        if points:
            array = ET.SubElement(geometry, 'Array', **{'as': 'points'})
            for x, y in points: ET.SubElement(array, 'mxPoint', x=str(x), y=str(y))

    def table(self, table, x, y, width=330):
        """Draw.io's native ER swimlane table with separately editable field rows."""
        identifier = table['name']
        grain = textwrap.fill(table['grain'], 34)
        rows = [('grain', grain, max(52, 22 * (grain.count('\n') + 1)))]
        rows += [(field['name'], field['label'], 50 if len(field['label']) > 31 else 30) for field in table['fields']]
        height = 42 + sum(row[2] for row in rows)
        fill = '#e9f1ed' if table['primary'] else '#f0f1f3'
        title = identifier + ('' if table['primary'] else '\nShared reference')
        header = 42 if table['primary'] else 65
        height += header - 42
        self.vertex(identifier, title, x, y, width, height,
                    f'swimlane;horizontal=1;startSize={header};collapsible=0;align=center;verticalAlign=top;fontSize=20;fontStyle=1;fillColor={fill};swimlaneFillColor=#FFFFFF;',
                    attributes={'tableName': identifier, 'primaryHome': str(table['primary']).lower()})
        y_offset = header
        table['ports'] = {}
        for key, text, row_height in rows:
            row_id = identifier + '__' + key
            self.vertex(row_id, text, 0, y_offset, width, row_height,
                        'text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=12;spacingRight=8;overflow=hidden;rotatable=0;fontSize=18;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;', parent=identifier,
                        attributes={'fieldName': key} if key != 'grain' else {'rowMeaning': 'true'})
            table['ports'][key] = (row_id, x, y + y_offset + row_height / 2, width)
            y_offset += row_height
        return height

    def write(self, path, bottom, footer='Read the relationship labels and evidence boundary with this figure.'):
        self.text('footer', footer, 25, bottom + 32, self.width - 50, 60, 17)
        ET.indent(self.document, space='  ')
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(ET.tostring(self.document, encoding='unicode') + '\n', encoding='utf-8', newline='\n')
