/**
 * GET /api/cron/email-automation
 *
 * Cron Job: Automated Email Campaign Engine
 *
 * Schedule: Hourly (0 * * * *)
 *
 * Purpose:
 * - Process automation rules from email_automation_rules table
 * - Evaluate trigger conditions (LEAD_CREATED, TIME_ELAPSED, EMAIL_OPENED, etc.)
 * - Check sending limits (max_sends_per_lead, max_sends_per_day, cooldown)
 * - Send personalized emails via Resend API
 * - Record sends in email_sends table
 * - Update email_metrics aggregation table
 *
 * Supported Triggers:
 * - LEAD_CREATED: Send when lead is first created
 * - TIME_ELAPSED: Send after N minutes from lead creation
 * - EMAIL_OPENED: Send when previous email was opened
 * - EMAIL_CLICKED: Send when link in email was clicked
 * - STATUS_CHANGED: Send when lead status changes (e.g., NEW → CONTACTED)
 *
 * Security:
 * - Requires cron_secret query parameter (set in .env)
 * - Only runs in production environment
 *
 * References:
 * - EMAIL-AUTOMATION-PHASE-1-COMPLETION.md (Database Schema)
 * - EMAIL-AUTOMATION-PHASE-2-COMPLETION.md (API Specification)
 * - UNIFIED-LEADS-EMAIL-AUTOMATION-SPEC.md (Business Logic)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY!);

// ============================================================
// TYPES
// ============================================================

interface TriggerEvaluationResult {
  shouldSend: boolean;
  reason: string;
}

interface SendLimitResult {
  canSend: boolean;
  reason: string;
}

interface ProcessingResult {
  rule_id: string;
  rule_name: string;
  leads_evaluated: number;
  emails_sent: number;
  emails_failed: number;
  errors: string[];
}

// ============================================================
// CRON JOB HANDLER
// ============================================================

export async function GET(req: NextRequest) {
  try {
    // ========================================
    // 1. Verify Cron Secret (Security)
    // ========================================
    const cronSecret = req.nextUrl.searchParams.get('cron_secret');
    const rawSecret = process.env.CRON_SECRET || '';
    const expectedSecret = rawSecret
      .trim()
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\\n$/, '');        // Remove escaped newline

    console.log('[Email Automation] Secret verification:', {
      received: cronSecret?.substring(0, 10) + '...',
      expected: expectedSecret.substring(0, 10) + '...',
      match: cronSecret === expectedSecret,
    });

    if (!expectedSecret) {
      console.error('[Email Automation] CRON_SECRET not configured');
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    if (cronSecret !== expectedSecret) {
      console.error('[Email Automation] Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Email Automation] Starting cron job...');

    const startTime = Date.now();
    const results: ProcessingResult[] = [];

    // ========================================
    // 2. Fetch Active Automation Rules
    // ========================================
    const activeRules = await prisma.automationRule.findMany({
      where: { isActive: true },
      include: {
        template: {
          select: {
            id: true,
            templateName: true,
            subject: true,
            htmlBody: true,
            textBody: true,
            variables: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        priority: 'asc', // Process high-priority rules first
      },
    });

    console.log(`[Email Automation] Found ${activeRules.length} active rules`);

    if (activeRules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active automation rules to process',
        results: [],
        timestamp: new Date().toISOString(),
      });
    }

    // ========================================
    // 3. Process Each Automation Rule
    // ========================================
    for (const rule of activeRules) {
      console.log(`[Email Automation] Processing rule: ${rule.ruleName} (ID: ${rule.id})`);

      const ruleResult: ProcessingResult = {
        rule_id: rule.id,
        rule_name: rule.ruleName,
        leads_evaluated: 0,
        emails_sent: 0,
        emails_failed: 0,
        errors: [],
      };

      try {
        // Skip if template is inactive
        if (!rule.template.isActive) {
          console.log(`[Email Automation] Skipping rule ${rule.ruleName}: template inactive`);
          ruleResult.errors.push('Template is inactive');
          results.push(ruleResult);
          continue;
        }

        // ========================================
        // 4. Find Eligible Leads
        // ========================================
        const eligibleLeads = await findEligibleLeads(rule);
        ruleResult.leads_evaluated = eligibleLeads.length;

        console.log(`[Email Automation] Found ${eligibleLeads.length} eligible leads for rule ${rule.ruleName}`);

        // ========================================
        // 5. Process Each Eligible Lead
        // ========================================
        for (const lead of eligibleLeads) {
          try {
            // Evaluate trigger condition
            const triggerResult = await evaluateTrigger(rule, lead);
            if (!triggerResult.shouldSend) {
              console.log(
                `[Email Automation] Skipping lead ${lead.email}: ${triggerResult.reason}`
              );
              continue;
            }

            // Check sending limits
            const limitResult = await checkSendingLimits(rule, lead);
            if (!limitResult.canSend) {
              console.log(
                `[Email Automation] Skipping lead ${lead.email}: ${limitResult.reason}`
              );
              continue;
            }

            // Render email template
            const emailContent = renderEmailTemplate(rule.template, lead);

            // Send email via Resend
            const { data, error } = await resend.emails.send({
              from: 'GLEC <noreply@no-reply.glec.io>',
              to: lead.email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
            });

            if (error) {
              console.error(
                `[Email Automation] Failed to send email to ${lead.email}:`,
                error
              );
              ruleResult.emails_failed++;
              ruleResult.errors.push(`${lead.email}: ${error.message}`);

              // Record failed send
              await recordEmailSend(
                rule.id,
                rule.template.id,
                lead.id,
                lead.email,
                null,
                'failed',
                error.message
              );
            } else {
              console.log(
                `[Email Automation] Email sent to ${lead.email} (Resend ID: ${data?.id})`
              );
              ruleResult.emails_sent++;

              // Record successful send
              await recordEmailSend(
                rule.id,
                rule.template.id,
                lead.id,
                lead.email,
                data?.id || null,
                'sent'
              );

              // Update email metrics (aggregation)
              await updateEmailMetrics(rule.template.id, 'sent');
            }
          } catch (leadError) {
            console.error(
              `[Email Automation] Error processing lead ${lead.email}:`,
              leadError
            );
            ruleResult.emails_failed++;
            ruleResult.errors.push(
              `${lead.email}: ${leadError instanceof Error ? leadError.message : 'Unknown error'}`
            );
          }
        }
      } catch (ruleError) {
        console.error(
          `[Email Automation] Error processing rule ${rule.ruleName}:`,
          ruleError
        );
        ruleResult.errors.push(
          ruleError instanceof Error ? ruleError.message : 'Unknown error'
        );
      }

      results.push(ruleResult);
    }

    // ========================================
    // 6. Return Results
    // ========================================
    const totalSent = results.reduce((sum, r) => sum + r.emails_sent, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.emails_failed, 0);
    const duration = Date.now() - startTime;

    console.log('[Email Automation] Cron job completed:', {
      rules_processed: results.length,
      total_sent: totalSent,
      total_failed: totalFailed,
      duration_ms: duration,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Email automation processed',
        summary: {
          rules_processed: results.length,
          total_sent: totalSent,
          total_failed: totalFailed,
          duration_ms: duration,
        },
        results,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Email Automation] Cron job error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// HELPER: Find Eligible Leads
// ============================================================

async function findEligibleLeads(rule: any): Promise<any[]> {
  const { leadSourceType, triggerType, triggerDelayMinutes } = rule;

  // Calculate cutoff time for trigger delay
  const cutoffTime = new Date();
  cutoffTime.setMinutes(cutoffTime.getMinutes() - triggerDelayMinutes);

  // Query different tables based on lead source type
  let leads: any[] = [];

  switch (leadSourceType) {
    case 'CONTACT_FORM':
      const contacts = await prisma.contact.findMany({
        where: {
          createdAt: triggerType === 'LEAD_CREATED' || triggerType === 'TIME_ELAPSED'
            ? { lte: cutoffTime }
            : undefined,
        },
        select: {
          id: true,
          email: true,
          contactName: true,
          companyName: true,
          status: true,
          createdAt: true,
          inquiryType: true,
          message: true,
        },
        take: 100,
      });

      // Transform to unified format
      leads = contacts.map(c => ({
        id: c.id,
        email: c.email,
        contact_name: c.contactName,
        company_name: c.companyName,
        lead_source_type: 'CONTACT_FORM',
        lead_status: c.status,
        created_at: c.createdAt,
        source_detail: JSON.stringify({ inquiry_type: c.inquiryType, message: c.message }),
      }));
      break;

    case 'DEMO_REQUEST':
      const demoRequests = await prisma.demoRequest.findMany({
        where: {
          createdAt: triggerType === 'LEAD_CREATED' || triggerType === 'TIME_ELAPSED'
            ? { lte: cutoffTime }
            : undefined,
        },
        select: {
          id: true,
          email: true,
          contactName: true,
          companyName: true,
          status: true,
          createdAt: true,
          productInterests: true,
          useCase: true,
        },
        take: 100,
      });

      leads = demoRequests.map(d => ({
        id: d.id,
        email: d.email,
        contact_name: d.contactName,
        company_name: d.companyName,
        lead_source_type: 'DEMO_REQUEST',
        lead_status: d.status,
        created_at: d.createdAt,
        source_detail: JSON.stringify({
          product_interests: d.productInterests,
          use_case: d.useCase
        }),
      }));
      break;

    case 'EVENT_REGISTRATION':
      const eventRegs = await prisma.eventRegistration.findMany({
        where: {
          createdAt: triggerType === 'LEAD_CREATED' || triggerType === 'TIME_ELAPSED'
            ? { lte: cutoffTime }
            : undefined,
        },
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          status: true,
          createdAt: true,
          eventId: true,
          message: true,
        },
        take: 100,
      });

      leads = eventRegs.map(e => ({
        id: e.id,
        email: e.email,
        contact_name: e.name,
        company_name: e.company || 'N/A',
        lead_source_type: 'EVENT_REGISTRATION',
        lead_status: e.status,
        created_at: e.createdAt,
        source_detail: JSON.stringify({ event_id: e.eventId, message: e.message }),
      }));
      break;

    case 'LIBRARY_LEAD':
      // Library leads require unified_leads table (not yet implemented)
      // For now, return empty array
      console.warn('[Email Automation] LIBRARY_LEAD source not yet supported (requires unified_leads table)');
      leads = [];
      break;

    default:
      console.error(`[Email Automation] Unknown lead source type: ${leadSourceType}`);
      leads = [];
  }

  return leads;
}

// ============================================================
// HELPER: Evaluate Trigger Condition
// ============================================================

async function evaluateTrigger(
  rule: any,
  lead: any
): Promise<TriggerEvaluationResult> {
  const { triggerType, triggerCondition } = rule;

  switch (triggerType) {
    case 'LEAD_CREATED':
      // Always send (already filtered by time in findEligibleLeads)
      return { shouldSend: true, reason: 'Lead created trigger met' };

    case 'TIME_ELAPSED':
      // Already filtered by time in findEligibleLeads
      return { shouldSend: true, reason: 'Time elapsed trigger met' };

    case 'EMAIL_OPENED':
      // Check if previous email was opened
      const openedEmail = await prisma.emailSend.findFirst({
        where: {
          leadId: lead.id,
          openedAt: { not: null },
        },
        orderBy: { sentAt: 'desc' },
      });

      if (!openedEmail) {
        return { shouldSend: false, reason: 'No previous email opened' };
      }

      return { shouldSend: true, reason: 'Previous email was opened' };

    case 'EMAIL_CLICKED':
      // Check if previous email was clicked
      const clickedEmail = await prisma.emailSend.findFirst({
        where: {
          leadId: lead.id,
          clickedAt: { not: null },
        },
        orderBy: { sentAt: 'desc' },
      });

      if (!clickedEmail) {
        return { shouldSend: false, reason: 'No previous email clicked' };
      }

      return { shouldSend: true, reason: 'Previous email was clicked' };

    case 'STATUS_CHANGED':
      // Check if lead status matches condition
      if (triggerCondition && triggerCondition.status) {
        if (lead.lead_status !== triggerCondition.status) {
          return {
            shouldSend: false,
            reason: `Status mismatch: ${lead.lead_status} !== ${triggerCondition.status}`,
          };
        }
      }

      return { shouldSend: true, reason: 'Status changed trigger met' };

    default:
      return { shouldSend: false, reason: `Unknown trigger type: ${triggerType}` };
  }
}

// ============================================================
// HELPER: Check Sending Limits
// ============================================================

async function checkSendingLimits(
  rule: any,
  lead: any
): Promise<SendLimitResult> {
  const { id: ruleId, maxSendsPerLead, maxSendsPerDay, cooldownMinutes } = rule;

  // 1. Check max_sends_per_lead
  const previousSends = await prisma.emailSend.findMany({
    where: {
      ruleId,
      leadId: lead.id,
      status: 'sent',
    },
  });

  if (previousSends.length >= maxSendsPerLead) {
    return {
      canSend: false,
      reason: `Max sends per lead reached (${previousSends.length}/${maxSendsPerLead})`,
    };
  }

  // 2. Check cooldown period
  if (previousSends.length > 0) {
    const lastSend = previousSends.reduce((latest, send) =>
      send.sentAt && (!latest.sentAt || send.sentAt > latest.sentAt) ? send : latest
    );

    if (lastSend.sentAt) {
      const cooldownEnd = new Date(lastSend.sentAt);
      cooldownEnd.setMinutes(cooldownEnd.getMinutes() + cooldownMinutes);

      if (new Date() < cooldownEnd) {
        const remainingMinutes = Math.ceil(
          (cooldownEnd.getTime() - Date.now()) / 60000
        );
        return {
          canSend: false,
          reason: `Cooldown period active (${remainingMinutes} minutes remaining)`,
        };
      }
    }
  }

  // 3. Check max_sends_per_day (across all leads for this rule)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sendsToday = await prisma.emailSend.count({
    where: {
      ruleId,
      status: 'sent',
      sentAt: {
        gte: today,
      },
    },
  });

  if (sendsToday >= maxSendsPerDay) {
    return {
      canSend: false,
      reason: `Max sends per day reached (${sendsToday}/${maxSendsPerDay})`,
    };
  }

  return { canSend: true, reason: 'All limits passed' };
}

// ============================================================
// HELPER: Render Email Template
// ============================================================

function renderEmailTemplate(
  template: any,
  lead: any
): { subject: string; html: string; text: string } {
  let { subject, htmlBody, textBody } = template;

  // Variable substitution
  const variables: Record<string, string> = {
    contact_name: lead.contact_name || 'Customer',
    company_name: lead.company_name || 'Your Company',
    email: lead.email,
    lead_status: lead.lead_status || 'NEW',
    created_date: new Date(lead.created_at).toLocaleDateString('ko-KR'),
    current_year: new Date().getFullYear().toString(),
  };

  // Add source-specific variables
  if (lead.source_detail) {
    try {
      const detail = typeof lead.source_detail === 'string'
        ? JSON.parse(lead.source_detail)
        : lead.source_detail;

      if (detail.library_item_title) {
        variables.library_item_title = detail.library_item_title;
      }
      if (detail.library_item_id) {
        variables.library_item_id = detail.library_item_id;
      }
      if (detail.message) {
        variables.message = detail.message;
      }
    } catch (error) {
      console.warn('[Email Automation] Failed to parse source_detail:', error);
    }
  }

  // Replace all variables in subject, html, text
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    htmlBody = htmlBody.replace(regex, value);
    textBody = textBody.replace(regex, value);
  }

  return {
    subject,
    html: htmlBody,
    text: textBody,
  };
}

// ============================================================
// HELPER: Record Email Send
// ============================================================

async function recordEmailSend(
  ruleId: string,
  templateId: string,
  leadId: string,
  email: string,
  resendEmailId: string | null,
  status: 'sent' | 'failed',
  errorMessage?: string
): Promise<void> {
  await prisma.emailSend.create({
    data: {
      ruleId,
      templateId,
      leadId,
      toEmail: email,
      resendEmailId,
      status,
      sentAt: status === 'sent' ? new Date() : null,
      failureReason: errorMessage || null,
    },
  });
}

// ============================================================
// HELPER: Update Email Metrics
// ============================================================

async function updateEmailMetrics(
  templateId: string,
  action: 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted'
): Promise<void> {
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
  }
}
