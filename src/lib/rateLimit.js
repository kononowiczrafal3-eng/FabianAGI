const buckets = new Map();
const maxRequests = 30;
const windowMs = 60 * 1000;
const maxBuckets = 5000;

export function rateLimit(key) {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (buckets.size > maxBuckets) {
    for (const [bucketKey, value] of buckets) {
      if (now > value.resetAt) buckets.delete(bucketKey);
    }
  }
  return bucket.count <= maxRequests;
}
