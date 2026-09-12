/**
 * RATE LIMITER SEDERHANA (IN-MEMORY)
 * -------------------------------------------------------
 * Cukup untuk development / single-instance server.
 *
 * ⚠️ PENTING untuk PRODUCTION di Vercel: environment serverless
 * Vercel menjalankan banyak instance function secara paralel dan
 * TIDAK berbagi memori antar-instance, jadi limiter in-memory ini
 * TIDAK efektif membatasi secara global di production.
 * Untuk production, ganti dengan rate limiter berbasis penyimpanan
 * bersama, misalnya Upstash Redis (@upstash/ratelimit) atau
 * Vercel Edge Config / KV. Struktur fungsi di bawah sengaja dibuat
 * mirip agar mudah diganti nanti.
 * -------------------------------------------------------
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
