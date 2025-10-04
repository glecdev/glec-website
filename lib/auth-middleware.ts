/**
 * API Route Authentication Middleware
 *
 * Based on: GLEC-Admin-Architecture.md (JWT Authentication)
 * Security: CLAUDE.md - JWT validation, role-based access control
 * Standards: GLEC-API-Specification.yaml (Error responses)
 *
 * Purpose: Protect admin API routes with JWT authentication
 *
 * Usage:
 * ```typescript
 * import { withAuth } from '@/lib/auth-middleware';
 *
 * export const POST = withAuth(async (request, { user }) => {
 *   // user is available and authenticated
 *   return NextResponse.json({ success: true });
 * }, { requiredRole: 'CONTENT_MANAGER' });
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hasPermission, type JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

export interface AuthOptions {
  /**
   * Minimum required role (optional)
   * If specified, user must have this role or higher
   */
  requiredRole?: JWTPayload['role'];
}

export interface AuthHandler {
  (request: NextRequest, context: { user: JWTPayload }): Promise<NextResponse> | NextResponse;
}

/**
 * Extract JWT token from Authorization header
 *
 * Supports:
 * - Authorization: Bearer <token>
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  // Bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Authentication middleware wrapper for API routes
 *
 * @param handler - API route handler (receives user in context)
 * @param options - Authentication options (requiredRole)
 * @returns Wrapped handler with authentication
 *
 * @example
 * ```typescript
 * export const POST = withAuth(
 *   async (request, { user }) => {
 *     // user.id, user.email, user.role are available
 *     return NextResponse.json({ success: true });
 *   },
 *   { requiredRole: 'CONTENT_MANAGER' }
 * );
 * ```
 */
export function withAuth(handler: AuthHandler, options: AuthOptions = {}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract token
      const token = extractToken(request);

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required. Please provide a valid JWT token.',
            },
          },
          { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
        );
      }

      // Verify token
      const user = verifyToken(token);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired JWT token.',
            },
          },
          { status: 401, headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' } }
        );
      }

      // Check role permission
      if (options.requiredRole && !hasPermission(user.role, options.requiredRole)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: `Access denied. Required role: ${options.requiredRole}, your role: ${user.role}`,
            },
          },
          { status: 403 }
        );
      }

      // Call handler with authenticated user
      return handler(request, { user });
    } catch (error) {
      console.error('[Auth Middleware] Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred during authentication.',
          },
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Type guard to check if request is authenticated
 * (Helper for TypeScript type narrowing)
 */
export function isAuthenticatedRequest(
  request: NextRequest | AuthenticatedRequest
): request is AuthenticatedRequest {
  return 'user' in request;
}
