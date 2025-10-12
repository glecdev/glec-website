/**
 * Meeting Scheduling System E2E Test
 *
 * Tests:
 * 1. Admin Meetings Slots Management
 * 2. Meeting Proposal Email Sending
 * 3. Customer Meeting Selection (would require token)
 *
 * Run: BASE_URL=http://localhost:3006 node test-meeting-system-e2e.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

console.log('🧪 Meeting Scheduling System E2E Test');
console.log(`📍 Base URL: ${BASE_URL}\n`);

// ====================================================================
// Test Utilities
// ====================================================================

function logTest(name) {
  console.log(`\n🧪 TEST: ${name}`);
  console.log('─'.repeat(60));
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message, error) {
  console.error(`❌ ${message}`);
  if (error) console.error(`   Error: ${error.message || error}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// ====================================================================
// Test 1: Admin Meetings Slots - GET
// ====================================================================

async function testGetMeetingSlots() {
  logTest('GET /api/admin/meetings/slots - Fetch all meeting slots');

  try {
    const response = await fetch(`${BASE_URL}/api/admin/meetings/slots`);
    const result = await response.json();

    if (!response.ok) {
      logError(`HTTP ${response.status}`, result.error?.message);
      return false;
    }

    if (!result.success) {
      logError('API returned success: false', result.error?.message);
      return false;
    }

    logSuccess(`Fetched ${result.data?.length || 0} meeting slots`);

    if (result.data && result.data.length > 0) {
      const slot = result.data[0];
      logInfo(`First slot: "${slot.title}" (${slot.meeting_type})`);
      logInfo(`Start: ${new Date(slot.start_time).toLocaleString('ko-KR')}`);
      logInfo(`Bookings: ${slot.current_bookings}/${slot.max_bookings}`);
    } else {
      logInfo('No slots found (create one first)');
    }

    return true;
  } catch (error) {
    logError('Failed to fetch meeting slots', error);
    return false;
  }
}

// ====================================================================
// Test 2: Admin Meetings Slots - POST (Create)
// ====================================================================

async function testCreateMeetingSlot() {
  logTest('POST /api/admin/meetings/slots - Create new meeting slot');

  try {
    // Create a slot for tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);

    const slotData = {
      title: 'GLEC 제품 데모 미팅 (E2E Test)',
      meeting_type: 'DEMO',
      duration_minutes: 60,
      start_time: tomorrow.toISOString(),
      end_time: endTime.toISOString(),
      is_available: true,
      max_bookings: 5,
      meeting_url: 'https://meet.google.com/test-e2e-xxx',
      meeting_location: 'ONLINE',
      office_address: null,
    };

    const response = await fetch(`${BASE_URL}/api/admin/meetings/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slotData),
    });

    const result = await response.json();

    if (!response.ok) {
      logError(`HTTP ${response.status}`, result.error?.message);
      return { success: false, slotId: null };
    }

    if (!result.success) {
      logError('API returned success: false', result.error?.message);
      return { success: false, slotId: null };
    }

    const createdSlot = result.data;
    logSuccess('Meeting slot created successfully');
    logInfo(`Slot ID: ${createdSlot.id}`);
    logInfo(`Title: ${createdSlot.title}`);
    logInfo(`Start: ${new Date(createdSlot.start_time).toLocaleString('ko-KR')}`);

    return { success: true, slotId: createdSlot.id };
  } catch (error) {
    logError('Failed to create meeting slot', error);
    return { success: false, slotId: null };
  }
}

// ====================================================================
// Test 3: Admin Meetings Slots - PATCH (Update)
// ====================================================================

async function testUpdateMeetingSlot(slotId) {
  if (!slotId) {
    logInfo('⏭️  Skipping PATCH test (no slot ID)');
    return false;
  }

  logTest(`PATCH /api/admin/meetings/slots/${slotId} - Update slot availability`);

  try {
    const response = await fetch(`${BASE_URL}/api/admin/meetings/slots/${slotId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_available: false,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      logError(`HTTP ${response.status}`, result.error?.message);
      return false;
    }

    if (!result.success) {
      logError('API returned success: false', result.error?.message);
      return false;
    }

    logSuccess('Meeting slot updated successfully');
    logInfo(`is_available: ${result.data.is_available}`);

    // Update back to available
    const restoreResponse = await fetch(`${BASE_URL}/api/admin/meetings/slots/${slotId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_available: true,
      }),
    });

    const restoreResult = await restoreResponse.json();
    if (restoreResult.success) {
      logSuccess('Slot restored to available');
    }

    return true;
  } catch (error) {
    logError('Failed to update meeting slot', error);
    return false;
  }
}

// ====================================================================
// Test 4: Customer Leads - GET
// ====================================================================

async function testGetCustomerLeads() {
  logTest('GET /api/admin/library/leads - Fetch customer leads');

  try {
    const response = await fetch(
      `${BASE_URL}/api/admin/library/leads?lead_status=ALL&library_item_id=ALL&page=1&per_page=20`
    );
    const result = await response.json();

    if (!response.ok) {
      logError(`HTTP ${response.status}`, result.error?.message);
      return { success: false, leadId: null };
    }

    if (!result.success) {
      logError('API returned success: false', result.error?.message);
      return { success: false, leadId: null };
    }

    logSuccess(`Fetched ${result.data?.length || 0} leads`);
    logInfo(`Total: ${result.meta?.total || 0}`);

    if (result.data && result.data.length > 0) {
      const lead = result.data[0];
      logInfo(`First lead: ${lead.company_name} (${lead.contact_name})`);
      logInfo(`Email: ${lead.email}`);
      logInfo(`Lead Score: ${lead.lead_score}`);
      return { success: true, leadId: lead.id };
    } else {
      logInfo('No leads found (download a library item first)');
      return { success: true, leadId: null };
    }
  } catch (error) {
    logError('Failed to fetch customer leads', error);
    return { success: false, leadId: null };
  }
}

// ====================================================================
// Test 5: Meeting Proposal - Send (Requires real lead)
// ====================================================================

async function testSendMeetingProposal(leadId) {
  if (!leadId) {
    logInfo('⏭️  Skipping Meeting Proposal test (no lead ID)');
    return false;
  }

  logTest('POST /api/admin/leads/send-meeting-proposal - Send meeting proposal email');

  try {
    const proposalData = {
      lead_type: 'LIBRARY_LEAD',
      lead_id: leadId,
      meeting_purpose: 'GLEC Cloud 도입 상담 (E2E Test)',
      admin_name: 'E2E Test Admin',
      admin_email: 'test@glec.io',
      admin_phone: '02-1234-5678',
      token_expiry_days: 7,
    };

    const response = await fetch(`${BASE_URL}/api/admin/leads/send-meeting-proposal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proposalData),
    });

    const result = await response.json();

    if (!response.ok) {
      logError(`HTTP ${response.status}`, result.error?.message);
      return { success: false, token: null };
    }

    if (!result.success) {
      logError('API returned success: false', result.error?.message);
      return { success: false, token: null };
    }

    logSuccess('Meeting proposal email sent successfully');
    logInfo(`Token: ${result.data.token}`);
    logInfo(`Booking URL: ${result.data.booking_url}`);
    logInfo(`Email ID: ${result.data.email_id || 'N/A'}`);

    return { success: true, token: result.data.token };
  } catch (error) {
    logError('Failed to send meeting proposal', error);
    return { success: false, token: null };
  }
}

// ====================================================================
// Test 6: Meeting Availability - GET (Customer-facing)
// ====================================================================

async function testGetMeetingAvailability(token) {
  if (!token) {
    logInfo('⏭️  Skipping Availability test (no token)');
    return false;
  }

  logTest('GET /api/meetings/availability - Customer views available slots');

  try {
    const response = await fetch(`${BASE_URL}/api/meetings/availability?token=${token}`);
    const result = await response.json();

    if (!response.ok) {
      logError(`HTTP ${response.status}`, result.error?.message);
      return { success: false, firstSlotId: null };
    }

    if (!result.success) {
      logError('API returned success: false', result.error?.message);
      return { success: false, firstSlotId: null };
    }

    logSuccess('Token validated and slots fetched');
    logInfo(`Lead: ${result.data.lead_info.company_name} (${result.data.lead_info.contact_name})`);

    const dates = Object.keys(result.data.slots_by_date);
    logInfo(`Available dates: ${dates.length}`);

    if (dates.length > 0) {
      const firstDate = dates[0];
      const slots = result.data.slots_by_date[firstDate];
      logInfo(`First date: ${firstDate} (${slots.length} slots)`);
      return { success: true, firstSlotId: slots[0]?.id };
    } else {
      logInfo('No available slots (create some first)');
      return { success: true, firstSlotId: null };
    }
  } catch (error) {
    logError('Failed to fetch meeting availability', error);
    return { success: false, firstSlotId: null };
  }
}

// ====================================================================
// Test 7: Admin Meetings Slots - DELETE
// ====================================================================

async function testDeleteMeetingSlot(slotId) {
  if (!slotId) {
    logInfo('⏭️  Skipping DELETE test (no slot ID)');
    return false;
  }

  logTest(`DELETE /api/admin/meetings/slots/${slotId} - Delete test slot`);

  try {
    const response = await fetch(`${BASE_URL}/api/admin/meetings/slots/${slotId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      logError(`HTTP ${response.status}`, result.error?.message);
      return false;
    }

    if (!result.success) {
      logError('API returned success: false', result.error?.message);
      return false;
    }

    logSuccess('Meeting slot deleted successfully');
    logInfo(`Deleted slot ID: ${result.data.id}`);

    return true;
  } catch (error) {
    logError('Failed to delete meeting slot', error);
    return false;
  }
}

// ====================================================================
// Run All Tests
// ====================================================================

async function runAllTests() {
  console.log('🚀 Starting E2E Tests...\n');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test 1: GET Meeting Slots
  results.total++;
  const test1 = await testGetMeetingSlots();
  if (test1) results.passed++;
  else results.failed++;

  // Test 2: POST Create Meeting Slot
  results.total++;
  const test2 = await testCreateMeetingSlot();
  if (test2.success) results.passed++;
  else results.failed++;
  const createdSlotId = test2.slotId;

  // Test 3: PATCH Update Meeting Slot
  results.total++;
  const test3 = await testUpdateMeetingSlot(createdSlotId);
  if (test3) results.passed++;
  else results.failed++;

  // Test 4: GET Customer Leads
  results.total++;
  const test4 = await testGetCustomerLeads();
  if (test4.success) results.passed++;
  else results.failed++;
  const leadId = test4.leadId;

  // Test 5: POST Send Meeting Proposal (requires lead)
  if (leadId) {
    results.total++;
    const test5 = await testSendMeetingProposal(leadId);
    if (test5.success) results.passed++;
    else results.failed++;
    const proposalToken = test5.token;

    // Test 6: GET Meeting Availability (requires token)
    if (proposalToken) {
      results.total++;
      const test6 = await testGetMeetingAvailability(proposalToken);
      if (test6.success) results.passed++;
      else results.failed++;
    }
  }

  // Test 7: DELETE Meeting Slot (cleanup)
  if (createdSlotId) {
    results.total++;
    const test7 = await testDeleteMeetingSlot(createdSlotId);
    if (test7) results.passed++;
    else results.failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

runAllTests().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
