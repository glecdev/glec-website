# Vercel Environment Variable Setup

## Required Environment Variables for Meeting System

### SITE_URL (Critical for Email Links)

**Purpose**: Server-side API routes use this to generate meeting booking URLs in emails.

**Value**: `https://glec-website.vercel.app` (or your production domain)

**Setup Steps**:

1. Go to Vercel Dashboard: https://vercel.com/glecdevs-projects/glec-website
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key**: `SITE_URL`
   - **Value**: `https://glec-website.vercel.app`
   - **Environments**: Check **Production**, **Preview**, **Development**
5. Click **Save**
6. **Redeploy** the application (Settings → Deployments → ... → Redeploy)

### Why This Is Needed

**Problem**:
- `NEXT_PUBLIC_SITE_URL` only works in client-side code (browser JavaScript)
- Server-side API routes (like `/api/admin/leads/send-meeting-proposal`) cannot access `NEXT_PUBLIC_*` variables
- Without `SITE_URL`, emails contained broken URLs like:
  ```
  https://glec-website-xyz.vercel.app
  /meetings/schedule/token
  ```

**Solution**:
- Use `SITE_URL` (without `NEXT_PUBLIC_` prefix) for server-side APIs
- Add `.trim()` to remove any accidental newlines from environment variables

### Environment Variable Priority

The code uses this priority order:

```typescript
const base = (
  baseUrl ||                          // 1. Explicitly passed URL
  process.env.SITE_URL ||             // 2. Server-side env var (for APIs)
  process.env.NEXT_PUBLIC_SITE_URL || // 3. Client-side env var (fallback)
  'https://glec.io'                   // 4. Default production domain
).trim();
```

## Testing After Setup

### 1. Verify Environment Variable

```bash
# Check Vercel CLI
npx vercel env ls

# Should show:
# SITE_URL (Production, Preview, Development)
```

### 2. Test Email URL Generation

```bash
# Run test script against production
cd glec-website
node test-meeting-url.js

# Expected output:
# ✅ 미팅 제안 발송 성공!
# 🔗 생성된 URL: https://glec-website.vercel.app/meetings/schedule/{token}
```

### 3. Verify Email Button Link

1. Send a test meeting proposal email
2. Receive email in inbox
3. Click "📅 미팅 시간 선택하기" button
4. Should navigate to: `https://glec-website.vercel.app/meetings/schedule/{token}`
5. Should see monthly calendar interface (NOT 404 error)

## Local Development Setup

Add to `.env.local`:

```bash
# Site URL (for server-side email generation)
SITE_URL=http://localhost:3000
# Client-side site URL (for browser JavaScript)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Troubleshooting

### Issue: Email button still shows 404

**Check**:
1. Verify `SITE_URL` is set in Vercel dashboard
2. Redeploy after adding environment variable
3. Check email URL format (should NOT have newline between domain and path)

### Issue: URL has newline character

**Solution**: The code now uses `.trim()` to remove whitespace/newlines automatically.

### Issue: Different URL per deployment

**Problem**: Vercel generates unique URLs per deployment (e.g., `glec-website-abc123.vercel.app`)

**Solution**:
- Set `SITE_URL` to your **primary Vercel domain** or **custom domain**
- Example: `https://glec-website.vercel.app` (stable URL)
- Or: `https://glec.io` (custom domain)

## Related Files

- `lib/meeting-tokens.ts` - URL generation logic
- `app/api/admin/leads/send-meeting-proposal/route.ts` - Email sending API
- `lib/email-templates/meeting-proposal.ts` - Email template with button link

## Commit History

- `d195c8b` - Fix email booking URL with trim and server-side env var
- `d7ece79` - Add monthly calendar UI for meeting scheduling
