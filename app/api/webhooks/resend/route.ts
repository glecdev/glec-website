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
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

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
    // 1. Parse webhook payload
    const event: ResendWebhookEvent = await req.json();

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
  } catch (error) {
    console.error('[Resend Webhook] Error handling bounced email:', error);
  }
}

async function handleEmailComplained(email: string): Promise<void> {
  try {
    console.warn(`[Resend Webhook] Spam complaint: ${email}`);

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
    let score = 0;

    // 1. Source Type (30점)
    score += 30;

    // 2. Library Item Value (20점)
    if (lead.category === 'FRAMEWORK') score += 20;
    else if (lead.category === 'WHITEPAPER') score += 15;
    else if (lead.category === 'CASE_STUDY') score += 10;
    else score += 5;

    // 3. Email Engagement (30점)
    if (lead.email_opened) score += 10;
    if (lead.download_link_clicked) score += 20;

    // 4. Company Size (20점)
    const domain = lead.email.split('@')[1];
    score += inferCompanySizeScore(domain);

    // 5. Marketing Consent (10점)
    if (lead.marketing_consent) score += 10;

    // 6. Phone Provided (10점)
    if (lead.phone) score += 10;

    // 7. UTM Tracking (10점)
    if (lead.utm_source || lead.utm_medium || lead.utm_campaign) score += 10;

    // 8. Time Factor - deduct 10 points if no action within 30 days
    const daysSinceCreated =
      (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated > 30 && !lead.email_opened) score -= 10;

    // Clamp to 0-100
    score = Math.max(0, Math.min(100, score));

    // Update lead_score
    await sql`
      UPDATE library_leads
      SET lead_score = ${score}, updated_at = NOW()
      WHERE id = ${leadId}
    `;

    console.log(`[Resend Webhook] Lead score updated: ${leadId} → ${score}`);
  } catch (error) {
    console.error('[Resend Webhook] Error recalculating lead score:', error);
  }
}

function inferCompanySizeScore(domain: string): number {
  const largeCorporations = [
    'samsung.com',
    'lg.com',
    'sk.com',
    'hyundai.com',
    'posco.com',
    'hanwha.com',
    'lotte.com',
    'gs.com',
  ];
  if (largeCorporations.some((corp) => domain.includes(corp))) return 20;

  const logisticsCompanies = [
    'dhl.com',
    'fedex.com',
    'ups.com',
    'cjlogistics.com',
    'hanjin.com',
    'kmlogis.com',
  ];
  if (logisticsCompanies.some((log) => domain.includes(log))) return 18;

  const genericDomains = ['gmail.com', 'naver.com', 'daum.net', 'hotmail.com', 'outlook.com'];
  if (genericDomains.includes(domain)) return 0;

  return 10;
}
