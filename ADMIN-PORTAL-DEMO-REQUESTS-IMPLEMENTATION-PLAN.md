# Admin Portal - Demo Requests Page Implementation Plan

**Feature**: Demo Requests Management (Admin Portal)
**Priority**: P1 (High)
**Estimated Effort**: 40 hours (2 weeks)
**Status**: Planning Phase
**Created**: 2025-10-05

---

## 📊 Overview

Implement a complete admin interface for managing demo request submissions from the website's demo request form.

### Current State
- ✅ Database schema defined ([prisma/schema.prisma:470-508](prisma/schema.prisma))
- ✅ Public API for form submission (`POST /api/demo-requests`)
- ❌ Admin API endpoint (GET `/api/admin/demo-requests`) - **NOT IMPLEMENTED**
- ❌ Admin UI (`app/admin/demo-requests/page.tsx`) - **STATIC PLACEHOLDER**

### Target State
- ✅ Admin API with pagination, filtering, search
- ✅ Admin UI with data table, status updates, assignment
- ✅ E2E tests covering full CRUD operations
- ✅ Documentation and user guide

---

## 🎯 Requirements

### Functional Requirements

#### 1. Data Display (View Demo Requests)
- **List all demo requests** in a paginated table
- **Display fields**:
  - Status badge (colored: NEW=green, SCHEDULED=blue, COMPLETED=gray, CANCELLED=red)
  - Company Name
  - Contact Name + Email
  - Product Interests (comma-separated)
  - Preferred Date + Time
  - Submitted Date (created_at)
  - Assigned To (user name or "Unassigned")
- **Sorting**: By created_at (DESC default), status, preferred_date
- **Pagination**: 20 items per page

#### 2. Filtering
- **Status Filter**: All / NEW / SCHEDULED / COMPLETED / CANCELLED
- **Product Filter**: All / DTG Series5 / Carbon API / GLEC Cloud / AI DTG
- **Date Range Filter**: Created Date (from - to)
- **Assigned Filter**: All / Assigned / Unassigned

#### 3. Search
- **Search fields**: email, company_name, contact_name
- **Search type**: Case-insensitive partial match
- **UI**: Search input with debounce (500ms)

#### 4. Status Update (PATCH `/api/admin/demo-requests/:id`)
- **Update status**: NEW → SCHEDULED → COMPLETED / CANCELLED
- **Update assigned_to**: Dropdown of all users with role CONTENT_MANAGER or SUPER_ADMIN
- **Add admin notes**: Textarea for internal comments
- **UI**: Modal dialog with form

#### 5. Detail View
- **View all fields** from demo request
- **Company Information** (Step 1 of form):
  - Company Name, Contact Name, Email, Phone, Company Size
- **Interest & Requirements** (Step 2):
  - Product Interests, Use Case, Current Solution, Monthly Shipments
- **Schedule** (Step 3):
  - Preferred Date, Preferred Time, Additional Message
- **Metadata**:
  - Status, Privacy Consent, IP Address, Notes, Assigned To
  - Created At, Updated At
- **UI**: Slide-over panel or modal

#### 6. Bulk Actions (Future Enhancement - Not in Scope for Sprint 1)
- Select multiple rows
- Bulk status update
- Bulk assignment
- Bulk export to CSV

---

## 🏗️ Technical Architecture

### Database Schema (Existing)

```prisma
// prisma/schema.prisma (lines 470-508)
model DemoRequest {
  id                String             @id @default(uuid())

  // Step 1: Company Information
  companyName       String             @map("company_name")
  contactName       String             @map("contact_name")
  email             String
  phone             String
  companySize       String             @map("company_size") // 1-10, 11-50, 51-200, 201-1000, 1000+

  // Step 2: Interest & Requirements
  productInterests  String[]           @map("product_interests") // DTG Series5, Carbon API, GLEC Cloud, AI DTG
  useCase           String             @map("use_case") @db.Text
  currentSolution   String?            @map("current_solution")
  monthlyShipments  String             @map("monthly_shipments") // <100, 100-1000, 1000-10000, 10000+

  // Step 3: Schedule Demo
  preferredDate     DateTime           @map("preferred_date")
  preferredTime     String             @map("preferred_time") // HH:MM format
  additionalMessage String?            @map("additional_message") @db.Text

  // Metadata
  status            DemoRequestStatus  @default(NEW)
  privacyConsent    Boolean            @map("privacy_consent")
  ipAddress         String?            @map("ip_address")
  notes             String?            @db.Text // Admin notes

  // Relations
  assignedToId      String?            @map("assigned_to_id")
  assignedTo        User?              @relation("DemoAssignedTo", fields: [assignedToId], references: [id], onDelete: SetNull)

  createdAt         DateTime           @default(now()) @map("created_at")
  updatedAt         DateTime           @updatedAt @map("updated_at")

  @@index([status, createdAt(sort: Desc)])
  @@index([email])
  @@index([preferredDate])
  @@map("demo_requests")
}

enum DemoRequestStatus {
  NEW
  SCHEDULED
  COMPLETED
  CANCELLED
}
```

### API Specification

#### GET `/api/admin/demo-requests`

**Authentication**: Required (JWT token, role: CONTENT_MANAGER or SUPER_ADMIN)

**Query Parameters**:
```typescript
interface QueryParams {
  page?: number;        // Default: 1
  per_page?: number;    // Default: 20, Max: 100
  status?: DemoRequestStatus | '';  // Filter by status
  product?: string;     // Filter by product interest
  assigned?: 'true' | 'false' | '';  // Filter by assignment
  search?: string;      // Search in email, company_name, contact_name
  sort_by?: 'created_at' | 'preferred_date' | 'status';  // Default: created_at
  sort_order?: 'asc' | 'desc';  // Default: desc
  date_from?: string;   // ISO date string
  date_to?: string;     // ISO date string
}
```

**Response**:
```typescript
{
  success: true,
  data: DemoRequest[],  // Array of demo requests
  meta: {
    page: number,
    per_page: number,
    total: number,
    total_pages: number,
    has_prev: boolean,
    has_next: boolean
  }
}
```

**Sample SQL Query**:
```sql
SELECT
  dr.*,
  u.name as assigned_to_name,
  u.email as assigned_to_email
FROM demo_requests dr
LEFT JOIN users u ON dr.assigned_to_id = u.id
WHERE
  (dr.status = $1 OR $1 = '')
  AND (dr.product_interests && ARRAY[$2] OR $2 = '')
  AND (dr.assigned_to_id IS NOT NULL OR $3 = '')
  AND (
    dr.email ILIKE $4 OR
    dr.company_name ILIKE $4 OR
    dr.contact_name ILIKE $4
  )
  AND dr.created_at >= $5
  AND dr.created_at <= $6
ORDER BY dr.created_at DESC
LIMIT $7 OFFSET $8
```

---

#### PATCH `/api/admin/demo-requests/:id`

**Authentication**: Required (JWT token, role: CONTENT_MANAGER or SUPER_ADMIN)

**Request Body**:
```typescript
{
  status?: DemoRequestStatus;
  assignedToId?: string | null;
  notes?: string;
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    id: string,
    status: DemoRequestStatus,
    assignedToId: string | null,
    assignedToName: string | null,
    notes: string | null,
    updatedAt: string
  },
  message: 'Demo request updated successfully'
}
```

**Sample SQL Query**:
```sql
UPDATE demo_requests
SET
  status = COALESCE($1, status),
  assigned_to_id = COALESCE($2, assigned_to_id),
  notes = COALESCE($3, notes),
  updated_at = NOW()
WHERE id = $4
RETURNING *
```

---

### UI Components

#### 1. DemoRequestsTable Component

**File**: `app/admin/demo-requests/_components/DemoRequestsTable.tsx`

**Props**:
```typescript
interface DemoRequestsTableProps {
  data: DemoRequest[];
  loading: boolean;
  onRowClick: (id: string) => void;
  onStatusChange: (id: string, status: DemoRequestStatus) => void;
}
```

**Features**:
- Sortable columns
- Status badges with color coding
- Action buttons (View, Edit Status)
- Responsive design (mobile: card layout, desktop: table)

---

#### 2. DemoRequestDetailPanel Component

**File**: `app/admin/demo-requests/_components/DemoRequestDetailPanel.tsx`

**Props**:
```typescript
interface DemoRequestDetailPanelProps {
  demoRequest: DemoRequest | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateData) => Promise<void>;
}
```

**Features**:
- Slide-over panel (right side)
- Tabbed interface:
  - Tab 1: Company Info
  - Tab 2: Requirements
  - Tab 3: Schedule
  - Tab 4: Admin Actions (status, assignment, notes)
- Edit mode for admin fields

---

#### 3. FiltersBar Component

**File**: `app/admin/demo-requests/_components/FiltersBar.tsx`

**Props**:
```typescript
interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

interface FilterState {
  status: string;
  product: string;
  assigned: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}
```

**Features**:
- Dropdown filters (status, product, assigned)
- Search input with debounce
- Date range picker
- Reset button
- Active filters count badge

---

#### 4. StatusUpdateModal Component

**File**: `app/admin/demo-requests/_components/StatusUpdateModal.tsx`

**Props**:
```typescript
interface StatusUpdateModalProps {
  demoRequest: DemoRequest | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateData) => Promise<void>;
}

interface UpdateData {
  status: DemoRequestStatus;
  assignedToId: string | null;
  notes: string;
}
```

**Features**:
- Status dropdown (NEW, SCHEDULED, COMPLETED, CANCELLED)
- User assignment dropdown (fetched from `/api/admin/users`)
- Notes textarea
- Submit button with loading state
- Validation (required fields)

---

### State Management

**Approach**: React hooks + URL state synchronization

```typescript
// app/admin/demo-requests/page.tsx

const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [meta, setMeta] = useState<PaginationMeta | null>(null);

// Filters (synced with URL params)
const [filters, setFilters] = useState<FilterState>({
  status: searchParams.get('status') || '',
  product: searchParams.get('product') || '',
  assigned: searchParams.get('assigned') || '',
  search: searchParams.get('search') || '',
  dateFrom: searchParams.get('date_from') || '',
  dateTo: searchParams.get('date_to') || '',
});

// Pagination
const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

// Detail panel
const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
const [detailPanelOpen, setDetailPanelOpen] = useState(false);

// Fetch data
useEffect(() => {
  fetchDemoRequests();
}, [filters, page]);

async function fetchDemoRequests() {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '20',
      ...filters
    });

    const response = await fetch(`/api/admin/demo-requests?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const result = await response.json();

    if (result.success) {
      setDemoRequests(result.data);
      setMeta(result.meta);
    } else {
      setError(result.error.message);
    }
  } catch (err) {
    setError('Failed to fetch demo requests');
  } finally {
    setLoading(false);
  }
}
```

---

## 📅 Implementation Timeline (40 hours total)

### Week 1 (20 hours)

#### Day 1 (8 hours) - API Implementation
- [x] **Planning** (2 hours) - This document
- [ ] **GET `/api/admin/demo-requests` endpoint** (4 hours)
  - Implement query parameter parsing
  - Build SQL query with filters
  - Add pagination logic
  - Test with Postman/curl
- [ ] **PATCH `/api/admin/demo-requests/:id` endpoint** (2 hours)
  - Implement status update
  - Implement assignment update
  - Implement notes update
  - Test with Postman/curl

#### Day 2 (6 hours) - Core UI Components
- [ ] **DemoRequestsTable component** (3 hours)
  - Table structure with columns
  - Status badges
  - Sorting logic
  - Loading/error states
- [ ] **FiltersBar component** (3 hours)
  - Dropdowns for status, product, assigned
  - Search input with debounce
  - Date range picker
  - Reset button

#### Day 3 (6 hours) - Detail View & Update
- [ ] **DemoRequestDetailPanel component** (4 hours)
  - Slide-over panel layout
  - Display all demo request fields
  - Tabbed interface
- [ ] **StatusUpdateModal component** (2 hours)
  - Status dropdown
  - User assignment dropdown
  - Notes textarea
  - Submit logic

---

### Week 2 (20 hours)

#### Day 4 (8 hours) - Integration & Polish
- [ ] **Admin page integration** (4 hours)
  - Connect all components
  - URL state synchronization
  - Error handling
  - Loading states
- [ ] **Pagination component** (2 hours)
  - Previous/Next buttons
  - Page number display
  - Jump to page
- [ ] **Responsive design** (2 hours)
  - Mobile: Card layout
  - Tablet: Condensed table
  - Desktop: Full table

#### Day 5 (6 hours) - E2E Testing
- [ ] **Playwright E2E tests** (6 hours)
  - Test: Admin login → Demo Requests page
  - Test: Filter by status
  - Test: Search by email
  - Test: View demo request details
  - Test: Update status
  - Test: Assign to user
  - Test: Pagination

#### Day 6 (6 hours) - Documentation & Cleanup
- [ ] **User Guide** (2 hours)
  - Admin workflow documentation
  - Screenshot tutorials
  - FAQ
- [ ] **Code review & refactoring** (2 hours)
  - Remove console.logs
  - Add TypeScript types
  - Extract reusable functions
- [ ] **Update E2E tests** (2 hours)
  - Uncomment Admin Portal verification in `tests/e2e/complete-forms-flow-verification.spec.ts`
  - Update test to verify demo request appears in admin portal

---

## 🧪 Testing Strategy

### Unit Tests (Jest + React Testing Library)
```typescript
// app/admin/demo-requests/_components/__tests__/DemoRequestsTable.test.tsx

describe('DemoRequestsTable', () => {
  it('should render demo requests', () => {
    const mockData = [/* ... */];
    render(<DemoRequestsTable data={mockData} loading={false} />);
    expect(screen.getByText('E2E Test Company')).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    render(<DemoRequestsTable data={[]} loading={true} />);
    expect(screen.getAllByRole('row')).toHaveLength(6); // Skeleton rows
  });

  it('should call onRowClick when row is clicked', () => {
    const onRowClick = jest.fn();
    const mockData = [/* ... */];
    render(<DemoRequestsTable data={mockData} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('E2E Test Company'));
    expect(onRowClick).toHaveBeenCalledWith('demo-request-id');
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/admin-demo-requests.spec.ts

test.describe('Admin - Demo Requests Management', () => {
  test.beforeEach(async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${BASE_URL}/admin/demo-requests`);
  });

  test('should display demo requests list', async ({ page }) => {
    await expect(page.locator('table tbody tr')).toHaveCount(20); // Default page size
  });

  test('should filter by status', async ({ page }) => {
    await page.selectOption('select[name="status"]', 'NEW');
    await page.waitForTimeout(500);

    const rows = page.locator('table tbody tr');
    await expect(rows.first().locator('.status-badge')).toHaveText('NEW');
  });

  test('should search by email', async ({ page }) => {
    await page.fill('input[placeholder="Search..."]', 'test@example.com');
    await page.waitForTimeout(500); // Debounce

    const email = page.locator('table tbody tr').first().locator('td:nth-child(3)');
    await expect(email).toContainText('test@example.com');
  });

  test('should update status', async ({ page }) => {
    await page.click('table tbody tr:first-child button:has-text("Edit")');
    await page.selectOption('select[name="status"]', 'SCHEDULED');
    await page.fill('textarea[name="notes"]', 'Demo scheduled for 2025-10-10');
    await page.click('button:has-text("Save")');

    await expect(page.locator('.toast')).toContainText('Updated successfully');
  });
});
```

---

## 📝 Acceptance Criteria

### Must Have (Sprint 1)
- [x] Planning document created
- [ ] Admin can view list of demo requests (paginated, 20 per page)
- [ ] Admin can filter by status (NEW, SCHEDULED, COMPLETED, CANCELLED)
- [ ] Admin can search by email, company name, contact name
- [ ] Admin can view full details of a demo request
- [ ] Admin can update status of a demo request
- [ ] Admin can assign demo request to a user
- [ ] Admin can add internal notes to a demo request
- [ ] E2E tests cover all CRUD operations
- [ ] Mobile responsive (card layout for mobile, table for desktop)

### Nice to Have (Future Sprints)
- [ ] Filter by product interest
- [ ] Filter by date range
- [ ] Filter by assignment status
- [ ] Bulk actions (select multiple, bulk status update)
- [ ] Export to CSV
- [ ] Email notification to assigned user
- [ ] Status change history (audit log)
- [ ] Advanced search (use case, company size, etc.)

---

## 🚧 Known Issues & Risks

### Technical Debt
1. **Authentication**: Current implementation assumes JWT token is available. Need to implement token refresh logic.
2. **Authorization**: Need to check user role (CONTENT_MANAGER or SUPER_ADMIN) before allowing access.
3. **Error Handling**: Need comprehensive error handling for network failures, 401, 403, 500 errors.

### Risks
1. **Performance**: If demo_requests table grows to 10,000+ rows, pagination queries may slow down. Mitigation: Add database indexes (already exist).
2. **Concurrent Updates**: Two admins updating the same demo request simultaneously could cause conflicts. Mitigation: Add optimistic locking (check updated_at).
3. **Large Text Fields**: use_case and additional_message can be very long. Mitigation: Add character limits or truncation in table view.

---

## 📚 References

- **Database Schema**: [prisma/schema.prisma](prisma/schema.prisma) (lines 470-508)
- **Public API**: [app/api/demo-requests/route.ts](app/api/demo-requests/route.ts)
- **Admin UI (Placeholder)**: [app/admin/demo-requests/page.tsx](app/admin/demo-requests/page.tsx)
- **E2E Test**: [tests/e2e/complete-forms-flow-verification.spec.ts](tests/e2e/complete-forms-flow-verification.spec.ts)
- **Technical Debt Doc**: [TECHNICAL-DEBT.md](TECHNICAL-DEBT.md)

---

## ✅ Next Steps

1. **Create API endpoint** (`GET /api/admin/demo-requests`)
2. **Create update endpoint** (`PATCH /api/admin/demo-requests/:id`)
3. **Build UI components** (Table, Filters, Detail Panel, Update Modal)
4. **Write E2E tests** (Admin login → List → Filter → View → Update)
5. **Update technical debt doc** (Mark P1 as in progress)

---

**Prepared by**: Claude AI Development Agent
**Date**: 2025-10-05
**Status**: ✅ PLANNING COMPLETE - READY FOR IMPLEMENTATION
**Next Session**: Begin Day 1 - API Implementation
