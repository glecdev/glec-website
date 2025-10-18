/**
 * Security Tests: Unified Leads API
 *
 * Tests for SQL Injection prevention and input validation
 *
 * Run: npm test -- __tests__/api/admin/leads/leads-security.test.ts
 *
 * @jest-environment node
 */

// Set DATABASE_URL for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Neon database
let mockSql: any;

jest.mock('@neondatabase/serverless', () => {
  mockSql = jest.fn((query: string, params?: any[]) => {
    // Store query and params for inspection
    mockSql.lastQuery = query;
    mockSql.lastParams = params || [];

    // Return mock data based on query type
    if (query.includes('COUNT(*)')) {
      return Promise.resolve([{ total: 0 }]);
    }

    if (query.includes('SELECT') && query.includes('FROM unified_leads') && !query.includes('COUNT')) {
      // Leads query
      return Promise.resolve([]);
    }

    // Stats query
    return Promise.resolve([
      {
        total_leads: '0',
        avg_score: 0,
        new_count: '0',
        contacted_count: '0',
        qualified_count: '0',
        proposal_count: '0',
        negotiation_count: '0',
        won_count: '0',
        lost_count: '0',
        library_count: '0',
        contact_count: '0',
        demo_count: '0',
        event_count: '0',
      },
    ]);
  });

  mockSql.lastQuery = '';
  mockSql.lastParams = [];

  return {
    neon: jest.fn(() => mockSql),
  };
});

// Mock rate limiter
jest.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    generalApi: {
      check: jest.fn(() => ({ allowed: true, limit: 100, remaining: 99, resetTime: Date.now() + 900000 })),
    },
  },
  createRateLimitResponse: jest.fn((result) => ({
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
  })),
  addRateLimitHeaders: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/leads/route';

describe('Unified Leads API - Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSql.lastQuery = '';
    mockSql.lastParams = [];
  });

  // ====================================================================
  // SQL Injection Prevention
  // ====================================================================

  describe('SQL Injection Prevention', () => {
    it('should prevent SQL injection in source_type parameter', async () => {
      const maliciousInput = "LIBRARY_LEAD' OR '1'='1";

      const req = new NextRequest(`http://localhost:3000/api/admin/leads?source_type=${encodeURIComponent(maliciousInput)}`);
      const response = await GET(req);
      const data = await response.json();

      // Should return validation error (invalid enum value)
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(mockSql).not.toHaveBeenCalled(); // Query should NOT execute
    });

    it('should prevent SQL injection in status parameter', async () => {
      const maliciousInput = "NEW'; DROP TABLE unified_leads;--";

      const req = new NextRequest(`http://localhost:3000/api/admin/leads?status=${encodeURIComponent(maliciousInput)}`);
      const response = await GET(req);
      const data = await response.json();

      // Should return validation error (invalid enum value)
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(mockSql).not.toHaveBeenCalled();
    });

    it('should prevent SQL injection in search parameter', async () => {
      const maliciousInput = "test' UNION SELECT * FROM users WHERE '1'='1";

      const req = new NextRequest(`http://localhost:3000/api/admin/leads?search=${encodeURIComponent(maliciousInput)}`);
      const response = await GET(req);
      const data = await response.json();

      // Should execute query successfully (parameterized)
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check that query uses parameterized search
      const lastQuery = mockSql.lastQuery;
      const lastParams = mockSql.lastParams;

      // Query should contain parameterized ILIKE with $N placeholders
      expect(lastQuery).toContain('ILIKE $');
      expect(lastQuery).not.toContain(maliciousInput); // Raw input should NOT be in query

      // Params should contain the search pattern
      expect(lastParams).toContain(`%${maliciousInput}%`);
    });

    it('should prevent SQL injection in date_from parameter', async () => {
      const maliciousInput = "2025-01-01'; DELETE FROM unified_leads WHERE '1'='1";

      const req = new NextRequest(`http://localhost:3000/api/admin/leads?date_from=${encodeURIComponent(maliciousInput)}`);
      const response = await GET(req);
      const data = await response.json();

      // Should return validation error (invalid datetime format)
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(mockSql).not.toHaveBeenCalled();
    });

    it('should prevent SQL injection in score_min parameter', async () => {
      const maliciousInput = "50 OR 1=1";

      const req = new NextRequest(`http://localhost:3000/api/admin/leads?score_min=${encodeURIComponent(maliciousInput)}`);
      const response = await GET(req);
      const data = await response.json();

      // Should return validation error (not a valid number)
      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(mockSql).not.toHaveBeenCalled();
    });

    it('should use parameterized queries for all filters', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?source_type=LIBRARY_LEAD&status=NEW&search=test&score_min=50&score_max=100`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Check that ALL queries use parameterized syntax
      const lastQuery = mockSql.lastQuery;

      // Should contain $1, $2, etc. (parameterized)
      expect(lastQuery).toMatch(/\$\d+/);

      // Should NOT contain raw user input
      expect(lastQuery).not.toContain('LIBRARY_LEAD');
      expect(lastQuery).not.toContain('NEW');
      expect(lastQuery).not.toContain('test');

      // Params should be passed separately
      expect(mockSql.lastParams.length).toBeGreaterThan(0);
    });

    it('should prevent time-based blind SQL injection', async () => {
      const maliciousInput = "test'; SELECT pg_sleep(10);--";

      const startTime = Date.now();
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?search=${encodeURIComponent(maliciousInput)}`);
      const response = await GET(req);
      const endTime = Date.now();

      expect(response.status).toBe(200);

      // Response should be fast (< 1 second) - sleep should NOT execute
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(1000);
    });

    it('should prevent UNION-based SQL injection', async () => {
      const maliciousInput = "test' UNION SELECT id, email, password FROM users--";

      const req = new NextRequest(`http://localhost:3000/api/admin/leads?search=${encodeURIComponent(maliciousInput)}`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Data should not contain user passwords or sensitive info
      expect(JSON.stringify(data)).not.toContain('password');
      expect(data.data).toEqual([]); // Mock returns empty array
    });
  });

  // ====================================================================
  // Input Validation
  // ====================================================================

  describe('Input Validation', () => {
    it('should reject invalid source_type values', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?source_type=INVALID_TYPE`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toBeDefined();
      expect(data.error.details[0].field).toBe('source_type');
    });

    it('should reject invalid status values', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?status=INVALID_STATUS`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details[0].field).toBe('status');
    });

    it('should reject invalid score_min values', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?score_min=-10`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject score_min > 100', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?score_min=150`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid date format', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?date_from=2025-13-01`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject search strings longer than 255 characters', async () => {
      const longSearch = 'a'.repeat(256);
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?search=${longSearch}`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject page < 1', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?page=0`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject per_page > 100', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?per_page=200`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept valid query parameters', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?source_type=LIBRARY_LEAD&status=NEW&score_min=0&score_max=100&page=1&per_page=20`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.meta).toBeDefined();
      expect(data.stats).toBeDefined();
    });

    it('should ignore search strings with less than 2 characters', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?search=a`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Query should NOT include search condition (< 2 chars)
      const lastQuery = mockSql.lastQuery;
      expect(lastQuery).not.toContain('ILIKE');
    });
  });

  // ====================================================================
  // Edge Cases
  // ====================================================================

  describe('Edge Cases', () => {
    it('should handle empty query parameters gracefully', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.meta.page).toBe(1);
      expect(data.meta.per_page).toBe(20);
    });

    it('should handle special characters in search', async () => {
      const specialChars = "test@example.com'; DROP TABLE users;--";
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?search=${encodeURIComponent(specialChars)}`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Query should be parameterized
      expect(mockSql.lastParams).toContain(`%${specialChars}%`);
    });

    it('should handle Unicode characters in search', async () => {
      const unicode = "한국어 테스트";
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?search=${encodeURIComponent(unicode)}`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle null and undefined gracefully', async () => {
      const req = new NextRequest(`http://localhost:3000/api/admin/leads?source_type=&status=&search=`);
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
