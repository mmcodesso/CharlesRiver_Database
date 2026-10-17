import React, { useId, useState } from "react";
import Link from "@docusaurus/Link";
import caseCatalog, { caseLevels } from "@site/src/data/caseCatalog";
import styles from "./styles.module.css";

const emptyFilters = { search: "", process: "", area: "", level: "", tool: "" };

function optionsFor(field) {
  return Array.from(new Set(caseCatalog.flatMap((item) => item[field]))).sort();
}

export function CaseOverview({ slug }) {
  const activity = caseCatalog.find((item) => item.slug === slug);
  if (!activity) {
    throw new Error(`Unknown case: ${slug}`);
  }

  return (
    <aside className={styles.overview} aria-label="Case preparation">
      <p className={styles.eyebrow}>{activity.level} · {activity.processes.join(" · ")}</p>
      <dl className={styles.overviewList}>
        <dt>Prepare</dt>
        <dd><Link to={activity.prerequisite.to}>{activity.prerequisite.label}</Link>. {activity.priorKnowledge}</dd>
        <dt>Tools</dt>
        <dd>SQLite for the guided investigation; Excel for the optional reconstruction.</dd>
        <dt>Submit</dt>
        <dd>{activity.deliverable}.</dd>
      </dl>
      <p className={styles.boundary}>The management request is an instructional scenario. Build conclusions from your assigned release; a result may contain exceptions, ordinary timing differences, or no flagged rows.</p>
    </aside>
  );
}

export default function CaseExplorer() {
  const prefix = useId();
  const [filters, setFilters] = useState(emptyFilters);
  const matches = caseCatalog.filter((item) => {
    const searchable = [item.title, item.summary, item.priorKnowledge, item.deliverable, item.prerequisite.label, ...item.processes, ...item.areas].join(" ").toLowerCase();
    return (!filters.search || searchable.includes(filters.search.trim().toLowerCase()))
      && (!filters.process || item.processes.includes(filters.process))
      && (!filters.area || item.areas.includes(filters.area))
      && (!filters.level || item.level === filters.level)
      && (!filters.tool || item.tools.includes(filters.tool));
  });

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  const selects = [
    { name: "process", label: "Business process", options: optionsFor("processes") },
    { name: "area", label: "Accounting area", options: optionsFor("areas") },
    { name: "level", label: "Level", options: caseLevels },
    { name: "tool", label: "Tool", options: optionsFor("tools") },
  ];

  return (
    <section aria-label="Browse accounting cases" className={styles.explorer}>
      <fieldset className={styles.filters}>
        <legend>Find a case</legend>
        <div className={styles.search}>
          <label htmlFor={`${prefix}-search`}>Search topics, prerequisites, or deliverables</label>
          <input id={`${prefix}-search`} type="search" value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
        </div>
        <div className={styles.selects}>
          {selects.map((filter) => (
            <div key={filter.name}>
              <label htmlFor={`${prefix}-${filter.name}`}>{filter.label}</label>
              <select id={`${prefix}-${filter.name}`} value={filters[filter.name]} onChange={(event) => updateFilter(filter.name, event.target.value)}>
                <option value="">All {filter.name === "area" ? "areas" : filter.name === "process" ? "processes" : `${filter.name}s`}</option>
                {filter.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          ))}
        </div>
        <p className={styles.helper}>All cases use SQLite. The Excel companion is a focused reconstruction, described on each case page.</p>
        <button type="button" onClick={() => setFilters(emptyFilters)} className={styles.reset}>Reset filters</button>
      </fieldset>
      <p className={styles.count} role="status" aria-live="polite" aria-atomic="true">{matches.length} of {caseCatalog.length} cases</p>
      {matches.length ? (
        <ul className={styles.cards}>
          {matches.map((activity) => (
            <li key={activity.slug} className={styles.card}>
              <article>
                <p className={styles.eyebrow}>{activity.level} · {activity.areas.join(" · ")}</p>
                <h3><Link to={`/docs/analytics/cases/${activity.slug}`}>{activity.title}</Link></h3>
                <p>{activity.summary}</p>
                <dl className={styles.cardDetails}>
                  <dt>Process</dt><dd>{activity.processes.join(" · ")}</dd>
                  <dt>Prepare</dt><dd><Link to={activity.prerequisite.to}>{activity.prerequisite.label}</Link></dd>
                  <dt>Deliverable</dt><dd>{activity.deliverable}</dd>
                </dl>
              </article>
            </li>
          ))}
        </ul>
      ) : <p className={styles.empty}>No cases match these selections. Broaden a filter or reset to browse the full library.</p>}
      <noscript><p>All cases are listed above. Interactive filtering becomes available when JavaScript is enabled.</p></noscript>
    </section>
  );
}
