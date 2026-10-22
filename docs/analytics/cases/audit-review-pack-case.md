---
title: "8. Investigate Exceptions and Recommend Controls"
description: "Which query flags become supported findings, and what control could be assessed?"
sidebar_label: "8. Investigate Exceptions and Recommend Controls"
pagination_prev: "analytics/cases/financial-statement-bridge-case"
pagination_next: "analytics/index"
case_number: 8
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

# 8. Investigate Exceptions and Recommend Controls

<span id="business-scenario"></span>
<span id="the-problem-to-solve"></span>
<span id="learning-objectives"></span>

The controller requests a focused controls review. Investigate alternative explanations for each flag before deciding what the evidence establishes. You will examine repeated supplier references and overtime approval support, then recommend controls with a clear owner, procedure, and assessment method.

<CaseOverview slug="audit-review-pack-case" />

**Worked scope.** Duplicate supplier invoice and check references across the entire recorded history, plus approved overtime entries with positive overtime dated October 1–December 31, 2026. These populations have different denominators. The review uses source records, not instructor anomaly labels or the support workbook.

Choose Excel or SQL. The site retains your selection between lessons and cases.

**Preparation:** [Complete one earlier process case](/docs/analytics/cases), [BPMN Process and Internal Control Workshop](/docs/learn-and-practice/bpmn-controls-workshop) (recommended). Use the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) for your chosen tool.

**Ready to begin:**

- Complete your chosen Excel or SQL setup. Preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.
- Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.
- Define an explicit criterion and denominator, distinguishing time entries from people and an exception flag from a proven control failure.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| PurchaseInvoice | T37_PurchaseInvoice | PurchaseInvoiceData |
| PurchaseInvoiceLine | T38_PurchaseInvoiceLine | PurchaseInvoiceLineData |
| DisbursementPayment | T39_DisbursementPayment | DisbursementPaymentData |
| TimeClockEntry | T66_TimeClockEntry | TimeClockEntryData |
| OvertimeApproval | T65_OvertimeApproval | OvertimeApprovalData |
| PayrollRegister | T69_PayrollRegister | PayrollRegisterData |
| PayrollPayment | T71_PayrollPayment | PayrollPaymentData |

<CaseMethods />

<span id="step-1-test-schedule-and-punch-linkage"></span>
<span id="step-2-inspect-raw-punch-integrity"></span>
<span id="step-1-build-the-starter-exception-map"></span>
<span id="step-2-trace-the-manufacturing-audit-seed-from-summary-to-detail"></span>
<span id="step-1-establish-the-workforce-population-and-status-baseline"></span>
<span id="step-2-test-post-termination-downstream-activity"></span>
<span id="step-1-test-price-list-validity-and-overlap"></span>
<span id="step-2-test-promotion-scope-and-date-compliance"></span>
<span id="step-1-test-forecast-approval-and-override-governance"></span>
<span id="step-2-review-inventory-policy-coverage"></span>

## Session 1 — Define risks, criteria, and evidence

Create Case08.xlsx or Case08.sql and a Review note. Use four conclusion categories: supported exception, explained timing or valid circumstance, unresolved evidence, and no exception under the stated test. A query flag is the starting point.

<CaseFigure figureId="case08-risk" />


### 1.1. Specify two review criteria

**Predict before you run:** Could the same number of flags mean different things in different populations?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `PurchaseInvoiceData ← PurchaseInvoice and DisbursementPaymentData ← DisbursementPayment (import here; full populations retained)`, `TimeClockEntryData ← TimeClockEntry (import here; raw query retained)`.

**Produced outputs:** `CheckPayments: nonblank check references only`, `Overtime: Q4 2026 approved entries with positive overtime`, `Review: separate population counts and criteria`.

1. Import PurchaseInvoice as PurchaseInvoiceData without a date filter.

2. Import DisbursementPayment as DisbursementPaymentData without removing rows; retain both complete raw queries.

3. Create a Reference named CheckPayments, filter CheckNumber not blank, and load that reference for the check-reference test.

4. Keep the original query available for invoice payment investigations.

5. Import TimeClockEntry as TimeClockEntryData; preserve the raw query and reference it as Overtime, filtered WorkDate October 1–December 31, 2026, ClockStatus Approved, and OvertimeHours greater than zero.

6. Load the last selection as Overtime.

7. On Review label B2 Invoice documents, B3 Payments with a check reference, and B4 Approved overtime records.

8. Enter the counts:

    ~~~text title="Excel — Review!B2"
    =ROWS(PurchaseInvoiceData[PurchaseInvoiceID])
    ~~~

    ~~~text title="Excel — Review!B3"
    =ROWS(CheckPayments[DisbursementID])
    ~~~

    ~~~text title="Excel — Review!B4"
    =ROWS(Overtime[TimeClockEntryID])
    ~~~

9. For the invoice test define a repeated reference as the same SupplierID and exact InvoiceNumber occurring more than once; for checks use SupplierID and nonblank CheckNumber.

10. For overtime, first test missing linked approval or hours above linked ApprovedHours.

11. Treat identity, status, and timing as further evidence checks.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question and compare the checkpoint before continuing.
```sql title="c08-populations.sql"
SELECT 'Supplier invoices: released history' AS Population,
       COUNT(*) AS Documents
FROM PurchaseInvoice
UNION ALL SELECT 'Payments with nonblank check reference: released history',
       COUNT(*)
FROM DisbursementPayment
WHERE CheckNumber IS NOT NULL AND TRIM(CheckNumber)<>''
UNION ALL SELECT 'Approved overtime entries: Q4 2026',
       COUNT(*)
FROM TimeClockEntry
WHERE WorkDate>='2026-10-01' AND WorkDate<'2027-01-01' AND ClockStatus='Approved' AND OvertimeHours>0
ORDER BY Population;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 40,204 supplier invoices; 12,130 payments with a nonblank check reference; 1,895 approved positive-overtime entries in Q4 2026.

The tests do not cover every AP or payroll risk. Note that exact reference matching misses differently formatted duplicates before interpreting a zero or low rate.

<details>
<summary>If your result differs</summary>

Do not filter AP to Q4 simply to match overtime dates. The worked duplicate-reference evidence is across recorded history.

</details>

**Keep for the next stage:** Save a scope sheet with risks, criteria, exclusions, denominators, and expected evidence.

:::tip Session stopping point
Save the scope and criteria before viewing flags. This prevents the results from silently redefining the question.
:::

<span id="step-3-test-absence-against-worked-time-evidence"></span>
<span id="step-3-triage-master-data-and-ownership-controls"></span>
<span id="step-3-isolate-stale-current-state-ownership"></span>
<span id="step-3-test-customer-specific-price-list-bypass"></span>
<span id="step-3-test-unsupported-replenishment-documents"></span>

## Session 2 — Investigate repeated AP references

A repeated reference may indicate a duplicate document, a reused reference, or a recording problem. Inspect the linked commercial evidence and payments before alleging duplicate payment.

<CaseFigure figureId="case08-ap" />


### 2.1. Find groups without multiplying documents

**Predict before you run:** Should the denominator count duplicate groups or document rows?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `PurchaseInvoiceData, DisbursementPaymentData, and CheckPayments (Session 1.1)`.

**Produced outputs:** `InvoiceGroups and CheckGroups: repeated document references`, `PaymentsByInvoice: independently summed payments`, `DuplicateInvoices and DuplicateChecks: document-level exception evidence`.

1. In Power Query Reference PurchaseInvoiceData as InvoiceGroups.

2. Group by SupplierID and InvoiceNumber; Count Rows as Occurrences; filter Occurrences greater than 1.

3. Reference InvoiceGroups as DuplicateInvoices and Inner merge to PurchaseInvoiceData on both keys; expand the document columns.

4. Separately reference CheckPayments as CheckGroups, group by SupplierID and CheckNumber, Count Rows as Occurrences, and retain counts greater than 1.

5. Reference CheckGroups as DuplicateChecks and Inner merge to CheckPayments on both keys; expand the document columns.

6. Reference DisbursementPaymentData as PaymentsByInvoice, group by PurchaseInvoiceID and Sum Amount as PaidAmount, then Left merge that unique-key summary to DuplicateInvoices.

7. Keep the grouped-key queries and full source queries available; load DuplicateInvoices and DuplicateChecks for inspection.

</TabItem>
<TabItem value="sql">

groups identifies exact supplier/reference pairs occurring more than once. Joining the group back retrieves each flagged document. The payment SUM is independent, so multiple payments cannot duplicate invoice values.

Blank references are excluded before grouping. The same supplier and CheckNumber must match. Retain both group counts and payment-row counts because they answer different questions.

Run each complete statement separately and retain its result before continuing.
```sql title="c08-duplicates.sql"
WITH groups AS (SELECT SupplierID,
       InvoiceNumber,
       COUNT(*) AS Occurrences
FROM PurchaseInvoice
GROUP BY SupplierID,InvoiceNumber
HAVING COUNT(*)>1) SELECT i.SupplierID,
       i.InvoiceNumber,
       i.PurchaseInvoiceID,
       i.InvoiceDate,
       i.GrandTotal,
       g.Occurrences,
       ROUND(COALESCE((SELECT SUM(p.Amount)
FROM DisbursementPayment p
WHERE p.PurchaseInvoiceID=i.PurchaseInvoiceID),0),2) AS Paid
FROM PurchaseInvoice i
JOIN groups g ON g.SupplierID=i.SupplierID AND g.InvoiceNumber=i.InvoiceNumber
ORDER BY i.SupplierID,i.InvoiceNumber,i.PurchaseInvoiceID;
```


```sql title="c08-checks.sql"
WITH groups AS (SELECT SupplierID,
       CheckNumber,
       COUNT(*) AS Occurrences
FROM DisbursementPayment
WHERE CheckNumber IS NOT NULL AND TRIM(CheckNumber)<>''
GROUP BY SupplierID,CheckNumber
HAVING COUNT(*)>1) SELECT p.SupplierID,
       p.CheckNumber,
       p.DisbursementID,
       p.PurchaseInvoiceID,
       p.PaymentDate,
       p.Amount,
       p.ClearedDate,
       g.Occurrences
FROM DisbursementPayment p
JOIN groups g ON g.SupplierID=p.SupplierID AND g.CheckNumber=p.CheckNumber
ORDER BY p.SupplierID,p.CheckNumber,p.DisbursementID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Six invoice-reference groups contain 12 invoice rows. Two check-reference groups contain four payment rows. The first invoice pair is supplier 1, reference V0001-2024-000028, invoice IDs 28 and 44.

Twelve flagged invoice rows and six groups are different counts. A percentage based on groups divided by document rows would mix units. Keep the invoice and payment flag rates separate.

<details>
<summary>If your result differs</summary>

Group within supplier. A reference repeated by two different suppliers is not the same test. Exclude blank check references explicitly.

</details>

**Keep for the next stage:** Save both group lists and all flagged document rows.

### 2.2. Follow the first invoice pair to receipts and payment

**Predict before you run:** Do invoices 28 and 44 represent the same goods and amount?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `PurchaseInvoiceLineData ← PurchaseInvoiceLine (import here)`, `DisbursementPaymentData (complete raw query from Session 1.1)`.

**Produced outputs:** `InvoicePairLines: invoices 28/44 line evidence`, `InvoicePairPayments: all-method payments for invoices 28/44`, `Review: separate invoice register rows`.

1. Import PurchaseInvoiceLine as PurchaseInvoiceLineData; reference it as InvoicePairLines and filter PurchaseInvoiceID 28 or 44.

2. Keep GoodsReceiptLineID, POLineID, ItemID, Quantity, and LineTotal.

3. Reference the original DisbursementPaymentData as InvoicePairPayments and filter to those same invoice IDs without the nonblank-check filter; these payments may use another method.

4. Compare document dates and amounts, receipt links, and payment IDs.

5. Retain a separate register row for each invoice.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question and compare the checkpoint before continuing.
```sql title="c08-invoice-detail.sql"
SELECT l.PurchaseInvoiceID,
       l.PILineID,
       l.GoodsReceiptLineID,
       l.POLineID,
       l.ItemID,
       l.Quantity,
       l.LineTotal
FROM PurchaseInvoiceLine l
WHERE l.PurchaseInvoiceID IN(28,44)
ORDER BY l.PurchaseInvoiceID,l.PILineID;
```


```sql title="c08-payment-detail.sql"
SELECT DisbursementID,
       PurchaseInvoiceID,
       PaymentDate,
       Amount,
       CheckNumber,
       ClearedDate
FROM DisbursementPayment
WHERE PurchaseInvoiceID IN(28,44)
ORDER BY PaymentDate,DisbursementID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Invoice 28 is 629.94 for item 220, receipt line 48; invoice 44 is 1,504.07 for item 193, receipt line 41. Payments 127 and 51 settle the different amounts on April 1 and March 23.

The repeated invoice reference is supported. The different amounts, items, and receipt links weaken the claim that these are duplicate economic transactions. The source data alone does not show the supplier’s original invoice images or a bank confirmation.

<details>
<summary>If your result differs</summary>

A paid status or matching reference cannot establish duplicate payment. Do not sum the pair and label it a proven loss.

</details>

**Keep for the next stage:** Write Workpaper A: criterion, flagged keys, source trail, alternative explanation, conclusion, missing evidence, and next action.

### 2.3. Investigate the repeated check example

**Predict before you run:** Does one repeated check reference establish that the bank paid twice?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `DuplicateChecks and PurchaseInvoiceData (earlier stages)`.

**Produced outputs:** `DuplicateChecks: invoice lookup columns`, `Review: SupplierID 1 / CHK0006076 evidence, separate from repeated-invoice criterion`.

1. In DuplicateChecks filter SupplierID 1 and CheckNumber CHK0006076.

2. Inspect DisbursementIDs 6076 and 6107, their PurchaseInvoiceIDs, PaymentDate, Amount, and ClearedDate.

3. Add InvoiceNumber to DuplicateChecks:

    ~~~text title="Excel — DuplicateChecks[InvoiceNumber]"
    =XLOOKUP([@PurchaseInvoiceID],PurchaseInvoiceData[PurchaseInvoiceID],PurchaseInvoiceData[InvoiceNumber],"No match",0)
    ~~~

4. Add InvoiceGrandTotal:

    ~~~text title="Excel — DuplicateChecks[InvoiceGrandTotal]"
    =XLOOKUP([@PurchaseInvoiceID],PurchaseInvoiceData[PurchaseInvoiceID],PurchaseInvoiceData[GrandTotal],"No match",0)
    ~~~

5. Compare with the invoice-reference workpaper, keeping the two criteria separate.

</TabItem>
<TabItem value="sql">

Return to c08-checks.sql. Read the two rows with CheckNumber CHK0006076 and compare their invoice IDs, dates, amounts, and cleared dates. Keep this check-reference investigation separate from the invoice-reference workpaper.

</TabItem>
</ToolSteps>

**Checkpoint.** The two payment rows refer to invoices 3101 and 4070, amounts 1,468.04 and 1,104.48, both dated January 1, 2025, with different cleared dates.

The repeated check reference warrants treasury/AP follow-up. Distinct payment rows and clearing fields still do not replace external banking evidence. Classify the reference exception as supported and the duplicate-cash-loss claim as unresolved.

<details>
<summary>If your result differs</summary>

Do not confuse CheckNumber with the unique DisbursementID.

</details>

**Keep for the next stage:** Retain the payment pair and specify the bank or supplier evidence needed.

:::tip Session stopping point
Save Workpaper A and both AP exception registers. Your conclusion must separate a confirmed reference problem from an unproven loss.
:::

<span id="step-4-review-overtime-approval-support"></span>
<span id="step-4-triage-workforce-control-exceptions"></span>
<span id="step-4-test-approval-role-design-and-authority-limits"></span>
<span id="step-4-review-below-floor-sales-without-approval"></span>
<span id="step-4-review-late-recommendation-conversion"></span>

## Session 3 — Investigate overtime approval support

Approved payroll time and a linked overtime approval are different records. A positive overtime amount can be approved for pay while its separate authorization link is missing.

<CaseFigure figureId="case08-overtime" />


### 3.1. Classify the hours test

**Predict before you run:** Why would an Inner join hide the very exception you want to inspect?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Overtime (Session 1.1)`, `Approvals ← OvertimeApproval (import here)`.

**Produced outputs:** `OvertimeReview: time-entry detail and approval match; HoursTest classification`, `HoursTestCounts: entry-count PivotTable`.

1. Import OvertimeApproval as Approvals.

2. In Power Query Left outer merge Overtime to Approvals on OvertimeApprovalID.

3. Expand the approval ID as MatchedApprovalID, ApprovedHours, ApprovedDate as OvertimeApprovedDate, and Status.

4. Keep the time record’s original ApprovedDate separately.

5. Load as OvertimeReview.

6. Add HoursTest:

    ~~~text title="Excel — OvertimeReview[HoursTest]"
    =IF([@MatchedApprovalID]="","Missing linked approval",IF([@ApprovedHours]<[@OvertimeHours],"Hours exceed approval","Hours supported"))
    ~~~

7. Create a PivotTable with HoursTest in Rows and Count of TimeClockEntryID in Values.

8. Preserve zero approved hours as a real value.

</TabItem>
<TabItem value="sql">

LEFT JOIN retains missing approvals. CASE applies the hours-support criteria in order: no linked record, insufficient approved hours, then hours supported. The WHERE clause fixes the eligible quarter, approved clock status, and positive overtime denominator.

Run each complete statement separately and retain its result before continuing.
```sql title="c08-overtime.sql"
SELECT t.TimeClockEntryID,
       t.EmployeeID,
       t.PayrollPeriodID,
       t.WorkDate,
       t.OvertimeHours,
       t.OvertimeApprovalID,
       a.ApprovedHours,
       a.ApprovedDate,
       a.Status,
       CASE WHEN a.OvertimeApprovalID IS NULL THEN 'Missing linked approval' WHEN a.ApprovedHours<t.OvertimeHours THEN 'Hours exceed approval' ELSE 'Hours supported' END AS HoursTest
FROM TimeClockEntry t
LEFT JOIN OvertimeApproval a ON a.OvertimeApprovalID=t.OvertimeApprovalID
WHERE t.WorkDate>='2026-10-01' AND t.WorkDate<'2027-01-01' AND t.ClockStatus='Approved' AND t.OvertimeHours>0
ORDER BY t.WorkDate,t.TimeClockEntryID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 1,895 eligible time entries: 336 missing linked approval, zero with hours exceeding a linked approval, and 1,559 with hours supported. The missing-link rate is 17.73% of eligible entries.

These 336 time entries lack a linked approval record under this test; this does not establish that the associated employees lacked authorization outside the file. The 1,559 hours-supported rows still need identity, status, and date checks for a fuller authorization conclusion.

<details>
<summary>If your result differs</summary>

Keep null matches. A zero-row exception list after an Inner join is not evidence of effective control.

</details>

**Keep for the next stage:** Save the complete classification and the flagged subset with stable IDs.

### 3.2. Compare a flag with an hours-supported record

**Predict before you run:** What does the comparison reveal about the limits of the first test?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `OvertimeReview and Approvals (Session 3.1)`.

**Produced outputs:** `OvertimeReview: additional approval-identity/date fields`, `Review: selected missing-link and hours-supported evidence`.

1. Filter OvertimeReview to TimeClockEntryIDs 49436 and 49581.

2. Return to the merge expansion and add EmployeeID as ApprovalEmployeeID, PayrollPeriodID as ApprovalPeriodID, and WorkDate as ApprovalWorkDate from Approvals, keeping time-record values beside them.

3. Compare employee, period, work date, status, and approval date.

4. For the flagged record, retain blank approval fields and request supporting evidence rather than filling them from a nearby employee or day.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question and compare the checkpoint before continuing.
```sql title="c08-compare.sql"
SELECT t.TimeClockEntryID,
       t.EmployeeID,
       t.PayrollPeriodID,
       t.WorkDate,
       t.OvertimeHours,
       t.ApprovedDate AS TimeApprovedDate,
       t.OvertimeApprovalID,
       a.EmployeeID AS ApprovalEmployeeID,
       a.PayrollPeriodID AS ApprovalPeriodID,
       a.WorkDate AS ApprovalWorkDate,
       a.ApprovedHours,
       a.ApprovedDate AS OvertimeApprovedDate,
       a.Status
FROM TimeClockEntry t
LEFT JOIN OvertimeApproval a ON a.OvertimeApprovalID=t.OvertimeApprovalID
WHERE t.TimeClockEntryID IN(49436,49581)
ORDER BY t.TimeClockEntryID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Entry 49436 is employee 17’s 4.50 overtime hours on October 1, linked to approval 16587 for 4.50 hours. Entry 49581 is employee 18’s 0.34 overtime hours on October 5 with no linked overtime approval.

The comparison supports a missing-link finding for 49581 under this review’s criterion. It does not prove the work was not performed, the employee was overpaid, or anyone acted dishonestly.

<details>
<summary>If your result differs</summary>

Do not use an anomaly label as evidence. Compare source fields and distinguish a missing record from a contradictory record.

</details>

**Keep for the next stage:** Write Workpaper B with the tested criterion, both records, the evidence gap, and a proposed follow-up.

:::tip Session stopping point
Save the overtime register and Workpaper B. State the denominator and the boundaries of the test in its conclusion.
:::

<span id="step-5-close-with-post-termination-roster-control"></span>
<span id="step-5-triage-planning-support-controls"></span>
<span id="step-5-close-with-workforce-control-exception-follow-up"></span>
<span id="step-5-close-with-override-approval-completeness"></span>
<span id="step-5-close-with-lifecycle-inconsistent-planning-activity"></span>

## Session 4 — Prioritize findings and design assessable controls

The final task is a reasoned recommendation. Count and amount can help prioritize follow-up, but frequency alone is not a measure of proven financial loss.

<CaseFigure figureId="case08-finding" />


### 4.1. Build a prioritized exception register

**Predict before you run:** Which issue warrants immediate evidence collection, and which warrants a process improvement?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Earlier AP/check/overtime workpapers with their separate populations`.

**Produced outputs:** `ExceptionRegister: bounded findings and follow-up priorities`.

1. Create an ExceptionRegister table with FindingID, Test, Population, SourceKeys, ObservedCondition, Evidence, AlternativeExplanation, ConclusionCategory, PotentialConsequence, Owner, and NextAction.

2. Enter the worked AP pair, repeated-check pair, and overtime comparison.

3. Keep potential consequences as hypotheses unless amounts are supported.

4. Rank follow-ups using urgency, plausible impact, and ease of obtaining decisive evidence; explain the ranking in prose rather than inventing a numeric risk score.

</TabItem>
<TabItem value="sql">

Use the saved result tables from the preceding stages to construct this comparison and written interpretation. Retain the query names, filters, source keys, and amounts in your case notes. An ordered result table can communicate the comparison without making a chart or switching tools.

</TabItem>
</ToolSteps>

**Checkpoint.** The worked evidence supports repeated references and missing approval links. It leaves duplicate economic loss and off-system authorization unresolved.

A reasonable priority is to obtain supplier/bank evidence for repeated payment references and restore verifiable overtime authorization links before claiming loss or misconduct. Other priorities are acceptable if they explain impact and uncertainty.

<details>
<summary>If your result differs</summary>

Do not combine the 336 overtime flags and 16 AP document flags into one overall exception rate.

</details>

**Keep for the next stage:** Save the exception register and a brief prioritization rationale.

### 4.2. Propose controls that can be tested

**Predict before you run:** What would a reviewer observe to determine whether your proposed control operated?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ExceptionRegister (Session 4.1)`.

**Produced outputs:** `ControlReview: proposed controls, test populations, procedures, and failure criteria`.

1. Create a ControlReview table with Risk, ProposedControl, Owner, Frequency, RetainedEvidence, PopulationForTesting, TestProcedure, and FailureCriterion.

2. For AP, propose checking supplier/reference uniqueness before posting, with documented review of legitimate repeated references.

3. For overtime, propose checking employee, period, date, approved hours, and approval status before payroll release, with an explicit late-approval escalation.

4. State these as proposed controls; the case has not established an existing company policy.

5. Include a retrospective sample test and a repeatable population query as complementary procedures.

</TabItem>
<TabItem value="sql">

Use the saved result tables from the preceding stages to construct this comparison and written interpretation. Retain the query names, filters, source keys, and amounts in your case notes. An ordered result table can communicate the comparison without making a chart or switching tools.

</TabItem>
</ToolSteps>

**Checkpoint.** An assessable recommendation identifies who performs the check, when it occurs, what evidence is retained, and what constitutes failure. A lower flag count alone is not sufficient: deleted or disconnected records could also reduce it.

For AP, inspect recorded review/override evidence for a sample of repeated references and verify all invoices remain in the population. For overtime, trace selected paid hours to valid approvals and inspect escalation evidence. Test both flagged and unflagged records.

<details>
<summary>If your result differs</summary>

A recommendation to “improve controls” is incomplete without an owner, evidence, and a criterion a reviewer can assess.

</details>

**Keep for the next stage:** Write a 600–800 word controls memo with two workpapers, priorities, proposed controls, and test procedures.

:::tip Session stopping point
Save both workpapers, the register, and controls memo. Your independent challenge begins with new evidence and no public model conclusion.
:::

<CaseFigure figureId="case08-assessment" />

<span id="required-student-output"></span>
<span id="wrap-up-questions"></span>
<span id="limitations-and-judgment"></span>

## Prepare the Decision

The worked review demonstrates why a flag is not a finding about fraud or financial loss. Repeated references and missing approval links are supported conditions whose economic consequences require additional evidence. Controls become useful recommendations when the owner, timing, evidence, test population, and failure criteria are explicit.

**Deliverable:** An exception register, two source-supported workpapers, and prioritized control recommendations. Include the source file, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A clearly ordered SQL result table can support the conclusion, with a chart added if useful.

## Independent Challenge

Investigate Q3 2026 overtime using the same eligibility and hours-support criteria. For AP, define a new review of supplier invoice references within 2025 and investigate any flagged groups, or document a clean result. Keep denominators distinct and justify your follow-up priorities.

<details>
<summary>Planning hint</summary>

A new population can produce fewer flags, different explanations, or no exceptions. Evaluate evidence completeness before treating a zero result as assurance. Preserve all eligible records when joining support.

</details>

**Assessment criteria:** Assess explicit criteria and denominators, source tracing, alternative explanations, proportionate conclusions, and controls that can be assessed without relying on anomaly labels. Your instructor evaluates the method, evidence, and reasoning. Model answers for this challenge remain in private course materials.

## Optional specialist investigations

Extend the same risk-to-evidence method to pricing, planning support, or employee authority. These are separate scopes, not extra flags to append to the core denominator.


<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Choose only one optional investigation and import its named source tables before use`, `Read the selected canonical query for exact source keys, dates, and population`.

**Produced outputs:** `SpecialistWorkpaper: chosen criterion, separate source detail, valid joins, and bounded conclusion`.

1. For pricing, relate SalesOrderLine to PriceOverrideApproval and effective price/promotion records.

2. For planning, relate WorkOrder or PurchaseRequisition to SupplyPlanRecommendation while retaining missing links.

3. For authority, compare the actor and approval date with the relevant employee-role evidence, distinguishing current assignments from historical authority.

4. Define a criterion and a population before loading detail; use the optional canonical queries below as maps of the available source fields.

</TabItem>
<TabItem value="sql">

Choose a specialist query from the optional sequence below. Define its criterion and population, then inspect the named source fields before interpreting any flag.

</TabItem>
</ToolSteps>

**Worked check.** Retain an evidence workpaper and state where the records cannot establish historical authorization. These extensions do not supply assessment model answers.

<details>
<summary>Further queries and earlier case topics</summary>

<span id="optional-excel-follow-through"></span>

## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. These optional references extend the complete guided routes above. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["audit-review-pack-case"]} helperText="Choose a reference after completing the guided investigation and verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Reports and Analytics](../index.md) to compare broader evidence. Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
