"""Author small website presentation snapshots from unchanged SQL and read-only release data.

Explicit --write refreshes only static/report-snapshots and its private verification register.
No dataset, report exporter, existing download or source query is modified.
"""
import hashlib
import json
from pathlib import Path
import re
import sqlite3
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tests/website'))
from release_database import RELEASE_SHA256, select_release_database


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    database = select_release_database()
    if sha(database) != RELEASE_SHA256:
        raise RuntimeError('The checksum-matched teaching database is required.')
    connection = sqlite3.connect(database.resolve().as_uri() + '?mode=ro', uri=True)
    catalog = json.loads((ROOT / 'src/data/additionalReports.json').read_text())
    register = {}
    for slug, entry in catalog.items():
        query = ROOT / entry['query_path']
        cursor = connection.execute(query.read_text(encoding='utf-8-sig'))
        records = cursor.fetchall()
        keys = [column[0] for column in cursor.description]
        fields = []
        for index, key in enumerate(keys):
            sample = next((row[index] for row in records if row[index] is not None), None)
            kind = 'text'
            if isinstance(sample, (int, float)) and key not in ('FiscalYear', 'FiscalPeriod', 'AccountNumber', 'DisplayOrder', 'PaymentSequence'):
                kind = 'percent' if key.endswith('Pct') else 'integer' if key.startswith('WorkOrders') or key.endswith('Count') else 'decimal' if any(word in key for word in ('Hours', 'Quantity', 'Days')) else 'money'
            elif isinstance(sample, str) and re.fullmatch(r'\d{4}-\d{2}-\d{2}', sample):
                kind = 'date'
            fields.append({'key': key, 'label': re.sub(r'(?<=[a-z0-9])(?=[A-Z])', ' ', key), 'kind': kind})
        rows = [{field['key']: str(value) if value is not None and field['kind'] == 'text' else value for field, value in zip(fields, record)} for record in records]
        payload = json.dumps({'fields': fields, 'rows': rows}, separators=(',', ':'), ensure_ascii=False) + '\n'
        output = ROOT / 'static/report-snapshots' / (slug + '.json')
        if '--write' in sys.argv:
            output.parent.mkdir(exist_ok=True)
            output.write_text(payload, encoding='utf-8', newline='\n')
        elif json.loads(output.read_text(encoding='utf-8')) != json.loads(payload):
            raise RuntimeError(f'{slug}: snapshot does not match read-only SQL')
        register[slug] = {'querySha256': hashlib.sha256(query.read_bytes().replace(b'\r\n', b'\n')).hexdigest(), 'snapshotSha256': sha(output), 'rows': len(rows)}
    connection.close()
    if '--write' in sys.argv:
        private = ROOT / 'planning/website-redesign/reports-2026/selection-review'
        private.mkdir(exist_ok=True)
        (private / 'snapshot-register.json').write_text(json.dumps({'databaseSha256': RELEASE_SHA256, 'reports': register}, indent=2) + '\n')
    print(f'{len(register)} website snapshots match unchanged canonical SQL on the verified read-only release.')


if __name__ == '__main__':
    main()
