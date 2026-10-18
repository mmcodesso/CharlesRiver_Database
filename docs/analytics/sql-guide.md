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

Expect **220** customer records. This confirms the population used by the examples; it is not a complete validation of the database.

Use the SQL editor's save control to save your query text as **Lesson01.sql** in your analysis folder. Save each later lesson's statements in its own file. Keep a short note of the source filename, selected identifiers, date filters, and what each result row represents.

When a lesson contains several queries, run them one at a time and inspect each result. Replace the editor text or use a fresh SQL tab to avoid accidentally interpreting the output of a different statement.

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
- **A total is blank:** SQL aggregates over an empty population can return `NULL`; check the filter before treating that as zero.
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

Continue to [1. Meet the Records](../learn-and-practice/meet-the-records.md?tool=sql). Keep the SQL tab selected throughout the tutorials; completing the Excel steps is optional.
