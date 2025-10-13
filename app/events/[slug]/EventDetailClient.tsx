/**
 * Event Detail Client Component
 *
 * Based on:
 * - GLEC-Page-Structure-Standards.md (Event Detail Page)
 * - GLEC-Design-System-Standards.md (Hero Section, Card, Button)
 * - GLEC-Functional-Requirements-Specification.md (FR-WEB-008)
 *
 * Purpose: Display full event details with registration form
 * Design: Hero section, event info, countdown timer, registration CTA
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EventRegistrationForm } from '@/components/ui/EventRegistrationForm';

interface EventDetailClientProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    startDate: string;
    endDate: string;
    location: string;
    locationDetails: string | null;
    thumbnailUrl: string | null;
    maxParticipants: number | null;
    viewCount: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date(event.startDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event.startDate]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Parse markdown-style description
  const renderDescription = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Headings
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Bold
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-bold text-gray-900 mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // List items
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={index} className="ml-6 text-gray-700 mb-2">
            {line.replace(/^\d+\.\s/, '')}
          </li>
        );
      }
      if (line.startsWith('   - ')) {
        return (
          <li key={index} className="ml-12 text-gray-600 text-sm mb-1 list-disc">
            {line.replace('   - ', '')}
          </li>
        );
      }
      // Empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }
      // Regular paragraphs
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-3">
          {line}
        </p>
      );
    });
  };

  // Status badge
  const getStatusBadge = () => {
    if (event.status === 'CLOSED' || timeLeft.expired) {
      return (
        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full">
          종료됨
        </span>
      );
    }
    if (new Date(event.startDate) > new Date()) {
      return (
        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
          신청 가능
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
        진행 중
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-gradient-to-br from-primary-500 to-navy-900 text-white py-20 lg:py-32"
        style={
          event.thumbnailUrl
            ? {
                backgroundImage: `linear-gradient(to bottom, rgba(6, 0, 247, 0.9), rgba(0, 10, 66, 0.9)), url(${event.thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status Badge */}
            <div className="mb-4">{getStatusBadge()}</div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 animate-fade-in-up">
              {event.title}
            </h1>

            {/* Event Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-lg mb-8 animate-fade-in-up delay-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>{event.location}</span>
              </div>
              {event.maxParticipants && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                  <span>선착순 {event.maxParticipants}명</span>
                </div>
              )}
            </div>

            {/* Countdown Timer */}
            {!timeLeft.expired && new Date(event.startDate) > new Date() && (
              <div className="inline-block bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 animate-fade-in-up delay-300">
                <p className="text-sm font-semibold mb-4">이벤트 시작까지</p>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{timeLeft.days}</div>
                    <div className="text-xs text-gray-200">일</div>
                  </div>
                  <div className="text-2xl">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-200">시간</div>
                  </div>
                  <div className="text-2xl">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-200">분</div>
                  </div>
                  <div className="text-2xl">:</div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-200">초</div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            {event.status !== 'CLOSED' && !timeLeft.expired && (
              <div className="animate-fade-in-up delay-500">
                <Button variant="primary" size="lg" onClick={() => setIsRegistrationFormOpen(true)}>
                  참가 신청하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card variant="outlined" padding="lg">
              <div className="prose prose-lg max-w-none">{renderDescription(event.description)}</div>

              {/* Location Details */}
              {event.locationDetails && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">장소 안내</h3>
                  <p className="text-gray-700 whitespace-pre-line">{event.locationDetails}</p>
                </div>
              )}

              {/* Registration CTA */}
              {event.status !== 'CLOSED' && !timeLeft.expired && (
                <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                  <p className="text-gray-700 mb-4">지금 바로 참가 신청하고 특별 혜택을 받으세요!</p>
                  <Button variant="primary" size="lg" onClick={() => setIsRegistrationFormOpen(true)}>
                    참가 신청하기
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form Modal */}
      <EventRegistrationForm
        isOpen={isRegistrationFormOpen}
        onClose={() => setIsRegistrationFormOpen(false)}
        eventSlug={event.slug}
        eventTitle={event.title}
      />
    </div>
  );
}
