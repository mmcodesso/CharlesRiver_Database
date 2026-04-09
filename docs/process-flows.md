# Process Flows

**Audience:** Students, instructors, and analysts who need a plain-language explanation of how transactions move through the database.  
**Purpose:** Show the O2C flow, the P2P flow, and the bridge from source documents to the general ledger.  
**What you will learn:** Which tables represent each business step, when accounting happens, and how learners can trace transactions across the database.

> **Implemented in current generator:** O2C and P2P operational flows, customer deposits and cash applications, returns and credit memos, opening balances, recurring manual journals, year-end close, and event-based postings into `GLEntry`.

> **Planned future extension:** Manufacturing process flows.

## Order-to-Cash Flow

```mermaid
flowchart LR
    C[Customer]
    SO[SalesOrder]
    SOL[SalesOrderLine]
    SH[Shipment]
    SHL[ShipmentLine]
    SI[SalesInvoice]
    SIL[SalesInvoiceLine]
    CR[CashReceipt]
    CRA[CashReceiptApplication]
    SR[SalesReturn]
    CM[CreditMemo]
    RF[CustomerRefund]
    GL[GLEntry]

    C --> SO --> SOL --> SH --> SHL --> SI --> SIL
    C --> CR --> CRA
    SIL --> SR --> CM --> RF
    SH -. Posts COGS and Inventory .-> GL
    SI -. Posts AR, Revenue, and Sales Tax .-> GL
    CR -. Posts Cash and Unapplied Cash .-> GL
    CRA -. Posts Unapplied Cash and AR .-> GL
    SR -. Posts Inventory and COGS reversal .-> GL
    CM -. Posts Contra Revenue, Sales Tax reversal, AR or Customer Credit .-> GL
    RF -. Posts Customer Credit and Cash .-> GL
```

In the current generator, a customer places a sales order, the company ships goods as inventory becomes available, the company bills the customer from exact shipment lines, and later collects cash through customer-level receipts that may be applied across multiple invoices. Some receipts remain temporarily unapplied as deposits. The generator also supports sales returns, credit memos, and customer refunds.

| Business event | Main tables | When accounting happens | Typical student questions |
|---|---|---|---|
| Customer setup | `Customer` | No posting | Which customers drive the most revenue? |
| Order capture | `SalesOrder`, `SalesOrderLine` | No posting | Which products and sales reps drive demand? |
| Goods shipped | `Shipment`, `ShipmentLine` | Shipment posts COGS and inventory relief | Were orders backordered? What cost left inventory, and when? |
| Customer billed | `SalesInvoice`, `SalesInvoiceLine` | Invoice posts AR, revenue, and sales tax | Which shipment lines were billed, when, and at what margin? |
| Cash collected | `CashReceipt`, `CashReceiptApplication` | Receipt posts cash to unapplied cash, application clears AR | Which receipts were deposits? Which invoices remain open? |
| Customer return | `SalesReturn`, `SalesReturnLine` | Return posts inventory back in and reverses COGS | Which shipment lines came back, and why? |
| Credit and refund | `CreditMemo`, `CreditMemoLine`, `CustomerRefund` | Credit memo posts contra revenue and reduces AR or creates customer credit; refund clears customer credit | Which returns reduced open AR versus required cash refund? |

## Procure-to-Pay Flow

```mermaid
flowchart LR
    S[Supplier]
    PR[PurchaseRequisition]
    PO[PurchaseOrder]
    POL[PurchaseOrderLine]
    GR[GoodsReceipt]
    GRL[GoodsReceiptLine]
    PI[PurchaseInvoice]
    PIL[PurchaseInvoiceLine]
    DP[DisbursementPayment]
    GL[GLEntry]

    S --> PR --> PO --> POL --> GR --> GRL --> PI --> PIL --> DP
    GR -. Posts Inventory and GRNI .-> GL
    PI -. Posts GRNI, AP, and Purchase Variance .-> GL
    DP -. Posts AP and Cash .-> GL
```

In the current generator, purchasing starts with a requisition, then a purchase order, then one or more goods receipts, then one or more supplier invoices, and finally one or more payments. Purchase orders can batch multiple requisitions. Supplier invoices match specific receipt lines through `PurchaseInvoiceLine.GoodsReceiptLineID`. The accounting events happen when inventory is received, when the supplier invoice is approved, and when payment is made.

| Business event | Main tables | When accounting happens | Typical student questions |
|---|---|---|---|
| Supplier setup | `Supplier` | No posting | Which suppliers are most important or risky? |
| Internal request | `PurchaseRequisition` | No posting | Who requested the item and was it approved properly? |
| Order placed | `PurchaseOrder`, `PurchaseOrderLine` | No posting | Which requisitions were batched into one PO? What was ordered, from whom, and at what expected cost? |
| Goods received | `GoodsReceipt`, `GoodsReceiptLine` | Receipt posts inventory and GRNI | Was receipt timing appropriate? Was quantity partially received across dates or months? |
| Supplier billed | `PurchaseInvoice`, `PurchaseInvoiceLine` | Invoice posts GRNI, AP, and purchase variance | Which receipt lines were matched? Did invoice cost differ from receipt cost? |
| Supplier paid | `DisbursementPayment` | Payment posts AP and cash | Which invoices are still unpaid or only partially paid? Are there duplicate payment references? |

## Subledger-to-Ledger Traceability

```mermaid
flowchart LR
    SH[Shipment]
    SI[SalesInvoice]
    CR[CashReceipt]
    CRA[CashReceiptApplication]
    SR[SalesReturn]
    CM[CreditMemo]
    RF[CustomerRefund]
    GR[GoodsReceipt]
    PI[PurchaseInvoice]
    DP[DisbursementPayment]
    JE[JournalEntry]
    GL[GLEntry]
    R[Reporting and Analytics]

    SH --> GL
    SI --> GL
    CR --> GL
    CRA --> GL
    SR --> GL
    CM --> GL
    RF --> GL
    GR --> GL
    PI --> GL
    DP --> GL
    JE --> GL
    GL --> R
```

`GLEntry` is the common reporting layer. Each posted row carries source-trace fields that let a learner move from ledger detail back to the source document:

- `VoucherType`
- `VoucherNumber`
- `SourceDocumentType`
- `SourceDocumentID`
- `SourceLineID`
- `FiscalYear`
- `FiscalPeriod`

This means a student can start from a ledger line and ask:

- Which shipment, invoice, or payment created this posting?
- Which cost center did it affect?
- In which fiscal period did it hit the ledger?

## Manual Journal and Close Cycle Scope

`JournalEntry` is fully used in the current generator. The default build includes:

- opening balance
- monthly payroll accruals by cost center
- monthly payroll settlements
- monthly office and warehouse rent journals
- monthly utilities journals
- monthly depreciation journals by asset class
- month-end accrued expense journals with next-month reversals
- year-end close entries to `8010` Income Summary and `3030` Retained Earnings

That matters for teaching because students can now work with operational postings and recurring manual ledger activity in the same database.

For multi-year income statement analysis, tell students to exclude the two year-end close entry types when they want raw annual revenue and expense activity.

## How to Trace One Transaction

### O2C example

1. Start with a `SalesInvoice`.
2. Use `SalesOrderID` to find the related `SalesOrder`.
3. Use `SalesInvoiceLine.ShipmentLineID` and `SalesInvoiceLine.SalesOrderLineID` to connect billed lines to the shipment and original order line.
4. Use `CashReceiptApplication.SalesInvoiceID` to see how cash was applied, and use `CashReceipt` to see the receipt header.
5. If the customer returned goods, use `CreditMemo.OriginalSalesInvoiceID`, `SalesReturnLine.ShipmentLineID`, and `CustomerRefund.CreditMemoID` to trace the reversal and refund path.
6. Use `GLEntry.SourceDocumentType = "SalesInvoice"`, `"CashReceiptApplication"`, `"SalesReturn"`, `"CreditMemo"`, or `"CustomerRefund"` to see the accounting effect.

### P2P example

1. Start with a `PurchaseInvoice`.
2. Use `PurchaseOrderID` to find the related `PurchaseOrder`.
3. Use `PurchaseInvoiceLine.GoodsReceiptLineID` to connect invoice lines to the exact receipt lines when the clean match is available.
4. Use `GoodsReceiptLine.POLineID` and `PurchaseOrderLine.RequisitionID` to move back to the originating purchase-order line and requisition.
5. Use `DisbursementPayment.PurchaseInvoiceID` to see one or more payments applied to the invoice.
6. Use `GLEntry.SourceDocumentType = "GoodsReceipt"`, `"PurchaseInvoice"`, or `"DisbursementPayment"` to see the accounting effect.

## Where to Go Next

- Read [database-guide.md](database-guide.md) for the main joins and table families.
- Read [reference/posting.md](reference/posting.md) for the technical posting rules.
