/**
 * Send Meeting Proposal API
 * POST /api/admin/leads/send-meeting-proposal
 * 
 * Purpose: 어드민이 리드에게 미팅 제안 이메일 발송
 * Workflow:
 * 1. 리드 정보 조회 (contacts or library_leads)
 * 2. 가능한 미팅 슬롯 조회
 * 3. 보안 토큰 생성 및 저장
 * 4. 미팅 제안 이메일 발송
 * 5. 리드 활동 로그 기록
 */

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import { renderMeetingProposal, MeetingProposalData } from '@/lib/email-templates/meeting-proposal';
import { generateMeetingToken, getTokenExpiry, generateBookingUrl } from '@/lib/meeting-tokens';

const sql = neon(process.env.DATABASE_URL!);
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendMeetingProposalRequest {
  lead_type: 'CONTACT' | 'LIBRARY_LEAD' | 'EVENT_REGISTRATION';
  lead_id: string;
  meeting_purpose: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  token_expiry_days?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: SendMeetingProposalRequest = await req.json();
    
    // Validation
    if (!body.lead_type || !body.lead_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'lead_type and lead_id are required',
          },
        },
        { status: 400 }
      );
    }
    
    // 1. 리드 정보 조회
    let lead: any = null;
    let leadSource = '';
    let leadSourceDetail = '';
    
    if (body.lead_type === 'CONTACT') {
      const results = await sql`
        SELECT id, company_name, contact_name, email, phone, inquiry_type, lead_source, lead_source_detail
        FROM contacts
        WHERE id = ${body.lead_id}::UUID
        LIMIT 1
      `;
      
      if (results.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Contact not found',
            },
          },
          { status: 404 }
        );
      }
      
      lead = results[0];
      leadSource = lead.lead_source || 'CONTACT_FORM';
      leadSourceDetail = lead.lead_source_detail || `${lead.inquiry_type} 문의`;
    } else if (body.lead_type === 'LIBRARY_LEAD') {
      const results = await sql`
        SELECT ll.id, ll.company_name, ll.contact_name, ll.email, ll.phone, ll.source, li.title as library_title
        FROM library_leads ll
        LEFT JOIN library_items li ON ll.library_item_id = li.id
        WHERE ll.id = ${body.lead_id}
        LIMIT 1
      `;
      
      if (results.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Library lead not found',
            },
          },
          { status: 404 }
        );
      }
      
      lead = results[0];
      leadSource = 'LIBRARY_DOWNLOAD';
      leadSourceDetail = `${lead.library_title} 다운로드`;
    }
    
    if (!lead || !lead.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_LEAD',
            message: 'Lead has no email address',
          },
        },
        { status: 400 }
      );
    }
    
    // 2. 가능한 미팅 슬롯 조회 (향후 7일, 예약 가능)
    const futureSlots = await sql`
      SELECT COUNT(*) as count
      FROM meeting_slots
      WHERE is_available = TRUE
      AND start_time >= NOW()
      AND start_time <= NOW() + INTERVAL '7 days'
      AND current_bookings < max_bookings
    `;
    
    const proposedSlotCount = parseInt(futureSlots[0]?.count || '0');
    
    if (proposedSlotCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_SLOTS_AVAILABLE',
            message: 'No meeting slots available in the next 7 days',
          },
        },
        { status: 400 }
      );
    }
    
    // 3. 보안 토큰 생성
    const token = generateMeetingToken();
    const expiresAt = getTokenExpiry(body.token_expiry_days || 7);
    const bookingUrl = generateBookingUrl(token);
    
    // 토큰 저장
    await sql`
      INSERT INTO meeting_proposal_tokens (
        lead_type,
        lead_id,
        token,
        expires_at
      ) VALUES (
        ${body.lead_type},
        ${body.lead_id}::UUID,
        ${token},
        ${expiresAt.toISOString()}
      )
    `;
    
    // 4. 이메일 발송
    const emailData: MeetingProposalData = {
      contactName: lead.contact_name,
      companyName: lead.company_name,
      leadSource: leadSource,
      leadSourceDetail: leadSourceDetail,
      meetingPurpose: body.meeting_purpose || 'GLEC 제품 상세 상담 및 데모 시연',
      proposedSlotCount: proposedSlotCount,
      bookingUrl: bookingUrl,
      adminName: body.admin_name,
      adminEmail: body.admin_email,
      adminPhone: body.admin_phone,
      expiresAt: expiresAt.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
    
    const emailHtml = renderMeetingProposal(emailData);
    
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: lead.email,
      subject: `[GLEC] ${lead.company_name}님께 미팅 일정을 제안드립니다`,
      html: emailHtml,
    });
    
    if (emailResult.error) {
      console.error('[Send Meeting Proposal] Resend error:', emailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_SEND_FAILED',
            message: emailResult.error.message || 'Failed to send email',
          },
        },
        { status: 500 }
      );
    }
    
    // 5. 리드 활동 로그 기록
    await sql`
      INSERT INTO lead_activities (
        lead_type,
        lead_id,
        activity_type,
        activity_description,
        metadata
      ) VALUES (
        ${body.lead_type},
        ${body.lead_id}::UUID,
        'MEETING_PROPOSED',
        '미팅 일정 제안 이메일 발송',
        ${JSON.stringify({
          email_id: emailResult.data?.id,
          proposed_slots: proposedSlotCount,
          admin_name: body.admin_name,
          expires_at: expiresAt.toISOString(),
        })}
      )
    `;
    
    // 6. last_contacted_at 업데이트
    if (body.lead_type === 'CONTACT') {
      await sql`
        UPDATE contacts
        SET last_contacted_at = NOW()
        WHERE id = ${body.lead_id}::UUID
      `;
    } else if (body.lead_type === 'LIBRARY_LEAD') {
      await sql`
        UPDATE library_leads
        SET last_contacted_at = NOW()
        WHERE id = ${body.lead_id}
      `;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        token: token,
        booking_url: bookingUrl,
        expires_at: expiresAt.toISOString(),
        email_id: emailResult.data?.id,
        proposed_slots: proposedSlotCount,
      },
    });
  } catch (error: any) {
    console.error('[Send Meeting Proposal] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to send meeting proposal',
        },
      },
      { status: 500 }
    );
  }
}
