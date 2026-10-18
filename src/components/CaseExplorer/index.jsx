import Link from "@docusaurus/Link";
import Heading from "@theme/Heading";
import { caseCatalog, caseLevels } from "@site/src/data/caseCatalog";
import styles from "./styles.module.css";

export function CaseOverview({ slug }) {
  const item = caseCatalog.find((entry) => entry.slug === slug);
  if (!item) throw new Error('Unknown case: ' + slug);
  return <aside className={styles.overview} aria-label="Case preparation and output">
    <p className={styles.eyebrow}>{item.level} · {item.sessions} sessions of 60–90 minutes</p>
    <dl className={styles.overviewList}>
      <dt>Prepare</dt><dd><Link to={item.prerequisite.to}>{item.prerequisite.label}</Link></dd>
      <dt>Tools</dt><dd>Complete either Excel or SQL. Both routes include worked checks.</dd>
      <dt>Produce</dt><dd>{item.deliverable}</dd>
    </dl>
    <p className={styles.boundary}>The worked core teaches the method. The independent challenge asks you to apply it and defend your own conclusion.</p>
  </aside>;
}

export default function CaseExplorer() {
  return <div className={styles.explorer}>
    {caseLevels.map((level) => <section key={level} aria-labelledby={'cases-' + level.toLowerCase()} className={styles.level}>
      <Heading as="h2" id={'cases-' + level.toLowerCase()}>{level}</Heading>
      <p>{level === 'Basic' ? 'Follow a defined population, reconcile evidence, and explain a result.' : level === 'Intermediate' ? 'Compare measures, investigate competing explanations, and recommend an action.' : 'Reconcile processes and periods, evaluate uncertainty, and defend priorities.'}</p>
      <ul className={styles.cards}>{caseCatalog.filter((item) => item.level === level).map((item) => <li className={styles.card} key={item.slug}>
        <p className={styles.eyebrow}>Case {item.number} · {item.sessions} sessions · Excel or SQL</p>
        <h3><Link to={'/docs/analytics/cases/' + item.slug}>{item.title}</Link></h3>
        <p>{item.summary}</p>
        <dl className={styles.cardDetails}>
          <dt>Preparation</dt><dd><Link to={item.prerequisite.to}>{item.prerequisite.label}</Link></dd>
          <dt>Deliverable</dt><dd>{item.deliverable}</dd>
        </dl>
      </li>)}</ul>
    </section>)}
  </div>;
}
