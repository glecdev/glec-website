import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '20');

  // TODO: Connect to database
  return NextResponse.json({
    success: true,
    data: [],
    meta: {
      total: 0,
      page,
      perPage,
    },
  });
}
