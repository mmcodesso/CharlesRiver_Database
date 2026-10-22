import Head from "@docusaurus/Head";
import { useDoc } from "@docusaurus/plugin-content-docs/client";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import DocItemMetadata from "@theme-original/DocItem/Metadata";
import { SocialPageMetadata } from "@site/src/components/SiteBranding";
import {
  buildLearningResourceStructuredData,
  buildWebPageStructuredData,
  serializeStructuredData,
} from "@site/src/components/SiteBranding/structuredData.cjs";

export default function Metadata() {
  const { metadata } = useDoc();
  const { siteConfig } = useDocusaurusContext();
  const isCase = metadata.id.startsWith("analytics/cases/") && metadata.id !== "analytics/cases/index";
  const isPractice = metadata.id.startsWith("learn-and-practice/") && metadata.id !== "learn-and-practice/index";
  const isTutorial = ["analytics/sql-guide", "analytics/excel-guide"].includes(metadata.id);
  const isGuidedTutorial = Boolean(metadata.frontMatter.tutorial_number);
  const resourceType = isCase ? "Case study" : isGuidedTutorial || isTutorial ? "Tutorial" : "Exercise";
  const resource = isCase || isPractice || isTutorial
    ? buildLearningResourceStructuredData(siteConfig.customFields.branding, metadata, resourceType)
    : null;

  return (
    <>
      <DocItemMetadata />
      <SocialPageMetadata title={metadata.title} description={metadata.description} />
      <Head>
        <script type="application/ld+json">{serializeStructuredData(buildWebPageStructuredData(siteConfig.customFields.branding, {
          ...metadata, learningResourceId: resource?.['@id'],
        }))}</script>
      </Head>
      {resource ? (
        <Head>
          <script type="application/ld+json">{serializeStructuredData(resource)}</script>
        </Head>
      ) : null}
    </>
  );
}
