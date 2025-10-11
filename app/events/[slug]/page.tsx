/**
 * Event Detail Page (/events/[slug])
 *
 * Based on:
 * - GLEC-Page-Structure-Standards.md
 * - GLEC-Design-System-Standards.md
 * - GLEC-Functional-Requirements-Specification.md (FR-WEB-008)
 *
 * Purpose: Display detailed event information and registration form
 * Design: Hero section, event details, registration CTA
 * Security: Server-side rendering, no hardcoding
 */

import { notFound } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import { EventDetailClient } from './EventDetailClient';

const sql = neon(process.env.DATABASE_URL!);

interface EventPageProps {
  params: {
    slug: string;
  };
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  location_details: string | null;
  thumbnail_url: string | null;
  max_participants: number | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

async function getEvent(slug: string): Promise<EventData | null> {
  try {
    const result = await sql`
      SELECT
        id,
        title,
        slug,
        description,
        status,
        start_date,
        end_date,
        location,
        location_details,
        thumbnail_url,
        max_participants,
        view_count,
        published_at,
        created_at,
        updated_at
      FROM events
      WHERE slug = ${slug}
        AND status = 'PUBLISHED'
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    // Increment view count
    await sql`
      UPDATE events
      SET view_count = view_count + 1
      WHERE slug = ${slug}
    `;

    return result[0] as EventData;
  } catch (error) {
    console.error('[Event Detail] Error fetching event:', error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventPageProps) {
  const event = await getEvent(params.slug);

  if (!event) {
    return {
      title: '이벤트를 찾을 수 없습니다 | GLEC',
    };
  }

  const startDate = new Date(event.start_date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    title: `${event.title} | GLEC Events`,
    description: event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.substring(0, 160),
      images: event.thumbnail_url ? [event.thumbnail_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description.substring(0, 160),
      images: event.thumbnail_url ? [event.thumbnail_url] : [],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const event = await getEvent(params.slug);

  if (!event) {
    notFound();
  }

  // Transform to client-friendly format
  const eventData = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    status: event.status as 'DRAFT' | 'PUBLISHED' | 'CLOSED',
    startDate: event.start_date,
    endDate: event.end_date,
    location: event.location,
    locationDetails: event.location_details,
    thumbnailUrl: event.thumbnail_url,
    maxParticipants: event.max_participants,
    viewCount: event.view_count,
    publishedAt: event.published_at,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };

  return <EventDetailClient event={eventData} />;
}
