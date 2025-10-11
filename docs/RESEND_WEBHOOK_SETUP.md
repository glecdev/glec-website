# Resend Webhook Setup Guide

## 개요

Library Download System의 이메일 추적 기능을 위해 Resend webhook을 설정합니다.

## 📋 사전 요구사항

- Resend 계정 (https://resend.com)
- RESEND_API_KEY 환경 변수 설정 완료
- Production 배포 완료 (https://glec-website.vercel.app)

## 🔗 Webhook 엔드포인트

### Production URL
```
https://glec-website.vercel.app/api/webhooks/resend
```

### 지원하는 이벤트

1. **email.sent** - 이메일 발송 완료
2. **email.delivered** - 이메일 전달 완료
3. **email.opened** - 이메일 열람
4. **email.clicked** - 링크 클릭
5. **email.bounced** - 반송
6. **email.complained** - 스팸 신고

## 🛠️ 설정 단계

### 1. Resend Dashboard 접속

1. https://resend.com/login 로그인
2. 좌측 메뉴에서 **"Webhooks"** 클릭

### 2. Webhook 추가

1. **"Add Webhook"** 버튼 클릭
2. 다음 정보 입력:

```
Endpoint URL: https://glec-website.vercel.app/api/webhooks/resend
Name: GLEC Library Download Tracking
Events: ✅ 모두 선택 (All events)
```

### 3. Webhook Secret 저장

1. Webhook 생성 후 **Signing Secret** 복사
2. Vercel 환경 변수에 추가:

```bash
# Vercel Dashboard → Settings → Environment Variables
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

또는 CLI로 추가:

```bash
cd glec-website
npx vercel env add RESEND_WEBHOOK_SECRET
# Value: whsec_xxxxxxxxxxxxxxxxxxxxx
# Environment: Production, Preview, Development
```

### 4. 환경 변수 재배포

```bash
# 환경 변수 추가 후 재배포 필요
git commit --allow-empty -m "chore: trigger redeploy for webhook secret"
git push origin main
```

## 🧪 테스트

### 1. Webhook 테스트 이메일 발송

Resend Dashboard에서:

1. **Webhooks** 페이지에서 생성한 webhook 클릭
2. **"Send test event"** 클릭
3. Event type: `email.delivered` 선택
4. **"Send"** 클릭

### 2. Webhook 로그 확인

#### Resend Dashboard
- Webhooks 페이지 → 해당 webhook 클릭 → **"Recent Deliveries"** 탭
- Status가 **200 OK**인지 확인

#### Vercel Logs
```bash
# Vercel 로그 확인
npx vercel logs glec-website --token=YOUR_TOKEN

# 또는 Vercel Dashboard
# Project → Logs → Filter: /api/webhooks/resend
```

### 3. Database 확인

```bash
# Production database 연결
npx tsx scripts/verify-schema.ts

# 또는 직접 쿼리
psql $DATABASE_URL
SELECT email_sent, email_opened, download_link_clicked
FROM library_leads
WHERE email = 'test@example.com';
```

## 📊 Webhook Payload 예시

### email.sent
```json
{
  "type": "email.sent",
  "created_at": "2025-10-11T12:00:00.000Z",
  "data": {
    "email_id": "re_xxxxxxxxxxxxx",
    "to": "user@example.com",
    "from": "noreply@glec.io",
    "subject": "GLEC Framework v3.0 다운로드 링크"
  }
}
```

### email.opened
```json
{
  "type": "email.opened",
  "created_at": "2025-10-11T12:05:00.000Z",
  "data": {
    "email_id": "re_xxxxxxxxxxxxx",
    "opened_at": "2025-10-11T12:05:00.000Z"
  }
}
```

### email.clicked
```json
{
  "type": "email.clicked",
  "created_at": "2025-10-11T12:10:00.000Z",
  "data": {
    "email_id": "re_xxxxxxxxxxxxx",
    "link": "https://glec-website.vercel.app/api/library/download/abc123",
    "clicked_at": "2025-10-11T12:10:00.000Z"
  }
}
```

## 🔍 문제 해결

### Webhook이 200을 반환하지 않는 경우

1. **환경 변수 확인**
```bash
npx vercel env ls
# RESEND_WEBHOOK_SECRET이 있는지 확인
```

2. **Vercel 함수 로그 확인**
```bash
npx vercel logs --follow
# /api/webhooks/resend 관련 에러 확인
```

3. **Database 연결 확인**
```bash
# DATABASE_URL이 올바른지 확인
npx tsx scripts/verify-schema.ts
```

### Webhook이 전달되지 않는 경우

1. **Resend 상태 확인**
   - https://status.resend.com/

2. **IP Whitelist 확인**
   - Vercel Functions는 동적 IP 사용
   - Resend는 IP whitelist가 필요 없음

3. **Rate Limit 확인**
   - Resend Free Plan: 3,000 emails/month
   - Webhook은 rate limit 없음

## 📈 모니터링

### Admin Dashboard에서 확인

1. Admin 로그인: https://glec-website.vercel.app/admin/login
2. **리드 관리** 메뉴 클릭
3. Email tracking indicators 확인:
   - ✉️ 발송됨 (email_sent)
   - 👁️ 열람함 (email_opened)
   - ⬇️ 다운로드 클릭 (download_link_clicked)

### Database 직접 모니터링

```sql
-- 이메일 추적 통계
SELECT
  COUNT(*) as total_leads,
  SUM(CASE WHEN email_sent THEN 1 ELSE 0 END) as emails_sent,
  SUM(CASE WHEN email_opened THEN 1 ELSE 0 END) as emails_opened,
  SUM(CASE WHEN download_link_clicked THEN 1 ELSE 0 END) as downloads
FROM library_leads;

-- 이메일 열람률
SELECT
  ROUND(100.0 * SUM(CASE WHEN email_opened THEN 1 ELSE 0 END) /
        NULLIF(SUM(CASE WHEN email_sent THEN 1 ELSE 0 END), 0), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN download_link_clicked THEN 1 ELSE 0 END) /
        NULLIF(SUM(CASE WHEN email_opened THEN 1 ELSE 0 END), 0), 2) as click_rate
FROM library_leads;
```

## ✅ 체크리스트

설정 완료 확인:

- [ ] Resend Dashboard에서 Webhook 생성
- [ ] Webhook URL이 `https://glec-website.vercel.app/api/webhooks/resend`인지 확인
- [ ] 모든 이벤트 타입 선택됨
- [ ] `RESEND_WEBHOOK_SECRET` 환경 변수 추가 (Vercel)
- [ ] 재배포 완료
- [ ] Test event 발송하여 200 OK 확인
- [ ] Admin Dashboard에서 이메일 추적 indicators 작동 확인

## 📚 참고 문서

- [Resend Webhooks Documentation](https://resend.com/docs/webhooks)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GLEC API Specification](../GLEC-API-Specification.yaml)

---

**마지막 업데이트**: 2025-10-11
**작성자**: Claude Code (CTO Mode)
