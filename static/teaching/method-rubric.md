# Charles River — Public Method Rubric

This rubric assesses reproducible reasoning. It does not reveal private case-challenge answers or prescribe a finding. Instructors set weights and submission length for the assigned module.

| Criterion | Demonstrated | Needs repair |
|---|---|---|
| Event and accounting explanation | Distinguishes the business event, supporting document, recognition, nonposting activity, and later settlement; explains the account direction. | Treats an order, shipment, invoice, receipt, application, or estimate as interchangeable, or reverses the accounting direction. |
| Grain and population | States what each input/output row represents; defines the population; retains missing-key/null evidence; separates record counts from distinct people or documents. | Duplicates header amounts, changes populations silently, counts blanks as identified entities, or labels records as people. |
| Relationship and aggregation | Uses stored keys; checks uniqueness and match counts; independently aggregates facts before comparing different grains. | Joins by descriptions/amounts, assumes a source label is a table/foreign key, or multiplies totals across detail rows. |
| Dates and cutoff | Records the relevant date basis and explicit bounds; excludes subsequent events from the earlier position. | Uses a later payment/application to erase an earlier obligation or confuses document, posting, and clearing dates. |
| Reproducible checks | Retains release, tool version, inputs, steps, counts, source totals, complete-voucher checks when applicable, and refresh evidence. | Supplies only a final number or checks a selected excerpt as if it were a complete voucher. |
| Bounded interpretation | Connects a finding to evidence; distinguishes an observation from cause, control effectiveness, or misconduct; states limitations and a justified next action. | Overstates profit, authorization, completeness, cause, or wrongdoing without supporting evidence. |

Mark each criterion **demonstrated**, **needs repair**, or **unresolved** and cite the workpaper evidence. A matching numerical answer reached through an invalid grain or cutoff needs repair. An unresolved evidence gap can be a sound conclusion when it is precisely bounded and paired with an appropriate next evidence request.
