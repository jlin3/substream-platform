/**
 * Client-side PostHog initialization.
 *
 * Runs on every route in the Next.js App Router (v15.3+). If
 * NEXT_PUBLIC_POSTHOG_KEY is unset the SDK is never loaded, so the cost in
 * local dev and non-instrumented environments is zero.
 *
 * Docs: https://posthog.com/docs/libraries/next-js
 */
import posthog from 'posthog-js';

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (key) {
  posthog.init(key, {
    api_host: '/ingest',
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com',
    defaults: '2026-01-30',
    capture_exceptions: true,
    debug: process.env.NODE_ENV === 'development',
  });
}
