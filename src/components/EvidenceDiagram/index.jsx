import Link from "@docusaurus/Link";
import StaticDiagram from "@site/src/components/StaticDiagram";
import models from "@site/src/data/processEvidenceDiagrams.json";
import styles from "@site/src/components/SchemaDiagram/styles.module.css";

export default function EvidenceDiagram({ modelId }) {
  const model = models.find(entry => entry.id === modelId);
  if (!model) throw new Error(`Unknown evidence diagram: ${modelId}`);
  const nodes = Object.fromEntries(model.nodes.map(node => [node.id, node]));
  return <section id={`evidence-${model.id}`} className={styles.section} aria-label={model.title}>
    <p><strong>{model.technical ? "Technical build workflow" : model.id === "company-dependencies" ? "Business dependency map" : "Record and accounting evidence map"}</strong></p>
    <StaticDiagram model={model} assetRoot="/diagrams/evidence/">
      <details><summary>Read the connectors and evidence boundaries</summary>
        <p>{model.description}</p>
        <div className={styles.tableRegion} tabIndex={0} role="region" aria-label={`${model.title} evidence connections, scroll to view all columns`}>
          <table><thead><tr><th>Line and path</th><th>Meaning</th><th>Evidence to check</th></tr></thead><tbody>
            {model.relationships.map(edge => <tr key={edge.id}>
              <td>{edge.id}<br />{nodes[edge.source].title}<br />to {nodes[edge.target].title}</td>
              <td>{edge.kind === "workflow" ? "Technical workflow step" : edge.kind === "posting" ? "Type-qualified ledger source" : edge.kind === "reference" ? "Stored FK path" : edge.kind === "conditional" ? "Conditional source trace" : edge.kind === "aggregate" ? "Analytical match or aggregation" : "Business context or account effect"}</td>
              <td>{edge.label}{edge.recordLinks.map(link => <div key={`${link.child}.${link.field}`}><code>{link.child}.{link.field}</code> → <code>{link.parent}.{link.parentField}</code></div>)}
                {edge.conditionalTrace ? <div><code>{edge.conditionalTrace.child}.{edge.conditionalTrace.field}</code> → <code>{edge.conditionalTrace.parent}.{edge.conditionalTrace.parentField}</code>; {edge.conditionalTrace.condition}</div> : null}
              </td>
            </tr>)}
          </tbody></table>
        </div>
        <p>{model.boundary}</p>
        {!model.technical ? <p>Each box identifies a record, source label, or interpretive context. {model.nodes.some(node => node.id === "PS") ? "PayrollSummary is a constructed posting identifier rather than a physical table. " : ""}Check dates and grouping before comparing operational support with postings.</p> : null}
      </details>
      {!model.technical ? <p className={styles.links}><Link to="/docs/reference/schema">Focused ER maps and table grains</Link> · <Link to="/docs/reference/posting">Posting sources and account effects</Link></p> : null}
    </StaticDiagram>
  </section>;
}
