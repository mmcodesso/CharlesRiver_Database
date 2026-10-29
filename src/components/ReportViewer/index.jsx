import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Head from '@docusaurus/Head';
import { useHistory, useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import teaching from '@site/src/data/reportTeachingMetadata.json';
import reportManifest from './registry';
import packs from '@site/src/generated/reportPackManifest';
import { CompanyName } from '@site/src/components/SiteBranding';
import { queryLibraryLink } from '@site/src/components/CatalogNavigation/queryLinks';
import resolveCaseLink from '@site/src/components/Cases/resolveCaseLink';
import helpers from './model.cjs';
import styles from './styles.module.css';

const { selectedPeriods, periodSelection, filterOptions, buildModel, format, label } = helpers;

function ReportTable({ model, rows }) {
  let group;
  return <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Report results, scroll to view all columns">
    <table className={styles.table}>
      <caption className={styles.srOnly}>Selected report results</caption>
      <thead><tr>{model.columns.map(c => <th key={c.key} scope="col" className={c.kind !== 'text' ? styles.number : undefined}>{c.label}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => {
        const heading = row.group && row.group !== group && row.type !== 'subtotal';
        group = row.group;
        return <React.Fragment key={index}>
          {heading && <tr className={styles.group}><th colSpan={model.columns.length} scope="colgroup">{group}</th></tr>}
          <tr className={row.type === 'subtotal' ? styles.subtotal : undefined}>{model.columns.map((c, i) => {
            const Tag = i === 0 ? 'th' : 'td';
            return <Tag key={c.key} scope={i === 0 ? 'row' : undefined} className={`${c.kind !== 'text' ? styles.number : ''} ${i === 0 && row.type === 'account' ? styles.account : ''}`}>{format(row.values[c.key], c.kind, c.key)}</Tag>;
          })}</tr>
        </React.Fragment>;
      })}
      {Object.keys(model.totals).length > 0 && <tr className={styles.subtotal}>{model.columns.map((c, i) => <td key={c.key} className={c.kind !== 'text' ? styles.number : undefined}>{i === 0 ? 'Selected total' : format(model.totals[c.key], c.kind, c.key)}</td>)}</tr>}
      </tbody>
    </table>
  </div>;
}

export default function ReportViewer({ report }) {
  const history = useHistory();
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const company = siteConfig.customFields.branding.companyName;
  const baseUrl = useBaseUrl('/');
  const sourceReport = reportManifest[report.slug];
  const csvUrl = useBaseUrl(sourceReport.csvPath || '/');
  const csvSnapshotUrl = useBaseUrl(report.snapshotPath || '/');
  const params = new URLSearchParams(location.search);
  const state = Object.fromEntries(params);
  const info = teaching[report.slug];
  const selection = report.visibility === 'retired' ? { available: [], selected: '', view: 'month', modes: [] } : periodSelection(report, state);
  const { available, selected: period, view, modes } = selection;
  const annual = report.temporalType === 'annual';
  const yearView = view === 'year' || view === 'year-compare';
  const periodOptions = yearView ? Array.from(new Set(available.map(key => key.slice(0, 4)))) : available;
  const viewLabels = { month: annual ? 'Selected year' : report.temporalType === 'snapshot' ? 'Selected snapshot' : 'Selected period', compare: annual ? 'Compare previous year' : report.temporalType === 'snapshot' ? 'Compare previous snapshot' : 'Compare previous period', year: 'Year by period', 'year-compare': 'Compare previous year by period', all: annual ? 'All years' : 'All periods' };
  const canonicalState = { ...state, period, view };
  const periods = report.visibility === 'retired' ? [] : selectedPeriods(report, canonicalState);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [job, setJob] = useState('');
  const [exportError, setExportError] = useState('');
  const workerRef = useRef(null);
  const csvAbortRef = useRef(null);
  const loadKey = periods.join('|');
  useEffect(() => {
    if (report.visibility === 'retired') return undefined;
    const controller = new AbortController();
    setStatus('loading'); setError('');
    Promise.all(periods.map(key => fetch(`${baseUrl}${report.partitions[key].replace(/^\//, '')}`, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Report data could not be loaded.');
      return response.json();
    }))).then(parts => { setRecords(parts.flat()); setStatus('ready'); }).catch(reason => {
      if (reason.name !== 'AbortError') { setError(reason.message); setStatus('error'); }
    });
    return () => controller.abort();
  }, [report.slug, loadKey, attempt]);
  useEffect(() => () => { workerRef.current?.terminate(); csvAbortRef.current?.abort(); }, []);
  useEffect(() => {
    workerRef.current?.terminate(); csvAbortRef.current?.abort(); workerRef.current = null; setJob(''); setExportError('');
  }, [location.search]);
  function update(key, value) {
    const next = new URLSearchParams(location.search);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    history.push({ ...location, search: next.toString() ? `?${next}` : '' });
  }
  const model = useMemo(() => report.visibility === 'retired' ? null : buildModel(report, records, canonicalState), [report, records, location.search]);
  const pageCount = Math.max(1, Math.ceil((model?.rows.length || 0) / 50));
  const page = Math.max(1, Math.min(pageCount, Number.parseInt(state.page, 10) || 1));
  const visibleRows = report.family === 'statement' ? model?.rows : model?.rows.slice((page - 1) * 50, page * 50);
  const guidance = Object.values(packs).flatMap(pack => pack.reports).filter(item => item.reportSlug === report.slug);
  const questions = Array.from(new Set(guidance.flatMap(item => item.discussionQuestions)));
  const related = Array.from(new Map(guidance.map(item => resolveCaseLink(item.relatedLink)).filter(Boolean).map(link => [link.href, link])).values());
  function cancel() { workerRef.current?.terminate(); csvAbortRef.current?.abort(); workerRef.current = null; setJob(''); }
  async function exportReport(type) {
    setExportError(''); setJob('Starting export…');
    let exportModel = model;
    if (type === 'csv') {
      const controller = new AbortController();
      csvAbortRef.current = controller;
      try {
        const response = await fetch(csvSnapshotUrl, { signal: controller.signal });
        if (!response.ok) throw new Error('Source data could not be loaded.');
        const payload = await response.json();
        if (controller.signal.aborted) return;
        exportModel = { ...model, source: payload.rows };
      } catch (reason) { if (reason.name !== 'AbortError') setExportError(reason.message); setJob(''); return; }
    }
    const worker = new Worker(new URL('./export.worker.js', import.meta.url));
    workerRef.current = worker;
    worker.onerror = () => { setExportError('Export could not finish. Please retry.'); cancel(); };
    worker.onmessage = ({ data }) => {
      if (data.progress) setJob(data.progress);
      if (data.error) { setExportError(data.error); cancel(); }
      if (data.result) {
        const { bytes, mime, extension } = data.result;
        const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = extension === 'csv' ? `${report.slug}.csv` : `${report.slug}-${period}-${view}-formatted.${extension}`;
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000); cancel();
      }
    };
    worker.postMessage({ type, report, model: exportModel, company, basis: info.periodBasis });
  }
  if (report.visibility === 'retired') return <Layout title={`${report.title} — Retired report`} description="This planning report has been retired from the report collection.">
    <main className="container margin-vert--lg"><h1>{report.title}</h1><p>This report has been retired from the report collection.</p><Link to={`/docs/analytics/reports/${report.replacement}`}>Explore the related actual-results report</Link></main>
  </Layout>;
  return <Layout title={report.title} description={`${report.description} Explore complete results and download formatted PDF and Excel reports.`}>
    <Head><meta property="og:type" content="article" /></Head>
    <main className={styles.main}>
      <nav aria-label="Breadcrumb" className={styles.controls}><Link to="/docs/analytics">Reports and Analytics</Link><span aria-hidden="true"> / </span><span>{report.title}</span></nav>
      <header className={styles.header}><p className={styles.company}><CompanyName /></p><h1>{report.title}</h1><p>{report.description}</p></header>
      <div className={styles.controls}>
        <div className={styles.filters}>
          {modes.length > 0 && <label>{report.family === 'statement' ? 'Statement view' : 'Period view'}<select aria-label={report.family === 'statement' ? 'Statement view' : 'Period view'} value={view} onChange={e => update('view', e.target.value)}>{modes.map(mode => <option key={mode} value={mode}>{viewLabels[mode]}</option>)}</select></label>}
          {report.periodFields.length > 0 && view !== 'all' && <label>{annual || yearView ? 'Reporting year' : 'Reporting period'}<select key={`${report.slug}-${yearView ? 'year' : 'period'}`} aria-label={annual || yearView ? 'Reporting year' : 'Reporting period'} value={yearView ? period.slice(0, 4) : period} onChange={e => update('period', e.target.value)}>{periodOptions.map(key => <option key={key} value={key}>{key}</option>)}</select></label>}
          {report.family !== 'statement' && (report.filters.length > 0 || report.family === 'register') && <label>Search within selection<input type="search" value={state.q || ''} onChange={e => update('q', e.target.value)} placeholder="Find a name or document…" /></label>}
          {report.filters.map(key => {
            const options = filterOptions(report, records, state, key);
            if (options.length < 2 && !state[key]) return null;
            return <label key={key}>{label(key)}<select aria-label={label(key)} value={state[key] || ''} onChange={e => update(key, e.target.value)}><option value="">All</option>{state[key] && !options.includes(state[key]) && <option value={state[key]}>{state[key]} (not in selection)</option>}{options.map(value => <option key={value} value={value}>{value}</option>)}</select></label>;
          })}
        </div>
        <div className={styles.actions}>
          <button disabled={status !== 'ready' || !model.source.length || !!job || model.source.length > 10000} onClick={() => exportReport('pdf')}>Download PDF</button>
          <button disabled={status !== 'ready' || !model.source.length || !!job} onClick={() => exportReport('xlsx')}>Download Excel</button>
          {sourceReport.csvEnabled && (sourceReport.csvPath ? <a className={styles.exportData} href={csvUrl} download aria-describedby="report-data-export-note">Export Data</a> : <button disabled={!!job} onClick={() => exportReport('csv')} aria-describedby="report-data-export-note">Export Data</button>)}
          <button disabled={!location.search} onClick={() => history.push({ ...location, search: '' })}>Reset selection</button>
          <Link to={queryLibraryLink(report.query_path)}>View source SQL</Link>
        </div>
        {sourceReport.csvEnabled && <p id="report-data-export-note" className={styles.basis}>Export Data downloads the full report as CSV, independent of the selected period and filters.</p>}
        {model.note && <p className={styles.basis}>{model.note}</p>}
        {model.source.length > 10000 && <p>Choose a narrower selection for PDF. Excel includes all selected rows.</p>}
        {job && <p role="status">{job} <button onClick={cancel}>Cancel export</button></p>}
        {exportError && <p role="alert">{exportError}</p>}
      </div>
      <section className={styles.paper} aria-label="Formatted report">
        <div className={styles.reportHeading}><p className={styles.company}><CompanyName /></p><h2>{report.title}</h2><p>{model.selection}</p><p className={styles.basis}>{info.periodBasis}</p><p className={styles.basis}>Amounts in USD. Hours, quantities and percentages as labeled.</p></div>
        {status === 'loading' && <p role="status">Loading complete report selection…</p>}
        {status === 'error' && <p role="alert">{error} <button onClick={() => setAttempt(value => value + 1)}>Retry report</button></p>}
        {status === 'ready' && <>
          <p className={styles.recordCount}>{model.source.length.toLocaleString()} selected source rows{report.family !== 'statement' ? ` · Page ${page} of ${pageCount}` : ''}</p>
          {!model.rows.length ? <p>No records match this selection. Adjust the filters or reset the selection.</p> : <>
            <div className={styles.screenTable}><ReportTable model={model} rows={visibleRows} /></div>
            <div className={styles.printTable}><ReportTable model={model} rows={model.rows} /></div>
          </>}
        </>}
      </section>
      {report.family !== 'statement' && status === 'ready' && pageCount > 1 && <nav className={`${styles.pagination} ${styles.controls}`} aria-label="Report pages"><button disabled={page === 1} onClick={() => update('page', String(page - 1))}>Previous page</button><label>Page<select value={page} onChange={e => update('page', e.target.value)}>{Array.from({ length: pageCount }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label><span>of {pageCount}</span><button disabled={page === pageCount} onClick={() => update('page', String(page + 1))}>Next page</button></nav>}
      <aside className={styles.controls}>
        <h2>Read the evidence</h2><p><strong>Row grain:</strong> {info.grain}</p>
        <p><Link to={info.process.to}>{info.process.label}</Link> · <Link to={info.lesson.to}>{info.lesson.label}</Link></p>
        {questions.length > 0 && <details><summary>Interpret this report</summary><ul>{questions.map(question => <li key={question}>{question}</li>)}</ul>{related.map(link => <p key={link.href}><Link to={link.href}>{link.label}</Link></p>)}</details>}
        {report.area === 'audit' && <p>Exception flags identify records to investigate. They do not establish that a control failed.</p>}
      </aside>
    </main>
  </Layout>;
}
