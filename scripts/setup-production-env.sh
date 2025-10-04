#!/bin/bash

# GLEC Website - Production Environment Setup Script
# This script generates all required environment variables for production deployment

set -e

echo "🚀 GLEC Website - Production Environment Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to generate random string
generate_random() {
  length=${1:-32}
  openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to generate bcrypt hash
generate_bcrypt() {
  password=$1
  node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('$password', 10));"
}

echo "📝 Step 1: Generating JWT Secrets..."
JWT_SECRET=$(generate_random 32)
NEXTAUTH_SECRET=$(generate_random 32)
echo -e "${GREEN}✅ JWT secrets generated${NC}"
echo ""

echo "📝 Step 2: Admin Account Setup"
read -p "Admin Email [admin@glec.io]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@glec.io}

read -sp "Admin Password: " ADMIN_PASSWORD
echo ""

if [ -z "$ADMIN_PASSWORD" ]; then
  echo -e "${RED}❌ Admin password is required${NC}"
  exit 1
fi

echo "Generating password hash..."
ADMIN_PASSWORD_HASH=$(generate_bcrypt "$ADMIN_PASSWORD")
echo -e "${GREEN}✅ Admin account configured${NC}"
echo ""

echo "📝 Step 3: Database Configuration"
echo ""
echo -e "${YELLOW}You need to create a Neon PostgreSQL database${NC}"
echo "1. Visit: https://console.neon.tech"
echo "2. Create a new project: 'glec-production'"
echo "3. Create database: 'glec_db'"
echo "4. Copy the Connection String"
echo ""
read -p "DATABASE_URL (postgresql://...): " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL is required${NC}"
  exit 1
fi

# Use same URL for DIRECT_URL (Neon supports both)
DIRECT_URL=$DATABASE_URL
echo -e "${GREEN}✅ Database configured${NC}"
echo ""

echo "📝 Step 4: Email Service (Resend)"
echo ""
echo -e "${YELLOW}You need a Resend API key${NC}"
echo "1. Visit: https://resend.com/api-keys"
echo "2. Create a new API key"
echo "3. Copy the key (starts with 're_')"
echo ""
read -p "RESEND_API_KEY [skip for now]: " RESEND_API_KEY
read -p "RESEND_FROM_EMAIL [noreply@glec.io]: " RESEND_FROM_EMAIL
RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL:-noreply@glec.io}

if [ -z "$RESEND_API_KEY" ]; then
  echo -e "${YELLOW}⚠️  Skipping Resend (email features will not work)${NC}"
  RESEND_API_KEY="skip"
fi
echo ""

echo "📝 Step 5: File Storage (Cloudflare R2)"
echo ""
echo -e "${YELLOW}You need Cloudflare R2 credentials (optional)${NC}"
echo "1. Visit: https://dash.cloudflare.com/r2"
echo "2. Create bucket: 'glec-assets'"
echo "3. Create API Token"
echo ""
read -p "R2_ACCOUNT_ID [skip for now]: " R2_ACCOUNT_ID
read -p "R2_ACCESS_KEY_ID [skip for now]: " R2_ACCESS_KEY_ID
read -p "R2_SECRET_ACCESS_KEY [skip for now]: " R2_SECRET_ACCESS_KEY
read -p "R2_BUCKET_NAME [glec-assets]: " R2_BUCKET_NAME
R2_BUCKET_NAME=${R2_BUCKET_NAME:-glec-assets}
read -p "R2_PUBLIC_URL [https://pub-xxx.r2.dev]: " R2_PUBLIC_URL

if [ -z "$R2_ACCOUNT_ID" ]; then
  echo -e "${YELLOW}⚠️  Skipping R2 (file upload will not work)${NC}"
  R2_ACCOUNT_ID="skip"
  R2_ACCESS_KEY_ID="skip"
  R2_SECRET_ACCESS_KEY="skip"
  R2_PUBLIC_URL="https://placeholder.r2.dev"
fi
echo ""

echo "📝 Step 6: Generating .env.production file..."
cat > .env.production <<EOF
# GLEC Website - Production Environment Variables
# Generated: $(date)
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
EOF

echo -e "${GREEN}✅ .env.production file created${NC}"
echo ""

echo "📝 Step 7: Generating Vercel CLI command..."
cat > setup-vercel-env.sh <<'EOF2'
#!/bin/bash

# This script adds all environment variables to Vercel

VERCEL_TOKEN=${1:-$VERCEL_TOKEN}

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Usage: ./setup-vercel-env.sh <VERCEL_TOKEN>"
  echo "Or set VERCEL_TOKEN environment variable"
  exit 1
fi

# Read .env.production and add each variable to Vercel
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  if [[ $key =~ ^#.* ]] || [ -z "$key" ]; then
    continue
  fi

  # Remove quotes from value
  value=$(echo $value | sed 's/^"\|"$//g')

  echo "Adding $key to Vercel..."
  vercel env add "$key" production --token="$VERCEL_TOKEN" <<< "$value"
done < .env.production

echo "✅ All environment variables added to Vercel"
EOF2

chmod +x setup-vercel-env.sh

echo -e "${GREEN}✅ setup-vercel-env.sh script created${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Production environment setup complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Review .env.production file:"
echo "   cat .env.production"
echo ""
echo "2. Add environment variables to Vercel (Option A - Automated):"
echo "   ./setup-vercel-env.sh <YOUR_VERCEL_TOKEN>"
echo ""
echo "3. Or add manually to Vercel Dashboard (Option B - Manual):"
echo "   https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables"
echo ""
echo "4. Run database migrations:"
echo "   npx prisma migrate deploy"
echo ""
echo "5. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "📄 Deployment Plan: See DEPLOYMENT-PLAN.md for full checklist"
echo ""
