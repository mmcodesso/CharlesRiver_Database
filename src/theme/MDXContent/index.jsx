import { useEffect } from "react";
import { useLocation } from "@docusaurus/router";
import MDXContent from "@theme-original/MDXContent";

// Reference headings remain linkable when their surrounding details are closed.
export default function LinkedMDXContent(props) {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    let anchor;
    try {
      anchor = decodeURIComponent(hash.slice(1));
    } catch {
      return undefined;
    }
    let scrollFrame;
    const removeListeners = [];
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(anchor);
      if (!target) return;
      const closed = [];
      for (let node = target.parentElement; node; node = node.parentElement) {
        if (node.tagName === "DETAILS" && (!node.open || node.dataset.collapsed === "true")) {
          closed.push(node);
        }
      }
      if (!closed.length) return;
      const scrollToTarget = () => {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = window.requestAnimationFrame(() => {
          target.scrollIntoView({ block: "start", behavior: "instant" });
        });
      };
      // Long reference sections have height-dependent animation durations.
      // Reposition at the real transition end, including reduced-motion mode.
      closed.reverse().forEach((details) => {
        const onExpanded = (event) => {
          if (event.propertyName !== "height" || event.target.parentElement !== details) return;
          details.removeEventListener("transitionend", onExpanded);
          scrollToTarget();
        };
        details.addEventListener("transitionend", onExpanded);
        removeListeners.push(() => details.removeEventListener("transitionend", onExpanded));
        // The summary updates both native open and Docusaurus collapse state.
        details.querySelector(":scope > summary")?.click();
      });
      scrollToTarget();
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(scrollFrame);
      removeListeners.forEach((remove) => remove());
    };
  }, [pathname, hash, key]);

  return <MDXContent {...props} />;
}
