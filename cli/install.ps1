# MicroAgent CLI Installer for Windows
# Run: powershell -c "irm https://raw.githubusercontent.com/rifty/micro-agent/main/Micro-Agent-CLI/install.ps1 | iex"

$REPO   = if ($env:MICROAGENT_REPO)   { $env:MICROAGENT_REPO }   else { "https://github.com/riftyxso-afk/micro-agent" }
$BRANCH = if ($env:MICROAGENT_BRANCH) { $env:MICROAGENT_BRANCH } else { "main" }
$DIR    = "microagent-cli"

Write-Host "`n  ┌────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │      MicroAgent CLI Installer      │" -ForegroundColor Cyan
Write-Host "  └────────────────────────────────────┘`n" -ForegroundColor Cyan

# check Python
$PY = $null
foreach ($cmd in @("python3", "python")) {
    $ver = &$cmd --version 2>&1
    if ($ver -match "(\d+)\.(\d+)") {
        if ([int]$Matches.1 -ge 3 -and [int]$Matches.2 -ge 10) {
            $PY = $cmd
            break
        }
    }
}
if (-not $PY) {
    Write-Host "  ✗ Python 3.10+ required. Install from https://python.org/downloads" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Python: $(& $PY --version)" -ForegroundColor Green

# check pip
$PIP = $null
foreach ($cmd in @("pip3", "pip")) {
    $v = &$cmd --version 2>&1
    if ($LASTEXITCODE -eq 0) { $PIP = $cmd; break }
}
if (-not $PIP) {
    Write-Host "  ✗ pip not found. Run: $PY -m ensurepip --upgrade" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ pip: $(& $PIP --version | Select-Object -First 1)" -ForegroundColor Green

# download
$TMP = Join-Path $env:TEMP "microagent-install"
if (Test-Path $TMP) { Remove-Item -Recurse -Force $TMP }
New-Item -ItemType Directory -Force -Path $TMP | Out-Null

Write-Host "`n  µ Downloading MicroAgent CLI..." -ForegroundColor Cyan

$zipUrl = "$REPO/archive/refs/heads/$BRANCH.zip"
$zipPath = Join-Path $TMP "micro-agent.zip"
try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -ErrorAction Stop
} catch {
    Write-Host "  ✗ Download failed: $_" -ForegroundColor Red
    exit 1
}
Expand-Archive -Path $zipPath -DestinationPath $TMP -Force

# find CLI dir
$srcDir = Get-ChildItem -Path $TMP -Directory | Where-Object { $_.Name -like "micro-agent*" } | Select-Object -First 1
$cliDir = Join-Path $srcDir.FullName "cli"
if (-not (Test-Path $cliDir)) {
    Write-Host "  ✗ Could not find Micro-Agent-CLI directory" -ForegroundColor Red
    exit 1
}
cd $cliDir

# install deps
Write-Host "  µ Installing dependencies..." -ForegroundColor Cyan
& $PIP install --quiet rich textual httpx prompt-toolkit 2>&1 | Out-Null

Write-Host "  µ Installing microagent-cli..." -ForegroundColor Cyan
& $PIP install --quiet -e . 2>&1 | Out-Null

Write-Host "`n  ✓ MicroAgent CLI installed!" -ForegroundColor Green

# setup .env
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    }
    Write-Host "`n  Set up API keys in: $(Resolve-Path .env)" -ForegroundColor Yellow
}

Write-Host "`n  µ Run: microagent" -ForegroundColor Cyan
Write-Host ""

# cleanup
Remove-Item -Recurse -Force $TMP -ErrorAction SilentlyContinue
