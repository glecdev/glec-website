const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function test() {
  try {
    // Check events table
    const events = await sql`SELECT id, title, slug, status FROM events LIMIT 5`;
    console.log('\n📅 Events in database:', events.length);
    events.forEach(e => console.log(`  - ${e.title} (slug: ${e.slug}, status: ${e.status})`));
    
    // Check demo_requests table
    const demos = await sql`SELECT id, email, status FROM demo_requests LIMIT 3`;
    console.log('\n🎯 Demo requests:', demos.length);
    demos.forEach(d => console.log(`  - ${d.email} (status: ${d.status})`));
    
    // Check contact_submissions table (if exists)
    try {
      const contacts = await sql`SELECT id, email, subject FROM contact_submissions LIMIT 3`;
      console.log('\n📬 Contact submissions:', contacts.length);
      contacts.forEach(c => console.log(`  - ${c.email} (${c.subject})`));
    } catch (err) {
      console.log('\n📬 Contact submissions table: NOT FOUND');
    }
    
    // Check partnerships table (if exists)
    try {
      const partners = await sql`SELECT id, company_name, status FROM partnerships LIMIT 3`;
      console.log('\n🤝 Partnerships:', partners.length);
      partners.forEach(p => console.log(`  - ${p.company_name} (status: ${p.status})`));
    } catch (err) {
      console.log('\n🤝 Partnerships table: NOT FOUND');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

test();
