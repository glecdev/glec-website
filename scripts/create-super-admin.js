#!/usr/bin/env node

/**
 * Create SUPER_ADMIN User
 *
 * Creates admin@glec.io with password admin123
 * Role: SUPER_ADMIN
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function createSuperAdmin() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  const email = 'admin@glec.io';
  const password = 'admin123';
  const name = 'Super Admin';
  const role = 'SUPER_ADMIN';

  try {
    console.log('🔍 Checking if user exists...');

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, email, role FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      console.log('⚠️  User already exists:');
      console.log(`   Email: ${existingUser[0].email}`);
      console.log(`   Role: ${existingUser[0].role}`);
      console.log(`   ID: ${existingUser[0].id}`);

      if (existingUser[0].role !== role) {
        console.log('\n🔄 Updating role to SUPER_ADMIN...');
        await sql`
          UPDATE users
          SET role = ${role}
          WHERE email = ${email}
        `;
        console.log('✅ Role updated to SUPER_ADMIN');
      }

      return;
    }

    console.log('👤 Creating new SUPER_ADMIN user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate UUID
    const id = crypto.randomUUID();

    // Create user
    await sql`
      INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
      VALUES (
        ${id},
        ${email},
        ${hashedPassword},
        ${name},
        ${role},
        NOW(),
        NOW()
      )
    `;

    console.log('✅ SUPER_ADMIN user created successfully!');
    console.log('');
    console.log('📋 User Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   ID: ${id}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Failed to create user:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

createSuperAdmin();
