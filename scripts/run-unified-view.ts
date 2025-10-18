import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const sql = neon(process.env.DATABASE_URL!);

async function runScript() {
  try {
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'create-unified-leads-view.sql'),
      'utf-8'
    );

    console.log('📝 Executing unified_leads view creation...\n');

    // Split by semicolons and execute each statement
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.length === 0) continue;

      console.log(`Executing: ${statement.substring(0, 50)}...`);

      try {
        // Use sql.query() for raw SQL statements
        await sql.query(statement);
        console.log('✅ Success\n');
      } catch (err: any) {
        // Ignore "view already exists" errors
        if (err.code === '42P07') {
          console.log('⚠️  View already exists, continuing...\n');
        } else {
          console.error('❌ Error:', err.message);
          throw err;
        }
      }
    }

    console.log('\n✅ All statements executed successfully!');
    console.log('\n📊 Verifying unified_leads view...');

    const testResult = await sql`SELECT COUNT(*) as count FROM unified_leads`;
    console.log(`✅ Found ${testResult[0].count} total leads in unified view`);

    const bySource = await sql`
      SELECT lead_source_type, COUNT(*) as count
      FROM unified_leads
      GROUP BY lead_source_type
      ORDER BY count DESC
    `;

    console.log('\n📈 Leads by source:');
    bySource.forEach((row: any) => {
      console.log(`   ${row.lead_source_type}: ${row.count}`);
    });

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

runScript();
