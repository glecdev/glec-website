const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

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

async function checkUsers() {
  const users = await sql`SELECT id, email, name, role FROM users`;
  console.log('사용자 목록:');
  users.forEach(u => {
    console.log(`  - ID: ${u.id}`);
    console.log(`    이메일: ${u.email}`);
    console.log(`    이름: ${u.name}`);
    console.log(`    역할: ${u.role}\n`);
  });
}

checkUsers();
