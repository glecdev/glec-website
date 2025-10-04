#!/bin/bash

# GLEC Website - GitHub 저장소 생성 및 Cloudflare Pages 연결 스크립트
# 작성일: 2025-10-04

set -e

echo "🚀 GLEC Website - GitHub & Cloudflare Pages 연동 시작"
echo "=================================================="
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: GitHub Personal Access Token 확인
echo -e "${BLUE}Step 1: GitHub Personal Access Token 확인${NC}"
echo "GitHub에서 Personal Access Token을 생성해주세요:"
echo "1. https://github.com/settings/tokens 접속"
echo "2. 'Generate new token (classic)' 클릭"
echo "3. Scopes 선택: repo (전체), workflow"
echo "4. Token 생성 및 복사"
echo ""
read -p "GitHub Personal Access Token을 입력하세요: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Token이 입력되지 않았습니다.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Token 입력 완료${NC}"
echo ""

# Step 2: GitHub 저장소 생성
echo -e "${BLUE}Step 2: GitHub 저장소 생성${NC}"

REPO_OWNER="glecdev"
REPO_NAME="website"

echo "저장소 생성 중: ${REPO_OWNER}/${REPO_NAME}..."

RESPONSE=$(curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/orgs/${REPO_OWNER}/repos \
  -d "{
    \"name\": \"${REPO_NAME}\",
    \"description\": \"GLEC - ISO-14083 국제표준 물류 탄소배출 측정 솔루션\",
    \"private\": false,
    \"auto_init\": false
  }")

if echo "$RESPONSE" | grep -q '"full_name"'; then
    echo -e "${GREEN}✓ 저장소 생성 성공: https://github.com/${REPO_OWNER}/${REPO_NAME}${NC}"
else
    if echo "$RESPONSE" | grep -q '"message": "Repository creation failed."' || echo "$RESPONSE" | grep -q '"already exists"'; then
        echo -e "${YELLOW}⚠ 저장소가 이미 존재합니다. 계속 진행합니다.${NC}"
    else
        echo -e "${RED}❌ 저장소 생성 실패:${NC}"
        echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
        exit 1
    fi
fi

echo ""

# Step 3: Git 원격 저장소 설정 확인
echo -e "${BLUE}Step 3: Git 원격 저장소 설정${NC}"

cd "$(dirname "$0")/.."

if git remote get-url origin &>/dev/null; then
    CURRENT_ORIGIN=$(git remote get-url origin)
    echo "현재 origin: $CURRENT_ORIGIN"

    if [ "$CURRENT_ORIGIN" != "https://github.com/${REPO_OWNER}/${REPO_NAME}.git" ]; then
        echo "origin 업데이트 중..."
        git remote set-url origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
        echo -e "${GREEN}✓ origin 업데이트 완료${NC}"
    else
        echo -e "${GREEN}✓ origin이 이미 올바르게 설정되어 있습니다${NC}"
    fi
else
    echo "origin 추가 중..."
    git remote add origin "https://github.com/${REPO_OWNER}/${REPO_NAME}.git"
    echo -e "${GREEN}✓ origin 추가 완료${NC}"
fi

echo ""

# Step 4: Git Push
echo -e "${BLUE}Step 4: GitHub에 코드 Push${NC}"

# Git 인증 설정 (Token 사용)
git config --global credential.helper store
echo "https://${GITHUB_TOKEN}@github.com" > ~/.git-credentials

echo "Git Push 중..."
if git push -u origin main --verbose 2>&1 | tee /tmp/git-push.log; then
    echo -e "${GREEN}✓ Git Push 성공!${NC}"
else
    echo -e "${RED}❌ Git Push 실패${NC}"
    echo "에러 로그:"
    cat /tmp/git-push.log
    exit 1
fi

echo ""

# Step 5: Cloudflare Pages 연동 안내
echo -e "${BLUE}Step 5: Cloudflare Pages 연동 (수동)${NC}"
echo ""
echo "다음 단계를 진행해주세요:"
echo ""
echo "1. Cloudflare Dashboard 접속:"
echo -e "   ${GREEN}https://dash.cloudflare.com/${NC}"
echo ""
echo "2. Workers & Pages → glec-website 선택"
echo ""
echo "3. Settings → Builds & deployments 클릭"
echo ""
echo "4. 'Connect to Git' 버튼 클릭"
echo ""
echo "5. GitHub 선택 → ${REPO_OWNER}/${REPO_NAME} 저장소 선택"
echo ""
echo "6. 빌드 설정:"
echo "   - Framework preset: Next.js"
echo "   - Build command: npm run build"
echo "   - Build output directory: .next"
echo "   - Root directory: glec-website"
echo "   - Node.js version: 18"
echo ""
echo "7. 환경 변수 추가 (10개 필수):"
echo "   - DATABASE_URL"
echo "   - JWT_SECRET"
echo "   - RESEND_API_KEY"
echo "   - RESEND_FROM_EMAIL"
echo "   - R2_ACCOUNT_ID"
echo "   - R2_ACCESS_KEY_ID"
echo "   - R2_SECRET_ACCESS_KEY"
echo "   - R2_BUCKET_NAME"
echo "   - ADMIN_EMAIL"
echo "   - ADMIN_PASSWORD_HASH"
echo ""
echo "8. 'Save and Deploy' 클릭"
echo ""
echo -e "${GREEN}✓ GitHub 저장소 생성 및 Push 완료!${NC}"
echo ""
echo "상세 가이드: docs/GITHUB-INTEGRATION-CHECKLIST.md"
echo "GitHub 저장소: https://github.com/${REPO_OWNER}/${REPO_NAME}"
echo ""
echo "=================================================="
echo "🎉 연동 준비 완료!"
