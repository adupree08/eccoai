import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Durable rate limiting + global spend cap for the public demo endpoint.
//
// Why two layers:
//  - Per-IP limit deters casual abuse.
//  - Global daily cap bounds worst-case cost even if an attacker rotates/spoofs
//    IPs, because it counts total calls regardless of who made them.
//
// Both live in Upstash Redis so they survive across Vercel's serverless
// instances (an in-memory counter resets on every cold start and does not
// share state between concurrent instances).

// Tune these to taste.
const PER_IP_LIMIT = 8; // requests
const PER_IP_WINDOW = "1 h"; // per hour
const GLOBAL_DAILY_CAP = 500; // total demo generations allowed per day

let redis: Redis | null = null;
let ipLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null; // not configured yet
  redis = new Redis({ url, token });
  return redis;
}

function getIpLimiter(): Ratelimit | null {
  if (ipLimiter) return ipLimiter;
  const r = getRedis();
  if (!r) return null;
  ipLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(PER_IP_LIMIT, PER_IP_WINDOW),
    prefix: "ecco:demo:ip",
    analytics: false,
  });
  return ipLimiter;
}

export type RateDecision = { allowed: boolean; reason?: string };

/**
 * Check whether a demo generation is allowed for this client.
 * Fails CLOSED when Redis is configured but errors, and (deliberately) OPEN
 * when Upstash env vars are absent so local dev and preview still work.
 */
export async function checkDemoRateLimit(ip: string): Promise<RateDecision> {
  const r = getRedis();

  // Not configured (e.g. local dev): allow, but this should be set in prod.
  if (!r) {
    if (process.env.NODE_ENV === "production") {
      console.warn("Upstash not configured; demo endpoint has no durable rate limit");
    }
    return { allowed: true };
  }

  try {
    // Layer 1: per-IP.
    const limiter = getIpLimiter();
    if (limiter) {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return { allowed: false, reason: "Rate limit exceeded. Try again later." };
      }
    }

    // Layer 2: global daily cap (IP-independent hard ceiling on spend).
    const dayKey = `ecco:demo:global:${new Date().toISOString().slice(0, 10)}`;
    const count = await r.incr(dayKey);
    if (count === 1) {
      await r.expire(dayKey, 60 * 60 * 24 + 3600); // ~25h, self-cleans
    }
    if (count > GLOBAL_DAILY_CAP) {
      return { allowed: false, reason: "The demo is busy today. Please try again tomorrow or sign up." };
    }

    return { allowed: true };
  } catch (error) {
    // Redis is configured but unreachable: fail closed to protect spend.
    console.error("Rate limit check failed:", error);
    return { allowed: false, reason: "Demo is temporarily unavailable." };
  }
}
