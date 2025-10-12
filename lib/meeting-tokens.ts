/**
 * Meeting Proposal Token Utilities
 * Purpose: 보안 토큰 생성 및 검증 (미팅 제안 이메일 링크용)
 */

import crypto from 'crypto';

/**
 * 보안 토큰 생성 (64자, URL-safe)
 */
export function generateMeetingToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 토큰 만료 시간 계산 (기본 7일)
 */
export function getTokenExpiry(daysFromNow: number = 7): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysFromNow);
  return expiry;
}

/**
 * 미팅 예약 URL 생성
 * - 우선순위: baseUrl > SITE_URL > NEXT_PUBLIC_SITE_URL > https://glec.io
 * - 개발 환경: .env.local에서 SITE_URL=http://localhost:3000 설정
 * - 프로덕션: Vercel에서 SITE_URL=https://glec-website.vercel.app 설정
 *
 * Note: NEXT_PUBLIC_* 변수는 클라이언트 코드용이므로, 서버 사이드 API에서는 SITE_URL 사용
 */
export function generateBookingUrl(token: string, baseUrl?: string): string {
  const base = (
    baseUrl ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://glec.io'
  ).trim(); // Remove any whitespace/newlines

  return `${base}/meetings/schedule/${token}`;
}

/**
 * 토큰 검증 (형식 체크)
 */
export function isValidTokenFormat(token: string): boolean {
  // 64자 hex string
  return /^[a-f0-9]{64}$/i.test(token);
}
