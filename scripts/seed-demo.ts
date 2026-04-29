/**
 * Seed demo data for substream-platform.
 *
 * Creates:
 *   - Demo organization (slug: `substream-demo`)
 *   - Demo app (required for Stream foreign key)
 *   - Sample streams spanning game studios (FPS / MOBA / BR / sandbox) and
 *     enterprise-style live-video use cases (sports)
 *   - Rich, narrative-ready highlights with v2 pipeline metadata so the
 *     detail page ("How the AI Agent Works", "What Gemini Saw") renders
 *     compelling content even without running the highlight-service
 *
 * Run: pnpm db:seed
 */
import { prisma } from '../src/lib/prisma';

const DAY = 86400_000;
const HOUR = 3600_000;

const YT = {
  haloCtf: 'w3xnLMctoKc',
  breakout: 'KHtEAzyniHI',
  fnArena: 'cq_2vB0aHk8',
  rlTourney: 'ruJP73lSqTU',
  valComp: 'JbNNZ_vOCCU',
  mcBuild: 'hZQC-dblHU8',
  haloSlayer: 'ioNVJK-3sNs',
  fnCreative: 'E2Em3XKkzMo',
  apexRanked: '5wjf0BTLORc',
  valUnrated: '9Rwv6z9CxlU',
  haloPower: 'Wh1tHg1Ytcs',
  fnClutch: 'NuYXzNZlBfQ',
  rlGoals: 'W75FYBkT6lI',
  valAce: 'ZjLEB-QDlgU',
  apexSquad: 'AbOHTw8z1Wo',
  soccerGoal: 'Zl2uI5Q49WY',
  soccerMatch: 'BHnNP5XxR8g',
};

const ytUrl = (id: string) => `youtube:${id}`;
const ytThumb = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

async function seed() {
  console.log('Seeding substream-platform demo data...\n');

  // ---------------------------------------------------------------------------
  // Organization + App
  // ---------------------------------------------------------------------------
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'substream-demo' },
    update: { name: 'Substream Demo', plan: 'PRO' },
    create: {
      id: 'org-substream-demo',
      name: 'Substream Demo',
      slug: 'substream-demo',
      plan: 'PRO',
    },
  });
  console.log('  Organization:', demoOrg.slug);

  const demoApp = await prisma.app.upsert({
    where: { id: 'demo-app-001' },
    update: { name: 'Demo Game' },
    create: {
      id: 'demo-app-001',
      orgId: demoOrg.id,
      name: 'Demo Game',
      allowedOrigins: [],
    },
  });
  console.log('  App:', demoApp.name);

  // ---------------------------------------------------------------------------
  // Sample streams — mix of game studios + enterprise live-video narratives
  // ---------------------------------------------------------------------------
  const sampleStreams = [
    // ---- Game studios ----
    {
      id: 'stream-halo-ctf',
      streamerId: 'player-spartan117',
      streamerName: 'Spartan-117',
      title: 'Halo Infinite — CTF on Fragmentation',
      tags: ['fps', 'halo'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - DAY * 2),
      endedAt: new Date(Date.now() - DAY * 2 + 480_000),
      durationSecs: 480,
      recordingUrl: ytUrl(YT.haloCtf),
      vodThumbnailUrl: ytThumb(YT.haloCtf),
    },
    {
      id: 'stream-sample-breakout',
      streamerId: 'demo-streamer-001',
      streamerName: 'Demo Streamer',
      title: 'Embedded Breakout Session',
      tags: ['canvas', 'demo'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - HOUR * 3),
      endedAt: new Date(Date.now() - HOUR * 2),
      durationSecs: 3600,
      recordingUrl: ytUrl(YT.breakout),
      vodThumbnailUrl: ytThumb(YT.breakout),
    },
    {
      id: 'stream-fn-arena',
      streamerId: 'player-xnova',
      streamerName: 'xNova',
      title: 'Fortnite — Arena Ranked Grind',
      tags: ['br', 'fortnite'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - HOUR * 8),
      endedAt: new Date(Date.now() - HOUR * 6),
      durationSecs: 7200,
      recordingUrl: ytUrl(YT.fnArena),
      vodThumbnailUrl: ytThumb(YT.fnArena),
    },
    {
      id: 'stream-rl-tourney',
      streamerId: 'player-shadowfox',
      streamerName: 'ShadowFox',
      title: 'Rocket League — 2v2 Tournament',
      tags: ['sports-sim', 'rl'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - DAY * 1),
      endedAt: new Date(Date.now() - DAY * 1 + 2400_000),
      durationSecs: 2400,
      recordingUrl: ytUrl(YT.rlTourney),
      vodThumbnailUrl: ytThumb(YT.rlTourney),
    },
    {
      id: 'stream-val-comp',
      streamerId: 'player-phantomace',
      streamerName: 'PhantomAce',
      title: 'Valorant — Competitive Ascent',
      tags: ['fps', 'valorant'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - HOUR * 14),
      endedAt: new Date(Date.now() - HOUR * 12),
      durationSecs: 5400,
      recordingUrl: ytUrl(YT.valComp),
      vodThumbnailUrl: ytThumb(YT.valComp),
    },
    {
      id: 'stream-mc-build',
      streamerId: 'player-blocksmith',
      streamerName: 'BlockSmith',
      title: 'Minecraft — Mega Castle Build',
      tags: ['sandbox', 'minecraft'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - DAY * 3),
      endedAt: new Date(Date.now() - DAY * 3 + 10800_000),
      durationSecs: 10800,
      recordingUrl: ytUrl(YT.mcBuild),
      vodThumbnailUrl: ytThumb(YT.mcBuild),
    },
    {
      id: 'stream-apex-ranked',
      streamerId: 'player-viperstrike',
      streamerName: 'ViperStrike',
      title: 'Apex Legends — Diamond Ranked Push',
      tags: ['br', 'apex'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - HOUR * 5),
      endedAt: new Date(Date.now() - HOUR * 3.5),
      durationSecs: 5400,
      recordingUrl: ytUrl(YT.apexRanked),
      vodThumbnailUrl: ytThumb(YT.apexRanked),
    },
    // ---- Enterprise live-video (sports / event) ----
    {
      id: 'stream-soccer-match',
      streamerId: 'broadcaster-livewave',
      streamerName: 'LiveWave Sports',
      title: 'Matchday Live — Northfield vs Harbor FC',
      tags: ['sports', 'soccer', 'live-commerce'],
      status: 'RECORDED' as const,
      startedAt: new Date(Date.now() - DAY * 1),
      endedAt: new Date(Date.now() - DAY * 1 + 5400_000),
      durationSecs: 5400,
      recordingUrl: ytUrl(YT.soccerMatch),
      vodThumbnailUrl: ytThumb(YT.soccerMatch),
    },
  ];

  for (const s of sampleStreams) {
    const { id, ...data } = s;
    await prisma.stream.upsert({
      where: { id },
      update: {
        recordingUrl: data.recordingUrl,
        vodThumbnailUrl: data.vodThumbnailUrl,
        status: data.status,
        title: data.title,
      },
      create: { id, appId: demoApp.id, orgId: demoOrg.id, ...data },
    });
    console.log(`  Stream: ${data.title}`);
  }

  // ---------------------------------------------------------------------------
  // Highlights — narrative-rich pipelineData for the demo
  // ---------------------------------------------------------------------------

  // Halo FPS — the hero narrative for game studio demos
  const haloPipelineData = {
    source_duration: 480,
    highlight_duration: 75,
    segments_analyzed: 51,
    segments_selected: 7,
    processing_time_seconds: 390,
    model: 'gemini-3.1-pro-preview',
    genre: 'fps',
    output_preset: 'standard',
    steps: [
      { name: 'Download', duration_sec: 12, detail: 'Fetched 8 min recording from cloud storage' },
      { name: 'Whole-Video Analysis', duration_sec: 95, detail: 'Gemini 3.1 Pro watched the full 8 min clip via gs:// URI' },
      { name: 'Audio Analysis', duration_sec: 8, detail: 'Local RMS energy peak detection via pydub/numpy' },
      { name: 'Segment Scoring', duration_sec: 180, detail: 'Gemini 3.1 Pro verified 51 candidate segments with FPS genre prompt' },
      { name: 'Highlight Selection', duration_sec: 0.2, detail: 'Narrative-aware: temporal spread + cluster prevention' },
      { name: 'Quality Review', duration_sec: 50, detail: 'Self-review scored reel at 78/100 — accepted on first pass' },
      { name: 'Assembly', duration_sec: 45, detail: 'Dynamic crossfade timing + loudnorm audio normalization' },
    ],
    quality_review: { score: 78, threshold: 60, attempts: 1, notes: 'Strong pacing, distinct moments, good narrative arc' },
    segments: [
      { start: 107.0, end: 116.1, duration: 9.1, score: 50, label: 'Player grabs the enemy flag', selected: true, rationale: 'Clear objective play, triggers cheer in audio' },
      { start: 184.0, end: 186.1, duration: 2.1, score: 79, label: 'Sniping an enemy on a moving vehicle', selected: true, rationale: 'High-skill shot, visually striking' },
      { start: 199.0, end: 201.1, duration: 2.1, score: 51, label: 'Standard multiplayer firefight', selected: true, rationale: 'Bridges narrative between flag grab and sniper moment' },
      { start: 296.0, end: 298.5, duration: 2.5, score: 66, label: 'Sniper Rifle kill', selected: true, rationale: 'Clean headshot, confirmed by killfeed OCR' },
      { start: 340.0, end: 345.7, duration: 5.7, score: 59, label: 'Ambushing enemies near a Warthog', selected: true, rationale: 'Multi-kill sequence with audio spike' },
      { start: 370.0, end: 412.7, duration: 42.7, score: 50, label: 'Kills and a destroyed vehicle', selected: true, rationale: 'Sustained action, anchors the reel' },
      { start: 426.0, end: 436.8, duration: 10.8, score: 56, label: 'Active Camo stealth attack on enemy vehicle', selected: true, rationale: 'Strong closing beat' },
      { start: 52.0, end: 55.0, duration: 3.0, score: 28, label: 'Player respawning at base', selected: false, rationale: 'Low action, no kill' },
      { start: 148.0, end: 152.0, duration: 4.0, score: 34, label: 'Running across map, no engagement', selected: false, rationale: 'Filler traversal' },
      { start: 228.0, end: 232.0, duration: 4.0, score: 31, label: 'Reloading, empty corridor', selected: false, rationale: 'Downtime' },
    ],
  };

  // Apex BR — secondary game-studio highlight
  const apexPipelineData = {
    source_duration: 5400,
    highlight_duration: 40,
    segments_analyzed: 87,
    segments_selected: 5,
    processing_time_seconds: 620,
    model: 'gemini-3.1-pro-preview',
    genre: 'battle_royale',
    output_preset: 'social',
    steps: [
      { name: 'Download', duration_sec: 28, detail: 'Fetched 90 min recording from cloud storage' },
      { name: 'Whole-Video Analysis', duration_sec: 185, detail: 'Gemini 3.1 Pro scanned full 90 min match via gs:// URI' },
      { name: 'Audio Analysis', duration_sec: 15, detail: 'Local RMS energy peak detection via pydub/numpy' },
      { name: 'Segment Scoring', duration_sec: 310, detail: 'Gemini 3.1 Pro verified 87 candidate segments with BR genre prompt' },
      { name: 'Highlight Selection', duration_sec: 0.3, detail: 'Narrative-aware: build-up → peak → finisher spread' },
      { name: 'Quality Review', duration_sec: 48, detail: 'Self-review scored reel at 82/100 — accepted' },
      { name: 'Assembly', duration_sec: 32, detail: '9:16 social preset with dynamic crossfades + loudnorm' },
    ],
    quality_review: { score: 82, threshold: 60, attempts: 1, notes: 'Tight pacing, strong emotional arc into final-ring win' },
    segments: [
      { start: 412.0, end: 420.5, duration: 8.5, score: 92, label: 'Kraber headshot on moving target from 200m', selected: true, rationale: 'Peak highlight — exceptional precision' },
      { start: 1830.0, end: 1842.0, duration: 12.0, score: 85, label: 'Full squad wipe with Kraber — 3 knocks in 8 seconds', selected: true, rationale: 'Multi-kill sustained sequence' },
      { start: 2205.0, end: 2214.0, duration: 9.0, score: 78, label: 'Clutch revive under fire + Wingman triple kill', selected: true, rationale: 'Emotional beat, team comms spike' },
      { start: 3600.0, end: 3606.0, duration: 6.0, score: 71, label: 'No-scope Kraber elimination on zip-line', selected: true, rationale: 'Visually distinctive shot' },
      { start: 4800.0, end: 4804.5, duration: 4.5, score: 68, label: 'Final ring sprint + Mastiff wipe for the win', selected: true, rationale: 'Finisher — match-winning moment' },
    ],
  };

  // Soccer — enterprise live-video narrative
  const soccerPipelineData = {
    source_duration: 5400,
    highlight_duration: 90,
    segments_analyzed: 32,
    segments_selected: 6,
    processing_time_seconds: 415,
    model: 'gemini-3.1-pro-preview',
    genre: 'sports',
    output_preset: 'standard',
    steps: [
      { name: 'Download', duration_sec: 22, detail: 'Fetched 90 min broadcast recording from cloud storage' },
      { name: 'Whole-Video Analysis', duration_sec: 140, detail: 'Gemini 3.1 Pro watched full match via gs:// URI — sports genre prompt emphasises goals, shots, saves' },
      { name: 'Audio Analysis', duration_sec: 18, detail: 'Crowd-noise RMS peaks correlated with on-field action' },
      { name: 'Segment Scoring', duration_sec: 165, detail: 'Gemini 3.1 Pro verified 32 candidate moments (goals, big saves, tactical plays)' },
      { name: 'Highlight Selection', duration_sec: 0.3, detail: 'Narrative-aware: chronological ordering, both-teams coverage' },
      { name: 'Quality Review', duration_sec: 40, detail: 'Self-review scored reel at 74/100 — accepted' },
      { name: 'Assembly', duration_sec: 30, detail: 'Broadcast-standard 16:9 with commentary audio preserved' },
    ],
    quality_review: { score: 74, threshold: 60, attempts: 1, notes: 'Balanced coverage of both sides, strong crowd-reaction cues' },
    segments: [
      { start: 312.0, end: 322.0, duration: 10.0, score: 88, label: 'Build-up: Northfield switches play left flank', selected: true, rationale: 'Establishes tactical context for opening goal' },
      { start: 322.0, end: 330.0, duration: 8.0, score: 95, label: 'GOAL — Northfield 1-0 (through ball, right-foot finish)', selected: true, rationale: 'First goal, crowd audio peak 94 dB' },
      { start: 1612.0, end: 1620.0, duration: 8.0, score: 82, label: 'Harbor FC keeper save — point-blank', selected: true, rationale: 'Big save, keeps match even' },
      { start: 2890.0, end: 2901.0, duration: 11.0, score: 91, label: 'GOAL — Harbor FC 1-1 (header from corner)', selected: true, rationale: 'Equaliser, narrative pivot' },
      { start: 4722.0, end: 4734.0, duration: 12.0, score: 86, label: 'Counter-attack sequence — 3 passes, cross, shot saved', selected: true, rationale: 'Late-match tension' },
      { start: 5180.0, end: 5195.0, duration: 15.0, score: 93, label: 'GOAL — Northfield 2-1 (stoppage-time winner)', selected: true, rationale: 'Match-winning moment, celebration' },
      { start: 420.0, end: 428.0, duration: 8.0, score: 22, label: 'Throw-in routine, no progression', selected: false, rationale: 'Low-tempo buildup, nothing materialises' },
      { start: 1080.0, end: 1092.0, duration: 12.0, score: 18, label: 'Tactical foul, yellow card — but no continuation', selected: false, rationale: 'Context only, not reel-worthy' },
      { start: 3200.0, end: 3212.0, duration: 12.0, score: 30, label: 'Midfield possession phase', selected: false, rationale: 'No penalty-box action' },
    ],
  };

  // Insert the hero highlights
  await prisma.highlight.upsert({
    where: { id: 'highlight-halo-ctf' },
    update: {
      videoUrl: ytUrl(YT.haloPower),
      thumbnailUrl: ytThumb(YT.haloPower),
      pipelineData: haloPipelineData,
      status: 'COMPLETED',
      duration: 75,
    },
    create: {
      id: 'highlight-halo-ctf',
      orgId: demoOrg.id,
      streamId: 'stream-halo-ctf',
      title: 'Halo Infinite CTF — Best Moments',
      videoUrl: ytUrl(YT.haloPower),
      thumbnailUrl: ytThumb(YT.haloPower),
      duration: 75,
      status: 'COMPLETED',
      pipelineData: haloPipelineData,
    },
  });
  console.log('  Highlight: Halo CTF (game-studios hero narrative)');

  await prisma.highlight.upsert({
    where: { id: 'highlight-apex-squad' },
    update: {
      videoUrl: ytUrl(YT.apexSquad),
      thumbnailUrl: ytThumb(YT.apexSquad),
      pipelineData: apexPipelineData,
      status: 'COMPLETED',
      duration: 40,
    },
    create: {
      id: 'highlight-apex-squad',
      orgId: demoOrg.id,
      streamId: 'stream-apex-ranked',
      title: 'Apex — Squad Wipe with Kraber (9:16 Social)',
      videoUrl: ytUrl(YT.apexSquad),
      thumbnailUrl: ytThumb(YT.apexSquad),
      duration: 40,
      status: 'COMPLETED',
      pipelineData: apexPipelineData,
    },
  });
  console.log('  Highlight: Apex BR (9:16 social preset)');

  await prisma.highlight.upsert({
    where: { id: 'highlight-soccer-match' },
    update: {
      videoUrl: ytUrl(YT.soccerGoal),
      thumbnailUrl: ytThumb(YT.soccerGoal),
      pipelineData: soccerPipelineData,
      status: 'COMPLETED',
      duration: 90,
    },
    create: {
      id: 'highlight-soccer-match',
      orgId: demoOrg.id,
      streamId: 'stream-soccer-match',
      title: 'Matchday Recap — Northfield 2-1 Harbor FC',
      videoUrl: ytUrl(YT.soccerGoal),
      thumbnailUrl: ytThumb(YT.soccerGoal),
      duration: 90,
      status: 'COMPLETED',
      pipelineData: soccerPipelineData,
    },
  });
  console.log('  Highlight: Soccer match (enterprise live-video narrative)');

  // Secondary highlights — fill out the grid
  const extraHighlights = [
    { id: 'highlight-fn-clutch', streamId: 'stream-fn-arena', title: 'Fortnite — Insane 1v4 Clutch', duration: 45, status: 'COMPLETED' as const, videoUrl: ytUrl(YT.fnClutch), thumbnailUrl: ytThumb(YT.fnClutch) },
    { id: 'highlight-rl-ot', streamId: 'stream-rl-tourney', title: 'Rocket League — OT Ceiling Shot', duration: 30, status: 'COMPLETED' as const, videoUrl: ytUrl(YT.rlGoals), thumbnailUrl: ytThumb(YT.rlGoals) },
    { id: 'highlight-val-ace', streamId: 'stream-val-comp', title: 'Valorant — Operator Ace on Ascent', duration: 55, status: 'COMPLETED' as const, videoUrl: ytUrl(YT.valAce), thumbnailUrl: ytThumb(YT.valAce) },
    { id: 'highlight-breakout', streamId: 'stream-sample-breakout', title: 'Highlights: Embedded Breakout Session', duration: 60, status: 'COMPLETED' as const, videoUrl: ytUrl(YT.breakout), thumbnailUrl: ytThumb(YT.breakout) },
  ];

  for (const h of extraHighlights) {
    const { id, ...data } = h;
    await prisma.highlight.upsert({
      where: { id },
      update: { videoUrl: data.videoUrl, thumbnailUrl: data.thumbnailUrl, status: data.status, duration: data.duration },
      create: { id, orgId: demoOrg.id, ...data },
    });
    console.log(`  Highlight: ${data.title}`);
  }

  console.log('\n' + '='.repeat(64));
  console.log('\n  DEMO ORG');
  console.log('  Slug:   substream-demo');
  console.log('  Login:  /login  or  /api/auth/demo-auto');
  console.log('\n  DEMO NARRATIVES');
  console.log('  - Halo CTF (FPS, game studios)');
  console.log('  - Apex BR (9:16 social preset)');
  console.log('  - Soccer match (enterprise live-video)');
  console.log('\n' + '='.repeat(64));
  console.log('\nSeed complete.');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
