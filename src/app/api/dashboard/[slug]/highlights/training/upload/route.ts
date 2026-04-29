/**
 * Dashboard proxy for training example uploads.
 *
 * Streams the browser's multipart/form-data payload straight through to the
 * highlight-service `/api/v1/training/upload` endpoint.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export async function POST(
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
    const formData = await request.formData();

    const res = await fetch(`${serviceUrl}/api/v1/training/upload`, {
      method: 'POST',
      body: formData,
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await res.json();
      return NextResponse.json(body, { status: res.status });
    }
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (err) {
    logger.warn({ err }, '[training.upload] service unreachable');
    return NextResponse.json({ error: 'service unreachable' }, { status: 503 });
  }
}
