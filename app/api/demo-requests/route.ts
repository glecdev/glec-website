/**
 * Public Demo Request API
 * POST /api/demo-requests - Create demo request
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import {
  getDemoConfirmationSubject,
  getDemoConfirmationHtmlBody,
  getDemoConfirmationPlainTextBody,
} from '@/lib/email-templates/demo-confirmation';
import {
  getDemoAdminNotificationSubject,
  getDemoAdminNotificationHtmlBody,
  getDemoAdminNotificationPlainTextBody,
} from '@/lib/email-templates/demo-admin-notification';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const DemoRequestSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']),
  productInterests: z.array(z.string()).min(1),
  useCase: z.string().min(10),
  currentSolution: z.string().optional(),
  monthlyShipments: z.enum(['<100', '100-1000', '1000-10000', '10000+']),
  preferredDate: z.string(),
  preferredTime: z.string(),
  additionalMessage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = DemoRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validated.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const data = validated.data;
    const now = new Date();

    // Generate UUID for id
    const demoRequestId = crypto.randomUUID();

    const result = await sql`
      INSERT INTO demo_requests (
        id,
        company_name, contact_name, email, phone, company_size,
        product_interests, use_case, current_solution, monthly_shipments,
        preferred_date, preferred_time, additional_message,
        status, privacy_consent, created_at, updated_at
      )
      VALUES (
        ${demoRequestId},
        ${data.companyName}, ${data.contactName}, ${data.email}, ${data.phone},
        ${data.companySize}, ${data.productInterests}, ${data.useCase},
        ${data.currentSolution || null}, ${data.monthlyShipments},
        ${data.preferredDate}, ${data.preferredTime}, ${data.additionalMessage || null},
        'NEW', TRUE, NOW(), NOW()
      )
      RETURNING id, company_name, contact_name, email, status, created_at
    `;

    const created = result[0];

    console.log('[POST /api/demo-requests] Created:', {
      id: created.id,
      email: created.email,
      company: created.company_name,
    });

    // ============================================================
    // AUTOMATION 1: Send Confirmation Email to Customer
    // ============================================================
    try {
      const confirmationEmail = await resend.emails.send({
        from: 'GLEC <noreply@no-reply.glec.io>',
        to: data.email,
        subject: getDemoConfirmationSubject(),
        html: getDemoConfirmationHtmlBody({
          contact_name: data.contactName,
          company_name: data.companyName,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          demo_request_id: demoRequestId,
          product_interests: data.productInterests,
        }),
        text: getDemoConfirmationPlainTextBody({
          contact_name: data.contactName,
          company_name: data.companyName,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          demo_request_id: demoRequestId,
          product_interests: data.productInterests,
        }),
      });

      if (confirmationEmail.error) {
        console.error('[POST /api/demo-requests] Confirmation email failed:', confirmationEmail.error);
      } else {
        console.log('[POST /api/demo-requests] Confirmation email sent:', confirmationEmail.data?.id);
      }
    } catch (error) {
      console.error('[POST /api/demo-requests] Confirmation email error:', error);
      // Don't fail the request if email fails
    }

    // ============================================================
    // AUTOMATION 2: Send Admin Notification Email
    // ============================================================
    try {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@glec.io';

      const adminNotification = await resend.emails.send({
        from: 'GLEC Admin <noreply@no-reply.glec.io>',
        to: adminEmail,
        subject: getDemoAdminNotificationSubject(data.companyName),
        html: getDemoAdminNotificationHtmlBody({
          demo_request_id: demoRequestId,
          company_name: data.companyName,
          contact_name: data.contactName,
          email: data.email,
          phone: data.phone,
          company_size: data.companySize,
          product_interests: data.productInterests,
          use_case: data.useCase,
          current_solution: data.currentSolution,
          monthly_shipments: data.monthlyShipments,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          additional_message: data.additionalMessage,
          created_at: now.toISOString(),
        }),
        text: getDemoAdminNotificationPlainTextBody({
          demo_request_id: demoRequestId,
          company_name: data.companyName,
          contact_name: data.contactName,
          email: data.email,
          phone: data.phone,
          company_size: data.companySize,
          product_interests: data.productInterests,
          use_case: data.useCase,
          current_solution: data.currentSolution,
          monthly_shipments: data.monthlyShipments,
          preferred_date: data.preferredDate,
          preferred_time: data.preferredTime,
          additional_message: data.additionalMessage,
          created_at: now.toISOString(),
        }),
      });

      if (adminNotification.error) {
        console.error('[POST /api/demo-requests] Admin notification failed:', adminNotification.error);
      } else {
        console.log('[POST /api/demo-requests] Admin notification sent:', adminNotification.data?.id);
      }
    } catch (error) {
      console.error('[POST /api/demo-requests] Admin notification error:', error);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.id,
          companyName: created.company_name,
          contactName: created.contact_name,
          email: created.email,
          status: created.status,
          createdAt: created.created_at,
        },
        message: '데모 신청이 완료되었습니다. 확인 이메일을 발송했으니 확인해주세요.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/demo-requests] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
