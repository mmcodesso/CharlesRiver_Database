import { useEffect, useId, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import models from "@site/src/data/bpmnModels.json";
import styles from "./styles.module.css";

export function BpmnModelCatalog() {
  const assetRoot = useBaseUrl("/diagrams/bpmn/");
  return <div className={styles.inventory} tabIndex={0} role="region" aria-label="BPMN model inventory, scroll to view all columns"><table>
    <thead><tr><th>Model</th><th>Scope</th><th>Explore the evidence</th><th>Reusable files</th></tr></thead>
    <tbody>{models.map((model) => <tr key={model.id}>
      <td><strong>{model.title}</strong><br /><small>{model.kind}</small></td>
      <td>{model.description}</td>
      <td><Link to={model.processPath}>Process guide</Link><br /><Link to={model.exercisePath}>Learning activity</Link><br /><Link to={model.casePath}>Related case</Link></td>
      <td><a href={`${assetRoot}${model.id}.svg`}>View SVG</a><br /><a href={`${assetRoot}${model.id}.drawio`} download>Editable Draw.io</a></td>
    </tr>)}</tbody>
  </table></div>;
}

export default function BpmnDiagram({ modelId }) {
  const model = models.find((entry) => entry.id === modelId);
  if (!model) throw new Error(`Unknown BPMN model: ${modelId}`);
  const titleId = useId();
  const svgUrl = useBaseUrl(`/diagrams/bpmn/${model.id}.svg`);
  const sourceUrl = useBaseUrl(`/diagrams/bpmn/${model.id}.drawio`);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!isOpen) return undefined;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  function open(event) {
    openerRef.current = event.currentTarget;
    setZoom(1);
    setIsOpen(true);
  }
  function zoomBy(amount) { setZoom((value) => Math.max(0.5, Math.min(8, value + amount))); }
  function handleKey(event) {
    if (["+", "=", "-", "0"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") setZoom(1);
      else zoomBy(event.key === "-" ? -0.25 : 0.25);
    }
  }
  function handleDialogKey(event) {
    if (event.key !== "Tab") return;
    const targets = dialogRef.current.querySelectorAll('button:not([disabled]), [tabindex="0"]');
    const first = targets[0];
    const last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return <figure className={styles.figure} aria-labelledby={titleId}>
    <figcaption>
      <p className={styles.eyebrow}>BPMN 2.0 / activities and responsibilities</p>
      <strong id={titleId} className={styles.title}>{model.title}</strong>
      <p>{model.description}</p>
    </figcaption>
    <div className={styles.toolbar}>
      <button type="button" onClick={open} aria-haspopup="dialog">Expand {model.title} model</button>
      <a href={svgUrl} target="_blank" rel="noopener noreferrer">Open SVG</a>
      <a href={sourceUrl} download>Download editable Draw.io</a>
    </div>
    <a className={styles.preview} href={svgUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size ${model.title} SVG`}>
      <img src={svgUrl} alt={model.alt} loading="lazy" />
    </a>
    <details className={styles.description}>
      <summary>Text description and database evidence</summary>
      <ol>{model.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p><strong>Evidence tables:</strong> {model.tables.map((table, index) => <span key={table}>{index ? ", " : ""}<code>{table}</code></span>)}.</p>
      <p>Confirm keys and accounting sources in the <Link to="/docs/reference/schema">Schema Reference</Link> and <Link to="/docs/reference/posting">Posting Reference</Link>.</p>
      <p>{model.boundary}</p>
    </details>
    <p className={styles.note}>Editable visual model in Draw.io XML; this is not executable BPMN XML. <Link to="/docs/process-models">Notation and model library</Link>.</p>
    {isOpen ? <dialog ref={dialogRef} className={styles.dialog} aria-label={`${model.title} BPMN viewer`} onKeyDown={handleDialogKey} onCancel={(event) => { event.preventDefault(); setIsOpen(false); }}>
      <div className={styles.dialogHeader}><div><strong>{model.title}</strong><p>Focus the image area to scroll. Use + and − to zoom, 0 to fit, and Escape to close.</p></div>
        <div className={styles.controls}>
          <button type="button" aria-label="Zoom out BPMN model" onClick={() => zoomBy(-0.25)} disabled={zoom <= 0.5}>−</button>
          <button type="button" aria-label="Zoom in BPMN model" onClick={() => zoomBy(0.25)} disabled={zoom >= 8}>+</button>
          <button type="button" onClick={() => setZoom(1)}>Fit</button>
          <button ref={closeRef} type="button" onClick={() => setIsOpen(false)}>Close</button>
        </div>
      </div>
      <p className={styles.zoom} role="status" aria-live="polite">{Math.round(zoom * 100)}% of fitted width</p>
      <div className={styles.viewport} tabIndex={0} role="region" aria-label={`${model.title} diagram, scroll to inspect`} onKeyDown={handleKey}>
        <img src={svgUrl} alt={model.alt} style={{ width: `${zoom * 100}%` }} />
      </div>
    </dialog> : null}
  </figure>;
}
