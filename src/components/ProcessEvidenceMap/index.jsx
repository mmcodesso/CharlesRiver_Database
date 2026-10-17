import { useState } from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

const processes = [
  { id: "o2c", name: "Order-to-cash", short: "Sell & collect", href: "/docs/processes/o2c", event: "A customer orders goods. Fulfillment, invoicing, and cash collection occur at distinct stages.", sources: "SalesOrder → Shipment → SalesInvoice → CashReceiptApplication", accounting: "Compare the shipment and invoice evidence with revenue, inventory, receivables, and cash postings. An order alone is not recognized revenue.", decision: "Is the billed sale supported, and has the customer balance been settled?" },
  { id: "p2p", name: "Procure-to-pay", short: "Buy & replenish", href: "/docs/processes/p2p", event: "The business buys inventory or incurs a service cost. Receipt, obligation, and payment timing can differ.", sources: "PurchaseOrder → GoodsReceipt → PurchaseInvoice → DisbursementPayment", accounting: "Trace receipt-matched liabilities separately from service invoices linked to accrual journals. Paying a supplier settles an obligation; it need not create a new expense.", decision: "Which obligations remain unpaid or require a timing reconciliation?" },
  { id: "manufacturing", name: "Manufacturing", short: "Make & complete", href: "/docs/processes/manufacturing", event: "A work order coordinates materials, operations, labor support, completion, and production close.", sources: "WorkOrder → MaterialIssue → ProductionCompletion → WorkOrderClose", accounting: "Distinguish standard-cost inventory postings from the labor support used to explain production activity. Follow work in process and completion evidence before interpreting a variance.", decision: "What supports the cost flow, and which production differences need investigation?" },
  { id: "design-services", name: "Design Services", short: "Deliver expertise", href: "/docs/processes/design-services", event: "A customer engagement uses staffed, approved hours rather than a goods shipment as its billing evidence.", sources: "ServiceEngagement → ServiceTimeEntry → ServiceBillingLine → SalesInvoiceLine", accounting: "Approved hours support service billing. Service-time cost snapshots support margin analysis while employee payroll remains in the ordinary payroll cycle.", decision: "Do billed hours have approval support, and how should service margin be interpreted?" },
  { id: "payroll", name: "Payroll & time", short: "Support the people", href: "/docs/processes/payroll", event: "Scheduled work and recorded attendance feed approved time, payroll calculations, payments, and remittances.", sources: "TimeClockPunch → TimeClockEntry → PayrollRegisterLine → PayrollPayment", accounting: "Reconcile approved time and earnings to payroll expense, liabilities, cash payment, and liability remittance. A recorded punch is not itself a payroll posting.", decision: "Are labor costs supported, and do attendance or approval exceptions need follow-up?" },
  { id: "manual-journals-and-close", name: "Financial close", short: "Reconcile & report", href: "/docs/processes/manual-journals-and-close", event: "Finance reviews operational postings alongside manual accruals, reclasses, and closing entries.", sources: "Source documents + JournalEntry → GLEntry → account-level summaries", accounting: "Separate operating movements from adjustments and close. Reconcile at the correct account, voucher, and reporting-period grain.", decision: "Can the reported balance be explained by traceable evidence and timing?" },
];

export default function ProcessEvidenceMap() {
  return <figure className={styles.map} aria-labelledby="process-map-title">
    <div className={styles.mapTop}><span>Charles River / operating model</span><span aria-hidden="true">01—06</span></div>
    <h2 id="process-map-title" className={styles.mapTitle}>Different processes.<br />Connected accounting evidence.</h2>
    <div className={styles.processes}>{processes.slice(0, 3).map((process, index) => <Link key={process.id} to={process.href}><span aria-hidden="true">0{index + 1}</span><strong>{process.name}</strong><small>{process.short}</small></Link>)}</div>
    <div className={styles.support}>{processes.slice(3).map((process) => <Link key={process.id} to={process.href}>{process.name}</Link>)}</div>
    <div className={styles.connector} aria-hidden="true">↓</div>
    <ol className={styles.flow}>
      <li><span>Evidence</span><strong>Source documents & subledgers</strong><small>Orders · receipts · invoices · time</small></li>
      <li><span>Recognition & reconciliation</span><strong>General ledger / GLEntry</strong><small>Trace source links, amounts, and timing</small></li>
      <li><span>Interpretation</span><strong>Reports → analysis → decisions</strong><small>Explain the result and its limitations</small></li>
    </ol>
    <figcaption>Processes share customers, suppliers, items, people, and accounts. Posting depends on the event and its accounting rules.</figcaption>
  </figure>;
}

export function EvidenceExplorer() {
  const [processId, setProcessId] = useState("o2c");
  const process = processes.find((entry) => entry.id === processId);
  return <div className={styles.explorer}>
    <div className={styles.explorerIntro}><label htmlFor="evidence-process">Choose a business process</label><select id="evidence-process" value={processId} onChange={(event) => setProcessId(event.target.value)}>{processes.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select><p>This is a conceptual reading path. Use the process guide to check the specific document links and posting rules.</p><Link className={styles.guideLink} to={process.href}>Read the {process.name} guide <span aria-hidden="true">→</span></Link></div>
    <div className={styles.evidence} aria-live="polite" aria-atomic="true"><h3>{process.name}: event to decision</h3><ol>
      <li><span>01 / Business event</span><p>{process.event}</p></li>
      <li><span>02 / Source evidence</span><p className={styles.source}>{process.sources}</p></li>
      <li><span>03 / Accounting interpretation</span><p>{process.accounting}</p></li>
      <li><span>04 / Decision question</span><p>{process.decision}</p></li>
    </ol></div>
  </div>;
}
