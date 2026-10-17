---
title: Download the Charles River Accounting Dataset
description: Download the published Charles River SQLite database, Excel workbook, or CSV package and choose a setup path for accounting exercises and cases.
slug: /downloads
sidebar_label: Downloads
---

# Downloads

The published teaching package presents one synthetic company in three formats. Choose the file your assignment needs; you can begin with the downloads without building the dataset locally.

<DatasetStructuredData
  pagePath="/docs/downloads"
  sameAsPath="/"
  description="Download the published Charles River SQLite database, Excel workbook, or CSV package for accounting process tracing, analysis, and teaching."
/>

## Published Teaching Files

| File | Direct download | Working method |
|---|---|---|
| <FileName type="sqlite" /> | <ReleaseDownloadLink type="sqlite">Download SQLite database</ReleaseDownloadLink> | Query related tables and trace documents into `GLEntry` |
| <FileName type="excel" /> | <ReleaseDownloadLink type="excel">Download Excel workbook</ReleaseDownloadLink> | Import relevant tables into an exercise workbook, then filter, summarize, and visualize |
| <FileName type="csv" /> | <ReleaseDownloadLink type="csv">Download CSV zip package</ReleaseDownloadLink> | Extract table files for import into the tool specified by your course |

All three links point to the published release assets. The [GitHub releases page](https://github.com/mmcodesso/CharlesRiver_Database/releases) provides release context. Record the version and file used in your submission so another reader can reproduce your work.

## Open Your First File

**For SQL:** follow the [SQL Guide](../analytics/sql-guide.md) to open the SQLite file and run the existing starter queries. Keep your source copy unchanged while exploring.

**For Excel:** follow the [Excel Guide](../analytics/excel-guide.md). Import only the tables required for the activity into a separate working workbook. This keeps the evidence and your analysis easy to distinguish.

**For another tool:** extract the CSV package and retain table and key names. Check date, identifier, and numeric types during import before constructing relationships or totals.

## Scope and Interpretation

The published database contains 82 user tables. The main operating window covers 2024–2026, with some supplier settlements in early 2027. The [Dataset Guide](dataset-overview.md) explains the table families and the boundary between operational records, planning information, and posted accounting.

The teaching package includes intentional anomalies. Preserve those records during analysis; an unexpected result may be an assignment lead, a timing difference, or an analytical mistake requiring investigation.

An instructor may separately supply <FileName type="support" /> for validation and anomaly-review activities. It is not one of the public release downloads listed above. If an assignment requires that workbook, obtain the course-provided copy and confirm it matches the dataset version.

## Before the First Assignment

1. Read [Company Story](../learn-the-business/company-story.md).
2. Choose a cycle in [Process Flows](../learn-the-business/process-flows.md).
3. Try a foundational task in [Learn and Practice](../learn-and-practice/index.md).
4. Keep the [Schema Reference](../reference/schema.md) and [GLEntry Posting Reference](../reference/posting.md) available when a question reaches exact keys or accounting rules.

The project is distributed under [CC BY-SA 4.0](../technical/license.md). For conceptual reading alongside the files, visit the [Accounting Analytics textbook](https://aa.accountinganalyticshub.com/) through [Accounting Analytics Hub](https://accountinganalyticshub.com/).
