export function OnboardingDetect() {
  const app = document.getElementById('app');
  if (!app) return;

  const detectedType = localStorage.getItem('sous_detected_type') || 'restaurant';

  const faqs = {
    restaurant: [
      "What are your hours?",
      "Do you take reservations?",
      "Do you accommodate dietary restrictions?",
      "Is there parking nearby?",
      "Do you offer takeout?",
    ],
    dental: [
      "What insurance do you accept?",
      "Do you handle emergencies?",
      "What happens on a first visit?",
      "Do you offer teeth whitening?",
      "Do you see children?",
    ],
    retail: [
      "What is your return policy?",
      "Do you offer shipping?",
      "How do I find my size?",
      "Do you have a loyalty program?",
      "Can I buy a gift card?",
    ],
    salon: [
      "How do I book an appointment?",
      "What products do you carry?",
      "What is your cancellation policy?",
      "Do you take walk-ins?",
      "Do you offer extensions?",
    ],
    gym: [
      "How much is a membership?",
      "Are classes included?",
      "What are your hours?",
      "Do you offer personal training?",
      "Can I bring a guest?",
    ],
  };

  const list = faqs[detectedType] || faqs.restaurant;

  app.innerHTML = `
    <div class="dashboard-card">
      <h2 style="margin-top:0">Welcome to Sous</h2>
      <p>We detected your business type: <strong>${detectedType}</strong></p>
      <p style="font-size:0.875rem;color:#64748b;margin-top:-0.5rem;">Is that correct?</p>
      <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
        <button class="outline" id="btn-correct">Yes, that's me</button>
        <button class="secondary outline" id="btn-edit">Edit</button>
      </div>
      <div id="faq-section">
        <p style="font-weight:600;font-size:0.875rem;color:#0f172a;">Proposed questions:</p>
        <ul class="faq-list">
          ${list.map(q => `<li>${q}</li>`).join('')}
        </ul>
      </div>
      <div id="edit-section" style="display:none;margin-bottom:1rem;">
        <label>
          Business type
          <input type="text" id="business-input" value="${detectedType}" />
        </label>
      </div>
      <button id="btn-activate" style="width:100%;">Activate</button>
    </div>
  `;

  const btnCorrect = document.getElementById('btn-correct');
  const btnEdit = document.getElementById('btn-edit');
  const faqSection = document.getElementById('faq-section');
  const editSection = document.getElementById('edit-section');
  const btnActivate = document.getElementById('btn-activate');

  if (btnCorrect) {
    btnCorrect.addEventListener('click', () => {
      localStorage.setItem('sous_onboarding_confirmed', 'true');
      if (faqSection) faqSection.style.display = 'block';
      if (editSection) editSection.style.display = 'none';
    });
  }

  if (btnEdit) {
    btnEdit.addEventListener('click', () => {
      if (faqSection) faqSection.style.display = 'none';
      if (editSection) editSection.style.display = 'block';
    });
  }

  if (btnActivate) {
    btnActivate.addEventListener('click', () => {
      const input = document.getElementById('business-input');
      if (input && input.value.trim()) {
        localStorage.setItem('sous_detected_type', input.value.trim().toLowerCase());
      }
      localStorage.setItem('sous_widget_active', 'true');
      localStorage.setItem('sous_onboarding_done', 'true');
      window.dispatchEvent(new CustomEvent('sous-navigate', { detail: { route: 'home' } }));
    });
  }
}
