# MemberShip Plugin Troubleshooting Guide

**Product:** MemberShip
**Version:** 1.0.0
**Platform:** EmDash CMS

---

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Common Issues](#common-issues)
   - [Member Access Issues](#member-access-issues)
   - [Payment Issues](#payment-issues)
   - [Email Issues](#email-issues)
   - [Webhook Issues](#webhook-issues)
   - [Authentication Issues](#authentication-issues)
3. [Error Codes Reference](#error-codes-reference)
4. [Debug Tools](#debug-tools)
5. [Getting Help](#getting-help)

---

## Quick Diagnostics

### Health Check

Verify the plugin is running:

```bash
curl https://your-site.com/membership/health
```

**Expected response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "features": ["reporting", "groups", "webhooks", "forms", "csv"]
}
```

If this fails, check:
- Plugin is installed correctly in `astro.config.mjs`
- Site has been built and deployed
- All required environment variables are set

### Environment Variable Check

Verify all required environment variables are set:

| Variable | Test |
|----------|------|
| `STRIPE_SECRET_KEY` | Starts with `sk_test_` or `sk_live_` |
| `STRIPE_WEBHOOK_SECRET` | Starts with `whsec_` |
| `JWT_SECRET` | Non-empty, 32+ characters |
| `RESEND_API_KEY` | Starts with `re_` |

---

## Common Issues

### Member Access Issues

#### Member can't access gated content

**Symptoms:** Member sees fallback message instead of gated content.

**Diagnosis:**
1. Check member status:
   ```bash
   curl "https://your-site.com/membership/status?email=user@example.com"
   ```
2. Verify response shows `"active": true`

**Solutions:**

| Issue | Solution |
|-------|----------|
| `"active": false` | Member subscription inactive or expired |
| `"status": "pending"` | Member hasn't completed payment |
| `"status": "past_due"` | Payment failed; member needs to update payment method |
| `"status": "cancelled"` | Subscription was cancelled |
| `"status": "revoked"` | Admin manually revoked access |
| Wrong plan | Member's plan doesn't include this content |

**Fix pending member:**
```bash
# Approve manually (admin only)
curl -X POST https://your-site.com/membership/approve \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

#### Member can't log in

**Symptoms:** Login returns 401 or "member not found".

**Diagnosis:**
1. Check if member exists:
   ```bash
   curl "https://your-site.com/membership/status?email=user@example.com"
   ```
2. If `"active": false`, member may not exist

**Solutions:**
- Verify email is spelled correctly
- Check for leading/trailing whitespace
- Member may need to re-register

---

### Payment Issues

#### Stripe checkout not working

**Symptoms:** Checkout fails or returns error.

**Diagnosis:**
1. Check Stripe API keys are correct
2. Verify using test mode keys for testing
3. Check Stripe Dashboard for error logs

**Solutions:**

| Error | Solution |
|-------|----------|
| "Invalid API Key" | Check `STRIPE_SECRET_KEY` is correct |
| "No such plan" | Plan needs to be created in Stripe |
| Checkout page blank | Check `STRIPE_PUBLISHABLE_KEY` |

**Test with Stripe test card:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

#### Subscription not activating after payment

**Symptoms:** Payment succeeded in Stripe but member still "pending".

**Diagnosis:**
1. Check webhook endpoint is configured in Stripe
2. Check webhook events are being received

**Solutions:**

| Issue | Solution |
|-------|----------|
| Webhook not configured | Add endpoint in Stripe Dashboard |
| Wrong webhook URL | URL should be `/membership/webhook` |
| Signature mismatch | Check `STRIPE_WEBHOOK_SECRET` matches Stripe |
| Events not selected | Enable `checkout.session.completed` event |

#### Payment failed

**Symptoms:** Member receives payment failed email.

**Diagnosis:**
1. Check Stripe Dashboard > Payments for error
2. Review payment error code

**Common causes:**
- Card declined (insufficient funds, expired)
- 3D Secure authentication failed
- Card flagged as fraud

**Solutions:**
- Member should update payment method via dashboard
- Member should contact their bank
- Try a different card

---

### Email Issues

#### Emails not sending

**Symptoms:** Welcome, receipt, or notification emails not received.

**Diagnosis:**
1. Verify `RESEND_API_KEY` is set
2. Check Resend dashboard for delivery status
3. Check email logs in admin

**Solutions:**

| Issue | Solution |
|-------|----------|
| API key invalid | Get new key from Resend dashboard |
| Domain not verified | Verify sending domain in Resend |
| Email in spam | Check recipient's spam folder |
| Rate limited | Check Resend rate limits |

#### Emails going to spam

**Solutions:**
1. Verify sending domain with SPF, DKIM, DMARC
2. Use a proper "From" address (not noreply@)
3. Check email content for spam triggers
4. Warm up sending domain gradually

---

### Webhook Issues

#### Stripe webhooks not received

**Symptoms:** Payments succeed but member status not updated.

**Diagnosis:**
1. Go to Stripe Dashboard > Developers > Webhooks
2. Check endpoint status and recent events
3. Look for failed deliveries

**Solutions:**

| Issue | Solution |
|-------|----------|
| Endpoint unreachable | Verify site is publicly accessible |
| 401/403 response | Check webhook signature configuration |
| 404 response | Verify endpoint URL is correct |
| 500 response | Check server logs for errors |

**Test webhook manually:**
```bash
stripe trigger checkout.session.completed
```

#### Developer webhooks not firing

**Symptoms:** Registered webhooks not receiving events.

**Diagnosis:**
1. Check webhook is registered:
   ```bash
   curl https://your-site.com/membership/webhooks
   ```
2. Check webhook health:
   ```bash
   curl https://your-site.com/membership/webhooks/health
   ```

**Solutions:**

| Issue | Solution |
|-------|----------|
| Webhook disabled | `failedCount` too high; re-enable |
| URL unreachable | Verify HTTPS endpoint is accessible |
| Rate limited | Max 100 fires/minute |

**Test webhook:**
```bash
curl -X POST https://your-site.com/membership/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"webhookId": "your-webhook-id"}'
```

---

### Authentication Issues

#### JWT token expired

**Symptoms:** 401 "Unauthorized" or "Token expired".

**Diagnosis:**
- Access tokens expire after 15 minutes
- Check if refresh token is set in cookies

**Solutions:**
1. Call refresh endpoint:
   ```bash
   curl -X POST https://your-site.com/membership/auth/refresh \
     --cookie "refresh_token=..."
   ```
2. If refresh fails, member must log in again

#### JWT signature verification failed

**Symptoms:** 401 "Invalid token".

**Diagnosis:**
- `JWT_SECRET` may have changed
- Token may be malformed

**Solutions:**
1. Verify `JWT_SECRET` hasn't changed since token was issued
2. Member must log in again to get new tokens

---

## Error Codes Reference

### HTTP Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Missing or invalid input |
| 401 | Unauthorized | Missing or expired JWT token |
| 403 | Forbidden | Admin access required |
| 404 | Not Found | Member, plan, or resource not found |
| 409 | Conflict | Duplicate resource (e.g., coupon code) |
| 410 | Gone | Resource expired (e.g., group invite) |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Server-side error |

### Member Status Values

| Status | Meaning | Resolution |
|--------|---------|------------|
| `pending` | Awaiting payment or approval | Complete payment or admin approve |
| `active` | Active membership | None needed |
| `past_due` | Payment failed | Update payment method |
| `cancelled` | Subscription cancelled | Re-subscribe |
| `revoked` | Admin revoked access | Contact admin |

---

## Debug Tools

### Admin Logs

Access logs via EmDash admin:
1. Go to **Admin > System > Logs**
2. Filter by "membership" keyword
3. Review error messages and stack traces

### KV Storage Inspector

View member data:
1. Go to **Admin > Developer Tools > KV Store**
2. Search for `member:{email}` keys
3. Inspect member record JSON

### Stripe Dashboard

For payment issues:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Check **Payments** for failed transactions
3. Check **Webhooks** for delivery status
4. Review **Logs** for API errors

### Webhook Logs

View webhook delivery history:
```bash
curl "https://your-site.com/membership/webhooks/logs?webhookId=xxx&limit=10"
```

---

## Getting Help

### Before Contacting Support

Gather this information:
1. **Health check response**
2. **Error message** (exact text)
3. **Steps to reproduce**
4. **Relevant logs**
5. **Environment** (production/staging)

### Support Channels

- Review EmDash documentation
- Check Stripe documentation for payment issues
- Check Resend documentation for email issues
- Contact Shipyard AI support

### Common Quick Fixes

| Symptom | Quick Fix |
|---------|-----------|
| Everything broken | Restart deployment |
| Payments failing | Verify Stripe keys |
| Emails not sending | Check Resend API key |
| Webhooks failing | Re-copy webhook secret |
| Auth not working | Verify JWT_SECRET |

---

*Copyright Shipyard AI. Included with EmDash.*
