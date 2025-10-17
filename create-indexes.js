const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function createIndexes() {
  console.log("Creating performance indexes...\n");
  
  const indexes = [
    "CREATE INDEX IF NOT EXISTS idx_library_leads_created_at ON library_leads(created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status, created_at DESC)",
    "CREATE INDEX IF NOT EXISTS idx_partnerships_created_at ON partnerships(created_at DESC)"
  ];

  for (const idx of indexes) {
    try {
      await sql.unsafe(idx);
      console.log("✅ Created: " + idx.split(" ON ")[1]);
    } catch (error) {
      console.log("⏭️  Exists: " + idx.split(" ON ")[1]);
    }
  }

  console.log("\n🎉 Index creation complete\!");
}

createIndexes().catch(console.error);
