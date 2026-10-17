$ErrorActionPreference = 'Stop'
$taskRepo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$taskManifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'frozen-artifact-hashes.json') -Raw | ConvertFrom-Json
$taskGitRoot = $taskRepo.Replace('\', '/')
Push-Location -LiteralPath $taskRepo
try {
  & git -c "safe.directory=$taskGitRoot" -c core.safecrlf=false diff --exit-code $taskManifest.baseline -- generate_dataset.py src/generator_dataset config queries scripts tests ':!tests/test_docs_onboarding_flow.py' ':!tests/website'
  if ($LASTEXITCODE -ne 0) { throw 'A protected tracked path differs from the frozen baseline.' }
  $taskUntracked = @(& git -c "safe.directory=$taskGitRoot" ls-files --others --exclude-standard)
  if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect untracked files.' }
  foreach ($taskPath in $taskUntracked) {
    if ($taskPath -match '^(generate_dataset\.py|src/generator_dataset/|config/|queries/|scripts/)' -or ($taskPath -match '^tests/' -and $taskPath -notmatch '^tests/website/')) {
      throw "Unexpected untracked protected path: $taskPath"
    }
  }
  foreach ($taskArtifact in $taskManifest.artifacts) {
    $taskArtifactPath = Join-Path $taskRepo $taskArtifact.path
    if (-not (Test-Path -LiteralPath $taskArtifactPath -PathType Leaf)) { throw "Missing artifact: $($taskArtifact.path)" }
    $taskDigest = (Get-FileHash -LiteralPath $taskArtifactPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($taskDigest -ne $taskArtifact.sha256) { throw "Changed artifact: $($taskArtifact.path)" }
  }
  Write-Output "PASS: protected tracked paths unchanged; all $($taskManifest.artifacts.Count) frozen dataset/report artifacts match SHA-256."
} finally {
  Pop-Location
}
