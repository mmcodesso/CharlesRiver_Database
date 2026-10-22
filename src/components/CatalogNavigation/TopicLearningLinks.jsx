import Link from '@docusaurus/Link';

// Shared reading paths; query/report IDs and their source catalogs stay frozen.
export const topicLearningLinks = {
  'statements-and-cash': [
    ['Journals and Close', '/docs/processes/manual-journals-and-close'],
    ['Accounting core tables', '/docs/reference/schema#accounting-core'],
    ['Estimate and settlement practice', '/docs/learn-and-practice/follow-an-estimate-into-settlement'],
    ['Profit, cash, and close case', '/docs/analytics/cases/financial-statement-bridge-case'],
  ],
  'sales-and-customers': [
    ['Order-to-Cash', '/docs/processes/o2c'],
    ['Sales and customer tables', '/docs/reference/schema#order-to-cash'],
    ['Customer settlement practice', '/docs/learn-and-practice/follow-customer-settlement'],
    ['Customer account case', '/docs/analytics/cases/o2c-trace-case'],
    ['Design Services', '/docs/processes/design-services'],
  ],
  'purchasing-and-inventory': [
    ['Procure-to-Pay', '/docs/processes/p2p'],
    ['Purchasing tables', '/docs/reference/schema#procure-to-pay'],
    ['Receipt-to-payable practice', '/docs/learn-and-practice/receipt-to-payable'],
    ['Supplier obligations case', '/docs/analytics/cases/p2p-accrual-settlement-case'],
  ],
  'production-and-planning': [
    ['Manufacturing', '/docs/processes/manufacturing'],
    ['Production tables', '/docs/reference/schema#manufacturing'],
    ['Manufacturing cost practice', '/docs/learn-and-practice/manufacturing-cost-flow'],
    ['Production cost case', '/docs/analytics/cases/manufacturing-labor-cost-case'],
  ],
  'people-and-payroll': [
    ['Payroll', '/docs/processes/payroll'],
    ['Payroll and time tables', '/docs/reference/schema#payroll-and-time'],
    ['Hours-to-payroll practice', '/docs/learn-and-practice/follow-hours-into-payroll'],
    ['Staffing and payroll case', '/docs/analytics/cases/workforce-coverage-and-attendance-case'],
  ],
  'controls-and-exceptions': [
    ['Process responsibilities and controls', '/docs/process-flows'],
    ['Source traceability', '/docs/reference/posting#source-traceability'],
    ['BPMN and controls workshop', '/docs/learn-and-practice/bpmn-controls-workshop'],
    ['Exceptions and controls case', '/docs/analytics/cases/audit-review-pack-case'],
  ],
};

export default function TopicLearningLinks({ topicId }) {
  return <p><strong>Connect the evidence:</strong>{' '}{topicLearningLinks[topicId].map(([label, to], index) => (
    <span key={to}>{index > 0 ? ' · ' : ''}<Link to={to}>{label}</Link></span>
  ))}</p>;
}
