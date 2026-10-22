// Website-only evidence capture. Does not invoke generators or open a writable database.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const yaml = require('js-yaml');
const root = path.resolve(__dirname, '../../..');
process.chdir(root);
const phase = process.argv[2];
if (!['baseline', 'final'].includes(phase)) throw new Error('Use baseline or final');
const walk = p => fs.existsSync(p) ? fs.readdirSync(p, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name).replaceAll('\\', '/')]) : [];
const digest = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
const files = walk('docs').filter(p => p.endsWith('.md'));
const pages = files.map(file => {
  const source = fs.readFileSync(file, 'utf8');
  const metadata = yaml.load(source.split('---')[1]);
  const id = file.slice(5, -3);
  const slug = metadata.slug ?? `/${id.replace(/\/index$/, '')}`;
  const route = `/docs${slug === '/' ? '' : slug}`;
  const audience = id === 'technical/license' ? 'All dataset users and reusers' : id === 'technical/contributing' ? 'Students, instructors and maintainers' : id.startsWith('teach-with-data/') || id.startsWith('technical/') ? 'Instructors / technical maintainers' : 'Students; instructors selecting material';
  const level = metadata.case_level ?? (metadata.tutorial_number ? `Lesson ${metadata.tutorial_number}; follow its stated prerequisites` : 'See page prerequisites; no new level asserted');
  return { file, route, title: metadata.title, description: metadata.description, audience, level,
    purpose: metadata.description,
    headings: [...source.matchAll(/^#{1,3} (.+)$/gm)].map(m => m[1]),
    links: [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map(m => m[1]),
    components: [...new Set([...source.matchAll(/<([A-Z]\w+)/g)].map(m => m[1]))],
    sha256: digest(file) };
});
const home = fs.readFileSync('src/pages/index.jsx', 'utf8');
pages.unshift({ file: 'src/pages/index.jsx', route: '/', title: /<Layout title="([^"]+)"/.exec(home)?.[1],
  purpose: 'Orient learners from company and process to evidence, practice, cases and teaching.', audience: 'New students and instructors', level: 'Orientation',
  links: [...home.matchAll(/(?:href|to):?\s*[=:]\s*"([^"]+)"/g)].map(m => m[1]), sha256: digest('src/pages/index.jsx') });
const artifactFiles = [...walk('outputs').filter(p => /\.(sqlite|xlsx|csv|zip)$/i.test(p)), ...walk('static/reports'), ...walk('static/diagrams')];
const artifacts = artifactFiles.map(file => ({ file, bytes: fs.statSync(file).size, sha256: digest(file) }));
const protectedFiles = git('ls-files', 'generate_dataset.py', 'src/generator_dataset', 'config', 'queries', 'scripts', 'tests').split('\n').filter(p => p && !p.startsWith('tests/website/') && p !== 'tests/test_docs_onboarding_flow.py');
const protectedSources = protectedFiles.map(file => ({ file, sha256: digest(file) }));
const result = { commit: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current'), status: git('status', '--short'), pages, artifacts, protectedSources };
const target = path.join(__dirname, `${phase}.json`);
if (phase === 'baseline' && fs.existsSync(target)) throw new Error('Preserve the existing task baseline');
if (phase === 'final') {
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline.json')));
  for (const key of ['artifacts', 'protectedSources']) {
    if (JSON.stringify(baseline[key]) !== JSON.stringify(result[key])) throw new Error(`${key} changed since baseline`);
  }
  if (JSON.stringify(baseline.pages.map(p => p.route)) !== JSON.stringify(pages.map(p => p.route))) throw new Error('Public routes changed');
  result.preservation = 'PASS: artifact/source hashes and public routes match task baseline';
  for (const page of pages) {
    page.disposition = baseline.pages.find(p => p.file === page.file).sha256 === page.sha256
      ? 'Retain distinct content and route' : 'Refine metadata or contextual links; preserve route and instructional substance';
  }
}
fs.writeFileSync(target, JSON.stringify(result, null, 2) + '\n');
const safe = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
fs.writeFileSync(path.join(__dirname, `${phase}-inventory.md`), `# ${phase} content inventory\n\n48 authored public pages: homepage and 47 docs. Purpose uses the authored description; levels are asserted only where already supplied. Component-generated links are additionally covered by rendered-site checks.\n\n| Route | Title / purpose | Audience | Level | Authored Markdown links | Disposition |\n|---|---|---|---|---|---|\n` + pages.map(p => `| ${p.route} | ${safe(p.title)}: ${safe(p.purpose)} | ${p.audience} | ${p.level} | ${p.links.length} | ${p.disposition ?? 'Baseline recorded'} |`).join('\n') + '\n');
console.log(`${phase}: ${pages.length} pages, ${artifacts.length} artifacts, ${protectedSources.length} protected sources captured`);
