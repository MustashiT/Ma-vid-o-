/* ==========================================================
   Pocket Studio — Osmo Pocket 3 · motion & shop logic
   ========================================================== */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motion = hasGsap && !reduced;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------------- Products & cart ---------------- */
  const PRODUCTS = {
    standard: { name: 'Osmo Pocket 3', variant: 'Pack Standard', price: 539 },
    creator: { name: 'Osmo Pocket 3', variant: 'Creator Combo', price: 699 },
  };
  const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  const store = {
    get() { try { return JSON.parse(localStorage.getItem('ps-cart')) || {}; } catch { return {}; } },
    set(v) { try { localStorage.setItem('ps-cart', JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  let cart = store.get();
  Object.keys(cart).forEach((k) => { if (!PRODUCTS[k] || !(cart[k] > 0)) delete cart[k]; });

  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = () => Object.entries(cart).reduce((a, [k, q]) => a + PRODUCTS[k].price * q, 0);

  const thumb = '<svg viewBox="0 0 200 540" aria-hidden="true"><use href="#buyDevice"/></svg>';
  function renderCart() {
    const items = $('#cartItems');
    const entries = Object.entries(cart);
    if (!entries.length) {
      items.innerHTML = '<div class="drawer__empty"><b>Votre panier est vide</b>Le cinéma de poche vous attend.</div>';
    } else {
      items.innerHTML = entries.map(([k, q]) => `
        <div class="cart-item" data-key="${k}">
          <div class="cart-item__thumb">${thumb}</div>
          <div>
            <div class="cart-item__name">${PRODUCTS[k].name}</div>
            <div class="cart-item__meta">${PRODUCTS[k].variant}
              <button data-act="dec" aria-label="Retirer un">−</button><span>${q}</span><button data-act="inc" aria-label="Ajouter un">+</button>
            </div>
          </div>
          <div>
            <div class="cart-item__price">${fmt(PRODUCTS[k].price * q)}</div>
            <button class="cart-item__remove" data-act="del">Retirer</button>
          </div>
        </div>`).join('');
    }
    $('#cartBadge').textContent = cartCount();
    $('#cartSubtotal').textContent = fmt(cartTotal());
    $('#cartTotal').textContent = fmt(cartTotal());
    $('#checkoutBtn').disabled = !entries.length;
    store.set(cart);
  }
  $('#cartItems').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const key = btn.closest('.cart-item').dataset.key;
    const act = btn.dataset.act;
    if (act === 'inc') cart[key] = Math.min(9, cart[key] + 1);
    if (act === 'dec') cart[key] -= 1;
    if (act === 'del' || cart[key] <= 0) delete cart[key];
    renderCart();
  });

  /* drawer */
  const drawer = $('#drawer'), overlay = $('#overlay'), modal = $('#modal');
  let lenis = null;
  const lockScroll = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? 'hidden' : ''; };
  function openCart() { drawer.classList.add('is-open'); overlay.classList.add('is-on'); drawer.setAttribute('aria-hidden', 'false'); lockScroll(true); }
  function closeCart() { drawer.classList.remove('is-open'); overlay.classList.remove('is-on'); drawer.setAttribute('aria-hidden', 'true'); if (!modal.classList.contains('is-open')) lockScroll(false); }
  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

  /* checkout */
  function openModal() {
    closeCart();
    $('#checkoutForm').hidden = false;
    const s = $('#success'); s.hidden = true; s.classList.remove('is-in');
    $('#checkoutSum').textContent = `${cartCount()} article${cartCount() > 1 ? 's' : ''} · ${fmt(cartTotal())} · Livraison offerte`;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    setTimeout(() => $('#checkoutForm input')?.focus(), 300);
  }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); lockScroll(false); }
  $('#checkoutBtn').addEventListener('click', openModal);
  $('#modalClose').addEventListener('click', closeModal);
  $('#successClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeCart(); } });
  $('#checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // Brancher ici votre prestataire de paiement (Stripe Checkout, Shopify, PayPal…).
    cart = {}; renderCart();
    $('#checkoutForm').hidden = true;
    const s = $('#success'); s.hidden = false;
    requestAnimationFrame(() => s.classList.add('is-in'));
  });

  /* toast */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  /* ---------------- Configurator ---------------- */
  let pack = 'standard', qty = 1, shownTotal = PRODUCTS.standard.price;
  const totalEl = $('#buyTotal');
  function updateTotal() {
    const target = PRODUCTS[pack].price * qty;
    if (motion) {
      const o = { v: shownTotal };
      gsap.to(o, { v: target, duration: .6, ease: 'power3.out', onUpdate: () => { totalEl.textContent = Math.round(o.v).toLocaleString('fr-FR'); } });
      gsap.fromTo(totalEl.parentElement, { y: -6, opacity: .4 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
    } else {
      totalEl.textContent = target.toLocaleString('fr-FR');
    }
    shownTotal = target;
    $('#qtyVal').textContent = qty;
  }
  $$('.pack input').forEach((input) => input.addEventListener('change', () => {
    pack = input.value;
    $$('.pack').forEach((p) => p.classList.toggle('is-selected', p.contains(input)));
    $('#buyExtras').classList.toggle('is-combo', pack === 'creator');
    if (motion) gsap.fromTo('.device--buy', { rotate: -6, scale: .94 }, { rotate: 0, scale: 1, duration: 1, ease: 'elastic.out(1, .5)' });
    updateTotal();
  }));
  $('#qtyMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); updateTotal(); });
  $('#qtyPlus').addEventListener('click', () => { qty = Math.min(9, qty + 1); updateTotal(); });

  $('#addToCart').addEventListener('click', (e) => {
    cart[pack] = Math.min(9, (cart[pack] || 0) + qty);
    renderCart();
    toast(`✓ ${qty} × ${PRODUCTS[pack].variant} ajouté au panier`);
    if (!motion) return;
    // flying dot from button to cart badge
    const from = e.currentTarget.getBoundingClientRect();
    const to = $('#cartBadge').getBoundingClientRect();
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed', left: `${from.left + from.width / 2 - 10}px`, top: `${from.top + from.height / 2 - 10}px`,
      width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg,#ffb34a,#ff5a36,#8b5cff)',
      zIndex: 96, pointerEvents: 'none', boxShadow: '0 0 30px #ff5a36',
    });
    document.body.appendChild(dot);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    gsap.timeline({ onComplete: () => dot.remove() })
      .to(dot, { x: dx, duration: .8, ease: 'power2.inOut' }, 0)
      .to(dot, { y: dy, duration: .8, ease: 'back.in(1.6)' }, 0)
      .to(dot, { scale: .3, duration: .8, ease: 'power2.in' }, 0)
      .fromTo('#cartBadge', { scale: 1 }, { scale: 1.6, duration: .2, yoyo: true, repeat: 1, ease: 'power2.out' }, .75);
    $('#nav').classList.remove('is-hidden');
  });

  renderCart();

  /* ---------------- Without motion: done ---------------- */
  if (!motion) {
    root.classList.add('no-motion');
    $('#loader')?.remove();
    $$('#rotContent').forEach((el) => el.setAttribute('opacity', '1'));
    $$('.stab__shaky, .stab__smooth').forEach((p) => { p.style.strokeDasharray = 'none'; });
    $$('.spec__num').forEach((el) => { el.innerHTML = el.dataset.count + (el.dataset.suffix || ''); });
    $('#sensorRatio').textContent = '1,7';
    $('#pillH').classList.add('is-on');
    return;
  }

  /* ================= MOTION ================= */
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY, behavior: 'smooth' });
  }));

  /* split helpers */
  function splitChars(el) {
    const nodes = [...el.childNodes];
    el.innerHTML = '';
    nodes.forEach((n) => {
      if (n.nodeType === 3) {
        [...n.textContent].forEach((c) => { const s = document.createElement('span'); s.className = 'char'; s.textContent = c; el.appendChild(s); });
      } else {
        n.classList.add('char'); el.appendChild(n);
      }
    });
    return $$('.char', el);
  }
  function splitWords(el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="word">${w}</span>`).join(' ');
    return $$('.word', el);
  }

  const heroChars = $$('.hero__title .split').flatMap(splitChars);

  /* ---------------- Loader → Hero intro ---------------- */
  lockScroll(true);
  gsap.set(heroChars, { yPercent: 110, rotate: 8 });
  gsap.set('.reveal-up', { y: 30, opacity: 0 });
  gsap.set('#heroDevice .device', { y: 120, opacity: 0, rotate: -8 });
  gsap.set('.ring', { scale: .4, opacity: 0 });
  gsap.set('.hero__tag', { scale: .6, opacity: 0 });
  gsap.set('.nav', { yPercent: -100 });

  const counter = { v: 0 };
  const intro = gsap.timeline({ delay: .15 });
  intro
    .to(counter, {
      v: 100, duration: 1.7, ease: 'power2.inOut',
      onUpdate: () => {
        $('#loaderCount').textContent = Math.round(counter.v);
        $('#loaderBar').style.width = `${counter.v}%`;
      },
    })
    .to('.loader__inner', { y: -40, opacity: 0, duration: .5, ease: 'power3.in' })
    .to('.loader__curtain', { scaleY: 1, duration: .55, ease: 'power4.inOut' }, '-=.2')
    .set('.loader', { backgroundColor: 'transparent' })
    .to('.loader__curtain', { scaleY: 0, transformOrigin: 'top', duration: .65, ease: 'power4.inOut' })
    .add(() => { $('#loader').remove(); lockScroll(false); })
    .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.1, stagger: .035, ease: 'power4.out' }, '-=.45')
    .to('#heroDevice .device', { y: 0, opacity: 1, rotate: 0, duration: 1.4, ease: 'expo.out' }, '<.1')
    .to('.ring', { scale: 1, opacity: (i) => [1, .5, .3][i], duration: 1.4, stagger: .1, ease: 'expo.out' }, '<')
    .to('.reveal-up', { y: 0, opacity: 1, duration: .9, stagger: .1, ease: 'power3.out' }, '<.3')
    .to('.hero__tag', { scale: 1, opacity: 1, duration: .8, stagger: .12, ease: 'back.out(2)' }, '<.2')
    .to('.nav', { yPercent: 0, duration: .9, ease: 'power3.out' }, '<');

  /* idle hero loops */
  gsap.to('#heroDevice .device', { y: -18, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 3.5 });
  gsap.fromTo('.device__head', { rotation: -6 }, { rotation: 6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, svgOrigin: '100 160' });
  gsap.to('.hero__tag--1', { y: -12, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.hero__tag--2', { y: 14, duration: 2.8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.to('.hero__tag--3', { y: -10, duration: 3.1, yoyo: true, repeat: -1, ease: 'sine.inOut' });

  /* hero mouse parallax */
  if (fine) {
    const qx = gsap.quickTo('#heroDevice', 'x', { duration: 1, ease: 'power3' });
    const qy = gsap.quickTo('#heroDevice', 'y', { duration: 1, ease: 'power3' });
    const qr = gsap.quickTo('#heroDevice', 'rotationY', { duration: 1, ease: 'power3' });
    const ga = gsap.quickTo('.hero__glow--a', 'x', { duration: 2, ease: 'power3' });
    $('#hero').addEventListener('mousemove', (e) => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      qx(nx * 40); qy(ny * 30); qr(nx * 18); ga(nx * -120);
    });
    gsap.set('#heroDevice', { transformPerspective: 900 });
  }

  /* hero scroll-out */
  gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero__copy', { yPercent: -30, opacity: 0, ease: 'none' }, 0)
    .to('.hero__device', { scale: .8, yPercent: 18, opacity: .2, ease: 'none' }, 0)
    .to('.hero__glow', { scale: 1.4, ease: 'none' }, 0);

  /* ---------------- Nav state ---------------- */
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      $('#nav').classList.toggle('is-scrolled', y > 40);
      $('#nav').classList.toggle('is-hidden', y > lastY && y > 400 && !drawer.classList.contains('is-open'));
      lastY = y;
    },
  });

  /* ---------------- Statement: word-by-word ---------------- */
  const words = splitWords($('#statement'));
  gsap.to(words, {
    opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: '.statement', start: 'top 75%', end: 'bottom 55%', scrub: true },
  });

  /* ---------------- Generic reveals ---------------- */
  $$('.h2, section .eyebrow, .lead, .stab__chart, .faq__item, .buy__panel > *:not(.h2):not(.eyebrow)').forEach((el) => {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  ScrollTrigger.batch('.axis-card, .tile, .spec', {
    start: 'top 88%',
    onEnter: (els) => gsap.from(els, { y: 70, opacity: 0, scale: .96, duration: 1.1, stagger: .1, ease: 'power3.out', overwrite: true }),
  });

  /* ---------------- Sensor (pinned) ---------------- */
  const steps = $$('.sensor__step');
  const ratio = { v: 0 };
  const sensorTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.sensor__pin', start: 'top top', end: '+=220%', scrub: 1, pin: true,
      onUpdate: (self) => {
        const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      },
    },
  });
  sensorTl
    .from('.chip--one', { scale: .45, opacity: 0, rotate: -12, ease: 'power2.out', duration: 1 })
    .from('.chip--phone', { x: -60, opacity: 0, duration: .6 }, 0)
    .to(ratio, { v: 1.7, duration: 1, onUpdate: () => { $('#sensorRatio').textContent = ratio.v.toFixed(1).replace('.', ','); } }, 0)
    .to('.chip__die', { filter: 'brightness(1.6) saturate(1.4)', duration: .8 }, 1)
    .to('.chip--phone', { opacity: .35, scale: .9, duration: .8 }, 1)
    .to('.chip--one', { scale: 1.06, duration: 1, ease: 'sine.inOut' }, 1.8);

  /* ---------------- Screen rotation (pinned) ---------------- */
  gsap.timeline({
    scrollTrigger: {
      trigger: '.screen__pin', start: 'top top', end: '+=180%', scrub: 1, pin: true,
      onUpdate: (self) => {
        const on = self.progress > .45;
        $('#pillH').classList.toggle('is-on', on);
        $('#pillV').classList.toggle('is-on', !on);
      },
    },
  })
    .from('.device--big', { y: 80, opacity: 0, scale: .9, duration: .6 })
    .to('#rotScreen', { rotation: -90, duration: 1, ease: 'power2.inOut', svgOrigin: '130 268' }, .7)
    .to('#rotContent', { attr: { opacity: 1 }, duration: .25 }, 1.5)
    .fromTo('#screenPower', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: .4 }, 1.5)
    .to('.device--big', { scale: 1.08, duration: 1, ease: 'sine.inOut' }, 1.8);

  /* ---------------- Stabilisation chart ---------------- */
  $$('.stab__shaky, .stab__smooth').forEach((p, i) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(p, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.stab__chart', start: `top ${80 - i * 10}%`, end: 'bottom 50%', scrub: 1 },
    });
  });

  /* ---------------- Modes: horizontal scroll ---------------- */
  const track = $('#modesTrack');
  const dist = () => Math.max(0, track.scrollWidth - innerWidth);
  gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.modes__pin', start: 'top top', end: () => `+=${dist()}`, scrub: 1, pin: true, invalidateOnRefresh: true },
  });

  /* ---------------- Spec counters ---------------- */
  $$('.spec__num').forEach((el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    const o = { v: 0 };
    el.textContent = '0' + suf;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v) + suf; } }),
    });
  });

  /* ---------------- Buy visual ---------------- */
  gsap.from('.device--buy', { y: 120, rotate: 10, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.buy', start: 'top 70%' } });
  gsap.to('.device--buy', { y: -14, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  /* ---------------- FAQ smooth open ---------------- */
  $$('.faq__item').forEach((d) => {
    const body = $('.faq__body', d);
    $('summary', d).addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: .5, ease: 'power3.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.from(body, { height: 0, duration: .6, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
      }
    });
  });

  /* ---------------- Outro & footer ---------------- */
  gsap.from('.outro__title span', { yPercent: 100, opacity: 0, rotate: 6, stagger: .12, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.outro', start: 'top 70%' } });
  gsap.fromTo('.footer__big', { xPercent: 10 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  /* ---------------- Cursor ---------------- */
  if (fine) {
    const cur = $('#cursor'), label = $('#cursorLabel');
    const cx = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    window.addEventListener('mousemove', (e) => { cx(e.clientX); cy(e.clientY); gsap.to(cur, { opacity: 1, duration: .3, overwrite: 'auto' }); });
    document.addEventListener('mouseleave', () => gsap.to(cur, { opacity: 0 }));
    $$('a, button, label.pack, summary').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const txt = el.dataset.cursor;
        if (txt) { label.textContent = txt; cur.classList.add('is-label'); gsap.to(cur, { scale: 5.2, duration: .4, ease: 'power3.out' }); }
        else gsap.to(cur, { scale: 3, duration: .4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => { cur.classList.remove('is-label'); gsap.to(cur, { scale: 1, duration: .4, ease: 'power3.out' }); });
    });
    gsap.set('.cursor__label', { scale: 1 / 5.2 * 2.2 });

    /* magnetic */
    $$('[data-magnetic]').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1, .4)' });
      const my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1, .4)' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .3);
        my((e.clientY - r.top - r.height / 2) * .4);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });

    /* tilt + spotlight */
    $$('[data-tilt]').forEach((el) => {
      gsap.set(el, { transformPerspective: 1000 });
      const rx = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3' });
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        rx((.5 - py) * 8); ry((px - .5) * 10);
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      });
      el.addEventListener('mouseleave', () => { rx(0); ry(0); });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
