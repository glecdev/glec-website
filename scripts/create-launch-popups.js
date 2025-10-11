/**
 * Create Launch Popups Script
 *
 * Purpose: Carbon API 출시 이벤트 팝업 3개 생성
 * - 상단 배너 (banner)
 * - 중앙 모달 (modal)
 * - 하단 코너 (corner)
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function createLaunchPopups() {
  console.log('🚀 Carbon API 출시 팝업 생성 시작\n');
  console.log('='.repeat(60));

  const now = new Date().toISOString();
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. 상단 배너 팝업
  const bannerId = crypto.randomUUID();
  console.log('\n📢 1. 상단 배너 팝업 생성...');

  await sql`
    INSERT INTO popups (
      id, title, content, image_url, link_url,
      display_type, is_active, start_date, end_date,
      z_index, show_once_per_day, position, size, background_color,
      created_at, updated_at
    ) VALUES (
      ${bannerId},
      '🎉 GLEC Carbon API Console 출시!',
      '<strong>ISO-14083 국제표준</strong> 기반 Carbon API가 드디어 출시됩니다! <span class="ml-2">→</span>',
      NULL,
      '/events/carbon-api-launch-2025',
      'banner',
      true,
      ${now},
      ${sevenDaysLater},
      1000,
      false,
      'top',
      NULL,
      '#0600f7',
      NOW(),
      NOW()
    )
  `;

  console.log('   ✅ 배너 팝업 생성 완료 (ID:', bannerId, ')');

  // 2. 중앙 모달 팝업 (프리미엄 디자인)
  const modalId = crypto.randomUUID();
  console.log('\n🎨 2. 중앙 모달 팝업 생성 (프리미엄 디자인)...');

  const modalContent = `
<div class="space-y-6">
  <p class="text-lg mb-4">
    <strong class="text-primary-600">ISO-14083 국제표준</strong> 기반 Carbon API Console이 드디어 출시됩니다!
  </p>

  <div class="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-6 mb-6">
    <h3 class="text-xl font-bold text-gray-900 mb-4">🚀 주요 기능</h3>
    <ul class="space-y-3">
      <li class="flex items-start gap-3">
        <span class="text-2xl">✨</span>
        <div>
          <strong class="text-gray-900">48개 API 엔드포인트</strong>
          <p class="text-sm text-gray-600">운송 수단별 탄소배출 계산, 경로 최적화, 실시간 추적</p>
        </div>
      </li>
      <li class="flex items-start gap-3">
        <span class="text-2xl">📊</span>
        <div>
          <strong class="text-gray-900">OpenAPI 3.0 스펙</strong>
          <p class="text-sm text-gray-600">자동 문서화, 코드 생성, Postman/Swagger 지원</p>
        </div>
      </li>
      <li class="flex items-start gap-3">
        <span class="text-2xl">💎</span>
        <div>
          <strong class="text-gray-900">3개월 무료 체험</strong>
          <p class="text-sm text-gray-600">Early Access 신청 시 3개월 무료 + 프리미엄 지원</p>
        </div>
      </li>
    </ul>
  </div>

  <div class="border-t pt-6">
    <h3 class="text-lg font-bold text-gray-900 mb-3">🎁 Early Access 특전</h3>
    <ul class="space-y-2 text-gray-700">
      <li>✓ API 사용료 <strong>3개월 무료</strong></li>
      <li>✓ 전담 기술 지원팀 배정</li>
      <li>✓ 맞춤형 구축 컨설팅 (2시간)</li>
      <li>✓ 평생 <strong>20% 할인</strong> 혜택</li>
    </ul>
  </div>

  <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
    <p class="text-sm text-yellow-800">
      <strong>⏰ 선착순 100명 한정!</strong>
      현재 <strong class="text-yellow-900">23명</strong>이 신청했습니다.
    </p>
  </div>
</div>
  `.trim();

  await sql`
    INSERT INTO popups (
      id, title, content, image_url, link_url,
      display_type, is_active, start_date, end_date,
      z_index, show_once_per_day, position, size, background_color,
      created_at, updated_at
    ) VALUES (
      ${modalId},
      '🎉 GLEC Carbon API Console 출시 기념 이벤트',
      ${modalContent},
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      '/events/carbon-api-launch-2025',
      'modal',
      true,
      ${now},
      ${sevenDaysLater},
      1001,
      true,
      ${JSON.stringify({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' })},
      ${JSON.stringify({ width: '600px', height: 'auto' })},
      '#ffffff',
      NOW(),
      NOW()
    )
  `;

  console.log('   ✅ 모달 팝업 생성 완료 (ID:', modalId, ')');

  // 3. 하단 우측 코너 팝업
  const cornerId = crypto.randomUUID();
  console.log('\n📌 3. 하단 우측 코너 팝업 생성...');

  const cornerContent = `
<div class="space-y-3">
  <p class="text-sm text-gray-700 leading-relaxed">
    <strong class="text-gray-900">Carbon API</strong> 출시 기념<br/>
    <span class="text-primary-600 font-semibold">3개월 무료</span> + 평생 20% 할인!
  </p>
  <div class="flex items-center gap-2 text-xs text-gray-500">
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
    </svg>
    <span>선착순 100명 한정</span>
  </div>
</div>
  `.trim();

  await sql`
    INSERT INTO popups (
      id, title, content, image_url, link_url,
      display_type, is_active, start_date, end_date,
      z_index, show_once_per_day, position, size, background_color,
      created_at, updated_at
    ) VALUES (
      ${cornerId},
      '💎 Early Access 신청',
      ${cornerContent},
      NULL,
      '/events/carbon-api-launch-2025',
      'corner',
      true,
      ${now},
      ${sevenDaysLater},
      1002,
      false,
      ${JSON.stringify({ bottom: '20px', right: '20px' })},
      ${JSON.stringify({ width: '320px', height: 'auto' })},
      '#ffffff',
      NOW(),
      NOW()
    )
  `;

  console.log('   ✅ 코너 팝업 생성 완료 (ID:', cornerId, ')');

  // 결과 확인
  console.log('\n' + '='.repeat(60));
  console.log('✅ 3개 팝업 생성 완료!\n');

  const popups = await sql`
    SELECT id, title, display_type, is_active, z_index
    FROM popups
    WHERE id IN (${bannerId}, ${modalId}, ${cornerId})
    ORDER BY z_index ASC
  `;

  console.log('📋 생성된 팝업 목록:');
  popups.forEach((popup, index) => {
    console.log(`   ${index + 1}. ${popup.title}`);
    console.log(`      - Type: ${popup.display_type}`);
    console.log(`      - Active: ${popup.is_active}`);
    console.log(`      - Z-Index: ${popup.z_index}`);
    console.log(`      - ID: ${popup.id}\n`);
  });

  console.log('🌐 웹사이트 확인:');
  console.log('   1. http://localhost:3000 접속');
  console.log('   2. 3개 팝업 자동 표시 확인:');
  console.log('      - 상단 배너 (파란색)');
  console.log('      - 중앙 모달 (프리미엄 디자인)');
  console.log('      - 하단 우측 코너 (작은 알림)');
  console.log('\n⚙️  어드민 확인:');
  console.log('   - http://localhost:3000/admin/popups');
  console.log('   - 3개 팝업이 목록에 표시됨');
}

// Run script
createLaunchPopups()
  .then(() => {
    console.log('\n✨ 스크립트 실행 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    console.error(error.stack);
    process.exit(1);
  });
