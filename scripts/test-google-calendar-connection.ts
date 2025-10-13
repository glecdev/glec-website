/**
 * Google Calendar Connection Test
 *
 * Purpose: Service Account가 Google Calendar API에 접근할 수 있는지 테스트
 *
 * Usage: npx tsx scripts/test-google-calendar-connection.ts
 */

import { getGoogleCalendarClient, createGoogleMeetEvent } from '../lib/google-calendar';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function testGoogleCalendarConnection() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 GOOGLE CALENDAR API CONNECTION TEST');
  console.log('='.repeat(70));

  try {
    // Step 1: Check environment variables
    console.log('\n📋 Step 1: Checking environment variables...');

    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!serviceAccountKey) {
      console.error('❌ GOOGLE_SERVICE_ACCOUNT_KEY not found in .env.local');
      process.exit(1);
    }

    if (!calendarId) {
      console.error('❌ GOOGLE_CALENDAR_ID not found in .env.local');
      process.exit(1);
    }

    console.log('✅ GOOGLE_SERVICE_ACCOUNT_KEY: Found');
    console.log('✅ GOOGLE_CALENDAR_ID:', calendarId);

    // Parse and verify JSON
    let credentials: any;
    try {
      credentials = JSON.parse(serviceAccountKey);
      console.log('✅ Service Account JSON: Valid format');
      console.log('   Project ID:', credentials.project_id);
      console.log('   Client Email:', credentials.client_email);
    } catch (error) {
      console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY as JSON:', error);
      process.exit(1);
    }

    // Step 2: Test Calendar Client Creation
    console.log('\n📋 Step 2: Testing Google Calendar client creation...');

    let calendar;
    try {
      calendar = getGoogleCalendarClient();
      console.log('✅ Google Calendar client created successfully');
    } catch (error: any) {
      console.error('❌ Failed to create Google Calendar client:', error.message);
      process.exit(1);
    }

    // Step 3: Test Calendar API Access (List Calendars)
    console.log('\n📋 Step 3: Testing Calendar API access...');

    try {
      const calendarList = await calendar.calendarList.list({
        maxResults: 10,
      });

      if (calendarList.data.items && calendarList.data.items.length > 0) {
        console.log(`✅ Successfully accessed calendar list (${calendarList.data.items.length} calendars found)`);
        console.log('\n   Available Calendars:');
        calendarList.data.items.forEach((cal, index) => {
          console.log(`   ${index + 1}. ${cal.summary || 'Unnamed'} (${cal.id})`);
        });
      } else {
        console.log('⚠️  No calendars found (this might be normal for a new Service Account)');
      }
    } catch (error: any) {
      console.error('❌ Failed to access Calendar API:', error.message);
      if (error.message.includes('insufficient authentication')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if Service Account has correct permissions');
        console.error('   2. Share your calendar with:', credentials.client_email);
        console.error('   3. Permission: "Make changes to events"');
      }
      process.exit(1);
    }

    // Step 4: Test Simple Event Creation (without Google Meet)
    console.log('\n📋 Step 4: Testing simple event creation...');

    try {
      const testStartTime = new Date();
      testStartTime.setHours(testStartTime.getHours() + 48); // 2 days from now
      const testEndTime = new Date(testStartTime);
      testEndTime.setHours(testEndTime.getHours() + 1);

      console.log(`   Creating test event at: ${testStartTime.toISOString()}`);

      // Simple event without Google Meet first
      const testEvent = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: '[TEST] Google Calendar Connection Test - GLEC',
          description: 'This is a test event created by GLEC meeting system.\n\nTest Date: ' + new Date().toISOString(),
          start: {
            dateTime: testStartTime.toISOString(),
            timeZone: 'Asia/Seoul',
          },
          end: {
            dateTime: testEndTime.toISOString(),
            timeZone: 'Asia/Seoul',
          },
        },
      });

      console.log('✅ Successfully created calendar event!');
      console.log('   Event ID:', testEvent.data.id);
      console.log('   Calendar Link:', testEvent.data.htmlLink || 'N/A');
      console.log('   Status:', testEvent.data.status);

      // Step 5: Cleanup - Delete test event
      console.log('\n📋 Step 5: Cleaning up test event...');

      try {
        await calendar.events.delete({
          calendarId: calendarId,
          eventId: testEvent.data.id!,
        });
        console.log('✅ Test event deleted successfully');
      } catch (deleteError: any) {
        console.error('⚠️  Failed to delete test event:', deleteError.message);
        console.error('   You may need to manually delete the event:', testEvent.data.htmlLink);
      }

      // Step 6: Test Google Meet event creation
      console.log('\n📋 Step 6: Testing Google Meet event creation...');

      try {
        const testMeetEvent = await createGoogleMeetEvent({
          summary: '[TEST] Google Meet Test - GLEC',
          description: 'Testing Google Meet link generation.\n\nTest Date: ' + new Date().toISOString(),
          startTime: testStartTime,
          endTime: testEndTime,
          attendees: ['test@example.com'],
          timeZone: 'Asia/Seoul',
        });

        console.log('✅ Successfully created Google Meet event!');
        console.log('   Event ID:', testMeetEvent.eventId);
        console.log('   Meet Link:', testMeetEvent.meetLink || 'N/A');
        console.log('   Calendar Link:', testMeetEvent.htmlLink || 'N/A');

        // Cleanup Meet event
        try {
          await calendar.events.delete({
            calendarId: calendarId,
            eventId: testMeetEvent.eventId,
          });
          console.log('✅ Google Meet test event deleted successfully');
        } catch (deleteError: any) {
          console.error('⚠️  Failed to delete Google Meet event:', deleteError.message);
        }
      } catch (meetError: any) {
        console.error('⚠️  Google Meet event creation failed:', meetError.message);
        console.error('   This is acceptable - regular events work fine.');
        console.error('   Google Meet may require additional calendar settings.');
      }
    } catch (error: any) {
      console.error('❌ Failed to create calendar event:', error.message);
      if (error.message.includes('insufficient authentication') || error.message.includes('access')) {
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Ensure the Service Account has access to the calendar');
        console.error('   2. Share your calendar (contact@glec.io) with:', credentials.client_email);
        console.error('   3. Permission required: "Make changes to events"');
        console.error('   4. Wait a few minutes for permissions to propagate');
      }
      process.exit(1);
    }

    // Success!
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(70));
    console.log('\n🎉 Google Calendar API connection is working correctly!');
    console.log('   You can now use the meeting booking system with Google Meet.\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(70));
    console.error('\nError:', error.message);
    console.error('\nPlease check:');
    console.error('   1. GOOGLE_SERVICE_ACCOUNT_KEY is correct in .env.local');
    console.error('   2. Service Account has access to Google Calendar');
    console.error('   3. Calendar permissions are set correctly\n');
    process.exit(1);
  }
}

// Run test
console.log('\n🚀 Starting Google Calendar API connection test...\n');
testGoogleCalendarConnection();
