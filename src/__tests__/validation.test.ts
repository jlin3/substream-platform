/**
 * Zod validation schema tests.
 */

import { describe, it, expect } from 'vitest';
import {
  parseBody,
  CreateOrgSchema,
  CreateAppSchema,
  WebPublishStartSchema,
  WebPublishStopSchema,
  WhipStartSchema,
  HeartbeatSchema,
  WebhookRegisterSchema,
  CreateApiKeySchema,
} from '@/lib/validation';

describe('CreateOrgSchema', () => {
  it('accepts valid input', () => {
    const result = parseBody(CreateOrgSchema, { name: 'My Org' });
    expect(result.error).toBeUndefined();
    expect(result.data?.name).toBe('My Org');
  });

  it('rejects missing name', () => {
    const result = parseBody(CreateOrgSchema, {});
    expect(result.error).toBeDefined();
  });

  it('accepts optional slug', () => {
    const result = parseBody(CreateOrgSchema, { name: 'Org', slug: 'my-org' });
    expect(result.data?.slug).toBe('my-org');
  });

  it('rejects invalid slug format', () => {
    const result = parseBody(CreateOrgSchema, { name: 'Org', slug: 'INVALID SLUG!' });
    expect(result.error).toBeDefined();
  });
});

describe('CreateAppSchema', () => {
  it('accepts valid input', () => {
    const result = parseBody(CreateAppSchema, { name: 'App' });
    expect(result.data?.name).toBe('App');
  });

  it('rejects empty name', () => {
    const result = parseBody(CreateAppSchema, { name: '' });
    expect(result.error).toBeDefined();
  });
});

describe('WebPublishStartSchema', () => {
  it('requires streamerId or childId', () => {
    const result = parseBody(WebPublishStartSchema, {});
    expect(result.error).toBeDefined();
  });

  it('accepts streamerId', () => {
    const result = parseBody(WebPublishStartSchema, { streamerId: 'abc' });
    expect(result.data?.streamerId).toBe('abc');
  });

  it('accepts childId as alternative', () => {
    const result = parseBody(WebPublishStartSchema, { childId: 'child-1' });
    expect(result.data?.childId).toBe('child-1');
  });
});

describe('WebPublishStopSchema', () => {
  it('requires a valid UUID streamId', () => {
    const result = parseBody(WebPublishStopSchema, { streamId: 'not-a-uuid' });
    expect(result.error).toBeDefined();
  });

  it('accepts valid UUID', () => {
    const result = parseBody(WebPublishStopSchema, {
      streamId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.data?.streamId).toBe('550e8400-e29b-41d4-a716-446655440000');
  });
});

describe('WhipStartSchema', () => {
  it('requires streamerId or childId', () => {
    const result = parseBody(WhipStartSchema, {});
    expect(result.error).toBeDefined();
  });
});

describe('HeartbeatSchema', () => {
  it('accepts valid heartbeat', () => {
    const result = parseBody(HeartbeatSchema, {
      currentBitrateKbps: 2500,
      currentViewers: 10,
      streamHealth: 'healthy',
    });
    expect(result.data?.currentBitrateKbps).toBe(2500);
  });

  it('accepts empty body (all fields optional)', () => {
    const result = parseBody(HeartbeatSchema, {});
    expect(result.error).toBeUndefined();
  });

  it('rejects invalid streamHealth', () => {
    const result = parseBody(HeartbeatSchema, { streamHealth: 'invalid' });
    expect(result.error).toBeDefined();
  });
});

describe('WebhookRegisterSchema', () => {
  it('accepts valid webhook registration', () => {
    const result = parseBody(WebhookRegisterSchema, {
      url: 'https://example.com/webhook',
    });
    expect(result.data?.url).toBe('https://example.com/webhook');
  });

  it('rejects invalid URL', () => {
    const result = parseBody(WebhookRegisterSchema, { url: 'not-a-url' });
    expect(result.error).toBeDefined();
  });
});

describe('CreateApiKeySchema', () => {
  it('accepts empty body (all optional)', () => {
    const result = parseBody(CreateApiKeySchema, {});
    expect(result.error).toBeUndefined();
  });

  it('rejects rateLimit over max', () => {
    const result = parseBody(CreateApiKeySchema, { rateLimit: 99999 });
    expect(result.error).toBeDefined();
  });
});
