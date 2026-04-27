export function DashboardHome() {
  const app = document.getElementById('app');
  if (!app) return;

  const isActive = localStorage.getItem('sous_widget_active') === 'true';
  const questionsCount = 12;

  app.innerHTML = `
    <div class="dashboard-card">
      <h2 style="margin-top:0">Sous</h2>
      <div class="toggle-row">
        <span class="toggle-label">Widget active</span>
        <label>
          <input type="checkbox" id="widget-toggle" role="switch" ${isActive ? 'checked' : ''} />
        </label>
      </div>
      <div style="text-align:center; margin: 2rem 0;">
        <div class="metric-value" id="questions-metric">${questionsCount}</div>
        <div class="metric-label">Questions answered this week</div>
      </div>
      <button class="btn-primary" id="billing-btn">Upgrade billing</button>
    </div>
  `;

  const toggle = document.getElementById('widget-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      localStorage.setItem('sous_widget_active', toggle.checked ? 'true' : 'false');
    });
  }

  const billingBtn = document.getElementById('billing-btn');
  if (billingBtn) {
    billingBtn.addEventListener('click', () => {
      window.location.href = '/billing';
    });
  }
}
