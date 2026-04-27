/**
 * Email Batch Send Wrapper
 *
 * DECISION (LOCKED): Email pipeline must batch sends.
 * Weekly digest at 100x usage will rate-limit the email provider into oblivion
 * if sent synchronously. Batching is table stakes.
 */

import { Resend } from "resend";
import { BRAND } from "@/config/brand";

const resend = new Resend(process.env.RESEND_API_KEY!);

/** Configurable batch size — defaults to 100 per decisions.md open questions */
const BATCH_SIZE = parseInt(process.env.EMAIL_BATCH_SIZE || "100", 10);

/** Delay between batches in ms — prevents rate-limiting */
const BATCH_DELAY_MS = parseInt(process.env.EMAIL_BATCH_DELAY_MS || "500", 10);

/** Max retries per batch before dead-letter */
const MAX_RETRIES = 3;

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Send a single email.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const from = payload.from || `${BRAND.voiceName} <hello@localgenius.company>`;

  await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

/**
 * Send emails in batches with exponential backoff on rate-limit.
 *
 * @param payloads Array of email payloads to send
 * @returns Summary of sent / failed emails
 */
export async function sendEmailBatch(
  payloads: EmailPayload[]
): Promise<{
  sent: number;
  failed: number;
  failures: { payload: EmailPayload; error: string }[];
}> {
  const failures: { payload: EmailPayload; error: string }[] = [];
  let sent = 0;

  // Split into chunks
  const chunks: EmailPayload[][] = [];
  for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
    chunks.push(payloads.slice(i, i + BATCH_SIZE));
  }

  for (const chunk of chunks) {
    const chunkResult = await sendChunkWithRetry(chunk);
    sent += chunkResult.sent;
    failures.push(...chunkResult.failures);

    // Delay between batches to respect rate limits
    if (chunks.length > 1) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return {
    sent,
    failed: failures.length,
    failures,
  };
}

async function sendChunkWithRetry(
  chunk: EmailPayload[],
  attempt = 1
): Promise<{
  sent: number;
  failures: { payload: EmailPayload; error: string }[];
}> {
  const failures: { payload: EmailPayload; error: string }[] = [];
  let sent = 0;

  for (const payload of chunk) {
    try {
      await sendEmail(payload);
      sent++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Retry on rate limit (429) or transient errors (5xx)
      if (attempt < MAX_RETRIES && isRetryableError(errorMessage)) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await sleep(backoffMs);
        return sendChunkWithRetry(chunk, attempt + 1);
      }

      failures.push({ payload, error: errorMessage });
    }
  }

  return { sent, failures };
}

function isRetryableError(errorMessage: string): boolean {
  const retryablePatterns = [
    /rate.limit/i,
    /429/,
    /500/,
    /502/,
    /503/,
    /504/,
    /timeout/i,
    /econnreset/i,
    /etimedout/i,
  ];
  return retryablePatterns.some((pattern) => pattern.test(errorMessage));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { BATCH_SIZE, MAX_RETRIES };
