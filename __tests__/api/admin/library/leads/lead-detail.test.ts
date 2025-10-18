/**
 * Unit Tests: Admin Lead Detail API
 *
 * Tests for GET/PUT/DELETE operations on /api/admin/library/leads/[id]
 *
 * Coverage:
 * - GET: Retrieve single lead with enriched data
 * - PUT: Update lead (status, score, notes, assigned_to)
 * - DELETE: Remove lead
 * - Error cases: 400 (invalid UUID), 404 (not found), 500 (server error)
 *
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/admin/library/leads/[id]/route';

// Mock Neon database
jest.mock('@neondatabase/serverless', () => {
  const mockQuery = jest.fn();
  return {
    neon: jest.fn(() => ({
      query: mockQuery,
    })),
  };
});

// Get mock instance
import { neon } from '@neondatabase/serverless';
const mockSql = neon(process.env.DATABASE_URL!) as any;

describe('Admin Lead Detail API', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/admin/library/leads/[id]', () => {
    it('should return lead with enriched data (200)', async () => {
      // Mock database response with enriched data
      const mockLead = {
        id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f',
        library_item_id: '9fd8f08d-2d10-43e9-9a30-6dfc715ee05c',
        library_item_title: 'Carbon Accounting Guide 2025',
        library_item_slug: 'carbon-accounting-guide-2025',
        library_item_file_type: 'PDF',
        library_item_category: 'WHITEPAPER',
        company_name: 'Test Company Ltd',
        contact_name: 'John Doe',
        email: 'john@testcompany.com',
        phone: '+82-10-1234-5678',
        job_title: 'Sustainability Manager',
        industry: 'Manufacturing',
        lead_status: 'QUALIFIED',
        lead_score: 75,
        assigned_to: '78253ede-01ac-4856-a0fd-1e1bbd1eef35',
        assigned_to_name: 'Admin User',
        assigned_to_email: 'admin@glec.io',
        notes: 'Very interested in our solution',
        marketing_consent: true,
        privacy_consent: true,
        email_sent: true,
        email_opened: true,
        download_link_clicked: true,
        download_link_clicked_at: '2025-10-18T06:00:00.000Z',
        created_at: '2025-10-18T05:00:00.000Z',
        updated_at: '2025-10-18T06:00:00.000Z',
      };

      mockSql.query.mockResolvedValue([mockLead]);

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f');
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('b7f6c547-ddbb-434b-916c-1230e4acf76f');
      expect(data.data.library_item.title).toBe('Carbon Accounting Guide 2025');
      expect(data.data.library_item.slug).toBe('carbon-accounting-guide-2025');
      expect(data.data.assigned_to_user.name).toBe('Admin User');
      expect(data.data.assigned_to_user.email).toBe('admin@glec.io');
      expect(data.data.company_name).toBe('Test Company Ltd');
      expect(data.data.lead_status).toBe('QUALIFIED');
      expect(data.data.lead_score).toBe(75);

      // Verify SQL query was called with correct parameters
      expect(mockSql.query).toHaveBeenCalledTimes(1);
      expect(mockSql.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE ll.id = $1::uuid'),
        ['b7f6c547-ddbb-434b-916c-1230e4acf76f']
      );
    });

    it('should return 404 when lead not found', async () => {
      mockSql.query.mockResolvedValue([]); // Empty result

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/404-not-found-uuid-xxxxxxxxxxxxxxx');
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('LEAD_NOT_FOUND');
      expect(data.error.message).toContain('찾을 수 없습니다');
    });

    it('should return 400 for invalid UUID format', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/invalid-uuid-format');
      const context = {
        params: Promise.resolve({ id: 'invalid-uuid-format' }),
      };

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_ID');
      expect(data.error.message).toContain('유효하지 않은');

      // Should not call database for invalid UUID
      expect(mockSql.query).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully (500)', async () => {
      mockSql.query.mockRejectedValue(new Error('Database connection failed'));

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f');
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should handle lead without assigned user', async () => {
      const mockLead = {
        id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f',
        library_item_id: '9fd8f08d-2d10-43e9-9a30-6dfc715ee05c',
        library_item_title: 'Test Item',
        company_name: 'Test Company',
        contact_name: 'John Doe',
        email: 'john@testcompany.com',
        lead_status: 'NEW',
        lead_score: 50,
        assigned_to: null, // No assigned user
        assigned_to_name: null,
        assigned_to_email: null,
        email_sent: false,
        email_opened: false,
        download_link_clicked: false,
        created_at: '2025-10-18T05:00:00.000Z',
        updated_at: '2025-10-18T05:00:00.000Z',
      };

      mockSql.query.mockResolvedValue([mockLead]);

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f');
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await GET(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.assigned_to_user).toBeNull();
    });
  });

  describe('PUT /api/admin/library/leads/[id]', () => {
    it('should update lead status (200)', async () => {
      // Mock existence check
      mockSql.query
        .mockResolvedValueOnce([{ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }]) // Existence check
        .mockResolvedValueOnce([
          // Update result
          {
            id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f',
            lead_status: 'CONTACTED',
            updated_at: '2025-10-18T07:00:00.000Z',
          },
        ]);

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'PUT',
        body: JSON.stringify({ lead_status: 'CONTACTED' }),
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await PUT(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('업데이트');
      expect(data.data.lead_status).toBe('CONTACTED');

      // Should call database twice (existence check + update)
      expect(mockSql.query).toHaveBeenCalledTimes(2);
    });

    it('should update lead score (200)', async () => {
      mockSql.query
        .mockResolvedValueOnce([{ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }])
        .mockResolvedValueOnce([
          {
            id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f',
            lead_score: 85,
          },
        ]);

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'PUT',
        body: JSON.stringify({ lead_score: 85 }),
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await PUT(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.lead_score).toBe(85);
    });

    it('should reject invalid lead_status (400)', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'PUT',
        body: JSON.stringify({ lead_status: 'INVALID_STATUS' }),
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await PUT(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');

      // Should not call database for invalid input
      expect(mockSql.query).not.toHaveBeenCalled();
    });

    it('should reject invalid lead_score (400)', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'PUT',
        body: JSON.stringify({ lead_score: 150 }), // Max is 100
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await PUT(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details).toBeDefined();
    });

    it('should reject invalid assigned_to UUID (400)', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'PUT',
        body: JSON.stringify({ assigned_to: 'not-a-uuid' }),
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await PUT(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when updating non-existent lead', async () => {
      mockSql.query.mockResolvedValue([]); // Lead not found

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'PUT',
        body: JSON.stringify({ lead_status: 'QUALIFIED' }),
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await PUT(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('LEAD_NOT_FOUND');
    });

    it('should update multiple fields at once (200)', async () => {
      mockSql.query
        .mockResolvedValueOnce([{ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }])
        .mockResolvedValueOnce([
          {
            id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f',
            lead_status: 'QUALIFIED',
            lead_score: 90,
            notes: 'Very interested',
          },
        ]);

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'PUT',
        body: JSON.stringify({
          lead_status: 'QUALIFIED',
          lead_score: 90,
          notes: 'Very interested',
        }),
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await PUT(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.lead_status).toBe('QUALIFIED');
      expect(data.data.lead_score).toBe(90);
      expect(data.data.notes).toBe('Very interested');
    });
  });

  describe('DELETE /api/admin/library/leads/[id]', () => {
    it('should delete lead (200)', async () => {
      // Mock existence check
      mockSql.query
        .mockResolvedValueOnce([
          {
            id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f',
            email: 'john@testcompany.com',
          },
        ])
        .mockResolvedValueOnce(undefined); // Delete result (no return value)

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'DELETE',
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('삭제');

      // Should call database twice (existence check + delete)
      expect(mockSql.query).toHaveBeenCalledTimes(2);
      expect(mockSql.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM library_leads'),
        ['b7f6c547-ddbb-434b-916c-1230e4acf76f']
      );
    });

    it('should return 404 when deleting non-existent lead', async () => {
      mockSql.query.mockResolvedValue([]); // Lead not found

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'DELETE',
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('LEAD_NOT_FOUND');

      // Should only call existence check, not delete
      expect(mockSql.query).toHaveBeenCalledTimes(1);
    });

    it('should return 400 for invalid UUID format', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/invalid-uuid', {
        method: 'DELETE',
      });
      const context = {
        params: Promise.resolve({ id: 'invalid-uuid' }),
      };

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_ID');

      // Should not call database for invalid UUID
      expect(mockSql.query).not.toHaveBeenCalled();
    });

    it('should handle database errors during deletion (500)', async () => {
      mockSql.query
        .mockResolvedValueOnce([{ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f', email: 'john@testcompany.com' }])
        .mockRejectedValueOnce(new Error('Database error during delete'));

      const req = new NextRequest('http://localhost:3000/api/admin/library/leads/b7f6c547-ddbb-434b-916c-1230e4acf76f', {
        method: 'DELETE',
      });
      const context = {
        params: Promise.resolve({ id: 'b7f6c547-ddbb-434b-916c-1230e4acf76f' }),
      };

      const response = await DELETE(req, context);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
