---
title: "1. Meet the Records"
description: "Recognize one customer record, its identifier, and its descriptive fields."
sidebar_label: "1. Meet the Records"
pagination_prev: "learn-and-practice/index"
pagination_next: "learn-and-practice/read-an-order"
tutorial_number: 1
toc_max_heading_level: 2
---

import ToolSteps from "@site/src/components/Tutorial/ToolSteps";
import TabItem from "@theme/TabItem";
import TutorialFigure from "@site/src/components/Tutorial/Figure";

# 1. Meet the Records

<span id="context-and-problem"></span>

The sales coordinator has a customer name on a request. Before discussing an order, you need to find the right customer and understand what its record can tell you. Start with one row, not a sales total.

<span id="learning-objectives"></span>

**Your task.** Recognize one customer record, its identifier, and its descriptive fields.

<TutorialFigure figureId="meet-the-records" />

## Before You Start

Complete [Set Up Excel](../analytics/excel-guide.md) or [Set Up SQL](../analytics/sql-guide.md). You need only the `Customer` table.

<ToolSteps>
<TabItem value="excel">

Use the `CustomerData` table imported during setup.

</TabItem>
<TabItem value="sql">

Open the SQLite database in your SQL tool. Save this lesson's statements as **Lesson01.sql**. Run each supplied query separately, using its filters to identify the records and dates for that step.

</TabItem>
</ToolSteps>


<span id="evidence-workflow"></span>

## 1. Find the Customer

A customer identifier is the stored link used by other records. A customer name is a description that helps a person recognize the organization.

<ToolSteps>
<TabItem value="excel">

1. Click inside `CustomerData` in your Lesson01 workbook.
2. Open the filter arrow on `CustomerID`. Clear **Select All**, select **130**, and choose **OK**.
3. Find `CustomerName`, `CustomerSegment`, and `City` on the same row. Scroll horizontally without losing the identifier.
4. On a separate sheet named `Notes`, write the identifier, name, and segment. Leave the source columns unchanged.

</TabItem>
<TabItem value="sql">

Copy the whole query into **Execute SQL**, then run it. `SELECT` names the columns to display, `FROM` names the table, and `WHERE` retains the matching customer.

```sql title="l01-customer.sql"
SELECT CustomerID, CustomerName, CustomerSegment, City
FROM Customer
WHERE CustomerID = 130;
```


</TabItem>
</ToolSteps>

You should find **one row**: CustomerID **130**, **Jones, Richardson and Beard**, segment **Design Trade**. This row describes the customer rather than an order or invoice.

## 2. Look at a Small Group

Now widen the question: which customers belong to the same segment? Sorting makes the result easier to inspect without changing the source records.

<ToolSteps>
<TabItem value="excel">

1. Clear the `CustomerID` filter.
2. Filter `CustomerSegment` to **Design Trade**.
3. Sort `CustomerName` **A to Z**. Review the first five names and compare `CustomerID` values when names match.
4. Keep this distinction in your notes: the filter selects a population, while the first five rows provide only a preview.

</TabItem>
<TabItem value="sql">

`ORDER BY` controls the displayed order. `LIMIT 5` keeps this first result small without changing the number of design-trade customers in the source.

```sql title="l01-segment-preview.sql"
SELECT CustomerID, CustomerName, CustomerSegment
FROM Customer
WHERE CustomerSegment = 'Design Trade'
ORDER BY CustomerName, CustomerID
LIMIT 5;
```


</TabItem>
</ToolSteps>

The first five names should be **Alvarez-Smith (45)**, **Atkins, Garrett and Smith (102)**, **Brown LLC (5)**, **Buck Group (210)**, and **Campbell, Martinez and Lucero (191)**. Keep `CustomerID` beside the name: it is the field you will use to follow records later.

<span id="assessed-deliverable"></span>

## Keep Your Evidence

Save the selected customer's identifier, name, and segment, plus one sentence describing the row. Add the first five sorted design-trade customers as a preview. Record the source file, selected keys, filters, and what one result row represents. Keep your workbook or saved SQL with your explanation.

<span id="interpretation-and-limitations"></span>

The customer master describes the customer. It does not establish how much that customer bought, paid, or owed at a past date. Those questions need dated transaction records.

## Try One Change

Find CustomerID **131** instead. Which part of your procedure changes, and which columns retain the same meaning?

<details>
<summary>Compare your reasoning</summary>

Change the identifier filter from 130 to 131. You still read one customer record. A different name or segment changes the description, not the meaning of `CustomerID` or the row's grain.

</details>

## Next Steps

The sales coordinator can now distinguish the customer from the transaction. Next, inspect an order. Continue to [Read an Order](read-an-order.md).
