const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const yaml = require('js-yaml');
const { loadSiteBranding } = require('../../config/loadSiteBranding.cjs');
const { TEACHING_RELEASE } = require('../../src/data/teachingRelease.cjs');
const { getReleaseDownloadUrl, buildDatasetStructuredData } = require('../../src/components/SiteBranding/structuredData.cjs');

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const drafts = require('../../planning/website-redesign/cases/case-drafts.json');
const lessons = require('../../src/data/tutorialLessons.json');
const models = require('../../src/data/bpmnModels.json');
const reports = yaml.load(read('config/report_catalog.yaml')).reports;
const esModule = file => import(`data:text/javascript;base64,${Buffer.from(read(file)).toString('base64')}`);
const built = route => {
  const file = [`build${route}.html`, `build${route}/index.html`].find(file => fs.existsSync(path.join(root, file)));
  assert.ok(file, `Build the site first: ${route}`);
  return read(file);
};

test('F01/F02/F12 corrected procedure stays in authoring source and all eight published routes', () => {
  for (const item of drafts) {
    const text = read(`docs/analytics/cases/${item.slug}.md`);
    const excelRoutes = [...text.matchAll(/<TabItem value="excel">([\s\S]*?)<\/TabItem>/g)];
    assert.ok(excelRoutes.length > 0, item.slug);
    for (const [, route] of excelRoutes) {
      assert.ok(route.includes('**Named inputs:**'), `${item.slug}: named inputs`);
      assert.ok(route.includes('**Produced outputs:**'), `${item.slug}: produced outputs`);
    }
    for (const section of item.sections) for (const stage of section.stages) {
      assert.ok(stage.excelInputs?.length, `${item.slug}: ${stage.title}`);
      assert.ok(stage.excelOutputs?.length, `${item.slug}: ${stage.title}`);
      for (const name of [...stage.excelInputs, ...stage.excelOutputs]) {
        assert.ok(text.includes('`' + name + '`'), `${item.slug}: stale rendered stage ${name}`);
      }
    }
  }
  const workforce = read('docs/analytics/cases/workforce-coverage-and-attendance-case.md');
  for (const name of ['ApprovedTime', 'HoursByEmployeePeriod', 'CentersByEmployeePeriod', 'UnassignedCenterByEmployeePeriod']) {
    assert.ok(workforce.includes(name));
    assert.ok(JSON.stringify(drafts.find(item => item.number === 6)).includes(name));
  }
  const audit = read('docs/analytics/cases/audit-review-pack-case.md');
  assert.ok(audit.includes('These 336 time entries lack a linked approval record under this test; this does not establish that the associated employees lacked authorization outside the file.'));
  assert.doesNotMatch(audit, /336 employees/);
  const sale = read('docs/analytics/cases/o2c-trace-case.md').split('### 1.2.')[1].split('### 1.3.')[0];
  const importInstruction = sale.indexOf('Import Shipment as ShipmentData, ShipmentLine as ShipmentLineData, SalesInvoice as SalesInvoiceData, and SalesInvoiceLine as SalesInvoiceLineData');
  const mergeInstruction = sale.indexOf('reference SalesInvoiceLineData as BilledByOrderLine');
  assert.ok(importInstruction >= 0 && mergeInstruction > importInstruction);
  assert.match(read('docs/analytics/cases/o2c-trace-case.md'), /Reference the raw SalesInvoiceData imported in Session 1\.2 as Invoices/);
});

test('F06 March and Q1 filters name their distinct explicit inclusive/exclusive bounds', () => {
  const guide = read('docs/analytics/excel-guide.md');
  const march = guide.split('\n').find(line => line.startsWith('| March 2024 |'));
  const quarter = guide.split('\n').find(line => line.startsWith('| Q1 2024 |'));
  assert.ok(march.includes("OrderDate >= '2024-03-01' AND OrderDate < '2024-04-01'"));
  assert.ok(quarter.includes("OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01'"));
  assert.ok(march.includes('March 1') && march.includes('April 1'));
  assert.ok(quarter.includes('January 1') && quarter.includes('April 1'));
});

test('F07 first model activities match the same transaction event', () => {
  const targets = {
    'cash-application': 'follow-customer-settlement',
    'accrual-settlement': 'follow-an-estimate-into-settlement',
    'design-services': 'follow-design-time-into-billing',
    payroll: 'follow-hours-into-payroll',
    'manual-journals-close': 'follow-an-estimate-into-settlement',
  };
  for (const [id, lesson] of Object.entries(targets)) {
    assert.equal(models.find(model => model.id === id).exercisePath, '/docs/learn-and-practice/' + lesson);
  }
  assert.ok(models.some(model => model.exercisePath.endsWith('/bpmn-controls-workshop')));
});

test('F08/E03 catalog, authored cases, sidebar, homepage and rendered index have inventory parity', async () => {
  const { caseCatalog } = await esModule('src/data/caseCatalog.js');
  const sidebar = require('../../sidebars.js').docsSidebar.find(item => item.label === 'Cases');
  const pages = fs.readdirSync(path.join(root, 'docs/analytics/cases')).filter(file => file.endsWith('-case.md'));
  assert.equal(caseCatalog.length, 8);
  assert.equal(caseCatalog.reduce((count, item) => count + item.sessions, 0), 23);
  assert.deepEqual(caseCatalog.map(item => item.slug), drafts.map(item => item.slug));
  assert.deepEqual(sidebar.items, caseCatalog.map(item => 'analytics/cases/' + item.slug));
  assert.deepEqual(pages.sort(), caseCatalog.map(item => item.slug + '.md').sort());
  assert.match(read('src/pages/index.jsx'), /caseCatalog\.length/);
  const home = built('/');
  assert.match(home.replace(/<!--.*?-->/g, ''), /Explore all 8 cases/);
  assert.doesNotMatch(home, /Explore all 17 cases/);
  const index = built('/docs/analytics/cases');
  for (const item of caseCatalog) assert.ok(index.includes(`/docs/analytics/cases/${item.slug}`));
  assert.match(index, /23 sessions/);
  assert.match(index, /23[–-]34\.5 estimated hours/);
  assert.equal(reports.length, 48);
  assert.equal(require('../../src/data/queryTopics.json').flatMap(topic => topic.queries).length, 170);
});

test('F11 classroom downloads and Dataset metadata remain pinned when latest changes', () => {
  const branding = { ...loadSiteBranding(), releaseBaseUrl: 'https://example.invalid/releases/latest/download', latestReleaseUrl: 'https://example.invalid/releases/tag/v9999.1' };
  assert.equal(TEACHING_RELEASE.tag, 'v2027.1');
  assert.equal(TEACHING_RELEASE.version, '2027.1');
  assert.equal(TEACHING_RELEASE.sqliteSha256, 'de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c');
  const dataset = buildDatasetStructuredData(branding);
  assert.equal(dataset.version, TEACHING_RELEASE.version);
  for (const [type, suffix] of [['sqlite', '.sqlite'], ['excel', '.xlsx'], ['csv', '_csv.zip']]) {
    const url = `${branding.repositoryUrl}/releases/download/v2027.1/${branding.shortName}${suffix}`;
    assert.equal(getReleaseDownloadUrl(branding, type), url);
    assert.ok(dataset.distribution.some(item => item.contentUrl === url));
  }
  const downloads = built('/docs/downloads');
  assert.ok(downloads.includes(TEACHING_RELEASE.sqliteSha256));
  assert.ok(downloads.includes('/releases/tag/v2027.1'));
});

test('E03 every prerequisite is individually reachable and matches its authored source', async () => {
  const { caseCatalog } = await esModule('src/data/caseCatalog.js');
  for (const item of caseCatalog) {
    assert.deepEqual(item.prerequisiteLinks, drafts.find(draft => draft.slug === item.slug).prerequisiteLinks);
    assert.ok(item.prerequisiteLinks.length > 0);
    assert.ok(item.readiness.some(line => /cohort.*cutoff.*row key.*aggregated.*limitation/.test(line)));
    assert.equal(new Set(item.prerequisiteLinks.map(link => link.to)).size, item.prerequisiteLinks.length);
    for (const link of item.prerequisiteLinks) {
      assert.ok(link.label && link.to.startsWith('/docs/'));
      assert.doesNotMatch(link.label, /\d[–-]\d/);
      assert.ok(built(link.to).includes('<h1'));
    }
  }
  assert.deepEqual(caseCatalog[0].prerequisiteLinks.map(link => link.to), lessons.slice(0, 6).map(lesson => '/docs/learn-and-practice/' + lesson.id));
  const explorer = read('src/components/CaseExplorer/index.jsx');
  assert.ok(explorer.includes('prerequisiteLinks'));
});

test('E04 every report resolves to its exact existing SQL anchor and has teaching metadata', async () => {
  const { queryAnchor, queryLibraryLink } = await esModule('src/components/CatalogNavigation/queryLinks.js');
  const teaching = require('../../src/data/reportTeachingMetadata.json');
  const queryHtml = built('/docs/analytics/analysis-tracks');
  const reportHtml = built('/docs/analytics');
  assert.deepEqual(Object.keys(teaching).sort(), reports.map(report => report.slug).sort());
  assert.equal(queryAnchor('queries/financial/27_income_statement_monthly.sql'), 'query-financial-27-income-statement-monthly');
  for (const report of reports) {
    assert.equal(queryAnchor(report.query_path), queryAnchor(report.query_path.replace(/^queries\//, '')));
    const link = queryLibraryLink(report.query_path);
    const anchor = link.split('#')[1];
    assert.ok(queryHtml.includes(`id="${anchor}"`), report.slug);
    const card = reportHtml.split(`id="report-${report.slug}"`)[1]?.split('</article>')[0];
    assert.ok(card, report.slug);
    assert.ok(card.includes(`href="${link}"`), `${report.slug}: exact source SQL`);
    const metadata = teaching[report.slug];
    assert.ok(metadata.grain.length >= 10 && metadata.periodBasis.length >= 15);
    for (const target of [metadata.process, metadata.lesson]) {
      assert.ok(target.label && built(target.to).includes('<h1'));
      assert.ok(card.includes(`href="${target.to}"`));
    }
  }
});

test('E05 repeated query and report controls expose distinct names in server-rendered content', () => {
  const queryHtml = built('/docs/analytics/analysis-tracks');
  const queryNames = [...queryHtml.matchAll(/aria-label="Show SQL for ([^"]+)"/g)].map(match => match[1]);
  assert.equal(queryNames.length, 170);
  assert.equal(new Set(queryNames).size, 170);
  const reportHtml = built('/docs/analytics');
  for (const prefix of ['Preview', 'Download Excel for', 'Download CSV for', 'View source SQL for']) {
    const names = [...reportHtml.matchAll(new RegExp(`aria-label="${prefix} ([^"]+)"`, 'g'))].map(match => match[1]);
    assert.equal(names.length, 48, prefix);
    assert.equal(new Set(names).size, 48, prefix);
  }
});
