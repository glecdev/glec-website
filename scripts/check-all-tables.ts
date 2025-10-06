/**
 * Check all tables in the database
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3YWCTdAzypI9@ep-nameless-mountain-adc1j5f8-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(DATABASE_URL);

async function checkTables() {
  console.log('🔍 Checking all tables in database\n');

  try {
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('📋 Tables in database:');
    console.log('='.repeat(60));
    tables.forEach((table: any, index: number) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });

    console.log('\n🔍 Looking for contact/demo/partnership related tables...\n');

    const contactTables = tables.filter((t: any) =>
      t.table_name.includes('contact') ||
      t.table_name.includes('form')
    );

    const demoTables = tables.filter((t: any) =>
      t.table_name.includes('demo') ||
      t.table_name.includes('request')
    );

    const partnershipTables = tables.filter((t: any) =>
      t.table_name.includes('partner')
    );

    if (contactTables.length > 0) {
      console.log('📧 Contact-related tables:');
      contactTables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    }

    if (demoTables.length > 0) {
      console.log('\n🎯 Demo/Request-related tables:');
      demoTables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    }

    if (partnershipTables.length > 0) {
      console.log('\n🤝 Partnership-related tables:');
      partnershipTables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();
