const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
const HUB_URL = "https://accountinganalyticshub.com/";
const RELEASE_VERSION = "2027.1";

function toAbsoluteUrl(baseUrl, path = "/") {
  return new URL(path, `${String(baseUrl || "").replace(/\/+$/, "")}/`).toString();
}

function getFileName(shortName, type) {
  const fileNames = {
    sqlite: `${shortName}.sqlite`,
    excel: `${shortName}.xlsx`,
    support: `${shortName}_support.xlsx`,
    csv: `${shortName}_csv.zip`,
    generationLog: "generation.log",
  };
  if (!Object.hasOwn(fileNames, type)) {
    throw new Error(`Unsupported file type: ${type}`);
  }
  return fileNames[type];
}

function getReleaseDownloadUrl(branding, type) {
  return `${branding.releaseBaseUrl}/${getFileName(branding.shortName ?? "dataset", type)}`;
}

function publisher() {
  return { "@type": "Organization", name: "Accounting Analytics Hub", url: HUB_URL };
}

function buildDatasetStructuredData(branding, { pagePath = "/", description } = {}) {
  const datasetName = branding.datasetName ?? "Accounting Dataset";
  const datasetUrl = toAbsoluteUrl(branding.baseUrl);
  const repositoryUrl = branding.repositoryUrl.replace(/\/+$/, "");
  const releaseUrl = `${repositoryUrl}/releases/tag/v${RELEASE_VERSION}`;
  const downloadBaseUrl = `${repositoryUrl}/releases/download/v${RELEASE_VERSION}`;
  const shortName = branding.shortName ?? "dataset";

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${datasetUrl}#dataset`,
    name: datasetName,
    alternateName: branding.displayName,
    description: description ?? `${datasetName} is a synthetic teaching environment connecting business processes, source documents, accounting records, SQL, Excel, and guided cases.`,
    url: datasetUrl,
    mainEntityOfPage: toAbsoluteUrl(branding.baseUrl, pagePath),
    sameAs: releaseUrl,
    version: RELEASE_VERSION,
    isAccessibleForFree: true,
    license: LICENSE_URL,
    creator: { "@type": "Person", name: "Mauricio Mello Codesso" },
    publisher: publisher(),
    citation: {
      "@type": "CreativeWork",
      name: `${datasetName}, release v${RELEASE_VERSION}`,
      url: releaseUrl,
    },
    distribution: [
      ["sqlite", "SQLite Database", "application/vnd.sqlite3"],
      ["excel", "Excel Workbook", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ["csv", "CSV Zip Package", "application/zip"],
    ].map(([type, label, encodingFormat]) => ({
      "@type": "DataDownload",
      name: `${datasetName} ${label}`,
      encodingFormat,
      contentUrl: `${downloadBaseUrl}/${getFileName(shortName, type)}`,
    })),
  };
}

function buildLearningResourceStructuredData(branding, metadata, resourceType) {
  const url = toAbsoluteUrl(branding.baseUrl, metadata.permalink);
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    name: metadata.title,
    description: metadata.description,
    url,
    mainEntityOfPage: url,
    learningResourceType: resourceType,
    inLanguage: "en",
    isAccessibleForFree: true,
    license: LICENSE_URL,
    publisher: publisher(),
    isPartOf: {
      "@type": "CreativeWork",
      name: branding.datasetName,
      url: toAbsoluteUrl(branding.baseUrl),
    },
  };
}

function serializeStructuredData(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

module.exports = {
  buildDatasetStructuredData,
  buildLearningResourceStructuredData,
  getFileName,
  getReleaseDownloadUrl,
  serializeStructuredData,
};
