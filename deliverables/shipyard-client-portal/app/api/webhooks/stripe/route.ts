import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Create Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Check if this is a subscription or one-time payment
        if (session.mode === "subscription") {
          // Handle retainer subscription
          const subscriptionId = session.subscription as string;
          const clientId = session.metadata?.clientId;

          if (!clientId) {
            console.error("Missing clientId in session metadata");
            break;
          }

          // Create or update retainer record
          const { error } = await supabase.from("retainers").upsert({
            client_id: clientId,
            stripe_subscription_id: subscriptionId,
            status: "active",
            plan_type: session.metadata?.planType || "monthly",
            token_budget: parseInt(session.metadata?.tokenBudget || "0"),
            tokens_used: 0,
          });

          if (error) {
            console.error("Failed to create retainer:", error);
          }
        } else if (session.mode === "payment") {
          // Handle one-time project payment
          const projectId = session.metadata?.projectId;

          if (!projectId) {
            console.error("Missing projectId in session metadata");
            break;
          }

          // Update project status to payment_confirmed
          const { error } = await supabase
            .from("projects")
            .update({
              status: "payment_confirmed",
              stripe_payment_intent: session.payment_intent as string,
            })
            .eq("id", projectId);

          if (error) {
            console.error("Failed to update project:", error);
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Update retainer status
        const { error } = await supabase
          .from("retainers")
          .update({
            status: subscription.status === "active" ? "active" : "cancelled",
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Failed to update retainer subscription:", error);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Mark retainer as cancelled
        const { error } = await supabase
          .from("retainers")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Failed to cancel retainer:", error);
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        // Handle recurring subscription payments
        if (invoice.subscription) {
          // Reset token budget for new billing cycle
          const { error } = await supabase
            .from("retainers")
            .update({
              tokens_used: 0,
              billing_cycle_start: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) {
            console.error("Failed to reset token budget:", error);
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          // Mark retainer as payment_failed
          const { error } = await supabase
            .from("retainers")
            .update({ status: "payment_failed" })
            .eq("stripe_subscription_id", invoice.subscription as string);

          if (error) {
            console.error("Failed to update retainer payment status:", error);
          }
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
