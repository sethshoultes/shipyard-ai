/**
 * Shipyard AI — PRD Chat Worker
 *
 * Cloudflare Worker that handles PRD parsing and seed generation.
 * Uses Workers AI to extract structured data from raw PRD text.
 *
 * POST /chat — existing endpoint (if needed)
 * POST /parse — extract structured PRD data
 * POST /generate-seed — convert structured PRD to EmDash seed.json
 */

interface Env {
  AI: Ai;
  CORS_ORIGIN: string;
}

interface ParseRequest {
  prd: string;
}

interface StructuredPRD {
  businessName: string;
  vertical: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
    company: string;
  }>;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  pages: string[];
  primaryCta: {
    label: string;
    url: string;
  };
  secondaryCta: {
    label: string;
    url: string;
  };
}

interface SeedRequest {
  businessName: string;
  vertical: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
    company: string;
  }>;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  pages: string[];
  primaryCta: {
    label: string;
    url: string;
  };
  secondaryCta: {
    label: string;
    url: string;
  };
}

const MAX_PRD_LENGTH = 50_000;

const XSS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:\s*text\/html/i,
];

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

function sanitizePrd(str: string): string {
  return stripHtml(str).trim().slice(0, MAX_PRD_LENGTH);
}

function containsXss(str: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(str));
}

function corsHeaders(origin: string, requestOrigin?: string): Record<string, string> {
  // Allow both shipyard.company and www.shipyard.company + pages.dev
  const allowed = [origin, origin.replace("://", "://www."), "https://shipyard-ai.pages.dev"];
  const matchedOrigin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : origin;
  return {
    "Access-Control-Allow-Origin": matchedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function isValidStructuredPRD(data: unknown): data is StructuredPRD {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.businessName === "string" &&
    typeof obj.vertical === "string" &&
    typeof obj.tagline === "string" &&
    typeof obj.heroHeadline === "string" &&
    typeof obj.heroSubheadline === "string" &&
    Array.isArray(obj.features) &&
    Array.isArray(obj.testimonials) &&
    Array.isArray(obj.faqItems) &&
    Array.isArray(obj.pages) &&
    typeof obj.primaryCta === "object" &&
    typeof obj.secondaryCta === "object"
  );
}

function generateSeedJson(data: SeedRequest): string {
  const slug = data.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const seed = {
    $schema: "https://emdashcms.com/seed.schema.json",
    version: "1",
    meta: {
      name: data.businessName,
      description: data.tagline,
      author: "Shipyard AI",
    },
    settings: {
      title: data.businessName,
      tagline: data.tagline,
    },
    collections: [
      {
        slug: "pages",
        label: "Pages",
        labelSingular: "Page",
        supports: ["drafts", "revisions", "seo"],
        fields: [
          {
            slug: "title",
            label: "Title",
            type: "string",
            required: true,
          },
          {
            slug: "content",
            label: "Content",
            type: "portableText",
          },
        ],
      },
    ],
    menus: [
      {
        name: "primary",
        label: "Primary Navigation",
        items: [
          { type: "custom", label: "Home", url: "/" },
          ...(data.pages.includes("pricing")
            ? [{ type: "custom", label: "Services", url: "/pricing" }]
            : []),
          ...(data.pages.includes("contact")
            ? [{ type: "custom", label: "Contact", url: "/contact" }]
            : []),
        ],
      },
    ],
    content: {
      pages: [
        {
          id: "home",
          slug: "home",
          status: "published",
          data: {
            title: "Home",
            content: [
              {
                _type: "marketing.hero",
                _key: "hero",
                headline: data.heroHeadline,
                subheadline: data.heroSubheadline,
                primaryCta: data.primaryCta,
                secondaryCta: data.secondaryCta,
              },
              {
                _type: "marketing.features",
                _key: "features",
                headline: "Why choose us",
                subheadline: "What makes us different",
                features: data.features,
              },
              ...(data.testimonials.length > 0
                ? [
                    {
                      _type: "marketing.testimonials",
                      _key: "testimonials",
                      headline: "What our clients say",
                      testimonials: data.testimonials,
                    },
                  ]
                : []),
              ...(data.faqItems.length > 0
                ? [
                    {
                      _type: "marketing.faq",
                      _key: "faq",
                      headline: "Frequently asked",
                      items: data.faqItems,
                    },
                  ]
                : []),
            ],
          },
        },
        ...(data.pages.includes("pricing")
          ? [
              {
                id: "pricing",
                slug: "pricing",
                status: "published",
                data: {
                  title: "Services",
                  content: [
                    {
                      _type: "marketing.hero",
                      _key: "pricing-hero",
                      headline: "Our Services",
                      subheadline: data.tagline,
                      centered: true,
                    },
                  ],
                },
              },
            ]
          : []),
        ...(data.pages.includes("contact")
          ? [
              {
                id: "contact",
                slug: "contact",
                status: "published",
                data: {
                  title: "Contact",
                  content: [
                    {
                      _type: "marketing.hero",
                      _key: "contact-hero",
                      headline: "Get in touch",
                      subheadline: "We'd love to hear from you.",
                      centered: true,
                    },
                  ],
                },
              },
            ]
          : []),
      ],
    },
  };

  return JSON.stringify(seed, null, 2);
}

async function parseWithAI(
  ai: Ai,
  prdText: string
): Promise<StructuredPRD | null> {
  try {
    const systemPrompt =
      'Extract the following from this PRD and return valid JSON only, no other text: { businessName, vertical (restaurant/dental/salon/services/portfolio/other), tagline, heroHeadline, heroSubheadline, features: [{icon, title, description}], testimonials: [{quote, author, role, company}], faqItems: [{question, answer}], pages: [home/pricing/contact], primaryCta: {label, url}, secondaryCta: {label, url} }';

    const response = await ai.run("@cf/meta/llama-2-7b-chat-int8", {
      prompt: `${systemPrompt}\n\nPRD Text:\n${prdText}`,
    });

    if (!response || typeof response.response !== "string") {
      console.error("Invalid AI response format", response);
      return null;
    }

    // Extract JSON from the response
    const jsonMatch = response.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response", response.response);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!isValidStructuredPRD(parsed)) {
      console.error("Invalid structured PRD format", parsed);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("AI parsing error:", error);
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestOrigin = request.headers.get("Origin") || "";
    const headers = corsHeaders(env.CORS_ORIGIN, requestOrigin);
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Parse endpoint
    if (url.pathname === "/parse" && request.method === "POST") {
      try {
        const body: ParseRequest = await request.json();

        if (!body.prd || typeof body.prd !== "string") {
          return new Response(
            JSON.stringify({ error: "Missing or invalid 'prd' field" }),
            {
              status: 400,
              headers: { ...headers, "Content-Type": "application/json" },
            }
          );
        }

        // Sanitize input
        const sanitizedPrd = sanitizePrd(body.prd);

        if (containsXss(sanitizedPrd)) {
          return new Response(
            JSON.stringify({ error: "Invalid input detected" }),
            {
              status: 400,
              headers: { ...headers, "Content-Type": "application/json" },
            }
          );
        }

        // Use Workers AI to extract structured data
        const result = await parseWithAI(env.AI, sanitizedPrd);

        if (!result) {
          return new Response(
            JSON.stringify({
              error: "Failed to parse PRD. Please ensure it contains the required information.",
            }),
            {
              status: 400,
              headers: { ...headers, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Parse endpoint error:", error);
        return new Response(
          JSON.stringify({ error: "Invalid request" }),
          {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Generate seed endpoint
    if (url.pathname === "/generate-seed" && request.method === "POST") {
      try {
        const body: SeedRequest = await request.json();

        if (!isValidStructuredPRD(body)) {
          return new Response(
            JSON.stringify({
              error: "Invalid structured PRD format. Missing required fields.",
            }),
            {
              status: 400,
              headers: { ...headers, "Content-Type": "application/json" },
            }
          );
        }

        const seedJson = generateSeedJson(body);

        return new Response(
          JSON.stringify({
            seed: JSON.parse(seedJson),
            seedJson,
          }),
          {
            status: 200,
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Generate seed endpoint error:", error);
        return new Response(
          JSON.stringify({ error: "Invalid request" }),
          {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Chat endpoint — AI-powered PRD intake conversation
    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const body = await request.json() as { message: string; history?: { role: string; content: string }[] };
        if (!body.message?.trim()) {
          return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { ...headers, "Content-Type": "application/json" } });
        }

        const userMessage = sanitizePrd(body.message.trim());
        const SYSTEM_PROMPT = `You are Shipyard AI's PRD intake assistant. Guide clients through describing their project so our AI agents can build it.

Ask about these topics one at a time (don't dump all at once):
1. Project type (EmDash site, theme, or plugin)
2. Business name and what they do
3. Target audience
4. Pages/features needed
5. Design preferences (colors, reference sites)
6. Budget range (Under $1K, $1K-$2.5K, $2.5K-$5K, $5K-$10K, $10K+)

When you have enough info, output a formatted PRD in markdown. Prefix it with "---PRD-READY---" so the system can detect it.
Be conversational, friendly, concise. One question at a time.`;

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
          { role: "system", content: SYSTEM_PROMPT },
        ];
        if (body.history && Array.isArray(body.history)) {
          for (const msg of body.history.slice(-20)) {
            messages.push({ role: msg.role === "assistant" ? "assistant" : "user", content: sanitizePrd(msg.content) });
          }
        }
        messages.push({ role: "user", content: userMessage });

        const aiResponse = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
          messages,
          max_tokens: 1024,
        }) as Record<string, unknown>;

        const reply = String(aiResponse.response || aiResponse.result || aiResponse.text || JSON.stringify(aiResponse));
        const isPrdReady = reply.includes("---PRD-READY---");

        return new Response(
          JSON.stringify({
            reply: reply.replace("---PRD-READY---", "").trim(),
            prdReady: isPrdReady,
            prd: isPrdReady ? reply.split("---PRD-READY---")[1]?.trim() : null,
          }),
          { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return new Response(
          JSON.stringify({ error: "Chat failed: " + msg }),
          { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    );
  },
};
