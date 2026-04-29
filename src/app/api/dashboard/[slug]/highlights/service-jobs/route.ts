/**
 * Dashboard proxy → highlight-service /api/v1/highlights (job list).
 *
 * Used by the A/B compare UI to enumerate completed jobs.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const session = await verifySessionToken(token);
  if (!session || session.orgSlug !== slug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceUrl = process.env.HIGHLIGHT_SERVICE_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${serviceUrl}/api/v1/highlights`);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || 'service error' }, { status: res.status });
    }
    const body = await res.json();
    return NextResponse.json({ jobs: Array.isArray(body) ? body : body?.jobs ?? [] });
  } catch (err) {
    logger.warn({ err }, '[service-jobs] service unreachable');
    return NextResponse.json({ error: 'service unreachable', jobs: [] }, { status: 503 });
  }
}
