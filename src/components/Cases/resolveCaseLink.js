import { caseCatalog } from "@site/src/data/caseCatalog";
import redirects from "@site/src/data/caseRedirects.json";

// Report catalogs are frozen release inputs; resolve their teaching links at presentation time.
export default function resolveCaseLink(link) {
  if (!link) return link;
  const match = /^\/docs\/analytics\/cases\/([^?#]+)([?#].*)?$/.exec(link.href);
  if (!match) return link;
  const slug = redirects[match[1]] ?? match[1];
  const entry = caseCatalog.find((item) => item.slug === slug);
  return { ...link, href: '/docs/analytics/cases/' + slug + (match[2] ?? ''), label: entry?.title ?? link.label };
}
