from __future__ import annotations

from pathlib import Path


FLAGSHIP_DOCS: dict[Path, tuple[str, ...]] = {
    Path("docs/start-here/index.md"): (
        "business cycles",
        "How the Business Reaches Analysis",
        "## Best Next Steps",
    ),
    Path("docs/start-here/downloads.md"): (
        "same business",
        "How the Files Fit the Business Story",
        "## Best Next Steps",
    ),
    Path("docs/learn-the-business/company-story.md"): (
        "connected operating system",
        "How the Business Actually Works",
        "## Best Next Steps",
    ),
    Path("docs/learn-the-business/process-flows.md"): (
        "Process to Analysis Bridges",
        "business process first, accounting second, analysis third",
        "## Best Next Steps",
    ),
    Path("docs/analytics/index.md"): (
        "From Process to Analysis",
        "The goal is not to leave the process behind.",
        "## Best Next Steps",
    ),
    Path("docs/analytics/reports/index.md"): (
        "How Process Becomes Report",
        "Business Perspectives",
        "## Best Next Steps",
    ),
    Path("docs/analytics/reports/lens-packs.md"): (
        "How the Perspectives Grow Out of the Business",
        "Available Business Perspectives",
        "## Best Next Steps",
    ),
    Path("docs/analytics/cases/index.md"): (
        "How Cases Fit the Learning Path",
        "structured follow-through from the company story and the process pages",
        "## Best Next Steps",
    ),
}


PROCESS_NEXT_STEP_LINKS: dict[Path, tuple[str, ...]] = {
    Path("docs/processes/o2c.md"): (
        "## Best Next Steps",
        "../analytics/reports/commercial-and-working-capital.md",
        "../analytics/cases/o2c-trace-case.md",
    ),
    Path("docs/processes/p2p.md"): (
        "## Best Next Steps",
        "../analytics/reports/commercial-and-working-capital.md",
        "../analytics/cases/p2p-accrual-settlement-case.md",
    ),
    Path("docs/processes/manufacturing.md"): (
        "## Best Next Steps",
        "../analytics/reports/operations-and-risk.md",
        "../analytics/cases/manufacturing-labor-cost-case.md",
    ),
    Path("docs/processes/payroll.md"): (
        "## Best Next Steps",
        "../analytics/reports/payroll-perspective.md",
        "../analytics/cases/workforce-cost-and-org-control-case.md",
    ),
}


def _read(path: Path) -> str:
    assert path.exists(), f"Missing doc page: {path}"
    return path.read_text(encoding="utf-8")


def test_flagship_docs_keep_process_led_structure() -> None:
    for path, expected_snippets in FLAGSHIP_DOCS.items():
        text = _read(path)
        opening = "\n".join(text.splitlines()[:24]).lower()

        for snippet in expected_snippets:
            assert snippet in text, f"Missing expected snippet in {path}: {snippet}"

        assert "choose your path" not in opening
        assert "when to use it" not in opening
        assert "what this helps students do" not in opening


def test_process_pages_bridge_into_perspectives_reports_and_cases() -> None:
    for path, expected_snippets in PROCESS_NEXT_STEP_LINKS.items():
        text = _read(path)

        for snippet in expected_snippets:
            assert snippet in text, f"Missing expected snippet in {path}: {snippet}"


def test_start_here_and_process_flows_point_into_the_same_learning_sequence() -> None:
    start_here = _read(Path("docs/start-here/index.md"))
    process_flows = _read(Path("docs/learn-the-business/process-flows.md"))

    for snippet in (
        "../learn-the-business/company-story.md",
        "../learn-the-business/process-flows.md",
        "../analytics/index.md",
        "../analytics/reports/index.md",
        "../analytics/cases/index.md",
    ):
        assert snippet in start_here

    for snippet in (
        "../processes/o2c.md",
        "../processes/p2p.md",
        "../processes/manufacturing.md",
        "../processes/payroll.md",
        "../analytics/index.md",
        "../analytics/reports/index.md",
        "../analytics/cases/index.md",
    ):
        assert snippet in process_flows
