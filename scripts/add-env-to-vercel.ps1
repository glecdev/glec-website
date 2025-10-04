# Add Environment Variables to Vercel
# This script automatically adds all basic environment variables

param(
    [string]$VercelToken = "4WjWFbv1BRjxABWdkzCI6jF0"
)

$ErrorActionPreference = "Continue"

Write-Host "🚀 Adding environment variables to Vercel..." -ForegroundColor Green
Write-Host ""

# Pre-generated values
$envVars = @{
    "JWT_SECRET" = "l8QvGUhHvCRIWzp9jYd6spUWCl3SaVIX"
    "NEXTAUTH_SECRET" = "dujOrSKI/WmIyszrDYWdunXZoMi4uIa/"
    "NEXTAUTH_URL" = "https://glec-website.vercel.app"
    "ADMIN_EMAIL" = "admin@glec.io"
    "ADMIN_PASSWORD_HASH" = "`$2b`$10`$t8TJYW0ON/wyQ0/B1ZwnBubzKd2saGEjYYgVZs37wcFuxzaDDiQ0O"
    "RESEND_API_KEY" = "skip"
    "RESEND_FROM_EMAIL" = "noreply@glec.io"
    "R2_ACCOUNT_ID" = "skip"
    "R2_ACCESS_KEY_ID" = "skip"
    "R2_SECRET_ACCESS_KEY" = "skip"
    "R2_BUCKET_NAME" = "glec-assets"
    "R2_PUBLIC_URL" = "https://placeholder.r2.dev"
}

$vercelPath = "$env:APPDATA\npm\node_modules\vercel\dist\index.js"

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "Adding $key..." -ForegroundColor Cyan

    # Add to Vercel
    $input = $value
    $result = $input | node $vercelPath env add $key production --token=$VercelToken 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $key added successfully" -ForegroundColor Green
    } else {
        if ($result -match "already exists") {
            Write-Host "  ℹ️  $key already exists (skipping)" -ForegroundColor Yellow
        } else {
            Write-Host "  ⚠️  Failed to add $key" -ForegroundColor Red
            Write-Host "     $result" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "✅ Basic environment variables processed" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  Missing: DATABASE_URL and DIRECT_URL" -ForegroundColor Yellow
Write-Host "   These must be added after creating Neon database" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next step: Create Neon database" -ForegroundColor Cyan
Write-Host "  1. Visit: https://console.neon.tech/signup"
Write-Host "  2. Create project: glec-production"
Write-Host "  3. Copy connection string"
Write-Host "  4. Run: node $vercelPath env add DATABASE_URL production --token=$VercelToken"
Write-Host ""
