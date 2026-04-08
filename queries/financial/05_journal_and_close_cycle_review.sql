-- Teaching objective: Review journal-entry activity, recurring journals, reversals, and year-end close volume.
-- Main tables: JournalEntry.
-- Output shape: One row per posting month and journal entry type.
-- Interpretation notes: Use this query to see how much of the ledger is driven by recurring manual journals versus closing activity.

SELECT
    substr(PostingDate, 1, 7) AS PostingMonth,
    EntryType,
    COUNT(*) AS JournalCount,
    ROUND(SUM(TotalAmount), 2) AS TotalDebitAmount,
    SUM(CASE WHEN ReversesJournalEntryID IS NOT NULL THEN 1 ELSE 0 END) AS ReversalLinkCount
FROM JournalEntry
GROUP BY substr(PostingDate, 1, 7), EntryType
ORDER BY PostingMonth, EntryType;
