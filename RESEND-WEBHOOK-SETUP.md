# Resend Webhook 설정 가이드

## 🎯 목적

GLEC Website의 이메일 추적 기능을 활성화하기 위해 Resend 웹훅을 설정합니다.

---

## ✅ 사전 준비 완료 항목

- ✅ Webhook 서명 검증 로직 구현 (`app/api/webhooks/resend/route.ts`)
- ✅ 프로덕션 환경 변수 설정 완료
  - `RESEND_WEBHOOK_SECRET`: `Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=`
  - `CRON_SECRET`: `OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=`
  - `ADMIN_NOTIFICATION_EMAIL`: `oillex.co.kr@gmail.com`
- ✅ 프로덕션 배포 완료
  - URL: https://glec-website.vercel.app
  - Webhook Endpoint: https://glec-website.vercel.app/api/webhooks/resend

---

## 📋 설정 단계

### Step 1: Resend 대시보드 로그인

1. https://resend.com/webhooks 접속
2. GLEC 계정으로 로그인

### Step 2: 새 웹훅 생성

1. **"Add Webhook"** 버튼 클릭

2. **Webhook 설정 입력**:

   ```yaml
   Name: GLEC Website Production Webhook
   Endpoint URL: https://glec-website.vercel.app/api/webhooks/resend
   Events:
     - email.sent
     - email.delivered
     - email.delivery_delayed
     - email.complained
     - email.bounced
     - email.opened
     - email.clicked
   ```

3. **"Create Webhook"** 클릭

### Step 3: Signing Secret 확인

1. 생성된 웹훅 클릭
2. **"Signing Secret"** 섹션 찾기
3. **중요**: Signing Secret이 아래 값과 일치하는지 확인

   ```
   Expected: Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=
   ```

4. **불일치 시**:
   - Vercel 환경 변수 업데이트 필요
   - 명령어:
     ```bash
     cd glec-website
     npx vercel env rm RESEND_WEBHOOK_SECRET production --yes
     echo "Oau+aChv++aRbJ2Nyf+ks81PwGJ8bl2UGi91WVC1vqc=" | npx vercel env add RESEND_WEBHOOK_SECRET production
     npx vercel --prod
     ```

### Step 4: 웹훅 테스트

1. Resend 대시보드에서 **"Send Test Event"** 클릭
2. 이벤트 타입 선택: `email.sent`
3. **"Send Test"** 클릭

4. **결과 확인**:
   - ✅ Status: `200 OK` → 성공
   - ❌ Status: `401 Unauthorized` → Signing Secret 불일치
   - ❌ Status: `500 Internal Server Error` → 서버 에러 (Vercel 로그 확인)

### Step 5: Vercel 로그 확인

```bash
cd glec-website
npx vercel logs https://glec-website.vercel.app --follow
```

**예상 로그 (성공 시)**:
```
[Resend Webhook] Received event: email.sent
[Resend Webhook] Email sent: lead@example.com
[Resend Webhook] Lead updated successfully
```

**예상 로그 (서명 검증 실패 시)**:
```
[Resend Webhook] Invalid signature format
```

---

## 🔍 검증 체크리스트

### Phase 1: Webhook 기본 기능

- [ ] Resend 대시보드에서 웹훅 생성 완료
- [ ] Signing Secret이 환경 변수와 일치
- [ ] Test Event 전송 시 `200 OK` 응답
- [ ] Vercel 로그에 `[Resend Webhook] Received event` 출력

### Phase 2: 이메일 이벤트 추적

**테스트 시나리오**: 자료실 다운로드

1. https://glec-website.vercel.app/library 접속
2. 아무 자료 다운로드 폼 작성
3. 이메일 수신 확인
4. 이메일 열기 (`email.opened` 이벤트 발생)
5. 다운로드 링크 클릭 (`email.clicked` 이벤트 발생)

**검증 방법**:

```sql
-- Neon 데이터베이스에서 확인
SELECT
  email,
  email_sent,
  email_delivered,
  email_opened,
  download_link_clicked,
  lead_score
FROM library_leads
WHERE email = '테스트_이메일@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

**예상 결과**:
```yaml
email_sent: true
email_delivered: true
email_opened: true (이메일 열었다면)
download_link_clicked: true (링크 클릭했다면)
lead_score: 70-90 (engagement에 따라)
```

### Phase 3: 스팸 신고 처리

**테스트 시나리오** (주의: 실제 스팸 신고는 하지 말 것):

1. Resend 대시보드에서 Test Event 전송
2. Event Type: `email.complained`
3. Payload 예시:
   ```json
   {
     "type": "email.complained",
     "data": {
       "email_id": "test-123",
       "to": ["spam-test@example.com"]
     }
   }
   ```

**검증 방법**:

```sql
SELECT * FROM email_blacklist
WHERE email = 'spam-test@example.com';
```

**예상 결과**:
```yaml
email: spam-test@example.com
reason: spam_complaint
blacklisted_at: [현재 시간]
```

---

## 🚨 트러블슈팅

### 문제 1: `401 Unauthorized`

**원인**: Signing Secret 불일치

**해결 방법**:

1. Resend 대시보드에서 Signing Secret 복사
2. Vercel 환경 변수 업데이트:
   ```bash
   cd glec-website
   npx vercel env rm RESEND_WEBHOOK_SECRET production --yes
   echo "[복사한_Secret]" | npx vercel env add RESEND_WEBHOOK_SECRET production
   npx vercel --prod
   ```

### 문제 2: `500 Internal Server Error`

**원인**: 데이터베이스 연결 오류 또는 코드 에러

**해결 방법**:

1. Vercel 로그 확인:
   ```bash
   npx vercel logs https://glec-website.vercel.app --follow
   ```

2. 데이터베이스 연결 확인:
   ```bash
   # 환경 변수 DATABASE_URL 확인
   npx vercel env ls production | grep DATABASE_URL
   ```

3. 로컬 테스트:
   ```bash
   cd glec-website
   npm run dev

   # 다른 터미널에서
   curl -X POST http://localhost:3000/api/webhooks/resend \
     -H "Content-Type: application/json" \
     -H "svix-id: test-123" \
     -H "svix-timestamp: $(date +%s)" \
     -H "svix-signature: v1=test" \
     -d '{"type":"email.sent","data":{"email_id":"test","to":["test@example.com"]}}'
   ```

### 문제 3: 이메일 이벤트가 데이터베이스에 반영 안 됨

**원인**: `resend_email_id` 매칭 실패

**디버깅**:

1. Vercel 로그에서 `resend_email_id` 확인:
   ```
   [Resend Webhook] Processing email event: abc123def456
   ```

2. 데이터베이스에서 해당 ID 검색:
   ```sql
   SELECT * FROM library_leads
   WHERE resend_email_id = 'abc123def456';
   ```

3. 결과 없으면 → 이메일 전송 시 `resend_email_id` 저장 안 됨
4. 해결: `app/api/library/download/route.ts` 확인

---

## 📊 모니터링

### Resend 대시보드

https://resend.com/emails 에서 실시간 모니터링:

- Sent: 전송된 이메일 수
- Delivered: 배달된 이메일 수
- Opened: 열린 이메일 수 (추적 활성화됨)
- Clicked: 클릭된 링크 수

### Vercel 로그

```bash
npx vercel logs https://glec-website.vercel.app --follow
```

**주요 로그 패턴**:

```
✅ 정상: [Resend Webhook] Email opened: lead@example.com
✅ 정상: [Resend Webhook] Lead score updated: 75 -> 85
⚠️  경고: [Resend Webhook] Lead not found for email_id: xxx
❌ 오류: [Resend Webhook] Signature verification failed
```

### 데이터베이스 쿼리

```sql
-- 오늘 이메일 열림률
SELECT
  COUNT(*) FILTER (WHERE email_sent = TRUE) AS sent,
  COUNT(*) FILTER (WHERE email_opened = TRUE) AS opened,
  ROUND(100.0 * COUNT(*) FILTER (WHERE email_opened = TRUE) / NULLIF(COUNT(*) FILTER (WHERE email_sent = TRUE), 0), 2) AS open_rate
FROM library_leads
WHERE DATE(created_at) = CURRENT_DATE;

-- 최근 1시간 웹훅 이벤트
SELECT
  email,
  email_sent,
  email_opened,
  download_link_clicked,
  lead_score,
  updated_at
FROM library_leads
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

---

## 🎯 성공 기준

모든 항목이 ✅ 일 때 설정 완료:

- ✅ Resend 웹훅 생성 완료
- ✅ Signing Secret 일치 확인
- ✅ Test Event → `200 OK` 응답
- ✅ 실제 이메일 이벤트 추적 확인 (opened, clicked)
- ✅ 스팸 신고 시 이메일 블랙리스트 추가 확인
- ✅ Lead Score 자동 업데이트 확인

---

## 📝 다음 단계

1. ✅ Resend 웹훅 설정 (이 문서)
2. ⏳ Vercel Cron Jobs 검증
3. ⏳ E2E 테스트 실행
4. ⏳ 프로덕션 모니터링 대시보드 구축

---

**작성일**: 2025-10-17
**작성자**: Claude AI Agent
**업데이트**: 프로덕션 배포 완료 후 최초 작성
