/**
 * CookieConsent Component Unit Tests
 *
 * Tests cookie consent banner functionality:
 * - Initial display state
 * - Accept all functionality
 * - Reject all functionality
 * - Granular settings
 * - LocalStorage persistence
 * - CustomEvent dispatch
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CookieConsent from '@/components/CookieConsent';

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

// Mock CustomEvent
const customEventListeners: Record<string, Array<(event: CustomEvent) => void>> = {};

window.addEventListener = jest.fn((event: string, callback: any) => {
  if (!customEventListeners[event]) {
    customEventListeners[event] = [];
  }
  customEventListeners[event].push(callback);
});

window.dispatchEvent = jest.fn((event: Event) => {
  const eventName = event.type;
  if (customEventListeners[eventName]) {
    customEventListeners[eventName].forEach(callback => callback(event as CustomEvent));
  }
  return true;
});

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  // =================================================================
  // Test 1: Initial Display State
  // =================================================================

  test('should display banner on first visit (no consent in localStorage)', () => {
    render(<CookieConsent />);

    // Banner should be visible
    const banner = screen.getByText(/쿠키|Cookie|동의/i);
    expect(banner).toBeInTheDocument();

    // Should have Accept and Settings buttons
    expect(screen.getByRole('button', { name: /전체 동의|모두 수락|Accept All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /설정|Settings|거부/i })).toBeInTheDocument();
  });

  test('should NOT display banner if consent already exists in localStorage', () => {
    // Set consent before rendering
    const consent = {
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    };
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify(consent));

    render(<CookieConsent />);

    // Banner should NOT be visible
    expect(screen.queryByText(/쿠키|Cookie|동의/i)).not.toBeInTheDocument();
  });

  test('should display banner if consent has expired', () => {
    // Set expired consent
    const expiredConsent = {
      essential: true,
      analytics: true,
      marketing: false,
      functional: true,
      timestamp: Date.now() - 400 * 24 * 60 * 60 * 1000, // 400 days ago
      expiresAt: Date.now() - 35 * 24 * 60 * 60 * 1000, // Expired 35 days ago
    };
    localStorageMock.setItem('glec_cookie_consent', JSON.stringify(expiredConsent));

    render(<CookieConsent />);

    // Banner should be visible
    expect(screen.getByText(/쿠키|Cookie|동의/i)).toBeInTheDocument();
  });

  // =================================================================
  // Test 2: Accept All Functionality
  // =================================================================

  test('should save all consents when clicking Accept All', async () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole('button', { name: /전체 동의|모두 수락|Accept All/i });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      const savedConsent = localStorageMock.getItem('glec_cookie_consent');
      expect(savedConsent).toBeTruthy();

      const parsed = JSON.parse(savedConsent!);
      expect(parsed.essential).toBe(true);
      expect(parsed.analytics).toBe(true);
      expect(parsed.marketing).toBe(true);
      expect(parsed.functional).toBe(true);
      expect(parsed.timestamp).toBeTruthy();
      expect(parsed.expiresAt).toBeTruthy();
    });
  });

  test('should hide banner after clicking Accept All', async () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole('button', { name: /전체 동의|모두 수락|Accept All/i });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.queryByText(/쿠키|Cookie|동의/i)).not.toBeInTheDocument();
    });
  });

  test('should dispatch CustomEvent after clicking Accept All', async () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole('button', { name: /전체 동의|모두 수락|Accept All/i });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(window.dispatchEvent).toHaveBeenCalled();
    });
  });

  // =================================================================
  // Test 3: Reject All Functionality
  // =================================================================

  test('should save only essential consent when clicking Reject All', async () => {
    render(<CookieConsent />);

    const rejectButton = screen.getByRole('button', { name: /거부|Reject|최소/i });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      const savedConsent = localStorageMock.getItem('glec_cookie_consent');
      expect(savedConsent).toBeTruthy();

      const parsed = JSON.parse(savedConsent!);
      expect(parsed.essential).toBe(true); // Always true
      expect(parsed.analytics).toBe(false);
      expect(parsed.marketing).toBe(false);
      expect(parsed.functional).toBe(false);
    });
  });

  // =================================================================
  // Test 4: Settings Modal
  // =================================================================

  test('should open settings modal when clicking Settings button', async () => {
    render(<CookieConsent />);

    const settingsButton = screen.getByRole('button', { name: /설정|Settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => {
      // Modal should be visible
      expect(screen.getByText(/쿠키 설정|Cookie Settings/i)).toBeInTheDocument();

      // Should have individual toggle switches
      expect(screen.getByText(/필수|Essential/i)).toBeInTheDocument();
      expect(screen.getByText(/분석|Analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/마케팅|Marketing/i)).toBeInTheDocument();
      expect(screen.getByText(/기능|Functional/i)).toBeInTheDocument();
    });
  });

  test('should save granular preferences from settings modal', async () => {
    render(<CookieConsent />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /설정|Settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText(/쿠키 설정|Cookie Settings/i)).toBeInTheDocument();
    });

    // Toggle analytics ON, marketing OFF
    const analyticsToggle = screen.getByLabelText(/분석|Analytics/i);
    const marketingToggle = screen.getByLabelText(/마케팅|Marketing/i);

    fireEvent.click(analyticsToggle);
    fireEvent.click(marketingToggle);

    // Save settings
    const saveButton = screen.getByRole('button', { name: /저장|Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const savedConsent = localStorageMock.getItem('glec_cookie_consent');
      const parsed = JSON.parse(savedConsent!);

      expect(parsed.essential).toBe(true);
      expect(parsed.analytics).toBe(true); // Toggled ON
      expect(parsed.marketing).toBe(false); // Toggled OFF or default
    });
  });

  // =================================================================
  // Test 5: LocalStorage Expiry
  // =================================================================

  test('should set expiry to 365 days from now', async () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole('button', { name: /전체 동의|모두 수락|Accept All/i });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      const savedConsent = localStorageMock.getItem('glec_cookie_consent');
      const parsed = JSON.parse(savedConsent!);

      const expectedExpiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
      const actualExpiry = parsed.expiresAt;

      // Allow 1 second tolerance
      expect(actualExpiry).toBeGreaterThan(expectedExpiry - 1000);
      expect(actualExpiry).toBeLessThan(expectedExpiry + 1000);
    });
  });

  // =================================================================
  // Test 6: Essential Cookies Always Enabled
  // =================================================================

  test('should not allow disabling essential cookies', async () => {
    render(<CookieConsent />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /설정|Settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => {
      const essentialToggle = screen.getByLabelText(/필수|Essential/i);
      // Should be disabled (cannot be turned off)
      expect(essentialToggle).toBeDisabled();
      expect(essentialToggle).toBeChecked();
    });
  });

  // =================================================================
  // Test 7: Animation and Transitions
  // =================================================================

  test('should apply slide-up animation class', () => {
    render(<CookieConsent />);

    const banner = screen.getByText(/쿠키|Cookie|동의/i).closest('div');
    expect(banner).toHaveClass(/animate-|slide-|transition-/i);
  });

  // =================================================================
  // Test 8: Accessibility
  // =================================================================

  test('should have proper ARIA attributes', () => {
    render(<CookieConsent />);

    const banner = screen.getByText(/쿠키|Cookie|동의/i).closest('[role="dialog"], [role="banner"]');
    expect(banner).toHaveAttribute('role');
  });

  test('should be keyboard accessible', () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole('button', { name: /전체 동의|모두 수락|Accept All/i });

    // Focus button
    acceptButton.focus();
    expect(acceptButton).toHaveFocus();

    // Press Enter
    fireEvent.keyDown(acceptButton, { key: 'Enter', code: 'Enter' });

    // Should trigger the same action as click
    waitFor(() => {
      expect(localStorageMock.getItem('glec_cookie_consent')).toBeTruthy();
    });
  });
});
