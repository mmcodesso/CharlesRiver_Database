---
title: SQL Guide
description: Open the accounting SQLite dataset, trace one order line with existing SQL, and submit a source-evidence map before advancing to accounting cases.
sidebar_label: SQL Guide
---

import { QueryReference } from "@site/src/components/QueryReference";

# SQL Guide

## Opening the Dataset in SQL

Start with a business event: an order can be entered before it is shipped or billed. Your first SQL task is to recognize those events and their source keys in a result set. You can read and run the supplied query before learning to write every join yourself.

Read the [company story](../learn-the-business/company-story.md) and [Order-to-Cash Process](../processes/o2c.md), then download the SQLite file from [Downloads](../start-here/downloads.md). Keep the published file unchanged and save query results in a separate analysis folder.

## What File to Open

For SQL work, start with <FileName type="sqlite" />.

This file contains the dataset tables you need for joins, filters, summaries, and document tracing.

## Recommended Tool: DB Browser for SQLite

The recommended starting tool is [DB Browser for SQLite](https://sqlitebrowser.org/dl/).

It works well for first-time SQLite work because it gives you:

- a simple install path
- a direct file-open workflow
- a visible table browser
- a built-in SQL editor
- a result grid that is easy to review and export

If you are new to SQLite, start here before moving to a more advanced tool.

## How to Open the Dataset in DB Browser

1. Download and install [DB Browser for SQLite](https://sqlitebrowser.org/dl/).
2. Open DB Browser and choose `Open Database`.
3. Select <FileName type="sqlite" /> from the files shared for your course.
4. Open the `Browse Data` tab and inspect a few tables such as `Customer`, `SalesInvoice`, or `GLEntry`.
5. Open the `Execute SQL` tab so you are ready to paste a starter query.

At this point, you are ready to copy SQL from the analytics pages in the docs and run it against the dataset.

## How to Run Your First Query

Start with this first-pass workflow:

1. Open the order-line trace below.
2. Choose `Show SQL` and read its teaching objective and output description.
3. Copy the SQL from the code block.
4. Paste it into the `Execute SQL` tab in DB Browser.
5. Run the query.
6. Review the result grid and column names before you move on.

<QueryReference
  queryKey="cases/01_o2c_line_trace_order_shipment_invoice.sql"
  showMetadata
  helperText="Trace order lines into shipment and invoice evidence. Run the existing SQL without changing the dataset."
/>

## Foundation Exercise: One Order Line and Its Evidence

**Context and problem.** An instructor asks you to explain whether an order line has shipment and invoice support. This is an illustrative request; select the actual line from your query result. You are establishing an evidence trail before making a revenue or collection judgment.

**Learning objectives.** Identify the grain of a result row, follow header and line keys, and distinguish an order, a shipment, and an invoice. Prior knowledge: the O2C process and basic debits and credits. Tool: a SQLite reader. Source records: `SalesOrder`, `SalesOrderLine`, `Shipment`, `ShipmentLine`, `SalesInvoice`, `SalesInvoiceLine`, and `Customer`.

1. Run the supplied trace query and record the file or release version you used.
2. Select one `SalesOrderLineID` from the result. Locate every result row for that same line before interpreting a quantity or amount.
3. Record its order key, shipment-line key, invoice-line key, available event dates, and `TraceStatus`. Keep a blank downstream key visible rather than replacing it with an assumed event.
4. Inspect the corresponding source tables in `Browse Data`. Explain why a result row is a document-link combination and why one order line may appear more than once.
5. Describe what the evidence establishes and which further source would be needed to assess revenue recognition or cash settlement.

**Assessed deliverable.** Submit an annotated evidence table for the selected line, the query filename and scope, and a paragraph explaining the events, row grain, and one unresolved question. Assessment focuses on correct source keys and event distinctions, not the size of the order or whether you found an exception.

**Interpretation and limits.** An unshipped or uninvoiced line can reflect ordinary open activity. This query does not prove customer collection, GL posting, or the reason for a delay. Do not sum repeated order-line amounts across trace rows.

For applied analysis, continue with the [O2C Trace Case](cases/o2c-trace-case.md), which adds completeness, fulfillment, ledger, and settlement evidence. The [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) supplies deeper guidance on analytical questions and evidence interpretation.

## How to Read the Result and Keep Going

After your first query runs, check four things before you write another one:

- the row grain: what one row represents
- the main dimensions: month, customer, item, cost center, or document
- the main measures: amount, quantity, hours, or count
- the business question: what the result explains

Then move to the next layer:

1. stay on the topic page and run a second query in the same area
2. open the paired case in [Cases](cases/index.md)
3. use [Schema Reference](../reference/schema.md) when you need table and key help
4. use [GLEntry Posting Reference](../reference/posting.md) when the question reaches the ledger

The starter SQL is organized into three compact topic groups:

| Topic page | What it covers |
|---|---|
| [Financial Queries](financial.md) | revenue, margin, working capital, accruals, payroll, close-cycle, and pricing review |
| [Managerial Queries](managerial.md) | budget, portfolio mix, labor, service levels, planning, replenishment, and pricing governance |
| [Audit Queries](audit.md) | document-chain review, approvals, workforce controls, planning support, pricing governance, and anomaly review |

The topic pages surface these queries directly in the docs, so most students can work from the website without opening any repository folders.

## Other Tools You Can Use

If you already use another SQL tool, the same workflow still works:

- `DBeaver`
- `SQLiteStudio`
- `VS Code` with a SQLite extension

Open <FileName type="sqlite" />, copy a starter query from the docs, run it, and review the result. DB Browser remains the recommended first tool because it is the simplest path for most students.

### Secondary Workflows

If you prefer code-first work, you can also run copied starter SQL through Python or the `sqlite3` command-line tool.

#### Python

```python
import sqlite3
import pandas as pd

sql = """
-- paste a starter query copied from the docs here
SELECT *
FROM GLEntry
LIMIT 25;
"""

with sqlite3.connect("file:downloaded_dataset.sqlite?mode=ro", uri=True) as connection:
    df = pd.read_sql_query(sql, connection)

print(df.head())
```

#### `sqlite3` CLI

```bash
sqlite3 -readonly downloaded_dataset.sqlite
```

Then paste a starter query copied from the docs into the prompt and run it directly.

## Next Steps

- Use [Financial Queries](financial.md), [Managerial Queries](managerial.md), or [Audit Queries](audit.md) to choose your next query set.
- Use [Cases](cases/index.md) when you want a guided business question after the first query.
- Use [Excel Guide](excel-guide.md) when you want to recreate a SQL result in the workbook.
