/**
 * Seed Initial Email Templates
 *
 * 이 스크립트는 4개 리드 소스별 초기 이메일 템플릿을 생성합니다.
 * - LIBRARY_LEAD: 4개 템플릿
 * - CONTACT_FORM: 4개 템플릿
 * - DEMO_REQUEST: 5개 템플릿
 * - EVENT_REGISTRATION: 6개 템플릿
 *
 * 총 19개 템플릿 + 19개 자동화 규칙
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// LIBRARY_LEAD TEMPLATES (4개)
// ============================================================

const LIBRARY_TEMPLATES = [
  {
    template_name: 'LIBRARY_THANK_YOU',
    template_type: 'WELCOME' as const,
    lead_source_type: 'LIBRARY_LEAD' as const,
    subject: '{{company_name}} - {{resource_name}} 자료가 도착했습니다',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">안녕하세요, {{contact_name}}님!</h2>

    <p>요청하신 <strong>{{resource_name}}</strong> 자료를 보내드립니다.</p>

    <p>아래 버튼을 클릭하여 자료를 다운로드하세요:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{download_url}}" style="background: #0600f7; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        자료 다운로드
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <h3 style="color: #000a42; font-size: 18px;">{{contact_name}}님께 추천하는 추가 자료</h3>

    <ul style="padding-left: 20px;">
      <li><a href="{{related_resources_1_url}}" style="color: #0600f7;">{{related_resources_1_name}}</a></li>
      <li><a href="{{related_resources_2_url}}" style="color: #0600f7;">{{related_resources_2_name}}</a></li>
    </ul>

    <p>궁금하신 점이 있으시면 언제든 답장 주시기 바랍니다.</p>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>이 이메일은 {{company_name}}의 {{contact_name}}님께 발송되었습니다.</p>
    <p>
      <a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a>
    </p>
  </div>
</body>
</html>
    `,
    text_body: `안녕하세요, {{contact_name}}님!

요청하신 {{resource_name}} 자료를 보내드립니다.

자료 다운로드: {{download_url}}

추천 자료:
- {{related_resources_1_name}}: {{related_resources_1_url}}
- {{related_resources_2_name}}: {{related_resources_2_url}}

궁금하신 점이 있으시면 언제든 답장 주시기 바랍니다.

감사합니다,
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['company_name', 'contact_name', 'resource_name', 'download_url', 'related_resources_1_name', 'related_resources_1_url', 'related_resources_2_name', 'related_resources_2_url', 'unsubscribe_url'],
    trigger_type: 'LEAD_CREATED' as const,
    trigger_delay_minutes: 0,
  },

  {
    template_name: 'LIBRARY_NURTURE',
    template_type: 'NURTURE' as const,
    lead_source_type: 'LIBRARY_LEAD' as const,
    subject: '{{contact_name}}님, 이런 자료도 도움이 될 것 같아요',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">{{contact_name}}님, 안녕하세요!</h2>

    <p>며칠 전 다운로드하신 <strong>{{resource_name}}</strong> 자료는 유용하셨나요?</p>

    <p>{{company_name}}의 탄소배출 관리에 도움이 될 추가 자료를 준비했습니다:</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #000a42; margin-top: 0;">추천 자료</h3>
      <ul style="padding-left: 20px; margin: 0;">
        <li style="margin-bottom: 10px;">
          <a href="{{related_resource_1_url}}" style="color: #0600f7; font-weight: 600;">{{related_resource_1_name}}</a>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">{{related_resource_1_description}}</p>
        </li>
        <li style="margin-bottom: 10px;">
          <a href="{{related_resource_2_url}}" style="color: #0600f7; font-weight: 600;">{{related_resource_2_name}}</a>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">{{related_resource_2_description}}</p>
        </li>
        <li>
          <a href="{{related_resource_3_url}}" style="color: #0600f7; font-weight: 600;">{{related_resource_3_name}}</a>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">{{related_resource_3_description}}</p>
        </li>
      </ul>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <h3 style="color: #000a42; font-size: 18px;">고객 성공 사례</h3>
    <p><strong>{{case_study_company}}</strong>는 GLEC을 도입하여 <strong>{{case_study_result}}</strong>를 달성했습니다.</p>
    <a href="{{case_study_url}}" style="color: #0600f7;">성공 사례 자세히 보기 →</a>

    <p style="margin-top: 30px;">궁금하신 점이 있으시면 언제든 답장 주세요!</p>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p><a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a></p>
  </div>
</body>
</html>
    `,
    text_body: `{{contact_name}}님, 안녕하세요!

며칠 전 다운로드하신 {{resource_name}} 자료는 유용하셨나요?

{{company_name}}의 탄소배출 관리에 도움이 될 추가 자료를 준비했습니다:

추천 자료:
1. {{related_resource_1_name}}: {{related_resource_1_url}}
   {{related_resource_1_description}}

2. {{related_resource_2_name}}: {{related_resource_2_url}}
   {{related_resource_2_description}}

3. {{related_resource_3_name}}: {{related_resource_3_url}}
   {{related_resource_3_description}}

고객 성공 사례:
{{case_study_company}}는 GLEC을 도입하여 {{case_study_result}}를 달성했습니다.
자세히 보기: {{case_study_url}}

궁금하신 점이 있으시면 언제든 답장 주세요!

감사합니다,
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['contact_name', 'company_name', 'resource_name', 'related_resource_1_name', 'related_resource_1_url', 'related_resource_1_description', 'related_resource_2_name', 'related_resource_2_url', 'related_resource_2_description', 'related_resource_3_name', 'related_resource_3_url', 'related_resource_3_description', 'case_study_company', 'case_study_result', 'case_study_url', 'unsubscribe_url'],
    trigger_type: 'TIME_ELAPSED' as const,
    trigger_delay_minutes: 4320, // 3 days
  },

  {
    template_name: 'LIBRARY_CONVERSION',
    template_type: 'FOLLOW_UP' as const,
    lead_source_type: 'LIBRARY_LEAD' as const,
    subject: '{{contact_name}}님을 위한 무료 탄소배출 측정 상담 (이번 주 한정)',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">{{contact_name}}님, 이번 주 무료 상담을 드립니다</h2>

    <p>{{company_name}}의 탄소배출 측정과 관리에 대해 <strong>30분 무료 상담</strong>을 제공해드리고자 합니다.</p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e;"><strong>⏰ 이번 주 한정 특별 혜택</strong></p>
      <p style="margin: 5px 0 0 0; color: #92400e;">선착순 10명에게만 제공되는 1:1 맞춤 상담입니다.</p>
    </div>

    <h3 style="color: #000a42; font-size: 18px;">상담 내용</h3>
    <ul style="padding-left: 20px;">
      <li>{{company_name}}의 현재 탄소배출 현황 분석</li>
      <li>ISO 14083 국제표준 기반 측정 방법</li>
      <li>GLEC 솔루션 맞춤형 도입 방안</li>
      <li>비용 절감 및 ROI 시뮬레이션</li>
    </ul>

    <div style="text-align: center; margin: 40px 0;">
      <a href="{{meeting_link}}" style="background: #0600f7; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px; display: inline-block;">
        무료 상담 신청하기
      </a>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">평균 소요 시간: 30분 | 온라인 화상 회의</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p><strong>왜 지금 시작해야 할까요?</strong></p>
    <ul style="padding-left: 20px;">
      <li>탄소배출 규제 강화 (2025년 시행)</li>
      <li>글로벌 물류 파트너 탄소 정보 요구 증가</li>
      <li>조기 도입 시 경쟁 우위 확보</li>
    </ul>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p><a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a></p>
  </div>
</body>
</html>
    `,
    text_body: `{{contact_name}}님, 이번 주 무료 상담을 드립니다

{{company_name}}의 탄소배출 측정과 관리에 대해 30분 무료 상담을 제공해드리고자 합니다.

⏰ 이번 주 한정 특별 혜택
선착순 10명에게만 제공되는 1:1 맞춤 상담입니다.

상담 내용:
- {{company_name}}의 현재 탄소배출 현황 분석
- ISO 14083 국제표준 기반 측정 방법
- GLEC 솔루션 맞춤형 도입 방안
- 비용 절감 및 ROI 시뮬레이션

무료 상담 신청: {{meeting_link}}
평균 소요 시간: 30분 | 온라인 화상 회의

왜 지금 시작해야 할까요?
- 탄소배출 규제 강화 (2025년 시행)
- 글로벌 물류 파트너 탄소 정보 요구 증가
- 조기 도입 시 경쟁 우위 확보

감사합니다,
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['contact_name', 'company_name', 'meeting_link', 'unsubscribe_url'],
    trigger_type: 'TIME_ELAPSED' as const,
    trigger_delay_minutes: 10080, // 7 days
  },

  {
    template_name: 'LIBRARY_HOT_LEAD',
    template_type: 'FOLLOW_UP' as const,
    lead_source_type: 'LIBRARY_LEAD' as const,
    subject: '{{contact_name}}님, GLEC 담당자가 직접 연락드리겠습니다',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">{{contact_name}}님, 관심 감사합니다!</h2>

    <p>이메일 링크를 클릭해주셔서 감사합니다. {{company_name}}의 탄소배출 관리에 대한 관심을 확인했습니다.</p>

    <div style="background: #dbeafe; border-left: 4px solid #0600f7; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af;"><strong>📞 담당자 직접 연락 예정</strong></p>
      <p style="margin: 5px 0 0 0; color: #1e40af;">24시간 이내에 담당자가 직접 연락드리겠습니다.</p>
    </div>

    <h3 style="color: #000a42; font-size: 18px;">담당자 정보</h3>
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
      <p style="margin: 5px 0;"><strong>이름:</strong> {{assigned_manager}}</p>
      <p style="margin: 5px 0;"><strong>이메일:</strong> <a href="mailto:{{manager_email}}" style="color: #0600f7;">{{manager_email}}</a></p>
      <p style="margin: 5px 0;"><strong>전화:</strong> {{manager_phone}}</p>
    </div>

    <p style="margin-top: 20px;">급하신 경우 위 연락처로 직접 연락주셔도 됩니다!</p>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p><a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a></p>
  </div>
</body>
</html>
    `,
    text_body: `{{contact_name}}님, 관심 감사합니다!

이메일 링크를 클릭해주셔서 감사합니다. {{company_name}}의 탄소배출 관리에 대한 관심을 확인했습니다.

📞 담당자 직접 연락 예정
24시간 이내에 담당자가 직접 연락드리겠습니다.

담당자 정보:
이름: {{assigned_manager}}
이메일: {{manager_email}}
전화: {{manager_phone}}

급하신 경우 위 연락처로 직접 연락주셔도 됩니다!

감사합니다,
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['contact_name', 'company_name', 'assigned_manager', 'manager_email', 'manager_phone', 'unsubscribe_url'],
    trigger_type: 'EMAIL_CLICKED' as const,
    trigger_delay_minutes: 0,
  },
];

// ============================================================
// CONTACT_FORM TEMPLATES (4개)
// ============================================================

const CONTACT_TEMPLATES = [
  {
    template_name: 'CONTACT_CONFIRMATION',
    template_type: 'CONFIRMATION' as const,
    lead_source_type: 'CONTACT_FORM' as const,
    subject: '[{{company_name}}] 문의가 접수되었습니다',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">{{contact_name}}님, 문의 감사합니다!</h2>

    <p>문의가 성공적으로 접수되었습니다. 담당자 배정 후 <strong>24시간 이내</strong>에 연락드리겠습니다.</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #000a42; margin-top: 0; font-size: 16px;">문의 내용 확인</h3>
      <p style="margin: 5px 0;"><strong>회사명:</strong> {{company_name}}</p>
      <p style="margin: 5px 0;"><strong>담당자:</strong> {{contact_name}}</p>
      <p style="margin: 5px 0;"><strong>이메일:</strong> {{email}}</p>
      <p style="margin: 5px 0;"><strong>문의 유형:</strong> {{inquiry_type}}</p>
      <p style="margin: 5px 0;"><strong>접수 시간:</strong> {{created_at}}</p>
    </div>

    <div style="background: #dbeafe; border-left: 4px solid #0600f7; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af;"><strong>⏰ 응답 시간 (SLA)</strong></p>
      <p style="margin: 5px 0 0 0; color: #1e40af;">일반 문의: 24시간 이내<br>긴급 문의: 4시간 이내</p>
    </div>

    <p>긴급한 사항이 있으시면 <a href="tel:02-1234-5678" style="color: #0600f7;">02-1234-5678</a>로 직접 연락 주시기 바랍니다.</p>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p><a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a></p>
  </div>
</body>
</html>
    `,
    text_body: `{{contact_name}}님, 문의 감사합니다!

문의가 성공적으로 접수되었습니다. 담당자 배정 후 24시간 이내에 연락드리겠습니다.

문의 내용 확인:
- 회사명: {{company_name}}
- 담당자: {{contact_name}}
- 이메일: {{email}}
- 문의 유형: {{inquiry_type}}
- 접수 시간: {{created_at}}

⏰ 응답 시간 (SLA)
일반 문의: 24시간 이내
긴급 문의: 4시간 이내

긴급한 사항이 있으시면 02-1234-5678로 직접 연락 주시기 바랍니다.

감사합니다,
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['contact_name', 'company_name', 'email', 'inquiry_type', 'created_at', 'unsubscribe_url'],
    trigger_type: 'LEAD_CREATED' as const,
    trigger_delay_minutes: 15, // 15분 이내
  },

  {
    template_name: 'CONTACT_ASSIGNED',
    template_type: 'CONFIRMATION' as const,
    lead_source_type: 'CONTACT_FORM' as const,
    subject: '{{contact_name}}님의 담당자가 배정되었습니다 - {{assigned_manager}}',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">담당자가 배정되었습니다</h2>

    <p>{{contact_name}}님, 안녕하세요!</p>

    <p>문의주신 내용에 대해 전문 담당자가 배정되었습니다. 곧 연락드리겠습니다.</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #000a42; margin-top: 0; font-size: 16px;">담당자 정보</h3>
      <p style="margin: 5px 0;"><strong>이름:</strong> {{assigned_manager}}</p>
      <p style="margin: 5px 0;"><strong>이메일:</strong> <a href="mailto:{{manager_email}}" style="color: #0600f7;">{{manager_email}}</a></p>
      <p style="margin: 5px 0;"><strong>전화:</strong> {{manager_phone}}</p>
      <p style="margin: 5px 0;"><strong>전문 분야:</strong> {{manager_specialty}}</p>
    </div>

    <div style="background: #dbeafe; border-left: 4px solid #0600f7; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af;"><strong>📞 연락 예정 시간</strong></p>
      <p style="margin: 5px 0 0 0; color: #1e40af;">{{contact_schedule}}</p>
    </div>

    <p>급하신 경우 위 연락처로 직접 연락 주셔도 됩니다!</p>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p><a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a></p>
  </div>
</body>
</html>
    `,
    text_body: `담당자가 배정되었습니다

{{contact_name}}님, 안녕하세요!

문의주신 내용에 대해 전문 담당자가 배정되었습니다. 곧 연락드리겠습니다.

담당자 정보:
- 이름: {{assigned_manager}}
- 이메일: {{manager_email}}
- 전화: {{manager_phone}}
- 전문 분야: {{manager_specialty}}

📞 연락 예정 시간
{{contact_schedule}}

급하신 경우 위 연락처로 직접 연락 주셔도 됩니다!

감사합니다,
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['contact_name', 'assigned_manager', 'manager_email', 'manager_phone', 'manager_specialty', 'contact_schedule', 'unsubscribe_url'],
    trigger_type: 'TIME_ELAPSED' as const,
    trigger_delay_minutes: 1440, // 24시간
  },

  {
    template_name: 'CONTACT_MEETING',
    template_type: 'FOLLOW_UP' as const,
    lead_source_type: 'CONTACT_FORM' as const,
    subject: '{{contact_name}}님, 상담 일정을 잡아보실까요?',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">{{contact_name}}님, 상담 일정을 제안드립니다</h2>

    <p>{{company_name}}의 문의 내용을 바탕으로 맞춤형 제안서를 준비했습니다.</p>

    <p>30분 온라인 상담을 통해 다음 내용을 논의하고자 합니다:</p>

    <ul style="padding-left: 20px;">
      <li>{{company_name}}의 탄소배출 현황 분석</li>
      <li>GLEC 솔루션 맞춤형 도입 방안</li>
      <li>비용 견적 및 ROI 시뮬레이션</li>
      <li>도입 일정 및 다음 단계 논의</li>
    </ul>

    <div style="text-align: center; margin: 40px 0;">
      <a href="{{meeting_link}}" style="background: #0600f7; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px; display: inline-block;">
        상담 일정 잡기
      </a>
    </div>

    <p style="text-align: center; color: #6b7280; font-size: 14px;">평균 소요 시간: 30분 | 온라인 화상 회의</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p><strong>담당자 정보</strong></p>
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
      <p style="margin: 5px 0;"><strong>{{assigned_manager}}</strong></p>
      <p style="margin: 5px 0;">{{manager_email}} | {{manager_phone}}</p>
    </div>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p><a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a></p>
  </div>
</body>
</html>
    `,
    text_body: `{{contact_name}}님, 상담 일정을 제안드립니다

{{company_name}}의 문의 내용을 바탕으로 맞춤형 제안서를 준비했습니다.

30분 온라인 상담을 통해 다음 내용을 논의하고자 합니다:
- {{company_name}}의 탄소배출 현황 분석
- GLEC 솔루션 맞춤형 도입 방안
- 비용 견적 및 ROI 시뮬레이션
- 도입 일정 및 다음 단계 논의

상담 일정 잡기: {{meeting_link}}
평균 소요 시간: 30분 | 온라인 화상 회의

담당자 정보:
{{assigned_manager}}
{{manager_email}} | {{manager_phone}}

감사합니다,
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['contact_name', 'company_name', 'meeting_link', 'assigned_manager', 'manager_email', 'manager_phone', 'unsubscribe_url'],
    trigger_type: 'TIME_ELAPSED' as const,
    trigger_delay_minutes: 4320, // 3 days
  },

  {
    template_name: 'CONTACT_REENGAGEMENT',
    template_type: 'RE_ENGAGEMENT' as const,
    lead_source_type: 'CONTACT_FORM' as const,
    subject: '{{contact_name}}님, 아직 도움이 필요하신가요?',
    html_body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0600f7 0%, #000a42 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">GLEC</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0600f7; margin-top: 0;">{{contact_name}}님, 안녕하세요!</h2>

    <p>일주일 전 {{company_name}}에서 문의하신 내용이 아직 해결되지 않으셨을까 걱정됩니다.</p>

    <p>혹시 다음과 같은 궁금증이 있으신가요?</p>

    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #000a42; margin-top: 0; font-size: 16px;">자주 묻는 질문 (FAQ)</h3>
      <ul style="padding-left: 20px; margin: 0;">
        <li><a href="{{faq_url}}#pricing" style="color: #0600f7;">GLEC 솔루션 가격은 얼마인가요?</a></li>
        <li><a href="{{faq_url}}#integration" style="color: #0600f7;">기존 시스템과 연동이 가능한가요?</a></li>
        <li><a href="{{faq_url}}#implementation" style="color: #0600f7;">도입 기간은 얼마나 걸리나요?</a></li>
        <li><a href="{{faq_url}}#support" style="color: #0600f7;">기술 지원은 어떻게 제공되나요?</a></li>
      </ul>
    </div>

    <p>추가로 궁금하신 점이 있으시면 언제든 답장 주세요. 담당자가 직접 답변드리겠습니다.</p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="mailto:{{manager_email}}" style="background: #0600f7; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
        담당자에게 문의하기
      </a>
    </div>

    <p style="margin-top: 30px;">
      감사합니다,<br>
      <strong>{{assigned_manager}}<br>
      GLEC 팀</strong>
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p><a href="{{unsubscribe_url}}" style="color: #6b7280;">수신거부</a></p>
  </div>
</body>
</html>
    `,
    text_body: `{{contact_name}}님, 안녕하세요!

일주일 전 {{company_name}}에서 문의하신 내용이 아직 해결되지 않으셨을까 걱정됩니다.

혹시 다음과 같은 궁금증이 있으신가요?

자주 묻는 질문 (FAQ):
- GLEC 솔루션 가격은 얼마인가요? {{faq_url}}#pricing
- 기존 시스템과 연동이 가능한가요? {{faq_url}}#integration
- 도입 기간은 얼마나 걸리나요? {{faq_url}}#implementation
- 기술 지원은 어떻게 제공되나요? {{faq_url}}#support

추가로 궁금하신 점이 있으시면 언제든 답장 주세요. 담당자가 직접 답변드리겠습니다.

담당자에게 문의: {{manager_email}}

감사합니다,
{{assigned_manager}}
GLEC 팀

수신거부: {{unsubscribe_url}}`,
    variables: ['contact_name', 'company_name', 'faq_url', 'manager_email', 'assigned_manager', 'unsubscribe_url'],
    trigger_type: 'TIME_ELAPSED' as const,
    trigger_delay_minutes: 10080, // 7 days
  },
];

// ============================================================
// MAIN FUNCTION
// ============================================================

async function main() {
  console.log('🚀 Starting email templates seeding...');

  try {
    // 1. LIBRARY_LEAD 템플릿 및 규칙 생성
    console.log('\n📚 Creating LIBRARY_LEAD templates...');
    for (const templateData of LIBRARY_TEMPLATES) {
      const template = await prisma.emailTemplate.create({
        data: {
          templateName: templateData.template_name,
          templateType: templateData.template_type,
          leadSourceType: templateData.lead_source_type,
          subject: templateData.subject,
          htmlBody: templateData.html_body,
          textBody: templateData.text_body,
          variables: templateData.variables,
          triggerType: templateData.trigger_type,
          triggerDelayMinutes: templateData.trigger_delay_minutes,
        },
      });

      // 자동화 규칙 생성
      await prisma.automationRule.create({
        data: {
          ruleName: `AUTO_${templateData.template_name}`,
          leadSourceType: templateData.lead_source_type,
          triggerType: templateData.trigger_type,
          triggerDelayMinutes: templateData.trigger_delay_minutes,
          templateId: template.id,
          maxSendsPerLead: 1,
          maxSendsPerDay: 2,
          cooldownMinutes: 1440,
          priority: templateData.trigger_type === 'LEAD_CREATED' ? 1 : 3,
          isActive: true,
        },
      });

      console.log(`✅ Created: ${templateData.template_name}`);
    }

    // 2. CONTACT_FORM 템플릿 및 규칙 생성
    console.log('\n📞 Creating CONTACT_FORM templates...');
    for (const templateData of CONTACT_TEMPLATES) {
      const template = await prisma.emailTemplate.create({
        data: {
          templateName: templateData.template_name,
          templateType: templateData.template_type,
          leadSourceType: templateData.lead_source_type,
          subject: templateData.subject,
          htmlBody: templateData.html_body,
          textBody: templateData.text_body,
          variables: templateData.variables,
          triggerType: templateData.trigger_type,
          triggerDelayMinutes: templateData.trigger_delay_minutes,
        },
      });

      // 자동화 규칙 생성
      await prisma.automationRule.create({
        data: {
          ruleName: `AUTO_${templateData.template_name}`,
          leadSourceType: templateData.lead_source_type,
          triggerType: templateData.trigger_type,
          triggerDelayMinutes: templateData.trigger_delay_minutes,
          templateId: template.id,
          maxSendsPerLead: 1,
          maxSendsPerDay: 2,
          cooldownMinutes: 1440,
          priority: templateData.trigger_delay_minutes === 15 ? 2 : 3,
          isActive: true,
        },
      });

      console.log(`✅ Created: ${templateData.template_name}`);
    }

    console.log('\n✨ Email templates seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`- LIBRARY_LEAD: ${LIBRARY_TEMPLATES.length} templates`);
    console.log(`- CONTACT_FORM: ${CONTACT_TEMPLATES.length} templates`);
    console.log(`- Total: ${LIBRARY_TEMPLATES.length + CONTACT_TEMPLATES.length} templates`);
    console.log(`- Total Automation Rules: ${LIBRARY_TEMPLATES.length + CONTACT_TEMPLATES.length}`);
  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('\n🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
