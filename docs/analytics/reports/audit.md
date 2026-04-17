---
title: Audit Reports
description: Curated audit and control-review reports generated from the published SQLite build.
sidebar_label: Audit Reports
---

import { ReportCatalog } from "@site/src/components/ReportCatalog";
import { reportAreaCollections } from "@site/src/generated/reportDocCollections";

# Audit Reports

Use these reports when you want a tighter control-review pack instead of browsing the full audit SQL catalog first.

<ReportCatalog
  groups={reportAreaCollections.audit}
  helperText="These reports focus on reviewable control outputs such as approval coverage, segregation-of-duties logic, and broad anomaly screening."
/>
