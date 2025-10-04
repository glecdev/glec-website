import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  const adminEmail = 'admin@glec.io';
  const adminPassword = 'GLEC2025Admin!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: passwordHash,
      name: 'GLEC Administrator',
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Admin user created:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name: ${admin.name}`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Password: ${adminPassword}\n`);

  // Create sample notice
  const notice = await prisma.notice.upsert({
    where: { slug: 'glec-website-open' },
    update: {},
    create: {
      title: 'GLEC 웹사이트 오픈',
      slug: 'glec-website-open',
      content: '<p>GLEC 공식 웹사이트가 오픈되었습니다.</p><p>ISO-14083 국제표준 기반 물류 탄소배출 측정 솔루션을 만나보세요.</p>',
      excerpt: 'GLEC 공식 웹사이트가 오픈되었습니다.',
      category: 'GENERAL',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id
    }
  });

  console.log('✅ Sample notice created:');
  console.log(`   Title: ${notice.title}`);
  console.log(`   Category: ${notice.category}\n`);

  console.log('🎉 Database seed completed!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
