import React, { useState } from "react";
import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import useBaseUrl from "@docusaurus/useBaseUrl";

import { ReportPreviewOverlay } from "@site/src/components/ReportPreviewOverlay";
import reportManifest from "@site/src/generated/reportManifest";
import reportPackManifest from "@site/src/generated/reportPackManifest";
import styles from "./styles.module.css";

function getReportEntry(reportKey) {
  const entry = reportManifest[reportKey];
  if (!entry) {
    throw new Error(`Unknown report key: ${reportKey}`);
  }
  return entry;
}

// Keep the teaching prompts alongside each report without a second navigation layer.
const guidanceByReport = {};
Object.values(reportPackManifest).forEach((pack) => {
  pack.reports.forEach((item) => {
    const guidance = guidanceByReport[item.reportSlug] ?? { questions: [], analysis: [], links: [] };
    guidance.questions = Array.from(new Set([...guidance.questions, ...item.discussionQuestions]));
    guidance.analysis = Array.from(new Set([...guidance.analysis, ...item.suggestedAnalysis]));
    if (item.relatedLink && !guidance.links.some((link) => link.href === item.relatedLink.href)) {
      guidance.links.push(item.relatedLink);
    }
    guidanceByReport[item.reportSlug] = guidance;
  });
});

function ReportCard({ reportKey }) {
  const entry = getReportEntry(reportKey);
  const guidance = guidanceByReport[reportKey];
  const previewUrl = useBaseUrl(entry.previewPath);
  const excelUrl = useBaseUrl(entry.excelPath);
  const csvUrl = useBaseUrl(entry.csvPath);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <article className={styles.card} id={`report-${reportKey}`} aria-labelledby={`title-${reportKey}`}>
      <div className={styles.cardHeader}>
        <div className={styles.cardText}>
          <h4 className={styles.cardTitle} id={`title-${reportKey}`}>{entry.title}</h4>
          <p className={styles.cardDescription}>{entry.description}</p>
          <div className={styles.chipRow}>
            <span className={styles.chip}>{entry.cadence}</span>
          </div>
        </div>
        <div className={styles.actionRow}>
          <button
            className={styles.primaryAction}
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            aria-haspopup="dialog"
          >
            Preview
          </button>
          {entry.excelEnabled ? (
            <a className={styles.secondaryAction} href={excelUrl}>
              Download Excel
            </a>
          ) : null}
          {entry.csvEnabled ? (
            <a className={styles.secondaryAction} href={csvUrl}>
              Download CSV
            </a>
          ) : null}
        </div>
      </div>
      {guidance ? (
        <details className={styles.guidance}>
          <summary>Interpret this report</summary>
          <div className={styles.guidanceBody}>
            <h5>Discussion questions</h5>
            <ul>{guidance.questions.map((question) => <li key={question}>{question}</li>)}</ul>
            <h5>Suggested analysis</h5>
            <ul>{guidance.analysis.map((step) => <li key={step}>{step}</li>)}</ul>
            {guidance.links.map((link) => <p key={link.href}><Link to={link.href}>{link.label}</Link></p>)}
          </div>
        </details>
      ) : null}
      <ReportPreviewOverlay
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewUrl={previewUrl}
        title={entry.title}
      />
    </article>
  );
}

export function ReportCatalog({ topics }) {
  const [query, setQuery] = useState("");
  const [topicId, setTopicId] = useState("all");
  const total = topics.reduce((count, topic) => count + topic.reports.length, 0);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visibleTopics = topics
    .filter((topic) => topicId === "all" || topic.id === topicId)
    .map((topic) => ({
      ...topic,
      reports: topic.reports.filter((key) => {
        const report = getReportEntry(key);
        const text = `${report.title} ${report.description} ${topic.title}`.toLowerCase();
        return words.every((word) => text.includes(word));
      }),
    }))
    .filter((topic) => topic.reports.length);
  const count = visibleTopics.reduce((sum, topic) => sum + topic.reports.length, 0);
  const reset = () => { setQuery(""); setTopicId("all"); };

  return (
    <section className={styles.section} aria-label="Browse business reports">
      <nav className={styles.topicLinks} aria-label="Report topics">
        {topics.map((topic) => (
          <a key={topic.id} href={`#${topic.id}`} onClick={reset}>
            {topic.title} <span>({topic.reports.length})</span>
          </a>
        ))}
      </nav>
      <div className={styles.filters}>
        <label htmlFor="report-search">Search reports
          <input id="report-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try cash, aging, payroll…" />
        </label>
        <label htmlFor="report-topic">Business topic
          <select id="report-topic" value={topicId} onChange={(event) => setTopicId(event.target.value)}>
            <option value="all">All topics</option>
            {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}
          </select>
        </label>
        <button className={styles.secondaryAction} type="button" onClick={reset} disabled={!query && topicId === "all"}>Clear filters</button>
      </div>
      <p className={styles.resultCount} role="status" aria-live="polite">Showing {count} of {total} reports</p>
      {count === 0 ? <p className={styles.empty}>No reports match these filters. Try another term or clear the filters to browse all reports.</p> : null}
      {visibleTopics.map((topic) => (
        <section key={topic.id} className={styles.group} aria-labelledby={topic.id}>
          <div className={styles.groupHeader}>
            <Heading as="h3" id={topic.id} className={styles.groupTitle}>{topic.title}</Heading>
            <p>{topic.description}</p>
          </div>
          <div className={styles.groupGrid}>
            {topic.reports.map((key) => (
              <ReportCard key={key} reportKey={key} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
