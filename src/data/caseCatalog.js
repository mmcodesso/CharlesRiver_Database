// Authored case metadata; worked examples are verified against release v2027.1.
export const caseCatalog = [
  {
    "number": 1,
    "slug": "o2c-trace-case",
    "title": "Resolve a Customer Account Review",
    "summary": "What can we tell the customer about delivery, billing, and the amount still unsettled?",
    "level": "Basic",
    "sessions": 2,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "1–6: records, goods sales, settlement, and ledger entries"
    ],
    "prerequisite": {
      "label": "1–6: records, goods sales, settlement, and ledger entries",
      "to": "/docs/learn-and-practice/source-to-ledger"
    },
    "deliverable": "A document timeline, two-date invoice settlement schedule, and a customer response with an action owner."
  },
  {
    "number": 2,
    "slug": "design-services-performance-case",
    "title": "Review Design Work and Billing",
    "summary": "How does design effort become approved work, billed amounts, and recorded cost?",
    "level": "Basic",
    "sessions": 2,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "7: design time and billing",
      "12: summarize evidence"
    ],
    "prerequisite": {
      "label": "7: design time and billing; 12: summarize evidence",
      "to": "/docs/learn-and-practice/follow-design-time-into-billing"
    },
    "deliverable": "An engagement-period reconciliation, an hours/billing/cost bridge, and a design review memo."
  },
  {
    "number": 3,
    "slug": "p2p-accrual-settlement-case",
    "title": "Explain Supplier Obligations at Month End",
    "summary": "Which selected obligations are uninvoiced receipts, supplier payables, or remaining estimates?",
    "level": "Basic",
    "sessions": 2,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "8: purchases and GRNI",
      "11: estimates and settlement"
    ],
    "prerequisite": {
      "label": "8: purchases and GRNI; 11: estimates and settlement",
      "to": "/docs/learn-and-practice/receipt-to-payable"
    },
    "deliverable": "Separate goods and expense-obligation schedules, selected posting checks, and a quarter-end review note."
  },
  {
    "number": 4,
    "slug": "product-portfolio-profitability-case",
    "title": "Choose a Product and Pricing Priority",
    "summary": "Which product group deserves a focused review, and what evidence supports that priority?",
    "level": "Intermediate",
    "sessions": 3,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "3: matching keys",
      "9: manufacturing costs",
      "12: summaries and conclusions"
    ],
    "prerequisite": {
      "label": "3: matching keys; 9: manufacturing costs; 12: summaries and conclusions",
      "to": "/docs/learn-and-practice/turn-records-into-a-conclusion"
    },
    "deliverable": "A product comparison, selected pricing evidence, a simple analytical chart, and a recommendation memo."
  },
  {
    "number": 5,
    "slug": "manufacturing-labor-cost-case",
    "title": "Explain Production Cost and Delivery Pressure",
    "summary": "Do completion, recorded cost, and financial close tell the same production story?",
    "level": "Intermediate",
    "sessions": 3,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "9: manufacturing costs",
      "Manufacturing process chapter"
    ],
    "prerequisite": {
      "label": "9: manufacturing costs; Manufacturing process chapter",
      "to": "/docs/learn-and-practice/manufacturing-cost-flow"
    },
    "deliverable": "A work-order cost bridge, completion/close comparison, capacity evidence, and a production review memo."
  },
  {
    "number": 6,
    "slug": "workforce-coverage-and-attendance-case",
    "title": "Explain Staffing, Overtime, and Payroll Cost",
    "summary": "What do staffing plans, approved work, and paid cost actually establish?",
    "level": "Intermediate",
    "sessions": 3,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "10: hours and payroll",
      "12: summaries and conclusions"
    ],
    "prerequisite": {
      "label": "10: hours and payroll; 12: summaries and conclusions",
      "to": "/docs/learn-and-practice/follow-hours-into-payroll"
    },
    "deliverable": "A coverage comparison, employee-period pay reconciliation, settlement schedule, and staffing recommendation."
  },
  {
    "number": 7,
    "slug": "financial-statement-bridge-case",
    "title": "Explain Profit, Cash, and the Year-End Close",
    "summary": "How can the company report profit while cash falls, and what does the year-end close change?",
    "level": "Advanced",
    "sessions": 4,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "6: ledger entries",
      "11: estimates and settlement",
      "12: summaries; Cases 1 and 3 recommended"
    ],
    "prerequisite": {
      "label": "6: ledger entries; 11: estimates and settlement; 12: summaries; Cases 1 and 3 recommended",
      "to": "/docs/learn-and-practice/find-the-accounting-entries"
    },
    "deliverable": "A full-history balance rollforward, profit/cash bridge, selected source reconciliation, and management review memo."
  },
  {
    "number": 8,
    "slug": "audit-review-pack-case",
    "title": "Investigate Exceptions and Recommend Controls",
    "summary": "Which query flags become supported findings, and what control could be assessed?",
    "level": "Advanced",
    "sessions": 4,
    "tools": [
      "Excel",
      "SQL"
    ],
    "prerequisites": [
      "One earlier process case",
      "Controls Workshop recommended"
    ],
    "prerequisite": {
      "label": "One earlier process case; Controls Workshop recommended",
      "to": "/docs/learn-and-practice/bpmn-controls-workshop"
    },
    "deliverable": "An exception register, two source-supported workpapers, and prioritized control recommendations."
  }
];
export const caseLevels = ["Basic", "Intermediate", "Advanced"];
export default caseCatalog;
