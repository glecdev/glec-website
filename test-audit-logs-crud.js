/**
 * Audit Logs CRUD Test
 *
 * Purpose: Verify that CREATE, UPDATE, DELETE actions are properly logged
 * Test Flow:
 * 1. Create a notice → Check audit log for CREATE action
 * 2. Update the notice → Check audit log for UPDATE action
 * 3. Delete the notice → Check audit log for DELETE action
 */

const BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'admin123!';

let adminToken = '';
let createdNoticeId = '';

async function login() {
  console.log('🔐 Logging in...');
  const response = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error('Login failed: ' + data.error.message);
  }

  adminToken = data.data.token;
  console.log(`✅ Login successful (Role: ${data.data.user.role})\n`);
}

async function getRecentLogs(count = 10) {
  const response = await fetch(`${BASE_URL}/api/admin/logs?page=1&per_page=${count}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error('Failed to fetch logs: ' + data.error.message);
  }

  return data.data;
}

async function findLogByAction(action, resourceId) {
  const logs = await getRecentLogs(50);
  return logs.find(log =>
    log.action === action &&
    log.resourceId === resourceId
  );
}

async function testCreateAuditLog() {
  console.log('📝 Test 1: CREATE Audit Log');
  console.log('   Creating a notice...');

  // Create notice
  const createRes = await fetch(`${BASE_URL}/api/admin/notices`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Audit Log Test Notice',
      content: '<p>This notice is for testing audit logs</p>',
      category: 'GENERAL',
      status: 'DRAFT',
    }),
  });

  const createData = await createRes.json();
  if (!createData.success) {
    throw new Error('Failed to create notice: ' + createData.error.message);
  }

  createdNoticeId = createData.data.id;
  console.log(`   ✅ Notice created: ${createdNoticeId}`);

  // Wait a bit for audit log to be written
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check audit log
  console.log('   Checking audit logs...');
  const createLog = await findLogByAction('CREATE', createdNoticeId);

  if (!createLog) {
    console.log('   ❌ CREATE audit log NOT FOUND');
    return false;
  }

  console.log(`   ✅ CREATE audit log found:`);
  console.log(`      - ID: ${createLog.id}`);
  console.log(`      - Action: ${createLog.action}`);
  console.log(`      - Resource: ${createLog.resource}`);
  console.log(`      - Resource ID: ${createLog.resourceId}`);
  console.log(`      - User: ${createLog.user.email}`);
  console.log(`      - Timestamp: ${createLog.createdAt}`);

  if (createLog.changes) {
    console.log(`      - Changes recorded: Yes`);
  }

  console.log();
  return true;
}

async function testUpdateAuditLog() {
  console.log('📝 Test 2: UPDATE Audit Log');
  console.log('   Updating the notice...');

  // Update notice
  const updateRes = await fetch(`${BASE_URL}/api/admin/notices?id=${createdNoticeId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Audit Log Test Notice - UPDATED',
      status: 'PUBLISHED',
    }),
  });

  const updateData = await updateRes.json();
  if (!updateData.success) {
    throw new Error('Failed to update notice: ' + updateData.error.message);
  }

  console.log(`   ✅ Notice updated: ${createdNoticeId}`);

  // Wait for audit log
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check audit log
  console.log('   Checking audit logs...');
  const updateLog = await findLogByAction('UPDATE', createdNoticeId);

  if (!updateLog) {
    console.log('   ❌ UPDATE audit log NOT FOUND');
    return false;
  }

  console.log(`   ✅ UPDATE audit log found:`);
  console.log(`      - ID: ${updateLog.id}`);
  console.log(`      - Action: ${updateLog.action}`);
  console.log(`      - Resource: ${updateLog.resource}`);
  console.log(`      - Resource ID: ${updateLog.resourceId}`);
  console.log(`      - User: ${updateLog.user.email}`);
  console.log(`      - Timestamp: ${updateLog.createdAt}`);

  if (updateLog.changes) {
    console.log(`      - Changes recorded: Yes`);
    console.log(`      - Before/After diff:`, JSON.stringify(updateLog.changes, null, 8));
  }

  console.log();
  return true;
}

async function testDeleteAuditLog() {
  console.log('📝 Test 3: DELETE Audit Log');
  console.log('   Deleting the notice...');

  // Delete notice
  const deleteRes = await fetch(`${BASE_URL}/api/admin/notices?id=${createdNoticeId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });

  const deleteData = await deleteRes.json();
  if (!deleteData.success) {
    throw new Error('Failed to delete notice: ' + deleteData.error.message);
  }

  console.log(`   ✅ Notice deleted: ${createdNoticeId}`);

  // Wait for audit log
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check audit log
  console.log('   Checking audit logs...');
  const deleteLog = await findLogByAction('DELETE', createdNoticeId);

  if (!deleteLog) {
    console.log('   ❌ DELETE audit log NOT FOUND');
    return false;
  }

  console.log(`   ✅ DELETE audit log found:`);
  console.log(`      - ID: ${deleteLog.id}`);
  console.log(`      - Action: ${deleteLog.action}`);
  console.log(`      - Resource: ${deleteLog.resource}`);
  console.log(`      - Resource ID: ${deleteLog.resourceId}`);
  console.log(`      - User: ${deleteLog.user.email}`);
  console.log(`      - Timestamp: ${deleteLog.createdAt}`);

  if (deleteLog.changes) {
    console.log(`      - Changes recorded: Yes`);
  }

  console.log();
  return true;
}

async function testLoginAuditLog() {
  console.log('📝 Test 4: LOGIN Audit Log');
  console.log('   Checking LOGIN logs...');

  const logs = await getRecentLogs(20);
  const loginLogs = logs.filter(log => log.action === 'LOGIN' && log.resource === 'auth');

  if (loginLogs.length === 0) {
    console.log('   ❌ No LOGIN audit logs found');
    return false;
  }

  console.log(`   ✅ Found ${loginLogs.length} LOGIN audit logs`);
  console.log(`      Latest login:`);
  console.log(`      - User: ${loginLogs[0].user.email}`);
  console.log(`      - IP: ${loginLogs[0].ipAddress}`);
  console.log(`      - Timestamp: ${loginLogs[0].createdAt}`);
  console.log();
  return true;
}

async function runTests() {
  console.log('============================================================');
  console.log('Audit Logs CRUD Test');
  console.log('============================================================\n');

  try {
    // Login
    await login();

    // Run tests
    const createResult = await testCreateAuditLog();
    const updateResult = await testUpdateAuditLog();
    const deleteResult = await testDeleteAuditLog();
    const loginResult = await testLoginAuditLog();

    // Summary
    console.log('============================================================');
    console.log('TEST SUMMARY');
    console.log('============================================================\n');

    const results = [
      { name: 'CREATE Audit Log', passed: createResult },
      { name: 'UPDATE Audit Log', passed: updateResult },
      { name: 'DELETE Audit Log', passed: deleteResult },
      { name: 'LOGIN Audit Log', passed: loginResult },
    ];

    let passedCount = 0;
    results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      if (result.passed) passedCount++;
    });

    console.log();
    console.log(`Total: ${passedCount}/${results.length} tests passed`);
    console.log('============================================================\n');

    if (passedCount === results.length) {
      console.log('🎉 ALL TESTS PASSED - Audit logging is working correctly!\n');
      process.exit(0);
    } else {
      console.log('⚠️  SOME TESTS FAILED - Check audit log implementation\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
