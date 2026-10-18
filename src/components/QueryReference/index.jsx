import React, { useId, useRef, useState } from "react";
import clsx from "clsx";
import CodeBlock from "@theme/CodeBlock";
import Heading from "@theme/Heading";
import useBaseUrl from "@docusaurus/useBaseUrl";
import queryManifest from "@site/src/generated/queryManifest";
import { queryAnchor } from "@site/src/components/CatalogNavigation/queryLinks";
import styles from "./styles.module.css";

function getQueryEntry(queryKey) {
  const entry = queryManifest[queryKey];
  if (!entry) {
    throw new Error(`Unknown query key: ${queryKey}`);
  }
  return entry;
}

export function humanizeQueryFilename(filename) {
  const lowerCaseWords = new Set([
    "and",
    "by",
    "for",
    "in",
    "of",
    "on",
    "or",
    "to",
    "vs",
    "with",
    "without",
  ]);
  const acronyms = new Map([
    ["ap", "AP"],
    ["ar", "AR"],
    ["bom", "BOM"],
    ["fg", "FG"],
    ["gl", "GL"],
    ["mrp", "MRP"],
    ["o2c", "O2C"],
    ["p2p", "P2P"],
    ["sod", "SOD"],
    ["wip", "WIP"],
  ]);

  return filename
    .replace(/^\d+_/, "")
    .replace(/\.sql$/, "")
    .split("_")
    .map((word, index) => {
      const lowerWord = word.toLowerCase();
      if (acronyms.has(lowerWord)) {
        return acronyms.get(lowerWord);
      }
      if (index > 0 && lowerCaseWords.has(lowerWord)) {
        return lowerWord;
      }
      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join(" ");
}

function normalizeSequenceHelper(lead) {
  if (!lead) {
    return undefined;
  }

  const trimmed = lead.trim();
  if (!trimmed || /^run$/i.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function QueryReference({
  queryKey,
  label,
  variant = "catalog",
  helperText,
  showMetadata = false,
  showDownload = false,
  anchorId,
  children,
}) {
  const entry = getQueryEntry(queryKey);
  const queryUrl = useBaseUrl(entry.publicPath);
  const displayLabel = label ?? humanizeQueryFilename(entry.filename);
  const resolvedAnchorId = anchorId ?? (showDownload ? queryAnchor(queryKey) : undefined);
  const Label = resolvedAnchorId ? Heading : showDownload ? "h4" : "div";
  const panelId = useId();
  const panelRef = useRef(null);
  const requestInFlight = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [sql, setSql] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function loadSql() {
    if (requestInFlight.current || status === "ready") {
      return;
    }

    requestInFlight.current = true;
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(queryUrl);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const text = await response.text();
      setSql(text.trimEnd());
      setStatus("ready");
    } catch (fetchError) {
      setStatus("error");
      setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
    } finally {
      requestInFlight.current = false;
    }
  }

  function handleRetry() {
    // Keep focus on a persistent element while the retry button is replaced.
    panelRef.current?.focus({ preventScroll: true });
    void loadSql();
  }

  function handleToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    void loadSql();
  }

  return (
    <div className={clsx(styles.reference, styles[variant])}>
      <div className={styles.referenceHeader}>
        <div className={styles.referenceText}>
          <Label as={resolvedAnchorId ? "h4" : undefined} id={resolvedAnchorId} className={clsx(styles.referenceLabel, showDownload && styles.libraryLabel)}>{displayLabel}</Label>
          {helperText ? <p className={styles.referenceHelper}>{helperText}</p> : null}
          {showMetadata ? (
            <div className={styles.metadata}>
              {entry.teachingObjective ? (
                <p className={styles.metadataObjective}>{entry.teachingObjective}</p>
              ) : null}
              {entry.outputShape || entry.mainTables ? (
                <dl className={styles.metadataList}>
                  {entry.outputShape ? (
                    <>
                      <dt>Output</dt>
                      <dd>{entry.outputShape}</dd>
                    </>
                  ) : null}
                  {entry.mainTables ? (
                    <>
                      <dt>Main tables</dt>
                      <dd>{entry.mainTables}</dd>
                    </>
                  ) : null}
                </dl>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className={showDownload ? styles.actions : undefined}>
          <button
            className={styles.toggle}
            type="button"
            onClick={handleToggle}
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={`${expanded ? "Hide" : "Show"} SQL for ${displayLabel}`}
          >
            {expanded ? "Hide SQL" : "Show SQL"}
          </button>
          {showDownload ? <a className={styles.download} href={queryUrl} download aria-label={`Download SQL for ${displayLabel}`}>Download SQL</a> : null}
        </div>
      </div>
      {children}
      <p className={styles.statusMessage} role="status" aria-live="polite">
        {status === "loading" ? `Loading SQL for ${displayLabel}.` : status === "ready" ? `SQL loaded for ${displayLabel}.` : status === "error" ? `Could not load SQL for ${displayLabel}. Retry is available.` : ""}
      </p>
      <div ref={panelRef} id={panelId} className={styles.codePanel} hidden={!expanded} tabIndex={-1} role="region" aria-label={`SQL for ${displayLabel}`} aria-busy={status === "loading"}>
        {status === "loading" ? (
          <p className={styles.message}>Loading SQL...</p>
        ) : null}
        {status === "error" ? (
          <>
            <p className={clsx(styles.message, styles.error)}>Could not load this query. {error}</p>
            <button className={styles.toggle} type="button" onClick={handleRetry} aria-label={`Retry SQL for ${displayLabel}`}>Retry SQL</button>
          </>
        ) : null}
        {status === "ready" ? (
          <CodeBlock language="sql" title={entry.filename}>
            {sql}
          </CodeBlock>
        ) : null}
      </div>
    </div>
  );
}

export function QueryCatalog({ items, helperText }) {
  const message =
    helperText ??
    "Click Show SQL to open a query, review the logic, and copy it into SQLite or a compatible SQL tool.";

  return (
    <div className={styles.section}>
      <p className={styles.sectionHelper}>{message}</p>
      <div className={styles.catalogList}>
        {items.map((item) => (
          <QueryReference
            key={item.queryKey}
            label={item.label}
            queryKey={item.queryKey}
            variant="catalog"
            showMetadata
          />
        ))}
      </div>
    </div>
  );
}

export function QueryGroupCatalog({ groups }) {
  return (
    <div className={styles.groupList}>
      {groups.map((group) => (
        <section key={group.title} className={styles.group}>
          <h3>{group.title}</h3>
          {group.description ? <p className={styles.groupDescription}>{group.description}</p> : null}
          <QueryCatalog
            items={group.items}
            helperText="Open a query when you want to inspect the SQL, copy it into SQLite, or trace the source-table logic."
          />
        </section>
      ))}
    </div>
  );
}

export function QuerySequence({ items, helperText }) {
  const message =
    helperText ??
    "Work through the queries in order. Expand a query when you want to inspect the SQL or copy it into your tool.";

  return (
    <div className={styles.section}>
      <p className={styles.sectionHelper}>{message}</p>
      <ol className={styles.sequenceList}>
        {items.map((item) => (
          <li key={`${item.queryKey}-${item.lead}`} className={styles.sequenceItem}>
            <QueryReference
              queryKey={item.queryKey}
              helperText={normalizeSequenceHelper(item.lead)}
              variant="sequence"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function QueryMatrix({ items, helperText }) {
  const message =
    helperText ??
    "Expand any query in the first column when you want to review the SQL and copy it into your audit workflow.";

  return (
    <div className={styles.section}>
      <p className={styles.sectionHelper}>{message}</p>
      <div className={styles.tableWrapper}>
        <table className={styles.matrixTable}>
          <thead>
            <tr>
              <th>Query</th>
              <th>Recommended use</th>
              <th>Expected anomaly types</th>
              <th>Main tables</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.queryKey}>
                <td className={styles.matrixQueryCell}>
                  <QueryReference queryKey={item.queryKey} variant="matrix" />
                </td>
                <td>{item.recommendedUse}</td>
                <td>
                  <code>{item.expectedAnomalyTypes}</code>
                </td>
                <td>{item.mainTables}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
