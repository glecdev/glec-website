import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function resetPassword() {
  const email = 'admin@glec.io';
  const newPassword = 'admin123!';
  
  console.log('🔐 Hashing new password...');
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  console.log('📝 Updating admin user password...');
  const result = await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE email = ${email}
    RETURNING id, email, name, role
  `;
  
  if (result.length === 0) {
    console.error('❌ Admin user not found');
    process.exit(1);
  }
  
  console.log('✅ Password reset successfully:');
  console.log(result[0]);
  console.log(`\nLogin credentials:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${newPassword}`);
}

resetPassword()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
