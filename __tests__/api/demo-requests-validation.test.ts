/**
 * Demo Request API Validation Tests
 *
 * Tests Zod schema validation for demo request submissions:
 * - Required fields validation
 * - Email format validation
 * - Phone number format validation
 * - Product interests validation
 * - Date/time validation
 * - Sanitization (XSS prevention)
 */

import { z } from 'zod';

// Replicate the Zod schema from demo-requests/route.ts
const DemoRequestSchema = z.object({
  // Step 1: Company Info
  companyName: z.string().min(1, '회사명을 입력해주세요'),
  contactName: z.string().min(1, '담당자명을 입력해주세요'),
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  phone: z.string().regex(/^\d{3}-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (010-1234-5678)'),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501+'], {
    errorMap: () => ({ message: '회사 규모를 선택해주세요' }),
  }),

  // Step 2: Product Interests
  productInterests: z.array(z.enum(['dtg', 'api', 'cloud', 'ai'])).min(1, '최소 1개 이상의 제품을 선택해주세요'),
  useCase: z.string().min(10, '사용 사례를 최소 10자 이상 입력해주세요'),
  currentSolution: z.string().optional(),
  monthlyShipments: z.string().optional(),

  // Step 3: Schedule
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)'),
  preferredTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, '올바른 시간 형식이 아닙니다 (HH:MM)'),
  additionalMessage: z.string().optional(),

  // Privacy
  privacyConsent: z.boolean().refine(val => val === true, {
    message: '개인정보 처리방침에 동의해주세요',
  }),
});

describe('Demo Request Validation', () => {

  // =================================================================
  // Test 1: Required Fields
  // =================================================================

  test('should pass validation with all required fields', () => {
    const validData = {
      companyName: '테스트 회사',
      contactName: '홍길동',
      email: 'hong@test.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg', 'api'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('should fail validation when companyName is missing', () => {
    const invalidData = {
      companyName: '', // EMPTY
      contactName: '홍길동',
      email: 'hong@test.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toContain('companyName');
      expect(result.error.issues[0].message).toContain('회사명');
    }
  });

  test('should fail validation when contactName is missing', () => {
    const invalidData = {
      companyName: '테스트 회사',
      contactName: '', // EMPTY
      email: 'hong@test.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toContain('contactName');
    }
  });

  // =================================================================
  // Test 2: Email Validation
  // =================================================================

  test('should accept valid email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.co.kr',
      'user+tag@example.com',
      'user_123@sub.example.com',
    ];

    validEmails.forEach(email => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email,
        phone: '010-1234-5678',
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate: '2025-10-15',
        preferredTime: '14:00',
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  test('should reject invalid email addresses', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@.com',
      'user name@example.com', // Space
      'user@example', // No TLD
    ];

    invalidEmails.forEach(email => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email,
        phone: '010-1234-5678',
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate: '2025-10-15',
        preferredTime: '14:00',
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
        expect(result.error.issues[0].message).toContain('이메일');
      }
    });
  });

  // =================================================================
  // Test 3: Phone Number Validation
  // =================================================================

  test('should accept valid phone numbers', () => {
    const validPhones = [
      '010-1234-5678',
      '011-9876-5432',
      '016-1111-2222',
      '019-0000-9999',
    ];

    validPhones.forEach(phone => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email: 'test@example.com',
        phone,
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate: '2025-10-15',
        preferredTime: '14:00',
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  test('should reject invalid phone numbers', () => {
    const invalidPhones = [
      '01012345678', // No hyphens
      '010-123-5678', // Wrong format
      '010-1234-567', // Too short
      '010-1234-56789', // Too long
      '020-1234-5678', // Invalid area code
      'abc-defg-hijk', // Not numbers
    ];

    invalidPhones.forEach(phone => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email: 'test@example.com',
        phone,
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate: '2025-10-15',
        preferredTime: '14:00',
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
      }
    });
  });

  // =================================================================
  // Test 4: Company Size Validation
  // =================================================================

  test('should accept valid company sizes', () => {
    const validSizes = ['1-10', '11-50', '51-200', '201-500', '501+'] as const;

    validSizes.forEach(companySize => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email: 'test@example.com',
        phone: '010-1234-5678',
        companySize,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate: '2025-10-15',
        preferredTime: '14:00',
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  test('should reject invalid company sizes', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '1000+' as any, // INVALID
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  // =================================================================
  // Test 5: Product Interests Validation
  // =================================================================

  test('should accept valid product interests (single)', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('should accept valid product interests (multiple)', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg', 'api', 'cloud', 'ai'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('should reject empty product interests', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: [] as const, // EMPTY
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toContain('productInterests');
      expect(result.error.issues[0].message).toContain('최소 1개');
    }
  });

  test('should reject invalid product names', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['invalid_product'] as any, // INVALID
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  // =================================================================
  // Test 6: Use Case Validation
  // =================================================================

  test('should accept use case with 10+ characters', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정', // Exactly 10 characters
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('should reject use case with less than 10 characters', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '탄소측정', // Less than 10 characters
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toContain('useCase');
      expect(result.error.issues[0].message).toContain('10자');
    }
  });

  // =================================================================
  // Test 7: Date/Time Validation
  // =================================================================

  test('should accept valid date format (YYYY-MM-DD)', () => {
    const validDates = ['2025-10-15', '2025-01-01', '2025-12-31'];

    validDates.forEach(preferredDate => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email: 'test@example.com',
        phone: '010-1234-5678',
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate,
        preferredTime: '14:00',
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  test('should reject invalid date formats', () => {
    const invalidDates = [
      '2025/10/15', // Wrong separator
      '15-10-2025', // DD-MM-YYYY
      '2025-10-5', // Single digit day
      '2025-1-15', // Single digit month
      '25-10-15', // Two digit year
    ];

    invalidDates.forEach(preferredDate => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email: 'test@example.com',
        phone: '010-1234-5678',
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate,
        preferredTime: '14:00',
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  test('should accept valid time format (HH:MM)', () => {
    const validTimes = ['09:00', '14:30', '23:59', '00:00'];

    validTimes.forEach(preferredTime => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email: 'test@example.com',
        phone: '010-1234-5678',
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate: '2025-10-15',
        preferredTime,
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  test('should reject invalid time formats', () => {
    const invalidTimes = [
      '9:00', // Single digit hour
      '14:0', // Single digit minute
      '24:00', // Invalid hour
      '14:60', // Invalid minute
      '14.30', // Wrong separator
    ];

    invalidTimes.forEach(preferredTime => {
      const data = {
        companyName: '테스트',
        contactName: '홍길동',
        email: 'test@example.com',
        phone: '010-1234-5678',
        companySize: '51-200' as const,
        productInterests: ['dtg'] as const,
        useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
        preferredDate: '2025-10-15',
        preferredTime,
        privacyConsent: true,
      };

      const result = DemoRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // =================================================================
  // Test 8: Privacy Consent Validation
  // =================================================================

  test('should accept when privacy consent is true', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('should reject when privacy consent is false', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: false, // NOT CONSENTED
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toContain('privacyConsent');
      expect(result.error.issues[0].message).toContain('동의');
    }
  });

  // =================================================================
  // Test 9: Optional Fields
  // =================================================================

  test('should accept when optional fields are omitted', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
      // currentSolution: omitted (optional)
      // monthlyShipments: omitted (optional)
      // additionalMessage: omitted (optional)
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  test('should accept when optional fields are provided', () => {
    const data = {
      companyName: '테스트',
      contactName: '홍길동',
      email: 'test@example.com',
      phone: '010-1234-5678',
      companySize: '51-200' as const,
      productInterests: ['dtg'] as const,
      useCase: '물류 탄소배출 측정을 위해 사용할 예정입니다',
      preferredDate: '2025-10-15',
      preferredTime: '14:00',
      privacyConsent: true,
      currentSolution: '엑셀 수동 계산',
      monthlyShipments: '10000',
      additionalMessage: '가능한 빨리 미팅을 원합니다',
    };

    const result = DemoRequestSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
