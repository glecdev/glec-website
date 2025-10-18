const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = envContent.split('\n').filter(line => line && !line.startsWith('#'));
  envVars.forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      const value = values.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

const sql = neon(process.env.DATABASE_URL);
const authorId = '9196bdb3-a5ff-40b0-8296-bc1efa863049'; // GLEC Administrator

function slugify(text) {
  const baseSlug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 90);

  const uniqueId = randomUUID().substring(0, 8);
  return `${baseSlug}-${uniqueId}`;
}

function isRealGLECPress(article) {
  const title = article.title.toLowerCase();
  const mediaOutlet = (article.mediaOutlet || '').toLowerCase();

  // GLEC/오일렉스 관련 키워드
  const keywords = ['glec', '오일렉스', '물류', '탄소', 'esg', '한국통합물류협회', 'iso 14083', '녹색물류'];

  // Google 검색 결과 제외
  if (mediaOutlet.includes('google.com') || title.includes('ai 모드') || title.includes('도서') || title.includes('금융')) {
    return false;
  }

  // 실제 보도자료인지 확인
  return keywords.some(keyword => title.includes(keyword));
}

async function restoreGLECPress() {
  console.log('📰 GLEC 보도자료 복구 시작\n');
  console.log('='.repeat(80));

  try {
    // Load press JSON
    const pressPath = path.join(__dirname, 'data', 'press-articles.json');
    const allPress = JSON.parse(fs.readFileSync(pressPath, 'utf-8'));

    // Filter real GLEC press
    const realPress = allPress.filter(isRealGLECPress);

    console.log(`\n📊 총 ${allPress.length}개 항목 중 ${realPress.length}개 실제 GLEC 보도자료 발견\n`);

    let importCount = 0;
    let skipCount = 0;

    for (const press of realPress) {
      // 중복 확인
      const existing = await sql`
        SELECT id FROM presses WHERE title = ${press.title}
      `;

      if (existing.length > 0) {
        skipCount++;
        continue;
      }

      const slug = slugify(press.title);
      const excerpt = press.excerpt || press.title.substring(0, 200);
      const content = `${press.title}\n\n${press.excerpt || ''}`;

      await sql`
        INSERT INTO presses (
          id,
          title,
          slug,
          content,
          excerpt,
          status,
          thumbnail_url,
          media_outlet,
          external_url,
          view_count,
          published_at,
          author_id,
          created_at,
          updated_at
        ) VALUES (
          ${randomUUID()},
          ${press.title},
          ${slug},
          ${content},
          ${excerpt},
          'PUBLISHED',
          NULL,
          ${press.mediaOutlet || 'Unknown'},
          ${press.externalUrl || null},
          0,
          ${press.publishedAt || new Date().toISOString()},
          ${authorId},
          NOW(),
          NOW()
        )
      `;

      importCount++;
      console.log(`   ✅ [${importCount}/${realPress.length}] ${press.title.substring(0, 60)}...`);
      console.log(`      언론사: ${press.mediaOutlet || 'Unknown'}\n`);
    }

    // 최종 확인
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 복구 결과\n');

    const result = await sql`
      SELECT COUNT(*) as total FROM presses WHERE external_url IS NOT NULL
    `;

    console.log(`   총 보도자료: ${result[0].total}개`);
    console.log(`   복구됨: ${importCount}개`);
    console.log(`   스킵됨: ${skipCount}개`);

    // 제목 목록
    const allPresses = await sql`
      SELECT title, media_outlet, external_url
      FROM presses
      WHERE external_url IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 10
    `;

    console.log('\n   최근 복구된 보도자료:\n');
    allPresses.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title.substring(0, 70)}...`);
      console.log(`      언론사: ${p.media_outlet}`);
      console.log(`      링크: ${p.external_url}\n`);
    });

    console.log('='.repeat(80));
    console.log('\n✅ GLEC 보도자료 복구 완료!\n');

  } catch (err) {
    console.error('❌ 오류:', err.message);
    console.error(err);
  }
}

restoreGLECPress();
