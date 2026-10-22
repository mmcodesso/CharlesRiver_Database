---
title: Download and Open the Charles River Teaching Files
description: Choose the published SQLite, Excel, or CSV format, retain a source copy, and check your first file before beginning a Charles River accounting exercise.
slug: /downloads
sidebar_label: Downloads
pagination_prev: start-here/index
pagination_next: start-here/dataset-overview
---

# Downloads

Choose the format your assignment uses. The published teaching files contain the same company records in different working formats. Download your source file, keep it unchanged, and create a separate analysis file without setting up the generator.

The links below always download the **latest published version**. <TeachingReleaseLink /> for its version number, file details, and checksums. [Previous versions](https://github.com/mmcodesso/CharlesRiver_Database/releases) remain available in the release history.

If you are still reading the company and process chapters, you can return here later. Those chapters do not require an open file.

<DatasetStructuredData
  pagePath="/docs/downloads"
  description="Download the published Charles River SQLite database, Excel workbook, or CSV package for accounting process tracing, analysis, and teaching."
/>

<span id="published-teaching-files"></span>

## Choose Your Working Format

| Format | Direct download | Choose it for |
|---|---|---|
| SQLite | <ReleaseDownloadLink type="sqlite">Download the SQLite database</ReleaseDownloadLink> | SQL queries, joins, and document tracing across tables |
| Excel | <ReleaseDownloadLink type="excel">Download the Excel workbook</ReleaseDownloadLink> | Filters, PivotTables, and analysis in a familiar workbook |
| CSV | <ReleaseDownloadLink type="csv">Download the CSV package</ReleaseDownloadLink> | Importing individual tables into another tool |

Follow your instructor's choice when one is specified. Otherwise, choose a format that fits the task and a tool you can already use. Excel supports an initial inspection of tables, while SQLite supports reproducible relationships across several tables. CSV requires you to manage the import settings in the receiving tool.

Download the complete file before opening it. Keep the published source unchanged and make a separate working copy for your analysis. Record the release version and file format in your notes so another person can understand which evidence you used.

The asset filenames are <FileName type="sqlite" />, <FileName type="excel" />, and <FileName type="csv" />. Retain the version label because a filename alone does not identify the release.

## Verify the SQLite Teaching Source

<TeachingReleaseIntegrity />

For an initial workbook or CSV population check, locate `Customer` and confirm **220 customer records**, excluding the header. This checks the imported population, while comparing the SQLite checksum checks the complete file. A readable file or a matching row count alone does not verify every value.

<span id="open-your-first-file"></span>

## Confirm That Your File Opens

An opening check should establish that the file is readable and that you can find a familiar table. It is not yet a reconciliation of the entire dataset.

**SQLite:** open the downloaded database with your SQL tool. Confirm that the table list includes `Customer`, `SalesOrder`, and `SalesOrderLine`, then inspect a few rows. The [SQL Guide](../analytics/sql-guide.md) explains the working setup and first queries.

**Excel:** open the workbook and locate the customer and sales-order sheets. Check that column headings and rows are visible before filtering or building a PivotTable. Follow the [Excel Guide](../analytics/excel-guide.md) for analysis steps, working from your copy.

**CSV:** extract the package and import a table into your chosen tool. Check that fields appear in separate columns and that dates, identifiers, and amounts retain suitable types. Keep the unedited extracted files as your source when repeating an import.

If the tool reports an incomplete or unreadable file, check that the download finished and that you selected the intended format before beginning the exercise.

<span id="scope-and-interpretation"></span>

## Know the Package You Are Using

The database contains **82 user tables**. You will usually need only a small group for one investigation. The [Dataset Guide](dataset-overview.md) explains how a document header, its lines, and related records fit together.

The main operating window is **2024–2026**. Some supplier payments settle in early 2027. A later payment can explain eventual settlement while the payable was still open at an earlier reporting date.

The records include intentional anomalies and control exceptions. Preserve them as evidence to investigate. A discrepancy alone does not establish its cause.

The public package provides SQLite, Excel, and CSV downloads. A course may supply a support workbook separately from the public release downloads. The [license](../technical/license.md) explains attribution and reuse.

<span id="before-the-first-assignment"></span>

## Next Steps

For publication discovery, visit the [Charles River dataset page at Accounting Analytics Hub](https://accountinganalyticshub.com/charles-river/). The dataset identifier is [10.5281/zenodo.23428083](https://doi.org/10.5281/zenodo.23428083); its creator is [Mauricio Codesso](https://accountinganalyticshub.com/author/mauricio-codesso/). Reuse is governed by [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Keep the version and format of the file used alongside this identifier when describing your analysis.

For the published snapshot identified as Version 2027.1, the Hub recommends this citation using the scholarly record's title, assigned year and revision DOI:

> Codesso, M. (2027). *Charles River Accounting Database* (Version 2027.1) [Dataset]. Accounting Analytics Hub. [10.5281/zenodo.23428084](https://doi.org/10.5281/zenodo.23428084).

The record's title uses “Database”; this educational site uses “Charles River Accounting Dataset.” The citation year comes from the publication record, while **2024–2026** describes the main operating years represented in the records. If you use a later release, retain its own version and citation details.

Continue to the [Dataset Guide](dataset-overview.md) to learn how to read the records before beginning the guided tutorials.
