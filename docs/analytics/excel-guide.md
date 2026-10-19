---
title: "Set Up Excel for the Tutorials"
description: "Import the released customer table into Microsoft 365 Excel, verify its rows, and prepare a separate tutorial workbook."
sidebar_label: "Set Up Excel"
pagination_prev: "learn-and-practice/index"
pagination_next: "learn-and-practice/meet-the-records"
---

# Set Up Excel

Your first goal is to open a small, understandable table. You will keep the published workbook as a source and build your own analysis in a separate file.

Use **Microsoft 365 desktop Excel**. The instructions below give the Windows menu path first and the Mac path where it differs. You do not need prior Power Query experience. Power Query is the import window that lets you choose tables and filters before bringing data into your workbook.

<span id="workbook-setup"></span>

<span id="recommended-excel-setup"></span>

## 1. Obtain the Source and Create Your Analysis File

Get the [Excel workbook from Downloads](../start-here/downloads.md). Wait for the download to finish, and retain the original source file.

Open Excel and create a **blank workbook**. Save it as **Lesson01.xlsx** in your own analysis folder. Keep the downloaded <FileName type="excel" /> as a separate source file. The lesson calculations and notes belong in Lesson01.

The released workbook is about **129 MB** and contains **82 formatted tables**, so allow time for its table list to appear. You will import only the tables a lesson specifies.

## 2. Import the Customer Table

1. In your blank workbook, choose **Data → Get Data → From File → From Excel Workbook** on Windows. On Mac, choose **Data → Get Data (Power Query)** and select **Excel workbook** as the source.
2. Browse to the downloaded <FileName type="excel" />.
3. In the Navigator, select **T4_Customer**, the formatted Excel Table. Selecting the worksheet named Customer as well would import the same records twice.
4. Choose **Transform Data** to open Power Query Editor. On Mac, the import dialog may first ask you to select the workbook and continue to its data preview.
5. In **Query Settings**, set the query name to **CustomerData**.
6. Confirm the first row contains field names such as CustomerID and CustomerName. Check the type icon beside CustomerID: choose **Whole Number** if necessary. Keep CustomerName and CustomerSegment as **Text**.
7. Choose **Home → Close & Load** to load the result into a worksheet as a table. On Windows, if a load-options dialog appears, choose **Table** and **New worksheet**.
8. Click inside the loaded table. On **Table Design** (or the **Table** tab on Mac), confirm its **Table Name** is **CustomerData**. Change that working-table name if Excel assigned another name.

An import query remembers where the source is and which steps you applied. It does not require you to write SQL or change the source workbook.

## 3. Check the Import

Create a sheet named **Notes**. In A1, type `Customer rows`. In B1, enter:

~~~text
=ROWS(CustomerData[CustomerID])
~~~

Expect **220** customer rows. The header is not a customer row. In the loaded table, open the CustomerID filter and find **130**. Its name should be **Jones, Richardson and Beard**, with segment **Design Trade**. Clear the filter after checking.

Record the source filename, imported table **T4_Customer**, working table **CustomerData**, and row count on Notes. Save Lesson01.xlsx.

**Ready check:** you can locate a named table, filter a key, read a row, and save your own working file. These are the prerequisites for [Meet the Records](../learn-and-practice/meet-the-records.md).

<span id="recommended-workflow-pattern"></span>

<span id="power-query-import-pattern"></span>

<span id="using-the-workbook"></span>

## Repeat an Import

Each later lesson lists its source-table names, working-table names, and filters. Start a new workbook for each lesson so a previous investigation's filters cannot silently change the next one.

Repeat the same **Get Data → workbook → table → Transform Data** procedure. In Power Query:

1. Give the query the working-table name specified by the lesson.
2. Set identifier columns to Whole Number, amounts/hours to Decimal Number, and date columns to Date.
3. Apply any required source filters with the column arrows. Two filters on different columns act together. For alternative IDs in one column, select both values, or use **Number Filters → Equals → Or → Equals**.
4. For dates, use **Date Filters → Custom Filter** and set both boundaries explicitly. For **March 2024**, use “on or after March 1, 2024” **and** “before April 1, 2024.” For **Q1 2024**, use “on or after January 1, 2024” **and** “before April 1, 2024.” Choose the period named in the lesson.
5. Close & Load, then confirm the loaded Excel Table name. Use that name in formulas.

For example, `T9_SalesOrder` is the exported table, `SalesOrder` is its source worksheet/database-table name, and `SalesOrderData` can be your local imported table. A formula referring to SalesOrderData works only after that table has been named accordingly.

The same date bounds apply in both tools:

| Named period | Power Query filter on a Date column | Equivalent SQL condition | Boundary check |
|---|---|---|---|
| March 2024 | On or after March 1, 2024 **and** before April 1, 2024 | `OrderDate >= '2024-03-01' AND OrderDate < '2024-04-01'` | March 1 is included; February 29 and April 1 are excluded. |
| Q1 2024 | On or after January 1, 2024 **and** before April 1, 2024 | `OrderDate >= '2024-01-01' AND OrderDate < '2024-04-01'` | January 1 is included; December 31, 2023 and April 1 are excluded. |

These filters select different periods because Q1 also includes January and February. Neither filter changes the source file. A date boundary describes which records qualify without implying that every included date contains a record.

A **Power Query filter** limits which rows are loaded. A **worksheet filter** only hides rows already loaded. `SUM` includes hidden rows, while `SUBTOTAL(109,...)` sums visible rows. Lessons specify which kind of filter and calculation they need.

To edit an import, on Windows open **Data → Queries & Connections**, then double-click the query. On Mac use **Data → Get Data (Power Query) → Launch Power Query Editor** and select the query. Refresh the imported table after changing its source query. Refresh a PivotTable separately after its input changes.

## If Your Result Looks Different

- **Formula shows a name error:** check the working table and column names. Localized Excel may use translated names and semicolons instead of the English function names and commas shown here.
- **Date filters behave like text filters:** set the column type to Date in Power Query. For typed cutoff cells, use `DATE(year,month,day)`.
- **A lookup says “No match”:** compare the stored keys and their types. Do not replace missing matches with a guessed name or zero.
- **An amount differs:** check the source table, source filters, worksheet filters, and whether a merge repeated rows.
- **The source moved:** use **Data Source Settings** to select its new location, then refresh.
- **Power Query menus are absent:** confirm you are using a current Microsoft 365 desktop installation. The browser version is outside this tutorial's documented route.

Microsoft provides [workbook import instructions](https://support.microsoft.com/en-us/excel/import-data-from-data-sources-power-query) and [Mac Power Query guidance](https://support.microsoft.com/en-gb/excel/import-and-shape-data-in-excel-for-mac-power-query).

## Next Steps

Continue to [1. Meet the Records](../learn-and-practice/meet-the-records.md?tool=excel). Keep the Excel tab selected throughout the tutorials. Each lesson ends with a small result to save and a short interpretation.

<span id="financial-workflows"></span>

<span id="working-capital-and-cash-conversion"></span>

<span id="financial-statement-bridge"></span>

<span id="revenue-margin-and-payroll-mix"></span>

<span id="managerial-and-cost-accounting-workflows"></span>

<span id="product-portfolio-profitability"></span>

<span id="labor-and-workforce-mix"></span>

<span id="manufacturing-routing-and-capacity"></span>

<span id="audit-workflows"></span>

<span id="master-data-and-workforce-controls"></span>

## Continue from an Older Guide {#foundation-exercise-a-catalog-profile}

<details>
<summary>Continue from an older Excel guide link</summary>

The former catalog exercise and financial, managerial, and audit workflow lists are now replaced by the [numbered tutorials](../learn-and-practice/index.md). Begin with the foundations, then choose a process investigation. For later work, the [Case Library](cases/index.md) and [Reports and Analytics](index.md) retain their broader business topics.

</details>
