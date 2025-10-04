/**
 * Test Protected API Route
 *
 * Purpose: Demonstrate auth middleware usage
 * Security: JWT authentication required
 * Role: Any authenticated admin user
 *
 * This is a test endpoint to verify that the auth middleware works correctly.
 * DELETE THIS FILE in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';

/**
 * GET /api/admin/test
 *
 * Test endpoint - Returns authenticated user info
 * Requires: JWT token
 */

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (request: NextRequest, { user }) => {
  return NextResponse.json({
    success: true,
    data: {
      message: 'Authentication successful!',
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/admin/test
 *
 * Test endpoint - Requires CONTENT_MANAGER role or higher
 * Requires: JWT token + CONTENT_MANAGER role
 */
export const POST = withAuth(
  async (request: NextRequest, { user }) => {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      data: {
        message: 'You have CONTENT_MANAGER permission!',
        user: {
          id: user.userId,
          email: user.email,
          role: user.role,
        },
        receivedData: body,
        timestamp: new Date().toISOString(),
      },
    });
  },
  { requiredRole: 'CONTENT_MANAGER' }
);
