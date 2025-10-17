# GLEC Website - Production Environment Variables Setup (PowerShell)
# This script sets production environment variables in Vercel

$VERCEL_TOKEN = "4WjWFbv1BRjxABWdkzCI6jF0"
$PROJECT_NAME = "glec-website"

Write-Host "🔐 Setting Production Environment Variables for GLEC Website" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Generated secrets
$RESEND_WEBHOOK_SECRET = "Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc="
$CRON_SECRET = "OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA="
$ADMIN_NOTIFICATION_EMAIL = "oillex.co.kr@gmail.com"

# 1. RESEND_WEBHOOK_SECRET
Write-Host ""
Write-Host "1️⃣ Setting RESEND_WEBHOOK_SECRET..." -ForegroundColor Yellow
$RESEND_WEBHOOK_SECRET | npx vercel@latest env add RESEND_WEBHOOK_SECRET production --token=$VERCEL_TOKEN

# 2. CRON_SECRET
Write-Host ""
Write-Host "2️⃣ Setting CRON_SECRET..." -ForegroundColor Yellow
$CRON_SECRET | npx vercel@latest env add CRON_SECRET production --token=$VERCEL_TOKEN

# 3. ADMIN_NOTIFICATION_EMAIL
Write-Host ""
Write-Host "3️⃣ Setting ADMIN_NOTIFICATION_EMAIL..." -ForegroundColor Yellow
$ADMIN_NOTIFICATION_EMAIL | npx vercel@latest env add ADMIN_NOTIFICATION_EMAIL production --token=$VERCEL_TOKEN

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Production environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Save these secrets securely!" -ForegroundColor Red
Write-Host ""
Write-Host "RESEND_WEBHOOK_SECRET=$RESEND_WEBHOOK_SECRET" -ForegroundColor Cyan
Write-Host "CRON_SECRET=$CRON_SECRET" -ForegroundColor Cyan
Write-Host "ADMIN_NOTIFICATION_EMAIL=$ADMIN_NOTIFICATION_EMAIL" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Redeploy the application: npx vercel@latest --prod --token=$VERCEL_TOKEN"
Write-Host "2. Configure Resend webhook with RESEND_WEBHOOK_SECRET"
Write-Host "3. Verify cron jobs in Vercel Dashboard"
