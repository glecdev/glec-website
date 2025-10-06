# GLEC Website - Background Process Cleanup Script
# Purpose: Kill redundant dev servers, Vercel deployments, and failed E2E tests
# Created: 2025-10-05

Write-Host "🧹 GLEC Website - Process Cleanup Starting..." -ForegroundColor Cyan
Write-Host ""

# Get current script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Function to display process summary
function Show-ProcessSummary {
    param([string]$processType, [int]$count)
    Write-Host "  - $processType`: $count processes" -ForegroundColor Yellow
}

# 1. Analyze current processes
Write-Host "📊 Step 1: Analyzing Background Processes" -ForegroundColor Green
Write-Host ""

# Get all node processes
$allNodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($allNodeProcesses) {
    $totalCount = ($allNodeProcesses | Measure-Object).Count
    Write-Host "Total Node.js processes found: $totalCount" -ForegroundColor White
    Write-Host ""

    # Categorize processes
    $devServers = @()
    $playwrightTests = @()
    $vercelDeployments = @()
    $otherProcesses = @()

    foreach ($proc in $allNodeProcesses) {
        try {
            $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine

            if ($cmdLine -like "*npm*run*dev*") {
                $devServers += $proc
            }
            elseif ($cmdLine -like "*playwright*test*") {
                $playwrightTests += $proc
            }
            elseif ($cmdLine -like "*vercel*") {
                $vercelDeployments += $proc
            }
            else {
                $otherProcesses += $proc
            }
        }
        catch {
            # Process might have terminated
        }
    }

    Write-Host "Process Breakdown:" -ForegroundColor Cyan
    Show-ProcessSummary "Development Servers" $devServers.Count
    Show-ProcessSummary "Playwright E2E Tests" $playwrightTests.Count
    Show-ProcessSummary "Vercel Deployments" $vercelDeployments.Count
    Show-ProcessSummary "Other Node.js" $otherProcesses.Count
    Write-Host ""

    # 2. Kill redundant dev servers (keep only one)
    Write-Host "🚫 Step 2: Cleaning Up Development Servers" -ForegroundColor Green
    Write-Host ""

    if ($devServers.Count -gt 1) {
        $keepServer = $devServers[0]
        $killServers = $devServers[1..($devServers.Count - 1)]

        Write-Host "Keeping: PID $($keepServer.Id)" -ForegroundColor Green
        Write-Host "Killing: $($killServers.Count) redundant dev servers..." -ForegroundColor Yellow

        foreach ($proc in $killServers) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction Stop
                Write-Host "  ✓ Killed PID $($proc.Id)" -ForegroundColor Gray
            }
            catch {
                Write-Host "  ✗ Failed to kill PID $($proc.Id)" -ForegroundColor Red
            }
        }

        Write-Host ""
        Write-Host "✅ Dev server cleanup complete: 1 server running" -ForegroundColor Green
    }
    elseif ($devServers.Count -eq 1) {
        Write-Host "✅ Only 1 dev server running (optimal)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  No dev servers running" -ForegroundColor Yellow
    }

    Write-Host ""

    # 3. Kill all Playwright test processes
    Write-Host "🧪 Step 3: Cleaning Up Playwright E2E Tests" -ForegroundColor Green
    Write-Host ""

    if ($playwrightTests.Count -gt 0) {
        Write-Host "Killing: $($playwrightTests.Count) E2E test processes..." -ForegroundColor Yellow

        foreach ($proc in $playwrightTests) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction Stop
                Write-Host "  ✓ Killed PID $($proc.Id)" -ForegroundColor Gray
            }
            catch {
                Write-Host "  ✗ Failed to kill PID $($proc.Id)" -ForegroundColor Red
            }
        }

        Write-Host ""
        Write-Host "✅ E2E test cleanup complete" -ForegroundColor Green
    }
    else {
        Write-Host "✅ No E2E test processes running" -ForegroundColor Green
    }

    Write-Host ""

    # 4. Kill all Vercel deployment processes
    Write-Host "🚀 Step 4: Cleaning Up Vercel Deployments" -ForegroundColor Green
    Write-Host ""

    if ($vercelDeployments.Count -gt 0) {
        Write-Host "Killing: $($vercelDeployments.Count) Vercel deployment processes..." -ForegroundColor Yellow

        foreach ($proc in $vercelDeployments) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction Stop
                Write-Host "  ✓ Killed PID $($proc.Id)" -ForegroundColor Gray
            }
            catch {
                Write-Host "  ✗ Failed to kill PID $($proc.Id)" -ForegroundColor Red
            }
        }

        Write-Host ""
        Write-Host "✅ Vercel deployment cleanup complete" -ForegroundColor Green
    }
    else {
        Write-Host "✅ No Vercel deployment processes running" -ForegroundColor Green
    }

    Write-Host ""

    # 5. Summary
    Write-Host "📊 Step 5: Final Summary" -ForegroundColor Green
    Write-Host ""

    # Re-check remaining processes
    $remainingProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    $remainingCount = if ($remainingProcesses) { ($remainingProcesses | Measure-Object).Count } else { 0 }

    $killed = $totalCount - $remainingCount

    Write-Host "Before Cleanup: $totalCount processes" -ForegroundColor White
    Write-Host "Killed: $killed processes" -ForegroundColor Yellow
    Write-Host "Remaining: $remainingCount processes" -ForegroundColor Green
    Write-Host ""

    if ($remainingProcesses) {
        Write-Host "Remaining Node.js Processes:" -ForegroundColor Cyan
        foreach ($proc in $remainingProcesses) {
            try {
                $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
                $shortCmd = if ($cmdLine.Length -gt 80) { $cmdLine.Substring(0, 80) + "..." } else { $cmdLine }
                Write-Host "  PID $($proc.Id): $shortCmd" -ForegroundColor Gray
            }
            catch {
                Write-Host "  PID $($proc.Id): (command unavailable)" -ForegroundColor Gray
            }
        }
    }

    Write-Host ""
    Write-Host "✅ Process cleanup complete!" -ForegroundColor Green
    Write-Host ""
}
else {
    Write-Host "ℹ️  No Node.js processes found" -ForegroundColor Cyan
}

# Return summary object
return @{
    TotalBefore = $totalCount
    Killed = $killed
    Remaining = $remainingCount
    DevServersRemaining = if ($devServers.Count -gt 0) { 1 } else { 0 }
}
