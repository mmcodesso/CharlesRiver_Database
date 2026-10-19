const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { before, after, test } = require('node:test');

const root = path.resolve(__dirname, '../..');
const file = path.resolve(root, process.env.CHARLES_RIVER_TEACHING_SQLITE || 'outputs/CharlesRiver.sqlite');
const hash = 'de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c';
let db;
const rows = sql => db.prepare(sql).all().map(row => ({ ...row }));
const one = sql => rows(sql)[0];
before(() => {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), hash);
  db = new DatabaseSync(file, { readOnly: true });
});
after(() => db?.close());

test('manufacturing payroll recognizes costs directly and preserves legitimate debt reclassification', () => {
  const costs = rows(`SELECT a.AccountNumber, COUNT(*) AS Rows, ROUND(SUM(g.Debit),2) AS Debit
    FROM GLEntry g JOIN Account a ON a.AccountID=g.AccountID
    WHERE g.SourceDocumentType='PayrollSummary' AND a.AccountNumber IN (1090,5080)
    GROUP BY a.AccountNumber ORDER BY a.AccountNumber`);
  assert.deepEqual(costs, [
    { AccountNumber: 1090, Rows: 76, Debit: 10013828.84 },
    { AccountNumber: 5080, Rows: 1, Debit: 11520.94 },
  ]);
  const types = rows('SELECT DISTINCT EntryType FROM JournalEntry').map(row => row.EntryType);
  assert.ok(types.includes('Debt Reclass'));
  assert.ok(!types.some(type => /(?:labor|overhead).*reclass/i.test(type)));
  const facts = one(`SELECT ROUND(SUM(GrossPay+EmployerPayrollTax+EmployerBenefits),2) Cost,
    ROUND(SUM(NetPay),2) Net FROM PayrollRegister WHERE PayrollPeriodID=2 AND CostCenterID=4`);
  assert.deepEqual(facts, { Cost: 169382.48, Net: 123131.23 });
  const voucher = one(`SELECT COUNT(*) Rows, ROUND(SUM(Debit),2) Debit, ROUND(SUM(Credit),2) Credit
    FROM GLEntry WHERE SourceDocumentType='PayrollSummary' AND SourceDocumentID=1002004`);
  assert.deepEqual(voucher, { Rows: 5, Debit: 169382.48, Credit: 169382.48 });
});

test('posting routes distinguish commitments, support, linked journals, and direct sources', () => {
  for (const type of ['SalesOrder', 'ServiceTimeEntry', 'FixedAssetEvent', 'DebtScheduleLine']) {
    assert.equal(db.prepare('SELECT COUNT(*) n FROM GLEntry WHERE SourceDocumentType=?').get(type).n, 0);
  }
  assert.deepEqual(one('SELECT JournalEntryID, EventDate, Amount FROM FixedAssetEvent WHERE FixedAssetEventID=14'),
    { JournalEntryID: 103, EventDate: '2024-07-18', Amount: 360000 });
  assert.deepEqual(one('SELECT JournalEntryID, PaymentDate, PrincipalAmount, InterestAmount, PaymentAmount FROM DebtScheduleLine WHERE DebtScheduleLineID=1'),
    { JournalEntryID: 121, PaymentDate: '2024-08-01', PrincipalAmount: 6553.95, InterestAmount: 2025, PaymentAmount: 8578.95 });
  const effects = id => rows(`SELECT a.AccountNumber, g.Debit, g.Credit FROM GLEntry g
    JOIN Account a ON a.AccountID=g.AccountID WHERE g.SourceDocumentType='JournalEntry'
    AND g.SourceDocumentID=${id} ORDER BY a.AccountNumber`);
  assert.deepEqual(effects(103), [{ AccountNumber: 2010, Debit: 360000, Credit: 0 }, { AccountNumber: 2110, Debit: 0, Credit: 360000 }]);
  assert.deepEqual(effects(121), [{ AccountNumber: 1010, Debit: 0, Credit: 6553.95 }, { AccountNumber: 2110, Debit: 6553.95, Credit: 0 }]);
});

test('new service, purchase, payroll and transfer checkpoints retain complete vouchers and real keys', () => {
  for (const [type, id, count, date, amount] of [
    ['SalesInvoice',241,3,'2024-01-31',7306.65],
    ['SalesInvoice',242,3,'2024-01-31',6143.24],
    ['GoodsReceipt',23913,2,'2026-09-27',8.83],
    ['PurchaseInvoice',36461,3,'2026-11-30',8.96],
    ['DisbursementPayment',39645,2,'2027-01-08',8.96],
    ['PayrollPayment',96,2,'2024-01-19',1578.34],
  ]) {
    const actual = db.prepare(`SELECT COUNT(*) Rows, MIN(PostingDate) FirstDate, MAX(PostingDate) LastDate,
      ROUND(SUM(Debit),2) Debit, ROUND(SUM(Credit),2) Credit
      FROM GLEntry WHERE SourceDocumentType=? AND SourceDocumentID=?`).get(type,id);
    assert.deepEqual({ ...actual }, { Rows: count, FirstDate: date, LastDate: date, Debit: amount, Credit: amount });
  }
  assert.deepEqual(one(`SELECT b.SalesInvoiceLineID, l.SalesInvoiceID, b.BilledHours, b.HourlyRate, b.LineAmount
    FROM ServiceBillingLine b JOIN SalesInvoiceLine l ON l.SalesInvoiceLineID=b.SalesInvoiceLineID
    WHERE b.ServiceBillingLineID=3`),
    { SalesInvoiceLineID: 388, SalesInvoiceID: 242, BilledHours: 31.18, HourlyRate: 185, LineAmount: 5768.3 });
  assert.equal(one('SELECT COUNT(*) n FROM DisbursementPayment WHERE PurchaseInvoiceID=36460').n, 0);
  assert.deepEqual(rows('SELECT MaterialIssueID FROM MaterialIssue WHERE WorkOrderID=2 ORDER BY MaterialIssueID'), [{MaterialIssueID:2},{MaterialIssueID:3}]);
  assert.deepEqual(rows('SELECT ProductionCompletionID FROM ProductionCompletion WHERE WorkOrderID=2 ORDER BY ProductionCompletionID'), [{ProductionCompletionID:3},{ProductionCompletionID:4}]);
  assert.equal(one('SELECT MaterialVarianceAmount FROM WorkOrderClose WHERE WorkOrderID=2').MaterialVarianceAmount, 0.69);
});

test('all three additional manufacturing queries retain stable reviewed rows', () => {
  const text = fs.readFileSync(path.join(root,'docs/learn-and-practice/manufacturing-cost-flow.md'),'utf8').replace(/\r\n/g,'\n');
  const queries = [...text.matchAll(/```sql\n([\s\S]*?)\n```/g)].map(match => match[1]);
  assert.equal(queries.length,3);
  const ledger = rows(queries[0]);
  assert.deepEqual(ledger.map(row => [row.PostingDate,row.SourceDocumentType,row.SourceDocumentID,row.AccountNumber,row.Debit,row.Credit]), [
    ['2024-01-17','MaterialIssue',1,1045,0,754.29],
    ['2024-01-17','MaterialIssue',1,1046,754.29,0],
    ['2024-01-25','ProductionCompletion',1,1040,568.68,0],
    ['2024-01-25','ProductionCompletion',1,1046,0,406.7],
    ['2024-01-25','ProductionCompletion',1,1090,0,161.98],
    ['2024-01-26','ProductionCompletion',2,1040,451.17,0],
    ['2024-01-26','ProductionCompletion',2,1046,0,322.66],
    ['2024-01-26','ProductionCompletion',2,1090,0,128.51],
    ['2024-02-01','WorkOrderClose',1,1046,0,24.93],
    ['2024-02-01','WorkOrderClose',1,1090,0,718.23],
    ['2024-02-01','WorkOrderClose',1,5080,743.16,0],
  ]);
  assert.deepEqual(rows(queries[1]), [{ StandardLabor:185.67, StandardOverhead:104.82, RecordedDirectLabor:191.89,
    LaborDifference:6.22, DirectLaborVarianceAmount:6.22, OverheadVarianceAmount:712.01, ConversionVarianceAmount:718.23 }]);
  assert.deepEqual(rows(queries[2]), [
    {Period:'January 2024',Opening:0,PeriodDebit:20875,PeriodCredit:23327.6,Closing:-2452.6},
    {Period:'February 1',Opening:-2452.6,PeriodDebit:0,PeriodCredit:12894.16,Closing:-15346.76},
    {Period:'February 2',Opening:-15346.76,PeriodDebit:169382.48,PeriodCredit:8968.64,Closing:145067.08},
  ]);
});
