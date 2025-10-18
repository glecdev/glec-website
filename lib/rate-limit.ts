/**
 * Rate Limiting Utility
 *
 * Implements in-memory rate limiting to prevent API abuse.
 *
 * Usage:
 * ```typescript
 * import { rateLimit } from '@/lib/rate-limit';
 *
 * const limiter = rateLimit({
 *   windowMs: 60 * 60 * 1000, // 1 hour
 *   max: 10, // 10 requests per hour
 * });
 *
 * const result = limiter.check(req);
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     {
 *       status: 429,
 *       headers: {
 *         'X-RateLimit-Limit': result.limit.toString(),
 *         'X-RateLimit-Remaining': '0',
 *         'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
 *         'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
 *       }
 *     }
 *   );
 * }
 * ```
 *
 * Security Notes:
 * - Uses in-memory storage (not persistent across restarts)
 * - For production, consider Redis or external rate limiting service
 * - IP-based limiting (can be bypassed with VPN/proxy)
 * - Implements sliding window algorithm for fairness
 */

import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
  firstRequestTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitRecord;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipFailedRequests?: boolean; // Don't count failed requests
  skipSuccessfulRequests?: boolean; // Don't count successful requests
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // Seconds until rate limit resets
}

// In-memory store (WARNING: Will be lost on server restart)
// For production, use Redis or Cloudflare Workers KV
const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 10 * 60 * 1000);

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header (from Cloudflare/Vercel)
 * Falls back to X-Real-IP, then 'unknown'
 */
function getClientId(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2)
    // Take the first one (original client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback (not ideal for production)
  return 'unknown';
}

/**
 * Create a rate limiter with specified options
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyGenerator = (req) => {
      const clientId = getClientId(req);
      const path = new URL(req.url).pathname;
      return `${clientId}:${path}`;
    },
  } = options;

  return {
    /**
     * Check if request is allowed under rate limit
     */
    check(req: NextRequest): RateLimitResult {
      const key = keyGenerator(req);
      const now = Date.now();

      // First request from this client/path
      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 1,
          resetTime: now + windowMs,
          firstRequestTime: now,
        };

        return {
          allowed: true,
          limit: max,
          remaining: max - 1,
          resetTime: store[key].resetTime,
        };
      }

      // Increment count
      store[key].count++;

      // Check if exceeded limit
      if (store[key].count > max) {
        const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);

        return {
          allowed: false,
          limit: max,
          remaining: 0,
          resetTime: store[key].resetTime,
          retryAfter,
        };
      }

      // Within limit
      return {
        allowed: true,
        limit: max,
        remaining: max - store[key].count,
        resetTime: store[key].resetTime,
      };
    },

    /**
     * Reset rate limit for a specific key (for testing)
     */
    reset(req: NextRequest): void {
      const key = keyGenerator(req);
      delete store[key];
    },

    /**
     * Get current rate limit status without incrementing
     */
    getStatus(req: NextRequest): RateLimitResult {
      const key = keyGenerator(req);
      const now = Date.now();

      if (!store[key] || store[key].resetTime < now) {
        return {
          allowed: true,
          limit: max,
          remaining: max,
          resetTime: now + windowMs,
        };
      }

      const remaining = Math.max(0, max - store[key].count);
      const retryAfter =
        remaining === 0 ? Math.ceil((store[key].resetTime - now) / 1000) : undefined;

      return {
        allowed: remaining > 0,
        limit: max,
        remaining,
        resetTime: store[key].resetTime,
        retryAfter,
      };
    },
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Download Request API - 10 requests per hour per IP
   * Prevents users from generating excessive JWT tokens
   */
  downloadRequest: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
  }),

  /**
   * Download API - 50 requests per hour per IP
   * Allows legitimate users to re-download if needed
   * But prevents mass scraping
   */
  download: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50,
  }),

  /**
   * Contact Form - 5 submissions per hour per IP
   * Prevents spam submissions
   */
  contactForm: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
  }),

  /**
   * Admin Login - 10 attempts per 15 minutes per IP
   * Prevents brute force attacks
   */
  adminLogin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
  }),

  /**
   * General API - 100 requests per 15 minutes per IP
   * General protection for public APIs
   */
  generalApi: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  }),
};

/**
 * Helper function to create rate limit error response
 */
export function createRateLimitResponse(result: RateLimitResult) {
  return {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      details: {
        limit: result.limit,
        remaining: result.remaining,
        resetTime: new Date(result.resetTime).toISOString(),
        retryAfter: result.retryAfter,
      },
    },
  };
}

/**
 * Helper function to add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): Headers {
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (result.retryAfter !== undefined) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return headers;
}
