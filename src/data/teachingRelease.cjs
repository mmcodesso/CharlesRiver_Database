// Website presentation baseline for the published worked examples and downloads.
// Generator settings and release assets remain independent and read-only here.
const version = "2027.1";
const TEACHING_RELEASE = Object.freeze({
  version,
  tag: `v${version}`,
  sqliteSha256: "de861968e07412d71032b6ed6a0fb8eb9825cf6911886b1597c4a628a914474c",
});

function getTeachingReleaseUrl(repositoryUrl) {
  return `${repositoryUrl.replace(/\/+$/, "")}/releases/tag/${TEACHING_RELEASE.tag}`;
}

function getTeachingDownloadBaseUrl(repositoryUrl) {
  return `${repositoryUrl.replace(/\/+$/, "")}/releases/download/${TEACHING_RELEASE.tag}`;
}

module.exports = { TEACHING_RELEASE, getTeachingReleaseUrl, getTeachingDownloadBaseUrl };
