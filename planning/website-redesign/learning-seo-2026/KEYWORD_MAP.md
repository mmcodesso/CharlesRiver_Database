# Instructional search-intent map

Targets reflect existing material, not search-volume or ranking estimates. The first destination is the primary substantive page; supporting pages deepen the investigation. Use ordinary terminology in descriptions and contextual links, without new thin pages or changes to SQL. Levels below follow existing prerequisites and catalog levels, rather than new credential claims.

| Search intent / instructional terms | Primary destination | Supporting resource / limitation |
|---|---|---|
| accounting information systems exercises; AIS teaching cases | `/docs/learn-and-practice` | `/docs/analytics/cases`; instructor adoption for curriculum selection |
| accounting business process examples; business processes in accounting systems | `/docs/process-flows` | Six existing process guides and editable BPMN models |
| accounting source-to-ledger process; ERP accounting transaction flow | `/docs/learn-and-practice/source-to-ledger` | `/docs/reference/posting`; teaching process evidence, not a live ERP implementation |
| order to cash accounting process; O2C accounting example | `/docs/processes/o2c` | Company Story, goods-sale and settlement lessons |
| order to cash BPMN | `/docs/processes/o2c` | `/docs/process-flows`; existing editable diagrams, not executable BPMN XML |
| accounts receivable transaction flow | `/docs/learn-and-practice/follow-customer-settlement` | Query Library `#sales-and-customers` and customer account case |
| customer order to general ledger | `/docs/learn-and-practice/find-the-accounting-entries` | Goods sale lesson; order itself is non-posting |
| procure to pay accounting process; P2P accounting example | `/docs/processes/p2p` | Receipt-to-payable lesson and purchasing schema |
| purchase order to accounts payable | `/docs/learn-and-practice/receipt-to-payable` | Supplier obligations case; distinguish commitment, receipt and invoice |
| supplier payment accounting process | `/docs/processes/p2p` | Supplier obligations case and accrual-settlement lesson |
| accounts payable data analysis | `/docs/analytics/analysis-tracks#purchasing-and-inventory` | Reports with the same topic; original AP SQL retained |
| manufacturing accounting process; production cost accounting example | `/docs/processes/manufacturing` | Manufacturing cost-flow lesson and posting reference |
| managerial accounting database exercises | `/docs/analytics/cases` | Product/pricing, production cost and staffing cases; intermediate prerequisites |
| manufacturing cost analysis | `/docs/analytics/cases/manufacturing-labor-cost-case` | Query/report `#production-and-planning`; actual costs versus standard-cost posting limitations preserved |
| make or buy accounting case | No direct Charles River case target | Do not relabel the production case as make-or-buy. The companion textbook has a separate “Make, Buy, or Reprice” chapter; conceptual ownership stays there. |
| SQL for accountants; accounting database tutorial | `/docs/analytics/sql-guide` | Setup and first query, then the twelve lessons; no duplicated textbook SQL chapters |
| accounting SQL exercises; SQL accounting practice | `/docs/learn-and-practice` | Both Excel and SQL routes; eight subsequent cases |
| SQL joins for accounting | `/docs/learn-and-practice/connect-the-records` | Schema join keys and row-grain guidance; textbook joining/summarizing link retained |
| SQL queries for general ledger | `/docs/analytics/analysis-tracks#statements-and-cash` | Posting reference and accounting-entry lesson |
| accounting data analysis examples | `/docs/analytics` | Visible reports, interpretation prompts and exact SQL links |
| auditing analytics exercises; audit data analytics examples | `/docs/analytics/cases/audit-review-pack-case` | Advanced case after foundational process work; workshop and Query Library |
| accounting anomaly detection | `/docs/analytics/analysis-tracks#controls-and-exceptions` | Existing anomaly coverage explains flags and limitations; no misconduct inference |
| internal control analysis with SQL | `/docs/learn-and-practice/bpmn-controls-workshop` | Exceptions case and existing audit queries; control design versus effectiveness remains distinct |
| transaction tracing in auditing | `/docs/analytics/cases/o2c-trace-case` | Customer-account evidence trace plus advanced audit case; do not market the basic case as a complete audit |
| general ledger reconciliation examples | `/docs/analytics/analysis-tracks#guided-query-paths` | Statement bridge case and control-account queries |
| accounting database tables and relationships | `/docs/reference/schema` | Dataset Guide for beginners; all 82 physical tables verified read-only |
| accounting dataset downloads; SQLite Excel CSV setup | `/docs/downloads` | Hub owns broad publication discovery; practical file guidance stays here |

Implementation uses specific metadata, visible process exits and catalog reading paths. Existing query metadata already searches titles, objectives, source tables and output grain. No technique filter is added: a reliable SQL-technique classification would require a separate reviewed catalog, while the existing tutorials already teach joins, aggregation, grain and cutoffs.
