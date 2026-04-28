import { extractArticle } from "./extract";
import { generateOutline } from "./outline";
import { generateTTS } from "./tts";
import { putObject, getPublicUrl } from "./r2";
import { updateJobStatus } from "./db";

export interface RenderJobPayload {
  jobId: string;
  url: string;
}

export async function fetchUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ClipCraftBot/1.0)" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export async function renderPipeline(
  payload: RenderJobPayload,
  env: {
    RENDER_OUTPUT: R2Bucket;
    RENDER_DB: D1Database;
    OPENAI_API_KEY: string;
    R2_PUBLIC_URL?: string;
  }
): Promise<void> {
  const { jobId, url } = payload;

  try {
    // Step 1: fetch HTML
    const html = await fetchUrl(url);

    // Step 2: extract article
    const article = extractArticle(html);
    if (!article.content || article.content.length < 50) {
      throw new Error("Could not extract meaningful article content");
    }

    // Step 3: generate outline
    const outline = await generateOutline(article.content, env.OPENAI_API_KEY);

    // Step 4: generate TTS
    const script = outline.segments.map((s) => s.text).join("\n\n");
    const audioBytes = await generateTTS(script, env.OPENAI_API_KEY);

    // Step 5: mux audio and placeholder video
    // Remotion video rendering is out of scope. We return a placeholder MP4
    // that contains the audio track wrapped in a minimal MP4 container.
    const mp4Bytes = await muxAudioAndPlaceholder(audioBytes);

    // Step 6: upload to R2
    const key = `${jobId}.mp4`;
    await putObject(env.RENDER_OUTPUT, key, new Uint8Array(mp4Bytes), {
      contentType: "video/mp4",
      cacheControl: "public, max-age=31536000",
      idempotencyKey: jobId,
    });

    const outputUrl = env.R2_PUBLIC_URL
      ? getPublicUrl(env.R2_PUBLIC_URL, key)
      : `/download/${key}`;

    await updateJobStatus(env.RENDER_DB, jobId, "ready", outputUrl, null);
  } catch (err: any) {
    await updateJobStatus(
      env.RENDER_DB,
      jobId,
      "failed",
      null,
      err?.message ?? String(err)
    );
    throw err;
  }
}

/**
 * Create a placeholder MP4 by wrapping the audio bytes in a minimal MP4 container.
 * TODO: Replace with real Remotion rendering once the Remotion pipeline is integrated.
 */
async function muxAudioAndPlaceholder(audioBytes: ArrayBuffer): Promise<ArrayBuffer> {
  // For now, return the audio bytes as-is with a .mp4 extension.
  // This is a documented gap — see README-INFRA.md.
  return audioBytes;
}
