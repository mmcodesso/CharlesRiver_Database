import React from "react";
import Heading from "@theme/Heading";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import { QueryReference, humanizeQueryFilename } from "@site/src/components/QueryReference";
import queryManifest from "@site/src/generated/queryManifest";
import { auditAnomalyCoverage } from "@site/src/generated/queryDocCollections";
import queryTopics from "@site/src/data/queryTopics.json";
import topicGuidance from "@site/src/data/queryTopicGuidance.json";
import learningPaths from "@site/src/data/queryLearningPaths.json";
import TopicLearningLinks from "@site/src/components/CatalogNavigation/TopicLearningLinks";
import styles from "@site/src/components/ReportCatalog/styles.module.css";
import { queryAnchor } from "@site/src/components/CatalogNavigation/queryLinks";
import useCatalogFilters, { matchesSearch } from "@site/src/components/CatalogNavigation/useCatalogFilters";

const coverageByQuery = Object.fromEntries(auditAnomalyCoverage.map((item) => [item.queryKey, item]));
const queries = queryTopics.flatMap((topic) => topic.queries.map((queryKey) => {
  const entry = queryManifest[queryKey];
  if (!entry) throw new Error(`Unknown query key: ${queryKey}`);
  return { ...entry, queryKey, topicId: topic.id, topicTitle: topic.title, label: humanizeQueryFilename(entry.filename) };
}));

function querySearchText(entry) {
  return `${entry.label} ${entry.teachingObjective} ${entry.outputShape} ${entry.mainTables} ${entry.topicTitle}`;
}

const anchorTargets = [
  ...queries.map((entry) => ({ id: queryAnchor(entry.queryKey), topicId: entry.topicId, text: querySearchText(entry) })),
  ...queryTopics.map((topic) => ({ id: topic.id, topicId: topic.id, text: "" })),
];

function Note({ text }) {
  return text.split(/(`[^`]+`)/g).map((part, index) => part.startsWith("`")
    ? <code key={index}>{part.slice(1, -1)}</code>
    : part);
}

export default function QueryLibrary() {
  const { query, topicId, setQuery, setTopicId, reset } = useCatalogFilters("cr_queries", queryTopics.map((topic) => topic.id), anchorTargets);
  const brokenLinks = useBrokenLinks();
  learningPaths.forEach((path) => brokenLinks.collectAnchor(path.id));
  const visible = queries.filter((entry) => {
    return (topicId === "all" || topicId === entry.topicId) && matchesSearch(querySearchText(entry), query);
  });

  return (
    <section className={styles.section} aria-label="Browse SQL queries">
      <section className={styles.group} aria-label="Guided query paths">
        <Heading as="h3" id="guided-query-paths">Guided Query Paths</Heading>
        <p>Follow these sequences when the question requires several linked queries. Each step links to its query in the catalog below.</p>
        {learningPaths.map((path) => <details key={path.id} id={path.id} className={styles.guidance}>
          <summary>{path.title}</summary>
          <div className={styles.guidanceBody}>
            <p>{path.description}</p>
            <ol>{path.items.map((item) => <li key={item.queryKey}>
              <a href={`#${queryAnchor(item.queryKey)}`} onClick={reset}>{humanizeQueryFilename(queryManifest[item.queryKey].filename)}</a>
              <p><Note text={item.lead} /></p>
            </li>)}</ol>
          </div>
        </details>)}
      </section>
      <Heading as="h3" id="all-queries">All Queries</Heading>
      <nav className={styles.topicLinks} aria-label="Query topics">
        {queryTopics.map((topic) => (
          <a key={topic.id} href={`#${topic.id}`} onClick={reset}>
            {topic.title} <span>({topic.queries.length})</span>
          </a>
        ))}
      </nav>
      <div className={styles.filters}>
        <label htmlFor="query-search">Search queries
          <input id="query-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try cash, payroll, or a table name…" />
        </label>
        <label htmlFor="query-topic">Business topic
          <select id="query-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
            <option value="all">All topics</option>
            {queryTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
          </select>
        </label>
        <button className={styles.secondaryAction} type="button" onClick={reset} disabled={!query && topicId === "all"}>Clear filters</button>
      </div>
      <p className={styles.resultCount} role="status" aria-live="polite">Showing {visible.length} of {queries.length} queries</p>
      {!visible.length ? <p className={styles.empty}>No queries match these filters. Try another term or clear the filters to browse all queries.</p> : null}
      {queryTopics.map((topic) => {
        const items = visible.filter((entry) => entry.topicId === topic.id);
        return items.length ? (
          <section key={topic.id} className={styles.group} aria-labelledby={topic.id}>
            <div className={styles.groupHeader}>
              <Heading as="h3" id={topic.id} className={styles.groupTitle}>{topic.title}</Heading>
              <p>{topic.description}</p>
              <TopicLearningLinks topicId={topic.id} />
              <details className={styles.guidance}>
                <summary aria-label={`Interpret these results for ${topic.title}`}>Interpret these results</summary>
                <div className={styles.guidanceBody}>
                  <ul>{topicGuidance[topic.id].map((note) => <li key={note}><Note text={note} /></li>)}</ul>
                </div>
              </details>
            </div>
            <div className={styles.groupGrid}>
              {items.map((entry) => {
                const coverage = coverageByQuery[entry.queryKey];
                return <article key={entry.queryKey} className={styles.queryItem} aria-label={entry.label}>
                  <QueryReference queryKey={entry.queryKey} label={entry.label} anchorId={queryAnchor(entry.queryKey)} showMetadata showDownload>
                    {coverage ? <details className={styles.guidance}>
                      <summary aria-label={`Anomaly coverage for ${entry.label}`}>Anomaly coverage</summary>
                      <div className={styles.guidanceBody}>
                        <p><strong>Review focus:</strong> {coverage.recommendedUse}</p>
                        <p><strong>Expected anomaly types:</strong> <Note text={coverage.expectedAnomalyTypes} /></p>
                        <p>Trace flagged rows to their source documents before concluding that a control failed.</p>
                      </div>
                    </details> : null}
                  </QueryReference>
                </article>;
              })}
            </div>
          </section>
        ) : null;
      })}
    </section>
  );
}
