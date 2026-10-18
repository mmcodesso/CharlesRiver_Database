import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { getTeachingReleaseUrl } from "@site/src/data/teachingRelease.cjs";
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

export function TeachingReleaseLink({ children }) {
  const branding = useSiteBranding();
  return <Link href={getTeachingReleaseUrl(branding.repositoryUrl)}>{children ?? "View the latest release"}</Link>;
}

export function TeachingReleaseIntegrity() {
  const branding = useSiteBranding();
  const fileName = getFileName(branding.shortName ?? "dataset", "sqlite");
  return (
    <>
      <p>The <TeachingReleaseLink>latest release page</TeachingReleaseLink> provides file details and checksums. To check <code>{fileName}</code>, run one command from the folder containing your download:</p>
      <p><strong>Linux:</strong></p>
      <pre><code>{`sha256sum ${fileName}`}</code></pre>
      <p><strong>macOS:</strong></p>
      <pre><code>{`shasum -a 256 ${fileName}`}</code></pre>
      <p><strong>Windows PowerShell:</strong></p>
      <pre><code>{`Get-FileHash .\\${fileName} -Algorithm SHA256`}</code></pre>
      <p>Compare all 64 hexadecimal characters with the SHA-256 listed for that file on the release page; letter case does not matter. If the values differ, download the file again before beginning the analysis. Each format has its own checksum, so compare the SQLite result with the SQLite entry.</p>
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
