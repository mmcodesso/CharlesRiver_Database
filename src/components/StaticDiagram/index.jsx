import { useEffect, useRef, useState } from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import diagramStyles from "@site/src/theme/Mermaid/styles.module.css";
import styles from "./styles.module.css";

export default function StaticDiagram({ model, assetRoot, kind = "diagram", children }) {
  const svgUrl = useBaseUrl(`${assetRoot}${model.id}.svg`);
  const sourceUrl = useBaseUrl(`${assetRoot}${model.id}.drawio`);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const imageRef = useRef(null);
  const surfaceRef = useRef(null);
  const panzoomRef = useRef(null);
  const viewModeRef = useRef("fit");
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

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
    viewModeRef.current = "fit";
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

  function actualSize() {
    viewModeRef.current = "actual";
    const image = imageRef.current;
    const surface = surfaceRef.current;
    const panzoom = panzoomRef.current;
    if (!image?.naturalWidth || !surface || !panzoom) return;
    // Normalize position before changing scale: panzoom can reject a zoom
    // when the old fitted image would leave its bounds during that change.
    panzoom.zoomTo(0, 0, 1);
    panzoom.moveTo(0, 0);
    panzoom.zoomAbs(0, 0, 1);
    panzoom.moveTo(Math.max(12, (surface.clientWidth - image.naturalWidth) / 2), Math.max(12, (surface.clientHeight - image.naturalHeight) / 2));
  }

  useEffect(() => {
    if (!isOpen) return undefined;
    const image = imageRef.current;
    let cancelled = false;
    let panzoom;
    let observer;
    const refreshView = () => {
      if (!image.complete || !image.naturalWidth || !panzoomRef.current) return;
      if (viewModeRef.current === "actual") actualSize();
      else if (viewModeRef.current === "fit") resetView();
      setIsReady(true);
    };
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
      panzoom.on("transform", () => setZoomPercent(Math.round(panzoom.getTransform().scale * 100)));
      image.addEventListener("load", refreshView);
      observer = new ResizeObserver(refreshView);
      observer.observe(surfaceRef.current);
      refreshView();
    }
    initialize();
    return () => {
      cancelled = true;
      image.removeEventListener("load", refreshView);
      observer?.disconnect();
      panzoom?.dispose();
      panzoomRef.current = null;
    };
  }, [isOpen]);

  function open(event) {
    viewModeRef.current = "fit";
    setIsReady(false);
    openerRef.current = event.currentTarget;
    setIsOpen(true);
  }
  function zoomBy(factor) {
    const panzoom = panzoomRef.current;
    const surface = surfaceRef.current;
    if (!panzoom || !surface) return;
    viewModeRef.current = "custom";
    const x = surface.clientWidth / 2;
    const y = surface.clientHeight / 2;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) panzoom.zoomTo(x, y, factor);
    else panzoom.smoothZoom(x, y, factor);
  }
  function handleKey(event) {
    const offsets = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
    if (offsets[event.key]) {
      event.preventDefault();
      if (panzoomRef.current) viewModeRef.current = "custom";
      panzoomRef.current?.zoomTo(0, 0, 1);
      panzoomRef.current?.moveBy(...offsets[event.key]);
    } else if (["+", "=", "-", "0", "1"].includes(event.key)) {
      event.preventDefault();
      if (event.key === "0") resetView();
      else if (event.key === "1") actualSize();
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
      <button className={diagramStyles.expandButton} type="button" onClick={open} aria-haspopup="dialog" aria-label={`Expand ${model.title} ${kind}`}>Expand {kind}</button>
    </div>
    <button className={styles.preview} type="button" onClick={open} aria-haspopup="dialog" aria-label={`View ${model.title} in diagram viewer`}>
      <img src={svgUrl} alt={model.alt} loading="lazy" />
    </button>
    <p className={styles.resources}><a href={sourceUrl} download aria-label={`Download editable ${model.title} Draw.io source`}>Download editable Draw.io</a></p>
    {children}
    {isOpen ? <dialog ref={dialogRef} className={`${diagramStyles.modal} ${styles.dialog}`} aria-label={`${model.title} ${kind === "model" ? "BPMN" : "diagram"} viewer`} onKeyDown={handleDialogKey} onCancel={(event) => { event.preventDefault(); setIsOpen(false); }}>
      <div className={diagramStyles.modalToolbar}><div><p className={diagramStyles.modalTitle}>{model.title}</p><p className={diagramStyles.modalHint}>Arrow keys pan; + and - zoom; 0 fits the diagram; 1 shows actual size.</p></div>
        <div className={diagramStyles.controlGroup}>
          <output className={diagramStyles.zoomStatus} aria-label="Diagram zoom">{zoomPercent}%</output>
          <button className={diagramStyles.controlButton} type="button" disabled={!isReady} aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)}>-</button>
          <button className={diagramStyles.controlButton} type="button" disabled={!isReady} aria-label="Zoom in" onClick={() => zoomBy(1.2)}>+</button>
          <button className={`${diagramStyles.controlButton} ${diagramStyles.textButton}`} type="button" disabled={!isReady} aria-label="View at actual size (100%)" onClick={actualSize}>100%</button>
          <button className={`${diagramStyles.controlButton} ${diagramStyles.textButton}`} type="button" disabled={!isReady} onClick={resetView}>Reset</button>
          <button className={`${diagramStyles.controlButton} ${diagramStyles.textButton}`} ref={closeRef} type="button" onClick={() => setIsOpen(false)}>Close</button>
        </div>
      </div>
      <div className={`${diagramStyles.viewport} ${styles.viewport}`} tabIndex={0} role="region" aria-label={`${model.title} diagram. Arrow keys pan; plus and minus zoom; zero fits the view; one shows actual size.`} onKeyDown={handleKey}>
        <div ref={surfaceRef} className={`${diagramStyles.modalDiagram} ${diagramStyles.zoomSurface}`}>
          <img ref={imageRef} className={styles.zoomImage} src={svgUrl} alt={model.alt} draggable={false} />
        </div>
      </div>
    </dialog> : null}
  </figure>;
}
