/**
 * Dashboard proxy → highlight-service /api/v1/training/export.
 *
 * Triggers a JSONL export of the collected training examples for
 * Vertex AI supervised fine-tuning.
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
    const res = await fetch(`${serviceUrl}/api/v1/training/export`, { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status });
  } catch (err) {
    logger.warn({ err }, '[training.export] service unreachable');
    return NextResponse.json({ error: 'service unreachable' }, { status: 503 });
  }
}
