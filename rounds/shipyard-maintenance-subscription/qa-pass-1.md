# QA Pass 1 — AUTOMATIC BLOCK

Placeholder content detected:
```
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/spec.md:235:- ✓ Templates render with placeholders replaced: `[NAME]`, `[TOKENS]`, `[BALANCE]`, `[REFERRAL_URL]`
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:2:# Test: Verify email templates exist and have required placeholders
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:24:# Verify welcome email has required placeholders
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:33:for placeholder in "${WELCOME_PLACEHOLDERS[@]}"; do
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:34:  if ! grep -q "\[${placeholder}\]\|{{${placeholder}}}\|{${placeholder}}" packages/email/templates/welcome-subscriber.html; then
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:35:    echo "❌ FAIL: Missing placeholder for $placeholder in welcome email"
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:39:echo "✓ All placeholders found in welcome email"
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:52:# Verify incident report has required placeholders
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:61:for placeholder in "${INCIDENT_PLACEHOLDERS[@]}"; do
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:62:  if ! grep -q "\[${placeholder}\]\|{{${placeholder}}}\|{${placeholder}}" packages/email/templates/incident-report.html; then
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:63:    echo "❌ FAIL: Missing placeholder for $placeholder in incident report"
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:67:echo "✓ All placeholders found in incident report"
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:80:# Verify token warning has required placeholders
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:88:for placeholder in "${TOKEN_WARNING_PLACEHOLDERS[@]}"; do
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:89:  if ! grep -q "\[${placeholder}\]\|{{${placeholder}}}\|{${placeholder}}\|TOKENS" packages/email/templates/token-warning.html; then
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:90:    echo "❌ FAIL: Missing placeholder for $placeholder in token warning"
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/tests/verify-email-templates.sh:94:echo "✓ All placeholders found in token warning"
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/todo.md:101:- [ ] Add placeholder for [NAME], [TOKENS], [REFERRAL_URL] — verify: grep '\[NAME\]' and '\[TOKENS\]' and '\[REFERRAL_URL\]'
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/todo.md:108:- [ ] Add placeholders: [DESCRIPTION], [ACTION_TAKEN], [TOKENS], [BALANCE], [MONTHLY_LIMIT] — verify: grep for all 5 placeholders
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/todo.md:113:- [ ] Display current balance and monthly limit — verify: placeholders for balance and limit exist
/home/agent/shipyard-ai/deliverables/shipyard-maintenance-subscription/todo.md:157:- [ ] Display referrer's name for social proof: "Invited by [REFERRER_NAME]" — verify: placeholder for referrer name exists
```
