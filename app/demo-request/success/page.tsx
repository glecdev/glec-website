/**
 * Demo Request Success Page
 * Purpose: Thank you page after successful demo request submission
 * Features:
 * - Confirmation message
 * - Calendar download (.ics file)
 * - Estimated response time
 * - Next steps guidance
 */

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DemoRequestData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
}

export default function DemoRequestSuccessPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id');

  const [demoData, setDemoData] = useState<DemoRequestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch demo request data (optional - for displaying details)
    // For now, we'll just show a generic success message
    // In production, you could fetch from /api/demo-requests/[id]
    setLoading(false);
  }, [requestId]);

  /**
   * Generate .ics file for calendar download
   */
  const generateICSFile = () => {
    if (!demoData) {
      // Generic calendar event if no data available
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//GLEC Inc.//Demo Request//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:demo-${requestId}@glec.io`,
        `DTSTAMP:${formatICSDate(now)}`,
        `DTSTART:${formatICSDate(nextWeek)}`,
        `DTEND:${formatICSDate(new Date(nextWeek.getTime() + 60 * 60 * 1000))}`,
        'SUMMARY:GLEC 데모 미팅',
        'DESCRIPTION:GLEC 솔루션 데모 세션입니다. 담당자가 곧 연락드릴 예정입니다.',
        'LOCATION:온라인 (링크는 이메일로 전송 예정)',
        'STATUS:TENTATIVE',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:GLEC 데모 미팅 1시간 전',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      downloadICS(icsContent, `glec-demo-${requestId}.ics`);
    } else {
      // Use actual demo data
      const eventDate = new Date(`${demoData.preferredDate}T${demoData.preferredTime}`);
      const eventEndDate = new Date(eventDate.getTime() + 60 * 60 * 1000); // 1 hour later

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//GLEC Inc.//Demo Request//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:demo-${demoData.id}@glec.io`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(eventDate)}`,
        `DTEND:${formatICSDate(eventEndDate)}`,
        `SUMMARY:GLEC 데모 미팅 - ${demoData.companyName}`,
        `DESCRIPTION:GLEC 솔루션 데모 세션\\n담당자: ${demoData.contactName}\\n이메일: ${demoData.email}`,
        'LOCATION:온라인 (링크는 이메일로 전송 예정)',
        'STATUS:TENTATIVE',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:GLEC 데모 미팅 1시간 전',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      downloadICS(icsContent, `glec-demo-${demoData.companyName}.ics`);
    }
  };

  /**
   * Format date to ICS format: YYYYMMDDTHHMMSSZ
   */
  const formatICSDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  /**
   * Download .ics file
   */
  const downloadICS = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">처리 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-primary-500 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block p-4 bg-white/10 rounded-full mb-6">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-6">데모 신청 완료!</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            데모 신청이 성공적으로 접수되었습니다
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Confirmation Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                감사합니다!
              </h2>
              <p className="text-lg text-gray-700">
                확인 이메일이 발송되었습니다. 스팸 메일함도 확인해주세요.
              </p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-primary-900">
                    평균 응답 시간: 24시간 이내
                  </h3>
                  <p className="text-sm text-primary-700 mt-1">
                    담당자가 영업일 기준 24시간 이내에 연락드릴 예정입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar Download */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                캘린더에 추가하기
              </h3>
              <p className="text-gray-600 mb-6">
                데모 일정을 잊지 않도록 캘린더에 추가하세요.
              </p>
              <button
                onClick={generateICSFile}
                className="w-full md:w-auto px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-all hover:-translate-y-0.5 shadow-lg flex items-center justify-center gap-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                캘린더 다운로드 (.ics)
              </button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              다음 단계
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">
                    담당자 연락 (24시간 이내)
                  </h4>
                  <p className="text-gray-600 mt-1">
                    영업 담당자가 데모 일정을 확정하고 온라인 미팅 링크를 전송합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">
                    데모 세션 (약 60분)
                  </h4>
                  <p className="text-gray-600 mt-1">
                    귀사의 요구사항에 맞춘 맞춤형 데모를 진행합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">
                    맞춤 제안서 제공
                  </h4>
                  <p className="text-gray-600 mt-1">
                    데모 후 귀사에 최적화된 솔루션과 견적을 제공합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              데모 준비하기
            </h3>

            <p className="text-gray-600 mb-6">
              더 나은 데모 경험을 위해 아래 자료를 미리 확인해보세요.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/knowledge/videos"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600">
                      제품 소개 영상
                    </p>
                    <p className="text-sm text-gray-500">2분 하이라이트</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/knowledge/library"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600">
                      제품 백서
                    </p>
                    <p className="text-sm text-gray-500">기술 문서</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/knowledge/case-studies"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600">
                      고객 사례
                    </p>
                    <p className="text-sm text-gray-500">성공 스토리</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/products"
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition group"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600">
                      제품 둘러보기
                    </p>
                    <p className="text-sm text-gray-500">전체 라인업</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 border-2 border-primary-500 text-primary-500 font-semibold rounded-lg hover:bg-primary-50 transition"
            >
              홈으로 돌아가기
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              궁금한 점이 있으신가요?{' '}
              <a
                href="mailto:demo@glec.io"
                className="text-primary-500 hover:underline font-semibold"
              >
                demo@glec.io
              </a>
              로 문의해주세요
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
