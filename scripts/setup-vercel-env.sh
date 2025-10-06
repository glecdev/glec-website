#!/bin/bash

# Vercel Environment Variables Setup Script
# This script sets all required environment variables for the GLEC website

PROJECT_ID="prj_KpvFGT6jYZmn1NkaGQYrXulyvoUc"

echo "🚀 Setting up Vercel environment variables..."
echo ""

# Database URLs
echo "📦 Setting DATABASE_URL..."
npx vercel env add DATABASE_URL production preview development << EOF
postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
EOF

echo "📦 Setting DIRECT_URL..."
npx vercel env add DIRECT_URL production preview development << EOF
postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
EOF

# Authentication secrets
echo "🔐 Setting JWT_SECRET..."
npx vercel env add JWT_SECRET production preview << EOF
qzs1M2W/J+FALLBWRWITPkNstWi9W1rr5nvlo2Uax2w=
EOF

echo "🔐 Setting NEXTAUTH_SECRET..."
npx vercel env add NEXTAUTH_SECRET production preview << EOF
t6SzA1D1Sn8r3ACMKR7jgFX73JjxsfdQXpeTNVPBWPE=
EOF

# Production URL (will be updated with actual domain)
echo "🌐 Setting NEXTAUTH_URL..."
npx vercel env add NEXTAUTH_URL production << EOF
https://glec-website.vercel.app
EOF

# Email settings (placeholder)
echo "📧 Setting RESEND_API_KEY..."
npx vercel env add RESEND_API_KEY production preview development << EOF
re_placeholder_update_with_real_key
EOF

echo "📧 Setting RESEND_FROM_EMAIL..."
npx vercel env add RESEND_FROM_EMAIL production preview development << EOF
noreply@glec.io
EOF

echo ""
echo "✅ All environment variables set!"
echo "🔄 Triggering deployment..."
