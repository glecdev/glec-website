/**
 * Reset Admin Password Script
 *
 * Purpose: Reset admin user password to admin123
 * Usage: npx tsx scripts/reset-admin-password.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@glec.io';
  const newPassword = 'admin123';

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log('✅ Password reset successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   New Password: ${newPassword}`);
    console.log(`   User ID: ${user.id}`);
    console.log('\n⚠️  Please change the password after login!');
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
