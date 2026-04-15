# Build Quick Reference: Shipyard Client Portal
**For:** Development Team
**Use:** During implementation for fast lookups
**Last Updated:** 2026-04-15

---

## Copy-Paste Ready Code

### 1. Stripe Client (Copy to `lib/stripe.ts`)

**Source:** `/home/agent/shipyard-ai/apps/pulse/lib/stripe.ts`

```typescript
import Stripe from 'stripe';
import { randomUUID } from 'crypto';

export interface StripeError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'unknown_error';
  userMessage: string;
}

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set.');
    }
    stripeInstance = new Stripe(secretKey, { apiVersion: '2024-06-20' });
    console.log(`[Stripe] Initialized in ${secretKey.startsWith('sk_test_') ? 'test' : 'live'} mode`);
  }
  return stripeInstance;
}

export function generateIdempotencyKey(): string {
  return randomUUID();
}

export function handleStripeError(error: unknown): StripeError {
  if (error instanceof Stripe.errors.StripeCardError) {
    return {
      code: error.code || 'card_error',
      message: error.message,
      type: 'card_error',
      userMessage: 'Your card was declined. Please check your card details and try again.',
    };
  }
  if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return {
      code: error.code || 'validation_error',
      message: error.message,
      type: 'validation_error',
      userMessage: 'There was an issue with your request. Please check your information and try again.',
    };
  }
  if (error instanceof Stripe.errors.StripeAPIError) {
    return {
      code: error.code || 'api_error',
      message: error.message,
      type: 'api_error',
      userMessage: 'A payment processing error occurred. Please try again in a few moments.',
    };
  }
  return {
    code: 'unknown_error',
    message: error instanceof Error ? error.message : 'Unknown error',
    type: 'unknown_error',
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
  };
}
```

---

### 2. Tailwind Theme (Copy to `globals.css`)

**Source:** `/home/agent/shipyard-ai/website/src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #ededed;
  --accent: #3B82F6;
  --accent-dim: #2563EB;
  --surface: #141414;
  --surface-hover: #1e1e1e;
  --border: #262626;
  --muted: #8a8a8a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent: var(--accent);
  --color-accent-dim: var(--accent-dim);
  --color-surface: var(--surface);
  --color-surface-hover: var(--surface-hover);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

---

### 3. Form Component Pattern

**Source:** `/home/agent/shipyard-ai/website/src/app/contact/ContactForm.tsx`

```typescript
"use client";

import { useState, type FormEvent } from "react";

export function ProjectIntakeForm() {
  const [state, setState] = useState<{ success: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = (data.get("project-name") as string)?.trim();
    const scope = data.get("scope") as string;
    const description = (data.get("description") as string)?.trim();

    if (!name || !scope || !description) {
      setState({ success: false, message: "Please fill in all required fields." });
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scope, description }),
      });
      const result = await res.json();
      setState({ success: result.success, message: result.message });
      if (result.success) form.reset();
    } catch {
      setState({ success: false, message: "Network error. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium">
          Project Name <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          id="project-name"
          name="project-name"
          required
          className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          placeholder="My Awesome Project"
        />
      </div>

      {state && (
        <div
          role="alert"
          className={`rounded-lg p-4 text-sm ${
            state.success
              ? "bg-green-900/20 text-green-400"
              : "bg-red-900/20 text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dim disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

---

## Snippet Library

### Button Component
```typescript
<button className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white transition hover:bg-accent-dim disabled:opacity-50">
  Click Me
</button>
```

### Input Field
```typescript
<input
  type="text"
  className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
  placeholder="Enter text..."
/>
```

### Select Field
```typescript
<select className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Alert/Status Box
```typescript
<div className="rounded-lg p-4 text-sm bg-green-900/20 text-green-400">
  Success message here
</div>

<div className="rounded-lg p-4 text-sm bg-red-900/20 text-red-400">
  Error message here
</div>
```

### Card Container
```typescript
<div className="rounded-xl border border-border bg-surface p-8">
  {/* Content */}
</div>
```

### Loading Spinner
```typescript
<div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-accent border-r-transparent" />
```

---

## Environment Variables Checklist

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_KEY=eyJxxxxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Email Service (Resend recommended)
RESEND_API_KEY=re_xxxxx

# App Config
NEXT_PUBLIC_APP_URL=https://app.shipyard.ai
NODE_ENV=production
```

---

## Database Schema Essentials

### Clients Table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_clients_email ON clients(email);
```

### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'intake', 'debate', 'plan', 'build', 'review', 'live'
  scope VARCHAR(50), -- 'site', 'theme', 'plugin'
  site_url TEXT,
  staging_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### Retainers Table
```sql
CREATE TABLE retainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  token_budget INTEGER DEFAULT 200000,
  tokens_used INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_retainers_client_id ON retainers(client_id);
CREATE INDEX idx_retainers_stripe_subscription_id ON retainers(stripe_subscription_id);
```

---

## Common API Endpoints

### Create Project
```typescript
// POST /api/projects
{
  "title": "My Website",
  "scope": "site",
  "description": "...",
  "requirements": {...}
}
```

### Create Stripe Checkout
```typescript
// POST /api/stripe/checkout
{
  "priceId": "price_...",
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

### Webhook: Pipeline Update
```typescript
// POST /api/webhooks/pipeline
{
  "projectId": "uuid",
  "status": "live",
  "siteUrl": "https://...",
  "timestamp": "2026-04-15T00:00:00Z"
}
```

---

## Dependencies to Install

```bash
npm install \
  @supabase/supabase-js \
  stripe \
  shadcn-ui \
  zod \
  react-hook-form \
  next-safe-action \
  resend
```

---

## Project Intake Form Fields

```typescript
const intakeForm = {
  projectName: "string",
  projectScope: "site | theme | plugin",
  description: "text",
  brandGuide: "optional url/file",
  integrations: "array of strings",
  timeline: "asap | 2-weeks | flexible",
  budget: "number (estimated tokens)",
};
```

---

## Stripe Checkout Session Creation

```typescript
import { getStripeClient, generateIdempotencyKey } from '@/lib/stripe';

const stripe = getStripeClient();
const session = await stripe.checkout.sessions.create(
  {
    payment_method_types: ['card'],
    line_items: [
      {
        price: 'price_1234567890', // Stripe price ID
        quantity: 1,
      },
    ],
    mode: 'payment', // or 'subscription'
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
    customer_email: userEmail,
  },
  {
    idempotencyKey: generateIdempotencyKey(),
  }
);
```

---

## Supabase Query Pattern

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Get projects for client
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('client_id', clientId)
  .order('created_at', { ascending: false });

// Create project
const { data, error } = await supabase
  .from('projects')
  .insert({ client_id: clientId, title: name, status: 'intake' })
  .select()
  .single();

// Update project status
const { data, error } = await supabase
  .from('projects')
  .update({ status: 'live', site_url: url })
  .eq('id', projectId)
  .select()
  .single();
```

---

## Email Template Pattern (Resend)

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@shipyard.ai',
  to: clientEmail,
  subject: 'Your site is live!',
  html: `<p>Your project is now live at <a href="${siteUrl}">${siteUrl}</a></p>`,
});
```

---

## Middleware Pattern (Supabase Auth)

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## File Locations Reference

| Item | Location |
|------|----------|
| Stripe integration to copy | `/apps/pulse/lib/stripe.ts` |
| Form patterns to adapt | `/website/src/app/contact/ContactForm.tsx` |
| Tailwind config to reuse | `/website/src/app/globals.css` |
| Auth reference | `/deliverables/shipyard-care/lib/auth.ts` |
| DB patterns | `/packages/db/schema/*`, `/packages/db/queries/*` |
| Decisions locked | `/rounds/shipyard-client-portal/decisions.md` |
| Full scout report | `/rounds/shipyard-client-portal/CODEBASE_SCOUT_REPORT.md` |

---

## Decisions Needed Before Starting

- [ ] Email service: Resend or SendGrid?
- [ ] Analytics: Cloudflare, Google Analytics, or skip v1?
- [ ] Token budget display format: (pick Option A, B, or C)
- [ ] Pipeline webhook schema: Get from pipeline team

---

**Keep this file open during development for quick lookup!**
