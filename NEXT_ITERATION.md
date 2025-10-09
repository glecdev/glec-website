# Next Iteration Goals

**Current Status**: Iteration 4 Complete - 100% API Success Rate ✅
**Last Updated**: 2025-10-09

---

## 🎯 Iteration 5 Goals

### Primary Objective
**Complete Admin API CRUD Operations** - Implement GET, PUT, DELETE for all 8 content types

### Success Criteria
- [ ] All GET endpoints return paginated data (20 items/page)
- [ ] All PUT endpoints validate and update existing records
- [ ] All DELETE endpoints perform soft delete (set deleted_at)
- [ ] 100% test coverage for new endpoints (24 additional APIs)
- [ ] API response times < 500ms (p95)

### Scope
**8 Content Types × 3 Operations = 24 New Endpoints**

1. **Notices** - GET, PUT, DELETE
2. **Press** - GET, PUT, DELETE
3. **Popups** - GET, PUT, DELETE
4. **Events** - GET, PUT, DELETE
5. **Blog** - GET, PUT, DELETE
6. **Library** - GET, PUT, DELETE
7. **Videos** - GET, PUT, DELETE
8. **Demo Requests** - GET (read-only)

### Timeline
**Estimated Duration**: 3-5 days
- Day 1: GET endpoints (8 APIs)
- Day 2: PUT endpoints (8 APIs)
- Day 3: DELETE endpoints (8 APIs)
- Day 4: Testing & optimization
- Day 5: E2E verification

---

## 🔧 Technical Requirements

### API Standards (from GLEC-API-Specification.yaml)

**GET /api/admin/{resource}**:
```typescript
// Query params
{
  page?: number = 1
  per_page?: number = 20
  search?: string
  category?: string
  status?: string
  sort?: 'created_at' | 'published_at' | 'updated_at'
  order?: 'asc' | 'desc'
}

// Response
{
  success: true,
  data: T[],
  meta: {
    total: number,
    page: number,
    per_page: number,
    total_pages: number
  }
}
```

**PUT /api/admin/{resource}?id={id}**:
```typescript
// Body: Same as POST but all fields optional
// Response
{
  success: true,
  data: T
}
```

**DELETE /api/admin/{resource}?id={id}**:
```typescript
// Soft delete: UPDATE {resource} SET deleted_at = NOW() WHERE id = ?
// Response
{
  success: true,
  message: "Resource deleted successfully"
}
```

### Security Requirements
- [ ] All endpoints use `withAuth` middleware
- [ ] GET: Any authenticated user
- [ ] PUT/DELETE: CONTENT_MANAGER role or higher
- [ ] Validate UUIDs before DB queries
- [ ] Prevent SQL injection with parameterized queries
- [ ] Rate limiting: 100 requests/minute per user

### Performance Requirements
- [ ] Pagination default: 20 items
- [ ] Max pagination: 100 items
- [ ] Use DB indexes on frequently queried fields
- [ ] Cache GET responses (5 min TTL)
- [ ] Response time p95 < 500ms

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
- [ ] Zod schema validation tests
- [ ] Pagination logic tests
- [ ] Soft delete verification

### Integration Tests (Node.js)
- [ ] GET with various filters
- [ ] PUT validation errors
- [ ] DELETE authorization checks
- [ ] Pagination edge cases (page 0, page > total)

### E2E Tests (Playwright)
- [ ] Admin UI list → edit → save flow
- [ ] Admin UI list → delete → confirm flow
- [ ] Search and filter functionality

---

## 📋 Iteration 5 Task Breakdown

### Week 1: GET Endpoints (8 APIs)

**Day 1-2: Implementation**
- [ ] Notices GET - List with pagination
- [ ] Press GET - List with search
- [ ] Popups GET - List with date filtering
- [ ] Events GET - List with status filtering
- [ ] Blog GET - List with category filtering
- [ ] Library GET - List with resource type filtering
- [ ] Videos GET - List with duration sorting
- [ ] Demo Requests GET - List (read-only)

**Day 3: Testing**
- [ ] Write integration tests for all GET endpoints
- [ ] Test pagination (first page, last page, middle page)
- [ ] Test search functionality
- [ ] Test filters and sorting

**Day 4: Optimization**
- [ ] Add DB indexes on commonly filtered columns
- [ ] Implement response caching
- [ ] Performance testing with 1000+ records

### Week 2: PUT Endpoints (8 APIs)

**Day 1-2: Implementation**
- [ ] Notices PUT - Update with slug uniqueness check
- [ ] Press PUT - Update with published_at logic
- [ ] Popups PUT - Update with date validation
- [ ] Events PUT - Update with participant count check
- [ ] Blog PUT - Update with SEO slug
- [ ] Library PUT - Update with file URL validation
- [ ] Videos PUT - Update with duration
- [ ] (Demo Requests: No PUT - read-only)

**Day 3: Testing**
- [ ] Write integration tests for all PUT endpoints
- [ ] Test partial updates (only some fields)
- [ ] Test validation errors
- [ ] Test optimistic locking (updated_at check)

**Day 4: Authorization**
- [ ] Test CONTENT_MANAGER can update own resources
- [ ] Test ANALYST cannot update (403)
- [ ] Test SUPER_ADMIN can update all

### Week 3: DELETE Endpoints (8 APIs)

**Day 1: Implementation**
- [ ] Implement soft delete for all 8 resources
- [ ] Add deleted_at column checks to GET queries

**Day 2: Testing**
- [ ] Write integration tests for DELETE
- [ ] Test soft delete verification
- [ ] Test GET excludes deleted items
- [ ] Test authorization (only CONTENT_MANAGER+)

**Day 3: E2E Verification**
- [ ] Admin UI: Delete button → confirmation modal
- [ ] Admin UI: Deleted items not shown in list
- [ ] Admin UI: Restore functionality (optional)

---

## 🚀 Definition of Done (Iteration 5)

### Code Quality
- [ ] All 24 endpoints follow GLEC-API-Specification.yaml
- [ ] No hardcoded data or credentials
- [ ] TypeScript strict mode with no `any` types
- [ ] ESLint passing with no warnings

### Testing
- [ ] 100% integration test coverage (24/24 APIs)
- [ ] All tests pass in CI/CD
- [ ] E2E tests for admin UI CRUD flows

### Documentation
- [ ] API endpoints documented in GLEC-API-Specification.yaml
- [ ] CHANGELOG updated with all changes
- [ ] Known issues tracked in KNOWN_ISSUES.md

### Security
- [ ] All endpoints authenticated
- [ ] Authorization checked (RBAC)
- [ ] Input validation with Zod
- [ ] SQL injection prevented

### Performance
- [ ] All GET endpoints < 500ms (p95)
- [ ] All PUT/DELETE endpoints < 300ms (p95)
- [ ] DB queries optimized with indexes

---

## 🎓 Learning Goals

### For This Iteration
1. **Pagination Best Practices**: Offset vs cursor-based
2. **Soft Delete Patterns**: deleted_at vs is_deleted
3. **Optimistic Locking**: Prevent race conditions with updated_at
4. **API Versioning**: Prepare for future API changes

### Skills to Develop
- [ ] Advanced SQL queries (JOIN, aggregation)
- [ ] Caching strategies (Redis, in-memory)
- [ ] Rate limiting implementation
- [ ] Performance profiling with Neon

---

## 📊 Success Metrics

### Before Iteration 5
- Admin APIs: 8 POST endpoints (100% working)
- Test Coverage: API-level only
- Response Time: Not measured

### After Iteration 5 (Target)
- Admin APIs: 32 endpoints (8 POST + 24 GET/PUT/DELETE)
- Test Coverage: 100% (unit + integration + E2E)
- Response Time: p95 < 500ms
- Throughput: 100+ requests/second

---

## 🔄 Retrospective (Post-Iteration 5)

_To be filled after completion_

### What Went Well
- TBD

### What Needs Improvement
- TBD

### Action Items for Iteration 6
- TBD

---

**Note**: This iteration plan follows CLAUDE.md principles:
- ✅ No hardcoding
- ✅ Root cause analysis for bugs
- ✅ 80%+ test coverage
- ✅ Security-first approach
- ✅ Recursive verification methodology
