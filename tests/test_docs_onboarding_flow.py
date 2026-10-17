from __future__ import annotations

import re
from pathlib import Path

import yaml


DOCS_ROOT = Path("docs")
CASE_DOCS = sorted((DOCS_ROOT / "analytics/cases").glob("*-case.md"))
FORBIDDEN_PUBLIC_COPY = (
    "Audience and Purpose",
    "Use this page when",
    "Use this case when",
    "Use this pack",
    "Use this perspective",
    "This perspective matters because",
    "Why this matters",
    "Why This Report Belongs",
    "Why it matters here",
    "This page matters because",
)


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def test_public_docs_have_specific_metadata_and_a_primary_heading() -> None:
    titles: dict[str, Path] = {}
    for path in sorted(DOCS_ROOT.rglob("*.md")):
        text = _read(path)
        sections = text.split("---", 2)
        assert len(sections) == 3, f"Missing YAML front matter: {path}"
        metadata = yaml.safe_load(sections[1])
        assert metadata.get("title"), f"Missing explicit title: {path}"
        assert len(metadata.get("description", "")) >= 30, f"Missing useful description: {path}"
        assert metadata["title"] not in titles, f"Duplicate page title: {path} and {titles.get(metadata['title'])}"
        titles[metadata["title"]] = path
        headings = len(re.findall(r"(?m)^# ", sections[2]))
        headings += sections[2].count("<CompanyStoryHero")
        assert headings == 1, f"Expected one primary heading in {path}; found {headings}"


def test_orientation_connects_company_process_practice_and_downloads() -> None:
    text = _read(DOCS_ROOT / "start-here/index.md")
    for target in (
        "../learn-the-business/company-story.md",
        "../learn-the-business/process-flows.md",
        "../learn-and-practice/index.md",
        "downloads.md",
        "../analytics/cases/index.md",
    ):
        assert target in text, f"Orientation does not link to {target}"


def test_core_process_pages_connect_evidence_with_cases() -> None:
    related_cases = {
        "o2c": "o2c-trace-case.md",
        "p2p": "p2p-accrual-settlement-case.md",
        "manufacturing": "manufacturing-labor-cost-case.md",
        "payroll": "workforce-cost-and-org-control-case.md",
    }
    for process, case_file in related_cases.items():
        text = _read(DOCS_ROOT / f"processes/{process}.md")
        assert "## Next Steps" in text
        assert f"../analytics/cases/{case_file}" in text
        assert "../analytics/index.md#" in text


def test_foundational_practice_precedes_integrated_cases() -> None:
    practice = _read(DOCS_ROOT / "learn-and-practice/index.md")
    for target in ("source-to-ledger.md", "receipt-to-payable.md", "manufacturing-cost-flow.md"):
        assert target in practice
        exercise = _read(DOCS_ROOT / "learn-and-practice" / target)
        assert "##" in exercise
        assert "../processes/" in exercise
        assert "../analytics/" in exercise
    assert "../analytics/cases/index.md" in practice


def test_cases_preserve_guided_evidence_and_assessed_deliverables() -> None:
    assert len(CASE_DOCS) == 17
    for path in CASE_DOCS:
        text = _read(path)
        for heading in (
            "## Business Scenario",
            "## The Problem to Solve",
            "## Learning Objectives",
            "## Key Data Sources",
            "## Recommended Query Sequence",
            "## Required Student Output",
            "## Wrap-Up Questions",
            "## Next Steps",
        ):
            assert heading in text, f"Missing {heading}: {path}"
        assert re.search(r"<(?:QueryReference|QuerySequence)\b", text), f"Missing query component: {path}"
        assert "../../processes/" in text, f"Case needs a process connection: {path}"
        assert "<CaseOverview" in text, f"Case needs visible discovery metadata: {path}"


def test_unified_report_hub_and_query_pages_keep_catalog_components() -> None:
    report = _read(DOCS_ROOT / "analytics/index.md")
    assert "<ReportCatalog topics={reportTopics}" in report
    assert "@site/src/data/reportTopics.json" in report
    assert not list((DOCS_ROOT / "analytics/reports").glob("*.md"))
    for area in ("financial", "managerial", "audit"):
        query = _read(DOCS_ROOT / f"analytics/{area}.md")
        assert "<QueryGroupCatalog" in query
        assert f"queryLibraryGroups.{area}" in query


def test_orientation_and_instructor_paths_link_to_hub_and_textbook() -> None:
    for relative_path in ("start-here/index.md", "teach-with-data/instructor-guide.md"):
        text = _read(DOCS_ROOT / relative_path)
        assert "https://accountinganalyticshub.com" in text
        assert "https://aa.accountinganalyticshub.com" in text


def test_relative_markdown_links_resolve_to_authored_pages() -> None:
    for path in DOCS_ROOT.rglob("*.md"):
        for target in re.findall(r"\]\(([^)\s]+\.md)(?:#[^)]*)?\)", _read(path)):
            if "://" in target or target.startswith("/"):
                continue
            assert (path.parent / target).resolve().is_file(), f"Broken Markdown link {target}: {path}"


def test_public_teaching_copy_avoids_template_phrasing() -> None:
    for path in DOCS_ROOT.rglob("*.md"):
        text = _read(path)
        for phrase in FORBIDDEN_PUBLIC_COPY:
            assert phrase not in text, f"Template copy {phrase}: {path}"
