# Order-to-Cash BPMN reference review

Completed before creating the rest of the library, 17 October 2026. Parent branch: `feature/charles-river-website-redesign`; data baseline unchanged at `7c21218`.

## Source and notation

Read all six process guides, schema/posting references and the [OMG BPMN 2.0.2 specification](https://www.omg.org/spec/BPMN/2.0.2/). Inspected the installed Draw.io 29.6.6 BPMN library to use its actual `mxgraph.bpmn.event`, `mxgraph.bpmn.task2`, and `mxgraph.bpmn.gateway2` styles and native swimlanes. The source is editable mxGraph XML with separately addressable nodes and connectors, not a flattened picture or an executable BPMN file.

Independent notation review accepted the trigger/end semantics, XOR alternatives, one-pool sequence topology, and three customer messages. Messages use open source circles and unfilled target arrows; no internal message flow or cross-pool sequence flow appears. A normal collapsed subprocess uses a solid rounded outline and boxed plus; Draw.io's `bpmnShapeType=subprocess` denotes an event subprocess and was corrected to the native normal-task style with `isLoopSub=1`.

## Accounting and scope

The pilot is one goods fulfillment pass. It preserves open demand, shipment versus invoice recognition, commission accrual, cash arrival versus invoice application, and residual balances. It does not invent credit approval, rejection queues, automatic collection, or an obligation to settle the entire order before its stated endpoint. Advance receipts may originate independently; the cash detail model will show the receipt/application scope separately. External customer behavior remains a black box. Lane allocations illustrate responsibility rather than prove segregation of duties.

## Rendering and accessibility

Draw.io Desktop exported the actual SVG with embedded uncompressed diagram XML. A PNG from the same application was visually inspected. Corrected long pool labels, narrow event/gateway labels, an exception-end label near the next lane, and the subprocess outline before accepting the convention. The published SVG receives an accessible title/description and SHA-256 source identity through the export workflow, without changing its diagram geometry.

Production Docusaurus pilot build passed. Browser review at 1440×1000 and 390×844 confirmed the image, source/SVG links, text-description disclosure, modal viewing, zoom status, native scrolling, Escape close and opener focus restoration. The viewer supports up to 800% fitted width for detailed reading on mobile. Essential SVG viewing and textual explanation do not require JavaScript or an installed editor.

## Accepted library conventions

- One understandable scope per sheet; exception/subprocess details get their own sources.
- Named external pools, internal organizational lanes, native BPMN tasks/events/gateways and correct flow markers.
- Solid ordinary subprocess outline with the native boxed plus; no misleading event subprocess.
- Explicit branch labels, meaningful open-item endpoints, and no optional bypass into a parallel join.
- White SVG canvas, navy text, teal linework, Arial, fixed node geometry, and label clearance within lanes. Color does not encode the only meaning.
- Every model has a description, ordered text equivalent, database table mapping, evidence boundary, process/activity/case links and paired `.drawio`/`.svg` filenames.
- Proposed controls remain explicitly identified as teaching proposals, distinct from recorded approvals/statuses or ledger events.
