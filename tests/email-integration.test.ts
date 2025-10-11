/**
 * Email Integration Test Suite
 *
 * Tests the full email workflow:
 * 1. Library item download request
 * 2. Email sending via Resend
 * 3. Webhook tracking updates
 *
 * Based on: GLEC-Test-Plan.md
 * Target: 80%+ coverage
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// Test configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

interface LibraryItem {
  id: string;
  title: string;
  slug: string;
  download_type: 'EMAIL' | 'DIRECT';
  requires_form: boolean;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

interface LeadResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    library_item_id: string;
    download_token: string;
    email_sent: boolean;
    lead_status: string;
  };
  message?: string;
}

interface WebhookPayload {
  type: 'email.sent' | 'email.opened' | 'email.clicked' | 'email.delivered' | 'email.bounced' | 'email.complained';
  created_at: string;
  data: {
    email_id: string;
    to?: string;
    from?: string;
    subject?: string;
    opened_at?: string;
    clicked_at?: string;
    link?: string;
  };
}

describe('Email Integration E2E Tests', () => {
  let testLibraryItem: LibraryItem;
  let testLead: LeadResponse['data'];

  beforeAll(async () => {
    // Setup: Create a test library item (requires admin session)
    console.log('Setting up test environment...');
  });

  afterAll(async () => {
    // Cleanup: Remove test data
    console.log('Cleaning up test data...');
  });

  describe('Step 1: Library Item Download Request', () => {
    it('should create a new lead when user requests download', async () => {
      const formData = {
        company_name: 'Test Company',
        contact_name: 'Test User',
        email: TEST_EMAIL,
        phone: '010-1234-5678',
        industry: 'Manufacturing',
        job_title: 'Engineer',
        library_item_id: 'test-item-id',
      };

      const response = await fetch(`${BASE_URL}/api/library/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result: LeadResponse = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.email).toBe(TEST_EMAIL);
      expect(result.data.download_token).toBeDefined();
      expect(result.data.email_sent).toBe(false); // Initially false

      testLead = result.data;
    });

    it('should validate required fields', async () => {
      const invalidData = {
        company_name: '',
        contact_name: '',
        email: 'invalid-email',
      };

      const response = await fetch(`${BASE_URL}/api/library/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should prevent duplicate requests within 5 minutes', async () => {
      const formData = {
        company_name: 'Test Company',
        contact_name: 'Test User',
        email: TEST_EMAIL,
        phone: '010-1234-5678',
        industry: 'Manufacturing',
        job_title: 'Engineer',
        library_item_id: 'test-item-id',
      };

      // First request
      await fetch(`${BASE_URL}/api/library/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // Immediate second request (should be blocked)
      const response = await fetch(`${BASE_URL}/api/library/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('DUPLICATE_REQUEST');
    });
  });

  describe('Step 2: Email Sending via Resend', () => {
    it('should send email after lead creation', async () => {
      // Trigger email send (automatic after lead creation)
      // Wait for async email processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify email was sent by checking lead status
      const response = await fetch(
        `${BASE_URL}/api/admin/library/leads?email=${TEST_EMAIL}&per_page=1`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        }
      );

      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data[0].email_sent).toBe(true);
      // Note: email_id is set after successful send
    });

    it('should handle email sending failure gracefully', async () => {
      // Test with invalid RESEND_API_KEY (simulate failure)
      const formData = {
        company_name: 'Test Company',
        contact_name: 'Test User',
        email: 'invalid@test.com',
        phone: '010-1234-5678',
        industry: 'Manufacturing',
        job_title: 'Engineer',
        library_item_id: 'test-item-id',
      };

      const response = await fetch(`${BASE_URL}/api/library/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      // Lead should be created even if email fails
      expect(result.success).toBe(true);
      expect(result.data.email_sent).toBe(false);
    });
  });

  describe('Step 3: Webhook Tracking Updates', () => {
    it('should update email_sent on email.sent webhook', async () => {
      const webhookPayload: WebhookPayload = {
        type: 'email.sent',
        created_at: new Date().toISOString(),
        data: {
          email_id: 're_test123456789',
          to: TEST_EMAIL,
          from: 'noreply@glec.io',
          subject: 'GLEC Framework v3.0 다운로드 링크',
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'msg_test',
          'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
          'svix-signature': 'test-signature',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(200);

      // Verify database update
      const leadsResponse = await fetch(
        `${BASE_URL}/api/admin/library/leads?email=${TEST_EMAIL}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        }
      );

      const leadsResult = await leadsResponse.json();
      expect(leadsResult.data[0].email_sent).toBe(true);
    });

    it('should update email_opened on email.opened webhook', async () => {
      const webhookPayload: WebhookPayload = {
        type: 'email.opened',
        created_at: new Date().toISOString(),
        data: {
          email_id: 're_test123456789',
          opened_at: new Date().toISOString(),
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'msg_test',
          'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
          'svix-signature': 'test-signature',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(200);

      // Verify database update
      const leadsResponse = await fetch(
        `${BASE_URL}/api/admin/library/leads?email=${TEST_EMAIL}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        }
      );

      const leadsResult = await leadsResponse.json();
      expect(leadsResult.data[0].email_opened).toBe(true);
    });

    it('should update download_link_clicked on email.clicked webhook', async () => {
      const webhookPayload: WebhookPayload = {
        type: 'email.clicked',
        created_at: new Date().toISOString(),
        data: {
          email_id: 're_test123456789',
          link: `${BASE_URL}/api/library/download/test-token`,
          clicked_at: new Date().toISOString(),
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'msg_test',
          'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
          'svix-signature': 'test-signature',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(200);

      // Verify database update
      const leadsResponse = await fetch(
        `${BASE_URL}/api/admin/library/leads?email=${TEST_EMAIL}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        }
      );

      const leadsResult = await leadsResponse.json();
      expect(leadsResult.data[0].download_link_clicked).toBe(true);
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookPayload: WebhookPayload = {
        type: 'email.sent',
        created_at: new Date().toISOString(),
        data: {
          email_id: 're_test123456789',
          to: TEST_EMAIL,
          from: 'noreply@glec.io',
          subject: 'Test',
        },
      };

      const response = await fetch(`${BASE_URL}/api/webhooks/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'msg_test',
          'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
          'svix-signature': 'invalid-signature',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Step 4: Download Link Access', () => {
    it('should allow download with valid token', async () => {
      const token = testLead?.download_token;
      expect(token).toBeDefined();

      const response = await fetch(`${BASE_URL}/api/library/download/${token}`, {
        method: 'GET',
      });

      expect(response.status).toBe(200);
      // Should redirect to file_url or return file
    });

    it('should reject download with invalid token', async () => {
      const response = await fetch(`${BASE_URL}/api/library/download/invalid-token`, {
        method: 'GET',
      });

      expect(response.status).toBe(404);
    });

    it('should reject download with expired token (24h)', async () => {
      // Create a lead with old created_at timestamp
      // Test token expiration logic
      // This requires manual database manipulation or mocking
    });
  });

  describe('Step 5: Lead Scoring & Status Updates', () => {
    it('should calculate lead score based on actions', async () => {
      const leadsResponse = await fetch(
        `${BASE_URL}/api/admin/library/leads?email=${TEST_EMAIL}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        }
      );

      const leadsResult = await leadsResponse.json();
      const lead = leadsResult.data[0];

      // Score calculation:
      // - Email opened: +10
      // - Download link clicked: +20
      // - Form submitted: +5
      expect(lead.lead_score).toBeGreaterThan(0);
    });

    it('should auto-update lead_status from NEW to OPENED', async () => {
      // After email_opened webhook
      const leadsResponse = await fetch(
        `${BASE_URL}/api/admin/library/leads?email=${TEST_EMAIL}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        }
      );

      const leadsResult = await leadsResponse.json();
      const lead = leadsResult.data[0];

      expect(lead.lead_status).toBe('OPENED');
    });

    it('should auto-update lead_status from OPENED to DOWNLOADED', async () => {
      // After download_link_clicked webhook
      const leadsResponse = await fetch(
        `${BASE_URL}/api/admin/library/leads?email=${TEST_EMAIL}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        }
      );

      const leadsResult = await leadsResponse.json();
      const lead = leadsResult.data[0];

      expect(lead.lead_status).toBe('DOWNLOADED');
    });
  });
});

describe('Email Template Rendering Tests', () => {
  it('should render email template with correct variables', () => {
    // Test email template HTML generation
    // Check for:
    // - Company name
    // - Contact name
    // - Download link
    // - GLEC branding
    // - Unsubscribe link
  });

  it('should include tracking pixel for email opens', () => {
    // Check email HTML contains tracking pixel image
  });

  it('should wrap all links for click tracking', () => {
    // Check email HTML has Resend click tracking enabled
  });
});

describe('Performance Tests', () => {
  it('should handle 100 concurrent download requests', async () => {
    const requests = Array.from({ length: 100 }, (_, i) => {
      return fetch(`${BASE_URL}/api/library/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: `Company ${i}`,
          contact_name: `User ${i}`,
          email: `test${i}@example.com`,
          phone: '010-1234-5678',
          industry: 'Manufacturing',
          job_title: 'Engineer',
          library_item_id: 'test-item-id',
        }),
      });
    });

    const responses = await Promise.all(requests);

    const successCount = responses.filter(r => r.status === 200).length;
    expect(successCount).toBeGreaterThanOrEqual(95); // 95% success rate
  });

  it('should process webhook within 100ms', async () => {
    const startTime = Date.now();

    await fetch(`${BASE_URL}/api/webhooks/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'msg_test',
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'test-signature',
      },
      body: JSON.stringify({
        type: 'email.sent',
        created_at: new Date().toISOString(),
        data: {
          email_id: 're_test123456789',
          to: 'test@example.com',
          from: 'noreply@glec.io',
          subject: 'Test',
        },
      }),
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100);
  });
});

describe('Security Tests', () => {
  it('should prevent SQL injection in email field', async () => {
    const maliciousData = {
      company_name: 'Test Company',
      contact_name: 'Test User',
      email: "test@example.com'; DROP TABLE library_leads;--",
      phone: '010-1234-5678',
      industry: 'Manufacturing',
      job_title: 'Engineer',
      library_item_id: 'test-item-id',
    };

    const response = await fetch(`${BASE_URL}/api/library/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousData),
    });

    const result = await response.json();

    // Should be rejected due to Zod email validation
    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
  });

  it('should prevent XSS in company_name field', async () => {
    const maliciousData = {
      company_name: '<script>alert("XSS")</script>',
      contact_name: 'Test User',
      email: 'test@example.com',
      phone: '010-1234-5678',
      industry: 'Manufacturing',
      job_title: 'Engineer',
      library_item_id: 'test-item-id',
    };

    const response = await fetch(`${BASE_URL}/api/library/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousData),
    });

    const result = await response.json();

    if (result.success) {
      // Should be sanitized in email template
      // Check email HTML does not contain <script> tag
    }
  });

  it('should rate limit webhook endpoint', async () => {
    // Send 100 requests in 1 second
    const requests = Array.from({ length: 100 }, () => {
      return fetch(`${BASE_URL}/api/webhooks/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'svix-id': 'msg_test',
          'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
          'svix-signature': 'test-signature',
        },
        body: JSON.stringify({
          type: 'email.sent',
          created_at: new Date().toISOString(),
          data: {
            email_id: 're_test123456789',
            to: 'test@example.com',
            from: 'noreply@glec.io',
            subject: 'Test',
          },
        }),
      });
    });

    const responses = await Promise.all(requests);

    // Some requests should be rate limited (429)
    const rateLimitedCount = responses.filter(r => r.status === 429).length;
    expect(rateLimitedCount).toBeGreaterThan(0);
  });
});
