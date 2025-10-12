require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('📦 Running Migration 004: Lead Source Tracking & Meeting Management\n');
    
    const migration = fs.readFileSync('./scripts/migrations/004_add_lead_source_tracking_and_meetings.sql', 'utf8');
    
    await client.query(migration);
    
    console.log('✅ Migration 004 completed successfully!\n');
    
    // Verify tables created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('meeting_slots', 'meeting_bookings', 'meeting_proposal_tokens', 'lead_activities')
      ORDER BY table_name
    `);
    
    console.log('📋 Created Tables:');
    tablesResult.rows.forEach(t => console.log('  - ' + t.table_name));
    
    // Verify contacts columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'contacts'
      AND column_name IN ('lead_source', 'lead_score', 'assigned_to', 'last_contacted_at')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Added Columns to contacts:');
    columnsResult.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
