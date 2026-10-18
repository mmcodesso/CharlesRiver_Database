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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setPreview(null);
    setStatus("idle");
    setError("");
  }, [previewUrl]);

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
  }, [isOpen, preview, previewUrl, attempt]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    dialogRef.current?.querySelector("button")?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
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
    dialog.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.removeEventListener("keydown", handleKeyDown);
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} preview`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
        }
      }}
    >
        <div className={styles.modalToolbar}>
          <div>
            <p className={styles.modalTitle}>{title}</p>
            <p className={styles.modalHint}>Preview sample from the generated report.</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label={`Close ${title} preview`}>
            Close
          </button>
        </div>
        <div className={styles.viewport} tabIndex={0} role="region" aria-label={`${title} preview content`}>
          {status === "loading" ? <p className={styles.message} role="status">Loading preview...</p> : null}
          {status === "error" ? (
            <div role="alert" className={clsx(styles.message, styles.error)}>
              Could not load this preview. {error}
              <button type="button" className={styles.closeButton} onClick={() => {
                dialogRef.current?.querySelector('[role="region"]')?.focus();
                setAttempt((value) => value + 1);
              }} aria-label={`Retry ${title} preview`}>Retry preview</button>
            </div>
          ) : null}
          {status === "ready" && preview ? <PreviewTable preview={preview} /> : null}
        </div>
    </dialog>
  );
}
