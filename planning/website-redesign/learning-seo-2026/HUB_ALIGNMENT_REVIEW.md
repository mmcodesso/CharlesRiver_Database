# Hub alignment: review, plan and acceptance criteria

This records the completed feature review. The later user-authorized merge/publication and integration with newer main are documented in `PUBLICATION.md`; its publication status supersedes the review-only status below.

## Source hierarchy and review findings

This follow-up preserves the existing feature branch and all prior website work. The live Hub and Charles River pages were read through the web tool. Direct HTTP clients receive 403 responses for the Hub. The clean local Hub `main` checkout at `cab33558b2c664144c6a0d0302e47d37753b4342` provides its current metadata contracts; the web retrieval still shows older visible content. These are distinct observations, not proof that the current Hub source is deployed.

`hub-alignment-evidence.json` records the source commit, selected file hashes, shared identities and limitations. The Hub checkout is read-only. `hub-review-before.json` captures the generated Charles River metadata before this follow-up.

| Finding | Adjustment |
|---|---|
| Prior pass replaced the dataset entity ID with its concept DOI; Hub main explicitly preserves the educational site's `/#dataset` identity | Restore the shared entity ID. Keep concept DOI as identifier/sameAs; preserve revision DOI only where relevant on Downloads. |
| Dataset URL points to the Hub while Hub identifies its canonical educational home as Charles River | Use the educational home as Dataset.url; describe the Hub discovery page through subjectOf. Keep both page canonicals independent. |
| Publisher and creator objects lack the Hub's stable entity IDs | Reuse the Hub's organization and author profile IDs. Use its public name Mauricio Codesso; retain the verified archival full name as an alias rather than treating it as another person. |
| Downloads citation differs from the Hub recommendation | Use the same 2027 registry title, revision DOI, public initials, and Accounting Analytics Hub publisher. Keep the scholarly title/year provenance recorded. Do not edit Zenodo or infer publication dates from operating years. |
| LearningResource uses a separate anonymous CreativeWork for its parent | Link learning resources to the same named WebSite and dataset, and connect each activity WebPage to its actual main entity. |
| Hub discovery page is accessible only from selected prose | Add a clearly named publication overview link in global Hub navigation/footer and the homepage resource list. |
| Homepage mentions SQL files but only links that row to Reports | Provide separate direct Report and Query Library entry points. Retain the company-first progression and stable routes. |
| Homepage description leads with package statistics | Describe the educational progression in the snippet; retain verified counts in visible company/data context. Leave broad publication discovery to the Hub. |
| Social previews use a generated SVG without image dimensions/alt metadata | Add an authored, brand-aligned 1200×630 SVG/PNG learning-site card; use the PNG for Open Graph/Twitter with matching image type, dimensions and alternative text. Preserve the generated branding inputs and original assets. |
| Prior tests check individual values but do not compare the cross-site contract | Add offline assertions against the recorded Hub identity snapshot, rendered metadata uniqueness, page/activity entity connections, global discovery links, and PNG validity. |

## Implementation plan

1. Update the authored publication/structured-data helpers, citation and direct discovery links. Preserve dataset/config/query/report/diagram sources and outputs.
2. Add the authored social card and configure metadata using supported Docusaurus hooks. Keep one effective title/description/canonical/image per page; metadata must describe the actual educational site.
3. Build with the existing report assets; inspect every authored page's rendered metadata and internal links. Re-run website unit/rendered tests and relevant browser tests, then verify the artifact/source freeze and the Hub source hashes.
4. Record final results here and in `VALIDATION.md`; refresh private page inventories and changed-file handoff. No merge, deployment or external-repository mutation.

## Acceptance criteria

- Charles River and Hub main use the same dataset, publisher and person entity identities, DOI pair, registry title and license.
- Educational pages retain their self-canonicals; publication discovery points to the Hub without duplicating its full publication page.
- All 48 authored routes, learning order, case requirements, resource IDs, filters, downloads and diagram behavior remain preserved.
- Titles/descriptions stay specific and unique. Social metadata uses a real local PNG with accurate dimensions and alt text.
- Global navigation and the homepage give ordinary HTML links to the Hub overview, Reports and Query Library.
- Production build, targeted website/browser checks, protected-path comparison and artifact hashes pass. Record unavailable live checks honestly.

## Final results

- **Production build passed** after the final homepage snippet change. Existing report assets were reused; no dataset/report generation ran. Original generated branding assets remain unchanged.
- **36 Node checks passed** across navigation, rendered metadata, teaching content, tutorials and cases. All 48 authored pages have unique descriptions, one effective Open Graph/Twitter image, matching social/page descriptions, page-specific social titles, local canonicals, and consistent Hub entity references.
- **Seven browser tests passed**, including the existing report/query/model interactions, 320–1440 px representative layouts and both themes. The added keyboard route from the homepage to Query Library updates the client-side social title. Desktop/mobile resource-list screenshots and the 1200×630 social PNG were visually inspected.
- The PNG is **54,543 bytes**. `social-card-evidence.json` records source/export hashes. Its vector source is authored specifically for the educational site; neither the protected branding source nor the old generated social SVG was edited.
- **Fifteen external URLs checked:** ten HTTP 200 responses, including all three dataset download HEAD requests and the corrected textbook fragment; five client-access 403 responses for the Hub/author/DOI endpoints. The local Hub main contract is verified, but its latest deployed metadata is not asserted. No live social-platform unfurl or search-result appearance is claimed.
- **Preservation passed:** all 48 authored routes, all 358 task-start artifacts, all 259 protected source hashes, and all 293 historical frozen artifact hashes remain unchanged. The six inspected Hub source hashes also match the initial read-only snapshot.
- `hub-review-before.json` and `hub-review-after.json` provide the generated metadata comparison. `final-inventory.md`, `final.json`, `VALIDATION.md` and `CHANGED_FILES.md` cover the integrated final state.

The earlier 57 BPMN / 167 teaching-evidence Python passes remain prior evidence, rather than new follow-up runs. This pass changes metadata, discovery links and an authored social asset; the final Node checks still execute worked SQL read-only. No accounting, SQL, case assessment, diagram, release, external repository, hosting, merge or deployment changes were made.

## Remaining alignment boundaries

- The Hub's version-specific publication distributions and the educational site's stable latest-release downloads serve different purposes. Keep that distinction explicit; do not spread numbered release guidance through global educational metadata.
- Preserve the archival creator spelling as an alias of the Hub author entity, while public attribution and the displayed citation use Mauricio Codesso / Codesso, M.
- Verify the deployed Hub contract after its latest main changes are published, once HTTP access permits. The recorded clean main-source comparison is reproducible evidence; an older web cache is not a reliable deployment-status check.
