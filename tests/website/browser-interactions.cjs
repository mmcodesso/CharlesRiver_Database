// Uses the cloud runtime's existing Playwright and Chromium; no project dependencies added.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, before, after } = require('node:test');
const { chromium } = require('playwright');

const base = process.env.WEBSITE_BASE_URL || 'http://127.0.0.1:3000';
const output = path.resolve('outputs/_website_teaching_refinement/browser');
let browser, context, page;
const browserErrors = [];
before(async () => {
  fs.mkdirSync(output, { recursive: true });
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
  page = await context.newPage();
  page.on('pageerror', error => browserErrors.push(error.message));
});
after(async () => { await browser?.close(); assert.deepEqual(browserErrors, [], 'No uncaught application errors in the checked browser routes'); });

async function visit(route) {
  const response = await page.goto(base + route);
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => document.documentElement.dataset.hasHydrated === 'true');
}

async function assertModal(dialog, opener) {
  await dialog.waitFor({ state: 'visible' });
  assert.equal(await dialog.evaluate(element => element.matches(':modal')), true, 'Native modal puts the background outside the active interaction scope');
  assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true);
  assert.equal(await page.evaluate(() => {
    document.querySelector('nav a[href]')?.focus();
    return !!document.activeElement.closest('dialog[open]');
  }), true, 'Background cannot receive focus while the native modal is open');
  const controls = dialog.locator('button:not([disabled]), [tabindex="0"]');
  await controls.last().focus();
  await page.keyboard.press('Tab');
  assert.equal(await controls.first().evaluate(element => element === document.activeElement), true, 'Tab wraps');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await controls.last().evaluate(element => element === document.activeElement), true, 'Shift+Tab wraps');
  const name = (await dialog.getAttribute('aria-label')).replace(/[^a-z0-9]+/gi, '-');
  await page.screenshot({ path: path.join(output, `dialog-${name}.png`) });
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.equal(await opener.evaluate(element => element === document.activeElement), true, 'Focus returns to the exact opener');
}

test('report preview recovers from a failed fetch and has native modal focus behavior', { timeout: 3600000 }, async () => {
  let requests = 0;
  const previewPattern = '**/reports/financial/monthly-close-and-statements/monthly-income-statement/preview.json';
  await page.route(previewPattern, async route => {
    if (requests++ === 0) await route.fulfill({ status: 503, contentType: 'text/plain', body: 'Induced browser regression failure' });
    else await route.continue();
  });
  await visit('/docs/analytics');
  const opener = page.getByRole('button', { name: 'Preview Monthly Income Statement', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Monthly Income Statement preview', exact: true });
  await dialog.getByRole('alert').waitFor();
  await dialog.getByRole('button', { name: 'Retry Monthly Income Statement preview', exact: true }).click();
  await dialog.locator('table tbody tr').first().waitFor();
  assert.equal(requests, 2);
  await assertModal(dialog, opener);
  await page.unroute(previewPattern);
});

test('all reports expose exact SQL links; a filtered query deep link recovers and retries SQL', { timeout: 3600000 }, async () => {
  await visit('/docs/analytics');
  const sourceLinks = page.getByRole('link', { name: /^View source SQL for / });
  assert.equal(await sourceLinks.count(), 48);
  const links = await sourceLinks.evaluateAll(elements => elements.map(element => element.getAttribute('href')));
  assert.equal(new Set(links).size, 48);
  assert.ok(links.every(link => link.startsWith('/docs/analytics/analysis-tracks#query-')));
  await page.getByRole('link', { name: 'View source SQL for Monthly Income Statement', exact: true }).click();
  const anchor = 'query-financial-27-income-statement-monthly';
  await page.locator('#' + anchor).waitFor();
  await visit('/docs/analytics/analysis-tracks?cr_queries_q=no-such-query&cr_queries_topic=people-and-payroll#' + anchor);
  await page.locator('#' + anchor).waitFor();
  await page.waitForFunction(() => !new URLSearchParams(location.search).has('cr_queries_q'));
  const article = page.locator('article[aria-label]').filter({ has: page.locator('#' + anchor) });
  let requests = 0;
  const sqlPattern = '**/financial/27_income_statement_monthly.sql';
  await page.route(sqlPattern, async route => {
    if (requests++ === 0) await route.fulfill({ status: 503, contentType: 'text/plain', body: 'Induced SQL fetch failure' });
    else await route.continue();
  });
  await article.getByRole('button', { name: /^Show SQL/ }).click();
  await article.getByRole('button', { name: /Retry.*SQL/ }).click();
  await article.locator('pre code').waitFor();
  assert.ok((await article.locator('pre code').innerText()).includes('SELECT'));
  assert.equal(requests, 2);
  const copy = article.getByRole('button', { name: /Copy code/ });
  await copy.click();
  await article.getByRole('button', { name: /Copied/ }).waitFor();
  await page.unroute(sqlPattern);
});

test('catalog filters survive reload, empty states, reset and back/forward', { timeout: 3600000 }, async () => {
  await visit('/docs/analytics');
  const search = page.getByRole('searchbox', { name: 'Search reports' });
  await search.fill('no-report-can-match-this-population');
  await page.getByText('Showing 0 of 48 reports', { exact: true }).waitFor();
  assert.ok(page.url().includes('cr_reports_q='));
  await page.reload();
  await page.getByText('Showing 0 of 48 reports', { exact: true }).waitFor();
  assert.equal(await search.inputValue(), 'no-report-can-match-this-population');
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.getByText('Showing 48 of 48 reports', { exact: true }).waitFor();
  await page.goBack();
  await page.getByText('Showing 0 of 48 reports', { exact: true }).waitFor();
  await page.goForward();
  await page.getByText('Showing 48 of 48 reports', { exact: true }).waitFor();
  await page.getByRole('combobox', { name: 'Business topic', exact: true }).selectOption('people-and-payroll');
  assert.ok(page.url().includes('cr_reports_topic=people-and-payroll'));
  await visit('/docs/analytics?cr_reports_q=impossible#report-monthly-income-statement');
  await page.locator('#report-monthly-income-statement').waitFor();
  await page.waitForFunction(() => !new URLSearchParams(location.search).has('cr_reports_q'));
});

test('Mermaid and BPMN viewers preserve naming, keyboard zoom, Escape, focus return and inert background', { timeout: 3600000 }, async () => {
  await visit('/docs/processes/o2c');
  // Mermaid diagrams render asynchronously; wait for this specific wide record map,
  // rather than selecting whichever of several diagrams finishes rendering first.
  const mermaidOpener = page.getByRole('button', { name: 'Expand Goods sale and customer settlement records diagram', exact: true });
  await mermaidOpener.waitFor();
  assert.ok(!(await mermaidOpener.getAttribute('aria-label')).includes('Record relationship diagram'));
  await mermaidOpener.focus();
  await page.keyboard.press('Enter');
  let dialog = page.locator('dialog[open]');
  await dialog.locator('svg').waitFor();
  const waitForFittedDiagram = () => page.waitForFunction(() => {
    const svg = document.querySelector('dialog[open] svg');
    const viewport = svg?.closest('[role="region"]');
    if (!svg || !viewport || !svg.style.transform) return false;
    const bounds = svg.getBoundingClientRect(), area = viewport.getBoundingClientRect();
    return bounds.width > area.width * 0.65 && bounds.left >= area.left && bounds.right <= area.right && bounds.height <= area.height;
  });
  await waitForFittedDiagram();
  const viewport = dialog.getByRole('region');
  await viewport.focus();
  await page.keyboard.press('+');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('0');
  await waitForFittedDiagram();
  await assertModal(dialog, mermaidOpener);
  const bpmnOpener = page.getByRole('button', { name: /^Expand .* model$/ }).first();
  await bpmnOpener.focus();
  await page.keyboard.press('Space');
  dialog = page.locator('dialog[open]');
  await dialog.locator('img').waitFor();
  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await dialog.getByRole('button', { name: 'Reset', exact: true }).click();
  await assertModal(dialog, bpmnOpener);
});

test('representative phone/tablet/desktop and theme layouts retain horizontal containment', { timeout: 3600000 }, async () => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      for (const route of ['/docs/reference/posting', '/docs/analytics', '/docs/analytics/analysis-tracks', '/docs/analytics/cases']) {
        await visit(route);
        await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} ${width}px ${theme}: document stays within the viewport while tables/code scroll`);
        if (route === '/docs/reference/posting') await page.screenshot({ path: path.join(output, `posting-${width}-${theme}.png`) });
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit('/docs/analytics/cases/workforce-coverage-and-attendance-case');
  for (const factor of [2, 4]) {
    await page.evaluate(value => { document.documentElement.style.zoom = String(value); }, factor);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `CSS ${factor * 100}% zoom stress: no page-wide overflow`);
    await page.screenshot({ path: path.join(output, `workforce-css-zoom-${factor}.png`) });
  }
  await page.evaluate(() => { document.documentElement.style.zoom = ''; });
});
