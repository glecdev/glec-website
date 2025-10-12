# Cloudflare Email Routing 설정 가이드

> **Date**: 2025-10-12
> **Purpose**: admin@glec.io, contact@glec.io → oillex.co.kr@gmail.com 포워딩 설정
> **Status**: ⏳ Setup Required

---

## 📋 Overview

**Goal**: glec.io 도메인의 이메일을 공식 Gmail 계정으로 포워딩

**Routing Rules**:
```
admin@glec.io → oillex.co.kr@gmail.com
contact@glec.io → oillex.co.kr@gmail.com
```

**Benefits**:
- ✅ FREE (Cloudflare 무료 플랜 포함)
- ✅ Unlimited emails (무제한 포워딩)
- ✅ Spam filtering (스팸 필터 내장)
- ✅ No mailbox needed (메일함 불필요)

---

## 🚀 Setup Steps

### Step 1: Cloudflare Dashboard 접속

**URL**: https://dash.cloudflare.com

**Account**: glecdev
**Domain**: glec.io

**Navigation**: Websites → glec.io → Email Routing

---

### Step 2: Enable Email Routing

**Screen**: Email Routing → Get Started

**Click**: "Enable Email Routing"

**What Happens**:
- Cloudflare automatically adds required DNS records
- MX records point to Cloudflare's mail servers
- SPF record updated for email forwarding

---

### Step 3: Verify DNS Records (Automatic)

Cloudflare will automatically add these records:

#### MX Records
```
Type: MX
Name: glec.io (or @)
Priority: 86
Content: route1.mx.cloudflare.net
TTL: Auto
```

```
Type: MX
Name: glec.io (or @)
Priority: 46
Content: route2.mx.cloudflare.net
TTL: Auto
```

```
Type: MX
Name: glec.io (or @)
Priority: 13
Content: route3.mx.cloudflare.net
TTL: Auto
```

#### TXT Record (SPF)
```
Type: TXT
Name: glec.io (or @)
Content: v=spf1 include:_spf.mx.cloudflare.net ~all
TTL: Auto
```

**Verification**:
- ✅ Cloudflare shows "DNS records configured"
- ✅ Status: Active

---

### Step 4: Add Destination Address

**Screen**: Email Routing → Destination addresses

**Click**: "Add destination address"

**Fields**:
```
Destination email: oillex.co.kr@gmail.com
```

**Action**: Click "Send verification email"

**Verification Steps**:
1. Check oillex.co.kr@gmail.com inbox
2. Find email from Cloudflare
3. Click verification link
4. Confirm: "Destination address verified" ✅

---

### Step 5: Create Routing Rules

#### Rule 1: admin@glec.io

**Screen**: Email Routing → Routing rules → Create address

**Fields**:
```
Custom address: admin@glec.io
Action: Send to an email
Destination: oillex.co.kr@gmail.com
```

**Click**: "Save"

**Status**: ✅ Active

---

#### Rule 2: contact@glec.io

**Screen**: Email Routing → Routing rules → Create address

**Fields**:
```
Custom address: contact@glec.io
Action: Send to an email
Destination: oillex.co.kr@gmail.com
```

**Click**: "Save"

**Status**: ✅ Active

---

#### Rule 3: Catch-all (Optional)

**Screen**: Email Routing → Routing rules → Catch-all address

**Options**:
- **Recommended**: Drop (스팸 방지)
- **Alternative**: Forward to oillex.co.kr@gmail.com

**Our Choice**: Drop

**Rationale**:
- admin@, contact@ 명시적 routing 설정
- 나머지는 스팸일 가능성 높음
- 필요 시 추가 rule 생성 가능

---

### Step 6: Test Email Forwarding

#### Test 1: admin@glec.io

**Send Test Email**:
```
From: Any email account
To: admin@glec.io
Subject: [TEST] Admin email forwarding test
Body: Testing Cloudflare Email Routing for admin@glec.io
```

**Expected Result**:
- ✅ Email received at oillex.co.kr@gmail.com
- ✅ From: admin@glec.io (via Cloudflare)
- ✅ Subject: [TEST] Admin email forwarding test

**Verification**:
```
Check oillex.co.kr@gmail.com inbox
Should see forwarded email within 1-2 minutes
```

---

#### Test 2: contact@glec.io

**Send Test Email**:
```
From: Any email account
To: contact@glec.io
Subject: [TEST] Contact email forwarding test
Body: Testing Cloudflare Email Routing for contact@glec.io
```

**Expected Result**:
- ✅ Email received at oillex.co.kr@gmail.com
- ✅ From: contact@glec.io (via Cloudflare)
- ✅ Subject: [TEST] Contact email forwarding test

---

## 📊 Verification Checklist

### Pre-Setup
- [ ] Cloudflare account access confirmed
- [ ] Domain glec.io active on Cloudflare
- [ ] DNS management access confirmed

### DNS Configuration
- [ ] MX records added (3 records)
- [ ] SPF TXT record added
- [ ] DNS propagation complete (check: `dig glec.io MX`)

### Destination Address
- [ ] oillex.co.kr@gmail.com added
- [ ] Verification email sent
- [ ] Verification link clicked
- [ ] Status: Verified ✅

### Routing Rules
- [ ] admin@glec.io rule created
- [ ] contact@glec.io rule created
- [ ] Catch-all rule configured (Drop)

### Testing
- [ ] Test email sent to admin@glec.io
- [ ] Test email received at oillex.co.kr@gmail.com
- [ ] Test email sent to contact@glec.io
- [ ] Test email received at oillex.co.kr@gmail.com

---

## 🐛 Troubleshooting

### Issue 1: Verification email not received

**Symptoms**:
- Sent verification to oillex.co.kr@gmail.com
- Email not in inbox

**Solutions**:
1. **Check Spam folder**:
   - Gmail → More → Spam
   - Search: "cloudflare"

2. **Check Promotions tab** (if using Gmail categories):
   - Gmail → Promotions tab

3. **Resend verification**:
   - Cloudflare Dashboard → Destination addresses
   - Click "Resend verification"

4. **Try different email format**:
   - Some email providers block verification emails
   - Try alternative: ghdi0506@gmail.com (then change later)

---

### Issue 2: DNS records not updating

**Symptoms**:
- Cloudflare shows "Configuring DNS..."
- Records not appearing in DNS

**Solutions**:
1. **Wait for propagation** (usually 5-10 minutes):
   ```bash
   # Check DNS propagation
   nslookup -type=MX glec.io 8.8.8.8
   ```

2. **Manual DNS check**:
   - Cloudflare Dashboard → DNS → Records
   - Verify MX and TXT records exist

3. **Force refresh**:
   - Cloudflare Dashboard → Email Routing
   - Click "Refresh DNS"

---

### Issue 3: Forwarded emails not received

**Symptoms**:
- Routing rules created
- Test email sent
- No email received at oillex.co.kr@gmail.com

**Solutions**:
1. **Check Cloudflare logs**:
   - Email Routing → Activity log
   - Look for delivery status

2. **Verify SPF record**:
   ```bash
   nslookup -type=TXT glec.io 8.8.8.8
   # Should see: v=spf1 include:_spf.mx.cloudflare.net ~all
   ```

3. **Check Gmail spam folder**:
   - Forwarded emails might be marked as spam initially
   - Mark as "Not spam" to train filter

4. **Verify destination address**:
   - Email Routing → Destination addresses
   - Status must be "Verified" ✅

---

### Issue 4: Emails rejected by Gmail

**Symptoms**:
- Cloudflare shows "Delivered"
- Gmail bounces email back

**Solutions**:
1. **Check Gmail storage**:
   - Gmail → Settings → Storage
   - Must have space available

2. **Check Gmail filters**:
   - Gmail → Settings → Filters and Blocked Addresses
   - Ensure no filter blocking @glec.io

3. **Whitelist Cloudflare**:
   - Gmail → Settings → Filters
   - Create filter: From: *@glec.io → Never send to Spam

---

## 📚 DNS Commands for Verification

### Check MX Records
```bash
# Using nslookup (Windows/Mac/Linux)
nslookup -type=MX glec.io 8.8.8.8

# Expected output:
# glec.io    MX preference = 86, mail exchanger = route1.mx.cloudflare.net
# glec.io    MX preference = 46, mail exchanger = route2.mx.cloudflare.net
# glec.io    MX preference = 13, mail exchanger = route3.mx.cloudflare.net
```

### Check SPF Record
```bash
# Using nslookup
nslookup -type=TXT glec.io 8.8.8.8

# Expected output:
# glec.io    text = "v=spf1 include:_spf.mx.cloudflare.net ~all"
```

### Test Email Delivery
```bash
# Using telnet (advanced)
telnet route1.mx.cloudflare.net 25

EHLO test.com
MAIL FROM: <test@example.com>
RCPT TO: <admin@glec.io>
DATA
Subject: Test email
Testing email routing
.
QUIT
```

---

## 🔗 External Resources

### Cloudflare Documentation
- **Email Routing Overview**: https://developers.cloudflare.com/email-routing/
- **Setup Guide**: https://developers.cloudflare.com/email-routing/get-started/
- **Troubleshooting**: https://developers.cloudflare.com/email-routing/troubleshooting/

### DNS Tools
- **MX Toolbox**: https://mxtoolbox.com/SuperTool.aspx?action=mx%3aglec.io
- **DNS Checker**: https://dnschecker.org/#MX/glec.io
- **What's My DNS**: https://www.whatsmydns.net/#MX/glec.io

### Gmail Settings
- **Gmail Filters**: https://mail.google.com/mail/u/0/#settings/filters
- **Gmail Storage**: https://one.google.com/storage

---

## 📊 Expected Timeline

### Total Setup Time: 20-30 minutes

**Phase 1**: Enable Email Routing (5 min)
- Click "Enable" in Cloudflare Dashboard
- DNS records automatically added

**Phase 2**: Verify Destination (5 min)
- Add oillex.co.kr@gmail.com
- Wait for verification email
- Click verification link

**Phase 3**: Create Routing Rules (5 min)
- Add admin@glec.io rule
- Add contact@glec.io rule
- Configure catch-all (Drop)

**Phase 4**: DNS Propagation (5-15 min)
- Wait for DNS records to propagate globally
- Can take 5-30 minutes

**Phase 5**: Testing (5 min)
- Send test emails
- Verify receipt
- Check logs

---

## ✅ Success Criteria

### Must Have
- [⏳] DNS records added (MX, SPF)
- [⏳] Destination address verified
- [⏳] admin@glec.io routing rule active
- [⏳] contact@glec.io routing rule active
- [⏳] Test emails forwarded successfully

### Verification Tests
```
Test 1: admin@glec.io → oillex.co.kr@gmail.com ⏳
Test 2: contact@glec.io → oillex.co.kr@gmail.com ⏳
```

### Post-Setup
- [ ] Update GLEC_OFFICIAL_EMAIL_ACCOUNTS.md
- [ ] Document DNS records
- [ ] Add to environment setup guide

---

## 🔄 Next Steps After Setup

### 1. Update Documentation
- Mark admin@glec.io as "Forwarded" ✅
- Mark contact@glec.io as "Forwarded" ✅
- Update email flow diagrams

### 2. Update Contact Form
- Change recipient to `process.env.ADMIN_EMAIL`
- Test contact form submission
- Verify email received at oillex.co.kr@gmail.com

### 3. Monitor for 24 Hours
- Check Cloudflare activity logs
- Verify all forwarded emails arrive
- No bounces or delivery failures

---

**Status**: 📋 Setup guide ready
**Action Required**: User must complete Cloudflare Dashboard setup
**Estimated Time**: 20-30 minutes
**Priority**: P0 (Critical - Contact Form blocked)
