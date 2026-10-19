# Order-to-Cash diagram pilot

The pilot starts from commit `22b215f304aedd3c2507b56783be38847ba14f0d` on the local review branch. Its scope is the goods ER, cash-allocation ER, existing Order-to-Cash BPMN, Lesson 3 selected-record map, and Case 1 independent settlement-summary map.

Native Draw.io 29.6.6 exported the actual editable sources. Automatic ER stack layout caused an exporter hang; explicit native table-row geometry resolved it. The cross-platform exporter now has a 45-second hard termination limit. Sources use the installed Entity Relation library's swimlane/table rows and crow's-foot markers, with native fields that remain individually editable. No alternate SVG geometry is drawn by the export helper.

Visual inspection corrected long connector labels overlapping cards and separated incoming field references from outgoing key references. ER reference lines use short r1/r2 identifiers with a full relationship table in the page. The selected-record figure distinguishes Customer, SalesOrder, SalesOrderLine, and Item. The settlement figure aggregates applications and credits independently before the invoice comparison.

The pilot production build passed in temporary storage with the existing checksum-verified published report assets. At `http://127.0.0.1:3111/docs/reference/schema#er-cash-allocation`, the ER viewer opens with Enter, fits the native image, reports its zoom, and changes to 100% actual size. Escape closes it and restores the exact Expand button. No horizontal page overflow was present at the inspected desktop viewport. Native PNGs from the same application were inspected for all revised pilot sources. Remaining responsive, dark-theme, and library-wide checks belong to final acceptance.

The evidence rules are accepted for expansion: relationships do not imply chronology; header and line grains remain distinct; applications supply invoice allocation; incoming cash is separate from its application; operational support is distinct from posting. The original BPMN's open-demand and unapplied-cash endpoints are retained. No dataset, query, result register, report, or release was changed for the pilot.

## Final expansion and user refinements

The user subsequently requested Draw.io for every remaining diagram, foreign key / FK terminology without enforcement notes, and suffix markers after column names. The final library therefore contains 107 native diagrams and no published Mermaid blocks. Long field rows were enlarged where needed. All model sources/exports, keys, geometry, production build, and regression checks passed. Representative desktop, tablet, and phone reviews confirmed first-action 100% viewing, keyboard pan/zoom, reduced motion, dark-theme canvas readability, Escape, and exact-opener focus restoration. See HANDOFF.md and browser-review.json for the final evidence and human-evaluation limits.
