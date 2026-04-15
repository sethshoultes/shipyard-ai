import { resend, FROM_EMAIL } from "./client";
import {
  getSiteLiveEmailContent,
  getBuildFailedEmailContent,
  getPaymentConfirmationEmailContent,
  getReadyForReviewEmailContent,
  type SiteLiveEmailData,
  type BuildFailedEmailData,
  type PaymentConfirmationEmailData,
  type ReadyForReviewEmailData,
} from "./templates";

export async function sendSiteLiveEmail(data: SiteLiveEmailData) {
  const content = getSiteLiveEmailContent(data);

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    console.log("Site live email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send site live email:", error);
    throw error;
  }
}

export async function sendBuildFailedEmail(data: BuildFailedEmailData) {
  const content = getBuildFailedEmailContent(data);

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    console.log("Build failed email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send build failed email:", error);
    throw error;
  }
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData) {
  const content = getPaymentConfirmationEmailContent(data);

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    console.log("Payment confirmation email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    throw error;
  }
}

export async function sendReadyForReviewEmail(data: ReadyForReviewEmailData) {
  const content = getReadyForReviewEmailContent(data);

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.clientEmail,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    console.log("Ready for review email sent:", response);
    return response;
  } catch (error) {
    console.error("Failed to send ready for review email:", error);
    throw error;
  }
}
