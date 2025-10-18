/**
 * Simplified E2E Test for Unified Lead Management
 *
 * Focus: Direct API testing and database validation
 * Purpose: Verify lead collection and comparative validation without complex UI navigation
 */

import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Cleanup helper
async function cleanupTestLeads() {
  await prisma.contact.deleteMany({
    where: { email: { contains: 'playwright-simple-test' } },
  });
  await prisma.demoRequest.deleteMany({
    where: { email: { contains: 'playwright-simple-test' } },
  });
}

test.describe('Unified Lead Management - Simple Validation', () => {
  test.beforeAll(async () => {
    await cleanupTestLeads();
  });

  test.afterAll(async () => {
    await cleanupTestLeads();
    await prisma.$disconnect();
  });

  test('should create contact via API and verify in database', async ({ request }) => {
    const testEmail = `playwright-simple-test-${Date.now()}@example.com`;
    const testData = {
      name: 'API Test User',
      email: testEmail,
      company: 'Test Company',
      phone: '010-1234-5678',
      message: 'Test message from Playwright',
    };

    // Submit contact via API
    const response = await request.post(`${BASE_URL}/api/contact`, {
      data: testData,
    });

    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // Wait for database write
    await new Promise(resolve => setTimeout(resolve, 2000));

    // COMPARATIVE VALIDATION: Verify in database
    const dbContact = await prisma.contact.findFirst({
      where: { email: testEmail },
    });

    expect(dbContact).toBeTruthy();
    expect(dbContact?.name).toBe(testData.name);
    expect(dbContact?.email).toBe(testData.email);
    expect(dbContact?.company).toBe(testData.company);
    expect(dbContact?.phone).toBe(testData.phone);
    expect(dbContact?.message).toBe(testData.message);
    expect(dbContact?.leadSource).toBe('CONTACT_FORM');
    expect(dbContact?.leadStatus).toBe('NEW');

    console.log('✅ Contact creation verified - Database matches API response');
  });

  test('should fetch lead via API and match database', async ({ request }) => {
    // First create a test contact
    const testEmail = `playwright-simple-test-fetch-${Date.now()}@example.com`;
    await prisma.contact.create({
      data: {
        name: 'Fetch Test',
        email: testEmail,
        company: 'Fetch Company',
        phone: '010-9999-8888',
        message: 'Fetch test message',
        leadSource: 'CONTACT_FORM',
        leadStatus: 'NEW',
        leadScore: 50,
      },
    });

    // Wait for record to be available
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Fetch via API
    const response = await request.get(`${BASE_URL}/api/admin/leads`, {
      params: {
        page: '1',
        per_page: '100',
        source: 'CONTACT_FORM',
      },
    });

    expect(response.ok()).toBeTruthy();
    const responseData = await response.json();
    expect(responseData.success).toBe(true);

    // Find our test lead in the response
    const apiLead = responseData.data.find((lead: any) => lead.email === testEmail);
    expect(apiLead).toBeTruthy();

    // COMPARATIVE VALIDATION: Fetch from database
    const dbLead = await prisma.contact.findFirst({
      where: { email: testEmail },
    });

    expect(dbLead).toBeTruthy();
    expect(apiLead.name).toBe(dbLead?.name);
    expect(apiLead.email).toBe(dbLead?.email);
    expect(apiLead.company).toBe(dbLead?.company);
    expect(apiLead.lead_source).toBe(dbLead?.leadSource);
    expect(apiLead.lead_status).toBe(dbLead?.leadStatus);

    console.log('✅ API-Database comparative validation passed');
  });

  test('should update lead status via API and verify persistence', async ({ request }) => {
    // Create test lead
    const testEmail = `playwright-simple-test-update-${Date.now()}@example.com`;
    const testContact = await prisma.contact.create({
      data: {
        name: 'Update Test',
        email: testEmail,
        company: 'Update Company',
        phone: '010-7777-6666',
        message: 'Update test',
        leadSource: 'CONTACT_FORM',
        leadStatus: 'NEW',
        leadScore: 50,
      },
    });

    // Update via API
    const updateResponse = await request.put(`${BASE_URL}/api/admin/leads/${testContact.id}`, {
      data: {
        lead_status: 'CONTACTED',
        lead_score: 75,
      },
    });

    expect(updateResponse.ok()).toBeTruthy();
    const updateData = await updateResponse.json();
    expect(updateData.success).toBe(true);

    // Wait for update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // COMPARATIVE VALIDATION: Verify in database
    const updatedContact = await prisma.contact.findUnique({
      where: { id: testContact.id },
    });

    expect(updatedContact?.leadStatus).toBe('CONTACTED');
    expect(updatedContact?.leadScore).toBe(75);

    console.log('✅ Lead update verified - Database reflects API changes');
  });

  test('should verify analytics data matches aggregated database counts', async ({ request }) => {
    // Get analytics from API
    const analyticsResponse = await request.get(`${BASE_URL}/api/admin/leads/analytics`, {
      params: {
        date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        date_to: new Date().toISOString(),
        granularity: 'day',
      },
    });

    expect(analyticsResponse.ok()).toBeTruthy();
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData.success).toBe(true);

    // COMPARATIVE VALIDATION: Count leads in database
    const [contactCount, demoCount, eventCount] = await Promise.all([
      prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lte: new Date(),
          },
        },
      }),
      prisma.demoRequest.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lte: new Date(),
          },
        },
      }),
      prisma.eventRegistration.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lte: new Date(),
          },
        },
      }),
    ]);

    // Find source distribution in analytics
    const sourceDistribution = analyticsData.data.source_distribution;
    const apiContactCount = sourceDistribution.find((s: any) => s.source === 'CONTACT_FORM')?.count || 0;
    const apiDemoCount = sourceDistribution.find((s: any) => s.source === 'DEMO_REQUEST')?.count || 0;
    const apiEventCount = sourceDistribution.find((s: any) => s.source === 'EVENT_REGISTRATION')?.count || 0;

    // Verify counts match
    expect(apiContactCount).toBe(contactCount);
    expect(apiDemoCount).toBe(demoCount);
    expect(apiEventCount).toBe(eventCount);

    console.log('✅ Analytics comparative validation passed');
    console.log(`   - Contacts: API=${apiContactCount}, DB=${contactCount}`);
    console.log(`   - Demos: API=${apiDemoCount}, DB=${demoCount}`);
    console.log(`   - Events: API=${apiEventCount}, DB=${eventCount}`);
  });

  test('should verify email automation sends are tracked correctly', async ({ request }) => {
    // Get email sends from API
    const sendsResponse = await request.get(`${BASE_URL}/api/admin/leads/automation/sends`, {
      params: {
        page: '1',
        per_page: '50',
      },
    });

    expect(sendsResponse.ok()).toBeTruthy();
    const sendsData = await sendsResponse.json();
    expect(sendsData.success).toBe(true);

    // COMPARATIVE VALIDATION: Count in database
    const dbSendCount = await prisma.emailSend.count();

    // Verify total matches
    expect(sendsData.meta.total).toBe(dbSendCount);

    console.log('✅ Email automation comparative validation passed');
    console.log(`   - Total sends: API=${sendsData.meta.total}, DB=${dbSendCount}`);
  });
});
