const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const local = path.join(root, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const python = process.env.REPORTS_PYTHON || (fs.existsSync(local) ? local : 'python3');
(async () => {
  const published = process.env.CI === 'true' || process.env.WORKERS_CI === '1';
  if (published) await require('./reuse-published-reports.cjs')();
  const args = [path.join(__dirname, 'prepare-report-presentation.py'), ...(published ? ['--published-inputs'] : [])];
  const result = spawnSync(python, args, { cwd: root, stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
})().catch(error => { console.error(error.message); process.exitCode = 1; });
