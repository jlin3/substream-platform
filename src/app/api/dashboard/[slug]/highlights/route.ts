import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';
import { dispatchWebhookEvent } from '@/lib/webhooks/webhook-service';
import logger from '@/lib/logger';

function resolveCallbackUrl(request: NextRequest): string | undefined {
  const fromEnv = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  let base = fromEnv;

  if (!base) {
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    if (host) base = `${proto}://${host}`;
  }

  if (!base) return undefined;
  return `${base.replace(/\/$/, '')}/api/internal/highlight-callback`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || session.orgSlug !== slug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const highlights = await prisma.highlight.findMany({
    where: { org: { slug } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      stream: { select: { id: true, title: true, streamerName: true } },
    },
  });

  return NextResponse.json({ highlights });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || session.orgSlug !== slug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { streamId } = body;

  if (!streamId) {
    return NextResponse.json({ error: 'streamId is required' }, { status: 400 });
  }

  const stream = await prisma.stream.findFirst({
    where: { id: streamId, org: { slug } },
  });

  if (!stream) {
    return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
  }

  const highlightServiceUrl = process.env.HIGHLIGHT_SERVICE_URL || 'http://localhost:8080';
  const callbackUrl = resolveCallbackUrl(request);

  const requestedGenre: string | undefined = typeof body.genre === 'string' ? body.genre : undefined;
  const requestedPreset: string | undefined =
    typeof body.outputPreset === 'string' ? body.outputPreset : undefined;
  const requestedDuration: number | undefined =
    typeof body.targetDurationSeconds === 'number' ? body.targetDurationSeconds : undefined;

  let jobId: string | null = null;
  let hlStatus: 'PENDING' | 'PROCESSING' = 'PENDING';

  if (stream.recordingUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const hlRes = await fetch(`${highlightServiceUrl}/api/v1/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_uri: stream.recordingUrl,
          title: `Highlights: ${stream.title || 'Untitled Stream'}`,
          game_title: requestedGenre ?? stream.title ?? undefined,
          output_preset: requestedPreset,
          target_duration_seconds: requestedDuration,
          callback_url: callbackUrl,
        }),
        signal: controller.signal,
      });

      if (hlRes.ok) {
        const hlData = await hlRes.json();
        jobId = hlData.job_id || null;
        hlStatus = 'PROCESSING';
      } else {
        logger.warn(
          { status: hlRes.status, streamId },
          '[highlights] service POST returned non-2xx',
        );
      }
    } catch (err) {
      logger.warn({ err, streamId }, 'Highlight service request failed');
    } finally {
      clearTimeout(timeout);
    }
  }

  const highlight = await prisma.highlight.create({
    data: {
      orgId: session.orgId,
      streamId: stream.id,
      title: `Highlights: ${stream.title || 'Untitled Stream'}`,
      status: hlStatus,
      jobId,
    },
  });

  dispatchWebhookEvent('highlight.created', {
    orgId: session.orgId,
    orgSlug: slug,
    highlightId: highlight.id,
    streamId: stream.id,
    title: highlight.title,
    jobId,
    createdAt: highlight.createdAt.toISOString(),
  });

  return NextResponse.json({ highlight }, { status: 201 });
}
