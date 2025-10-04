/**
 * Authentication Utilities
 *
 * Based on: GLEC-Admin-Architecture.md (Section 3: Authentication)
 * Security: CLAUDE.md - No hardcoded credentials, environment variables only
 * Purpose: JWT-based authentication for admin users
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'ANALYST';
  iat?: number;
  exp?: number;
}

/**
 * Get JWT secret from environment
 * Throws error if not set (fail-fast principle)
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set in environment variables. ' +
      'Please add it to your .env.local file.'
    );
  }

  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security. ' +
      'Current length: ' + secret.length
    );
  }

  return secret;
}

/**
 * Generate JWT token
 *
 * @param payload - User information to encode
 * @param expiresIn - Token expiration time (default: 7 days)
 * @returns Signed JWT token
 */
export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn: string = '7d'
): string {
  const secret = getJWTSecret();

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  });
}

/**
 * Verify JWT token
 *
 * @param token - JWT token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    // Token is invalid, expired, or malformed
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[Auth] Invalid token:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error('[Auth] Token expired:', error.message);
    } else {
      console.error('[Auth] Token verification error:', error);
    }

    return null;
  }
}

/**
 * Hash password using bcrypt
 *
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // OWASP recommendation
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 *
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if password matches, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extract token from Authorization header
 *
 * @param authHeader - Authorization header value (e.g., "Bearer token123")
 * @returns Token string or null if invalid format
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Validate user role has required permission
 *
 * @param userRole - User's role from JWT
 * @param requiredRole - Minimum required role
 * @returns True if user has permission
 */
export function hasPermission(
  userRole: JWTPayload['role'],
  requiredRole: JWTPayload['role']
): boolean {
  const roleHierarchy: Record<JWTPayload['role'], number> = {
    SUPER_ADMIN: 3,
    CONTENT_MANAGER: 2,
    ANALYST: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
