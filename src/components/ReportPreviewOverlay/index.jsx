import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import styles from "./styles.module.css";

function formatPreviewValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
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
      <div className={styles.tableWrapper} tabIndex={0} role="region" aria-label="Report data table, scroll to view all columns">
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

export function ReportPreviewOverlay({ isOpen, onClose, previewUrl, title }) {
  const dialogRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || preview) {
      return undefined;
    }

    let ignore = false;

    async function loadPreview() {
      setStatus("loading");
      setError("");

      try {
        const response = await fetch(previewUrl);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        if (!ignore) {
          setPreview(payload);
          setStatus("ready");
        }
      } catch (fetchError) {
        if (!ignore) {
          setStatus("error");
          setError(fetchError instanceof Error ? fetchError.message : "Unknown error");
        }
      }
    }

    void loadPreview();

    return () => {
      ignore = true;
    };
  }, [isOpen, preview, previewUrl]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement;
    dialogRef.current?.querySelector("button")?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll('button, a[href], [tabindex="0"]');
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} preview`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalToolbar}>
          <div>
            <p className={styles.modalTitle}>{title}</p>
            <p className={styles.modalHint}>Preview sample from the generated report.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
        <div className={styles.viewport} tabIndex={0} role="region" aria-label="Report preview content">
          {status === "loading" ? <p className={styles.message}>Loading preview...</p> : null}
          {status === "error" ? (
            <p className={clsx(styles.message, styles.error)}>
              Could not load this preview. {error}
            </p>
          ) : null}
          {status === "ready" && preview ? <PreviewTable preview={preview} /> : null}
        </div>
      </div>
    </div>
  );
}
