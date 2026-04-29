import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PostHog reverse-proxy so requests don't hit third-party hosts from the
  // browser. When NEXT_PUBLIC_POSTHOG_KEY is unset the client never calls
  // these routes, so leaving them in place costs nothing.
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
