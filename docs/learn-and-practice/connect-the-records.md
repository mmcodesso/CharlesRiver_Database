---
title: "3. Connect the Records"
description: "Use customer and item keys to add descriptions while preserving one row per order line."
sidebar_label: "3. Connect the Records"
pagination_prev: "learn-and-practice/read-an-order"
pagination_next: "learn-and-practice/source-to-ledger"
tutorial_number: 3
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 3. Connect the Records

<span id="context-and-problem"></span>

The operations planner needs a readable description of the order. An item identifier connects system records, while a product name helps the person preparing the goods understand the order. Connect the records while keeping the two order lines intact.

<span id="learning-objectives"></span>

**Your task.** Use customer and item keys to add descriptions while preserving one row per order line.

<TutorialFigure figureId="connect-the-records" />

## Before You Start

Finish [Read an Order](read-an-order.md).

<ToolSteps>
<TabItem value="excel">

Start `Lesson03.xlsx` in Excel and import `T9_SalesOrder` as `SalesOrderData`, `T10_SalesOrderLine` as `OrderLineData`, `T4_Customer` as `CustomerData`, and `T44_Item` as `ItemData`. Filter the two order tables to `SalesOrderID = 11` in Power Query before loading. Keep all customer and item rows.

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson03.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Match the Customer

The order stores a customer key. The customer table supplies the description. One selected order should match one customer row.

<ToolSteps>
<TabItem value="excel">

1. In `SalesOrderData`, add a column to the right named `CustomerName`.
2. In its first data cell, enter:

~~~text
=XLOOKUP([@CustomerID],CustomerData[CustomerID],CustomerData[CustomerName],"No match",0)
~~~

3. Press Enter. The table fills the calculated column. The final `0` requests an exact match.
4. Confirm the name matches Lesson 1. Never substitute an approximate match for an identifier.

</TabItem>
<TabItem value="sql">

`JOIN` puts matching records together. `so` and `c` are short aliases, and `ON` states which stored keys must match.

```sql title="l03-customer-join.sql"
SELECT so.SalesOrderID, so.CustomerID, c.CustomerName
FROM SalesOrder AS so
JOIN Customer AS c ON c.CustomerID = so.CustomerID
WHERE so.SalesOrderID = 11;
```


</TabItem>
</ToolSteps>

Expect **one order row**, with CustomerID **130** and **Jones, Richardson and Beard**. A name lookup does not prove the customer's balance.

## 2. Add Product Descriptions

Now start from order lines. The item master supplies the description associated with each selected line's `ItemID`.

<ToolSteps>
<TabItem value="excel">

Add an `ItemName` column to `OrderLineData` and enter:

~~~text
=XLOOKUP([@ItemID],ItemData[ItemID],ItemData[ItemName],"No match",0)
~~~

Add a `SupplyMode` column to `OrderLineData` and enter:

```text title="Excel — OrderLineData[SupplyMode]"
=XLOOKUP([@ItemID],ItemData[ItemID],ItemData[SupplyMode],"No match",0)
```

 Confirm that the table still has two lines and its line amounts still total 11,397.78. `XLOOKUP` is appropriate here because it returns one match and each item key identifies one item. It cannot retrieve all shipments for a line.

</TabItem>
<TabItem value="sql">

This query independently joins lines to items. It does not need the customer join to answer the product question.

```sql title="l03-item-join.sql"
SELECT sol.SalesOrderLineID, sol.ItemID, i.ItemName,
       i.SupplyMode, sol.LineTotal
FROM SalesOrderLine AS sol
JOIN Item AS i ON i.ItemID = sol.ItemID
WHERE sol.SalesOrderID = 11
ORDER BY sol.LineNumber;
```


</TabItem>
</ToolSteps>

Line **42** identifies item **234**, **Mason Desk Maple Natural 84 in**. Line **43** identifies item **222**, **Brookside Dining Table Oak Whitewash 72 in**. Both have supply mode **Manufactured**. Expect two rows and the same total as before the join.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the readable order-line result and its before/after row-count and amount checks. Explain the matching keys in one sentence. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

A lookup into a unique item key adds a description. A link to shipments can have several matches and must retain them. Do not use a first-match lookup to conceal a one-to-many relationship.

## Try One Change

Add `UnitOfMeasure` from the item table to the result. Does adding a descriptive column change the number of lines or their amounts?

<details>
<summary>Compare your reasoning</summary>

Both selected items have unit of measure Each. Adding this column should preserve two rows and 11,397.78. If rows multiply, inspect the key and uniqueness of the table being joined.

</details>

## Readiness Check: After Lesson 3

Show a partner or instructor your result **before** opening the next lesson. Explain what one row represents, why the item key is unique in the lookup table, and why the selected order still has two lines totaling 11,397.78. Point to the saved before/after counts. Explain why a first-match lookup would lose evidence if several shipments matched one line.

If you are studying alone, write the same explanation on `Notes` and compare it with the self-check below. Proceed when both your row and amount checks and your grain explanation agree. Use the [method rubric](pathname:///teaching/method-rubric.md) to identify anything that needs repair.

<details>
<summary>Check your readiness independently</summary>

The selected order still contains **two lines** totaling **11,397.78** after customer and item descriptions are added. `ItemID` must be unique in the Item lookup table, so each source line acquires one description without multiplying rows. Check that uniqueness rather than inferring it from a matching total.

Suppose one order line has two shipment matches. A first-match lookup returns only one shipment and hides the other. Retain both shipment rows for a line-level trace, or summarize shipments by order-line key before comparing shipped quantity with the order. Explain the changed grain and check quantities as well as match counts. This counterexample describes a relationship pattern, not an additional claim about the selected order.

</details>

If the row count or amount changes, inspect the joined table’s key and match count, then rerun the check. If your result matches but you cannot explain its grain, return to [Lesson 2](read-an-order.md) before continuing. Keep the check in the [blank evidence template](pathname:///teaching/evidence-template.md).

## Next Steps

Next, follow one line into records that describe events rather than master-data descriptions. Continue to [Follow a Goods Sale](source-to-ledger.md).
