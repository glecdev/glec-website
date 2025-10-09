# Changelog

All notable changes to the GLEC Website project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-10-09

### Added
- Comprehensive API testing framework for admin content APIs
- Admin login E2E test using Playwright
- Recursive verification test suite (test-iteration-3-final.js)

### Fixed
- **CRITICAL**: Popups API - Missing UUID generation causing DB constraint violations
  - Added `crypto.randomUUID()` for `id` column
  - Included `id` in INSERT statement

- **CRITICAL**: Events API - JWT field name mismatch causing null author_id
  - Changed `user.id` to `user.userId` to match JWT payload structure
  - Fixed author_id constraint violation

- **HIGH**: Popups API - Enum case mismatch between Zod schema and database
  - Changed displayType enum from uppercase (MODAL) to lowercase (modal)
  - Aligned with Prisma schema definition

- **HIGH**: Blog API - Content length validation in test data
  - Updated test content to meet minimum 50 character requirement

### Changed
- Improved error handling and logging in Events API
- Enhanced test coverage for all 8 admin content APIs

### Performance
- All admin content APIs now achieve 100% success rate (8/8)
  - Login: ✅
  - Notices: ✅
  - Press: ✅
  - Popups: ✅
  - Events: ✅
  - Blog: ✅
  - Library: ✅
  - Videos: ✅

### Testing
- Added recursive verification methodology based on CLAUDE.md
- Server log analysis for root cause identification
- DEBUG logging for JWT payload inspection
- Comprehensive integration testing

## [0.1.0] - 2025-10-08

### Added
- Initial admin portal implementation
- Admin authentication with JWT
- Basic CRUD APIs for content management
- Neon PostgreSQL integration
- Next.js 15 App Router setup

---

## Version History

### Success Rate Progress
- **Iteration 1**: 37.5% (3/8 APIs passing)
- **Iteration 2**: 75.0% (6/8 APIs passing)
- **Iteration 3**: 62.5% (5/8 APIs passing) - Blog regression
- **Iteration 4**: 100% (8/8 APIs passing) ✅ **CURRENT**

### Root Causes Fixed
1. Popups API: UUID generation missing
2. Events API: JWT field name mismatch (`userId` vs `id`)
3. Popups API: Enum case sensitivity (DB lowercase vs schema uppercase)
4. Blog API: Test data validation (min length requirement)

---

**Note**: This changelog follows the recursive improvement methodology outlined in CLAUDE.md, prioritizing root cause fixes over workarounds.
