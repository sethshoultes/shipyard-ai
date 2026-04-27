/**
 * Brand Voice Configuration — "Sous"
 *
 * DECISION (LOCKED): "Sous" is the brand voice. Used in every headline,
 * button, subject line, and digest salutation. LocalGenius stays in the
 * footer and legal copy.
 *
 * Brand voice: warm maître d', not SaaS changelog.
 */

export const BRAND = {
  /** Short name for headlines, buttons, subject lines, salutations */
  voiceName: "Sous" as const,

  /** Legal entity name — footer, legal copy, Stripe namespace */
  legalName: "LocalGenius" as const,

  /** Full descriptor fallback if legal blocks standalone "Sous" */
  descriptorFallback: "Your AI sous chef" as const,

  /** Tagline for pricing page and emails */
  tagline: "Your reviews are handled. Your posts went live." as const,

  /** Emotional framing for annual billing */
  annualFrame: {
    headline: "Breathe annually" as const,
    subheadline: "Pay once. Focus on your guests." as const,
    badge: "Annual" as const,
    cta: "Choose Annual" as const,
    savingsLine: (saved: number) => `Save $${saved} — 2 months free` as const,
  },

  /** Monthly framing (emotional contrast) */
  monthlyFrame: {
    headline: "Go month by month" as const,
    subheadline: "No commitment. Cancel anytime." as const,
    cta: "Choose Monthly" as const,
  },

  /** Digest / email subject line templates */
  digest: {
    subjectLine: (metric: string) =>
      `Sous — ${metric} this week` as const,
    salutation: "Hey there," as const,
    signOff: "— Sous" as const,
    footerLegal: `© ${new Date().getFullYear()} LocalGenius, Inc. All rights reserved.` as const,
  },

  /** Confirmation email */
  confirmation: {
    subjectLine: "You're all set — your reviews are handled." as const,
    headline: "Welcome to Sous." as const,
    body: "You're all set for 12 months of hands-off marketing." as const,
    cta: "Open your dashboard" as const,
  },

  /** Banned phrases — never appear in customer-facing copy */
  bannedPhrases: [
    "we're excited to announce",
    "we are thrilled",
    "we are excited",
    "we are pleased",
    "we are delighted",
    "we are happy",
    "we are proud",
    "we are honored",
    "we are grateful",
    "we are thankful",
    "we are humbled",
    "we are blessed",
    "we are lucky",
    "we are fortunate",
    "we are blessed",
  ] as const,

  /** Tone checks */
  tone: {
    warm: true,
    confident: true,
    apologetic: false,
    clinical: false,
    corporate: false,
  },
} as const;

/** Helper to verify copy against banned phrases */
export function validateCopy(text: string): { clean: boolean; violations: string[] } {
  const violations = BRAND.bannedPhrases.filter((phrase) =>
    text.toLowerCase().includes(phrase.toLowerCase())
  );
  return { clean: violations.length === 0, violations };
}

/** Helper to get the appropriate brand name based on context */
export function getBrandName(context: "voice" | "legal"): "Sous" | "LocalGenius" {
  return context === "voice" ? BRAND.voiceName : BRAND.legalName;
}
