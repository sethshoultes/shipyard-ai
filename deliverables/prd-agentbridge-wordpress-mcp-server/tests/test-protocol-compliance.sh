#!/usr/bin/env bash
# test-protocol-compliance.sh
# Verifies MCP protocol constants, JSON-RPC structure, and tool registration.
# Exits 0 on pass, non-zero on fail.

set -euo pipefail

PLUGIN_DIR="${1:-./build/agentbridge}"
ERRORS=0

fail() {
  echo "FAIL: $1"
  ((ERRORS++)) || true
}

pass() {
  echo "PASS: $1"
}

echo "=== Protocol Compliance Test ==="
echo "Plugin directory: $PLUGIN_DIR"
echo

if [[ ! -d "$PLUGIN_DIR/includes" ]]; then
  echo "ERROR: Plugin includes/ directory not found"
  exit 1
fi

# SSE content type
if [[ -f "$PLUGIN_DIR/includes/class-server.php" ]]; then
  if grep -q "text/event-stream" "$PLUGIN_DIR/includes/class-server.php"; then
    pass "SSE Content-Type header present"
  else
    fail "SSE Content-Type header missing"
  fi

  if grep -q "session_id" "$PLUGIN_DIR/includes/class-server.php"; then
    pass "session_id generation present in server"
  else
    fail "session_id generation missing"
  fi
else
  fail "class-server.php not found"
fi

# JSON-RPC constants
if [[ -f "$PLUGIN_DIR/includes/class-message-handler.php" ]]; then
  if grep -q "jsonrpc" "$PLUGIN_DIR/includes/class-message-handler.php"; then
    pass "JSON-RPC keyword present"
  else
    fail "JSON-RPC keyword missing"
  fi

  if grep -q "2024-11-05" "$PLUGIN_DIR/includes/class-message-handler.php"; then
    pass "MCP protocolVersion 2024-11-05 present"
  else
    fail "MCP protocolVersion 2024-11-05 missing"
  fi

  if grep -q "tools/list" "$PLUGIN_DIR/includes/class-message-handler.php"; then
    pass "tools/list route present"
  else
    fail "tools/list route missing"
  fi

  if grep -q "tools/call" "$PLUGIN_DIR/includes/class-message-handler.php"; then
    pass "tools/call route present"
  else
    fail "tools/call route missing"
  fi
else
  fail "class-message-handler.php not found"
fi

# Tool registry
if [[ -f "$PLUGIN_DIR/includes/class-tool-registry.php" ]]; then
  if grep -q "function register" "$PLUGIN_DIR/includes/class-tool-registry.php"; then
    pass "Tool registry register() present"
  else
    fail "Tool registry register() missing"
  fi

  if grep -q "function get_all" "$PLUGIN_DIR/includes/class-tool-registry.php"; then
    pass "Tool registry get_all() present"
  else
    fail "Tool registry get_all() missing"
  fi
else
  fail "class-tool-registry.php not found"
fi

# Count registered tools in main plugin file
if [[ -f "$PLUGIN_DIR/agentbridge.php" ]]; then
  # Count occurrences of "->register" or similar registration calls
  register_count=$(grep -c "register" "$PLUGIN_DIR/agentbridge.php" || echo 0)
  if [[ "$register_count" -ge 7 ]]; then
    pass "agentbridge.php contains at least 7 register references ($register_count)"
  else
    fail "agentbridge.php has only $register_count register references (expected >= 7)"
  fi
else
  fail "agentbridge.php not found"
fi

# Verify exactly 7 tool classes exist
tool_count=0
for f in "$PLUGIN_DIR/includes/tools/"class-tool-*.php; do
  if [[ -f "$f" ]]; then
    ((tool_count++)) || true
  fi
done
if [[ "$tool_count" -eq 3 ]]; then
  pass "Exactly 3 tool class files present (site, posts, media)"
else
  fail "Expected 3 tool class files, found $tool_count"
fi

# Verify no extra tool files from CUT list
for cut in users upload; do
  if [[ -f "$PLUGIN_DIR/includes/tools/class-tool-$cut.php" ]]; then
    fail "CUT tool file exists: class-tool-$cut.php"
  else
    pass "CUT tool file absent: class-tool-$cut.php"
  fi
done

# Auth must have Bearer handling
if [[ -f "$PLUGIN_DIR/includes/class-auth.php" ]]; then
  if grep -q "Bearer" "$PLUGIN_DIR/includes/class-auth.php"; then
    pass "Bearer token handling present"
  else
    fail "Bearer token handling missing"
  fi
else
  fail "class-auth.php not found"
fi

echo
echo "=== Results ==="
echo "Errors: $ERRORS"

if [[ "$ERRORS" -gt 0 ]]; then
  echo "FAILED"
  exit 1
else
  echo "PASSED"
  exit 0
fi
