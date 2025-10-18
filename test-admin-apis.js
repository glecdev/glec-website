/**
 * Admin API Integration Test
 *
 * Tests all Admin API endpoints for errors and functionality
 *
 * Run: BASE_URL=http://localhost:3002 node test-admin-apis.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
};

function test(name, fn) {
  return async () => {
    results.total++;
    process.stdout.write(`🧪 ${name}... `);
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: 'PASS' });
      console.log('✅ PASS');
    } catch (error) {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ FAIL`);
      console.log(`   Error: ${error.message}`);
    }
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ============================================================
// Helper Functions
// ============================================================

async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

// ============================================================
// Test Suite
// ============================================================

async function runTests() {
  console.log('🚀 Starting Admin API Integration Tests...\n');
  console.log('============================================================\n');

  // ========================================
  // 1. Email Template Categories API
  // ========================================

  await test('GET /api/admin/email-template-categories - List all categories', async () => {
    const { status, data } = await apiCall('GET', '/api/admin/email-template-categories');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Response should have success: true');
    assert(Array.isArray(data.data), 'data.data should be an array');
    assert(data.data.length >= 2, 'Should have at least 2 categories (CONTACT_FORM, LIBRARY_DOWNLOAD)');

    // Verify category structure
    const category = data.data[0];
    assert(category.id, 'Category should have id');
    assert(category.category_name, 'Category should have category_name');
    assert(category.category_key, 'Category should have category_key');
    assert(typeof category.template_count === 'number', 'Category should have template_count');
  })();

  // ========================================
  // 2. Email Templates API
  // ========================================

  await test('GET /api/admin/email-templates - List all templates', async () => {
    const { status, data } = await apiCall('GET', '/api/admin/email-templates');
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Response should have success: true');
    assert(Array.isArray(data.data), 'data.data should be an array');
    assert(data.data.length >= 20, 'Should have at least 20 templates');
  })();

  await test('GET /api/admin/email-templates?category_id=X - Filter by category', async () => {
    // First get a category ID
    const categoriesRes = await apiCall('GET', '/api/admin/email-template-categories');
    const categoryId = categoriesRes.data.data[0].id;

    const { status, data } = await apiCall('GET', `/api/admin/email-templates?category_id=${categoryId}`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Response should have success: true');
    assert(Array.isArray(data.data), 'data.data should be an array');
  })();

  let createdTemplateId = null;

  await test('POST /api/admin/email-templates - Create new template', async () => {
    const newTemplate = {
      category_id: 'CONTACT_FORM',
      template_key: `TEST_TEMPLATE_${Date.now()}`,
      template_name: 'Test Template',
      description: 'API Test Template',
      nurture_day: 3,
      subject_line: 'Test Subject {contact_name}',
      preview_text: 'Test preview',
      html_body: '<h1>Hello {contact_name}</h1><p>This is a test from {company_name}</p>',
      plain_text_body: 'Hello {contact_name}\n\nThis is a test from {company_name}',
      available_variables: ['contact_name', 'company_name', 'email'],
      is_active: true,
      is_default: false,
    };

    const { status, data } = await apiCall('POST', '/api/admin/email-templates', newTemplate);
    assert(status === 201, `Expected 201, got ${status}`);
    assert(data.success === true, 'Response should have success: true');
    assert(data.data.id, 'Created template should have id');
    assert(data.data.template_key === newTemplate.template_key, 'template_key should match');

    createdTemplateId = data.data.id;
  })();

  await test('GET /api/admin/email-templates/[id] - Get single template', async () => {
    assert(createdTemplateId, 'Need created template ID from previous test');

    const { status, data } = await apiCall('GET', `/api/admin/email-templates/${createdTemplateId}`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Response should have success: true');
    assert(data.data.id === createdTemplateId, 'Template ID should match');
    assert(data.data.category_name, 'Should have joined category_name');
  })();

  await test('PUT /api/admin/email-templates/[id] - Update template', async () => {
    assert(createdTemplateId, 'Need created template ID from previous test');

    const updates = {
      template_name: 'Updated Test Template',
      description: 'Updated description',
      subject_line: 'Updated Subject {contact_name}',
    };

    const { status, data } = await apiCall('PUT', `/api/admin/email-templates/${createdTemplateId}`, updates);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Response should have success: true');
    assert(data.data.template_name === updates.template_name, 'template_name should be updated');
    assert(data.data.description === updates.description, 'description should be updated');
  })();

  await test('DELETE /api/admin/email-templates/[id] - Delete template', async () => {
    assert(createdTemplateId, 'Need created template ID from previous test');

    const { status, data } = await apiCall('DELETE', `/api/admin/email-templates/${createdTemplateId}`);
    assert(status === 200, `Expected 200, got ${status}`);
    assert(data.success === true, 'Response should have success: true');

    // Verify deletion
    const getRes = await apiCall('GET', `/api/admin/email-templates/${createdTemplateId}`);
    assert(getRes.status === 404, 'Deleted template should return 404');
  })();

  // ========================================
  // 3. Validation Tests
  // ========================================

  await test('POST /api/admin/email-templates - Validation: Missing required fields', async () => {
    const invalidTemplate = {
      category_id: 'CONTACT_FORM',
      // Missing: template_key, template_name, nurture_day, etc.
    };

    const { status, data } = await apiCall('POST', '/api/admin/email-templates', invalidTemplate);
    assert(status === 400, `Expected 400, got ${status}`);
    assert(data.success === false, 'Response should have success: false');
    assert(data.error.code === 'VALIDATION_ERROR', 'Error code should be VALIDATION_ERROR');
  })();

  await test('POST /api/admin/email-templates - Validation: Invalid nurture_day', async () => {
    const invalidTemplate = {
      category_id: 'CONTACT_FORM',
      template_key: `INVALID_DAY_${Date.now()}`,
      template_name: 'Invalid Day Template',
      nurture_day: 5, // Invalid! Must be 3, 7, 14, or 30
      subject_line: 'Test',
      html_body: '<p>Test</p>',
      plain_text_body: 'Test',
    };

    const { status, data } = await apiCall('POST', '/api/admin/email-templates', invalidTemplate);
    assert(status === 400, `Expected 400, got ${status}`);
    assert(data.success === false, 'Response should have success: false');
    assert(data.error.message.includes('nurture_day'), 'Error should mention nurture_day');
  })();

  await test('GET /api/admin/email-templates/[id] - Not found (invalid ID)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { status, data } = await apiCall('GET', `/api/admin/email-templates/${fakeId}`);
    assert(status === 404, `Expected 404, got ${status}`);
    assert(data.success === false, 'Response should have success: false');
    assert(data.error.code === 'NOT_FOUND', 'Error code should be NOT_FOUND');
  })();

  // ========================================
  // Test Results
  // ========================================

  console.log('\n============================================================\n');
  console.log('📊 Test Results:');
  console.log(`   Total: ${results.total}`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('');

  if (results.failed > 0) {
    console.log('❌ Failed Tests:');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`   - ${t.name}`);
        console.log(`     ${t.error}`);
      });
    console.log('');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
    console.log('✅ Admin API is working correctly');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
  process.exit(1);
});
