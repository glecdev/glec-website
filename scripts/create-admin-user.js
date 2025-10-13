/**
 * Create Admin User
 *
 * Purpose: Create admin user for E2E tests
 *
 * Usage: node scripts/create-admin-user.js
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const sql = neon(process.env.DATABASE_URL);

async function createAdminUser() {
  console.log('👤 Creating admin user...');

  const adminData = {
    id: crypto.randomUUID(),
    email: 'admin@glec.io',
    password: 'glec2024admin!',
    name: 'GLEC Admin',
    role: 'ADMIN',
  };

  try {
    // Check if admin already exists
    const existing = await sql`
      SELECT id, email, role FROM users WHERE email = ${adminData.email}
    `;

    if (existing.length > 0) {
      console.log('\n✅ Admin user already exists!');
      console.log(`   Email: ${existing[0].email}`);
      console.log(`   Role: ${existing[0].role}`);
      console.log(`\n💡 Use these credentials:`);
      console.log(`   Email: admin@glec.io`);
      console.log(`   Password: glec2024admin!`);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Insert admin user
    const result = await sql`
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (
        ${adminData.id},
        ${adminData.email},
        ${passwordHash},
        ${adminData.name},
        ${adminData.role},
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role
    `;

    const user = result[0];

    console.log('\n✅ Admin user created successfully!');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`\n💡 Use these credentials:`);
    console.log(`   Email: admin@glec.io`);
    console.log(`   Password: glec2024admin!`);
  } catch (error) {
    console.error('\n❌ Failed to create admin user');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);

    if (error.code === '42P01') {
      console.error(`\n⚠️  Table 'admin_users' does not exist. Please run migrations first.`);
    }

    process.exit(1);
  }
}

createAdminUser();
