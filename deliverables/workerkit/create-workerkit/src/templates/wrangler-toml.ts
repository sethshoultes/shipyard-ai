/**
 * wrangler-toml.ts
 *
 * Generates a fully documented wrangler.toml configuration file for Cloudflare Workers
 * with D1 database binding, Workers AI binding, KV namespace (optional), and inline comments
 * explaining every setting. The output is transparent and editable without breaking the project.
 */

export interface WranglerTomlConfig {
  projectName: string;
  includeDatabase: boolean;
  includeAI: boolean;
  includeKV: boolean;
}

/**
 * Generates a wrangler.toml configuration string with extensive inline documentation
 *
 * @param config Configuration options for the wrangler.toml
 * @returns Fully documented wrangler.toml content as a string
 */
export function generateWranglerToml(config: WranglerTomlConfig): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  let toml = `# wrangler.toml - Cloudflare Workers Configuration
# This file defines your Workers project settings, bindings, and deployment configuration
# Documentation: https://developers.cloudflare.com/workers/wrangler/configuration/

# ============================================================================
# BASIC CONFIGURATION
# ============================================================================

# Project name - used for deployment and identification
name = "${config.projectName}"

# Worker type - "service" is for general HTTP handlers
type = "service"

# Your Cloudflare account ID
# Get it from: https://dash.cloudflare.com/profile/account-resources (right side, copy)
# Required for deployment and accessing Cloudflare services
# You'll also need this in .env or --account-id flag during deploy
account_id = "your_account_id_here"

# Enable workers.dev subdomain (optional)
# If true, your worker is accessible at https://{projectName}.workers.dev
# Set to false if you want to route to a custom domain
workers_dev = true

# Main entry point for your Worker
# This file contains your Hono app and request handlers
main = "src/index.ts"

# Compatibility date - Workers platform snapshot version
# Using YYYY-MM-DD format. Newer dates = more modern JavaScript features
# Update this if you want to use newer Worker APIs
compatibility_date = "${today}"

# Compatibility flags - enable specific feature flags
# nodejs_compat = Node.js compatibility mode (enables Node built-ins like buffer, path, etc.)
compatibility_flags = ["nodejs_compat"]

# ============================================================================
# BUILD CONFIGURATION
# ============================================================================

# Build script runs before deployment
[build]
# TypeScript compilation step
command = "npm run build"
# Working directory for build command
cwd = "."

# Upload format for built code
[build.upload]
format = "modules"

`;

  // Add D1 Database binding if requested
  if (config.includeDatabase) {
    toml += `# ============================================================================
# D1 DATABASE BINDING
# ============================================================================
# D1 is Cloudflare's SQLite database at the edge - provides serverless SQL queries
# with automatic replication and backup.
#
# Setup steps:
# 1. Run: wrangler d1 create ${config.projectName}_db
#    This creates a new D1 database
#
# 2. Copy the database_id from the command output and paste below where it says:
#    database_id = "your_database_id_here"
#
# 3. In your code, access the database via: const db = c.env.DB
#    Example: const result = await db.prepare("SELECT * FROM users").all();
#
# Pricing: Free tier is generous - see https://developers.cloudflare.com/d1/platform/pricing/
# Limits: Read: 100k queries/day, Write: 1M queries/day on free tier

[[d1_databases]]
# Binding name - how you reference this in your code (must match src/index.ts)
binding = "DB"

# Display name for the database (for your reference in Cloudflare dashboard)
database_name = "${config.projectName}_db"

# Database ID - unique identifier for your D1 database
# Get this after running: wrangler d1 create ${config.projectName}_db
# Look for "database_id": "xxxxx-xxxxx-xxxxx-xxxxx" in the output
database_id = "your_database_id_here"

# Preview database ID (optional) - separate database for \`npm run dev\` local testing
# Usually auto-managed by Wrangler, but you can specify a separate DB for local dev
# Uncomment and set if you want local tests to use a different database:
# preview_id = "your_preview_database_id_here"

`;
  }

  // Add Workers AI binding if requested
  if (config.includeAI) {
    toml += `# ============================================================================
# WORKERS AI BINDING
# ============================================================================
# Workers AI provides on-demand serverless LLMs running at the edge
#
# Supported models:
# - @cf/meta/llama-2-7b-chat-int8 (open source, fast, free tier generous)
# - @cf/mistral/mistral-7b-instruct-v0.1
# - @cf/openai/whisper (for speech-to-text)
# - @cf/google/gemma-2b-it
# - More models: https://developers.cloudflare.com/workers-ai/models/
#
# Pricing: Free tier = 10,000 API calls/day
# Pay-as-you-go after that (very cheap, ~$0.01 per 1M tokens)
#
# Usage in code:
# const response = await c.env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
#   prompt: "What is the capital of France?"
# });

[ai]
# Binding name - how you reference Workers AI in your code
# In src/index.ts: const response = await c.env.AI.run(...)
binding = "AI"

`;
  }

  // Add KV namespace binding if requested (optional)
  if (config.includeKV) {
    toml += `# ============================================================================
# KV NAMESPACE BINDING (OPTIONAL)
# ============================================================================
# KV (Key-Value) storage provides globally distributed, low-latency data storage
# Perfect for: sessions, cache, rate limiting, temporary data, JSON blobs
#
# Setup steps:
# 1. Run: wrangler kv:namespace create "${config.projectName}_kv"
#    This creates a new KV namespace
#
# 2. Copy the namespace_id and paste below where it says:
#    id = "your_kv_namespace_id_here"
#
# Usage in code:
# // Set a value
# await c.env.KV.put("session:123", JSON.stringify(userData));
#
# // Get a value
# const user = await c.env.KV.get("session:123");
#
# // Delete a value
# await c.env.KV.delete("session:123");
#
# Pricing: Free tier = 3GB storage, 10M read requests, 1M write requests per day
# Storage: Each value can be up to 25MB
# TTL: Set automatic expiration: await c.env.KV.put(key, value, { expirationTtl: 3600 });

[[kv_namespaces]]
# Binding name - how you reference KV in your code
binding = "KV"

# KV namespace ID - unique identifier for this namespace
# Get this after running: wrangler kv:namespace create "${config.projectName}_kv"
# Look for "id": "xxxxx" in the output
id = "your_kv_namespace_id_here"

# Preview namespace ID (optional) - separate KV namespace for local development
# Usually auto-managed, but specify if you want isolated local testing:
# preview_id = "your_preview_kv_namespace_id_here"

`;
  }

  // Add observability section
  toml += `# ============================================================================
# OBSERVABILITY & LOGGING
# ============================================================================
# Enable tail (real-time logs) and Cloudflare dashboard metrics
# Access logs: https://dash.cloudflare.com/ → Workers & Pages → Your Worker → Real-time logs tab

[observability]
enabled = true

# ============================================================================
# ENVIRONMENT-SPECIFIC OVERRIDES
# ============================================================================
# Define different configurations for development, staging, production
# Usage: wrangler deploy --env production

[env.development]
# Development environment uses workers.dev subdomain
name = "${config.projectName}-dev"
workers_dev = true

[env.production]
# Production environment - change this if you have a custom domain
# Example: route to your own domain
# route = "https://api.example.com/*"
# zone_id = "your_cloudflare_zone_id_here"

name = "${config.projectName}-prod"
workers_dev = true

`;

  return toml;
}

/**
 * Validates TOML structure manually (no external parser)
 * Checks for:
 * - Proper section syntax (e.g., [section] or [[array]])
 * - No unclosed brackets
 * - Comments using # prefix
 *
 * @param toml The TOML string to validate
 * @returns { isValid: boolean, errors: string[] }
 */
export function validateWranglerToml(toml: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const lines = toml.split('\n');

  let openBrackets = 0;
  let openDoubleBrackets = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    // Check for section headers
    if (line.startsWith('[[')) {
      if (!line.endsWith(']]')) {
        errors.push(`Line ${i + 1}: Unclosed array section [[ ]]`);
      }
      openDoubleBrackets++;
    } else if (line.startsWith('[')) {
      if (!line.endsWith(']')) {
        errors.push(`Line ${i + 1}: Unclosed section [ ]`);
      }
      openBrackets++;
    }

    // Check for key=value pairs
    if (line.includes('=')) {
      const [key, value] = line.split('=', 2);
      if (!key || !value) {
        errors.push(`Line ${i + 1}: Invalid key=value pair`);
      }
    }
  }

  // Validate that critical keys exist
  if (!toml.includes('name = ')) {
    errors.push('Missing required key: name');
  }
  if (!toml.includes('type = ')) {
    errors.push('Missing required key: type');
  }
  if (!toml.includes('account_id = ')) {
    errors.push('Missing required key: account_id');
  }
  if (!toml.includes('main = ')) {
    errors.push('Missing required key: main');
  }
  if (!toml.includes('compatibility_date = ')) {
    errors.push('Missing required key: compatibility_date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
