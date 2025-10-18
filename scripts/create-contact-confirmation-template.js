#!/usr/bin/env node

/**
 * Create Contact Form Confirmation Email Template (Day 0 - Immediate Send)
 *
 * This is the instant confirmation email sent when user submits contact form
 */

const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createContactConfirmationTemplate() {
  console.log('📧 Creating Contact Form Confirmation Template...\n');

  try {
    // Get CONTACT_FORM category ID
    const categories = await sql`
      SELECT id FROM email_template_categories WHERE category_key = 'CONTACT_FORM'
    `;

    if (categories.length === 0) {
      console.log('❌ CONTACT_FORM category not found!');
      process.exit(1);
    }

    const categoryId = categories[0].id;
    console.log(`✅ Found CONTACT_FORM category: ${categoryId}`);

    // Check if Day 0 template already exists
    const existing = await sql`
      SELECT id FROM email_templates
      WHERE category_id = ${categoryId}
      AND nurture_day = 0
      AND template_key = 'CONTACT_FORM_CONFIRMATION_V1'
    `;

    if (existing.length > 0) {
      console.log('⚠️  Contact confirmation template already exists!');
      console.log(`   Template ID: ${existing[0].id}`);
      process.exit(0);
    }

    // Create Day 0 confirmation template
    const template = {
      category_key: 'CONTACT_FORM',
      nurture_day: 0, // Immediate send
      template_key: 'CONTACT_FORM_CONFIRMATION_V1',
      template_name: '문의 접수 확인 이메일 (즉시 발송)',
      subject_line: '[GLEC] {contact_name}님, 문의가 접수되었습니다',
      html_body: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GLEC - 문의 접수 확인</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">GLEC</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">글로벌 물류 탄소배출 측정 전문가</p>
  </div>

  <!-- Body -->
  <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">

    <!-- Greeting -->
    <h2 style="color: #0600f7; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
      안녕하세요 {contact_name}님 👋
    </h2>

    <!-- Main Message -->
    <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px;">
      <strong>{company_name}</strong>에서 보내주신 문의가 <strong>정상적으로 접수</strong>되었습니다.
    </p>

    <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px;">
      담당자가 확인 후 영업일 기준 <strong>24시간 이내</strong>에 연락드리겠습니다.
    </p>

    <!-- Info Box -->
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 0 0 24px 0; border-left: 4px solid #0600f7;">
      <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">📋 접수 내용</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">회사명</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{company_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">담당자</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{contact_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">이메일</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">연락처</td>
          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 500;">{phone}</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://glec-website.vercel.app"
         style="display: inline-block; background: #0600f7; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; transition: background 0.3s;">
        GLEC 웹사이트 방문하기
      </a>
    </div>

    <!-- Additional Info -->
    <div style="background: #eff6ff; padding: 16px; border-radius: 6px; margin: 24px 0 0 0;">
      <p style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
        💡 먼저 궁금하신 내용이 있으신가요?
      </p>
      <p style="margin: 0; color: #3b82f6; font-size: 13px;">
        자료실에서 ISO-14083 가이드북, 탄소배출 계산 사례 등을 무료로 다운로드하실 수 있습니다.
      </p>
      <a href="https://glec-website.vercel.app/knowledge/library"
         style="color: #0600f7; text-decoration: underline; font-size: 13px; font-weight: 500; display: inline-block; margin-top: 8px;">
        자료실 바로가기 →
      </a>
    </div>

  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 8px 0;">
      본 이메일은 발신 전용입니다. 답장은 처리되지 않습니다.
    </p>
    <p style="margin: 0 0 16px 0;">
      문의사항은 <a href="mailto:contact@glec.io" style="color: #0600f7; text-decoration: none;">contact@glec.io</a>로 연락 주세요.
    </p>
    <p style="margin: 0; color: #d1d5db;">
      © 2025 GLEC. All rights reserved.
    </p>
  </div>

</body>
</html>`,
      plain_text_body: `안녕하세요 {contact_name}님,

{company_name}에서 보내주신 문의가 정상적으로 접수되었습니다.

담당자가 확인 후 영업일 기준 24시간 이내에 연락드리겠습니다.

📋 접수 내용
- 회사명: {company_name}
- 담당자: {contact_name}
- 이메일: {email}
- 연락처: {phone}

💡 먼저 궁금하신 내용이 있으신가요?
자료실에서 ISO-14083 가이드북, 탄소배출 계산 사례 등을 무료로 다운로드하실 수 있습니다.
https://glec-website.vercel.app/knowledge/library

감사합니다.
GLEC 팀 드림

---
본 이메일은 발신 전용입니다.
문의사항: contact@glec.io
© 2025 GLEC. All rights reserved.`,
      available_variables: JSON.stringify([
        'contact_name',
        'company_name',
        'email',
        'phone',
        'inquiry_details',
      ]),
      is_active: true,
      is_default: true,
    };

    // Insert template
    const result = await sql`
      INSERT INTO email_templates (
        category_id,
        template_key,
        template_name,
        subject_line,
        html_body,
        plain_text_body,
        nurture_day,
        available_variables,
        is_active,
        is_default
      ) VALUES (
        ${categoryId},
        ${template.template_key},
        ${template.template_name},
        ${template.subject_line},
        ${template.html_body},
        ${template.plain_text_body},
        ${template.nurture_day},
        ${template.available_variables},
        ${template.is_active},
        ${template.is_default}
      )
      RETURNING id
    `;

    const templateId = result[0].id;

    console.log('\n✅ Contact confirmation template created successfully!');
    console.log(`   Template ID: ${templateId}`);
    console.log(`   Template Key: ${template.template_key}`);
    console.log(`   Nurture Day: ${template.nurture_day} (Immediate send)`);

    console.log('\n📊 Template Summary:');
    console.log(`   Subject: ${template.subject_line}`);
    console.log(`   Variables: ${template.available_variables}`);
    console.log(`   Is Active: ${template.is_active}`);
    console.log(`   Is Default: ${template.is_default}`);

    console.log('\n✅ Next step: Update /api/contact to use this template');
    console.log('   Import: getContactConfirmationEmail() from template-renderer');
  } catch (error) {
    console.error('❌ Error creating template:', error);
    process.exit(1);
  }
}

createContactConfirmationTemplate();
