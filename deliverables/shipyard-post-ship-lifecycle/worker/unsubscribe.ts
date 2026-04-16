/**
 * Unsubscribe Handler for Homeport
 * Handles one-click unsubscribe requests
 */

import { unsubscribeProject } from './kv';

/**
 * Handle unsubscribe request from URL
 * URL format: https://homeport.shipyard.ai/unsub?token={email}
 */
export async function handleUnsubscribe(
  request: Request,
  kv: KVNamespace
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('token');

    if (!email) {
      return new Response('Missing email token', { status: 400 });
    }

    // Decode the email from URL encoding
    const decodedEmail = decodeURIComponent(email);

    // Find the project by email and mark as unsubscribed
    // Note: This is a simplified implementation
    // In production, you'd want to iterate through projects to find by email
    // or use a secondary KV index by email
    const success = await findAndUnsubscribeByEmail(kv, decodedEmail);

    if (success) {
      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <title>Unsubscribed - Homeport</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 600px;
      margin: 80px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 24px; margin-bottom: 20px; }
    p { margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>You've been unsubscribed</h1>
  <p>You won't receive any more Homeport emails from Shipyard.</p>
  <p>If you change your mind, just reply to any email we've sent you.</p>
  <p>— Homeport</p>
</body>
</html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    } else {
      return new Response('Email not found', { status: 404 });
    }
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}

/**
 * Find project by email and mark as unsubscribed
 * This is a helper function that searches KV for the project
 */
async function findAndUnsubscribeByEmail(
  kv: KVNamespace,
  email: string
): Promise<boolean> {
  // List all projects and find matching email
  const list = await kv.list({ prefix: 'project:' });

  for (const key of list.keys) {
    const data = await kv.get(key.name);
    if (!data) continue;

    const project = JSON.parse(data);
    if (project.customer_email === email) {
      // Found the project, mark as unsubscribed
      const projectId = key.name.replace('project:', '');
      await unsubscribeProject(kv, projectId);
      return true;
    }
  }

  return false;
}
