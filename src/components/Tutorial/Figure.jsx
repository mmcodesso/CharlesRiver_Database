import StaticDiagram from "@site/src/components/StaticDiagram";
import figures from "@site/src/data/tutorialFigures.json";

export default function TutorialFigure({ figureId }) {
  const model = figures.find((item) => item.id === figureId);
  if (!model) throw new Error(`Unknown tutorial figure: ${figureId}`);
  return <section aria-label={model.question}>
    <p><strong>{model.question}</strong></p>
    <StaticDiagram model={model} assetRoot="/diagrams/tutorials/">
      <details><summary>Read the figure in words</summary><ol>{model.steps.map((step) => <li key={step}>{step}</li>)}</ol><p>Teaching diagram using selected records or measures from release v2027.1. Arrows guide this investigation; they do not assert that every relationship is one-to-one.</p></details>
    </StaticDiagram>
  </section>;
}
