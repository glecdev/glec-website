import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const metric = searchParams.get('metric') || 'sessions';

    let data;

    switch (metric) {
      case 'sessions':
        data = await sql`
          SELECT
            DATE(created_at) as date,
            COUNT(*) as count
          FROM analytics_sessions
          WHERE created_at BETWEEN ${startDate} AND ${endDate}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
        break;

      case 'pageviews':
        data = await sql`
          SELECT
            DATE(created_at) as date,
            COUNT(*) as count
          FROM analytics_page_views
          WHERE created_at BETWEEN ${startDate} AND ${endDate}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
        break;

      case 'events':
        data = await sql`
          SELECT
            event_type,
            COUNT(*) as count
          FROM analytics_events
          WHERE created_at BETWEEN ${startDate} AND ${endDate}
          GROUP BY event_type
          ORDER BY count DESC
        `;
        break;

      case 'conversions':
        data = await sql`
          SELECT
            conversion_type,
            COUNT(*) as count,
            SUM(value) as total_value
          FROM analytics_conversions
          WHERE created_at BETWEEN ${startDate} AND ${endDate}
          GROUP BY conversion_type
          ORDER BY count DESC
        `;
        break;

      case 'top_pages':
        data = await sql`
          SELECT
            path,
            COUNT(*) as views,
            AVG(duration) as avg_duration
          FROM analytics_page_views
          WHERE created_at BETWEEN ${startDate} AND ${endDate}
          GROUP BY path
          ORDER BY views DESC
          LIMIT 10
        `;
        break;

      case 'devices':
        data = await sql`
          SELECT
            device,
            COUNT(*) as count
          FROM analytics_sessions
          WHERE created_at BETWEEN ${startDate} AND ${endDate}
          GROUP BY device
        `;
        break;

      default:
        data = [];
    }

    return NextResponse.json({
      success: true,
      data,
      metric,
      startDate,
      endDate
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
