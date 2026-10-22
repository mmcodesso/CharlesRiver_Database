---
title: Procure-to-Pay — From a Supply Need to Supplier Payment
description: Follow Charles River's purchasing request, supplier order, goods receipt, invoice, and payment, and learn why inventory and payable timing differ.
sidebar_label: Procure-to-Pay
pagination_prev: processes/design-services
pagination_next: processes/manufacturing
toc_max_heading_level: 2
---

import BpmnDiagram from "@site/src/components/BpmnDiagram";
import EvidenceDiagram from "@site/src/components/EvidenceDiagram";

# Procure-to-Pay Process

<span id="business-storyline"></span>

<span id="what-students-should-learn"></span>

## Operations Needs Goods and Materials

The operations planner in our company story considers how to support customer demand. Available inventory can meet some needs, while others require merchandise or components from suppliers. The question becomes **what should the company obtain, what actually arrived, and what does it owe?**

Follow an inventory purchase from the planner's request to supplier payment. Purchasing supports customer demand and ongoing stock needs across the company. When investigating a particular purchase, use its document links to establish which request, receipt, and invoice belong together.

Procure-to-pay, or P2P, connects an internal request with a supplier commitment, receipt, invoice, and payment. Its documents let receiving, accounts payable, and treasury answer different questions about the same purchase.

## Turn a Need into a Supplier Commitment

A requester or planner records an internal need in a **purchase requisition**. The request identifies what is needed before purchasing turns it into a supplier order. Planning information can explain replenishment demand, but the request and the supplier commitment remain separate records.

Purchasing prepares the purchase order and its lines. One order can bring together more than one requisition. The line-level relationships preserve the connection between what was requested and what was ordered.

The purchase order communicates the supplier commitment. It does not establish that goods arrived or that payment occurred. In the dataset, the requisition and purchase order do not themselves create the inventory and payable postings that follow.

Approval records help identify recorded authorization. Understanding who approved a selected transaction requires inspecting the transaction fields because the model's department lanes alone do not establish independent approval.

## Record What Receiving Actually Obtains

Receiving staff record the goods when they arrive. A receipt provides evidence of actual quantities and timing. A supplier order can be received in parts, so a single receipt may not complete the ordered quantity.

For the ordinary inventory path, the dataset recognizes inventory at receipt. It also records a liability called **goods received not invoiced**, or **GRNI**. The company has received goods even though the supplier bill may not yet have been recorded.

This is a useful accounting distinction. The purchase order records a commitment, while the receipt changes inventory and the associated liability. At a reporting date, goods can be in inventory with an amount still in GRNI.

Receiving also supplies the evidence needed for the next handoff. Accounts payable must understand what arrived before explaining how the supplier's invoice relates to it.

<span id="decisions-and-evidence"></span>

## Compare the Supplier Bill with the Purchase

Accounts payable, usually shortened to **AP**, records the supplier invoice. In the receipt-matched inventory path, the invoice line identifies the receipt line being billed.

A **three-way comparison** brings together the purchase order, goods receipt, and supplier invoice. The order shows the commitment, the receipt shows what arrived, and the invoice shows what the supplier charged. Compare the relevant lines and quantities rather than relying only on header totals.

For receipt-matched inventory invoicing, the accounting clears GRNI, recognizes applicable purchase variance, and creates accounts payable. The invoice establishes the supplier balance that treasury will later settle.

The links make a comparison possible. They do not prove that the system enforced a match tolerance or blocked every unmatched payment. A control investigation must distinguish available evidence from a review procedure it proposes.

## Pay the Supplier and Explain the Date

Treasury settles the payable through a disbursement. The ordinary payment posting reduces accounts payable and cash.

The receipt, invoice, and payment need not fall in the same reporting period. A payment found later in the file can explain eventual settlement while the payable remains open at an earlier cutoff. This matters when interpreting cash needs and supplier balances.

For a selected invoice, state the reporting date before concluding that it is unpaid, overdue, or settled. Then compare the invoice, due date, and payment evidence. A balance at one date is not an explanation of the entire purchasing relationship.

<span id="participants-and-responsibilities"></span>

<span id="bpmn-business-process"></span>

<span id="interpret-the-activities-and-decisions"></span>

## Follow the Purchasing Responsibilities

**What does each department establish before the next acts?** Read the BPMN from the internal need through Purchasing, Receiving, Accounts Payable, and Treasury.

<BpmnDiagram modelId="procure-to-pay" />

The overview follows a representative receipt-before-invoice path. Actual receipt, billing, and approval dates can differ. Follow the specific records when establishing the sequence for an investigation.

Notice that the supplier is external to the company. The requisition is an internal request, while the purchase order communicates with that supplier. Receiving's record of arrival provides different evidence from either document.

<span id="normal-process-overview"></span>

<span id="how-to-read-this-process-in-the-data"></span>

## Connect the Documents and the Accounting

This map answers **how the ordinary inventory purchase can be followed from request to payment**.

<EvidenceDiagram modelId="goods-purchase-path" />

Read each record as the document stage just described. The detailed reference retains the exact keys, including how lines connect when orders batch requests or receipts arrive in parts.

| Event | Main accounting effect in the ordinary inventory path |
|---|---|
| Requisition and purchase order | No direct ledger posting |
| Goods receipt | Inventory increases and GRNI is recognized |
| Supplier invoice | GRNI is cleared, applicable variance is recorded, and AP is created |
| Supplier payment | AP and cash decrease |

Some purchases take other paths. An accrued service can be invoiced without a physical goods receipt, and a capital purchase has asset and potentially financing consequences. Keep those branches separate from this first inventory trace and consult them in the optional reference when needed.

## Explain a Receipt Without an Invoice

Suppose the controller reviews goods received near period end. Receiving has recorded the delivery, but the supplier invoice is posted later. The useful question is whether the receipt and its GRNI balance are supported at the selected date.

Start with what arrived and when. Then inspect the related invoice evidence without importing a later event into the earlier period. Establish the age and circumstances of an uninvoiced receipt before deciding whether it reflects more than a timing difference.

The same reasoning applies to a partially received order. The supplier commitment and the actual receipt tell different parts of the story. The remaining quantity needs its own explanation.

## Bridge an Event to an Entry

Reuse [Lesson 8’s receipt-matched purchase](../learn-and-practice/receipt-to-payable.md) and keep the separate [accrued-service trace in Lesson 11](../learn-and-practice/follow-an-estimate-into-settlement.md) available for purchases without goods receipts.

| Event and date | Supporting evidence | Why the accounts change | Cutoff question |
|---|---|---|---|
| Request and order, 2026-09-10 | Requisition 21330; PO line 21074 | No posting: a commitment does not establish goods received | What is ordered but has not arrived? |
| Receipt, 2026-09-27 | GoodsReceipt 23913; receipt line 25479 | Debit materials inventory / credit GRNI, 8.83 each | At September 30, is there a posted supplier invoice? |
| Supplier document November 29; GL posting November 30 | PurchaseInvoice 36461; invoice line 36861 | Debit GRNI 8.83 and purchase price variance 0.13 / credit AP 8.96 | Which date governs the source analysis, and which governs the ledger balance? |
| Payment, 2027-01-08 | DisbursementPayment 39645 | Debit AP / credit cash, 8.96 each | Was that payment recorded by December 31? |

The invoice's 0.13 tax contributes to the 8.96 bill, with the released **ledger** recording that difference in purchase price variance. The 2-row receipt, 3-row invoice, and 2-row payment vouchers each balance. Do not describe the invoice date as the ledger posting date.

**Predict before revealing:** Which liability belongs at September 30 and December 31, 2026? Does a payment visible in the file settle the earlier cutoff?

<details>
<summary>Reveal the two reporting-date positions</summary>

For this selected line, September 30 has 8.83 GRNI. By December 31 the November posting has replaced it with 8.96 AP. January’s payment is subsequent settlement and is excluded from December’s balance. A receipt-matched inventory trace does not establish the accounting for an accrued service or financed asset.

</details>

## Check Your Understanding

<details>
<summary>Why can the company recognize a liability before the supplier invoice?</summary>

In the ordinary inventory path, receiving the goods increases inventory and creates GRNI. The later supplier invoice clears that receipt-related liability into accounts payable, with applicable variance.

</details>

<details>
<summary>A supplier is paid after the reporting date. Was the earlier payable already settled?</summary>

No. Establish the balance using events up to the reporting date. The later disbursement can explain subsequent settlement without changing the earlier open balance.

</details>

## Next Steps

**Continue the company story.** Purchased components connect the supply story to production. Continue to [Manufacturing](manufacturing.md) to see how materials and labor support selected finished goods.

**Investigate this process.** Finish [Lesson 1](../learn-and-practice/meet-the-records.md), [Lesson 2](../learn-and-practice/read-an-order.md), and [Lesson 3](../learn-and-practice/connect-the-records.md), plus [Excel setup](../analytics/excel-guide.md) or [SQL setup](../analytics/sql-guide.md). Then follow [Lesson 8: Follow a Purchase](../learn-and-practice/receipt-to-payable.md). Use [Lesson 11: Follow an Estimate into Settlement](../learn-and-practice/follow-an-estimate-into-settlement.md) for the accrued-service branch. Check the selected lesson’s further prerequisites before beginning.

**Find analytical evidence.** Browse [Purchasing and Inventory queries](../analytics/analysis-tracks.md#purchasing-and-inventory) and [related reports](../analytics/index.md#purchasing-and-inventory). Use the [Schema Reference](../reference/schema.md) for join keys and the [Posting Reference](../reference/posting.md) for accounting effects.

## Optional Reference

Return to these sections when you have a specific question or an assignment that uses the data. The chapter above can be read without opening a file.

<details>
<summary>Look up documents, accounting entries, and traceability fields</summary>

### Core Tables and What They Represent

| Process stage | Main tables | Grain or event represented | Why students use them |
|---|---|---|---|
| Planning support | `DemandForecast`, `InventoryPolicy`, `SupplyPlanRecommendation` | Weekly planning signal behind normal purchased replenishment | Explain why purchased demand existed before requisitions were created |
| Internal demand | `PurchaseRequisition` | One internal request for an item, quantity, and cost center | Trace who requested the item and why |
| Supplier commitment | `PurchaseOrder`, `PurchaseOrderLine` | Supplier order header and ordered line | Review ordering, batching, and supplier commitment |
| Physical receipt | `GoodsReceipt`, `GoodsReceiptLine` | What physically arrived and when it arrived | Measure receipt timing, partial receipts, and inventory posting support |
| Supplier billing | `PurchaseInvoice`, `PurchaseInvoiceLine` | What the supplier billed and whether the line matched a receipt or accrual | Review three-way match, AP creation, and accrued-service settlement |
| Payment | `DisbursementPayment` | AP settlement event | Analyze payment timing and open payable behavior |

### When Accounting Happens

| Event | Business meaning | Accounting effect |
|---|---|---|
| Goods receipt | Goods physically arrive and inventory is recognized before the supplier bill is posted | Debit inventory and credit `2020` GRNI |
| Purchase invoice | AP records the supplier bill | For receipt-matched inventory lines: clear GRNI, record any purchase variance, and credit AP. For accrued-service lines: clear `2040` up to the estimate, book any excess to expense, and let any shortfall be reversed later through a linked accrual adjustment |
| Disbursement payment | Treasury or AP settles the supplier liability | Debit AP and credit cash |

### Key Traceability and Data Notes

- `PurchaseRequisition.SupplyPlanRecommendationID` is the authoritative planning-support link for normal replenishment demand.
- `PurchaseOrderLine.RequisitionID` is the authoritative requisition link when one purchase order batches several requisitions.
- `GoodsReceiptLine.POLineID` is the operational bridge from ordered line to received line.
- `PurchaseInvoiceLine.GoodsReceiptLineID` is the authoritative receipt-match link for inventory and material invoicing.
- `PurchaseInvoiceLine.AccrualJournalEntryID` is the authoritative link for direct accrued-service settlement.
- `FixedAssetEvent.PurchaseInvoiceID`, `PurchaseInvoiceLineID`, and `DisbursementID` extend that same trace when the purchased item is capitalized instead of expensed or stocked.
- P2P spans periods in the published dataset. Receipt, invoicing, and payment do not need to occur in the same month.

</details>

<details>
<summary>Explore detailed process and analysis paths</summary>

### Analytical Subsections

### Planning Support and Requisition Creation

What supported the decision to replenish? Follow weekly forecast, policy, and projected availability into `SupplyPlanRecommendation`, then into the requisition. This establishes the planning context before the supplier commitment.

<EvidenceDiagram modelId="purchase-planning" />

**Tables involved**

| Table | Role in the flow |
|---|---|
| `DemandForecast` | Shows the expected demand pattern behind planned replenishment |
| `InventoryPolicy` | Shows safety stock, reorder logic, and lead-time assumptions |
| `SupplyPlanRecommendation` | Shows the planned purchase signal by week, item, and warehouse |
| `PurchaseRequisition` | Shows the internal demand that purchasing converts into supplier orders |

**Starter analytical question:** Which purchase requisitions were clearly supported by weekly planning versus created as residual execution demand?

**Analytical plan**

- Objective: Trace purchased demand from planning support into requisition creation.
- Evidence path: SupplyPlanRecommendation -> PurchaseRequisition, with DemandForecast and InventoryPolicy for planning context.
- Comparison: Group by item group, warehouse, planner, or driver type.

### Purchase Order to Receipt Traceability

What was ordered, and how much arrived? Follow the requisition into the supplier-order line and its receipt lines. Retain the dates and quantities to explain partial receipts and receiving delays.

<EvidenceDiagram modelId="requisition-receipt" />

**Tables involved**

| Table | Role in the flow |
|---|---|
| `PurchaseRequisition` | Shows the original internal demand |
| `PurchaseOrder`, `PurchaseOrderLine` | Show the supplier commitment and ordered line detail |
| `GoodsReceipt`, `GoodsReceiptLine` | Show what physically arrived and when it arrived |

**Key joins**

- `PurchaseOrderLine.RequisitionID -> PurchaseRequisition.RequisitionID`
- `GoodsReceiptLine.POLineID -> PurchaseOrderLine.POLineID`
- `GoodsReceiptLine.GoodsReceiptID -> GoodsReceipt.GoodsReceiptID`

**Analytical plan**

- Objective: Trace supplier orders into one or more physical receipts.
- Evidence path: PurchaseRequisition -> PurchaseOrderLine -> GoodsReceiptLine.
- Comparison: Compare requisition date, order date, expected delivery date, and receipt date by supplier or item group.

### Receipt to Supplier Invoice Matching

Which receipt supports the supplier's billed line? Follow `GoodsReceiptLine` into `PurchaseInvoiceLine` for the ordinary inventory and materials path, then inspect the resulting AP and GRNI postings.

<EvidenceDiagram modelId="receipt-invoice-posting" />

**Tables involved**

| Table | Role in the flow |
|---|---|
| `GoodsReceiptLine` | Provides the receipt-match basis for inventory invoicing |
| `PurchaseInvoice`, `PurchaseInvoiceLine` | Show the supplier bill and matched billed line |
| `GLEntry` | Shows the posted AP and GRNI-clearing effect |

**Starter analytical question:** Which supplier invoice lines matched receipts cleanly, and which receipt lines remained uninvoiced at period end?

**Analytical plan**

- Objective: Trace receipt-based invoicing through the three-way-match path.
- Evidence path: GoodsReceiptLine -> PurchaseInvoiceLine -> PurchaseInvoice.
- Compare `ReceiptDate` with `InvoiceDate` for document lag. Use `ApprovedDate` and `GLEntry.PostingDate` for liability recognition at month end. Use `DueDate` for overdue status.

### Supplier Payment and Open AP

What remained payable at the reporting date? Follow the supplier invoice into its disbursement, comparing invoice, due, and payment dates. A later payment can explain eventual settlement while AP was still open earlier.

<EvidenceDiagram modelId="supplier-settlement-posting" />

**Tables involved**

| Table | Role in the flow |
|---|---|
| `PurchaseInvoice` | Creates the payable and anchors due-date analysis |
| `DisbursementPayment` | Shows how and when the invoice was settled |
| `GLEntry` | Shows the posted AP and cash effect |

**Starter analytical question:** Which supplier invoices remained unpaid after due date, and how does payment lag vary by supplier or item group?

**Analytical plan**

- Objective: Separate supplier invoicing from supplier payment.
- Evidence path: PurchaseInvoice -> DisbursementPayment, with GLEntry for posted effect.
- Compare `InvoiceDate` with `PaymentDate` for payment lag and `DueDate` with the reporting date for overdue status. Establish recognized AP using `ApprovedDate` and `GLEntry.PostingDate`, then deduct payments dated within the cutoff.

</details>

<details>
<summary>Follow specialized process branches</summary>

<BpmnDiagram modelId="accrual-settlement" />

An accrued service uses the finance estimate and `PurchaseInvoiceLine.AccrualJournalEntryID`, rather than a goods receipt, as its settlement bridge. Any residual adjustment and later cash payment remain separate events. The [manual journals guide](manual-journals-and-close.md#accrual-estimate-to-ap-settlement) explains that exception.

</details>

<details>
<summary>Evaluate controls and try the optional AIS activity</summary>

### Risks, Controls, and Evidence

| Risk and control objective | Evidence available | Teaching boundary |
|---|---|---|
| Unauthorized commitment: establish purchase approval | Requester and approver fields on `PurchaseRequisition`; creator and approver fields on `PurchaseOrder` | Compare identities and amounts with documented authority; an approver field alone does not prove independent authorization |
| Incorrect liability: compare ordered, received, and invoiced quantities at line grain | `PurchaseOrderLine`, `GoodsReceiptLine.POLineID`, `PurchaseInvoiceLine.GoodsReceiptLineID` | The links support a three-way comparison; an automated match tolerance, payment block, or exception queue is **not established** by them |
| Duplicate or unsupported payment: pay an approved, supported liability | `PurchaseInvoice` approval fields and `DisbursementPayment` | An independent duplicate-payment review is a **proposed teaching control**; investigate differences before concluding error |

### Optional AIS Activity: Design a Purchasing Review

**Context and objective:** a reviewer wants to distinguish supplier commitment, receipt, liability recognition, and payment. Explain one actual receipt-matched purchase, then propose a control for one identified risk.

**Prerequisites, tools, and sources:** complete the receipt-to-payable exercise linked above and review AP and GRNI concepts. Use a SQL tool with the published SQLite file, or Excel filters and lookups, plus a copy of the editable Draw.io model. Sources are `PurchaseRequisition`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `PurchaseInvoice`, `PurchaseInvoiceLine`, `DisbursementPayment`, and `GLEntry`.

1. State the release, reporting date, and selected line keys. Trace the receipt-matched path and identify the represented responsibility at each activity.
2. Compare quantities, approval support, and event dates. Explain any unmatched quantity or open balance as of the date before labeling it an exception.
3. Annotate a **proposed teaching control**, such as independent match review. Specify its risk, objective, owner, evidence, test, and escalation question without depicting the database as enforcing the proposal.

**Assessed deliverable:** submit an annotated BPMN copy, a line-level evidence schedule, and one risk/control-matrix row using the [workshop format](../learn-and-practice/bpmn-controls-workshop.md). Explain how the proposal could be assessed and what the stored records cannot prove. A receipt-matched sample does not establish controls for direct accrued services, CAPEX financing, or the full payable population. Continue to the existing P2P case and reports below for the wider analysis.

</details>

<details>
<summary>Choose a further investigation</summary>

### Questions for Further Investigation {#common-student-questions}

- Which requisitions were converted from planning-supported demand?
- Which requisitions were grouped into the same purchase order?
- Which PO lines were only partially received or invoiced?
- Which supplier invoice lines matched receipt lines cleanly?
- Which invoices remained unpaid after due date?
- Which AP lines cleared a prior accrual instead of matching a receipt?
- Which supplier invoices created capital assets, and which of those were later paid in cash versus reclassed into notes payable?
- How do receiving, invoicing, and payment timing differ by supplier, item group, or cost center?

- Read [Purchasing and Inventory](../analytics/index.md#purchasing-and-inventory) when you want the wider view of supplier settlement, AP timing, and working-capital pressure.
- Read [Statements and Cash](../analytics/index.md#statements-and-cash) when you want the reporting layer behind AP, accrual settlement, and cash conversion.
- Read [P2P Accrual Case](../analytics/cases/p2p-accrual-settlement-case.md) when you want a guided walkthrough from requisition and receipt into AP and payment.
- Read [Explain Profit, Cash, and the Year-End Close](../analytics/cases/financial-statement-bridge-case.md) when you want to keep the same P2P document trail in view while teaching capitalization, financing, and disposal.
- Jump to [Accrual Estimate to AP Settlement](../processes/manual-journals-and-close.md#accrual-estimate-to-ap-settlement) when you want the finance-to-AP bridge for accrued services.
- Read [Manufacturing](manufacturing.md) to see how purchasing supports work orders and material availability.
- Read [GLEntry Posting Reference](../reference/posting.md) and [Schema Reference](../reference/schema.md) when you need the detailed posting or join logic.

</details>
