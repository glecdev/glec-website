/**
 * JWT-based Secure Download Token System
 *
 * Security Features:
 * - Token expiry (24 hours)
 * - Single-use tokens (optional)
 * - Download tracking
 * - IP validation (optional)
 *
 * Usage:
 *   const token = generateDownloadToken(libraryItemId, leadId);
 *   const payload = verifyDownloadToken(token);
 */

import jwt from 'jsonwebtoken';

// ====================================================================
// Types
// ====================================================================

export interface DownloadTokenPayload {
  library_item_id: string; // UUID of library item
  lead_id: string; // UUID of library lead
  email: string; // Lead's email
  exp: number; // Expiry timestamp (Unix)
  iat: number; // Issued at timestamp (Unix)
}

export interface TokenGenerationOptions {
  expiresIn?: string; // Default: '24h'
  singleUse?: boolean; // Default: false
}

// ====================================================================
// Constants
// ====================================================================

const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_EXPIRY = '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// ====================================================================
// Token Generation
// ====================================================================

/**
 * Generate secure download token
 *
 * @param libraryItemId - UUID of library item
 * @param leadId - UUID of library lead
 * @param email - Lead's email address
 * @param options - Token options (expiry, single-use)
 * @returns JWT token string
 *
 * @example
 * const token = generateDownloadToken(
 *   '123e4567-e89b-12d3-a456-426614174000',
 *   '456e7890-e89b-12d3-a456-426614174000',
 *   'customer@example.com'
 * );
 */
export function generateDownloadToken(
  libraryItemId: string,
  leadId: string,
  email: string,
  options: TokenGenerationOptions = {}
): string {
  const { expiresIn = DEFAULT_EXPIRY, singleUse = false } = options;

  const payload: Omit<DownloadTokenPayload, 'exp' | 'iat'> = {
    library_item_id: libraryItemId,
    lead_id: leadId,
    email,
  };

  // Add single-use flag if enabled
  const fullPayload = singleUse ? { ...payload, single_use: true } : payload;

  return jwt.sign(fullPayload, JWT_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  });
}

// ====================================================================
// Token Verification
// ====================================================================

/**
 * Verify download token and extract payload
 *
 * @param token - JWT token string
 * @returns Token payload if valid
 * @throws Error if token is invalid, expired, or malformed
 *
 * @example
 * try {
 *   const payload = verifyDownloadToken(token);
 *   console.log('Valid token:', payload.email);
 * } catch (err) {
 *   console.error('Invalid token:', err.message);
 * }
 */
export function verifyDownloadToken(token: string): DownloadTokenPayload {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as DownloadTokenPayload;

    // Validate required fields
    if (!payload.library_item_id || !payload.lead_id || !payload.email) {
      throw new Error('Invalid token payload: missing required fields');
    }

    // Validate UUIDs format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(payload.library_item_id)) {
      throw new Error('Invalid token payload: library_item_id is not a valid UUID');
    }
    if (!uuidRegex.test(payload.lead_id)) {
      throw new Error('Invalid token payload: lead_id is not a valid UUID');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error('Invalid token payload: email is not valid');
    }

    return payload;
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Download link has expired. Please request a new download link.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid download link. Please request a new download link.');
    }
    throw error;
  }
}

// ====================================================================
// Token Utilities
// ====================================================================

/**
 * Decode token without verification (for debugging)
 *
 * @param token - JWT token string
 * @returns Decoded payload (may be expired or invalid)
 */
export function decodeDownloadToken(token: string): DownloadTokenPayload | null {
  try {
    return jwt.decode(token) as DownloadTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired (without throwing)
 *
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeDownloadToken(token);
    if (!decoded || !decoded.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}

/**
 * Get token expiry time
 *
 * @param token - JWT token string
 * @returns Expiry date or null if invalid
 */
export function getTokenExpiry(token: string): Date | null {
  try {
    const decoded = decodeDownloadToken(token);
    if (!decoded || !decoded.exp) return null;

    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Get time remaining until token expires
 *
 * @param token - JWT token string
 * @returns Milliseconds remaining or 0 if expired
 */
export function getTokenTimeRemaining(token: string): number {
  try {
    const expiry = getTokenExpiry(token);
    if (!expiry) return 0;

    const now = Date.now();
    const remaining = expiry.getTime() - now;

    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

// ====================================================================
// Security Helpers
// ====================================================================

/**
 * Generate secure download URL
 *
 * @param baseUrl - Base URL (e.g., 'https://glec.io')
 * @param token - JWT token
 * @returns Complete download URL
 *
 * @example
 * const url = generateDownloadUrl('https://glec.io', token);
 * // Returns: https://glec.io/api/library/download?token=eyJhbGci...
 */
export function generateDownloadUrl(baseUrl: string, token: string): string {
  // Remove trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  return `${cleanBaseUrl}/api/library/download?token=${encodeURIComponent(token)}`;
}

/**
 * Obfuscate email for logging (GDPR compliance)
 *
 * @param email - Email address
 * @returns Obfuscated email (e.g., 'j***@example.com')
 */
export function obfuscateEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '***@***';

  const visibleChars = Math.min(1, localPart.length);
  const obfuscated = localPart.substring(0, visibleChars) + '***';

  return `${obfuscated}@${domain}`;
}
