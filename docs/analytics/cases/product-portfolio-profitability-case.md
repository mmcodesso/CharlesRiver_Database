---
title: "4. Choose a Product and Pricing Priority"
description: "Which product group deserves a focused review, and what evidence supports that priority?"
sidebar_label: "4. Choose a Product and Pricing Priority"
pagination_prev: "analytics/cases/p2p-accrual-settlement-case"
pagination_next: "analytics/cases/manufacturing-labor-cost-case"
case_number: 4
case_level: Intermediate
case_sessions: 3
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import CaseFigure from "@site/src/components/Cases/Figure";
import CaseMethods from "@site/src/components/Cases/Methods";
import { CaseOverview } from "@site/src/components/CaseExplorer";
import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# 4. Choose a Product and Pricing Priority

<span id="business-scenario"></span>
<span id="the-problem-to-solve"></span>
<span id="learning-objectives"></span>

Commercial leadership has time for one product review. The sales coordinator proposes looking at discounts; the controller asks whether product mix, cost assumptions, or delivery performance could explain the same pattern. Your job is to compare those explanations and recommend a bounded next investigation, not to declare a product group unprofitable from one percentage.

<CaseOverview slug="product-portfolio-profitability-case" />

**Worked scope.** Goods invoice lines dated January 1–March 31, 2024. Compare product groups using the same population. Credits are a separate credit-date population. Current product-master attributes and standard costs are descriptive reference data, not historical snapshots.

Choose Excel or SQL; your selection carries between lessons and cases.

**Preparation:** [3. Connect the Records](/docs/learn-and-practice/connect-the-records); [9. Follow Manufacturing Costs](/docs/learn-and-practice/manufacturing-cost-flow); [12. Turn Records into a Conclusion](/docs/learn-and-practice/turn-records-into-a-conclusion). Use the [Excel setup](../excel-guide.md) or [SQL setup](../sql-guide.md) for your chosen tool.

**Ready to begin:**

- Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.
- Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.
- Preserve invoice-line grain; state the limits of current standard costs and separately dated credits in historical comparisons.

## Key Data Sources

Each source below has a distinct row meaning. Import only the fields and populations requested in each stage. Working tables default to the source name plus Data unless a stage assigns a more specific name.

| Source | Published Excel Table | First working name |
|---|---|---|
| Item | T44_Item | ItemData |
| SalesInvoice | T16_SalesInvoice | SalesInvoiceData |
| SalesInvoiceLine | T17_SalesInvoiceLine | SalesInvoiceLineData |
| SalesOrder | T9_SalesOrder | SalesOrderData |
| SalesOrderLine | T10_SalesOrderLine | SalesOrderLineData |
| PriceOverrideApproval | T8_PriceOverrideApproval | PriceOverrideApprovalData |
| PromotionProgram | T7_PromotionProgram | PromotionProgramData |
| Shipment | T14_Shipment | ShipmentData |
| ShipmentLine | T15_ShipmentLine | ShipmentLineData |
| CreditMemo | T23_CreditMemo | CreditMemoData |
| CreditMemoLine | T24_CreditMemoLine | CreditMemoLineData |

<CaseMethods />

<span id="step-1-define-realized-pricing-against-list-price"></span>
<span id="step-2-explain-the-promotion-effect-on-revenue-and-gross-margin"></span>
<span id="step-1-define-the-portfolio-structure-in-the-item-master"></span>
<span id="step-2-check-whether-the-item-master-is-complete-enough-to-trust"></span>
<span id="step-1-define-the-portfolio-mix-you-are-evaluating"></span>
<span id="step-2-rank-the-portfolio-on-billed-sales-and-gross-margin"></span>

## Session 1 — Define a comparable product population

Create Case04.xlsx or Case04.sql. Write the measure before calculating it: invoiced line amounts before freight, tax, and credits. Keep quantities and dollars separate.

<CaseFigure figureId="case04-decision" />


### 1.1. Inspect classifications before grouping

**Predict before you run:** Will every blank collection name mean the same thing across item types?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Items ← Item (import here)`.

**Produced outputs:** `Items: unique item lookup`; `ItemClassification: ItemType PivotTable`.

1. Import Item as Items.

2. Create a PivotTable by ItemType with Count of ItemID.

3. Filter CollectionName blanks separately for each type.

4. Inspect IsActive, LifecycleStatus, LaunchDate, and ItemGroup.

5. Do not remove inactive items before selecting historical sales; current inactivity does not mean an item could not be sold in 2024.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c04-master.sql"
SELECT ItemType,
       COUNT(*) AS Items,
       SUM(CASE WHEN CollectionName IS NULL OR TRIM(CollectionName)='' THEN 1 ELSE 0 END) AS MissingCollection,
       SUM(CASE WHEN IsActive=0 THEN 1 ELSE 0 END) AS CurrentlyInactive
FROM Item
GROUP BY ItemType
ORDER BY ItemType;
```


</TabItem>
</ToolSteps>

**Checkpoint.** 219 Finished Good items, including 59 with a blank collection and 15 currently inactive. Other item types are Capex, Purchased Material, and Service.

Grouping by ItemGroup avoids silently dropping blank collections. A collection-level extension must retain an explicit Unclassified category and investigate why a classification is absent.

<details>
<summary>If your result differs</summary>

The exact goods label is Finished Good, including the space. A spelling mismatch can produce a plausible-looking empty analysis.

</details>

**Keep for the next stage:** Save the item-type counts and classification note.

### 1.2. Build the invoice-line dataset

**Predict before you run:** Why would summing invoice headers after joining lines overstate sales?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `Items (Session 1.1)`; `SalesInvoiceData ← SalesInvoice and SalesInvoiceLineData ← SalesInvoiceLine (import here)`.

**Produced outputs:** `QuarterInvoices: Q1 2024 invoice headers`; `ProductLines: finished-good invoice-line detail`; `InvoiceCounts: distinct SalesInvoiceID reference`.

1. Import SalesInvoice as SalesInvoiceData and SalesInvoiceLine as SalesInvoiceLineData; preserve both raw queries.

2. Reference SalesInvoiceData as QuarterInvoices and filter InvoiceDate from January 1 through March 31, 2024.

3. Reference SalesInvoiceLineData as ProductLines and Inner merge to QuarterInvoices on SalesInvoiceID; expand InvoiceDate only.

4. Merge Items on ItemID, expand ItemType, ItemGroup, and StandardCost.

5. Filter ItemType = Finished Good; load as ProductLines.

6. Keep SalesInvoiceLineID as the unique key.

7. Add ListValue to ProductLines:

    ~~~text title="Excel — ProductLines[ListValue]"
    =[@Quantity]*[@BaseListPrice]
    ~~~

8. Add CurrentStandardCost:

    ~~~text title="Excel — ProductLines[CurrentStandardCost]"
    =[@Quantity]*[@StandardCost]
    ~~~

9. Use a PivotTable for Count of SalesInvoiceLineID and sums of Quantity and LineTotal.

10. To count unique invoices, reference ProductLines as InvoiceCounts, keep SalesInvoiceID, remove duplicates, then count rows.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c04-population.sql"
SELECT COUNT(*) AS Lines,
       COUNT(DISTINCT i.SalesInvoiceID) AS Invoices,
       ROUND(SUM(l.Quantity),2) AS Quantity,
       ROUND(SUM(l.LineTotal),2) AS InvoicedLines
FROM SalesInvoiceLine l
JOIN SalesInvoice i ON i.SalesInvoiceID=l.SalesInvoiceID
JOIN Item p ON p.ItemID=l.ItemID
WHERE i.InvoiceDate>='2024-01-01' AND i.InvoiceDate<'2024-04-01' AND p.ItemType='Finished Good';
```


</TabItem>
</ToolSteps>

**Checkpoint.** 1,857 goods invoice lines across 1,322 invoices; quantity 15,301.69; line amounts 5,551,798.71.

These totals describe billed goods. Quantity spans different products and units, so the total is a completeness check rather than a useful physical output measure.

<details>
<summary>If your result differs</summary>

Do not include service lines or sum GrandTotal here. Preserve all qualifying lines even when current catalog fields are incomplete.

</details>

**Keep for the next stage:** Save ProductLines and the population check.

:::tip Session stopping point
Your population must reconcile before you rank product groups. Save the exact date and item-type filters.
:::

<span id="step-3-show-where-customer-specific-pricing-is-concentrated"></span>
<span id="step-4-measure-override-concentration-and-price-floor-pressure"></span>
<span id="step-3-test-whether-lifecycle-labels-and-active-status-align"></span>
<span id="step-4-connect-the-catalog-to-sales-and-portfolio-mix"></span>
<span id="step-3-test-whether-contribution-margin-changes-the-ranking"></span>
<span id="step-4-add-the-service-performance-lens"></span>

## Session 2 — Compare measures and inspect pricing

Weighted realization asks how much was billed relative to the list value of the same quantities. A simple average of line percentages gives small and large lines equal influence.

<CaseFigure figureId="case04-relationships" />


### 2.1. Calculate comparable group measures

**Predict before you run:** Could the largest dollar margin coexist with the lowest margin percentage?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ProductLines with ListValue and CurrentStandardCost (Session 1.2)`.

**Produced outputs:** `ProductReview: four ItemGroup rows with realization and standard-margin measures`; `StandardMarginChart`.

1. From ProductLines create a PivotTable: Rows = ItemGroup; Values = sums of LineTotal, ListValue, CurrentStandardCost, Quantity and Count of SalesInvoiceLineID.

2. Copy the four summary rows, excluding the grand total, into a table named ProductReview.

3. Name the amount columns LineTotal, ListValue, and CurrentStandardCost exactly, removing the PivotTable prefix Sum of.

4. Add Realization; an undefined ratio returns N/A for investigation:

    ~~~text title="Excel — ProductReview[Realization]"
    =IF([@ListValue]=0,NA(),[@LineTotal]/[@ListValue])
    ~~~

5. Add StandardMargin:

    ~~~text title="Excel — ProductReview[StandardMargin]"
    =[@LineTotal]-[@CurrentStandardCost]
    ~~~

6. Add StandardMarginPct:

    ~~~text title="Excel — ProductReview[StandardMarginPct]"
    =IF([@LineTotal]=0,NA(),[@StandardMargin]/[@LineTotal])
    ~~~

7. Format ratios as percentages.

8. Sort once by StandardMarginPct ascending, then compare a separate ranking by StandardMargin descending.

9. Create a horizontal bar chart of StandardMarginPct from these four rows.

</TabItem>
<TabItem value="sql">

Each group uses sums from the same invoice-line population. RealizationPct is a ratio of dollar totals, not an average of percentages. NULLIF leaves a zero-denominator ratio unavailable. CurrentStandardCost uses the current master reference explicitly.

Run each complete statement separately and retain its result before continuing.
```sql title="c04-comparison.sql"
SELECT p.ItemGroup,
       COUNT(*) AS Lines,
       ROUND(SUM(l.Quantity),2) AS Quantity,
       ROUND(SUM(l.LineTotal),2) AS InvoicedLines,
       ROUND(SUM(l.Quantity*l.BaseListPrice),2) AS ListValue,
       ROUND(SUM(l.Quantity*p.StandardCost),2) AS CurrentStandardCost,
       ROUND(100.0*SUM(l.LineTotal)/NULLIF(SUM(l.Quantity*l.BaseListPrice),0),2) AS RealizationPct,
       ROUND(SUM(l.LineTotal-l.Quantity*p.StandardCost),2) AS StandardMargin,
       ROUND(100.0*SUM(l.LineTotal-l.Quantity*p.StandardCost)/NULLIF(SUM(l.LineTotal),0),2) AS StandardMarginPct
FROM SalesInvoiceLine l
JOIN SalesInvoice i ON i.SalesInvoiceID=l.SalesInvoiceID
JOIN Item p ON p.ItemID=l.ItemID
WHERE i.InvoiceDate>='2024-01-01' AND i.InvoiceDate<'2024-04-01' AND p.ItemType='Finished Good'
GROUP BY p.ItemGroup
ORDER BY StandardMarginPct,p.ItemGroup;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Furniture has 3,181,389.89 in billed lines and 1,395,078.58 of standard-cost margin, the largest dollar margin. Its 43.85% margin rate is the lowest. Realization ranges from 88.92% for Textiles to 89.29% for Lighting.

The narrow realization range does not by itself explain the much wider margin-rate range. Product mix and current standard-cost assumptions deserve investigation alongside pricing. This comparison is not posted gross profit.

<details>
<summary>If your result differs</summary>

Calculate the ratio of summed dollars. Do not average line percentages or mistake StandardConversionCost for a component to add again to total StandardCost.

</details>

**Keep for the next stage:** Save both rankings and the chart, with the current-standard-cost label visible.

### 2.2. Read an override and a promotion

**Predict before you run:** Does a discounted line necessarily lack commercial approval?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ProductLines (Session 1.2)`; `Overrides ← PriceOverrideApproval and Promotions ← PromotionProgram (import here)`; `SalesOrderLineData ← SalesOrderLine and SalesOrderData ← SalesOrder (import here)`.

**Produced outputs:** `ProductLines: approval and order-date lookup columns`; `Review: separately scoped override and promotion evidence`.

1. Import PriceOverrideApproval as Overrides, PromotionProgram as Promotions, SalesOrderLine as SalesOrderLineData, and SalesOrder as SalesOrderData.

2. In ProductLines filter nonblank PriceOverrideApprovalID, sort InvoiceDate and SalesInvoiceLineID, and inspect the first 12 lines.

3. For line 69 inspect approval ID 9.

4. Add ApprovedUnitPrice using the unique approval key:

    ~~~text title="Excel — ProductLines[ApprovedUnitPrice]"
    =IF([@PriceOverrideApprovalID]="","",XLOOKUP([@PriceOverrideApprovalID],Overrides[PriceOverrideApprovalID],Overrides[ApprovedUnitPrice],"No match",0))
    ~~~

5. Add OverrideApprovedDate and format as a date:

    ~~~text title="Excel — ProductLines[OverrideApprovedDate]"
    =IF([@PriceOverrideApprovalID]="","",XLOOKUP([@PriceOverrideApprovalID],Overrides[PriceOverrideApprovalID],Overrides[ApprovedDate],"No match",0))
    ~~~

6. Add OverrideReason:

    ~~~text title="Excel — ProductLines[OverrideReason]"
    =IF([@PriceOverrideApprovalID]="","",XLOOKUP([@PriceOverrideApprovalID],Overrides[PriceOverrideApprovalID],Overrides[ReasonCode],"No match",0))
    ~~~

7. Add SalesOrderID through the order-line relationship:

    ~~~text title="Excel — ProductLines[SalesOrderID]"
    =XLOOKUP([@SalesOrderLineID],SalesOrderLineData[SalesOrderLineID],SalesOrderLineData[SalesOrderID],"No match",0)
    ~~~

8. Add OrderDate and format it as a date:

    ~~~text title="Excel — ProductLines[OrderDate]"
    =XLOOKUP([@SalesOrderID],SalesOrderData[SalesOrderID],SalesOrderData[OrderDate],"No match",0)
    ~~~

9. Resolve any No match before comparing UnitPrice, approved price, approval date, and order date.

10. Separately select invoice line 1548 and promotion ID 1.

11. Inspect the promotion’s effective dates and scope fields; evaluate applicability at the commercial event, not simply the invoice date.

</TabItem>
<TabItem value="sql">

Run each statement separately in the SQL editor. Save its text and result with the stage title. Read the result at the grain described in the question; compare the checkpoint before continuing.
```sql title="c04-pricing.sql"
SELECT l.SalesInvoiceLineID,
       l.SalesOrderLineID,
       i.InvoiceDate,
       p.ItemGroup,
       l.ItemID,
       l.Quantity,
       l.BaseListPrice,
       l.UnitPrice,
       l.Discount,
       l.LineTotal,
       l.PricingMethod,
       l.PriceListLineID,
       l.PromotionID,
       l.PriceOverrideApprovalID
FROM SalesInvoiceLine l
JOIN SalesInvoice i ON i.SalesInvoiceID=l.SalesInvoiceID
JOIN Item p ON p.ItemID=l.ItemID
WHERE i.InvoiceDate>='2024-01-01' AND i.InvoiceDate<'2024-04-01' AND p.ItemType='Finished Good' AND (l.PromotionID IS NOT NULL OR l.PriceOverrideApprovalID IS NOT NULL)
ORDER BY i.InvoiceDate,l.SalesInvoiceLineID LIMIT 12;
```


```sql title="c04-override.sql"
SELECT PriceOverrideApprovalID,
       SalesOrderLineID,
       RequestDate,
       ApprovedDate,
       ReferenceUnitPrice,
       RequestedUnitPrice,
       ApprovedUnitPrice,
       ReasonCode,
       Status
FROM PriceOverrideApproval
WHERE PriceOverrideApprovalID IN (SELECT l.PriceOverrideApprovalID
FROM SalesInvoiceLine l
JOIN SalesInvoice i ON i.SalesInvoiceID=l.SalesInvoiceID
WHERE i.InvoiceDate>='2024-01-01' AND i.InvoiceDate<'2024-04-01' AND l.PriceOverrideApprovalID IS NOT NULL)
ORDER BY PriceOverrideApprovalID LIMIT 12;
```


```sql title="c04-promotion.sql"
SELECT l.SalesInvoiceLineID,
       o.OrderDate,
       i.InvoiceDate,
       l.PromotionID,
       p.PromotionName,
       p.ScopeType,
       p.CustomerSegment,
       p.ItemGroup,
       p.CollectionName,
       p.DiscountPct,
       p.EffectiveStartDate,
       p.EffectiveEndDate,
       l.LineTotal
FROM SalesInvoiceLine l
JOIN SalesInvoice i ON i.SalesInvoiceID=l.SalesInvoiceID
JOIN SalesOrderLine ol ON ol.SalesOrderLineID=l.SalesOrderLineID
JOIN SalesOrder o ON o.SalesOrderID=ol.SalesOrderID
JOIN PromotionProgram p ON p.PromotionID=l.PromotionID
WHERE l.SalesInvoiceLineID=1548
ORDER BY l.SalesInvoiceLineID;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Line 69 carries approval 9; approved price 417.96 agrees with its unit price and approval date January 10. Line 1548 links promotion 1, whose recorded effective dates are March 1–March 1, while its order is dated March 11. That is a date-support exception requiring follow-up; the invoice is dated March 19.

An approval explains authorization, not whether the discount was commercially successful. A promoted line and a non-promoted line can differ in product, customer, volume, and date. A causal promotion-effect claim needs more evidence. For promotion 1, ask for the intended effective period and supporting approval rather than assuming the recorded date range was valid.

<details>
<summary>If your result differs</summary>

Use the stored pricing IDs. A text label such as Approved Override is not a substitute for reading its linked record.

</details>

**Keep for the next stage:** Keep two pricing evidence rows with the criterion tested and the result.

:::tip Session stopping point
Save the group comparison and two source traces. Draft one explanation the evidence supports and one alternative it does not rule out.
:::

<span id="step-5-extend-the-case-into-governance-follow-up"></span>
<span id="step-5-extend-the-case-into-lifecycle-exception-follow-up"></span>
<span id="step-5-add-return-and-refund-pressure-to-finalize-the-portfolio-view"></span>

## Session 3 — Test competing explanations and decide

Return to the commercial request. A single ranking can hide different problems. Use delivery and credit evidence as additional perspectives with their own denominators.

<CaseFigure figureId="case04-measures" />


### 3.1. Add delivery and credit evidence

**Predict before you run:** Can a credit issued this quarter relate to an older invoice?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ProductLines, SalesOrderLineData, SalesOrderData, and Items (earlier stages)`; `ShipmentLineData ← ShipmentLine and ShipmentData ← Shipment (import here)`; `CreditMemoLineData ← CreditMemoLine and CreditMemoData ← CreditMemo (import here)`.

**Produced outputs:** `DeliveryDetail: retained invoice-line delivery comparisons`; `DeliveryReview: ItemGroup summary`; `CreditReview: separately dated credit summary`.

1. Import ShipmentLine as ShipmentLineData and Shipment as ShipmentData.

2. In Power Query reference ProductLines as DeliveryDetail, then Left outer merge ShipmentLineData on ShipmentLineID and ShipmentData on ShipmentID to obtain DeliveryDate.

3. Merge SalesOrderLineData on SalesOrderLineID and SalesOrderData on SalesOrderID to obtain RequestedDeliveryDate.

4. In Power Query use Add Column → Custom Column to add MissingDeliveryDate:

    ~~~text title="Power Query — Delivery summary / MissingDeliveryDate"
    if [DeliveryDate] = null then 1 else 0
    ~~~

5. Add DeliveredAfterRequested with the expression below; missing dates cannot establish lateness:

    ~~~text title="Power Query — Delivery summary / DeliveredAfterRequested"
    if [DeliveryDate] = null or [RequestedDeliveryDate] = null then 0 else if [DeliveryDate] > [RequestedDeliveryDate] then 1 else 0
    ~~~

6. Reference DeliveryDetail as DeliveryReview and group by ItemGroup to count lines and sum those flags; load DeliveryReview.

7. Separately import CreditMemoLine as CreditMemoLineData and CreditMemo as CreditMemoData.

8. Reference CreditMemoLineData as CreditReview, merge CreditMemoData, filter CreditMemoDate January 1–March 31, 2024, merge Items, retain Finished Good, and group by ItemGroup with Count of CreditMemoLineID and Sum of LineTotal.

9. Load as CreditReview.

</TabItem>
<TabItem value="sql">

ShipmentLineID identifies the shipment supporting each billed line. The counts therefore describe invoice lines, not distinct customers or orders. A separate CASE retains the missing-delivery-date count.

Run each complete statement separately and retain its result before continuing.
```sql title="c04-service.sql"
SELECT p.ItemGroup,
       COUNT(*) AS InvoiceLines,
       SUM(CASE WHEN s.DeliveryDate IS NULL THEN 1 ELSE 0 END) AS NoDeliveryDate,
       SUM(CASE WHEN s.DeliveryDate>o.RequestedDeliveryDate THEN 1 ELSE 0 END) AS LinesDeliveredAfterRequested
FROM SalesInvoiceLine l
JOIN SalesInvoice i ON i.SalesInvoiceID=l.SalesInvoiceID
JOIN Item p ON p.ItemID=l.ItemID
JOIN SalesOrderLine ol ON ol.SalesOrderLineID=l.SalesOrderLineID
JOIN SalesOrder o ON o.SalesOrderID=ol.SalesOrderID
LEFT JOIN ShipmentLine sl ON sl.ShipmentLineID=l.ShipmentLineID
LEFT JOIN Shipment s ON s.ShipmentID=sl.ShipmentID
WHERE i.InvoiceDate>='2024-01-01' AND i.InvoiceDate<'2024-04-01' AND p.ItemType='Finished Good'
GROUP BY p.ItemGroup
ORDER BY p.ItemGroup;
```


```sql title="c04-credits.sql"
SELECT p.ItemGroup,
       COUNT(*) AS CreditLines,
       ROUND(SUM(l.LineTotal),2) AS CreditedLines
FROM CreditMemoLine l
JOIN CreditMemo c ON c.CreditMemoID=l.CreditMemoID
JOIN Item p ON p.ItemID=l.ItemID
WHERE c.CreditMemoDate>='2024-01-01' AND c.CreditMemoDate<'2024-04-01' AND p.ItemType='Finished Good'
GROUP BY p.ItemGroup
ORDER BY p.ItemGroup;
```


</TabItem>
</ToolSteps>

**Checkpoint.** Furniture has 340 of 646 invoice lines linked to delivery after the requested date. All four groups have populated delivery dates. Furniture credit-date line amounts total 8,926.95; Textiles total 5,878.96.

The delivery denominator is invoice lines, not unique orders or customers. The credits are dated in the quarter but are not guaranteed to originate from this quarter’s invoices. Do not subtract these amounts and call the result cohort net revenue.

<details>
<summary>If your result differs</summary>

Joining invoice lines through an order alone can attach every shipment on that order. Use ShipmentLineID for the actual billed shipment link.

</details>

**Keep for the next stage:** Save the two separately labeled comparisons.

### 3.2. Recommend one bounded review

**Predict before you run:** Which priority survives when you consider scale, rates, and evidence limits?

<ToolSteps>
<TabItem value="excel">

**Named inputs:** `ProductReview, DeliveryReview, and CreditReview (earlier stages)`.

**Produced outputs:** `Review: four group comparisons and bounded recommendation`.

1. Create a Review table with four rows, one per ItemGroup.

2. Link the verified billed amounts, standard margin dollars/rate, realization rate, late-delivery line count/denominator, and separately dated credits.

3. Add text columns CompetingExplanation, EvidenceToRequest, ActionOwner, and NextReviewDate.

4. Do not blend these measures into an arbitrary score.

5. In your memo compare Furniture with one other group and state what would change your recommendation.

</TabItem>
<TabItem value="sql">

Use the saved result tables from the preceding stages to construct this comparison and written interpretation. Retain the query names, filters, source keys, and amounts in your case notes. An ordered result table can communicate the comparison without making a chart or switching tools.

</TabItem>
</ToolSteps>

**Checkpoint.** The worked evidence supports Furniture as a reasonable review priority because of its scale, lower standard margin rate, and delivery follow-up volume. It does not establish that discounts caused poor performance.

A defensible alternative priority is acceptable when it explains the tradeoff. The decision should specify a testable next step, such as inspecting a product subset’s cost assumptions and delivery causes, rather than recommending an across-the-board price rise.

<details>
<summary>If your result differs</summary>

Keep the conclusion within the measures. Current classifications, standard costs, and invoice-line delivery counts cannot establish complete historical product profitability.

</details>

**Keep for the next stage:** Save a 400–500 word memo and the comparison table. Include one source example and one uncertainty.

:::tip Session stopping point
A reviewer should be able to trace the priority to the table, the table to the population, and the population to the source records.
:::

<CaseFigure figureId="case04-conclusion" />

<span id="required-student-output"></span>
<span id="wrap-up-questions"></span>
<span id="limitations-and-judgment"></span>

## Prepare the Decision

Furniture merits a focused review in the worked analysis, but the first action should diagnose cost assumptions, product mix, and delivery performance alongside pricing. Similar realization rates across groups weaken a simple discount-only explanation. The recommendation remains provisional because current standard costs are not a complete historical cost-of-sales measure.

**Deliverable:** A product comparison, selected pricing evidence, a simple analytical chart, and a recommendation memo. Include the source file, selection dates, source IDs, measure definitions, checks, evidence limitations, and the next action. A chart is optional in the SQL route; a clearly ordered result table can support the same conclusion.

## Independent Challenge

Repeat for April–June 2024. Keep the measure definitions unchanged. Defend whether the priority should change, and identify one result that would reverse your recommendation after source follow-up.

<details>
<summary>Planning hint</summary>

Use the same invoice-date population for the main comparison and a separately labeled credit-date population. Retain blank classifications and inspect the actual pricing links.

</details>

**Assessment criteria:** Assess comparable populations, weighted ratios, cost labels, source tracing, alternative explanations, and a proportionate recommendation. Your instructor evaluates the method, evidence, and reasoning; there is no public model answer for this challenge.

<details>
<summary>Further queries and earlier case topics</summary>

<span id="optional-excel-follow-through"></span>

## Recommended Query Sequence

These canonical queries extend the investigation. Their populations, dates, and measures may differ from the worked case, so read their definitions before comparing results. They are optional references; both guided routes above are complete without them. Earlier specialist topics consolidated into this case remain accessible through this reference sequence.

<QuerySequence items={caseQuerySequences["product-portfolio-profitability-case"]} helperText="Choose a reference after completing the guided investigation; verify its scope before comparing totals." />

</details>

## Next Steps

Continue to [Explain Production Cost and Delivery Pressure](manufacturing-labor-cost-case.md). Keep your completed evidence and use the [Query Library](../analysis-tracks.md) for a separate extension.
