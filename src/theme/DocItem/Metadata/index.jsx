import Head from "@docusaurus/Head";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import DocItemMetadata from "@theme-original/DocItem/Metadata";
import {
  buildLearningResourceStructuredData,
  serializeStructuredData,
} from "@site/src/components/SiteBranding/structuredData.cjs";

export default function Metadata() {
  const { metadata } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const isCase = metadata.id.startsWith("analytics/cases/") && metadata.id !== "analytics/cases/index";
  const isPractice = metadata.id.startsWith("learn-and-practice/") && metadata.id !== "learn-and-practice/index";
  const isTutorial = ["analytics/sql-guide", "analytics/excel-guide"].includes(metadata.id);
  const resourceType = isCase ? "Case study" : isPractice ? "Exercise" : "Tutorial";
  const resource = isCase || isPractice || isTutorial
    ? buildLearningResourceStructuredData(siteConfig.customFields.branding, metadata, resourceType)
    : null;

  return (
    <>
      <DocItemMetadata />
      {resource ? (
        <Head>
          <script type="application/ld+json">{serializeStructuredData(resource)}</script>
        </Head>
      ) : null}
    </>
  );
}
