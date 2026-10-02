# Windows x86_64 project-only installation. No PATH/registry/default Python changes.
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path $PSScriptRoot -Parent
Push-Location $taskRoot
try {
    if ($env:OS -ne 'Windows_NT' -or $env:PROCESSOR_ARCHITECTURE -ne 'AMD64') {
        throw 'This bootstrap is for Windows x86_64. Use the pinned Linux Docker image otherwise.'
    }
    $taskUvVersion = (& uv --version)
    if ($LASTEXITCODE -ne 0 -or $taskUvVersion -notmatch '^uv 0\.12\.5\b') {
        throw 'uv 0.12.5 is required; do not upgrade the global installation automatically.'
    }
    $taskVersion = (Get-Content -LiteralPath '.python-version' -Raw).Trim()
    $taskPythonExe = Join-Path $taskRoot ".tools/python/cpython-$taskVersion-windows-x86_64-none/python.exe"
    $taskMetadata = 'https://raw.githubusercontent.com/astral-sh/uv/7e9d252e37065168cd3ed8419bb31da512133604/crates/uv-python/download-metadata.json'
    if (-not (Test-Path -LiteralPath $taskPythonExe)) {
        & uv python install $taskVersion --install-dir .tools/python --no-bin --no-registry --python-downloads-json-url $taskMetadata
        if ($LASTEXITCODE -ne 0) { throw 'Project Python installation failed.' }
    }
    $taskActualVersion = (& $taskPythonExe --version)
    if ($LASTEXITCODE -ne 0 -or $taskActualVersion -ne "Python $taskVersion") {
        throw 'The project Python interpreter does not match .python-version.'
    }
    & uv sync --locked --python $taskPythonExe
    if ($LASTEXITCODE -ne 0) { throw 'Locked dependency installation failed.' }
} finally {
    Pop-Location
}
