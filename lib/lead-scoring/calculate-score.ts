/**
 * Unified Lead Scoring Logic
 *
 * Centralized scoring calculation for all lead sources
 * Used by:
 * - app/api/library/download/route.ts (initial score)
 * - app/api/webhooks/resend/route.ts (recalculation)
 * - scripts/recalculate-all-scores.ts (batch update)
 */

// ============================================================
// TYPES
// ============================================================

export interface LibraryLeadData {
  email: string;
  phone?: string | null;
  marketing_consent?: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  email_opened?: boolean;
  download_link_clicked?: boolean;
  created_at: Date | string;
  library_category?: string;
}

export interface LeadScoreResult {
  score: number;
  breakdown: {
    source_type: number;
    library_value: number;
    email_engagement: number;
    company_size: number;
    marketing_consent: number;
    phone_provided: number;
    utm_tracking: number;
    time_penalty: number;
  };
}

// ============================================================
// SCORING FUNCTIONS
// ============================================================

/**
 * Calculate lead score for library downloads (0-100)
 */
export function calculateLibraryLeadScore(lead: LibraryLeadData): LeadScoreResult {
  const breakdown = {
    source_type: 0,
    library_value: 0,
    email_engagement: 0,
    company_size: 0,
    marketing_consent: 0,
    phone_provided: 0,
    utm_tracking: 0,
    time_penalty: 0,
  };

  // 1. Source Type (30점) - Library download is high intent
  breakdown.source_type = 30;

  // 2. Library Item Value (20점)
  const category = lead.library_category?.toUpperCase();
  if (category === 'FRAMEWORK') breakdown.library_value = 20;
  else if (category === 'WHITEPAPER') breakdown.library_value = 15;
  else if (category === 'CASE_STUDY') breakdown.library_value = 10;
  else breakdown.library_value = 5;

  // 3. Email Engagement (30점)
  if (lead.email_opened) breakdown.email_engagement += 10;
  if (lead.download_link_clicked) breakdown.email_engagement += 20;

  // 4. Company Size (20점) - infer from email domain
  const domain = lead.email.split('@')[1];
  breakdown.company_size = inferCompanySizeScore(domain);

  // 5. Marketing Consent (10점)
  if (lead.marketing_consent) breakdown.marketing_consent = 10;

  // 6. Phone Provided (10점)
  if (lead.phone) breakdown.phone_provided = 10;

  // 7. UTM Tracking (10점) - indicates marketing campaign engagement
  if (lead.utm_source || lead.utm_medium || lead.utm_campaign) {
    breakdown.utm_tracking = 10;
  }

  // 8. Time Factor - deduct 10 points if no action within 30 days
  const createdAt = typeof lead.created_at === 'string' ? new Date(lead.created_at) : lead.created_at;
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated > 30 && !lead.email_opened) {
    breakdown.time_penalty = -10;
  }

  // Calculate total score
  const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  // Clamp to 0-100
  const score = Math.max(0, Math.min(100, totalScore));

  return { score, breakdown };
}

/**
 * Infer company size score from email domain
 */
export function inferCompanySizeScore(domain: string): number {
  // Fortune 500 / Large corporations (20점)
  const largeCorporations = [
    'samsung.com',
    'lg.com',
    'sk.com',
    'hyundai.com',
    'posco.com',
    'hanwha.com',
    'lotte.com',
    'gs.com',
    'kt.com',
    'skt.com',
  ];
  if (largeCorporations.some((corp) => domain.includes(corp))) return 20;

  // Logistics companies - high value target (18점)
  const logisticsCompanies = [
    'dhl.com',
    'fedex.com',
    'ups.com',
    'cjlogistics.com',
    'hanjin.com',
    'kmlogis.com',
    'pantos.com',
    'lotte-glogis.com',
  ];
  if (logisticsCompanies.some((log) => domain.includes(log))) return 18;

  // Generic email domains (0점)
  const genericDomains = [
    'gmail.com',
    'naver.com',
    'daum.net',
    'hotmail.com',
    'outlook.com',
    'kakao.com',
    'icloud.com',
  ];
  if (genericDomains.includes(domain)) return 0;

  // SMB / Corporate email (10점)
  return 10;
}

/**
 * Get human-readable score interpretation
 */
export function interpretScore(score: number): {
  grade: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  action: string;
} {
  if (score >= 80) {
    return {
      grade: 'Hot Lead',
      priority: 'P0',
      action: 'Immediate sales outreach (within 2 hours)',
    };
  } else if (score >= 60) {
    return {
      grade: 'Warm Lead',
      priority: 'P1',
      action: 'Schedule demo within 3 days',
    };
  } else if (score >= 40) {
    return {
      grade: 'Cold Lead',
      priority: 'P2',
      action: 'Nurture sequence (emails)',
    };
  } else {
    return {
      grade: 'Low Quality',
      priority: 'P3',
      action: 'Monitor only',
    };
  }
}
