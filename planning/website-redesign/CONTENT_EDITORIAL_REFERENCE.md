# Opening content: editorial reference

## Agreed reading and voice

Audience: accounting undergraduates with basic financial accounting; no assumed SQL, ERP, or BPMN. The first reading requires no files or tools. Introduce a concrete business event, its accounting effect, and then the supporting records. Use direct explanations and ordinary business terms before identifiers. Keep one primary continuation and optional reference material below it.

Primary path: Start Here → Company Story → Business Processes → Order-to-Cash → Design Services → Procure-to-Pay → Manufacturing → Payroll → Journals and Close → Learn and Practice. Supporting path: Downloads → Dataset Guide → source-to-ledger exercise. Why This Dataset is optional motivation.

## Fictional narrative canon

Charles River is a greater-Boston home-furnishings company. The explicitly fictional backstory develops from regional merchandise resale into selected manufacturing and hourly design services; it supplies no founding dates, financial results, or historical records. A design-trade buyer coordinates furnishings and design help for a client. Use this same situation across chapters without inventing a customer identity or a matching dataset order.

Recurring roles: sales coordinator records customer demand; operations planner connects demand to supply and production; design lead arranges staffing and time support; controller explains accounting and period-end balances. Receiving, warehouse, production, customer accounting, AP, payroll, and treasury appear at the appropriate handoffs. These are narrative responsibilities, never employee-ID assignments or proof of segregation of duties.

Purchasing, manufacturing, payroll, and finance serve the wider company. Narrative continuity never implies that all records belong to the customer's project. The chapter order is instructional; business cycles overlap and cross periods.

## Evidence and technical boundaries

Baseline verification passed before editing: protected paths unchanged from 7c21218dce19201013f7a71eb7263e12a85af09a; all 293 existing dataset/report SHA-256 hashes match. Release v2027.1 SQLite SHA-256: de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c. It contains 82 user tables. Inspect using SQLite read-only access only.

The repo-local Python launcher currently references an unavailable Python 3.12 installation. Read-only claim inspection uses Node's built-in SQLite DatabaseSync with readOnly:true; it does not change or rebuild the Python environment.

Verified release examples: SalesOrderID 11 / SO-2024-000011 has two lines and OrderTotal 11397.78. Repeating its header alongside both lines does not create two orders or two order totals. Accrual JournalEntryID 9 estimates 10039.33; linked invoice lines total 10019.59; linked Accrual Adjustment is 19.74. This supports correcting the old 'under-accrual residual' description to the unused part of an estimate larger than the invoice. Record-specific examples must identify their release and must not be presented as the fictional project.

Preserve these distinctions: receipt versus cash application; service time versus invoiced revenue and payroll cost; receipt-matched AP versus accrued-service settlement; standard-cost completion versus actual labor support and work-order close; raw punches versus approved hourly time; employee payment versus liability remittance; monthly adjustments versus annual close. Controls not established by stored records remain proposed teaching controls.

## Content ownership

Start Here owns orientation; Why This Dataset owns motivation; Downloads owns formats and opening checks; Dataset Guide owns records, tables, grain, and relationships. Company Story owns background and roles; Business Processes owns the cross-company map and diagram reading guide. Each process owns its normal events and accounting distinctions, with existing technical detail preserved in optional sections. Schema and Posting Reference retain exact definitions. Existing cases, report and query libraries retain their current scope.

## Review method

Review Company Story and Order-to-Cash as a pair first, then the other pages individually. Check voice, prerequisites, continuity, fictional boundaries, accounting accuracy, old anchors, and the primary transition. Record each page's outcome, optional material, and corrections in the implementation handoff. Finish by reading the complete journey and validating rendered pages, navigation, diagrams, and the artifact freeze.
