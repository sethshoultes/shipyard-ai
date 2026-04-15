# Session Management & Auth Middleware Implementation

## Overview

This document outlines the implementation of session management and authentication middleware for the Shipyard Client Portal, addressing REQ-AUTH-004 and related authentication requirements.

## Architecture

### 1. Middleware Layer (`middleware.ts`)

The Next.js middleware intercepts all requests and enforces authentication rules:

- **Protected Routes**: `/dashboard/*` requires valid Supabase session
- **Redirect Logic**:
  - Unauthenticated users accessing `/dashboard` → redirect to `/login?returnUrl=/dashboard`
  - Authenticated users accessing `/login` or `/signup` → redirect to `/dashboard`
- **Session Verification**: Uses Supabase `getUser()` on each request
- **Secure Cookies**: Supabase SSR helper automatically handles httpOnly, secure, SameSite=Strict cookies

### 2. Authentication Pages

#### Login Page (`app/login/page.tsx`)
- Email and password input
- Error handling with user-friendly messages
- Support for return URL parameter to redirect after login
- Integrates with Supabase Auth

#### Signup Page (`app/signup/page.tsx`)
- Email and password input with confirmation
- Password validation (minimum 8 characters)
- Email redirect callback for email verification
- Auto-login after successful signup
- Link to login page for existing users

### 3. Logout Handler (`app/api/auth/logout/route.ts`)

POST endpoint that:
- Calls Supabase `signOut()`
- Clears session cookies automatically
- Redirects to `/login` page
- Returns success message

### 4. Auth Callback (`app/auth/callback/route.ts`)

GET endpoint that:
- Handles email confirmation links
- Exchanges confirmation code for session
- Redirects to dashboard upon success

### 5. Dashboard Page (`app/dashboard/page.tsx`)

Protected route that:
- Displays current user email
- Provides logout button
- Shows session information
- Includes placeholder for projects list
- Uses client-side session verification as fallback

## Session Configuration

### Duration
- **Default Session Expiry**: 7 days of inactivity (Supabase default)
- **Configuration**: Set in Supabase project settings under Auth → Password policy
- **Behavior**: Automatic session refresh on page reload if valid; redirect to login if expired

### Security Features
- **httpOnly Cookies**: Session tokens cannot be accessed via JavaScript
- **Secure Flag**: Cookies only sent over HTTPS
- **SameSite=Strict**: Prevents CSRF attacks by limiting cookie inclusion to same-origin requests
- **CSRF Protection**: Next.js default + Supabase SSR implementation

### Session Persistence
- Supabase stores session in secure cookies managed by the SSR helper
- Session persists across page reloads within expiry window
- Middleware checks session on every request

## File Structure

```
shipyard-client-portal/
├── middleware.ts                          # Auth middleware (protected routes)
├── lib/
│   └── supabase.ts                       # Supabase client factory
├── app/
│   ├── login/
│   │   └── page.tsx                      # Login page
│   ├── signup/
│   │   └── page.tsx                      # Signup page
│   ├── dashboard/
│   │   └── page.tsx                      # Protected dashboard
│   └── api/auth/
│       ├── logout/
│       │   └── route.ts                  # Logout handler
│       └── callback/
│           └── route.ts                  # Email confirmation callback
├── __tests__/
│   └── middleware.test.ts                # Middleware unit tests
├── .env.example                          # Environment variables template
└── IMPLEMENTATION_NOTES.md               # This file
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: `NEXT_PUBLIC_` prefix means these variables are exposed to the browser. Do not include secrets here.

## Implementation Details

### Step 1: Middleware for Protected Routes
- Uses Supabase SSR client to verify session on each request
- Checks `supabase.auth.getUser()` to validate session
- Redirects unauthorized access attempts with returnUrl parameter

### Step 2: Session Verification
- Supabase `getUser()` validates session token from cookies
- Returns user object if valid, null if expired or invalid
- Middleware provides first line of defense; client-side verification provides fallback

### Step 3: Session Expiry
- Supabase manages session expiry automatically
- After 7 days of inactivity, session token becomes invalid
- Client receives null from `getUser()` and is redirected to login
- Users receive friendly "session expired" via redirect

### Step 4: Logout Handler
- POST endpoint ensures logout is a state-changing operation (POST, not GET)
- Calls `supabase.auth.signOut()` to clear Supabase session
- Response automatically clears session cookie
- Redirects to `/login` to confirm logout completed

### Step 5: CSRF Protection
- Achieved via Next.js middleware + Supabase SSR cookie handling
- Cookies use `SameSite=Strict` flag (automatic in Supabase SSR)
- All state-changing operations use POST, not GET
- No additional CSRF tokens required due to cookie policy

## Verification Checklist

### Manual Testing

- [ ] **Redirect to login without session**:
  - Access `/dashboard` without logging in
  - Should redirect to `/login?returnUrl=/dashboard`

- [ ] **Login flow**:
  - Sign up with test email/password
  - Dashboard should load with user email displayed
  - Session should persist on page reload

- [ ] **Logout functionality**:
  - Click "Log Out" button on dashboard
  - Should redirect to `/login`
  - Session cleared (accessing `/dashboard` should redirect to login again)

- [ ] **Session persistence**:
  - Log in and reload page multiple times
  - Session should persist across reloads
  - No automatic redirects to login

- [ ] **Redirect logged-in user away from auth pages**:
  - While logged in, visit `/login`
  - Should redirect to `/dashboard`

- [ ] **Password reset link handling**:
  - Manually send password reset email from Supabase console
  - Reset link should work and allow setting new password
  - User should be able to log in with new password

### Unit Test Coverage

- [ ] Middleware correctly identifies protected routes
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users allowed through
- [ ] Return URL parameter preserved
- [ ] Logged-in users redirected away from auth pages
- [ ] Session expiry after 7 days assumed valid per Supabase

## Integration Points

### With Existing Features
- **Database**: Future versions will integrate with `/api/auth/` handlers to populate `clients` table
- **Email Notifications**: Session info can be passed to email templates
- **API Routes**: Protected API routes can verify session using same Supabase client

### Dependencies
- `@supabase/ssr`: Provides secure SSR cookie handling
- `@supabase/supabase-js`: Core Supabase client library
- Next.js 16.2.3+: Middleware support, Server Components

## Security Considerations

### Implemented
- ✅ httpOnly cookies (Supabase default)
- ✅ HTTPS-only in production (Vercel handles)
- ✅ SameSite=Strict cookies (Supabase default)
- ✅ Session token stored securely, not in localStorage
- ✅ No password stored in logs
- ✅ Logout clears all session data

### Not Yet Implemented (Future)
- ⏸ Multi-device session management
- ⏸ Device fingerprinting for suspicious activity
- ⏸ Failed login attempt throttling (handled by Supabase via email rate limiting)
- ⏸ Session activity logging for audit trail

## Troubleshooting

### Session Not Persisting
- Verify environment variables are set correctly
- Check browser cookies are enabled
- Confirm domain matches Supabase project settings
- Clear browser cache and try again

### Redirect Loop
- Ensure middleware matcher config doesn't exclude protected routes
- Verify Supabase client is initialized with correct URL/key
- Check browser console for errors in `supabase.auth.getUser()`

### "Not authenticated" Errors
- Session may have expired after 7 days
- Browser cookies may be blocked
- Supabase project may have rate limiting enabled

## Testing Session Management

### Setup Test Environment
1. Create Supabase project (free tier available)
2. Configure Supabase URL and Anon Key in `.env.local`
3. Run `npm run dev`

### Test Scenarios
```bash
# Test 1: Redirect without login
curl http://localhost:3000/dashboard
# Expected: Redirect to /login?returnUrl=/dashboard

# Test 2: Login and access dashboard
# Visit http://localhost:3000/signup
# Fill form and submit
# Should redirect to /dashboard

# Test 3: Logout
# Click "Log Out" button
# Should redirect to /login

# Test 4: Session persistence
# Log in, reload page several times
# Session should remain valid
```

## Next Steps

1. **Integration with Project Intake** (Phase 2)
   - Use session user ID when creating project records
   - Verify user is logged in before submitting intake form

2. **Integration with Payment** (Phase 2)
   - Pass logged-in user email to Stripe for customer records
   - Link Stripe customer to client record

3. **Integration with Webhooks** (Phase 3)
   - Verify webhook comes from trusted source
   - Update project status for authenticated user

4. **Admin Dashboard** (v1.5+)
   - Manual session override for support team
   - Session activity logs and audit trail

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
