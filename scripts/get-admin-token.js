/**
 * Get Admin Token
 *
 * Purpose: Login as admin and get JWT token for E2E tests
 *
 * Usage: node scripts/get-admin-token.js
 */

require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function getAdminToken() {
  console.log('🔑 Attempting admin login...');
  console.log(`   Base URL: ${BASE_URL}`);

  // Admin credentials (from previous iterations)
  const credentials = {
    email: 'admin@glec.io',
    password: 'glec2024admin!',
  };

  try {
    const response = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('\n❌ Login failed');
      console.error(`   Error: ${result.error?.message || 'Unknown error'}`);
      process.exit(1);
    }

    const token = result.data.token;

    console.log('\n✅ Login successful!');
    console.log(`   User: ${result.data.user.email}`);
    console.log(`   Role: ${result.data.user.role}`);
    console.log(`\n📋 Admin Token:`);
    console.log(`   ${token}`);
    console.log(`\n💡 Copy this token and use it in test-webinar-e2e.js`);

    return token;
  } catch (error) {
    console.error('\n❌ Exception during login:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

getAdminToken();
