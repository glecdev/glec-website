/**
 * Test password hash
 * Purpose: Verify bcrypt hash matches
 */

import bcrypt from 'bcryptjs';

const password = 'admin123!';
const storedHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIFQGe6uPu';

console.log('Testing password hash...\n');
console.log(`Password: ${password}`);
console.log(`Stored hash: ${storedHash}\n`);

// Test comparison
const isMatch = await bcrypt.compare(password, storedHash);
console.log(`bcrypt.compare result: ${isMatch}\n`);

if (isMatch) {
  console.log('✅ Password matches hash!');
} else {
  console.log('❌ Password does NOT match hash');

  // Generate new hash for testing
  console.log('\nGenerating new hash for "admin123!"...');
  const newHash = await bcrypt.hash(password, 12);
  console.log(`New hash: ${newHash}`);

  // Test new hash
  const newMatch = await bcrypt.compare(password, newHash);
  console.log(`New hash matches: ${newMatch}`);
}
