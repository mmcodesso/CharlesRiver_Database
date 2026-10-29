const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { buildModel, selectedPeriods, format } = require('../../src/components/ReportViewer/model.cjs');
const root = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'static/report-data/manifest.json')));
const output = path.join(root, 'outputs/_website_reports/exports');
fs.mkdirSync(output, { recursive: true });
function data(report, keys = Object.keys(report.partitions)) {
  return keys.flatMap(key => JSON.parse(fs.readFileSync(path.join(root, 'static', report.partitions[key]))));
}

test('curation covers all reports and preserves the five retirement destinations', () => {
  assert.equal(Object.keys(manifest).length, 48);
  for (const [visibility, expected] of [['core', 20], ['specialist', 23], ['retired', 5]]) {
    assert.equal(Object.values(manifest).filter(r => r.visibility === visibility).length, expected);
  }
  for (const report of Object.values(manifest).filter(r => r.visibility === 'retired')) assert.equal(manifest[report.replacement].visibility, 'core');
});

test('all 43 report partition inventories and default selections are complete', () => {
  for (const report of Object.values(manifest).filter(r => r.visibility !== 'retired')) {
    const all = data(report);
    assert.equal(all.length, report.rowCount, report.slug);
    const periods = selectedPeriods(report, {});
    const input = data(report, periods);
    const model = buildModel(report, input);
    assert.equal(model.source.length, input.length, report.slug);
    assert.equal(model.rows.length, input.length, report.slug);
    assert.ok(model.columns.length > 0);
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
