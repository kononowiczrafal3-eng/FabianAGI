const buckets = new Map();
const capacity = 40;
const refillPerMs = 2 / 1000;
const maxBuckets = 5000;

export function rateLimit(key) {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity, updatedAt: now };
    buckets.set(key, bucket);
  }
  bucket.tokens = Math.min(
    capacity,
    bucket.tokens + (now - bucket.updatedAt) * refillPerMs
  );
  bucket.updatedAt = now;
  if (bucket.tokens < 1) {
    return false;
  }
  bucket.tokens -= 1;
  if (buckets.size > maxBuckets) {
    for (const [bucketKey, value] of buckets) {
      if (now - value.updatedAt > 10 * 60 * 1000) buckets.delete(bucketKey);
    }
  }
  return true;
}
