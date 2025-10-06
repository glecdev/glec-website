# Vercel Environment Variables Setup Script (PowerShell)
# This script uses Vercel API to set environment variables

$PROJECT_ID = "prj_KpvFGT6jYZmn1NkaGQYrXulyvoUc"
$ORG_ID = "team_FyXieuFmjuvvBKq0uolrVZhg"

Write-Host "🚀 GLEC Vercel Environment Variables Setup" -ForegroundColor Cyan
Write-Host "============================================`n"

# Check if VERCEL_TOKEN is set
if (-not $env:VERCEL_TOKEN) {
    Write-Host "⚠️  VERCEL_TOKEN not found in environment" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set environment variables via API, you need a Vercel token:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. Go to: https://vercel.com/account/tokens" -ForegroundColor Green
    Write-Host "2. Create a new token named 'GLEC_DEPLOYMENT'" -ForegroundColor Green
    Write-Host "3. Copy the token" -ForegroundColor Green
    Write-Host "4. Run: `$env:VERCEL_TOKEN = 'your_token_here'" -ForegroundColor Green
    Write-Host "5. Run this script again" -ForegroundColor Green
    Write-Host ""
    Write-Host "Or use the web UI instead:" -ForegroundColor White
    Write-Host "👉 https://vercel.com/dashboard/team_FyXieuFmjuvvBKq0uolrVZhg/glec-website/settings/environment-variables" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ VERCEL_TOKEN found, proceeding with API setup..." -ForegroundColor Green
Write-Host ""

# Define environment variables
$envVars = @(
    @{
        key = "DATABASE_URL"
        value = "postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
        target = @("production", "preview", "development")
    },
    @{
        key = "DIRECT_URL"
        value = "postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
        target = @("production", "preview", "development")
    },
    @{
        key = "JWT_SECRET"
        value = "qzs1M2W/J+FALLBWRWITPkNstWi9W1rr5nvlo2Uax2w="
        target = @("production", "preview")
    },
    @{
        key = "NEXTAUTH_SECRET"
        value = "t6SzA1D1Sn8r3ACMKR7jgFX73JjxsfdQXpeTNVPBWPE="
        target = @("production", "preview")
    },
    @{
        key = "NEXTAUTH_URL"
        value = "https://glec-website.vercel.app"
        target = @("production")
    }
)

$headers = @{
    "Authorization" = "Bearer $env:VERCEL_TOKEN"
    "Content-Type" = "application/json"
}

$successCount = 0
$failCount = 0

foreach ($env in $envVars) {
    Write-Host "📦 Setting $($env.key)..." -ForegroundColor Cyan

    $body = @{
        key = $env.key
        value = $env.value
        type = "encrypted"
        target = $env.target
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$PROJECT_ID/env" `
            -Method Post `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop

        Write-Host "   ✅ Success: $($env.key)" -ForegroundColor Green
        $successCount++
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 409) {
            Write-Host "   ⚠️  Already exists: $($env.key)" -ForegroundColor Yellow
        }
        else {
            Write-Host "   ❌ Failed: $($env.key) (Status: $statusCode)" -ForegroundColor Red
            Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        $failCount++
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor White
Write-Host "  ✅ Successful: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "============================================`n" -ForegroundColor Cyan

if ($successCount -gt 0) {
    Write-Host "🔄 Next step: Trigger a new deployment" -ForegroundColor Cyan
    Write-Host "   Run: cd D:\GLEC-Website\glec-website && git commit --allow-empty -m 'chore: trigger deployment' && git push" -ForegroundColor Yellow
}
