---
title: CAPEX and Fixed Asset Lifecycle Case
description: Inquiry-led walkthrough for tracing CAPEX additions, financing, depreciation routing, disposals, and cash-flow impact across the fixed-asset lifecycle.
sidebar_label: CAPEX Lifecycle Case
---

import { QueryReference } from "@site/src/components/QueryReference";
import { CaseOverview } from "@site/src/components/CaseExplorer";

# CAPEX and Fixed Asset Lifecycle Case

<CaseOverview slug="capex-fixed-asset-lifecycle-case" />

## Business Scenario

**Illustrative teaching scenario.** Select actual records from your assigned release to investigate this request; the scenario does not identify a particular published transaction or prescribe a finding.

Charles River now needs a teachable fixed-asset story that matches how a real company behaves. The company adds plant equipment, warehouse equipment, and office or showroom assets across multiple years. Some purchases are paid in cash, some are reclassed from AP into notes payable, some assets are improved later, and some are eventually retired or replaced.

The accounting behavior is not uniform. Manufacturing equipment depreciation belongs in manufacturing cost through `1090` Manufacturing Cost Clearing. Warehouse and office depreciation stay in operating expense through `6130`. Disposal removes gross cost and accumulated depreciation, and note-financed assets create a second lifecycle through scheduled principal and interest payments.

Your job is to explain one CAPEX story from acquisition through financing, depreciation, disposal, and cash-flow impact without losing the distinction between product-cost behavior and operating-expense behavior.

## The Problem to Solve

You need to explain one CAPEX story from source documents through the asset register and into the financial statements. Show how acquisitions, financing, depreciation, and disposals affect the ledger, cash flow, and manufacturing cost interpretation. You also need to decide where the lifecycle summary is enough and where the analysis must move into broader statement interpretation.

## Learning Objectives

- Trace additions, improvements, depreciation, financing, and disposal through the asset lifecycle.
- Separate asset recognition from principal, interest, depreciation, and cash timing.
- Explain how manufacturing depreciation affects cost interpretation.

## Key Data Sources

- Source documents: Capital purchase records, fixed-asset record and events, debt agreement and schedule, payments, journals, and GL rows.
- Evidence grain: Reconcile asset-event detail to the asset rollforward; evaluate debt-schedule and period-level cash-flow evidence separately.
- Main tables: `PurchaseRequisition`, `PurchaseOrder`, `PurchaseInvoice`, `DisbursementPayment`, `FixedAsset`, `FixedAssetEvent`, `DebtAgreement`, `DebtScheduleLine`, `Warehouse`, `WorkCenter`, `CostCenter`, `JournalEntry`, `GLEntry`, `Account`
- Related guides: [Financial Queries](../financial.md), [Statements and Cash](../index.md#statements-and-cash)
- Related process pages: [Procure-to-Pay Process](../../processes/p2p.md), [Manufacturing Process](../../processes/manufacturing.md), [Manual Journals and Close Cycle](../../processes/manual-journals-and-close.md)
- Supporting references: [Schema Reference](../../reference/schema.md), [GLEntry Posting Reference](../../reference/posting.md), [Dataset Guide](../../start-here/dataset-overview.md)
- This case follows the fixed-asset lifecycle from the posted subledger and related financing records. It does not extend into budget or pro-forma cash-flow planning.

## Recommended Query Sequence

### Step 1. Define the fixed-asset rollforward by behavior group

Start with the asset rollforward. Before you interpret debt or depreciation, you need to see which behavior groups are actually carrying gross cost, accumulated depreciation, and net book value over time.

**What we are trying to achieve**

Establish how gross cost, accumulated depreciation, and net book value move by month across manufacturing, warehouse, and office or showroom assets.

**Why this step changes the diagnosis**

This step gives you the lifecycle frame. Without it, later financing and depreciation analysis will not be anchored to the actual asset population carrying the balances.

**Suggested query**

<QueryReference
  queryKey="financial/54_fixed_asset_rollforward_by_behavior_group.sql"
  helperText="Use this first to compare monthly fixed-asset rollforward behavior across manufacturing, warehouse, and office or showroom assets."
/>

**What this query does**

It rolls forward fixed-asset gross cost, accumulated depreciation, and ending net book value by fiscal month and behavior group.

**How it works**

The query starts from `FixedAsset`, overlays `FixedAssetEvent` and close-ready reporting periods, then calculates additions, disposals, monthly depreciation, and ending balances by behavior group.

**What to look for in the result**

- which behavior groups carry the largest gross cost and net book value
- periods with heavier additions or disposals
- whether manufacturing assets depreciate on a visibly different pattern from warehouse or office assets
- where the lifecycle story looks stable versus where it changes sharply

### Step 2. Trace acquisitions, improvements, financing choices, and disposals

Once the rollforward is clear, move to the event layer. This is where CAPEX stops being a balance-sheet summary and becomes a document-supported business story.

**What we are trying to achieve**

Show how acquisitions, improvements, financing choices, and disposals connect back to requisitions, POs, invoices, disbursements, debt agreements, and linked journals.

**Why this step changes the diagnosis**

Students often treat all CAPEX as one undifferentiated addition stream. This step separates cash purchases, note-financed additions, and disposal activity so the later cash and statement interpretation is grounded in real events.

**Suggested query**

<QueryReference
  queryKey="financial/55_capex_acquisitions_financing_and_disposals.sql"
  helperText="Use this to trace each CAPEX event back to its purchase, payment, financing, disposal, and journal support."
/>

**What this query does**

It returns one row per fixed-asset event and shows the event type, financing choice, cash paid, note principal, disposal proceeds, and linked source documents.

**How it works**

The query starts from `FixedAssetEvent`, joins back to `FixedAsset`, then overlays purchasing documents, disbursement cash, debt agreements, and linked journal entries so each event stays visible as one lifecycle step.

**What to look for in the result**

- which additions were paid in cash and which were financed through notes payable
- improvements that extend the lifecycle after the original acquisition
- disposal events with cash proceeds or linked journals
- where one asset code has multiple lifecycle events that need to be read together

### Step 3. Isolate the note-financed lifecycle and debt cash timing

Now narrow to the financing path. Once an asset is note-financed, the lifecycle no longer ends at acquisition. It continues through scheduled principal and interest cash behavior.

**What we are trying to achieve**

Separate note principal reduction from interest expense and show how the debt schedule changes financing cash versus operating cash.

**Why this step changes the diagnosis**

Students often summarize note-financed CAPEX as if the whole cash effect happened at acquisition. This step shows that the financing lifecycle continues period by period after the asset is placed in service.

**Suggested query**

<QueryReference
  queryKey="financial/56_debt_amortization_and_cash_impact.sql"
  helperText="Use this to trace note-financed CAPEX through scheduled principal, interest, and total debt cash payments."
/>

**What this query does**

It lays out the debt amortization schedule by payment line, including beginning principal, principal paid, interest paid, total payment, and cumulative principal and interest.

**How it works**

The query joins `DebtScheduleLine` to `DebtAgreement` and the linked `FixedAsset`, then computes cumulative principal and cumulative interest by agreement number so the financing path can be followed over time.

**What to look for in the result**

- which assets carry note-financed obligations instead of upfront cash payment
- how much of each payment is principal versus interest
- when principal cash outflow remains material after acquisition is complete
- why financing cash and operating cash must stay separated in the lifecycle story

### Step 4. Connect manufacturing-equipment depreciation back into product-cost interpretation

At this point you know the acquisition and financing path. Now connect the manufacturing-specific depreciation behavior back into product cost so students can see why fixed assets do not all affect the income statement in the same way.

**What we are trying to achieve**

Show how plant-equipment depreciation feeds manufacturing cost interpretation differently from warehouse or office depreciation.

**Why this step changes the diagnosis**

A fixed-asset rollforward alone does not explain why some depreciation belongs in product-cost analysis. This step is where behavior-group differences become financially meaningful.

**Suggested query**

<QueryReference
  queryKey="financial/17_manufacturing_cost_component_bridge.sql"
  helperText="Use this to connect manufacturing-equipment depreciation back into manufacturing clearing and conversion-cost interpretation."
/>

**What this query does**

It summarizes monthly manufacturing cost movement, including the cost components and ledger movement that place plant-equipment depreciation into manufacturing interpretation.

**How it works**

The query aggregates manufacturing activity and related ledger postings by period so material, completion, variance, and manufacturing-cost movement can be read together.

**What to look for in the result**

- whether manufacturing-equipment depreciation is visibly entering the manufacturing cost story
- how product-cost interpretation differs from warehouse or office depreciation
- which periods show stronger manufacturing-cost pressure tied to asset behavior
- when fixed-asset analysis needs to cross into manufacturing interpretation rather than stay on the balance sheet

### Step 5. Finish with the real statement and cash-flow impact

Finish the case by stepping back into the statements. Once the lifecycle is clear, show how CAPEX activity moves into operating, investing, and financing cash and where the broader financial interpretation begins.

**What we are trying to achieve**

Connect the CAPEX lifecycle back into the monthly indirect cash flow and decide when the analyst should stop at lifecycle summary versus open broader statement analysis.

**Why this step changes the diagnosis**

This step turns the lifecycle into a financial conclusion. A good CAPEX answer does not stop at additions and depreciation. It explains how those events change cash-flow interpretation and where the broader statement view should take over.

**Suggested query**

<QueryReference
  queryKey="financial/33_cash_flow_statement_indirect_monthly.sql"
  helperText="Use this to show how CAPEX activity affects operating, investing, and financing cash after the asset lifecycle is understood."
/>

**What this query does**

It produces the monthly indirect-method cash flow statement from posted ledger activity, including the operating, investing, and financing sections.

**How it works**

The query starts from `GLEntry`, `Account`, and `JournalEntry`, builds the closed reporting periods, and classifies cash-flow activity into the standard indirect cash-flow sections.

**What to look for in the result**

- where CAPEX additions appear in investing cash
- where note principal repayment appears in financing cash
- where interest or non-manufacturing expense effects remain in operating interpretation
- when the lifecycle story is complete enough to move into broader financial statement analysis

## Required Student Output

Submit a reproducible analysis file and a short decision memo. Include your release or file version, reporting period, filters, and query filenames. The assessed submission contains:

- **Evidence summary:** Create an asset-lifecycle schedule for a stated asset or behavior group, with beginning position, relevant events, ending position, and supporting source keys.
- **Accounting or business interpretation:** Explain acquisition, depreciation, disposal, and any financing, distinguishing debt principal and interest from asset cost and depreciation.
- **Database explanation:** Show how asset events, debt-schedule lines, and GL periods are linked or compared without repeating asset totals across debt installments.
- **Management or audit conclusion:** State a supported capital or financing follow-up and explain its operating, investing, or financing cash-flow implications.

Assessment focuses on a defensible evidence trail, accurate accounting, reproducible comparisons, and a recommendation supported by the evidence. A result with no flagged rows is valid when its scope and criteria are documented.

## Optional Excel Follow-Through

1. Build a monthly rollforward tab for gross cost, accumulated depreciation, and net book value by behavior group.
2. Add an event-trace tab that lays out acquisitions, improvements, note financing, and disposals by asset code.
3. Add a debt-schedule tab for principal, interest, and cumulative cash by agreement number.
4. Add one manufacturing-depreciation tab that compares plant-equipment interpretation with warehouse or office behavior.
5. Finish with a cash-flow tab that ties the CAPEX lifecycle back into investing, financing, and operating cash interpretation.

## Wrap-Up Questions

- Accounting/process: Which asset events change capitalization, depreciation, disposal, financing, or cash-flow interpretation?
- Database/source evidence: Which asset code, event row, financing key, or GL trace makes the lifecycle conclusion defensible?
- Analytics judgment: Which behavior group or financing path changes the CAPEX story most materially?
- Escalation/next step: When is the asset-level lifecycle summary enough, and when should the analyst open broader statement or cash-flow pages?

## Limitations and Judgment

Recognition of a capital asset does not mean the same amount was paid in cash that period. Follow documented event and financing treatment rather than assuming a cash purchase.

## Next Steps

- Use [Procure-to-Pay Process](../../processes/p2p.md) to see how CAPEX items still begin in the normal requisition, PO, invoice, and payment flow.
- Use [Manufacturing Process](../../processes/manufacturing.md) to connect plant-equipment depreciation back into manufacturing clearing and standard-cost interpretation.
- Use [Manual Journals and Close Cycle](../../processes/manual-journals-and-close.md) for the debt reclass, depreciation, note payment, and disposal journals that complete the lifecycle.
- Use [GLEntry Posting Reference](../../reference/posting.md) and [Schema Reference](../../reference/schema.md) when you need the exact posting rules or table bridges.
- Use [Financial Queries](../financial.md) when you want the wider statement and cash-flow analysis around the same CAPEX events.
