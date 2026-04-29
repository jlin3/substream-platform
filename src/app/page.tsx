import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-brand-400">sub</span>stream
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/docs"
            className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-white/60 hover:text-white transition-colors hidden sm:inline"
          >
            Pricing
          </Link>
          <Link
            href="/api/auth/demo-auto"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/demo"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-500 transition-colors"
          >
            Live Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="px-6 pt-20 pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-sm font-medium text-brand-400 uppercase tracking-widest">
              Live streaming + AI highlights
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Add live video
              <br />
              <span className="text-brand-400">to anything</span> that renders.
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              Canvas capture, WebRTC delivery, cloud recording, and Gemini-powered
              highlight reels — one multi-tenant platform for game studios and
              live-video products.
            </p>

            <div className="flex gap-3 flex-wrap pt-2">
              <Link
                href="/demo"
                className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold hover:bg-brand-500 transition-colors"
              >
                Try the Live Demo
              </Link>
              <Link
                href="/api/auth/demo-auto"
                className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Explore the Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
                IVS Real-Time
              </span>
              <span>·</span>
              <span>Gemini 3.1 Pro</span>
              <span>·</span>
              <span>Multi-tenant</span>
              <span>·</span>
              <span>Webhooks + HMAC</span>
            </div>
          </div>

          {/* Product preview (illustrated dashboard/highlight detail) */}
          <DashboardPreview />
        </div>
      </main>

      {/* Code snippet */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto rounded-xl border border-white/10 bg-surface-100 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2 text-xs text-white/30 font-mono">your-game.js</span>
          </div>
          <pre className="p-5 text-sm font-mono text-white/85 overflow-x-auto leading-relaxed">
            <code>{`import Substream from '@substream/web-sdk';

const session = await Substream.startStream({
  canvasElement: document.querySelector('canvas'),
  backendUrl: 'https://your-api.substream.dev',
  authToken: 'sk_live_...',
});

// Later, when the session ends — an AI highlight reel lands
// in your dashboard and fires \`highlight.completed\` to your webhook.`}</code>
          </pre>
        </div>
      </section>

      {/* Logos strip (placeholder — swap for real logos) */}
      <section className="border-t border-white/10 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-white/30 mb-6">
            Built by operators of live-video products
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-40">
            {['LiveWave', 'Northfield FC', 'Arcweave', 'Bezi', 'k-ID', 'FieldGoal'].map((name) => (
              <span key={name} className="text-sm font-semibold tracking-wide text-white/70">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-white/50 mb-16 max-w-2xl mx-auto">
            From integration to monetization in three steps.
            Works with Unity, WebGL, Phaser, Three.js, PixiJS, broadcast
            encoders, or any HTML canvas.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number="1"
              title="Integrate the SDK"
              description="Drop a few lines into your web or Unity game — or point an existing live feed at our WHIP endpoint. The SDK captures your canvas/audio and streams via WebRTC with sub-second latency."
            />
            <Step
              number="2"
              title="Watch, Record, Webhook"
              description="Viewers watch in real-time through our white-label player. Every session is recorded. Webhook events (stream.started, viewer.joined, highlight.completed) flow to your backend — HMAC-signed."
            />
            <Step
              number="3"
              title="AI Highlights with Gemini"
              description="Gemini 3.1 Pro watches the full recording, picks the best moments with a genre-aware prompt, runs a quality self-review, and assembles a reel in social 9:16 or broadcast 16:9."
            />
          </div>
        </div>
      </section>

      {/* Dual-audience use cases */}
      <section className="border-t border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Two audiences. One platform.</h2>
          <p className="text-center text-white/50 mb-12 max-w-2xl mx-auto">
            The same multi-tenant backend powers in-game streaming and
            enterprise live-video use cases.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <AudienceCard
              eyebrow="For game studios"
              title="In-game streaming + shareable highlights"
              bullets={[
                'Canvas capture from Unity, WebGL, Phaser, Three.js, PixiJS',
                'Sub-second WebRTC latency via AWS IVS Real-Time',
                'Auto-recorded sessions with Gemini-powered highlight reels',
                'White-label viewer with chat and reactions',
              ]}
              cta="/demo"
              ctaLabel="Try the embedded game demo"
            />
            <AudienceCard
              eyebrow="For live-video platforms"
              title="Multi-tenant infrastructure for live commerce, sports, and events"
              bullets={[
                'Org / App / API Key hierarchy with scoped tokens',
                'Signed webhooks for stream.* and highlight.* events',
                'Sports-genre AI highlights for matchday recaps',
                'Rate limiting, audit log, usage-based billing built in',
              ]}
              cta="/api/auth/demo-auto"
              ctaLabel="Open the enterprise dashboard"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-white/40">
            Substream &mdash; Live streaming infrastructure + AI highlights
          </span>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/docs" className="text-white/40 hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="text-white/40 hover:text-white transition-colors">Pricing</Link>
            <Link href="/security" className="text-white/40 hover:text-white transition-colors">Security</Link>
            <Link href="/demo" className="text-white/40 hover:text-white transition-colors">Demo</Link>
            <Link href="https://github.com/jlin3/substream-platform" className="text-white/40 hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-lg">
        {number}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function AudienceCard({
  eyebrow,
  title,
  bullets,
  cta,
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  bullets: string[];
  cta: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface-100 p-6 space-y-4 hover:border-white/20 transition-colors">
      <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest">{eyebrow}</p>
      <h3 className="text-xl font-semibold leading-tight">{title}</h3>
      <ul className="space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-white/70">
            <span className="text-brand-400 mt-0.5">→</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href={cta}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300"
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}

/**
 * A stylised preview of the substream dashboard: shows a "highlight detail"
 * frame with a live indicator, stream thumbnail, and pipeline step chips —
 * acts as a product screenshot until we ship a recorded walkthrough MP4.
 */
function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-surface-100 to-surface-50 p-4 shadow-2xl shadow-brand-900/20">
      {/* window chrome */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
          <div className="w-2 h-2 rounded-full bg-green-500/60" />
        </div>
        <span className="text-[10px] font-mono text-white/30">dashboard/highlights/halo-ctf</span>
        <span className="text-[10px] font-semibold text-live flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
          LIVE
        </span>
      </div>

      {/* dual video mock */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="aspect-video rounded-lg bg-gradient-to-br from-purple-900/50 to-blue-900/50 relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="absolute top-1.5 left-1.5 text-[9px] bg-black/60 text-white/70 px-1.5 py-0.5 rounded font-mono">SOURCE · 8:00</span>
        </div>
        <div className="aspect-video rounded-lg bg-gradient-to-br from-brand-900/60 to-cyan-900/60 relative overflow-hidden ring-1 ring-brand-500/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-300" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="absolute top-1.5 left-1.5 text-[9px] bg-brand-600/80 text-white px-1.5 py-0.5 rounded font-mono">AI REEL · 1:15</span>
        </div>
      </div>

      {/* pipeline chips */}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
        How the AI Agent Works
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {[
          { name: 'Download', ms: '12s' },
          { name: 'Whole-Video Analysis', ms: '95s' },
          { name: 'Segment Scoring', ms: '180s' },
          { name: 'Quality Review', ms: '50s · 78/100' },
          { name: 'Assembly', ms: '45s' },
        ].map((s) => (
          <span
            key={s.name}
            className="text-[10px] rounded-md bg-surface-200 border border-white/10 px-2 py-1 text-white/80"
          >
            <span className="text-brand-400 font-semibold">{s.name}</span>
            <span className="text-white/40 ml-1.5">{s.ms}</span>
          </span>
        ))}
      </div>

      {/* segment row */}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-2">
        What Gemini Saw
      </p>
      <div className="space-y-1">
        {[
          { label: 'Player grabs the enemy flag', score: 50, selected: true },
          { label: 'Sniping an enemy on a moving vehicle', score: 79, selected: true },
          { label: 'Active Camo stealth attack', score: 56, selected: true },
          { label: 'Running across map, no engagement', score: 34, selected: false },
        ].map((seg) => (
          <div
            key={seg.label}
            className={`flex items-center gap-2 px-2 py-1 rounded-md text-[11px] ${
              seg.selected ? 'bg-brand-600/10 border border-brand-500/20' : 'bg-surface-200/40'
            }`}
          >
            <span className={`w-1 h-3 rounded-full ${seg.selected ? 'bg-brand-400' : 'bg-white/20'}`} />
            <span className="flex-1 text-white/80 truncate">{seg.label}</span>
            <span className={`font-mono text-[10px] ${seg.selected ? 'text-brand-300' : 'text-white/40'}`}>
              {seg.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
