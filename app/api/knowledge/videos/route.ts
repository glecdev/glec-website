import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Connect to database
  return NextResponse.json({
    success: true,
    data: [],
    meta: {
      total: 0,
      page: 1,
      perPage: 20,
    },
  });
}
