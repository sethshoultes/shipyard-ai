const TTL_SECONDS = 86400;

export async function cacheGet(bucket: R2Bucket, key: string): Promise<Uint8Array | null> {
  const obj = await bucket.get(key);
  if (!obj) return null;
  const ab = await obj.arrayBuffer();
  return new Uint8Array(ab);
}

export async function cachePut(bucket: R2Bucket, key: string, bytes: Uint8Array): Promise<void> {
  await bucket.put(key, bytes, {
    httpMetadata: {
      contentType: "image/png",
      cacheControl: `public, max-age=${TTL_SECONDS}`,
    },
    customMetadata: {
      generated: String(Date.now()),
    },
  });
}
