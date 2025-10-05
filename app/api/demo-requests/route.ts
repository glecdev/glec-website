/**
 * Public Demo Request API
 * POST /api/demo-requests - Create demo request
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

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
        message: '데모 신청이 완료되었습니다. 담당자가 빠른 시일 내에 연락드리겠습니다.',
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
