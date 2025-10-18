/**
 * POST /api/webhooks/resend
 *
 * Resend Email Tracking Webhook
 *
 * Events:
 * - email.sent: Email successfully sent
 * - email.delivered: Email delivered to recipient
 * - email.delivery_delayed: Email delivery delayed
 * - email.opened: Recipient opened email
 * - email.clicked: Recipient clicked link in email
 * - email.bounced: Email bounced
 * - email.complained: Recipient marked as spam
 * - email.failed: Email sending failed
 *
 * Updates tables:
 * - contacts: admin_email_status, user_email_status
 * - library_leads: email_status, email_opened, download_link_clicked
 * - email_webhook_events: Audit log of all webhook events
 * - email_sends: Email automation tracking (NEW - Phase 5)
 * - email_metrics: Email automation aggregation (NEW - Phase 5)
 * - unified_leads: Bounced/complained tracking (NEW - Phase 5)
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { calculateLibraryLeadScore } from '@/lib/lead-scoring/calculate-score';
import { prisma } from '@/lib/prisma';

const sql = neon(process.env.DATABASE_URL!);

// ============================================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================================

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    // Handle trailing newlines, escaped newlines, and quotes from Vercel CLI
    const trimmedSecret = secret
      .trim()                    // Remove leading/trailing whitespace
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\\n$/, '');      // Remove escaped newline at end

    // Resend uses Svix for webhook signatures
    // Format: "v1,timestamp=XXXX,signatures=YYYY"
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const sigs = parts.filter(p => p.startsWith('v1='));

    if (!timestamp || sigs.length === 0) {
      console.error('[Resend Webhook] Invalid signature format');
      return false;
    }

    // Verify timestamp is recent (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const signatureTimestamp = parseInt(timestamp, 10);
    if (Math.abs(now - signatureTimestamp) > 300) {
      console.error('[Resend Webhook] Signature timestamp too old');
      return false;
    }

    // Create signed payload: timestamp.payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', trimmedSecret)
      .update(signedPayload)
      .digest('base64');

    // Check if any signature matches
    return sigs.some(sig => {
      const providedSig = sig.split('=')[1];
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(providedSig)
      );
    });
  } catch (error) {
    console.error('[Resend Webhook] Signature verification error:', error);
    return false;
  }
}

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    to: string | string[];
    from: string;
    subject: string;
    created_at: string;
    click?: {
      link: string;
      timestamp: string;
    };
  };
}

// Map Resend event types to email_delivery_status enum
const EVENT_STATUS_MAP: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'pending', // Keep as pending, will retry
  'email.complained': 'complained',
  'email.bounced': 'bounced',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.failed': 'failed',
};

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('svix-signature');

    // 2. Verify webhook signature (security)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (signature && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('[Resend Webhook] Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 3. Parse webhook payload
    const event: ResendWebhookEvent = JSON.parse(rawBody);

    console.log('[Resend Webhook] Received event:', event.type);
    console.log('[Resend Webhook] Email ID:', event.data.email_id);

    // 2. Store webhook event for audit trail
    await sql`
      INSERT INTO email_webhook_events (
        resend_email_id,
        event_type,
        payload,
        processed,
        created_at
      ) VALUES (
        ${event.data.email_id},
        ${event.type},
        ${JSON.stringify(event)},
        FALSE,
        NOW()
      )
    `;

    console.log('[Resend Webhook] Event stored in email_webhook_events');

    // 3. Update contacts/library_leads tables based on email_id
    const newStatus = EVENT_STATUS_MAP[event.type];

    if (newStatus) {
      // Update contacts table (admin email)
      const contactAdminUpdate = await sql`
        UPDATE contacts
        SET admin_email_status = ${newStatus}::email_delivery_status,
            admin_email_delivered_at = CASE
              WHEN ${newStatus} = 'delivered' THEN NOW()
              ELSE admin_email_delivered_at
            END
        WHERE resend_admin_email_id = ${event.data.email_id}
        RETURNING id
      `;

      if (contactAdminUpdate.length > 0) {
        console.log('[Resend Webhook] Updated contact admin email:', contactAdminUpdate[0].id, '→', newStatus);
      }

      // Update contacts table (user email)
      const contactUserUpdate = await sql`
        UPDATE contacts
        SET user_email_status = ${newStatus}::email_delivery_status,
            user_email_delivered_at = CASE
              WHEN ${newStatus} = 'delivered' THEN NOW()
              ELSE user_email_delivered_at
            END
        WHERE resend_user_email_id = ${event.data.email_id}
        RETURNING id
      `;

      if (contactUserUpdate.length > 0) {
        console.log('[Resend Webhook] Updated contact user email:', contactUserUpdate[0].id, '→', newStatus);
      }

      // Update library_leads table
      const libraryLeadUpdate = await sql`
        UPDATE library_leads
        SET email_status = ${newStatus}::email_delivery_status,
            email_delivered_at = CASE
              WHEN ${newStatus} = 'delivered' THEN NOW()
              ELSE email_delivered_at
            END
        WHERE resend_email_id = ${event.data.email_id}
        RETURNING id
      `;

      if (libraryLeadUpdate.length > 0) {
        console.log('[Resend Webhook] Updated library lead:', libraryLeadUpdate[0].id, '→', newStatus);
      }

      // Mark webhook event as processed
      await sql`
        UPDATE email_webhook_events
        SET processed = TRUE,
            processed_at = NOW()
        WHERE resend_email_id = ${event.data.email_id}
        AND event_type = ${event.type}
        AND processed = FALSE
      `;
    }

    // 4. Extract email address for legacy handlers
    const email = Array.isArray(event.data.to) ? event.data.to[0] : event.data.to;

    if (!email) {
      console.warn('[Resend Webhook] No email address in event');
      return NextResponse.json({ received: true });
    }

    // 5. Handle specific event types (for library_leads engagement tracking)
    switch (event.type) {
      case 'email.opened':
        await handleEmailOpened(email);
        break;

      case 'email.clicked':
        await handleEmailClicked(email, event.data.click?.link);
        break;

      case 'email.bounced':
        await handleEmailBounced(email);
        break;

      case 'email.complained':
        await handleEmailComplained(email);
        break;

      default:
        // Log but don't process other events
        console.log('[Resend Webhook] Unhandled event type:', event.type);
    }

    // 4. Return success
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Resend Webhook] Error processing webhook:', error);

    // Return 200 even on error to prevent Resend from retrying
    return NextResponse.json({ received: true, error: 'Processing failed' });
  }
}

// ============================================================
// EVENT HANDLERS
// ============================================================

async function handleEmailOpened(email: string): Promise<void> {
  try {
    // Update library_leads table
    const result = await sql`
      UPDATE library_leads
      SET
        email_opened = TRUE,
        email_opened_at = COALESCE(email_opened_at, NOW()),
        updated_at = NOW()
      WHERE email = ${email}
      AND email_sent = TRUE
      AND email_opened = FALSE
      RETURNING id
    `;

    if (result.length > 0) {
      console.log(`[Resend Webhook] Email opened tracked for lead: ${result[0].id}`);

      // Recalculate lead score (+10 points for email open)
      await recalculateLeadScore(result[0].id);
    } else {
      // Try newsletter_subscribers if not in library_leads
      await sql`
        UPDATE newsletter_subscribers
        SET updated_at = NOW()
        WHERE email = ${email}
      `;
    }

    // ========================================
    // Email Automation Integration (Phase 5)
    // ========================================
    await updateEmailAutomationTracking(email, 'opened');
  } catch (error) {
    console.error('[Resend Webhook] Error updating email_opened:', error);
  }
}

async function handleEmailClicked(email: string, link?: string): Promise<void> {
  try {
    // Update library_leads table
    const result = await sql`
      UPDATE library_leads
      SET
        download_link_clicked = TRUE,
        download_link_clicked_at = COALESCE(download_link_clicked_at, NOW()),
        updated_at = NOW()
      WHERE email = ${email}
      AND email_sent = TRUE
      AND download_link_clicked = FALSE
      RETURNING id
    `;

    if (result.length > 0) {
      console.log(`[Resend Webhook] Link clicked tracked for lead: ${result[0].id}, link: ${link}`);

      // Recalculate lead score (+20 points for link click)
      await recalculateLeadScore(result[0].id);
    }

    // ========================================
    // Email Automation Integration (Phase 5)
    // ========================================
    await updateEmailAutomationTracking(email, 'clicked');
  } catch (error) {
    console.error('[Resend Webhook] Error updating download_link_clicked:', error);
  }
}

async function handleEmailBounced(email: string): Promise<void> {
  try {
    console.warn(`[Resend Webhook] Email bounced: ${email}`);

    // Mark lead as low quality (lead_score = 0)
    await sql`
      UPDATE library_leads
      SET
        lead_score = 0,
        notes = COALESCE(notes || E'\n\n', '') || '[' || NOW()::TEXT || '] Email bounced',
        updated_at = NOW()
      WHERE email = ${email}
    `;

    // ========================================
    // Email Automation Integration (Phase 5)
    // ========================================
    await updateEmailAutomationBounced(email);
  } catch (error) {
    console.error('[Resend Webhook] Error handling bounced email:', error);
  }
}

async function handleEmailComplained(email: string): Promise<void> {
  try {
    console.warn(`[Resend Webhook] Spam complaint: ${email}`);

    // Add to email blacklist
    await sql`
      INSERT INTO email_blacklist (email, reason)
      VALUES (${email}, 'spam_complaint')
      ON CONFLICT (email) DO NOTHING
    `;

    // Mark lead as LOST and low quality
    await sql`
      UPDATE library_leads
      SET
        lead_status = 'LOST',
        lead_score = 0,
        notes = COALESCE(notes || E'\n\n', '') || '[' || NOW()::TEXT || '] Spam complaint',
        updated_at = NOW()
      WHERE email = ${email}
    `;

    // Also unsubscribe from newsletter if exists
    await sql`
      UPDATE newsletter_subscribers
      SET
        status = 'UNSUBSCRIBED',
        unsubscribed_at = NOW(),
        updated_at = NOW()
      WHERE email = ${email}
    `;

    // ========================================
    // Email Automation Integration (Phase 5)
    // ========================================
    await updateEmailAutomationComplained(email);
  } catch (error) {
    console.error('[Resend Webhook] Error handling spam complaint:', error);
  }
}

// ============================================================
// LEAD SCORING UPDATE
// ============================================================

async function recalculateLeadScore(leadId: string): Promise<void> {
  try {
    // Fetch lead with library item
    const leads = await sql`
      SELECT
        ll.*,
        li.category
      FROM library_leads ll
      LEFT JOIN library_items li ON ll.library_item_id = li.id
      WHERE ll.id = ${leadId}
      LIMIT 1
    `;

    if (leads.length === 0) return;

    const lead = leads[0];

    // Use centralized scoring function
    const result = calculateLibraryLeadScore({
      email: lead.email,
      phone: lead.phone,
      marketing_consent: lead.marketing_consent,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      email_opened: lead.email_opened,
      download_link_clicked: lead.download_link_clicked,
      created_at: lead.created_at,
      library_category: lead.category,
    });

    // Update lead_score
    await sql`
      UPDATE library_leads
      SET lead_score = ${result.score}, updated_at = NOW()
      WHERE id = ${leadId}
    `;

    console.log(`[Resend Webhook] Lead score updated: ${leadId} → ${result.score}`);
    console.log(`[Resend Webhook] Score breakdown:`, result.breakdown);
  } catch (error) {
    console.error('[Resend Webhook] Error recalculating lead score:', error);
  }
}

// ============================================================
// EMAIL AUTOMATION INTEGRATION (Phase 5)
// ============================================================

/**
 * Update email_sends table for opened/clicked events
 * Update email_metrics aggregation table
 */
async function updateEmailAutomationTracking(
  email: string,
  action: 'opened' | 'clicked'
): Promise<void> {
  try {
    // 1. Find lead in unified_leads
    const lead = await prisma.unifiedLead.findFirst({
      where: { email },
      select: { id: true },
    });

    if (!lead) {
      console.log(`[Email Automation] Lead not found in unified_leads: ${email}`);
      return;
    }

    // 2. Update email_sends table
    const updateData: any = {};
    if (action === 'opened') {
      updateData.openedAt = new Date();
    } else if (action === 'clicked') {
      updateData.clickedAt = new Date();
    }

    const updated = await prisma.emailSend.updateMany({
      where: {
        leadId: lead.id,
        openedAt: action === 'opened' ? null : undefined,
        clickedAt: action === 'clicked' ? null : undefined,
      },
      data: updateData,
    });

    if (updated.count > 0) {
      console.log(`[Email Automation] Updated ${updated.count} email_sends for ${email} (${action})`);

      // 3. Update email_metrics aggregation
      // Find template_id from the updated email_send
      const emailSend = await prisma.emailSend.findFirst({
        where: {
          leadId: lead.id,
          ...(action === 'opened' && { openedAt: { not: null } }),
          ...(action === 'clicked' && { clickedAt: { not: null } }),
        },
        orderBy: { sentAt: 'desc' },
        select: { templateId: true },
      });

      if (emailSend?.templateId) {
        await updateEmailMetrics(emailSend.templateId, action);
      }
    }
  } catch (error) {
    console.error(`[Email Automation] Error updating tracking for ${email}:`, error);
  }
}

/**
 * Update unified_leads table for bounced emails
 */
async function updateEmailAutomationBounced(email: string): Promise<void> {
  try {
    const updated = await prisma.unifiedLead.updateMany({
      where: { email },
      data: { emailBounced: true },
    });

    if (updated.count > 0) {
      console.log(`[Email Automation] Marked ${updated.count} unified_leads as bounced: ${email}`);
    }
  } catch (error) {
    console.error(`[Email Automation] Error updating bounced for ${email}:`, error);
  }
}

/**
 * Update unified_leads table for complained emails
 */
async function updateEmailAutomationComplained(email: string): Promise<void> {
  try {
    const updated = await prisma.unifiedLead.updateMany({
      where: { email },
      data: { emailComplained: true },
    });

    if (updated.count > 0) {
      console.log(`[Email Automation] Marked ${updated.count} unified_leads as complained: ${email}`);
    }
  } catch (error) {
    console.error(`[Email Automation] Error updating complained for ${email}:`, error);
  }
}

/**
 * Update email_metrics aggregation table
 */
async function updateEmailMetrics(
  templateId: string,
  action: 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted'
): Promise<void> {
  try {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hourKey = now.getHours();

    // Find or create metric record for this template/date/hour
    const existingMetric = await prisma.emailMetric.findFirst({
      where: {
        templateId,
        date: new Date(dateKey),
        hour: hourKey,
      },
    });

    if (existingMetric) {
      // Update existing metric
      const updateData: any = {};
      switch (action) {
        case 'sent':
          updateData.sentCount = existingMetric.sentCount + 1;
          break;
        case 'delivered':
          updateData.deliveredCount = existingMetric.deliveredCount + 1;
          break;
        case 'opened':
          updateData.openedCount = existingMetric.openedCount + 1;
          break;
        case 'clicked':
          updateData.clickedCount = existingMetric.clickedCount + 1;
          break;
        case 'converted':
          updateData.convertedCount = existingMetric.convertedCount + 1;
          break;
      }

      await prisma.emailMetric.update({
        where: { id: existingMetric.id },
        data: updateData,
      });

      console.log(`[Email Automation] Updated email_metrics: template=${templateId}, action=${action}`);
    } else {
      // Create new metric record
      await prisma.emailMetric.create({
        data: {
          templateId,
          date: new Date(dateKey),
          hour: hourKey,
          sentCount: action === 'sent' ? 1 : 0,
          deliveredCount: action === 'delivered' ? 1 : 0,
          openedCount: action === 'opened' ? 1 : 0,
          clickedCount: action === 'clicked' ? 1 : 0,
          convertedCount: action === 'converted' ? 1 : 0,
          bouncedCount: 0,
          complainedCount: 0,
        },
      });

      console.log(`[Email Automation] Created email_metrics: template=${templateId}, action=${action}`);
    }
  } catch (error) {
    console.error(`[Email Automation] Error updating email_metrics:`, error);
  }
}
