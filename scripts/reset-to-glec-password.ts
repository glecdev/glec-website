import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@glec.io';
  const newPassword = 'GLEC2025Admin!';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    console.log('✅ Password reset to GLEC2025Admin!');
    console.log(`   Email: ${email}`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
