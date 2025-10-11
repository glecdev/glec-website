/**
 * Launch Promotion Wrapper Component
 *
 * 서버에서 런칭 이벤트 데이터를 가져와
 * LaunchBanner와 LaunchModal을 렌더링
 *
 * 조건:
 * - 이벤트가 PUBLISHED 상태
 * - 시작일이 미래 (아직 런칭 전)
 * - slug가 'carbon-api-launch-2025'
 */

import { neon } from '@neondatabase/serverless';
import { LaunchBanner } from './LaunchBanner';
import { LaunchModal } from './LaunchModal';

const sql = neon(process.env.DATABASE_URL!);

interface LaunchEvent {
  id: string;
  title: string;
  slug: string;
  start_date: string;
  max_participants: number;
  status: string;
}

async function getLaunchEvent(): Promise<LaunchEvent | null> {
  try {
    // Get the Carbon API launch event
    const result = await sql`
      SELECT id, title, slug, start_date, max_participants, status
      FROM events
      WHERE slug = 'carbon-api-launch-2025'
        AND status = 'PUBLISHED'
        AND start_date > NOW()
      LIMIT 1
    `;

    if (result.length === 0) {
      return null;
    }

    return result[0] as LaunchEvent;
  } catch (error) {
    console.error('[LaunchPromotion] Error fetching launch event:', error);
    return null;
  }
}

export async function LaunchPromotion() {
  const launchEvent = await getLaunchEvent();

  if (!launchEvent) {
    return null; // No active launch event
  }

  return (
    <>
      <LaunchBanner
        eventId={launchEvent.id}
        eventSlug={launchEvent.slug}
        launchDate={launchEvent.start_date}
        maxParticipants={launchEvent.max_participants}
      />
      <LaunchModal
        eventId={launchEvent.id}
        eventSlug={launchEvent.slug}
        launchDate={launchEvent.start_date}
        maxParticipants={launchEvent.max_participants}
      />
    </>
  );
}
