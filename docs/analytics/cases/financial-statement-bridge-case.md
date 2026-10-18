---
title: "7. Explain Profit, Cash, and the Year-End Close"
description: "How can the company report profit while cash falls, and what does the year-end close change?"
sidebar_label: "7. Explain Profit, Cash, and the Year-End Close"
pagination_prev: "analytics/cases/workforce-coverage-and-attendance-case"
pagination_next: "analytics/cases/audit-review-pack-case"
case_number: 7
case_level: Advanced
case_sessions: 4
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import CaseFigure from "@site/src/components/Cases/Figure";
import CaseMethods from "@site/src/components/Cases/Methods";
import { CaseOverview } from "@site/src/components/CaseExplorer";
import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# 7. Explain Profit, Cash, and the Year-End Close

<span id="business-scenario"></span>
<span id="the-problem-to-solve"></span>
<span id="learning-objectives"></span>

The controller is preparing the year-end management review. Management wants an explanation of performance, cash movement, and obligations. A collection of reports is not enough: you must reconcile the periods, trace selected source evidence, and decide which unresolved matters deserve attention first. Predict why closing revenue and expense accounts should not itself create or consume cash.

<CaseOverview slug="financial-statement-bridge-case" />

**Worked scope.** Fourth-quarter 2026 activity and December 31 balances. Opening balances include all released history before October 1, including the opening journal and earlier years. The fixed-asset extension follows asset 18 across its 2026 lifecycle. The working file includes later supplier payments; exclude 2027 events from year-end balances.

The management request is an illustrative company scenario. The worked records are actual synthetic records from release **v2027.1**, separate from the fictional furnishing project. Your assigned release may differ. Complete either tool route; your Excel/SQL choice follows you between lessons and cases.

**Preparation:** 6: ledger entries; 11: estimates and settlement; 12: summaries; Cases 1 and 3 recommended. Revisit [the relevant tutorial](../../learn-and-practice/find-the-accounting-entries.md) and the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) if needed.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| GLEntry | T3_GLEntry | GLEntryData |
| Account | T1_Account | AccountData |
| JournalEntry | T2_JournalEntry | JournalEntryData |
| GoodsReceipt | T35_GoodsReceipt | GoodsReceiptData |
| GoodsReceiptLine | T36_GoodsReceiptLine | GoodsReceiptLineData |
| PurchaseInvoice | T37_PurchaseInvoice | PurchaseInvoiceData |
| PurchaseInvoiceLine | T38_PurchaseInvoiceLine | PurchaseInvoiceLineData |
| FixedAsset | T40_FixedAsset | FixedAssetData |
| FixedAssetEvent | T41_FixedAssetEvent | FixedAssetEventData |
| DebtAgreement | T42_DebtAgreement | DebtAgreementData |
| DebtScheduleLine | T43_DebtScheduleLine | DebtScheduleLineData |

<CaseMethods />

<span id="step-1-define-the-fixed-asset-rollforward-by-behavior-group"></span>
<span id="step-2-trace-acquisitions-improvements-financing-choices-and-disposals"></span>
<span id="step-1-define-the-statement-scaffold-from-the-trial-balance"></span>
<span id="step-2-reconcile-key-control-accounts-back-to-operational-source-activity"></span>
<span id="step-1-define-the-monthly-pressure-map-from-the-control-accounts"></span>
<span id="step-2-separate-customer-settlement-timing-from-customer-cash-arrival"></span>

## Session 1 — Establish opening, movement, and closing balances

Create Case07.xlsx or Case07.sql. This case begins with the complete ledger, then summarizes before loading results. Keep one definition of the quarter and one sign convention.

<CaseFigure figureId="case07-statements" />


### 1.1. Build openings from the full history

**Predict before you run:** What would be missing if you imported only October–December?

<ToolSteps>
<TabItem value="excel">

1. Import T3_GLEntry into Power Query as LedgerHistory.

2. Keep PostingDate, AccountID, Debit, Credit, SourceDocumentType, SourceDocumentID, VoucherNumber, and GLEntryID.

3. Set PostingDate to Date and monetary columns to Decimal Number.

4. Filter only the upper boundary: PostingDate on or before December 31, 2026.

5. Do not add an October lower boundary.

6. In Power Query choose Add Column → Custom Column and add DebitNet using the expression below; Power Query expressions do not start with an equals sign:

    ~~~text title="Power Query — LedgerHistory / DebitNet"
    [Debit]-[Credit]
    ~~~

7. Add OpeningDebitNet:

    ~~~text title="Power Query — LedgerHistory / OpeningDebitNet"
    if [PostingDate] < #date(2026,10,1) then [DebitNet] else 0
    ~~~

8. Add QuarterDebitNet:

    ~~~text title="Power Query — LedgerHistory / QuarterDebitNet"
    if [PostingDate] >= #date(2026,10,1) then [DebitNet] else 0
    ~~~

9. Reference this query as Rollforward.

10. Group by AccountID, summing OpeningDebitNet, QuarterDebitNet, and DebitNet (name the last ClosingDebitNet).

11. Merge AccountData on AccountID and expand AccountNumber, AccountName, NormalBalance.

12. Sort AccountNumber and load only this summary as Rollforward.

13. Keep LedgerHistory as connection-only on Windows; on Mac retain it in the editor and load the grouped result, without loading raw ledger rows to a sheet.

</TabItem>
<TabItem value="sql">

The WHERE clause has only an upper date boundary. CASE separates all earlier history from quarter activity. All amounts use debit minus credit, so opening plus movement equals closing on one consistent sign basis.

Run each complete statement separately and retain its result before continuing.
```sql title="c07-rollforward.sql"
SELECT a.AccountNumber,
       a.AccountName,
       a.NormalBalance,
       ROUND(SUM(CASE WHEN g.PostingDate<'2026-10-01' THEN g.Debit-g.Credit ELSE 0 END),2) AS OpeningDebitNet,
       ROUND(SUM(CASE WHEN g.PostingDate>='2026-10-01' THEN g.Debit-g.Credit ELSE 0 END),2) AS QuarterDebitNet,
       ROUND(SUM(g.Debit-g.Credit),2) AS ClosingDebitNet
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
WHERE g.PostingDate<='2026-12-31'
GROUP BY a.AccountID,a.AccountNumber,a.AccountName,a.NormalBalance
ORDER BY a.AccountNumber;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 71 accounts have postings. The source has 732,310 rows before October 1 and 83,085 in the quarter. Cash opens at 9,185,795.46, changes by −743,539.66, and closes at 8,442,255.80.

A cumulative balance needs prior history. Filtering the source to the quarter would make the opening balance zero and turn the quarter’s movement into a false ending balance.

<details>
<summary>If your result differs</summary>

Check the Applied Steps list for an accidental lower-date filter. Numeric source dates must be converted to Date before comparison.

</details>

**Keep for the next stage:** Save Rollforward, source date boundaries, and row-count evidence.

### 1.2. Check the rollforward and signs

**Predict before you run:** Why is a normal credit-balance liability negative in this schedule?

<ToolSteps>
<TabItem value="excel">

1. In Rollforward add Check:

    ~~~text title="Excel — Rollforward[Check]"
    =ROUND([@OpeningDebitNet]+[@QuarterDebitNet]-[@ClosingDebitNet],2)
    ~~~

2. On Review label B2 Opening ledger balance, B3 Quarter ledger movement, and B4 Closing ledger balance.

3. Enter each total and confirm it is within one cent of zero:

    ~~~text title="Excel — Review!B2"
    =SUM(Rollforward[OpeningDebitNet])
    ~~~

    ~~~text title="Excel — Review!B3"
    =SUM(Rollforward[QuarterDebitNet])
    ~~~

    ~~~text title="Excel — Review!B4"
    =SUM(Rollforward[ClosingDebitNet])
    ~~~

4. Keep the debit-net columns unchanged.

5. For a management display add NormalClosing:

    ~~~text title="Excel — Rollforward[NormalClosing]"
    =IF([@NormalBalance]="Credit",-[@ClosingDebitNet],[@ClosingDebitNet])
    ~~~

6. Filter to account numbers 1020, 2010, 2020, 2040, and 2060 to inspect the control accounts.

</TabItem>
<TabItem value="sql">

Use the 71 rows returned by c07-rollforward.sql. For each row, OpeningDebitNet plus QuarterDebitNet must equal ClosingDebitNet to cents. Read accounts 1020, 2010, 2020, 2040, and 2060 and reverse the sign only when presenting a credit-normal liability to management. Keep the original debit-net schedule as the reconciliation basis.

</TabItem>
</ToolSteps>

**Checkpoint.** Closing debit-net values include AR 4,798,804.32; AP −6,237,466.66; GRNI −1,020,992.06; accrued expenses −480,552.36; customer deposits −3,413.46. All 71 opening-plus-movement checks are zero to cents.

A negative debit-net AP balance is the expected credit balance. Changing signs selectively inside the underlying rollforward would destroy the accounting identity.

<details>
<summary>If your result differs</summary>

Do not compare a credit-normal report balance to the raw debit-net schedule without reversing its sign.

</details>

**Keep for the next stage:** Retain the sign definition and selected control-account display.

:::tip Session stopping point
Save the 71-account schedule and its checks. You now have a reliable period boundary for the remaining sessions.
:::

<span id="step-3-isolate-the-note-financed-lifecycle-and-debt-cash-timing"></span>
<span id="step-3-separate-recurring-journals-finance-controlled-activity-and-close-cycle-volume"></span>
<span id="step-3-explain-supplier-side-timing-through-ap-grni-and-payment-lag"></span>

## Session 2 — Explain profit and cash differences

Calculate profit before closing entries, then reconcile it to the cash movement through changes in other accounts. This arithmetic bridge is broader than an operating-cash subtotal.

<CaseFigure figureId="case07-rollforward" />


### 2.1. Calculate pre-close performance and cash activity

**Predict before you run:** Would including the annual closing entry make December’s operating result meaningful?

<ToolSteps>
<TabItem value="excel">

1. Reference LedgerHistory twice.

2. For ProfitDetail, merge AccountData and expand AccountType and AccountSubType.

3. In Power Query add JournalKey with Add Column → Custom Column:

    ~~~text title="Power Query — ProfitDetail / JournalKey"
    if [SourceDocumentType] = "JournalEntry" then [SourceDocumentID] else null
    ~~~

4. Left merge JournalEntryData on JournalKey = JournalEntryID and expand EntryType; do not merge every source ID to journals.

5. Filter PostingDate October 1–December 31, AccountType Revenue or Expense, AccountSubType not Header, and exclude EntryType beginning Year-End Close while keeping null EntryType.

6. Add a Custom Column named ProfitAmount:

    ~~~text title="Power Query — ProfitDetail / ProfitAmount"
    [Credit]-[Debit]
    ~~~

7. Derive Month using Transform → Date → Month → Start of Month and group by Month summing ProfitAmount into a column named ProfitAmount.

8. Load the three-row summary as ProfitSummary.

9. For CashActivity, filter the AccountID linked to AccountNumber 1010 and quarter dates, group by SourceDocumentType summing Debit, Credit, and DebitNet into columns with those same names.

10. Load as CashActivity.

</TabItem>
<TabItem value="sql">

The journal join applies only when the source type is JournalEntry. COALESCE preserves operational entries with no journal match, while NOT LIKE excludes the annual close. Profit uses credit minus debit for revenue and expense accounts.

Run each complete statement separately and retain its result before continuing.
```sql title="c07-profit.sql"
SELECT substr(g.PostingDate,1,7) AS Month,
       ROUND(SUM(g.Credit-g.Debit),2) AS PreCloseProfit
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
LEFT JOIN JournalEntry j ON g.SourceDocumentType='JournalEntry' AND j.JournalEntryID=g.SourceDocumentID
WHERE g.PostingDate BETWEEN '2026-10-01' AND '2026-12-31' AND a.AccountType IN('Revenue','Expense') AND a.AccountSubType<>'Header' AND COALESCE(j.EntryType,'') NOT LIKE 'Year-End Close%'
GROUP BY substr(g.PostingDate,1,7)
ORDER BY Month;
```


```sql title="c07-cash.sql"
SELECT g.SourceDocumentType,
       ROUND(SUM(g.Debit),2) AS CashDebits,
       ROUND(SUM(g.Credit),2) AS CashCredits,
       ROUND(SUM(g.Debit-g.Credit),2) AS CashMovement
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
WHERE a.AccountNumber=1010 AND g.PostingDate BETWEEN '2026-10-01' AND '2026-12-31'
GROUP BY g.SourceDocumentType
ORDER BY g.SourceDocumentType;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Pre-close profit: October 255,812.14; November 405,751.40; December 502,693.70; quarter 1,164,257.24. Cash falls 743,539.66. Customer cash receipts add 7,816,054.56; supplier payments use 5,912,239.65.

Profit and cash are different measures of the same business period. A customer receipt may settle an earlier invoice; a supplier payment may settle an earlier obligation. The annual close must not erase the quarter’s performance measure.

<details>
<summary>If your result differs</summary>

Preserve null journal matches for operational events. Filtering null EntryType out would remove much of the ledger.

</details>

**Keep for the next stage:** Save monthly Profit and CashActivity with the close exclusion documented.

### 2.2. Construct the complete arithmetic bridge

**Predict before you run:** Which other account changes explain the difference?

<ToolSteps>
<TabItem value="excel">

1. Reference the same quarter ledger with the conditional journal join and close exclusion.

2. Keep AccountNumber not 1010 and AccountType other than Revenue or Expense.

3. In Power Query add BridgeEffect with Add Column → Custom Column:

    ~~~text title="Power Query — Bridge effects / BridgeEffect"
    [Credit]-[Debit]
    ~~~

4. Group by AccountNumber and AccountName, summing BridgeEffect into a column with the same name.

5. Add NonzeroEffect with the expression below and filter it to true:

    ~~~text title="Power Query — Bridge effects / NonzeroEffect"
    Number.Round(Number.Abs([BridgeEffect]),2) > 0
    ~~~

6. Load as BridgeEffects.

7. On Review label B8 Quarter pre-close profit and enter:

    ~~~text title="Excel — Review!B8"
    =SUM(ProfitSummary[ProfitAmount])
    ~~~

8. Place the 19 effect rows beneath the profit explanation.

9. Label B9 Calculated cash movement and enter:

    ~~~text title="Excel — Review!B9"
    =SUM(B8,BridgeEffects[BridgeEffect])
    ~~~

10. Label B10 Ledger cash movement and enter:

    ~~~text title="Excel — Review!B10"
    =SUM(CashActivity[DebitNet])
    ~~~

11. Label B11 Bridge difference and enter:

    ~~~text title="Excel — Review!B11"
    =ROUND(B9-B10,2)
    ~~~

12. Chart the signed effects using a column chart, clearly separating starting profit and calculated cash movement from individual effects.

</TabItem>
<TabItem value="sql">

Exclude cash and revenue/expense accounts, keep quarter activity, and remove annual close entries. Credit minus debit on the remaining accounts supplies the effects needed to bridge pre-close profit to cash. HAVING removes immaterial zero aggregates after grouping.

Run each complete statement separately and retain its result before continuing.
```sql title="c07-bridge.sql"
SELECT a.AccountNumber,
       a.AccountName,
       ROUND(-SUM(g.Debit-g.Credit),2) AS BridgeEffect
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
LEFT JOIN JournalEntry j ON g.SourceDocumentType='JournalEntry' AND j.JournalEntryID=g.SourceDocumentID
WHERE g.PostingDate BETWEEN '2026-10-01' AND '2026-12-31' AND a.AccountNumber<>1010 AND a.AccountType NOT IN('Revenue','Expense') AND COALESCE(j.EntryType,'') NOT LIKE 'Year-End Close%'
GROUP BY a.AccountID,a.AccountNumber,a.AccountName
HAVING ABS(SUM(g.Debit-g.Credit))>0.005
ORDER BY a.AccountNumber;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Nineteen nonzero account effects sum to −1,907,796.90. Added to profit of 1,164,257.24, they reconcile to −743,539.66 cash movement. Inventory and WIP increases contribute −2,872,614.48; the AP increase contributes +411,484.70.

This bridge explains the accounting difference. It does not mean every inventory increase was paid in cash or every liability increase is an operating cash inflow. The published cash-flow statement applies its own operating, investing, and financing classifications.

<details>
<summary>If your result differs</summary>

Do not use post-close retained-earnings movement as an additional profit effect: that would count annual profit again.

</details>

**Keep for the next stage:** Save the zero-difference bridge and identify the largest three effects.

### 2.3. Trace one liability movement to source documents

**Predict before you run:** Can the large GRNI entries be explained by a receipt and a later invoice?

<ToolSteps>
<TabItem value="excel">

1. Reference quarter LedgerHistory; merge AccountData and filter AccountNumber 2020, December dates.

2. In Power Query add a Custom Column named AbsoluteAmount:

    ~~~text title="Power Query — Selected liability trace / AbsoluteAmount"
    Number.Abs([DebitNet])
    ~~~

3. Sort AbsoluteAmount descending then GLEntryID and keep the first five rows.

4. Follow GoodsReceipt 27267 and PurchaseInvoice 39692 into their headers and lines.

5. Merge PurchaseInvoiceLineData filtered to invoice 39692 with GoodsReceiptLineData on GoodsReceiptLineID, then GoodsReceiptData on GoodsReceiptID.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c07-source.sql"
SELECT g.PostingDate,
       g.SourceDocumentType,
       g.SourceDocumentID,
       g.VoucherNumber,
       g.Debit,
       g.Credit
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
WHERE a.AccountNumber=2020 AND g.PostingDate BETWEEN '2026-12-01' AND '2026-12-31'
ORDER BY ABS(g.Debit-g.Credit) DESC,g.GLEntryID LIMIT 5;
```


```sql title="c07-source-documents.sql"
SELECT r.GoodsReceiptID,
       r.ReceiptDate,
       l.GoodsReceiptLineID,
       l.ExtendedStandardCost,
       p.PurchaseInvoiceID,
       i.InvoiceDate,
       p.Quantity,
       p.LineTotal
FROM PurchaseInvoiceLine p
JOIN PurchaseInvoice i ON i.PurchaseInvoiceID=p.PurchaseInvoiceID
JOIN GoodsReceiptLine l ON l.GoodsReceiptLineID=p.GoodsReceiptLineID
JOIN GoodsReceipt r ON r.GoodsReceiptID=l.GoodsReceiptID
WHERE p.PurchaseInvoiceID=39692
ORDER BY p.PILineID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Receipt 27267 records 34,472.46 on December 25; invoice 39692 clears the same GRNI amount December 31. The line relationship identifies the receipt match. The supplier invoice header is dated December 30 while its GRNI ledger posting is December 31; retain both dates rather than silently substituting one.

The matching amounts and explicit link support a transition from GRNI into AP, not payment. That distinction helps explain why a liability balance can change even without immediate cash movement.

<details>
<summary>If your result differs</summary>

Matching amounts alone are insufficient. Require the GoodsReceiptLineID relationship.

</details>

**Keep for the next stage:** Save the two-document trace and identify the next table needed to investigate payment.

:::tip Session stopping point
Save the profit, cash, full bridge, and one source trace. Draft a plain-language explanation of why profit and cash moved differently.
:::

<span id="step-4-connect-manufacturing-equipment-depreciation-back-into-product-cost-interpretation"></span>
<span id="step-4-tie-annual-net-income-into-retained-earnings-and-test-the-close"></span>
<span id="step-4-bring-commission-payroll-and-accrued-liabilities-into-the-same-cash-pressure-story"></span>

## Session 3 — Separate annual close from quarterly performance

The close transfers a year’s profit into equity. Its scope is the entire year, even though its posting date falls in the fourth quarter.

<CaseFigure figureId="case07-close" />


### 3.1. Inspect both closing journals

**Predict before you run:** Should the equity transfer equal fourth-quarter profit or full-year profit?

<ToolSteps>
<TabItem value="excel">

1. Import JournalEntryData filtered to PostingDate December 31, 2026 and EntryType beginning Year-End Close.

2. Inner merge GLEntryData using SourceDocumentType JournalEntry and SourceDocumentID = JournalEntryID.

3. Merge AccountData.

4. In Power Query add a Custom Column named DebitNet:

    ~~~text title="Power Query — Closing journal detail / DebitNet"
    [Debit]-[Credit]
    ~~~

5. Group by JournalEntryID, EntryType, AccountNumber, summing DebitNet.

6. Separately reference the full-year 2026 ledger.

7. Add ProfitAmount using the expression below, then group all selected rows and sum ProfitAmount twice: once excluding closing entries, once including them:

    ~~~text title="Power Query — Full-year performance / ProfitAmount"
    [Credit]-[Debit]
    ~~~

8. Keep the same account-type and Header exclusions used for Profit.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c07-close.sql"
SELECT j.JournalEntryID,
       j.EntryType,
       a.AccountNumber,
       ROUND(SUM(g.Debit-g.Credit),2) AS DebitNet
FROM JournalEntry j
JOIN GLEntry g ON g.SourceDocumentType='JournalEntry' AND g.SourceDocumentID=j.JournalEntryID
JOIN Account a ON a.AccountID=g.AccountID
WHERE j.PostingDate='2026-12-31' AND j.EntryType LIKE 'Year-End Close%'
GROUP BY j.JournalEntryID,j.EntryType,a.AccountNumber
ORDER BY j.JournalEntryID,a.AccountNumber;
```


```sql title="c07-annual-check.sql"
SELECT ROUND(SUM(CASE WHEN COALESCE(j.EntryType,'') NOT LIKE 'Year-End Close%' THEN g.Credit-g.Debit ELSE 0 END),2) AS AnnualPreCloseProfit,
       ROUND(SUM(g.Credit-g.Debit),2) AS AnnualPostClosePL
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
LEFT JOIN JournalEntry j ON g.SourceDocumentType='JournalEntry' AND j.JournalEntryID=g.SourceDocumentID
WHERE g.PostingDate BETWEEN '2026-01-01' AND '2026-12-31' AND a.AccountType IN('Revenue','Expense') AND a.AccountSubType<>'Header';
```


</TabItem>
</ToolSteps>

**Checkpoint.** Journals 850 and 851 transfer annual pre-close profit of 4,503,611.24. The annual post-close revenue/expense net is zero. This is different from fourth-quarter profit of 1,164,257.24.

A zero post-close P&L balance confirms the transfer for the selected definition; it does not mean the business earned no profit. Do not add the annual transfer to the quarter’s operating result.

<details>
<summary>If your result differs</summary>

An annual close cannot be checked against a quarter-only P&L. Keep annual and quarterly schedules distinctly labeled.

</details>

**Keep for the next stage:** Save the closing sequence and annual comparison.

:::tip Session stopping point
Save the annual close workpaper. Explain why the retained-earnings movement uses a different period from the management performance discussion.
:::

<span id="step-5-finish-with-the-real-statement-and-cash-flow-impact"></span>
<span id="step-5-drill-from-statement-variance-into-annual-net-revenue-and-cutoff-exceptions"></span>
<span id="step-5-prioritize-the-driver-that-deserves-management-follow-up-first"></span>

## Session 4 — Reconcile reports and advise management

Use published reports as an independent presentation check after building the analysis. Align their definitions and periods before comparing amounts.

<CaseFigure figureId="case07-profit-cash" />


### 4.1. Match the published statement definitions

**Predict before you run:** Which report rows can be summed across months, and which are ending balances?

<ToolSteps>
<TabItem value="excel">

1. From Reports and Analytics open Monthly Income Statement and Monthly Indirect Cash Flow in the Statements and Cash group.

2. Download their existing Excel or CSV files.

3. Filter FiscalYear 2026 and FiscalPeriod 10,11,12.

4. For income select only the Net Income subtotal.

5. For cash select Net Change in Cash; sum the three monthly movements.

6. Read Beginning Cash from October only and Ending Cash from December only.

7. Retain those filters and the report title on Review.

8. Do not sum monthly balance snapshots.

</TabItem>
<TabItem value="sql">

Open the published Monthly Income Statement and Monthly Indirect Cash Flow CSV downloads from Reports and Analytics in a text editor. Read the header, then locate FiscalYear 2026 and FiscalPeriod 10, 11, and 12. Retain only Net Income subtotal rows for the profit comparison, and Net Change in Cash rows for cash movement. Compare with c07-profit.sql and c07-cash.sql. Read October Beginning Cash and December Ending Cash once; do not sum monthly balances. This inspection does not require importing the reports into your database.

</TabItem>
</ToolSteps>

**Checkpoint.** Published Net Income agrees with the three monthly profit values. Cash movements are −44,374.25, −203,901.73, and −495,263.68, summing to −743,539.66. October beginning cash and December ending cash agree with the rollforward.

Matching totals support the reconciliation on these definitions. They do not prove every underlying transaction is error-free. The source trace and unresolved items remain part of the review.

<details>
<summary>If your result differs</summary>

Choose actual reports, not the pro forma reports. Do not add both subtotal and detail rows.

</details>

**Keep for the next stage:** Save a compact report tie-out table with difference columns.

### 4.2. Write the management explanation

**Predict before you run:** Which matters deserve action first rather than another report?

<ToolSteps>
<TabItem value="excel">

1. Create a one-page Review with quarter profit, cash movement, opening/closing cash, and the largest bridge effects.

2. Add an unresolved-items table with Evidence, Interpretation, MissingEvidence, Owner, and NextAction.

3. Write a 600–800 word management memo explaining performance, cash, obligations, and the annual close.

4. Distinguish confirmed arithmetic, a supported source explanation, and a management hypothesis.

</TabItem>
<TabItem value="sql">

Use the saved result tables from the preceding stages to construct this comparison and written interpretation. Retain the query names, filters, source keys, and amounts in your case notes. An ordered result table can communicate the comparison without making a chart or switching tools.

</TabItem>
</ToolSteps>

**Checkpoint.** The worked explanation emphasizes inventory accumulation and the timing of supplier and other obligations, while preserving positive pre-close profit and falling cash as compatible facts.

Recommend reviewing the drivers of inventory growth and the payment outlook rather than treating profit as available cash. State what additional aging, inventory, or operating evidence is needed before making a liquidity or purchasing decision.

<details>
<summary>If your result differs</summary>

Do not present a selected document trace as proof of every control-account balance.

</details>

**Keep for the next stage:** Save the memo, bridge, report comparison, and source workpaper.

:::tip Session stopping point
The completed review should stand on its own: definitions, reproducible schedules, source evidence, limitations, and an action priority.
:::


<span id="required-student-output"></span>
<span id="wrap-up-questions"></span>
<span id="limitations-and-judgment"></span>

## Prepare the Decision

The quarter produces positive pre-close profit while cash falls. The complete ledger bridge explains that difference and the selected receipt/invoice trace illustrates a liability transition. The annual closing entries transfer full-year profit to retained earnings without creating cash. Management can now discuss inventory and obligation timing using reconciled evidence, while recognizing that an arithmetic tie-out alone does not establish transaction validity.

**Deliverable:** A full-history balance rollforward, profit/cash bridge, selected source reconciliation, and management review memo. Include the release, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A chart is optional in the SQL route; a clearly ordered result table can support the same conclusion.

## Independent Challenge

Apply the framework to fourth-quarter 2025 and December 31, 2025. Build openings from earlier history, exclude annual close from period performance, trace a material bridge item, and explain which management priority changes.

<details>
<summary>Planning hint</summary>

Do not reuse the worked opening balances. Reconstruct all earlier history through September 30, 2025 and use the 2025 closing journals. Select an asset lifecycle that actually occurs in the relevant records if you extend the case.

</details>

**Assessment criteria:** Assess opening history, signs, close exclusions, complete cash bridge, matched report definitions, source support, and priorities that reflect uncertainty. Your instructor evaluates the method, evidence, and reasoning; there is no public model answer for this challenge.

## Worked extension — Trace a financed asset

Asset 18 is the Finishing Booth Upgrade and Air Handling Retrofit. Its 280,000 cost enters the 2026 records before the fourth quarter. Follow acquisition, financing, depreciation, and debt payments without treating a note-financed acquisition as immediate cash expenditure.

<CaseFigure figureId="case07-asset" />

<ToolSteps>
<TabItem value="excel">

1. Import FixedAssetData filtered to ID 18 and FixedAssetEventData for that ID.

2. Import DebtScheduleLineData filtered DebtAgreementID 2 and PaymentDate through December 31, 2026.

3. Load the asset as FixedAssetData and add MonthlyDepreciation:

    ~~~text title="Excel — FixedAssetData[MonthlyDepreciation]"
    =ROUND(([@OriginalCost]-[@ResidualValue])/[@UsefulLifeMonths],2)
    ~~~

4. This asset begins depreciation in the month after its January in-service date.

5. Import GLEntryData for GoodsReceipt/15616, PurchaseInvoice/21692, JournalEntry/445, and the two JournalEntry/685 rows whose Description names this asset.

6. Keep the last two as an excerpt of the larger depreciation voucher.

7. Load the debt schedule as DebtScheduleLineData.

8. Filter PaymentDate to October–December 2026.

9. On Review label B20 Principal, B21 Interest, B22 Payment, and B23 Payment difference.

10. Enter each formula:

    ~~~text title="Excel — Review!B20"
    =SUBTOTAL(109,DebtScheduleLineData[PrincipalAmount])
    ~~~

    ~~~text title="Excel — Review!B21"
    =SUBTOTAL(109,DebtScheduleLineData[InterestAmount])
    ~~~

    ~~~text title="Excel — Review!B22"
    =SUBTOTAL(109,DebtScheduleLineData[PaymentAmount])
    ~~~

    ~~~text title="Excel — Review!B23"
    =ROUND(B20+B21-B22,2)
    ~~~

</TabItem>
<TabItem value="sql">

Use the following source trace for this optional extension.
```sql title="c07-assets.sql"
SELECT FixedAssetEventID,
       EventType,
       EventDate,
       Amount,
       FinancingType,
       PurchaseInvoiceID,
       DebtAgreementID,
       JournalEntryID
FROM FixedAssetEvent
WHERE FixedAssetID=18 AND EventDate<='2026-12-31'
ORDER BY EventDate,FixedAssetEventID;
```


```sql title="c07-depreciation.sql"
SELECT f.FixedAssetID,
       f.AssetDescription,
       f.OriginalCost,
       f.ResidualValue,
       f.UsefulLifeMonths,
       ROUND(1.0*(f.OriginalCost-f.ResidualValue)/f.UsefulLifeMonths,2) AS MonthlyDepreciation,
       f.InServiceDate
FROM FixedAsset f
WHERE f.FixedAssetID=18;
```


```sql title="c07-asset-postings.sql"
SELECT g.PostingDate,
       g.SourceDocumentType,
       g.SourceDocumentID,
       g.VoucherNumber,
       a.AccountNumber,
       g.Debit,
       g.Credit,
       g.Description
FROM GLEntry g
JOIN Account a ON a.AccountID=g.AccountID
WHERE (g.SourceDocumentType='GoodsReceipt' AND g.SourceDocumentID=15616) OR (g.SourceDocumentType='JournalEntry' AND g.SourceDocumentID=445) OR (g.SourceDocumentType='PurchaseInvoice' AND g.SourceDocumentID=21692) OR (g.SourceDocumentType='JournalEntry' AND g.SourceDocumentID=685 AND g.Description LIKE '%Finishing Booth Upgrade And Air Handling Retrofit%')
ORDER BY g.PostingDate,g.VoucherNumber,g.GLEntryID;
```


```sql title="c07-debt.sql"
SELECT PaymentDate,
       BeginningPrincipal,
       PrincipalAmount,
       InterestAmount,
       PaymentAmount,
       EndingPrincipal,
       JournalEntryID
FROM DebtScheduleLine
WHERE DebtAgreementID=2 AND PaymentDate<='2026-12-31'
ORDER BY PaymentDate,DebtScheduleLineID;
```


</TabItem>
</ToolSteps>

**Worked check.** Asset cost is 280,000 and monthly depreciation 2,333.33. December’s asset-specific depreciation debits manufacturing cost clearing, not cash. The note-financing entry has no cash line. Q4 debt-2 payments total 16,396.26: principal 12,500.72 and interest 3,895.54. Principal reduces debt; interest is a separate expense/cash classification. The description-based depreciation excerpt is not a unique formal asset-to-ledger key.

<details>
<summary>Further queries and earlier case topics</summary>

<span id="optional-excel-follow-through"></span>

## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. They are optional references; both guided routes above are complete without them. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["financial-statement-bridge-case"]} helperText="Choose a reference after completing the guided investigation; verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Investigate Exceptions and Recommend Controls](audit-review-pack-case.md). Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
