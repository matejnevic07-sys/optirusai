'use strict';

// ── NAV: scrolled class + burger ─────────────
const nav    = document.querySelector('.nav');
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.nav__mobile');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

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

// ── STAGGER REVEAL (30–50ms per item) ────────
const STAGGER = 45; // ms

const groups = [
  { selector: '.hero__inner',    delay: 0 },
  { selector: '.section__intro', delay: 0 },
  { selector: '.problem-item',   stagger: true },
  { selector: '.service-card',   stagger: true },
  { selector: '.about__text',    delay: 0 },
  { selector: '.urgency-main',   delay: 0 },
  { selector: '.guarantee-box',  delay: 80 },
  { selector: '.contact__info',  delay: 0 },
  { selector: '.contact__form',  delay: 80 },
];

groups.forEach(({ selector, delay = 0, stagger = false }) => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = stagger ? `${i * STAGGER}ms` : `${delay}ms`;
  });
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── SERVICE CARD MOUSE GLOW ───────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.removeProperty('--mx');
    card.style.removeProperty('--my');
  });
});

// ── CONTACT FORM ─────────────────────────────
const form       = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (form) {
  const getEl  = id => document.getElementById(id);
  const getErr = id => document.getElementById(`${id}-error`);

  const clearErr = id => {
    getEl(id)?.classList.remove('error');
    const e = getErr(id); if (e) e.textContent = '';
  };

  const setErr = (id, msg) => {
    getEl(id)?.classList.add('error');
    const e = getErr(id); if (e) e.textContent = msg;
  };

  ['ime', 'email', 'poruka'].forEach(id => {
    getEl(id)?.addEventListener('input', () => clearErr(id));
  });

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validate = () => {
    let ok = true;
    clearErr('ime'); clearErr('email'); clearErr('poruka');

    if (!getEl('ime').value.trim()) {
      setErr('ime', 'Ime je obavezno.'); ok = false;
    }

    const em = getEl('email').value.trim();
    if (!em)            { setErr('email', 'Email je obavezan.'); ok = false; }
    else if (!isEmail(em)) { setErr('email', 'Unesite ispravnu email adresu.'); ok = false; }

    if (!getEl('poruka').value.trim()) {
      setErr('poruka', 'Poruka je obavezna.'); ok = false;
    }
    return ok;
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Slanje...';

    // Zameni YOUR_FORM_ID sa ID-jem sa formspree.io
    const ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ime:    getEl('ime').value.trim(),
          email:  getEl('email').value.trim(),
          usluga: getEl('usluga').value,
          poruka: getEl('poruka').value.trim(),
        }),
      });
      if (res.ok) {
        form.reset();
        if (formSuccess) formSuccess.hidden = false;
      } else { throw new Error(); }
    } catch {
      const s = encodeURIComponent('Upit sa OptirusAI sajta');
      const b = encodeURIComponent(
        `Ime: ${getEl('ime').value}\nEmail: ${getEl('email').value}\nPoruka: ${getEl('poruka').value}`
      );
      window.location.href = `mailto:optirusai@gmail.com?subject=${s}&body=${b}`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Pošalji poruku';
    }
  });
}
