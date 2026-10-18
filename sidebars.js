/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    {
      type: "category",
      label: "Getting Started",
      link: { type: "doc", id: "start-here/index" },
      collapsed: false,
      items: [
        "start-here/why-this-dataset",
        "start-here/downloads",
        "start-here/dataset-overview",
      ],
    },
    {
      type: "doc",
      id: "learn-the-business/company-story",
      label: "The Company",
    },
    {
      type: "category",
      label: "Business Processes",
      link: { type: "doc", id: "learn-the-business/process-flows" },
      items: [
        "processes/o2c",
        "processes/design-services",
        "processes/p2p",
        "processes/manufacturing",
        "processes/payroll",
        "processes/manual-journals-and-close",
      ],
    },
    {
      type: "category",
      label: "Learn and Practice",
      link: { type: "doc", id: "learn-and-practice/index" },
      items: [
        "learn-and-practice/meet-the-records",
        "learn-and-practice/read-an-order",
        "learn-and-practice/connect-the-records",
        "learn-and-practice/source-to-ledger",
        "learn-and-practice/follow-customer-settlement",
        "learn-and-practice/find-the-accounting-entries",
        "learn-and-practice/follow-design-time-into-billing",
        "learn-and-practice/receipt-to-payable",
        "learn-and-practice/manufacturing-cost-flow",
        "learn-and-practice/follow-hours-into-payroll",
        "learn-and-practice/follow-an-estimate-into-settlement",
        "learn-and-practice/turn-records-into-a-conclusion",
        "analytics/excel-guide",
        "analytics/sql-guide",
        "learn-and-practice/bpmn-controls-workshop",
      ],
    },
    {
      type: "category",
      label: "Cases",
      link: { type: "doc", id: "analytics/cases/index" },
      items: [
        "analytics/cases/o2c-trace-case",
        "analytics/cases/design-services-performance-case",
        "analytics/cases/p2p-accrual-settlement-case",
        "analytics/cases/product-portfolio-profitability-case",
        "analytics/cases/manufacturing-labor-cost-case",
        "analytics/cases/workforce-coverage-and-attendance-case",
        "analytics/cases/financial-statement-bridge-case",
        "analytics/cases/audit-review-pack-case",
      ],
    },
    {
      type: "doc",
      label: "Reports and Analytics",
      id: "analytics/index",
    },
    {
      type: "doc",
      label: "Query Library",
      id: "analytics/analysis-tracks",
    },
    {
      type: "category",
      label: "Dataset Reference",
      items: ["reference/schema", "reference/posting"],
    },
    {
      type: "doc",
      id: "teach-with-data/instructor-guide",
      label: "For Instructors",
    },
    {
      type: "category",
      label: "Technical",
      items: [
        "technical/technical-guide",
        "technical/dataset-delivery",
        "technical/roadmap",
        "technical/contributing",
        "technical/license",
      ],
    },
  ],
};

module.exports = sidebars;
