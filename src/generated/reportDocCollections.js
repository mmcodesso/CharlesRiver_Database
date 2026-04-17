export const reportAreaCollections = {
  "financial": [
    {
      "processGroup": "monthly-close-and-statements",
      "processGroupLabel": "Monthly Close and Statements",
      "items": [
        {
          "reportKey": "monthly-income-statement"
        },
        {
          "reportKey": "monthly-balance-sheet"
        },
        {
          "reportKey": "monthly-indirect-cash-flow"
        }
      ]
    },
    {
      "processGroup": "revenue-and-working-capital",
      "processGroupLabel": "Revenue and Working Capital",
      "items": [
        {
          "reportKey": "monthly-revenue-and-gross-margin"
        },
        {
          "reportKey": "ar-aging"
        },
        {
          "reportKey": "ap-aging"
        }
      ]
    }
  ],
  "managerial": [
    {
      "processGroup": "performance-and-planning",
      "processGroupLabel": "Performance and Planning",
      "items": [
        {
          "reportKey": "budget-vs-actual-by-cost-center"
        },
        {
          "reportKey": "sales-and-margin-by-collection-and-style"
        },
        {
          "reportKey": "monthly-work-center-utilization"
        },
        {
          "reportKey": "headcount-by-cost-center-and-job-family"
        }
      ]
    }
  ],
  "audit": [
    {
      "processGroup": "control-review",
      "processGroupLabel": "Control Review",
      "items": [
        {
          "reportKey": "approval-and-sod-review"
        },
        {
          "reportKey": "potential-anomaly-review"
        }
      ]
    }
  ]
};
