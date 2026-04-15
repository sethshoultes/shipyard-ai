import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendSiteLiveEmail,
  sendBuildFailedEmail,
  sendReadyForReviewEmail,
} from "@/lib/email/send";

// Webhook payload schema from pipeline
interface PipelineWebhookPayload {
  projectId: string;
  status: "in_progress" | "ready_for_review" | "live" | "failed";
  siteUrl?: string;
  stagingUrl?: string;
  errorMessage?: string;
  timestamp: string;
}

// Verify webhook signature
function verifyWebhookSignature(request: NextRequest): boolean {
  const webhookSecret = process.env.PIPELINE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("PIPELINE_WEBHOOK_SECRET not configured");
    return false;
  }

  const signature = request.headers.get("x-webhook-signature");

  if (!signature) {
    console.error("Missing webhook signature");
    return false;
  }

  // In production, implement HMAC verification
  // For now, simple secret comparison
  return signature === webhookSecret;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    if (!verifyWebhookSignature(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: PipelineWebhookPayload = await request.json();

    // Validate payload
    if (!payload.projectId || !payload.status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch project to get client email
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("name, client_id, clients(email)")
      .eq("id", payload.projectId)
      .single();

    if (projectError || !project) {
      console.error("Project not found:", payload.projectId);
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Update project status
    const updateData: {
      status: string;
      site_url?: string;
      staging_url?: string;
    } = {
      status: payload.status,
    };

    if (payload.siteUrl) {
      updateData.site_url = payload.siteUrl;
    }

    if (payload.stagingUrl) {
      updateData.staging_url = payload.stagingUrl;
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", payload.projectId);

    if (updateError) {
      console.error("Failed to update project:", updateError);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    // Create status event audit log
    const { error: eventError } = await supabase.from("status_events").insert({
      project_id: payload.projectId,
      status: payload.status,
      metadata: {
        site_url: payload.siteUrl,
        staging_url: payload.stagingUrl,
        error_message: payload.errorMessage,
        timestamp: payload.timestamp,
      },
    });

    if (eventError) {
      console.error("Failed to create status event:", eventError);
      // Don't fail the webhook if audit log fails
    }

    // Send email notification based on status
    const clientEmail = (project.clients as { email: string }).email;

    try {
      if (payload.status === "live" && payload.siteUrl) {
        await sendSiteLiveEmail({
          projectName: project.name,
          siteUrl: payload.siteUrl,
          clientEmail,
        });
      } else if (payload.status === "failed") {
        await sendBuildFailedEmail({
          projectName: project.name,
          errorMessage: payload.errorMessage,
          clientEmail,
        });
      } else if (payload.status === "ready_for_review" && payload.stagingUrl) {
        await sendReadyForReviewEmail({
          projectName: project.name,
          stagingUrl: payload.stagingUrl,
          clientEmail,
        });
      }
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the webhook if email fails
    }

    return NextResponse.json({
      success: true,
      projectId: payload.projectId,
      status: payload.status,
    });
  } catch (error) {
    console.error("Pipeline webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
