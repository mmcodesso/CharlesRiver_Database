// Reuse existing published bytes in temporary build storage; never call an exporter.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const inputs = require('../planning/website-redesign/reports-2026/publication-inputs.json');
const root = path.resolve(__dirname, '..');
const staging = path.join(root, 'outputs/_published_report_assets');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

module.exports = async function reusePublishedReports() {
  const queue = [...inputs.files];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const file = queue.shift();
      const target = path.join(staging, file.path);
      if (fs.existsSync(target)) {
        if (sha(fs.readFileSync(target)) !== file.sha256) throw new Error(`Cached published asset checksum mismatch: ${file.path}`);
        continue;
      }
      const response = await fetch(`${inputs.origin}/${file.path}`, { signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`Missing published prerequisite: ${file.path} (${response.status})`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (sha(bytes) !== file.sha256) throw new Error(`Published prerequisite checksum mismatch: ${file.path}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes, { flag: 'wx' });
    }
  }));
  return path.join(staging, 'reports');
};
