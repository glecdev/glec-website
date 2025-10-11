/**
 * EventCard Component
 *
 * Based on: GLEC-Design-System-Standards.md
 * Purpose: Display individual event information in a card layout
 * Design: Card variant="outlined", hover effect, responsive
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Event, EventStatus } from '@/types/event';

interface EventCardProps {
  event: Event;
}

// Format date to Korean format: YYYY.MM.DD HH:MM
function formatEventDate(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// Get badge variant based on event status
function getStatusBadgeVariant(status: EventStatus): 'primary' | 'success' | 'neutral' {
  switch (status) {
    case 'UPCOMING':
      return 'primary';
    case 'ONGOING':
      return 'success';
    case 'COMPLETED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

// Get status label in Korean
function getStatusLabel(status: EventStatus): string {
  switch (status) {
    case 'UPCOMING':
      return '예정';
    case 'ONGOING':
      return '진행중';
    case 'COMPLETED':
      return '종료';
    default:
      return status;
  }
}

export function EventCard({ event }: EventCardProps) {
  const statusVariant = getStatusBadgeVariant(event.status);
  const statusLabel = getStatusLabel(event.status);
  const startDate = formatEventDate(event.startDate);
  const endDate = formatEventDate(event.endDate);

  // Calculate registration percentage if applicable
  const registrationPercentage =
    event.maxAttendees && event.currentAttendees
      ? Math.round((event.currentAttendees / event.maxAttendees) * 100)
      : null;

  return (
    <Card
      variant="outlined"
      padding="md"
      hover={true}
      className="h-full flex flex-col"
      role="article"
      aria-labelledby={`event-title-${event.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant={statusVariant} aria-label={`이벤트 상태: ${statusLabel}`}>
            {statusLabel}
          </Badge>
          {event.tags && event.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {event.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                  aria-label={`태그: ${tag}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <CardTitle id={`event-title-${event.id}`} className="text-xl font-bold text-gray-900">
          {event.title}
        </CardTitle>

        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {event.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Date */}
        <div className="flex items-start gap-2 text-sm">
          <svg
            className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div>
            <time dateTime={event.startDate} className="block text-gray-700">
              {startDate}
            </time>
            <span className="text-gray-500" aria-hidden="true">
              ~
            </span>
            <time dateTime={event.endDate} className="block text-gray-700">
              {endDate}
            </time>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm">
          <svg
            className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <span className="block text-gray-700">{event.location}</span>
            {event.locationDetails && (
              <span className="block text-xs text-gray-500 mt-1">{event.locationDetails}</span>
            )}
          </div>
        </div>

        {/* Registration status */}
        {registrationPercentage !== null && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="text-gray-600">신청 현황</span>
              <span className="font-semibold text-gray-900">
                {event.currentAttendees} / {event.maxAttendees}명
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${registrationPercentage}%` }}
                role="progressbar"
                aria-valuenow={registrationPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`신청률 ${registrationPercentage}%`}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {event.registrationUrl && event.status !== 'COMPLETED' ? (
          <Link href={event.registrationUrl} className="w-full">
            <Button
              variant="primary"
              size="md"
              fullWidth={true}
              aria-label={`${event.title} 참가 신청하기`}
            >
              참가 신청
            </Button>
          </Link>
        ) : event.status === 'COMPLETED' ? (
          <Button
            variant="outline"
            size="md"
            fullWidth={true}
            disabled={true}
            aria-label="종료된 이벤트"
          >
            종료됨
          </Button>
        ) : (
          <Link href={`/events/${event.slug}`} className="w-full">
            <Button
              variant="outline"
              size="md"
              fullWidth={true}
              aria-label={`${event.title} 자세히 보기`}
            >
              자세히 보기
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
