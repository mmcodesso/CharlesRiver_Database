"""Read-only verification of the protected source and published artifact inventory."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
manifest = json.loads(Path(__file__).with_name('protected-hashes.json').read_text())
for group in ('files', 'artifacts'):
    for name, expected in manifest[group].items():
        with (ROOT / name).open('rb') as handle:
            actual = hashlib.file_digest(handle, 'sha256').hexdigest()
        if actual != expected:
            raise SystemExit(f'Protected {group} changed: {name}')
expected_reports = {name for name in manifest['artifacts'] if name.startswith('static/reports/')}
actual_reports = {str(path.relative_to(ROOT)) for path in (ROOT / 'static/reports').rglob('*') if path.is_file()}
if expected_reports != actual_reports:
    raise SystemExit('The frozen report-file inventory changed')
protected_roots = ['generate_dataset.py', 'src/generator_dataset', 'config', 'queries', 'scripts', 'src/generated', 'static/diagrams']
changed = subprocess.check_output(['git', 'diff', '--name-only', manifest['sourceBaseline'], '--', *protected_roots], cwd=ROOT, text=True)
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '--', *protected_roots], cwd=ROOT, text=True)
if changed or untracked:
    raise SystemExit('Protected paths have changed or gained files:\n' + changed + untracked)
print(f"Preserved {len(manifest['files'])} protected source files and {len(manifest['artifacts'])} published data/report files.")
