/**
 * Zoom API 연결 테스트 스크립트
 *
 * 이 스크립트는 다음을 테스트합니다:
 * 1. 환경 변수 확인
 * 2. OAuth 토큰 획득
 * 3. Zoom API 연결
 * 4. 테스트 미팅 생성
 * 5. 테스트 미팅 조회
 * 6. 테스트 미팅 삭제
 *
 * Usage:
 *   npx tsx scripts/test-zoom-connection.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import {
  testZoomConnection,
  createZoomMeeting,
  getZoomMeeting,
  deleteZoomMeeting,
} from '../lib/zoom';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

async function testZoomIntegration() {
  log('🚀 Starting Zoom API integration test...\n', 'bright');

  try {
    // Step 1: Environment variables check
    section('📋 Step 1: Environment Variables Check');
    const requiredEnvVars = [
      'ZOOM_ACCOUNT_ID',
      'ZOOM_CLIENT_ID',
      'ZOOM_CLIENT_SECRET',
    ];

    let allEnvVarsPresent = true;
    for (const varName of requiredEnvVars) {
      const value = process.env[varName];
      if (value) {
        log(`✅ ${varName}: ${value.substring(0, 10)}...`, 'green');
      } else {
        log(`❌ ${varName}: NOT SET`, 'red');
        allEnvVarsPresent = false;
      }
    }

    if (!allEnvVarsPresent) {
      throw new Error(
        'Missing required environment variables. Please check your .env.local file'
      );
    }

    // Step 2: Test basic connection
    section('📋 Step 2: Test Zoom API Connection');
    log('Testing OAuth token acquisition and API access...', 'yellow');

    const connectionSuccess = await testZoomConnection();

    if (connectionSuccess) {
      log('✅ Zoom API connection successful!', 'green');
    } else {
      throw new Error('Zoom API connection failed');
    }

    // Step 3: Create test meeting
    section('📋 Step 3: Create Test Meeting');
    log('Creating a test Zoom meeting...', 'yellow');

    const testStartTime = new Date();
    testStartTime.setDate(testStartTime.getDate() + 7); // 7일 후
    testStartTime.setHours(14, 0, 0, 0); // 오후 2시

    const testMeeting = await createZoomMeeting({
      topic: '[TEST] GLEC Meeting System Test',
      type: 2, // Scheduled meeting
      start_time: testStartTime.toISOString().slice(0, 19), // Remove milliseconds and timezone
      duration: 60,
      timezone: 'Asia/Seoul',
      agenda:
        'This is a test meeting created by GLEC Meeting System to verify Zoom API integration. You can safely delete this meeting.',
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        mute_upon_entry: true,
        auto_recording: 'none',
      },
    });

    log('✅ Test meeting created successfully!', 'green');
    console.log('\n📊 Meeting Details:');
    console.log(`   Meeting ID: ${testMeeting.id}`);
    console.log(`   Topic: ${testMeeting.topic}`);
    console.log(`   Start Time: ${testMeeting.start_time}`);
    console.log(`   Duration: ${testMeeting.duration} minutes`);
    console.log(`   Join URL: ${testMeeting.join_url}`);
    console.log(`   Start URL: ${testMeeting.start_url}`);
    if (testMeeting.password) {
      console.log(`   Password: ${testMeeting.password}`);
    }

    // Step 4: Get meeting info
    section('📋 Step 4: Retrieve Meeting Info');
    log('Fetching meeting information...', 'yellow');

    const retrievedMeeting = await getZoomMeeting(testMeeting.id);

    log('✅ Meeting retrieved successfully!', 'green');
    console.log(`   Status: ${retrievedMeeting.status}`);
    console.log(`   Topic: ${retrievedMeeting.topic}`);

    // Step 5: Delete test meeting
    section('📋 Step 5: Delete Test Meeting');
    log('Cleaning up test meeting...', 'yellow');

    await deleteZoomMeeting(testMeeting.id);

    log('✅ Test meeting deleted successfully!', 'green');

    // Final summary
    section('✅ ALL TESTS PASSED');
    log('Zoom API integration is working correctly!', 'green');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Environment variables configured');
    console.log('   ✅ OAuth token acquired');
    console.log('   ✅ API connection established');
    console.log('   ✅ Meeting created');
    console.log('   ✅ Meeting retrieved');
    console.log('   ✅ Meeting deleted');

    log(
      '\n🎉 You are ready to use Zoom API in your application!',
      'bright'
    );
  } catch (error) {
    section('❌ TEST FAILED');
    log('Zoom API integration test encountered an error:', 'red');
    console.error(error);

    if (error instanceof Error) {
      console.log('\n📋 Error Details:');
      console.log(`   Message: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }

    log(
      '\n💡 Troubleshooting Tips:',
      'yellow'
    );
    console.log('1. Verify that all Zoom credentials in .env.local are correct');
    console.log('2. Check that the Server-to-Server OAuth app is activated in Zoom Marketplace');
    console.log('3. Ensure your Zoom account has permission to create meetings');
    console.log('4. Check Zoom API status: https://status.zoom.us/');
    console.log('5. Review Zoom API documentation: https://developers.zoom.us/docs/api/');

    process.exit(1);
  }
}

// Run the test
testZoomIntegration().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
