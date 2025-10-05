/**
 * useAnalytics Hook Unit Tests
 *
 * Tests analytics tracking hook functionality:
 * - Auto page view tracking on route change
 * - Manual event tracking
 * - Conversion tracking
 * - Cookie consent respect
 * - API call verification
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  // =================================================================
  // Test 1: Auto Page View Tracking
  // =================================================================

  test('should automatically track page view on mount', async () => {
    // Set analytics consent
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    renderHook(() => useAnalytics());

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/pageview',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('path'),
        })
      );
    });
  });

  test('should track page view when pathname changes', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    const { rerender } = renderHook(() => useAnalytics());

    // Change pathname
    (usePathname as jest.Mock).mockReturnValue('/about/company');
    rerender();

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const pageviewCalls = calls.filter(call => call[0] === '/api/analytics/pageview');
      expect(pageviewCalls.length).toBeGreaterThanOrEqual(2); // Initial + after change
    });
  });

  test('should NOT track page view if analytics consent is false', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: false, // NO CONSENT
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    renderHook(() => useAnalytics());

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(global.fetch).not.toHaveBeenCalledWith(
      '/api/analytics/pageview',
      expect.anything()
    );
  });

  test('should NOT track page view if no consent exists', async () => {
    // No consent in localStorage

    renderHook(() => useAnalytics());

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  // =================================================================
  // Test 2: Event Tracking
  // =================================================================

  test('should track custom event with data', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackEvent('click', 'button_click', { button_id: 'cta_demo' });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/event',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('button_click'),
        })
      );
    });
  });

  test('should NOT track event if analytics consent is false', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: false, // NO CONSENT
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackEvent('click', 'button_click', { button_id: 'cta_demo' });
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(global.fetch).not.toHaveBeenCalledWith(
      '/api/analytics/event',
      expect.anything()
    );
  });

  test('should include page path in event tracking', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    (usePathname as jest.Mock).mockReturnValue('/demo-request');

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackEvent('submit', 'form_submit', { form_name: 'demo_request' });
    });

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const eventCall = calls.find(call => call[0] === '/api/analytics/event');
      expect(eventCall).toBeTruthy();

      const body = JSON.parse(eventCall[1].body);
      expect(body.page).toBe('/demo-request');
    });
  });

  // =================================================================
  // Test 3: Conversion Tracking
  // =================================================================

  test('should track conversion with value', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackConversion('demo_request', {
        companyName: 'Test Company',
        email: 'test@example.com',
      }, 1000000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analytics/conversion',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('demo_request'),
        })
      );

      const calls = (global.fetch as jest.Mock).mock.calls;
      const conversionCall = calls.find(call => call[0] === '/api/analytics/conversion');
      const body = JSON.parse(conversionCall[1].body);

      expect(body.conversionType).toBe('demo_request');
      expect(body.value).toBe(1000000);
      expect(body.formData).toEqual({
        companyName: 'Test Company',
        email: 'test@example.com',
      });
    });
  });

  test('should track conversion without value (default 0)', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await result.current.trackConversion('newsletter_signup');
    });

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const conversionCall = calls.find(call => call[0] === '/api/analytics/conversion');
      expect(conversionCall).toBeTruthy();

      const body = JSON.parse(conversionCall[1].body);
      expect(body.value).toBe(0);
    });
  });

  // =================================================================
  // Test 4: Error Handling
  // =================================================================

  test('should handle API errors gracefully (not throw)', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    // Mock fetch to fail
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAnalytics());

    // Should not throw
    await expect(async () => {
      await result.current.trackEvent('click', 'test_event');
    }).not.toThrow();
  });

  test('should handle non-200 responses gracefully', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    // Mock 500 response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });

    const { result } = renderHook(() => useAnalytics());

    // Should not throw
    await expect(async () => {
      await result.current.trackEvent('click', 'test_event');
    }).not.toThrow();
  });

  // =================================================================
  // Test 5: Multiple Concurrent Calls
  // =================================================================

  test('should handle multiple concurrent trackEvent calls', async () => {
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await Promise.all([
        result.current.trackEvent('click', 'button1'),
        result.current.trackEvent('click', 'button2'),
        result.current.trackEvent('click', 'button3'),
      ]);
    });

    await waitFor(() => {
      const calls = (global.fetch as jest.Mock).mock.calls;
      const eventCalls = calls.filter(call => call[0] === '/api/analytics/event');
      expect(eventCalls.length).toBeGreaterThanOrEqual(3);
    });
  });

  // =================================================================
  // Test 6: Cookie Consent Updates
  // =================================================================

  test('should respect updated cookie consent', async () => {
    // Start with consent
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    const { result } = renderHook(() => useAnalytics());

    // Track event (should work)
    await act(async () => {
      await result.current.trackEvent('click', 'button1');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/analytics/event',
      expect.anything()
    );

    jest.clearAllMocks();

    // Update consent to revoke analytics
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify({
      essential: true,
      analytics: false, // REVOKED
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    }));

    // Track event again (should NOT work)
    await act(async () => {
      await result.current.trackEvent('click', 'button2');
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
