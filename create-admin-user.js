const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
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

async function createAdminUser() {
  try {
    console.log('👤 Creating GLEC Admin User...\n');

    const adminEmail = 'admin@glec.io';
    const adminPassword = 'GLEC2025Admin!';
    const adminName = 'GLEC Administrator';

    // Check if user already exists
    const existing = await sql`
      SELECT id, email FROM users WHERE email = ${adminEmail}
    `;

    if (existing.length > 0) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   ID: ${existing[0].id}`);

      // Update password just in case
      console.log('\n🔄 Updating password to ensure it matches...');
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      await sql`
        UPDATE users
        SET password_hash = ${passwordHash}
        WHERE email = ${adminEmail}
      `;

      console.log('✅ Password updated successfully!');
      console.log(`\n📝 Login credentials:`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   URL: http://localhost:3001/admin/login`);

      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    console.log('✅ Password hashed');

    // Create user
    console.log('\n💾 Inserting admin user into database...');
    const result = await sql`
      INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        ${adminEmail},
        ${adminName},
        ${passwordHash},
        'SUPER_ADMIN',
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role
    `;

    console.log('✅ Admin user created successfully!\n');
    console.log('📋 User Details:');
    console.log(`   ID: ${result[0].id}`);
    console.log(`   Email: ${result[0].email}`);
    console.log(`   Name: ${result[0].name}`);
    console.log(`   Role: ${result[0].role}`);

    console.log(`\n📝 Login credentials:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   URL: http://localhost:3001/admin/login`);
    console.log(`   Production: https://glec-website.vercel.app/admin/login`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

createAdminUser();
