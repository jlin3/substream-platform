/**
 * Auth module unit tests.
 *
 * Tests API key generation/verification and JWT sign/verify round-trip.
 */

import { describe, it, expect, beforeAll } from 'vitest';

// Set JWT_SECRET before importing auth modules
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-for-vitest-at-least-32-chars-long!!';
});

describe('API key generation', () => {
  it('generates a key with sk_live_ prefix and verifies it', async () => {
    const { generateApiKeyPair, verifyApiKey, isApiKeyFormat } = await import(
      '@/lib/auth/api-keys'
    );
    const { plaintext, hash, prefix } = generateApiKeyPair();

    expect(plaintext).toMatch(/^sk_live_/);
    expect(prefix).toBe(plaintext.slice(0, 16));
    expect(isApiKeyFormat(plaintext)).toBe(true);
    expect(isApiKeyFormat('not-an-api-key')).toBe(false);

    const matches = verifyApiKey(plaintext, hash);
    expect(matches).toBe(true);
  });
});

describe('JWT sign and verify', () => {
  it('round-trips a JWT payload', async () => {
    const { signJwt, verifyJwt } = await import('@/lib/auth/jwt');

    const token = await signJwt({
      sub: 'user-123',
      orgId: 'org-456',
      appId: 'app-789',
      scopes: ['streams:read', 'streams:write'],
    });

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const payload = await verifyJwt(token);
    expect(payload.sub).toBe('user-123');
    expect(payload.orgId).toBe('org-456');
    expect(payload.scopes).toContain('streams:read');
  });

  it('rejects a tampered token', async () => {
    const { signJwt, verifyJwt } = await import('@/lib/auth/jwt');

    const token = await signJwt({
      sub: 'user-123',
      orgId: 'org-456',
      appId: 'app-000',
      scopes: [],
    });

    const tampered = token.slice(0, -5) + 'XXXXX';
    await expect(verifyJwt(tampered)).rejects.toThrow();
  });
});
