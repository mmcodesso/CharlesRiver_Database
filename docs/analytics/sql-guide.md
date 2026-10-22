---
title: "Set Up SQL for the Tutorials"
description: "Open the Charles River SQLite database in DB Browser, run a short customer query, and save your first tutorial SQL."
sidebar_label: "Set Up SQL"
pagination_prev: "learn-and-practice/index"
pagination_next: "learn-and-practice/meet-the-records"
---

# Set Up SQL

Your first goal is to open the database, find a customer table, and run one short query. You do not need to create a database, install a server, or know SQL syntax beforehand.

<span id="opening-the-dataset-in-sql"></span>

<span id="what-file-to-open"></span>

<span id="recommended-tool-db-browser-for-sqlite"></span>

<span id="how-to-open-the-dataset-in-db-browser"></span>

## 1. Open the Released Database

Get the [SQLite database from Downloads](../start-here/downloads.md) and keep the source file unchanged.

Install [DB Browser for SQLite](https://sqlitebrowser.org/dl/), using the installer appropriate for your computer. Open it and choose **Open Database**, then select <FileName type="sqlite" />. If your tool offers a read-only opening option, use it. All tutorial queries read records.

DB Browser provides both a table browser and a SQL editor. Another SQLite-compatible desktop tool can run the same queries, but menu names may differ.

## 2. Browse One Table

Select **Browse Data** and choose **Customer** in the table selector. Look for the column headings **CustomerID**, **CustomerName**, and **CustomerSegment**.

One customer can have several orders, but this table describes the customer itself. Its identifier will help you recognize that customer across later tables.

The full dataset has 82 tables. You do not need to inspect them all before beginning.

<span id="how-to-run-your-first-query"></span>

## 3. Run Your First Query

1. Open the **Execute SQL** tab.
2. Use the copy button on the code block below, or select and copy its complete text.
3. Paste it into an empty SQL editor tab.
4. Choose the toolbar's **Execute all** / play control. If you have highlighted text, use the control that executes the selected statement.
5. Read the column headings and single row in the results grid.

```sql title="setup-customer.sql"
SELECT CustomerID, CustomerName, CustomerSegment
FROM Customer
WHERE CustomerID = 130;
```

Expect **130**, **Jones, Richardson and Beard**, and **Design Trade**. `SELECT` chooses columns, `FROM` names the table, and `WHERE` keeps matching records. The semicolon ends the statement.

Your result is a view of existing records. Running the query does not create a customer or modify the database.

## 4. Check the File and Save Your Work

Run this second query separately:

```sql title="setup-customer-count.sql"
SELECT COUNT(*) AS CustomerRows
FROM Customer;
```

Expect **220** customer records. This confirms the example population without validating every record in the database.

Use the SQL editor's save control to save your query text as **Lesson01.sql** in your analysis folder. Save each later lesson's statements in its own file. Keep a short note of the source filename, selected identifiers, date filters, and what each result row represents.

When a lesson contains several queries, run them one at a time and inspect each result. Replace the editor text or use a fresh SQL tab to avoid accidentally interpreting the output of a different statement.

## Save the Result Not Just the Query

A saved `.sql` file preserves instructions. A result file preserves the rows those instructions returned. Keep both so a reader can reproduce and check your evidence.

1. Execute one intended query and confirm its result headings, filters, and row count. For `setup-customer.sql`, the result should contain three columns and one customer row.
2. In **Execute SQL**, open the **Save results** control's menu and choose **Export to CSV**. This exports the last executed query result. The main **File → Export → Table(s) as CSV file** command exports tables and is unsuitable for retaining a filtered query result.
3. In the export dialog, enable **Column names in first line** and choose a comma as the **Field separator**. Save the result as `setup-customer-result.csv` in your analysis folder. Use a distinct result filename for each later query.
4. Record the saved SQL filename or query label, source dataset baseline assigned to the class, cutoff and date basis, tool version, and result row count in `Notes` or the [evidence template](pathname:///teaching/evidence-template.md). Obtain baseline details through [Downloads](../start-here/downloads.md).
5. Reopen the CSV in a text editor or import it into a separate worksheet. Confirm the column headers, selected customer ID, and one data row. For larger results, compare the saved row count and a control total with the query result. A CSV has no saved data types, so check dates and identifiers when importing it again.
6. If the query correctly returns no rows, record **zero result rows** with the exact filters and execution date. Retain a header-only CSV when the tool permits it. If export is unavailable for an empty grid, keep the SQL and an explicit empty-result note. Do not substitute rows from another query or the whole source table.

For a small result, select every intended cell in the result grid, open its context menu, and choose **Copy with Headers**. Paste into a blank worksheet, then verify the headers, number of data rows, and values before saving. Copying only the visible selection can omit evidence, so use CSV export for larger results.

These English labels are defined in [DB Browser 3.13.1's shared Windows and Mac UI source](https://github.com/sqlitebrowser/sqlitebrowser/blob/v3.13.1/src/MainWindow.ui), [CSV dialog](https://github.com/sqlitebrowser/sqlitebrowser/blob/v3.13.1/src/ExportDataDialog.ui), and [result-grid copy actions](https://github.com/sqlitebrowser/sqlitebrowser/blob/v3.13.1/src/ExtendedTableWidget.cpp). Other versions or translations can differ. Use the result control beside the SQL output, then verify the exported rows.

<span id="how-to-read-the-result-and-keep-going"></span>

## Read and Adapt the Examples {#foundation-exercise-one-order-line-and-its-evidence}

The first lessons introduce selecting columns, filters, sorting, and totals. Joins appear only after you understand the keys they match.

Copy the complete example first. Compare the expected row count or amount. Then make the single change requested by the practice variation.

The database uses SQLite. Use the supplied syntax rather than translating examples into a different SQL dialect. Tutorials do not require `CREATE`, `UPDATE`, or `DELETE`.

## If Your Result Looks Different

- **“No such table”:** confirm the open file is the released database and that the table name matches the query.
- **“No such column”:** check spelling and whether you copied the full query.
- **No rows:** check the identifier, date boundary, and source table. An empty result can also be the intended answer.
- **More rows than expected:** inspect the join keys and the meaning of one row before adding totals.
- **A total is blank:** Check the filter before treating `NULL` as zero, because SQL aggregates over an empty population can return `NULL`.
- **The wrong result appears:** run only the intended statement and check its output headings.

The [Schema Reference](../reference/schema.md) provides exact fields once you need them. The [Query Library](analysis-tracks.md) provides larger investigations after the tutorials.

<span id="other-tools-you-can-use"></span>

<span id="secondary-workflows"></span>

<span id="python"></span>

<span id="sqlite3-cli"></span>

<details>
<summary>Use an existing SQLite workflow</summary>

SQLiteStudio, DBeaver configured for SQLite, or an existing SQLite command-line workflow can run the examples. Keep the database as a read-only source and save query text/results separately. The tutorial's business questions and result checks stay the same. The [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) provides deeper SQL explanations.

</details>

## Next Steps

For conceptual support, read the textbook's [SQL Essentials for Accounting Analytics](https://aa.accountinganalyticshub.com/chapters/09-sql-essentials/chapter.html) and [Joining and Summarizing Data in SQL](https://aa.accountinganalyticshub.com/chapters/10-joining-and-summarizing/chapter.html). Return to the Charles River lessons to apply those techniques to a defined source population.

Continue to [1. Meet the Records](../learn-and-practice/meet-the-records.md?tool=sql). Keep the SQL tab selected throughout the tutorials. You can complete the Excel steps separately if you wish.
