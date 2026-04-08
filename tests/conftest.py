from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from greenfield_dataset.main import build_full_dataset
from greenfield_dataset.settings import load_settings


@pytest.fixture(scope="session")
def full_dataset_artifacts(tmp_path_factory: pytest.TempPathFactory) -> dict[str, object]:
    workdir = tmp_path_factory.mktemp("full_dataset")
    settings = load_settings("config/settings.yaml")
    payload = dict(vars(settings))
    payload.update({
        "anomaly_mode": "none",
        "export_sqlite": True,
        "export_excel": False,
        "sqlite_path": str(workdir / "greenfield.sqlite"),
        "excel_path": str(workdir / "greenfield.xlsx"),
        "validation_report_path": str(workdir / "validation_report.json"),
        "generation_log_path": str(workdir / "generation.log"),
    })

    config_path = workdir / "settings.yaml"
    config_path.write_text(yaml.safe_dump(payload, sort_keys=False), encoding="utf-8")

    context = build_full_dataset(config_path)
    return {
        "context": context,
        "workdir": workdir,
        "sqlite_path": Path(payload["sqlite_path"]),
        "validation_report_path": Path(payload["validation_report_path"]),
        "generation_log_path": Path(payload["generation_log_path"]),
    }
