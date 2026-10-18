import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { TEACHING_RELEASE, getTeachingReleaseUrl } from "@site/src/data/teachingRelease.cjs";
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

export function TeachingRelease() {
  return TEACHING_RELEASE.tag;
}

export function TeachingReleaseLink({ children }) {
  const branding = useSiteBranding();
  return <Link href={getTeachingReleaseUrl(branding.repositoryUrl)}>{children ?? TEACHING_RELEASE.tag}</Link>;
}

export function TeachingReleaseIntegrity() {
  const branding = useSiteBranding();
  const fileName = getFileName(branding.shortName ?? "dataset", "sqlite");
  return (
    <>
      <p>The expected SHA-256 for <code>{fileName}</code> in release <TeachingRelease /> is:</p>
      <pre><code>{TEACHING_RELEASE.sqliteSha256}</code></pre>
      <p>Run one command from the folder containing the downloaded SQLite file:</p>
      <p><strong>Linux:</strong></p>
      <pre><code>{`sha256sum ${fileName}`}</code></pre>
      <p><strong>macOS:</strong></p>
      <pre><code>{`shasum -a 256 ${fileName}`}</code></pre>
      <p><strong>Windows PowerShell:</strong></p>
      <pre><code>{`Get-FileHash .\\${fileName} -Algorithm SHA256`}</code></pre>
      <p>Compare all 64 hexadecimal characters; letter case does not matter. A match identifies the SQLite file used for the worked examples. If the hash differs, download the pinned release again before relying on those results. This checksum applies to the SQLite file; it does not verify the Excel workbook or CSV archive.</p>
    </>
  );
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
