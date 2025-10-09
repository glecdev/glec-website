/**
 * Check if events and event_registrations tables exist in Neon database
 */

const { neon } = require('@neondatabase/serverless');

async function checkDatabaseTables() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔍 Checking Neon database structure...\n');

  try {
    // Check if events table exists
    console.log('1️⃣ Checking events table...');
    const eventsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'events'
      )
    `;
    console.log('events table exists:', eventsTableExists[0].exists);

    if (eventsTableExists[0].exists) {
      // Get events table structure
      const eventsColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'events'
        ORDER BY ordinal_position
      `;
      console.log('\nevents table columns:');
      eventsColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });

      // Count rows
      const eventsCount = await sql`SELECT COUNT(*) as count FROM events`;
      console.log(`\nevents table row count: ${eventsCount[0].count}`);
    }

    // Check if event_registrations table exists
    console.log('\n2️⃣ Checking event_registrations table...');
    const registrationsTableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'event_registrations'
      )
    `;
    console.log('event_registrations table exists:', registrationsTableExists[0].exists);

    if (registrationsTableExists[0].exists) {
      // Get event_registrations table structure
      const registrationsColumns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'event_registrations'
        ORDER BY ordinal_position
      `;
      console.log('\nevent_registrations table columns:');
      registrationsColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });

      // Count rows
      const registrationsCount = await sql`SELECT COUNT(*) as count FROM event_registrations`;
      console.log(`\nevent_registrations table row count: ${registrationsCount[0].count}`);
    }

    // Test the actual Events API query
    console.log('\n3️⃣ Testing Events API query...');
    try {
      const testQuery = await sql`
        SELECT
          e.*,
          COUNT(er.id)::int as registration_count
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        GROUP BY e.id
        ORDER BY e.start_date ASC
        LIMIT 5
      `;
      console.log(`✅ Events API query successful! Returned ${testQuery.length} events`);
      if (testQuery.length > 0) {
        console.log('\nSample event:', JSON.stringify(testQuery[0], null, 2));
      }
    } catch (queryError) {
      console.log('❌ Events API query failed:', queryError.message);
      console.log('Error details:', {
        code: queryError.code,
        detail: queryError.detail,
        position: queryError.position,
      });
    }

    console.log('\n✅ Database check complete!');

  } catch (error) {
    console.error('\n❌ Database check failed:', error.message);
    console.error('Error:', error);
  }
}

checkDatabaseTables();
