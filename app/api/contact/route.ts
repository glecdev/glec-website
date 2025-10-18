/**
 * POST /api/contact
 * Contact Form Submission API
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const contactFormSchema = z.object({
  company_name: z.string().min(1).max(255),
  contact_name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().optional(),
  inquiry_details: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  marketing_consent: z.boolean().default(true),
  privacy_consent: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactFormSchema.parse(body);

    // Insert contact lead
    const result = await sql`
      INSERT INTO contact_leads (
        company_name, contact_name, email, phone, inquiry_details,
        utm_source, utm_medium, utm_campaign,
        marketing_consent, privacy_consent,
        source, lead_score, lead_status
      ) VALUES (
        ${data.company_name}, ${data.contact_name}, ${data.email},
        ${data.phone || null}, ${data.inquiry_details || null},
        ${data.utm_source || null}, ${data.utm_medium || null}, ${data.utm_campaign || null},
        ${data.marketing_consent}, ${data.privacy_consent},
        'website_contact_form', 10, 'new'
      )
      RETURNING id, email, contact_name, company_name
    `;

    const lead = result[0];

    // Send confirmation email
    await resend.emails.send({
      from: 'GLEC <noreply@no-reply.glec.io>',
      to: lead.email,
      subject: '[GLEC] 문의 접수 완료',
      html: `<h1>안녕하세요 ${lead.contact_name}님</h1><p>${lead.company_name}에서 문의해 주셔서 감사합니다.</p>`,
      text: `안녕하세요 ${lead.contact_name}님, ${lead.company_name}에서 문의해 주셔서 감사합니다.`,
    });

    return NextResponse.json({ success: true, data: { lead_id: lead.id } });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
