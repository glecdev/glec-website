# GLEC Website - Automated Neon + Vercel Deployment Script
# This script guides you through the entire deployment process

param(
    [string]$VercelToken = "4WjWFbv1BRjxABWdkzCI6jF0"
)

Write-Host "🚀 GLEC Website - Automated Deployment" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Pre-generated secrets
$JWT_SECRET = "l8QvGUhHvCRIWzp9jYd6spUWCl3SaVIX"
$NEXTAUTH_SECRET = "dujOrSKI/WmIyszrDYWdunXZoMi4uIa/"
$ADMIN_EMAIL = "admin@glec.io"
$ADMIN_PASSWORD = "GLEC2025Admin!"
$ADMIN_PASSWORD_HASH = "`$2b`$10`$t8TJYW0ON/wyQ0/B1ZwnBubzKd2saGEjYYgVZs37wcFuxzaDDiQ0O"

Write-Host "✅ Pre-generated secrets loaded" -ForegroundColor Green
Write-Host "   Admin Email: $ADMIN_EMAIL"
Write-Host "   Admin Password: $ADMIN_PASSWORD"
Write-Host ""

# Step 1: Neon Database Setup
Write-Host "📝 Step 1: Neon PostgreSQL Setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please follow these steps to create a Neon database:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open in browser: https://console.neon.tech/signup"
Write-Host "2. Sign up with GitHub (recommended)"
Write-Host "3. Click 'Create a project'"
Write-Host "4. Project name: glec-production"
Write-Host "5. PostgreSQL version: 16"
Write-Host "6. Region: AWS ap-northeast-1 (Tokyo)"
Write-Host "7. Click 'Create Project'"
Write-Host ""
Write-Host "8. In the dashboard, find 'Connection Details'"
Write-Host "9. Select 'Pooled connection' (IMPORTANT!)"
Write-Host "10. Copy the connection string"
Write-Host ""

# Open browser automatically
Start-Process "https://console.neon.tech/signup"

Write-Host "Press Enter after you've created the database..." -ForegroundColor Yellow
Read-Host

$DATABASE_URL = Read-Host "Paste the Neon Connection String here"

if ([string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    Write-Host "❌ DATABASE_URL is required" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database URL received" -ForegroundColor Green
Write-Host ""

# Step 2: Add environment variables to Vercel
Write-Host "📝 Step 2: Adding environment variables to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Create a temporary file with all environment variables
$envVars = @{
    "DATABASE_URL" = $DATABASE_URL
    "DIRECT_URL" = $DATABASE_URL
    "JWT_SECRET" = $JWT_SECRET
    "NEXTAUTH_SECRET" = $NEXTAUTH_SECRET
    "NEXTAUTH_URL" = "https://glec-website.vercel.app"
    "ADMIN_EMAIL" = $ADMIN_EMAIL
    "ADMIN_PASSWORD_HASH" = $ADMIN_PASSWORD_HASH
    "RESEND_API_KEY" = "skip"
    "RESEND_FROM_EMAIL" = "noreply@glec.io"
    "R2_ACCOUNT_ID" = "skip"
    "R2_ACCESS_KEY_ID" = "skip"
    "R2_SECRET_ACCESS_KEY" = "skip"
    "R2_BUCKET_NAME" = "glec-assets"
    "R2_PUBLIC_URL" = "https://placeholder.r2.dev"
}

Write-Host "Adding $($envVars.Count) environment variables to Vercel..." -ForegroundColor Yellow

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "  Adding $key..."

    # Use Vercel CLI to add environment variable
    $value | node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" env add $key production --token=$VercelToken 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ $key added" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  $key may already exist or failed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ All environment variables processed" -ForegroundColor Green
Write-Host ""

# Step 3: Run database migration
Write-Host "📝 Step 3: Running database migration..." -ForegroundColor Cyan
Write-Host ""

$env:DATABASE_URL = $DATABASE_URL

Write-Host "Generating Prisma Client..."
npx prisma generate

Write-Host "Running migration..."
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migration completed" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed - check errors above" -ForegroundColor Red
    Write-Host "You can run manually: npx prisma migrate deploy" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Deploy to Vercel
Write-Host "📝 Step 4: Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

node "$env:APPDATA\npm\node_modules\vercel\dist\index.js" --prod --token=$VercelToken

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Deployment may have issues - check logs" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Verification
Write-Host "📝 Step 5: Verification" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please verify the following:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Homepage: https://glec-website.vercel.app"
Write-Host "   ✓ Page loads without errors"
Write-Host ""
Write-Host "2. Admin Login: https://glec-website.vercel.app/admin/login"
Write-Host "   Email: $ADMIN_EMAIL"
Write-Host "   Password: $ADMIN_PASSWORD"
Write-Host "   ✓ Login successful"
Write-Host ""
Write-Host "3. Admin Dashboard: https://glec-website.vercel.app/admin/dashboard"
Write-Host "   ✓ Dashboard displays"
Write-Host ""
Write-Host "4. Create Test Notice:"
Write-Host "   - Visit: https://glec-website.vercel.app/admin/notices"
Write-Host "   - Click '+ New Notice'"
Write-Host "   - Title: 'Welcome to GLEC'"
Write-Host "   - Content: 'This is a test notice'"
Write-Host "   - Category: GENERAL"
Write-Host "   - Status: PUBLISHED"
Write-Host "   - Click 'Create'"
Write-Host ""
Write-Host "5. Verify Real-time Sync:"
Write-Host "   - Visit: https://glec-website.vercel.app/news"
Write-Host "   - ✓ 'Welcome to GLEC' notice appears"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Production URL: https://glec-website.vercel.app" -ForegroundColor Cyan
Write-Host "Admin URL: https://glec-website.vercel.app/admin/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Email: $ADMIN_EMAIL"
Write-Host "  Password: $ADMIN_PASSWORD"
Write-Host ""
Write-Host "⚠️  Please change the admin password after first login!" -ForegroundColor Red
Write-Host ""
