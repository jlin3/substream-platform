/**
 * Webhook Management Endpoints
 *
 * POST   /api/webhooks   - Register a new webhook
 * GET    /api/webhooks   - List registered webhooks
 * DELETE /api/webhooks    - Delete a webhook by id (body: { id })
 *
 * Webhooks receive POST requests with JSON payloads signed via HMAC-SHA256.
 * Include the X-Substream-Signature header to verify authenticity.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  registerWebhook,
  listWebhooks,
  deleteWebhook,
  getRecentDeliveries,
  type WebhookEvent,
} from '@/lib/webhooks/webhook-service';
import { requireAuth, type AuthContext } from '@/lib/auth';
import { parseBody, WebhookRegisterSchema } from '@/lib/validation';
import logger from '@/lib/logger';

const VALID_EVENTS: WebhookEvent[] = [
  'stream.started',
  'stream.stopped',
  'viewer.joined',
  'viewer.left',
  'highlight.created',
  'highlight.completed',
  'highlight.failed',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================
// POST - Register webhook
// ============================================

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const auth: AuthContext = authResult;

    const raw = await request.json();
    const parsed = parseBody(WebhookRegisterSchema, raw);
    if (parsed.error) {
      return NextResponse.json(
        { error: parsed.error, code: 'INVALID_PARAMS' },
        { status: 400, headers: CORS_HEADERS },
      );
    }
    const body = parsed.data!;

    const reg = await registerWebhook({
      url: body.url,
      events: (body.events || VALID_EVENTS) as WebhookEvent[],
      secret: body.secret,
      description: body.description,
      appId: body.appId || auth.appId || undefined,
    });

    return NextResponse.json(
      {
        id: reg.id,
        url: reg.url,
        secret: reg.secret,
        events: reg.events,
        createdAt: reg.createdAt,
        description: reg.description,
        _note: 'Store the "secret" securely. It is used to verify webhook signatures via HMAC-SHA256.',
      },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    logger.error({ err: error }, '[Webhooks API] POST error');
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

// ============================================
// GET - List webhooks
// ============================================

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const hooks = listWebhooks().map(h => ({
    id: h.id,
    url: h.url,
    events: h.events,
    createdAt: h.createdAt,
    description: h.description,
  }));

  const deliveries = getRecentDeliveries().slice(-20);

  return NextResponse.json(
    {
      webhooks: hooks,
      recentDeliveries: deliveries,
      supportedEvents: VALID_EVENTS,
    },
    { headers: CORS_HEADERS },
  );
}

// ============================================
// DELETE - Remove webhook
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing "id"', code: 'INVALID_PARAMS' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const removed = deleteWebhook(body.id);
    if (!removed) {
      return NextResponse.json(
        { error: 'Webhook not found', code: 'NOT_FOUND' },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    return NextResponse.json(
      { success: true, id: body.id },
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    logger.error({ err: error }, '[Webhooks API] DELETE error');
    return NextResponse.json(
      { error: 'Internal error', code: 'INTERNAL_ERROR' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

// ============================================
// OPTIONS - CORS
// ============================================

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
