export interface R2PutOptions {
  contentType?: string;
  cacheControl?: string;
  idempotencyKey?: string;
}

export async function putObject(
  bucket: R2Bucket,
  key: string,
  body: ArrayBuffer | ReadableStream | string | Blob,
  opts: R2PutOptions = {}
): Promise<string> {
  const headers: Record<string, string> = {};
  if (opts.cacheControl) headers["cache-control"] = opts.cacheControl;
  if (opts.idempotencyKey) headers["idempotency-key"] = opts.idempotencyKey;

  await bucket.put(key, body, {
    httpMetadata: {
      contentType: opts.contentType ?? "application/octet-stream",
      cacheControl: opts.cacheControl,
    },
    customMetadata: opts.idempotencyKey
      ? { idempotencyKey: opts.idempotencyKey }
      : undefined,
  });

  return key;
}

export async function getObject(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  const obj = await bucket.get(key);
  return obj;
}

export function getPublicUrl(
  bucketPublicUrl: string,
  key: string
): string {
  const base = bucketPublicUrl.replace(/\/$/, "");
  return `${base}/${encodeURIComponent(key)}`;
}
