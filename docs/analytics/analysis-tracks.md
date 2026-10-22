---
title: SQL Query Library for Accounting Analysis
description: Browse all 170 Charles River SQL queries in the same six business topics as the reports, inspect source logic, and follow guided reconciliation paths.
sidebar_label: Query Library
---

import QueryLibrary from "@site/src/components/QueryLibrary";

# Query Library

Choose a question from a [business process](../learn-the-business/process-flows.md), then browse the same business topics used in [Reports and Analytics](index.md). Each query appears once, with its objective, output grain, source tables, expandable SQL, and original-file download together.

Start with the guided paths below for a connected investigation, or search by question or table and select a business topic. Expand **Interpret these results** for topic-specific accounting guidance and **Anomaly coverage** where available. The [guided query paths](#guided-query-paths) connect statement reconciliation and CAPEX steps without duplicating query cards.

## Guided Paths and Query Catalog

<QueryLibrary />

Search and topic selections are kept in the URL for classroom links and Back/Forward recovery. A direct query link reveals the destination even if the current filters would hide it. If SQL cannot load, use **Retry SQL** or download its original file.

## Build Your Analysis

For accounting SQL practice, begin with [connecting records](../learn-and-practice/connect-the-records.md) to examine join keys and row grain, then [finding accounting entries](../learn-and-practice/find-the-accounting-entries.md) to trace source documents into `GLEntry`. These lessons prepare you to adapt the catalog examples without treating every matching row as independent evidence.

Start with the [SQL Guide](sql-guide.md) for a first query or [Learn and Practice](../learn-and-practice/index.md) for a focused evidence trace. The [cases](cases/index.md) provide structured investigations and assessed outputs.

Before comparing results, define the fiscal period, source population, row grain, sign convention, and filters. Keep the source records unchanged. Align dates and populations, retain document keys, and distinguish an exception flag from a supported accounting or control conclusion. The [Schema Reference](../reference/schema.md) and [Posting Reference](../reference/posting.md) support the final source-to-ledger check.
