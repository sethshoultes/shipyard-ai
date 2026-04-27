const API_BASE = 'https://api.sous.ai';

async function apiPost(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function askQuestion(question, siteId) {
  return apiPost('/ask', { question, site_id: siteId });
}

export async function fetchConfig(siteId) {
  return apiGet(`/config?site_id=${encodeURIComponent(siteId)}`);
}

export async function createCheckoutSession(siteId, tier) {
  return apiPost('/checkout', { site_id: siteId, tier });
}

export async function fetchStats(siteId) {
  // Placeholder: Worker will provide stats endpoint in v1.1
  return { questions_this_week: 12 };
}
