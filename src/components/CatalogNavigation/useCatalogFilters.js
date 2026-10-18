import { useEffect } from "react";
import { useHistory, useLocation } from "@docusaurus/router";

export function matchesSearch(text, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((word) => text.toLowerCase().includes(word));
}

// Each catalog owns only its namespaced parameters. Other URL state is preserved.
export default function useCatalogFilters(namespace, topicIds, targets) {
  const history = useHistory();
  const location = useLocation();
  const searchKey = `${namespace}_q`;
  const topicKey = `${namespace}_topic`;
  const params = new URLSearchParams(location.search);
  const query = params.get(searchKey) ?? "";
  const requestedTopic = params.get(topicKey);
  const topicId = topicIds.includes(requestedTopic) ? requestedTopic : "all";

  function update(nextQuery, nextTopic, hash = "", replace = false) {
    const nextParams = new URLSearchParams(location.search);
    if (nextQuery) nextParams.set(searchKey, nextQuery);
    else nextParams.delete(searchKey);
    if (nextTopic !== "all") nextParams.set(topicKey, nextTopic);
    else nextParams.delete(topicKey);
    const search = nextParams.toString();
    const next = { ...location, search: search ? `?${search}` : "", hash };
    if (next.search !== location.search || next.hash !== location.hash) {
      history[replace ? "replace" : "push"](next);
    }
  }

  useEffect(() => {
    function revealAnchor() {
      let anchor;
      try {
        anchor = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (!anchor) return;
      const target = targets.find((item) => item.id === anchor);
      if (target && ((topicId !== "all" && target.topicId !== topicId) || !matchesSearch(target.text, query))) {
        update("", "all", window.location.hash, true);
        return;
      }
      const element = document.getElementById(anchor);
      if (!element) return;
      // A guided path may itself be collapsed, or contain the destination.
      for (let current = element; current; current = current.parentElement) {
        if (current.tagName === "DETAILS") current.open = true;
      }
      element.scrollIntoView({ block: "start" });
    }
    const frame = window.requestAnimationFrame(revealAnchor);
    window.addEventListener("hashchange", revealAnchor);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", revealAnchor);
    };
  }, [location.hash, location.search, query, topicId, targets]);

  return {
    query,
    topicId,
    setQuery: (value) => update(value, topicId),
    setTopicId: (value) => update(query, value),
    reset: () => update("", "all"),
  };
}
