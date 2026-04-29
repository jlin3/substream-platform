/**
 * Dashboard proxy → highlight-service /api/v1/training/examples.
 *
 * We don't expose the highlight-service URL to the browser; the platform
 * proxies every training request after checking the session cookie.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

async function requireSession(request: NextRequest, slug: string) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session || session.orgSlug !== slug) return null;
  return session;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await requireSession(request, slug);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const qs = url.search;

  const serviceUrl = process.env.HIGHLIGHT_SERVICE_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${serviceUrl}/api/v1/training/examples${qs}`);
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text || 'service error' }, { status: res.status });
    }
    const body = await res.json();
    return NextResponse.json(body);
  } catch (err) {
    logger.warn({ err }, '[training.examples] service unreachable');
    return NextResponse.json({ error: 'service unreachable', examples: [] }, { status: 503 });
  }
}
