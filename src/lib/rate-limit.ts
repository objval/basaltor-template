type RateLimitOptions = {
  bucket: string;
  key: string;
  windowMs: number;
  max: number;
  now?: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

function getStoreKey(bucket: string, key: string) {
  return `${bucket}:${key}`;
}

export function deriveRateLimitActor(headers: Headers, fallback: string) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || fallback;
}

export function getRateLimitState({ bucket, key, windowMs, max, now = Date.now() }: RateLimitOptions) {
  const storeKey = getStoreKey(bucket, key);
  const existing = rateLimitStore.get(storeKey);

  if (!existing || existing.resetAt <= now) {
    const nextRecord = {
      count: 1,
      resetAt: now + windowMs,
    };

    rateLimitStore.set(storeKey, nextRecord);

    return {
      allowed: true,
      remaining: Math.max(max - 1, 0),
      retryAfterMs: 0,
      resetAt: nextRecord.resetAt,
    };
  }

  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(existing.resetAt - now, 0),
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  rateLimitStore.set(storeKey, existing);

  return {
    allowed: true,
    remaining: Math.max(max - existing.count, 0),
    retryAfterMs: 0,
    resetAt: existing.resetAt,
  };
}

export function enforceRateLimit(options: RateLimitOptions) {
  const result = getRateLimitState(options);

  if (!result.allowed) {
    throw new Response("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": Math.ceil(result.retryAfterMs / 1000).toString(),
        "X-RateLimit-Reset": result.resetAt.toString(),
      },
    });
  }

  return result;
}

export function clearRateLimitStore() {
  rateLimitStore.clear();
}
