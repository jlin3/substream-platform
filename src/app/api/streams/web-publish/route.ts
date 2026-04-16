/**
 * Web Game Publish Endpoint
 *
 * POST /api/streams/web-publish   — Start a stream
 * DELETE /api/streams/web-publish  — Stop a stream
 * GET /api/streams/web-publish     — Pool status
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  allocateStage,
  getStagePoolStatus,
  releaseStage,
  findStageByStreamId,
} from '@/lib/streaming/stage-pool';
import { dispatchWebhookEvent } from '@/lib/webhooks/webhook-service';
import { requireAuth, requireScopes, type AuthContext } from '@/lib/auth';
import { parseBody, WebPublishStartSchema, WebPublishStopSchema } from '@/lib/validation';
import logger from '@/lib/logger';

// ============================================
// POST - Start Web Publish Stream
// ============================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const auth: AuthContext = authResult;

    const scopeErr = requireScopes(auth, ['streams:write']);
    if (scopeErr) return scopeErr;

    const raw = await request.json();
    const parsed = parseBody(WebPublishStartSchema, raw);
    if (parsed.error) {
      return NextResponse.json(
        { error: parsed.error, code: 'INVALID_PARAMS' },
        { status: 400 },
      );
    }
    const body = parsed.data;
    const streamerId = body.streamerId || body.childId;

    const streamId = uuidv4();
    const allocation = await allocateStage(streamId, auth.userId, streamerId!);

    const baseUrl =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const viewerUrl = `${protocol}://${baseUrl}/viewer/${streamId}`;

    dispatchWebhookEvent('stream.started', {
      streamId,
      streamerId,
      stageArn: allocation.stageArn,
      viewerUrl,
      orgId: auth.orgId,
    });

    return NextResponse.json(
      {
        streamId,
        stageArn: allocation.stageArn,
        publishToken: allocation.publishToken,
        participantId: allocation.participantId,
        expiresAt: allocation.expiresAt.toISOString(),
        region: allocation.region,
        viewerUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error({ err: error }, '[WebPublish] Error starting stream');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

// ============================================
// DELETE - Stop Web Publish Stream
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const raw = await request.json();
    const parsed = parseBody(WebPublishStopSchema, raw);
    if (parsed.error) {
      return NextResponse.json(
        { error: parsed.error, code: 'INVALID_PARAMS' },
        { status: 400 },
      );
    }

    const stage = await findStageByStreamId(parsed.data.streamId);
    if (!stage) {
      return NextResponse.json(
        { error: 'Stream not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    await releaseStage(stage.arn);

    dispatchWebhookEvent('stream.stopped', { streamId: parsed.data.streamId });

    return NextResponse.json({ success: true, streamId: parsed.data.streamId });
  } catch (error) {
    logger.error({ err: error }, '[WebPublish] Error stopping stream');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

// ============================================
// GET - Web Publish Status
// ============================================

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const poolStatus = await getStagePoolStatus();
  return NextResponse.json({
    enabled: true,
    poolStatus,
    info: 'POST with { streamerId } to start a stream. Returns a publishToken for the IVS Web Broadcast SDK.',
  });
}

// ============================================
// OPTIONS - CORS preflight
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
