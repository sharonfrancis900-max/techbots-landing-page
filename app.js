(() => {
  const cfg = window.TECHBOTS_REVENUE_REVIEW_CONFIG || {};
  const form = document.getElementById('leadForm');
  const errorBox = document.getElementById('formError');
  const successPanel = document.getElementById('successPanel');
  const privacyLink = document.getElementById('privacyLink');
  const downloadLink = document.getElementById('downloadChecklist');
  const consultationLinks = [document.getElementById('bookConsultation'), document.getElementById('finalConsultation')].filter(Boolean);
  const servicesLink = document.getElementById('servicesLink');
  const previewWarning = document.getElementById('previewWarning');

  if (cfg.PRIVACY_URL) {
    privacyLink.href = cfg.PRIVACY_URL;
    privacyLink.hidden = false;
  }
  if (cfg.SERVICES_URL && servicesLink) servicesLink.href = cfg.SERVICES_URL;
  consultationLinks.forEach(a => { if (cfg.CALENDLY_URL) a.href = cfg.CALENDLY_URL; });

  if (cfg.LEAD_MAGNET_URL) {
    downloadLink.href = cfg.LEAD_MAGNET_URL;
    downloadLink.removeAttribute('aria-disabled');
    downloadLink.setAttribute('download', '');
  } else {
    downloadLink.addEventListener('click', e => e.preventDefault());
  }
  if (!cfg.PREVIEW_MODE && previewWarning) previewWarning.hidden = true;

  const params = new URLSearchParams(window.location.search);
  const attribution = {
    source: params.get('utm_source') || cfg.DEFAULT_SOURCE || 'revenue-process-check',
    campaign: params.get('utm_campaign') || 'organic',
    medium: params.get('utm_medium') || 'website',
    content: params.get('utm_content') || '',
    term: params.get('utm_term') || '',
    owner: cfg.DEFAULT_OWNER || '',
    landing_page: cfg.LANDING_PATH || window.location.pathname
  };

  const normalizeEmail = value => value.trim().toLowerCase();
  const makeKey = email => `${normalizeEmail(email)}|${attribution.campaign}|${attribution.landing_page}`;
  const simpleHash = str => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h += (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24); }
    return (h >>> 0).toString(16);
  };

  function setError(message, field) {
    errorBox.textContent = message || '';
    if (field) {
      field.setAttribute('aria-invalid','true');
      field.focus();
    }
  }
  function clearErrors() {
    errorBox.textContent = '';
    form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  }
  function validate() {
    clearErrors();
    const name = form.elements.name;
    const email = form.elements.email;
    const company = form.elements.company;
    if (!name.value.trim()) return setError('Please enter your name.', name), false;
    if (!company.value.trim()) return setError('Please enter your company.', company), false;
    if (!email.value.trim() || !email.validity.valid) return setError('Please enter a valid email address.', email), false;
    return true;
  }
  function getPayload() {
    const fd = new FormData(form);
    const email = normalizeEmail(fd.get('email') || '');
    const key = makeKey(email);
    return {
      name: (fd.get('name') || '').trim(),
      email,
      company: (fd.get('company') || '').trim(),
      role: (fd.get('role') || '').trim(),
      phone: (fd.get('phone') || '').trim(),
      whatsapp_consent: fd.get('whatsapp_consent') === 'true',
      email_marketing_consent: fd.get('email_marketing_consent') === 'true',
      ...attribution,
      consent_timestamp: new Date().toISOString(),
      submission_timestamp: new Date().toISOString(),
      idempotency_key: simpleHash(key),
      page_url: window.location.href
    };
  }
  function toggleLoading(state) {
    const btn = form.querySelector('.submit-btn');
    btn.disabled = state;
    btn.classList.toggle('loading', state);
  }
  function showSuccess() {
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus({preventScroll:true});
    successPanel.scrollIntoView({behavior:'smooth', block:'center'});
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = getPayload();
    toggleLoading(true);

    try {
      if (cfg.PREVIEW_MODE) {
        await new Promise(r => setTimeout(r, 550));
        localStorage.setItem(`techbots_lead_${payload.idempotency_key}`, JSON.stringify({preview:true,ts:Date.now()}));
        showSuccess();
        return;
      }

      if (!cfg.FORM_ENDPOINT) throw new Error('FORM_ENDPOINT_MISSING');

      const response = await fetch(cfg.FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': payload.idempotency_key
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      localStorage.setItem(`techbots_lead_${payload.idempotency_key}`, JSON.stringify({submitted:true,ts:Date.now()}));
      showSuccess();
    } catch (err) {
      const phone = cfg.CONTACT_PHONE || '09169337821';
      setError(`We could not process your request. Please try again or contact Techbots on ${phone}.`);
      console.error('Lead submission failed:', err);
    } finally {
      toggleLoading(false);
    }
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const sticky = document.getElementById('mobileSticky');
  const formSection = document.getElementById('checklist-form');
  if (sticky && formSection) {
    const stickyObserver = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      sticky.classList.toggle('show', !visible && window.scrollY > 500);
    }, {threshold:.1});
    stickyObserver.observe(formSection);
    window.addEventListener('scroll', () => {
      if (window.scrollY <= 500) sticky.classList.remove('show');
    }, {passive:true});
  }
})();
