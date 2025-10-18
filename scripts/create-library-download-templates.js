/**
 * Create 4 LIBRARY_DOWNLOAD Templates (Day 3, 7, 14, 30)
 *
 * Templates for library download nurture sequence
 */

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const templates = [
  // Day 3: Welcome & Related Resources
  {
    category_key: 'LIBRARY_DOWNLOAD',
    nurture_day: 3,
    template_key: 'LIBRARY_DOWNLOAD_DAY3_V1',
    template_name: '자료실 다운로드 Day 3 - 환영 및 관련 자료 추천',
    description: '다운로드 후 3일차: 환영 메시지 및 관련 자료 추천',
    subject_line: '[GLEC] {contact_name}님, {library_item_title} 자료가 도움이 되셨나요?',
    preview_text: '추가로 도움이 될 만한 자료를 추천드립니다',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0600f7;">안녕하세요 {contact_name}님,</h1>
    <p><strong>{library_item_title}</strong> 자료를 다운로드해 주셔서 감사합니다.</p>
    <p>해당 자료가 {company_name}의 탄소배출 관리에 도움이 되셨기를 바랍니다.</p>

    <h2 style="color: #0600f7;">추천 자료</h2>
    <p>비슷한 주제에 관심이 있으시다면 다음 자료도 확인해보세요:</p>
    <ul>
      <li><a href="https://glec.io/knowledge/iso-14083-guide">ISO 14083 완벽 가이드</a></li>
      <li><a href="https://glec.io/knowledge/eu-cbam-strategy">EU CBAM 대응 전략</a></li>
      <li><a href="https://glec.io/knowledge/carbon-calculation">탄소배출 계산 자동화</a></li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/knowledge" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">전체 자료실 보기</a>
    </p>

    <p>궁금하신 점이 있으시면 언제든 연락 주세요.</p>
    <p><strong>GLEC 팀</strong></p>
  </div>
</body>
</html>`,
    plain_text_body: `안녕하세요 {contact_name}님,

{library_item_title} 자료를 다운로드해 주셔서 감사합니다.

해당 자료가 {company_name}의 탄소배출 관리에 도움이 되셨기를 바랍니다.

추천 자료:
- ISO 14083 완벽 가이드
- EU CBAM 대응 전략
- 탄소배출 계산 자동화

전체 자료실: https://glec.io/knowledge

GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'email', 'library_item_title', 'download_date'],
  },

  // Day 7: Success Stories
  {
    category_key: 'LIBRARY_DOWNLOAD',
    nurture_day: 7,
    template_key: 'LIBRARY_DOWNLOAD_DAY7_V1',
    template_name: '자료실 다운로드 Day 7 - 성공 사례',
    description: '다운로드 후 7일차: 고객 성공 사례 공유',
    subject_line: '[GLEC] {library_item_title}를 실제로 적용한 기업들',
    preview_text: '실제 적용 사례로 보는 효과',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0600f7;">{contact_name}님,</h1>
    <p>{library_item_title} 자료를 다운로드하신 지 일주일이 지났습니다.</p>

    <h2 style="color: #0600f7;">실제 적용 사례</h2>
    <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #0600f7;">
      <p><strong>물류 기업 A사</strong></p>
      <p>✅ 탄소배출 계산 시간: 8시간 → 10분 (98% 단축)</p>
      <p>✅ 연간 CO2 절감: 1,200톤</p>
      <p>✅ ISO 14083 인증 획득</p>
    </div>

    <h2 style="color: #0600f7;">GLEC이 제공하는 가치</h2>
    <ul>
      <li>자동화로 인한 인건비 절감 (월 300만원 이상)</li>
      <li>정확한 데이터로 고객 신뢰도 향상</li>
      <li>ISO 14083 인증으로 국제 경쟁력 강화</li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/case-studies" style="background-color: #0600f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">성공 사례 자세히 보기</a>
    </p>

    <p>GLEC 팀</p>
  </div>
</body>
</html>`,
    plain_text_body: `{contact_name}님,

{library_item_title} 자료를 다운로드하신 지 일주일이 지났습니다.

실제 적용 사례:

물류 기업 A사
✅ 탄소배출 계산 시간: 8시간 → 10분
✅ 연간 CO2 절감: 1,200톤
✅ ISO 14083 인증 획득

GLEC의 가치:
- 인건비 절감 (월 300만원+)
- 고객 신뢰도 향상
- 국제 경쟁력 강화

성공 사례: https://glec.io/case-studies

GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'library_item_title'],
  },

  // Day 14: Free Demo Invitation
  {
    category_key: 'LIBRARY_DOWNLOAD',
    nurture_day: 14,
    template_key: 'LIBRARY_DOWNLOAD_DAY14_V1',
    template_name: '자료실 다운로드 Day 14 - 무료 데모 초대',
    description: '다운로드 후 14일차: 1:1 무료 데모 세션 제안',
    subject_line: '[GLEC] {contact_name}님을 위한 1:1 맞춤 데모 (무료)',
    preview_text: '직접 보고 경험하는 GLEC의 강력한 기능',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #0600f7;">{contact_name}님께 특별 제안</h1>
    <p>{library_item_title} 자료에 관심을 가져주셔서 감사합니다.</p>
    <p>{company_name}의 탄소배출 관리를 직접 시뮬레이션해볼 수 있는 <strong>1:1 맞춤 데모</strong>를 무료로 제공합니다.</p>

    <h2 style="color: #0600f7;">데모에서 경험하실 내용</h2>
    <ul>
      <li>귀사의 실제 물류 데이터로 즉석 탄소배출 계산</li>
      <li>48개 Carbon API 실시간 시연</li>
      <li>GLEC Cloud 대시보드 직접 조작</li>
      <li>ROI 시뮬레이션 및 비용 분석</li>
    </ul>

    <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p><strong>🎁 특별 혜택</strong></p>
      <p>데모 참여 시 <strong>ISO 14083 가이드북</strong> (정가 5만원) 무료 제공!</p>
    </div>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/demo-request?ref=library_day14&item={library_item_id}" style="background-color: #0600f7; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px;">무료 데모 신청하기</a>
    </p>

    <p>GLEC 팀</p>
  </div>
</body>
</html>`,
    plain_text_body: `{contact_name}님께 특별 제안

{library_item_title} 자료에 관심 감사드립니다.

1:1 맞춤 데모 (무료):
- 실제 데이터로 탄소배출 계산
- 48개 Carbon API 시연
- GLEC Cloud 직접 조작
- ROI 시뮬레이션

🎁 특별 혜택: ISO 14083 가이드북 무료

데모 신청: https://glec.io/demo-request?ref=library_day14&item={library_item_id}

GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'library_item_title', 'library_item_id'],
  },

  // Day 30: Special Discount
  {
    category_key: 'LIBRARY_DOWNLOAD',
    nurture_day: 30,
    template_key: 'LIBRARY_DOWNLOAD_DAY30_V1',
    template_name: '자료실 다운로드 Day 30 - 특별 할인',
    description: '다운로드 후 30일차: 특별 할인 혜택 제공',
    subject_line: '[GLEC] {contact_name}님만을 위한 특별 할인 (이달 내)',
    preview_text: '자료 다운로드 고객 전용 20% 할인',
    html_body: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #d32f2f;">{contact_name}님만을 위한 특별 혜택</h1>
    <p>{library_item_title} 자료를 다운로드하신 고객님께 특별 할인을 제공합니다.</p>

    <div style="background-color: #ffebee; padding: 20px; margin: 20px 0; border-left: 4px solid #d32f2f;">
      <h2 style="color: #d32f2f; margin-top: 0;">🚨 이달 내 도입 시 특별 혜택</h2>
      <ul style="margin: 10px 0;">
        <li><strong>20% 할인</strong> (DTG Series5: 80만원 → 64만원)</li>
        <li><strong>3개월 무료 기술 지원</strong> (가치 120만원)</li>
        <li><strong>ISO 14083 컨설팅 1회 무료</strong> (가치 200만원)</li>
      </ul>
      <p style="color: #d32f2f; font-weight: bold;">할인 코드: <span style="background: #fff; padding: 5px 10px; border: 2px dashed #d32f2f;">LIBRARY30</span></p>
    </div>

    <h2 style="color: #0600f7;">지금 시작해야 하는 이유</h2>
    <ul>
      <li>EU CBAM 규제 강화: 2026년부터 본격 시행</li>
      <li>탄소배출 보고 의무화: 준비 기간 최소 6개월 필요</li>
      <li>비용 절감 효과: 도입 후 평균 3개월 내 ROI 달성</li>
    </ul>

    <p style="text-align: center; margin: 30px 0;">
      <a href="https://glec.io/contact?ref=library_day30&code=LIBRARY30" style="background-color: #d32f2f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 18px;">지금 바로 상담 신청</a>
    </p>

    <p>GLEC 팀</p>
  </div>
</body>
</html>`,
    plain_text_body: `{contact_name}님만을 위한 특별 혜택

{library_item_title} 다운로드 고객 전용 할인:

🚨 이달 내 도입 시:
- 20% 할인 (DTG Series5: 64만원)
- 3개월 무료 기술 지원 (120만원)
- ISO 14083 컨설팅 무료 (200만원)

할인 코드: LIBRARY30

지금 시작해야 하는 이유:
- EU CBAM 2026년 시행
- 준비 기간 6개월 필요
- 평균 ROI 3개월

상담 신청: https://glec.io/contact?ref=library_day30&code=LIBRARY30

GLEC 팀`,
    available_variables: ['contact_name', 'company_name', 'library_item_title'],
  },
];

async function createTemplates() {
  console.log('🚀 Creating 4 LIBRARY_DOWNLOAD Templates...\n');

  try {
    // 1. Get LIBRARY_DOWNLOAD category ID
    const categories = await sql`
      SELECT id, category_key, category_name
      FROM email_template_categories
      WHERE category_key = 'LIBRARY_DOWNLOAD'
    `;

    if (categories.length === 0) {
      console.error('❌ LIBRARY_DOWNLOAD category not found');
      process.exit(1);
    }

    const categoryId = categories[0].id;
    console.log(`✅ Found category: ${categories[0].category_name} (${categoryId})\n`);

    // 2. Create templates
    let created = 0;
    let skipped = 0;

    for (const template of templates) {
      // Check if exists
      const existing = await sql`
        SELECT id FROM email_templates WHERE template_key = ${template.template_key}
      `;

      if (existing.length > 0) {
        console.log(`⏭️  Skipped: ${template.template_name}`);
        skipped++;
        continue;
      }

      // Insert
      await sql`
        INSERT INTO email_templates (
          category_id,
          template_key,
          template_name,
          description,
          nurture_day,
          subject_line,
          preview_text,
          html_body,
          plain_text_body,
          available_variables,
          is_active,
          is_default
        ) VALUES (
          ${categoryId},
          ${template.template_key},
          ${template.template_name},
          ${template.description},
          ${template.nurture_day},
          ${template.subject_line},
          ${template.preview_text},
          ${template.html_body},
          ${template.plain_text_body},
          ${JSON.stringify(template.available_variables)},
          TRUE,
          TRUE
        )
      `;

      console.log(`✅ Created: ${template.template_name}`);
      created++;
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`✅ Template Creation Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${templates.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (created === 4) {
      console.log('🎉 SUCCESS! All 4 LIBRARY_DOWNLOAD templates created!\n');
      console.log('✅ Next: Update library-nurture cron to use template system');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTemplates();
