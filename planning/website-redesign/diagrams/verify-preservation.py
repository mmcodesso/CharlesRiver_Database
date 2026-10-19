"""Read-only freeze, worked-code, routes, and figure-selection preservation audit."""
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT=Path(__file__).resolve().parents[3]
BASE=json.loads((Path(__file__).parent/'baseline.json').read_text())
def sha(path):
    with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
errors=[]
for file,expected in {**BASE['artifacts'],**BASE['workedRegisters']}.items():
    if not (ROOT/file).is_file() or sha(ROOT/file)!=expected:errors.append('Changed artifact/register: '+file)
def blocks(text):
    return [m.group(0) for m in re.finditer(r'^(`{3,}|~{3,})([^\n]*)\n[\s\S]*?^\1\s*$',text,re.M) if not m.group(2).startswith('mermaid')]
def routing(text):
    return {k:re.findall(r'^'+k+r':.*$',text,re.M) for k in ['slug','pagination_prev','pagination_next']}
for file,item in BASE['pages'].items():
    old=subprocess.check_output(['git','show',BASE['sourceCommit']+':'+file],cwd=ROOT,text=True)
    new=(ROOT/file).read_text()
    if blocks(old)!=blocks(new):errors.append('Changed non-diagram worked code: '+file)
    if routing(old)!=routing(new):errors.append('Changed route/pagination: '+file)
    oldaliases=set(re.findall(r'<a\s+(?:[^>]*?\s)?id=["\']([^"\']+)',old))
    if not oldaliases<=set(re.findall(r'<a\s+(?:[^>]*?\s)?id=["\']([^"\']+)',new)):errors.append('Lost explicit fragment: '+file)
protected=['generate_dataset.py','src/generator_dataset','config','queries','scripts','tests',':!tests/website']
changes=subprocess.check_output(['git','diff','--name-only',BASE['sourceCommit'],'--',*protected],cwd=ROOT,text=True).splitlines()
if changes:errors.append('Protected path diff since start: '+', '.join(changes))
frozen_changes=subprocess.check_output(['git','diff','--name-only',BASE['frozenBaseline'],'--',*protected],cwd=ROOT,text=True).splitlines()
preexisting=subprocess.check_output(['git','diff','--name-only',BASE['frozenBaseline'],BASE['sourceCommit'],'--',*protected],cwd=ROOT,text=True).splitlines()
if frozen_changes!=preexisting:errors.append('New protected-path drift against frozen baseline')
result={'sourceCommit':BASE['sourceCommit'],'frozenBaseline':BASE['frozenBaseline'],'artifactFilesUnchanged':len(BASE['artifacts']),'workedRegistersUnchanged':len(BASE['workedRegisters']),'pagesWithCodeAndRouteChecks':len(BASE['pages']),'protectedPathDiffSinceStart':changes,'preExistingDiffAgainstFrozen':preexisting,'errors':errors}
(Path(__file__).parent/'preservation-result.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2));raise SystemExit(bool(errors))
