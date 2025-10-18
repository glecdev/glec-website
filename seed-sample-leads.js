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

async function seedSampleLeads() {
  try {
    console.log('📝 Creating sample lead data for testing...\n');

    // 1. Create sample contacts (last 30 days)
    console.log('1️⃣ Creating sample contacts...');
    const contactsToCreate = 15;
    for (let i = 0; i < contactsToCreate; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await sql`
        INSERT INTO contacts (
          id, company_name, contact_name, email, phone, inquiry_type, message,
          privacy_consent, status, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${'Sample Company ' + (i + 1)},
          ${'Contact Person ' + (i + 1)},
          ${'contact' + (i + 1) + '@example.com'},
          ${'010-1234-' + String(1000 + i).padStart(4, '0')},
          ${['PRODUCT', 'PARTNERSHIP', 'SUPPORT', 'GENERAL'][Math.floor(Math.random() * 4)]},
          ${'Sample inquiry message ' + (i + 1)},
          ${true},
          ${['NEW', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)]},
          ${createdAt},
          ${createdAt}
        )
      `;
    }
    console.log(`   ✅ Created ${contactsToCreate} sample contacts\n`);

    // 2. Create sample demo requests
    console.log('2️⃣ Creating sample demo requests...');
    const demosToCreate = 10;
    for (let i = 0; i < demosToCreate; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await sql`
        INSERT INTO demo_requests (
          id, company_name, contact_name, email, phone, company_size,
          product_interests, use_case, monthly_shipments, preferred_date,
          preferred_time, status, privacy_consent, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${'Demo Company ' + (i + 1)},
          ${'Demo Person ' + (i + 1)},
          ${'demo' + (i + 1) + '@example.com'},
          ${'010-2345-' + String(1000 + i).padStart(4, '0')},
          ${['1-50', '51-200', '201-1000', '1000+'][Math.floor(Math.random() * 4)]},
          ${['DTG Series5', 'GLEC Cloud', 'Carbon API']},
          ${'Demo request use case ' + (i + 1)},
          ${['100-500', '500-1000', '1000-5000', '5000+'][Math.floor(Math.random() * 4)]},
          ${new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)},
          ${['오전 10:00', '오후 2:00', '오후 4:00'][Math.floor(Math.random() * 3)]},
          ${['NEW', 'SCHEDULED', 'COMPLETED', 'CANCELLED'][Math.floor(Math.random() * 4)]},
          ${true},
          ${createdAt},
          ${createdAt}
        )
      `;
    }
    console.log(`   ✅ Created ${demosToCreate} sample demo requests\n`);

    // 3. Create sample event registrations
    console.log('3️⃣ Creating sample event registrations...');
    const eventsToCreate = 8;
    for (let i = 0; i < eventsToCreate; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      await sql`
        INSERT INTO event_registrations (
          id, event_id, company, name, email, phone, job_title,
          status, privacy_consent, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${'event-' + (i % 3 + 1)},
          ${'Event Company ' + (i + 1)},
          ${'Event Person ' + (i + 1)},
          ${'event' + (i + 1) + '@example.com'},
          ${'010-3456-' + String(1000 + i).padStart(4, '0')},
          ${['Manager', 'Director', 'CTO', 'CEO'][Math.floor(Math.random() * 4)]},
          ${['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'][Math.floor(Math.random() * 4)]},
          ${true},
          ${createdAt},
          ${createdAt}
        )
      `;
    }
    console.log(`   ✅ Created ${eventsToCreate} sample event registrations\n`);

    // 4. Verify total counts
    console.log('4️⃣ Verifying created data...');
    const [contactCount] = await sql`SELECT COUNT(*) as count FROM contacts`;
    const [demoCount] = await sql`SELECT COUNT(*) as count FROM demo_requests`;
    const [eventCount] = await sql`SELECT COUNT(*) as count FROM event_registrations`;

    console.log(`   📊 Total Contacts: ${contactCount.count}`);
    console.log(`   📊 Total Demo Requests: ${demoCount.count}`);
    console.log(`   📊 Total Event Registrations: ${eventCount.count}`);
    console.log(`   📊 Grand Total: ${Number(contactCount.count) + Number(demoCount.count) + Number(eventCount.count)}\n`);

    console.log('✅ Sample lead data seeding complete!');
    console.log('\n🔍 Next steps:');
    console.log('   1. Refresh the Admin Analytics page');
    console.log('   2. Charts should now display with actual data');
    console.log('   3. Test date range filtering');
    console.log('   4. Test CSV export functionality');

  } catch (error) {
    console.error('❌ Error seeding sample leads:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

seedSampleLeads();
