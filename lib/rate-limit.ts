import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset?: number;
};

// Singleton Redis client (hanya dibuat kalau env ada)
let redisClient: Redis | null = null;
let redisWarningShown = false;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (process.env.NODE_ENV === "production" && !redisWarningShown) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / TOKEN tidak ada. Rate limit pakai in-memory (TIDAK AMAN di Vercel). Segera set di Vercel Dashboard."
      );
      redisWarningShown = true;
    }
    return null;
  }

  try {
    redisClient = new Redis({ url, token });
    return redisClient;
  } catch (e) {
    console.error("[rate-limit] Gagal init Redis:", e);
    return null;
  }
}

// Cache Ratelimit instance per limit+window biar tidak buat baru tiap request
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const cacheKey = `${limit}:${windowSec}`;

  if (limiterCache.has(cacheKey)) {
    return limiterCache.get(cacheKey)!;
  }

  // Pakai slidingWindow biar lebih adil daripada fixedWindow
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: true,
    prefix: "ratelimit:ppdb",
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

// Fallback in-memory untuk local dev (sama seperti sebelumnya tapi dengan cleanup)
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function rateLimitInMemory(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number }
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, reset: bucket.resetAt };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, reset: bucket.resetAt };
}

// Fungsi utama - sekarang ASYNC, WAJIB pakai await
export async function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): Promise<RateLimitResult> {
  const limiter = getLimiter(limit, windowMs);

  if (limiter) {
    try {
      const { success, remaining, reset } = await limiter.limit(key);
      return { success, remaining, reset };
    } catch (e) {
      console.error("[rate-limit] Redis error, fallback ke in-memory:", e);
      return rateLimitInMemory(key, { limit, windowMs });
    }
  }

  // Fallback: in-memory
  return rateLimitInMemory(key, { limit, windowMs });
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  // Vercel-specific header
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();
  return "unknown";
}

// Cleanup buckets setiap 10 menit biar tidak memory leak di dev
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  }, 10 * 60 * 1000).unref?.();
}
