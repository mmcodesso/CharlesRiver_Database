import React, { useState } from "react";
import clsx from "clsx";
import useBaseUrl from "@docusaurus/useBaseUrl";

import reportManifest from "@site/src/generated/reportManifest";
import styles from "./styles.module.css";

function getReportEntry(reportKey) {
  const entry = reportManifest[reportKey];
  if (!entry) {
    throw new Error(`Unknown report key: ${reportKey}`);
  }
  return entry;
}

function formatPreviewValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function PreviewTable({ preview }) {
  return (
    <div className={styles.previewBody}>
      <div className={styles.previewMeta}>
        <span>{preview.rowCount} rows total</span>
        <span>Showing {preview.previewRowCount}</span>
        <span>Generated {preview.generatedAt}</span>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.previewTable}>
          <thead>
            <tr>
              {preview.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, index) => (
              <tr key={`${preview.slug}-${index}`}>
                {preview.columns.map((column) => (
                  <td key={`${preview.slug}-${index}-${column}`}>{formatPreviewValue(row[column])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportCard({ reportKey }) {
  const entry = getReportEntry(reportKey);
  const previewUrl = useBaseUrl(entry.previewPath);
  const excelUrl = useBaseUrl(entry.excelPath);
  const csvUrl = useBaseUrl(entry.csvPath);
  const [expanded, setExpanded] = useState(false);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function loadPreview() {
    if (status !== "idle" || preview) {
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await fetch(previewUrl);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      setPreview(payload);
      setStatus("ready");
    } catch (fetchError) {
      setStatus("error");
      setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
    }
  }

  function handleToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    void loadPreview();
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardText}>
          <h4 className={styles.cardTitle}>{entry.title}</h4>
          <p className={styles.cardDescription}>{entry.description}</p>
          <div className={styles.chipRow}>
            <span className={styles.chip}>{entry.processGroupLabel}</span>
            <span className={styles.chip}>{entry.cadence}</span>
          </div>
        </div>
        <div className={styles.actionRow}>
          <button className={styles.primaryAction} type="button" onClick={handleToggle} aria-expanded={expanded}>
            {expanded ? "Hide Preview" : "Preview"}
          </button>
          {entry.excelEnabled ? (
            <a className={styles.secondaryAction} href={excelUrl}>
              Download Excel
            </a>
          ) : null}
          {entry.csvEnabled ? (
            <a className={styles.secondaryAction} href={csvUrl}>
              Download CSV
            </a>
          ) : null}
        </div>
      </div>
      {expanded ? (
        <div className={styles.previewPanel}>
          {status === "loading" ? <p className={styles.message}>Loading preview...</p> : null}
          {status === "error" ? (
            <p className={clsx(styles.message, styles.error)}>
              Could not load this preview. {error}
            </p>
          ) : null}
          {status === "ready" && preview ? <PreviewTable preview={preview} /> : null}
        </div>
      ) : null}
    </article>
  );
}

export function ReportCatalog({ groups, helperText }) {
  return (
    <div className={styles.section}>
      {helperText ? <p className={styles.sectionHelper}>{helperText}</p> : null}
      {groups.map((group) => (
        <section key={group.processGroup} className={styles.group}>
          <div className={styles.groupHeader}>
            <h3 className={styles.groupTitle}>{group.processGroupLabel}</h3>
          </div>
          <div className={styles.groupGrid}>
            {group.items.map((item) => (
              <ReportCard key={item.reportKey} reportKey={item.reportKey} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
