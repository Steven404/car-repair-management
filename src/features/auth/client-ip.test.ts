import { describe, expect, it } from 'vitest';
import { pickClientIp } from './client-ip';

const vercel = { trustVercel: true };

describe('pickClientIp on Vercel', () => {
  it('prefers the last hop of x-vercel-forwarded-for', () => {
    expect(pickClientIp('203.0.113.7', '1.1.1.1, 198.51.100.2', vercel)).toBe('203.0.113.7');
    expect(pickClientIp('6.6.6.6, 203.0.113.7', null, vercel)).toBe('203.0.113.7');
  });

  it('otherwise takes the last hop of x-forwarded-for, not the forgeable first one', () => {
    expect(pickClientIp(null, '6.6.6.6, 7.7.7.7,  198.51.100.2 ', vercel)).toBe('198.51.100.2');
  });

  it('is "unknown" without headers', () => {
    expect(pickClientIp(null, null, vercel)).toBe('unknown');
    expect(pickClientIp('', '', vercel)).toBe('unknown');
  });
});

describe('pickClientIp off Vercel', () => {
  it('ignores forged headers by default', () => {
    expect(pickClientIp('6.6.6.6', '6.6.6.6, 7.7.7.7', { trustVercel: false })).toBe('unknown');
    expect(pickClientIp('6.6.6.6', '7.7.7.7', { trustedProxyHops: 0 })).toBe('unknown');
  });

  it('takes the configured hop from the right of x-forwarded-for', () => {
    expect(pickClientIp(null, '6.6.6.6, 203.0.113.7', { trustedProxyHops: 1 })).toBe('203.0.113.7');
    expect(pickClientIp(null, '6.6.6.6, 203.0.113.7, 10.0.0.1', { trustedProxyHops: 2 })).toBe('203.0.113.7');
  });

  it('does not trust the Vercel header even with trusted hops', () => {
    expect(pickClientIp('6.6.6.6', '203.0.113.7', { trustedProxyHops: 1 })).toBe('203.0.113.7');
  });

  it('is "unknown" when the chain is shorter than the configured hops', () => {
    expect(pickClientIp(null, '203.0.113.7', { trustedProxyHops: 2 })).toBe('unknown');
    expect(pickClientIp(null, null, { trustedProxyHops: 1 })).toBe('unknown');
  });
});
