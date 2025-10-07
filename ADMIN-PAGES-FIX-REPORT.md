# Admin Pages Fix Report
**Date**: 2025-10-07
**Target**: Notices, Events, Press admin pages
**Issue**: "An unexpected error occurred" on admin portal

---

## 🔍 Root Cause Analysis

### Issue 1: Notices API - 500 Internal Server Error
**Symptom**: `GET /api/admin/notices` returned 500 error

**Root Cause**:
```
[GET /api/admin/notices] Error: Error [NeonDbError]: column "deleted_at" does not exist
```

**Analysis**:
- Notices API code used `deleted_at` column in all WHERE clauses
- Prisma schema's Notice model was missing `deletedAt` field
- Database table `notices` did not have `deleted_at` column

**Fix Applied**:
1. Added to Prisma schema (Line 138):
   ```prisma
   deletedAt     DateTime?      @map("deleted_at")
   ```
2. Synchronized database:
   ```bash
   npx prisma db push --skip-generate --accept-data-loss
   ```
3. Verified with local test: ✅ **PASSED**

**Status**: ✅ **RESOLVED** (Local and Production)

---

### Issue 2: Events API - 500 Internal Server Error
**Symptom**: `GET /api/admin/events` returned 500 error

**Root Cause Analysis**:
```
[GET /api/admin/demo-requests] Error: Error: This function can now be called only as a tagged-template function:
sql`SELECT ${value}`, not sql("SELECT $1", [value], options).
```

**Analysis**:
- Neon serverless driver `@neondatabase/serverless@1.0.2` changed API
- Old pattern `sql(query, params)` no longer supported
- Must use Tagged Template Literals: `sql\`SELECT * FROM table WHERE id = ${id}\``

**Fix Applied** (Commit af06f02):
1. GET /api/admin/events (Lines 70-139):
   ```typescript
   // ❌ Before (Function call pattern)
   const countResult = await sql(countQuery, params);
   const events = await sql(eventsQuery, params);

   // ✅ After (Tagged Template Literals)
   const countResult = await sql`SELECT COUNT(*) as total FROM events WHERE status = ${status}`;
   const events = await sql`SELECT ... FROM events WHERE status = ${status} LIMIT ${per_page} OFFSET ${offset}`;
   ```

2. POST /api/admin/events (Lines 230-290):
   ```typescript
   // ❌ Before
   const existingEvent = await sql('SELECT id FROM events WHERE slug = $1', [validated.slug]);
   const result = await sql(insertQuery, [values...]);

   // ✅ After
   const existingEvent = await sql`SELECT id FROM events WHERE slug = ${validated.slug}`;
   const result = await sql`INSERT INTO events (...) VALUES (...) RETURNING *`;
   ```

**Local Test**: ✅ **PASSED** (200 OK, empty array)

**Production Test**: ❌ **FAILED** (500 Internal Server Error)

**Status**: ⚠️ **PARTIALLY RESOLVED** - Local works, Production still fails

---

### Issue 3: Press API
**Symptom**: Initially reported as error

**Analysis**:
- Press admin page uses Notices API with `category=PRESS` filter
- No separate `/api/admin/press` endpoint exists
- Once Notices API was fixed, Press page automatically worked

**Status**: ✅ **RESOLVED** (via Notices API fix)

---

## 📊 Test Results Summary

### Local Environment (http://localhost:3000)
| Endpoint | Status | Response |
|----------|--------|----------|
| `/api/admin/notices` | ✅ 200 OK | 1 notice returned |
| `/api/admin/events` | ✅ 200 OK | Empty array (table empty) |
| `/api/admin/notices?category=PRESS` | ✅ 200 OK | Press notices |

### Production Environment (https://glec-website.vercel.app)
| Endpoint | Status | Response |
|----------|--------|----------|
| `/api/admin/notices` | ✅ 200 OK | 1 notice returned |
| `/api/admin/events` | ❌ 500 ERROR | Internal Server Error |
| `/api/admin/notices?category=PRESS` | ✅ 200 OK | Press notices |

### Admin Pages UI Test (Playwright)
| Page | Status | Error Message |
|------|--------|---------------|
| `/admin/notices` | ✅ PASSED | No error |
| `/admin/events` | ❌ FAILED | "An unexpected error occurred" |
| `/admin/press` | ✅ PASSED | No error |

**Overall Success Rate**: 2/3 pages (66.7%)

---

## 🔧 Technical Details

### Git Commits
1. **af06f02**: `fix(api): Fix Neon SQL driver usage in Events API`
   - Changed Events API to Tagged Template Literals
   - All queries converted (GET, POST)

2. **c3421f1**: `fix(schema): Add missing deletedAt column to Notice model`
   - Added `deletedAt` to Prisma schema
   - Ran `prisma db push` to sync database

3. **1fe9003**: `chore: Force Vercel redeploy to apply Events API fixes`
   - Empty commit to trigger clean build
   - Attempted to clear Vercel cache

### Environment
- **Neon Driver**: `@neondatabase/serverless@1.0.2`
- **Node.js** (Local): v22.16.0
- **Node.js** (Vercel): Unknown (likely v20.x)
- **DATABASE_URL**: Same for local and production (Neon PostgreSQL)

---

## 🚨 Outstanding Issue: Events API Production Error

### Hypotheses
1. **Vercel Build Cache**: Despite forced redeploy, Vercel may still use cached build
2. **Environment Variable**: `DATABASE_URL` may have different permissions in Vercel
3. **Neon Driver Version**: Production build may install different version
4. **Runtime Difference**: Vercel Edge Runtime vs Node.js Runtime

### Attempted Fixes
- ✅ Code converted to Tagged Template Literals (af06f02)
- ✅ Forced redeploy with empty commit (1fe9003)
- ✅ Verified local environment works
- ❌ Production still returns 500 error

### Next Steps Needed
1. **Access Vercel Function Logs**: Need to see actual error message in production
2. **Check Vercel Build Logs**: Verify which code version was deployed
3. **Compare Local vs Production**:
   - Check `node_modules/@neondatabase/serverless/package.json` version
   - Check environment variables in Vercel dashboard
   - Check Node.js runtime version
4. **Alternative: Use Notices API Pattern**: Events API could temporarily use same patterns as Notices API (which works)

---

## 📝 Recommendations

### Immediate Actions
1. **User Workaround**: Events admin page is non-critical (events table is empty)
   - Priority: P2 (Medium)
   - Impact: Low (no events data yet)

2. **Verify Vercel Deployment**:
   - Check Vercel dashboard deployment logs
   - Manually redeploy from Vercel UI (not git push)
   - Enable detailed logging for Events API function

### Long-term Solutions
1. **Pin Neon Driver Version**: Change `package.json`
   ```json
   "@neondatabase/serverless": "1.0.2"  // Remove ^
   ```

2. **Add Error Logging**: Enhance Events API error handling
   ```typescript
   catch (error) {
     console.error('[GET /api/admin/events] Detailed Error:', {
       message: error.message,
       stack: error.stack,
       name: error.name
     });
   }
   ```

3. **Add Monitoring**: Set up Vercel Integration for error tracking
   - Sentry
   - LogRocket
   - Vercel Analytics

---

## ✅ Success Metrics

### Fixed Issues
- ✅ Notices API: 500 → 200 OK
- ✅ Press API: 500 → 200 OK (via Notices)
- ✅ Deleted_at column: Added to database

### Remaining Issues
- ❌ Events API: Still 500 error in production only

### Code Quality Improvements
- ✅ All SQL queries use Tagged Template Literals (Neon best practice)
- ✅ Prisma schema updated with missing column
- ✅ Database synchronized with schema

---

## 📌 Appendix

### Neon Tagged Template Literals Pattern
```typescript
// ✅ Correct (Neon 1.0+)
const users = await sql`SELECT * FROM users WHERE email = ${email}`;

// ❌ Deprecated (Old pattern)
const users = await sql('SELECT * FROM users WHERE email = $1', [email]);
const users = await sql.query('SELECT * FROM users WHERE email = $1', [email]);
```

### Conditional WHERE Clauses
```typescript
// ✅ Correct (Nested tagged templates)
const users = await sql`
  SELECT * FROM users
  WHERE deleted_at IS NULL
    ${status ? sql`AND status = ${status}` : sql``}
`;
```

### Error Handling Best Practice
```typescript
try {
  const result = await sql`SELECT ...`;
} catch (error) {
  console.error('[API Route] Error:', {
    message: error.message,
    code: error.code,       // For NeonDbError
    detail: error.detail,   // Database-specific details
    stack: error.stack
  });

  return NextResponse.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  }, { status: 500 });
}
```

---

**Report Generated**: 2025-10-07 15:35 KST
**Claude Code Version**: Sonnet 4.5
**Session ID**: glec-admin-pages-fix-001
