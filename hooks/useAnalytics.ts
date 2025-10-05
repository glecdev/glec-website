'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface AnalyticsEventData {
  [key: string]: any;
}

const COOKIE_CONSENT_KEY = 'glec_cookie_consent';

/**
 * useAnalytics Hook
 *
 * Provides client-side analytics tracking functionality with GDPR compliance.
 * Respects cookie consent and only tracks when analytics cookies are enabled.
 *
 * @example
 * ```tsx
 * const { trackEvent, trackConversion } = useAnalytics();
 *
 * <button onClick={() => trackEvent('cta_click', 'hero_demo_request')}>
 *   무료 데모 신청
 * </button>
 * ```
 */
export function useAnalytics() {
  const pathname = usePathname();
  const pageViewTracked = useRef(false);
  const sessionStartTime = useRef(Date.now());
  const currentPageStartTime = useRef(Date.now());

  /**
   * Check if analytics tracking is enabled based on cookie consent
   */
  const isAnalyticsEnabled = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const consentData = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consentData) return false;

      const consent = JSON.parse(consentData);
      return consent.preferences?.analytics === true;
    } catch (error) {
      console.error('[Analytics] Failed to check consent:', error);
      return false;
    }
  }, []);

  /**
   * Track page view
   */
  const trackPageView = useCallback(async (path: string) => {
    if (!isAnalyticsEnabled()) {
      console.log('[Analytics] Skipping page view tracking (consent not granted)');
      return;
    }

    try {
      const response = await fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          title: document.title,
          referrer: document.referrer || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Analytics] Page view tracked:', path);
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', error);
    }
  }, [isAnalyticsEnabled]);

  /**
   * Track custom event
   *
   * @param eventType - Type of event (e.g., 'click', 'form_submit', 'cta_click')
   * @param eventName - Name of the event (e.g., 'hero_demo_request')
   * @param eventData - Optional additional data
   * @param elementId - Optional HTML element ID
   * @param elementText - Optional element text content
   */
  const trackEvent = useCallback(async (
    eventType: string,
    eventName: string,
    eventData?: AnalyticsEventData,
    elementId?: string,
    elementText?: string
  ) => {
    if (!isAnalyticsEnabled()) {
      console.log('[Analytics] Skipping event tracking (consent not granted)');
      return;
    }

    try {
      const response = await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          eventName,
          eventData: eventData || null,
          page: window.location.pathname,
          elementId: elementId || null,
          elementText: elementText || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[Analytics] Event tracked:', eventType, eventName);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }, [isAnalyticsEnabled]);

  /**
   * Track conversion
   *
   * @param conversionType - Type of conversion (e.g., 'demo_request', 'contact_form')
   * @param formData - Optional anonymized form data
   * @param value - Optional estimated conversion value in KRW
   */
  const trackConversion = useCallback(async (
    conversionType: string,
    formData?: AnalyticsEventData,
    value?: number
  ) => {
    if (!isAnalyticsEnabled()) {
      console.log('[Analytics] Skipping conversion tracking (consent not granted)');
      return;
    }

    try {
      const response = await fetch('/api/analytics/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversionType,
          formData: formData || null,
          value: value || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[Analytics] Conversion tracked:', conversionType);
    } catch (error) {
      console.error('[Analytics] Failed to track conversion:', error);
    }
  }, [isAnalyticsEnabled]);

  /**
   * Track page duration when user leaves the page
   */
  const trackPageDuration = useCallback(async () => {
    if (!isAnalyticsEnabled()) return;

    const duration = Math.floor((Date.now() - currentPageStartTime.current) / 1000);

    // Only track if user spent more than 5 seconds
    if (duration < 5) return;

    try {
      // Get scroll depth
      const scrollDepth = Math.floor(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      await fetch('/api/analytics/pageview/duration', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: pathname,
          duration,
          scrollDepth: isNaN(scrollDepth) ? 0 : Math.min(scrollDepth, 100),
        }),
      });
    } catch (error) {
      console.error('[Analytics] Failed to track page duration:', error);
    }
  }, [pathname, isAnalyticsEnabled]);

  /**
   * Auto-track page views on pathname change
   */
  useEffect(() => {
    if (pageViewTracked.current) {
      // Track duration of previous page before navigating
      trackPageDuration();
    }

    // Track new page view
    trackPageView(pathname);
    pageViewTracked.current = true;
    currentPageStartTime.current = Date.now();
  }, [pathname, trackPageView, trackPageDuration]);

  /**
   * Track page duration on unmount (user leaves the site)
   */
  useEffect(() => {
    return () => {
      trackPageDuration();
    };
  }, [trackPageDuration]);

  /**
   * Listen for cookie consent changes
   */
  useEffect(() => {
    const handleConsentUpdate = (event: CustomEvent<CookiePreferences>) => {
      if (event.detail.analytics) {
        console.log('[Analytics] Analytics enabled - tracking activated');
        // Re-track current page view
        trackPageView(pathname);
      } else {
        console.log('[Analytics] Analytics disabled - tracking deactivated');
      }
    };

    window.addEventListener('cookieConsentUpdated', handleConsentUpdate as EventListener);

    return () => {
      window.removeEventListener('cookieConsentUpdated', handleConsentUpdate as EventListener);
    };
  }, [pathname, trackPageView]);

  return {
    trackPageView,
    trackEvent,
    trackConversion,
    isAnalyticsEnabled,
  };
}
