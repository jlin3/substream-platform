import Link from 'next/link';

export const metadata = {
  title: 'Pricing',
  description: 'Usage-based pricing for live streaming and AI highlights.',
};

const PRICE_PER_STREAM_HOUR = 0.12;
const PRICE_PER_VIEWER_HOUR = 0.03;
const PRICE_PER_HIGHLIGHT = 0.5;

const TIERS = [
  {
    name: 'Starter',
    price: 'Free',
    blurb: 'Self-serve for prototypes and early integration.',
    included: '100 stream hours / month',
    features: [
      'Web SDK + Unity SDK',
      'IVS Real-Time publishing',
      'Cloud recording (7-day retention)',
      'Dashboard + API keys',
    ],
    cta: '/api/auth/demo-auto',
    ctaLabel: 'Try the demo dashboard',
  },
  {
    name: 'Growth',
    price: '$99',
    priceSuffix: '/mo',
    blurb: 'For funded studios and live-video products scaling up.',
    included: '1,000 stream hours / month',
    features: [
      'Everything in Starter',
      'AI highlights (Gemini 3.1 Pro)',
      'Webhooks: stream.* + highlight.*',
      'White-label viewer page',
      '30-day recording retention',
    ],
    cta: 'mailto:sales@substream.dev',
    ctaLabel: 'Start a trial',
    featured: true,
  },
  {
    name: 'Scale',
    price: '$499',
    priceSuffix: '/mo',
    blurb: 'For creator platforms and live-commerce at real volume.',
    included: '10,000 stream hours / month',
    features: [
      'Everything in Growth',
      'Fine-tuning data collection + A/B compare',
      'Multi-region stage pool',
      'Priority support',
      '90-day recording retention',
    ],
    cta: 'mailto:sales@substream.dev',
    ctaLabel: 'Talk to sales',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    blurb: 'For broadcasters, sports, and regulated live-video.',
    included: 'Unlimited — negotiated',
    features: [
      'SSO (OIDC / SAML)',
      'Data residency (US / EU)',
      'Dedicated GCP + AWS projects',
      'SOC 2 Type II evidence (in progress)',
      'Custom contract + SLA',
    ],
    cta: 'mailto:sales@substream.dev',
    ctaLabel: 'Contact enterprise',
  },
];

const USAGE_ROWS = [
  { label: 'Additional stream-hour', rate: `$${PRICE_PER_STREAM_HOUR.toFixed(2)}`, note: 'Per hour of live publishing beyond the included tier.' },
  { label: 'Viewer-hour', rate: `$${PRICE_PER_VIEWER_HOUR.toFixed(2)}`, note: 'Per hour of subscriber watch time.' },
  { label: 'AI highlight reel', rate: `$${PRICE_PER_HIGHLIGHT.toFixed(2)}`, note: 'Per generated reel, any genre / preset.' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-brand-400">sub</span>stream
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/docs" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">Docs</Link>
          <Link href="/api/auth/demo-auto" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors">Dashboard</Link>
          <Link href="/demo" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-500 transition-colors">Live Demo</Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          <header className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-sm font-medium text-brand-400 uppercase tracking-widest">Pricing</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Usage-based, predictable.</h1>
            <p className="text-lg text-white/60">
              Every tier includes the full product — SDK, dashboard, webhooks,
              and AI highlights. Pay for what you stream.
            </p>
          </header>

          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border p-6 space-y-5 flex flex-col ${
                  tier.featured
                    ? 'border-brand-500/50 bg-brand-600/5 ring-1 ring-brand-500/30'
                    : 'border-white/10 bg-surface-100'
                }`}
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white/70">{tier.name}</p>
                  <p className="text-3xl font-bold">
                    {tier.price}
                    {tier.priceSuffix && (
                      <span className="text-sm font-normal text-white/50">{tier.priceSuffix}</span>
                    )}
                  </p>
                </div>
                <p className="text-sm text-white/60">{tier.blurb}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-400">
                  {tier.included}
                </p>
                <ul className="space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="text-brand-400 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.cta}
                  className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-center transition-colors ${
                    tier.featured
                      ? 'bg-brand-500 hover:bg-brand-400 text-white'
                      : 'border border-white/20 hover:bg-white/5'
                  }`}
                >
                  {tier.ctaLabel}
                </Link>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-white/10 bg-surface-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold">Usage rates</h2>
              <p className="text-xs text-white/40 mt-0.5">
                Once you exceed your tier&rsquo;s included volume, overage is billed at the rates below.
              </p>
            </div>
            <div className="divide-y divide-white/10">
              {USAGE_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold">{row.label}</p>
                    <p className="text-xs text-white/50 mt-0.5">{row.note}</p>
                  </div>
                  <span className="text-lg font-mono font-semibold text-brand-400">{row.rate}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="text-center space-y-4 max-w-2xl mx-auto pt-4">
            <h2 className="text-2xl font-semibold">Custom needs?</h2>
            <p className="text-white/60">
              Sports broadcasts, regulated live-video, or volume above 10k
              stream hours? We&rsquo;ll put together an Enterprise agreement.
            </p>
            <Link
              href="mailto:sales@substream.dev"
              className="inline-block rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold hover:bg-brand-500 transition-colors"
            >
              Talk to sales
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <span>Substream &mdash; live streaming + AI highlights</span>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/demo" className="hover:text-white transition-colors">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
