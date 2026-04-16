import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id } = await params;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session || session.orgSlug !== slug) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const highlight = await prisma.highlight.findFirst({
    where: { id, org: { slug } },
    include: {
      stream: { select: { id: true, title: true, streamerName: true } },
    },
  });

  if (!highlight) {
    return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
  }

  if (highlight.status === 'PROCESSING' && highlight.jobId) {
    const highlightServiceUrl = process.env.HIGHLIGHT_SERVICE_URL || 'http://localhost:8080';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const hlRes = await fetch(`${highlightServiceUrl}/api/v1/highlights/${highlight.jobId}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (hlRes.ok) {
        const hlData = await hlRes.json();
        if (hlData.status === 'completed' && hlData.result?.highlight_url) {
          await prisma.highlight.update({
            where: { id: highlight.id },
            data: {
              status: 'COMPLETED',
              videoUrl: hlData.result.highlight_url,
              thumbnailUrl: hlData.result.thumbnail_url || null,
              duration: hlData.result.duration_seconds || null,
            },
          });
          return NextResponse.json({
            highlight: {
              ...highlight,
              status: 'COMPLETED',
              videoUrl: hlData.result.highlight_url,
              thumbnailUrl: hlData.result.thumbnail_url || null,
              duration: hlData.result.duration_seconds || null,
            },
          });
        } else if (hlData.status === 'failed') {
          await prisma.highlight.update({
            where: { id: highlight.id },
            data: { status: 'FAILED' },
          });
          return NextResponse.json({
            highlight: { ...highlight, status: 'FAILED' },
          });
        }
      }
    } catch (err) {
      logger.warn({ err }, 'Highlight service unreachable during poll');
    }
  }

  return NextResponse.json({ highlight });
}
