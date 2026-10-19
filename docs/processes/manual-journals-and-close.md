---
title: Journals and Close — Explaining the Company's Period-End Position
description: Follow Charles River's controller through expense estimates, later supplier settlement, monthly adjustments, and the separate purpose of annual closing entries.
sidebar_label: Journals and Close
pagination_prev: processes/payroll
pagination_next: learn-and-practice/index
toc_max_heading_level: 2
---

import BpmnDiagram from "@site/src/components/BpmnDiagram";
import EvidenceDiagram from "@site/src/components/EvidenceDiagram";

# Manual Journals and Close Cycle

<span id="business-storyline"></span>

<span id="what-students-should-learn"></span>

## The Controller Brings the Period Together

The customer has placed orders, goods and services have been supplied, materials have moved through production, and employees have earned pay. At period end, the controller in our company story needs to explain **which events belong in the period and what remains outstanding**.

Bring the earlier chapters together by asking what each process leaves open at the reporting date. Then follow an expense estimate through the later supplier invoice and settlement to see how new evidence changes the accounts.

The operational cycles already create many accounting entries. Finance also records recurring expenses, estimates, reclassifications, and closing entries. Understanding their purpose helps you connect the operating story to the reported balances.

## Explain What the Operating Documents Leave Open

A shipment, supplier receipt, or payroll register can support a posting directly. Other accounting needs begin with finance. An expense may belong to the period even though its supplier invoice has not arrived. Depreciation recognizes the period's use of an asset. A reclassification connects costs already recorded to another accounting purpose.

These finance-controlled entries have journal headers and posted ledger detail. The journal's purpose, date, and support matter alongside its debit and credit balance.

A balanced entry establishes arithmetic equality. It does not establish that the amount, account, or period is correct. The controller needs an explanation that connects the entry to the underlying accounting need.

The model includes recurring monthly entries and more specialized asset, debt, and manufacturing-support activity. Begin with an expense estimate before exploring those additional journal families.

## Recognize an Expense Before the Bill Arrives

Suppose finance needs to recognize an expense incurred during the period while awaiting its supplier bill. An **accrual** records the estimate: expense increases and accrued expenses records the liability.

The journal establishes what finance estimated and when it posted the amount. Approval fields identify recorded preparation and approval support. They do not establish an unrecorded close checklist or independently enforced review procedure.

This expense estimate differs from the inventory receipt introduced in P2P. The ordinary goods-receipt path uses a physical receipt and GRNI. The accrued-service path uses the original finance estimate as the link when AP later records the supplier invoice.

Keep that distinction visible. A service invoice can have legitimate support without a goods-receipt line because it is settling an accrued expense rather than billing received inventory.

## Follow the Estimate into the Supplier Invoice

When the later service invoice arrives, accounts payable links its line to the original accrual. The posting clears accrued expenses up to the estimated amount, records any invoice amount above the estimate as additional expense, and creates accounts payable.

If the estimate is larger than the later invoice, an unused accrual balance remains. A linked accrual adjustment reverses that residual liability and the corresponding expense. The old estimate, supplier invoice, and adjustment remain separate events with their own dates.

This model usually settles finance-managed accruals through later AP activity. It does not blanket-reverse every estimate at the next month end. Inspect the actual links and dates of stale uninvoiced estimates because they can have separate partial-cleanup adjustments.

Treasury subsequently pays the supplier invoice. That payment reduces AP and cash. It does not recognize the original expense again.

The relationship lets you explain the full sequence without counting expense at both the estimate and the invoice. First establish the original accrual, then distinguish what the invoice cleared, any additional expense or residual adjustment, and eventual payment.

<span id="participants-and-responsibilities"></span>

<span id="bpmn-business-process"></span>

<span id="interpret-the-activities-and-decisions"></span>

## Follow the Finance Responsibilities

**How does a supported accounting need become a journal and a period-end explanation?** Follow the Preparer, Approver, and Accounting responsibilities in the BPMN.

<BpmnDiagram modelId="manual-journals-close" />

The model includes annual close as a separate branch. Ordinary monthly entries do not all pass through that branch. The optional accrued-service model shows the handoff to AP and Treasury in more detail.

Use actual creator and approver fields when investigating responsibility. The diagram explains the roles without establishing that every journal received an effective independent review.

<span id="normal-process-overview"></span>

<span id="how-to-read-this-process-in-the-data"></span>

## Connect the Estimate, Settlement, and Ledger

The record map asks **how a finance estimate connects to a later supplier bill and its accounting detail**.

<EvidenceDiagram modelId="accrual-posting" />

The journal header identifies the finance-controlled entry. `GLEntry` contains the posted account detail because this model has no separate journal-line table.

| Event | Accounting purpose in the accrued-service path |
|---|---|
| Expense estimate | Recognize expense and accrued expenses |
| Later supplier invoice | Clear the accrued amount used, recognize any excess expense, and create AP |
| Residual adjustment | Reverse the unused part when the estimate exceeds the linked invoice |
| Supplier payment | Clear AP through cash |

Use the source fields and stored links to connect the events. The inventory invoice's goods-receipt link belongs to a different P2P path.

## Separate Monthly Adjustments from Annual Close

Monthly entries help explain the period's expenses, estimates, and allocations. Annual closing entries serve another purpose: they transfer annual revenue and expense balances through income summary into retained earnings.

An **opening balance** establishes the starting financial position. A **year-end close** marks an annual accounting boundary. Neither should be treated as another ordinary customer sale, supplier purchase, or monthly operating expense.

The analysis determines how you use those entries. Keep them visible when reconciling beginning and ending balances. When analyzing raw multi-year operating profit and loss, apply the documented exclusions for year-end closing entry types.

This distinction prevents the same annual result from being misunderstood as both operating activity and the transfer of that activity into equity. The optional reference identifies the journal families and their detailed posting treatment.

<span id="decisions-and-evidence"></span>

## Explain What Remains at the Reporting Date

The controller may see an accrual before period end and its invoice afterward. That sequence can support an outstanding estimate at the earlier cutoff and later settlement activity. Use the dates to explain the change rather than forcing every related document into one period.

Likewise, an unused accrual balance needs to be understood in relation to the invoice and adjustment dates. The adjustment described above clears the amount by which the estimate exceeded the invoice. It does not reverse an expense underestimate.

The company-wide review now connects all the chapters. Orders, receipts, shipments, service hours, payroll, completions, and journals explain different parts of the accounting. Each conclusion should identify its event, support, date, and remaining uncertainty.

## Bridge an Event to an Entry

Begin with [Lesson 11’s accrual journal 9](../learn-and-practice/follow-an-estimate-into-settlement.md), then extend to the [statement and annual-close case](../analytics/cases/financial-statement-bridge-case.md). They answer different accounting questions.

| Event and date | Supporting evidence | Why the accounts change | Cutoff question |
|---|---|---|---|
| Prepare or approve a journal | JournalEntry preparation and approval fields | No separate posting from an approval field alone; inspect the posted detail | Is there ledger evidence at the selected posting date? |
| Estimate, January 31, 2024 | JournalEntry 9 and its two ledger rows | Debit repairs expense / credit accrued expenses, 10,039.33 each | What later evidence was available at January 31? |
| Linked invoice, March 9 | PurchaseInvoiceLine.AccrualJournalEntryID → journal 9; invoice 39851 | Debit accrued expenses / credit AP, 10,019.59 each | What estimate residual and supplier payable remain? |
| Residual adjustment, March 11 | JournalEntry 698; ReversesJournalEntryID 9 | Debit accrued expenses / credit repairs expense, 19.74 each | Has the excess estimate been reversed by cutoff? |
| Supplier payment, May 20 | DisbursementPayment 39818 | Debit AP / credit cash, 10,019.59 each | Has the supplier payable actually been paid by cutoff? |

Each numerical row summarizes its **complete two-row balanced voucher**. The estimate, invoice, residual adjustment, and cash settlement are separate events. Annual close instead transfers credit-balance P&L accounts with debits and debit-balance P&L accounts, including contra-revenue, with credits. The balancing income-summary direction depends on net income or loss. Follow the [Posting Reference](../reference/posting.md) for that distinct purpose.

**Predict before revealing:** What remains on March 10? Does removing the unused estimate also pay the supplier?

<details>
<summary>Reveal the liability and timing distinction</summary>

The selected accrual has a 19.74 residual until March 11, while 10,019.59 is AP after the March 9 invoice. The adjustment removes the unused accrued liability and reduces expense without paying AP. At March 31 the selected accrual is cleared but the supplier payable remains until May 20. Later events cannot replace the January 31 cutoff position.

</details>

## Check Your Understanding

<details>
<summary>The later invoice is smaller than the original expense estimate. What does the residual adjustment clear?</summary>

It clears the unused accrued-expense liability and reverses the corresponding expense. If the invoice instead exceeds the estimate, the excess is additional expense at invoicing. These are different directions of difference.

</details>

<details>
<summary>Should every monthly expense journal be treated as an annual closing entry?</summary>

No. Monthly entries recognize or adjust activity for their purpose and period. Annual closing entries transfer the year's profit-and-loss balances through income summary to retained earnings.

</details>

## Next Steps

**Continue the company story.** You can now explain the company before opening its records. Continue to [Learn and Practice](../learn-and-practice/index.md) to follow the company story into reproducible evidence.

**Investigate this process.** Finish [Lesson 1](../learn-and-practice/meet-the-records.md), [Lesson 2](../learn-and-practice/read-an-order.md), and [Lesson 3](../learn-and-practice/connect-the-records.md), plus [Excel setup](../analytics/excel-guide.md) or [SQL setup](../analytics/sql-guide.md). Then follow [Lesson 11: Follow an Estimate into Settlement](../learn-and-practice/follow-an-estimate-into-settlement.md), then the [statement and close case](../analytics/cases/financial-statement-bridge-case.md). The [BPMN and Controls Workshop](../learn-and-practice/bpmn-controls-workshop.md) is an optional extension after a verified trace. Check the selected lesson’s further prerequisites before beginning.

<span id="opening-balance-and-year-end-close"></span>

## Optional Reference

Return to these sections when you have a specific question or an assignment that uses the data. The chapter above can be read without opening a file.

<details>
<summary>Look up documents, accounting entries, and traceability fields</summary>

### Core Tables and What They Represent

| Process stage | Main tables | Grain or event represented | Why students use them |
|---|---|---|---|
| Recurring finance journals | `JournalEntry`, `GLEntry`, `Account`, `CostCenter`, `Employee` | One finance-controlled journal header with posted ledger detail | Review recurring expenses, approvals, and posted accounting effect |
| Manufacturing-support journals | `JournalEntry`, `GLEntry`, `Account` | Factory overhead posted directly to manufacturing clearing | Connect finance-controlled journals to manufacturing costing support |
| Fixed-asset and debt journals | `JournalEntry`, `GLEntry`, `FixedAsset`, `FixedAssetEvent`, `DebtAgreement`, `DebtScheduleLine` | Depreciation, debt reclass, note payment, and disposal events that complete the asset lifecycle | Tie the asset register back to manufacturing cost, operating expense, financing cash, and gain-or-loss accounting |
| Accrual settlement bridge | `JournalEntry`, `PurchaseInvoice`, `PurchaseInvoiceLine`, `DisbursementPayment` | Prior expense estimate and later AP settlement path | Analyze accrued-expense roll-forward and later supplier settlement |
| Boundary entries | `JournalEntry`, `GLEntry`, `Account` | Opening balance and year-end close journal activity | Understand the start and end boundaries of the reporting cycle |

### When Accounting Happens

| Event | Business meaning | Accounting effect |
|---|---|---|
| Recurring operating journal | Finance records a monthly expense or estimate directly in the journal cycle | Debit expense or clearing accounts and credit cash, accrued expenses, or other offset accounts depending on entry type |
| Manufacturing-support journal | Finance records factory overhead directly into manufacturing costing support | Debit manufacturing clearing, or manufacturing variance when the month has no capitalizable direct labor, and credit cash |
| Debt reclass | Finance converts a note-financed CAPEX invoice from AP into notes payable | Debit `2010` Accounts Payable and credit `2110` Notes Payable |
| Debt principal payment | Finance records scheduled principal payment on a CAPEX note | Debit `2110` Notes Payable and credit cash |
| Interest payment | Finance records the interest portion of a CAPEX note payment | Debit `7030` Interest Expense and credit cash |
| Asset disposal | Finance removes the disposed asset, clears accumulated depreciation, and records any proceeds or gain or loss | Debit cash proceeds and accumulated depreciation, credit the gross asset account, and plug the residual to `7020` Gain or Loss on Asset Disposal |
| Accrual adjustment | Finance reverses the residual from an accrual after a linked supplier invoice or partially cleans up a stale uninvoiced estimate | Debit `2040` Accrued Expenses and credit the original accrued expense account |
| Direct service supplier invoice | AP clears a prior accrual through a later service invoice | Debit `2040` up to the estimate, expense any excess above estimate, and credit AP |
| Disbursement payment | Treasury clears the AP created by the service invoice | Debit AP and credit cash |
| Opening balance journal | Finance establishes the starting financial position | Seeds the beginning asset, liability, equity, and retained-earnings balances |
| Year-end close | Finance closes annual P&L activity into income summary and retained earnings | Moves annual revenue and expense balances through `8010` Income Summary into `3030` Retained Earnings |

### Key Traceability and Data Notes

- `JournalEntry` is the journal header anchor for finance-controlled activity. There is no separate journal-line table in the current model.
- `GLEntry` is the posted detail layer and the main bridge into financial reporting and control-account analysis.
- `PurchaseInvoiceLine.AccrualJournalEntryID` is the authoritative link from a direct service invoice line back to the original accrual.
- `PurchaseInvoiceLine.GoodsReceiptLineID` belongs to receipt-matched inventory or material invoicing and should not be confused with accrued-service settlement.
- `FixedAssetEvent.JournalEntryID` and `DebtScheduleLine.JournalEntryID` extend the journal trail into note-financed CAPEX, monthly debt payments, and disposal accounting.
- `ReversesJournalEntryID` is used on `Accrual Adjustment` cleanup activity that points back to the original accrual.
- Payroll is operationally modeled through payroll tables, so payroll accrual and settlement journals are not part of this recurring-journal set.
- For raw multi-year income-statement analysis, filter out the year-end close entry types.

</details>

<details>
<summary>Explore detailed process and analysis paths</summary>

### Analytical Subsections

### Recurring Operating Journals

Which recurring entries explain the month's finance-controlled expenses and estimates? Follow journal headers for rent, utilities, depreciation, and accruals into their posted account detail.

<EvidenceDiagram modelId="recurring-journal" />

**Tables involved**

| Table | Role in the flow |
|---|---|
| `JournalEntry` | Shows posting date, entry type, approval support, and reversal linkage |
| `GLEntry` | Shows posted debit and credit detail |
| `Account` | Shows which balances the journal affected |
| `CostCenter`, `Employee` | Support ownership, approvals, and recurring journal analysis |

**Starter analytical question:** Which recurring journal families appear each month, and how stable are they by amount and cost center?

**Analytical plan**

- Objective: Compare recurring journal families across months and cost centers.
- Evidence path: JournalEntry -> GLEntry -> Account, with CostCenter when available.
- Comparison: Group by EntryType, month, account, or cost center.

### Factory Overhead Journals

How does finance-controlled activity support manufacturing cost? Follow factory-overhead journals into their ledger entries. These postings complement the material, labor, completion, and close evidence rather than replacing the operational documents.

<EvidenceDiagram modelId="overhead-support" />

**Tables involved**

| Table | Role in the flow |
|---|---|
| `JournalEntry` | Stores the factory-overhead journal headers |
| `GLEntry` | Shows the posted effect on manufacturing clearing and cash |
| `Account` | Helps separate manufacturing clearing from operating-expense accounts that stay outside overhead |

Warehouse payroll, warehouse rent, and warehouse supplies stay in operating expense in this model. The warehouse function is treated as support and distribution activity, not factory overhead absorbed into product cost.

**Starter analytical question:** How much finance-controlled factory-overhead activity exists beside the operational manufacturing postings in each month?

**Analytical plan**

- Objective: Isolate finance-controlled manufacturing support journals from operational manufacturing postings.
- Evidence path: JournalEntry -> GLEntry -> Account.
- Comparison: Filter EntryType to Factory Overhead.

### Accrual Estimate to AP Settlement

How was the finance estimate cleared? Follow the original accrual into the direct service invoice, any residual adjustment, and payment. When the estimate exceeds the linked invoice, an adjustment reverses the unused balance. Stale uninvoiced accruals can have separate partial-cleanup adjustments. Outbound freight also uses account `2040` in O2C, but it belongs to a different operational path.

The [accrual evidence map above](#evidence-accrual-posting) shows both invoice settlement and the independent residual adjustment. Compare those branches rather than treating them as one payment sequence.

**Tables involved**

| Table | Role in the flow |
|---|---|
| `JournalEntry` | Stores the original accrual estimate and any later adjustment |
| `PurchaseInvoiceLine` | Stores the direct service settlement link back to the accrual |
| `PurchaseInvoice` | Stores the supplier invoice that clears the estimate through AP |
| `DisbursementPayment` | Shows when the later AP balance was actually paid |
| `GLEntry` | Shows the liability roll-forward and later settlement effect |

:::warning
Use `PurchaseInvoiceLine.AccrualJournalEntryID` for accrued-service settlement. Do not substitute `PurchaseInvoiceLine.GoodsReceiptLineID`, because that field belongs to receipt-matched inventory or material invoicing.
:::

**Key joins**

- `PurchaseInvoiceLine.AccrualJournalEntryID -> JournalEntry.JournalEntryID`
- `PurchaseInvoiceLine.PurchaseInvoiceID -> PurchaseInvoice.PurchaseInvoiceID`
- `DisbursementPayment.PurchaseInvoiceID -> PurchaseInvoice.PurchaseInvoiceID`
- `JournalEntry.ReversesJournalEntryID` for linked `Accrual Adjustment` cleanup review

**Analytical plan**

- Objective: Trace an accrued expense from the original estimate into later AP settlement and linked cleanup activity.
- Evidence path: JournalEntry -> PurchaseInvoiceLine -> PurchaseInvoice -> DisbursementPayment.
- Comparison: Compare accrual date, invoice approval date, payment date, and any later accrual adjustment.

</details>

<details>
<summary>Follow specialized process branches</summary>

<BpmnDiagram modelId="accrual-settlement" />

The original estimate, a later direct service invoice, any linked residual adjustment, and disbursement remain separate events. The invoice uses `AccrualJournalEntryID` without requiring a physical receipt. An estimate can remain outstanding at a reporting date.

</details>

<details>
<summary>Evaluate controls and try the optional AIS activity</summary>

### Risks, Controls, and Evidence

| Risk and control objective | Evidence available | Teaching boundary |
|---|---|---|
| Unsupported journal: identify preparation and approval support | `JournalEntry` creator, approver, and date fields, plus `GLEntry` | Test actual identities and dates; the diagram does not establish an enforced independent-review workflow |
| Duplicate recognition or stale estimate: distinguish accrual from later AP settlement | `PurchaseInvoiceLine.AccrualJournalEntryID`, `JournalEntry.ReversesJournalEntryID`, `GLEntry` | An independent accrual roll-forward is a **proposed teaching control**; missing later settlement at cutoff is not automatically an error |
| Misstated operating analysis: distinguish routine activity from close boundaries | `JournalEntry.EntryType`, posting dates, accounts, and ledger source fields | An independent close reconciliation is a **proposed teaching control**; a year-end entry is not ordinary operating revenue or expense |

### Optional AIS Activity: Evaluate an Accrual or Close Review

**Context and objective:** finance needs a supported explanation of one estimate or reporting-boundary entry. Locate preparation, approval, posting, and any later settlement evidence, then propose a review that addresses a defined risk.

**Prerequisites, tools, and sources:** review accrual recognition, liabilities, and closing entries. Use a SQL tool with the published SQLite file, or Excel filters and lookups, plus a copy of the editable Draw.io model. Sources are `JournalEntry`, `GLEntry`, `Account`, and, for an accrued service, `PurchaseInvoiceLine`, `PurchaseInvoice`, and `DisbursementPayment`. Use fixed-asset and debt records only when the chosen journal family requires them.

1. Record the source file, journal type, reporting date, and actual keys. Mark the entry's purpose, preparation, approval, and posting on the model.
2. Trace the entry to ledger detail and retain the relevant date boundaries. For an accrual, inspect linked invoices and adjustments without assuming blanket reversal. For close, distinguish operating activity from the annual transfer.
3. Add one **proposed teaching control** for approval, accrual review, or close reconciliation. Specify the risk, objective, owner, evidence, test, and limitation in the [workshop matrix](../learn-and-practice/bpmn-controls-workshop.md).

**Assessed deliverable:** submit an annotated model, a reproducible journal-to-ledger schedule, and the risk/control row. Explain what finding would warrant follow-up and what additional support would be needed. The file does not establish a complete finance-calendar workflow or prove review quality merely through an approver field. Continue through the existing accrual, financial query, and statement-bridge links on this page.

</details>

<details>
<summary>Choose a further investigation</summary>

### Questions for Further Investigation {#common-student-questions}

- Which journal types recur each month?
- Which recurring journal categories are cash-based versus accrued?
- Which finance-controlled journals move CAPEX from AP into notes payable, then split future note cash into principal and interest?
- Which accrued expenses later clear through AP through supplier invoicing and payment?
- Which entries support manufacturing cost accounting even though they are journal-based?
- Which disposal journals removed gross cost and accumulated depreciation cleanly?
- How much finance-controlled journal activity exists beside operational postings?
- How should year-end close entries be treated in multi-year income-statement analysis?

- Read [P2P](p2p.md) for the supplier-invoice and disbursement flow that clears many accrued expenses.
- Read [Explain Profit, Cash, and the Year-End Close](../analytics/cases/financial-statement-bridge-case.md) when you want the fixed-asset subledger, note schedule, and manual journal layer in one walkthrough.
- Read [Payroll](payroll.md) for the operational payroll cycle that sits outside this finance-controlled journal family.
- Read [GLEntry Posting Reference](../reference/posting.md) for the detailed posting logic behind recurring journals, accruals, and close.
- Read [Statements and Cash queries](../analytics/analysis-tracks.md#statements-and-cash) for journal, accrual, and close-cycle analysis examples.
- Read [Schema Reference for full table relationships](../reference/schema.md) when you need the broader process-level table map.

</details>
