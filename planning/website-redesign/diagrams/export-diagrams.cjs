// Presentation-only exports through the installed Draw.io Desktop application.
// Never generates accounting datasets or reports.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '../../..');
const catalogs = { er: 'schemaDiagrams', evidence: 'processEvidenceDiagrams', bpmn: 'bpmnModels', tutorials: 'tutorialFigures', cases: 'caseFigures' };
const options = Object.fromEntries(process.argv.slice(2).map(arg => {
  const at = arg.indexOf('=');
  if (!arg.startsWith('--') || at < 0) throw new Error('Use --family=er --id=goods-fulfillment or --family=all');
  return [arg.slice(2, at), arg.slice(at + 1)];
}));
for (const key of Object.keys(options)) if (!['family', 'id', 'app'].includes(key)) throw new Error('Unknown option: ' + key);
const app = options.app || process.env.DRAWIO_PATH || (process.platform === 'darwin' ? '/Applications/draw.io.app/Contents/MacOS/draw.io' : process.platform === 'win32' ? 'C:\Program Files\draw.io\draw.io.exe' : 'drawio');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const families = options.family === 'all' ? Object.keys(catalogs) : [options.family || 'er'];
let exported = 0;
for (const family of families) {
  if (!catalogs[family]) throw new Error('Unknown family: ' + family);
  const file = path.join(root, 'src/data', catalogs[family] + '.json');
  if (!fs.existsSync(file)) throw new Error('Missing authored catalog: ' + file);
  const models = JSON.parse(fs.readFileSync(file, 'utf8')).filter(model => !options.id || options.id.split(',').includes(model.id));
  for (const model of models) {
    const source = path.join(root, 'static/diagrams', family, model.id + '.drawio');
    const target = source.replace(/\.drawio$/, '.svg');
    const scratch = path.join(root, 'outputs/_diagram_exports', family);
    fs.mkdirSync(scratch, { recursive: true });
    const raw = path.join(scratch, model.id + '.svg');
    fs.rmSync(raw, { force: true });
    const result = spawnSync(app, ['-x', '-f', 'svg', '-e', '-u', '--embed-svg-fonts', 'false', '--svg-theme', 'light', '-b', '20', '-o', raw, source, '--disable-gpu'], { cwd: root, encoding: 'utf8', timeout: 45000, killSignal: 'SIGKILL' });
    if (result.error || result.status !== 0 || !fs.existsSync(raw)) throw new Error('Draw.io export failed for ' + model.id + ': ' + (result.error?.message || result.stderr));
    let svg = fs.readFileSync(raw, 'utf8');
    if (!svg.includes('<svg') || !svg.includes('content="')) throw new Error('Missing embedded editable source: ' + model.id);
    const hash = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
    const prefix = family === 'tutorials' ? 'tutorial' : family === 'cases' ? 'case' : family;
    svg = svg.replace(/<svg\b([^>]*)>/, `<svg role="img" aria-labelledby="${prefix}-title ${prefix}-description" data-source-sha256="${hash}"$1><title id="${prefix}-title">${escape(model.title)}</title><desc id="${prefix}-description">${escape(model.alt)}</desc>`);
    fs.writeFileSync(target, svg);
    console.log('Exported ' + family + '/' + model.id);
    exported++;
  }
}
if (!exported) throw new Error('No matching diagrams');
