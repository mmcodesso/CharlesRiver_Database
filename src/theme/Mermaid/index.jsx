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
    return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
  }

  const bbox = svg.getBBox?.();
  if (bbox?.width && bbox?.height) {
    return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
  }

  const rect = svg.getBoundingClientRect();
  return {
    x: 0,
    y: 0,
    width: rect.width || 1,
    height: rect.height || 1,
  };
}

function getViewportCenter(viewport) {
  return {
    x: viewport.clientWidth / 2,
    y: viewport.clientHeight / 2,
  };
}

function getViewportInnerSize(viewport) {
  const computedStyle = window.getComputedStyle(viewport);
  const paddingX =
    parseFloat(computedStyle.paddingLeft || "0") + parseFloat(computedStyle.paddingRight || "0");
  const paddingY =
    parseFloat(computedStyle.paddingTop || "0") + parseFloat(computedStyle.paddingBottom || "0");

  return {
    width: Math.max(viewport.clientWidth - paddingX, 1),
    height: Math.max(viewport.clientHeight - paddingY, 1),
  };
}

function hasUsableSize({ width, height }) {
  return Number.isFinite(width) && Number.isFinite(height) && width > 1 && height > 1;
}

function resetPanzoomTransform(panzoom) {
  if (!panzoom) {
    return;
  }

  panzoom.moveTo(0, 0);
  panzoom.zoomAbs(0, 0, 1);
  panzoom.moveTo(0, 0);
}

function fitDiagramInViewport({ panzoom, svg, viewport }) {
  if (!panzoom || !svg || !viewport) {
    return false;
  }

  const { x: svgX, y: svgY, width: svgWidth, height: svgHeight } = getSvgDimensions(svg);
  const { width: viewportWidth, height: viewportHeight } = getViewportInnerSize(viewport);
  if (!hasUsableSize({ width: svgWidth, height: svgHeight }) || !hasUsableSize({ width: viewportWidth, height: viewportHeight })) {
    return false;
  }

  resetPanzoomTransform(panzoom);

  const framePadding = 12;
  const availableWidth = Math.max(viewportWidth - framePadding * 2, 1);
  const availableHeight = Math.max(viewportHeight - framePadding * 2, 1);
  const targetScale = Math.min(availableWidth / svgWidth, availableHeight / svgHeight);
  if (!Number.isFinite(targetScale) || targetScale <= 0) {
    return false;
  }

  panzoom.zoomAbs(0, 0, targetScale);
  const appliedScale = panzoom.getTransform?.().scale ?? targetScale;
  const x = (viewportWidth - svgWidth * appliedScale) / 2 - svgX * appliedScale;
  const y = (viewportHeight - svgHeight * appliedScale) / 2 - svgY * appliedScale;
  panzoom.moveTo(x, y);
  return true;
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
    let hasInitialFitCompleted = false;
    let localPanzoom;
    let resizeObserver;
    const fitTimeoutIds = new Set();

    const fitDiagramToViewport = () =>
      fitDiagramInViewport({
        panzoom: localPanzoom,
        svg: svgRef.current,
        viewport: viewportRef.current,
      });

    const clearInitialFitRetries = () => {
      fitTimeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      fitTimeoutIds.clear();
    };

    const detachInitialFitListeners = () => {
      window.removeEventListener("resize", attemptInitialFit);
      resizeObserver?.disconnect();
      resizeObserver = undefined;
      clearInitialFitRetries();
    };

    const attemptInitialFit = () => {
      if (cancelled || hasInitialFitCompleted) {
        return;
      }

      if (fitDiagramToViewport()) {
        hasInitialFitCompleted = true;
        detachInitialFitListeners();
      }
    };

    const scheduleInitialFit = (delay = 0) => {
      const timeoutId = window.setTimeout(() => {
        fitTimeoutIds.delete(timeoutId);
        attemptInitialFit();
      }, delay);
      fitTimeoutIds.add(timeoutId);
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
        boundsPadding: 0.02,
        smoothScroll: false,
      });
      panzoomRef.current = localPanzoom;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          attemptInitialFit();
        });
      });
      scheduleInitialFit(40);
      scheduleInitialFit(120);
      scheduleInitialFit(240);
      if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
          if (!cancelled) {
            attemptInitialFit();
          }
        });
      }
      window.addEventListener("resize", attemptInitialFit);
      if (window.ResizeObserver && viewportRef.current) {
        resizeObserver = new window.ResizeObserver(() => {
          attemptInitialFit();
        });
        resizeObserver.observe(viewportRef.current);
      }
    };

    initializePanzoom();

    return () => {
      cancelled = true;
      detachInitialFitListeners();
      panzoomRef.current?.dispose();
      panzoomRef.current = null;
      svgRef.current = null;
    };
  }, [isOpen, renderResult]);

  if (renderResult === null) {
    return null;
  }

  const zoomIn = () => {
    if (!panzoomRef.current || !viewportRef.current) {
      return;
    }

    const center = getViewportCenter(viewportRef.current);
    panzoomRef.current.smoothZoom(center.x, center.y, 1.2);
  };

  const zoomOut = () => {
    if (!panzoomRef.current || !viewportRef.current) {
      return;
    }

    const center = getViewportCenter(viewportRef.current);
    panzoomRef.current.smoothZoom(center.x, center.y, 1 / 1.2);
  };
  const resetZoom = () => {
    fitDiagramInViewport({
      panzoom: panzoomRef.current,
      svg: svgRef.current,
      viewport: viewportRef.current,
    });
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
