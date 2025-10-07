# Audit Logs Testing Plan

## Test Environment
- Local: http://localhost:3000/admin/login
- Production: https://glec-website.vercel.app/admin/login

## Prerequisites
1. ✅ Database migration 004 completed (audit_logs table created)
2. ✅ Audit logger middleware implemented
3. ✅ Logs API endpoint (/api/admin/logs) implemented
4. ✅ Logs page UI completed
5. ✅ Sidebar menu item added

## Test Cases

### TC-1: Audit Log Creation on Login
**Steps**:
1. Navigate to http://localhost:3000/admin/login
2. Login with SUPER_ADMIN credentials (admin@glec.io / admin123)
3. Check database: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;`

**Expected**:
- One new audit log entry with:
  - action: 'LOGIN'
  - resource: 'auth'
  - userId: matching logged-in user
  - ipAddress: client IP
  - userAgent: browser user agent

**Status**: ⏳ Pending

---

### TC-2: Sidebar Menu Access
**Steps**:
1. Login as SUPER_ADMIN
2. Look for "감사 로그" menu item in sidebar

**Expected**:
- Menu item visible in sidebar (SUPER_ADMIN only)
- Icon: clipboard with list
- Active state when on /admin/logs route

**Status**: ⏳ Pending

---

### TC-3: Logs Page Load
**Steps**:
1. Login as SUPER_ADMIN
2. Click "감사 로그" in sidebar
3. Wait for page to load

**Expected**:
- Page title: "감사 로그"
- Subtitle: "관리자 액션 추적 및 모니터링 (10초마다 자동 업데이트)"
- Filter section: Action dropdown, Resource dropdown
- Table with columns: 타임스탬프, 사용자, 액션, 리소스, IP, 상세
- Loading spinner initially
- Then data loaded (at least 1 LOGIN log from TC-1)

**Status**: ⏳ Pending

---

### TC-4: Filter by Action
**Steps**:
1. On Logs page, select "로그인" (LOGIN) in Action filter

**Expected**:
- URL changes to `/admin/logs?action=LOGIN&page=1`
- Table shows only LOGIN entries
- Total count updates

**Status**: ⏳ Pending

---

### TC-5: Filter by Resource
**Steps**:
1. On Logs page, select "인증" (auth) in Resource filter

**Expected**:
- URL changes to `/admin/logs?resource=auth&page=1`
- Table shows only auth resource entries
- Total count updates

**Status**: ⏳ Pending

---

### TC-6: View Changes (Expand Details)
**Steps**:
1. On Logs page, find a log entry with changes (if any)
2. Click "보기" button

**Expected**:
- Expandable row appears below
- JSON changes displayed with formatting
- Button text changes to "숨기기"
- Click again to collapse

**Status**: ⏳ Pending

---

### TC-7: Auto-Refresh
**Steps**:
1. Stay on Logs page for 15+ seconds
2. Perform another action (e.g., logout → login) in another tab

**Expected**:
- Logs table auto-refreshes every 10 seconds
- New login log appears without manual refresh

**Status**: ⏳ Pending

---

### TC-8: Pagination
**Steps**:
1. If there are 20+ log entries, verify pagination controls appear
2. Click "다음" button

**Expected**:
- URL changes to `/admin/logs?page=2`
- Next page of logs loads
- "이전" button becomes enabled

**Status**: ⏳ Pending

---

### TC-9: RBAC - SUPER_ADMIN Only
**Steps**:
1. Logout
2. Login as CONTENT_MANAGER or ANALYST
3. Try to access /admin/logs directly

**Expected**:
- Sidebar does NOT show "감사 로그" menu item
- Direct access to /admin/logs returns 403 Forbidden
- Error message: "Only SUPER_ADMIN can access audit logs"

**Status**: ⏳ Pending

---

### TC-10: API Endpoint Validation
**Steps**:
1. Use browser DevTools or curl:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/logs?page=1&per_page=20
```

**Expected**:
- Status: 200 OK
- Response format:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "user": { "id": "...", "email": "...", "name": "..." },
      "action": "LOGIN",
      "resource": "auth",
      "resourceId": null,
      "changes": null,
      "ipAddress": "...",
      "userAgent": "...",
      "createdAt": "..."
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total_pages": 1,
    "total_count": 1
  }
}
```

**Status**: ⏳ Pending

---

## Test Execution Results

**Date**: 2025-10-07
**Tester**: Claude
**Environment**: Local (http://localhost:3000)

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-1: Audit Log Creation | ⏳ | Requires login |
| TC-2: Sidebar Menu | ⏳ | Requires login |
| TC-3: Logs Page Load | ⏳ | Requires login |
| TC-4: Filter Action | ⏳ | Requires login |
| TC-5: Filter Resource | ⏳ | Requires login |
| TC-6: View Changes | ⏳ | Requires logs with changes |
| TC-7: Auto-Refresh | ⏳ | Requires 15s wait |
| TC-8: Pagination | ⏳ | Requires 20+ logs |
| TC-9: RBAC | ⏳ | Requires CONTENT_MANAGER account |
| TC-10: API Validation | ⏳ | Can use curl |

---

## Next Steps

1. **Manual Testing**: Execute all test cases in browser
2. **Automated E2E Tests**: Create Playwright tests for critical flows
3. **Production Deployment**: Deploy and verify on Vercel
4. **Monitoring**: Check audit logs in production for 24 hours

---

## Known Issues

- None discovered yet

---

## Database Verification Queries

```sql
-- Check audit logs table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'audit_logs';

-- Check audit logs count
SELECT COUNT(*) FROM audit_logs;

-- Check recent logs
SELECT
  al.action,
  al.resource,
  u.email,
  al.ip_address,
  al.created_at
FROM audit_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;

-- Check logs by action type
SELECT action, COUNT(*) as count
FROM audit_logs
GROUP BY action
ORDER BY count DESC;
```
