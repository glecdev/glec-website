/**
 * Check Users Table
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

async function checkUsers() {
  console.log('🔍 Checking users table...\n');

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL not found');
  }

  const sql = neon(DATABASE_URL);

  try {
    // Get all users
    const users = await sql`SELECT id, email, name, role FROM users LIMIT 10`;

    console.log(`✅ Found ${users.length} users\n`);

    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

checkUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
