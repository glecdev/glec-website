# Library System Integration Plan - CTO Mode

> **Date**: 2025-10-18
> **Status**: 🚧 In Progress
> **Goal**: 라이브러리 메뉴 + 지식센터 라이브러리 통합, 파일 업로드 기능 추가

---

## 📊 Current System Analysis

### Existing Components (✅ Working)

#### 1. Database Schema
```sql
library_items:
  - id (UUID)
  - title, slug, description
  - file_type, file_size_mb, file_url
  - download_type: EMAIL | DIRECT | GOOGLE_DRIVE
  - category: FRAMEWORK | WHITEPAPER | CASE_STUDY | DATASHEET | OTHER
  - tags (text[])
  - language, version
  - requires_form (boolean)
  - download_count, view_count
  - status: DRAFT | PUBLISHED | ARCHIVED
  - created_at, updated_at

library_leads:
  - id (UUID)
  - library_item_id (FK)
  - company_name, contact_name, email, phone
  - lead_score, lead_status
  - email_sent, email_sent_at
  - email_opened, email_opened_at
  - download_link_clicked, download_link_clicked_at
  - marketing_consent, privacy_consent
  - ip_address, user_agent
  - created_at, updated_at
```

#### 2. API Endpoints (✅ Operational)
- `POST /api/library/download` - 고객이 다운로드 신청
- `GET /api/admin/library/items` - Admin 라이브러리 목록
- `GET /api/admin/library/items/[id]` - Admin 라이브러리 상세
- `GET /api/admin/library/leads` - Admin 리드 목록

#### 3. Email System (✅ Verified)
- Resend 도메인 인증 완료 (`glec.io`)
- Email template with download link
- Auto-send on form submission
- Tracking: sent, opened, clicked

### Missing Components (❌ To Build)

#### 1. File Upload System
- [ ] Local file upload (Next.js API route)
- [ ] Cloudflare R2 storage integration
- [ ] Google Drive link support
- [ ] File validation (PDF, DOCX, XLSX only)
- [ ] File size limit (max 50MB)

#### 2. Admin UI - File Upload
- [ ] File upload input (drag & drop)
- [ ] Google Drive link input
- [ ] Upload progress indicator
- [ ] File preview after upload
- [ ] Delete/Replace file

#### 3. Download Tracking Enhancement
- [ ] Unique download URLs with expiry
- [ ] Download link security (token-based)
- [ ] Download analytics dashboard

---

## 🎯 Integration Strategy

### Phase 1: File Upload Backend (Priority: P0)

#### 1.1 Cloudflare R2 Setup
```typescript
// lib/storage/r2-client.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToR2(
  file: File,
  key: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  return `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`;
}
```

#### 1.2 Upload API Route
```typescript
// app/api/admin/library/items/upload/route.ts
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const itemId = formData.get('item_id') as string;

  // Validate file
  const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', ...];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
  }

  // Upload to R2
  const key = `library/${itemId}/${file.name}`;
  const url = await uploadFileToR2(file, key);

  // Update database
  await sql`
    UPDATE library_items
    SET file_url = ${url},
        file_type = ${getFileTypeFromMime(file.type)},
        file_size_mb = ${(file.size / 1024 / 1024).toFixed(2)}
    WHERE id = ${itemId}
  `;

  return NextResponse.json({ success: true, file_url: url });
}
```

### Phase 2: Admin UI Upload Component (Priority: P0)

```typescript
// components/admin/FileUpload.tsx
'use client';

import { useState } from 'react';

interface FileUploadProps {
  itemId: string;
  onUploadComplete: (url: string) => void;
}

export default function FileUpload({ itemId, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('item_id', itemId);

    try {
      const response = await fetch('/api/admin/library/items/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        onUploadComplete(data.file_url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium">파일 업로드</label>
      <input
        type="file"
        accept=".pdf,.docx,.xlsx"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <progress value={progress} max="100" />}
    </div>
  );
}
```

### Phase 3: Google Drive Integration (Priority: P1)

```typescript
// components/admin/GoogleDriveLink.tsx
interface GoogleDriveLinkProps {
  itemId: string;
  onLinkSet: (url: string) => void;
}

export default function GoogleDriveLink({ itemId, onLinkSet }: GoogleDriveLinkProps) {
  const [driveUrl, setDriveUrl] = useState('');

  const handleSubmit = async () => {
    // Validate Google Drive URL
    if (!driveUrl.includes('drive.google.com')) {
      alert('Invalid Google Drive URL');
      return;
    }

    // Update database
    const response = await fetch(`/api/admin/library/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: driveUrl,
        download_type: 'GOOGLE_DRIVE',
      }),
    });

    if (response.ok) {
      onLinkSet(driveUrl);
    }
  };

  return (
    <div>
      <label>Google Drive Link</label>
      <input
        type="url"
        value={driveUrl}
        onChange={(e) => setDriveUrl(e.target.value)}
        placeholder="https://drive.google.com/file/d/..."
      />
      <button onClick={handleSubmit}>Set Link</button>
    </div>
  );
}
```

### Phase 4: Secure Download Links (Priority: P1)

```typescript
// app/api/library/download-file/route.ts
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const itemId = req.nextUrl.searchParams.get('item');

  // Verify token (JWT with expiry)
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  if (decoded.itemId !== itemId || decoded.exp < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
  }

  // Get file URL from database
  const item = await sql`
    SELECT file_url FROM library_items WHERE id = ${itemId}
  `;

  // Track download
  await sql`
    UPDATE library_leads
    SET download_link_clicked = TRUE,
        download_link_clicked_at = NOW()
    WHERE id = ${decoded.leadId}
  `;

  // Redirect to actual file
  return NextResponse.redirect(item[0].file_url);
}
```

---

## 🚀 Implementation Plan

### Sprint 1: File Upload (2-3 hours) ✅ COMPLETED
- [✅] Local file upload (saved to public/library/)
- [✅] Upload API route (`/api/admin/library/items/upload`)
- [✅] File validation (type, size)
- [✅] Error handling
- [✅] E2E test passed
- [✅] Database verification passed
- [⏳] Cloudflare R2 client setup (OPTIONAL - deferred to future iteration)

### Sprint 2: Admin UI (2-3 hours) ✅ COMPLETED
- [✅] FileUpload component (drag & drop)
- [✅] Upload method selector (Local / URL / Google Drive)
- [✅] Integrated into LibraryItemForm
- [✅] Upload progress indicator
- [✅] File preview after upload
- [✅] Auto-fill file metadata (type, size, url)

### Sprint 3: Download Security (1-2 hours)
- [ ] Generate secure download tokens (JWT)
- [ ] Download file API route
- [ ] Token expiry (24 hours)
- [ ] Download tracking

### Sprint 4: Testing & Verification (1-2 hours)
- [ ] E2E test: Upload → Email → Download
- [ ] Security test: Invalid tokens
- [ ] Performance test: Large files (50MB)
- [ ] Browser compatibility test

### Sprint 5: Documentation (1 hour)
- [ ] Admin user guide (파일 업로드 방법)
- [ ] API documentation
- [ ] Troubleshooting guide

---

## ✅ Success Criteria

### Functional Requirements
- [⏳] Admin can upload files (PDF, DOCX, XLSX)
- [ ] Admin can set Google Drive links
- [ ] Customer receives email with download link
- [ ] Download link is secure and expires in 24h
- [ ] Download is tracked (clicked_at timestamp)
- [ ] Admin can view download analytics

### Non-Functional Requirements
- [ ] Upload speed: < 5 seconds for 10MB file
- [ ] Email delivery: < 1 minute
- [ ] Download link works in all major browsers
- [ ] Security: Token-based authentication
- [ ] Error handling: User-friendly error messages

### Quality Requirements
- [ ] Code coverage: 80%+
- [ ] TypeScript strict mode: ✅
- [ ] No hardcoded secrets
- [ ] WCAG 2.1 AA compliance (Admin UI)

---

## 📋 Environment Variables Needed

```bash
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=glec-library-files
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# JWT (for download tokens)
JWT_SECRET=your-jwt-secret-minimum-32-chars
```

---

## 🔒 Security Considerations

### 1. File Upload Security
- ✅ File type validation (whitelist only)
- ✅ File size limit (50MB max)
- ✅ Virus scanning (ClamAV integration - optional)
- ✅ Admin authentication required

### 2. Download Link Security
- ✅ JWT-based tokens with expiry
- ✅ One-time use links (optional)
- ✅ Rate limiting (5 downloads/hour per IP)
- ✅ No direct file URL exposure

### 3. Privacy
- ✅ GDPR compliance (customer data)
- ✅ Marketing consent tracking
- ✅ Data retention policy (90 days)

---

**Next Step**: Implement Cloudflare R2 file upload (Sprint 1)
