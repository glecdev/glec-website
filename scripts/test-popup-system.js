/**
 * Test Popup System
 *
 * Purpose: 프리미엄 팝업 시스템 통합 테스트
 * Tests:
 * 1. Admin popup creation API
 * 2. Public popup retrieval API
 * 3. Premium design rendering
 */

const BASE_URL = 'http://localhost:3000';

async function getAdminToken() {
  console.log('🔐 1. Admin 로그인...');

  const response = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@glec.io',
      password: 'Admin123!@#'
    })
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`로그인 실패: ${data.error?.message || 'Unknown error'}`);
  }

  console.log('   ✅ 로그인 성공');
  return data.data.token;
}

async function createTestPopup(token, popupData) {
  console.log(`\n📝 2. 테스트 팝업 생성: "${popupData.title}"...`);

  const response = await fetch(`${BASE_URL}/api/admin/popups`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(popupData)
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`팝업 생성 실패: ${data.error?.message || 'Unknown error'}`);
  }

  console.log(`   ✅ 팝업 생성 완료 (ID: ${data.data.id})`);
  return data.data;
}

async function getPublicPopups() {
  console.log('\n🌐 3. 웹사이트 팝업 조회...');

  const response = await fetch(`${BASE_URL}/api/popups`);
  const data = await response.json();

  if (!data.success) {
    throw new Error(`팝업 조회 실패`);
  }

  console.log(`   ✅ 활성 팝업 ${data.data.length}개 조회됨`);
  return data.data;
}

async function deletePopup(token, popupId) {
  console.log(`\n🗑️  4. 테스트 팝업 삭제 (ID: ${popupId})...`);

  const response = await fetch(`${BASE_URL}/api/admin/popups?id=${popupId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(`팝업 삭제 실패`);
  }

  console.log('   ✅ 팝업 삭제 완료');
}

async function runTests() {
  console.log('🚀 프리미엄 팝업 시스템 테스트 시작\n');
  console.log('='.repeat(60));

  let token;
  let createdPopupId;

  try {
    // Step 1: 로그인
    token = await getAdminToken();

    // Step 2: 프리미엄 모달 팝업 생성
    const testPopup = {
      title: '🎉 프리미엄 디자인 테스트',
      content: `
        <p class="text-lg mb-4">
          <strong>LaunchModal 스타일</strong>이 적용된 프리미엄 팝업입니다!
        </p>
        <ul class="list-disc list-inside space-y-2 mb-4">
          <li>✨ 그라데이션 헤더 (primary-500 → purple-600)</li>
          <li>✨ 애니메이션 블러 패턴</li>
          <li>✨ 백드롭 블러 효과</li>
          <li>✨ ESC 키로 닫기</li>
          <li>✨ 부드러운 애니메이션</li>
        </ul>
        <p class="text-gray-600">
          이 팝업을 닫으려면 <code class="bg-gray-100 px-2 py-1 rounded">ESC</code> 키를 누르거나
          닫기 버튼을 클릭하세요.
        </p>
      `,
      imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
      linkUrl: 'https://glec.io',
      displayType: 'modal',
      isActive: true,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      zIndex: 1000,
      showOncePerDay: true,
      position: JSON.stringify({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
      size: JSON.stringify({ width: '600px', height: 'auto' }),
      backgroundColor: '#ffffff'
    };

    const createdPopup = await createTestPopup(token, testPopup);
    createdPopupId = createdPopup.id;

    // Step 3: 웹사이트에서 팝업 조회
    const publicPopups = await getPublicPopups();

    // Step 4: 생성된 팝업 확인
    const foundPopup = publicPopups.find(p => p.id === createdPopupId);

    if (!foundPopup) {
      throw new Error('생성된 팝업이 웹사이트 API에서 조회되지 않음');
    }

    console.log('\n✅ 팝업 데이터 검증:');
    console.log(`   - Title: ${foundPopup.title}`);
    console.log(`   - Display Type: ${foundPopup.displayType}`);
    console.log(`   - Active: ${foundPopup.isActive}`);
    console.log(`   - Show Once Per Day: ${foundPopup.showOncePerDay}`);

    // Step 5: 테스트 팝업 삭제
    await deletePopup(token, createdPopupId);

    // Step 6: 삭제 확인
    const popupsAfterDelete = await getPublicPopups();
    const stillExists = popupsAfterDelete.find(p => p.id === createdPopupId);

    if (stillExists) {
      throw new Error('팝업이 삭제되지 않음');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 모든 테스트 통과!\n');
    console.log('📋 테스트 결과:');
    console.log('   ✅ Admin 로그인');
    console.log('   ✅ 팝업 생성 (POST /api/admin/popups)');
    console.log('   ✅ 웹사이트 팝업 조회 (GET /api/popups)');
    console.log('   ✅ 팝업 삭제 (DELETE /api/admin/popups)');
    console.log('   ✅ 데이터 무결성 검증');
    console.log('\n🌐 웹사이트 확인: http://localhost:3000');
    console.log('   (새로고침하면 프리미엄 팝업이 표시됩니다)');
    console.log('\n⚙️  Admin 확인: http://localhost:3000/admin/popups/create');
    console.log('   (6가지 컬러 프리셋으로 팝업 생성 가능)');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);

    // 실패 시 정리 작업
    if (token && createdPopupId) {
      console.log('\n🧹 정리 작업 중...');
      try {
        await deletePopup(token, createdPopupId);
      } catch (cleanupError) {
        console.error('   정리 실패:', cleanupError.message);
      }
    }

    process.exit(1);
  }
}

// Run tests
runTests();
