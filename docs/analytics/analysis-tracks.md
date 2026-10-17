---
title: Query Library
description: Browse all 170 Charles River SQL queries in the same six business topics as the reports, inspect source logic, and follow guided reconciliation paths.
sidebar_label: Query Library
---

import QueryLibrary from "@site/src/components/QueryLibrary";

# Query Library

Choose a question from a [business process](../learn-the-business/process-flows.md), then browse the same business topics used in [Reports and Analytics](index.md). Each query appears once, with its objective, output grain, source tables, expandable SQL, and original-file download together.

Search by question or table, or select a business topic. Expand **Interpret these results** for topic-specific accounting guidance and **Anomaly coverage** where available. The [guided query paths](#guided-query-paths) connect statement reconciliation and CAPEX steps without duplicating query cards.

## Browse Queries

<QueryLibrary />

## Build Your Analysis

Start with the [SQL Guide](sql-guide.md) for a first query or [Learn and Practice](../learn-and-practice/index.md) for a focused evidence trace. The [cases](cases/index.md) provide structured investigations and assessed outputs.

Before comparing results, define the fiscal period, source population, row grain, sign convention, and filters. Keep the assigned release unchanged. Align dates and populations, retain document keys, and distinguish an exception flag from a supported accounting or control conclusion. The [Schema Reference](../reference/schema.md) and [Posting Reference](../reference/posting.md) support the final source-to-ledger check.
