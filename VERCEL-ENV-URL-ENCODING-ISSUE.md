# Vercel Environment Variable URL Encoding Issue - RESOLVED

**Date**: 2025-10-17
**Status**: ✅ RESOLVED
**Root Cause**: URL encoding of base64 characters in query parameters

---

## 🚨 Problem Summary

**Symptom**: Cron endpoint returned `401 Unauthorized` despite correct environment variable setup
**Root Cause**: The `+` character in base64-encoded `CRON_SECRET` was being URL-decoded to a space
**Solution**: URL-encode the secret when using it in query parameters (`+` → `%2B`)

---

## 🔍 Investigation Timeline

### Initial Hypothesis (INCORRECT)
- **Suspected**: Vercel CLI adds trailing newlines (`\n`) to environment variables
- **Evidence**: `vercel env pull` showed values like `"OjZ...RaA="\n` with quotes and newlines
- **Action Taken**: Added `.trim()` and `.replace(/^["']|["']$/g, '')` to code
- **Result**: Still failed - this was NOT the root cause

### Actual Root Cause (CORRECT)
- **Discovery**: Created debug endpoint `/api/debug/cron-secret`
- **Finding 1**: Environment variable was CLEAN (no quotes, no newlines)
- **Finding 2**: All string lengths matched (44 characters)
- **Finding 3**: Hex comparison revealed the difference:
  - Expected: `...766d2b78...` (2b = `+`, 78 = `x`)
  - Received: `...766d2078...` (20 = space, 78 = `x`)
- **Conclusion**: URL parameter `+` was being decoded as space

---

## 📊 Technical Details

### Base64 Secret Value
```
OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=
        ^                               ^
     Plus sign                    Equals sign
```

### URL Encoding Behavior
When passed as a query parameter without encoding:
```
❌ WRONG:  ?cron_secret=OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=
   Decoded as: OjZEePvm x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=
                        ^
                      SPACE (incorrect!)
```

With proper URL encoding:
```
✅ CORRECT: ?cron_secret=OjZEePvm%2Bx5JqHn13bVCBQn0rTCDngh6492hqIhwRaA%3D
   Decoded as: OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=
                        ^
                      PLUS (correct!)
```

### Character Encoding Reference
| Character | URL Encoded | Hex | Decimal |
|-----------|-------------|-----|---------|
| `+` (plus) | `%2B` | 0x2B | 43 |
| ` ` (space) | `%20` or `+` | 0x20 | 32 |
| `=` (equals) | `%3D` | 0x3D | 61 |

---

## ✅ Solution

### Option 1: URL-Encode the Secret (Recommended)
When calling the cron endpoint, always URL-encode the secret:

```bash
# ❌ Wrong
curl "https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA="

# ✅ Correct
curl "https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=OjZEePvm%2Bx5JqHn13bVCBQn0rTCDngh6492hqIhwRaA%3D"
```

### Option 2: Use URL-Safe Base64 (Alternative)
Generate a URL-safe base64 secret (replaces `+` with `-` and `/` with `_`):

```javascript
// Generate URL-safe base64
const secret = crypto.randomBytes(32).toString('base64url');
// Example: OjZEePvm-x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA
//                  ^
//               Hyphen instead of plus
```

---

## 🧪 Testing

### Manual Test
```bash
# Test cron endpoint with URL-encoded secret
curl "https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=OjZEePvm%2Bx5JqHn13bVCBQn0rTCDngh6492hqIhwRaA%3D"
```

**Expected Response** (Success):
```json
{
  "success": true,
  "message": "Library nurture emails processed",
  "results": {
    "day3": {"sent": 0, "failed": 0},
    "day7": {"sent": 0, "failed": 0},
    "day14": {"sent": 0, "failed": 0},
    "day30": {"sent": 0, "failed": 0}
  },
  "timestamp": "2025-10-17T10:00:30.712Z"
}
```

### Programmatic Test
```javascript
const encodeURIComponent = require('encodeURIComponent');
const secret = 'OjZEePvm+x5JqHn13bVCBQn0rTCDngh6492hqIhwRaA=';
const url = `https://glec-website.vercel.app/api/cron/library-nurture?cron_secret=${encodeURIComponent(secret)}`;

fetch(url)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📋 Vercel Cron Job Setup

Update `vercel.json` to use URL-encoded secret:

```json
{
  "crons": [
    {
      "path": "/api/cron/library-nurture?cron_secret=OjZEePvm%2Bx5JqHn13bVCBQn0rTCDngh6492hqIhwRaA%3D",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 🛠️ Code Changes

### What Was Changed
1. **app/api/cron/library-nurture/route.ts**: Added quote/newline removal (defensive, but not needed)
2. **app/api/cron/test/library-nurture/route.ts**: Same defensive changes
3. **app/api/webhooks/resend/route.ts**: Same defensive changes
4. **app/api/debug/cron-secret/route.ts**: Created debug endpoint (can be removed)

### What Can Be Reverted
The `.replace(/^["']|["']$/g, '')` logic can be removed since the environment variables are already clean. However, keeping it doesn't hurt and adds defensive programming.

---

## 📖 Lessons Learned

### Key Takeaways
1. **Always URL-encode query parameters** containing special characters (`+`, `=`, `/`, etc.)
2. **Use base64url encoding** for secrets that will be used in URLs (replaces `+` with `-` and `/` with `_`)
3. **Hex dump debugging** is extremely useful for identifying invisible character differences
4. **Don't assume** - always verify environment variables with debug endpoints

### Best Practices Going Forward
1. Generate URL-safe secrets for all cron endpoints
2. Update documentation to emphasize URL encoding
3. Add automated tests for URL-encoded parameters
4. Include examples with `encodeURIComponent` in all API docs

---

## 🔗 Related Documents

- [VERCEL-ENV-SETUP-ISSUE.md](./VERCEL-ENV-SETUP-ISSUE.md) - Original investigation (incorrect hypothesis)
- [MANUAL-ENV-SETUP.md](./MANUAL-ENV-SETUP.md) - Manual setup guide
- [PRODUCTION-DEPLOYMENT-CHECKLIST.md](./PRODUCTION-DEPLOYMENT-CHECKLIST.md) - Deployment checklist
- [RESEND-WEBHOOK-SETUP.md](./RESEND-WEBHOOK-SETUP.md) - Webhook configuration

---

## 📝 Final Status

| Item | Status | Notes |
|------|--------|-------|
| Environment Variables | ✅ CORRECT | No quotes, no newlines |
| Code Changes | ✅ DEPLOYED | Defensive quote/newline handling |
| Cron Endpoint | ✅ WORKING | Requires URL-encoded secret |
| Webhook Endpoint | ⏳ UNTESTED | Same URL encoding applies |
| Documentation | ✅ COMPLETE | This document |

---

**Resolved By**: Claude AI Agent
**Resolution Date**: 2025-10-17
**Total Time**: ~3 hours of debugging
**Key Debug Tool**: Hex dump comparison
