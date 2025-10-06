/**
 * Certifications Page - Solution-level Design
 * Upgraded to match solution pages (Carbon API, DTG) design standards
 */

'use client';

import Link from 'next/link';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useState, useEffect } from 'react';

interface Certification {
  id: string;
  name: string;
  type: 'iso' | 'award' | 'patent' | 'compliance';
  issuer: string;
  issueDate: string;
  certificateNumber: string;
  pdfUrl: string | null;
  description: string;
}

export default function CertificationsPage() {
  const { displayedText: headerText } = useTypingAnimation(
    '국제 표준과 인증으로\n신뢰를 증명합니다',
    50
  );
  const [activeTab, setActiveTab] = useState<'iso' | 'award' | 'patent'>('iso');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/certifications');
      const result = await response.json();
      if (result.success) {
        setCertifications(result.data);
      }
    } catch (error) {
      console.error('[Certifications] Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCertifications = certifications.filter((c) => c.type === activeTab);

  const gradientColors: Record<string, string> = {
    iso: 'from-primary-500 to-primary-600',
    award: 'from-yellow-500 to-yellow-600',
    patent: 'from-purple-500 to-purple-600',
  };

  const tabLabels: Record<string, string> = {
    iso: 'ISO 인증',
    award: '수상 내역',
    patent: '특허/규제',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary-500 via-primary-600 to-navy-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 animate-fade-in">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              ISO 14083:2023 • Smart Freight Centre • EU CBAM
            </div>

            {/* Title with Typing Animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight whitespace-pre-line">
              {headerText}
            </h1>

            <p className="text-xl sm:text-2xl text-white/90 mb-12 leading-relaxed">
              국제 표준 기반의 신뢰할 수 있는 탄소배출 측정 솔루션.
              <br />
              ISO-14083 기반 솔루션, Smart Freight Centre GLEC Tool 인증 진행 중.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="group px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-2"
              >
                인증서 다운로드
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                컴플라이언스 문의
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                ISO 14083:2023 기반
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                GDPR + ISMS-P 준수
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                2개 특허 등록
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            {(['iso', 'award', 'patent'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`py-4 px-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === type
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tabLabels[type]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ISO Tab */}
      {activeTab === 'iso' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                국제 표준 준수 인증
              </h2>
              <p className="text-xl text-gray-600">
                ISO 14083:2023 기반 물류 탄소배출 측정 시스템
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                  <div className="flex gap-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {filteredCertifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br ${gradientColors[cert.type]} rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{cert.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">발행 기관:</strong> {cert.issuer}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">발행일:</strong>{' '}
                            {new Date(cert.issueDate).toLocaleDateString('ko-KR')}
                          </p>
                          <p className="text-sm text-gray-600 md:col-span-2">
                            <strong className="text-gray-900">인증 번호:</strong> {cert.certificateNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        인증 상세
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{cert.description}</p>
                    </div>

                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                      <h4 className="font-bold text-gray-900 mb-3">ISO 14083:2023 핵심 내용</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            <strong>운송 체인 전체</strong>의 온실가스 배출량을 정량화하고 보고하기 위한 국제 표준
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            <strong>Well-to-Wheel (WTW)</strong> 방법론: 연료 생산부터 차량 운행까지 전체 배출량 계산
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            <strong>모든 운송 수단</strong> 지원: 도로/철도/항공/해운/복합 운송
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>
                            <strong>EU CBAM, CDP, GHG Protocol</strong> 등 글로벌 보고 규정과 완벽 호환
                          </span>
                        </li>
                      </ul>
                    </div>

                    {cert.pdfUrl && (
                      <div className="mt-6">
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          인증서 다운로드 (PDF)
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Award Tab */}
      {activeTab === 'award' && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                수상 내역 및 파트너십
              </h2>
              <p className="text-xl text-gray-600">검증된 혁신성과 시장 리더십</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredCertifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="flex gap-6 mb-6">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br ${gradientColors[cert.type]} rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{cert.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>주관:</strong> {cert.issuer}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>수상일:</strong> {new Date(cert.issueDate).toLocaleDateString('ko-KR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>번호:</strong> {cert.certificateNumber}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-4">{cert.description}</p>

                    {cert.pdfUrl && (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-yellow-600 font-semibold text-sm hover:text-yellow-700 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        증빙 자료 다운로드
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Patent Tab */}
      {activeTab === 'patent' && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                특허 및 규제 준수
              </h2>
              <p className="text-xl text-gray-600">독자 기술과 글로벌 컴플라이언스</p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                    <div className="flex gap-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {filteredCertifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div
                        className={`w-24 h-24 bg-gradient-to-br ${
                          cert.type === 'patent' ? gradientColors.patent : gradientColors.iso
                        } rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.232 1.607 1.053 1.8C6.096 15.102 7.116 16 8.5 16s2.404-.898 3.265-2.374c.821-.193 1.303-1.02 1.053-1.8l-.818-2.552-3 1.2-3-1.2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{cert.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">발행 기관:</strong> {cert.issuer}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong className="text-gray-900">등록일:</strong>{' '}
                            {new Date(cert.issueDate).toLocaleDateString('ko-KR')}
                          </p>
                          <p className="text-sm text-gray-600 md:col-span-2">
                            <strong className="text-gray-900">번호:</strong> {cert.certificateNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-6">{cert.description}</p>

                    {cert.pdfUrl && (
                      <div className="mt-6">
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          상세 문서 다운로드
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">ISO-14083 솔루션이 필요하신가요?</h2>
          <p className="text-xl text-white/90 mb-12">
            국제 표준 기반의 정확한 탄소배출 측정으로 EU CBAM, CDP 보고서를 자동 생성하세요
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              무료 상담 신청
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/solutions/cloud"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
            >
              GLEC Cloud 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
