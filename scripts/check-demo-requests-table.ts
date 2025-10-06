/**
 * Check demo_requests table structure
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkTable() {
  console.log('🔍 Checking demo_requests table structure\n');

  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'demo_requests'
      )
    `;

    if (!tableExists[0].exists) {
      console.log('❌ Table demo_requests does NOT exist!');
      console.log('\n💡 Tip: Run database migration to create the table');
      return;
    }

    console.log('✅ Table demo_requests exists\n');

    // Get table columns
    const columns = await sql`
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'demo_requests'
      ORDER BY ordinal_position
    `;

    console.log('📋 Columns:');
    console.log('='.repeat(80));
    columns.forEach((col: any) => {
      const type = col.character_maximum_length
        ? `${col.data_type}(${col.character_maximum_length})`
        : col.data_type;
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  ${col.column_name.padEnd(30)} ${type.padEnd(20)} ${nullable}`);
    });

    // Check if product_interests column type
    const productInterestsCol = columns.find((c: any) => c.column_name === 'product_interests');
    if (productInterestsCol) {
      console.log('\n📌 product_interests column type:', productInterestsCol.data_type);
      if (productInterestsCol.data_type === 'ARRAY') {
        console.log('   ⚠️  Type is ARRAY - requires array literal, not JSON string');
      } else if (productInterestsCol.data_type.includes('json')) {
        console.log('   ✅ Type is JSON - can use JSON.stringify()');
      } else {
        console.log('   ⚠️  Type is', productInterestsCol.data_type);
      }
    }

    // Try a test insert
    console.log('\n🧪 Testing INSERT with sample data...');
    const testData = {
      company_name: 'Test Company',
      contact_name: 'Test User',
      email: 'test@example.com',
      phone: '010-0000-0000',
      company_size: '51-200',
      product_interests: JSON.stringify(['DTG_SERIES5']),
      use_case: 'Test use case for debugging',
      monthly_shipments: '1000-10000',
      preferred_date: '2025-02-01',
      preferred_time: '14:00'
    };

    const result = await sql`
      INSERT INTO demo_requests (
        company_name, contact_name, email, phone, company_size,
        product_interests, use_case, monthly_shipments,
        preferred_date, preferred_time, status, created_at, updated_at
      )
      VALUES (
        ${testData.company_name}, ${testData.contact_name}, ${testData.email}, ${testData.phone},
        ${testData.company_size}, ${testData.product_interests}, ${testData.use_case},
        ${testData.monthly_shipments}, ${testData.preferred_date}, ${testData.preferred_time},
        'NEW', NOW(), NOW()
      )
      RETURNING id, email
    `;

    console.log('✅ Test INSERT succeeded!');
    console.log('   ID:', result[0].id);
    console.log('   Email:', result[0].email);

    // Clean up test data
    await sql`DELETE FROM demo_requests WHERE email = 'test@example.com'`;
    console.log('   🗑️  Test data cleaned up');

  } catch (error: any) {
    console.log('\n❌ Error:', error.message);
    console.log('\n📋 Full error:');
    console.log(error);
  }
}

checkTable();
