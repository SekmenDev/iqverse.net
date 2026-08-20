import { describe, it, expect } from 'vitest';
import { computeWebhookHmacSha256, SAMPLE_WEBHOOKS } from '@/lib/webhook';

describe('Webhook Engine (lib/webhook)', () => {
  it('computes HMAC SHA-256 signature accurately', async () => {
    const signature = await computeWebhookHmacSha256('secret_key_123', '{"event":"ping"}');
    expect(signature).toBeTypeOf('string');
    expect(signature.startsWith('sha256=')).toBe(true);
    expect(signature).toHaveLength(71); // 'sha256=' (7) + 64 hex = 71
    expect(signature).toMatch(/^sha256=[0-9a-f]{64}$/);
  });

  it('provides pre-configured webhook samples', () => {
    expect(SAMPLE_WEBHOOKS.GitHub).toBeDefined();
    expect(SAMPLE_WEBHOOKS.GitHub.headers).toContain('X-GitHub-Event');
    expect(SAMPLE_WEBHOOKS.Stripe).toBeDefined();
    expect(SAMPLE_WEBHOOKS.Stripe.headers).toContain('Stripe-Signature');
  });
});
