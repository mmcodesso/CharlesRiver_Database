// Preserve the public anchors already used by the Query Library.
export function queryAnchor(queryKey) {
  return `query-${queryKey.replace(/^queries\//, "").replace(/\.sql$/, "").replace(/[\/_]/g, "-")}`;
}

export function queryLibraryLink(queryKey) {
  return `/docs/analytics/analysis-tracks#${queryAnchor(queryKey)}`;
}
