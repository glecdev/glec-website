/**
 * Deploy Meeting Slots to Production
 * Purpose: 프로덕션 DB에 미팅 슬롯 자동 생성
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function deployProductionSlots() {
  console.log('🚀 Deploying Meeting Slots to Production\n');

  // 1. Check if slots already exist
  const existingSlots = await sql`
    SELECT COUNT(*) as count
    FROM meeting_slots
    WHERE start_time >= NOW()
    AND start_time <= NOW() + INTERVAL '30 days'
  `;

  const existingCount = parseInt(existingSlots[0].count);
  console.log(`📊 Existing future slots in database: ${existingCount}\n`);

  if (existingCount >= 50) {
    console.log('✅ Sufficient slots already exist. No action needed.\n');
    return;
  }

  console.log('📌 Creating new meeting slots...\n');

  const slots = [];
  const now = new Date();

  // Create slots for next 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // 3 time slots per day: 10:00, 14:00, 16:00 (KST)
    const times = [
      { hour: 10, minute: 0, label: '오전 10:00' },
      { hour: 14, minute: 0, label: '오후 2:00' },
      { hour: 16, minute: 0, label: '오후 4:00' },
    ];

    for (const time of times) {
      const startTime = new Date(date);
      startTime.setHours(time.hour, time.minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 60);

      slots.push({
        title: `GLEC 상담 미팅 (${time.label})`,
        description: 'GLEC Cloud 및 탄소배출 측정 솔루션에 대한 상담 미팅입니다.',
        meeting_type: 'CONSULTATION',
        duration_minutes: 60,
        meeting_location: 'ONLINE',
        meeting_url: 'https://meet.google.com/glec-meeting',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        timezone: 'Asia/Seoul',
        max_bookings: 3,
      });
    }
  }

  console.log(`📋 Total slots to create: ${slots.length}\n`);

  let created = 0;
  let skipped = 0;

  for (const slot of slots) {
    try {
      // Check if slot already exists
      const existing = await sql`
        SELECT id
        FROM meeting_slots
        WHERE start_time = ${slot.start_time}
        AND meeting_type = ${slot.meeting_type}
        LIMIT 1
      `;

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Insert new slot
      await sql`
        INSERT INTO meeting_slots (
          title,
          description,
          meeting_type,
          duration_minutes,
          meeting_location,
          meeting_url,
          start_time,
          end_time,
          timezone,
          current_bookings,
          max_bookings,
          is_available
        ) VALUES (
          ${slot.title},
          ${slot.description},
          ${slot.meeting_type},
          ${slot.duration_minutes},
          ${slot.meeting_location},
          ${slot.meeting_url},
          ${slot.start_time},
          ${slot.end_time},
          ${slot.timezone},
          0,
          ${slot.max_bookings},
          TRUE
        )
      `;

      created++;

      if (created % 10 === 0) {
        console.log(`✅ Created ${created} slots...`);
      }
    } catch (err) {
      console.error(`❌ Failed to create slot for ${slot.start_time}:`, err.message);
    }
  }

  console.log('\n📊 Deployment Summary:');
  console.log(`  ✅ Created: ${created} slots`);
  console.log(`  ⏭️  Skipped: ${skipped} slots`);
  console.log(`  📅 Total: ${slots.length} slots\n`);

  // Verify deployment
  const verifySlots = await sql`
    SELECT COUNT(*) as count
    FROM meeting_slots
    WHERE start_time >= NOW()
    AND start_time <= NOW() + INTERVAL '30 days'
    AND is_available = TRUE
  `;

  const finalCount = parseInt(verifySlots[0].count);
  console.log(`🔍 Verification: ${finalCount} future slots available\n`);

  if (finalCount >= 50) {
    console.log('✅ Production deployment successful!\n');
  } else {
    console.log('⚠️  Warning: Less than expected slots available\n');
  }
}

deployProductionSlots()
  .then(() => {
    console.log('🎉 Deployment complete!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Deployment failed:', err);
    process.exit(1);
  });
