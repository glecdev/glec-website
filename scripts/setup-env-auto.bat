@echo off
echo ============================================
echo GLEC Vercel Environment Variables Setup
echo ============================================
echo.

cd /d D:\GLEC-Website\glec-website

echo Setting DATABASE_URL...
echo postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require | npx vercel env add DATABASE_URL production preview development

echo.
echo Setting DIRECT_URL...
echo postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require | npx vercel env add DIRECT_URL production preview development

echo.
echo Setting JWT_SECRET...
echo qzs1M2W/J+FALLBWRWITPkNstWi9W1rr5nvlo2Uax2w= | npx vercel env add JWT_SECRET production preview

echo.
echo Setting NEXTAUTH_SECRET...
echo t6SzA1D1Sn8r3ACMKR7jgFX73JjxsfdQXpeTNVPBWPE= | npx vercel env add NEXTAUTH_SECRET production preview

echo.
echo Setting NEXTAUTH_URL...
echo https://glec-website.vercel.app | npx vercel env add NEXTAUTH_URL production

echo.
echo ============================================
echo All environment variables set!
echo ============================================
echo.
echo Next: Trigger deployment with a new commit
pause
