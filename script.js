'use strict';

// ── BURGER MENU ──────────────────────────────
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.nav__mobile');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
      mobileMenu.setAttribute('aria-hidden', true);
    });
  });
}

// ── SCROLL REVEAL ────────────────────────────
const revealEls = document.querySelectorAll(
  '.hero__inner, .section__intro, .service-card, .about__text, .about__visual, .why-item, .contact__info, .contact__form'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 3) * 80}ms`;
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revealObs.observe(el));

// ── CONTACT FORM ─────────────────────────────
const form = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (form) {
  const validate = () => {
    let ok = true;
    const fields = [
      { id: 'ime',    errId: 'ime-error',    msg: 'Ime je obavezno.' },
      { id: 'poruka', errId: 'poruka-error', msg: 'Poruka je obavezna.' },
    ];
    const emailEl = document.getElementById('email');
    const emailErr = document.getElementById('email-error');

    fields.forEach(({ id, errId, msg }) => {
      const el = document.getElementById(id);
      const err = document.getElementById(errId);
      if (!el.value.trim()) {
        el.classList.add('error');
        err.textContent = msg;
        ok = false;
      } else {
        el.classList.remove('error');
        err.textContent = '';
      }
    });

    const emailVal = emailEl.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    if (!emailOk) {
      emailEl.classList.add('error');
      emailErr.textContent = emailVal ? 'Unesite ispravnu email adresu.' : 'Email je obavezan.';
      ok = false;
    } else {
      emailEl.classList.remove('error');
      emailErr.textContent = '';
    }

    return ok;
  };

  // Clear error on input
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const err = document.getElementById(`${el.id}-error`);
      if (err) err.textContent = '';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Slanje...';

    // --- Zameni YOUR_FORM_ID na formspree.io sa tvojim ID-jem ---
    const ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ime:    document.getElementById('ime').value.trim(),
          email:  document.getElementById('email').value.trim(),
          usluga: document.getElementById('usluga').value,
          poruka: document.getElementById('poruka').value.trim(),
        }),
      });

      if (res.ok) {
        form.reset();
        if (formSuccess) formSuccess.hidden = false;
      } else {
        throw new Error();
      }
    } catch {
      // Fallback — otvori email klijent
      const s = encodeURIComponent('Upit sa OptirusAI sajta');
      const b = encodeURIComponent(
        `Ime: ${document.getElementById('ime').value}\n` +
        `Email: ${document.getElementById('email').value}\n` +
        `Poruka: ${document.getElementById('poruka').value}`
      );
      window.location.href = `mailto:optirusai@gmail.com?subject=${s}&body=${b}`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Pošalji poruku';
    }
  });
}
