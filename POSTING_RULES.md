# Posting Rules

Posting logic will be centralized in `src/greenfield_dataset/posting_engine.py`.

## Base Events

Non-posting events:
- Sales order creation
- Purchase requisition creation
- Purchase order creation

Posting events:
- Shipment: debit COGS, credit Inventory
- Sales invoice: debit Accounts Receivable, credit Revenue and Sales Tax Payable
- Cash receipt: debit Cash, credit Accounts Receivable
- Goods receipt: debit Inventory, credit Goods Received Not Invoiced
- Purchase invoice: debit Goods Received Not Invoiced and variance as needed, credit Accounts Payable
- Disbursement payment: debit Accounts Payable, credit Cash
- Manual journal: balanced debit and credit lines by entry type

## Guardrails

Every posting event must:
- Produce balanced debits and credits by voucher
- Include source document traceability
- Include posting date, fiscal year, and fiscal period
- Include creator information
- Preserve overall ledger balance even when planted anomalies are present
