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

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Navigate to repo root (3 levels up: pipeline/deploy/deploy-all.sh)
REPO_ROOT="$(cd "$SCRIPT_DIR/../../" && pwd)"

print_status "Deploying all EmDash sites to Cloudflare Pages"
print_status "Repository root: $REPO_ROOT"

EXAMPLES_DIR="$REPO_ROOT/examples"

if [ ! -d "$EXAMPLES_DIR" ]; then
  print_error "Examples directory not found: $EXAMPLES_DIR"
  exit 1
fi

print_success "Examples directory found"

# Count sites
SITES=($(ls -1d "$EXAMPLES_DIR"/* 2>/dev/null | grep -v "emdash-templates"))
SITE_COUNT=${#SITES[@]}

if [ $SITE_COUNT -eq 0 ]; then
  print_error "No deployable sites found in $EXAMPLES_DIR"
  exit 1
fi

echo ""
print_status "Found $SITE_COUNT site(s) to deploy"
echo ""

# Track deployment results
SUCCESSFUL=0
FAILED=0
FAILED_SITES=()

# Deploy each site
for i in "${!SITES[@]}"; do
  SITE_PATH="${SITES[$i]}"
  SITE_NAME=$(basename "$SITE_PATH")

  # Skip emdash-templates
  if [ "$SITE_NAME" = "emdash-templates" ]; then
    print_warning "Skipping template library: $SITE_NAME"
    continue
  fi

  CURRENT=$((i + 1))

  echo -e "${BLUE}────────────────────────────────────────${NC}"
  print_status "[$CURRENT/$SITE_COUNT] Deploying $SITE_NAME..."
  echo -e "${BLUE}────────────────────────────────────────${NC}"
  echo ""

  # Deploy the site
  if "$SCRIPT_DIR/deploy.sh" "$SITE_PATH" "$SITE_NAME"; then
    SUCCESSFUL=$((SUCCESSFUL + 1))
  else
    print_error "Failed to deploy $SITE_NAME"
    FAILED=$((FAILED + 1))
    FAILED_SITES+=("$SITE_NAME")
  fi

  echo ""
done

# Print summary
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}     DEPLOYMENT SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

print_status "Total sites: $SITE_COUNT"
print_success "Successful: $SUCCESSFUL"

if [ $FAILED -gt 0 ]; then
  print_error "Failed: $FAILED"
  echo ""
  print_status "Failed sites:"
  for SITE in "${FAILED_SITES[@]}"; do
    echo "  - $SITE"
  done
  echo ""
  exit 1
else
  print_success "All sites deployed successfully!"
  echo ""
  exit 0
fi
