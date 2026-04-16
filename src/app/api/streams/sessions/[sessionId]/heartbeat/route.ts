/**
 * Session Heartbeat API
 * Receives periodic health updates from the Stream SDK
 * 
 * POST /api/streams/sessions/:sessionId/heartbeat
 */

import { NextRequest, NextResponse } from 'next/server';
import { StreamingError } from '@/lib/streaming';
import { prisma } from '@/lib/prisma';
import { requireAuth, type AuthContext } from '@/lib/auth';
import { parseBody, HeartbeatSchema } from '@/lib/validation';
import logger from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const raw = await request.json();
    const parsed = parseBody(HeartbeatSchema, raw);
    if (parsed.error) {
      return NextResponse.json(
        { error: parsed.error, code: 'INVALID_PARAMS' },
        { status: 400 }
      );
    }
    const body = parsed.data;
    
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const auth: AuthContext = authResult;

    const session = await prisma.childStreamSession.findUnique({
      where: { id: sessionId },
      include: { channel: { select: { childId: true, child: { select: { userId: true } } } } },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify the caller owns this session (is the child or an org admin)
    const isOwner = session.channel.child.userId === auth.userId
      || session.childId === auth.userId
      || auth.method === 'api_key';
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Not authorized for this session', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Session is not active', code: 'SESSION_NOT_ACTIVE' },
        { status: 400 }
      );
    }

    // Update session metrics
    const updateData: Record<string, number | null> = {};
    
    if (body.currentBitrateKbps !== undefined) {
      // Update average bitrate (simple running average)
      const currentAvg = session.avgBitrateKbps || body.currentBitrateKbps;
      updateData.avgBitrateKbps = Math.round(
        (currentAvg + body.currentBitrateKbps) / 2
      );
    }

    if (body.currentViewers !== undefined) {
      // Track max viewers
      const currentMax = session.maxViewers || 0;
      if (body.currentViewers > currentMax) {
        updateData.maxViewers = body.currentViewers;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.childStreamSession.update({
        where: { id: sessionId },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, 'Heartbeat error');

    if (error instanceof StreamingError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
