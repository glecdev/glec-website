'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieConsentData {
  preferences: CookiePreferences;
  timestamp: number;
  version: string;
}

const COOKIE_CONSENT_KEY = 'glec_cookie_consent';
const COOKIE_CONSENT_VERSION = '1.0.0';
const CONSENT_EXPIRY_DAYS = 365;

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always enabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if consent already exists
    const existingConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (existingConsent) {
      try {
        const consentData: CookieConsentData = JSON.parse(existingConsent);

        // Check if consent is expired (365 days)
        const consentAge = Date.now() - consentData.timestamp;
        const maxAge = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        if (consentAge > maxAge || consentData.version !== COOKIE_CONSENT_VERSION) {
          // Expired or version mismatch - show banner again
          setIsVisible(true);
        } else {
          // Valid consent exists
          setPreferences(consentData.preferences);
        }
      } catch (error) {
        console.error('Failed to parse cookie consent:', error);
        setIsVisible(true);
      }
    } else {
      // No consent exists - show banner
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    const consentData: CookieConsentData = {
      preferences: prefs,
      timestamp: Date.now(),
      version: COOKIE_CONSENT_VERSION,
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));

    // Dispatch custom event for analytics hook to listen
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
      detail: prefs
    }));

    setIsVisible(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const handleSaveSettings = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Essential cannot be toggled

    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 pointer-events-auto"
          onClick={() => setShowSettings(false)}
          aria-hidden="true"
        />
      )}

      {/* Cookie Banner */}
      <div
        className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl pointer-events-auto border-2 border-primary-500"
        role="dialog"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        {/* Main Banner Content */}
        {!showSettings ? (
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2
                  id="cookie-consent-title"
                  className="text-2xl font-bold text-navy-900 mb-2"
                >
                  쿠키 사용 동의
                </h2>
                <p
                  id="cookie-consent-description"
                  className="text-base text-gray-700 leading-relaxed"
                >
                  GLEC은 웹사이트 기능 제공, 사용자 경험 개선, 트래픽 분석을 위해 쿠키를 사용합니다.
                  "모두 허용"을 클릭하면 모든 쿠키 사용에 동의하며, "설정"을 통해 세부 항목을 선택할 수 있습니다.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="모든 쿠키 허용"
              >
                모두 허용
              </button>

              <button
                onClick={handleRejectAll}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="필수 쿠키만 허용"
              >
                필수만 허용
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 px-6 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 active:bg-primary-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="쿠키 설정 열기"
              >
                설정
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              자세한 내용은{' '}
              <a
                href="/legal/privacy"
                className="text-primary-500 hover:text-primary-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보 처리방침
              </a>
              을 확인하세요.
            </p>
          </div>
        ) : (
          /* Settings Panel */
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-navy-900">
                쿠키 설정
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="설정 닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Essential Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      필수 쿠키
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                      필수
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    웹사이트 기본 기능을 제공하기 위해 필요한 쿠키입니다.
                    로그인, 보안, 네트워크 관리 등에 사용되며 비활성화할 수 없습니다.
                  </p>
                </div>
                <div className="ml-4">
                  <div className="w-12 h-6 bg-gray-400 rounded-full flex items-center px-1 cursor-not-allowed">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    분석 쿠키
                  </h3>
                  <p className="text-sm text-gray-600">
                    웹사이트 방문자 통계, 트래픽 소스, 사용자 행동 분석에 사용됩니다.
                    익명화된 데이터로 서비스 개선에 활용됩니다.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                      preferences.analytics ? 'bg-primary-500' : 'bg-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={preferences.analytics}
                    aria-label="분석 쿠키 토글"
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    마케팅 쿠키
                  </h3>
                  <p className="text-sm text-gray-600">
                    맞춤형 광고 제공, 광고 효과 측정, 리마케팅에 사용됩니다.
                    제3자 광고 플랫폼과 데이터를 공유할 수 있습니다.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                      preferences.marketing ? 'bg-primary-500' : 'bg-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={preferences.marketing}
                    aria-label="마케팅 쿠키 토글"
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    기능 쿠키
                  </h3>
                  <p className="text-sm text-gray-600">
                    사용자 맞춤 설정 저장, 언어/지역 선택, 채팅 기능 등
                    향상된 사용자 경험 제공에 사용됩니다.
                  </p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => togglePreference('functional')}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center px-1 ${
                      preferences.functional ? 'bg-primary-500' : 'bg-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={preferences.functional}
                    aria-label="기능 쿠키 토글"
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        preferences.functional ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Settings Button */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                설정 저장
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
