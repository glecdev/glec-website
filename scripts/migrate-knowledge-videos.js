/**
 * Manual Migration Script: Create knowledge_videos Table
 *
 * This script creates the knowledge_videos table in Neon PostgreSQL
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) {
      return;
    }
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      value = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;

async function migrate() {
  console.log('🔄 Starting migration: Create knowledge_videos table...\n');

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found in environment');
  }

  const sql = neon(DATABASE_URL);

  try {
    // Step 1: Create table
    console.log('1️⃣ Creating knowledge_videos table...');
    await sql`
      CREATE TABLE IF NOT EXISTS knowledge_videos (
        -- Primary Key
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Content Fields
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        video_url VARCHAR(500) NOT NULL UNIQUE,
        thumbnail_url VARCHAR(500),

        -- Video Metadata
        duration VARCHAR(10) NOT NULL,
        category VARCHAR(50) NOT NULL CHECK (category IN (
          'TECHNICAL',
          'GUIDE',
          'TUTORIAL',
          'WEBINAR',
          'CASE_STUDY',
          'PRODUCT_DEMO'
        )),
        tags TEXT[] NOT NULL DEFAULT '{}',

        -- Analytics
        view_count INTEGER NOT NULL DEFAULT 0,
        published_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        -- Timestamps
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ knowledge_videos table created\n');

    // Step 2: Create indexes
    console.log('2️⃣ Creating indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_videos_title_search ON knowledge_videos USING GIN (to_tsvector('english', title))`;
    console.log('   ✅ idx_knowledge_videos_title_search');

    await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_videos_description_search ON knowledge_videos USING GIN (to_tsvector('english', description))`;
    console.log('   ✅ idx_knowledge_videos_description_search');

    await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_videos_category ON knowledge_videos (category)`;
    console.log('   ✅ idx_knowledge_videos_category');

    await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_videos_published_at ON knowledge_videos (published_at DESC)`;
    console.log('   ✅ idx_knowledge_videos_published_at');

    await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_videos_view_count ON knowledge_videos (view_count DESC)`;
    console.log('   ✅ idx_knowledge_videos_view_count');

    await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_videos_tags ON knowledge_videos USING GIN (tags)`;
    console.log('   ✅ idx_knowledge_videos_tags\n');

    // Step 3: Create trigger function
    console.log('3️⃣ Creating trigger for updated_at...');
    await sql`
      CREATE OR REPLACE FUNCTION update_knowledge_videos_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    console.log('   ✅ Function created');

    await sql`
      DROP TRIGGER IF EXISTS trigger_update_knowledge_videos_updated_at ON knowledge_videos
    `;
    await sql`
      CREATE TRIGGER trigger_update_knowledge_videos_updated_at
      BEFORE UPDATE ON knowledge_videos
      FOR EACH ROW
      EXECUTE FUNCTION update_knowledge_videos_updated_at()
    `;
    console.log('   ✅ Trigger created\n');

    // Step 4: Verify table structure
    console.log('4️⃣ Verifying table structure...');
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'knowledge_videos'
      ORDER BY ordinal_position
    `;
    console.log(`   ✅ Found ${columns.length} columns:`);
    columns.forEach(col => {
      console.log(`      - ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''})`);
    });

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
