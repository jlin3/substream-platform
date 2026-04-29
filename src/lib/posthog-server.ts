/**
 * Server-side PostHog client.
 *
 * Use `getPostHogClient()` in API routes and server actions to capture
 * high-value events (demo login, highlight.completed, webhook_registered).
 * Returns `null` if `NEXT_PUBLIC_POSTHOG_KEY` is not configured so calling
 * code can safely no-op.
 */
import { PostHog } from 'posthog-node';

let client: PostHog | null | undefined;

export function getPostHogClient(): PostHog | null {
  if (client !== undefined) return client;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) {
    client = null;
    return null;
  }
  client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

export async function shutdownPostHog(): Promise<void> {
  if (client) {
    await client.shutdown();
    client = null;
  }
}

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  const ph = getPostHogClient();
  if (!ph) return;
  try {
    ph.capture({ distinctId, event, properties });
  } catch {
    // never let analytics break the request path
  }
}
