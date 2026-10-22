import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
  // Strip trailing /api/v1 to reach the root /health endpoint
  const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
  const healthEndpoint = `${baseUrl}/health`;

  const startTime = Date.now();

  try {
    const res = await fetch(healthEndpoint, {
      cache: 'no-store',
      // Allow up to 30s for Render cold start
      signal: AbortSignal.timeout(30000),
    });

    const durationMs = Date.now() - startTime;
    const data = await res.json().catch(() => ({}));

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      durationMs,
      endpoint: healthEndpoint,
      backendData: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to ping backend',
        durationMs,
        endpoint: healthEndpoint,
        timestamp: new Date().toISOString(),
      },
      { status: 504 }
    );
  }
}
