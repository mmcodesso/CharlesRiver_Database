const fs = require('node:fs');
const assert = require('node:assert/strict');
const input = JSON.parse(fs.readFileSync('outputs/_website_redesign/cases/workbook-check-input.json','utf8'));
const q = JSON.parse(fs.readFileSync('planning/website-redesign/cases/worked-query-register.json','utf8'));
const rows = name => input.find(t=>t.table===name).rows;
const index = (name,key) => new Map(rows(name).map(r=>[r[key],r]));
const sum = (rs,field) => rs.reduce((s,r)=>s+(typeof field==='function'?field(r):r[field]||0),0);
let checks=0;
const near=(a,b,label)=>{assert.ok(Number.isFinite(a)&&Math.abs(a-b)<0.005,label+': '+a+' / '+b);checks++;};
const groups=(rs,key)=>{const m=new Map();for(const r of rs){const k=key(r);if(!m.has(k))m.set(k,[]);m.get(k).push(r);}return m;};
// Excel SUMIFS logic: each invoice is retained once, then dated applications and credits are summed independently.
const orderIDs=new Set(rows('SalesOrder').filter(r=>r.CustomerID===120&&r.OrderDate>='2024-01-01'&&r.OrderDate<'2024-04-01').map(r=>r.SalesOrderID));
const invoices=rows('SalesInvoice').filter(r=>orderIDs.has(r.SalesOrderID));
for(const expected of q['c01-balances'].rows){const i=invoices.find(r=>r.SalesInvoiceID===expected.SalesInvoiceID);const applied=sum(rows('CashReceiptApplication').filter(r=>r.SalesInvoiceID===i.SalesInvoiceID&&r.ApplicationDate<=expected.AsOf),'AppliedAmount');const credit=sum(rows('CreditMemo').filter(r=>r.OriginalSalesInvoiceID===i.SalesInvoiceID&&r.CreditMemoDate<=expected.AsOf),'GrandTotal');near(applied,expected.Applied,'Case 1 applied');near(credit,expected.Credited,'Case 1 credits');near(i.GrandTotal-applied-credit,expected.Remaining,'Case 1 balance');}
for(const b of rows('ServiceBillingLine')){const time=rows('ServiceTimeEntry').filter(t=>t.ServiceEngagementID===b.ServiceEngagementID&&t.WorkDate>=b.BillingPeriodStartDate&&t.WorkDate<=b.BillingPeriodEndDate);near(sum(time,'BillableHours'),b.BilledHours,'Case 2 covered billable time');}
const service=q['c02-cutoff'].rows[0];near(sum(rows('ServiceTimeEntry'),'ExtendedCost'),service.TimeCost,'Case 2 time cost');
for(const e of q['c03-matches'].rows){for(const [field,date] of [['PaidMarch','2024-03-31'],['PaidJune','2024-06-30']])near(sum(rows('DisbursementPayment').filter(p=>p.PurchaseInvoiceID===e.PurchaseInvoiceID&&p.PaymentDate<=date),'Amount'),e[field],'Case 3 dated payment');}
const item=index('Item','ItemID'),invoice=index('SalesInvoice','SalesInvoiceID');
const productLines=rows('SalesInvoiceLine').filter(l=>{const h=invoice.get(l.SalesInvoiceID);return h&&h.InvoiceDate>='2024-01-01'&&h.InvoiceDate<'2024-04-01'&&item.get(l.ItemID)?.ItemType==='Finished Good';});
for(const [group,ls] of groups(productLines,l=>item.get(l.ItemID).ItemGroup)){const e=q['c04-comparison'].rows.find(r=>r.ItemGroup===group);const billed=sum(ls,'LineTotal'),list=sum(ls,r=>r.Quantity*r.BaseListPrice),cost=sum(ls,r=>r.Quantity*item.get(r.ItemID).StandardCost);near(ls.length,e.Lines,'Case 4 count');near(billed,e.InvoicedLines,'Case 4 line amount');near(cost,e.CurrentStandardCost,'Case 4 standard cost');near(100*billed/list,e.RealizationPct,'Case 4 weighted realization');near(billed-cost,e.StandardMargin,'Case 4 margin');}
const issues=index('MaterialIssue','MaterialIssueID'),completions=index('ProductionCompletion','ProductionCompletionID');
for(const e of q['c05-costs'].rows){const is=rows('MaterialIssueLine').filter(l=>{const h=issues.get(l.MaterialIssueID);return h?.WorkOrderID===e.WorkOrderID&&h.IssueDate<='2024-02-29';});const cs=rows('ProductionCompletionLine').filter(l=>{const h=completions.get(l.ProductionCompletionID);return h?.WorkOrderID===e.WorkOrderID&&h.CompletionDate<='2024-02-29';});near(sum(is,'ExtendedStandardCost'),e.Issued,'Case 5 issues');near(sum(cs,'ExtendedStandardTotalCost'),e.CompletedTotal,'Case 5 completion');near(sum(rows('LaborTimeEntry').filter(l=>l.WorkOrderID===e.WorkOrderID&&l.WorkDate<='2024-02-29'),'ExtendedLaborCost'),e.LaborSupport,'Case 5 labor');}
for(const e of q['c06-pay-summary'].rows){const rs=rows('PayrollRegister').filter(r=>r.PayrollPeriodID===e.PayrollPeriodID);near(sum(rs,'GrossPay'),e.GrossPay,'Case 6 gross');near(sum(rs,'EmployeeWithholdings'),e.Withholdings,'Case 6 deductions');near(sum(rs,r=>r.GrossPay-r.EmployeeWithholdings),e.NetPay,'Case 6 gross to net');}
const opening=JSON.parse(fs.readFileSync('outputs/_website_redesign/cases/workbook-opening-result.json','utf8'));const accounts=index('Account','AccountID');
for(const r of opening.accounts){const e=q['c07-rollforward'].rows.find(e=>e.AccountNumber===accounts.get(r.AccountID).AccountNumber);for(const [field,out]of[['Opening','OpeningDebitNet'],['Quarter','QuarterDebitNet'],['Closing','ClosingDebitNet']])near(r[field],e[out],'Case 7 full workbook rollforward');}
const dup=[...groups(rows('PurchaseInvoice'),r=>r.SupplierID+'|'+r.InvoiceNumber).values()].filter(rs=>rs.length>1).flat();near(dup.length,q['c08-duplicates'].rows.length,'Case 8 duplicate population');
const approvals=index('OvertimeApproval','OvertimeApprovalID');const overtime=rows('TimeClockEntry').filter(t=>t.WorkDate>='2026-10-01'&&t.WorkDate<='2026-12-31'&&t.ClockStatus==='Approved'&&t.OvertimeHours>0);near(overtime.length,q['c08-overtime'].rows.length,'Case 8 overtime population');near(overtime.filter(t=>!approvals.has(t.OvertimeApprovalID)).length,336,'Case 8 missing link');
console.log('Independent spreadsheet-equivalent calculations passed: '+checks+' comparisons across all eight cases. These are data/formula checks, not native Excel UI execution.');
