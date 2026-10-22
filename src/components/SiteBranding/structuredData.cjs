const publication = require('./publication.cjs');
const LICENSE_URL = publication.licenseUrl;
const {
  getTeachingDownloadBaseUrl,
} = require("../../data/teachingRelease.cjs");

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
  return `${getTeachingDownloadBaseUrl(branding.repositoryUrl)}/${getFileName(branding.shortName ?? "dataset", type)}`;
}

function publisher() {
  return { "@type": "Organization", "@id": publication.publisherId, name: "Accounting Analytics Hub", url: publication.hubUrl };
}

function creator() {
  return { "@type": "Person", "@id": publication.creatorId, name: publication.creatorName,
    alternateName: publication.archivalCreatorName, url: publication.creatorUrl };
}

function buildDatasetStructuredData(branding, { pagePath = "/docs/downloads", description } = {}) {
  const datasetName = branding.datasetName ?? "Accounting Dataset";
  const isDownloadsPage = pagePath.replace(/\/+$/, "") === "/docs/downloads";

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": publication.datasetId,
    name: datasetName,
    alternateName: [branding.displayName, publication.citationTitle],
    description: description ?? `${datasetName} is an accounting learning environment connecting business processes, source documents, accounting records, SQL, Excel, and guided cases.`,
    url: toAbsoluteUrl(branding.baseUrl),
    identifier: { "@type": "PropertyValue", propertyID: "DOI (all versions)",
      value: publication.conceptDoi.replace('https://doi.org/', ''), url: publication.conceptDoi },
    mainEntityOfPage: toAbsoluteUrl(branding.baseUrl, pagePath),
    subjectOf: { "@id": `${publication.discoveryUrl}#webpage` },
    isAccessibleForFree: true,
    license: LICENSE_URL,
    creator: creator(),
    publisher: publisher(),
    ...(isDownloadsPage ? {
      sameAs: publication.conceptDoi,
      citation: {
        "@type": "CreativeWork",
        name: publication.citationTitle,
        datePublished: publication.citationYear,
        url: publication.versionDoi,
        creator: creator(),
        publisher: publisher(),
      },
      distribution: [
        ["sqlite", "SQLite Database", "application/vnd.sqlite3"],
        ["excel", "Excel Workbook", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        ["csv", "CSV Zip Package", "application/zip"],
      ].map(([type, label, encodingFormat]) => ({
        "@type": "DataDownload",
        name: `${datasetName} ${label}`,
        encodingFormat,
        contentUrl: getReleaseDownloadUrl(branding, type),
      })),
    } : {}),
  };
}

function buildWebPageStructuredData(branding, metadata) {
  const url = toAbsoluteUrl(branding.baseUrl, metadata.permalink === '/' ? '/' : metadata.permalink.replace(/\/+$/, ''));
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: metadata.title,
    description: metadata.description,
    inLanguage: "en",
    isPartOf: { "@id": `${toAbsoluteUrl(branding.baseUrl)}#website` },
    about: { "@id": publication.datasetId },
    publisher: publisher(),
    ...(metadata.learningResourceId ? { mainEntity: { "@id": metadata.learningResourceId } } : {}),
  };
}

function buildWebSiteStructuredData(branding, description) {
  const url = toAbsoluteUrl(branding.baseUrl);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    url,
    name: branding.datasetName,
    description,
    inLanguage: "en",
    publisher: publisher(),
    about: { "@id": publication.datasetId },
    isPartOf: { "@type": "WebSite", "@id": `${publication.hubUrl}#website`, name: "Accounting Analytics Hub", url: publication.hubUrl },
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
    about: { "@id": publication.datasetId },
    inLanguage: "en",
    isAccessibleForFree: true,
    license: LICENSE_URL,
    publisher: publisher(),
    isPartOf: {
      "@type": "WebSite",
      "@id": `${toAbsoluteUrl(branding.baseUrl)}#website`,
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
  buildWebPageStructuredData,
  buildWebSiteStructuredData,
  getFileName,
  getReleaseDownloadUrl,
  serializeStructuredData,
};
