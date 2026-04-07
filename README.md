# Greenfield Accounting Dataset Generator

Synthetic accounting dataset for teaching accounting analytics.

Scope:
- Fiscal years 2026 through 2030
- O2C and P2P cycles
- General ledger driven by posting rules
- SQLite and Excel outputs
- Built-in anomaly injection and validation

Primary goal:
Create a reproducible Python generator for a teaching database at scale.

## Project Files

- `Design.md`: full Version 3 design specification
- `PROJECT_PLAN.md`: phased implementation plan
- `SCHEMA_SPEC.md`: table group and schema summary
- `POSTING_RULES.md`: posting-rule summary
- `ROW_VOLUME_MODEL.md`: target row-count model
- `TASKS.md`: implementation checklist

## Development Setup

Install dependencies:

```powershell
pip install -r requirements.txt
```

Run tests:

```powershell
$env:PYTHONPATH = "src"
pytest
```

Generate the full dataset:

```powershell
.\.venv\Scripts\python.exe generate_dataset.py
```

Outputs are written to `outputs/greenfield_2026_2030.sqlite`, `outputs/greenfield_2026_2030.xlsx`, and `outputs/validation_report.json`.
