const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = envContent.split('\n').filter(line => line && !line.startsWith('#'));
  envVars.forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
      const value = values.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = value.trim();
    }
  });
}

const sql = neon(process.env.DATABASE_URL);

async function createView() {
  try {
    const query = fs.readFileSync('scripts/create-unified-leads-view-working.sql', 'utf-8');

    console.log('📝 Creating unified_leads view...\n');

    // Split by semicolons and execute each statement
    const statements = query
      .split(';')
      .map(s => {
        // Remove comment lines but keep the SQL
        const lines = s.split('\n').filter(line => !line.trim().startsWith('--'));
        return lines.join('\n').trim();
      })
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements\n`);

    for (const statement of statements) {
      if (statement.length === 0) continue;

      const preview = statement.substring(0, 60).replace(/\n/g, ' ');
      console.log(`Executing: ${preview}...`);

      try {
        await sql.query(statement);
        console.log('  ✅ Success');
      } catch (err) {
        // Ignore SELECT statements (they're just informational)
        if (!statement.trim().toUpperCase().startsWith('SELECT')) {
          console.error('  ❌ Error:', err.message);
          throw err;
        } else {
          console.log('  ℹ️ Info query (skipped)');
        }
      }
    }

    console.log('\n✅ All statements executed!');

    // Test
    console.log('\n📊 Testing view...');
    const test = await sql`SELECT COUNT(*) as count FROM unified_leads`;
    console.log(`✅ Found ${test[0].count} leads`);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

createView();
