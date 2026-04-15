# Shipyard Client Portal

This is the client portal for Shipyard—mission control for clients who hired AI to build their website.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database Setup

### Schema Overview

The Shipyard Client Portal uses PostgreSQL (via Supabase) with the following core tables:

- **clients**: Client account information
- **projects**: Project details and status tracking
- **retainers**: Subscription management for AI update retainers
- **retainer_updates**: Individual updates completed under retainer subscriptions
- **status_events**: Event log for project status changes (from pipeline webhooks)

### Running Migrations

#### Option 1: Consolidated Schema (Recommended for Initial Setup)

For the quickest setup, use the consolidated schema file which includes all tables and indexes:

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Navigate to the **SQL Editor**
3. Click **New Query**
4. Copy the contents of `/database/migrations/00_consolidated_schema.sql`
5. Paste into the SQL editor
6. Click **Run**

This creates all tables, foreign keys, constraints, and indexes in a single transaction.

#### Option 2: Individual Migrations (For Version Control)

To apply migrations individually (recommended for teams using version control):

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Navigate to the **SQL Editor**
3. For each migration file, in order:
   - `001_create_clients_table.sql`
   - `002_create_projects_table.sql`
   - `003_create_retainers_table.sql`
   - `004_create_retainer_updates_table.sql`
   - `005_create_status_events_table.sql`
   - `006_create_indexes.sql`
4. Create a new query, copy the file contents, and run

#### Option 3: Command Line (Using Supabase CLI)

If you have the Supabase CLI installed:

```bash
supabase db push
```

This requires migrations to be in the `supabase/migrations/` directory.

### Schema Details

**clients**
- `id` (UUID): Primary key
- `email` (TEXT): Unique email address
- `created_at`, `updated_at` (TIMESTAMP): Timestamps

**projects**
- `id` (UUID): Primary key
- `client_id` (UUID): Foreign key to clients
- `title` (TEXT): Project name
- `status` (TEXT): Current status (intake, payment_pending, in_progress, review, live, failed)
- `site_url`, `staging_url` (TEXT): URLs for production and staging sites
- `created_at`, `updated_at`, `completed_at` (TIMESTAMP): Timestamps

**retainers**
- `id` (UUID): Primary key
- `client_id` (UUID): Foreign key to clients
- `stripe_subscription_id` (TEXT): Stripe subscription reference
- `status` (TEXT): Subscription status (active, canceled, past_due)
- `token_budget` (INTEGER): Monthly token budget (default 500000)
- `tokens_used` (INTEGER): Tokens consumed in current cycle
- `billing_cycle_start`, `billing_cycle_end` (TIMESTAMP): Billing period
- `created_at`, `updated_at` (TIMESTAMP): Timestamps

**retainer_updates**
- `id` (UUID): Primary key
- `retainer_id` (UUID): Foreign key to retainers
- `description` (TEXT): Update description
- `tokens_used` (INTEGER): Tokens consumed for this update
- `completed_at` (TIMESTAMP): Completion timestamp

**status_events**
- `id` (UUID): Primary key
- `project_id` (UUID): Foreign key to projects
- `status` (TEXT): Status at time of event
- `message` (TEXT): Human-readable status message
- `created_at` (TIMESTAMP): Event timestamp

### Indexes

The following indexes are created for optimal performance:
- `idx_projects_client_id`: Fast client project lookups
- `idx_projects_status`: Fast project filtering by status
- `idx_retainers_client_id`: Fast client retainer lookups
- `idx_status_events_project_id`: Fast event lookup by project
- Plus additional indexes on created_at and status fields

## Getting Started

First, ensure your database is set up (see Database Setup above), then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
