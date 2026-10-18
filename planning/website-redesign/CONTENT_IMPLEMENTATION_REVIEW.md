# Opening content implementation review — 17 October 2026

## Result and scope

Rewrote the 12 opening pages for accounting undergraduates, with a self-contained first reading, one recurring fictional company situation, and optional technical depth. Company Story and Order-to-Cash were drafted and reviewed together before applying the approach to the remaining pages. Each page was reviewed for its learning outcome, prerequisites, narrative transition, technical distinctions, and retained references. Final sequential review followed Start Here → Company → Business Processes → O2C → Design Services → P2P → Manufacturing → Payroll → Journals and Close → Learn and Practice.

Changes are in the local working tree for content review. No commit, push, merge, release, or deployment was performed in this content stage. The existing production site remains the previously published redesign. Preview the current built content at http://localhost:3000/docs/company-story or http://localhost:3000/docs. The existing port-3000 preview server was reused.

## Page-by-page review

Main-reading word counts are approximate; they exclude the optional reference appendix and diagram code, but include concept checks and visible table text. They are guides rather than test assertions.

| Page | Main reading | Learning outcome and editorial change | Optional material / correction |
|---|---:|---|---|
| Start Here | 426 | Establish the learner's role and a company-first reading path without tools | Downloads, motivation, dataset guide, and instructor adoption are supporting links rather than competing curricula |
| Why This Dataset | 527 | Explain why a total cannot answer delivery, billing, and settlement questions | Cross-course applications are expandable; removed premature identifier lists |
| Downloads | 532 | Choose a format, preserve a source copy, and confirm that a file opens | Preserved direct published formats, release/date boundaries, and the separate course support-workbook distinction |
| Dataset Guide | 948 | Understand records, tables, header/line grain, keys, and related events | Retained table inventory, identifiers, navigation paths, posting categories, and glossary; replaced discipline-based entry lists with process entry points; added a verified two-line order example |
| Company Story | 1,415 | Explain customer needs, fictional business development, recurring roles, and departmental dependencies | Removed the duplicated company-wide process diagram; clearly separated illustrative history/roles from released records |
| Business Processes | 777 | Read a handoff and distinguish responsibilities, documents, accounting, and diagram purposes | Architecture BPMN, editable library, expanded notation, evidence boundaries, and analysis bridges remain expandable |
| Order-to-Cash | 1,158 | Distinguish order, shipment, invoice, receipt, and application | Retained detailed tables, postings, joins, pricing, commissions, returns, controls, and AIS activity; reduced duplicate design-service exposition; clarified modeled endpoint versus full settlement |
| Design Services | 946 | Distinguish engagement, approved time, monthly billing, payroll expense, and labor-margin scope | Retained staffing/billing/costing reference and AIS activity; reused O2C settlement explanation |
| Procure-to-Pay | 1,124 | Distinguish internal request, commitment, receipt, GRNI, supplier invoice, and payment | Retained planning detail, accrued services, CAPEX pointers, matching/control detail, and AIS activity |
| Manufacturing | 1,301 | Explain component use, WIP, labor support, standard-cost completion, and close | Retained MRP/capacity, recipe/routing, schedules, component/labor paths, close/variance model, equipment-cost references, and AIS activity |
| Payroll | 1,074 | Distinguish expected work, raw evidence, approved time, gross-to-net, net pay, and remittances | Retained attendance investigations, manufacturing reclasses, service labor, joins, and AIS activity; kept employee and period-level grain explicit |
| Journals and Close | 1,193 | Explain expense estimates, later AP settlement, adjustments, and annual boundaries | Retained asset/debt/manufacturing-support journals, settlement model, and AIS activity; corrected the direction of the unused accrual residual |

Optional analytical introductions were also revised to ask concrete business questions instead of repeating “Students should use this subsection.” Former “Common Student Questions” sections now identify further investigations. The primary reading ends with a single chapter continuation; optional reference remains below it.

## Navigation and interaction

- All 12 public routes and all 175 previously rendered heading anchors were preserved; old headings moved to descriptive headings or compatibility anchors. No duplicate HTML IDs were found on the changed pages.
- Explicit previous/next metadata follows the main story sequence. The alternate route is Downloads → Dataset Guide → source-to-ledger exercise. Short process sidebar labels keep the existing navigation compact.
- Added `src/theme/MDXContent/index.jsx` to open ancestor disclosures for a linked heading and position the target after Docusaurus's actual height transition. This preserves links into material moved inside details, including long sections and reduced-motion transitions.
- Kept existing diagram components, model IDs, SVG/Draw.io sources, shared viewers, and zoom/pan/close controls. Main process readings have one BPMN and one concise Mermaid view; specialized material remains accessible below.

## Evidence and validation

1. `pwsh -NoProfile -File planning/website-redesign/verify-freeze.ps1`: passed before editing and after implementation. Protected tracked paths match baseline `7c21218dce19201013f7a71eb7263e12a85af09a`; all 293 frozen dataset/report artifacts match SHA-256.
2. `node scripts/validate-report-assets.mjs`: passed before the build. Existing report assets were complete.
3. `npm run build`: passed. A final build after the anchor-scrolling improvement and short sidebar labels also passed. Prebuild refreshed branding and manifests through their existing scripts with no tracked generated-file diff; report assets were reused, never regenerated.
4. `node --test tests/website/navigation-seo.test.cjs tests/website/rendered-site.test.cjs`: all 17 tests passed after the final build. Invoked through a Node child process with a 3,600,000 ms timeout.
5. Read-only rendered-HTML validation: all 175 old heading anchors retained, no duplicate IDs, all 347 local fragment-link instances on the 12 pages resolve, all nine primary forward transitions and their configured previous links match the reading sequence, and both alternate resource transitions match their targets.
6. `git diff --check`: passed.
7. Read-only SQLite inspection used the checksum-matched v2027.1 file with Node `DatabaseSync(..., {readOnly: true})`. Confirmed the 82-table count, customer segments, item supply modes, source labels, relevant posting accounts, the order-grain example, and the accrual residual with its debit/credit support. The editorial reference records the example keys and amounts. No SQL or generator logic changed.
8. Browser review of the production build: desktop Company Story and O2C; tablet process hub at 768 × 1024; mobile Payroll and Manufacturing at 390 × 844. No document-level horizontal overflow at the reviewed tablet/mobile widths. Keyboard Enter expanded a payroll concept answer. BPMN and Mermaid opened from their previews; zoom/reset and Escape worked, with focus returning to the opener. An old O2C reference link opened its disclosure and positioned the heading at the top of the readable area. A mobile manufacturing deep link opened the analytical appendix; its Mermaid diagrams rendered and expanded. Temporary viewport overrides were reset.

## Limitations and preserved material

The repo-local Python launcher references an unavailable Python 3.12 installation. Its initial read-only inspection attempt failed before running Python. The environment was not changed; Node's read-only SQLite support performed the claim inspection. No Python or full generator test suite ran, because this stage changed presentation and content only. Existing frozen generator tests include older documentation expectations, as already recorded in the earlier consolidation reviews.

Build output retained a dependency-analysis warning from `vscode-languageserver-types`, a stale Browserslist notice on the initial build, and an update-check permission notice. Builds completed successfully. Browser review covered representative pages and interactions; it is not a claim of comprehensive accessibility conformance or user learning-outcome testing.

The process-led teaching sequence, required case headings, query/report links and catalogs, downloads, and dataset/report outputs were preserved. Cases and exercises were not rewritten. No dataset build variant was generated; verification used the frozen published teaching release. The accounting correction changes explanatory prose only.

## Review entry points

- Company pilot: http://localhost:3000/docs/company-story
- O2C pilot: http://localhost:3000/docs/processes/o2c
- Full reading: http://localhost:3000/docs
- Editorial canon and technical evidence: `CONTENT_EDITORIAL_REFERENCE.md`
- Desktop preview screenshot: `C:/Users/mauri/.codex/visualizations/2026/10/17/01a14b63-9f20-73d3-9d97-728d932ef429/charles-river-content-preview.png`
