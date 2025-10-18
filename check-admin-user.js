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

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin user in database...\n');

    // Check all users
    const users = await sql`
      SELECT id, email, name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `;

    console.log(`Found ${users.length} users total:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    // Check specifically for admin@glec.io
    const adminUser = await sql`
      SELECT id, email, name, role, password_hash
      FROM users
      WHERE email = 'admin@glec.io'
    `;

    if (adminUser.length === 0) {
      console.log('❌ Admin user (admin@glec.io) NOT FOUND in database!');
      console.log('\n💡 Solution: Run the seed script to create admin user:');
      console.log('   cd glec-website && npm run prisma:seed');
      console.log('\n   OR create manually with:');
      console.log('   node create-admin-user.js');
    } else {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser[0].email}`);
      console.log(`   Name: ${adminUser[0].name}`);
      console.log(`   Role: ${adminUser[0].role}`);
      console.log(`   Password Hash: ${adminUser[0].password_hash.substring(0, 20)}...`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
  }
}

checkAdminUser();
