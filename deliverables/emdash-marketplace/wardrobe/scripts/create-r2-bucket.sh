#!/bin/bash

# Create R2 Bucket for Wardrobe Theme Distribution
#
# This script creates a Cloudflare R2 bucket for hosting theme tarballs.
# Requires: Wrangler CLI installed (npm install -g @cloudflare/wrangler)
# Requires: Valid Cloudflare credentials configured

set -e

BUCKET_NAME="${1:-emdash-themes}"
REGION="${2:-auto}"

echo "🚀 Creating R2 bucket for theme distribution..."
echo ""
echo "Bucket Name: $BUCKET_NAME"
echo "Region: $REGION"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Error: wrangler CLI not found."
    echo "Install it with: npm install -g @cloudflare/wrangler"
    exit 1
fi

# Verify Cloudflare credentials are configured
if ! wrangler whoami &> /dev/null; then
    echo "Error: Not authenticated with Cloudflare."
    echo "Run 'wrangler login' first to authenticate."
    exit 1
fi

# Create the bucket
echo "Creating bucket..."
if wrangler r2 bucket create "$BUCKET_NAME"; then
    echo ""
    echo "✓ Bucket created successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Set up environment variables in .env:"
    echo "   - CLOUDFLARE_ACCOUNT_ID"
    echo "   - R2_ACCESS_KEY_ID"
    echo "   - R2_SECRET_ACCESS_KEY"
    echo ""
    echo "2. Upload tarballs:"
    echo "   npm run upload:themes"
    echo ""
    echo "3. Update registry with R2 URLs:"
    echo "   https://pub-{ACCOUNT_ID}.r2.dev/{theme}@{version}.tar.gz"
else
    echo "✗ Failed to create bucket. It may already exist."
    echo ""
    echo "Check existing buckets with:"
    echo "  wrangler r2 bucket list"
    exit 1
fi
