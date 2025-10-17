const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createViewFinal() {
  console.log('Creating unified_leads VIEW with ALL type fixes...\n');

  try {
    await sql\;
    console.log('✅ VIEW dropped\n');

    const result = await sql\;

    console.log('✅ CREATE executed\n');

    const counts = await sql\;
    console.log('✅ SUCCESS\! Lead counts by type:');
    counts.forEach(r => console.log(\));
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createViewFinal();
