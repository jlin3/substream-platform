import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://demo.substream.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Substream — live streaming + AI highlights for games and live video',
    template: '%s — Substream',
  },
  description:
    'Multi-tenant streaming platform: add live video and AI-generated highlight reels to any canvas-based game, Unity title, or live-video product with a few lines of code.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Substream',
    title: 'Substream — live streaming + AI highlights',
    description:
      'Canvas capture, WebRTC delivery, cloud recording, and AI highlight reels. One SDK, any engine.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Substream — streaming SDK + AI highlights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Substream — live streaming + AI highlights',
    description:
      'Canvas capture, WebRTC delivery, cloud recording, and AI highlight reels. One SDK, any engine.',
    images: ['/og-image.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface-50 text-white antialiased">{children}</body>
    </html>
  );
}
