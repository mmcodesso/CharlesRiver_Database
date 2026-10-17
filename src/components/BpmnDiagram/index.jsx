import { useEffect, useRef, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import models from "@site/src/data/bpmnModels.json";
import diagramStyles from "@site/src/theme/Mermaid/styles.module.css";
import styles from "./styles.module.css";

export function BpmnModelCatalog() {
  const assetRoot = useBaseUrl("/diagrams/bpmn/");
  return <div className={styles.inventory} tabIndex={0} role="region" aria-label="BPMN model inventory, scroll to view all columns"><table>
    <thead><tr><th>Model</th><th>Scope</th><th>Explore the evidence</th><th>Editable source</th></tr></thead>
    <tbody>{models.map((model) => <tr key={model.id}>
      <td><strong>{model.title}</strong><br /><small>{model.kind}</small></td>
      <td>{model.description}</td>
      <td><Link to={model.processPath}>Process guide</Link><br /><Link to={model.exercisePath}>Learning activity</Link><br /><Link to={model.casePath}>Related case</Link></td>
      <td><a href={`${assetRoot}${model.id}.drawio`} download>Editable Draw.io</a></td>
    </tr>)}</tbody>
  </table></div>;
}

export default function BpmnDiagram({ modelId }) {
  const model = models.find((entry) => entry.id === modelId);
  if (!model) throw new Error(`Unknown BPMN model: ${modelId}`);
  const svgUrl = useBaseUrl(`/diagrams/bpmn/${model.id}.svg`);
  const sourceUrl = useBaseUrl(`/diagrams/bpmn/${model.id}.drawio`);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const imageRef = useRef(null);
  const surfaceRef = useRef(null);
  const panzoomRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

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

  function resetView() {
    const image = imageRef.current;
    const surface = surfaceRef.current;
    const panzoom = panzoomRef.current;
    if (!image?.naturalWidth || !surface?.clientHeight || !panzoom) return;
    const scale = Math.min(
      (surface.clientWidth - 24) / image.naturalWidth,
      (surface.clientHeight - 24) / image.naturalHeight,
    );
    if (scale <= 0) return;
    panzoom.zoomTo(0, 0, 1);
    panzoom.moveTo(0, 0);
    panzoom.zoomAbs(0, 0, 1);
    panzoom.moveTo(0, 0);
    panzoom.zoomAbs(0, 0, scale);
    const fittedScale = panzoom.getTransform().scale;
    panzoom.moveTo(
      (surface.clientWidth - image.naturalWidth * fittedScale) / 2,
      (surface.clientHeight - image.naturalHeight * fittedScale) / 2,
    );
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    const image = imageRef.current;
    let cancelled = false;
    let panzoom;
    let observer;
    async function initialize() {
      const { default: createPanzoom } = await import("panzoom");
      if (cancelled) return;
      panzoom = createPanzoom(image, {
        maxZoom: 6,
        minZoom: 0.05,
        bounds: true,
        boundsPadding: 0.02,
        smoothScroll: false,
        disableKeyboardInteraction: true,
        filterKey: () => true,
      });
      panzoomRef.current = panzoom;
      image.addEventListener("load", resetView);
      observer = new ResizeObserver(resetView);
      observer.observe(surfaceRef.current);
      resetView();
    }
    initialize();
    return () => {
      cancelled = true;
      image.removeEventListener("load", resetView);
      observer?.disconnect();
      panzoom?.dispose();
      panzoomRef.current = null;
    };
  }, [isOpen]);

  function open(event) {
    openerRef.current = event.currentTarget;
    setIsOpen(true);
  }
  function zoomBy(factor) {
    const panzoom = panzoomRef.current;
    const surface = surfaceRef.current;
    if (!panzoom || !surface) return;
    const x = surface.clientWidth / 2;
    const y = surface.clientHeight / 2;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) panzoom.zoomTo(x, y, factor);
    else panzoom.smoothZoom(x, y, factor);
  }
  function handleKey(event) {
    const offsets = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
    if (offsets[event.key]) {
      event.preventDefault();
      panzoomRef.current?.zoomTo(0, 0, 1);
      panzoomRef.current?.moveBy(...offsets[event.key]);
    } else if (["+", "=", "-", "0"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") resetView();
      else zoomBy(event.key === "-" ? 1 / 1.2 : 1.2);
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

  return <figure className={diagramStyles.figure} aria-label={model.title}>
    <div className={diagramStyles.inlineToolbar}>
      <figcaption className={diagramStyles.inlineHint}>Expand the diagram for a larger view with zoom and pan controls.</figcaption>
      <button className={diagramStyles.expandButton} type="button" onClick={open} aria-haspopup="dialog" aria-label={`Expand ${model.title} model`}>Expand model</button>
    </div>
    <button className={styles.preview} type="button" onClick={open} aria-haspopup="dialog" aria-label={`View ${model.title} in diagram viewer`}>
      <img src={svgUrl} alt={model.alt} loading="lazy" />
    </button>
    <p className={styles.resources}><a href={sourceUrl} download>Download editable Draw.io</a></p>
    <details className={styles.description}>
      <summary>Text description and database evidence</summary>
      <ol>{model.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p><strong>Evidence tables:</strong> {model.tables.map((table, index) => <span key={table}>{index ? ", " : ""}<code>{table}</code></span>)}.</p>
      <p>Confirm keys and accounting sources in the <Link to="/docs/reference/schema">Schema Reference</Link> and <Link to="/docs/reference/posting">Posting Reference</Link>.</p>
      <p>{model.boundary}</p>
    </details>
    <p className={styles.note}>Editable visual model in Draw.io XML; this is not executable BPMN XML. <Link to="/docs/process-flows#a-short-bpmn-reading-guide">Notation and model library</Link>.</p>
    {isOpen ? <dialog ref={dialogRef} className={`${diagramStyles.modal} ${styles.dialog}`} aria-label={`${model.title} BPMN viewer`} onKeyDown={handleDialogKey} onCancel={(event) => { event.preventDefault(); setIsOpen(false); }}>
      <div className={diagramStyles.modalToolbar}><div><p className={diagramStyles.modalTitle}>Diagram viewer</p><p className={diagramStyles.modalHint}>Drag to pan or focus the diagram and use arrow keys. Use + and - to zoom; 0 resets the view.</p></div>
        <div className={diagramStyles.controlGroup}>
          <button className={diagramStyles.controlButton} type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)}>-</button>
          <button className={diagramStyles.controlButton} type="button" aria-label="Zoom in" onClick={() => zoomBy(1.2)}>+</button>
          <button className={`${diagramStyles.controlButton} ${diagramStyles.textButton}`} type="button" onClick={resetView}>Reset</button>
          <button className={`${diagramStyles.controlButton} ${diagramStyles.textButton}`} ref={closeRef} type="button" onClick={() => setIsOpen(false)}>Close</button>
        </div>
      </div>
      <div className={`${diagramStyles.viewport} ${styles.viewport}`} tabIndex={0} role="region" aria-label={`${model.title} diagram. Arrow keys pan; plus and minus zoom; zero resets the view.`} onKeyDown={handleKey}>
        <div ref={surfaceRef} className={`${diagramStyles.modalDiagram} ${diagramStyles.zoomSurface}`}>
          <img ref={imageRef} className={styles.zoomImage} src={svgUrl} alt={model.alt} draggable={false} />
        </div>
      </div>
    </dialog> : null}
  </figure>;
}
