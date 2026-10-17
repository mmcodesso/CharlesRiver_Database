---
title: Query Library
description: Query repository for financial, managerial, audit, and case-support SQL used in the published teaching dataset.
sidebar_label: Query Library
---

import { QueryCatalog } from "@site/src/components/QueryReference";
import { caseSupportTraceQueries } from "@site/src/generated/queryDocCollections";

# Query Library

Begin with the question: how did an event reach the ledger, why did a measure change, or which control needs review? Choose a query domain below, read the objective and output grain, then inspect the SQL. For a first tool exercise, start with the [SQL Guide](sql-guide.md).

The query cards expose reusable logic behind [reports](reports/index.md) and [cases](cases/index.md). Keep the assigned release unchanged, retain document keys in exported evidence, and record the period and filters behind each result.

## Query Domains

| Domain | What students use it for | Go to |
|---|---|---|
| Financial Queries | Statements, settlement timing, working capital, payroll liabilities, accruals, CAPEX, budget, and commercial performance | [Financial Queries](financial.md) |
| Managerial Queries | Cost management, product portfolio, manufacturing, labor, workforce coverage, planning, replenishment, pricing, and design-service utilization | [Managerial Queries](managerial.md) |
| Audit Queries | Document completeness, approvals, master data, workforce controls, planning support, pricing governance, source tracing, and anomaly review | [Audit Queries](audit.md) |

## When to Use the Query Library

Open the Query Library when the class needs the SQL inventory rather than a finished report or a guided case. It is not the first reading page for beginners:

1. start with [SQL Guide](sql-guide.md) when students need the mechanics of running SQL
2. open the query domain that matches the accounting or business question after the process is clear
3. use the compact query cards to read the objective, output grain, and main tables
4. expand the SQL only when students are ready to inspect joins, filters, or calculations
5. move into [Reports](reports/index.md) or [Cases](cases/index.md) when students need interpretation or a structured assignment

## Case-Support Trace Queries

These queries are built for the core process-tracing cases. They are public SQL, but they are best used inside the matching case because the case explains the transaction story and the required student output.

<QueryCatalog
  items={caseSupportTraceQueries}
  helperText="Use these trace queries with the matching case page. They are source-level support queries rather than general starter packs."
/>

## Next Steps

1. Use [Financial Queries](financial.md), [Managerial Queries](managerial.md), or [Audit Queries](audit.md) when students need reusable SQL.
2. Use [Reports Hub](reports/index.md) when students need management-style or perspective-led interpretation.
3. Use [Cases](cases/index.md) when students need a guided assignment with required output.
