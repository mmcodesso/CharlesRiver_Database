"""Read-only preservation checks for the October 19 website review."""
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
baseline = json.loads((HERE / 'preservation-baseline.json').read_text())

for name, expected in baseline['artifacts'].items():
    with (ROOT / name).open('rb') as source:
        assert hashlib.file_digest(source, 'sha256').hexdigest() == expected, name

protected = ['generate_dataset.py', 'src/generator_dataset', 'config', 'queries', 'scripts']
diff = subprocess.check_output(['git', 'diff', '--name-only', baseline['frozenBaseline'], '--', *protected], cwd=ROOT, text=True)
assert not diff, diff
assert not subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '--', *protected], cwd=ROOT, text=True)

pages = subprocess.check_output(['git', 'ls-files', 'docs'], cwd=ROOT, text=True).splitlines()
code_count = 0
for page in pages:
    previous = subprocess.check_output(['git', 'show', baseline['sourceCommit'] + ':' + page], cwd=ROOT, text=True)
    current = (ROOT / page).read_text()
    # All existing executable examples and formulas must remain byte-for-byte
    # equal in canonical LF text. Mermaid is authored presentation in this pass.
    def executable(text):
        return [(language, body) for language, body in re.findall(r'(?:```|~~~)([^\n]*)\n([\s\S]*?)(?:```|~~~)', text)
                if not language.startswith('mermaid')]
    assert executable(previous) == executable(current), page + ': executable examples changed'
    code_count += len(executable(current))
    # Existing explicit aliases, routes and pagination values remain stable.
    aliases = set(re.findall(r'<span id="([^"]+)"', previous))
    assert aliases <= set(re.findall(r'<span id="([^"]+)"', current)), page + ': missing alias'
    for field in ('slug', 'pagination_prev', 'pagination_next'):
        pattern = r'^' + field + r':.*$'
        assert re.findall(pattern, previous, re.M) == re.findall(pattern, current, re.M), (page, field)

for name in ['src/generated', 'static/diagrams', 'static/CNAME', 'static/img/favicon.svg', 'static/img/site-social-card.svg']:
    assert not subprocess.check_output(['git', 'diff', '--name-only', baseline['sourceCommit'], '--', name], cwd=ROOT, text=True), name

result = {
    'existingArtifactsUnchanged': len(baseline['artifacts']),
    'existingReportsUnchanged': sum(name.startswith('static/reports/') for name in baseline['artifacts']),
    'protectedCoreDiffAgainstFrozenBaseline': [],
    'documentationPagesChecked': len(pages),
    'unchangedExecutableAndFormulaBlocks': code_count,
    'existingExplicitAnchorsAndRoutesPreserved': True,
    'generatedManifestsAndDiagramAssetsUnchanged': True,
}
(HERE / 'preservation-validation.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result, indent=2))
