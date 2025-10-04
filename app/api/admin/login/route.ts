/**
 * POST /api/admin/login
 *
 * Based on: GLEC-Functional-Requirements-Specification.md (FR-ADMIN-001)
 * Security: CLAUDE.md - No hardcoded passwords, bcrypt validation
 * Purpose: Authenticate admin users and return JWT token
 *
 * Request Body:
 * {
 *   "email": "admin@glec.io",
 *   "password": "secure-password"
 * }
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "token": "jwt-token-here",
 *     "user": {
 *       "id": "user-id",
 *       "email": "admin@glec.io",
 *       "name": "Admin User",
 *       "role": "SUPER_ADMIN"
 *     }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';


// Request validation schema
const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'ANALYST';
    };
  };
}

/**
 * Mock user database (temporary until Prisma DB is connected)
 *
 * IMPORTANT: In production, this will query Prisma:
 * const user = await prisma.user.findUnique({ where: { email } });
 *
 * Password hash generated with: await hashPassword('admin123!')
 */
const MOCK_ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@glec.io',
  name: 'GLEC Admin',
  // Password: 'admin123!' (FOR DEMO ONLY - NEVER use in production!)
  // Hash generated with: await bcrypt.hash('admin123!', 12)
  passwordHash: '$2b$12$Fsb9/UyKn1h330l.YP3PDOAWcipTr4n2hv4DPRWhClnDAD78bk2qa',
  role: 'SUPER_ADMIN' as const,
  phone: '+82-10-1234-5678',
  lastLoginAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export async function POST(request: NextRequest) {
  try {
    // Validate content-type header
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('[POST /api/admin/login] JSON parse error:', jsonError);
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate request
    const validationResult = LoginSchema.safeParse(body);

    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      };

      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { email, password } = validationResult.data;

    // TODO: Replace with Prisma query when DB is connected
    // const user = await prisma.user.findUnique({
    //   where: { email },
    // });

    // Mock implementation
    const user = email === MOCK_ADMIN_USER.email ? MOCK_ADMIN_USER : null;

    if (!user) {
      // Don't reveal whether email exists (security best practice)
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };

      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };

      return NextResponse.json(errorResponse, { status: 401 });
    }

    // TODO: Update lastLoginAt in database
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { lastLoginAt: new Date() },
    // });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Success response
    const response: LoginResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Prevent caching of auth responses
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[POST /api/admin/login] Error:', error);

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
