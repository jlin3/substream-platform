/**
 * Internal callback endpoint for the highlight-service.
 *
 * The FastAPI highlight-service POSTs here when a job completes or fails.
 * The body is signed with HMAC-SHA256 using `HIGHLIGHT_CALLBACK_SECRET` —
 * we verify the signature before touching the DB.
 *
 * On `highlight.completed`:
 *   - update Highlight row (status, videoUrl, duration, pipelineData)
 *   - fan out `highlight.completed` webhook to org customers
 *
 * On `highlight.failed`:
 *   - mark row FAILED
 *   - fan out `highlight.failed`
 */
import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';
import { dispatchWebhookEvent } from '@/lib/webhooks/webhook-service';
import { captureServerEvent } from '@/lib/posthog-server';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

type CallbackSegment = {
  start_time?: number;
  end_time?: number;
  score?: number;
  label?: string;
  reason?: string;
  selected?: boolean;
};

type CallbackMetadata = {
  highlight_duration?: number;
  model_used?: string;
  game_detected?: string;
  genre_detected?: string;
};

type CallbackPayload = {
  job_id: string;
  status: 'completed' | 'failed';
  highlight_url?: string;
  segments?: CallbackSegment[];
  metadata?: CallbackMetadata;
  pipeline_data?: Record<string, unknown>;
  error?: string;
};

function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const provided = header.startsWith('sha256=') ? header.slice(7) : header;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = process.env.HIGHLIGHT_CALLBACK_SECRET;

  if (secret) {
    const sig = request.headers.get('x-substream-signature');
    if (!verifySignature(rawBody, sig, secret)) {
      logger.warn({ sig }, '[highlight-callback] invalid signature');
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    logger.error('[highlight-callback] HIGHLIGHT_CALLBACK_SECRET not set in production');
    return NextResponse.json({ error: 'callback not configured' }, { status: 503 });
  }

  let payload: CallbackPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (!payload.job_id || !payload.status) {
    return NextResponse.json({ error: 'missing job_id or status' }, { status: 400 });
  }

  const highlight = await prisma.highlight.findUnique({
    where: { jobId: payload.job_id },
    include: { stream: { select: { id: true, title: true } }, org: { select: { id: true, slug: true } } },
  });

  if (!highlight) {
    logger.warn({ jobId: payload.job_id }, '[highlight-callback] unknown job_id, dropping');
    return NextResponse.json({ ok: true, known: false });
  }

  if (payload.status === 'completed') {
    const duration = payload.metadata?.highlight_duration
      ? Math.round(payload.metadata.highlight_duration)
      : null;

    const pipelineData = payload.pipeline_data
      ? {
          ...payload.pipeline_data,
          segments: payload.segments?.map((s) => ({
            start: s.start_time,
            end: s.end_time,
            score: s.score,
            label: s.label,
            reason: s.reason,
            selected: s.selected,
          })),
          model: payload.metadata?.model_used ?? null,
          game_detected: payload.metadata?.game_detected ?? null,
          genre_detected: payload.metadata?.genre_detected ?? null,
        }
      : null;

    const updated = await prisma.highlight.update({
      where: { id: highlight.id },
      data: {
        status: 'COMPLETED',
        videoUrl: payload.highlight_url ?? highlight.videoUrl ?? null,
        duration,
        pipelineData: pipelineData ?? undefined,
      },
    });

    logger.info(
      { jobId: payload.job_id, highlightId: highlight.id, orgSlug: highlight.org.slug },
      '[highlight-callback] completed',
    );

    dispatchWebhookEvent('highlight.completed', {
      orgId: highlight.orgId,
      orgSlug: highlight.org.slug,
      highlightId: highlight.id,
      streamId: highlight.streamId,
      title: updated.title,
      videoUrl: updated.videoUrl,
      duration: updated.duration,
      completedAt: new Date().toISOString(),
    });

    captureServerEvent(highlight.orgId, 'highlight_completed', {
      orgSlug: highlight.org.slug,
      highlightId: highlight.id,
      jobId: payload.job_id,
      duration: updated.duration ?? null,
      model: payload.metadata?.model_used ?? null,
      genre: payload.metadata?.genre_detected ?? null,
    });

    return NextResponse.json({ ok: true });
  }

  if (payload.status === 'failed') {
    await prisma.highlight.update({
      where: { id: highlight.id },
      data: { status: 'FAILED' },
    });

    logger.warn(
      { jobId: payload.job_id, highlightId: highlight.id, error: payload.error },
      '[highlight-callback] failed',
    );

    dispatchWebhookEvent('highlight.failed', {
      orgId: highlight.orgId,
      orgSlug: highlight.org.slug,
      highlightId: highlight.id,
      streamId: highlight.streamId,
      title: highlight.title,
      error: payload.error ?? 'unknown',
      failedAt: new Date().toISOString(),
    });

    captureServerEvent(highlight.orgId, 'highlight_failed', {
      orgSlug: highlight.org.slug,
      highlightId: highlight.id,
      jobId: payload.job_id,
      error: payload.error ?? 'unknown',
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown status' }, { status: 400 });
}
