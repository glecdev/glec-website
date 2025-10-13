require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);

async function updatePassword() {
  const email = 'admin@glec.io';
  const newPassword = 'glec2024admin!';

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const result = await sql`
    UPDATE users
    SET password_hash = ${passwordHash}, updated_at = NOW()
    WHERE email = ${email}
    RETURNING id, email, role
  `;

  if (result.length === 0) {
    console.log('❌ Admin user not found');
    return;
  }

  console.log('✅ Password updated successfully!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${newPassword}`);
}

updatePassword();
