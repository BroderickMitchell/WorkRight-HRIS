<# 
run-demo.ps1 — One-click runner for WorkRight HRIS (Windows/PowerShell)

Usage:
  1) Open PowerShell in the project root (where package.json and docker-compose.yml live).
  2) Run:  .\run-demo.ps1
     (If you get an execution policy warning:  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

What it does:
  - Verifies Node (>=24.11), pnpm (>=8.15.5), and Docker are installed and running
  - Installs dependencies with pnpm
  - Starts Docker services (Postgres, Redis, Mailhog)
  - Pushes DB schema & seeds sample data
  - Launches API and Web app in separate terminals
  - Opens browser tabs for Web, API docs, and Mailhog
#>

[CmdletBinding()]
param(
  [switch]$SkipSeed,
  [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Section($msg) {
  Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Fail($msg) {
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}

function Check-Cmd($name, $versionArg, [Version]$minVersion) {
  try {
    $proc = Start-Process -FilePath $name -ArgumentList $versionArg -NoNewWindow -PassThru -RedirectStandardOutput out.txt -RedirectStandardError err.txt
    $proc.WaitForExit()
    $out = Get-Content -Raw out.txt
    Remove-Item out.txt, err.txt -ErrorAction SilentlyContinue

    if ($proc.ExitCode -ne 0) { return $false }

    # Extract version (first x.y.z we find)
    if ($out -match '(\d+\.\d+\.\d+)') {
      $ver = [Version]$matches[1]
      if ($ver -lt $minVersion) {
        Fail "$name version $ver found, but >= $minVersion required."
      }
      return $true
    } else {
      # If no semantic version in stdout, assume ok (e.g. Docker CLI prints additional info)
      return $true
    }
  } catch {
    return $false
  }
}

function Ensure-DockerRunning {
  try {
    $proc = Start-Process -FilePath "docker" -ArgumentList "info" -NoNewWindow -PassThru -RedirectStandardOutput out.txt -RedirectStandardError err.txt
    $proc.WaitForExit()
    $out = Get-Content -Raw out.txt
    Remove-Item out.txt, err.txt -ErrorAction SilentlyContinue
  } catch {
    Fail "Docker Desktop is not running. Please start Docker and re-run this script."
  }
}

function Wait-For-Postgres {
  Write-Host "Waiting for database to accept connections (timeout 60s)..." -ForegroundColor Yellow
  $deadline = (Get-Date).AddSeconds(60)
  do {
    try {
      # pg_isready available inside the db container
      $p = Start-Process -FilePath "docker" -ArgumentList "compose exec -T db pg_isready -U postgres" -NoNewWindow -PassThru -RedirectStandardOutput out.txt -RedirectStandardError err.txt
      $p.WaitForExit()
      $out = Get-Content -Raw out.txt
      Remove-Item out.txt, err.txt -ErrorAction SilentlyContinue
      if ($out -match "accepting connections") { 
        Write-Host "Postgres is ready." -ForegroundColor Green
        return 
      }
    } catch { }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)
  Write-Host "Continuing without explicit DB readiness (may still be initializing)..." -ForegroundColor Yellow
}

# 1) Pre-flight checks
Write-Section "Pre-flight checks"
if (-not (Check-Cmd "node" "--version" ([Version]"24.11.0"))) {
  Fail "Node.js not found. Install Node 24.11.0+ and try again."
}
if (-not (Check-Cmd "pnpm" "--version" ([Version]"8.15.5"))) {
  Fail "pnpm not found. Install pnpm 8.15.5+ (https://pnpm.io/installation) and try again."
}
if (-not (Check-Cmd "docker" "--version" ([Version]"20.0.0"))) {
  Fail "Docker CLI not found. Install Docker Desktop and try again."
}
Ensure-DockerRunning

# 2) Ensure we are in repo root (where package.json and docker-compose.yml exist)
if (-not (Test-Path -Path ".\package.json")) { Fail "package.json not found. Run this script from the repository root." }
if (-not (Test-Path -Path ".\docker-compose.yml") -and -not (Test-Path -Path ".\docker-compose.yaml")) {
  Fail "docker-compose file not found in current directory. Run this script from the repository root."
}

# 3) Install dependencies
Write-Section "Installing dependencies (pnpm install)"
pnpm install

# 4) Start docker services
Write-Section "Starting Docker services (docker compose up -d)"
docker compose up -d

# 5) Wait for DB then push & seed
if (-not $SkipSeed) {
  Write-Section "Preparing database (push + seed)"
  Wait-For-Postgres
  try {
    pnpm db:push
  } catch {
    Write-Host "db:push failed, attempting again in 5s..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    pnpm db:push
  }
  try {
    pnpm db:seed
  } catch {
    Write-Host "db:seed failed. You can re-run with 'pnpm db:seed' after services settle." -ForegroundColor Yellow
  }
} else {
  Write-Host "Skipping DB seed as requested." -ForegroundColor Yellow
}

# 6) Optional build (some teams prefer building once to catch issues)
if (-not $SkipBuild) {
  Write-Section "Building workspace (pnpm build)"
  pnpm build
} else {
  Write-Host "Skipping build as requested." -ForegroundColor Yellow
}

# 7) Launch dev servers in new terminals
Write-Section "Starting dev servers"
$apiCmd = 'pnpm --filter @workright/api dev'
$webCmd = 'pnpm --filter @workright/web dev'

Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCmd | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $webCmd | Out-Null

# 8) Open URLs
Write-Section "Opening URLs"
Start-Process "http://localhost:3000"
Start-Process "http://localhost:4000/api"
Start-Process "http://localhost:8025"

Write-Host "`nAll set! If windows didn't open, use these:" -ForegroundColor Green
Write-Host "  Web:    http://localhost:3000"
Write-Host "  API:    http://localhost:4000/api"
Write-Host "  Mailhog: http://localhost:8025"
