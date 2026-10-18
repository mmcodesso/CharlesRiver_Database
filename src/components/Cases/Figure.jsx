import StaticDiagram from "@site/src/components/StaticDiagram";
import figures from "@site/src/data/caseFigures.json";

export default function CaseFigure({ figureId }) {
  const model = figures.find((figure) => figure.id === figureId);
  if (!model) throw new Error('Unknown case figure: ' + figureId);
  return <section aria-label={model.question}>
    <p><strong>{model.question}</strong></p>
    <StaticDiagram model={model} assetRoot="/diagrams/cases/">
      <details><summary>Read the figure in words</summary>
        <ol>{model.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <p>{model.kind}. Arrows guide the investigation; they do not imply one-to-one database relationships.</p>
      </details>
    </StaticDiagram>
  </section>;
}
