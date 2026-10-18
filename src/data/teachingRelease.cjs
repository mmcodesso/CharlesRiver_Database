// Public links follow GitHub's latest published release.
// Verification baselines remain in the private worked-example registers.

function getTeachingReleaseUrl(repositoryUrl) {
  return `${repositoryUrl.replace(/\/+$/, "")}/releases/latest`;
}

function getTeachingDownloadBaseUrl(repositoryUrl) {
  return `${getTeachingReleaseUrl(repositoryUrl)}/download`;
}

module.exports = { getTeachingReleaseUrl, getTeachingDownloadBaseUrl };
