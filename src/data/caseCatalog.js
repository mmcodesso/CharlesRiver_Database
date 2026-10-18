// Authored case metadata; worked examples use verified company records.
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
    "prerequisiteLinks": [
      {
        "label": "1. Meet the Records",
        "to": "/docs/learn-and-practice/meet-the-records"
      },
      {
        "label": "2. Read an Order",
        "to": "/docs/learn-and-practice/read-an-order"
      },
      {
        "label": "3. Connect the Records",
        "to": "/docs/learn-and-practice/connect-the-records"
      },
      {
        "label": "4. Follow a Goods Sale",
        "to": "/docs/learn-and-practice/source-to-ledger"
      },
      {
        "label": "5. Follow Customer Settlement",
        "to": "/docs/learn-and-practice/follow-customer-settlement"
      },
      {
        "label": "6. Find the Accounting Entries",
        "to": "/docs/learn-and-practice/find-the-accounting-entries"
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Keep the order cohort fixed while changing event cutoffs; distinguish receipt from application and balance each complete voucher."
    ],
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
    "prerequisiteLinks": [
      {
        "label": "1. Meet the Records",
        "to": "/docs/learn-and-practice/meet-the-records"
      },
      {
        "label": "2. Read an Order",
        "to": "/docs/learn-and-practice/read-an-order"
      },
      {
        "label": "3. Connect the Records",
        "to": "/docs/learn-and-practice/connect-the-records"
      },
      {
        "label": "7. Follow Design Time into Billing",
        "to": "/docs/learn-and-practice/follow-design-time-into-billing"
      },
      {
        "label": "12. Turn Records into a Conclusion",
        "to": "/docs/learn-and-practice/turn-records-into-a-conclusion"
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Distinguish work dates, approval dates, billing coverage, and invoice dates; summarize hours and costs at engagement/month grain."
    ],
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
    "prerequisiteLinks": [
      {
        "label": "1. Meet the Records",
        "to": "/docs/learn-and-practice/meet-the-records"
      },
      {
        "label": "2. Read an Order",
        "to": "/docs/learn-and-practice/read-an-order"
      },
      {
        "label": "3. Connect the Records",
        "to": "/docs/learn-and-practice/connect-the-records"
      },
      {
        "label": "8. Follow a Purchase",
        "to": "/docs/learn-and-practice/receipt-to-payable"
      },
      {
        "label": "11. Follow an Estimate into Settlement",
        "to": "/docs/learn-and-practice/follow-an-estimate-into-settlement"
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Aggregate receipt, invoice, payment, and estimate evidence separately; explain GRNI, AP, and accrued-service obligations at each cutoff."
    ],
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
    "prerequisiteLinks": [
      {
        "label": "3. Connect the Records",
        "to": "/docs/learn-and-practice/connect-the-records"
      },
      {
        "label": "9. Follow Manufacturing Costs",
        "to": "/docs/learn-and-practice/manufacturing-cost-flow"
      },
      {
        "label": "12. Turn Records into a Conclusion",
        "to": "/docs/learn-and-practice/turn-records-into-a-conclusion"
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Preserve invoice-line grain; state the limits of current standard costs and separately dated credits in historical comparisons."
    ],
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
    "prerequisiteLinks": [
      {
        "label": "1. Meet the Records",
        "to": "/docs/learn-and-practice/meet-the-records"
      },
      {
        "label": "2. Read an Order",
        "to": "/docs/learn-and-practice/read-an-order"
      },
      {
        "label": "3. Connect the Records",
        "to": "/docs/learn-and-practice/connect-the-records"
      },
      {
        "label": "9. Follow Manufacturing Costs",
        "to": "/docs/learn-and-practice/manufacturing-cost-flow"
      },
      {
        "label": "Manufacturing process chapter",
        "to": "/docs/processes/manufacturing"
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Aggregate issue, labor, completion, and close independently by work order; compare capacity at one row per center/day."
    ],
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
    "prerequisiteLinks": [
      {
        "label": "1. Meet the Records",
        "to": "/docs/learn-and-practice/meet-the-records"
      },
      {
        "label": "2. Read an Order",
        "to": "/docs/learn-and-practice/read-an-order"
      },
      {
        "label": "3. Connect the Records",
        "to": "/docs/learn-and-practice/connect-the-records"
      },
      {
        "label": "10. Follow Hours into Payroll",
        "to": "/docs/learn-and-practice/follow-hours-into-payroll"
      },
      {
        "label": "12. Turn Records into a Conclusion",
        "to": "/docs/learn-and-practice/turn-records-into-a-conclusion"
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Preserve approved-time detail; distinguish identified from unassigned centers and employee-period pay from center workload."
    ],
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
    "prerequisiteLinks": [
      {
        "label": "6. Find the Accounting Entries",
        "to": "/docs/learn-and-practice/find-the-accounting-entries"
      },
      {
        "label": "11. Follow an Estimate into Settlement",
        "to": "/docs/learn-and-practice/follow-an-estimate-into-settlement"
      },
      {
        "label": "12. Turn Records into a Conclusion",
        "to": "/docs/learn-and-practice/turn-records-into-a-conclusion"
      },
      {
        "label": "Case 1: customer account review",
        "to": "/docs/analytics/cases/o2c-trace-case",
        "recommended": true
      },
      {
        "label": "Case 3: supplier obligations",
        "to": "/docs/analytics/cases/p2p-accrual-settlement-case",
        "recommended": true
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Retain full ledger history for openings; distinguish pre-close performance, cash movements, balance snapshots, and complete closing vouchers."
    ],
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
    "prerequisiteLinks": [
      {
        "label": "Complete one earlier process case",
        "to": "/docs/analytics/cases"
      },
      {
        "label": "BPMN Process and Internal Control Workshop",
        "to": "/docs/learn-and-practice/bpmn-controls-workshop",
        "recommended": true
      }
    ],
    "readiness": [
      "Complete your chosen Excel or SQL setup; preserve source row keys and check row counts, unique keys, and amounts after descriptive joins.",
      "Before starting, state the cohort, cutoff, row key, independently aggregated measures, and one evidence limitation.",
      "Define an explicit criterion and denominator; distinguish time entries from people and an exception flag from a proven control failure."
    ],
    "deliverable": "An exception register, two source-supported workpapers, and prioritized control recommendations."
  }
];
export const caseLevels = ["Basic", "Intermediate", "Advanced"];
export default caseCatalog;
