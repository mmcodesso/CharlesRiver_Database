// Validate the integrated release without rewriting the original review baseline.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '../../..');
process.chdir(root);
const baseline = require('./baseline.json');
const git = (...args) => cp.execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const protectedArtifacts = baseline.artifacts.filter(item => !item.file.startsWith('static/diagrams/'));
for (const item of [...protectedArtifacts, ...baseline.protectedSources]) {
  if (hash(fs.readFileSync(item.file)) !== item.sha256) throw new Error('Protected file changed: ' + item.file);
}
for (const page of baseline.pages.filter(page => page.file.endsWith('.md'))) {
  const metadata = yaml.load(fs.readFileSync(page.file, 'utf8').split('---')[1]);
  const id = page.file.slice(5, -3);
  const slug = metadata.slug ?? '/' + id.replace(/\/index$/, '');
  if ('/docs' + (slug === '/' ? '' : slug) !== page.route) throw new Error('Changed route: ' + page.file);
}
const incoming = git('ls-tree', '-r', '--name-only', 'origin/main', 'static/diagrams').split('\n').filter(Boolean);
for (const file of incoming) {
  const source = cp.execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'show', 'origin/main:' + file]);
  if (hash(source) !== hash(fs.readFileSync(file))) throw new Error('Incoming diagram differs from main: ' + file);
}
const result = { branch: git('branch', '--show-current'), commit: git('rev-parse', 'HEAD'),
  integratedMain: git('rev-parse', 'origin/main'), protectedSourceFiles: baseline.protectedSources.length,
  preservedDatasetReportArtifacts: protectedArtifacts.length, preservedAuthoredRoutes: baseline.pages.length,
  exactIncomingDiagramFiles: incoming.length,
  status: 'PASS: dataset/report/source hashes and routes preserved; incoming diagrams match main Git bytes' };
fs.mkdirSync('outputs/_learning_seo_publication', { recursive: true });
fs.writeFileSync('outputs/_learning_seo_publication/preservation.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result));
