/**
 * Create Carbon API Launch Event
 *
 * This script creates a special launch event for GLEC Carbon API with:
 * - Event details (title, description, dates)
 * - Early access registration form
 * - Limited slots (100 participants)
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const sql = neon(process.env.DATABASE_URL!);

async function createLaunchEvent() {
  console.log('🚀 Creating GLEC Carbon API Launch Event...\n');

  try {
    // Step 1: Get the first admin user as author
    const users = await sql`SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`;

    let authorId: string;

    if (users.length === 0) {
      console.log('⚠️  No SUPER_ADMIN user found, trying CONTENT_MANAGER...');
      const managers = await sql`SELECT id FROM users WHERE role = 'CONTENT_MANAGER' LIMIT 1`;

      if (managers.length === 0) {
        console.error('❌ Error: No admin users found');
        console.log('   Please create a user first');
        return;
      }

      authorId = managers[0].id;
      console.log(`✅ Found CONTENT_MANAGER user: ${authorId}`);
    } else {
      authorId = users[0].id;
      console.log(`✅ Found SUPER_ADMIN user: ${authorId}`);
    }

    // Step 2: Check if launch event already exists
    const existing = await sql`SELECT id FROM events WHERE slug = 'carbon-api-launch-2025'`;

    if (existing.length > 0) {
      console.log(`⚠️  Launch event already exists (ID: ${existing[0].id})`);
      console.log('   Skipping creation...');
      return;
    }

    // Step 3: Create launch event
    const eventId = randomUUID();
    const launchDate = new Date('2025-11-01T09:00:00+09:00'); // 2025년 11월 1일 오전 9시 KST
    const endDate = new Date('2025-11-01T18:00:00+09:00'); // 2025년 11월 1일 오후 6시 KST

    const eventData = {
      id: eventId,
      title: 'GLEC Carbon API 공식 런칭 - Early Access',
      slug: 'carbon-api-launch-2025',
      description: `
**GLEC Carbon API 공식 런칭 이벤트**

ISO-14083 국제표준 기반 물류 탄소배출 측정 API가 드디어 공개됩니다!

## 🎯 이벤트 특전

### Early Access 참가자 혜택
- **무료 API 크레딧 $100 제공** (정식 출시 후 6개월간 사용 가능)
- **Early Adopter 전용 할인** (연간 구독 30% 할인)
- **1:1 기술 지원** (3개월 무료 프리미엄 지원)
- **파트너십 우선 협상권** (대량 사용 고객 대상)

### API 사양
- **48개 API 엔드포인트** (open-api.glec.io)
- **RESTful API** (JSON, OAuth 2.0)
- **99.9% 가동률 보장** (SLA)
- **글로벌 CDN** (< 100ms 응답 속도)

### 참가 대상
- 물류/운송 업계 개발자
- ESG 담당자 및 컨설턴트
- Carbon Accounting 솔루션 개발사
- 글로벌 무역/유통 기업

## 📅 일정
- **날짜**: 2025년 11월 1일 (금)
- **시간**: 09:00 - 18:00 (KST)
- **장소**: 온라인 (Zoom Webinar)

## 🎤 프로그램
- 09:00 - 10:00 | 개회식 및 GLEC 소개
- 10:00 - 12:00 | Carbon API 기술 데모
- 12:00 - 13:00 | 점심 휴식
- 13:00 - 15:00 | 실습 워크샵 (Hands-on Workshop)
- 15:00 - 16:00 | Q&A 및 네트워킹
- 16:00 - 17:00 | Early Access 등록 및 1:1 상담
- 17:00 - 18:00 | 폐회식

## 📋 준비물
- 노트북 (실습 워크샵용)
- GitHub 계정 (API 키 발급용)
- 명함 (네트워킹용)

## ⏰ 신청 마감
- **선착순 100명 한정**
- **마감일**: 2025년 10월 25일 (토) 23:59

지금 바로 신청하고 GLEC Carbon API의 첫 번째 사용자가 되어보세요!
      `.trim(),
      status: 'PUBLISHED' as const,
      start_date: launchDate.toISOString(),
      end_date: endDate.toISOString(),
      location: '온라인 (Zoom Webinar)',
      location_details: 'Zoom 링크는 신청 승인 후 이메일로 발송됩니다',
      thumbnail_url: '/images/events/carbon-api-launch-2025.jpg',
      max_participants: 100,
      view_count: 0,
      published_at: new Date().toISOString(),
      author_id: authorId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = await sql`
      INSERT INTO events (
        id,
        title,
        slug,
        description,
        status,
        start_date,
        end_date,
        location,
        location_details,
        thumbnail_url,
        max_participants,
        view_count,
        published_at,
        author_id,
        created_at,
        updated_at
      )
      VALUES (
        ${eventData.id},
        ${eventData.title},
        ${eventData.slug},
        ${eventData.description},
        ${eventData.status},
        ${eventData.start_date},
        ${eventData.end_date},
        ${eventData.location},
        ${eventData.location_details},
        ${eventData.thumbnail_url},
        ${eventData.max_participants},
        ${eventData.view_count},
        ${eventData.published_at},
        ${eventData.author_id},
        ${eventData.created_at},
        ${eventData.updated_at}
      )
      RETURNING id, title, slug, status
    `;

    const createdEvent = result[0];

    console.log('\n✅ Launch event created successfully!');
    console.log(`   ID: ${createdEvent.id}`);
    console.log(`   Title: ${createdEvent.title}`);
    console.log(`   Slug: ${createdEvent.slug}`);
    console.log(`   Status: ${createdEvent.status}`);
    console.log(`   Max Participants: ${eventData.max_participants}`);
    console.log(`   Launch Date: ${new Date(eventData.start_date).toLocaleString('ko-KR')}`);
    console.log('\n🎉 Ready for Early Access registrations!');
    console.log(`   Event URL: /events/${createdEvent.slug}`);
    console.log(`   Admin URL: /admin/events/${createdEvent.id}/registrations`);
  } catch (error) {
    console.error('❌ Error creating launch event:', error);
    throw error;
  }
}

// Run the script
createLaunchEvent()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
