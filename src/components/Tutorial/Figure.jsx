import StaticDiagram from "@site/src/components/StaticDiagram";
import figures from "@site/src/data/tutorialFigures.json";

export default function TutorialFigure({ figureId }) {
  const model = figures.find((item) => item.id === figureId);
  if (!model) throw new Error(`Unknown tutorial figure: ${figureId}`);
  return <section aria-label={model.question}>
    <p><strong>{model.question}</strong></p>
    <StaticDiagram model={model} assetRoot="/diagrams/tutorials/">
      <p><strong>Reading guide:</strong> {model.readingRule}</p>
      <details><summary>Read the figure in words</summary><ul>{model.steps.map((step) => <li key={step}>{step}</li>)}</ul><p>{model.readingRule}</p></details>
    </StaticDiagram>
  </section>;
}
