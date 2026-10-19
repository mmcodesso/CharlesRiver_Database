import Link from "@docusaurus/Link";
import StaticDiagram from "@site/src/components/StaticDiagram";
import models from "@site/src/data/schemaDiagrams.json";
import styles from "./styles.module.css";

function RelationTable({ model }) {
  if (!model.relationships.length) return null;
  return <div className={styles.tableRegion} tabIndex={0} role="region" aria-label={`${model.title} relationships, scroll to view all columns`}>
    <table><thead><tr><th>Line</th><th>Foreign key or match</th><th>How to read it</th></tr></thead>
      <tbody>{model.relationships.map(relation => <tr key={relation.id}>
        <td>{relation.id}</td>
        <td><code>{relation.child}.{relation.childFields.join(", ")}</code><br />to <code>{relation.parent}.{relation.parentFields.join(", ")}</code></td>
        <td>{relation.kind === "reference" ? `${relation.optionalParent ? "Optional" : "Required for the documented path"} foreign key.` : relation.kind === "conditional" ? `Conditional trace: ${relation.condition}.` : "Analytical match or aggregation, rather than a stored single-record link."} {relation.note}</td>
      </tr>)}</tbody></table>
  </div>;
}

export function SchemaTableIndex() {
  const entries = models.flatMap(model => model.tables.filter(table => table.primary).map(table => ({ model, table })))
    .sort((a, b) => a.table.name.localeCompare(b.table.name));
  return <details className={styles.index}><summary>Find any of the 82 tables and its primary learning view</summary>
    <div className={styles.tableRegion} tabIndex={0} role="region" aria-label="Complete table index, scroll to view all columns">
      <table><thead><tr><th>Table</th><th>One row represents</th><th>Primary view</th></tr></thead>
        <tbody>{entries.map(({ model, table }) => <tr key={table.name}>
          <td><code>{table.name}</code></td><td>{table.grain}</td><td><a href={`#er-${model.id}`}>{model.title}</a></td>
        </tr>)}</tbody></table>
    </div>
  </details>;
}

export default function SchemaDiagram({ modelId }) {
  const model = models.find(entry => entry.id === modelId);
  if (!model) throw new Error(`Unknown schema diagram: ${modelId}`);
  return <section id={`er-${model.id}`} className={styles.section} aria-label={model.title}>
    <h3>{model.title}</h3>
    <p><strong>{model.question}</strong></p>
    <details open={model.id === "company-data-overview"}>
      <summary>View {model.id === "company-data-overview" ? "the company data overview" : "the focused map"} and its evidence</summary>
    <StaticDiagram model={model} assetRoot="/diagrams/er/" kind="ER diagram">
      <p className={styles.legend}>{model.tables.length ? "(PK) marks a primary key. (FK) marks a foreign key. Crow’s feet show multiplicity; a circle permits zero. These lines describe joins, not a time sequence." : "Choose a data area before reading individual tables. This overview groups evidence; it does not impose a company-wide workflow."}</p>
      <details><summary>Read the tables, keys, and relationships</summary>
        {model.tables.length ? <div className={styles.tableRegion} tabIndex={0} role="region" aria-label={`${model.title} tables, scroll to view all columns`}>
          <table><thead><tr><th>Table and role</th><th>One row represents</th><th>Selected fields</th></tr></thead>
            <tbody>{model.tables.map(table => <tr key={table.name}>
              <td><code>{table.name}</code><br />{table.primary ? "Primary home" : "Shared reference"}</td><td>{table.grain}</td>
              <td>{table.fields.map((field, index) => <span key={field.name}>{index ? ", " : ""}<code>{field.label}</code></span>)}</td>
            </tr>)}</tbody></table>
        </div> : <ul>{models.filter(entry => entry.tables.length).map(entry => <li key={entry.id}><a href={`#er-${entry.id}`}>{entry.title}</a> — {entry.primary.length} primary tables</li>)}</ul>}
        <RelationTable model={model} />
        <p>{model.boundary}</p>
      </details>
      <p className={styles.links}><Link to={model.processPath}>Process context</Link> · <Link to={model.exercisePath}>Practice with the records</Link> · <Link to={model.casePath}>Related case</Link> · <Link to="/docs/reference/posting">Posting reference</Link></p>
    </StaticDiagram>
    </details>
  </section>;
}
