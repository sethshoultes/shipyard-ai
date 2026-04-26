import { DashboardHome } from './views/DashboardHome.js';
import { OnboardingDetect } from './views/OnboardingDetect.js';

const routes = {
  home: DashboardHome,
  onboarding: OnboardingDetect,
};

function requireAuth() {
  const token = localStorage.getItem('sous_auth_token');
  if (!token) {
    renderLogin();
    return false;
  }
  return true;
}

function renderLogin() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="dashboard-card">
      <h2 style="margin-top:0">Sign in to Sous</h2>
      <p>Enter your site email and we'll send you a magic link.</p>
      <label>
        Email
        <input type="email" id="login-email" placeholder="owner@yourbusiness.com" />
      </label>
      <button id="login-btn" style="width:100%;margin-top:1rem;">Send magic link</button>
    </div>
  `;
  const btn = document.getElementById('login-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const email = document.getElementById('login-email');
      if (email && email.value.trim()) {
        localStorage.setItem('sous_auth_token', 'demo-token-' + Date.now());
        navigate('home');
      }
    });
  }
}

function navigate(route) {
  if (!requireAuth()) return;
  const handler = routes[route];
  if (handler) {
    handler();
    history.replaceState({}, '', '#' + route);
  }
}

function init() {
  window.addEventListener('sous-navigate', (e) => {
    const route = e.detail?.route || 'home';
    navigate(route);
  });

  const hash = window.location.hash.replace('#', '');
  const done = localStorage.getItem('sous_onboarding_done') === 'true';

  if (!done) {
    navigate('onboarding');
  } else if (routes[hash]) {
    navigate(hash);
  } else {
    navigate('home');
  }
}

init();
