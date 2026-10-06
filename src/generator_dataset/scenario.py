"""The scenario's anchor year.

Several calibrations were written for the default build, fiscal 2024-2026: the plant's late-year
load uplift and its bridge year (planning.py), cost growth (journals.py), hourly pay growth
(payroll.py), and the dates of the capital plan (config/capex_plan.yaml). They are stated relative
to BASE_END_YEAR. A build whose scenario ends in another year shifts all of them by the same number
of years, so a rolled window (for example fiscal 2025-2027) tells the same story a year later.

The scenario end year is the year of fiscal_year_end unless a settings file sets
scenario_end_year. Test and performance configs whose windows do not end in 2026 pin it to 2026,
so their builds are unchanged.

The storylines of the Accounting Analytics textbook that depend on an accident of the seed (the
traced sale, the revenue cutoff error, the work orders still open at the end) are the "book
scenarios" (settings key book_scenarios, steps in book_scenarios.py and anomalies.py). They are
stated relative to the window (the last fiscal year C, the year before it P) and change nothing
where the storyline already holds, as it does on the default build.
"""

from __future__ import annotations

import pandas as pd

BASE_END_YEAR = 2026
# The date the default build (dataset release v2026.1) was generated. Master data that Faker draws
# relative to "today" (Customer.CustomerSince) is drawn relative to this date instead, moved with the
# scenario, so a build does not depend on the day it runs.
BASE_REFERENCE_DATE = "2026-05-08"

_end_year = BASE_END_YEAR


def configure(settings) -> None:
    """Set the scenario end year for a build (called when its context is created)."""
    global _end_year
    explicit = getattr(settings, "scenario_end_year", None)
    _end_year = int(explicit) if explicit is not None else int(pd.Timestamp(settings.fiscal_year_end).year)


def end_year() -> int:
    return _end_year


def book_scenario(settings_or_context, name: str) -> dict | None:
    """The options of one book scenario, or None when the scenario is off.

    The settings key book_scenarios holds `enabled` (the master switch, off when the key is absent) and one
    entry per scenario; an entry is true, false or a mapping of options.
    """
    settings = getattr(settings_or_context, "settings", settings_or_context)
    section = getattr(settings, "book_scenarios", None)
    if not isinstance(section, dict) or not section.get("enabled", False):
        return None
    option = section.get(name, True)
    if option is None or option is False:
        return None
    return dict(option) if isinstance(option, dict) else {}


def year_offset() -> int:
    """Years between this build's scenario and the default build's."""
    return _end_year - BASE_END_YEAR


def reference_date() -> str:
    """The scenario's stand-in for "today" (BASE_REFERENCE_DATE moved by the scenario offset)."""
    return shift_date(BASE_REFERENCE_DATE)


def shift_date(value: str | None, offset: int | None = None) -> str | None:
    """A YYYY-MM-DD date moved by the scenario offset (February 29 becomes February 28)."""
    if value is None:
        return None
    years = year_offset() if offset is None else offset
    if years == 0:
        return value
    date = pd.Timestamp(value)
    if date.month == 2 and date.day == 29:
        date = date.replace(day=28)
    return date.replace(year=date.year + years).strftime("%Y-%m-%d")
