import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  buildDatasetStructuredData,
  getFileName,
  getReleaseDownloadUrl,
  serializeStructuredData,
} from "./structuredData.cjs";

function useSiteBranding() {
  const { siteConfig } = useDocusaurusContext();
  return siteConfig.customFields?.branding ?? {};
}

export function CompanyName() {
  const branding = useSiteBranding();
  return branding.companyName ?? "Accounting Dataset";
}

export function DisplayName() {
  const branding = useSiteBranding();
  return branding.displayName ?? "Dataset";
}

export function DatasetName() {
  const branding = useSiteBranding();
  return branding.datasetName ?? "Accounting Dataset";
}

export function ShortName() {
  const branding = useSiteBranding();
  return branding.shortName ?? "dataset";
}

export function FileName({ type, prefix = "" }) {
  const branding = useSiteBranding();
  const fileName = `${prefix}${getFileName(branding.shortName ?? "dataset", type)}`;
  return <code>{fileName}</code>;
}

export function ReleaseDownloadLink({ type, children }) {
  const branding = useSiteBranding();
  const fileName = getFileName(branding.shortName ?? "dataset", type);
  const href = getReleaseDownloadUrl(branding, type);
  return <Link href={href}>{children ?? fileName}</Link>;
}

export function DatasetStructuredData({ pagePath = "/", description }) {
  const branding = useSiteBranding();
  const dataset = buildDatasetStructuredData(branding, { pagePath, description });

  return (
    <Head>
      <script type="application/ld+json">{serializeStructuredData(dataset)}</script>
    </Head>
  );
}
