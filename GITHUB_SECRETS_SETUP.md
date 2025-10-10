# GitHub Secrets 설정 가이드

## 필요한 Secrets

GitHub Actions가 Vercel에 배포하려면 다음 3개의 secrets이 필요합니다:

1. `VERCEL_TOKEN` - Vercel API 토큰
2. `VERCEL_ORG_ID` - Vercel 조직 ID
3. `VERCEL_PROJECT_ID` - Vercel 프로젝트 ID

---

## 🔑 1단계: GitHub Secrets 페이지 접속

1. GitHub 저장소로 이동: https://github.com/glecdev/glec-website
2. **Settings** 탭 클릭
3. 좌측 메뉴에서 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 버튼 클릭

---

## 📝 2단계: Secrets 추가

### Secret 1: VERCEL_TOKEN

**Name:**
```
VERCEL_TOKEN
```

**Secret:**
```
4WjWFbv1BRjxABWdkzCI6jF0
```

**설명**: Vercel API 인증 토큰 (vercel.txt에서 가져옴)

---

### Secret 2: VERCEL_ORG_ID

**Name:**
```
VERCEL_ORG_ID
```

**Secret:**
```
team_FyXieuFmjuvvBKq0uolrVZhg
```

**설명**: Vercel 조직 ID (.vercel/project.json의 orgId)

---

### Secret 3: VERCEL_PROJECT_ID

**Name:**
```
VERCEL_PROJECT_ID
```

**Secret:**
```
prj_KpvFGT6jYZmn1NkaGQYrXulyvoUc
```

**설명**: Vercel 프로젝트 ID (.vercel/project.json의 projectId)

---

## ✅ 3단계: 설정 확인

모든 secrets을 추가한 후:

1. GitHub Actions 페이지 확인: https://github.com/glecdev/glec-website/actions
2. 최신 workflow run 확인
3. "Deploy to Vercel" 작업이 성공했는지 확인

---

## 🚀 4단계: 배포 테스트

Secrets 설정 후:

```bash
git add .
git commit -m "test: Trigger GitHub Actions deploy"
git push origin main
```

약 2-3분 후 배포 완료:
- GitHub Actions: https://github.com/glecdev/glec-website/actions
- Vercel Deployments: https://vercel.com/glecdev/glec-website/deployments

---

## 🔍 트러블슈팅

### 오류: "No existing credentials found"

**원인**: `VERCEL_TOKEN`이 설정되지 않았거나 잘못됨

**해결**:
1. GitHub Secrets에서 `VERCEL_TOKEN` 확인
2. 값이 정확한지 확인: `4WjWFbv1BRjxABWdkzCI6jF0`
3. Secret 이름 확인: `VERCEL_TOKEN` (대소문자 정확히)

### 오류: "Project not found"

**원인**: `VERCEL_ORG_ID` 또는 `VERCEL_PROJECT_ID`가 잘못됨

**해결**:
1. `.vercel/project.json` 파일 확인
2. `orgId`와 `projectId` 값 복사
3. GitHub Secrets에 정확히 입력

### 오류: "Build failed"

**원인**: 프로젝트 빌드 오류

**해결**:
1. 로컬에서 빌드 테스트: `npm run build`
2. GitHub Actions 로그 확인
3. 빌드 오류 수정 후 다시 push

---

## 📚 참고 문서

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Vercel Git Integration](https://vercel.com/docs/deployments/git)

---

**마지막 업데이트**: 2025-10-10
**Vercel 토큰 위치**: `d:/GLEC-Website/vercel.txt`
**프로젝트 설정**: `d:/GLEC-Website/glec-website/.vercel/project.json`
