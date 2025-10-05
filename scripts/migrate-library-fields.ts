/**
 * Manual Migration: Add file_type and tags to libraries table
 *
 * This script adds the missing fields to match TypeScript types
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('🔄 Starting migration: Add file_type and tags to libraries table...');

    // Check if columns already exist
    const checkFileType = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'libraries' AND column_name = 'file_type'
    `;

    const checkTags = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'libraries' AND column_name = 'tags'
    `;

    // Add file_type column if it doesn't exist
    if (checkFileType.length === 0) {
      console.log('  ➡️ Adding file_type column...');
      await sql`
        ALTER TABLE libraries
        ADD COLUMN file_type VARCHAR(10) DEFAULT 'PDF'
      `;
      console.log('  ✅ file_type column added');
    } else {
      console.log('  ⏭️ file_type column already exists');
    }

    // Add tags column if it doesn't exist
    if (checkTags.length === 0) {
      console.log('  ➡️ Adding tags column...');
      await sql`
        ALTER TABLE libraries
        ADD COLUMN tags TEXT[] DEFAULT '{}'
      `;
      console.log('  ✅ tags column added');
    } else {
      console.log('  ⏭️ tags column already exists');
    }

    // Make file_url NOT NULL after adding file_type
    console.log('  ➡️ Updating file_url to NOT NULL...');
    await sql`
      UPDATE libraries SET file_url = '' WHERE file_url IS NULL
    `;
    await sql`
      ALTER TABLE libraries
      ALTER COLUMN file_url SET NOT NULL,
      ALTER COLUMN file_url SET DEFAULT ''
    `;
    console.log('  ✅ file_url updated to NOT NULL');

    // Make file_size NOT NULL
    console.log('  ➡️ Updating file_size to NOT NULL...');
    await sql`
      UPDATE libraries SET file_size = '0 MB' WHERE file_size IS NULL
    `;
    await sql`
      ALTER TABLE libraries
      ALTER COLUMN file_size SET NOT NULL,
      ALTER COLUMN file_size SET DEFAULT '0 MB'
    `;
    console.log('  ✅ file_size updated to NOT NULL');

    // Make file_type NOT NULL
    console.log('  ➡️ Updating file_type to NOT NULL...');
    await sql`
      ALTER TABLE libraries
      ALTER COLUMN file_type SET NOT NULL
    `;
    console.log('  ✅ file_type updated to NOT NULL');

    // Create index on tags
    const checkTagsIndex = await sql`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'libraries' AND indexname = 'libraries_tags_idx'
    `;

    if (checkTagsIndex.length === 0) {
      console.log('  ➡️ Creating index on tags...');
      await sql`
        CREATE INDEX libraries_tags_idx ON libraries USING GIN (tags)
      `;
      console.log('  ✅ Index on tags created');
    } else {
      console.log('  ⏭️ Index on tags already exists');
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nUpdated schema:');
    console.log('  - file_type VARCHAR(10) NOT NULL DEFAULT \'PDF\'');
    console.log('  - tags TEXT[] NOT NULL DEFAULT \'{}\'');
    console.log('  - file_url VARCHAR NOT NULL');
    console.log('  - file_size VARCHAR NOT NULL');
    console.log('  - Index: libraries_tags_idx (GIN index on tags)');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrate()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });
