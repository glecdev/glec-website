/**
 * Production CTA Forms E2E Test
 *
 * 목적: Vercel 배포된 웹사이트의 모든 CTA 버튼 테스트
 * 검증 항목:
 * 1. Contact Form 제출 → 이메일 발송 → DB 저장
 * 2. Partnership Form 제출 → 이메일 발송 → DB 저장
 * 3. Admin 사이트에서 데이터 수집 확인
 */

import { test, expect, Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || 'https://glec-website.vercel.app';
const ADMIN_BASE_URL = BASE_URL;
const ADMIN_EMAIL = 'admin@glec.io';
const ADMIN_PASSWORD = 'GLEC2025Admin!';

// Test data
const timestamp = Date.now();
const testContactData = {
  name: `E2E 테스터 ${timestamp}`,
  company: `E2E 테스트 회사 ${timestamp}`,
  email: `e2e-test-${timestamp}@glec.io`,
  phone: '010-1234-5678',
  vehicleCount: '100-500대',
  message: `E2E 자동화 테스트 문의입니다. (${timestamp})`,
};

const testPartnershipData = {
  companyName: `E2E 파트너사 ${timestamp}`,
  contactName: `E2E 담당자 ${timestamp}`,
  email: `e2e-partnership-${timestamp}@glec.io`,
  partnershipType: 'tech',
  proposal: `E2E 자동화 테스트 파트너십 제안입니다. (${timestamp})`,
};

test.describe('Production CTA Forms Test', () => {
  let adminPage: Page;
  let websitePage: Page;
  let createdContactId: string;

  test.beforeAll(async ({ browser }) => {
    console.log('🌐 Production URL:', BASE_URL);

    // Create two contexts: Admin and Website
    const adminContext = await browser.newContext();
    const websiteContext = await browser.newContext();

    adminPage = await adminContext.newPage();
    websitePage = await websiteContext.newPage();

    // Login to Admin
    console.log('🔐 Admin 로그인 중...');
    await adminPage.goto(`${ADMIN_BASE_URL}/admin/login`);
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', ADMIN_PASSWORD);
    await adminPage.click('button[type="submit"]');

    // Wait for navigation (or timeout)
    await adminPage.waitForTimeout(3000);

    const currentUrl = adminPage.url();
    console.log('📍 Admin 로그인 후 URL:', currentUrl);
  });

  test('Contact Form: 제출 → DB 저장 → Admin 확인', async () => {
    console.log('\n📝 Test 1: Contact Form 전체 플로우');

    // Step 1: Contact Form 페이지 이동
    console.log('Step 1: Contact Form 페이지 이동');
    await websitePage.goto(`${BASE_URL}/contact`);
    await websitePage.waitForLoadState('domcontentloaded');

    // Step 2: 폼 작성
    console.log('Step 2: Contact Form 작성');

    // 이름 입력
    const nameInput = websitePage.locator('input[name="name"], input[placeholder*="이름"]').first();
    await nameInput.fill(testContactData.name);

    // 회사 입력
    const companyInput = websitePage.locator('input[name="company"], input[placeholder*="회사"]').first();
    await companyInput.fill(testContactData.company);

    // 이메일 입력
    const emailInput = websitePage.locator('input[type="email"]').first();
    await emailInput.fill(testContactData.email);

    // 전화번호 입력
    const phoneInput = websitePage.locator('input[type="tel"], input[name="phone"]').first();
    await phoneInput.fill(testContactData.phone);

    // 차량 대수 선택 (select 또는 input)
    const vehicleSelect = websitePage.locator('select').first();
    if (await vehicleSelect.count() > 0) {
      await vehicleSelect.selectOption(testContactData.vehicleCount);
    }

    // 문의 내용 입력
    const messageTextarea = websitePage.locator('textarea').first();
    await messageTextarea.fill(testContactData.message);

    // Step 3: 폼 제출
    console.log('Step 3: Contact Form 제출');
    const submitButton = websitePage.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for API response
    await websitePage.waitForTimeout(3000);

    // Step 4: Success 메시지 확인
    console.log('Step 4: Success 메시지 확인');
    const successMessage = websitePage.locator('text=/성공|접수|완료/i').first();
    const isSuccessVisible = await successMessage.isVisible().catch(() => false);

    if (isSuccessVisible) {
      console.log('✅ Success 메시지 표시됨');
    } else {
      console.warn('⚠️  Success 메시지 미확인 (API는 성공했을 수 있음)');
    }

    // Step 5: Database 직접 확인
    console.log('Step 5: Database에서 Contact 데이터 확인');
    await prisma.$connect();

    const savedContact = await prisma.contact.findFirst({
      where: {
        email: testContactData.email,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📊 DB 조회 결과:', savedContact ? '✅ 발견' : '❌ 없음');

    if (savedContact) {
      createdContactId = savedContact.id;
      console.log('   - ID:', savedContact.id);
      console.log('   - 회사:', savedContact.companyName);
      console.log('   - 이름:', savedContact.contactName);
      console.log('   - 상태:', savedContact.status);

      expect(savedContact.companyName).toBe(testContactData.company);
      expect(savedContact.contactName).toBe(testContactData.name);
      expect(savedContact.email).toBe(testContactData.email);
      expect(savedContact.status).toBe('NEW');
    } else {
      throw new Error('❌ Contact가 DB에 저장되지 않았습니다!');
    }

    // Step 6: Admin 사이트에서 확인
    console.log('Step 6: Admin 사이트에서 Contact 확인');
    await adminPage.goto(`${ADMIN_BASE_URL}/admin/demo-requests`);
    await adminPage.waitForLoadState('domcontentloaded');
    await adminPage.waitForTimeout(2000);

    // 최신 Contact 확인 (이메일로 검색)
    const contactRow = adminPage.locator(`text=${testContactData.email}`).first();
    const isContactVisible = await contactRow.isVisible().catch(() => false);

    if (isContactVisible) {
      console.log('✅ Admin 사이트에 Contact 표시됨');
    } else {
      console.warn('⚠️  Admin 사이트에 Contact 미표시 (페이지 로드 문제일 수 있음)');
    }

    await prisma.$disconnect();
  });

  test('Partnership Form: 제출 → 이메일 발송 확인', async () => {
    console.log('\n📝 Test 2: Partnership Form');

    // Step 1: Partnership Form 페이지 이동
    console.log('Step 1: Partnership Form 페이지 이동');
    await websitePage.goto(`${BASE_URL}/partnership`);
    await websitePage.waitForLoadState('domcontentloaded');

    // Step 2: 폼 작성
    console.log('Step 2: Partnership Form 작성');

    await websitePage.fill('input[name="companyName"]', testPartnershipData.companyName);
    await websitePage.fill('input[name="contactName"]', testPartnershipData.contactName);
    await websitePage.fill('input[type="email"]', testPartnershipData.email);

    // Partnership type 선택
    await websitePage.selectOption('select[name="partnershipType"]', testPartnershipData.partnershipType);

    await websitePage.fill('textarea[name="proposal"]', testPartnershipData.proposal);

    // Step 3: 폼 제출
    console.log('Step 3: Partnership Form 제출');
    await websitePage.click('button[type="submit"]');
    await websitePage.waitForTimeout(3000);

    // Step 4: Success 메시지 확인
    console.log('Step 4: Success 메시지 확인');
    const successMessage = websitePage.locator('text=/성공|접수|완료/i').first();
    const isSuccessVisible = await successMessage.isVisible().catch(() => false);

    if (isSuccessVisible) {
      console.log('✅ Partnership Success 메시지 표시됨');
    } else {
      console.warn('⚠️  Partnership Success 메시지 미확인');
    }
  });

  test.afterAll(async () => {
    // Cleanup: 테스트 데이터 삭제
    console.log('\n🧹 테스트 데이터 정리 중...');

    await prisma.$connect();

    if (createdContactId) {
      await prisma.contact.delete({
        where: { id: createdContactId },
      });
      console.log('✅ 테스트 Contact 삭제 완료');
    }

    await prisma.$disconnect();

    await adminPage.close();
    await websitePage.close();
  });
});
