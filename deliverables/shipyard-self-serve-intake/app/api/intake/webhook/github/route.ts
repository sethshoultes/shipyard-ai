import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getLogger } from "@/lib/intake/logger";

/**
 * GitHub Webhook Handler - Intake Endpoint
 * Receives GitHub webhook events for intake-labeled issues
 * Implements HMAC-SHA256 signature validation per REQ-INFRA-001
 *
 * Requirements:
 * - Verify webhook signature using X-Hub-Signature-256
 * - Extract GitHub webhook headers (X-GitHub-Event, X-GitHub-Delivery)
 * - Filter by 'intake-request' label
 * - Log webhook receipt with timestamp
 * - Return 200 OK immediately (async processing after response)
 * - Must respond within 5 seconds to avoid GitHub timeout
 */

const logger = getLogger();

interface WebhookPayload {
  action?: string;
  issue?: {
    number: number;
    title: string;
    body?: string;
    labels: Array<{ name: string }>;
    user?: { login: string };
    html_url?: string;
  };
  repository?: {
    name: string;
    full_name: string;
  };
}

// HMAC-SHA256 signature validation
function verifyWebhookSignature(
  requestBody: Buffer,
  signature: string | null,
  requestId: string
): boolean {
  // Get secret from environment
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    logger.error("GITHUB_WEBHOOK_SECRET not configured", new Error("Missing secret"), {
      component: "WebhookHandler",
      requestId,
    });
    return false;
  }

  // Check if signature header exists
  if (!signature) {
    logger.warn("Missing X-Hub-Signature-256 header", {
      component: "WebhookHandler",
      requestId,
    });
    return false;
  }

  // Compute HMAC-SHA256
  // GitHub sends: X-Hub-Signature-256: sha256=<hex-digest>
  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(requestBody)
    .digest("hex");

  const expectedSignature = signature.startsWith("sha256=")
    ? signature.slice(7) // Remove "sha256=" prefix
    : signature;

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    // timingSafeEqual throws if buffers are different lengths
    logger.warn("Signature length mismatch - possible tampering attempt", {
      component: "WebhookHandler",
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// Check if issue has 'intake-request' label
function hasIntakeLabel(labels: Array<{ name: string }> | undefined): boolean {
  if (!labels || !Array.isArray(labels)) {
    return false;
  }
  return labels.some((label) => label.name === "intake-request");
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const requestId = crypto.randomUUID();

  try {
    // Extract GitHub webhook headers
    const githubEvent = request.headers.get("x-github-event");
    const githubDelivery = request.headers.get("x-github-delivery");
    const signature = request.headers.get("x-hub-signature-256");

    // Log webhook receipt with timestamp
    logger.logWebhookReceipt({
      requestId,
      githubEvent,
      githubDelivery,
      signaturePresent: !!signature,
    });

    // Read raw request body (needed for HMAC computation)
    const requestBody = await request.arrayBuffer();
    const bodyBuffer = Buffer.from(requestBody);

    // Verify signature using timing-safe comparison
    if (!verifyWebhookSignature(bodyBuffer, signature, requestId)) {
      logger.warn("Webhook signature validation failed", {
        component: "WebhookHandler",
        requestId,
        github_event: githubEvent,
        github_delivery: githubDelivery,
        signature_present: !!signature,
      });

      // Return 200 OK even for invalid signatures to not leak information
      // But log the failure for security monitoring
      return NextResponse.json(
        { status: "received" },
        { status: 200 }
      );
    }

    // Signature validated, continue processing
    logger.debug("Webhook signature validated", {
      component: "WebhookHandler",
      requestId,
      github_event: githubEvent,
      github_delivery: githubDelivery,
    });

    // Parse the payload
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(bodyBuffer.toString("utf-8"));
    } catch (parseError) {
      logger.error("Failed to parse webhook payload", parseError, {
        component: "WebhookHandler",
        requestId,
      });
      return NextResponse.json({ status: "received" }, { status: 200 });
    }

    // Extract relevant webhook data
    const issue = payload.issue;
    const repo = payload.repository;
    const action = payload.action;

    if (!issue || !repo) {
      logger.debug("Webhook missing issue or repository data", {
        component: "WebhookHandler",
        requestId,
        has_issue: !!issue,
        has_repo: !!repo,
      });
      return NextResponse.json({ status: "received" }, { status: 200 });
    }

    // Check for 'intake-request' label
    const hasIntakeRequestLabel = hasIntakeLabel(issue.labels);

    logger.info("Webhook payload processed", {
      component: "WebhookHandler",
      requestId,
      github_event: githubEvent,
      action,
      issue_id: issue.number,
      issue_title: issue.title,
      repo: repo.full_name,
      has_intake_label: hasIntakeRequestLabel,
      label_count: issue.labels?.length || 0,
      requested_by: issue.user?.login,
    });

    if (!hasIntakeRequestLabel) {
      logger.debug("Webhook does not have intake-request label, skipping", {
        component: "WebhookHandler",
        requestId,
        issue_id: issue.number,
        labels: issue.labels?.map((l) => l.name) || [],
      });
      // Return 200 OK immediately - GitHub should not wait for processing
      return NextResponse.json({ status: "received" }, { status: 200 });
    }

    // Log that this issue will be processed
    logger.info("Intake request detected, queuing for processing", {
      component: "WebhookHandler",
      requestId,
      issue_id: issue.number,
      issue_title: issue.title,
      issue_url: issue.html_url,
      repo: repo.full_name,
      action,
    });

    // TODO: Queue async processing tasks:
    // - Content analysis
    // - Priority detection
    // - PRD generation
    // - Bot comment response

    // Return 200 OK immediately to GitHub (async processing happens after response)
    return NextResponse.json(
      {
        status: "received",
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch all errors and log, never crash
    logger.error("Webhook handler error", error, {
      component: "WebhookHandler",
      requestId,
    });

    // Return 200 OK even on errors to not let GitHub think webhook failed
    // Real errors are logged for monitoring
    return NextResponse.json(
      { status: "received" },
      { status: 200 }
    );
  }
}
