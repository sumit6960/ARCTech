/* ============================================================
   CADWorks – site scripts
   ============================================================ */

/* ---- 1. Active nav link highlighting ---------------------- */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (
      href === page ||
      (page === 'index.html' && href === 'home.html') ||
      href === page.replace('index.html', 'home.html')
    ) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();


/* ---- 2. Mobile hamburger menu ----------------------------- */
(function () {
  const menuBtn = document.querySelector('.menu');
  const nav     = document.querySelector('.navlinks');
  if (!menuBtn || !nav) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    nav.style.display        = 'flex';
    nav.style.position       = 'absolute';
    nav.style.top            = '76px';
    nav.style.left           = '0';
    nav.style.right          = '0';
    nav.style.background     = '#fff';
    nav.style.padding        = '20px 24px';
    nav.style.flexDirection  = 'column';
    nav.style.borderBottom   = '1px solid #dce5ed';
    nav.style.zIndex         = '100';
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close navigation');
  }

  function closeMenu() {
    isOpen = false;
    nav.style.display = '';
    nav.style.position = '';
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open navigation');
  }

  menuBtn.setAttribute('aria-controls', 'primary-nav');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-label', 'Open navigation');
  nav.id = 'primary-nav';

  menuBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked (navigating away)
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (isOpen && !nav.contains(e.target) && e.target !== menuBtn) {
      closeMenu();
    }
  });

  // Reset inline styles when viewport exceeds the mobile breakpoint
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) {
      closeMenu();
      // Remove all inline overrides so CSS takes control
      nav.removeAttribute('style');
    }
  });
})();


/* ---- 3. Contact form — Formspree AJAX + validation -------- */
(function () {
  const form      = document.getElementById('quoteForm');
  if (!form) return;

  const submitBtn  = document.getElementById('submitBtn');
  const successBox = document.getElementById('form-success');
  const errorBox   = document.getElementById('form-error');

  /* Simple validators per field */
  const validators = {
    'f-name':    function (v) { return v.trim().length >= 2 ? '' : 'Please enter your full name.'; },
    'f-company': function (v) { return v.trim().length >= 2 ? '' : 'Please enter your company name.'; },
    'f-email':   function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
    'f-details': function (v) { return v.trim().length >= 20 ? '' : 'Please describe your project in at least 20 characters.'; }
  };

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const err = field.parentElement.querySelector('.field-error');
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message;
  }

  function validateAll() {
    let valid = true;
    Object.keys(validators).forEach(function (id) {
      const el  = document.getElementById(id);
      if (!el) return;
      const msg = validators[id](el.value);
      showError(id, msg);
      if (msg) valid = false;
    });
    return valid;
  }

  // Validate fields on blur for immediate feedback
  Object.keys(validators).forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', function () {
      showError(id, validators[id](el.value));
    });
    el.addEventListener('input', function () {
      if (el.getAttribute('aria-invalid') === 'true') {
        showError(id, validators[id](el.value));
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Hide previous notices
    successBox.hidden = true;
    errorBox.hidden   = true;

    if (!validateAll()) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Check if the Formspree ID has been replaced
    const action = form.getAttribute('action') || '';
    if (action.includes('YOUR_FORMSPREE_ID')) {
      // Development fallback — show success so the UI can be tested
      successBox.hidden = false;
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      submitBtn.textContent = 'Sent ✓';
      submitBtn.disabled = true;
      setTimeout(function () {
        submitBtn.textContent = 'Send Enquiry →';
        submitBtn.disabled = false;
        form.reset();
        successBox.hidden = true;
      }, 4000);
      return;
    }

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;

    const data = new FormData(form);

    fetch(action, {
      method:  'POST',
      body:    data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        if (res.ok) {
          successBox.hidden = false;
          successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          form.reset();
          Object.keys(validators).forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.removeAttribute('aria-invalid');
          });
          submitBtn.textContent = 'Send Enquiry →';
          submitBtn.disabled    = false;
        } else {
          return res.json().then(function (data) { throw data; });
        }
      })
      .catch(function (err) {
        console.error('Form submission error:', err);
        errorBox.hidden = false;
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        submitBtn.textContent = 'Send Enquiry →';
        submitBtn.disabled    = false;
      });
  });
})();
