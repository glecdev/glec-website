/**
 * Quick Database Tables Check
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkTables() {
  try {
    console.log('\n📊 Checking Database Tables\n' + '='.repeat(60));

    // Check events table
    try {
      const events = await sql`SELECT id, title, slug, status FROM events LIMIT 5`;
      console.log('\n📅 Events table:', events.length, 'rows');
      events.forEach((e: any) =>
        console.log(`  - ${e.title} (slug: ${e.slug}, status: ${e.status})`)
      );
    } catch (err: any) {
      console.log('\n📅 Events table: ERROR -', err.message);
    }

    // Check demo_requests table
    try {
      const demos = await sql`SELECT id, email, status FROM demo_requests LIMIT 3`;
      console.log('\n🎯 Demo requests table:', demos.length, 'rows');
      demos.forEach((d: any) => console.log(`  - ${d.email} (status: ${d.status})`));
    } catch (err: any) {
      console.log('\n🎯 Demo requests table: ERROR -', err.message);
    }

    // Check contact_submissions table
    try {
      const contacts = await sql`SELECT id, email, subject FROM contact_submissions LIMIT 3`;
      console.log('\n📬 Contact submissions table:', contacts.length, 'rows');
      contacts.forEach((c: any) => console.log(`  - ${c.email} (${c.subject})`));
    } catch (err: any) {
      console.log('\n📬 Contact submissions table: ERROR -', err.message);
    }

    // Check partnerships table
    try {
      const partners = await sql`SELECT id, company_name, status FROM partnerships LIMIT 3`;
      console.log('\n🤝 Partnerships table:', partners.length, 'rows');
      partners.forEach((p: any) => console.log(`  - ${p.company_name} (status: ${p.status})`));
    } catch (err: any) {
      console.log('\n🤝 Partnerships table: ERROR -', err.message);
    }

    // Check event_registrations table
    try {
      const regs = await sql`SELECT id, name, email, event_id FROM event_registrations LIMIT 3`;
      console.log('\n📋 Event registrations table:', regs.length, 'rows');
      regs.forEach((r: any) => console.log(`  - ${r.name} (${r.email}) for event ${r.event_id}`));
    } catch (err: any) {
      console.log('\n📋 Event registrations table: ERROR -', err.message);
    }

    console.log('\n' + '='.repeat(60));
  } catch (error: any) {
    console.error('Fatal error:', error.message);
  }
  process.exit(0);
}

checkTables();
