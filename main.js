// ── GSAP SETUP ──
gsap.registerPlugin(ScrollTrigger);

// ── LENIS (desktop only) ──
const isMobileDevice = window.innerWidth <= 767;
let lenis = null;
if (!isMobileDevice) {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ── REDUCED MOTION ──
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(100);
}

// ── PROGRESS BAR ──
gsap.set('.progress-bar', { scaleX: 0 });
gsap.to('.progress-bar', {
  scaleX: 1, ease: 'none',
  scrollTrigger: { scrub: 0.3, start: 'top top', end: 'bottom bottom' }
});

// ── NAVBAR ──
const navbar = document.querySelector('.navbar');
let lastScrollY = 0;
let navbarTimer = null;

window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  if (sy > 40) { navbar.classList.add('scrolled'); }
  else { navbar.classList.remove('scrolled'); }
  if (sy > lastScrollY && sy > 100) {
    gsap.to(navbar, { yPercent: -100, duration: 0.3, ease: 'power2.in', overwrite: true });
  } else if (sy < lastScrollY) {
    gsap.to(navbar, { yPercent: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
  }
  lastScrollY = sy;
  clearTimeout(navbarTimer);
  navbarTimer = setTimeout(() => {
    gsap.to(navbar, { yPercent: 0, duration: 0.3, ease: 'power2.out', overwrite: true });
  }, 150);
}, { passive: true });

document.addEventListener('mousemove', (e) => {
  if (e.clientY < 80) {
    gsap.to(navbar, { yPercent: 0, duration: 0.25, ease: 'power2.out', overwrite: true });
  }
});

// ── FIREWORKS ──
(function () {
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const GOLD = ['#B9915B', '#d4aa7a', '#e8c9a0', '#a07040', '#F5F4F3'];
  const particles = [];

  function createBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 3 + Math.random() * 8;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: GOLD[Math.floor(Math.random() * GOLD.length)],
        size: 2 + Math.random() * 3,
        gravity: 0.12,
        decay: 0.013 + Math.random() * 0.01,
        trail: []
      });
    }
  }

  function launchFirework(x, y) {
    createBurst(x, y, 70);
    // secondary smaller burst
    setTimeout(() => createBurst(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 60, 40), 120);
  }

  let animId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
      if (p.trail.length > 6) p.trail.shift();

      // Draw trail
      for (let t = 0; t < p.trail.length; t++) {
        const tp = p.trail[t];
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = tp.alpha * (t / p.trail.length) * 0.4;
        ctx.fill();
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Sparkle at tip
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = p.alpha * 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.alpha -= p.decay;

      if (p.alpha <= 0) particles.splice(i, 1);
    }

    if (particles.length > 0) {
      animId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Launch sequence on load
  function launchSequence() {
    const w = canvas.width;
    const h = canvas.height;

    // 5 bursts spread across screen
    const positions = [
      { x: w * 0.2, y: h * 0.25 },
      { x: w * 0.5, y: h * 0.15 },
      { x: w * 0.8, y: h * 0.3 },
      { x: w * 0.35, y: h * 0.4 },
      { x: w * 0.65, y: h * 0.2 },
      { x: w * 0.5, y: h * 0.5 },
    ];

    positions.forEach((pos, i) => {
      setTimeout(() => {
        launchFirework(pos.x, pos.y);
        if (animId) cancelAnimationFrame(animId);
        animate();
      }, i * 200);
    });

    // Fade canvas out after 3.5s
    setTimeout(() => {
      gsap.to(canvas, { opacity: 0, duration: 1.2, ease: 'power2.in' });
    }, 3200);
  }

  // Wait for page load then fire
  window.addEventListener('load', () => {
    setTimeout(launchSequence, 400);
  });
})();

// ── HERO ENTRY ──
if (!isMobileDevice) {
  gsap.set('.hero-badge, .hero-sub, .hero-cta, .hero-scroll-hint', { opacity: 0, y: 30 });
  window.addEventListener('load', () => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero-sub',   { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .to('.hero-cta',   { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .to('.hero-scroll-hint', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2');
  });
}

// ── SPLIT TEXT (desktop only) ──
function splitAndReveal(selector) {
  if (isMobileDevice) return;
  document.querySelectorAll(selector).forEach(el => {
    const html = el.innerHTML;
    const parts = html.split(/(<br\s*\/?>)/gi);
    const rebuilt = parts.map(part => {
      if (/^<br/i.test(part)) return part;
      const tmp = document.createElement('span');
      tmp.innerHTML = part;
      const text = tmp.textContent.trim();
      if (!text) return '';
      return text.split(/\s+/).map(w => `<span class="word"><span class="word-inner">${w}</span></span>`).join(' ');
    }).join('');
    el.innerHTML = rebuilt;
    gsap.from(el.querySelectorAll('.word-inner'), {
      scrollTrigger: { trigger: el, start: 'top 95%' },
      y: '110%', opacity: 0, duration: 0.8,
      stagger: 0.05, ease: 'power4.out'
    });
  });
}

// Hero headline
if (!isMobileDevice) {
  gsap.from('.hero-line-1, .hero-line-2', {
    delay: 0.3,
    y: 40, opacity: 0, duration: 1,
    stagger: 0.15, ease: 'power4.out'
  });
}

// Section headlines
splitAndReveal('.section-headline');

// Force ScrollTrigger refresh after Lenis init
setTimeout(() => ScrollTrigger.refresh(), 300);

// ── MATCHMEDIA: all scroll animations ──
const mm = gsap.matchMedia();

mm.add('(min-width: 768px)', () => {
  // ── REVEALS ──
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      y: 60, opacity: 0, duration: 1, ease: 'power3.out'
    });
  });
  gsap.utils.toArray('.reveal-fade').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      y: 30, opacity: 0, duration: 0.8, ease: 'power2.out'
    });
  });

  // Bento cards
  gsap.from('.bento-card', {
    scrollTrigger: { trigger: '.bento-grid', start: 'top 80%' },
    y: 40, opacity: 0, duration: 0.7,
    stagger: { amount: 0.5, from: 'start' },
    ease: 'power3.out'
  });

  // Funil
  gsap.from('.funil-step', {
    scrollTrigger: { trigger: '.funil-wrapper', start: 'top 75%' },
    y: 40, opacity: 0, duration: 0.7,
    stagger: { amount: 0.4, from: 'start' },
    ease: 'power3.out'
  });
  gsap.from('.funil-arrow', {
    scrollTrigger: { trigger: '.funil-wrapper', start: 'top 75%' },
    opacity: 0, duration: 0.4, delay: 0.3,
    stagger: 0.1, ease: 'power2.out'
  });

  // Tips
  gsap.from('.tip-card', {
    scrollTrigger: { trigger: '.tips-grid', start: 'top 80%' },
    y: 40, opacity: 0, duration: 0.7,
    stagger: { amount: 0.5, from: 'start' },
    ease: 'power3.out'
  });

  // ── CURSOR ──
  const cursor = document.querySelector('.cursor');
  const cursorDot = document.querySelector('.cursor-dot');
  let mouseX = -200, mouseY = -200, curX = -200, curY = -200;
  let cursorVisible = false;

  gsap.set(cursor, { opacity: 0, x: -200, y: -200 });
  gsap.set(cursorDot, { opacity: 0, x: -200, y: -200 });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(cursorDot, { x: mouseX - 2.5, y: mouseY - 2.5 });
    if (!cursorVisible) {
      cursorVisible = true;
      gsap.to(cursor, { opacity: 0.7, duration: 0.3 });
      gsap.to(cursorDot, { opacity: 1, duration: 0.3 });
    }
  });

  gsap.ticker.add(() => {
    curX += (mouseX - curX) * 0.35;
    curY += (mouseY - curY) * 0.35;
    gsap.set(cursor, { x: curX - 20, y: curY - 20 });
  });

  document.querySelectorAll('a, button, .magnetic, .tool-card, .bento-card').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 1.6, opacity: 0.4, duration: 0.3 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, opacity: 0.7, duration: 0.3 }));
  });

  // ── MAGNETIC ──
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
    });
  });

  // ── HERO MOUSE GLOW ──
  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    gsap.to('.glow-1', {
      x: (e.clientX - rect.left) * 0.03,
      y: (e.clientY - rect.top) * 0.03,
      duration: 2, ease: 'power2.out'
    });
  });

  // ── ICP TABLE ROW HOVER ──
  document.querySelectorAll('.icp-table tbody tr').forEach(row => {
    row.addEventListener('mouseenter', () => gsap.to(row, { backgroundColor: 'rgba(201,168,76,0.04)', duration: 0.2 }));
    row.addEventListener('mouseleave', () => gsap.to(row, { backgroundColor: 'transparent', duration: 0.2 }));
  });
});

mm.add('(max-width: 767px)', () => {
  // Em mobile: sem animação — elementos já visíveis
  gsap.utils.toArray('.reveal, .reveal-fade').forEach(el => {
    gsap.set(el, { opacity: 1, y: 0 });
  });
  gsap.set('.bento-card, .funil-step, .funil-arrow, .tip-card', { opacity: 1, y: 0 });
});

// ── CAROUSEL (Pessoas) ──
(function () {
  const track = document.getElementById('vcardsTrack');
  const wrapper = document.getElementById('vcardsScroll');
  const prevBtn = document.getElementById('vcardsPrev');
  const nextBtn = document.getElementById('vcardsNext');
  if (!track || !prevBtn || !nextBtn) return;

  const cards = track.querySelectorAll('.vcard');
  let currentIndex = 0;
  const GAP = 20;

  function isMobile() { return window.innerWidth <= 767; }
  function getMaxIndex() { return Math.max(0, cards.length - 1); }

  function goTo(index) {
    const max = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, max));

    if (isMobile()) {
      wrapper.scrollTo({
        left: cards[currentIndex].offsetLeft,
        behavior: 'smooth'
      });
    } else {
      const targetX = -(cards[currentIndex].offsetLeft);
      track.style.transform = 'translateX(' + targetX + 'px)';
    }

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= max;
  }

  // Drag
  let dragStart = 0, isDragging = false;
  track.addEventListener('mousedown', (e) => {
    dragStart = e.clientX; isDragging = true;
    track.style.transition = 'none';
  });
  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const diff = dragStart - e.clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  });
  track.addEventListener('mouseleave', () => { if (isDragging) { isDragging = false; track.style.transition = ''; } });

  // Touch
  track.addEventListener('touchstart', (e) => { dragStart = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
  }, { passive: true });

  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  window.addEventListener('resize', () => goTo(currentIndex));

  goTo(0);
})();

// ── FAQ (se existir) ──
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      gsap.to(i.querySelector('.faq-answer'), { height: 0, duration: 0.4, ease: 'power2.inOut' });
    });
    if (!isOpen) {
      item.classList.add('open');
      gsap.to(answer, { height: 'auto', duration: 0.5, ease: 'power2.out' });
    }
  });
});
