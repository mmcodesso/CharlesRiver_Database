from __future__ import annotations

import re
import json
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
        "downloads.md",
        "dataset-overview.md",
    ):
        assert target in text, f"Orientation does not link to {target}"
    # Orientation deliberately leads through the company before introducing tools.
    sequence = [
        "start-here/index", "learn-the-business/company-story",
        "learn-the-business/process-flows", "processes/o2c", "processes/design-services",
        "processes/p2p", "processes/manufacturing", "processes/payroll",
        "processes/manual-journals-and-close", "learn-and-practice/index",
    ]
    for current, following in zip(sequence, sequence[1:]):
        metadata = yaml.safe_load(_read(DOCS_ROOT / f"{current}.md").split("---", 2)[1])
        assert metadata["pagination_next"] == following


def test_core_process_pages_connect_evidence_with_cases() -> None:
    related_cases = {
        "o2c": "o2c-trace-case.md",
        "p2p": "p2p-accrual-settlement-case.md",
        "manufacturing": "manufacturing-labor-cost-case.md",
        "payroll": "workforce-coverage-and-attendance-case.md",
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
        assert "## Keep Your Evidence" in exercise
        assert "## Try One Change" in exercise
    lessons = json.loads(_read(Path("src/data/tutorialLessons.json")))
    assert len(lessons) == 12
    for index, lesson in enumerate(lessons):
        assert f'{lesson["id"]}.md' in practice
        exercise = _read(DOCS_ROOT / "learn-and-practice" / f'{lesson["id"]}.md')
        metadata = yaml.safe_load(exercise.split("---", 2)[1])
        expected_next = f'learn-and-practice/{lessons[index + 1]["id"]}' if index < 11 else "analytics/cases/index"
        assert metadata["pagination_next"] == expected_next
    assert "../analytics/cases/index.md" in practice


def test_cases_preserve_guided_evidence_and_assessed_deliverables() -> None:
    drafts = json.loads(_read(Path("planning/website-redesign/cases/case-drafts.json")))
    legacy = json.loads(_read(Path("planning/website-redesign/cases/legacy-routes.json")))
    assert len(CASE_DOCS) == len(drafts) == 8
    assert {path.stem for path in CASE_DOCS} == {case["slug"] for case in drafts}
    for path in CASE_DOCS:
        text = _read(path)
        for heading in (
            "## Key Data Sources",
            "## Recommended Query Sequence",
            "## Prepare the Decision",
            "## Independent Challenge",
            "## Next Steps",
        ):
            assert heading in text, f"Missing {heading}: {path}"
        anchors = set(re.findall(r'id="([^"]+)"', text))
        anchors.update(
            re.sub(r"[^\w -]", "", heading.lower()).replace(" ", "-")
            for heading in re.findall(r"(?m)^#{1,6} (.*)$", text)
        )
        expected_anchors = {
            anchor for item in legacy.values() if item["destination"] == path.stem
            for anchor in item["anchors"]
        }
        assert expected_anchors <= anchors, f"Missing stable learning anchors: {path}"
        case = next(case for case in drafts if case["slug"] == path.stem)
        assert len(re.findall(r"(?m)^## Session ", text)) == case["sessions"]
        assert "**Worked scope.**" in text, f"Missing bounded population: {path}"
        assert "**Predict before you run:**" in text, f"Missing prediction activity: {path}"
        assert "**Checkpoint.**" in text, f"Missing reproducible checkpoint: {path}"
        assert "**Assessment criteria:**" in text, f"Missing assessed method: {path}"
        assert re.search(r"<(?:QueryReference|QuerySequence)\b", text), f"Missing query component: {path}"
        assert "**Preparation:**" in text, f"Case needs visible preparation: {path}"
        assert "../excel-guide.md" in text and "../sql-guide.md" in text, f"Case needs both setup paths: {path}"
        assert "<CaseOverview" in text, f"Case needs visible discovery metadata: {path}"


def test_unified_report_hub_and_query_pages_keep_catalog_components() -> None:
    report = _read(DOCS_ROOT / "analytics/index.md")
    assert "<ReportCatalog topics={reportTopics}" in report
    assert "@site/src/data/reportTopics.json" in report
    assert not list((DOCS_ROOT / "analytics/reports").glob("*.md"))
    query = _read(DOCS_ROOT / "analytics/analysis-tracks.md")
    assert "<QueryLibrary" in query
    for area in ("financial", "managerial", "audit"):
        assert not (DOCS_ROOT / f"analytics/{area}.md").exists()


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
