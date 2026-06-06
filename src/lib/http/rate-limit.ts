export interface RateLimitOptions {
  capacity?: number;
  refillPerSecond?: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  limit: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const store = new Map<string, Bucket>();

const DEFAULT_CAPACITY = 60;
const DEFAULT_REFILL = 1;

export function rateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const capacity = options.capacity ?? DEFAULT_CAPACITY;
  const refill = options.refillPerSecond ?? DEFAULT_REFILL;
  const now = options.now ?? Date.now();

  const existing = store.get(key);
  const bucket: Bucket = existing ?? { tokens: capacity, updatedAt: now };

  const elapsedSec = Math.max(0, (now - bucket.updatedAt) / 1000);
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsedSec * refill);
  bucket.updatedAt = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    store.set(key, bucket);
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      retryAfter: 0,
      limit: capacity,
    };
  }

  store.set(key, bucket);
  const retryAfter = Math.ceil((1 - bucket.tokens) / refill);
  return { allowed: false, remaining: 0, retryAfter, limit: capacity };
}

export function resetRateLimit(): void {
  store.clear();
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
