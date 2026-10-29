function label(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function periodKey(row, fields) {
  if (fields.length === 2) return `${row[fields[0]]}-${String(row[fields[1]]).padStart(2, '0')}`;
  return fields.length ? String(row[fields[0]]) : 'all';
}

function selectedPeriods(report, state) {
  const available = Object.keys(report.partitions).sort();
  const selected = available.includes(state.period) ? state.period : available.at(-1);
  if (report.family !== 'statement' || state.view === 'month' || !state.view) return [selected];
  if (state.view === 'year') return available.filter(key => key.startsWith(selected.slice(0, 4)));
  const [year, month] = selected.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  const previous = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return [previous, selected].filter(key => available.includes(key));
}

function matches(row, state, filters) {
  const query = (state.q || '').trim().toLowerCase();
  return (!query || Object.values(row).some(value => String(value ?? '').toLowerCase().includes(query))) &&
    filters.every(key => !state[key] || String(row[key] ?? '') === state[key]);
}

function buildModel(report, input, state = {}) {
  const periods = selectedPeriods(report, state);
  const source = input.filter(row => periods.includes(periodKey(row, report.periodFields)) && (report.family === 'statement' || matches(row, state, report.filters)));
  const fields = report.fields;
  let columns, rows;
  if (report.family === 'statement') {
    columns = [{ key: 'label', label: 'Account / statement line', kind: 'text' }, ...periods.map(key => ({ key, label: key, kind: 'money' }))];
    const lines = new Map();
    for (const row of source) {
      const key = `${row.DisplayOrder}|${row.StatementSection}|${row.AccountNumber || ''}|${row.LineLabel}`;
      if (!lines.has(key)) lines.set(key, { order: Number(row.DisplayOrder), group: row.StatementSection, type: row.LineType, values: { label: `${row.AccountNumber ? `${row.AccountNumber}  ` : ''}${row.LineLabel}` } });
      const line = lines.get(key);
      const period = periodKey(row, report.periodFields);
      if (Object.hasOwn(line.values, period)) throw new Error('Duplicate statement line in source data.');
      line.values[period] = row.Amount;
    }
    rows = [...lines.values()].sort((a, b) => a.order - b.order);
  } else {
    columns = fields.filter(field => !report.periodFields.includes(field.key));
    rows = source.map(row => ({ values: row, group: report.groupBy ? String(row[report.groupBy] ?? 'Unspecified') : '', type: 'detail' }));
    if (report.groupBy) rows.sort((a, b) => a.group.localeCompare(b.group));
    const groupCounts = new Map();
    rows.forEach(row => groupCounts.set(row.group, (groupCounts.get(row.group) || 0) + 1));
    rows.forEach(row => { if (groupCounts.get(row.group) === 1) row.group = ''; });
  }
  const filters = report.filters.filter(key => state[key]).map(key => `${label(key)}: ${state[key]}`);
  if (state.q) filters.push(`Search: ${state.q}`);
  const totals = {};
  for (const key of report.totals) totals[key] = Math.round(source.reduce((sum, row) => sum + Math.round(Number(row[key] || 0) * 100), 0)) / 100;
  return { columns, rows, source, totals, periods, selection: [periods[0] === 'all' ? 'Snapshot / cumulative scope' : periods.join(', '), ...filters].join('; ') };
}

function format(value, kind, key = '') {
  if (value === null || value === undefined || value === '') return '—';
  if (kind === 'text' || kind === 'date') return String(value);
  const number = Number(value);
  if (kind === 'percent') return `${(key === 'AbsenceRate' ? number * 100 : number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  const absolute = Math.abs(number).toLocaleString('en-US', { minimumFractionDigits: kind === 'integer' ? 0 : 2, maximumFractionDigits: kind === 'integer' ? 0 : 2 });
  return number < 0 ? `(${absolute})` : absolute;
}

module.exports = { label, periodKey, selectedPeriods, matches, buildModel, format };
