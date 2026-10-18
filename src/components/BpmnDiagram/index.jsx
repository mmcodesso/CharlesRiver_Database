import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import models from "@site/src/data/bpmnModels.json";
import StaticDiagram from "@site/src/components/StaticDiagram";
import styles from "./styles.module.css";

export function BpmnModelCatalog() {
  const assetRoot = useBaseUrl("/diagrams/bpmn/");
  return <div className={styles.inventory} tabIndex={0} role="region" aria-label="BPMN model inventory, scroll to view all columns"><table>
    <thead><tr><th>Model</th><th>Scope</th><th>Explore the evidence</th><th>Editable source</th></tr></thead>
    <tbody>{models.map((model) => <tr key={model.id}>
      <td><strong>{model.title}</strong><br /><small>{model.kind}</small></td>
      <td>{model.description}</td>
      <td><Link to={model.processPath}>Process guide</Link><br /><Link to={model.exercisePath}>{model.exerciseLabel ?? "Learning activity"}</Link><br /><Link to={model.casePath}>Related case</Link>{model.extensions?.map((extension) => <span key={extension.to}><br /><Link to={extension.to}>{extension.label}</Link></span>)}</td>
      <td><a href={`${assetRoot}${model.id}.drawio`} download aria-label={`Download editable ${model.title} Draw.io source`}>Editable Draw.io</a></td>
    </tr>)}</tbody>
  </table></div>;
}

export default function BpmnDiagram({ modelId }) {
  const model = models.find((entry) => entry.id === modelId);
  if (!model) throw new Error(`Unknown BPMN model: ${modelId}`);
  return <StaticDiagram model={model} assetRoot="/diagrams/bpmn/" kind="model">
    <details className={styles.description}>
      <summary>Text description and database evidence</summary>
      <ol>{model.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p><strong>Evidence tables:</strong> {model.tables.map((table, index) => <span key={table}>{index ? ", " : ""}<code>{table}</code></span>)}.</p>
      <p>Confirm keys and accounting sources in the <Link to="/docs/reference/schema">Schema Reference</Link> and <Link to="/docs/reference/posting">Posting Reference</Link>.</p>
      <p>{model.boundary}</p>
    </details>
    <p className={styles.note}>Editable visual model in Draw.io XML; this is not executable BPMN XML. <Link to="/docs/process-flows#a-short-bpmn-reading-guide">Notation and model library</Link>.</p>
  </StaticDiagram>;
}
