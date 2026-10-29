"""Prepare website-only report data. Never invoke a dataset or report exporter."""
from __future__ import annotations

import csv
import hashlib
import json
import re
import sqlite3
from decimal import Decimal, InvalidOperation
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def digest(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def normalized(value):
    if value is None or value == '':
        return ''
    try:
        return Decimal(str(value)).quantize(Decimal('0.000001'))
    except InvalidOperation:
        return str(value)


def main():
    definitions_path = ROOT / 'src/data/reportPresentation.json'
    definitions = json.loads(definitions_path.read_text(encoding='utf-8'))
    import sys
    published = '--published-inputs' in sys.argv
    inputs = json.loads((ROOT / 'planning/website-redesign/reports-2026/publication-inputs.json').read_text()) if published else None
    if published:
        catalog = inputs['catalog']
    else:
        import yaml
        catalog = yaml.safe_load((ROOT / 'config/report_catalog.yaml').read_text())['reports']
    # The maintained private teaching baseline is also used by website verification.
    sys.path.insert(0, str(ROOT / 'tests/website'))
    from release_database import RELEASE_SHA256, select_release_database
    database = select_release_database()
    if not published and (not database.is_file() or digest(database) != RELEASE_SHA256):
        raise RuntimeError('A checksum-matched teaching database is required. No generation was attempted.')
    report_root = ROOT / 'outputs/_published_report_assets/reports' if published else ROOT / 'static/reports'
    prerequisites = []
    for entry in catalog:
        base = report_root / entry['area'] / entry['process_group'] / entry['slug']
        prerequisites.extend([base / 'preview.json', base / (entry['slug'] + '.csv'), base / (entry['slug'] + '.xlsx')])
    missing = [str(p.relative_to(ROOT)) for p in prerequisites if not p.is_file()]
    if missing:
        raise RuntimeError('Existing report prerequisites are missing; no exporter was invoked:\n' + '\n'.join(missing))
    output = ROOT / 'static/report-data'
    output.mkdir(exist_ok=True)
    manifest, provenance = {}, {}
    connection = sqlite3.connect(database.resolve().as_uri() + '?mode=ro', uri=True) if not published else None
    for entry in catalog:
        slug = entry['slug']
        definition = definitions[slug]
        if definition['visibility'] == 'retired':
            manifest[slug] = {**entry, **definition}
            continue
        base = report_root / entry['area'] / entry['process_group'] / slug
        source = base / (slug + '.csv')
        query = ROOT / entry['query_path']
        if published:
            verified = inputs['reports'][slug]
            query_hash = hashlib.sha256(query.read_bytes().replace(b'\r\n', b'\n')).hexdigest()
            if digest(source) != verified['csv'] or query_hash != verified['sql']:
                raise RuntimeError(f'{slug}: published source no longer matches verified inputs')
            columns = [field['key'] for field in verified['fields']]
        else:
            cursor = connection.execute(query.read_text(encoding='utf-8-sig'))
            sql_rows = cursor.fetchall()
            columns = [c[0] for c in cursor.description]
        with source.open(encoding='utf-8-sig', newline='') as handle:
            reader = csv.DictReader(handle)
            if reader.fieldnames != columns:
                raise RuntimeError(f'{slug}: source column mismatch')
            csv_rows = list(reader)
        if published:
            sql_rows = [tuple(None if row[f['key']] == '' else row[f['key']].removesuffix('.0') if f['key'] == 'AccountNumber' else row[f['key']] if f['kind'] in ('text', 'date') else float(row[f['key']]) for f in verified['fields']) for row in csv_rows]
            if len(csv_rows) != verified['rows']:
                raise RuntimeError(f'{slug}: published row count mismatch')
        if len(csv_rows) != len(sql_rows):
            raise RuntimeError(f'{slug}: source row-count mismatch')
        for index, (actual, expected) in enumerate(zip(csv_rows, sql_rows)):
            if any(normalized(actual[key]) != normalized(value) for key, value in zip(columns, expected)):
                raise RuntimeError(f'{slug}: source differs from verified SQL at row {index + 1}')
        preview = json.loads((base / 'preview.json').read_text())
        if preview['rowCount'] != len(sql_rows) or preview['columns'] != columns:
            raise RuntimeError(f'{slug}: preview inventory mismatch')
        fields = []
        for key in columns:
            sample = next((row[columns.index(key)] for row in sql_rows if row[columns.index(key)] is not None), None)
            identifier = bool(re.search(r'(ID|Number|Code)$', key)) or key in ('FiscalYear', 'FiscalPeriod', 'Month', 'PeriodNumber')
            numeric = isinstance(sample, (int, float)) and not identifier
            kind = 'date' if isinstance(sample, str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', sample) and 'Date' in key else 'text'
            if numeric:
                kind = 'decimal'
                if key.endswith('Pct') or key == 'AbsenceRate':
                    kind = 'percent'
                elif re.search(r'(Count|Headcount|Employees|Days)$', key) and not key.startswith(('Avg', 'Average')):
                    kind = 'integer'
                elif re.search(r'(Amount|Balance|Revenue|Pay|Cost|Margin|Cash|Remittance|Benefits|Withholdings|Burden|Sales|Value|Variance|COGS|Credit|Refunded|Applied|Price)$', key) or key in ('DebitAmount', 'CreditAmount', 'NetIncrease', 'NetWorkingCapital', 'CashPaid', 'OpenUnappliedAmount', 'CustomerCreditCreated', 'RemainingARBeforeMemo', 'GrossLessWithholdings'):
                    kind = 'money'
            fields.append({'key': key, 'label': re.sub(r'(?<=[a-z0-9])(?=[A-Z])', ' ', key), 'kind': kind})
        if published:
            fields = verified['fields']
        period_fields = definition['periodFields']
        def period(row):
            if len(period_fields) == 2:
                return f"{int(row[period_fields[0]]):04d}-{int(row[period_fields[1]]):02d}"
            return str(row[period_fields[0]]) if period_fields else 'all'
        partitions = {}
        for raw, sql_row in zip(csv_rows, sql_rows):
            row = {}
            for field, value in zip(fields, sql_row):
                row[field['key']] = None if value is None else str(raw[field['key']]).removesuffix('.0') if field['kind'] == 'text' and isinstance(value, (int, float)) else raw[field['key']] if field['kind'] in ('text', 'date') else value
            partitions.setdefault(period(row), []).append(row)
        paths = {}
        directory = output / slug
        directory.mkdir(exist_ok=True)
        for key, rows in sorted(partitions.items()):
            filename = re.sub(r'[^a-zA-Z0-9-]', '-', key) + '.json'
            (directory / filename).write_text(json.dumps(rows, separators=(',', ':'), ensure_ascii=False), encoding='utf-8')
            paths[key] = f'/report-data/{slug}/{filename}'
        manifest[slug] = {**entry, **definition, 'fields': fields, 'partitions': paths, 'rowCount': len(sql_rows)}
        provenance[slug] = {'csv': digest(source), 'sql': digest(query), 'rows': len(sql_rows)}
    if connection:
        connection.close()
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    private = ROOT / 'outputs/_website_reports'
    private.mkdir(parents=True, exist_ok=True)
    (private / 'provenance.json').write_text(json.dumps({'database': RELEASE_SHA256, 'definitions': digest(definitions_path), 'reports': provenance}, indent=2))
    print(f'Prepared {len(provenance)} verified report presentations; preserved all original files.')


if __name__ == '__main__':
    main()
