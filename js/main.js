/* ================================================================
   Emediquality — main.js  v4
   ================================================================ */
(function () {
  'use strict';

  // ===== HEADER =====
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

  // ===== HAMBURGER =====
  const hbg = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  hbg.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hbg.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // ===== LANGUAGE =====
  let lang = localStorage.getItem('eq_lang') || 'tr';

  function applyLang(l) {
    lang = l;
    localStorage.setItem('eq_lang', l);
    document.documentElement.setAttribute('data-lang', l);
    document.documentElement.lang = l;
    document.getElementById('langLabel').textContent = l === 'tr' ? 'EN' : 'TR';
    document.querySelectorAll('[data-tr]').forEach(el => {
      el.textContent = l === 'tr' ? el.dataset.tr : el.dataset.en;
    });
    document.title = l === 'tr' ? 'Emediquality — Tele Sağlık Yazılım' : 'Emediquality — Health Software';
  }
  document.getElementById('langToggle').addEventListener('click', () => applyLang(lang === 'tr' ? 'en' : 'tr'));
  applyLang(lang);

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  // ===== PRODUCT TABS =====
  const tabs = document.querySelectorAll('.prod-tab');
  const panels = document.querySelectorAll('.prod-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  // ===== SCROLL REVEAL =====
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll(
    '.about-big-card, .af-item, .about-text-col, ' +
    '.founder-left, .founder-right, ' +
    '.cc-item, .cform, ' +
    '.hiw-infographic, .hiw-step, ' +
    '.gallery-card, ' +
    '.prod-panel-inner, ' +
    '.screen-cinema, .screen-overlay, ' +
    '.tele-showcase'
  ).forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger gallery cards and hiw steps
    if (el.classList.contains('gallery-card') || el.classList.contains('hiw-step')) {
      const siblings = Array.from(el.parentElement.children).filter(s => s.classList.contains(el.classList[0]));
      const idx = siblings.indexOf(el);
      if (idx > 0) el.classList.add('reveal-delay-' + Math.min(idx, 3));
    }
    io.observe(el);
  });

  // ===== LIGHTBOX =====
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  document.querySelectorAll('.gallery-card img').forEach(img => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  const closeLb = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  document.getElementById('lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  // ===== CONTACT FORM =====
  const form   = document.getElementById('cForm');
  const status = document.getElementById('cfStatus');
  const btn    = document.getElementById('cfSubmit');
  let lastSend = 0;

  function setStatus(type, msg) { status.className = 'cf-status ' + type; status.textContent = msg; }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'cf-status';

    // Honeypot
    const hp = form.querySelector('[name="_gotcha"]');
    if (hp && hp.value) return;

    // Rate limit (1 per 60s)
    if (Date.now() - lastSend < 60000) {
      setStatus('err', lang === 'tr' ? 'Lütfen 1 dakika bekleyin.' : 'Please wait 1 minute.');
      return;
    }

    // Validate
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const msg   = form.querySelector('[name="message"]').value.trim();
    if (name.length < 2) { setStatus('err', lang === 'tr' ? 'Adınızı girin.' : 'Enter your name.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setStatus('err', lang === 'tr' ? 'Geçerli e-posta girin.' : 'Enter a valid email.'); return; }
    if (msg.length < 10) { setStatus('err', lang === 'tr' ? 'Mesaj çok kısa.' : 'Message too short.'); return; }

    // Build mailto link
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i>';
    lastSend = Date.now();

    const company = form.querySelector('[name="company"]').value.trim();
    const subject = encodeURIComponent('Emediquality.com — İletişim Formu');
    const body    = encodeURIComponent(
      'Ad Soyad: ' + name + '\n' +
      'E-posta: ' + email + '\n' +
      (company ? 'Kurum: ' + company + '\n' : '') +
      '\nMesaj:\n' + msg
    );

    window.location.href = 'mailto:info@emediquality.com?subject=' + subject + '&body=' + body;

    setStatus('ok', lang === 'tr'
      ? 'E-posta uygulamanız açılıyor. Mesajı göndermek için gönderin.'
      : 'Your email app is opening. Hit send to deliver your message.');

    btn.disabled = false;
    btn.innerHTML = '<i class="ph-fill ph-paper-plane-tilt"></i> ' + (lang === 'tr' ? 'Gönder' : 'Send');
    form.reset();
  });

})();
