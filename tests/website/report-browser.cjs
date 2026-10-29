const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { chromium } = require('playwright');
const base = process.env.WEBSITE_BASE_URL || 'http://127.0.0.1:3000';
const output = path.resolve('outputs/_website_reports/browser');
fs.mkdirSync(output, { recursive: true });
const definitions = require('../../src/data/reportPresentation.json');
const { label } = require('../../src/components/ReportViewer/model.cjs');

test('report discovery, all report routes, selected downloads, keyboard and responsive views', { timeout: 3600000 }, async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.WEBSITE_BROWSER_CHANNEL || 'chrome' });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  async function visit(slug) {
    await page.goto(`${base}/docs/analytics/reports/${slug}`);
    await page.getByRole('button', { name: 'Download Excel', exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector('main button')?.disabled);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('main [role="alert"]').count(), 0);
  }
  try {
    await page.goto(`${base}/docs/analytics`);
    await page.waitForFunction(() => document.querySelectorAll('article[id^="report-"]').length === 25);
    assert.equal(await page.getByRole('link', { name: 'View source SQL', exact: true }).count(), 0);
    await page.getByLabel('Include specialist reports').check();
    assert.equal(await page.locator('article[id^="report-"]').count(), 53);
    await page.getByLabel('Include specialist reports').uncheck();
    await page.goto(`${base}/docs/analytics#report-monthly-ap-aging-detail`);
    await page.locator('#report-monthly-ap-aging-detail').waitFor({ state: 'visible' });
    for (const [slug, definition] of Object.entries(definitions)) {
      if (definition.visibility === 'retired') continue;
      await visit(slug);
      assert.equal(await page.getByRole('button', { name: 'Print', exact: true }).count(), 0);
      assert.equal(await page.getByRole('link', { name: 'View source SQL', exact: true }).count(), 1);
      // Exercise each useful entity filter independently on its actual report.
      for (const key of definition.filters) {
        const control = page.getByRole('combobox', { name: label(key), exact: true });
        if (!await control.count()) continue;
        const option = await control.locator('option').nth(1).textContent();
        await control.selectOption({ label: option });
        assert.equal(await page.getByRole('button', { name: 'Download Excel', exact: true }).isDisabled(), false, `${slug}: ${key}`);
        await control.selectOption('');
      }
    }
    await visit('monthly-income-statement');
    await page.getByLabel('Statement view').selectOption('year');
    await page.waitForFunction(() => document.querySelector('main table thead tr')?.children.length === 13);
    await page.getByLabel('Reporting year').selectOption('2025');
    await page.waitForFunction(() => document.querySelector('main table thead')?.textContent.includes('2025-01'));
    for (const extension of ['PDF', 'Excel']) {
      const pending = page.waitForEvent('download', { timeout: 60000 });
      await page.getByRole('button', { name: `Download ${extension}`, exact: true }).click();
      const download = await pending;
      await download.saveAs(path.join(output, download.suggestedFilename()));
      assert.ok(fs.statSync(path.join(output, download.suggestedFilename())).size > 1000);
    }
    await page.screenshot({ path: path.join(output, 'statement-desktop.png'), fullPage: true });
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('main table thead')?.textContent.includes('2026-01'));
    await visit('monthly-revenue-and-gross-margin');
    assert.equal(await page.locator('main table').first().locator('tbody tr').count(), 12);
    await page.getByLabel('Period view').selectOption('year-compare');
    await page.waitForFunction(() => document.querySelector('main table tbody')?.querySelectorAll('tr').length === 24);
    await page.getByLabel('Period view').selectOption('all');
    await page.waitForFunction(() => document.querySelector('main table tbody')?.querySelectorAll('tr').length === 36);
    await page.screenshot({ path: path.join(output, 'revenue-all-periods.png'), fullPage: true });
    await visit('annual-direct-cash-flow');
    assert.equal(await page.locator('main table thead tr').first().locator('th').count(), 4);
    for (const extension of ['PDF', 'Excel']) {
      const pending = page.waitForEvent('download', { timeout: 60000 });
      await page.getByRole('button', { name: `Download ${extension}`, exact: true }).click();
      const download = await pending;
      await download.saveAs(path.join(output, download.suggestedFilename()));
    }
    const csvPending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export Data', exact: true }).click();
    const csv = await csvPending;
    await csv.saveAs(path.join(output, csv.suggestedFilename()));
    assert.equal(fs.readFileSync(path.join(output, csv.suggestedFilename()), 'utf8').trim().split('\r\n').length, 49);
    await page.getByLabel('Statement view').selectOption('compare');
    const comparisonData = page.waitForResponse(response => response.url().endsWith('/annual-direct-cash-flow/2024.json'));
    await page.getByLabel('Reporting year').selectOption('2025');
    await comparisonData;
    await page.waitForFunction(() => document.querySelector('main table thead tr')?.children.length === 3 && !document.querySelector('main button')?.disabled);
    assert.equal(await page.locator('main table thead tr').first().locator('th').count(), 3);
    await page.screenshot({ path: path.join(output, 'annual-direct-cash-comparison.png'), fullPage: true });
    await visit('monthly-ar-aging-summary');
    const customer = page.getByLabel('Customer Name');
    const selected = await customer.locator('option').nth(1).getAttribute('value') || await customer.locator('option').nth(1).textContent();
    await customer.selectOption({ label: selected });
    assert.ok(page.url().includes('CustomerName='));
    await page.getByRole('button', { name: 'Reset selection' }).click();
    await page.getByLabel('Search within selection').fill('no-such-record-xyz');
    await page.getByText('No records match this selection.', { exact: false }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Download Excel', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: 'Reset selection' }).click();
    await page.getByRole('button', { name: 'Next page' }).click();
    assert.ok(page.url().includes('page=2'));
    await page.getByRole('button', { name: 'Previous page' }).focus();
    await page.keyboard.press('Enter');
    assert.ok(page.url().includes('page=1'));
    for (const [width, height] of [[768, 1024], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.screenshot({ path: path.join(output, `aging-${width}.png`), fullPage: true });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    }
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.screenshot({ path: path.join(output, 'aging-dark.png'), fullPage: true });
    await page.goto(`${base}/docs/analytics/reports/pro-forma-monthly-income-statement`);
    await page.getByText('This report has been retired from the report collection.', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});
