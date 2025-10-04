# GLEC Website - Production Environment Setup Script (PowerShell)
# This script generates all required environment variables for production deployment

Write-Host "🚀 GLEC Website - Production Environment Setup" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# Function to generate random string
function Generate-Random {
    param([int]$length = 32)
    $bytes = New-Object byte[] $length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes).Substring(0, $length) -replace '[^a-zA-Z0-9]', 'x'
}

# Function to generate bcrypt hash
function Generate-Bcrypt {
    param([string]$password)
    $result = node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('$password', 10));"
    return $result
}

Write-Host "📝 Step 1: Generating JWT Secrets..." -ForegroundColor Cyan
$JWT_SECRET = Generate-Random -length 32
$NEXTAUTH_SECRET = Generate-Random -length 32
Write-Host "✅ JWT secrets generated" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 2: Admin Account Setup" -ForegroundColor Cyan
$ADMIN_EMAIL = Read-Host "Admin Email [admin@glec.io]"
if ([string]::IsNullOrWhiteSpace($ADMIN_EMAIL)) {
    $ADMIN_EMAIL = "admin@glec.io"
}

$ADMIN_PASSWORD = Read-Host "Admin Password" -AsSecureString
$ADMIN_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ADMIN_PASSWORD)
)

if ([string]::IsNullOrWhiteSpace($ADMIN_PASSWORD_PLAIN)) {
    Write-Host "❌ Admin password is required" -ForegroundColor Red
    exit 1
}

Write-Host "Generating password hash..." -ForegroundColor Yellow
$ADMIN_PASSWORD_HASH = Generate-Bcrypt -password $ADMIN_PASSWORD_PLAIN
Write-Host "✅ Admin account configured" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 3: Database Configuration" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need to create a Neon PostgreSQL database" -ForegroundColor Yellow
Write-Host "1. Visit: https://console.neon.tech"
Write-Host "2. Create a new project: 'glec-production'"
Write-Host "3. Create database: 'glec_db'"
Write-Host "4. Copy the Connection String"
Write-Host ""
$DATABASE_URL = Read-Host "DATABASE_URL (postgresql://...)"

if ([string]::IsNullOrWhiteSpace($DATABASE_URL)) {
    Write-Host "❌ DATABASE_URL is required" -ForegroundColor Red
    exit 1
}

$DIRECT_URL = $DATABASE_URL
Write-Host "✅ Database configured" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 4: Email Service (Resend)" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need a Resend API key" -ForegroundColor Yellow
Write-Host "1. Visit: https://resend.com/api-keys"
Write-Host "2. Create a new API key"
Write-Host "3. Copy the key (starts with 're_')"
Write-Host ""
$RESEND_API_KEY = Read-Host "RESEND_API_KEY [skip for now]"
$RESEND_FROM_EMAIL = Read-Host "RESEND_FROM_EMAIL [noreply@glec.io]"
if ([string]::IsNullOrWhiteSpace($RESEND_FROM_EMAIL)) {
    $RESEND_FROM_EMAIL = "noreply@glec.io"
}

if ([string]::IsNullOrWhiteSpace($RESEND_API_KEY)) {
    Write-Host "⚠️  Skipping Resend (email features will not work)" -ForegroundColor Yellow
    $RESEND_API_KEY = "skip"
}
Write-Host ""

Write-Host "📝 Step 5: File Storage (Cloudflare R2)" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need Cloudflare R2 credentials (optional)" -ForegroundColor Yellow
Write-Host "1. Visit: https://dash.cloudflare.com/r2"
Write-Host "2. Create bucket: 'glec-assets'"
Write-Host "3. Create API Token"
Write-Host ""
$R2_ACCOUNT_ID = Read-Host "R2_ACCOUNT_ID [skip for now]"
$R2_ACCESS_KEY_ID = Read-Host "R2_ACCESS_KEY_ID [skip for now]"
$R2_SECRET_ACCESS_KEY = Read-Host "R2_SECRET_ACCESS_KEY [skip for now]"
$R2_BUCKET_NAME = Read-Host "R2_BUCKET_NAME [glec-assets]"
if ([string]::IsNullOrWhiteSpace($R2_BUCKET_NAME)) {
    $R2_BUCKET_NAME = "glec-assets"
}
$R2_PUBLIC_URL = Read-Host "R2_PUBLIC_URL [https://pub-xxx.r2.dev]"

if ([string]::IsNullOrWhiteSpace($R2_ACCOUNT_ID)) {
    Write-Host "⚠️  Skipping R2 (file upload will not work)" -ForegroundColor Yellow
    $R2_ACCOUNT_ID = "skip"
    $R2_ACCESS_KEY_ID = "skip"
    $R2_SECRET_ACCESS_KEY = "skip"
    $R2_PUBLIC_URL = "https://placeholder.r2.dev"
}
Write-Host ""

Write-Host "📝 Step 6: Generating .env.production file..." -ForegroundColor Cyan

$envContent = @"
# GLEC Website - Production Environment Variables
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# DO NOT commit this file to version control

# Database (Neon PostgreSQL)
DATABASE_URL="$DATABASE_URL"
DIRECT_URL="$DIRECT_URL"

# Authentication
JWT_SECRET="$JWT_SECRET"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://glec-website.vercel.app"

# Email (Resend)
RESEND_API_KEY="$RESEND_API_KEY"
RESEND_FROM_EMAIL="$RESEND_FROM_EMAIL"

# Cloudflare R2 (File Storage)
R2_ACCOUNT_ID="$R2_ACCOUNT_ID"
R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
R2_BUCKET_NAME="$R2_BUCKET_NAME"
R2_PUBLIC_URL="$R2_PUBLIC_URL"

# Admin
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD_HASH="$ADMIN_PASSWORD_HASH"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_DEMO_MODE="false"
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "✅ .env.production file created" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Production environment setup complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Review .env.production file:"
Write-Host "   Get-Content .env.production"
Write-Host ""
Write-Host "2. Add environment variables to Vercel Dashboard:"
Write-Host "   https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables"
Write-Host ""
Write-Host "3. Run database migrations:"
Write-Host "   npx prisma migrate deploy"
Write-Host ""
Write-Host "4. Deploy to production:"
Write-Host "   vercel --prod"
Write-Host ""
Write-Host "📄 Deployment Plan: See DEPLOYMENT-PLAN.md for full checklist" -ForegroundColor Yellow
Write-Host ""
