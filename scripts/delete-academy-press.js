/**
 * Delete GLEC Academy (어학원) related press articles
 * Keep only GLEC logistics/ESG related articles
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function deleteAcademyPress() {
  console.log('\n🧹 Deleting GLEC Academy related press articles...\n');

  // Delete academy-related articles by ID
  const academyIds = [
    '5c550523-96db-4871-9100-1c2ac50c9c31', // GLEC어학원 2020 교육브랜드 대상
    '0fa8d314-072b-4801-94cf-9db91e0caf4b'  // 러너스마인드 클래스카드PRO
  ];

  const deleted = await sql`
    DELETE FROM presses
    WHERE id = ANY(${academyIds})
    RETURNING id, title, media_outlet
  `;

  console.log(`✅ Deleted ${deleted.length} academy-related articles:\n`);
  deleted.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title.substring(0, 80)}...`);
    console.log(`   Outlet: ${item.media_outlet}`);
    console.log(`   ID: ${item.id}`);
    console.log('');
  });

  console.log('📰 Remaining press articles (GLEC logistics/ESG):');
  const remaining = await sql`
    SELECT id, title, media_outlet, published_at
    FROM presses
    ORDER BY published_at DESC
  `;

  console.log(`Total: ${remaining.length}\n`);
  remaining.forEach((item, index) => {
    console.log(`${index + 1}. ${item.title.substring(0, 70)}...`);
    console.log(`   Outlet: ${item.media_outlet}`);
    console.log('');
  });

  console.log('✨ Cleanup complete!');
  console.log('📋 Only GLEC (물류/ESG) articles remain');
}

deleteAcademyPress();
