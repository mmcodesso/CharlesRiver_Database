---
title: Audit Exception Lab
description: Guided audit lab focused on anomaly review and control testing in the published dataset.
sidebar_label: Audit Exception Lab
---

import { QuerySequence } from "@site/src/components/QueryReference";
import { caseQuerySequences } from "@site/src/generated/queryDocCollections";

# Audit Exception Lab


## Business Scenario

The finance and audit team receives the published five-year dataset with a moderate set of planted anomalies. This lab teaches students how to trace flagged exceptions to source documents, identify the related control, and explain the business risk in plain language. In class, you can narrow the review to one fiscal year with a filter when you want a smaller lab.

Use <FileName type="support" /> with the published dataset. If you are preparing the files yourself, use [Customize](../../technical/dataset-delivery.md).

## Main Tables and Worksheets

- <FileName type="support" />
- `AnomalyLog`
- `ValidationStages`
- `ValidationChecks`
- `ValidationExceptions`
- `PurchaseInvoice`
- `DisbursementPayment`
- `PayrollRegister`
- `PayrollPayment`
- `WorkOrder`
- `WorkOrderOperation`
- `WorkOrderOperationSchedule`
- `WorkCenter`
- `LaborTimeEntry`
- `TimeClockEntry`

## Recommended Query Sequence

1. Open <FileName type="support" /> and review `AnomalyLog`.
2. Review `ValidationChecks` and `ValidationExceptions` for the small `manufacturing_audit_seeds` set in the published default build.
3. Pick one anomaly-log family and one manufacturing audit-seed row and note the source document keys shown in the workbook.
4. Then work through the SQL sequence below.

<QuerySequence items={caseQuerySequences["audit-exception-lab"]} />

## Suggested Excel Sequence

1. Open <FileName type="support" />.
2. Open `AnomalyLog` and group by `anomaly_type`.
3. Open `ValidationChecks` and filter `Area` to `manufacturing_audit_seeds`.
4. Pick one anomaly from AP, one from payroll, and one manufacturing audit-seed work order.
5. Use the source-document sheets to trace each exception.
6. Compare the workbook trace to the matching SQL result set.

## What Students Should Notice

- The anomaly log is a teaching aid, not a substitute for source-document review.
- The published default build includes a small manufacturing audit-seed family in validation output even though it is not an anomaly-log family.
- Several audit starter queries are intentionally written to surface the same anomaly family from different angles.
- The published dataset includes a moderate anomaly set that creates teachable results without turning the whole dataset into an exception dump.

## Follow-Up Questions

- Which planted anomalies represent timing issues versus approval issues versus linkage issues?
- Which audit queries depend on the anomaly log, and which work directly from source tables?
- How does a validation-only audit seed differ from an anomaly-log family in the way students should explain it?
- Which exception would you escalate first in a real audit discussion, and why?
