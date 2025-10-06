# Open Vercel Environment Variables Settings Page
# This script opens the Vercel Dashboard directly to the environment variables page

$PROJECT_ID = "prj_KpvFGT6jYZmn1NkaGQYrXulyvoUc"
$ORG_ID = "team_FyXieuFmjuvvBKq0uolrVZhg"
$PROJECT_NAME = "glec-website"

Write-Host "🚀 Opening Vercel Environment Variables Settings..." -ForegroundColor Cyan
Write-Host ""

$url = "https://vercel.com/$ORG_ID/$PROJECT_NAME/settings/environment-variables"

Write-Host "📍 URL: $url" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Environment Variables to Add:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. DATABASE_URL" -ForegroundColor White
Write-Host "   postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" -ForegroundColor Gray
Write-Host "   Environments: ✅ Production ✅ Preview ✅ Development" -ForegroundColor Gray
Write-Host ""
Write-Host "2. DIRECT_URL" -ForegroundColor White
Write-Host "   postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" -ForegroundColor Gray
Write-Host "   Environments: ✅ Production ✅ Preview ✅ Development" -ForegroundColor Gray
Write-Host ""
Write-Host "3. JWT_SECRET" -ForegroundColor White
Write-Host "   qzs1M2W/J+FALLBWRWITPkNstWi9W1rr5nvlo2Uax2w=" -ForegroundColor Gray
Write-Host "   Environments: ✅ Production ✅ Preview" -ForegroundColor Gray
Write-Host ""
Write-Host "4. NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "   t6SzA1D1Sn8r3ACMKR7jgFX73JjxsfdQXpeTNVPBWPE=" -ForegroundColor Gray
Write-Host "   Environments: ✅ Production ✅ Preview" -ForegroundColor Gray
Write-Host ""
Write-Host "5. NEXTAUTH_URL" -ForegroundColor White
Write-Host "   https://glec-website.vercel.app" -ForegroundColor Gray
Write-Host "   Environments: ✅ Production" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Opening browser in 3 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Start-Process $url

Write-Host ""
Write-Host "✅ Browser opened! Please add the environment variables manually." -ForegroundColor Green
Write-Host ""
Write-Host "After adding all variables:" -ForegroundColor Yellow
Write-Host "1. Go to Deployments tab" -ForegroundColor White
Write-Host "2. Click '...' on the latest deployment" -ForegroundColor White
Write-Host "3. Click 'Redeploy'" -ForegroundColor White
Write-Host "4. Wait 5 minutes" -ForegroundColor White
Write-Host "5. Test admin login: https://glec-website.vercel.app/admin/login" -ForegroundColor White
