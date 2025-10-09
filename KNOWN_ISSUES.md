# Known Issues

This document tracks known issues and technical debt in the GLEC Website project.

**Last Updated**: 2025-10-09
**Current Version**: 0.2.0

---

## 🟡 Medium Priority (P2)

### 1. E2E UI Test Selector Mismatch
**Status**: Identified, Not Fixed
**Component**: Admin Portal E2E Tests
**Impact**: E2E tests fail due to UI text not matching test selectors

**Details**:
- Test file: `tests/e2e/admin-create-all-pages.spec.ts`
- Issue: Locators like `'text=새 공지사항 만들기'` don't match actual UI text `'새 공지사항 작성'`
- Root Cause: Test selectors written before UI finalized, not updated

**Workaround**: Backend API tests cover functionality (100% passing)

**Fix Required**:
1. Audit all E2E test selectors against actual UI
2. Update selectors to match current Korean UI text
3. Add data-testid attributes for stable selectors

**Effort**: 4-6 hours

---

### 2. Temporary Test Files Cleanup
**Status**: Identified, Not Fixed
**Component**: Test Directory
**Impact**: Repository clutter, potential confusion

**Details**:
Numerous temporary test files created during debugging:
- `test-all-content-apis.js`
- `test-all-content-apis-fixed.js`
- `test-debug-popups-events.js`
- `fix-popups.js`
- `fix-events.js`
- `fix-popups-uuid.js`
- Multiple backup files (`.bak`, `.backup`)

**Workaround**: Files are not committed to git (in .gitignore or untracked)

**Fix Required**:
1. Move `test-iteration-3-final.js` to `tests/integration/` as official test
2. Delete all temporary test/fix scripts
3. Clean up backup files

**Effort**: 1-2 hours

---

### 3. Login Timeout for Slow Dev Server
**Status**: Fixed (workaround applied)
**Component**: Playwright E2E Tests
**Impact**: Tests timeout on slow development servers

**Details**:
- Original timeout: 15 seconds
- Required timeout: 20-30 seconds for local dev server
- Applied in: `tests/e2e/admin-create-all-pages.spec.ts`

**Root Cause**: Next.js 15 dev server compilation time + HMR overhead

**Permanent Fix**: Use production build for E2E tests instead of dev server

**Effort**: 2-3 hours

---

## 🟢 Low Priority (P3)

### 4. Admin UI Page Components Missing Tests
**Status**: Identified, Not Fixed
**Component**: Admin UI Pages
**Impact**: Limited test coverage for UI components

**Details**:
Admin pages exist but lack component-level unit tests:
- `/admin/notices/new/page.tsx`
- `/admin/press/page.tsx`
- `/admin/popups/new/page.tsx`
- `/admin/events/create/page.tsx`
- `/admin/knowledge-blog/page.tsx`
- `/admin/knowledge-library/page.tsx`
- `/admin/knowledge-videos/page.tsx`

**Workaround**: API-level integration tests provide coverage

**Fix Required**:
1. Add React Testing Library tests for each page
2. Test form validation, submission, error handling
3. Target 80%+ component coverage

**Effort**: 12-16 hours

---

## ✅ Resolved Issues

### ~~1. Popups API UUID Generation~~
**Status**: ✅ FIXED in v0.2.0
**Fixed By**: commit 72a24c1
**Details**: Added `crypto.randomUUID()` and `id` column to INSERT

### ~~2. Events API JWT Field Mismatch~~
**Status**: ✅ FIXED in v0.2.0
**Fixed By**: commit 72a24c1
**Details**: Changed `user.id` to `user.userId`

### ~~3. Popups API Enum Case Mismatch~~
**Status**: ✅ FIXED in v0.2.0
**Fixed By**: commit 72a24c1
**Details**: Changed Zod enum to lowercase to match DB schema

### ~~4. Blog API Content Length Validation~~
**Status**: ✅ FIXED in v0.2.0
**Fixed By**: commit 72a24c1
**Details**: Updated test data to meet min 50 character requirement

---

## 🔍 Technical Debt

### Database Migrations
- Migration files exist but need organization
- Consider using migration tool (Prisma Migrate or similar)

### Environment Variables
- `.env.local` not version controlled (correct)
- Consider adding `.env.example` for documentation

### Test Organization
- Mix of unit, integration, E2E tests in different locations
- Standardize test structure and naming conventions

---

## 📝 Notes

- All CRITICAL and HIGH priority issues from Iteration 4 have been resolved
- Current focus: Maintain 100% API success rate
- Next priority: E2E UI test stability (P2)

**Maintenance Schedule**:
- Weekly: Review and update known issues
- Monthly: Prioritize and schedule fixes
- Quarterly: Audit and clean resolved issues
