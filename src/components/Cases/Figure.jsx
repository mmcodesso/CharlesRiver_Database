import StaticDiagram from "@site/src/components/StaticDiagram";
import figures from "@site/src/data/caseFigures.json";

export default function CaseFigure({ figureId }) {
  const model = figures.find((figure) => figure.id === figureId);
  if (!model) throw new Error('Unknown case figure: ' + figureId);
  return <section aria-label={model.question}>
    <p><strong>{model.question}</strong></p>
    <p><strong>Reading guide:</strong> {model.readingRule}</p>
    <StaticDiagram model={model} assetRoot="/diagrams/cases/">
      <details><summary>Read the figure in words</summary>
        <ul>{model.steps.map((step) => <li key={step}>{step}</li>)}</ul>
        <p>{model.kind}. {model.readingRule}</p>
      </details>
    </StaticDiagram>
  </section>;
}
