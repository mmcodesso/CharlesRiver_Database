const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { buildModel, selectedPeriods, filterOptions, format } = require('../../src/components/ReportViewer/model.cjs');
const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'static/report-data/manifest.json')));
const output = path.join(root, 'outputs/_website_reports/exports');
fs.mkdirSync(output, { recursive: true });
function data(report, keys = Object.keys(report.partitions)) {
  return keys.flatMap(key => JSON.parse(fs.readFileSync(path.join(root, 'static', report.partitions[key]))));
}

test('curation covers all reports and preserves the five retirement destinations', () => {
  assert.equal(Object.keys(manifest).length, 58);
  for (const [visibility, expected] of [['core', 25], ['specialist', 28], ['retired', 5]]) {
    assert.equal(Object.values(manifest).filter(r => r.visibility === visibility).length, expected);
  }
  for (const report of Object.values(manifest).filter(r => r.visibility === 'retired')) assert.equal(manifest[report.replacement].visibility, 'core');
});

test('all 53 report inventories, source dimensions and default selections are complete', () => {
  for (const report of Object.values(manifest).filter(r => r.visibility !== 'retired')) {
    const all = data(report);
    assert.equal(all.length, report.rowCount, report.slug);
    const periods = selectedPeriods(report, {});
    const input = data(report, periods);
    const model = buildModel(report, input);
    assert.equal(model.source.length, input.length, report.slug);
    if (report.family !== 'statement') assert.equal(model.rows.length, input.length, report.slug);
    for (const key of [...report.filters, ...report.periodFields]) assert.ok(report.fields.some(field => field.key === key), `${report.slug}: ${key}`);
    assert.ok(model.columns.length > 0);
  }
});

test('single-row monthly reports default to a year and preserve monthly metrics in comparisons', () => {
  const report = manifest['monthly-revenue-and-gross-margin'];
  const source = data(report);
  assert.equal(buildModel(report, source).rows.length, 12);
  assert.equal(buildModel(report, source, { view: 'year-compare', period: '2026' }).rows.length, 24);
  const all = buildModel(report, source, { view: 'all' });
  assert.equal(all.rows.length, 36);
  assert.equal(all.columns[0].key, 'reportPeriod');
  assert.deepEqual(all.rows.map(row => row.values.GrossMarginPct), source.map(row => row.GrossMarginPct));
  assert.deepEqual(all.totals, {}, 'No percentage or cross-year totals are invented');
});

test('snapshot comparisons retain the date and do not total repeated balances', () => {
  const report = manifest['monthly-ar-aging-summary'];
  const model = buildModel(report, data(report), { view: 'compare' });
  assert.equal(model.periods.length, 2);
  assert.equal(model.columns[0].key, 'reportPeriod');
  assert.deepEqual(model.totals, {});
  assert.match(model.note, /not added/);
  assert.equal(selectedPeriods(report, { view: 'year' }).length, 1);
});

test('entity filters cascade and payroll bridge exposes actual period ends', () => {
  const report = manifest['monthly-ar-aging-summary'];
  const source = data(report, selectedPeriods(report));
  const region = source[0].Region;
  const options = filterOptions(report, source, { Region: region }, 'CustomerName');
  assert.ok(options.length);
  assert.deepEqual(options, [...new Set(source.filter(row => row.Region === region).map(row => row.CustomerName))].sort());
  const payroll = manifest['punch-to-pay-bridge-for-hourly-workers'];
  assert.deepEqual(payroll.periodFields, ['PeriodEndDate']);
  assert.ok(selectedPeriods(payroll, {}).every(key => /^\d{4}-\d{2}-\d{2}$/.test(key)));
});

test('annual statements retain year-end balances and cash endpoints from their matching monthly queries', () => {
  const pairs = [['annual-balance-sheet', 'monthly-balance-sheet'], ['annual-direct-cash-flow', 'monthly-direct-cash-flow'], ['annual-indirect-cash-flow', 'monthly-indirect-cash-flow'], ['annual-income-statement', 'monthly-income-statement']];
  for (const [annualKey, monthlyKey] of pairs) {
    const annual = data(manifest[annualKey]);
    const monthly = data(manifest[monthlyKey]);
    for (const line of annual) {
      const candidates = monthly.filter(row => row.FiscalYear === line.FiscalYear && row.LineLabel === line.LineLabel && row.StatementSection === line.StatementSection);
      const endpoint = annualKey === 'annual-balance-sheet' || line.LineLabel === 'Ending Cash' ? '12' : line.LineLabel === 'Beginning Cash' ? '1' : null;
      const amount = endpoint ? candidates.find(row => row.FiscalPeriod === endpoint)?.Amount : candidates.reduce((sum, row) => sum + Math.round(row.Amount * 100), 0) / 100;
      assert.ok(Math.abs(amount - line.Amount) < .02, `${annualKey}: ${line.FiscalYear} ${line.LineLabel}`);
    }
    const model = buildModel(manifest[annualKey], annual);
    assert.equal(model.columns.length, 4, 'All three years are compared by default');
    assert.equal(buildModel(manifest[annualKey], annual, { view: 'compare', period: '2025' }).columns.length, 3);
  }
});

test('statements pivot source lines without adding subtotals or snapshot balances', () => {
  for (const slug of ['monthly-income-statement', 'monthly-balance-sheet', 'monthly-indirect-cash-flow']) {
    const report = manifest[slug];
    const source = data(report);
    const state = { period: '2026-12', view: 'year' };
    const model = buildModel(report, source, state);
    assert.equal(model.columns.length, 13);
    assert.equal(model.rows.length * 12, model.source.length);
    for (const raw of model.source) {
      const line = model.rows.find(row => row.order === Number(raw.DisplayOrder) && row.values.label.endsWith(raw.LineLabel));
      assert.equal(line.values[`${raw.FiscalYear}-${String(raw.FiscalPeriod).padStart(2, '0')}`], raw.Amount);
    }
    assert.deepEqual(selectedPeriods(report, { period: '2025-01', view: 'compare' }), ['2024-12', '2025-01']);
    assert.deepEqual(selectedPeriods(report, { period: '2024-01', view: 'compare' }), ['2024-01']);
  }
});

test('aging selection totals use complete filtered source and decimal cents', () => {
  const report = manifest['monthly-ar-aging-summary'];
  const input = data(report, selectedPeriods(report, {}));
  const customer = input[0].CustomerName;
  const model = buildModel(report, input, { CustomerName: customer });
  assert.ok(model.source.every(row => row.CustomerName === customer));
  assert.equal(model.totals.TotalOpenAmount, model.source.reduce((sum, row) => sum + Math.round(row.TotalOpenAmount * 100), 0) / 100);
  assert.equal(buildModel(report, input, { q: 'no-such-record-xyz' }).rows.length, 0);
});

test('cumulative reports have no invented period and percent formats retain source units', () => {
  const report = manifest['sales-and-margin-by-collection-and-style'];
  assert.deepEqual(report.periodFields, []);
  assert.deepEqual(selectedPeriods(report, { period: '2026-12' }), ['all']);
  assert.equal(format(45.41, 'percent', 'GrossMarginPct'), '45.41%');
  assert.equal(format(.1234, 'percent', 'AbsenceRate'), '12.34%');
  assert.equal(format(-1234.5, 'money'), '(1,234.50)');
  assert.equal(format(null, 'money'), '—');
});

test('PDF and Excel exports cover each family with typed data and print settings', async () => {
  const { createExport } = await import('../../src/components/ReportViewer/exports.js');
  const ExcelJS = require('exceljs');
  for (const slug of ['monthly-income-statement', 'monthly-ar-aging-summary', 'potential-anomaly-review', 'payroll-liability-rollforward']) {
    const report = manifest[slug];
    const model = buildModel(report, data(report, selectedPeriods(report, {})));
    const request = { report, model, company: 'Charles River Home Furnishings, Inc.', basis: 'Verified source period basis.' };
    const xlsx = await createExport({ ...request, type: 'xlsx' });
    const file = path.join(output, `${slug}.xlsx`);
    fs.writeFileSync(file, Buffer.from(xlsx.bytes));
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file);
    assert.deepEqual(workbook.worksheets.map(s => s.name), ['Report', 'Data', 'Read Me']);
    assert.equal(workbook.getWorksheet('Data').rowCount, model.source.length + 1);
    assert.equal(workbook.getWorksheet('Report').pageSetup.printTitlesRow, '1:6');
    assert.ok(workbook.getWorksheet('Report').pageSetup.printArea);
    const pdf = await createExport({ ...request, type: 'pdf' });
    fs.writeFileSync(path.join(output, `${slug}.pdf`), Buffer.from(pdf.bytes));
    assert.equal(Buffer.from(pdf.bytes).subarray(0, 4).toString(), '%PDF');
  }
});

test('PDF guard never silently truncates large selections', async () => {
  const { createExport } = await import('../../src/components/ReportViewer/exports.js');
  await assert.rejects(createExport({ type: 'pdf', model: { source: Array(10001).fill({}) } }), /narrower/);
  await assert.rejects(createExport({ type: 'xlsx', model: { source: [] } }), /no rows/);
});
