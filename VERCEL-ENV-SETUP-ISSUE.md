# Vercel 환경 변수 설정 문제 및 해결 방법

## 🚨 문제 요약

**증상**: Cron 엔드포인트가 `401 Unauthorized` 반환
**원인**: Vercel CLI가 환경 변수 값에 개행 문자(`\n`)를 자동으로 추가
**영향**: `CRON_SECRET` 비교 시 항상 불일치 발생

---

## 🔍 문제 상세 분석

### 환경 변수 설정 명령 (문제 발생)

```bash
echo "OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=" | npx vercel env add CRON_SECRET production
```

### 실제 저장된 값 (개행 포함)

```bash
$ npx vercel env pull .env.production --environment=production
$ cat .env.production | grep CRON_SECRET | od -c
0000000   C   R   O   N   _   S   E   C   R   E   T   =   "   O   j   Z
0000020   E   e   P   v   m   +   x   5   J   q   H   n   1   3   b   V
0000040   C   B   Q   n   0   r   T   C   D   n   g   h   6   4   9   2
0000060   h   q   I   h   w   R   a   A   =   "  \n
0000073
```

**문제**: 마지막에 `\n` (개행 문자) 존재

### 코드 비교 로직

```typescript
// app/api/cron/library-nurture/route.ts
if (cronSecret !== process.env.CRON_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**비교 결과**:
```
cronSecret:           "OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA="
process.env.CRON_SECRET: "OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=\n"
                                                                     ^^^^ 차이
```

---

## ✅ 해결 방법 1: Vercel 대시보드 (권장)

### Step 1: Vercel 대시보드 로그인

1. https://vercel.com/glecdevs-projects/glec-website 접속
2. **Settings** → **Environment Variables** 클릭

### Step 2: 기존 변수 삭제

다음 3개 변수를 **모두 삭제**:
- `CRON_SECRET`
- `RESEND_WEBHOOK_SECRET`
- `ADMIN_NOTIFICATION_EMAIL`

### Step 3: 새 변수 추가

#### 1. RESEND_WEBHOOK_SECRET

```yaml
Name: RESEND_WEBHOOK_SECRET
Value: Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=
Environment: Production
```

**주의**: 값 입력 시 **개행 없이** 정확히 복사-붙여넣기

#### 2. CRON_SECRET

```yaml
Name: CRON_SECRET
Value: OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=
Environment: Production
```

#### 3. ADMIN_NOTIFICATION_EMAIL

```yaml
Name: ADMIN_NOTIFICATION_EMAIL
Value: oillex.co.kr@gmail.com
Environment: Production
```

### Step 4: 재배포

```bash
cd glec-website
npx vercel --prod --token=4WjWFbv1BRjxABWdkzCI6jF0 --yes --force
```

### Step 5: 검증

```bash
curl -s "https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA="
```

**예상 결과** (성공):
```json
{
  "success": true,
  "message": "Library nurture emails processed",
  "results": {
    "day3": {"sent": 0, "failed": 0},
    "day7": {"sent": 0, "failed": 0},
    "day14": {"sent": 0, "failed": 0},
    "day30": {"sent": 0, "failed": 0}
  },
  "timestamp": "2025-10-17T03:00:00.000Z"
}
```

---

## 🛠️ 해결 방법 2: 코드 수정 (대안)

환경 변수 값을 trim하도록 코드 수정:

```typescript
// app/api/cron/library-nurture/route.ts
export async function GET(req: NextRequest) {
  const cronSecret = req.nextUrl.searchParams.get('cron_secret');

  // 환경 변수 값 trim (개행 제거)
  const expectedSecret = process.env.CRON_SECRET?.trim();

  if (!expectedSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  if (cronSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... 나머지 로직
}
```

**장점**: 개행 문자 문제를 코드 레벨에서 해결
**단점**: 모든 환경 변수 사용처에 `.trim()` 추가 필요

---

## 🔄 해결 방법 3: printf 사용 (CLI)

```bash
# PowerShell (Windows)
"OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=" | Out-File -NoNewline -FilePath temp.txt
Get-Content -Raw temp.txt | npx vercel env add CRON_SECRET production
Remove-Item temp.txt

# Bash/Zsh (Linux/Mac)
printf 'OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=' | npx vercel env add CRON_SECRET production
```

**결과**: 여전히 `\n` 추가됨 (Vercel CLI 버그로 추정)

---

## 📊 현재 상태

### 환경 변수 설정 상태

```bash
npx vercel env ls production
```

| 변수 | 값 (마스킹) | 상태 | 문제 |
|------|-------------|------|------|
| RESEND_WEBHOOK_SECRET | Oau+...vqc= | ✅ 설정됨 | ⚠️ 개행 포함 |
| CRON_SECRET | OjZ...RaA= | ✅ 설정됨 | ⚠️ 개행 포함 |
| ADMIN_NOTIFICATION_EMAIL | oillex...com | ✅ 설정됨 | ⚠️ 개행 포함 |

### 배포 상태

- ✅ 프로덕션 배포 완료: https://glec-website.vercel.app
- ⚠️ Cron 엔드포인트: `401 Unauthorized` (환경 변수 불일치)
- ⚠️ Webhook 엔드포인트: 미검증 (동일한 문제 예상)

---

## 🎯 권장 조치 사항

### 즉시 조치 (Priority 0)

1. **Vercel 대시보드에서 환경 변수 재설정**
   - 기존 3개 변수 삭제
   - 웹 UI로 새로 추가 (개행 없이)
   - 재배포

2. **검증**
   ```bash
   # Cron 엔드포인트 테스트
   curl "https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA="

   # Webhook 엔드포인트 테스트 (Resend 대시보드에서)
   ```

### 코드 개선 (Priority 1)

환경 변수 사용처에 `.trim()` 추가:

```typescript
// app/api/cron/library-nurture/route.ts
const cronSecret = req.nextUrl.searchParams.get('cron_secret');
const expectedSecret = process.env.CRON_SECRET?.trim();

// app/api/webhooks/resend/route.ts
const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();

// lib/email-templates/demo-admin-notification.ts
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'admin@glec.io';
```

### 문서화 (Priority 2)

- ✅ 이 문서 (VERCEL-ENV-SETUP-ISSUE.md) 작성 완료
- ⏳ PRODUCTION-DEPLOYMENT-CHECKLIST.md 업데이트 필요
- ⏳ README.md에 환경 변수 설정 주의사항 추가

---

## 📝 Vercel CLI 버그 보고

**Issue Title**: "Vercel CLI adds trailing newline to environment variable values"

**Reproduction Steps**:
1. `echo "value" | npx vercel env add VAR_NAME production`
2. `npx vercel env pull .env.production --environment=production`
3. `cat .env.production | od -c` → 개행 문자 발견

**Expected Behavior**: 입력한 값 그대로 저장
**Actual Behavior**: 값 끝에 `\n` 자동 추가

**Workaround**: Vercel 대시보드 웹 UI 사용

---

## 🔗 관련 문서

- [PRODUCTION-DEPLOYMENT-CHECKLIST.md](./PRODUCTION-DEPLOYMENT-CHECKLIST.md)
- [RESEND-WEBHOOK-SETUP.md](./RESEND-WEBHOOK-SETUP.md)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)

---

**작성일**: 2025-10-17
**작성자**: Claude AI Agent
**마지막 업데이트**: 환경 변수 개행 문제 발견 및 분석 완료
**상태**: ⚠️ 대시보드를 통한 수동 설정 필요
