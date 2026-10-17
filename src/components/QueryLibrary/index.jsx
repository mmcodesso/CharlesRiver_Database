import React, { useState } from "react";
import Heading from "@theme/Heading";
import { QueryReference, humanizeQueryFilename } from "@site/src/components/QueryReference";
import queryManifest from "@site/src/generated/queryManifest";
import styles from "@site/src/components/ReportCatalog/styles.module.css";

const domains = [
  { id: "financial", title: "Financial Queries", description: "Statements, balances, settlement timing, and financial reconciliation." },
  { id: "managerial", title: "Managerial Queries", description: "Cost, pricing, portfolio performance, workforce, and operational planning." },
  { id: "audit", title: "Audit Queries", description: "Completeness, approvals, controls, and exceptions requiring investigation." },
  { id: "cases", title: "Case Trace Queries", description: "Source-to-ledger traces for the core process cases." },
];
const queries = Object.entries(queryManifest).map(([queryKey, entry]) => ({
  ...entry,
  queryKey,
  label: humanizeQueryFilename(entry.filename),
}));

export default function QueryLibrary() {
  const [query, setQuery] = useState("");
  const [domainId, setDomainId] = useState("all");
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = queries.filter((entry) => {
    const text = `${entry.label} ${entry.teachingObjective} ${entry.outputShape} ${entry.mainTables}`.toLowerCase();
    return (domainId === "all" || domainId === entry.category) && words.every((word) => text.includes(word));
  });
  const reset = () => { setQuery(""); setDomainId("all"); };

  return (
    <section className={styles.section} aria-label="Browse SQL queries">
      <nav className={styles.topicLinks} aria-label="Query domains">
        {domains.map((domain) => (
          <a key={domain.id} href={`#${domain.id}-queries`} onClick={reset}>
            {domain.title} <span>({queries.filter((entry) => entry.category === domain.id).length})</span>
          </a>
        ))}
      </nav>
      <div className={styles.filters}>
        <label htmlFor="query-search">Search queries
          <input id="query-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try cash, payroll, or a table name…" />
        </label>
        <label htmlFor="query-domain">Query domain
          <select id="query-domain" value={domainId} onChange={(event) => setDomainId(event.target.value)}>
            <option value="all">All domains</option>
            {domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.title}</option>)}
          </select>
        </label>
        <button className={styles.secondaryAction} type="button" onClick={reset} disabled={!query && domainId === "all"}>Clear filters</button>
      </div>
      <p className={styles.resultCount} role="status" aria-live="polite">Showing {visible.length} of {queries.length} queries</p>
      {!visible.length ? <p className={styles.empty}>No queries match these filters. Try another term or clear the filters to browse all queries.</p> : null}
      {domains.map((domain) => {
        const items = visible.filter((entry) => entry.category === domain.id);
        return items.length ? (
          <section key={domain.id} className={styles.group} aria-labelledby={`${domain.id}-queries`}>
            <div className={styles.groupHeader}>
              <Heading as="h3" id={`${domain.id}-queries`} className={styles.groupTitle}>{domain.title}</Heading>
              <p>{domain.description}</p>
            </div>
            <div className={styles.groupGrid}>
              {items.map((entry) => <QueryReference key={entry.queryKey} queryKey={entry.queryKey} label={entry.label} showMetadata showDownload />)}
            </div>
          </section>
        ) : null;
      })}
    </section>
  );
}
