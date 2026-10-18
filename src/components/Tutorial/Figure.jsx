import StaticDiagram from "@site/src/components/StaticDiagram";
import figures from "@site/src/data/tutorialFigures.json";

export default function TutorialFigure({ figureId }) {
  const model = figures.find((item) => item.id === figureId);
  if (!model) throw new Error(`Unknown tutorial figure: ${figureId}`);
  return <section aria-label={model.question}>
    <p><strong>{model.question}</strong></p>
    <StaticDiagram model={model} assetRoot="/diagrams/tutorials/">
      <details><summary>Read the figure in words</summary><ol>{model.steps.map((step) => <li key={step}>{step}</li>)}</ol><p>Follow the selected records and measures through the investigation. The arrows show the analytical steps; check the document keys before deciding how many records can match.</p></details>
    </StaticDiagram>
  </section>;
}
