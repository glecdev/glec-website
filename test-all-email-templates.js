/**
 * 모든 이메일 템플릿 발송 테스트 스크립트
 *
 * 테스트할 이메일:
 * 1. Contact Form - 관리자 알림
 * 2. Contact Form - 사용자 자동응답
 * 3. Demo Request - 고객 확인
 * 4. Demo Request - 내부 알림
 * 5. Meeting Proposal - 미팅 제안
 * 6. Meeting Confirmation - 예약 확인
 */

const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';
const TEST_EMAIL = 'oillex.co.kr@gmail.com'; // 실제 수신 가능한 이메일

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function sendRequest(method, path, body = null) {
  const url = new URL(path, BASE_URL);

  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: { raw: data } });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test1_ContactAdminNotification() {
  logSection('📧 TEST 1: Contact Form - 관리자 알림 및 사용자 자동응답 이메일');

  const contactData = {
    company_name: 'GLEC (Email Template Test)',
    contact_name: '강덕호 (이메일 테스트)',
    email: TEST_EMAIL,
    phone: '010-1234-5678',
    inquiry_type: 'PRODUCT',
    message: '이것은 Contact Form 이메일 템플릿 테스트입니다.\n\n템플릿 항목:\n- 관리자 알림 이메일\n- 사용자 자동응답 이메일\n- 문의자 정보\n- 회사명\n- 연락처\n- 문의 내용',
    privacy_consent: true,
  };

  try {
    const response = await sendRequest('POST', '/api/contact', contactData);

    if (response.status === 200 && response.data.success) {
      log('✅ Contact Form 제출 성공', 'green');
      log(`ℹ️  Contact ID: ${response.data.data?.id || 'N/A'}`, 'blue');
      log(`ℹ️  메시지: ${response.data.data?.message || 'N/A'}`, 'blue');
      log('📧 관리자 알림 + 사용자 자동응답 이메일 2개 발송됨', 'cyan');
      return { success: true, ...response.data };
    } else {
      log(`❌ Contact Form 제출 실패: ${JSON.stringify(response.data)}`, 'red');
      return { success: false, error: response.data };
    }
  } catch (error) {
    log(`❌ 오류: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function test2_DemoRequest() {
  logSection('📧 TEST 2: Demo Request - 고객 확인 및 내부 알림 이메일');

  log('⚠️  Demo Request API는 아직 구현되지 않았습니다.', 'yellow');
  log('ℹ️  템플릿만 준비되어 있습니다:', 'blue');
  log('   - demo-request-customer.ts', 'blue');
  log('   - demo-request-internal.ts', 'blue');

  return { success: false, skipped: true, reason: 'API not implemented' };
}

async function test3_MeetingProposal() {
  logSection('📧 TEST 3: Meeting Proposal - 미팅 제안 이메일');

  // Step 1: 미팅 슬롯 생성
  log('Step 1: 미팅 슬롯 생성 중...', 'yellow');
  const slotData = {
    title: '이메일 템플릿 테스트 미팅',
    description: 'Meeting Proposal 이메일 템플릿 테스트를 위한 슬롯',
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2일 후
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1시간
    duration_minutes: 60,
    meeting_location: 'ONLINE',
    meeting_type: 'DEMO',
    is_available: true,
  };

  try {
    const slotResponse = await sendRequest('POST', '/api/admin/meetings/slots', slotData);

    if (slotResponse.status !== 201 || !slotResponse.data.success) {
      log(`❌ 미팅 슬롯 생성 실패: ${JSON.stringify(slotResponse.data)}`, 'red');
      return { success: false, error: 'Failed to create meeting slot' };
    }

    const slotId = slotResponse.data.data.id;
    log(`✅ 미팅 슬롯 생성 완료: ${slotId}`, 'green');

    // Step 2: 리드 목록 조회 (이메일 주소가 있는 리드 찾기)
    log('Step 2: 고객 리드 조회 중...', 'yellow');
    const leadsResponse = await sendRequest('GET', '/api/admin/library/leads?per_page=20');

    if (leadsResponse.status !== 200 || !leadsResponse.data.success || leadsResponse.data.data.length === 0) {
      log(`❌ 리드 조회 실패`, 'red');
      // 슬롯 삭제
      await sendRequest('DELETE', `/api/admin/meetings/slots/${slotId}`);
      return { success: false, error: 'No leads found' };
    }

    // 이메일 주소가 있는 리드 찾기
    const leadWithEmail = leadsResponse.data.data.find(lead => lead.email);
    if (!leadWithEmail) {
      log(`❌ 이메일 주소가 있는 리드를 찾을 수 없습니다`, 'red');
      // 슬롯 삭제
      await sendRequest('DELETE', `/api/admin/meetings/slots/${slotId}`);
      return { success: false, error: 'No leads with email found' };
    }

    const leadId = leadWithEmail.id;
    log(`✅ 리드 조회 완료: ${leadId} (${leadWithEmail.email})`, 'green');

    // Step 3: 미팅 제안 발송
    log('Step 3: 미팅 제안 이메일 발송 중...', 'yellow');
    const proposalData = {
      lead_type: 'library',
      lead_id: leadId,
      message: '이것은 Meeting Proposal 이메일 템플릿 테스트입니다.\n\n포함 항목:\n- 미팅 슬롯 목록\n- 시간 선택 버튼\n- 개인화 메시지',
    };

    const proposalResponse = await sendRequest('POST', '/api/admin/leads/send-meeting-proposal', proposalData);

    // Step 4: 슬롯 삭제 (정리)
    await sendRequest('DELETE', `/api/admin/meetings/slots/${slotId}`);
    log('✅ 테스트 슬롯 정리 완료', 'green');

    if (proposalResponse.status === 200 && proposalResponse.data.success) {
      log('✅ Meeting Proposal 이메일 발송 성공', 'green');
      log(`ℹ️  이메일 ID: ${proposalResponse.data.email_id || 'N/A'}`, 'blue');
      log(`ℹ️  토큰: ${proposalResponse.data.token || 'N/A'}`, 'blue');
      log(`ℹ️  예약 URL: ${proposalResponse.data.booking_url || 'N/A'}`, 'blue');
      return { success: true, ...proposalResponse.data };
    } else {
      log(`❌ Meeting Proposal 발송 실패: ${JSON.stringify(proposalResponse.data)}`, 'red');
      return { success: false, error: proposalResponse.data };
    }
  } catch (error) {
    log(`❌ 오류: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('🧪 이메일 템플릿 전체 발송 테스트', 'bright');
  log(`📍 Base URL: ${BASE_URL}`, 'blue');
  log(`📧 수신 이메일: ${TEST_EMAIL}`, 'blue');

  const results = {
    contactForm: null,
    demoRequest: null,
    meetingProposal: null,
  };

  // Test 1: Contact Form
  results.contactForm = await test1_ContactAdminNotification();
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기

  // Test 2: Demo Request
  results.demoRequest = await test2_DemoRequest();
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기

  // Test 3: Meeting Proposal
  results.meetingProposal = await test3_MeetingProposal();

  // Summary
  logSection('📊 테스트 결과 요약');

  let total = 0;
  let passed = 0;
  let skipped = 0;

  // Contact Form (실제 테스트)
  total++;
  if (results.contactForm?.success) {
    log('✅ Contact Form 이메일 (2개): 성공', 'green');
    log('   - 관리자 알림 이메일', 'green');
    log('   - 사용자 자동응답 이메일', 'green');
    passed++;
  } else {
    log('❌ Contact Form 이메일 (2개): 실패', 'red');
  }

  // Demo Request (스킵)
  if (results.demoRequest?.skipped) {
    log('⏭️  Demo Request 이메일 (2개): 스킵 (API 미구현)', 'yellow');
    log('   - demo-request-customer.ts ✅ 템플릿 준비됨', 'blue');
    log('   - demo-request-internal.ts ✅ 템플릿 준비됨', 'blue');
    skipped++;
  }

  // Meeting Proposal (실제 테스트)
  total++;
  if (results.meetingProposal?.success) {
    log('✅ Meeting Proposal 이메일 (1개): 성공', 'green');
    log('   - meeting-proposal.ts', 'green');
    passed++;
  } else {
    log('❌ Meeting Proposal 이메일 (1개): 실패', 'red');
  }

  console.log('─'.repeat(60));
  log(`테스트: ${passed}/${total} 성공, ${skipped}개 스킵 (${((passed / total) * 100).toFixed(1)}%)`, 'bright');

  if (passed === total) {
    log('\n🎉 모든 이메일 템플릿 발송 테스트 성공!', 'green');
    log(`📬 ${TEST_EMAIL} 메일함을 확인하세요.`, 'cyan');
    log('\n발송된 이메일:', 'cyan');
    log('1. Contact Form - 관리자 알림', 'cyan');
    log('2. Contact Form - 사용자 자동응답', 'cyan');
    log('3. Meeting Proposal - 미팅 제안', 'cyan');
  } else {
    log('\n⚠️  일부 테스트 실패', 'yellow');
  }

  console.log('='.repeat(60));
}

// 실행
runAllTests().catch(error => {
  log(`\n❌ 치명적 오류: ${error.message}`, 'red');
  process.exit(1);
});
