#!/bin/bash

# GLEC Website - Production Environment Variables Setup
# This script sets production environment variables in Vercel

VERCEL_TOKEN="4WjWFbv1BRjxABWdkzCI6jF0"
PROJECT_NAME="glec-website"

echo "🔐 Setting Production Environment Variables for GLEC Website"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. RESEND_WEBHOOK_SECRET
echo ""
echo "1️⃣ Setting RESEND_WEBHOOK_SECRET..."
RESEND_WEBHOOK_SECRET="Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc="
npx vercel@latest env add RESEND_WEBHOOK_SECRET production <<EOF
$RESEND_WEBHOOK_SECRET
EOF

# 2. CRON_SECRET
echo ""
echo "2️⃣ Setting CRON_SECRET..."
CRON_SECRET="OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA="
npx vercel@latest env add CRON_SECRET production <<EOF
$CRON_SECRET
EOF

# 3. ADMIN_NOTIFICATION_EMAIL
echo ""
echo "3️⃣ Setting ADMIN_NOTIFICATION_EMAIL..."
ADMIN_NOTIFICATION_EMAIL="oillex.co.kr@gmail.com"
npx vercel@latest env add ADMIN_NOTIFICATION_EMAIL production <<EOF
$ADMIN_NOTIFICATION_EMAIL
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Production environment variables set successfully!"
echo ""
echo "⚠️  IMPORTANT: Save these secrets securely!"
echo ""
echo "RESEND_WEBHOOK_SECRET=$RESEND_WEBHOOK_SECRET"
echo "CRON_SECRET=$CRON_SECRET"
echo "ADMIN_NOTIFICATION_EMAIL=$ADMIN_NOTIFICATION_EMAIL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo "1. Redeploy the application: npx vercel@latest --prod"
echo "2. Configure Resend webhook with RESEND_WEBHOOK_SECRET"
echo "3. Verify cron jobs in Vercel Dashboard"
