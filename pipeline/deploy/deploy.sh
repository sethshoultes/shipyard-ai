#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
  echo -e "${BLUE}→${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}!${NC} $1"
}

# Check arguments
if [ $# -lt 2 ]; then
  print_error "Missing arguments"
  echo "Usage: $0 <site-directory> <project-name>"
  echo "Example: $0 ./examples/bellas-bistro bellas-bistro"
  exit 1
fi

SITE_DIR="$1"
PROJECT_NAME="$2"

print_status "Deploying EmDash site: $PROJECT_NAME"
print_status "Site directory: $SITE_DIR"

# Validate site directory exists
if [ ! -d "$SITE_DIR" ]; then
  print_error "Site directory not found: $SITE_DIR"
  exit 1
fi

print_success "Site directory validated"

# Check Node version >= 22
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
  print_error "Node.js version 22 or higher required. Current: $(node -v)"
  exit 1
fi

print_success "Node.js version validated: $(node -v)"

# Navigate to site directory
cd "$SITE_DIR"

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
  print_status "Installing dependencies..."
  npm install
  print_success "Dependencies installed"
else
  print_success "node_modules already exists, skipping install"
fi

# Build with Astro
print_status "Building with Astro..."
if ! npx astro build; then
  print_error "Astro build failed"
  exit 1
fi

print_success "Astro build completed"

# Check if dist directory exists
if [ ! -d "dist" ]; then
  print_error "Build output directory not found: dist/"
  exit 1
fi

print_success "Build output validated"

# Verify Cloudflare credentials
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  print_error "CLOUDFLARE_API_TOKEN environment variable not set"
  exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  print_error "CLOUDFLARE_ACCOUNT_ID environment variable not set"
  exit 1
fi

print_success "Cloudflare credentials validated"

# Check if Cloudflare Pages project exists
print_status "Checking if Cloudflare Pages project exists..."
if npx wrangler pages project list 2>/dev/null | grep -q "^$PROJECT_NAME\$"; then
  print_success "Cloudflare Pages project exists: $PROJECT_NAME"
else
  print_warning "Cloudflare Pages project not found, creating: $PROJECT_NAME"
  if npx wrangler pages project create "$PROJECT_NAME" 2>/dev/null; then
    print_success "Cloudflare Pages project created: $PROJECT_NAME"
  else
    print_error "Failed to create Cloudflare Pages project: $PROJECT_NAME"
    exit 1
  fi
fi

# Deploy to Cloudflare Pages
print_status "Deploying to Cloudflare Pages..."
DEPLOY_OUTPUT=$(npx wrangler pages deploy dist --project-name "$PROJECT_NAME" --branch main 2>&1)

if echo "$DEPLOY_OUTPUT" | grep -q "Deployment ID"; then
  print_success "Deployment completed"

  # Extract deployment URL from output
  DEPLOYMENT_URL="https://${PROJECT_NAME}.pages.dev"

  # Try to extract actual deployment URL if available
  if echo "$DEPLOY_OUTPUT" | grep -q "https://"; then
    DEPLOYMENT_URL=$(echo "$DEPLOY_OUTPUT" | grep "https://" | head -1 | sed 's/.*\(https:\/\/[^ ]*\).*/\1/')
  fi

  echo ""
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
  print_success "Site deployed successfully!"
  echo -e "${GREEN}═══════════════════════════════════════${NC}"
  echo ""
  print_status "Project: $PROJECT_NAME"
  print_status "Live URL: $DEPLOYMENT_URL"
  echo ""
  exit 0
else
  print_error "Deployment failed"
  echo "$DEPLOY_OUTPUT"
  exit 1
fi
