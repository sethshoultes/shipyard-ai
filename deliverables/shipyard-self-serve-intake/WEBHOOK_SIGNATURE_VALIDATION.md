# Webhook Signature Validation Implementation

**Status:** IMPLEMENTED
**Requirement:** REQ-INFRA-001: Webhook Listener Setup (HMAC validation)
**Security Risk Mitigated:** RISK-003 (Forged webhook requests)

## Overview

This document describes the HMAC-SHA256 signature validation implemented for the GitHub webhook endpoint. This is a critical security feature that prevents forged webhook requests from creating fake intake records and spamming bot comments.

## Security Context

GitHub sends webhook requests with an `X-Hub-Signature-256` header containing an HMAC-SHA256 signature of the request body:

```
X-Hub-Signature-256: sha256=<hex-encoded-hash>
```

Where the hash is computed as:
```
HMAC-SHA256(secret=GITHUB_WEBHOOK_SECRET, message=raw_request_body)
```

Without validating this signature, anyone who discovers the webhook URL can send forged requests, which would:
- Create fake intake records in the database
- Spam bot comments on GitHub issues
- Pollute priority detection data
- Waste computational resources

This is classified as a **HIGH impact security vulnerability** (RISK-003).

## Implementation

### Location

- **Webhook Handler:** `/app/api/intake/webhook/github/route.ts`
- **Signature Verification:** `verifyWebhookSignature()` function (lines 34-75)

### Required Configuration

Add to your environment variables (`.env.local` or deployment environment):

```bash
GITHUB_WEBHOOK_SECRET=your-webhook-secret-here
```

**How to generate the secret:**
1. Go to your GitHub repository settings
2. Navigate to Settings > Webhooks
3. Click "Add webhook" or edit existing webhook
4. Set a strong random secret (e.g., use `openssl rand -hex 32`)
5. Copy the secret to your environment variable

### Algorithm

The implementation follows these steps:

#### Step 1: Extract Headers
- Extract `X-Hub-Signature-256` header from the request
- Log webhook receipt with metadata

#### Step 2: Read Raw Request Body
- Read the raw `ArrayBuffer` from the request
- Convert to `Buffer` for cryptographic operations
- **Critical:** Must use the raw body bytes, not parsed JSON

#### Step 3: Validate Environment
- Check that `GITHUB_WEBHOOK_SECRET` is configured
- Fail fast if secret is missing

#### Step 4: Compute Expected Signature
```typescript
const computedSignature = crypto
  .createHmac("sha256", secret)
  .update(requestBody)
  .digest("hex");
```

#### Step 5: Compare Using Timing-Safe Method
```typescript
crypto.timingSafeEqual(
  Buffer.from(computedSignature),
  Buffer.from(expectedSignature)
)
```

**Why timing-safe comparison?** Standard string comparison (`===`) takes different amounts of time to return based on where the first differing character is found. An attacker could use timing measurements to brute-force valid signatures. `timingSafeEqual()` always takes the same time regardless of where differences occur.

#### Step 6: Handle Validation Failure
- Log the failed attempt with metadata (timestamp, event type, delivery ID)
- **Note:** Return 200 OK to GitHub (not 401) to avoid leaking information
- Do NOT process the webhook
- Do NOT create intake records
- Security monitoring should track these failures

#### Step 7: Handle Validation Success
- Log successful validation
- Continue to payload processing
- Extract GitHub webhook data
- Filter by `intake-request` label
- Queue async processing

## Security Guarantees

With this implementation, the webhook endpoint guarantees:

1. **Authenticity:** Only GitHub (or someone with the webhook secret) can trigger intake processing
2. **Integrity:** Any modification to the request body will fail validation
3. **Timing Attack Resistance:** Validation time doesn't leak information about the signature
4. **Failure Visibility:** All failed attempts are logged for security monitoring
5. **Graceful Degradation:** Invalid requests are silently rejected without disrupting the webhook service

## Testing

The implementation includes comprehensive test coverage:

### Unit Tests (`signature-validation.test.ts`)
- Valid signatures with and without `sha256=` prefix
- Missing signature headers
- Invalid signatures
- Empty secrets (misconfiguration)
- Signature with different body content
- Signature with different secret
- Signatures with incorrect length
- Empty request bodies
- Large payloads

**Run unit tests:**
```bash
node app/api/intake/webhook/github/__tests__/signature-validation.test.ts
```

### Integration Tests (`integration.test.ts`)
- Valid GitHub webhook requests
- Tampered payloads (signature mismatch detection)
- Missing signature headers
- Wrong secret detection (compromised secret scenario)
- Large payload handling (scale test)
- Empty secret misconfiguration
- Signature replay prevention
- Case sensitivity in prefix handling

**Run integration tests:**
```bash
node app/api/intake/webhook/github/__tests__/integration.test.ts
```

**Expected Output:**
```
Running webhook signature validation tests...

[PASS] Valid signature with sha256= prefix
[PASS] Valid signature without prefix
[PASS] Missing signature header
[PASS] Invalid signature
[PASS] Empty secret
[PASS] Signature from different body
[PASS] Signature with different secret
[PASS] Signature with incorrect length
[PASS] Empty request body with valid signature

9 passed, 0 failed
```

## Manual Verification Checklist

Before deploying to production, verify:

### Check 1: Valid Signature Accepted
- Send a webhook request with a valid signature
- Verify the endpoint returns 200 OK
- Check logs show "Webhook signature validated successfully"
- Verify the webhook payload is processed correctly

**Example with curl:**
```bash
SECRET="your-webhook-secret"
BODY='{"action":"opened","issue":{"number":42,"title":"Test"}}'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

curl -X POST https://your-domain.com/api/intake/webhook/github \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -H "X-GitHub-Event: issues" \
  -H "X-GitHub-Delivery: 12345" \
  -H "Content-Type: application/json" \
  -d "$BODY"
```

### Check 2: Invalid Signature Rejected
- Send a webhook with an incorrect signature
- Verify the endpoint returns 200 OK (doesn't leak info)
- Check security logs show the failed validation attempt
- Verify the webhook payload is NOT processed

### Check 3: Missing Signature Header Rejected
- Send a webhook request without the signature header
- Verify the endpoint returns 200 OK
- Check logs show "Missing X-Hub-Signature-256 header"
- Verify the webhook payload is NOT processed

### Check 4: Security Logs Show Rejected Attempts
- Monitor your logging system (e.g., CloudWatch, Datadog)
- Look for webhook signature validation failures
- Verify timestamps, delivery IDs, and event types are logged
- Set up alerts for suspicious patterns (multiple failures in short time)

## Monitoring and Alerts

Configure monitoring for:

1. **Failed Signature Validations**
   - Metric: Count of failed signature validation attempts
   - Alert threshold: More than 5 failures in 5 minutes
   - Action: Investigate possible attack, verify webhook secret

2. **Missing Signatures**
   - Metric: Count of requests missing signature header
   - Alert threshold: Any occurrence
   - Action: Check GitHub webhook configuration

3. **Misconfigured Secret**
   - Metric: Failed validations due to empty secret environment variable
   - Alert threshold: Immediate
   - Action: Deploy with correct secret configuration

4. **Processing Success Rate**
   - Metric: Ratio of valid webhooks that complete processing
   - Alert threshold: <95% success rate for 30+ minutes
   - Action: Investigate webhook processing pipeline

## Environment Variable Setup

### Development
Create `.env.local`:
```bash
GITHUB_WEBHOOK_SECRET=dev-secret-for-testing
```

### Staging
Set environment variable in your deployment platform:
```bash
GITHUB_WEBHOOK_SECRET=<staging-secret-from-github>
```

### Production
Set environment variable securely:
```bash
GITHUB_WEBHOOK_SECRET=<production-secret-from-github>
```

**Important:** Use different secrets for each environment.

## Troubleshooting

### Problem: "GITHUB_WEBHOOK_SECRET not configured"
- **Cause:** Environment variable not set
- **Solution:** Add `GITHUB_WEBHOOK_SECRET` to your environment
- **Development:** Check `.env.local` file exists and has the variable

### Problem: "Signature length mismatch - possible tampering attempt"
- **Cause:** Signature header doesn't match computed signature length
- **Solution:** Verify the signature is correctly formatted (`sha256=<64-hex-chars>`)
- **Debug:** Log the signature header and computed signature length

### Problem: "Missing X-Hub-Signature-256 header"
- **Cause:** GitHub webhook isn't sending the signature header
- **Solution:** Check GitHub webhook settings to ensure "Send this event" is enabled
- **Verify:** GitHub webhook should send the header automatically

### Problem: Webhooks fail locally but work in production
- **Cause:** Different secrets in different environments
- **Solution:** Ensure `.env.local` matches the secret in your GitHub webhook settings
- **Verify:** Create a test webhook delivery in GitHub and check the logs

## References

- **GitHub Webhook Documentation:** https://docs.github.com/en/developers/webhooks-and-events/webhooks
- **HMAC-SHA256:** https://en.wikipedia.org/wiki/HMAC
- **Timing Attacks:** https://codahale.com/a-lesson-in-timing-attacks/
- **Node.js Crypto Module:** https://nodejs.org/api/crypto.html

## Design Decisions

### Why timing-safe comparison?
Without `timingSafeEqual()`, attackers could measure response times to brute-force valid signatures bit-by-bit. This is a practical attack that's been demonstrated on real systems.

### Why return 200 OK on invalid signatures?
Returning different status codes (e.g., 401) for invalid signatures leaks information about whether the webhook URL is valid. By always returning 200, we don't help attackers identify valid endpoints.

### Why log all failures?
Signature validation failures are security events. Logging enables detection of:
- Misconfigured webhooks
- Attempted attacks
- Compromised secrets
- Configuration drift between environments

### Why use raw request body?
The request body bytes must exactly match what GitHub sent. Parsing and re-serializing JSON could produce different byte sequences (different whitespace, key ordering, etc.), causing signature validation to fail even with the correct secret.

## Related Requirements

- **REQ-INFRA-001:** Webhook Listener Setup (HMAC validation) - IMPLEMENTED
- **RISK-003:** Forged webhook requests creating fake intake records - MITIGATED
- **Decision 7:** Fail gracefully, never block - APPLIED (returns 200 OK on validation failure)

## Future Enhancements

1. **Webhook Secret Rotation:** Add support for rotating secrets without downtime
2. **Rate Limiting:** Limit webhook processing per IP to prevent abuse
3. **Signature Aging:** Reject signatures older than 5 minutes (prevents replay attacks)
4. **Delivery ID Tracking:** Store processed delivery IDs to prevent duplicate processing
5. **Webhook Verification Dashboard:** UI to test webhook configuration and view delivery history

---

**Status:** READY FOR PRODUCTION
**Last Updated:** 2026-04-16
**Implementation Date:** 2026-04-16
