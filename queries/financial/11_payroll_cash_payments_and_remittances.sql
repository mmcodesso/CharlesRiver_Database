-- Teaching objective: Compare payroll cash outflows between employee payments and liability remittances.
-- Main tables: PayrollPayment, PayrollRegister, PayrollPeriod, PayrollLiabilityRemittance.
-- Output shape: One row per fiscal period.
-- Interpretation notes: Payments clear net pay. Remittances clear tax and deduction liabilities. The two cash streams should be analyzed separately.

WITH payroll_payments AS (
    SELECT
        CAST(strftime('%Y', p.PaymentDate) AS INTEGER) AS FiscalYear,
        CAST(strftime('%m', p.PaymentDate) AS INTEGER) AS FiscalPeriod,
        ROUND(SUM(r.NetPay), 2) AS NetPayCash
    FROM PayrollPayment AS p
    JOIN PayrollRegister AS r
        ON r.PayrollRegisterID = p.PayrollRegisterID
    GROUP BY CAST(strftime('%Y', p.PaymentDate) AS INTEGER), CAST(strftime('%m', p.PaymentDate) AS INTEGER)
),
payroll_remittances AS (
    SELECT
        CAST(strftime('%Y', RemittanceDate) AS INTEGER) AS FiscalYear,
        CAST(strftime('%m', RemittanceDate) AS INTEGER) AS FiscalPeriod,
        ROUND(SUM(CASE WHEN LiabilityType = 'Employee Tax Withholding' THEN Amount ELSE 0 END), 2) AS EmployeeTaxRemittance,
        ROUND(SUM(CASE WHEN LiabilityType = 'Employer Payroll Tax' THEN Amount ELSE 0 END), 2) AS EmployerTaxRemittance,
        ROUND(SUM(CASE WHEN LiabilityType = 'Benefits and Other Deductions' THEN Amount ELSE 0 END), 2) AS BenefitsRemittance,
        ROUND(SUM(Amount), 2) AS TotalRemittances
    FROM PayrollLiabilityRemittance
    GROUP BY CAST(strftime('%Y', RemittanceDate) AS INTEGER), CAST(strftime('%m', RemittanceDate) AS INTEGER)
),
periods AS (
    SELECT FiscalYear, FiscalPeriod FROM payroll_payments
    UNION
    SELECT FiscalYear, FiscalPeriod FROM payroll_remittances
)
SELECT
    p.FiscalYear,
    p.FiscalPeriod,
    COALESCE(pp.NetPayCash, 0) AS NetPayCash,
    COALESCE(pr.EmployeeTaxRemittance, 0) AS EmployeeTaxRemittance,
    COALESCE(pr.EmployerTaxRemittance, 0) AS EmployerTaxRemittance,
    COALESCE(pr.BenefitsRemittance, 0) AS BenefitsRemittance,
    COALESCE(pr.TotalRemittances, 0) AS TotalLiabilityRemittances,
    ROUND(COALESCE(pp.NetPayCash, 0) + COALESCE(pr.TotalRemittances, 0), 2) AS TotalPayrollCashOutflow
FROM periods AS p
LEFT JOIN payroll_payments AS pp
    ON pp.FiscalYear = p.FiscalYear
   AND pp.FiscalPeriod = p.FiscalPeriod
LEFT JOIN payroll_remittances AS pr
    ON pr.FiscalYear = p.FiscalYear
   AND pr.FiscalPeriod = p.FiscalPeriod
ORDER BY p.FiscalYear, p.FiscalPeriod;
