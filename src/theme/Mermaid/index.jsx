import React, { useEffect, useRef, useState } from "react";
import ErrorBoundary from "@docusaurus/ErrorBoundary";
import { ErrorBoundaryErrorMessageFallback } from "@docusaurus/theme-common";
import {
  MermaidContainerClassName,
  useMermaidRenderResult,
} from "@docusaurus/theme-mermaid/client";
import clsx from "clsx";

import styles from "./styles.module.css";

function bindDiagramInteractions(renderResult, containerRef) {
  const container = containerRef.current;
  if (!container) {
    return;
  }
  renderResult.bindFunctions?.(container);
}

function getSvgDimensions(svg) {
  const viewBox = svg.viewBox?.baseVal;
  if (viewBox?.width && viewBox?.height) {
    return { width: viewBox.width, height: viewBox.height };
  }

  const bbox = svg.getBBox?.();
  if (bbox?.width && bbox?.height) {
    return { width: bbox.width, height: bbox.height };
  }

  const rect = svg.getBoundingClientRect();
  return {
    width: rect.width || 1,
    height: rect.height || 1,
  };
}

function MermaidMarkup({ renderResult, containerRef, className }) {
  useEffect(() => {
    bindDiagramInteractions(renderResult, containerRef);
  }, [containerRef, renderResult]);

  return (
    <div
      ref={containerRef}
      className={clsx(MermaidContainerClassName, className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: renderResult.svg }}
    />
  );
}

function MermaidRenderer({ value }) {
  const renderResult = useMermaidRenderResult({ text: value });
  const inlineRef = useRef(null);
  const modalRef = useRef(null);
  const viewportRef = useRef(null);
  const panzoomRef = useRef(null);
  const svgRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !modalRef.current || !viewportRef.current) {
      return undefined;
    }

    let cancelled = false;
    let localPanzoom;

    const fitDiagramToViewport = () => {
      if (!localPanzoom || !svgRef.current || !viewportRef.current) {
        return;
      }

      const viewport = viewportRef.current;
      const { width: svgWidth, height: svgHeight } = getSvgDimensions(svgRef.current);
      const availableWidth = Math.max(viewport.clientWidth - 48, 1);
      const availableHeight = Math.max(viewport.clientHeight - 48, 1);
      const scale = Math.min(availableWidth / svgWidth, availableHeight / svgHeight, 1);
      const x = (viewport.clientWidth - svgWidth * scale) / 2;
      const y = (viewport.clientHeight - svgHeight * scale) / 2;

      localPanzoom.zoomAbs(0, 0, scale);
      localPanzoom.moveTo(x, y);
    };

    const initializePanzoom = async () => {
      const { default: createPanzoom } = await import("panzoom");
      if (cancelled || !modalRef.current) {
        return;
      }

      const svg = modalRef.current.querySelector("svg");
      if (!svg) {
        return;
      }

      svgRef.current = svg;
      svg.style.maxWidth = "none";
      svg.style.height = "auto";

      localPanzoom = createPanzoom(svg, {
        maxZoom: 6,
        minZoom: 0.35,
        bounds: true,
        boundsPadding: 0.2,
        smoothScroll: false,
      });
      panzoomRef.current = localPanzoom;

      requestAnimationFrame(fitDiagramToViewport);
      window.addEventListener("resize", fitDiagramToViewport);
    };

    initializePanzoom();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", fitDiagramToViewport);
      panzoomRef.current?.dispose();
      panzoomRef.current = null;
      svgRef.current = null;
    };
  }, [isOpen, renderResult]);

  if (renderResult === null) {
    return null;
  }

  const zoomIn = () => panzoomRef.current?.zoomIn();
  const zoomOut = () => panzoomRef.current?.zoomOut();
  const resetZoom = () => {
    if (!panzoomRef.current || !svgRef.current || !viewportRef.current) {
      return;
    }

    const viewport = viewportRef.current;
    const { width: svgWidth, height: svgHeight } = getSvgDimensions(svgRef.current);
    const availableWidth = Math.max(viewport.clientWidth - 48, 1);
    const availableHeight = Math.max(viewport.clientHeight - 48, 1);
    const scale = Math.min(availableWidth / svgWidth, availableHeight / svgHeight, 1);
    const x = (viewport.clientWidth - svgWidth * scale) / 2;
    const y = (viewport.clientHeight - svgHeight * scale) / 2;

    panzoomRef.current.zoomAbs(0, 0, scale);
    panzoomRef.current.moveTo(x, y);
  };

  return (
    <>
      <figure className={styles.figure}>
        <div className={styles.inlineToolbar}>
          <figcaption className={styles.inlineHint}>
            Expand the diagram for a larger view with zoom and pan controls.
          </figcaption>
          <button
            type="button"
            className={styles.expandButton}
            onClick={() => setIsOpen(true)}
          >
            Expand diagram
          </button>
        </div>
        {!isOpen ? (
          <MermaidMarkup
            renderResult={renderResult}
            containerRef={inlineRef}
            className={styles.inlineDiagram}
          />
        ) : null}
      </figure>

      {isOpen ? (
        <div
          className={styles.backdrop}
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Expanded Mermaid diagram"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalToolbar}>
              <div>
                <p className={styles.modalTitle}>Diagram viewer</p>
                <p className={styles.modalHint}>
                  Drag to pan. Use the mouse wheel, trackpad, or controls to zoom.
                </p>
              </div>
              <div className={styles.controlGroup}>
                <button type="button" className={styles.controlButton} onClick={zoomOut}>
                  -
                </button>
                <button type="button" className={styles.controlButton} onClick={zoomIn}>
                  +
                </button>
                <button
                  type="button"
                  className={clsx(styles.controlButton, styles.textButton)}
                  onClick={resetZoom}
                >
                  Reset
                </button>
                <button
                  type="button"
                  className={clsx(styles.controlButton, styles.textButton)}
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div ref={viewportRef} className={styles.viewport}>
              <MermaidMarkup
                renderResult={renderResult}
                containerRef={modalRef}
                className={clsx(styles.modalDiagram, styles.zoomSurface)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function Mermaid(props) {
  return (
    <ErrorBoundary
      fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}
    >
      <MermaidRenderer {...props} />
    </ErrorBoundary>
  );
}
