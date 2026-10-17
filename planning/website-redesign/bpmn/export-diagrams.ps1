param(
  [string]$DrawioPath = 'C:\Program Files\draw.io\draw.io.exe',
  [string]$ModelId
)
$ErrorActionPreference = 'Stop'
$taskRepo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../..')).Path
if (-not (Test-Path -LiteralPath $DrawioPath -PathType Leaf)) { throw 'Set -DrawioPath to an installed Draw.io Desktop executable.' }
$taskModels = Get-Content -LiteralPath (Join-Path $taskRepo 'src/data/bpmnModels.json') -Raw | ConvertFrom-Json
if ($ModelId) { $taskModels = @($taskModels | Where-Object { $_.id -eq $ModelId }); if (-not $taskModels.Count) { throw "Unknown model: $ModelId" } }
$taskLogDir = Join-Path $taskRepo 'outputs/_website_redesign/bpmn'
New-Item -ItemType Directory -Force -Path $taskLogDir | Out-Null
Push-Location -LiteralPath $taskRepo
try {
  foreach ($taskModel in $taskModels) {
    $taskSource = "static/diagrams/bpmn/$($taskModel.id).drawio"
    $taskSvg = "static/diagrams/bpmn/$($taskModel.id).svg"
    $taskRawSvg = "outputs/_website_redesign/bpmn/$($taskModel.id)-export.svg"
    if (-not (Test-Path -LiteralPath $taskSource -PathType Leaf)) { throw "Missing editable source: $taskSource" }
    # A failed Desktop export can return zero. Require a newly produced file,
    # and leave the published SVG intact until the new export is validated.
    if (Test-Path -LiteralPath $taskRawSvg -PathType Leaf) { Remove-Item -LiteralPath $taskRawSvg }
    # Relative paths avoid the Windows exporter's path-with-spaces parsing issue.
    $taskProcess = Start-Process -FilePath $DrawioPath -WorkingDirectory $taskRepo -ArgumentList '-x','-f','svg','-e','-u','--embed-svg-fonts','false','--svg-theme','light','-b','20','-o',$taskRawSvg,$taskSource,'--disable-gpu' -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $taskLogDir "$($taskModel.id)-export.log") -RedirectStandardError (Join-Path $taskLogDir "$($taskModel.id)-export-error.log")
    if ($taskProcess.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $taskRawSvg -PathType Leaf)) { throw "Draw.io export failed: $($taskModel.id)" }
    $taskSourceHash = (Get-FileHash -LiteralPath $taskSource -Algorithm SHA256).Hash.ToLowerInvariant()
    $taskSvgText = [IO.File]::ReadAllText((Join-Path $taskRepo $taskRawSvg))
    if ($taskSvgText -notmatch '<svg\b' -or $taskSvgText -notmatch 'content="') { throw "SVG lacks an embedded editable diagram: $taskSvg" }
    $taskTitle = [System.Security.SecurityElement]::Escape("$($taskModel.title) — BPMN teaching model")
    $taskDescription = [System.Security.SecurityElement]::Escape($taskModel.alt)
    $taskSvgText = [regex]::Replace($taskSvgText, '<svg\b([^>]*)>', { param($taskMatch) '<svg role="img" aria-labelledby="bpmn-title bpmn-description" data-source-sha256="' + $taskSourceHash + '"' + $taskMatch.Groups[1].Value + '><title id="bpmn-title">' + $taskTitle + '</title><desc id="bpmn-description">' + $taskDescription + '</desc>' }, 1)
    [IO.File]::WriteAllText((Join-Path $taskRepo $taskSvg), $taskSvgText, [Text.UTF8Encoding]::new($false))
    Write-Output "Exported $taskSource -> $taskSvg (Draw.io, editable XML, accessible description, source hash)."
  }
} finally { Pop-Location }
