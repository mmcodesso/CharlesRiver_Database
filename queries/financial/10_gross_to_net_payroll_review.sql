-- Teaching objective: Review the gross-to-net payroll bridge by employee and pay period.
-- Main tables: PayrollPeriod, PayrollRegister, Employee, CostCenter.
-- Output shape: One row per employee payroll register.
-- Interpretation notes: Gross pay minus employee withholdings equals net pay. Employer taxes and benefits are company cost, not reductions of net pay.

SELECT
    pp.PeriodNumber,
    date(pp.PayDate) AS PayDate,
    e.EmployeeID,
    e.EmployeeName,
    cc.CostCenterName,
    e.PayClass,
    pr.GrossPay,
    pr.EmployeeWithholdings,
    pr.EmployerPayrollTax,
    pr.EmployerBenefits,
    pr.NetPay,
    ROUND(pr.GrossPay - pr.EmployeeWithholdings, 2) AS GrossLessWithholdings,
    ROUND(pr.EmployerPayrollTax + pr.EmployerBenefits, 2) AS EmployerBurden,
    pr.Status
FROM PayrollRegister AS pr
JOIN PayrollPeriod AS pp
    ON pp.PayrollPeriodID = pr.PayrollPeriodID
JOIN Employee AS e
    ON e.EmployeeID = pr.EmployeeID
JOIN CostCenter AS cc
    ON cc.CostCenterID = pr.CostCenterID
ORDER BY date(pp.PayDate), cc.CostCenterName, e.EmployeeName;
