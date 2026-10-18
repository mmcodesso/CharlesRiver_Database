import React, { useEffect, useId, useRef, useState } from "react";
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

function MermaidMarkup({ renderResult, containerRef, className, as: Element = "div", ...props }) {
  useEffect(() => {
    if (renderResult) {
      bindDiagramInteractions(renderResult, containerRef);
    }
  }, [containerRef, renderResult]);

  return (
    <Element
      {...props}
      ref={containerRef}
      className={clsx(MermaidContainerClassName, className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: renderResult?.svg ?? "" }}
    />
  );
}

function MermaidRenderer({ value }) {
  const renderResult = useMermaidRenderResult({ text: value });
  const diagramTitle = /^\s*accTitle\s*:\s*(.+)$/m.exec(value)?.[1] ?? "Record relationship diagram";
  const diagramDescription = /^\s*accDescr\s*:\s*(.+)$/m.exec(value)?.[1] ?? "Read the accompanying explanation for the records, relationship keys, and scope limitations.";
  const descriptionId = useId();
  const inlineRef = useRef(null);
  const modalRef = useRef(null);
  const viewportRef = useRef(null);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const openerRef = useRef(null);
  const panzoomRef = useRef(null);
  const svgRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocus = openerRef.current ?? document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
      if (event.key === "Tab") {
        const targets = dialogRef.current?.querySelectorAll(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (!targets?.length) {
          return;
        }
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
    };

    document.body.style.overflow = "hidden";
    dialog.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(focusFrame);
      dialog.removeEventListener("keydown", handleKeyDown);
      dialog.close();
      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
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
      // Mermaid can include unrelated whitespace in its declared viewBox. Fit
      // the actual rendered content, with room for strokes and arrowheads.
      // This changes only the viewer DOM, not the authored diagram or export.
      const contentBounds = svg.getBBox?.();
      if (contentBounds && hasUsableSize(contentBounds)) {
        const padding = 12;
        svg.setAttribute("viewBox", `${contentBounds.x - padding} ${contentBounds.y - padding} ${contentBounds.width + padding * 2} ${contentBounds.height + padding * 2}`);
      }
      const dimensions = getSvgDimensions(svg);
      svg.style.maxWidth = "none";
      // Panzoom coordinates must match the SVG viewBox rather than its percentage width.
      svg.style.width = `${dimensions.width}px`;
      svg.style.height = `${dimensions.height}px`;

      localPanzoom = createPanzoom(svg, {
        maxZoom: 6,
        minZoom: 0.05,
        bounds: true,
        boundsPadding: 0.02,
        smoothScroll: false,
        filterKey: () => true,
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

  const openViewer = (event) => {
    openerRef.current = event.currentTarget;
    setIsOpen(true);
  };

  const zoomBy = (factor) => {
    if (!panzoomRef.current || !viewportRef.current) {
      return;
    }

    const center = getViewportCenter(viewportRef.current);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      panzoomRef.current.zoomTo(center.x, center.y, factor);
    } else {
      panzoomRef.current.smoothZoom(center.x, center.y, factor);
    }
  };
  const zoomIn = () => zoomBy(1.2);
  const zoomOut = () => zoomBy(1 / 1.2);
  const resetZoom = () => {
    fitDiagramInViewport({
      panzoom: panzoomRef.current,
      svg: svgRef.current,
      viewport: viewportRef.current,
    });
  };

  const handleViewportKeyDown = (event) => {
    const offsets = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] };
    if (offsets[event.key]) {
      event.preventDefault();
      panzoomRef.current?.moveBy(...offsets[event.key]);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomIn();
    } else if (event.key === "-") {
      event.preventDefault();
      zoomOut();
    } else if (event.key === "0") {
      event.preventDefault();
      resetZoom();
    }
  };

  return (
    <>
      <figure className={styles.figure} aria-label={diagramTitle}>
        <div className={styles.inlineToolbar}>
          <figcaption className={styles.inlineHint}>
            Click the diagram or use Expand diagram for a larger view with zoom and pan controls.
          </figcaption>
          <button
            type="button"
            className={styles.expandButton}
            onClick={openViewer}
            aria-haspopup="dialog"
            aria-label={`Expand ${diagramTitle} diagram`}
          >
            Expand diagram
          </button>
        </div>
        <MermaidMarkup
          as="button"
          type="button"
          onClick={openViewer}
          aria-haspopup="dialog"
          aria-label={`View ${diagramTitle} in diagram viewer`}
          // Keep the opener mounted for focus restoration, with SVG IDs in only one view.
          renderResult={isOpen ? null : renderResult}
          containerRef={inlineRef}
          className={clsx(styles.inlineDiagram, styles.inlinePreview)}
        />
      </figure>

      {isOpen ? (
        <dialog
          ref={dialogRef}
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={`${diagramTitle} diagram viewer`}
          aria-describedby={descriptionId}
          onCancel={(event) => { event.preventDefault(); setIsOpen(false); }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              const bounds = event.currentTarget.getBoundingClientRect();
              if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setIsOpen(false);
            }
          }}
        >
            <p className={styles.accessibleDescription} id={descriptionId}>{diagramDescription}</p>
            <div className={styles.modalToolbar}>
              <div>
                <p className={styles.modalTitle}>{diagramTitle}</p>
                <p className={styles.modalHint}>
                  Drag to pan or focus the diagram and use arrow keys. Use + and - to zoom; 0 resets the view.
                </p>
              </div>
              <div className={styles.controlGroup}>
                <button type="button" className={styles.controlButton} onClick={zoomOut} aria-label="Zoom out">
                  -
                </button>
                <button type="button" className={styles.controlButton} onClick={zoomIn} aria-label="Zoom in">
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
                  ref={closeButtonRef}
                >
                  Close
                </button>
              </div>
            </div>

            <div
              ref={viewportRef}
              className={styles.viewport}
              tabIndex={0}
              role="region"
                  aria-label={`${diagramTitle}. Arrow keys pan; plus and minus zoom; zero resets the view.`}
              onKeyDown={handleViewportKeyDown}
            >
              <MermaidMarkup
                renderResult={renderResult}
                containerRef={modalRef}
                className={clsx(styles.modalDiagram, styles.zoomSurface)}
              />
            </div>
        </dialog>
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
