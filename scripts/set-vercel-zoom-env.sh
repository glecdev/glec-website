#!/bin/bash

# Zoom API 환경 변수를 Vercel Production에 설정

VERCEL_TOKEN="4WjWFbv1BRjxABWdkzCI6jF0"

echo "🚀 Setting Zoom API environment variables in Vercel Production..."

# ZOOM_ACCOUNT_ID
echo "QF9781h-SD2P-rXfL7B8rg" | npx vercel@latest env add ZOOM_ACCOUNT_ID production --token=$VERCEL_TOKEN

# ZOOM_CLIENT_ID
echo "bLwJbY41Snyev9yTXqNYXQ" | npx vercel@latest env add ZOOM_CLIENT_ID production --token=$VERCEL_TOKEN

# ZOOM_CLIENT_SECRET
echo "6nIWtmZf15OJwVEh16b84BqO4IajNIPd" | npx vercel@latest env add ZOOM_CLIENT_SECRET production --token=$VERCEL_TOKEN

# ZOOM_SECRET_TOKEN
echo "xCAfOtHbTJK2CjaNt_jICQ" | npx vercel@latest env add ZOOM_SECRET_TOKEN production --token=$VERCEL_TOKEN

echo "✅ Zoom API environment variables added to Vercel Production"
echo ""
echo "🔄 Triggering redeployment..."
npx vercel@latest --prod --token=$VERCEL_TOKEN

echo "✅ Deployment triggered!"
