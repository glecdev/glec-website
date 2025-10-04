# Complete GLEC Website Deployment
# This script completes the deployment after Neon database is created

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl,
    [string]$VercelToken = "4WjWFbv1BRjxABWdkzCI6jF0"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 GLEC Website - Final Deployment Steps" -ForegroundColor Green
Write-Host ""

# Step 1: Add DATABASE_URL to Vercel
Write-Host "📝 Step 1: Adding DATABASE_URL to Vercel..." -ForegroundColor Cyan
Write-Host ""

$vercelPath = "$env:APPDATA\npm\node_modules\vercel\dist\index.js"

Write-Host "Adding DATABASE_URL..." -ForegroundColor Yellow
$DatabaseUrl | node $vercelPath env add DATABASE_URL production --token=$VercelToken 2>&1

Write-Host "Adding DIRECT_URL (same value)..." -ForegroundColor Yellow
$DatabaseUrl | node $vercelPath env add DIRECT_URL production --token=$VercelToken 2>&1

Write-Host "✅ Database URLs added to Vercel" -ForegroundColor Green
Write-Host ""

# Step 2: Set local environment variable
Write-Host "📝 Step 2: Setting local environment variable..." -ForegroundColor Cyan
$env:DATABASE_URL = $DatabaseUrl

Write-Host "✅ Local DATABASE_URL set" -ForegroundColor Green
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "📝 Step 3: Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Step 4: Check if migrations exist
Write-Host "📝 Step 4: Checking database migrations..." -ForegroundColor Cyan

$migrationsDir = "prisma\migrations"
if (-not (Test-Path $migrationsDir) -or (Get-ChildItem $migrationsDir -Directory).Count -eq 0) {
    Write-Host "Creating initial migration..." -ForegroundColor Yellow
    npx prisma migrate dev --name init

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create migration" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Migrations already exist, deploying..." -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Deploy migrations to production
Write-Host "📝 Step 5: Deploying migrations to production database..." -ForegroundColor Cyan
npx prisma migrate deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy migrations" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database migrations deployed" -ForegroundColor Green
Write-Host ""

# Step 6: Seed admin user (if needed)
Write-Host "📝 Step 6: Verifying admin user..." -ForegroundColor Cyan

# Create a simple verification script
$verifyScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@glec.io' }
    });

    if (!adminUser) {
      console.log('Creating admin user...');
      await prisma.user.create({
        data: {
          email: 'admin@glec.io',
          passwordHash: '\$2b\$10\$t8TJYW0ON/wyQ0/B1ZwnBubzKd2saGEjYYgVZs37wcFuxzaDDiQ0O',
          role: 'ADMIN',
          name: 'GLEC Admin'
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

verifyAdmin();
"@

Set-Content -Path "verify-admin.js" -Value $verifyScript
node verify-admin.js
Remove-Item "verify-admin.js"

Write-Host ""

# Step 7: Deploy to Vercel
Write-Host "📝 Step 7: Deploying to Vercel production..." -ForegroundColor Cyan
node $vercelPath --prod --token=$VercelToken

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy to Vercel" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployed to Vercel" -ForegroundColor Green
Write-Host ""

# Success summary
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Production URLs:" -ForegroundColor Cyan
Write-Host "  Website: https://glec-website.vercel.app" -ForegroundColor White
Write-Host "  Admin:   https://glec-website.vercel.app/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "Admin Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    admin@glec.io" -ForegroundColor White
Write-Host "  Password: GLEC2025Admin!" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open https://glec-website.vercel.app" -ForegroundColor White
Write-Host "  2. Verify homepage loads correctly" -ForegroundColor White
Write-Host "  3. Login to admin at /admin/login" -ForegroundColor White
Write-Host "  4. Create a test notice" -ForegroundColor White
Write-Host "  5. Verify it appears on /news instantly" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  If you see any issues, check FINAL-DEPLOYMENT-STEPS.md" -ForegroundColor Yellow
Write-Host "    for troubleshooting guide" -ForegroundColor Yellow
Write-Host ""
