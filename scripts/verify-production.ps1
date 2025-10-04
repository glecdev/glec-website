# Verify GLEC Website Production Deployment
# This script checks if all public pages are accessible

param(
    [string]$BaseUrl = "https://glec-website.vercel.app"
)

$ErrorActionPreference = "Continue"

Write-Host "🔍 GLEC Website - Production Verification" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host ""

# Define pages to test
$pages = @(
    @{ Path = "/"; Name = "Homepage" },
    @{ Path = "/about"; Name = "About Company" },
    @{ Path = "/products"; Name = "Products Overview" },
    @{ Path = "/products/dtg"; Name = "DTG Product" },
    @{ Path = "/products/carbon-api"; Name = "Carbon API" },
    @{ Path = "/products/glec-cloud"; Name = "GLEC Cloud" },
    @{ Path = "/knowledge"; Name = "Knowledge Hub" },
    @{ Path = "/knowledge/library"; Name = "Knowledge Library" },
    @{ Path = "/knowledge/videos"; Name = "Knowledge Videos" },
    @{ Path = "/knowledge/blog"; Name = "Knowledge Blog" },
    @{ Path = "/press"; Name = "Press Releases" },
    @{ Path = "/news"; Name = "News/Notices" },
    @{ Path = "/contact"; Name = "Contact Form" }
)

$results = @()
$totalPages = $pages.Count
$successCount = 0
$failCount = 0

Write-Host "Testing $totalPages pages..." -ForegroundColor Yellow
Write-Host ""

foreach ($page in $pages) {
    $url = "$BaseUrl$($page.Path)"

    Write-Host "Testing: $($page.Name) ($url)" -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ OK" -ForegroundColor Green
            $successCount++
            $results += @{
                Page = $page.Name
                Path = $page.Path
                Status = "✅ OK"
                StatusCode = 200
            }
        } else {
            Write-Host " ⚠️ $($response.StatusCode)" -ForegroundColor Yellow
            $failCount++
            $results += @{
                Page = $page.Name
                Path = $page.Path
                Status = "⚠️ Warning"
                StatusCode = $response.StatusCode
            }
        }
    } catch {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        $failCount++
        $results += @{
            Page = $page.Name
            Path = $page.Path
            Status = "❌ Failed"
            StatusCode = "Error"
            Error = $_.Exception.Message
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "📊 Verification Summary" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Total Pages:     $totalPages" -ForegroundColor White
Write-Host "✅ Successful:   $successCount" -ForegroundColor Green
Write-Host "❌ Failed:       $failCount" -ForegroundColor Red
Write-Host ""

$successRate = [math]::Round(($successCount / $totalPages) * 100, 2)
Write-Host "Success Rate:    $successRate%" -ForegroundColor Cyan
Write-Host ""

# Test database-dependent features (should fail gracefully without DB)
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "🔍 Database-Dependent Features (Expected to fail)" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$dbPages = @(
    @{ Path = "/admin/login"; Name = "Admin Login" },
    @{ Path = "/api/notices"; Name = "Notices API" },
    @{ Path = "/api/press"; Name = "Press API" }
)

foreach ($page in $dbPages) {
    $url = "$BaseUrl$($page.Path)"

    Write-Host "Testing: $($page.Name) ($url)" -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue

        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ OK (DB connected!)" -ForegroundColor Green
        } else {
            Write-Host " ⚠️ $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ⏳ Waiting for DB (Expected)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🎯 Next Steps" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "✅ All public pages are working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready for database connection:" -ForegroundColor Cyan
    Write-Host "  1. Create Neon database (3 min)" -ForegroundColor White
    Write-Host "  2. Run .\scripts\complete-deployment.ps1" -ForegroundColor White
    Write-Host "  3. Test admin features" -ForegroundColor White
} else {
    Write-Host "⚠️ Some pages failed. Please check:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($result in $results) {
        if ($result.Status -ne "✅ OK") {
            Write-Host "  - $($result.Page): $($result.Path)" -ForegroundColor Red
            if ($result.Error) {
                Write-Host "    Error: $($result.Error)" -ForegroundColor DarkRed
            }
        }
    }
}

Write-Host ""
Write-Host "📊 Full Report:" -ForegroundColor Cyan
Write-Host ""
$results | ForEach-Object {
    Write-Host "  $($_.Status) $($_.Page) - $($_.Path)" -ForegroundColor White
}
Write-Host ""

# Exit code
if ($failCount -eq 0) {
    exit 0
} else {
    exit 1
}
