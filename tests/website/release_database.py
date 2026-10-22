"""Select an existing checksum-matched teaching database without generating files."""
import hashlib
import os
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
RELEASE_SHA256='de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c'


def select_release_database():
    explicit=os.environ.get('CHARLES_RIVER_TEACHING_SQLITE')
    if explicit:return ROOT/explicit
    candidates=[ROOT/'outputs/_site_build/CharlesRiver.sqlite',ROOT/'outputs/CharlesRiver.sqlite']
    for path in candidates:
        if not path.is_file():continue
        with path.open('rb') as source:
            if hashlib.file_digest(source,'sha256').hexdigest()==RELEASE_SHA256:return path
    # Keep a clear missing/mismatched-file diagnostic in each calling fixture.
    return candidates[0]
