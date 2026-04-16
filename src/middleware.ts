/**
 * Next.js Edge Middleware
 *
 * Applies rate limiting and CORS headers to all API routes.
 * Runs before route handlers on the edge runtime.
 */

import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;

// Simple in-memory sliding window (per-instance; Redis-backed version is in lib/rate-limit.ts for route-level use)
const counters = new Map<string, { count: number; resetAt: number }>();

function rateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  return `mw:${ip}`;
}

function checkRateLimit(request: NextRequest): NextResponse | null {
  const key = rateLimitKey(request);
  const now = Date.now();
  const entry = counters.get(key);

  if (!entry || now > entry.resetAt) {
    counters.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }
  return null;
}

const CORS_METHODS = 'GET,POST,PUT,DELETE,OPTIONS';
const CORS_HEADERS = 'Content-Type, Authorization, X-Requested-With';

function corsHeaders(origin: string): Record<string, string> {
  const allowedOrigin =
    process.env.NODE_ENV !== 'production' ? origin || '*' : origin || '';
  if (!allowedOrigin) return {};
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': CORS_METHODS,
    'Access-Control-Allow-Headers': CORS_HEADERS,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // CORS preflight
  const origin = request.headers.get('origin') || '';
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  // Rate limiting (skip health checks)
  if (pathname !== '/api/health') {
    const limited = checkRateLimit(request);
    if (limited) return limited;
  }

  // Attach request ID for log correlation
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  const response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });
  response.headers.set('x-request-id', requestId);
  request.headers.set('x-request-id', requestId);

  const cors = corsHeaders(origin);
  for (const [key, value] of Object.entries(cors)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
