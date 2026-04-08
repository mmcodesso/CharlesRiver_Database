from __future__ import annotations

import re
import sqlite3
from pathlib import Path

import pandas as pd


REQUIRED_ANALYTICS_DOCS = [
    Path("docs/analytics/index.md"),
    Path("docs/analytics/financial.md"),
    Path("docs/analytics/managerial.md"),
    Path("docs/analytics/audit.md"),
    Path("docs/analytics/excel-guide.md"),
    Path("docs/analytics/sql-guide.md"),
]

QUERY_DIRECTORIES = {
    "financial": Path("queries/financial"),
    "managerial": Path("queries/managerial"),
    "audit": Path("queries/audit"),
}


def markdown_links(path: Path) -> list[str]:
    pattern = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
    return pattern.findall(path.read_text(encoding="utf-8"))


def resolve_local_link(source_path: Path, target: str) -> Path | None:
    if target.startswith(("http://", "https://", "mailto:", "#")):
        return None

    clean_target = target.split("#", 1)[0]
    if not clean_target:
        return None
    return (source_path.parent / clean_target).resolve()


def test_phase10_analytics_docs_and_queries_exist() -> None:
    for document in REQUIRED_ANALYTICS_DOCS:
        assert document.exists(), f"Missing analytics document: {document}"

    for area, directory in QUERY_DIRECTORIES.items():
        assert directory.exists(), f"Missing query directory: {directory}"
        query_files = sorted(directory.glob("*.sql"))
        assert len(query_files) >= 6, f"Expected at least 6 starter SQL files in {area}, found {len(query_files)}"


def test_phase10_markdown_links_resolve() -> None:
    markdown_paths = [Path("README.md"), *Path("docs").rglob("*.md")]

    for markdown_path in markdown_paths:
        for target in markdown_links(markdown_path):
            resolved = resolve_local_link(markdown_path, target)
            if resolved is None:
                continue
            assert resolved.exists(), f"Broken link in {markdown_path}: {target}"


def test_phase10_sql_files_execute_against_generated_sqlite(
    full_dataset_artifacts: dict[str, object],
) -> None:
    sqlite_path = Path(full_dataset_artifacts["sqlite_path"])
    assert sqlite_path.exists()

    sql_files = sorted(Path("queries").rglob("*.sql"))
    assert sql_files, "No starter SQL files were found."

    with sqlite3.connect(sqlite_path) as connection:
        for sql_file in sql_files:
            sql = sql_file.read_text(encoding="utf-8")
            result = pd.read_sql_query(sql, connection)
            assert len(result.columns) >= 1, f"Query returned no columns: {sql_file}"
