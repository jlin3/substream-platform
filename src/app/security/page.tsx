import Link from 'next/link';

export const metadata = {
  title: 'Security',
  description:
    'Substream security posture — encryption, access controls, data residency, and compliance roadmap.',
};

const CONTROLS = [
  {
    heading: 'Infrastructure',
    items: [
      'Primary infrastructure runs on AWS (IVS Real-Time + S3) and GCP (Vertex AI + GCS).',
      'Per-org API keys with HMAC-signed webhooks (X-Substream-Signature).',
      'Every stream key is encrypted at rest using AES-256-GCM (STREAM_KEY_ENCRYPTION_KEY).',
      'Multi-region stage pool with US + EU availability on the Scale tier.',
    ],
  },
  {
    heading: 'Access & identity',
    items: [
      'JWT sessions signed with a per-deployment secret; cookies are HttpOnly and SameSite=Lax.',
      'Organization / App / API Key hierarchy with scoped tokens — revoke anything in one click.',
      'Audit log for every token issuance, stream start/stop, and webhook dispatch.',
      'SSO via OIDC / SAML on Enterprise tier.',
    ],
  },
  {
    heading: 'Data protection',
    items: [
      'TLS 1.2+ for all inbound traffic; TLS 1.3 where supported.',
      'Recording retention configurable per org (7 / 30 / 90 days).',
      'Customer-managed GCS / S3 buckets available on Enterprise tier.',
      'Data residency: US (default) or EU on Enterprise tier.',
    ],
  },
  {
    heading: 'AI / model privacy',
    items: [
      'Highlight generation runs in your GCP project or ours — you choose.',
      'Vertex AI Gemini 3.1 Pro with "no training on customer data" opt-in.',
      'Training / fine-tuning only uses explicitly thumbs-up highlight reels.',
      'Model provenance (model name, version, prompt genre) persisted with every reel.',
    ],
  },
];

const ROADMAP = [
  { label: 'SOC 2 Type I', status: 'In progress — evidence collection started Q1 2026', eta: 'Q2 2026' },
  { label: 'SOC 2 Type II', status: 'Scheduled after Type I observation window', eta: 'Q4 2026' },
  { label: 'ISO 27001', status: 'Evaluating', eta: '2027' },
  { label: 'HIPAA BAA', status: 'Available on a per-customer basis with Enterprise tier', eta: 'On request' },
  { label: 'EU data residency', status: 'Enterprise tier, Frankfurt / Dublin options', eta: 'Available now' },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-brand-400">sub</span>stream
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/docs" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">Docs</Link>
          <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline">Pricing</Link>
          <Link href="mailto:security@substream.dev" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-500 transition-colors">Contact security</Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-5xl mx-auto space-y-16">
          <header className="space-y-4 max-w-3xl">
            <p className="text-sm font-medium text-brand-400 uppercase tracking-widest">Security</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Built for regulated live-video workloads.</h1>
            <p className="text-lg text-white/60">
              Substream powers in-game streaming, live commerce, and sports
              broadcasts — so security and compliance are not an afterthought.
              Below is where we are today, and where we&rsquo;re going next.
              <br />
              For a full security questionnaire,{' '}
              <Link href="mailto:security@substream.dev" className="text-brand-400 hover:underline">
                email security@substream.dev
              </Link>
              .
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-6">
            {CONTROLS.map((group) => (
              <div key={group.heading} className="rounded-2xl border border-white/10 bg-surface-100 p-6 space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-400">
                  {group.heading}
                </h2>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-white/75">
                      <span className="text-brand-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Compliance roadmap</h2>
            <div className="rounded-2xl border border-white/10 bg-surface-100 divide-y divide-white/10">
              {ROADMAP.map((row) => (
                <div key={row.label} className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-6 py-4">
                  <div>
                    <p className="font-semibold">{row.label}</p>
                    <p className="text-xs text-white/50">{row.status}</p>
                  </div>
                  <span className="text-sm font-mono text-brand-400">{row.eta}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-surface-100 p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold">Report a vulnerability</h2>
              <p className="text-sm text-white/50 mt-1">
                We welcome coordinated disclosure. Please email findings to security@substream.dev.
              </p>
            </div>
            <Link
              href="mailto:security@substream.dev"
              className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold hover:bg-brand-500 transition-colors"
            >
              security@substream.dev
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <span>Substream — live streaming + AI highlights</span>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
