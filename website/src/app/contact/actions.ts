"use server";

export type FormState = {
  success: boolean;
  message: string;
} | null;

export async function submitContact(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const projectType = formData.get("project-type") as string;
  const description = formData.get("description") as string;
  const honeypot = formData.get("website") as string;

  // Honeypot — bots fill this hidden field
  if (honeypot) {
    // Silently reject but appear successful
    return { success: true, message: "Thanks! We'll be in touch within 24 hours." };
  }

  if (!name || !email || !description) {
    return { success: false, message: "Please fill in all required fields." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Please enter a valid email address." };
  }

  // TODO: Wire to email service, database, or Slack webhook
  // For now, log to console (visible in server logs)
  console.log("[CONTACT SUBMISSION]", {
    name,
    email,
    projectType,
    description: description.slice(0, 200),
    timestamp: new Date().toISOString(),
  });

  return { success: true, message: "Thanks! We'll scope your project and respond within 24 hours." };
}
