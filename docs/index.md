# Documentation Index

This page is the main navigation hub for the Greenfield Accounting Dataset Generator documentation.

The project has two documentation layers:

- **Course-user documentation** for students, instructors, and analysts
- **Technical reference documentation** for contributors and maintainers

## Start Here by Audience

| If you are a... | Read this first | Then continue with |
|---|---|---|
| Student | [dataset-overview.md](dataset-overview.md) | [process-flows.md](process-flows.md), [database-guide.md](database-guide.md), [analytics/index.md](analytics/index.md) |
| Instructor | [instructor-guide.md](instructor-guide.md) | [analytics/index.md](analytics/index.md), [process-flows.md](process-flows.md), [database-guide.md](database-guide.md) |
| Analyst | [database-guide.md](database-guide.md) | [analytics/index.md](analytics/index.md), [reference/schema.md](reference/schema.md), [reference/posting.md](reference/posting.md) |
| Contributor | [code-architecture.md](code-architecture.md) | [reference/schema.md](reference/schema.md), [reference/posting.md](reference/posting.md), [reference/row-volume.md](reference/row-volume.md) |

## Course-User Documentation

| Document | What it covers |
|---|---|
| [dataset-overview.md](dataset-overview.md) | What the dataset is, why it exists, and the main glossary terms |
| [process-flows.md](process-flows.md) | O2C, P2P, and subledger-to-ledger traceability with diagrams |
| [database-guide.md](database-guide.md) | Table families, key joins, and where to start for financial, managerial, and audit analytics |
| [instructor-guide.md](instructor-guide.md) | Suggested teaching sequence and exercise categories |
| [analytics/index.md](analytics/index.md) | Analytics starter hub for SQL and Excel users |
| [analytics/financial.md](analytics/financial.md) | Financial accounting starter analytics |
| [analytics/managerial.md](analytics/managerial.md) | Managerial accounting starter analytics |
| [analytics/audit.md](analytics/audit.md) | Auditing starter analytics |
| [analytics/sql-guide.md](analytics/sql-guide.md) | How to run and adapt the starter SQL files |
| [analytics/excel-guide.md](analytics/excel-guide.md) | How to use the Excel workbook for analytics |
| [code-architecture.md](code-architecture.md) | How the generator works end to end |

## Technical Reference

| Document | What it covers |
|---|---|
| [reference/schema.md](reference/schema.md) | Implemented schema and key column patterns |
| [reference/posting.md](reference/posting.md) | Current posting logic and control-account behavior |
| [reference/row-volume.md](reference/row-volume.md) | Current default row counts versus design-intent ranges |
| [roadmap.md](roadmap.md) | Next implementation phase and the remaining roadmap |

## Historical Appendix

| Document | What it covers |
|---|---|
| [../Design.md](../Design.md) | Original long-form blueprint and historical design notes; includes future ideas that do not always match the current generator |

## Current Scope vs Future Scope

### Implemented in current generator

- Five-year dataset from 2026 through 2030
- Order-to-cash and procure-to-pay transaction generation
- Opening balances, recurring manual journals, year-end close, and budgets
- Event-based postings into `GLEntry`
- Analytics starter docs, query packs, and Excel workflow guidance
- Validation outputs, anomaly injection, and exports

### Planned future extension

- Manufacturing process coverage
- Broader O2C and inventory behavior

## Root-Level Entry Points

- [../README.md](../README.md): public landing page and quick start
- [../CONTRIBUTING.md](../CONTRIBUTING.md): contribution guidance
- [../LICENSE](../LICENSE): license terms
