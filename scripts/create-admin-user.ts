/**
 * Admin User Seed Script
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function createAdminUser() {
  const email = 'admin@glec.io';
  const password = 'admin123!';
  const name = 'Admin User';
  const role = 'SUPER_ADMIN';

  try {
    console.log('🔍 Checking if admin user exists...');

    const existing = await sql`
      SELECT id, email, name, role, created_at
      FROM users
      WHERE email = ${email}
    `;

    if (existing.length > 0) {
      console.log('✅ Admin user already exists:');
      console.log(existing[0]);
      return;
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('📝 Inserting admin user...');
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, ${role})
      RETURNING id, email, name, role, created_at
    `;

    console.log('✅ Admin user created successfully:');
    console.log(result[0]);
    console.log('\n📋 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdminUser()
  .then(() => {
    console.log('\n🎉 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
