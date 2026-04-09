-- Teaching objective: Review common payroll-control exceptions around approvals, payments, and liabilities.
-- Main tables: PayrollRegister, PayrollPayment, PayrollPeriod, Employee.
-- Output shape: One row per potential payroll-control issue.
-- Interpretation notes: Clean builds should return few rows. The query is intentionally exception-oriented.

WITH payment_summary AS (
    SELECT
        PayrollRegisterID,
        MIN(date(PaymentDate)) AS FirstPaymentDate
    FROM PayrollPayment
    GROUP BY PayrollRegisterID
),
register_issue_rows AS (
    SELECT
        'Approved register missing payment' AS PotentialIssue,
        pp.PeriodNumber AS ReferenceNumber,
        CAST(e.EmployeeID AS TEXT) AS EmployeeReference,
        e.EmployeeName,
        date(pr.ApprovedDate) AS EventDate,
        pr.GrossPay AS Amount
    FROM PayrollRegister AS pr
    JOIN PayrollPeriod AS pp
        ON pp.PayrollPeriodID = pr.PayrollPeriodID
    JOIN Employee AS e
        ON e.EmployeeID = pr.EmployeeID
    LEFT JOIN payment_summary AS ps
        ON ps.PayrollRegisterID = pr.PayrollRegisterID
    WHERE pr.Status = 'Approved'
      AND ps.PayrollRegisterID IS NULL

    UNION ALL

    SELECT
        'Payment dated before payroll approval' AS PotentialIssue,
        pp.PeriodNumber AS ReferenceNumber,
        CAST(e.EmployeeID AS TEXT) AS EmployeeReference,
        e.EmployeeName,
        ps.FirstPaymentDate AS EventDate,
        pr.NetPay AS Amount
    FROM PayrollRegister AS pr
    JOIN PayrollPeriod AS pp
        ON pp.PayrollPeriodID = pr.PayrollPeriodID
    JOIN Employee AS e
        ON e.EmployeeID = pr.EmployeeID
    JOIN payment_summary AS ps
        ON ps.PayrollRegisterID = pr.PayrollRegisterID
    WHERE pr.ApprovedDate IS NOT NULL
      AND julianday(ps.FirstPaymentDate) < julianday(pr.ApprovedDate)

    UNION ALL

    SELECT
        'Nonpositive net pay register' AS PotentialIssue,
        pp.PeriodNumber AS ReferenceNumber,
        CAST(e.EmployeeID AS TEXT) AS EmployeeReference,
        e.EmployeeName,
        date(pp.PayDate) AS EventDate,
        pr.NetPay AS Amount
    FROM PayrollRegister AS pr
    JOIN PayrollPeriod AS pp
        ON pp.PayrollPeriodID = pr.PayrollPeriodID
    JOIN Employee AS e
        ON e.EmployeeID = pr.EmployeeID
    WHERE pr.NetPay <= 0
)
SELECT *
FROM register_issue_rows
ORDER BY PotentialIssue, EventDate, EmployeeReference;
