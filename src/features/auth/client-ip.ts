type ClientIpOptions = {
  /** Whether the forwarding headers come from a proxy we run behind. */
  trustVercel?: boolean;
  /** Trusted reverse proxies in front of the app, off Vercel. 0 trusts none. */
  trustedProxyHops?: number;
};

function defaultOptions(): Required<ClientIpOptions> {
  const hops = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? '', 10);
  return {
    trustVercel: process.env.VERCEL === '1',
    trustedProxyHops: Number.isInteger(hops) && hops > 0 ? hops : 0,
  };
}

/**
 * The visitor's address for the per-IP limit. A forwarding header is only as
 * honest as the proxy that wrote it: off Vercel, x-vercel-forwarded-for is a
 * plain client header, and `next start` only fills x-forwarded-for when it is
 * absent, so a client-sent value would win. So:
 * - On Vercel, take the last hop of x-vercel-forwarded-for, else of
 *   x-forwarded-for (the one the platform added, not a client-supplied one).
 * - Elsewhere, only with TRUSTED_PROXY_HOPS=n (n proxies we run in front of
 *   the app), take the nth hop from the right of x-forwarded-for.
 * - Otherwise 'unknown', one shared bucket; the per-email and device limits
 *   still protect the accounts.
 */
export function pickClientIp(
  vercelForwardedFor: string | null,
  forwardedFor: string | null,
  options: ClientIpOptions = defaultOptions()
): string {
  const hopFromRight = (header: string | null, n: number) => header?.split(',').at(-n)?.trim();
  if (options.trustVercel) {
    return hopFromRight(vercelForwardedFor, 1) || hopFromRight(forwardedFor, 1) || 'unknown';
  }
  const hops = options.trustedProxyHops ?? 0;
  if (hops > 0) {
    const parts = forwardedFor?.split(',') ?? [];
    // Fewer hops than proxies means the chain is not what we expect.
    if (parts.length >= hops) return parts[parts.length - hops].trim() || 'unknown';
  }
  return 'unknown';
}
