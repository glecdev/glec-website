/**
 * Create partnerships table
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function createPartnershipsTable() {
  console.log('🔨 Creating partnerships table...\n');

  try {
    // Check if table already exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'partnerships'
      )
    `;

    if (tableExists[0].exists) {
      console.log('✅ Table partnerships already exists');
      return;
    }

    // Create partnership_status enum
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partnership_status') THEN
          CREATE TYPE partnership_status AS ENUM ('NEW', 'REVIEWING', 'APPROVED', 'REJECTED');
        END IF;
      END$$;
    `;
    console.log('✅ Created partnership_status enum');

    // Create partnerships table
    await sql`
      CREATE TABLE partnerships (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        email TEXT NOT NULL,
        partnership_type TEXT NOT NULL,
        proposal TEXT NOT NULL,
        status partnership_status NOT NULL DEFAULT 'NEW',
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('✅ Created partnerships table');

    // Create index on email for faster searches
    await sql`
      CREATE INDEX idx_partnerships_email ON partnerships(email)
    `;
    console.log('✅ Created index on email');

    // Create index on status
    await sql`
      CREATE INDEX idx_partnerships_status ON partnerships(status)
    `;
    console.log('✅ Created index on status');

    console.log('\n🎉 partnerships table created successfully!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createPartnershipsTable();
