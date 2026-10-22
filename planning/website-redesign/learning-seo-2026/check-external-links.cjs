// Read-only external checks; HEAD for downloads avoids transferring datasets.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
process.chdir(root);
const baseline = require('./baseline.json');
const urls = new Set([
  'https://accountinganalyticshub.com/', 'https://accountinganalyticshub.com/charles-river/',
  'https://aa.accountinganalyticshub.com/', 'https://doi.org/10.5281/zenodo.23428083',
  'https://doi.org/10.5281/zenodo.23428084',
  'https://github.com/mmcodesso/CharlesRiver_Database/releases/tag/v2027.1',
  ...['CharlesRiver.sqlite', 'CharlesRiver.xlsx', 'CharlesRiver_csv.zip'].map(name =>
    'https://github.com/mmcodesso/CharlesRiver_Database/releases/latest/download/' + name),
]);
for (const page of baseline.pages) {
  const source = fs.readFileSync(page.file, 'utf8');
  for (const match of source.matchAll(/https:\/\/(?:aa\.accountinganalyticshub\.com|accountinganalyticshub\.com|github\.com|doi\.org)[^\s)"<>`]+/g)) {
    if (!match[0].includes('{')) urls.add(match[0]);
  }
}
const results = [];
const pending = [...urls].sort();
async function worker() {
  while (pending.length) {
    const url = pending.shift();
    const isDownload = url.includes('/download/');
    try {
      const response = await fetch(url, { method: isDownload ? 'HEAD' : 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000) });
      const entry = { url, method: isDownload ? 'HEAD' : 'GET', status: response.status,
        finalUrl: response.url.split('?')[0], contentType: response.headers.get('content-type') };
      if (!isDownload && response.ok && entry.contentType?.includes('text/html')) {
        const html = await response.text();
        const fragment = new URL(url).hash.slice(1);
        if (fragment) entry.fragmentFound = html.includes(`id="${decodeURIComponent(fragment)}"`) || html.includes(`id='${decodeURIComponent(fragment)}'`);
      } else if (response.body) await response.body.cancel();
      results.push(entry);
    } catch (error) { results.push({ url, error: error.message }); }
  }
}
Promise.all(Array.from({ length: 4 }, worker)).then(() => {
  results.sort((a,b) => a.url.localeCompare(b.url));
  fs.writeFileSync(path.join(__dirname, 'external-links.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
  console.log(`${results.length} external URLs checked`);
  console.log(JSON.stringify(results.filter(r => r.error || r.status >= 400 || r.fragmentFound === false), null, 2));
});
