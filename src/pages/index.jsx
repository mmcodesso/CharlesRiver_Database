import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { DatasetStructuredData } from "@site/src/components/SiteBranding";
import { caseCatalog } from "@site/src/data/caseCatalog";
import reportTopics from "@site/src/data/reportTopics.json";
import queryTopics from "@site/src/data/queryTopics.json";
import ProcessEvidenceMap, { EvidenceExplorer } from "@site/src/components/ProcessEvidenceMap";
import styles from "./index.module.css";

const pathways = [
  { number: "01", label: "Understand the system", title: "Business processes & AIS", text: "Follow an order, a supplier receipt, or a work order. Explain the documents, controls, and accounting consequences before writing a join.", href: "/docs/process-flows", action: "Explore the business processes" },
  { number: "02", label: "Build analytical skills", title: "SQL, Excel & accounting", text: "Begin with a focused evidence exercise. Then connect tables, compare results, and explain what an accounting measure can tell you.", href: "/docs/learn-and-practice", action: "Find your first exercise" },
  { number: "03", label: "Investigate a question", title: "Cases, reports & decisions", text: "Examine working capital, manufacturing cost, payroll, pricing, or controls. Support a conclusion with traceable evidence and its limits.", href: "/docs/analytics/cases", action: "Browse the case library" },
];

const cases = [
  { tag: "Order-to-cash", title: "Where does an order become accounting evidence?", text: "Trace order lines through shipment, invoicing, and customer settlement.", href: "/docs/analytics/cases/o2c-trace-case" },
  { tag: "Procure-to-pay", title: "What remains payable at the reporting date?", text: "Compare receipt-based obligations with accrued services and their settlement.", href: "/docs/analytics/cases/p2p-accrual-settlement-case" },
  { tag: "Conversion & manufacturing", title: "How does production become product cost?", text: "Connect work orders, materials, labor support, completion, and close.", href: "/docs/analytics/cases/manufacturing-labor-cost-case" },
];

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  const branding = siteConfig.customFields?.branding ?? {};
  const displayName = branding.displayName ?? "Charles River";
  const description = `Study accounting processes in ${branding.datasetName ?? "Charles River Accounting Dataset"} through 82 published tables, SQL and Excel exercises, and ${caseCatalog.length} guided teaching cases.`;
  const reportCount = reportTopics.reduce((count, topic) => count + topic.reports.length, 0);
  const queryCount = queryTopics.reduce((count, topic) => count + topic.queries.length, 0);
  return (
    <Layout title="Accounting Processes, Data & Teaching Cases" description={description}>
      <DatasetStructuredData pagePath="/" description={description} />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Accounting Analytics Hub / {displayName}</p>
            <p className={styles.environment}>Learn accounting through one connected business</p>
            <h1 id="home-title">{displayName}<br />Accounting processes<br /><em>and evidence.</em></h1>
            <p className={styles.lede}>Meet {displayName}, a home-furnishings business in Greater Boston. Follow its sales, purchases, production, and people through source documents to the general ledger. Use SQL, Excel, and guided cases to explain what happened and support a decision.</p>
            <p className={styles.principle}>Understand the company before analyzing its records.</p>
            <div className={styles.actions}>
              <Link className="button button--primary" to="/docs/company-story">Meet the company <span aria-hidden="true">→</span></Link>
              <Link className="button button--outline button--primary" to="/docs/">Begin learning</Link>
            </div>
            <div className={styles.utilityLinks}>
              <Link to="/docs/downloads">Download the dataset <span aria-hidden="true">↓</span></Link>
              <Link to="/docs/teach-with-data/instructor-adoption">Plan your teaching <span aria-hidden="true">→</span></Link>
            </div>
          </div>
          <ProcessEvidenceMap />
        </section>
        <div className={styles.factsBand}><div className={styles.facts} aria-label="Verified published dataset specifications">
          <p><strong>82</strong><span>connected accounting tables</span></p><p><strong>2024–2026</strong><span>main operating years</span></p><p><strong>SQLite · Excel · CSV</strong><span>three published formats</span></p><p><strong>Open educational resource</strong><span>CC BY-SA 4.0</span></p>
        </div></div>
        <section className={styles.section} aria-labelledby="company-heading"><div className={styles.companyGrid}>
          <div><p className={styles.eyebrow}>The business behind the data</p><h2 id="company-heading">Merchandise, manufacturing,<br />and hourly<br />Design Services.</h2></div>
          <div className={styles.companyCopy}><p>{branding.companyName ?? "Charles River Home Furnishings, Inc."} combines purchased merchandise, selected in-house manufacturing, and hourly Design Services. These operating choices connect demand to inventory, labor, receivables, payables, and financial close.</p><p>Start with the customer and the people doing the work. Follow their documents through the process guides, then examine the records to explain a balance, investigate a difference, or recommend a next step.</p><Link className={styles.textLink} to="/docs/company-story">Read the Company Story <span aria-hidden="true">→</span></Link></div>
        </div></section>
        <section className={styles.tintedSection} aria-labelledby="pathways-heading"><div className={styles.sectionInner}>
          <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>A clear way into the work</p><h2 id="pathways-heading">Start with a question.<br />Build toward a decision.</h2></div><p>Keep the company familiar while the accounting questions become more demanding.</p></div>
          <div className={styles.pathways}>{pathways.map((path) => <article className={styles.pathway} key={path.number}><p className={styles.pathLabel}>{path.number} / {path.label}</p><h3>{path.title}</h3><p>{path.text}</p><Link className={styles.textLink} to={path.href}>{path.action} <span aria-hidden="true">→</span></Link></article>)}</div>
        </div></section>
        <section className={styles.section} aria-labelledby="evidence-heading"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>From operations to interpretation</p><h2 id="evidence-heading">Follow the evidence.</h2></div><p>An operational event, an accounting entry, and a useful conclusion are different steps. Explore how they connect.</p></div><EvidenceExplorer /></section>
        <section className={styles.darkSection} aria-labelledby="cases-heading"><div className={styles.sectionInner}>
          <div className={styles.sectionHeader}><div><p className={styles.eyebrow}>Three starting investigations</p><h2 id="cases-heading">Build an explanation.<br />Recommend a next step.</h2></div><Link className={styles.textLink} to="/docs/analytics/cases">Explore all {caseCatalog.length} cases <span aria-hidden="true">→</span></Link></div>
          <div className={styles.caseGrid}>{cases.map((item) => <article className={styles.case} key={item.href}><p className={styles.pathLabel}>{item.tag}</p><h3><Link to={item.href}>{item.title}</Link></h3><p>{item.text}</p><Link className={styles.textLink} to={item.href}>Open the guided case <span aria-hidden="true">→</span></Link></article>)}</div>
        </div></section>
        <section className={styles.section} aria-labelledby="resources-heading"><div className={styles.resourceGrid}>
          <div><p className={styles.eyebrow}>One environment, connected resources</p><h2 id="resources-heading">Teach the concepts.<br />Examine the company.<br />Interpret the results.</h2><p className={styles.lede}>Accounting Analytics Hub brings the learning resources together. The textbook develops the concepts, while {displayName} provides the company, data, and investigations.</p><a className={styles.textLink} href="https://aa.accountinganalyticshub.com/">Read Accounting Analytics: An Integrated Approach <span aria-hidden="true">↗</span></a></div>
          <div className={styles.resourceList}>
            <Link to="/docs/analytics"><strong>Reports & analytics</strong><span>{reportCount} reports organized by business topic, plus {queryCount} SQL files.</span><span aria-hidden="true">→</span></Link>
            <Link to="/docs/reference/schema"><strong>Dataset reference</strong><span>Look up keys, document relationships, and posting logic.</span><span aria-hidden="true">→</span></Link>
            <Link to="/docs/teach-with-data/instructor-adoption"><strong>For instructors</strong><span>Connect AIS, analytics, financial, managerial, and audit coursework.</span><span aria-hidden="true">→</span></Link>
            <a href="https://accountinganalyticshub.com/"><strong>Accounting Analytics Hub</strong><span>Open textbooks and planned learning pathways.</span><span aria-hidden="true">↗</span></a>
          </div>
        </div></section>
        <section className={styles.downloadSection} aria-labelledby="download-heading"><div className={styles.sectionInner}><div><p className={styles.eyebrow}>Ready to explore</p><h2 id="download-heading">The files are ready.<br />Bring an accounting question.</h2><p>Download the company records and begin with a focused investigation.</p><p className={styles.small}>The <Link to="/docs/dataset-overview">Dataset Guide</Link> explains the tables and settlement postings beyond the main operating years.</p></div><Link className="button button--primary" to="/docs/downloads">Get the dataset <span aria-hidden="true">↓</span></Link></div></section>
      </main>
    </Layout>
  );
}
