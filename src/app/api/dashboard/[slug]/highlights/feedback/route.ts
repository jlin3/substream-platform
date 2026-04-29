/**
 * Dashboard proxy → highlight-service /api/v1/highlights/{jobId}/feedback.
 *
 * Forwards thumbs-up / thumbs-down + notes so the service can record
 * training examples from positive votes.
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

  const body = await request.json().catch(() => null);
  const jobId: unknown = body?.jobId;
  const rating: unknown = body?.rating;
  if (typeof jobId !== 'string' || !jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }
  if (rating !== 'good' && rating !== 'bad') {
    return NextResponse.json({ error: 'rating must be "good" or "bad"' }, { status: 400 });
  }

  const serviceUrl = process.env.HIGHLIGHT_SERVICE_URL || 'http://localhost:8080';
  try {
    const res = await fetch(`${serviceUrl}/api/v1/highlights/${encodeURIComponent(jobId)}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        notes: typeof body?.notes === 'string' ? body.notes : undefined,
        segment_index: typeof body?.segment_index === 'number' ? body.segment_index : undefined,
      }),
    });

    const resJson = await res.json().catch(() => ({}));
    return NextResponse.json(resJson, { status: res.status });
  } catch (err) {
    logger.warn({ err, jobId }, '[feedback] service unreachable');
    return NextResponse.json({ error: 'service unreachable' }, { status: 503 });
  }
}
