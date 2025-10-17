# Vercel 환경 변수 수동 설정 가이드

## 🎯 목적
Vercel CLI의 개행 문자 버그로 인해 환경 변수를 웹 대시보드에서 직접 설정합니다.

---

## 📋 설정할 환경 변수

| 변수명 | 값 |
|--------|-----|
| `RESEND_WEBHOOK_SECRET` | `Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=` |
| `CRON_SECRET` | `OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=` |
| `ADMIN_NOTIFICATION_EMAIL` | `oillex.co.kr@gmail.com` |

---

## 🚀 설정 단계 (5-10분)

### Step 1: Vercel 대시보드 접속

1. 웹 브라우저에서 https://vercel.com/glecdevs-projects/glec-website 접속
2. GitHub 또는 이메일로 로그인

### Step 2: Environment Variables 페이지 이동

1. 상단 탭에서 **"Settings"** 클릭
2. 왼쪽 메뉴에서 **"Environment Variables"** 클릭

또는 직접 접속: https://vercel.com/glecdevs-projects/glec-website/settings/environment-variables

### Step 3: 기존 변수 삭제 (있는 경우만)

다음 3개 변수가 목록에 있다면 **모두 삭제**하세요:
- `RESEND_WEBHOOK_SECRET`
- `CRON_SECRET`
- `ADMIN_NOTIFICATION_EMAIL`

**삭제 방법**:
1. 변수 오른쪽의 **"..."** (More) 버튼 클릭
2. **"Delete"** 선택
3. 확인 다이얼로그에서 **"Delete"** 클릭

### Step 4: 새 변수 추가

#### 4-1. RESEND_WEBHOOK_SECRET 추가

1. 페이지 우측 상단의 **"Add New"** 버튼 클릭
2. **Name** 입력란에 `RESEND_WEBHOOK_SECRET` 입력
3. **Value** 입력란에 다음 값 입력:
   ```
   Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=
   ```
   **⚠️ 주의**: 값을 복사-붙여넣기할 때 **앞뒤 공백이나 개행이 없는지** 확인하세요
4. **Environment** 섹션에서 **"Production"** 체크박스만 선택
5. **"Save"** 버튼 클릭

#### 4-2. CRON_SECRET 추가

1. 다시 **"Add New"** 버튼 클릭
2. **Name**: `CRON_SECRET`
3. **Value**:
   ```
   OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=
   ```
4. **Environment**: **"Production"** 체크
5. **"Save"** 클릭

#### 4-3. ADMIN_NOTIFICATION_EMAIL 추가

1. 마지막으로 **"Add New"** 버튼 클릭
2. **Name**: `ADMIN_NOTIFICATION_EMAIL`
3. **Value**:
   ```
   oillex.co.kr@gmail.com
   ```
4. **Environment**: **"Production"** 체크
5. **"Save"** 클릭

### Step 5: 재배포 트리거

환경 변수를 추가/수정하면 자동으로 재배포가 시작될 수 있습니다.

**만약 자동 재배포가 시작되지 않으면**:

1. 프로젝트 페이지로 이동: https://vercel.com/glecdevs-projects/glec-website
2. **"Deployments"** 탭 클릭
3. 최상단 deployment (가장 최근)의 **"..."** 버튼 클릭
4. **"Redeploy"** 선택
5. 확인 다이얼로그에서 **"Redeploy"** 클릭

---

## ✅ 검증 방법

재배포가 완료되면 (약 2-3분 소요) 다음 명령어로 Cron 엔드포인트를 테스트하세요:

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
  }
}
```

**만약 여전히 `{"error": "Unauthorized"}`가 나온다면**:
- 값 복사 시 공백/개행이 포함되었을 가능성
- 브라우저에서 변수 값을 다시 확인하고, 필요 시 삭제 후 재입력

---

## 🎯 체크리스트

설정을 완료한 후 다음 항목을 확인하세요:

- [ ] `RESEND_WEBHOOK_SECRET` 추가됨 (Production)
- [ ] `CRON_SECRET` 추가됨 (Production)
- [ ] `ADMIN_NOTIFICATION_EMAIL` 추가됨 (Production)
- [ ] 재배포 완료됨 (Deployments 탭에서 "Ready" 상태 확인)
- [ ] Cron 엔드포인트 테스트 성공 (`{"success": true}` 응답)

---

## 🚨 주의사항

### 값 입력 시

- ✅ **복사-붙여넣기 권장**: 값을 직접 타이핑하지 말고 복사-붙여넣기 하세요
- ✅ **개행 확인**: 값 끝에 Enter를 누르지 마세요
- ✅ **공백 확인**: 앞뒤 공백이 없는지 확인하세요
- ❌ **절대 공유 금지**: 이 값들은 프로덕션 시크릿이므로 외부에 공유하지 마세요

### 환경 선택 시

- ✅ **Production만 선택**: Preview/Development 환경은 체크하지 마세요
- ⚠️ **기존 값 덮어쓰기**: 같은 이름의 변수가 있으면 삭제 후 다시 추가하세요

---

## 📞 문제 해결

### 문제 1: "Add New" 버튼이 안 보임

**해결**: 페이지를 새로고침하거나, 다른 브라우저로 시도하세요

### 문제 2: 값을 입력했는데 저장이 안 됨

**해결**:
1. Environment (Production) 체크박스가 선택되었는지 확인
2. 브라우저 콘솔 (F12)에서 에러 메시지 확인
3. 페이지 새로고침 후 다시 시도

### 문제 3: 재배포 후에도 `401 Unauthorized` 발생

**해결**:
1. Vercel 대시보드에서 환경 변수 값 확인 (마스킹되어 보이지만 Edit으로 확인 가능)
2. 값 끝에 공백이나 개행이 있는지 확인
3. 변수 삭제 후 다시 추가 (이번엔 값을 메모장에 먼저 붙여넣기하여 확인 후 복사)

---

## 💡 팁

- 환경 변수는 **암호화되어 저장**되므로, 설정 후에는 실제 값을 볼 수 없습니다
- 값이 올바르게 입력되었는지 확실하지 않다면, **삭제 후 재입력**하는 것이 가장 확실합니다
- 재배포는 약 **2-3분** 소요됩니다 (Deployments 탭에서 진행 상황 확인 가능)

---

**설정 완료 후 알려주세요!** 그러면 Cron 엔드포인트 테스트를 진행하겠습니다.
