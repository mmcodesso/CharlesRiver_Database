from dataclasses import replace
from pathlib import Path

from greenfield_dataset.anomalies import inject_anomalies
from greenfield_dataset.exporters import export_excel, export_sqlite, export_validation_report
from greenfield_dataset.main import build_phase6
from greenfield_dataset.validations import validate_phase7


def test_phase7_anomalies_and_exports(tmp_path: Path) -> None:
    context = build_phase6()
    context.settings = replace(
        context.settings,
        sqlite_path=str(tmp_path / "greenfield.sqlite"),
        excel_path=str(tmp_path / "greenfield.xlsx"),
        validation_report_path=str(tmp_path / "validation_report.json"),
    )

    inject_anomalies(context)
    results = validate_phase7(context)
    export_sqlite(context)
    export_excel(context)
    export_validation_report(context)

    assert results["exceptions"] == []
    assert results["anomaly_count"] > 0
    assert results["gl_balance"]["exception_count"] == 0
    assert (tmp_path / "greenfield.sqlite").exists()
    assert (tmp_path / "greenfield.xlsx").exists()
    assert (tmp_path / "validation_report.json").exists()
