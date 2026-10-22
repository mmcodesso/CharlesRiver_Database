// Raster export of the authored vector; no data or report generation.
// Uses an existing Playwright runtime and installed browser, not project deps.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../../..');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.WEBSITE_CHROMIUM_PATH, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    const svg = fs.readFileSync(path.join(root, 'static/img/charles-river-learning-social.svg'), 'utf8');
    await page.setContent('<html><body style="margin:0">' + svg + '</body></html>');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, 'static/img/charles-river-learning-social.png') });
  } finally { await browser.close(); }
})();
