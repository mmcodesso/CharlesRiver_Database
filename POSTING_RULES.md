# Posting Rules

Posting logic is implemented in `src/greenfield_dataset/posting_engine.py`.

The posting engine converts operational source documents into balanced `GLEntry` rows. Sales orders, purchase requisitions, and purchase orders are non-posting documents.

## Posting Events

| Event | Debit | Credit | Source |
|---|---|---|---|
| Shipment | Item COGS account | Item inventory account | `Shipment` and `ShipmentLine` |
| Sales invoice | Accounts Receivable | Item revenue account and Sales Tax Payable | `SalesInvoice` and `SalesInvoiceLine` |
| Cash receipt | Cash | Accounts Receivable | `CashReceipt` |
| Goods receipt | Item inventory account | Goods Received Not Invoiced | `GoodsReceipt` and `GoodsReceiptLine` |
| Purchase invoice | Goods Received Not Invoiced and Purchase Price Variance as needed | Accounts Payable and Purchase Price Variance as needed | `PurchaseInvoice` and `PurchaseInvoiceLine` |
| Disbursement | Accounts Payable | Cash | `DisbursementPayment` |

## Account Mappings

Core control accounts are loaded from `config/accounts.csv`.

Frequently used control accounts:

- `1010` Cash and Cash Equivalents
- `1020` Accounts Receivable
- `1040` Inventory - Finished Goods
- `1045` Inventory - Materials and Packaging
- `2010` Accounts Payable
- `2020` Goods Received Not Invoiced
- `2050` Sales Tax Payable
- `5060` Purchase Price Variance

Item-specific revenue, COGS, inventory, and variance accounts are stored on `Item`.

## Posting Guardrails

Every posting event must:

- Produce balanced debits and credits by voucher
- Include voucher type and voucher number
- Include source document type, source document ID, and source line ID where applicable
- Include posting date, fiscal year, and fiscal period
- Include creator or approver information when available
- Preserve ledger balance even after anomaly injection

## Validation

`src/greenfield_dataset/validations.py` checks:

- Voucher-level balance
- Trial balance equality
- AR roll-forward against invoices and receipts
- AP roll-forward against purchase invoices and disbursements
- Inventory roll-forward against goods receipts and shipments
- COGS agreement with shipment standard cost
- GRNI roll-forward against goods receipts and cleared purchase invoices
