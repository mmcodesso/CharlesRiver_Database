# Charles River review implementation plan

The two Word reviews are reference findings, checked against source commit `6424f57b684030817fde232e94eb8084238493cf`. The user's request authorizes analysis and website fixes. The pasted editorial brief supplies the requested academic tone and local review workflow. Work is on `codex/review-improvements-2026-10-19`. No publication is part of this pass.

## Implementation sequence

1. Correct F01–F08 in maintained sources. Synchronize case changes through `case-drafts.json` and the content-only authoring command. Preserve old anchors and the legitimate Debt Reclass explanation.
2. Complete F09–F14 using the existing posting reference, evidence template, rubric, workshop, focused modules, and paired tutorials. Add small verified checkpoints and public practice feedback, keeping independent challenge answers private.
3. Review public prose for academic tone and punctuation in context. Preserve technical syntax, numerical results, learning objectives, links, routes, executable examples, functionality, and visual design. Collapse detailed scenario-construction material while retaining its anchor.
4. Validate all 105 named worked queries and three additional manufacturing queries against the checksum-matched published database. Add website regressions for the corrections and new posting-route examples.
5. Run the build only when all existing report assets can be reused. Run website checks and a browser review when available. Compare source and artifact preservation inventories and record actual limitations.

## Evidence and boundaries

`outputs/_site_build/CharlesRiver.sqlite` matches the reviewed teaching checksum `de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c`. `outputs/CharlesRiver.sqlite` is a different local build and will not be used to validate teaching claims. Both files remain unchanged. All SQLite connections use `mode=ro`.

The initial artifact inventory contains 122 existing dataset/report files, including 117 report files. Report validation found 27 missing files. Build preparation has not run. Missing files may be reused from the published site, but no dataset or report generation is permitted. The protected generator/config/query/script diff against the frozen baseline is empty. The pre-existing `tests/test_docs_onboarding_flow.py` difference is a website test change from earlier work and is recorded separately.

Native Windows and Mac Microsoft 365 execution, screen-reader testing, and AIS/analytics learner pilots require those platforms or participants. Source inspection, SQL execution, and browser checks cannot be reported as substitutes.
