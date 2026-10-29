function label(key) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function periodKey(row, fields) {
  if (fields.length === 2) return `${row[fields[0]]}-${String(row[fields[1]]).padStart(2, '0')}`;
  return fields.length ? String(row[fields[0]]) : 'all';
}

function periodViews(report) {
  if (!report.periodFields.length) return [];
  if (report.temporalType === 'annual' || report.periodFields[0] === 'FiscalYear' && report.periodFields.length === 1) return ['month', 'compare', 'all'];
  if (report.temporalType === 'snapshot') return ['month', 'compare'];
  return ['month', 'compare', 'year', 'year-compare', 'all'];
}

function periodSelection(report, state = {}) {
  const available = Object.keys(report.partitions).sort();
  const modes = periodViews(report);
  const view = modes.includes(state.view) ? state.view : report.defaultView || 'month';
  const requested = state.period || '';
  const selected = available.includes(requested) ? requested : available.filter(key => key.startsWith(requested)).at(-1) || available.at(-1);
  return { available, selected, view, modes };
}

function selectedPeriods(report, state = {}) {
  const { available, selected, view } = periodSelection(report, state);
  if (!report.periodFields.length) return ['all'];
  if (view === 'all') return available;
  if (view === 'month') return [selected];
  if (view === 'year') return available.filter(key => key.startsWith(selected.slice(0, 4)));
  if (view === 'year-compare') return available.filter(key => [selected.slice(0, 4), String(Number(selected.slice(0, 4)) - 1)].includes(key.slice(0, 4)));
  if (selected.length === 4) return [String(Number(selected) - 1), selected].filter(key => available.includes(key));
  if (selected.length > 7) return [available[available.indexOf(selected) - 1], selected].filter(Boolean);
  const [year, month] = selected.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 2, 1));
  const previous = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return [previous, selected].filter(key => available.includes(key));
}

function filterOptions(report, input, state, key) {
  return [...new Set(input.filter(row => matches(row, { ...state, [key]: '' }, report.filters)).map(row => String(row[key] ?? '')))].filter(Boolean).sort();
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
    columns = [...(periods.length > 1 && report.periodFields.length ? [{ key: 'reportPeriod', label: 'Period', kind: 'text' }] : []), ...fields.filter(field => !report.periodFields.includes(field.key))];
    rows = source.map(row => ({ values: { ...row, reportPeriod: periodKey(row, report.periodFields) }, group: report.groupBy ? String(row[report.groupBy] ?? 'Unspecified') : '', type: 'detail' }));
    rows.sort((a, b) => a.group.localeCompare(b.group) || a.values.reportPeriod.localeCompare(b.values.reportPeriod));
    const groupCounts = new Map();
    rows.forEach(row => groupCounts.set(row.group, (groupCounts.get(row.group) || 0) + 1));
    rows.forEach(row => { if (groupCounts.get(row.group) === 1) row.group = ''; });
  }
  const filters = report.filters.filter(key => state[key]).map(key => `${label(key)}: ${state[key]}`);
  if (state.q && report.family !== 'statement') filters.push(`Search: ${state.q}`);
  const totals = {};
  for (const key of report.temporalType === 'snapshot' && periods.length > 1 ? [] : report.totals) totals[key] = Math.round(source.reduce((sum, row) => sum + Math.round(Number(row[key] || 0) * 100), 0)) / 100;
  const { view, selected } = periodSelection(report, state);
  const periodLabel = periods[0] === 'all' ? 'Snapshot / cumulative scope' : view === 'year' ? `Year ${selected.slice(0, 4)} — ${periods.length} periods` : view === 'year-compare' ? `Years ${Number(selected.slice(0, 4)) - 1} and ${selected.slice(0, 4)} — ${periods.length} periods` : periods.length > 4 ? `${periods[0]} through ${periods.at(-1)} — ${periods.length} periods` : periods.join(', ');
  const note = report.temporalType === 'snapshot' && periods.length > 1 ? 'Each date is a separate snapshot. Balances are not added across dates.' : view === 'compare' && periods.length === 1 ? 'No previous period is available for this selection.' : '';
  return { columns, rows, source, totals, periods, note, selection: [periodLabel, ...filters].join('; ') };
}

function format(value, kind, key = '') {
  if (value === null || value === undefined || value === '') return '—';
  if (kind === 'text' || kind === 'date') return String(value);
  const number = Number(value);
  if (kind === 'percent') return `${(key === 'AbsenceRate' ? number * 100 : number).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  const absolute = Math.abs(number).toLocaleString('en-US', { minimumFractionDigits: kind === 'integer' ? 0 : 2, maximumFractionDigits: kind === 'integer' ? 0 : 2 });
  return number < 0 ? `(${absolute})` : absolute;
}

module.exports = { label, periodKey, periodViews, periodSelection, selectedPeriods, filterOptions, matches, buildModel, format };
