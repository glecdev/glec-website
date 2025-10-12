/**
 * Create Sample Meeting Slots
 * Purpose: 미팅 시간 슬롯 생성 (향후 30일간, 월화수목금 10:00/14:00/16:00)
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createMeetingSlots() {
  console.log('🗓️  Creating meeting slots for next 30 days...\n');

  const slots = [];
  const now = new Date();

  // Create slots for next 30 days
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    // Skip weekends (Saturday=6, Sunday=0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    // Create 3 time slots per day: 10:00, 14:00, 16:00 (KST)
    const times = [
      { hour: 10, minute: 0, label: '오전 10:00' },
      { hour: 14, minute: 0, label: '오후 2:00' },
      { hour: 16, minute: 0, label: '오후 4:00' },
    ];

    for (const time of times) {
      const startTime = new Date(date);
      startTime.setHours(time.hour, time.minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 60); // 60-minute meetings

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
        max_bookings: 3, // Maximum 3 bookings per slot
      });
    }
  }

  console.log(`📌 Total slots to create: ${slots.length}\n`);

  // Insert slots into database
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

      // Log progress every 10 slots
      if (created % 10 === 0) {
        console.log(`✅ Created ${created} slots...`);
      }
    } catch (err) {
      console.error(`❌ Failed to create slot for ${slot.start_time}:`, err.message);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Created: ${created} slots`);
  console.log(`  ⏭️  Skipped (already exists): ${skipped} slots`);
  console.log(`  📅 Total: ${slots.length} slots\n`);

  // Display first 5 available slots
  console.log('🔍 First 5 available slots:');
  const availableSlots = await sql`
    SELECT
      id,
      title,
      start_time,
      end_time,
      current_bookings,
      max_bookings
    FROM meeting_slots
    WHERE is_available = TRUE
    AND start_time >= NOW()
    ORDER BY start_time ASC
    LIMIT 5
  `;

  availableSlots.forEach((slot, idx) => {
    const startTime = new Date(slot.start_time).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    console.log(`  ${idx + 1}. ${startTime} - ${slot.title} (${slot.current_bookings}/${slot.max_bookings})`);
  });

  console.log('\n✅ Meeting slots creation complete!\n');
}

createMeetingSlots()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
