// API Route Configuration
// This file forces all /api/* routes to be dynamic (not pre-rendered)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Use Node.js runtime (not Edge)

// Simple health check endpoint
export async function GET() {
  return Response.json({
    success: true,
    message: 'GLEC API is running',
    timestamp: new Date().toISOString(),
  });
}
