/**
 * Seed test data for demo purposes
 * 
 * Creates two sets of credentials:
 * 1. Demo credentials (for SDK users to test immediately)
 * 2. Test credentials (for internal testing)
 * 
 * Run: pnpm db:seed
 */

import { prisma } from '../src/lib/prisma';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // =========================================================================
  // DEMO CREDENTIALS - For SDK users to test immediately
  // =========================================================================
  console.log('📦 Creating demo credentials for SDK users...\n');

  // Demo child user (the streamer)
  const demoChildUser = await prisma.user.upsert({
    where: { email: 'demo@substream.dev' },
    update: {},
    create: {
      id: 'demo-user-001',
      email: 'demo@substream.dev',
      role: 'CHILD',
      displayName: 'Demo Streamer',
      kidVerified: true,
    },
  });
  console.log('✅ Demo child user:', demoChildUser.id);

  // Demo child profile
  const demoChildProfile = await prisma.childProfile.upsert({
    where: { userId: demoChildUser.id },
    update: {},
    create: {
      id: 'demo-child-001',
      userId: demoChildUser.id,
      streamingEnabled: true,
      maxStreamDuration: 60, // 1 hour max for demo
    },
  });
  console.log('✅ Demo child profile:', demoChildProfile.id);

  // Demo parent user (the viewer)
  const demoParentUser = await prisma.user.upsert({
    where: { email: 'demo-viewer@substream.dev' },
    update: {},
    create: {
      id: 'demo-viewer-001',
      email: 'demo-viewer@substream.dev',
      role: 'PARENT',
      displayName: 'Demo Viewer',
    },
  });
  console.log('✅ Demo parent user:', demoParentUser.id);

  // Demo parent profile
  const demoParentProfile = await prisma.parentProfile.upsert({
    where: { userId: demoParentUser.id },
    update: {},
    create: {
      id: 'demo-parent-001',
      userId: demoParentUser.id,
      notificationsEnabled: false,
    },
  });
  console.log('✅ Demo parent profile:', demoParentProfile.id);

  // Link demo parent to demo child
  await prisma.parentChildRelation.upsert({
    where: {
      parentId_childId: {
        parentId: demoParentProfile.id,
        childId: demoChildProfile.id,
      },
    },
    update: {},
    create: {
      id: 'demo-relation-001',
      parentId: demoParentProfile.id,
      childId: demoChildProfile.id,
      canWatch: true,
      canViewVods: true,
    },
  });
  console.log('✅ Linked demo parent to demo child\n');

  // =========================================================================
  // DEMO ORGANIZATION - For dashboard demo flow
  // =========================================================================
  console.log('🏢 Creating demo organization for dashboard...\n');

  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'substream-demo' },
    update: {},
    create: {
      name: 'Substream Demo',
      slug: 'substream-demo',
      plan: 'PRO',
    },
  });
  console.log('✅ Demo org:', demoOrg.slug);

  // Sample streams for the demo dashboard
  const sampleStreams = [
    { id: 'demo-stream-001', title: 'Epic Fortnite Match', streamerId: 'demo-user-001', streamerName: 'ProGamer99', status: 'RECORDED' as const, durationSecs: 3600, recordingUrl: 's3://demo-bucket/recordings/stream-001/' },
    { id: 'demo-stream-002', title: 'Minecraft Build Challenge', streamerId: 'demo-user-001', streamerName: 'ProGamer99', status: 'RECORDED' as const, durationSecs: 2400, recordingUrl: 's3://demo-bucket/recordings/stream-002/' },
    { id: 'demo-stream-003', title: 'Valorant Ranked Grind', streamerId: 'demo-user-001', streamerName: 'ProGamer99', status: 'ENDED' as const, durationSecs: 5400 },
    { id: 'demo-stream-004', title: 'Rocket League Tournament', streamerId: 'demo-user-001', streamerName: 'ProGamer99', status: 'RECORDED' as const, durationSecs: 1800, recordingUrl: 's3://demo-bucket/recordings/stream-004/' },
    { id: 'demo-stream-005', title: 'League of Legends Clash', streamerId: 'demo-user-001', streamerName: 'ProGamer99', status: 'ENDED' as const, durationSecs: 4200 },
  ];

  for (const s of sampleStreams) {
    const startedAt = new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000));
    await prisma.stream.upsert({
      where: { appId_streamerId: { appId: demoOrg.id, streamerId: s.streamerId + '-' + s.id } },
      update: {},
      create: {
        id: s.id,
        appId: demoOrg.id,
        orgId: demoOrg.id,
        streamerId: s.streamerId + '-' + s.id,
        streamerName: s.streamerName,
        title: s.title,
        status: s.status,
        durationSecs: s.durationSecs,
        recordingUrl: s.recordingUrl || null,
        startedAt,
        endedAt: new Date(startedAt.getTime() + s.durationSecs * 1000),
      },
    });
  }
  console.log('✅ Created', sampleStreams.length, 'sample streams');

  // Sample highlights
  const sampleHighlights = [
    { id: 'demo-hl-001', streamId: 'demo-stream-001', title: 'Highlights: Epic Fortnite Match', status: 'COMPLETED' as const, videoUrl: 'https://example.com/highlights/001.mp4', duration: 90 },
    { id: 'demo-hl-002', streamId: 'demo-stream-002', title: 'Highlights: Minecraft Build Challenge', status: 'COMPLETED' as const, videoUrl: 'https://example.com/highlights/002.mp4', duration: 75 },
    { id: 'demo-hl-003', streamId: 'demo-stream-004', title: 'Highlights: Rocket League Tournament', status: 'PROCESSING' as const, duration: null },
  ];

  for (const h of sampleHighlights) {
    await prisma.highlight.upsert({
      where: { id: h.id },
      update: {},
      create: {
        id: h.id,
        orgId: demoOrg.id,
        streamId: h.streamId,
        title: h.title,
        status: h.status,
        videoUrl: h.videoUrl || null,
        duration: h.duration,
        pipelineData: h.status === 'COMPLETED' ? {
          steps: [
            { name: 'Download', status: 'completed', duration_ms: 2300 },
            { name: 'Analyze', status: 'completed', duration_ms: 15000 },
            { name: 'Select Segments', status: 'completed', duration_ms: 800 },
            { name: 'Compile', status: 'completed', duration_ms: 5200 },
          ],
          total_segments: 24,
          selected_segments: 6,
          source_duration: h.streamId === 'demo-stream-001' ? 3600 : 1800,
        } : undefined,
      },
    });
  }
  console.log('✅ Created', sampleHighlights.length, 'sample highlights\n');

  // =========================================================================
  // TEST CREDENTIALS - For internal testing
  // =========================================================================
  console.log('🧪 Creating test credentials for internal use...\n');

  // Test child user
  const testChildUser = await prisma.user.upsert({
    where: { email: 'test-child@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test-child@example.com',
      role: 'CHILD',
      displayName: 'Test Child',
      kidVerified: true,
    },
  });
  console.log('✅ Test child user:', testChildUser.id);

  // Test child profile
  const testChildProfile = await prisma.childProfile.upsert({
    where: { userId: testChildUser.id },
    update: {},
    create: {
      id: 'test-child-id',
      userId: testChildUser.id,
      streamingEnabled: true,
      maxStreamDuration: 120,
    },
  });
  console.log('✅ Test child profile:', testChildProfile.id);

  // Test parent user
  const testParentUser = await prisma.user.upsert({
    where: { email: 'test-parent@example.com' },
    update: {},
    create: {
      id: 'test-parent-user-id',
      email: 'test-parent@example.com',
      role: 'PARENT',
      displayName: 'Test Parent',
    },
  });
  console.log('✅ Test parent user:', testParentUser.id);

  // Test parent profile
  const testParentProfile = await prisma.parentProfile.upsert({
    where: { userId: testParentUser.id },
    update: {},
    create: {
      id: 'test-parent-id',
      userId: testParentUser.id,
      notificationsEnabled: true,
    },
  });
  console.log('✅ Test parent profile:', testParentProfile.id);

  // Link test parent to test child
  await prisma.parentChildRelation.upsert({
    where: {
      parentId_childId: {
        parentId: testParentProfile.id,
        childId: testChildProfile.id,
      },
    },
    update: {},
    create: {
      id: 'test-relation-id',
      parentId: testParentProfile.id,
      childId: testChildProfile.id,
      canWatch: true,
      canViewVods: true,
    },
  });
  console.log('✅ Linked test parent to test child\n');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  🎮 DEMO CREDENTIALS (for SDK users)');
  console.log('');
  console.log('  Use these in your Unity project to test streaming:');
  console.log('');
  console.log('    Child ID:    demo-child-001');
  console.log('    Auth Token:  demo-token');
  console.log('');
  console.log('  Viewer credentials:');
  console.log('');
  console.log('    Parent ID:   demo-viewer-001');
  console.log('    Auth Token:  demo-viewer-token');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  🧪 TEST CREDENTIALS (for internal testing)');
  console.log('');
  console.log('    Child ID:    test-child-id');
  console.log('    User ID:     test-user-id');
  console.log('    Parent ID:   test-parent-user-id');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('🎉 Seed complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
