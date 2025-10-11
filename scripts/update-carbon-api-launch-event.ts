/**
 * Update Carbon API Launch Event
 *
 * Updates the launch event with correct information:
 * - Launch date: October 16, 2025
 * - Benefits: Test API 1,000 calls/month + Production API free for 1 month (max 5M won)
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function updateLaunchEvent() {
  console.log('🔄 Updating GLEC Carbon API Launch Event...\n');

  try {
    // New launch date: October 16, 2025
    const launchDate = new Date('2025-10-16T09:00:00+09:00'); // 2025년 10월 16일 오전 9시 KST
    const endDate = new Date('2025-10-16T18:00:00+09:00'); // 2025년 10월 16일 오후 6시 KST

    const updatedDescription = `
**GLEC Carbon API Console 공식 런칭**

ISO-14083 국제표준 기반 물류 탄소배출 측정 API가 드디어 공개됩니다!

## 🎯 런칭 특전

### 🎁 가입 고객 전원 혜택
1. **테스트 API 월 1,000회 호출 무료**
   - 개발 및 테스트 환경에서 자유롭게 사용
   - 제한 없이 영구 제공

2. **1달 간 프로덕션 API 완전 무료**
   - 정식 출시 후 1개월간 무제한 사용
   - 월 최대 500만원 상당 크레딧 제공
   - 호출량 제한 없음

### 📊 API 사양
- **48개 API 엔드포인트** (open-api.glec.io)
- **RESTful API** (JSON, OAuth 2.0)
- **99.9% 가동률 보장** (SLA)
- **글로벌 CDN** (< 100ms 응답 속도)

### 👥 참가 대상
- 물류/운송 업계 개발자
- ESG 담당자 및 컨설턴트
- Carbon Accounting 솔루션 개발사
- 글로벌 무역/유통 기업

## 📅 일정
- **날짜**: 2025년 10월 16일 (목)
- **시간**: 09:00 - 18:00 (KST)
- **장소**: 온라인 (Zoom Webinar)

## 🎤 프로그램
- 09:00 - 10:00 | 개회식 및 GLEC 소개
- 10:00 - 12:00 | Carbon API Console 기술 데모
- 12:00 - 13:00 | 점심 휴식
- 13:00 - 15:00 | 실습 워크샵 (Hands-on Workshop)
- 15:00 - 16:00 | Q&A 및 네트워킹
- 16:00 - 17:00 | API Console 등록 및 1:1 상담
- 17:00 - 18:00 | 폐회식

## 📋 준비물
- 노트북 (실습 워크샵용)
- GitHub 계정 (API 키 발급용)
- 명함 (네트워킹용)

## ⏰ 신청 마감
- **선착순 100명 한정**
- **마감일**: 2025년 10월 10일 (금) 23:59

지금 바로 신청하고 GLEC Carbon API Console의 첫 번째 사용자가 되어보세요!
    `.trim();

    // Update the event
    const result = await sql`
      UPDATE events
      SET
        title = 'GLEC Carbon API Console 공식 런칭',
        description = ${updatedDescription},
        start_date = ${launchDate.toISOString()},
        end_date = ${endDate.toISOString()},
        updated_at = ${new Date().toISOString()}
      WHERE slug = 'carbon-api-launch-2025'
      RETURNING id, title, slug, start_date, end_date
    `;

    if (result.length === 0) {
      console.error('❌ Error: Launch event not found');
      return;
    }

    const updatedEvent = result[0];

    console.log('\n✅ Launch event updated successfully!');
    console.log(`   ID: ${updatedEvent.id}`);
    console.log(`   Title: ${updatedEvent.title}`);
    console.log(`   Slug: ${updatedEvent.slug}`);
    console.log(`   Launch Date: ${new Date(updatedEvent.start_date).toLocaleString('ko-KR')}`);
    console.log(`   End Date: ${new Date(updatedEvent.end_date).toLocaleString('ko-KR')}`);
    console.log('\n🎉 Ready for updated launch promotion!');
  } catch (error) {
    console.error('❌ Error updating launch event:', error);
    throw error;
  }
}

// Run the script
updateLaunchEvent()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
