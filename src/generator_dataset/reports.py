from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_REPORT_CATALOG_PATH = REPO_ROOT / "config" / "report_catalog.yaml"


@dataclass(frozen=True)
class ReportDefinition:
    slug: str
    title: str
    area: str
    process_group: str
    cadence: str
    description: str
    query_path: str
    preview_row_limit: int
    excel_enabled: bool
    csv_enabled: bool

    @property
    def query_file(self) -> Path:
        return resolve_repo_path(self.query_path)

    @property
    def asset_parts(self) -> tuple[str, str, str]:
        return (self.area, self.process_group, self.slug)


def resolve_repo_path(value: str | Path) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path
    return REPO_ROOT / path


def _normalize_catalog_path(catalog_path: str | Path | None) -> Path:
    if catalog_path is None:
        return DEFAULT_REPORT_CATALOG_PATH
    return resolve_repo_path(catalog_path)


def _validate_entry(entry: dict[str, Any], catalog_path: Path) -> ReportDefinition:
    required_fields = {
        "slug",
        "title",
        "area",
        "process_group",
        "cadence",
        "description",
        "query_path",
    }
    missing_fields = sorted(field for field in required_fields if field not in entry)
    if missing_fields:
        raise ValueError(f"Missing report fields in {catalog_path}: {', '.join(missing_fields)}")

    return ReportDefinition(
        slug=str(entry["slug"]),
        title=str(entry["title"]),
        area=str(entry["area"]),
        process_group=str(entry["process_group"]),
        cadence=str(entry["cadence"]),
        description=str(entry["description"]),
        query_path=str(entry["query_path"]),
        preview_row_limit=int(entry.get("preview_row_limit", 25) or 25),
        excel_enabled=bool(entry.get("excel_enabled", True)),
        csv_enabled=bool(entry.get("csv_enabled", True)),
    )


def load_report_catalog(catalog_path: str | Path | None = None) -> list[ReportDefinition]:
    resolved_path = _normalize_catalog_path(catalog_path)
    with resolved_path.open("r", encoding="utf-8") as handle:
        raw = yaml.safe_load(handle) or {}

    if isinstance(raw, dict):
        entries = raw.get("reports", [])
    elif isinstance(raw, list):
        entries = raw
    else:
        raise ValueError(f"Report catalog must contain a list or mapping: {resolved_path}")

    if not isinstance(entries, list):
        raise ValueError(f"Report catalog 'reports' must be a list: {resolved_path}")

    catalog = []
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError(f"Report entries must be mappings: {resolved_path}")
        catalog.append(_validate_entry(entry, resolved_path))

    return catalog
