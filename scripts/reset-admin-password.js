#!/usr/bin/env node

/**
 * Reset Admin Password
 *
 * Resets admin@glec.io password to admin123
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(DATABASE_URL);

  const email = 'admin@glec.io';
  const newPassword = 'admin123';

  try {
    console.log('🔍 Finding user...');

    const users = await sql`
      SELECT id, email, role, created_at
      FROM users
      WHERE email = ${email}
    `;

    if (users.length === 0) {
      console.error('❌ User not found');
      process.exit(1);
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${user.created_at}`);

    console.log('\n🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log('💾 Updating password in database...');
    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword},
          updated_at = NOW()
      WHERE email = ${email}
    `;

    console.log('✅ Password reset successfully!');
    console.log('');
    console.log('📋 New Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('');

    // Verify the password works
    console.log('🧪 Verifying password...');
    const updatedUser = await sql`
      SELECT password_hash
      FROM users
      WHERE email = ${email}
    `;

    const isValid = await bcrypt.compare(newPassword, updatedUser[0].password_hash);

    if (isValid) {
      console.log('✅ Password verification: SUCCESS');
    } else {
      console.log('❌ Password verification: FAILED');
    }

  } catch (error) {
    console.error('❌ Failed to reset password:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

resetPassword();
