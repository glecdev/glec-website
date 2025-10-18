/**
 * API Test Helpers
 *
 * Utilities for testing API endpoints
 */

// ============================================================
// CONFIGURATION
// ============================================================

export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
export const CRON_SECRET = process.env.CRON_SECRET || '';

// ============================================================
// CONTACT FORM API
// ============================================================

export interface ContactFormData {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  inquiry_details?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  marketing_consent?: boolean;
  privacy_consent: boolean;
}

export async function submitContactForm(data: ContactFormData): Promise<{
  success: boolean;
  data?: { lead_id: string };
  error?: string;
}> {
  const response = await fetch(`${BASE_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
}

// ============================================================
// LIBRARY DOWNLOAD API
// ============================================================

export interface LibraryDownloadData {
  library_item_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  marketing_consent?: boolean;
}

export async function submitLibraryDownload(data: LibraryDownloadData): Promise<{
  success: boolean;
  data?: { lead_id: string; download_url: string };
  error?: string;
}> {
  const response = await fetch(`${BASE_URL}/api/library/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return response.json();
}

// ============================================================
// CRON JOBS
// ============================================================

export async function triggerContactNurtureCron(): Promise<{
  success: boolean;
  data?: {
    day3: { sent: number; failed: number };
    day7: { sent: number; failed: number };
    day14: { sent: number; failed: number };
    day30: { sent: number; failed: number };
  };
  error?: string;
}> {
  const response = await fetch(
    `${BASE_URL}/api/cron/contact-nurture?cron_secret=${encodeURIComponent(CRON_SECRET)}`
  );

  return response.json();
}

export async function triggerLibraryNurtureCron(): Promise<{
  success: boolean;
  data?: {
    day3: { sent: number; failed: number };
    day7: { sent: number; failed: number };
    day14: { sent: number; failed: number };
    day30: { sent: number; failed: number };
  };
  error?: string;
}> {
  const response = await fetch(
    `${BASE_URL}/api/cron/library-nurture?cron_secret=${encodeURIComponent(CRON_SECRET)}`
  );

  return response.json();
}

// ============================================================
// HEALTH CHECK
// ============================================================

export async function healthCheck(): Promise<{
  status: string;
  timestamp: string;
  uptime: object;
  checks: {
    environment: { status: string; variables: object };
    database: { status: string; latency: number; error: string | null };
  };
}> {
  const response = await fetch(`${BASE_URL}/api/health`);
  return response.json();
}

// ============================================================
// UTILITIES
// ============================================================

export async function waitForApi(maxWaitMs: number = 30000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const health = await healthCheck();
      if (health.status === 'healthy') {
        return true;
      }
    } catch (error) {
      // API not ready yet
    }

    // Wait 1 second before trying again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}

export function generateTestEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

export function generateTestPhone(): string {
  const randomDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `010-${randomDigits.substring(0, 4)}-${randomDigits.substring(4, 8)}`;
}
