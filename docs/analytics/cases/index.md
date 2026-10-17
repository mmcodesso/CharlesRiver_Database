---
title: Cases
description: Find accounting cases by business process, accounting area, level, and tool, with prerequisites and assessed evidence-based deliverables.
sidebar_label: Cases
---

import CaseExplorer from "@site/src/components/CaseExplorer";

# Cases

Follow an order, explain a cost, assess a control, or connect several processes to a financial decision. These cases use the same fictional company and published evidence, so each investigation starts with the business process and ends with a supported management or audit conclusion.

For a first assignment, begin with the [SQL foundation exercise](../sql-guide.md#foundation-exercise-one-order-line-and-its-evidence) or [Excel foundation exercise](../excel-guide.md#foundation-exercise-a-catalog-profile). Then choose a case whose prerequisites match your course. The [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) supplies the conceptual background; these assignments supply a company, source evidence, and a question to investigate.

## Difficulty Labels

| Level | Starting scope | Progression |
|---|---|---|
| Foundation | One process, item population, or document trail | Begin with the first two steps; extend to settlement, close, or controls after the basic evidence trail is clear. |
| Intermediate | Several measures within one business question | Compare financial and operating evidence, align populations, and support a recommendation. |
| Advanced | Multiple periods, recognition paths, or control populations | Reconcile different grains and explain uncertainty before drawing a conclusion. |
| Capstone | A scoped cross-process audit review | Choose one or two test families, justify priorities, and defend the evidence trail. |

The short guide exercises are foundational practice. Intermediate cases develop applied analysis. Advanced and Capstone cases require integrated interpretation. A Foundation label describes the starting point; the optional extensions can require more accounting and database experience.

## Case Matrix

Browse all 17 cases below. Combine filters or search for a topic, prerequisite, or deliverable. Every case includes SQLite investigation and an optional Excel reconstruction; the Excel path covers the focused follow-through described on the case page.

<CaseExplorer />

## Learning Arcs

| Course or investigation | Suggested path |
|---|---|
| Accounting information systems | [O2C trace](o2c-trace-case.md) → [P2P accrual and settlement](p2p-accrual-settlement-case.md) → [manufacturing labor](manufacturing-labor-cost-case.md). Explain events, source keys, recognition, and the GL trail. |
| Financial accounting and analytics | [CAPEX lifecycle](capex-fixed-asset-lifecycle-case.md) → [working capital](working-capital-and-cash-conversion-case.md) → [statement bridge](financial-statement-bridge-case.md). Move from recognition and cash timing to statement interpretation. |
| Managerial accounting | [Product lifecycle](product-portfolio-and-lifecycle-case.md) → [portfolio profitability](product-portfolio-profitability-case.md) → [planning and replenishment](demand-planning-and-replenishment-case.md). Connect cost assumptions to operating decisions. |
| Auditing | Begin with a process-tracing case, then [master-data and workforce controls](master-data-and-workforce-audit-case.md), a specialized control case, and a scoped [audit review pack](audit-review-pack-case.md). |
| Commercial decisions | [Pricing and margin](pricing-and-margin-governance-case.md) → [pricing-control audit](pricing-governance-audit-case.md). Separate performance outcomes from authorization evidence. |
| People and operations | [Coverage and attendance](workforce-coverage-and-attendance-case.md) → [attendance-control audit](attendance-control-audit-case.md) or [workforce cost and organization](workforce-cost-and-org-control-case.md). |

These are teaching pathways for current resources. The complementary AIS textbook and future tool courses are planned resources.

## How Cases Fit the Learning Path

1. Understand the company and read the linked process page.
2. Read a relevant [report perspective](../reports/lens-packs.md) to frame the business question.
3. Define the release, period, population, and source grain before running SQL.
4. Follow the query sequence, retain source keys, and distinguish observations from explanations.
5. Submit the case-specific evidence schedule and decision memo. State assumptions, limitations, and the next check that could change the conclusion.

The cases present instructional management requests, not predetermined findings. A valid analysis may explain ordinary timing, identify an exception, or document that no rows met the selected criteria. Query flags require source review before they become findings.

## Next Steps

- Prepare your tool with the [SQL Guide](../sql-guide.md) or [Excel Guide](../excel-guide.md).
- Browse the [Reports Hub](../reports/index.md) for business summaries and the [Query Library](../analysis-tracks.md) for reusable SQL.
- For course sequencing and assessment choices, read the [Instructor Adoption Guide](../../teach-with-data/instructor-guide.md).
