/**
 * Webhook signature verification tests.
 *
 * Tests the HMAC-SHA256 signing scheme without importing the full
 * webhook service (which depends on Prisma/Redis).
 */

import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';

function hashSecret(secret: string): string {
  return createHmac('sha256', 'substream-webhook').update(secret).digest('hex');
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  const signingKey = hashSecret(secret);
  const expected = 'sha256=' + createHmac('sha256', signingKey).update(body).digest('hex');
  return expected === signature;
}

describe('Webhook signature verification', () => {
  const secret = 'my-webhook-secret-12345678901234';

  it('verifies a correctly signed payload', () => {
    const body = JSON.stringify({ event: 'stream.started', data: { streamId: '123' } });
    const signingKey = hashSecret(secret);
    const signature = 'sha256=' + createHmac('sha256', signingKey).update(body).digest('hex');

    expect(verifySignature(body, signature, secret)).toBe(true);
  });

  it('rejects a payload with wrong signature', () => {
    const body = JSON.stringify({ event: 'stream.started' });
    expect(verifySignature(body, 'sha256=invalid', secret)).toBe(false);
  });

  it('rejects a tampered payload', () => {
    const originalBody = JSON.stringify({ event: 'stream.started' });
    const signingKey = hashSecret(secret);
    const signature = 'sha256=' + createHmac('sha256', signingKey).update(originalBody).digest('hex');

    const tamperedBody = JSON.stringify({ event: 'stream.stopped' });
    expect(verifySignature(tamperedBody, signature, secret)).toBe(false);
  });

  it('produces different signatures for different secrets', () => {
    const body = JSON.stringify({ event: 'stream.started' });
    const key1 = hashSecret('secret-one-1234567890123456');
    const key2 = hashSecret('secret-two-1234567890123456');
    const sig1 = 'sha256=' + createHmac('sha256', key1).update(body).digest('hex');
    const sig2 = 'sha256=' + createHmac('sha256', key2).update(body).digest('hex');

    expect(sig1).not.toBe(sig2);
  });
});
